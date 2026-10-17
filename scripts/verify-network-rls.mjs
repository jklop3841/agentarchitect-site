#!/usr/bin/env node
// Agent Network V0.1 — database permission verification.
//
// Runs the real migration inside PGlite (WASM Postgres) with a minimal stub of the
// Supabase `auth` schema and roles, then checks the security boundaries from
// TASK §28 by switching roles (anon / authenticated users).
//
// PGlite is intentionally NOT a project dependency. Install it anywhere and point
// PGLITE_MODULE at its entry file:
//   mkdir -p /tmp/pglite && (cd /tmp/pglite && npm i @electric-sql/pglite@0.3)
//   PGLITE_MODULE=/tmp/pglite/node_modules/@electric-sql/pglite/dist/index.js \
//     node scripts/verify-network-rls.mjs

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const modulePath = process.env.PGLITE_MODULE;
if (!modulePath) {
  console.error("Set PGLITE_MODULE to the @electric-sql/pglite entry file (see header).");
  process.exit(2);
}
const { PGlite } = await import(pathToFileURL(modulePath).href);

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

async function expectError(name, fn, pattern) {
  try {
    await fn();
    check(name, false, "expected an error, got success");
  } catch (error) {
    const message = String(error?.message ?? error);
    check(name, pattern.test(message), `unexpected error: ${message}`);
  }
}

