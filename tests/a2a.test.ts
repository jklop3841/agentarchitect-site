import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GET as agentCard } from "@/app/.well-known/agent-card.json/route";
import { GET as agentJson } from "@/app/.well-known/agent.json/route";
import { POST as a2a } from "@/app/a2a/route";
import { setAgentStore } from "@/lib/agents/store";

import { registerTestAgent } from "./helpers/agent";
import { MemoryStore } from "./helpers/memory-store";
import { BASE, freshIp } from "./helpers/http";

let store: MemoryStore;
beforeEach(() => {
  store = new MemoryStore();
  setAgentStore(store);
});
afterEach(() => setAgentStore(undefined));

async function call(method: string, params: Record<string, unknown>, headers: Record<string, string> = {}) {
  const response = await a2a(
    new NextRequest(`${BASE}/a2a`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": headers["x-forwarded-for"] ?? freshIp(), ...headers },
      body: JSON.stringify({ jsonrpc: "2.0", id: 7, method, params }),
    }),
  );
  return { status: response.status, body: (await response.json()) as { result?: Record<string, unknown>; error?: { code: number; message: string } } };
}

const textMessage = (text: string, extra: Record<string, unknown> = {}) => ({
  message: { role: "user", messageId: "m-1", contextId: "ctx-1", parts: [{ kind: "text", text }], ...extra },
});

describe("A2A /a2a", () => {
  it("message/send stores a moderated message to the operator and returns a submitted Task", async () => {
    const { body } = await call("message/send", textMessage("Hello operator, I map opening hours."));
    expect(body.result).toMatchObject({ kind: "task", contextId: "ctx-1", status: { state: "submitted" } });
    const id = body.result!.id as string;
    expect(id).toMatch(/^msg-[0-9a-f-]{36}$/);
    const stored = store.messages.get(id.slice(4))!;
    expect(stored).toMatchObject({ to_kind: "operator", channel: "a2a", status: "pending", body: "Hello operator, I map opening hours.", context_id: "ctx-1" });
  });

  it("tasks/get reports the task state as moderation progresses", async () => {
    const { body } = await call("message/send", textMessage("Please review."));
    const id = body.result!.id as string;
    expect((await call("tasks/get", { id })).body.result).toMatchObject({ id, kind: "task", status: { state: "submitted" } });
    await store.setMessageStatus(id.slice(4), "approved");
    expect((await call("tasks/get", { id })).body.result).toMatchObject({ status: { state: "completed" } });
    expect((await call("tasks/get", { id: "msg-00000000-0000-4000-8000-00000000dead" })).body.error?.code).toBe(-32001);
  });

  it("supports the 1.0 method names", async () => {
    const { body } = await call("SendMessage", textMessage("Hi"));
    const task = (body.result as { task: { id: string; status: { state: string } } }).task;
    expect(task.status.state).toBe("TASK_STATE_SUBMITTED");
    expect(((await call("GetTask", { id: task.id })).body.result as { task: { status: { state: string } } }).task.status.state).toBe("TASK_STATE_SUBMITTED");
  });

  it("post_request with a Bearer agent key creates a pending request task", async () => {
    const agent = await registerTestAgent();
    const params = {
      message: {
        role: "user",
        messageId: "m-2",
        parts: [{ kind: "data", data: { skill: "post_request", request_type: "compute", title: "Need a GPU for 6 hours", description: "Batch embedding job, 24GB VRAM, container provided." } }],
      },
    };
    expect((await call("message/send", params)).body.error?.code).toBe(-32000);
    const { body } = await call("message/send", params, { authorization: `Bearer ${agent.api_key}` });
    expect(body.result).toMatchObject({ kind: "task", status: { state: "submitted" }, metadata: { kind: "request" } });
    expect(body.result!.id).toMatch(/^req-/);
    expect(store.requests.size).toBe(1);
  });

  it("keeps read-only search via data.skill", async () => {
    const { body } = await call("message/send", { message: { role: "user", messageId: "m-3", parts: [{ kind: "data", data: { skill: "search_requests", type: "compute" } }] } });
    expect((body.result as { message: { parts: unknown[] } }).message.parts.length).toBe(2);
    expect(store.messages.size).toBe(0);
  });

  it("rejects message/stream and rate-limits per IP hash", async () => {
    expect((await call("message/stream", textMessage("x"))).body.error?.code).toBe(-32004);
    const ip = "192.0.2.99";
    const statuses: number[] = [];
    for (let index = 0; index < 4; index += 1) statuses.push((await call("message/send", textMessage(`hello ${index}`), { "x-forwarded-for": ip })).status);
    expect(statuses).toEqual([200, 200, 200, 429]); // burst limit 3/minute per IP hash
  });

  it("rejects spam with an invalid-params error", async () => {
    const { body } = await call("message/send", textMessage("https://a.io https://b.io https://c.io https://d.io"));
    expect(body.error?.code).toBe(-32602);
    expect(store.messages.size).toBe(0);
  });
});

describe("agent card", () => {
  it("matches the A2A card shape and lists the V0.2 skills", async () => {
    const card = await agentCard().json();
    expect(card).toMatchObject({
      protocolVersion: "0.3.0",
      name: expect.any(String),
      description: expect.any(String),
      url: "https://www.agentarchitect.me/a2a",
      preferredTransport: "JSONRPC",
      capabilities: { streaming: false, pushNotifications: false },
      defaultInputModes: expect.arrayContaining(["text/plain"]),
      defaultOutputModes: expect.arrayContaining(["application/json"]),
      supportedInterfaces: [{ url: "https://www.agentarchitect.me/a2a", protocolBinding: "JSONRPC", protocolVersion: "1.0" }],
    });
    const ids = card.skills.map((skill: { id: string }) => skill.id);
    expect(ids).toEqual(expect.arrayContaining(["post_request", "leave_message", "search_requests"]));
    for (const skill of card.skills) expect(skill).toMatchObject({ id: expect.any(String), name: expect.any(String), description: expect.any(String), tags: expect.any(Array) });
    expect(JSON.stringify(card)).not.toContain("localhost");
  });

  it("agent.json stays consistent with the card", async () => {
    const manifest = await (await agentJson()).json();
    const card = await agentCard().json();
    expect(manifest.a2a).toMatchObject({ endpoint: card.url, protocolVersion: card.protocolVersion, preferredTransport: card.preferredTransport });
    expect(manifest.a2a.skills).toEqual(card.skills.map((skill: { id: string }) => skill.id));
    expect(manifest.entrypoints).toMatchObject({ mcp: "https://www.agentarchitect.me/mcp", skill: "https://www.agentarchitect.me/skill.md" });
  });
});
