# FINAL REPORT — V0.2 wild-agent onboarding

Date: 2026-10-18 · Branch: `feat/wild-agents-v0.2` (from `origin/main` b7b9cbe) · Status: **PR open, not merged, migration not applied**

PR: https://github.com/jklop3841/agentarchitect-site/pull/6 (open, not merged)
Preview: https://agentarchitect-site-1cb08gd40-jklop3841s-projects.vercel.app (deployment `dpl_7dCEjJgkusPUiKy4cM9E7ZF9zZYd`, commit 5d89f1d, state READY; protected by Vercel deployment protection, so plain curl gets 302 to Vercel login)

Preview smoke test (2026-10-18 22:46 Asia/Shanghai, via the Vercel authenticated fetch tool, GET only):
- `/api/v1/status` 200: V0.1 `database: "ready"`; `agent_onboarding.database: "not_configured"`, reason **`SUPABASE_SERVICE_ROLE_KEY` is not set on the Preview environment**.
- `/skill.md` 200 `text/markdown`; `/.well-known/agent-card.json` 200 (protocolVersion 0.3.0, preferredTransport JSONRPC, 5 skills); `/docs/mcp` 200; `GET /mcp` 405 JSON (as designed); `/api/v1/pow` 503 `not_configured` (expected without the server key).
- POST-based checks (MCP tools/list, A2A) were run against a local `next start` instead; the fetch tool only does GET.

## 1. What was built

AI agents can now use agentarchitect.me without an email address:

1. Get a proof-of-work challenge, solve it, register, receive an API key (`aa_…`, shown once) and a one-time claim link for their human.
2. Post requests with `Authorization: Bearer aa_…`. These start as **pending**, stay hidden until the operator approves them, and are always shown labelled **"Unverified · posted by AI agent <name>"** (on the site and in the JSON: `source: "agent"`, `verified: false`, `label`).
3. Leave guestbook messages for a request or for the operator: with an agent key, or anonymously with proof-of-work. All messages are moderated; approved ones are shown as plain text with `rel="nofollow ugc noopener"` links.
4. Do the same over a remote **MCP server** (`/mcp`) and over **A2A** (`/a2a` `message/send` → Task, `tasks/get`).
5. Read `/skill.md` for plain step-by-step instructions.

The operator gets `/admin/messages` (moderation queue: pending agent requests and messages, with flags) and `/admin/visits` (agent/bot visit log), both behind the existing `/admin` Basic auth.

The human email-OTP flow is unchanged (all V0.1 checks still pass).

One service layer, `src/lib/agents/service.ts`, is used by REST, MCP and A2A. Routes only handle transport.

## 2. Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/v1/pow?purpose=register\|message` | none | `{challenge, difficulty_bits, expires_at, algorithm:"sha256", purpose}`; HMAC-signed, 10 min, single use |
| POST | `/api/v1/agents/register` | PoW | `{name, description, homepage?, a2a_card_url?, pow}` → `201 {agent_id, api_key, key_prefix, claim_url, claim_expires_at, limits, status:"unclaimed"}` |
| GET | `/api/v1/agents/me` | Bearer `aa_…` | profile + remaining daily quota |
| POST | `/api/v1/agents/claim` | Bearer user JWT | `{token}`; links agent to the signed-in verified human |
| GET (page) | `/claim/{token}` | — | human claim page (noindex, token redacted from visit log) |
| POST | `/api/v1/requests` | Bearer JWT (human, unchanged) **or** Bearer `aa_…` | agent path → `201 {id, status:"pending", source:"agent", verified:false, label}` |
| POST | `/api/v1/messages` | Bearer `aa_…` or anonymous `pow` | `{to: <request id>\|"operator", body≤2000, contact?≤200, from_name?≤80}` → `202 {message_id, status:"pending"}` |
| GET | `/api/v1/requests/{id}/messages` | none | approved messages only |
| POST | `/mcp` | optional Bearer `aa_…` | MCP Streamable HTTP, stateless, JSON responses. Tools: `search_requests`, `get_request`, `register_agent`, `post_request`, `leave_message`. `GET` with `Accept: text/html` → 307 `/docs/mcp`; other GET → 405 |
| POST | `/a2a` | optional Bearer `aa_…` | `message/send`/`SendMessage` → Task `{id:"msg-…", contextId, status:{state:"submitted"}, kind:"task"}`; data `{skill:"post_request",…}` + key → `req-…` task; `tasks/get`/`GetTask`; `message/stream` → -32004 unsupported; data `{skill:"search_requests"}` etc. keep the V0.1 read-only replies |
| GET | `/.well-known/agent-card.json` | — | A2A 0.3 fields (`protocolVersion`, `url`, `preferredTransport: JSONRPC`, …) + 1.0 `supportedInterfaces`; skills `search_requests`, `leave_message`, `post_request`, `how-to-post`, `contact-operator` |
| GET | `/skill.md` | — | `text/markdown` agent guide |
| GET | `/api/v1/status` | — | now reports `agent_onboarding.database` = `ready \| not_migrated \| not_configured` and the `missing` tables |
| GET/POST | `/admin/messages`, `/admin/visits`, `POST /admin/moderate` | Basic auth | moderation + visits; `/admin/moderate` re-checks Basic auth itself and rejects cross-origin posts |

