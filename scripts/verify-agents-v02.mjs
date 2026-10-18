#!/usr/bin/env node
// Agent Network V0.2 — database checks for wild-agent onboarding.
//
// Applies every migration in supabase/migrations to PGlite (WASM Postgres) with a
// minimal stub of Supabase's auth schema and roles, then checks grants, RPCs,
// moderation visibility, claims and retention. Run: node scripts/verify-agents-v02.mjs

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const modulePath = process.env.PGLITE_MODULE;
const { PGlite } = modulePath ? await import(pathToFileURL(modulePath).href) : await import("@electric-sql/pglite");

const db = new PGlite();
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

async function as(role, uid, sql, params = []) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? ""]);
  if (role !== "postgres") await db.exec(`set role ${role}`);
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec("reset role");
  }
}

async function denied(name, role, sql, params = []) {
  try {
    await as(role, null, sql, params);
    check(name, false, "expected permission error, got success");
  } catch (error) {
    check(name, /permission denied/.test(String(error?.message ?? error)), String(error?.message ?? error));
  }
}

async function fails(name, fn, pattern) {
  try {
    await fn();
    check(name, false, "expected an error, got success");
  } catch (error) {
    check(name, pattern.test(String(error?.message ?? error)), String(error?.message ?? error));
  }
}

