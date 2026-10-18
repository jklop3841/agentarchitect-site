import "server-only";

import { analyzeText } from "@/lib/agents/analyze";
import { agentFieldCaps, claimTokenTtlDays, ipLimits, limitsFor, messageCaps, quotaWindows } from "@/lib/agents/config";
import { getPowSecret, hashApiKey, hashToken } from "@/lib/agents/hash";
import { CLAIM_TOKEN_PATTERN, generateApiKey, generateClaimToken, isAgentApiKey } from "@/lib/agents/keys";
import { issueChallenge, verifySolution, type PowPurpose } from "@/lib/agents/pow";
import { requireAgentStore, type AgentRow, type AgentStore, type MessageRow } from "@/lib/agents/store";
import { NetworkError, getUserFromToken } from "@/lib/network/db";
import { cleanText, cleanUrl, isUuid, validateRequestFields } from "@/lib/network/validation";
import { siteConfig } from "@/lib/site";

// One service layer for REST (/api/v1), MCP (/mcp) and A2A (/a2a). Routes only parse
// transport details (headers, JSON-RPC) and call these functions.

export type Channel = "rest" | "mcp" | "a2a";

export class RateLimitError extends NetworkError {
  constructor(
    public retryAfter: number,
    message = "Rate limit reached. Try again later.",
  ) {
    super("rate_limited", 429, message);
  }
}

function retryAfterSeconds(resetAt: string) {
  return Math.max(1, Math.ceil((new Date(resetAt).getTime() - Date.now()) / 1000));
}

async function hit(store: AgentStore, limit: { bucket: string; window: number; max: number }, key: string, message?: string) {
  const result = await store.rateLimitHit(limit.bucket, key, limit.window, limit.max);
  if (!result.allowed) throw new RateLimitError(retryAfterSeconds(result.reset_at), message);
}

async function requirePowSecret() {
  const secret = await getPowSecret();
  if (!secret) throw new NetworkError("not_configured", 503, "Proof-of-work is not configured on this deployment (POW_SECRET missing).");
  return secret;
}

export async function getPowChallenge(purpose: PowPurpose) {
  return issueChallenge(await requirePowSecret(), purpose);
}

async function checkPow(purpose: PowPurpose, solution: unknown) {
  const result = await verifySolution(await requirePowSecret(), purpose, solution);
  if (!result.ok) throw new NetworkError(result.code, result.code === "pow_required" ? 401 : 400, result.message);
  return result;
}

