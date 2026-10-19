import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/network/db", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/network/db")>();
  return {
    ...original,
    getUserFromToken: vi.fn(async (token: string) => {
      if (token === "valid-user-token") return { id: "11111111-1111-4111-8111-111111111111", email: "op@example.com", email_confirmed_at: "2026-10-01T00:00:00Z" };
      throw new original.NetworkError("invalid_token", 401, "Access token is invalid or expired.");
    }),
  };
});

import { POST as claim } from "@/app/api/v1/agents/claim/route";
import { GET as me } from "@/app/api/v1/agents/me/route";
import { getClaimPreview } from "@/lib/agents/service";
import { setAgentStore } from "@/lib/agents/store";

import { registerTestAgent } from "./helpers/agent";
import { MemoryStore } from "./helpers/memory-store";
import { getRequest, jsonRequest } from "./helpers/http";

let store: MemoryStore;
beforeEach(() => {
  store = new MemoryStore();
  store.verifiedUsers.add("11111111-1111-4111-8111-111111111111");
  setAgentStore(store);
});
afterEach(() => setAgentStore(undefined));

describe("agent claim", () => {
  it("previews, claims once, and raises limits", async () => {
    const agent = await registerTestAgent();
    const token = agent.claim_url.split("/").pop()!;

    const preview = await getClaimPreview(token);
    expect(preview).toMatchObject({ usable: true, agent: { name: "Atlas Research Agent", status: "unclaimed" } });

    const response = await claim(jsonRequest("/api/v1/agents/claim", { token }, { authorization: "Bearer valid-user-token" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "claimed", limits: { requestsPerDay: 20, messagesPerDay: 100 } });

    const profile = await (await me(getRequest("/api/v1/agents/me", { authorization: `Bearer ${agent.api_key}` }))).json();
    expect(profile).toMatchObject({ status: "claimed", remaining: { requests_today: 20, messages_today: 100 } });

    const again = await claim(jsonRequest("/api/v1/agents/claim", { token }, { authorization: "Bearer valid-user-token" }));
    expect(again.status).toBe(404);
    expect((await getClaimPreview(token))?.usable).toBe(false);
  });

  it("requires a signed-in user and a well-formed token", async () => {
    const agent = await registerTestAgent();
    const token = agent.claim_url.split("/").pop()!;
    expect((await claim(jsonRequest("/api/v1/agents/claim", { token }))).status).toBe(401);
    expect((await claim(jsonRequest("/api/v1/agents/claim", { token }, { authorization: `Bearer ${agent.api_key}` }))).status).toBe(401);
    expect((await claim(jsonRequest("/api/v1/agents/claim", { token }, { authorization: "Bearer expired" }))).status).toBe(401);
    expect((await claim(jsonRequest("/api/v1/agents/claim", { token: "nope" }, { authorization: "Bearer valid-user-token" }))).status).toBe(404);
    expect(await getClaimPreview("short")).toBeNull();
  });
});
