import { randomBase62 } from "@/lib/agents/hash";

// "aa_" + 43 base62 chars ≈ 256 bits of entropy.
export const API_KEY_PATTERN = /^aa_[0-9A-Za-z]{43}$/;

export function generateApiKey() {
  const key = `aa_${randomBase62(43)}`;
  return { key, prefix: key.slice(0, 10) };
}

export function isAgentApiKey(value: string | null | undefined): value is string {
  return typeof value === "string" && API_KEY_PATTERN.test(value);
}

export function generateClaimToken() {
  return randomBase62(40);
}

export const CLAIM_TOKEN_PATTERN = /^[0-9A-Za-z]{40}$/;
