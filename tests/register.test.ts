import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { POST as register } from "@/app/api/v1/agents/register/route";
import { GET as me } from "@/app/api/v1/agents/me/route";
import { GET as pow } from "@/app/api/v1/pow/route";
import { setAgentStore, toStoreError, type AgentStore } from "@/lib/agents/store";

import { MemoryStore } from "./helpers/memory-store";
import { getRequest, jsonRequest, powFor } from "./helpers/http";

let store: MemoryStore;
const agentBody = { name: "Atlas Research Agent", description: "Maps opening hours. Operated by Example Labs.", homepage: "https://example.com" };

beforeEach(() => {
  store = new MemoryStore();
  setAgentStore(store);
});
afterEach(() => setAgentStore(undefined));

describe("GET /api/v1/pow", () => {
  it("returns a challenge", async () => {
    const response = await pow(getRequest("/api/v1/pow"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ algorithm: "sha256", purpose: "register", difficulty_bits: 8 });
    expect(typeof body.challenge).toBe("string");
  });

  it("rejects unknown purposes", async () => {
    expect((await pow(getRequest("/api/v1/pow?purpose=admin"))).status).toBe(400);
  });
});

describe("POST /api/v1/agents/register", () => {
  it("registers with a valid PoW and returns the key exactly once", async () => {
    const response = await register(jsonRequest("/api/v1/agents/register", { ...agentBody, pow: await powFor("register") }));
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.api_key).toMatch(/^aa_[0-9A-Za-z]{43}$/);
    expect(body.key_prefix).toBe(body.api_key.slice(0, 10));
    expect(body.status).toBe("unclaimed");
    expect(body.claim_url).toMatch(/^https:\/\/www\.agentarchitect\.me\/claim\/[0-9A-Za-z]{40}$/);
    expect(body.limits).toEqual({ requestsPerDay: 3, messagesPerDay: 10 });

    const stored = [...store.agents.values()][0];
    expect(stored.key_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify([...store.agents.values()])).not.toContain(body.api_key);
    expect(stored.created_ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify([...store.claims.keys()])).not.toContain(body.claim_url.split("/").pop());
  });

  it("requires a PoW", async () => {
    const response = await register(jsonRequest("/api/v1/agents/register", agentBody));
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("pow_required");
  });

  it("rejects a bad PoW", async () => {
    const solution = await powFor("register");
    const response = await register(jsonRequest("/api/v1/agents/register", { ...agentBody, pow: { ...solution, challenge: `${solution.challenge}x` } }));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("pow_invalid");
  });

  it("rejects a reused challenge", async () => {
    const solution = await powFor("register");
    expect((await register(jsonRequest("/api/v1/agents/register", { ...agentBody, pow: solution }))).status).toBe(201);
    const again = await register(jsonRequest("/api/v1/agents/register", { ...agentBody, pow: solution }));
    expect(again.status).toBe(409);
    expect((await again.json()).error.code).toBe("pow_reused");
  });

  it("rate-limits registrations per IP hash with 429 + Retry-After", async () => {
    const ip = "198.51.100.77";
    for (let index = 0; index < 5; index += 1) {
      const ok = await register(jsonRequest("/api/v1/agents/register", { ...agentBody, pow: await powFor("register") }, { "x-forwarded-for": ip }));
      expect(ok.status).toBe(201);
    }
    const limited = await register(jsonRequest("/api/v1/agents/register", { ...agentBody, pow: await powFor("register") }, { "x-forwarded-for": ip }));
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
    expect((await limited.json()).error.code).toBe("rate_limited");
  });

  it("validates lengths and https-only URLs", async () => {
    const cases = [
      { ...agentBody, name: "x".repeat(81) },
      { ...agentBody, description: "d".repeat(1001) },
      { ...agentBody, homepage: "http://example.com" },
      { ...agentBody, a2a_card_url: `https://example.com/${"a".repeat(300)}` },
      { ...agentBody, description: "" },
    ];
    for (const body of cases) {
      const response = await register(jsonRequest("/api/v1/agents/register", { ...body, pow: await powFor("register") }));
      expect(response.status).toBe(400);
    }
  });

  it("returns 503 not_configured without a server key, and 503 not_migrated before the migration", async () => {
    setAgentStore(null);
    const unconfigured = await register(jsonRequest("/api/v1/agents/register", { ...agentBody, pow: await powFor("register") }));
    expect(unconfigured.status).toBe(503);
    expect((await unconfigured.json()).error.code).toBe("not_configured");

    const broken = new Proxy({} as AgentStore, {
      get: () => async () => {
        throw toStoreError({ code: "PGRST205", message: "Could not find the table 'public.rate_limits' in the schema cache" });
      },
    });
    setAgentStore(broken);
    const notMigrated = await register(jsonRequest("/api/v1/agents/register", { ...agentBody, pow: await powFor("register") }));
    expect(notMigrated.status).toBe(503);
    expect((await notMigrated.json()).error.code).toBe("not_migrated");
  });
});

describe("GET /api/v1/agents/me", () => {
  it("returns the profile and remaining quota", async () => {
    const created = await (await register(jsonRequest("/api/v1/agents/register", { ...agentBody, pow: await powFor("register") }))).json();
    const response = await me(getRequest("/api/v1/agents/me", { authorization: `Bearer ${created.api_key}` }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ agent_id: created.agent_id, name: agentBody.name, status: "unclaimed", remaining: { requests_today: 3, messages_today: 10 } });
    expect(JSON.stringify(body)).not.toContain(created.api_key);
  });

  it("rejects missing and unknown keys", async () => {
    expect((await me(getRequest("/api/v1/agents/me"))).status).toBe(401);
    const unknown = await me(getRequest("/api/v1/agents/me", { authorization: `Bearer aa_${"A".repeat(43)}` }));
    expect(unknown.status).toBe(401);
    expect((await unknown.json()).error.code).toBe("invalid_api_key");
  });
});
