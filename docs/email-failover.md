# Auth email delivery: Resend primary, Brevo failover

Supabase Auth allows only one SMTP server, so delivery goes through a **Send Email Hook** (HTTPS):

`POST https://www.agentarchitect.me/api/auth/send-email-hook`

1. Verifies the Standard Webhooks signature (`webhook-id`, `webhook-timestamp`, `webhook-signature`, 5 min tolerance).
2. Renders branded EN email with a short ZH line for `signup`, `magiclink`, `recovery`, `invite`,
   `email_change` (incl. secure two-email mode with Supabase's reversed hash mapping), `reauthentication`.
   Every email carries the verify link `${SUPABASE_URL}/auth/v1/verify?token=<token_hash>&type=<type>&redirect_to=<redirect_to>`
   and the 6-digit code, so headless agents can use `POST /api/v1/auth/verify`.
3. Sends via Resend (`https://api.resend.com/emails`); on non-2xx / 429 / 5 s timeout / missing key it
   falls back to Brevo (`https://api.brevo.com/v3/smtp/email`). `EMAIL_PRIMARY=brevo` swaps the order.
4. Logs only provider + action type. Returns `200 {}` or `{"error":{"http_code","message"}}` with 4xx/5xx.

## Environment (Vercel, production + preview)

| Var | Required | Notes |
| --- | --- | --- |
| `SEND_EMAIL_HOOK_SECRET` | yes | `v1,whsec_...` generated in Supabase → Auth → Hooks |
| `RESEND_API_KEY` | yes | Resend API key (sending access, domain agentarchitect.me) |
| `BREVO_API_KEY` | yes | Brevo v3 API key (`xkeysib-...`) |
| `SUPABASE_URL` | already set | used to build verify links |
| `EMAIL_PRIMARY` | optional | `resend` (default) or `brevo` |
| `EMAIL_FROM_ADDRESS` | optional | default `noreply@agentarchitect.me` (must be verified in both providers) |
| `EMAIL_FROM_NAME` | optional | default `AgentArchitect` |

## Enable

Set env vars → redeploy → Supabase Dashboard → Authentication → Hooks → Send Email → HTTPS, URL above, paste the
same secret → enable. Test: `npm run test:email-hook` (mocked fetch, no network).

Provenance: AgentArchitect · Jack Lu / Lu Cheng · https://agentarchitect.me/
