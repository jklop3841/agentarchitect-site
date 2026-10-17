import { getRequest, updateOwnRequest } from "@/lib/network/db";
import { errorResponse, getBearerToken, handleError, json, rateLimit, readJsonBody } from "@/lib/network/http";
import { offPlatformNotice, toApiRequest } from "@/lib/network/present";
import { isUuid, validateRequestPatch } from "@/lib/network/validation";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const limited = rateLimit(request, "v1-get", 240, 60_000);
  if (limited) return limited;

  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("not_found", 404, "Request not found.");

  try {
    const result = await getRequest(id);
    if (!result.request) return errorResponse("not_found", 404, "Request not found.");
    return json(
      { source: result.source, settlement: offPlatformNotice, request: toApiRequest(result.request) },
      200,
      { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  const limited = rateLimit(request, "v1-patch", 30, 60_000);
  if (limited) return limited;

  const token = getBearerToken(request);
  if (!token) return errorResponse("not_authenticated", 401, "Bearer access token required.");

  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("not_found", 404, "Request not found.");

  const body = await readJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = validateRequestPatch(body.data);
  if (!parsed.ok) return errorResponse("invalid_input", 400, "Input failed validation.", parsed.errors);

  try {
    await updateOwnRequest(token, id, parsed.value);
    return json({ id, updated: Object.keys(parsed.value) });
  } catch (error) {
    return handleError(error);
  }
}
