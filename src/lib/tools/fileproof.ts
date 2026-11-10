// FileProof core: SHA-256, file comparison, known-hash check, type detection and detached
// signature verification. Isomorphic (WebCrypto only) so the web page runs it locally and
// the API runs the same code.

import { normalizeSha256, sanitizeText, sha256Hex, toHex } from "@/lib/tools/bytes";
import { declaredTypeMatches, detectFileType, type DetectedType } from "@/lib/tools/filetype";
import { ToolError, type Evidence, type ToolOutcome } from "@/lib/tools/types";

export const FILEPROOF_VERSION = "1.0.0";

export const signatureAlgorithms = ["ed25519", "ecdsa-p256-sha256", "ecdsa-p384-sha384", "rsa-pss-sha256", "rsa-pkcs1v15-sha256"] as const;
export type SignatureAlgorithm = (typeof signatureAlgorithms)[number];

// A file as the core sees it: either real bytes, or only a hash the caller computed locally.
export type FileSubject = {
  bytes?: Uint8Array;
  sha256?: string;
  name?: string | null;
  declaredType?: string | null;
  sizeBytes?: number | null;
  inputMode: "bytes" | "url" | "hash_only";
};

export type SignatureInput = { algorithm: SignatureAlgorithm; publicKeyPem: string; signatureBase64: string };

export type FileReport = {
  name: string | null;
  input_mode: FileSubject["inputMode"];
  size_bytes: number | null;
  sha256: string;
  detected_type: { mime: string; label: string; category: DetectedType["category"] } | null;
  declared_type: string | null;
  type_matches_declared: boolean | null;
};

export type FileProofResult = {
  integrity: "verified_against_reference" | "mismatch" | "no_reference";
  file: FileReport;
  compare: { identical: boolean; other: FileReport } | null;
  known_hash: { expected_sha256: string; match: boolean } | null;
  signature: { algorithm: SignatureAlgorithm; valid: boolean; public_key_sha256: string } | null;
  checks_performed: string[];
};

async function describe(subject: FileSubject): Promise<FileReport> {
  if (subject.bytes) {
    const detected = detectFileType(subject.bytes);
    return {
      name: subject.name ? sanitizeText(subject.name, 200) : null,
      input_mode: subject.inputMode,
      size_bytes: subject.bytes.length,
      sha256: await sha256Hex(subject.bytes),
      detected_type: detected ? { mime: detected.mime, label: detected.label, category: detected.category } : null,
      declared_type: subject.declaredType ? sanitizeText(subject.declaredType, 120) : null,
      type_matches_declared: declaredTypeMatches(detected, subject.name, subject.declaredType),
    };
  }
  const hash = normalizeSha256(subject.sha256);
  if (!hash) throw new ToolError("invalid_input", "Each file needs content (bytes or url) or a 64-character hex sha256.");
  return {
    name: subject.name ? sanitizeText(subject.name, 200) : null,
    input_mode: "hash_only",
    size_bytes: typeof subject.sizeBytes === "number" && Number.isFinite(subject.sizeBytes) && subject.sizeBytes >= 0 ? Math.floor(subject.sizeBytes) : null,
    sha256: hash,
    detected_type: null,
    declared_type: subject.declaredType ? sanitizeText(subject.declaredType, 120) : null,
    type_matches_declared: null,
  };
}

function pemToDer(pem: string): Uint8Array {
  const match = /-----BEGIN PUBLIC KEY-----([\s\S]+?)-----END PUBLIC KEY-----/.exec(pem);
  if (!match) throw new ToolError("invalid_input", "public_key_pem must be an SPKI public key (-----BEGIN PUBLIC KEY-----).");
  const body = match[1].replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(body) || body.length > 8192) throw new ToolError("invalid_input", "public_key_pem is not valid PEM.");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function base64ToBytes(value: string, max: number): Uint8Array {
  const cleaned = value.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned) || cleaned.length > max) throw new ToolError("invalid_input", "signature_base64 is not valid base64.");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

