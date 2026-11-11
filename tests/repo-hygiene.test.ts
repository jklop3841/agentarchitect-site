import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { GET as catalogGet } from "@/app/api/v1/tools/route";
import { GET as agentsTxt } from "@/app/agents.txt/route";
import { GET as llmsTxt } from "@/app/llms.txt/route";
import { GET as openapi } from "@/app/openapi.json/route";
import { GET as skillMd } from "@/app/skill.md/route";

// Nothing that belongs to private infrastructure may appear in the repository or in any
// public discovery document: not the private operations domain, not internal addresses,
// not credentials. The private domain is assembled at runtime so this file does not contain it.
const root = fileURLToPath(new URL("..", import.meta.url));
const privateDomain = ["agentarchitect", "tech"].join(".");

const tracked = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter((file) => file && !/\.(png|jpe?g|gif|webp|ico|svg|zip|woff2?|pdf|mp4|node)$/i.test(file) && file !== "package-lock.json")
  .filter((file) => {
    try {
      return statSync(join(root, file)).size < 2_000_000;
    } catch {
      return false;
    }
  });
const read = (file: string) => readFileSync(join(root, file), "utf8");

describe("repository hygiene", () => {
  it("has files to scan", () => {
    expect(tracked.length).toBeGreaterThan(200);
  });

  it("never mentions the private operations domain", () => {
    const hits = tracked.filter((file) => read(file).toLowerCase().includes(privateDomain));
    expect(hits).toEqual([]);
  });

  it("contains no credentials", () => {
    const patterns = [
      /sb_secret_[A-Za-z0-9_-]{16,}/,
      /\bsk-[A-Za-z0-9_-]{24,}/,
      /\bghp_[A-Za-z0-9]{30,}/,
      /\bAKIA[0-9A-Z]{16}\b/,
      /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
      /eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/,
      /\bre_[A-Za-z0-9]{24,}\b/,
    ];
    const hits = tracked.filter((file) => {
      const content = read(file);
      return patterns.some((pattern) => pattern.test(content));
    });
    expect(hits).toEqual([]);
  });

  it("has no internal addresses in shipped code, public files or docs", () => {
    const internal = /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/;
    // Allowed: the SSRF block list itself, tests, and docs that describe the block list.
    const allowed = (file: string) => file === "src/lib/tools/safe-fetch.ts" || file.startsWith("tests/") || file === "docs/04_SECURITY_TEST_REPORT.md";
    const scoped = tracked.filter((file) => /^(src|public|docs|plugins|supabase|README\.md|server\.json|next\.config\.ts|middleware\.ts)/.test(file) && !allowed(file));
    expect(scoped.filter((file) => internal.test(read(file)))).toEqual([]);
  });

  it("region configuration reserves the China deployment without embedding any private asset", () => {
    const region = read("src/lib/region.ts");
    expect(region.toLowerCase()).not.toContain(privateDomain);
    expect(region).not.toMatch(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
    expect(region).not.toMatch(/(secret|password|token)\s*[:=]\s*["'][^"']+["']/i);
  });
});

describe("public discovery documents", () => {
  it("do not leak private hosts, localhost or environment names with values", async () => {
    const documents = await Promise.all([catalogGet(), agentsTxt(), llmsTxt(), openapi(), skillMd()].map(async (response) => (await response).text()));
    for (const document of documents) {
      expect(document.toLowerCase()).not.toContain(privateDomain);
      expect(document).not.toMatch(/localhost|127\.0\.0\.1/);
      expect(document).not.toMatch(/sb_secret_|SUPABASE_SECRET_KEY\s*=/);
    }
  });
});
