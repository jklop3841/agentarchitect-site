import { leadingZeroBits } from "@/lib/agents/pow";
import { createHash } from "node:crypto";

export const BASE = "https://www.agentarchitect.me";

let ipCounter = 0;
// A fresh client IP per call keeps the in-memory per-IP limiter from leaking between tests.
export function freshIp() {
  ipCounter += 1;
  return `203.0.113.${ipCounter % 250}`;
}

export function jsonRequest(path: string, body: unknown, headers: Record<string, string> = {}, method = "POST") {
  return new Request(`${BASE}${path}`, {
    method,
    headers: { "content-type": "application/json", "x-forwarded-for": headers["x-forwarded-for"] ?? freshIp(), ...headers },
    body: JSON.stringify(body),
  });
}

export function getRequest(path: string, headers: Record<string, string> = {}) {
  return new Request(`${BASE}${path}`, { headers: { "x-forwarded-for": headers["x-forwarded-for"] ?? freshIp(), ...headers } });
}

export function solve(challenge: string, bits: number) {
  for (let nonce = 0; ; nonce += 1) {
    const digest = createHash("sha256").update(`${challenge}:${nonce}`).digest("hex");
    if (leadingZeroBits(digest) >= bits) return String(nonce);
  }
}

export async function powFor(purpose: "register" | "message") {
  const { GET } = await import("@/app/api/v1/pow/route");
  const response = await GET(getRequest(`/api/v1/pow?purpose=${purpose}`));
  const challenge = (await response.json()) as { challenge: string; difficulty_bits: number };
  return { challenge: challenge.challenge, nonce: solve(challenge.challenge, challenge.difficulty_bits) };
}
