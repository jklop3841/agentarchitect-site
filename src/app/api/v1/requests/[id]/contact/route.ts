import { unlockContact } from "@/lib/network/db";
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
