import { describe, expect, it } from "vitest";

import { issueChallenge, leadingZeroBits, verifySolution } from "@/lib/agents/pow";

import { solve } from "./helpers/http";

const secret = "test-secret";

describe("proof-of-work", () => {
  it("counts leading zero bits", () => {
    expect(leadingZeroBits("ffff")).toBe(0);
    expect(leadingZeroBits("0fff")).toBe(4);
    expect(leadingZeroBits("01ff")).toBe(7);
    expect(leadingZeroBits("0000")).toBe(16);
    expect(leadingZeroBits("0008")).toBe(12);
  });

  it("issues a signed challenge with the configured difficulty", async () => {
    const challenge = await issueChallenge(secret, "register");
    expect(challenge.algorithm).toBe("sha256");
    expect(challenge.difficulty_bits).toBe(8); // POW_BITS_REGISTER=8 in vitest.config.ts
    expect(challenge.challenge).toMatch(/^aa1\.register\.8\.\d+\.[\w-]+\.[\w-]{32}$/);
    expect(new Date(challenge.expires_at).getTime()).toBeGreaterThan(Date.now() + 9 * 60_000);
  });

  it("defaults to 20 bits for register and 18 for message", async () => {
    const saved = { r: process.env.POW_BITS_REGISTER, m: process.env.POW_BITS_MESSAGE };
    delete process.env.POW_BITS_REGISTER;
    delete process.env.POW_BITS_MESSAGE;
    try {
      expect((await issueChallenge(secret, "register")).difficulty_bits).toBe(20);
      expect((await issueChallenge(secret, "message")).difficulty_bits).toBe(18);
    } finally {
      process.env.POW_BITS_REGISTER = saved.r;
      process.env.POW_BITS_MESSAGE = saved.m;
    }
  });

  it("accepts a valid solution and returns a stable challenge hash", async () => {
    const { challenge, difficulty_bits } = await issueChallenge(secret, "register");
    const nonce = solve(challenge, difficulty_bits);
    const result = await verifySolution(secret, "register", { challenge, nonce });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.challengeHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("rejects missing, tampered, wrong-purpose, expired and insufficient solutions", async () => {
    const { challenge, difficulty_bits } = await issueChallenge(secret, "register");
    const nonce = solve(challenge, difficulty_bits);

    expect(await verifySolution(secret, "register", undefined)).toMatchObject({ ok: false, code: "pow_required" });
    expect(await verifySolution("other-secret", "register", { challenge, nonce })).toMatchObject({ ok: false, code: "pow_invalid" });
    expect(await verifySolution(secret, "register", { challenge: challenge.replace("aa1.register.8", "aa1.register.9"), nonce })).toMatchObject({ ok: false, code: "pow_invalid" });
    expect(await verifySolution(secret, "message", { challenge, nonce })).toMatchObject({ ok: false, code: "pow_invalid" });
    expect(await verifySolution(secret, "register", { challenge, nonce }, Date.now() + 11 * 60_000)).toMatchObject({ ok: false, code: "pow_expired" });

    // Find a nonce that does NOT satisfy the difficulty.
    let bad = 0;
    const { createHash } = await import("node:crypto");
    const { leadingZeroBits: lzb } = await import("@/lib/agents/pow");
    while (lzb(createHash("sha256").update(`${challenge}:${bad}`).digest("hex")) >= difficulty_bits) bad += 1;
    expect(await verifySolution(secret, "register", { challenge, nonce: String(bad) })).toMatchObject({ ok: false, code: "pow_insufficient" });
    expect(await verifySolution(secret, "register", { challenge, nonce: "x".repeat(65) })).toMatchObject({ ok: false, code: "pow_invalid" });
  });
});