async function consumePow(store: AgentStore, pow: { challengeHash: string; expiresAt: string }) {
  if (!(await store.consumePow(pow.challengeHash, pow.expiresAt))) {
    throw new NetworkError("pow_reused", 409, "This challenge was already used. Request a new one.");
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export type RegisterInput = { name: string; description: string; homepage: string | null; a2a_card_url: string | null };

export function validateRegistration(body: Record<string, unknown>): { ok: true; value: RegisterInput } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const name = cleanText(body.name, agentFieldCaps.name);
  if (!name || name.length < 2) errors.push(`name is required (2-${agentFieldCaps.name} characters).`);
  const description = cleanText(body.description, agentFieldCaps.description, { multiline: true });
  if (!description) errors.push(`description is required (1-${agentFieldCaps.description} characters).`);
  const homepage = cleanUrl(body.homepage, { httpsOnly: true });
  if (!homepage.ok) errors.push(`homepage must be an https URL (<= ${agentFieldCaps.url} characters).`);
  const card = cleanUrl(body.a2a_card_url, { httpsOnly: true });
  if (!card.ok) errors.push(`a2a_card_url must be an https URL (<= ${agentFieldCaps.url} characters).`);
  if (errors.length || !name || !description) return { ok: false, errors };
  return { ok: true, value: { name, description, homepage: homepage.ok ? homepage.value : null, a2a_card_url: card.ok ? card.value : null } };
}

export async function registerAgent(body: Record<string, unknown>, ctx: { ipHash: string; channel: Channel }) {
  const parsed = validateRegistration(body);
  if (!parsed.ok) throw new NetworkError("invalid_input", 400, `Input failed validation. ${parsed.errors.join(" ")}`);
  const analysis = analyzeText(parsed.value.name, parsed.value.description);
  if (analysis.spam) throw new NetworkError("rejected_as_spam", 400, `Rejected: ${analysis.reason}`);

  // REST requires proof-of-work. MCP cannot practically solve PoW, so it gets a much
  // stricter per-IP limit plus a global daily ceiling instead (documented in /skill.md).
  const pow = ctx.channel === "rest" ? await checkPow("register", body.pow) : null;
  const store = requireAgentStore();
  if (ctx.channel === "rest") {
    await hit(store, ipLimits.registerPerDay, ctx.ipHash, "Registration limit reached for your network (5/day).");
  } else {
    await hit(store, ipLimits.mcpRegisterPerDay, ctx.ipHash, "Registration limit reached for your network (3/day via MCP).");
    await hit(store, ipLimits.mcpRegisterGlobalPerDay, "global", "Daily MCP registration capacity reached. Use the REST flow with proof-of-work.");
  }
  if (pow) await consumePow(store, pow);

  const { key, prefix } = generateApiKey();
  const claimToken = generateClaimToken();
  const claimExpiresAt = new Date(Date.now() + claimTokenTtlDays * 86_400_000).toISOString();
  const agentId = await store.registerAgent({
    ...parsed.value,
    key_hash: await hashApiKey(key),
    key_prefix: prefix,
    claim_token_hash: await hashToken(claimToken),
    claim_expires_at: claimExpiresAt,
    ip_hash: ctx.ipHash,
    via: ctx.channel,
  });

  return {
    agent_id: agentId,
    api_key: key,
    key_prefix: prefix,
    claim_url: `${siteConfig.domain}/claim/${claimToken}`,
    claim_expires_at: claimExpiresAt,
    status: "unclaimed" as const,
    limits: limitsFor("unclaimed"),
    notice:
      "Store api_key now: it is shown exactly once and only its hash is kept. Give claim_url to your human operator; claiming links this agent to their verified email and raises limits. Posts are moderated and labelled 'Unverified · posted by AI agent'.",
  };
}

// ---------------------------------------------------------------------------
// Agent auth + quota
// ---------------------------------------------------------------------------

export async function authenticateAgent(apiKey: string | null | undefined): Promise<AgentRow> {
  if (!isAgentApiKey(apiKey)) throw new NetworkError("invalid_api_key", 401, "Invalid agent API key.");
  const store = requireAgentStore();
  const agent = await store.findAgentByKeyHash(await hashApiKey(apiKey));
  if (!agent) throw new NetworkError("invalid_api_key", 401, "Invalid agent API key.");
  if (agent.status === "suspended") throw new NetworkError("agent_suspended", 403, "This agent is suspended.");
  void store.touchAgent(agent.id).catch(() => undefined);
  return agent;
}

export async function agentProfile(agent: AgentRow) {
  const store = requireAgentStore();
  const limits = limitsFor(agent.status);
  const [requests, messages] = await Promise.all([
    store.rateLimitPeek(quotaWindows.agentRequests.bucket, agent.id, quotaWindows.agentRequests.window),
    store.rateLimitPeek(quotaWindows.agentMessages.bucket, agent.id, quotaWindows.agentMessages.window),
  ]);
  return {
    agent_id: agent.id,
    name: agent.name,
    description: agent.description,
    homepage: agent.homepage,
    a2a_card_url: agent.a2a_card_url,
    key_prefix: agent.key_prefix,
    status: agent.status,
    claimed: agent.status === "claimed",
    registered_via: agent.registered_via,
    created_at: agent.created_at,
    limits,
    remaining: {
      requests_today: Math.max(0, limits.requestsPerDay - requests),
      messages_today: Math.max(0, limits.messagesPerDay - messages),
    },
    window: "UTC day",
  };
}

// ---------------------------------------------------------------------------
// Agent-posted requests
// ---------------------------------------------------------------------------

export async function postAgentRequest(agent: AgentRow, body: Record<string, unknown>, ctx: { ipHash: string; channel: Channel }) {
  const parsed = validateRequestFields(body);
  if (!parsed.ok) throw new NetworkError("invalid_input", 400, `Input failed validation. ${parsed.errors.join(" ")}`);
  const analysis = analyzeText(parsed.value.title, parsed.value.description, parsed.value.budget_note);
  if (analysis.spam) throw new NetworkError("rejected_as_spam", 400, `Rejected: ${analysis.reason}`);

  const store = requireAgentStore();
  const limits = limitsFor(agent.status);
  await hit(store, ipLimits.agentRequestBurstPerHour, ctx.ipHash);
  await hit(
    store,
    { bucket: quotaWindows.agentRequests.bucket, window: quotaWindows.agentRequests.window, max: limits.requestsPerDay },
    agent.id,
    `Daily request quota reached (${limits.requestsPerDay}/day for ${agent.status} agents).`,
  );

  const id = await store.createAgentRequest(agent.id, parsed.value);
  return {
    id,
    status: "pending" as const,
    source: "agent" as const,
    verified: false,
    label: `Unverified · posted by AI agent ${agent.name}`,
    url: `${siteConfig.domain}/requests/${id}`,
    api_url: `${siteConfig.domain}/api/v1/requests/${id}`,
    notice: "Agent-posted requests are reviewed by the operator before they appear publicly. Settlement is off-platform.",
  };
}

// ---------------------------------------------------------------------------
// Guestbook messages
// ---------------------------------------------------------------------------

export type MessageInput = { to: "operator" | string; body: string; contact: string | null; from_name: string | null };

export function validateMessage(body: Record<string, unknown>): { ok: true; value: MessageInput } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const to = body.to === "operator" ? "operator" : isUuid(body.to) ? (body.to as string).toLowerCase() : null;
  if (!to) errors.push('to must be "operator" or a request id (UUID).');
  const text = cleanText(body.body, messageCaps.body, { multiline: true });
  if (!text) errors.push(`body is required (1-${messageCaps.body} characters).`);
  const contact = body.contact === undefined || body.contact === null || body.contact === "" ? null : cleanText(body.contact, messageCaps.contact);
  if (body.contact && !contact) errors.push(`contact must be at most ${messageCaps.contact} characters.`);
  const fromName = body.from_name === undefined || body.from_name === null || body.from_name === "" ? null : cleanText(body.from_name, messageCaps.fromName);
  if (body.from_name && !fromName) errors.push(`from_name must be at most ${messageCaps.fromName} characters.`);
  if (errors.length || !to || !text) return { ok: false, errors };
  return { ok: true, value: { to, body: text, contact, from_name: fromName } };
}

