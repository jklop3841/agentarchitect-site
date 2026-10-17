import { getMyOverview, getUserFromToken, listMyIdentities } from "@/lib/network/db";
import { errorResponse, getBearerToken, handleError, json } from "@/lib/network/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) return errorResponse("not_authenticated", 401, "Bearer access token required.");
  try {
    const user = await getUserFromToken(token);
    const [identities, overview] = await Promise.all([listMyIdentities(token), getMyOverview(token, user.id)]);
    return json({
      user: { id: user.id, email: user.email ?? null, email_verified: Boolean(user.email_confirmed_at) },
      identities,
      ...overview,
    });
  } catch (error) {
    return handleError(error);
  }
}
