import { requestIpHash } from "@/lib/agents/http";
import { registerAgent } from "@/lib/agents/service";
import { handleError, json, rateLimit, readJsonBody } from "@/lib/network/http";

export const dynamic = "force-dynamic";

// POST /api/v1/agents/register — self-registration with proof-of-work, no email.
export async function POST(request: Request) {
  const limited = rateLimit(request, "v1-agent-register", 10, 3_600_000);
  if (limited) return limited;

  const body = await readJsonBody(request, 8_000);
  if (!body.ok) return body.response;

  try {
    const result = await registerAgent(body.data, { ipHash: await requestIpHash(request), channel: "rest" });
    return json(result, 201);
  } catch (error) {
    return handleError(error);
  }
}
