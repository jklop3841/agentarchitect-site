import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { NetworkError } from "@/lib/network/db";

// Persistence for V0.2 (agents, claims, messages, rate limits, PoW, visits).
// Server-only: uses the service-role key, which never reaches the browser and is
// never exposed through a NEXT_PUBLIC_* variable. Tests swap in an in-memory store.

export type AgentRow = {
  id: string;
  name: string;
  description: string;
  homepage: string | null;
  a2a_card_url: string | null;
  key_prefix: string;
  status: "unclaimed" | "claimed" | "suspended";
  registered_via: string;
  claimed_by_user_id: string | null;
  claimed_at: string | null;
  last_seen_at: string | null;
  created_at: string;
};

export type MessageRow = {
  id: string;
  to_kind: "operator" | "request";
  request_id: string | null;
  body: string;
  contact: string | null;
  from_name: string | null;
  sender_kind: "agent" | "anonymous";
  sender_agent_id: string | null;
  channel: "rest" | "mcp" | "a2a";
  context_id: string | null;
  flags: string[];
  status: "pending" | "approved" | "rejected" | "spam";
  created_at: string;
  moderated_at: string | null;
};

export type PublicMessage = {
  id: string;
  request_id: string;
  body: string;
  from_name: string | null;
  sender_kind: string;
  agent_name: string | null;
  created_at: string;
};

export type NewMessage = Omit<MessageRow, "id" | "status" | "created_at" | "moderated_at"> & { ip_hash: string | null };

export type AgentRequestInput = {
  request_type: string;
  title: string;
  description: string;
  location: string;
  work_mode: string;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  budget_note: string | null;
  anonymous: boolean;
  expires_at: string | null;
  metadata: Record<string, unknown>;
};

export type PendingRequestRow = {
  id: string;
  title: string;
  description: string;
  request_type: string;
  location: string;
  work_mode: string;
  status: string;
  created_at: string;
  agent_id: string | null;
  agent_name: string | null;
};

export type VisitRow = {
  ts: string;
  path: string;
  method: string;
  user_agent: string | null;
  ip_hash: string | null;
  is_known_ai_bot: boolean;
  bot_name: string | null;
  agent_endpoint: boolean;
  referer_host: string | null;
};

export type RateResult = { allowed: boolean; hits: number; reset_at: string };

export interface AgentStore {
  rateLimitHit(bucket: string, key: string, windowSeconds: number, max: number): Promise<RateResult>;
  rateLimitPeek(bucket: string, key: string, windowSeconds: number): Promise<number>;
  consumePow(challengeHash: string, expiresAt: string): Promise<boolean>;
  registerAgent(input: {
    name: string;
    description: string;
    homepage: string | null;
    a2a_card_url: string | null;
    key_hash: string;
    key_prefix: string;
    claim_token_hash: string;
    claim_expires_at: string;
    ip_hash: string;
    via: "rest" | "mcp" | "a2a";
  }): Promise<string>;
  findAgentByKeyHash(keyHash: string): Promise<AgentRow | null>;
  touchAgent(id: string): Promise<void>;
  getAgentByClaimToken(tokenHash: string): Promise<{ agent: AgentRow; expires_at: string; used_at: string | null } | null>;
  claimAgent(tokenHash: string, userId: string): Promise<string>;
  createAgentRequest(agentId: string, input: AgentRequestInput): Promise<string>;
  getRequestModeration(id: string): Promise<{ id: string; status: string; source: string; agent_id: string | null } | null>;
  requestIsPublic(id: string): Promise<boolean>;
  createMessage(input: NewMessage): Promise<string>;
  getMessage(id: string): Promise<MessageRow | null>;
  listMessages(status: MessageRow["status"] | "all", limit: number): Promise<MessageRow[]>;
  listPublicMessages(requestId: string, limit: number): Promise<PublicMessage[]>;
  setMessageStatus(id: string, status: "approved" | "rejected" | "spam"): Promise<boolean>;
  listPendingRequests(limit: number): Promise<PendingRequestRow[]>;
  setRequestStatus(id: string, status: "active" | "removed"): Promise<boolean>;
  insertVisit(visit: VisitRow): Promise<void>;
  listVisits(limit: number): Promise<VisitRow[]>;
  visitCounts(sinceIso: string): Promise<Array<{ bot_name: string; count: number }>>;
  schemaStatus(): Promise<Record<string, boolean>>;
}

