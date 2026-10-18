import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { POST as createRequest } from "@/app/api/v1/requests/route";
import { setAgentStore } from "@/lib/agents/store";
import { toApiRequest, publisherLabel } from "@/lib/network/present";
import { exampleRequests } from "@/lib/network/examples";

import { registerTestAgent } from "./helpers/agent";
import { MemoryStore } from "./helpers/memory-store";
import { jsonRequest } from "./helpers/http";

let store: MemoryStore;
const requestBody = {
  request_type: "verification",
  title: "Check whether a bakery is still open",
  description: "Visit or call the bakery and report today's opening hours with a photo or call note.",
  location: "Shanghai",
  work_mode: "physical",
};

beforeEach(() => {
  store = new MemoryStore();
  setAgentStore(store);
});
afterEach(() => setAgentStore(undefined));

describe("POST /api/v1/requests with an agent key", () => {
  it("creates a pending, unverified agent request", async () => {
    const agent = await registerTestAgent();
    const response = await createRequest(jsonRequest("/api/v1/requests", requestBody, { authorization: `Bearer ${agent.api_key}` }));
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({ status: "pending", source: "agent", verified: false, label: "Unverified · posted by AI agent Atlas Research Agent" });
    const stored = store.requests.get(body.id)!;
    expect(stored).toMatchObject({ status: "pending", source: "agent", agent_id: agent.agent_id, title: requestBody.title });
  });

  it("rejects a bad key", async () => {
    const response = await createRequest(jsonRequest("/api/v1/requests", requestBody, { authorization: `Bearer aa_${"B".repeat(43)}` }));
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("invalid_api_key");
    const malformed = await createRequest(jsonRequest("/api/v1/requests", requestBody, { authorization: "Bearer aa_short" }));
    expect(malformed.status).toBe(401);
  });

  it("enforces the unclaimed daily quota (3/day)", async () => {
    const agent = await registerTestAgent();
    for (let index = 0; index < 3; index += 1) {
      expect((await createRequest(jsonRequest("/api/v1/requests", requestBody, { authorization: `Bearer ${agent.api_key}` }))).status).toBe(201);
    }
    const limited = await createRequest(jsonRequest("/api/v1/requests", requestBody, { authorization: `Bearer ${agent.api_key}` }));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
    expect(store.requests.size).toBe(3);
  });

  it("applies the same content validation as human posts", async () => {
    const agent = await registerTestAgent();
    const response = await createRequest(jsonRequest("/api/v1/requests", { ...requestBody, title: "short" }, { authorization: `Bearer ${agent.api_key}` }));
    expect(response.status).toBe(400);
    expect(store.requests.size).toBe(0);
  });

  it("leaves the human email flow untouched (JWT bearer still goes to Supabase auth)", async () => {
    const response = await createRequest(jsonRequest("/api/v1/requests", { ...requestBody, identity_id: exampleRequests[0].id }, { authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.e30.sig" }));
    // No Supabase config in tests: the V0.1 path reports the backend as not configured.
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe("network_not_configured");
    expect(store.requests.size).toBe(0);
  });

  it("requires some bearer token", async () => {
    expect((await createRequest(jsonRequest("/api/v1/requests", requestBody))).status).toBe(401);
  });
});

describe("agent request presentation", () => {
  it("labels agent posts as unverified in JSON and on the site", () => {
    const row = { ...exampleRequests[0], is_example: false, source: "agent" as const, verified: false, publisher_name: "Atlas", agent_claimed: false };
    expect(publisherLabel(row)).toBe("Unverified · posted by AI agent Atlas");
    const api = toApiRequest(row);
    expect(api).toMatchObject({ source: "agent", verified: false, label: "Unverified · posted by AI agent Atlas" });
    expect(api.contact).toMatchObject({ available: false, visibility: "none" });
    expect(publisherLabel({ ...row, is_anonymous: true })).toBe("Unverified · posted by an anonymous AI agent");
  });

  it("keeps human posts unchanged", () => {
    const api = toApiRequest(exampleRequests[0]);
    expect(api.source).toBe("human");
    expect(api.label).toBeNull();
    expect(api.contact).toMatchObject({ visibility: "registered_users_only" });
  });
});
