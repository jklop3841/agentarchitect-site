// The tool registry: one definition per tool, used by the web directory, the REST API, the
// MCP server, the skill files and the discovery documents. Schemas are written once in zod
// and exported as JSON Schema, so every surface describes exactly what the code validates.

import { z } from "zod";

import { CLAIMCHECK_VERSION, claimLimits, claimVerdicts, statementTypes } from "@/lib/tools/claimcheck";
import { priceFor, toolLimits } from "@/lib/tools/config";
import { FILEPROOF_VERSION, signatureAlgorithms } from "@/lib/tools/fileproof";
import { IMAGEPROOF_VERSION, imageVerdicts } from "@/lib/tools/imageproof";
import { toolErrorCodes, type ToolId } from "@/lib/tools/types";

const sha256Text = z.string().max(80).describe("SHA-256 as 64 hex characters (an optional 'sha256:' prefix is accepted).");
const budget = z.number().min(0).max(1_000_000).optional().describe("Refuse the call if it would cost more than this many credits. All current tools cost 0.");

const fileSource = z
  .strictObject({
    content_base64: z.string().max(4_200_000).optional().describe(`File bytes, base64. Max ${toolLimits.maxInlineFileBytes} bytes decoded.`),
    url: z.string().max(2048).optional().describe(`Public http(s) URL to fetch. Max ${toolLimits.maxRemoteFileBytes} bytes. Private and reserved addresses are refused.`),
    sha256: sha256Text.optional().describe("Hash you computed locally. Use this to compare or check a hash without sending the file."),
    name: z.string().max(200).optional().describe("File name, used only to compare the extension with the detected type."),
    declared_type: z.string().max(120).optional().describe("MIME type the file claims to be."),
    size_bytes: z.number().int().min(0).optional().describe("Size, when only a hash is supplied."),
  })
  .describe("Exactly one of content_base64, url or sha256.");

export const fileproofInput = z.strictObject({
  file: fileSource,
  compare_with: fileSource.optional().describe("A second file to compare byte-for-byte (by hash)."),
  expected_sha256: sha256Text.optional().describe("The hash the publisher says the file should have."),
  signature: z
    .strictObject({
      algorithm: z.enum(signatureAlgorithms),
      public_key_pem: z.string().max(8000).describe("Signer's public key, SPKI PEM (-----BEGIN PUBLIC KEY-----)."),
      signature_base64: z.string().max(4096).describe("Detached signature over the raw file bytes, base64. ECDSA may be DER or raw r||s."),
    })
    .optional(),
  max_cost_credits: budget,
});

const imageSource = z
  .strictObject({
    content_base64: z.string().max(4_200_000).optional().describe(`Image bytes, base64. Max ${toolLimits.maxInlineFileBytes} bytes decoded.`),
    url: z.string().max(2048).optional().describe(`Public http(s) URL of the image. Max ${toolLimits.maxRemoteFileBytes} bytes.`),
    name: z.string().max(200).optional(),
    declared_type: z.string().max(120).optional(),
  })
  .describe("Exactly one of content_base64 or url.");

export const imageproofInput = z.strictObject({
  image: imageSource,
  expected_sha256: sha256Text.optional().describe("Hash of the original you want to compare this copy with."),
  claimed: z
    .strictObject({
      captured_at: z.string().max(40).optional().describe("When the source says the image was taken (ISO 8601)."),
      device: z.string().max(80).optional().describe("Device the source says took it, e.g. 'iPhone 15'."),
    })
    .optional()
    .describe("Statements about the image to compare with its metadata."),
  max_cost_credits: budget,
});

export const claimcheckInput = z.strictObject({
  text: z.string().min(3).max(claimLimits.maxTextChars).describe("The statement to analyse."),
  evidence: z
    .array(
      z.strictObject({
        id: z.string().max(40).optional(),
        text: z.string().min(1).max(claimLimits.maxEvidenceChars).describe("Evidence text: a document excerpt, record or statement."),
        source: z.string().max(200).optional().describe("Where the evidence came from (free text, not fetched)."),
      }),
    )
    .max(claimLimits.maxEvidenceItems)
    .optional()
    .describe("Texts to compare the claims against. Without it every claim is not_checked."),
  max_cost_credits: budget,
});

// ---- result schemas ----

const fileReport = z.object({
  name: z.string().nullable(),
  input_mode: z.enum(["bytes", "url", "hash_only"]),
  size_bytes: z.number().nullable(),
  sha256: z.string(),
  detected_type: z.object({ mime: z.string(), label: z.string(), category: z.enum(["image", "document", "archive", "executable", "media", "text", "unknown"]) }).nullable(),
  declared_type: z.string().nullable(),
  type_matches_declared: z.boolean().nullable(),
});

