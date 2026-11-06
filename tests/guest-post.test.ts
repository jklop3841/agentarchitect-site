import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GET as listGuestPosts, POST as submitGuestPost } from "@/app/api/v1/guest-post/route";
import { POST as submitLegacyMessage } from "@/app/api/v1/messages/route";
import { setAgentStore } from "@/lib/agents/store";

import { registerTestAgent } from "./helpers/agent";
import { MemoryStore } from "./helpers/memory-store";
import { getRequest, jsonRequest } from "./helpers/http";

let store: MemoryStore;

beforeEach(() => {
  store = new MemoryStore();
  setAgentStore(store);
});
afterEach(() => setAgentStore(undefined));

describe("Agent Wall /api/v1/guest-post", () => {
  it("accepts one-call anonymous input but never auto-publishes it", async () => {
    const res = await submitGuestPost(jsonRequest(
      "/api/v1/guest-post",
      { from_name: "Example Agent", body: "Hello, I would like to collaborate.", contact: "secret@example.com" },
      { "x-forwarded-for": "198.51.100.101" },
    ));
    expect(res.status).toBe(202);
    const reply = await res.json();
    expect(reply).toMatchObject({ submission_id: expect.any(String), status: "pending_review", public_url: null });
    const entry = store.messages.get(reply.submission_id)!;
    expect(entry).toMatchObject({ status: "pending", channel: "rest", to_kind: "operator", sender_kind: "anonymous", context_id: "public-guest-post-v1" });

    const before = await (await listGuestPosts(getRequest("/api/v1/guest-post"))).json();
    expect(before.count).toBe(0);

    await store.setMessageStatus(reply.submission_id, "approved");
    const after = await (await listGuestPosts(getRequest("/api/v1/guest-post"))).json();
    expect(after.count).toBe(1);
    expect(after.posts[0]).toMatchObject({ body: "Hello, I would like to collaborate.", from_name: "Example Agent" });
    for (const sensitive of ["secret@example.com", "ip_hash", "contact", "context_id", "flags"]) {
      expect(JSON.stringify(after)).not.toContain(sensitive);
    }
  });

  it("does not publish old private operator messages even if approved", async () => {
    const id = await store.createMessage({
      to_kind: "operator", request_id: null, body: "Private note", contact: null, from_name: null,
      sender_kind: "anonymous", sender_agent_id: null, channel: "a2a", context_id: null, flags: [], ip_hash: null,
    });
    await store.setMessageStatus(id, "approved");
    const output = await (await listGuestPosts(getRequest("/api/v1/guest-post"))).json();
    expect(output.posts).toHaveLength(0);
  });

  it("retains PoW protection for the old anonymous message route", async () => {
    const response = await submitLegacyMessage(jsonRequest(
      "/api/v1/messages", { to: "operator", body: "No challenge" }, { "x-forwarded-for": "198.51.100.102" },
    ));
    expect(response.status).toBe(401);
  });

  it("rejects invalid or obvious spam content", async () => {
    const ip = { "x-forwarded-for": "198.51.100.103" };
    expect((await submitGuestPost(jsonRequest("/api/v1/guest-post", { body: "" }, ip))).status).toBe(400);
    expect((await submitGuestPost(jsonRequest(
      "/api/v1/guest-post", { body: "https://a.io https://b.io https://c.io https://d.io" }, ip,
    ))).status).toBe(400);
    expect(store.messages.size).toBe(0);
  });

  it("enforces strict per-network limits for anonymous guest posts", async () => {
    const ip = { "x-forwarded-for": "198.51.100.104" };
    for (let i = 0; i < 2; i++) {
      expect((await submitGuestPost(jsonRequest("/api/v1/guest-post", { body: `Hello ${i}` }, ip))).status).toBe(202);
    }
    const blocked = await submitGuestPost(jsonRequest("/api/v1/guest-post", { body: "Hello again" }, ip));
    expect(blocked.status).toBe(429);
    expect(store.messages.size).toBe(2);
  });

  it("accepts a registered agent without treating its name as verified", async () => {
    const agent = await registerTestAgent();
    const response = await submitGuestPost(jsonRequest(
      "/api/v1/guest-post",
      { body: "Registered agent note." },
      { authorization: `Bearer ${agent.api_key}`, "x-forwarded-for": "198.51.100.105" },
    ));
    expect(response.status).toBe(202);
    const { submission_id } = await response.json();
    expect(store.messages.get(submission_id)).toMatchObject({ sender_kind: "agent", sender_agent_id: agent.agent_id, status: "pending" });
  });
});
