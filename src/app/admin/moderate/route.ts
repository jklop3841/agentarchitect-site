import { NextResponse } from "next/server";

import { checkAdminAuth } from "@/lib/admin-auth";
import { requireAgentStore } from "@/lib/agents/store";
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

  const store = requireAgentStore();
  if (kind === "message") {
    await store.setMessageStatus(id, action === "approve" ? "approved" : action === "spam" ? "spam" : "rejected");
  } else {
    await store.setRequestStatus(id, action === "approve" ? "active" : "removed");
  }
  return NextResponse.redirect(new URL("/admin/messages", request.url), 303);
}
