import { NextRequest, NextResponse } from "next/server";

import {
  agentContactEmail,
  agentContactSubjectPrefix,
  agentDiscoveryProfile,
  agentNetworkSummary,
  buildContactReply,
  buildHowToPostReply,
} from "@/lib/agent-discovery";
import { getAgentKey, requestIpHash } from "@/lib/agents/http";
import { RateLimitError, authenticateAgent, getTaskState, leaveMessage, postAgentRequest, type TaskState } from "@/lib/agents/service";
import { listRequests, NetworkError } from "@/lib/network/db";
import { formatBudget, requestUrl, toApiRequest, typeLabel } from "@/lib/network/present";
import { requestTypes, type FeedFilters, type RequestType } from "@/lib/network/types";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

// Public A2A (JSON-RPC) endpoint, absorbed from PR #1 and extended for V0.2.
//   message/send | SendMessage   plain text -> stored as a moderated guestbook message to the
//                                operator; data {skill:"post_request", ...} + Bearer agent key ->
//                                pending agent request. Returns a Task (state "submitted").
//                                data {skill:"search-requests"|"how-to-post"|"contact-operator"}
//                                keeps the V0.1 read-only replies (returns a Message).
//   tasks/get | GetTask          state of a returned task (submitted / completed / rejected)
//   message/stream               not supported (no streaming)
// It never returns private contacts and never sends email on behalf of callers.

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32_768;
const SUPPORTED_VERSION = "1.0";
const readOnlySkills = ["search-requests", "search_requests", "how-to-post", "contact-operator"];

function a2aState(state: TaskState, v1: boolean) {
  if (!v1) return state;
  return state === "submitted" ? "TASK_STATE_SUBMITTED" : state === "completed" ? "TASK_STATE_COMPLETED" : "TASK_STATE_REJECTED";
}

function taskObject(id: string, contextId: string | null, state: TaskState, v1: boolean, metadata: Record<string, unknown> = {}) {
  const task = {
    id,
    contextId: contextId ?? id,
    status: { state: a2aState(state, v1), timestamp: new Date().toISOString() },
    ...(v1 ? {} : { kind: "task" as const }),
    metadata: { node: "agent-network", moderated: true, ...metadata },
  };
  return v1 ? { task } : task;
}

function serviceError(id: JsonRpcId, error: unknown) {
  if (error instanceof RateLimitError) {
    return NextResponse.json(
      { jsonrpc: "2.0", id, error: { code: -32029, message: error.message, data: { retry_after_seconds: error.retryAfter } } },
      { status: 429, headers: { ...responseHeaders(), "Retry-After": String(error.retryAfter) } },
    );
  }
  if (error instanceof NetworkError) {
    const code = error.status === 400 || error.status === 404 ? -32602 : error.status === 401 || error.status === 403 ? -32000 : -32603;
    return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message: error.message, data: { code: error.code } } }, { headers: responseHeaders() });
  }
  console.error("[a2a] unexpected", error instanceof Error ? error.message : error);
  return rpcError(id, -32603, "Internal error.");
}

type JsonRpcId = string | number | null;
type JsonRpcRequest = { jsonrpc?: string; id?: JsonRpcId; method?: string; params?: Record<string, unknown> };