const notMigratedCodes = ["PGRST205", "PGRST202", "PGRST200", "PGRST204", "42P01", "42883", "42703"];

type PgError = { code?: string; message?: string } | null;

export function toStoreError(error: PgError): NetworkError {
  const code = error?.code ?? "";
  const message = error?.message ?? "";
  if (notMigratedCodes.includes(code) || /does not exist|schema cache/i.test(message)) {
    return new NetworkError("not_migrated", 503, "The V0.2 database migration is not applied yet.");
  }
  if (/claim_invalid_or_used/.test(message)) return new NetworkError("claim_invalid", 404, "Claim link is invalid, expired or already used.");
  if (/contact_not_verified/.test(message)) return new NetworkError("contact_not_verified", 403, "Verify your email first.");
  if (/agent_not_found/.test(message)) return new NetworkError("invalid_api_key", 401, "Agent not found or suspended.");
  if (/invalid_expires_at/.test(message)) return new NetworkError("invalid_expires_at", 400, "expires_at must be in the future and within 180 days.");
  if (/check constraint|violates|invalid input syntax/.test(message)) return new NetworkError("invalid_input", 400, "Input failed validation.");
  if (code === "23505") return new NetworkError("conflict", 409, "Conflict. Try again.");
  console.error("[agents.store] unexpected database error", code, message.slice(0, 200));
  return new NetworkError("database_error", 500, "Unexpected database error.");
}

function unwrap<T>(result: { data: T | null; error: PgError }): T {
  if (result.error) throw toStoreError(result.error);
  return result.data as T;
}

export function getServiceConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

const agentColumns = "id, name, description, homepage, a2a_card_url, key_prefix, status, registered_via, claimed_by_user_id, claimed_at, last_seen_at, created_at";
const messageColumns = "id, to_kind, request_id, body, contact, from_name, sender_kind, sender_agent_id, channel, context_id, flags, status, created_at, moderated_at";

function windowStart(windowSeconds: number, now = Date.now()) {
  const seconds = Math.floor(now / 1000);
  return new Date((seconds - (seconds % windowSeconds)) * 1000).toISOString();
}

export class SupabaseAgentStore implements AgentStore {
  constructor(private db: SupabaseClient) {}

  async rateLimitHit(bucket: string, key: string, windowSeconds: number, max: number) {
    const rows = unwrap(
      await this.db.rpc("aa_rate_limit_hit", { p_bucket: bucket, p_key: key, p_window_seconds: windowSeconds, p_max: max }),
    ) as RateResult[];
    return rows[0];
  }

  async rateLimitPeek(bucket: string, key: string, windowSeconds: number) {
    const row = unwrap(
      await this.db.from("rate_limits").select("hits").eq("bucket", bucket).eq("key", key).eq("window_start", windowStart(windowSeconds)).maybeSingle(),
    ) as { hits: number } | null;
    return row?.hits ?? 0;
  }

  async consumePow(challengeHash: string, expiresAt: string) {
    return unwrap(await this.db.rpc("aa_pow_consume", { p_challenge_hash: challengeHash, p_expires_at: expiresAt })) as boolean;
  }

  async registerAgent(input: Parameters<AgentStore["registerAgent"]>[0]) {
    return unwrap(
      await this.db.rpc("aa_register_agent", {
        p_name: input.name,
        p_description: input.description,
        p_homepage: input.homepage,
        p_a2a_card_url: input.a2a_card_url,
        p_key_hash: input.key_hash,
        p_key_prefix: input.key_prefix,
        p_claim_token_hash: input.claim_token_hash,
        p_claim_expires_at: input.claim_expires_at,
        p_ip_hash: input.ip_hash,
        p_via: input.via,
      }),
    ) as string;
  }