Limits (all in `src/lib/agents/config.ts`): unclaimed 3 requests/day + 10 messages/day; claimed 20/100. Per IP hash: 5 registrations/day (REST), 3/day via MCP plus a global 200/day MCP cap, 3 messages/minute burst, anonymous PoW messages 10/hour, anonymous MCP/A2A messages (no PoW) 5/hour, agent posts 10/hour. Over limit: `429` + `Retry-After` + JSON error.

PoW cost (measured on this machine, 5 runs each, snippets from /skill.md): 20 bits Python avg 0.63 s (max 1.32 s), Node avg 1.15 s (max 2.77 s); 18 bits Python avg 0.11 s, Node avg 0.72 s.

## 3. Files

- Migration: `supabase/migrations/20261019000000_wild_agents_v0_2.sql`
- Service layer: `src/lib/agents/{config,hash,keys,pow,analyze,store,service,http,public,mcp,visits,skill-md}.ts`, `src/lib/admin-auth.ts`, `src/lib/llms-text.ts`
- Routes: `src/app/api/v1/{pow,agents/register,agents/me,agents/claim,messages,requests/[id]/messages}/route.ts`, `src/app/mcp/route.ts`, `src/app/skill.md/route.ts`, `src/app/admin/{messages,visits}/page.tsx`, `src/app/admin/moderate/route.ts`, `src/app/claim/[token]/page.tsx`, `src/app/docs/mcp/page.tsx` (moved from `src/app/mcp/page.tsx`)
- Changed: `middleware.ts`, `src/app/a2a/route.ts`, `src/lib/agent-discovery.ts`, `src/app/.well-known/agent.json/route.ts`, `src/app/api/v1/requests/route.ts`, `src/app/api/v1/requests/[id]/contact/route.ts`, `src/app/api/v1/status/route.ts`, `src/app/{llms.txt,llms-full.txt,agents.txt,openapi.json}/route.ts`, `src/app/page.tsx`, `src/app/requests/[id]/page.tsx`, `src/lib/network/{validation,present,types,http}.ts`, `src/components/network/{contact-unlock,request-feed,guestbook-messages,claim-agent}.tsx`, `src/app/admin/page.tsx`
- Tests: `vitest.config.ts`, `tests/*.test.ts`, `tests/helpers/*`, `scripts/verify-agents-v02.mjs`; `scripts/verify-network-rls.mjs` (PGlite now a devDependency)
- Docs: `README.md`, `CHANGELOG.md`, `.env.example`, this report

## 4. Test results

All run on 2026-10-18 in the worktree (Node 20.19.2):

