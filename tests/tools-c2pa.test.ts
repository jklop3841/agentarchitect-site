import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { c2paValidatorName, validateC2pa } from "@/lib/tools/c2pa";
import { detectC2paStructure, inspectImage } from "@/lib/tools/imageproof";

// Real Content Credentials, validated with the official C2PA SDK against public test files.
// If the native binary cannot be loaded on this machine the SDK tests are skipped and only
// the structural (presence-only) path is tested.
const fixture = (name: string) => new Uint8Array(readFileSync(fileURLToPath(new URL(`./fixtures/c2pa/${name}`, import.meta.url))));
const none = fixture("adobe-20220124-A.jpg");
const valid = fixture("adobe-20220124-C.jpg");
const altered = fixture("adobe-20220124-E-dat-CA.jpg");
const sdk = (await c2paValidatorName()) === "c2pa-node";

describe("Content Credentials: presence check (always available)", () => {
  it("detects a C2PA block from the bytes", () => {
    expect(detectC2paStructure(none, "image/jpeg")).toBe(false);
    expect(detectC2paStructure(valid, "image/jpeg")).toBe(true);
    expect(detectC2paStructure(altered, "image/jpeg")).toBe(true);
  });
  it("without validation, a C2PA block is reported as present_unvalidated and never as verified", async () => {
    const out = await inspectImage({ bytes: valid, inputMode: "bytes" });
    expect(out.result.content_credentials).toMatchObject({ state: "present_unvalidated", validator: "structural_only" });
    expect(out.result.verdict).not.toBe("verified_origin");
    expect(out.limitations.join(" ")).toMatch(/no cryptographic validation/);
  });
});

describe.skipIf(!sdk)("Content Credentials: cryptographic validation (C2PA SDK)", () => {
  it("image without credentials -> absent", async () => {
    const report = await validateC2pa(none, "image/jpeg");
    expect(report).toMatchObject({ state: "absent", validator: "c2pa-node" });
  });
  it("intact credentials from an untrusted signer -> valid_untrusted_signer, verdict insufficient_evidence", async () => {
    const report = await validateC2pa(valid, "image/jpeg");
    expect(report.state).toBe("valid_untrusted_signer");
    expect(report.status_codes).toContain("signingCredential.untrusted");
    expect(report.active_manifest?.signer.issuer).toBe("C2PA Test Signing Cert");
    expect(report.active_manifest?.assertions.length).toBeGreaterThan(0);
    const out = await inspectImage({ bytes: valid, inputMode: "bytes", c2pa: report });
    expect(out.result.verdict).toBe("insufficient_evidence");
    expect(out.result.findings.map((finding) => finding.code)).toContain("content_credentials_valid_untrusted_signer");
  });
  it("image altered after signing -> invalid, verdict contradiction_found", async () => {
    const report = await validateC2pa(altered, "image/jpeg");
    expect(report.state).toBe("invalid");
    expect(report.status_codes).toContain("assertion.dataHash.mismatch");
    const out = await inspectImage({ bytes: altered, inputMode: "bytes", c2pa: report });
    expect(out.result.verdict).toBe("contradiction_found");
  });
  it("a single flipped byte in the image data breaks validation", async () => {
    const tampered = new Uint8Array(valid);
    tampered[tampered.length - 200] ^= 0xff;
    const report = await validateC2pa(tampered, "image/jpeg");
    expect(report.state).toBe("invalid");
  });
  it("does not report verified_origin without a configured trust list", async () => {
    for (const bytes of [none, valid, altered]) {
      const out = await inspectImage({ bytes, inputMode: "bytes", c2pa: await validateC2pa(bytes, "image/jpeg") });
      expect(out.result.verdict).not.toBe("verified_origin");
    }
  });
});
