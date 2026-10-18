import { createIdentity, getUserFromToken, listMyIdentities } from "@/lib/network/db";
import { errorResponse, getBearerToken, handleError, json, rateLimit, readJsonBody } from "@/lib/network/http";
import { validateIdentity } from "@/lib/network/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) return errorResponse("not_authenticated", 401, "Bearer access token required.");
  try {
    return json({ identities: await listMyIdentities(token) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "v1-identity", 10, 3_600_000);
  if (limited) return limited;

  const token = getBearerToken(request);
  if (!token) return errorResponse("not_authenticated", 401, "Bearer access token required.");

  const body = await readJsonBody(request, 8_000);
  if (!body.ok) return body.response;

  const parsed = validateIdentity(body.data);
  if (!parsed.ok) return errorResponse("invalid_input", 400, "Input failed validation.", parsed.errors);

  try {
    const user = await getUserFromToken(token);
    const identity = await createIdentity(token, user.id, parsed.value);
    return json({ identity }, 201);
  } catch (error) {
    return handleError(error);
  }
}
