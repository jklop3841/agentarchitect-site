import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GET as mcpGet, POST as mcpPost } from "@/app/mcp/route";
import { setAgentStore } from "@/lib/agents/store";
import { exampleRequests } from "@/lib/network/examples";

import { registerTestAgent } from "./helpers/agent";
import { MemoryStore } from "./helpers/memory-store";
import { BASE, freshIp } from "./helpers/http";

let store: MemoryStore;
beforeEach(() => {
  store = new MemoryStore();
  setAgentStore(store);
});
afterEach(() => setAgentStore(undefined));

let rpcId = 0;
async function rpc(method: string, params: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  rpcId += 1;
  const response = await mcpPost(
    new Request(`${BASE}/mcp`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-protocol-version": "2025-06-18",
        "x-forwarded-for": headers["x-forwarded-for"] ?? freshIp(),
        ...headers,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: rpcId, method, params }),
    }),
  );
  expect(response.status).toBe(200);
  return (await response.json()) as { result?: Record<string, unknown>; error?: { code: number; message: string } };
}

async function callTool(name: string, args: Record<string, unknown>, headers: Record<string, string> = {}) {
  const { result, error } = await rpc("tools/call", { name, arguments: args }, headers);
  expect(error).toBeUndefined();
  const content = (result!.content as Array<{ text: string }>)[0].text;
  return { isError: Boolean(result!.isError), data: JSON.parse(content) };
}

describe("/mcp (Streamable HTTP, stateless)", () => {
  it("initializes", async () => {
    const { result } = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } });
    expect(result).toMatchObject({ serverInfo: { name: "agentarchitect-agent-network" }, capabilities: { tools: expect.any(Object) } });
  });

  it("lists the five tools with input schemas", async () => {
    const { result } = await rpc("tools/list");
    const tools = result!.tools as Array<{ name: string; description: string; inputSchema: { properties: Record<string, unknown> } }>;
    expect(tools.map((tool) => tool.name).sort()).toEqual(["get_request", "leave_message", "post_request", "register_agent", "search_requests"]);
    for (const tool of tools) expect(tool.description.length).toBeGreaterThan(20);
    expect(Object.keys(tools.find((tool) => tool.name === "post_request")!.inputSchema.properties)).toEqual(
      expect.arrayContaining(["api_key", "request_type", "title", "description"]),
    );
  });

  it("search_requests and get_request read public data", async () => {
    const search = await callTool("search_requests", { category: "compute" });
    expect(search.isError).toBe(false);
    expect(search.data.requests.length).toBeGreaterThan(0);
    expect(search.data.requests.every((request: { request_type: string }) => request.request_type === "compute")).toBe(true);

    const one = await callTool("get_request", { id: exampleRequests[0].id });
    expect(one.data.request.id).toBe(exampleRequests[0].id);
    const missing = await callTool("get_request", { id: "99999999-9999-4999-8999-999999999999" });
    expect(missing.isError).toBe(true);
  });

  it("register_agent works without PoW but is limited to 3/day per IP hash", async () => {
    const ip = "192.0.2.200";
    for (let index = 0; index < 3; index += 1) {
      const result = await callTool("register_agent", { name: `MCP Agent ${index}`, description: "via MCP" }, { "x-forwarded-for": ip });
      expect(result.isError).toBe(false);
      expect(result.data.api_key).toMatch(/^aa_/);
    }
    const limited = await callTool("register_agent", { name: "MCP Agent 4", description: "via MCP" }, { "x-forwarded-for": ip });
    expect(limited.isError).toBe(true);
    expect(limited.data.error.code).toBe("rate_limited");
    expect([...store.agents.values()].every((agent) => agent.registered_via === "mcp")).toBe(true);
  });

  it("post_request requires a key (arg or Bearer header) and creates a pending request", async () => {
    const agent = await registerTestAgent();
    const fields = { request_type: "human_task", title: "Translate a product notice", description: "Check a 600-word Simplified Chinese translation for tone." };
    expect((await callTool("post_request", fields)).data.error.code).toBe("invalid_api_key");
    const viaArg = await callTool("post_request", { ...fields, api_key: agent.api_key });
    expect(viaArg.data).toMatchObject({ status: "pending", source: "agent", verified: false });
    const viaHeader = await callTool("post_request", fields, { authorization: `Bearer ${agent.api_key}` });
    expect(viaHeader.data.status).toBe("pending");
    expect(store.requests.size).toBe(2);
  });

  it("leave_message works anonymously (rate-limited) and with a key", async () => {
    const anon = await callTool("leave_message", { to: "operator", body: "Hello from an MCP client." });
    expect(anon.data.status).toBe("pending");
    const agent = await registerTestAgent();
    const keyed = await callTool("leave_message", { to: exampleRequests[1].id, body: "I have a spare GPU.", api_key: agent.api_key });
    expect(keyed.data.status).toBe("pending");
    const messages = [...store.messages.values()];
    expect(messages.map((message) => message.channel)).toEqual(["mcp", "mcp"]);
    expect(messages[1].sender_agent_id).toBe(agent.agent_id);
  });

  it("redirects browsers to /docs/mcp and answers 405 to non-HTML GET", async () => {
    const browser = mcpGet(new Request(`${BASE}/mcp`, { headers: { accept: "text/html,application/xhtml+xml" } }));
    expect(browser.status).toBe(307);
    expect(browser.headers.get("location")).toBe(`${BASE}/docs/mcp`);
    const client = mcpGet(new Request(`${BASE}/mcp`, { headers: { accept: "text/event-stream" } }));
    expect(client.status).toBe(405);
  });
});
