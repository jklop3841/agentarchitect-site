# Security Review - 2026-05-17

Scope:
- New proof, boundaries, AI search check, and brand entity JSON pages.
- Machine-readable routes: `/agents.txt`, `/.well-known/agent.json`, `/llms.txt`, `/schema.json`, `/sitemap.xml`.
- API/security posture spot check for existing app routes and middleware.
- Dependency audit.

## Result

No critical or high application-code findings were identified in this pass.

One high-severity dependency finding was found by `npm audit` for `next@16.2.4`. It was remediated by updating the lockfile and package constraints to `next@16.2.6`.

## Checks Run

- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`
- Local route checks for:
  - `/proof`
  - `/boundaries`
  - `/ai-search-check`
  - `/brand-entity.json`
  - `/agents.txt`
  - `/.well-known/agent.json`
  - `/llms.txt`
- Secret pattern scan excluding `.git`, `.next`, `node_modules`, and `tmp`.
- High-risk code pattern scan for inline HTML, dynamic execution, child processes, redirects, cookies, and headers.
- Security header check on local rendered page.
- Sitemap check for new public routes and no `localhost` leakage.

## Findings

### Remediated: High dependency advisory in Next.js

`npm audit` reported high-severity advisories affecting the installed Next.js version.

Remediation:
- Updated installed Next.js packages to `16.2.6`.
- Updated `package.json` version constraints for `next` and `@next/swc-win32-x64-msvc`.
- Re-ran `npm audit --audit-level=moderate`, which returned `found 0 vulnerabilities`.

### Reviewed: JSON-LD inline script rendering

`src/components/json-ld.tsx` uses `dangerouslySetInnerHTML` to render JSON-LD.

Assessment:
- Current usage passes static, repository-defined objects, not user-controlled input.
- This is a common pattern for JSON-LD in Next.js.
- Keep it constrained to static structured data. Do not pass request data, form data, query params, or untrusted CMS content into this component without escaping and review.

### Reviewed: Existing public API surfaces

Existing `/v1/run`, `/v1/verify`, and `/api/access-requests` continue to enforce:
- API key checks where required.
- Request size and JSON content-type validation.
- Rate limiting.
- Basic input normalization.
- No-store responses for execution and request APIs.

No changes were made to API key, auth, or execution logic.

## Security Headers Observed

Local header check confirmed:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security`

## Residual Notes

- CSP currently permits `'unsafe-inline'` for scripts and styles. The site uses inline JSON-LD and framework/runtime inline behavior. A stricter nonce/hash-based CSP could be a future hardening task.
- Admin uses Basic Auth protected by environment variables and no-store/noindex headers. For higher assurance, consider moving admin behind stronger auth if it becomes operationally important.
- The in-memory fallback store is acceptable for local/dev behavior but should not be treated as durable production storage.