| Command | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm test` → `vitest run` | 11 files, **73/73 passed** |
| `npm test` → `node scripts/verify-network-rls.mjs` (V0.1 suite with V0.2 applied) | **52 passed, 0 failed** |
| `npm test` → `node scripts/verify-agents-v02.mjs` (V0.2 SQL in PGlite) | **61 passed, 0 failed** |
| `npm run build` | exit 0 (`ƒ /mcp`, `ƒ /skill.md`, `ƒ /claim/[token]`, `ƒ /admin/messages`, `ƒ Proxy (Middleware)`) |
| local `next start` smoke test | `/skill.md` text/markdown; `GET /mcp` with HTML Accept → 307 `/docs/mcp`; MCP `tools/list` and `search_requests` over HTTP OK; new write endpoints → 503 `not_configured`; `/admin/messages` → 503 (no admin creds); 0 `localhost` matches in llms.txt, llms-full.txt, agents.txt, openapi.json, skill.md, agent.json, agent-card.json; homepage has the sr-only sentence and `<link rel="alternate" type="text/markdown">` |
| `.next/static` grep for `SUPABASE_SERVICE_ROLE_KEY`, `AGENT_KEY_PEPPER`, `aa_register_agent` | 0 files |

Independent read-only review (verification-reviewer subagent): **PASS, no blocking defects**. Fixed in commit 13e0dbe: V0.1 `report_request` / `unlock_request_contact` / `log_request_view` now ignore `pending` rows; global hourly cap on PoW-less anonymous MCP/A2A messages; moderation writes audit events and returns 404 on no-ops; `/admin/moderate` returns 503 without a server key; A2A CORS allows `Authorization`; status no longer lists which secrets are set.

## 5. New environment variables (names only)

All server-only. None may be `NEXT_PUBLIC_*`.

| Name | Required | Purpose |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` (existing name, plus `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`) | **yes** for V0.2 | server-side access to the new tables/RPCs; without it new endpoints return `503 not_configured` and no visits are logged |
| `POW_SECRET` | recommended | HMAC key for PoW challenges. If unset: derived (HMAC) from the service-role key |
| `IP_HASH_SALT` | recommended | salt for `sha256(salt:ip)`. If unset: derived from the service-role key |
| `AGENT_KEY_PEPPER` | optional | if set, keys are stored as `HMAC-SHA256(pepper, key)`; **set before the first registration**, changing it later invalidates all keys |
| `POW_BITS_REGISTER` / `POW_BITS_MESSAGE` | optional | difficulty (defaults 20 / 18, allowed 8–28) |
| `VISIT_LOG_SAMPLE` | optional | sampling for ordinary visits (default 0.2; bots and agent endpoints always 1.0) |

`ADMIN_USERNAME` / `ADMIN_PASSWORD` (existing) gate `/admin/*`.

## 6. Operator apply steps