  async findAgentByKeyHash(keyHash: string) {
    return unwrap(await this.db.from("agents").select(agentColumns).eq("key_hash", keyHash).maybeSingle()) as AgentRow | null;
  }

  async touchAgent(id: string) {
    await this.db.from("agents").update({ last_seen_at: new Date().toISOString() }).eq("id", id);
  }

  async getAgentByClaimToken(tokenHash: string) {
    const row = unwrap(
      await this.db.from("agent_claims").select(`expires_at, used_at, agent:agents(${agentColumns})`).eq("token_hash", tokenHash).maybeSingle(),
    ) as { expires_at: string; used_at: string | null; agent: AgentRow | AgentRow[] | null } | null;
    if (!row) return null;
    const agent = Array.isArray(row.agent) ? row.agent[0] : row.agent;
    return agent ? { agent, expires_at: row.expires_at, used_at: row.used_at } : null;
  }

  async claimAgent(tokenHash: string, userId: string) {
    return unwrap(await this.db.rpc("aa_claim_agent", { p_token_hash: tokenHash, p_user_id: userId })) as string;
  }

  async createAgentRequest(agentId: string, input: AgentRequestInput) {
    return unwrap(
      await this.db.rpc("aa_create_agent_request", {
        p_agent_id: agentId,
        p_request_type: input.request_type,
        p_title: input.title,
        p_description: input.description,
        p_location: input.location,
        p_work_mode: input.work_mode,
        p_budget_min: input.budget_min,
        p_budget_max: input.budget_max,
        p_currency: input.currency,
        p_budget_note: input.budget_note,
        p_is_anonymous: input.anonymous,
        p_expires_at: input.expires_at,
        p_metadata: input.metadata,
      }),
    ) as string;
  }

  async getRequestModeration(id: string) {
    return unwrap(await this.db.from("requests").select("id, status, source, agent_id").eq("id", id).maybeSingle()) as {
      id: string;
      status: string;
      source: string;
      agent_id: string | null;
    } | null;
  }

  async requestIsPublic(id: string) {
    const row = unwrap(await this.db.from("public_requests").select("id, status").eq("id", id).maybeSingle()) as { status: string } | null;
    return Boolean(row);
  }

  async createMessage(input: NewMessage) {
    const row = unwrap(await this.db.from("messages").insert(input).select("id").single()) as { id: string };
    return row.id;
  }

  async getMessage(id: string) {
    return unwrap(await this.db.from("messages").select(messageColumns).eq("id", id).maybeSingle()) as MessageRow | null;
  }

  async listMessages(status: MessageRow["status"] | "all", limit: number) {
    let query = this.db.from("messages").select(messageColumns).order("created_at", { ascending: false }).limit(limit);
    if (status !== "all") query = query.eq("status", status);
    return (unwrap(await query) as MessageRow[]) ?? [];
  }

  async listPublicMessages(requestId: string, limit: number) {
    return (unwrap(
      await this.db.from("public_messages").select("*").eq("request_id", requestId).order("created_at", { ascending: true }).limit(limit),
    ) as PublicMessage[]) ?? [];
  }

  // Moderation writes an audit event (best effort) and reports whether a row matched.
  private async audit(eventType: string, requestId: string | null, metadata: Record<string, unknown>) {
    const { error } = await this.db.from("events").insert({ event_type: eventType, request_id: requestId, metadata });
    if (error) console.error("[agents.store] moderation event failed", error.code);
  }

  async setMessageStatus(id: string, status: "approved" | "rejected" | "spam") {
    const rows = unwrap(
      await this.db.from("messages").update({ status, moderated_at: new Date().toISOString() }).eq("id", id).select("id, request_id"),
    ) as Array<{ id: string; request_id: string | null }>;
    if (!rows?.length) return false;
    await this.audit(status === "approved" ? "message_approved" : "message_rejected", rows[0].request_id, { message_id: id, status });
    return true;
  }

