import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { middleware } from "../middleware";
import { decideVisit, detectBot, isAgentEndpoint, isStaticPath, logVisit, redactPath } from "@/lib/agents/visits";

const saved = { ...process.env };
beforeEach(() => {
  process.env.SUPABASE_URL = "https://db.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  process.env.IP_HASH_SALT = "test-salt";
});
afterEach(() => {
  process.env = { ...saved };
  vi.unstubAllGlobals();
});

function event() {
  const pending: Promise<unknown>[] = [];
  return { waitUntil: vi.fn((promise: Promise<unknown>) => pending.push(promise)), pending };
}

describe("bot detection", () => {
  it("detects known AI crawlers and agents", () => {
    expect(detectBot("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)")).toBe("GPTBot");
    expect(detectBot("Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)")).toBe("ChatGPT-User");
    expect(detectBot("Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)")).toBe("ClaudeBot");
    expect(detectBot("Claude-User/1.0")).toBe("Claude-User");
    expect(detectBot("PerplexityBot/1.0")).toBe("PerplexityBot");
    expect(detectBot("meta-externalagent/1.1")).toBe("meta-externalagent");
    expect(detectBot("Mozilla/5.0 (Windows NT 10.0) Chrome/130")).toBeNull();
    expect(detectBot(null)).toBeNull();
  });

  it("flags agent endpoints and excludes static assets", () => {
    for (const path of ["/mcp", "/a2a", "/skill.md", "/.well-known/agent-card.json", "/llms.txt", "/llms-full.txt"]) expect(isAgentEndpoint(path), path).toBe(true);
    expect(isAgentEndpoint("/requests")).toBe(false);
    for (const path of ["/_next/static/chunk.js", "/favicon.ico", "/media/x.webp", "/robots.txt", "/sitemap.xml", "/fonts/a.woff2"]) expect(isStaticPath(path), path).toBe(true);
    expect(decideVisit("/_next/static/x.js", "GPTBot").log).toBe(false);
  });

  it("samples: bots and agent endpoints always, others at VISIT_LOG_SAMPLE (default 0.2)", () => {
    expect(decideVisit("/", "GPTBot/1.0", 0.99)).toMatchObject({ log: true, is_known_ai_bot: true, bot_name: "GPTBot" });
    expect(decideVisit("/skill.md", "curl/8", 0.99)).toMatchObject({ log: true, agent_endpoint: true, is_known_ai_bot: false });
    expect(decideVisit("/", "Chrome", 0.19).log).toBe(true);
    expect(decideVisit("/", "Chrome", 0.21).log).toBe(false);
    process.env.VISIT_LOG_SAMPLE = "0";
    expect(decideVisit("/", "Chrome", 0).log).toBe(false);
  });

  it("redacts claim tokens from paths", () => {
    expect(redactPath("/claim/AbCdEf0123456789AbCdEf0123456789AbCdEf01")).toBe("/claim/:token");
  });
});

describe("middleware", () => {
  it("logs a bot visit via waitUntil with a hashed IP only", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const ev = event();
    const response = await middleware(
      new NextRequest("https://www.agentarchitect.me/skill.md", { headers: { "user-agent": "ClaudeBot/1.0", "x-forwarded-for": "198.51.100.23", referer: "https://chat.example.com/x" } }),
      ev as never,
    );
    expect(response.status).toBe(200);
    expect(ev.waitUntil).toHaveBeenCalledTimes(1);
    await Promise.all(ev.pending);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://db.example.test/rest/v1/agent_visits");
    const row = JSON.parse(String(init.body));
    expect(row).toMatchObject({ path: "/skill.md", method: "GET", bot_name: "ClaudeBot", is_known_ai_bot: true, agent_endpoint: true, referer_host: "chat.example.com" });
    expect(row.ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(String(init.body)).not.toContain("198.51.100.23");
  });

  it("never logs static assets", async () => {
    const ev = event();
    await middleware(new NextRequest("https://www.agentarchitect.me/_next/static/app.js", { headers: { "user-agent": "GPTBot" } }), ev as never);
    expect(ev.waitUntil).not.toHaveBeenCalled();
  });

  it("skips router prefetches", async () => {
    const ev = event();
    await middleware(new NextRequest("https://www.agentarchitect.me/requests", { headers: { "user-agent": "GPTBot", "next-router-prefetch": "1" } }), ev as never);
    expect(ev.waitUntil).not.toHaveBeenCalled();
  });

  it("swallows logging failures", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));
    const request = new NextRequest("https://www.agentarchitect.me/a2a", { headers: { "user-agent": "GPTBot" } });
    await expect(logVisit(request, decideVisit("/a2a", "GPTBot"))).resolves.toBe(false);
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(logVisit(request, decideVisit("/a2a", "GPTBot"))).resolves.toBe(false);
  });

  it("keeps /admin behind Basic auth and does not log it", async () => {
    const ev = event();
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    expect((await middleware(new NextRequest("https://www.agentarchitect.me/admin/messages"), ev as never)).status).toBe(503);

    process.env.ADMIN_USERNAME = "op";
    process.env.ADMIN_PASSWORD = "pw";
    const denied = await middleware(new NextRequest("https://www.agentarchitect.me/admin/visits"), ev as never);
    expect(denied.status).toBe(401);
    expect(denied.headers.get("www-authenticate")).toContain("Basic");
    const wrong = await middleware(new NextRequest("https://www.agentarchitect.me/admin", { headers: { authorization: `Basic ${btoa("op:nope")}` } }), ev as never);
    expect(wrong.status).toBe(401);
    const ok = await middleware(new NextRequest("https://www.agentarchitect.me/admin/moderate", { method: "POST", headers: { authorization: `Basic ${btoa("op:pw")}` } }), ev as never);
    expect(ok.status).toBe(200);
    expect(ok.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(ev.waitUntil).not.toHaveBeenCalled();
  });
});