export const fileproofResult = z.object({
  integrity: z.enum(["verified_against_reference", "mismatch", "no_reference"]),
  file: fileReport,
  compare: z.object({ identical: z.boolean(), other: fileReport }).nullable(),
  known_hash: z.object({ expected_sha256: z.string(), match: z.boolean() }).nullable(),
  signature: z.object({ algorithm: z.enum(signatureAlgorithms), valid: z.boolean(), public_key_sha256: z.string() }).nullable(),
  checks_performed: z.array(z.string()),
});

const knownHash = z.object({ expected_sha256: z.string(), match: z.boolean() }).nullable();

export const imageproofResult = z.object({
  verdict: z.enum(imageVerdicts),
  verdict_reason: z.string(),
  file: z.object({
    name: z.string().nullable(),
    input_mode: z.enum(["bytes", "url"]),
    size_bytes: z.number(),
    sha256: z.string(),
    format: z.string(),
    mime: z.string(),
    width: z.number().nullable(),
    height: z.number().nullable(),
    type_matches_declared: z.boolean().nullable(),
  }),
  metadata: z.object({
    exif_present: z.boolean(),
    xmp_present: z.boolean(),
    iptc_present: z.boolean(),
    device: z.object({ make: z.string().nullable(), model: z.string().nullable(), lens: z.string().nullable() }),
    software: z.string().nullable(),
    captured_at: z.string().nullable(),
    modified_at: z.string().nullable(),
    utc_offset: z.string().nullable(),
    gps: z.object({ latitude: z.number(), longitude: z.number(), altitude_m: z.number().nullable() }).nullable(),
    dimensions_in_metadata: z.object({ width: z.number(), height: z.number() }).nullable(),
    digital_source_type: z.string().nullable(),
    creator_tool: z.string().nullable(),
    description: z.string().nullable(),
    author: z.string().nullable(),
    copyright: z.string().nullable(),
  }),
  content_credentials: z.object({
    state: z.enum(["absent", "present_unvalidated", "valid_untrusted_signer", "trusted", "invalid"]),
    validator: z.enum(["c2pa-node", "structural_only"]),
    status_codes: z.array(z.string()),
    active_manifest: z
      .object({
        claim_generator: z.string().nullable(),
        signer: z.object({ issuer: z.string().nullable(), common_name: z.string().nullable(), time: z.string().nullable(), algorithm: z.string().nullable() }),
        assertions: z.array(z.string()),
        ingredient_count: z.number(),
        digital_source_types: z.array(z.string()),
      })
      .nullable(),
  }),
  known_hash: knownHash,
  findings: z.array(z.object({ code: z.string(), level: z.enum(["info", "clue", "contradiction"]), message: z.string(), data: z.record(z.string(), z.unknown()).optional() })),
});

export const claimcheckResult = z.object({
  method: z.literal("rules-v1"),
  language: z.enum(["en", "zh", "mixed"]),
  summary: z.object({
    sentences: z.number(),
    facts: z.number(),
    opinions: z.number(),
    predictions: z.number(),
    speculations: z.number(),
    questions: z.number(),
    claims: z.number(),
    supported: z.number(),
    contradicted: z.number(),
    inconclusive: z.number(),
    not_checked: z.number(),
    internal_contradictions: z.number(),
  }),
  sentences: z.array(z.object({ index: z.number(), text: z.string(), type: z.enum(statementTypes), markers: z.array(z.string()) })),
  claims: z.array(
    z.object({
      id: z.string(),
      sentence_index: z.number(),
      text: z.string(),
      checkability: z.enum(["high", "low"]),
      anchors: z.object({ numbers: z.array(z.string()), dates: z.array(z.string()), names: z.array(z.string()) }),
      verdict: z.enum(claimVerdicts),
      basis: z.string(),
      matches: z.array(z.object({ evidence_id: z.string(), relation: z.enum(["supports", "contradicts"]), quote: z.string(), reason: z.string() })),
      missing_evidence: z.array(z.string()),
    }),
  ),
  internal_contradictions: z.array(z.object({ claim_ids: z.tuple([z.string(), z.string()]), reason: z.string() })),
  verification_plan: z.array(z.object({ step: z.number(), action: z.string(), claim_ids: z.array(z.string()) })),
  embedded_instructions_detected: z.boolean(),
});