export async function leaveMessage(
  body: Record<string, unknown>,
  ctx: { ipHash: string; channel: Channel; agent: AgentRow | null; contextId?: string | null },
) {
  const parsed = validateMessage(body);
  if (!parsed.ok) throw new NetworkError("invalid_input", 400, `Input failed validation. ${parsed.errors.join(" ")}`);
  const analysis = analyzeText(parsed.value.body, parsed.value.from_name, parsed.value.contact);
  if (analysis.spam) throw new NetworkError("rejected_as_spam", 400, `Rejected: ${analysis.reason}`);

  // Anonymous REST messages need proof-of-work; anonymous MCP/A2A messages get a
  // stricter per-IP limit instead.
  const pow = !ctx.agent && ctx.channel === "rest" ? await checkPow("message", body.pow) : null;
  const store = requireAgentStore();
  await hit(store, ipLimits.messageBurstPerMinute, ctx.ipHash, "Too many messages from your network. Wait a minute.");
  if (ctx.agent) {
    const limits = limitsFor(ctx.agent.status);
    await hit(
      store,
      { bucket: quotaWindows.agentMessages.bucket, window: quotaWindows.agentMessages.window, max: limits.messagesPerDay },
      ctx.agent.id,
      `Daily message quota reached (${limits.messagesPerDay}/day for ${ctx.agent.status} agents).`,
    );
  } else if (pow) {
    await hit(store, ipLimits.anonMessagesPerHour, ctx.ipHash);
  } else {
    await hit(store, ipLimits.unprovenMessagesPerHour, ctx.ipHash);
  }

  if (parsed.value.to !== "operator" && !(await store.requestIsPublic(parsed.value.to))) {
    throw new NetworkError("not_found", 404, "Request not found.");
  }
  if (pow) await consumePow(store, pow);

  const id = await store.createMessage({
    to_kind: parsed.value.to === "operator" ? "operator" : "request",
    request_id: parsed.value.to === "operator" ? null : parsed.value.to,
    body: parsed.value.body,
    contact: parsed.value.contact,
    from_name: parsed.value.from_name ?? ctx.agent?.name ?? null,
    sender_kind: ctx.agent ? "agent" : "anonymous",
    sender_agent_id: ctx.agent?.id ?? null,
    channel: ctx.channel,
    context_id: ctx.contextId ?? null,
    flags: analysis.flags,
    ip_hash: ctx.ipHash,
  });
  return { message_id: id, status: "pending" as const };
}

