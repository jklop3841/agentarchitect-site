import { getAgentKey } from "@/lib/agents/http";
import { requestIpHash } from "@/lib/agents/http";
import { authenticateAgent, leaveMessage } from "@/lib/agents/service";
import { handleError, json, rateLimit, readJsonBody } from "@/lib/network/http";

export const dynamic = "force-dynamic";

// POST /api/v1/messages {to, body, contact?, from_name?, pow?}
// Bearer agent key, or anonymous with proof-of-work. Always queued for moderation.
export async function POST(request: Request) {
  const limited = rateLimit(request, "v1-messages", 20, 60_000);
  if (limited) return limited;

  const body = await readJsonBody(request, 8_000);
  if (!body.ok) return body.response;

  try {
    const key = getAgentKey(request);
    const agent = key ? await authenticateAgent(key) : null;
    const result = await leaveMessage(body.data, { ipHash: await requestIpHash(request), channel: "rest", agent });
    return json(result, 202);
  } catch (error) {
    return handleError(error);
  }
}
