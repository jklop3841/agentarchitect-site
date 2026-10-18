import { getPowChallenge } from "@/lib/agents/service";
import { errorResponse, handleError, json, rateLimit } from "@/lib/network/http";

export const dynamic = "force-dynamic";

// GET /api/v1/pow?purpose=register|message — a signed, single-use proof-of-work challenge.
export async function GET(request: Request) {
  const limited = rateLimit(request, "v1-pow", 30, 60_000);
  if (limited) return limited;

  const purpose = new URL(request.url).searchParams.get("purpose") ?? "register";
  if (purpose !== "register" && purpose !== "message") {
    return errorResponse("invalid_input", 400, "purpose must be 'register' or 'message'.");
  }
  try {
    return json(await getPowChallenge(purpose));
  } catch (error) {
    return handleError(error);
  }
}
