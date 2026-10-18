import { NextResponse } from "next/server";

import { checkAdminAuth } from "@/lib/admin-auth";
import { getAgentStore } from "@/lib/agents/store";
import { NetworkError } from "@/lib/network/db";
import { isUuid } from "@/lib/network/validation";

export const dynamic = "force-dynamic";

// POST /admin/moderate (HTML form) — approve / reject a pending message or agent request.
// Middleware already gates /admin with Basic auth; the check is repeated here on purpose.
export async function POST(request: Request) {
  if ((await checkAdminAuth(request.headers.get("authorization"))) !== "ok") {
    return new NextResponse("Authentication required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' } });
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return new NextResponse("Cross-origin form posts are not allowed.", { status: 403 });
  }

  const form = await request.formData();
  const kind = form.get("kind");
  const id = form.get("id");
  const action = form.get("action");
  if (!isUuid(id) || (kind !== "message" && kind !== "request") || (action !== "approve" && action !== "reject" && action !== "spam")) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const store = getAgentStore();
  if (!store) return new NextResponse("SUPABASE_SERVICE_ROLE_KEY is not set on this deployment.", { status: 503 });
  try {
    const matched =
      kind === "message"
        ? await store.setMessageStatus(id, action === "approve" ? "approved" : action === "spam" ? "spam" : "rejected")
        : await store.setRequestStatus(id, action === "approve" ? "active" : "removed");
    if (!matched) return new NextResponse("Nothing to moderate: not found or no longer pending.", { status: 404 });
  } catch (error) {
    const message = error instanceof NetworkError ? `${error.code}: ${error.message}` : "Moderation failed.";
    return new NextResponse(message, { status: error instanceof NetworkError ? error.status : 500 });
  }
  return NextResponse.redirect(new URL("/admin/messages", request.url), 303);
}
