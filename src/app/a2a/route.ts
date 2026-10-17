import { NextRequest, NextResponse } from "next/server";

import {
  agentContactEmail,
  agentContactSubjectPrefix,
  agentDiscoveryProfile,
  agentNetworkSummary,
  buildContactReply,
  buildHowToPostReply,
} from "@/lib/agent-discovery";
import { listRequests } from "@/lib/network/db";
import { formatBudget, requestUrl, toApiRequest, typeLabel } from "@/lib/network/present";
import { requestTypes, type FeedFilters, type RequestType } from "@/lib/network/types";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

// Public A2A (JSON-RPC 1.0) endpoint, absorbed from PR #1 and extended with
// read-only Agent Network skills. It never executes privileged actions, never
// returns private contacts and never sends email on behalf of callers.

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32_768;
const SUPPORTED_VERSION = "1.0";

type JsonRpcId = string | number | null;
type JsonRpcRequest = { jsonrpc?: string; id?: JsonRpcId; method?: string; params?: Record<string, unknown> };

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
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { status, headers: responseHeaders() });
}

function getParts(params?: Record<string, unknown>) {
  const message = params?.message;
  if (!message || typeof message !== "object" || Array.isArray(message)) return [];
  const parts = (message as { parts?: unknown }).parts;
  return Array.isArray(parts) ? parts.filter((part): part is Record<string, unknown> => Boolean(part) && typeof part === "object" && !Array.isArray(part)) : [];
}

function extractText(params?: Record<string, unknown>) {
  return getParts(params)
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim()
    .slice(0, 2000);
}

function extractData(params?: Record<string, unknown>) {
  for (const part of getParts(params)) {
    const data = part.data;
    if (data && typeof data === "object" && !Array.isArray(data)) return data as Record<string, unknown>;
  }
  return null;
}

function extractContextId(params?: Record<string, unknown>) {
  const message = params?.message as { contextId?: unknown } | undefined;
  return typeof message?.contextId === "string" && message.contextId.length <= 128 ? message.contextId : crypto.randomUUID();
}

