#!/usr/bin/env node
// Unit tests for the Supabase Send Email Hook (signature verify + Resend->Brevo failover).
// No network, no real keys: fetch is mocked. Run: node scripts/test-send-email-hook.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/email/send-email-hook.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const file = join(mkdtempSync(join(tmpdir(), "seh-")), "send-email-hook.mjs");
writeFileSync(file, outputText);
const hook = await import(file);

const secret = `v1,whsec_${Buffer.from("test-secret-0123456789abcdef").toString("base64")}`;
const env = {
  SEND_EMAIL_HOOK_SECRET: secret,
  SUPABASE_URL: "https://example.supabase.co",
  RESEND_API_KEY: "re_test",
  BREVO_API_KEY: "xkeysib_test",
};
const now = 1_760_000_000;
const payload = {
  user: { id: "u1", email: "agent@example.com" },
  email_data: {
    token: "123456",
    token_hash: "hash_abcdef0123456789",
    redirect_to: "https://www.agentarchitect.me/auth/callback?next=/post",
    email_action_type: "magiclink",
    site_url: "https://www.agentarchitect.me",
    token_new: "",
    token_hash_new: "",
  },
};

async function signedRequest(body, { ts = now, tamper = false } = {}) {
  const sig = await hook.signWebhook(secret, "msg_1", ts, body);
  return new Request("https://x/api/auth/send-email-hook", {
    method: "POST",
    headers: { "webhook-id": "msg_1", "webhook-timestamp": String(ts), "webhook-signature": tamper ? "v1,AAAA" : sig },
    body,
  });
}

function mockFetch(script) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    const step = script(url, calls.length);
    if (step === "timeout") {
      return new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }))));
    }
    return new Response("{}", { status: step });
  };
  return { fn, calls };
}

const quiet = { log: () => {} };

test("signature verifies and matches standard-webhooks format", async () => {
  const body = JSON.stringify(payload);
  const sig = await hook.signWebhook(secret, "msg_1", now, body);
  assert.match(sig, /^v1,[A-Za-z0-9+/=]+$/);
  const headers = new Headers({ "webhook-id": "msg_1", "webhook-timestamp": String(now), "webhook-signature": `v1,bogus ${sig}` });
  const parsed = await hook.verifyWebhook(secret, headers, body, now);
  assert.equal(parsed.user.email, "agent@example.com");
});

test("bad signature, stale timestamp, missing headers rejected with 401", async () => {
  const body = JSON.stringify(payload);
  const { fn, calls } = mockFetch(() => 200);
  for (const req of [await signedRequest(body, { tamper: true }), await signedRequest(body, { ts: now - 3600 }), new Request("https://x", { method: "POST", body })]) {
    const res = await hook.handleSendEmailHook(req, { env, fetchImpl: fn, nowSeconds: now, ...quiet });
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error.http_code, 401);
  }
  assert.equal(calls.length, 0);
});

test("tampered body rejected", async () => {
  const body = JSON.stringify(payload);
  const sig = await hook.signWebhook(secret, "msg_1", now, body);
  const headers = new Headers({ "webhook-id": "msg_1", "webhook-timestamp": String(now), "webhook-signature": sig });
  await assert.rejects(hook.verifyWebhook(secret, headers, body.replace("agent@", "evil@"), now), /Invalid webhook signature/);
});

test("Resend success: 200 {}, single call, correct sender, link and code", async () => {
  const { fn, calls } = mockFetch(() => 200);
  const logs = [];
  const res = await hook.handleSendEmailHook(await signedRequest(JSON.stringify(payload)), { env, fetchImpl: fn, nowSeconds: now, log: (l) => logs.push(l) });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {});
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.equal(calls[0].body.from, "AgentArchitect <noreply@agentarchitect.me>");
  assert.deepEqual(calls[0].body.to, ["agent@example.com"]);
  const link = new URL(calls[0].body.text.match(/https:\/\/example\.supabase\.co\/auth\/v1\/verify\S+/)[0]);
  assert.equal(link.searchParams.get("token"), "hash_abcdef0123456789");
  assert.equal(link.searchParams.get("type"), "magiclink");
  assert.equal(link.searchParams.get("redirect_to"), payload.email_data.redirect_to);
  assert.match(calls[0].body.text, /123456/);
  assert.match(calls[0].body.html, /Jack Lu \/ Lu Cheng/);
  assert.ok(logs.some((l) => /via resend/.test(l)));
  assert.ok(logs.every((l) => !/agent@example|123456|hash_abc|re_test/.test(l)), "logs leak nothing sensitive");
});

