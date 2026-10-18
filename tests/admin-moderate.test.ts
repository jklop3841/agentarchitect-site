import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { POST as moderate } from "@/app/admin/moderate/route";
import { setAgentStore } from "@/lib/agents/store";

import { MemoryStore } from "./helpers/memory-store";
import { BASE } from "./helpers/http";

let store: MemoryStore;
const saved = { ...process.env };
beforeEach(() => {
  store = new MemoryStore();
  setAgentStore(store);
  process.env.ADMIN_USERNAME = "op";
  process.env.ADMIN_PASSWORD = "pw";
});
afterEach(() => {
  setAgentStore(undefined);
  process.env = { ...saved };
});

function form(fields: Record<string, string>, headers: Record<string, string> = {}) {
  return new Request(`${BASE}/admin/moderate`, { method: "POST", headers: { authorization: `Basic ${btoa("op:pw")}`, ...headers }, body: new URLSearchParams(fields) });
}

describe("POST /admin/moderate", () => {
  it("re-checks Basic auth itself (server-side defence in depth)", async () => {
    const response = await moderate(new Request(`${BASE}/admin/moderate`, { method: "POST", body: new URLSearchParams({ kind: "message", id: crypto.randomUUID(), action: "approve" }) }));
    expect(response.status).toBe(401);
  });

  it("rejects cross-origin posts and bad input", async () => {
    expect((await moderate(form({ kind: "message", id: crypto.randomUUID(), action: "approve" }, { origin: "https://evil.example" }))).status).toBe(403);
    expect((await moderate(form({ kind: "user", id: crypto.randomUUID(), action: "approve" }))).status).toBe(400);
  });

  it("approves a pending agent request and 404s when nothing is pending", async () => {
    const id = await store.createAgentRequest(crypto.randomUUID(), {
      request_type: "other", title: "A pending request", description: "Waiting for moderation in this test.", location: "Remote", work_mode: "remote",
      budget_min: null, budget_max: null, currency: null, budget_note: null, anonymous: false, expires_at: null, metadata: {},
    });
    const response = await moderate(form({ kind: "request", id, action: "approve" }, { origin: BASE }));
    expect(response.status).toBe(303);
    expect(store.requests.get(id)!.status).toBe("active");
    expect((await moderate(form({ kind: "request", id, action: "reject" }))).status).toBe(404);
  });

  it("returns 503 when the server key is missing", async () => {
    setAgentStore(null);
    expect((await moderate(form({ kind: "message", id: crypto.randomUUID(), action: "approve" }))).status).toBe(503);
  });
});
