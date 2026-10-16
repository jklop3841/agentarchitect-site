import { NextRequest, NextResponse } from "next/server";

import {
  agentContactEmail,
  agentContactSubjectPrefix,
  agentDiscoveryProfile,
  buildAgentDiscoveryReply,
} from "@/lib/agent-discovery";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32_768;
const SUPPORTED_VERSION = "1.0";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

function responseHeaders() {
  return {
    "A2A-Version": SUPPORTED_VERSION,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, A2A-Version, A2A-Extensions",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function rpcError(id: JsonRpcId, code: number, message: string, status = 200) {
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id,
      error: { code, message },
    },
    { status, headers: responseHeaders() },
  );
}

function extractText(params?: Record<string, unknown>) {
  const message = params?.message;
  if (!message || typeof message !== "object" || Array.isArray(message)) return "";

  const parts = (message as { parts?: unknown }).parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .map((part) => {
      if (!part || typeof part !== "object" || Array.isArray(part)) return "";
      const text = (part as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractContextId(params?: Record<string, unknown>) {
  const message = params?.message;
  if (!message || typeof message !== "object" || Array.isArray(message)) return crypto.randomUUID();
  const contextId = (message as { contextId?: unknown }).contextId;
  return typeof contextId === "string" && contextId ? contextId : crypto.randomUUID();
}

export function GET() {
  return NextResponse.json(
    {
      service: agentDiscoveryProfile.name,
      protocol: "A2A JSON-RPC",
      protocolVersion: SUPPORTED_VERSION,
      agentCard: "/.well-known/agent-card.json",
      supportedMethods: ["SendMessage", "GetExtendedAgentCard"],
      note: "This public endpoint is intentionally limited to synchronous discovery/contact messages. It does not execute privileged actions or send email on behalf of callers.",
      contact: {
        email: agentContactEmail,
        subjectPrefix: agentContactSubjectPrefix,
      },
    },
    { headers: responseHeaders() },
  );
}

export async function POST(request: NextRequest) {
  const requestedVersion = request.headers.get("A2A-Version") ?? "0.3";
  if (requestedVersion !== SUPPORTED_VERSION) {
    return rpcError(null, -32009, `A2A version ${requestedVersion || "0.3"} is not supported. Use 1.0.`);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return rpcError(null, -32600, "Request body is too large.", 413);
  }

  let body: JsonRpcRequest;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
      return rpcError(null, -32600, "Request body is too large.", 413);
    }
    body = JSON.parse(raw) as JsonRpcRequest;
  } catch {
    return rpcError(null, -32700, "Parse error.", 400);
  }

  const id = body.id ?? null;
  if (body.jsonrpc !== "2.0" || typeof body.method !== "string") {
    return rpcError(id, -32600, "Invalid JSON-RPC request.", 400);
  }

  if (body.method === "GetExtendedAgentCard") {
    return NextResponse.json(
      { jsonrpc: "2.0", id, result: agentDiscoveryProfile },
      { headers: responseHeaders() },
    );
  }

  if (body.method !== "SendMessage") {
    return rpcError(id, -32601, "Method not found. This public discovery endpoint supports SendMessage and GetExtendedAgentCard only.");
  }

  const query = extractText(body.params);
  if (!query) {
    return rpcError(id, -32602, "SendMessage requires params.message.parts with at least one text part.");
  }

  const contextId = extractContextId(body.params);
  const reply = buildAgentDiscoveryReply(query);

  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id,
      result: {
        message: {
          messageId: crypto.randomUUID(),
          contextId,
          role: "ROLE_AGENT",
          parts: [{ text: reply, mediaType: "text/plain" }],
          metadata: {
            canonicalEntity: "Lu Cheng / Jack Lu",
            humanEscalationEmail: agentContactEmail,
            subjectPrefix: agentContactSubjectPrefix,
          },
          extensions: [],
          referenceTaskIds: [],
        },
      },
    },
    { headers: responseHeaders() },
  );
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: responseHeaders() });
}
