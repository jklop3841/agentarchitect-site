import { claimAgent } from "@/lib/agents/service";
import { errorResponse, getBearerToken, handleError, json, rateLimit, readJsonBody } from "@/lib/network/http";

export const dynamic = "force-dynamic";

// POST /api/v1/agents/claim {token} — a signed-in human (Supabase access token, email
// verified) claims an agent with the one-time token from its claim_url.
export async function POST(request: Request) {
  const limited = rateLimit(request, "v1-agent-claim", 10, 3_600_000);
  if (limited) return limited;

  const accessToken = getBearerToken(request);
  if (!accessToken || accessToken.startsWith("aa_")) {
    return errorResponse("not_authenticated", 401, "Sign in first (Bearer access token from the email sign-in flow).");
  }
  const body = await readJsonBody(request, 2_000);
  if (!body.ok) return body.response;

  try {
    return json(await claimAgent(body.data.token, accessToken));
  } catch (error) {
    return handleError(error);
  }
}