// --- Supabase stub -----------------------------------------------------------
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`);

const A = "11111111-1111-4111-8111-111111111111"; // verified agent operator
const B = "22222222-2222-4222-8222-222222222222"; // verified human
const C = "33333333-3333-4333-8333-333333333333"; // unconfirmed email
const D = "44444444-4444-4444-8444-444444444444"; // reporter
const E = "55555555-5555-4555-8555-555555555555"; // reporter
await db.query(
  `insert into auth.users values
    ($1, 'agent-a@example.com', now()), ($2, 'human-b@example.com', now()),
    ($3, 'unverified-c@example.com', null), ($4, 'd@example.com', now()), ($5, 'e@example.com', now())`,
  [A, B, C, D, E],
);

// --- Apply migrations (twice: must be idempotent) ---------------------------
const migrationsDir = join(root, "supabase", "migrations");
const migrations = readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();
for (let pass = 1; pass <= 2; pass += 1) {
  for (const file of migrations) {
    await db.exec(readFileSync(join(migrationsDir, file), "utf8"));
  }
}
check("migrations apply twice (idempotent)", true);

// --- Unauthenticated --------------------------------------------------------
const anonFeed = await as("anon", null, "select * from public.public_requests");
check("anon can read public requests", anonFeed.rows.length === 5, `rows=${anonFeed.rows.length}`);
check(
  "public view exposes no contact/owner columns",
  !anonFeed.fields.some((f) => /email|owner|contact_note/.test(f.name)),
  anonFeed.fields.map((f) => f.name).join(","),
);
await expectError("anon cannot read base requests", () => as("anon", null, "select * from public.requests"), /permission denied/);
await expectError("anon cannot read request_contacts", () => as("anon", null, "select * from public.request_contacts"), /permission denied/);
await expectError("anon cannot read events", () => as("anon", null, "select * from public.events"), /permission denied/);
await expectError("anon cannot read reports", () => as("anon", null, "select * from public.reports"), /permission denied/);
await expectError(
  "anon cannot create requests",
  () => as("anon", null, "select public.create_request(null, 'compute', 'Anon spam title', 'anon spam description long enough')"),
  /permission denied/,
);
await expectError(
  "anon cannot unlock contacts",
  () => as("anon", null, "select * from public.unlock_request_contact('00000000-0000-4000-8000-000000000001')"),
  /permission denied/,
);
await expectError(
  "anon cannot insert into requests directly",
  () => as("anon", null, "insert into public.requests (request_type, title, description, is_example) values ('compute','Direct insert x','direct insert description long', true)"),
  /permission denied/,
);

// --- Agent identity + publishing --------------------------------------------
const agentIdentity = await as(
  "authenticated",
  A,
  "insert into public.identities (owner_user_id, kind, display_name, verified, anonymous_allowed) values ($1, 'agent', 'Atlas Research Agent', true, true) returning id, verified",
  [A],
);
const agentIdentityId = agentIdentity.rows[0].id;
check("agent cannot self-set verified badge", agentIdentity.rows[0].verified === false);
await expectError(
  "user cannot create identity for someone else",
  () => as("authenticated", B, "insert into public.identities (owner_user_id, kind, display_name) values ($1, 'agent', 'Impostor')", [A]),
  /row-level security/,
);
const humanIdentity = await as(
  "authenticated",
  B,
  "insert into public.identities (owner_user_id, kind, display_name) values ($1, 'human', 'Human B') returning id",
  [B],
);
const humanIdentityId = humanIdentity.rows[0].id;

const createSql =
  "select public.create_request($1, $2, $3, $4, $5, $6, null, null, null, null, $7) as id";
const named = await as("authenticated", A, createSql, [
  agentIdentityId, "human_task", "Need photos of a Paris bakery", "Please photograph the storefront and the menu board today.", "Paris", "physical", false,
]);
const namedId = named.rows[0].id;
const anonymousReq = await as("authenticated", A, createSql, [
  agentIdentityId, "compute", "Need GPU for two hours", "Looking for a single GPU for a short evaluation run.", "Online", "online", true,
]);
const anonymousId = anonymousReq.rows[0].id;
check("verified agent can create requests", Boolean(namedId && anonymousId));

const publicNamed = await as("anon", null, "select * from public.public_requests where id = $1", [namedId]);
check("named request shows publisher name", publicNamed.rows[0]?.publisher_name === "Atlas Research Agent");
check("request marked contact_verified", publicNamed.rows[0]?.contact_verified === true);
const publicAnon = await as("anon", null, "select * from public.public_requests where id = $1", [anonymousId]);
check(
  "anonymous request hides publisher identity publicly",
  publicAnon.rows[0] && publicAnon.rows[0].publisher_name === null && publicAnon.rows[0].publisher_identity_id === null,
);
const backendAnon = await as("postgres", null, "select r.owner_user_id, rc.contact_email, r.contact_verified_at from public.requests r join public.request_contacts rc on rc.request_id = r.id where r.id = $1", [anonymousId]);
check(
  "backend still knows anonymous owner + verified contact",
  backendAnon.rows[0]?.owner_user_id === A && backendAnon.rows[0]?.contact_email === "agent-a@example.com" && backendAnon.rows[0]?.contact_verified_at,
);

await expectError(
  "unconfirmed email cannot publish",
  async () => {
    const identity = await as("authenticated", C, "insert into public.identities (owner_user_id, kind, display_name) values ($1, 'agent', 'Unverified C') returning id", [C]);
    await as("authenticated", C, createSql, [identity.rows[0].id, "compute", "Unverified request x", "Unverified request description long", "Online", "online", false]);
  },
  /contact_not_verified/,
);
await expectError(
  "human identity cannot publish",
  () => as("authenticated", B, createSql, [humanIdentityId, "compute", "Human posting test", "Human posting description long enough", "Online", "online", false]),
  /identity_kind_cannot_publish/,
);
await expectError(
  "cannot publish with someone else's identity",
  () => as("authenticated", B, createSql, [agentIdentityId, "compute", "Stolen identity post", "Stolen identity description long enough", "Online", "online", false]),
  /identity_not_owned/,
);
await expectError(
  "input validation enforced (short title)",
  () => as("authenticated", A, createSql, [agentIdentityId, "compute", "short", "Description that is long enough here", "Online", "online", false]),
  /check constraint/,
);
await expectError(
  "input validation enforced (unknown type)",
  () => as("authenticated", A, createSql, [agentIdentityId, "crypto_trade", "Valid title here", "Description that is long enough here", "Online", "online", false]),
  /check constraint/,
);

// --- Other users cannot modify / read private data ---------------------------
const bContacts = await as("authenticated", B, "select * from public.request_contacts");
check("other user cannot read private contacts", bContacts.rows.length === 0);
const bUpdate = await as("authenticated", B, "update public.requests set title = 'Hijacked title!!' where id = $1", [namedId]);
check("other user cannot update someone else's request", (bUpdate.affectedRows ?? 0) === 0);
const bRequests = await as("authenticated", B, "select * from public.requests");
check("other user cannot read someone else's base rows", bRequests.rows.length === 0);
const bIdentities = await as("authenticated", B, "select * from public.identities where owner_user_id = $1", [A]);
check("other user cannot read someone else's identities", bIdentities.rows.length === 0);

// --- Owner edits --------------------------------------------------------------
const aUpdate = await as("authenticated", A, "update public.requests set title = 'Need photos of a Paris bakery today', status = 'closed' where id = $1", [namedId]);
check("owner can update own request", aUpdate.affectedRows === 1);
await as("authenticated", A, "update public.requests set status = 'active' where id = $1", [namedId]);
await expectError(
  "owner cannot set status=removed",
  () => as("authenticated", A, "update public.requests set status = 'removed' where id = $1", [namedId]),
  /invalid_status_transition/,
);
await expectError(
  "owner cannot change owner_user_id",
  () => as("authenticated", A, "update public.requests set owner_user_id = $2 where id = $1", [namedId, B]),
  /permission denied/,
);
await expectError(
  "owner cannot flip is_example",
  () => as("authenticated", A, "update public.requests set is_example = true where id = $1", [namedId]),
  /permission denied/,
);
const aContacts = await as("authenticated", A, "select * from public.request_contacts");
check("owner can read own request contacts", aContacts.rows.length === 2);

// --- Contact unlock -------------------------------------------------------------
const unlock = await as("authenticated", B, "select * from public.unlock_request_contact($1)", [namedId]);
check("logged-in human can unlock contact", unlock.rows[0]?.contact_email === "agent-a@example.com" && unlock.rows[0]?.first_unlock === true);
const unlockAgain = await as("authenticated", B, "select * from public.unlock_request_contact($1)", [namedId]);
check("repeat unlock is idempotent", unlockAgain.rows[0]?.first_unlock === false);
const unlockRows = await as("postgres", null, "select viewer_id, request_id, created_at from public.contact_unlocks where request_id = $1", [namedId]);
check("contact unlock recorded (viewer, request, timestamp)", unlockRows.rows.length === 1 && unlockRows.rows[0].viewer_id === B && unlockRows.rows[0].created_at);
const unlockEvents = await as("postgres", null, "select count(*)::int as n from public.events where event_type = 'contact_unlocked' and request_id = $1", [namedId]);
check("contact_unlocked events logged", unlockEvents.rows[0].n === 2);
const afterUnlockContacts = await as("authenticated", B, "select * from public.request_contacts");
check("unlock does not grant table-wide contact access", afterUnlockContacts.rows.length === 0);
await expectError(
  "example requests have no contact",
  () => as("authenticated", B, "select * from public.unlock_request_contact('00000000-0000-4000-8000-000000000001')"),
  /example_request_has_no_contact/,
);
const unlockCount = await as("anon", null, "select unlock_count from public.public_requests where id = $1", [namedId]);
check("public unlock_count reflects unlocks", unlockCount.rows[0]?.unlock_count === 1);

// --- Events from identity registration ----------------------------------------
const regEvents = await as("postgres", null, "select event_type, count(*)::int as n from public.events where event_type in ('agent_registered','human_registered','request_created') group by 1 order by 1");
const regMap = Object.fromEntries(regEvents.rows.map((row) => [row.event_type, row.n]));
check("registration + creation events logged", regMap.agent_registered >= 1 && regMap.human_registered === 1 && regMap.request_created === 2, JSON.stringify(regMap));

// --- Rate limit -------------------------------------------------------------------
await as("authenticated", A, createSql, [agentIdentityId, "service", "Third request this hour", "Third request description long enough", "Remote", "remote", false]);
await expectError(
  "per-user posting rate limit (3/hour)",
  () => as("authenticated", A, createSql, [agentIdentityId, "service", "Fourth request this hour", "Fourth request description long enough", "Remote", "remote", false]),
  /rate_limited/,
);

// --- Search -----------------------------------------------------------------------
const compute = await as("anon", null, "select id from public.search_requests('compute')");
check("search by type", compute.rows.length === 2, `rows=${compute.rows.length}`);
const tokyo = await as("anon", null, "select id from public.search_requests(null, null, 'tokyo')");
check("search by location (case-insensitive)", tokyo.rows.length === 1);
const remote = await as("anon", null, "select id from public.search_requests(null, 'remote')");
check("search remote filter", remote.rows.every(Boolean) && remote.rows.length >= 3);
const wildcard = await as("anon", null, "select id from public.search_requests(null, null, null, '%')");
check("search escapes LIKE wildcards", wildcard.rows.length === 0);
const order = await as("anon", null, "select created_at from public.search_requests()");
const sorted = order.rows.every((row, index, rows) => index === 0 || rows[index - 1].created_at >= row.created_at);
check("feed ordered created_at DESC", sorted);

// --- Reports / auto-hide --------------------------------------------------------
await as("anon", null, "select public.report_request($1, 'spam', 'anon report')", [anonymousId]);
for (const reporter of [B, D, E]) {
  await as("authenticated", reporter, "select public.report_request($1, 'spam', null)", [anonymousId]);
}
const hidden = await as("anon", null, "select * from public.public_requests where id = $1", [anonymousId]);
check("3 distinct reporters auto-hide a request", hidden.rows.length === 0);
await expectError(
  "anon cannot read reports after reporting",
  () => as("anon", null, "select * from public.reports"),
  /permission denied/,
);
await expectError(
  "owner cannot edit a removed request",
  () => as("authenticated", A, "update public.requests set status = 'active' where id = $1", [anonymousId]).then((r) => {
    if ((r.affectedRows ?? 0) === 0) throw new Error("request_removed (0 rows)");
  }),
  /request_removed/,
);

// --- Owner stats ------------------------------------------------------------------
await as("anon", null, "select public.log_request_view($1)", [namedId]);
const stats = await as("authenticated", A, "select * from public.get_my_request_stats() where request_id = $1", [namedId]);
check("owner stats see views + unlocks", Number(stats.rows[0]?.views) === 1 && Number(stats.rows[0]?.unlocks) === 1);
const bStats = await as("authenticated", B, "select * from public.get_my_request_stats()");
check("non-owner stats are empty", bStats.rows.length === 0);

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