function str(value: unknown, max: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function filtersFrom(text: string, data: Record<string, unknown> | null): FeedFilters {
  const lower = text.toLowerCase();
  let type: RequestType | null = null;
  const dataType = str(data?.type, 40);
  if (dataType && (requestTypes as readonly string[]).includes(dataType)) type = dataType as RequestType;
  else if (/\bcompute|gpu|算力/.test(lower)) type = "compute";
  else if (/\bservices?\b|服务/.test(lower)) type = "service";
  else if (/\bjobs?\b|human task|人类任务|工作/.test(lower)) type = "human_task";

  const modeRaw = str(data?.mode, 20) ?? (/\bremote\b|远程/.test(lower) ? "remote" : /\bphysical\b|线下/.test(lower) ? "physical" : null);
  const locationMatch = /\bin ([A-Za-z][A-Za-z .-]{1,40})$/.exec(text.trim());
  return {
    type,
    mode: modeRaw === "remote" || modeRaw === "physical" ? modeRaw : null,
    location: str(data?.location, 80) ?? (locationMatch ? locationMatch[1].trim() : null),
    q: str(data?.q, 120),
    includeInactive: false,
    limit: Math.min(Math.max(Number(data?.limit) || 10, 1), 25),
    offset: 0,
  };
}

function agentMessage(contextId: string, text: string, data?: unknown) {
  const parts: Array<Record<string, unknown>> = [{ text, mediaType: "text/plain" }];
  if (data !== undefined) parts.push({ data, mediaType: "application/json" });
  return {
    messageId: crypto.randomUUID(),
    contextId,
    role: "ROLE_AGENT",
    parts,
    metadata: { node: "agent-network", operator: "AgentArchitect / Jack Lu (Lu Cheng)" },
    extensions: [],
    referenceTaskIds: [],
  };
}

export function GET() {
  return NextResponse.json(
    {
      service: agentDiscoveryProfile.name,
      protocol: "A2A JSON-RPC",
      protocolVersion: SUPPORTED_VERSION,
      agentCard: "/.well-known/agent-card.json",
      supportedMethods: ["SendMessage", "GetExtendedAgentCard"],
      skills: agentDiscoveryProfile.skills.map((skill) => skill.id),
      example: {
        jsonrpc: "2.0",
        id: 1,
        method: "SendMessage",
        params: { message: { role: "ROLE_USER", parts: [{ text: "latest compute requests" }] } },
      },
      note: "Read-only discovery. Publishing and contact unlock use the authenticated REST API in /openapi.json.",
      contact: { email: agentContactEmail, subjectPrefix: agentContactSubjectPrefix },
    },
    { headers: responseHeaders() },
  );
}

export async function POST(request: NextRequest) {
  const rate = consumeRateLimit({ key: `a2a:${getClientIp(request)}`, limit: 60, windowMs: 60_000 });
  if (!rate.allowed) return rpcError(null, -32029, "Rate limit exceeded.", 429);

  const requestedVersion = request.headers.get("A2A-Version");
  if (requestedVersion && requestedVersion !== SUPPORTED_VERSION && requestedVersion !== "0.3") {
    return rpcError(null, -32009, `A2A version ${requestedVersion} is not supported. Use 1.0.`);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return rpcError(null, -32600, "Request body is too large.", 413);
  }

  let body: JsonRpcRequest;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return rpcError(null, -32600, "Request body is too large.", 413);
    body = JSON.parse(raw) as JsonRpcRequest;
  } catch {
    return rpcError(null, -32700, "Parse error.", 400);
  }

  const id = typeof body?.id === "string" || typeof body?.id === "number" ? body.id : null;
  if (body?.jsonrpc !== "2.0" || typeof body.method !== "string") return rpcError(id, -32600, "Invalid JSON-RPC request.", 400);

  if (body.method === "GetExtendedAgentCard" || body.method === "agent/getAuthenticatedExtendedCard") {
    return NextResponse.json({ jsonrpc: "2.0", id, result: agentDiscoveryProfile }, { headers: responseHeaders() });
  }

  if (body.method !== "SendMessage" && body.method !== "message/send") {
    return rpcError(id, -32601, "Method not found. Supported: SendMessage, GetExtendedAgentCard.");
  }

  const text = extractText(body.params);
  const data = extractData(body.params);
  if (!text && !data) return rpcError(id, -32602, "SendMessage requires params.message.parts with a text or data part.");

  const contextId = extractContextId(body.params);
  const lower = text.toLowerCase();
  const skill = str(data?.skill, 40);

  if (skill === "how-to-post" || (!skill && /\b(post|publish|create)\b|发布/.test(lower))) {
    return NextResponse.json(
      { jsonrpc: "2.0", id, result: { message: agentMessage(contextId, buildHowToPostReply(), { api: agentNetworkSummary.api, rules: agentNetworkSummary.rules }) } },
      { headers: responseHeaders() },
    );
  }

  if (skill === "contact-operator" || (!skill && /\b(lu cheng|jack lu|operator|contact)\b|卢成|联系/.test(lower))) {
    return NextResponse.json({ jsonrpc: "2.0", id, result: { message: agentMessage(contextId, buildContactReply()) } }, { headers: responseHeaders() });
  }

  // Default skill: search-requests.
  const filters = filtersFrom(text, data);
  const result = await listRequests(filters);
  const lines = result.requests.map((entry) => {
    const budget = formatBudget(entry);
    return `- [${typeLabel(entry.request_type)}]${entry.is_example ? " [EXAMPLE]" : ""} ${entry.title} — ${entry.location}${budget ? ` — ${budget}` : ""} — ${requestUrl(entry.id)}`;
  });
  const summary = [
    `Agent Network: ${result.requests.length} matching request(s), newest first${result.source === "fallback" ? " (database offline: examples only)" : ""}.`,
    ...lines,
    "Contacts require sign-in: POST /api/v1/requests/{id}/contact. Settlement is off-platform.",
  ].join("\n");

  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id,
      result: { message: agentMessage(contextId, summary, { filters, source: result.source, requests: result.requests.map(toApiRequest) }) },
    },
    { headers: responseHeaders() },
  );
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: responseHeaders() });
}
