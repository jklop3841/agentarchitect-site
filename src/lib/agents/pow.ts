import { powConfig } from "@/lib/agents/config";
import { constantTimeEqual, hmacSha256, sha256Hex } from "@/lib/agents/hash";

// Stateless, HMAC-signed proof-of-work challenges.
//   challenge = "aa1.<purpose>.<bits>.<expires_unix>.<random>.<signature>"
//   solve:      find nonce so that sha256(challenge + ":" + nonce) has >= bits leading zero bits
// Single use is enforced by the caller recording sha256(challenge) in pow_used.

export type PowPurpose = "register" | "message";
export const powPurposes: PowPurpose[] = ["register", "message"];

function base64url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(secret: string, payload: string) {
  return base64url(await hmacSha256(secret, payload)).slice(0, 32);
}

export function bitsFor(purpose: PowPurpose) {
  return purpose === "register" ? powConfig.registerBits : powConfig.messageBits;
}

export async function issueChallenge(secret: string, purpose: PowPurpose, now = Date.now()) {
  const bits = bitsFor(purpose);
  const expires = Math.floor(now / 1000) + powConfig.ttlSeconds;
  const random = base64url(crypto.getRandomValues(new Uint8Array(16)));
  const payload = `aa1.${purpose}.${bits}.${expires}.${random}`;
  return {
    challenge: `${payload}.${await sign(secret, payload)}`,
    difficulty_bits: bits,
    expires_at: new Date(expires * 1000).toISOString(),
    algorithm: "sha256" as const,
    purpose,
    solve: 'Find a nonce (string, <= 64 chars) such that sha256(challenge + ":" + nonce) has at least difficulty_bits leading zero bits. Single use; expires in 10 minutes.',
  };
}

export function leadingZeroBits(hex: string) {
  let bits = 0;
  for (const char of hex) {
    const nibble = parseInt(char, 16);
    if (nibble === 0) {
      bits += 4;
      continue;
    }
    return bits + Math.clz32(nibble) - 28;
  }
  return bits;
}

export type PowCheck =
  | { ok: true; challengeHash: string; expiresAt: string }
  | { ok: false; code: "pow_required" | "pow_invalid" | "pow_expired" | "pow_insufficient"; message: string };

export async function verifySolution(
  secret: string,
  purpose: PowPurpose,
  solution: unknown,
  now = Date.now(),
): Promise<PowCheck> {
  if (!solution || typeof solution !== "object" || Array.isArray(solution)) {
    return { ok: false, code: "pow_required", message: "pow: {challenge, nonce} is required. Get a challenge from GET /api/v1/pow." };
  }
  const { challenge, nonce } = solution as { challenge?: unknown; nonce?: unknown };
  const nonceText = typeof nonce === "number" && Number.isSafeInteger(nonce) ? String(nonce) : nonce;
  if (typeof challenge !== "string" || challenge.length > 200 || typeof nonceText !== "string" || !nonceText || nonceText.length > powConfig.maxNonceLength) {
    return { ok: false, code: "pow_invalid", message: "pow.challenge and pow.nonce (<= 64 chars) are required." };
  }

  const parts = challenge.split(".");
  if (parts.length !== 6 || parts[0] !== "aa1") return { ok: false, code: "pow_invalid", message: "Malformed challenge." };
  const [, challengePurpose, bitsRaw, expiresRaw, , signature] = parts;
  const payload = parts.slice(0, 5).join(".");
  if (!constantTimeEqual(signature, await sign(secret, payload))) {
    return { ok: false, code: "pow_invalid", message: "Challenge signature is invalid." };
  }
  if (challengePurpose !== purpose) {
    return { ok: false, code: "pow_invalid", message: `This challenge is for '${challengePurpose}', not '${purpose}'.` };
  }
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires * 1000 < now) {
    return { ok: false, code: "pow_expired", message: "Challenge expired. Request a new one." };
  }
  const bits = Number(bitsRaw);
  if (!Number.isInteger(bits) || bits < bitsFor(purpose)) {
    return { ok: false, code: "pow_invalid", message: "Challenge difficulty is below the current minimum. Request a new one." };
  }

  const digest = await sha256Hex(`${challenge}:${nonceText}`);
  if (leadingZeroBits(digest) < bits) {
    return { ok: false, code: "pow_insufficient", message: `sha256(challenge:nonce) must have >= ${bits} leading zero bits.` };
  }

  return { ok: true, challengeHash: await sha256Hex(challenge), expiresAt: new Date(expires * 1000).toISOString() };
}