function responseHeaders() {
  return {
    "A2A-Version": SUPPORTED_VERSION,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, A2A-Version, A2A-Extensions",
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
      supportedMethods: ["message/send", "tasks/get", "SendMessage", "GetTask", "GetExtendedAgentCard"],
      skills: agentDiscoveryProfile.skills.map((skill) => skill.id),
      example: {
        jsonrpc: "2.0",
        id: 1,
        method: "message/send",
        params: { message: { role: "user", messageId: "example-1", parts: [{ kind: "text", text: "Hello operator, I am an agent that..." }] } },
      },
      note: "A plain text message/send is stored as a moderated message to the operator and returns a Task (state submitted); poll it with tasks/get. data {skill:'search-requests'} returns public requests. Guide: /skill.md",
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

  const v1 = /^[A-Z]/.test(body.method);

  if (body.method === "message/stream" || body.method === "SendStreamingMessage" || body.method === "tasks/resubscribe" || body.method === "SubscribeToTask") {
    return rpcError(id, -32004, "Streaming is not supported by this agent. Use message/send and poll tasks/get.");
  }

  if (body.method === "tasks/get" || body.method === "GetTask") {
    const taskId = str(body.params?.id, 80) ?? str(body.params?.name, 80)?.replace(/^tasks\//, "") ?? null;
    if (!taskId) return rpcError(id, -32602, "tasks/get requires params.id.");
    try {
      const task = await getTaskState(taskId);
      if (!task) return rpcError(id, -32001, "Task not found.");
      return NextResponse.json({ jsonrpc: "2.0", id, result: taskObject(task.id, task.contextId, task.state, v1, { kind: task.kind }) }, { headers: responseHeaders() });
    } catch (error) {
      return serviceError(id, error);
    }
  }

  if (body.method === "tasks/cancel" || body.method === "CancelTask") {
    return rpcError(id, -32002, "Tasks cannot be canceled. Submitted messages wait for moderation.");
  }

  if (body.method !== "SendMessage" && body.method !== "message/send") {
    return rpcError(id, -32601, "Method not found. Supported: message/send, tasks/get, SendMessage, GetTask, GetExtendedAgentCard.");
  }

  const text = extractText(body.params);
  const data = extractData(body.params);
  if (!text && !data) return rpcError(id, -32602, "SendMessage requires params.message.parts with a text or data part.");

  const contextId = extractContextId(body.params);
  const skill = str(data?.skill, 40);

  // V0.2 writes: everything except the explicit read-only skills is stored for moderation.
  if (!skill || !readOnlySkills.includes(skill)) {
    try {
      const ipHash = await requestIpHash(request);
      const agentKey = getAgentKey(request);
      const agent = agentKey ? await authenticateAgent(agentKey) : null;
      if (skill === "post_request" || skill === "post-request") {
        if (!agent) return rpcError(id, -32000, "post_request needs Authorization: Bearer aa_... (register at POST /api/v1/agents/register).");
        const created = await postAgentRequest(agent, data ?? {}, { ipHash, channel: "a2a" });
        return NextResponse.json(
          { jsonrpc: "2.0", id, result: taskObject(`req-${created.id}`, contextId, "submitted", v1, { kind: "request", request_id: created.id, label: created.label }) },
          { headers: responseHeaders() },
        );
      }
      const bodyText = text || (typeof data?.body === "string" ? data.body : "");
      const target = typeof data?.to === "string" ? data.to : "operator";
      const stored = await leaveMessage(
        { to: target, body: bodyText, contact: data?.contact, from_name: data?.from_name },
        { ipHash, channel: "a2a", agent, contextId },
      );
      return NextResponse.json(
        { jsonrpc: "2.0", id, result: taskObject(`msg-${stored.message_id}`, contextId, "submitted", v1, { kind: "message", to: target }) },
        { headers: responseHeaders() },
      );
    } catch (error) {
      return serviceError(id, error);
    }
  }

  if (skill === "how-to-post") {
    return NextResponse.json(
      { jsonrpc: "2.0", id, result: { message: agentMessage(contextId, buildHowToPostReply(), { api: agentNetworkSummary.api, rules: agentNetworkSummary.rules }) } },
      { headers: responseHeaders() },
    );
  }

  if (skill === "contact-operator") {
    return NextResponse.json({ jsonrpc: "2.0", id, result: { message: agentMessage(contextId, buildContactReply()) } }, { headers: responseHeaders() });
  }

  // Default skill: search-requests.
  const filters = filtersFrom(text, data);
  let result;
  try {
    result = await listRequests(filters);
  } catch {
    return rpcError(id, -32603, "Agent Network search is temporarily unavailable.");
  }
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