// OpenSSL emits ECDSA signatures as ASN.1 DER; WebCrypto wants raw r||s. Convert when needed.
export function ecdsaDerToRaw(signature: Uint8Array, size: number): Uint8Array {
  if (signature.length === size * 2) return signature;
  if (signature[0] !== 0x30) return signature;
  let offset = 2;
  if (signature[1] & 0x80) offset = 2 + (signature[1] & 0x7f);
  const readInt = () => {
    if (signature[offset] !== 0x02) throw new ToolError("invalid_input", "ECDSA signature is neither raw r||s nor valid DER.");
    const length = signature[offset + 1];
    const start = offset + 2;
    offset = start + length;
    let value = signature.subarray(start, start + length);
    while (value.length > size && value[0] === 0) value = value.subarray(1);
    if (value.length > size) throw new ToolError("invalid_input", "ECDSA signature component is too long for this curve.");
    const out = new Uint8Array(size);
    out.set(value, size - value.length);
    return out;
  };
  const r = readInt();
  const s = readInt();
  const raw = new Uint8Array(size * 2);
  raw.set(r, 0);
  raw.set(s, size);
  return raw;
}

const view = (bytes: Uint8Array) => bytes as unknown as BufferSource;

async function verifySignature(bytes: Uint8Array, input: SignatureInput) {
  const der = pemToDer(input.publicKeyPem);
  let signature = base64ToBytes(input.signatureBase64, 4096);
  let importParams: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams;
  let verifyParams: AlgorithmIdentifier | RsaPssParams | EcdsaParams;
  switch (input.algorithm) {
    case "ed25519":
      importParams = { name: "Ed25519" };
      verifyParams = { name: "Ed25519" };
      break;
    case "ecdsa-p256-sha256":
      importParams = { name: "ECDSA", namedCurve: "P-256" };
      verifyParams = { name: "ECDSA", hash: "SHA-256" };
      signature = ecdsaDerToRaw(signature, 32);
      break;
    case "ecdsa-p384-sha384":
      importParams = { name: "ECDSA", namedCurve: "P-384" };
      verifyParams = { name: "ECDSA", hash: "SHA-384" };
      signature = ecdsaDerToRaw(signature, 48);
      break;
    case "rsa-pss-sha256":
      importParams = { name: "RSA-PSS", hash: "SHA-256" };
      verifyParams = { name: "RSA-PSS", saltLength: 32 };
      break;
    case "rsa-pkcs1v15-sha256":
      importParams = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
      verifyParams = { name: "RSASSA-PKCS1-v1_5" };
      break;
    default:
      throw new ToolError("invalid_input", `Unsupported signature algorithm. Use one of: ${signatureAlgorithms.join(", ")}.`);
  }
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey("spki", view(der), importParams, false, ["verify"]);
  } catch {
    throw new ToolError("invalid_input", `public_key_pem could not be imported as a ${input.algorithm} key. Check that the key type matches the algorithm.`);
  }
  let valid = false;
  try {
    valid = await crypto.subtle.verify(verifyParams, key, view(signature), view(bytes));
  } catch {
    valid = false;
  }
  return { algorithm: input.algorithm, valid, public_key_sha256: toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", view(der)))) };
}

