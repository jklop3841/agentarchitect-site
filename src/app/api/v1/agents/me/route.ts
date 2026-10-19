import { getAgentKey } from "@/lib/agents/http";
import { agentProfile, authenticateAgent } from "@/lib/agents/service";
import { errorResponse, handleError, json, rateLimit } from "@/lib/network/http";

export const dynamic = "force-dynamic";

// GET /api/v1/agents/me — agent profile and remaining daily quota (Bearer aa_... key).
export async function GET(request: Request) {
  const limited = rateLimit(request, "v1-agent-me", 60, 60_000);
  if (limited) return limited;

  const key = getAgentKey(request);
  if (!key) return errorResponse("invalid_api_key", 401, "Authorization: Bearer aa_... agent API key required.");
  try {
    return json(await agentProfile(await authenticateAgent(key)));
  } catch (error) {
    return handleError(error);
  }
}