  async listPendingRequests(limit: number) {
    const rows = (unwrap(
      await this.db
        .from("requests")
        .select("id, title, description, request_type, location, work_mode, status, created_at, agent_id, agent:agents(name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(limit),
    ) as Array<Omit<PendingRequestRow, "agent_name"> & { agent: { name: string } | { name: string }[] | null }>) ?? [];
    return rows.map(({ agent, ...rest }) => ({ ...rest, agent_name: (Array.isArray(agent) ? agent[0]?.name : agent?.name) ?? null }));
  }

  async setRequestStatus(id: string, status: "active" | "removed") {
    const rows = unwrap(await this.db.from("requests").update({ status }).eq("id", id).eq("status", "pending").select("id")) as Array<{ id: string }>;
    if (!rows?.length) return false;
    await this.audit(status === "active" ? "request_approved" : "request_rejected", id, { status });
    return true;
  }

  async insertVisit(visit: VisitRow) {
    unwrap(await this.db.from("agent_visits").insert(visit));
  }

  async listVisits(limit: number) {
    return (unwrap(
      await this.db
        .from("agent_visits")
        .select("ts, path, method, user_agent, ip_hash, is_known_ai_bot, bot_name, agent_endpoint, referer_host")
        .order("ts", { ascending: false })
        .limit(limit),
    ) as VisitRow[]) ?? [];
  }

  async visitCounts(sinceIso: string) {
    // Bounded scan; fine at V0.2 volumes (sampling keeps human traffic small).
    const rows = (unwrap(
      await this.db.from("agent_visits").select("bot_name, agent_endpoint").gte("ts", sinceIso).order("ts", { ascending: false }).limit(20_000),
    ) as Array<{ bot_name: string | null; agent_endpoint: boolean }>) ?? [];
    const counts = new Map<string, number>();
    for (const row of rows) {
      const name = row.bot_name ?? (row.agent_endpoint ? "(agent endpoint, unknown UA)" : "(other)");
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()].map(([bot_name, count]) => ({ bot_name, count })).sort((a, b) => b.count - a.count);
  }

  async schemaStatus() {
    const probes: Record<string, () => PromiseLike<{ error: PgError }>> = {
      agents: () => this.db.from("agents").select("id", { head: true, count: "exact" }).limit(1),
      agent_claims: () => this.db.from("agent_claims").select("token_hash", { head: true }).limit(1),
      messages: () => this.db.from("messages").select("id", { head: true }).limit(1),
      rate_limits: () => this.db.from("rate_limits").select("bucket", { head: true }).limit(1),
      pow_used: () => this.db.from("pow_used").select("challenge_hash", { head: true }).limit(1),
      agent_visits: () => this.db.from("agent_visits").select("id", { head: true }).limit(1),
      requests_source_columns: () => this.db.from("requests").select("source, verified, agent_id", { head: true }).limit(1),
    };
    const entries = await Promise.all(
      Object.entries(probes).map(async ([name, probe]) => {
        try {
          const { error } = await probe();
          return [name, !error] as const;
        } catch {
          return [name, false] as const;
        }
      }),
    );
    return Object.fromEntries(entries);
  }
}

let override: AgentStore | null | undefined;

// Test hook: inject an in-memory store (or null to simulate "not configured").
export function setAgentStore(store: AgentStore | null | undefined) {
  override = store;
}

export function getAgentStore(): AgentStore | null {
  if (override !== undefined) return override;
  const config = getServiceConfig();
  if (!config) return null;
  return new SupabaseAgentStore(
    createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }),
  );
}

export function requireAgentStore(): AgentStore {
  const store = getAgentStore();
  if (!store) {
    throw new NetworkError("not_configured", 503, "Agent onboarding is not configured on this deployment (server key missing).");
  }
  return store;
}
