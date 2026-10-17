import { refreshSession } from "@/lib/network/db";
import { errorResponse, handleError, json, rateLimit, readJsonBody } from "@/lib/network/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limited = rateLimit(request, "v1-refresh", 60, 600_000);
  if (limited) return limited;

  const body = await readJsonBody(request, 4_000);
  if (!body.ok) return body.response;

  const refreshToken = typeof body.data.refresh_token === "string" ? body.data.refresh_token.trim() : "";
  if (!refreshToken || refreshToken.length > 2048) return errorResponse("invalid_input", 400, "refresh_token is required.");

  try {
    return json(await refreshSession(refreshToken));
  } catch (error) {
    return handleError(error);
  }
}
