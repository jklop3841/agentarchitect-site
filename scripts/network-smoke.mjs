#!/usr/bin/env node
// Agent Network V0.1 HTTP smoke test. Read-only except for requests that must be
// rejected (unauthenticated writes). Never creates data.
//
//   node scripts/network-smoke.mjs http://localhost:3000
//   node scripts/network-smoke.mjs https://www.agentarchitect.me

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");
const exampleId = "00000000-0000-4000-8000-000000000001";
let failures = 0;
let passes = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passes += 1;
    console.log(`PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function get(path, init = {}) {
  const response = await fetch(`${base}${path}`, { redirect: "manual", ...init });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: response.status, headers: response.headers, text, json };
}

function post(path, body, headers = {}) {
  return get(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

// Human-facing pages
const home = await get("/");
check("homepage 200", home.status === 200, `status=${home.status}`);
check("homepage explains agent requests", /What do agents need from the real world\?/.test(home.text));
check("homepage lists LATEST REQUESTS", /Latest requests/i.test(home.text));
check("homepage states off-platform settlement", /Payment and settlement happen off-platform/.test(home.text));
check("homepage has viewport meta (mobile)", /<meta name="viewport"[^>]*width=device-width/.test(home.text));

const feed = await get("/api/v1/requests");
check("feed JSON 200", feed.status === 200 && Array.isArray(feed.json?.requests), `status=${feed.status}`);
const requests = feed.json?.requests ?? [];
console.log(`      feed source=${feed.json?.source} count=${requests.length}`);
check("feed not empty", requests.length > 0);
const sorted = requests.every((entry, index) => index === 0 || requests[index - 1].created_at >= entry.created_at);
check("feed sorted created_at DESC", sorted);
check("feed never leaks contact emails", !/contact_email|"email"\s*:/.test(feed.text));
check("examples are labelled", requests.filter((entry) => entry.is_example).every((entry) => /^Example/.test(entry.title)));

const computeFeed = await get("/api/v1/requests?tab=compute");
check("type filter works", (computeFeed.json?.requests ?? []).every((entry) => entry.request_type === "compute"));
const tokyo = await get("/api/v1/requests?location=tokyo");
check("location filter works", (tokyo.json?.requests ?? []).every((entry) => /tokyo/i.test(entry.location)));

const detailId = requests.find((entry) => !entry.is_example)?.id ?? exampleId;
const detail = await get(`/requests/${detailId}`);
check("request detail page 200", detail.status === 200, `status=${detail.status}`);
check("request detail has View contact or example notice", /View contact|example request/i.test(detail.text));
check("request detail has JSON-LD", /application\/ld\+json/.test(detail.text));
const detailJson = await get(`/api/v1/requests/${detailId}`);
check("request detail JSON 200", detailJson.status === 200 && detailJson.json?.request?.id === detailId);
const missing = await get("/requests/not-a-uuid");
check("bad request id → 404", missing.status === 404, `status=${missing.status}`);

for (const path of ["/requests", "/post", "/login", "/account", "/realityport", "/network"]) {
  const page = await get(path);
  check(`${path} 200`, page.status === 200, `status=${page.status}`);
}
const legacyNew = await get("/requests/new");
check("/requests/new redirects to /post", [301, 307, 308].includes(legacyNew.status) && /\/post$/.test(legacyNew.headers.get("location") ?? ""));

// Write boundaries (must all be rejected without valid auth)
const unauthCreate = await post("/api/v1/requests", { title: "x" });
check("create without auth → 401", unauthCreate.status === 401, `status=${unauthCreate.status}`);
const unauthUnlock = await post(`/api/v1/requests/${detailId}/contact`, {});
check("contact without auth → 401", unauthUnlock.status === 401, `status=${unauthUnlock.status}`);
const badToken = await post(`/api/v1/requests/${detailId}/contact`, {}, { Authorization: "Bearer not-a-real-token" });
check("contact with forged token rejected", [401, 503].includes(badToken.status), `status=${badToken.status}`);
check("forged token response leaks no contact", !/@/.test(JSON.stringify(badToken.json?.contact ?? "")));
const big = await post("/api/v1/requests", JSON.stringify({ description: "x".repeat(30_000) }), { Authorization: "Bearer x" });
check("oversized body → 413", big.status === 413, `status=${big.status}`);
const wrongType = await get("/api/v1/requests", { method: "POST", headers: { "Content-Type": "text/plain", Authorization: "Bearer x" }, body: "hi" });
check("non-JSON body → 415", wrongType.status === 415, `status=${wrongType.status}`);
const unauthMe = await get("/api/v1/me");
check("/api/v1/me without auth → 401", unauthMe.status === 401);
const patch = await get(`/api/v1/requests/${detailId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" });
check("PATCH without auth → 401", patch.status === 401, `status=${patch.status}`);

// Machine endpoints
const agentsTxt = await get("/agents.txt");
check("agents.txt mentions Agent Network API", agentsTxt.status === 200 && /agent-network-api-list/.test(agentsTxt.text));
const llms = await get("/llms.txt");
check("llms.txt has Agent Network section", llms.status === 200 && /## Agent Network/.test(llms.text));
const manifest = await get("/.well-known/agent.json");
check("agent.json has agentNetwork + provenance", Boolean(manifest.json?.agentNetwork?.api && manifest.json?.provenance?.motherBrand === "AgentArchitect"));
const card = await get("/.well-known/agent-card.json");
check("agent-card.json has skills", Array.isArray(card.json?.skills) && card.json.skills.some((skill) => skill.id === "search-requests"));
const contactManifest = await get("/.well-known/agent-contact.json");
check("agent-contact.json served", contactManifest.status === 200 && Boolean(contactManifest.json?.autonomousAgentContact));
const openapi = await get("/openapi.json");
check("openapi has network paths", Boolean(openapi.json?.paths?.["/api/v1/requests"]?.post && openapi.json?.paths?.["/api/v1/requests/{id}/contact"]));
const a2aGet = await get("/a2a");
check("a2a GET describes endpoint", a2aGet.status === 200 && a2aGet.json?.protocol === "A2A JSON-RPC");
const a2a = await post(
  "/a2a",
  { jsonrpc: "2.0", id: 7, method: "SendMessage", params: { message: { role: "ROLE_USER", parts: [{ text: "latest compute requests" }] } } },
  { "A2A-Version": "1.0" },
);
const a2aText = a2a.json?.result?.message?.parts?.[0]?.text ?? "";
check("a2a SendMessage returns requests", a2a.status === 200 && /Agent Network/.test(a2aText), a2aText.slice(0, 120));
const a2aPost = await post("/a2a", { jsonrpc: "2.0", id: 8, method: "SendMessage", params: { message: { parts: [{ text: "how do I post a request?" }] } } });
check("a2a how-to-post skill", /api\/v1\/auth\/otp/.test(a2aPost.json?.result?.message?.parts?.[0]?.text ?? ""));
const status = await get("/api/v1/status");
check("status endpoint", status.status === 200 && typeof status.json?.database === "string");
console.log(`      network database=${status.json?.database}`);

const robots = await get("/robots.txt");
check("robots.txt advertises sitemap", /Sitemap:/i.test(robots.text) && /Disallow: \/account/.test(robots.text));
const sitemap = await get("/sitemap.xml");
check("sitemap lists /requests and /realityport", /\/requests</.test(sitemap.text) && /\/realityport</.test(sitemap.text));

for (const [name, response] of [
  ["agents.txt", agentsTxt],
  ["llms.txt", llms],
  ["agent.json", manifest],
  ["agent-card.json", card],
  ["openapi.json", openapi],
  ["sitemap.xml", sitemap],
]) {
  check(`${name} has no localhost`, !/localhost/i.test(response.text));
}

// The browser must never receive server secrets.
const scripts = [...home.text.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]).filter((src) => src.startsWith("/_next/"));
let leaked = false;
for (const src of scripts) {
  const chunk = await get(src);
  if (/service_role|SUPABASE_SERVICE_ROLE_KEY|sb_secret_/.test(chunk.text)) leaked = true;
}
check(`no service-role material in ${scripts.length} client chunks`, scripts.length > 0 && !leaked);
check("homepage HTML has no service-role material", !/service_role|SUPABASE_SERVICE_ROLE_KEY|sb_secret_/.test(home.text));

console.log(`\n${passes} passed, ${failures} failed (${base})`);
process.exit(failures ? 1 : 0);
