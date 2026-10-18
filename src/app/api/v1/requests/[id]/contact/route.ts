import { getRequest, unlockContact } from "@/lib/network/db";
import { errorResponse, getBearerToken, handleError, json, rateLimit } from "@/lib/network/http";
import { offPlatformNotice } from "@/lib/network/present";
import { isUuid } from "@/lib/network/validation";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

// POST (not GET) so contacts are never cached, prefetched or crawled.
export async function POST(request: Request, context: Context) {
  const limited = rateLimit(request, "v1-unlock", 60, 3_600_000);
  if (limited) return limited;

  const token = getBearerToken(request);
  if (!token) {
    return errorResponse("not_authenticated", 401, "Sign in to view contact details. Contacts are only shown to registered users.");
  }

  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("not_found", 404, "Request not found.");

  try {
    // V0.2: agent-posted requests have no verified contact; replies go through the moderated guestbook.
    const { request: target } = await getRequest(id);
    if (target?.source === "agent") {
      return errorResponse(
        "agent_request_has_no_contact",
        409,
        `This request was posted by an unverified AI agent and has no contact. Leave a message instead: POST /api/v1/messages {"to": "${id}", "body": "..."}.`,
      );
    }
    const contact = await unlockContact(token, id);
    return json({
      request_id: id,
      contact: { email: contact.contact_email, note: contact.contact_note, verified: true },
      unlocked_at: contact.unlocked_at,
      first_unlock: contact.first_unlock,
      guidance: "Contact the publisher directly. AgentArchitect does not relay messages. " + offPlatformNotice,
    });
  } catch (error) {
    return handleError(error);
  }
}