for (const failure of [500, 429, 401, "timeout"]) {
  test(`Resend ${failure} -> falls back to Brevo`, async () => {
    const { fn, calls } = mockFetch((url) => (url.includes("resend") ? failure : 201));
    const logs = [];
    const res = await hook.handleSendEmailHook(await signedRequest(JSON.stringify(payload)), { env, fetchImpl: fn, nowSeconds: now, timeoutMs: 50, log: (l) => logs.push(l) });
    assert.equal(res.status, 200);
    assert.equal(calls.length, 2);
    assert.equal(calls[1].url, "https://api.brevo.com/v3/smtp/email");
    assert.equal(calls[1].init.headers["api-key"], "xkeysib_test");
    assert.deepEqual(calls[1].body.sender, { name: "AgentArchitect", address: "noreply@agentarchitect.me" });
    assert.deepEqual(calls[1].body.to, [{ email: "agent@example.com" }]);
    assert.ok(logs.some((l) => /via brevo/.test(l)));
  });
}

test("missing Resend key falls back to Brevo without calling Resend", async () => {
  const { fn, calls } = mockFetch(() => 201);
  const res = await hook.handleSendEmailHook(await signedRequest(JSON.stringify(payload)), { env: { ...env, RESEND_API_KEY: undefined }, fetchImpl: fn, nowSeconds: now, ...quiet });
  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /brevo/);
});

test("both providers fail -> 502 Supabase-style error", async () => {
  const { fn } = mockFetch(() => 503);
  const res = await hook.handleSendEmailHook(await signedRequest(JSON.stringify(payload)), { env, fetchImpl: fn, nowSeconds: now, ...quiet });
  assert.equal(res.status, 502);
  const body = await res.json();
  assert.equal(body.error.http_code, 502);
  assert.ok(body.error.message);
});

test("EMAIL_PRIMARY=brevo swaps order", async () => {
  const { fn, calls } = mockFetch(() => 200);
  await hook.handleSendEmailHook(await signedRequest(JSON.stringify(payload)), { env: { ...env, EMAIL_PRIMARY: "brevo" }, fetchImpl: fn, nowSeconds: now, ...quiet });
  assert.match(calls[0].url, /brevo/);
});

test("secure email_change sends two emails with reversed hash mapping", () => {
  const p = {
    user: { email: "old@example.com", new_email: "new@example.com" },
    email_data: { ...payload.email_data, email_action_type: "email_change", token: "111111", token_hash: "hash_for_new", token_new: "222222", token_hash_new: "hash_for_current" },
  };
  const emails = hook.buildEmails(p, "https://example.supabase.co");
  assert.equal(emails.length, 2);
  assert.equal(emails[0].to, "old@example.com");
  assert.match(emails[0].text, /token=hash_for_current/);
  assert.match(emails[0].text, /111111/);
  assert.equal(emails[1].to, "new@example.com");
  assert.match(emails[1].text, /token=hash_for_new/);
  assert.match(emails[1].text, /222222/);
});

test("every action type renders subject, EN + ZH copy", () => {
  for (const type of ["signup", "magiclink", "recovery", "invite", "email_change", "reauthentication"]) {
    const [email] = hook.buildEmails({ user: { email: "a@example.com", new_email: "b@example.com" }, email_data: { ...payload.email_data, email_action_type: type } }, "https://example.supabase.co");
    assert.ok(email.subject.includes("AgentArchitect"), type);
    assert.match(email.text, /[\u4e00-\u9fff]/, type);
    if (type === "reauthentication") assert.doesNotMatch(email.text, /verify\?token=/);
  }
});
