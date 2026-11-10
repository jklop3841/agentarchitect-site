// ClaimCheck core: split a statement into sentences, separate facts from opinions,
// predictions and speculation, pull out checkable claims, flag internal contradictions,
// compare claims with evidence the caller supplied, and write a verification plan.
//
// Deterministic rules only. No model call, no network, nothing leaves the process, so the
// same input always gives the same output. Isomorphic: the web page runs it in the browser.
//
// Deliberate non-features: no lie detection from tone or style, no reading of intent, no
// probabilities. A verdict is one of supported / contradicted / inconclusive / not_checked and
// always states the basis it rests on.

import { detectEmbeddedInstructions, sanitizeText } from "@/lib/tools/bytes";
import { ToolError, type Evidence, type ToolOutcome } from "@/lib/tools/types";

export const CLAIMCHECK_VERSION = "1.0.0";
export const CLAIMCHECK_METHOD = "rules-v1";

export const claimVerdicts = ["supported", "contradicted", "inconclusive", "not_checked"] as const;
export type ClaimVerdict = (typeof claimVerdicts)[number];

export const statementTypes = ["fact", "opinion", "prediction", "speculation", "question"] as const;
export type StatementType = (typeof statementTypes)[number];

export const claimLimits = { maxTextChars: 20_000, maxSentences: 200, maxEvidenceItems: 10, maxEvidenceChars: 8_000, maxClaims: 60 };

export type EvidenceInput = { id?: string | null; text: string; source?: string | null };

export type Claim = {
  id: string;
  sentence_index: number;
  text: string;
  checkability: "high" | "low";
  anchors: { numbers: string[]; dates: string[]; names: string[] };
  verdict: ClaimVerdict;
  basis: string;
  matches: Array<{ evidence_id: string; relation: "supports" | "contradicts"; quote: string; reason: string }>;
  missing_evidence: string[];
};

export type ClaimCheckResult = {
  method: typeof CLAIMCHECK_METHOD;
  language: "en" | "zh" | "mixed";
  summary: { sentences: number; facts: number; opinions: number; predictions: number; speculations: number; questions: number; claims: number; supported: number; contradicted: number; inconclusive: number; not_checked: number; internal_contradictions: number };
  sentences: Array<{ index: number; text: string; type: StatementType; markers: string[] }>;
  claims: Claim[];
  internal_contradictions: Array<{ claim_ids: [string, string]; reason: string }>;
  verification_plan: Array<{ step: number; action: string; claim_ids: string[] }>;
  embedded_instructions_detected: boolean;
};

// Multipliers for Chinese large-number units, written as escapes so the source stays ASCII.
const ZH_TEN_THOUSAND = "万";
const ZH_HUNDRED_MILLION = "亿";

