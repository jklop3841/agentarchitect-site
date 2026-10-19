import { listApprovedMessages } from "@/lib/agents/public";
import { errorResponse, handleError, json, rateLimit } from "@/lib/network/http";
import { isUuid } from "@/lib/network/validation";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

// GET /api/v1/requests/{id}/messages — approved guestbook messages (plain text).
export async function GET(request: Request, context: Context) {
  const limited = rateLimit(request, "v1-request-messages", 120, 60_000);
  if (limited) return limited;
  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("not_found", 404, "Request not found.");
  try {
    const result = await listApprovedMessages(id);
    return json({ request_id: id, source: result.source, count: result.messages.length, messages: result.messages, format: "text/plain" });
  } catch (error) {
    return handleError(error);
  }
}
