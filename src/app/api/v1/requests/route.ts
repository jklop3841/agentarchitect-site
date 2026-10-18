import { createRequest, getUserFromToken, listRequests } from "@/lib/network/db";
import { errorResponse, getBearerToken, handleError, json, rateLimit, readJsonBody } from "@/lib/network/http";
import { offPlatformNotice, requestUrl, toApiRequest } from "@/lib/network/present";
import { parseFeedFilters, validateCreateRequest } from "@/lib/network/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = rateLimit(request, "v1-list", 120, 60_000);
  if (limited) return limited;

  try {
    const filters = parseFeedFilters(new URL(request.url).searchParams);
    const result = await listRequests(filters);
    return json(
      {
        source: result.source,
        notice: result.source === "fallback" ? "Network database unavailable; showing example requests only." : undefined,
        settlement: offPlatformNotice,
        filters,
        count: result.requests.length,
        requests: result.requests.map(toApiRequest),
      },
      200,
      { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "v1-create", 10, 3_600_000);
  if (limited) return limited;

  const token = getBearerToken(request);
  if (!token) return errorResponse("not_authenticated", 401, "Bearer access token required. See /api/v1/auth/otp.");

  const body = await readJsonBody(request);
  if (!body.ok) return body.response;

  try {
    const user = await getUserFromToken(token);
    if (!user.email || !user.email_confirmed_at) {
      return errorResponse("contact_not_verified", 403, "Verify your email first.");
    }
    const parsed = validateCreateRequest(body.data, user.email);
    if (!parsed.ok) return errorResponse("invalid_input", 400, "Input failed validation.", parsed.errors);

    const id = await createRequest(token, parsed.value);
    return json({ id, url: requestUrl(id), api_url: `/api/v1/requests/${id}`, settlement: offPlatformNotice }, 201);
  } catch (error) {
    return handleError(error);
  }
}