const speculationEn = /\b(may|might|could|possibly|perhaps|probably|apparently|allegedly|reportedly|rumou?r(ed|s)?|seems?|appears? to|it is said|i guess|i suspect|supposedly|likely|unconfirmed)\b/i;
const speculationZh = /(可能|也许|或许|据说|传闻|传言|疑似|估计是|大概|似乎|好像|听说|据传|恐怕|未经证实|说不定)/;
const predictionEn = /\b(will|won't|shall|going to|is expected to|are expected to|forecast(s|ed)?|predict(s|ed)?|projected to|by (20[3-9]\d)|next (year|month|quarter|decade)|in the (coming|next) )\b/i;
const predictionZh = /(将会|将要|将在|将于|将达|即将|预计|预测|预期|明年|后年|未来(几|十|五|三|\d)|有望|势必|迟早)/;
const opinionEn = /\b(i think|i believe|i feel|in my (opinion|view)|we believe|should|ought to|must be|best|worst|better|worse|amazing|terrible|awful|great|beautiful|ugly|disgraceful|unacceptable|deserves?|shameful|wonderful|overrated|underrated|ridiculous)\b/i;
const opinionZh = /(我认为|我觉得|我相信|个人认为|在我看来|依我看|应该|应当|必须|最好的|最差的|太差|太好|很棒|糟糕|可耻|令人|值得|不值得|荒谬|了不起|优秀|垃圾|良心|无耻)/;
const negationEn = /\b(not|no|never|none|neither|nor|without|cannot|failed to|denied|denies|deny|refused|didn't|doesn't|don't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|won't|wouldn't|can't|couldn't)\b/i;
const negationZh = /(没有|并未|未曾|从未|不是|不会|不能|没能|并非|否认|拒绝|未能|尚未|无法|不曾|并不|没)/;

const stopwords = new Set(
  "a an the of to in on at for by with from and or but as is are was were be been being has have had do does did this that these those it its their his her our your my we they he she you i not no than then so such into over under about after before during per also more most very just only up out off".split(" "),
);

function splitSentences(text: string): string[] {
  const normalized = text.replace(/\r\n?/g, "\n");
  const parts: string[] = [];
  let current = "";
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    current += char;
    const next = normalized[index + 1] ?? "";
    const isZhEnd = "。！？；".includes(char);
    const isEnEnd = (char === "." || char === "!" || char === "?") && (next === "" || /\s/.test(next)) && !/\b(Mr|Mrs|Ms|Dr|Prof|Inc|Ltd|Co|vs|etc|No|St|e\.g|i\.e|U\.S)\.$/.test(current);
    if (isZhEnd || isEnEnd || char === "\n") {
      if (current.trim()) parts.push(current.trim());
      current = "";
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts.filter((part) => /[\p{L}\p{N}]/u.test(part));
}

function classify(sentence: string): { type: StatementType; markers: string[] } {
  const markers: string[] = [];
  if (/[?？]\s*$/.test(sentence)) return { type: "question", markers: ["question mark"] };
  const add = (pattern: RegExp) => {
    const match = pattern.exec(sentence);
    if (match) markers.push(match[0].toLowerCase());
    return Boolean(match);
  };
  if (add(speculationEn) || add(speculationZh)) return { type: "speculation", markers };
  if (add(predictionEn) || add(predictionZh)) return { type: "prediction", markers };
  if (add(opinionEn) || add(opinionZh)) return { type: "opinion", markers };
  return { type: "fact", markers };
}

// Numbers are normalised to a canonical string so "1,200", "1200" and "1.2 thousand" compare equal.
export function extractNumbers(text: string): string[] {
  const out = new Set<string>();
  const pattern = new RegExp(`(\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?)\\s*(%|percent|thousand|million|billion|trillion|k\\b|m\\b|bn\\b|${ZH_TEN_THOUSAND}|${ZH_HUNDRED_MILLION}|千|百)?`, "gi");
  for (const match of text.matchAll(pattern)) {
    let value = Number(match[1].replace(/,/g, ""));
    if (!Number.isFinite(value)) continue;
    const unit = (match[2] ?? "").toLowerCase();
    if (unit === "%" || unit === "percent") {
      out.add(`${value}%`);
      continue;
    }
    if (unit === "thousand" || unit === "k" || unit === "千") value *= 1e3;
    else if (unit === "million" || unit === "m") value *= 1e6;
    else if (unit === "billion" || unit === "bn") value *= 1e9;
    else if (unit === "trillion") value *= 1e12;
    else if (unit === ZH_TEN_THOUSAND) value *= 1e4;
    else if (unit === ZH_HUNDRED_MILLION) value *= 1e8;
    else if (unit === "百") value *= 1e2;
    out.add(String(Number(value.toPrecision(12))));
  }
  return [...out];
}

function extractDates(text: string): string[] {
  const out = new Set<string>();
  for (const match of text.matchAll(/\b(1[89]\d{2}|20\d{2})(?:[-/.年](\d{1,2})(?:[-/.月](\d{1,2}))?)?/g)) out.add(match[0].replace(/[年月]/g, "-").replace(/[/.]/g, "-").replace(/-$/, ""));
  for (const match of text.matchAll(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?/gi)) out.add(match[0].toLowerCase());
  return [...out];
}

function extractNames(text: string): string[] {
  const out = new Set<string>();
  // Capitalised sequences that are not just the first word of the sentence.
  for (const match of text.matchAll(/(?<![.!?]\s)(?<!^)\b([A-Z][\p{L}0-9&'-]+(?:\s+(?:of|the|and|de|van)?\s?[A-Z][\p{L}0-9&'-]+){0,4})/gu)) out.add(match[1].trim());
  for (const match of text.matchAll(/\b([A-Z]{2,}[0-9]*)\b/g)) out.add(match[1]);
  for (const match of text.matchAll(/[《「『“"]([^》」』”"]{2,40})[》」』”"]/g)) out.add(match[1]);
  return [...out].slice(0, 12);
}

// Content terms: lowercased Latin words minus stopwords, plus CJK character bigrams.
export function terms(text: string): Set<string> {
  const out = new Set<string>();
  for (const match of text.toLowerCase().matchAll(/[a-z][a-z'-]{1,}/g)) {
    const word = match[0].replace(/'s$/, "").replace(/(ing|ed|es|s)$/, "");
    if (word.length >= 2 && !stopwords.has(match[0]) && !stopwords.has(word)) out.add(word);
  }
  for (const match of text.matchAll(/[一-鿿]{2,}/g)) {
    const run = match[0];
    for (let index = 0; index < run.length - 1; index += 1) out.add(run.slice(index, index + 2));
  }
  return out;
}

function hasNegation(text: string) {
  return negationEn.test(text) || negationZh.test(text);
}

function containment(needle: Set<string>, haystack: Set<string>) {
  if (needle.size === 0) return 0;
  let hits = 0;
  for (const term of needle) if (haystack.has(term)) hits += 1;
  return hits / needle.size;
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (a.size === 0 || b.size === 0) return 0;
  let hits = 0;
  for (const term of a) if (b.has(term)) hits += 1;
  return hits / (a.size + b.size - hits);
}

function detectLanguage(text: string): ClaimCheckResult["language"] {
  const cjk = (text.match(/[一-鿿]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  if (cjk > 0 && latin > cjk * 3) return "mixed";
  if (cjk > 0 && latin > 0 && cjk > latin / 3 && latin > cjk) return "mixed";
  return cjk > latin / 4 ? "zh" : "en";
}

function missingEvidenceFor(anchors: Claim["anchors"], zh: boolean): string[] {
  const out: string[] = [];
  if (anchors.numbers.length > 0) out.push(zh ? "该数字的一手来源（官方统计、财报、原始数据集），并注明统计口径和日期" : "A primary source for the figure (official statistics, filing, original dataset) with its definition and date");
  if (anchors.dates.length > 0) out.push(zh ? "事发当时留下的记录（公告、新闻稿、带时间戳的文件）" : "A record made at the time (announcement, press release, timestamped document)");
  if (anchors.names.length > 0) out.push(zh ? "被提及的人或机构自己的表态或官方记录" : "A statement or official record from the named person or organisation itself");
  if (out.length === 0) out.push(zh ? "与说话人无利益关系的独立来源" : "An independent source with no stake in the claim");
  return out;
}

type PreparedEvidence = { id: string; source: string | null; sentences: Array<{ text: string; terms: Set<string>; numbers: string[]; negated: boolean }> };

export function runClaimCheck(input: { text: string; evidence?: EvidenceInput[] | null }): ToolOutcome<ClaimCheckResult> {
  if (typeof input.text !== "string" || input.text.trim().length < 3) throw new ToolError("invalid_input", "text is required (at least 3 characters).");
  if (input.text.length > claimLimits.maxTextChars) throw new ToolError("payload_too_large", `text must be <= ${claimLimits.maxTextChars} characters.`, { max_chars: claimLimits.maxTextChars });
  const evidenceInput = input.evidence ?? [];
  if (!Array.isArray(evidenceInput) || evidenceInput.length > claimLimits.maxEvidenceItems) throw new ToolError("invalid_input", `evidence must be an array of at most ${claimLimits.maxEvidenceItems} items.`);

  const language = detectLanguage(input.text);
  const zh = language === "zh";
  const rawSentences = splitSentences(input.text).slice(0, claimLimits.maxSentences);

  const prepared: PreparedEvidence[] = evidenceInput.map((item, index) => {
    if (!item || typeof item.text !== "string" || item.text.trim().length === 0) throw new ToolError("invalid_input", `evidence[${index}].text is required.`);
    if (item.text.length > claimLimits.maxEvidenceChars) throw new ToolError("payload_too_large", `evidence[${index}].text must be <= ${claimLimits.maxEvidenceChars} characters.`);
    return {
      id: sanitizeText(item.id ?? `E${index + 1}`, 40) || `E${index + 1}`,
      source: item.source ? sanitizeText(item.source, 200) : null,
      sentences: splitSentences(item.text).map((text) => ({ text, terms: terms(text), numbers: extractNumbers(text), negated: hasNegation(text) })),
    };
  });

  const sentences = rawSentences.map((text, index) => ({ index, text: sanitizeText(text, 600), ...classify(text) }));

  type Working = Claim & { termSet: Set<string>; negated: boolean };
  const claims: Working[] = [];
  for (const sentence of sentences) {
    if (sentence.type !== "fact" || claims.length >= claimLimits.maxClaims) continue;
    const anchors = { numbers: extractNumbers(sentence.text), dates: extractDates(sentence.text), names: extractNames(sentence.text) };
    const termSet = terms(sentence.text);
    if (termSet.size < 2) continue;
    const anchored = anchors.numbers.length + anchors.dates.length + anchors.names.length > 0;
    claims.push({
      id: `C${claims.length + 1}`,
      sentence_index: sentence.index,
      text: sentence.text,
      checkability: anchored ? "high" : "low",
      anchors,
      verdict: "not_checked",
      basis: "",
      matches: [],
      missing_evidence: [],
      termSet,
      negated: hasNegation(sentence.text),
    });
  }

  // --- compare with supplied evidence ---
  for (const claim of claims) {
    if (prepared.length === 0) {
      claim.basis = zh ? "未提供证据，未做对照。" : "No evidence was supplied, so nothing was compared.";
      claim.missing_evidence = missingEvidenceFor(claim.anchors, zh);
      continue;
    }
    for (const item of prepared) {
      let best: { score: number; sentence: PreparedEvidence["sentences"][number] } | null = null;
      for (const sentence of item.sentences) {
        const score = containment(claim.termSet, sentence.terms);
        if (!best || score > best.score) best = { score, sentence };
      }
      if (!best || best.score < 0.6) continue;
      const claimNumbers = claim.anchors.numbers;
      // Every figure in the claim must appear in the evidence sentence to count as support.
      // A figure the evidence replaces with a different one is a conflict; a figure the
      // evidence simply does not mention means the evidence does not settle the claim.
      const evidenceNumbers = best.sentence.numbers;
      const unmatchedInClaim = claimNumbers.filter((value) => !evidenceNumbers.includes(value));
      const unmatchedInEvidence = evidenceNumbers.filter((value) => !claimNumbers.includes(value));
      const numbersConflict = unmatchedInClaim.length > 0 && unmatchedInEvidence.length > 0;
      const numbersMissing = unmatchedInClaim.length > 0 && unmatchedInEvidence.length === 0;
      const polarityConflict = claim.negated !== best.sentence.negated;
      const quote = sanitizeText(best.sentence.text, 300);
      if (numbersConflict) {
        claim.matches.push({ evidence_id: item.id, relation: "contradicts", quote, reason: zh ? "证据谈的是同一件事，但数字不同。" : "The evidence addresses the same point but gives different figures." });
      } else if (polarityConflict) {
        claim.matches.push({ evidence_id: item.id, relation: "contradicts", quote, reason: zh ? "证据谈的是同一件事，但一个肯定、一个否定。" : "The evidence addresses the same point but one side affirms it and the other negates it." });
      } else if (!numbersMissing) {
        claim.matches.push({ evidence_id: item.id, relation: "supports", quote, reason: zh ? "证据里有措辞和数字都对得上的表述。" : "The evidence contains a statement with matching wording and figures." });
      }
    }
    const supports = claim.matches.filter((match) => match.relation === "supports").length;
    const contradicts = claim.matches.filter((match) => match.relation === "contradicts").length;
    if (supports > 0 && contradicts === 0) {
      claim.verdict = "supported";
      claim.basis = zh ? "所给证据中有文字与该主张一致（词语与数字比对）。这不代表证据本身为真。" : "The supplied evidence states the same thing (wording and figures compared). This does not establish that the evidence itself is true.";
    } else if (contradicts > 0 && supports === 0) {
      claim.verdict = "contradicted";
      claim.basis = zh ? "所给证据中有文字与该主张冲突（数字不同或肯定/否定相反）。需人工确认两者说的是同一对象。" : "The supplied evidence conflicts with the claim (different figures or opposite polarity). Confirm by reading that both refer to the same thing.";
    } else if (supports > 0 && contradicts > 0) {
      claim.verdict = "inconclusive";
      claim.basis = zh ? "所给证据互相矛盾：有的支持，有的反对。" : "The supplied evidence is split: some supports the claim and some contradicts it.";
      claim.missing_evidence = missingEvidenceFor(claim.anchors, zh);
    } else {
      claim.verdict = "inconclusive";
      claim.basis = zh ? "所给证据没有直接谈到这一主张。" : "The supplied evidence does not directly address this claim.";
      claim.missing_evidence = missingEvidenceFor(claim.anchors, zh);
    }
  }

  // --- internal contradictions ---
  const contradictions: ClaimCheckResult["internal_contradictions"] = [];
  for (let a = 0; a < claims.length && contradictions.length < 20; a += 1) {
    for (let b = a + 1; b < claims.length && contradictions.length < 20; b += 1) {
      const left = claims[a];
      const right = claims[b];
      const similarity = jaccard(left.termSet, right.termSet);
      if (similarity < 0.5) continue;
      const leftNumbers = left.anchors.numbers;
      const rightNumbers = right.anchors.numbers;
      const numbersDiffer = leftNumbers.some((value) => !rightNumbers.includes(value)) && rightNumbers.some((value) => !leftNumbers.includes(value));
      const polarityDiffers = left.negated !== right.negated && similarity >= 0.6;
      if (numbersDiffer) {
        contradictions.push({ claim_ids: [left.id, right.id], reason: zh ? "两句话措辞相近，但给出的数字不同。" : "The two sentences are worded alike but give different figures." });
      } else if (polarityDiffers) {
        contradictions.push({ claim_ids: [left.id, right.id], reason: zh ? "两句话措辞相近，但一句肯定、一句否定。" : "The two sentences are worded alike but one affirms and the other negates." });
      }
    }
  }

  // --- verification plan ---
  const plan: ClaimCheckResult["verification_plan"] = [];
  const push = (action: string, ids: string[]) => {
    if (ids.length > 0) plan.push({ step: plan.length + 1, action, claim_ids: ids });
  };
  push(zh ? "先解决内部矛盾：向说话人问清哪一个说法是准的。" : "Resolve the internal contradictions first: ask the author which version is correct.", [...new Set(contradictions.flatMap((item) => item.claim_ids))]);
  push(zh ? "复核被证据反驳的主张：确认证据与主张说的是同一对象、同一时间、同一口径。" : "Re-read the contradicted claims: confirm the evidence and the claim refer to the same subject, period and definition.", claims.filter((claim) => claim.verdict === "contradicted").map((claim) => claim.id));
  push(zh ? "为带数字的主张找一手来源，并核对口径和日期。" : "Find a primary source for each claim with figures and check the definition and date.", claims.filter((claim) => claim.verdict !== "supported" && claim.anchors.numbers.length > 0).map((claim) => claim.id));
  push(zh ? "为涉及具体人、机构、日期的主张找当时的记录或当事方表态。" : "Find a contemporaneous record or a statement from the named party for claims about specific people, organisations or dates.", claims.filter((claim) => claim.verdict !== "supported" && claim.anchors.numbers.length === 0 && claim.anchors.names.length + claim.anchors.dates.length > 0).map((claim) => claim.id));
  push(zh ? "把笼统的说法具体化：问清是谁、何时、多少，再去核实。" : "Make the vague claims specific (who, when, how much) before trying to verify them.", claims.filter((claim) => claim.checkability === "low" && claim.verdict !== "supported").map((claim) => claim.id));
  push(zh ? "对已获支持的主张，核实证据本身的出处和完整性。" : "For supported claims, verify where the evidence itself came from and that it is complete.", claims.filter((claim) => claim.verdict === "supported").map((claim) => claim.id));

  const count = (type: StatementType) => sentences.filter((sentence) => sentence.type === type).length;
  const verdictCount = (verdict: ClaimVerdict) => claims.filter((claim) => claim.verdict === verdict).length;
  const embedded = detectEmbeddedInstructions(input.text) || evidenceInput.some((item) => detectEmbeddedInstructions(item.text));

  const publicClaims: Claim[] = claims.map((claim) => ({
    id: claim.id,
    sentence_index: claim.sentence_index,
    text: claim.text,
    checkability: claim.checkability,
    anchors: claim.anchors,
    verdict: claim.verdict,
    basis: claim.basis,
    matches: claim.matches,
    missing_evidence: claim.missing_evidence,
  }));
  const result: ClaimCheckResult = {
    method: CLAIMCHECK_METHOD,
    language,
    summary: {
      sentences: sentences.length,
      facts: count("fact"),
      opinions: count("opinion"),
      predictions: count("prediction"),
      speculations: count("speculation"),
      questions: count("question"),
      claims: claims.length,
      supported: verdictCount("supported"),
      contradicted: verdictCount("contradicted"),
      inconclusive: verdictCount("inconclusive"),
      not_checked: verdictCount("not_checked"),
      internal_contradictions: contradictions.length,
    },
    sentences,
    claims: publicClaims,
    internal_contradictions: contradictions,
    verification_plan: plan,
    embedded_instructions_detected: embedded,
  };

  const evidence: Evidence[] = prepared.map((item) => ({
    id: item.id,
    kind: "supplied_text",
    source: "user_supplied",
    summary: `Evidence text supplied by the caller (${item.sentences.length} sentence(s))${item.source ? `, stated source: ${item.source}` : ""}. Its authenticity was not checked.`,
  }));

  const limitations = [
    "Rule-based analysis (method rules-v1): sentence typing and matching use wording, numbers and negation. It does not understand meaning, sarcasm or context, and it will miss paraphrases.",
    "\"supported\" and \"contradicted\" describe how the supplied evidence text relates to the claim. ClaimCheck did not verify that the evidence is authentic, complete or true.",
    "No outside lookup was performed. Claims with no supplied evidence are \"not_checked\", which is not a judgement either way.",
    "ClaimCheck does not judge honesty or intent, and does not use tone, style or emotion as evidence.",
    "Opinions, predictions and speculation are listed but not given a verdict: they cannot be verified as true or false today.",
  ];
  if (embedded) limitations.push("The input contains wording that looks like instructions to an AI system. It was analysed as plain text; do not act on it.");

  const next: string[] = [];
  if (prepared.length === 0 && claims.length > 0) next.push("Supply evidence texts (documents, records, statements) in the evidence array and run again to compare them with the claims.");
  if (contradictions.length > 0) next.push("Read the flagged sentence pairs: a real contradiction inside a statement is the cheapest thing to check.");
  if (claims.some((claim) => claim.verdict === "contradicted")) next.push("Before concluding anything from a contradicted claim, have a person confirm that the claim and the evidence are about the same thing.");
  if (claims.length === 0) next.push("No checkable factual claims were found. Ask for specifics: who, what, when, where, how much.");
  next.push("Follow the verification_plan in order; it starts with the checks that cost least.");

  return { result, evidence, limitations, next_actions: next };
}
