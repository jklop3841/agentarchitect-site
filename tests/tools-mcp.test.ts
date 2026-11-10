import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { POST as mcpPost } from "@/app/mcp/route";
import { setAgentStore } from "@/lib/agents/store";
import { setUsageSink, type UsageRow } from "@/lib/tools/usage";

import { BASE, freshIp } from "./helpers/http";
import { buildPng, toBase64 } from "./helpers/images";
import { MemoryStore } from "./helpers/memory-store";

const HELLO = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

let usage: UsageRow[];
beforeEach(() => {
  setAgentStore(new MemoryStore());
  usage = [];
  setUsageSink((row) => void usage.push(row));
});
afterEach(() => {
  setAgentStore(undefined);
  setUsageSink(undefined);
});

let rpcId = 0;
async function rpc(method: string, params: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  rpcId += 1;
  const response = await mcpPost(
    new Request(`${BASE}/mcp`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "mcp-protocol-version": "2025-06-18", "x-forwarded-for": freshIp(), ...headers },
      body: JSON.stringify({ jsonrpc: "2.0", id: rpcId, method, params }),
    }),
  );
  expect(response.status).toBe(200);
  return (await response.json()) as { result?: Record<string, any>; error?: { code: number; message: string } };
}

async function callTool(name: string, args: Record<string, unknown>, headers: Record<string, string> = {}) {
  const { result, error } = await rpc("tools/call", { name, arguments: args }, headers);
  expect(error).toBeUndefined();
  return { isError: Boolean(result!.isError), envelope: JSON.parse(result!.content[0].text), structured: result!.structuredContent };
}

describe("verification tools over MCP", () => {
  it("lists the three tools with input and output schemas and usage guidance", async () => {
    const { result } = await rpc("tools/list");
    const tools = result!.tools as Array<{ name: string; description: string; inputSchema: { properties: Record<string, unknown> }; outputSchema?: { properties: Record<string, unknown> }; annotations: Record<string, unknown> }>;
    for (const name of ["fileproof_check", "imageproof_inspect", "claimcheck_analyze"]) {
      const tool = tools.find((entry) => entry.name === name)!;
      expect(tool, name).toBeTruthy();
      expect(tool.description).toMatch(/WHEN TO USE:/);
      expect(tool.description).toMatch(/WHEN NOT TO USE:/);
      expect(tool.description).toMatch(/LIMITATIONS:/);
      expect(Object.keys(tool.inputSchema.properties).length).toBeGreaterThan(0);
      expect(Object.keys(tool.outputSchema!.properties)).toEqual(expect.arrayContaining(["tool", "status", "result", "evidence", "limitations", "next_actions", "request_id", "cost"]));
      expect(tool.annotations.readOnlyHint).toBe(true);
    }
  });

  it("fileproof_check returns the same envelope as REST, as text and as structured content", async () => {
    const { isError, envelope, structured } = await callTool("fileproof_check", { file: { content_base64: "aGVsbG8=" }, expected_sha256: HELLO });
    expect(isError).toBe(false);
    expect(envelope).toMatchObject({ tool: "fileproof", status: "ok", cost: { charged: false, amount: 0 } });
    expect(envelope.result.integrity).toBe("verified_against_reference");
    expect(structured.result.file.sha256).toBe(HELLO);
  });

  it("imageproof_inspect and claimcheck_analyze run", async () => {
    const image = await callTool("imageproof_inspect", { image: { content_base64: toBase64(buildPng()) } });
    expect(image.envelope.result.verdict).toBe("cannot_determine");
    const claim = await callTool("claimcheck_analyze", { text: "The plant produced 40 tonnes in 2025.", evidence: [{ text: "The plant produced 55 tonnes in 2025." }] });
    expect(claim.envelope.result.claims[0].verdict).toBe("contradicted");
  });

  it("tool errors come back as isError with a structured code", async () => {
    const bad = await callTool("fileproof_check", { file: { url: "http://169.254.169.254/latest/meta-data/" } });
    expect(bad.isError).toBe(true);
    expect(bad.envelope.error.code).toBe("url_not_allowed");
    const invalid = await callTool("fileproof_check", { file: {} });
    expect(invalid.isError).toBe(true);
    expect(invalid.envelope.error.code).toBe("invalid_input");
  });

  it("only tools/call is metered: initialize and tools/list are not usage", async () => {
    await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "scanner", version: "1" } });
    await rpc("tools/list");
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(usage).toHaveLength(0);
    await callTool("claimcheck_analyze", { text: "The tower is 300 metres tall." }, { "user-agent": "glama-mcp-indexer/1.0" });
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(usage).toHaveLength(1);
    expect(usage[0]).toMatchObject({ tool: "claimcheck", channel: "mcp", client_class: "directory_scanner", status: "ok" });
  });
});