const evidenceItem = z.object({
  id: z.string(),
  kind: z.string(),
  source: z.enum(["computed", "file_metadata", "content_credentials", "user_supplied", "remote_fetch"]),
  summary: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export function envelopeSchema<T extends z.ZodType>(result: T) {
  return z.object({
    tool: z.string(),
    version: z.string(),
    status: z.enum(["ok", "error"]),
    result: result.nullable(),
    evidence: z.array(evidenceItem),
    limitations: z.array(z.string()),
    next_actions: z.array(z.string()),
    request_id: z.string(),
    cost: z.object({ charged: z.boolean(), amount: z.number(), unit: z.literal("credits"), tier: z.enum(["L0", "L1", "L2", "L3"]), simulated: z.boolean() }),
    untrusted_content_notice: z.string(),
    error: z
      .object({ code: z.enum(toolErrorCodes), message: z.string(), details: z.record(z.string(), z.unknown()).optional(), retry_after_seconds: z.number().optional() })
      .optional(),
  });
}

export type ToolDefinition = {
  id: ToolId;
  name: string;
  version: string;
  stage: "stable" | "beta";
  mcpTool: string;
  tagline: { en: string; zh: string };
  description: { en: string; zh: string };
  when_to_use: string[];
  when_not_to_use: string[];
  limitations: string[];
  runsLocallyInBrowser: boolean;
  requiresAuth: false;
  input: z.ZodObject;
  result: z.ZodObject;
  example: Record<string, unknown>;
};

const HELLO_SHA256 = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

export const toolDefinitions: ToolDefinition[] = [
  {
    id: "fileproof",
    name: "FileProof",
    version: FILEPROOF_VERSION,
    stage: "stable",
    mcpTool: "fileproof_check",
    tagline: { en: "Check that a file is the file it should be.", zh: "核对一个文件是不是它该是的那个文件。" },
    description: {
      en: "Computes SHA-256, compares two files, checks a file against a known hash, detects the real file type from its bytes, and verifies a detached signature when you have the signer's public key. Returns a machine-readable report.",
      zh: "计算 SHA-256、比对两份文件、对照已知哈希、从字节识别真实文件类型，并在你持有签名者公钥时验证分离式签名。输出机器可读报告。",
    },
    when_to_use: [
      "Before installing or running a downloaded file: confirm it matches the hash or signature the publisher published.",
      "To confirm two copies of a file are byte-identical.",
      "To find out what a file really is when its name or MIME type may be wrong.",
      "To record a file's fingerprint so a later reader can confirm they have the same file.",
    ],
    when_not_to_use: [
      "To decide whether what a document says is true. A hash says nothing about content.",
      "To scan for malware. FileProof does not analyse behaviour.",
      "To verify OpenPGP, minisign, Authenticode or certificate-chain signatures (not supported).",
    ],
    limitations: [
      "A matching hash proves identical bytes, not authorship, date or truth.",
      "The reference hash or public key must come from a channel you already trust.",
      `Inline files up to ${toolLimits.maxInlineFileBytes} bytes, URL files up to ${toolLimits.maxRemoteFileBytes} bytes. For larger files compute the hash locally and send only the hash.`,
    ],
    runsLocallyInBrowser: true,
    requiresAuth: false,
    input: fileproofInput,
    result: fileproofResult,
    example: { file: { content_base64: "aGVsbG8=", name: "hello.txt" }, expected_sha256: HELLO_SHA256 },
  },
  {
    id: "imageproof",
    name: "ImageProof",
    version: IMAGEPROOF_VERSION,
    stage: "stable",
    mcpTool: "imageproof_inspect",
    tagline: { en: "See what an image file can and cannot prove about its origin.", zh: "看清一张图片对自己的来源能证明什么、不能证明什么。" },
    description: {
      en: "Hashes the image, reads EXIF/XMP/IPTC metadata, validates Content Credentials (C2PA) cryptographically, checks the metadata for internal conflicts and for conflicts with what you were told, and gives one of four verdicts: verified_origin, contradiction_found, insufficient_evidence, cannot_determine.",
      zh: "计算图片哈希，读取 EXIF/XMP/IPTC 元数据，对内容凭证（C2PA）做密码学校验，检查元数据自身以及与你听到的说法之间有无冲突，并给出四种结论之一：已验证来源、发现证据矛盾、证据不足、无法判断。",
    },
    when_to_use: [
      "Someone sends an image as evidence and you need to know what the file itself supports.",
      "To check whether an image carries valid Content Credentials and who signed them.",
      "To compare a stated capture time or device with the embedded metadata.",
      "To confirm a copy is byte-identical to an original whose hash you hold.",
    ],
    when_not_to_use: [
      "To get a yes/no on whether an image is AI-generated or edited. ImageProof gives no such score.",
      "To treat missing EXIF as a sign of fakery. Most shared images have none.",
      "To verify that the scene shown really happened. That needs evidence from outside the file.",
    ],
    limitations: [
      "No pixel forensics and no probability of manipulation.",
      "EXIF, XMP and IPTC are editable; they are claims, not proof.",
      "verified_origin requires a trust list to be configured on the server; without one, a valid signature is reported as valid_untrusted_signer.",
      "Validation runs offline: remote manifests and certificate revocation are not fetched.",
      `JPEG, PNG, WebP, TIFF, HEIC, AVIF, GIF. Inline up to ${toolLimits.maxInlineFileBytes} bytes, URL up to ${toolLimits.maxRemoteFileBytes} bytes.`,
    ],
    runsLocallyInBrowser: true,
    requiresAuth: false,
    input: imageproofInput,
    result: imageproofResult,
    example: { image: { url: "https://example.org/photo.jpg" }, claimed: { captured_at: "2026-10-01", device: "Pixel 9" } },
  },
  {
    id: "claimcheck",
    name: "ClaimCheck",
    version: CLAIMCHECK_VERSION,
    stage: "beta",
    mcpTool: "claimcheck_analyze",
    tagline: { en: "Turn a statement into a list of checkable claims and a plan to check them.", zh: "把一段话拆成可核对的主张，并给出核对计划。" },
    description: {
      en: "Splits a statement into sentences, separates facts from opinions, predictions and speculation, extracts the checkable claims, flags sentences that contradict each other, compares claims with evidence texts you supply (supported / contradicted / inconclusive / not_checked), lists what evidence is missing and writes a verification plan. Deterministic rules, no model call, no web lookup.",
      zh: "把陈述拆成句子，区分事实、观点、预测、猜测，提取可核对的主张，标出互相矛盾的句子，把主张与你提供的证据文本对照（支持 / 反驳 / 无法定论 / 未核查），列出缺少的证据并生成核验计划。纯规则实现，不调用模型，不联网。",
    },
    when_to_use: [
      "To get a repeatable, structured breakdown of a statement before doing your own verification.",
      "To mechanically cross-check figures and yes/no statements against documents you already hold.",
      "To produce an evidence report in a fixed vocabulary that another agent or a person can audit.",
    ],
    when_not_to_use: [
      "To decide whether someone is lying, or to infer intent from tone or style.",
      "As a fact-checker of record: it looks nothing up and does not judge whether your evidence is genuine.",
      "On text where meaning depends on paraphrase, sarcasm or context. The rules compare wording and numbers only.",
    ],
    limitations: [
      "Beta. Rule-based matching on wording, numbers and negation; it does not understand meaning.",
      "supported/contradicted describe the supplied evidence text, not the truth of the claim.",
      "No probabilities are produced.",
      `Text up to ${claimLimits.maxTextChars} characters, up to ${claimLimits.maxEvidenceItems} evidence items of ${claimLimits.maxEvidenceChars} characters each. English and Chinese.`,
    ],
    runsLocallyInBrowser: true,
    requiresAuth: false,
    input: claimcheckInput,
    result: claimcheckResult,
    example: {
      text: "The company was founded in 2015. It has 1,200 employees. I think it is the best employer in the region.",
      evidence: [{ id: "filing", text: "According to the 2025 annual report, the company employs 950 people.", source: "annual report" }],
    },
  },
];

export function getToolDefinition(id: string): ToolDefinition | undefined {
  return toolDefinitions.find((tool) => tool.id === id);
}

export function inputJsonSchema(tool: ToolDefinition) {
  return z.toJSONSchema(tool.input, { io: "input" });
}

export function outputJsonSchema(tool: ToolDefinition) {
  return z.toJSONSchema(envelopeSchema(tool.result), { io: "output" });
}

// Public, serialisable description of a tool: what the catalog endpoint and the pages show.
export function describeTool(tool: ToolDefinition, base: string) {
  const price = priceFor(tool.id);
  return {
    id: tool.id,
    name: tool.name,
    version: tool.version,
    stage: tool.stage,
    tagline: tool.tagline,
    description: tool.description,
    WHEN_TO_USE: tool.when_to_use,
    WHEN_NOT_TO_USE: tool.when_not_to_use,
    LIMITATIONS: tool.limitations,
    pricing: { tier: price.tier, credits_per_call: price.credits, free: price.credits === 0, payment: "none" },
    auth: "none",
    interfaces: {
      web: `${base}/tools/${tool.id}`,
      rest: { method: "POST", url: `${base}/api/v1/tools/${tool.id}`, content_type: "application/json" },
      definition: `${base}/api/v1/tools/${tool.id}`,
      mcp: { endpoint: `${base}/mcp`, tool: tool.mcpTool },
      skill: `${base}/tools/${tool.id}/skill.md`,
    },
    runs_locally_in_browser: tool.runsLocallyInBrowser,
    example_request: tool.example,
  };
}
