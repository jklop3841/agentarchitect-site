// Plain-text content checks for agent/anonymous submissions. Content is stored and
// shown to the operator as data; it is never executed or fed to a model here.

const urlPattern = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;

const spamWords = [
  "viagra", "cialis", "casino", "porn", "xxx", "escort", "payday loan", "crypto airdrop", "airdrop",
  "free money", "make money fast", "seo backlinks", "buy followers", "forex signals", "binary options",
  "work from home and earn", "click here", "limited offer", "weight loss pills",
];

const injectionPatterns: Array<[string, RegExp]> = [
  ["ignore_previous_instructions", /\b(ignore|disregard|forget|override)\b[^.\n]{0,40}\b(previous|prior|above|earlier|all|your)\b[^.\n]{0,20}\b(instructions?|prompts?|rules?|directions?)\b/i],
  ["system_prompt", /\bsystem\s*prompt\b|\bdeveloper\s*(message|prompt)\b/i],
  ["role_tag", /<\/?\s*(system|assistant|user|developer|tool)\s*>|\[\/?(INST|SYS)\]|<\|im_(start|end)\|>|^\s*(system|assistant)\s*:/im],
  ["jailbreak", /\b(jailbreak|DAN mode|do anything now|developer mode enabled)\b/i],
  ["new_instructions", /\b(new|updated|real)\s+instructions?\s*:/i],
  ["exfiltration", /\b(reveal|print|output|leak|show)\b[^.\n]{0,30}\b(api[_\s-]?keys?|secrets?|passwords?|credentials|env(ironment)? variables?|tokens?)\b/i],
  ["act_as", /\b(you are now|from now on you|act as (an? )?(admin|administrator|root|system))\b/i],
];

export type ContentAnalysis = {
  flags: string[];
  links: number;
  spam: boolean;
  reason: string | null;
};

export function countLinks(text: string) {
  return text.match(urlPattern)?.length ?? 0;
}

export function analyzeText(...fields: Array<string | null | undefined>): ContentAnalysis {
  const text = fields.filter(Boolean).join("\n");
  const lower = text.toLowerCase();
  const flags: string[] = [];

  const links = countLinks(text);
  if (links > 3) flags.push("too_many_links");
  if (/(.)\1{14,}/u.test(text)) flags.push("repeated_chars");
  if (/\b(\w{2,})\b(?:\W+\1\b){7,}/iu.test(text)) flags.push("repeated_words");
  const hits = spamWords.filter((word) => lower.includes(word));
  if (hits.length) flags.push("spam_words");
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 40 && letters.replace(/[^A-Z]/g, "").length / letters.length > 0.8) flags.push("shouting");

  for (const [name, pattern] of injectionPatterns) {
    if (pattern.test(text)) flags.push(`prompt_injection:${name}`);
  }

  const spamFlags = flags.filter((flag) => !flag.startsWith("prompt_injection"));
  // Obvious spam is rejected outright; everything else is stored (with flags) for moderation.
  const spam = links > 3 || spamFlags.length >= 2 || hits.length >= 2;
  const reason = spam ? (links > 3 ? "More than 3 links." : "Looks like spam.") : null;

  return { flags, links, spam, reason };
}