// --- Supabase stub (same as verify-network-rls.mjs) ---------------------------
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz, created_at timestamptz not null default now());
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`);

const HUMAN = "11111111-1111-4111-8111-111111111111";
const UNVERIFIED = "33333333-3333-4333-8333-333333333333";
await db.query(`insert into auth.users values ($1, 'op@example.com', now()), ($2, 'u@example.com', null)`, [HUMAN, UNVERIFIED]);

const migrationsDir = join(root, "supabase", "migrations");
const migrations = readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();
for (const file of migrations) await db.exec(readFileSync(join(migrationsDir, file), "utf8"));
for (const file of migrations.filter((name) => name >= "20261019")) await db.exec(readFileSync(join(migrationsDir, file), "utf8"));
check("all migrations apply; V0.2 re-runs cleanly", true);

const hex = (char) => char.repeat(64);

// --- No direct client access ------------------------------------------------------
for (const table of ["agents", "agent_claims", "messages", "rate_limits", "pow_used", "agent_visits"]) {
  await denied(`anon cannot read ${table}`, "anon", `select * from public.${table}`);
  await denied(`authenticated cannot read ${table}`, "authenticated", `select * from public.${table}`);
}
await denied("anon cannot insert agent_visits", "anon", `insert into public.agent_visits (path, method) values ('/', 'GET')`);
await denied("anon cannot insert messages", "anon", `insert into public.messages (to_kind, body, sender_kind) values ('operator', 'x', 'anonymous')`);
for (const fn of [
  "aa_rate_limit_hit('b', 'k', 60, 1)",
  "aa_pow_consume(repeat('a', 64), now())",
  `aa_register_agent('n', 'd', null, null, repeat('a', 64), 'aa_xxxxxxx', null, now(), null, 'rest')`,
  `aa_claim_agent(repeat('a', 64), '${HUMAN}')`,
  "aa_purge_old_rows()",
]) {
  await denied(`anon cannot execute ${fn.split("(")[0]}`, "anon", `select * from public.${fn}`);
  await denied(`authenticated cannot execute ${fn.split("(")[0]}`, "authenticated", `select * from public.${fn}`);
}

// --- Rate limit + PoW RPCs --------------------------------------------------------
const hits = [];
for (let index = 0; index < 3; index += 1) {
  const { rows } = await as("service_role", null, "select * from public.aa_rate_limit_hit('register_ip', $1, 86400, 2)", [hex("b")]);
  hits.push(rows[0]);
}
check("rate limit counts atomically", hits.map((row) => row.hits).join(",") === "1,2,3");
check("rate limit allows up to max, then refuses", hits.map((row) => row.allowed).join(",") === "true,true,false");
check("rate limit returns a future reset_at", new Date(hits[0].reset_at).getTime() > Date.now());

const first = await as("service_role", null, "select public.aa_pow_consume($1, now() + interval '10 minutes') as ok", [hex("c")]);
const second = await as("service_role", null, "select public.aa_pow_consume($1, now() + interval '10 minutes') as ok", [hex("c")]);
check("PoW challenge is single use", first.rows[0].ok === true && second.rows[0].ok === false);

// --- Registration + agent requests ----------------------------------------------
const reg = await as(
  "service_role",
  null,
  "select public.aa_register_agent('Atlas', 'Maps opening hours', 'https://example.com', null, $1, 'aa_ABCDEFG', $2, now() + interval '30 days', $3, 'rest') as id",
  [hex("d"), hex("e"), hex("f")],
);
const agentId = reg.rows[0].id;
check("aa_register_agent returns an id", Boolean(agentId));
const claimRow = await as("service_role", null, "select * from public.agent_claims where agent_id = $1", [agentId]);
check("claim token stored (hashed) with expiry", claimRow.rows.length === 1 && claimRow.rows[0].token_hash === hex("e"));
const regEvent = await as("postgres", null, "select count(*)::int as n from public.events where event_type = 'agent_self_registered'");
check("agent_self_registered event logged", regEvent.rows[0].n === 1);

await fails(
  "duplicate key hash rejected",
  () => as("service_role", null, "select public.aa_register_agent('Dup', 'x', null, null, $1, 'aa_ABCDEFG', null, now(), null, 'rest')", [hex("d")]),
  /duplicate key|unique/,
);
await fails(
  "http homepage rejected by CHECK",
  () => as("service_role", null, "select public.aa_register_agent('Bad', 'x', 'http://x.com', null, $1, 'aa_ABCDEFG', null, now(), null, 'rest')", [hex("9")]),
  /check constraint/,
);

const created = await as(
  "service_role",
  null,
  "select public.aa_create_agent_request($1, 'verification', 'Check whether a bakery is open', 'Visit or call the bakery and report opening hours.', 'Shanghai', 'physical') as id",
  [agentId],
);
const requestId = created.rows[0].id;
const base = await as("postgres", null, "select status, source, verified, agent_id, owner_user_id from public.requests where id = $1", [requestId]);
check("agent request stored as pending, source=agent, verified=false", base.rows[0].status === "pending" && base.rows[0].source === "agent" && base.rows[0].verified === false && base.rows[0].owner_user_id === null);

const hiddenView = await as("anon", null, "select * from public.public_requests where id = $1", [requestId]);
const hiddenSearch = await as("anon", null, "select * from public.search_requests(p_include_inactive => true, p_limit => 100)");
check("pending agent request hidden from public_requests", hiddenView.rows.length === 0);
check("pending agent request hidden from search_requests (even include_inactive)", !hiddenSearch.rows.some((row) => row.id === requestId));
const ownerView = await as("authenticated", HUMAN, "select * from public.requests where id = $1", [requestId]);
check("signed-in users cannot read agent base rows", ownerView.rows.length === 0);

await fails("report_request ignores pending rows", () => as("anon", null, "select public.report_request($1, 'spam')", [requestId]), /request_not_found/);
await fails("unlock_request_contact ignores pending rows", () => as("authenticated", HUMAN, "select * from public.unlock_request_contact($1)", [requestId]), /request_not_found/);
await as("anon", null, "select public.log_request_view($1)", [requestId]);
const pendingEvents = await as("postgres", null, "select count(*)::int as n from public.events where request_id = $1 and event_type in ('request_viewed', 'request_reported', 'contact_unlocked')", [requestId]);
check("no view/report/unlock events recorded on pending rows", pendingEvents.rows[0].n === 0);

await fails(
  "agent request cannot be marked verified",
  () => as("service_role", null, "update public.requests set verified = true where id = $1", [requestId]),
  /requests_agent_unverified/,
);

await as("service_role", null, "update public.requests set status = 'active' where id = $1", [requestId]);
const visible = await as("anon", null, "select * from public.public_requests where id = $1", [requestId]);
const row = visible.rows[0];
check("approved agent request is public", Boolean(row));
check("public row carries source/verified/agent name", row?.source === "agent" && row?.verified === false && row?.publisher_name === "Atlas" && row?.publisher_kind === "agent");
check("public row exposes publisher_agent_id but no key data", row?.publisher_agent_id === agentId && !("key_hash" in (row ?? {})));
const searchVisible = await as("anon", null, "select * from public.search_requests(p_q => 'bakery')");
check("search_requests returns the extended row type", searchVisible.rows.some((entry) => entry.id === requestId && entry.source === "agent"));

// Existing human rows default to source=human, verified=true.
const human = await as("anon", null, "select source, verified from public.public_requests where is_example limit 1");
check("existing rows default to source=human, verified=true", human.rows[0]?.source === "human" && human.rows[0]?.verified === true);

// --- Messages + public_messages -------------------------------------------------
await as(
  "service_role",
  null,
  `insert into public.messages (to_kind, request_id, body, sender_kind, flags, status, ip_hash)
   values ('request', $1, 'approved one', 'anonymous', '{}', 'approved', $2),
          ('request', $1, 'pending one', 'anonymous', '{prompt_injection:system_prompt}', 'pending', $2),
          ('operator', null, 'to operator', 'anonymous', '{}', 'approved', $2)`,
  [requestId, hex("a")],
);
const publicMessages = await as("anon", null, "select * from public.public_messages");
check("public_messages shows only approved request messages", publicMessages.rows.length === 1 && publicMessages.rows[0].body === "approved one");
check("public_messages hides ip_hash and contact", !("ip_hash" in publicMessages.rows[0]) && !("contact" in publicMessages.rows[0]));
await fails(
  "message target constraint (request needs request_id)",
  () => as("service_role", null, "insert into public.messages (to_kind, body, sender_kind) values ('request', 'x', 'anonymous')"),
  /messages_target/,
);
await fails(
  "message body cap 2000",
  () => as("service_role", null, "insert into public.messages (to_kind, body, sender_kind) values ('operator', repeat('x', 2001), 'anonymous')"),
  /check constraint/,
);

// --- Claim ---------------------------------------------------------------------------
await fails("unverified user cannot claim", () => as("service_role", null, "select public.aa_claim_agent($1, $2)", [hex("e"), UNVERIFIED]), /contact_not_verified/);
const claimed = await as("service_role", null, "select public.aa_claim_agent($1, $2) as id", [hex("e"), HUMAN]);
check("verified user claims the agent", claimed.rows[0].id === agentId);
const agentAfter = await as("service_role", null, "select status, claimed_by_user_id from public.agents where id = $1", [agentId]);
check("agent marked claimed and linked", agentAfter.rows[0].status === "claimed" && agentAfter.rows[0].claimed_by_user_id === HUMAN);
await fails("claim token is single use", () => as("service_role", null, "select public.aa_claim_agent($1, $2)", [hex("e"), HUMAN]), /claim_invalid_or_used/);
const claimedView = await as("anon", null, "select agent_claimed from public.public_requests where id = $1", [requestId]);
check("public row shows agent_claimed", claimedView.rows[0]?.agent_claimed === true);

// --- Human flow unchanged + new columns protected -------------------------------------
const identity = await as(
  "authenticated",
  HUMAN,
  "insert into public.identities (owner_user_id, kind, display_name) values ($1, 'agent', 'Human-run agent') returning id",
  [HUMAN],
);
const humanReq = await as(
  "authenticated",
  HUMAN,
  "select public.create_request($1, 'human_task', 'Photograph a storefront', 'Take three daytime photos of a storefront.') as id",
  [identity.rows[0].id],
);
const humanRow = await as("anon", null, "select source, verified, status from public.public_requests where id = $1", [humanReq.rows[0].id]);
check("human create_request still works (active, source=human)", humanRow.rows[0]?.status === "active" && humanRow.rows[0]?.source === "human");
await denied("owners cannot change source/verified", "authenticated", "update public.requests set source = 'agent' where id = $1", [humanReq.rows[0].id]);

// --- Visits + retention ----------------------------------------------------------------
await as(
  "service_role",
  null,
  `insert into public.agent_visits (ts, path, method, ip_hash, bot_name, is_known_ai_bot)
   values (now() - interval '91 days', '/old', 'GET', $1, 'GPTBot', true), (now(), '/new', 'GET', $1, null, false)`,
  [hex("a")],
);
await as("service_role", null, "insert into public.pow_used (challenge_hash, expires_at) values ($1, now() - interval '2 days')", [hex("7")]);
const purged = await as("service_role", null, "select * from public.aa_purge_old_rows()");
check("retention purges visits > 90 days and expired PoW", Number(purged.rows[0].visits_deleted) === 1 && Number(purged.rows[0].pow_deleted) === 1);
const left = await as("service_role", null, "select path from public.agent_visits");
check("recent visits kept", left.rows.length === 1 && left.rows[0].path === "/new");
await fails(
  "raw IPs cannot be stored as ip_hash",
  () => as("service_role", null, "insert into public.agent_visits (path, method, ip_hash) values ('/', 'GET', '203.0.113.9')"),
  /check constraint/,
);

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
