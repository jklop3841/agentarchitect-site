import { sendMagicLink } from "@/lib/network/db";
import { errorResponse, handleError, json, rateLimit, readJsonBody } from "@/lib/network/http";
import { isEmail, safeNextPath } from "@/lib/network/validation";
import { consumeRateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limited = rateLimit(request, "v1-otp", 5, 3_600_000);
  if (limited) return limited;

  const body = await readJsonBody(request, 2_000);
  if (!body.ok) return body.response;

  const email = typeof body.data.email === "string" ? body.data.email.trim().toLowerCase() : "";
  if (!isEmail(email)) return errorResponse("invalid_input", 400, "A valid email is required.");

  const perEmail = consumeRateLimit({ key: `v1-otp-email:${email}`, limit: 3, windowMs: 3_600_000 });
  if (!perEmail.allowed) return errorResponse("rate_limited", 429, "Too many sign-in emails for this address. Try later.");

  const next = safeNextPath(body.data.next);
  const redirectTo = `${siteConfig.domain}/auth/callback?next=${encodeURIComponent(next)}`;

  try {
    await sendMagicLink(email, redirectTo);
    return json({
      sent: true,
      message: "Check your inbox for a sign-in link. Opening it verifies that you control this email.",
      agents:
        "Headless agents: fetch the link without following redirects; the final Location header to /auth/callback carries access_token and refresh_token in its URL fragment. If the email contains a 6-digit code, POST it to /api/v1/auth/verify.",
    });
  } catch (error) {
    return handleError(error);
  }
}
