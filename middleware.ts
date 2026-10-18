import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

import { decideVisit, logVisit } from "@/lib/agents/visits";
import { checkAdminAuth } from "@/lib/admin-auth";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  });
}

async function adminGate(request: NextRequest) {
  const result = await checkAdminAuth(request.headers.get("authorization"));

  if (result === "unconfigured") {
    return new NextResponse("Admin access is not configured.", {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  if (result !== "ok") {
    return unauthorized();
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  return response;
}

// Visit log (V0.2): fire-and-forget via waitUntil, never blocks or fails the request.
function scheduleVisitLog(request: NextRequest, event: NextFetchEvent) {
  try {
    const decision = decideVisit(request.nextUrl.pathname, request.headers.get("user-agent"));
    if (decision.log) event.waitUntil(logVisit(request, decision));
  } catch {
    // Logging must never affect the response.
  }
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminGate(request);
  }
  scheduleVisitLog(request, event);
  return NextResponse.next();
}

export const config = {
  // Everything except build assets and obvious static files; the visit logger
  // re-checks with isStaticPath(). /admin keeps its Basic-auth gate.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|media/|images/|downloads/).*)"],
};
