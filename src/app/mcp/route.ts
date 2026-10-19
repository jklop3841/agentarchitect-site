import { NextResponse } from "next/server";

import { getAgentKey, requestIpHash } from "@/lib/agents/http";
import { handleMcpRequest } from "@/lib/agents/mcp";
import { rateLimit } from "@/lib/network/http";

// Remote MCP endpoint (Streamable HTTP, stateless). Human docs live at /docs/mcp.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
};

function withCors(response: Response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(cors)) headers.set(key, value);
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "mcp", 120, 60_000);
  if (limited) return withCors(limited);
  const response = await handleMcpRequest(request, { ipHash: await requestIpHash(request), bearerKey: getAgentKey(request) });
  return withCors(response);
}

// Browsers get the human page; MCP clients get 405 (stateless server, no SSE stream).
export function GET(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/html")) return NextResponse.redirect(new URL("/docs/mcp", request.url), 307);
  return withCors(
    Response.json(
      { jsonrpc: "2.0", id: null, error: { code: -32000, message: "Method not allowed. This stateless MCP server accepts POST (Streamable HTTP, JSON responses). Docs: /docs/mcp" } },
      { status: 405, headers: { Allow: "POST, OPTIONS" } },
    ),
  );
}

export function DELETE() {
  return withCors(Response.json({ jsonrpc: "2.0", id: null, error: { code: -32000, message: "Stateless server: no sessions to delete." } }, { status: 405, headers: { Allow: "POST, OPTIONS" } }));
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}