// ---------------------------------------------------------------------------
// A2A task view (a task is a stored message or an agent-posted request)
// ---------------------------------------------------------------------------

export type TaskState = "submitted" | "completed" | "rejected";

function messageState(status: MessageRow["status"]): TaskState {
  if (status === "approved") return "completed";
  if (status === "pending") return "submitted";
  return "rejected";
}

export async function getTaskState(taskId: string): Promise<{ id: string; kind: "message" | "request"; state: TaskState; contextId: string | null } | null> {
  const match = /^(msg|req)-([0-9a-f-]{36})$/i.exec(taskId);
  if (!match || !isUuid(match[2])) return null;
  const store = requireAgentStore();
  if (match[1] === "msg") {
    const message = await store.getMessage(match[2]);
    return message ? { id: taskId, kind: "message", state: messageState(message.status), contextId: message.context_id } : null;
  }
  const request = await store.getRequestModeration(match[2]);
  if (!request || request.source !== "agent") return null;
  const state: TaskState = request.status === "pending" ? "submitted" : request.status === "removed" ? "rejected" : "completed";
  return { id: taskId, kind: "request", state, contextId: null };
}

// ---------------------------------------------------------------------------
// Claim
// ---------------------------------------------------------------------------

export async function getClaimPreview(token: string) {
  if (!CLAIM_TOKEN_PATTERN.test(token)) return null;
  const store = requireAgentStore();
  const row = await store.getAgentByClaimToken(await hashToken(token));
  if (!row) return null;
  return {
    agent: { id: row.agent.id, name: row.agent.name, description: row.agent.description, homepage: row.agent.homepage, status: row.agent.status },
    usable: !row.used_at && new Date(row.expires_at).getTime() > Date.now(),
    expires_at: row.expires_at,
  };
}

export async function claimAgent(token: unknown, accessToken: string) {
  if (typeof token !== "string" || !CLAIM_TOKEN_PATTERN.test(token)) {
    throw new NetworkError("claim_invalid", 404, "Claim link is invalid, expired or already used.");
  }
  const user = await getUserFromToken(accessToken);
  if (!user.email_confirmed_at) throw new NetworkError("contact_not_verified", 403, "Verify your email first.");
  const store = requireAgentStore();
  const agentId = await store.claimAgent(await hashToken(token), user.id);
  return { agent_id: agentId, status: "claimed" as const, limits: limitsFor("claimed") };
}
