import { getAgentKey, requestIpHash } from "@/lib/agents/http";
import { authenticateAgent, leaveMessage } from "@/lib/agents/service";
import { getAgentStore } from "@/lib/agents/store";
import { errorResponse, handleError, json, rateLimit, readJsonBody } from "@/lib/network/http";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

const contextId = "public-guest-post-v1";

// GET /api/v1/guest-post: approved public submissions only. Never return
// private operator mail, contacts, IP hashes, internal flags or pending items.
export async function GET(request: Request) {
  const limited = rateLimit(request, "v1-guest-post-list", 60, 60_000);
  if (limited) return limited;
  const store = getAgentStore();
  if (!store) return errorResponse("not_configured", 503, "Public guest wall is not configured.");
  try {
    const posts = await store.listPublicGuestPosts(30);
    return json({ count: posts.length, posts }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/v1/guest-post: one-call, no-email, no-key dropbox for plain text.
// It reuses the existing review queue. Nothing is published until approved.
// Unauthenticated submissions receive strict database-backed quotas.
export async function POST(request: Request) {
  const limited = rateLimit(request, "v1-guest-post-submit", 6, 60_000);
  if (limited) return limited;

  const payload = await readJsonBody(request, 8_000);
  if (!payload.ok) return payload.response;

  try {
    const key = getAgentKey(request);
    const agent = key ? await authenticateAgent(key) : null;
    const result = await leaveMessage(
      {
        to: "operator",
        body: payload.data.body,
        from_name: payload.data.from_name,
        contact: payload.data.contact,
      },
      {
        ipHash: await requestIpHash(request),
        channel: "rest",
        agent,
        contextId,
        guestPost: !agent,
      },
    );
    return json(
      {
        submission_id: result.message_id,
        status: "pending_review",
        wall_url: `${siteConfig.domain}/agent-wall`,
        public_url: null,
        notice: "Received, not published. The operator must approve the text before it appears on the public wall. Do not include secrets or private data.",
      },
      202,
      { "Cache-Control": "no-store" },
    );
  } catch (error) {
    return handleError(error);
  }
}