export async function runFileProof(input: {
  file: FileSubject;
  compareWith?: FileSubject | null;
  expectedSha256?: string | null;
  signature?: SignatureInput | null;
}): Promise<ToolOutcome<FileProofResult>> {
  const file = await describe(input.file);
  const evidence: Evidence[] = [];
  const checks: string[] = [];
  const limitations: string[] = [
    "A matching hash proves the bytes are identical. It does not prove that what the file says is true, who wrote it, or when.",
  ];
  const next: string[] = [];

  if (file.input_mode === "hash_only") {
    evidence.push({ id: "file.sha256", kind: "sha256", source: "user_supplied", summary: "SHA-256 supplied by the caller; this service did not see the file.", data: { sha256: file.sha256 } });
    limitations.push("Hash-only mode: the hash was computed by the caller. Type detection and signature verification need the file bytes.");
  } else {
    checks.push("sha256", "type_detection");
    evidence.push({
      id: "file.sha256",
      kind: "sha256",
      source: "computed",
      summary: `SHA-256 computed over ${file.size_bytes} bytes.`,
      data: { sha256: file.sha256, size_bytes: file.size_bytes },
    });
    if (file.detected_type) {
      evidence.push({ id: "file.type", kind: "file_type", source: "computed", summary: `Leading bytes match: ${file.detected_type.label}.`, data: file.detected_type });
    }
    if (file.type_matches_declared === false) {
      next.push("The declared name or MIME type does not match the file's leading bytes. Treat the declared type as wrong and handle the file by its detected type.");
    }
    if (file.detected_type?.category === "executable") {
      next.push("This is executable content. Do not run it unless its hash or signature matches a source you trust.");
    }
  }

  let compare: FileProofResult["compare"] = null;
  if (input.compareWith) {
    const other = await describe(input.compareWith);
    compare = { identical: other.sha256 === file.sha256, other };
    checks.push("compare");
    evidence.push({
      id: "compare.sha256",
      kind: "comparison",
      source: other.input_mode === "hash_only" && file.input_mode === "hash_only" ? "user_supplied" : "computed",
      summary: compare.identical ? "Both files have the same SHA-256: the bytes are identical." : "The SHA-256 values differ: the files are not byte-identical.",
      data: { a: file.sha256, b: other.sha256 },
    });
  }

  let knownHash: FileProofResult["known_hash"] = null;
  if (input.expectedSha256 != null && input.expectedSha256 !== "") {
    const expected = normalizeSha256(input.expectedSha256);
    if (!expected) throw new ToolError("invalid_input", "expected_sha256 must be 64 hexadecimal characters.");
    knownHash = { expected_sha256: expected, match: expected === file.sha256 };
    checks.push("known_hash");
    evidence.push({
      id: "known_hash",
      kind: "known_hash_check",
      source: "user_supplied",
      summary: knownHash.match ? "The file matches the expected hash." : "The file does NOT match the expected hash.",
      data: { expected_sha256: expected, actual_sha256: file.sha256 },
    });
    limitations.push("The expected hash is only as trustworthy as where you got it. Take it from the publisher's own channel, not from the same place as the file.");
  }

  let signature: FileProofResult["signature"] = null;
  if (input.signature) {
    if (!input.file.bytes) throw new ToolError("invalid_input", "Signature verification needs the file bytes (content_base64 or url), not a hash.");
    signature = await verifySignature(input.file.bytes, input.signature);
    checks.push("signature");
    evidence.push({
      id: "signature",
      kind: "detached_signature",
      source: "computed",
      summary: signature.valid ? "The signature is valid for these bytes under the supplied public key." : "The signature is NOT valid for these bytes under the supplied public key.",
      data: signature,
    });
    limitations.push("A valid signature proves the holder of the matching private key signed these exact bytes. Whether that key belongs to who you think it does is outside this check.");
  }
  limitations.push("Supported signatures: raw detached signatures over the file bytes (Ed25519, ECDSA P-256/P-384, RSA-PSS, RSA PKCS#1 v1.5). OpenPGP, minisign, Authenticode and code-signing certificate chains are not supported.");

  const failed = (compare && !compare.identical) || (knownHash && !knownHash.match) || (signature && !signature.valid);
  const passed = (compare && compare.identical) || (knownHash && knownHash.match) || (signature && signature.valid);
  const integrity: FileProofResult["integrity"] = failed ? "mismatch" : passed ? "verified_against_reference" : "no_reference";

  if (integrity === "no_reference") next.push("To verify integrity, supply expected_sha256 from the publisher, a second copy to compare, or a detached signature with the publisher's public key.");
  if (integrity === "mismatch") next.push("Do not rely on this file. Re-download from the original source and compare again; if it still differs, ask the publisher which hash is current.");
  if (integrity === "verified_against_reference") next.push("Record the SHA-256 with the date and the source of your reference so the check can be repeated later.");

  return { result: { integrity, file, compare, known_hash: knownHash, signature, checks_performed: checks }, evidence, limitations, next_actions: next };
}
