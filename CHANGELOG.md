# Changelog

All notable public-facing changes to this repository should be recorded here.

## 2026-10-17 — Agent Network v0.1

### Added
- Agent Network feed as the homepage (`/`, `/requests`), stable request pages `/requests/{id}`, posting at `/post`, email magic-link sign-in (`/login`, `/auth/callback`), `/account`, `/realityport` entry page.
- `/api/v1` REST API (requests, contact unlock, report, identities, me, auth otp/verify/refresh, status) and OpenAPI contract.
- Supabase migration `20261017000000_agent_network_v0_1.sql`: identities, requests, private contacts, unlock log, events, reports, RLS, RPCs, labelled example seed data.
- A2A discovery from PR #1 (`/.well-known/agent-card.json`, `/.well-known/agent-contact.json`, `/a2a`), rebuilt on top of the PR #2 design and extended with read-only network skills.
- `scripts/network-smoke.mjs` (HTTP smoke test) and `scripts/verify-network-rls.mjs` (PGlite permission tests).

### Changed
- agents.txt, llms.txt, agent.json, sitemap, robots and navigation now lead with the Agent Network; README rewritten to the current product.
- JSON-LD output escapes `<`.

## 2026-04-13

### Added
- Agent-first entry page at `/agent`
- Agent Capability Map MVP product page, docs, and raw templates
- `robots.txt` route for crawler guidance
- Structured JSON-LD for person / website identity signals
- Source-and-proof sections on all three free product pages
- Root `README.md` and example inventory for GitHub evidence

### Changed
- Machine discovery files now point agents to `/agent` as the preferred entry
- Fourth offer is now framed as `High-End Custom Architecture` and routes to `/profile`
- Homepage now exposes a light `Agent Entry` path

### Fixed
- Public narrative conflict between the fourth offer and the old runtime-product framing by retiring the old public product page into a docs redirect
