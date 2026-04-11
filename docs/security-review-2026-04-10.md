# Security Review Report

Date: 2026-04-10

## Executive Summary

The site security posture is acceptable for a seed-stage public website after the fixes in this review. The highest-risk issues were concentrated in admin access control, signature-secret handling, request abuse controls, and verification ownership boundaries. Those issues have been addressed in code. Remaining risk is mostly operational: environment variable hygiene, Vercel/Cloudflare configuration drift, and the limitations of in-memory rate limiting in a serverless environment.

## Fixed Findings

### SR-01 High — Admin route failed open when credentials were missing

- Location: `middleware.ts`
- Impact: If `ADMIN_USERNAME` or `ADMIN_PASSWORD` were absent, `/admin` was reachable without any authentication.
- Fix: The middleware now fails closed with `503` until credentials are configured, validates malformed Basic auth safely, applies constant-time comparison, and marks admin responses `no-store` + `noindex`.

### SR-02 High — Verification signing could rely on a predictable fallback in production

- Location: `src/lib/security.ts`, `src/app/v1/run/route.ts`, `src/app/v1/verify/route.ts`
- Impact: A predictable signing fallback in production would make execution verification forgeable.
- Fix: Signing now requires `WORKFLOW_SIGNING_SECRET` in production. `run` and `verify` return `503` if signing is not configured instead of silently using a weak fallback.

### SR-03 High — Execution verification did not enforce per-key ownership

- Location: `src/app/v1/run/route.ts`, `src/app/v1/verify/route.ts`, `src/lib/store.ts`, `supabase/schema.sql`
- Impact: One valid API key could probe or verify executions created by another key if it knew the execution ID and token.
- Fix: Execution logs now store the caller key ID, and verification is rejected with `403` when the execution does not belong to the requesting API key.

### SR-04 Medium — Request endpoints lacked durable abuse controls and request body boundaries

- Location: `src/app/api/access-requests/route.ts`, `src/app/v1/run/route.ts`, `src/app/v1/verify/route.ts`, `src/lib/rate-limit.ts`, `src/lib/validation.ts`
- Impact: Unbounded request bodies and no throttling made the site easier to spam or use for cheap denial-of-service attempts.
- Fix: Added per-endpoint in-memory rate limits, `Retry-After` headers, content-type checks, payload size limits, and structured request validation/sanitization.

### SR-05 Medium — Logs could capture too much caller input detail

- Location: `src/lib/validation.ts`, `src/app/v1/run/route.ts`
- Impact: Operator-visible logs could retain sensitive or proprietary caller input.
- Fix: Execution log summaries now record only shape-level information such as top-level keys and string lengths, with sensitive key names redacted.

### SR-06 Medium — Missing baseline response security headers

- Location: `next.config.ts`
- Impact: The site lacked a minimal set of defense-in-depth browser headers.
- Fix: Added `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, and `Permissions-Policy`.

## Remaining Risks

### RR-01 Medium — Rate limiting is instance-local

- Location: `src/lib/rate-limit.ts`
- Note: This is suitable for seed-stage usage but not strong enough for hostile traffic at scale on multi-instance deployments. Move rate limiting to a shared store or edge product before opening anonymous or higher-volume access.

### RR-02 Medium — Admin protection still relies on static Basic auth credentials

- Location: `middleware.ts`
- Note: This is acceptable for a small internal dashboard, but longer-term the admin surface should move behind platform auth, IP allowlisting, or a proper identity layer.

### RR-03 Low — No CSP yet

- Location: app-wide
- Note: The site has basic browser hardening headers but not a Content Security Policy. CSP should be added after validating the minimal policy that does not break Next.js hydration or future third-party integrations.

## Verification

- `npm run lint`
- `npm run build`
- `npm audit --json`