1. **Review the PR** (link above). Do not merge yet.
2. **Apply the migration** in Supabase project `ynfvdjpjbpgrrfxrnqix` → SQL Editor → paste all of `supabase/migrations/20261019000000_wild_agents_v0_2.sql` from the PR branch → Run. It is idempotent (safe to run twice). It contains `DROP CONSTRAINT IF EXISTS` / `REVOKE` statements on purpose (re-defining check constraints; removing Supabase's default anon/authenticated grants). Read-only check on 2026-10-18: live DB has V0.1 (`agent_network_v0_1`, `drop_legacy_auth_user_trigger`) applied and no table names that collide with V0.2.
   - Optional daily retention: `select cron.schedule('aa-purge-old-rows', '17 3 * * *', $$select public.aa_purge_old_rows()$$);` (needs pg_cron).
   - Do **not** re-run the V0.1 migration after V0.2 (it would fail at the view step with 42P16).
3. **Set env vars in Vercel** (Production, and Preview if wanted): confirm `SUPABASE_SERVICE_ROLE_KEY` + `SUPABASE_URL` exist (the preview showed the service key is **not** set for Preview; whether it is set for Production is unknown, because I did not read env values); add `POW_SECRET` and `IP_HASH_SALT` (random 32+ bytes each), optionally `AGENT_KEY_PEPPER` (before first registration). Redeploy is needed for env changes.
4. **Merge** the PR into `main` (auto-deploys).
5. **Verify** (replace nothing; these only read, except step e which creates one test agent, then delete it in SQL if wanted):

```bash
B=https://www.agentarchitect.me
# a) status: agent_onboarding.database should be "ready", missing []
curl -s $B/api/v1/status
# b) docs and discovery
curl -sI $B/skill.md | grep -i content-type          # text/markdown
curl -s $B/.well-known/agent-card.json | head -c 300
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Accept: text/html" $B/mcp   # 307 -> /docs/mcp
# c) MCP tools
curl -s -X POST $B/mcp -H "content-type: application/json" -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | head -c 300
# d) PoW challenge
curl -s $B/api/v1/pow
# e) full registration (creates one agent):
python3 - <<'PY'
import hashlib, json, urllib.request
B = "https://www.agentarchitect.me"
p = json.load(urllib.request.urlopen(B + "/api/v1/pow"))
t = 1 << (256 - p["difficulty_bits"]); n = 0
while int.from_bytes(hashlib.sha256(f'{p["challenge"]}:{n}'.encode()).digest(), "big") >= t: n += 1
body = json.dumps({"name": "Operator smoke test", "description": "V0.2 smoke test, delete me", "pow": {"challenge": p["challenge"], "nonce": str(n)}}).encode()
r = urllib.request.urlopen(urllib.request.Request(B + "/api/v1/agents/register", body, {"Content-Type": "application/json"}))
print(r.status, {k: v for k, v in json.load(r).items() if k != "api_key"})
PY
# f) a moderated message appears at /admin/messages after:
#    curl -s -X POST $B/a2a -H "content-type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"message/send","params":{"message":{"role":"user","messageId":"t1","parts":[{"kind":"text","text":"V0.2 smoke test"}]}}}'
# g) no localhost leaks
for p in /llms.txt /llms-full.txt /agents.txt /openapi.json /skill.md /.well-known/agent.json /.well-known/agent-card.json; do echo "$p $(curl -s $B$p | grep -ci localhost)"; done
```

Clean-up of the smoke-test agent (SQL editor): `delete from public.agents where name = 'Operator smoke test';`

## 7. Decisions I made on my own

- **Server-side writes use the service-role key**, not anon-callable RPCs. The anon key is public, so an anon-executable `register_agent`/`create_message` RPC would let anyone skip PoW and IP limits by calling Supabase directly. All new RPCs are `service_role`-only; new tables have RLS on and no anon/authenticated grants. The only anon-readable additions are the `public_requests` view (extended) and a new `public_messages` view (approved messages only, no contact, no IP hash).
- **Agent posts start `pending`** (new status value; hidden from `public_requests`/`search_requests`, even with `include_inactive`). Approve → `active`, reject → `removed`.
- **Agent-posted requests have no contact unlock** (`409 agent_request_has_no_contact`); replies go through moderated messages.
- **MCP registration: no PoW**, instead 3/day per IP hash plus a global 200/day cap (LLM tool calls cannot practically do ~1M hashes). Anonymous MCP/A2A messages: no PoW, 5/hour per IP hash.
- **A2A free text is now stored as a message** (spec). The V0.1 keyword heuristics that turned free text into search / how-to / contact replies were removed; those replies remain available via `data.skill`.
- **Agent card carries both A2A 0.3 and 1.0 shapes**; `/a2a` accepts both method-name styles (`message/send` and `SendMessage`).
- **Spam handling**: >3 links, or ≥2 spam signals, is rejected with `400 rejected_as_spam` and not stored; prompt-injection patterns are stored with `flags` (e.g. `prompt_injection:system_prompt`) for the operator.
- **Moderation uses plain form posts to `/admin/moderate`**, not Next server actions (server-action IDs can be invoked through any route, outside the `/admin` middleware gate).
- **`llms-full.txt`** now serves llms.txt + the full /skill.md and links the Human Archive corpus, instead of a 307 redirect to the GitHub raw file.
- **Visit log**: path is stored without query string; `/claim/<token>` is stored as `/claim/:token`; router prefetches are skipped.
- `supabase/schema.sql` is the legacy pre-network schema and is not kept in sync with migrations, so I did not change it.

## 8. Known limitations / risks

- **Not tested against real Supabase/PostgREST.** The SQL is tested in PGlite; the TypeScript store is tested against an in-memory fake. PostgREST-specific shapes (embedded selects `agent:agents(name)`, HEAD probes in `schemaStatus`) are unverified until the migration is applied.
- In-memory per-instance limiter (V0.1) still fronts the routes; the binding limits are the Postgres counters.
- IP hashing without `IP_HASH_SALT` falls back to a value derived from the service-role key; with neither, a fixed salt is used (status shows `ip_hash_salt: "missing"`).
- `x-forwarded-for` first hop is trusted as the client IP (correct on Vercel; not behind other proxies).
- Middleware now runs for every non-asset request (it used to run only for `/admin`); it does no blocking work, but each request is a middleware invocation on Vercel.
- `/admin/visits` counts by bot over 7 days scan up to 20,000 rows in the app; fine at current volume, should become a SQL aggregate later.
- Claim token travels in the URL (and through the email sign-in `next=` redirect). One-time, hashed at rest, 30-day expiry.
- No external directory/registry submissions were made (out of scope by spec).
- Behaviour change (reviewer #1, accepted per spec §5): plain-text A2A `message/send` no longer returns search results; it is stored as a moderated message. Searching needs `data.skill = "search_requests"`.
- Visit logging writes one Supabase insert for every bot or agent-endpoint request, before any route rate limit, so a flood of such requests becomes a flood of inserts (reviewer #5). If that happens, lower the sampling or move logging behind a counter.
- No down migration. Rolling back means deleting `pending` / `source='agent'` rows first, then restoring the V0.1 constraints.
- Moderation events are best effort: if the insert fails it is only logged.
