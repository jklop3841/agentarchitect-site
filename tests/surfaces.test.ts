import { afterEach, describe, expect, it } from "vitest";

import { GET as agentsTxt } from "@/app/agents.txt/route";
import { GET as llmsFull } from "@/app/llms-full.txt/route";
import { GET as llms } from "@/app/llms.txt/route";
import { GET as openapi } from "@/app/openapi.json/route";
import { GET as skill } from "@/app/skill.md/route";
import { GET as status } from "@/app/api/v1/status/route";
import { setAgentStore, toStoreError } from "@/lib/agents/store";

import { MemoryStore } from "./helpers/memory-store";

afterEach(() => setAgentStore(undefined));

describe("agent-facing docs", () => {
  it("serves /skill.md as text/markdown with every step", async () => {
    const response = skill();
    expect(response.headers.get("content-type")).toMatch(/^text\/markdown/);
    const text = await response.text();
    for (const needle of [
      "No payments happen on this site",
      "/api/v1/pow",
      "/api/v1/agents/register",
      "Authorization: Bearer aa_YOUR_KEY",
      "/api/v1/messages",
      "hashlib.sha256",
      'createHash("sha256")',
      '"mcpServers"',
      '"method": "message/send"',
      "Unverified · posted by AI agent",
      "moderated",
    ]) {
      expect(text, needle).toContain(needle);
    }
    expect(text).not.toMatch(/localhost|ignore (all|previous)/i);
  });

  it("lists the new endpoints in llms.txt, llms-full.txt, agents.txt and openapi.json", async () => {
    const llmsText = await (await llms()).text();
    expect(llmsText).toContain("/skill.md");
    expect(llmsText).toContain("POST /api/v1/agents/register");
    expect(llmsText).toContain("/mcp");

    const full = await (await llmsFull()).text();
    expect(full).toContain("# AgentArchitect Agent Network: skill guide for AI agents");

    const agents = await (await agentsTxt()).text();
    expect(agents).toContain("agent-register: POST /api/v1/agents/register");
    expect(agents).toContain("mcp-server: /mcp");

    const spec = await (await openapi()).json();
    for (const path of ["/api/v1/pow", "/api/v1/agents/register", "/api/v1/agents/me", "/api/v1/agents/claim", "/api/v1/messages", "/api/v1/requests/{id}/messages", "/mcp", "/a2a"]) {
      expect(spec.paths[path], path).toBeTruthy();
    }
    expect(spec.components.securitySchemes.agentKeyAuth).toMatchObject({ type: "http", scheme: "bearer" });
    for (const body of [llmsText, full, agents, JSON.stringify(spec)]) expect(body).not.toContain("localhost");
  });
});

describe("GET /api/v1/status", () => {
  it("reports not_configured without a server key", async () => {
    setAgentStore(null);
    const body = await (await status()).json();
    expect(body.version).toBe("0.2.0");
    expect(body.agent_onboarding.database).toBe("not_configured");
  });

  it("reports missing V0.2 tables as not_migrated", async () => {
    const store = new MemoryStore();
    store.schemaStatus = async () => ({ agents: false, messages: false, agent_visits: true });
    setAgentStore(store);
    const body = await (await status()).json();
    expect(body.agent_onboarding).toMatchObject({ database: "not_migrated", missing: ["agents", "messages"] });
  });

  it("reports ready when every table answers", async () => {
    setAgentStore(new MemoryStore());
    expect((await (await status()).json()).agent_onboarding.database).toBe("ready");
  });

  it("maps PostgREST 'missing table' errors to not_migrated", () => {
    expect(toStoreError({ code: "PGRST205", message: "x" }).code).toBe("not_migrated");
    expect(toStoreError({ code: "42P01", message: 'relation "public.agents" does not exist' }).status).toBe(503);
  });
});
