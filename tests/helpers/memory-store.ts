import { exampleRequests } from "@/lib/network/examples";
import type { AgentRequestInput, AgentRow, AgentStore, MessageRow, NewMessage, PendingRequestRow, PublicMessage, RateResult, VisitRow } from "@/lib/agents/store";

// In-memory AgentStore that mirrors the SQL semantics closely enough for route tests.
export class MemoryStore implements AgentStore {
  agents = new Map<string, AgentRow & { key_hash: string; created_ip_hash: string }>();
  claims = new Map<string, { agent_id: string; expires_at: string; used_at: string | null; used_by: string | null }>();
  rate = new Map<string, number>();
  pow = new Set<string>();
  messages = new Map<string, MessageRow & { ip_hash: string | null }>();
  requests = new Map<string, AgentRequestInput & { id: string; status: string; source: string; agent_id: string; created_at: string }>();
  visits: VisitRow[] = [];
  publicRequestIds = new Set(exampleRequests.map((request) => request.id));
  verifiedUsers = new Set<string>();
  calls: string[] = [];

  private windowStart(windowSeconds: number) {
    const seconds = Math.floor(Date.now() / 1000);
    return seconds - (seconds % windowSeconds);
  }

  async rateLimitHit(bucket: string, key: string, windowSeconds: number, max: number): Promise<RateResult> {
    const start = this.windowStart(windowSeconds);
    const id = `${bucket}|${key}|${start}`;
    const hits = (this.rate.get(id) ?? 0) + 1;
    this.rate.set(id, hits);
    return { allowed: hits <= max, hits, reset_at: new Date((start + windowSeconds) * 1000).toISOString() };
  }

  async rateLimitPeek(bucket: string, key: string, windowSeconds: number) {
    return this.rate.get(`${bucket}|${key}|${this.windowStart(windowSeconds)}`) ?? 0;
  }

  async consumePow(challengeHash: string) {
    if (this.pow.has(challengeHash)) return false;
    this.pow.add(challengeHash);
    return true;
  }

  async registerAgent(input: Parameters<AgentStore["registerAgent"]>[0]) {
    const id = crypto.randomUUID();
    this.agents.set(id, {
      id,
      name: input.name,
      description: input.description,
      homepage: input.homepage,
      a2a_card_url: input.a2a_card_url,
      key_prefix: input.key_prefix,
      key_hash: input.key_hash,
      created_ip_hash: input.ip_hash,
      status: "unclaimed",
      registered_via: input.via,
      claimed_by_user_id: null,
      claimed_at: null,
      last_seen_at: null,
      created_at: new Date().toISOString(),
    });
    this.claims.set(input.claim_token_hash, { agent_id: id, expires_at: input.claim_expires_at, used_at: null, used_by: null });
    return id;
  }

  async findAgentByKeyHash(keyHash: string) {
    for (const agent of this.agents.values()) if (agent.key_hash === keyHash) return agent;
    return null;
  }

  async touchAgent() {}

  async getAgentByClaimToken(tokenHash: string) {
    const claim = this.claims.get(tokenHash);
    const agent = claim ? this.agents.get(claim.agent_id) : null;
    return claim && agent ? { agent, expires_at: claim.expires_at, used_at: claim.used_at } : null;
  }

  async claimAgent(tokenHash: string, userId: string) {
    if (!this.verifiedUsers.has(userId)) throw Object.assign(new Error("contact_not_verified"), { code: "42501" });
    const claim = this.claims.get(tokenHash);
    if (!claim || claim.used_at || new Date(claim.expires_at).getTime() <= Date.now()) {
      const { toStoreError } = await import("@/lib/agents/store");
      throw toStoreError({ code: "P0002", message: "claim_invalid_or_used" });
    }
    claim.used_at = new Date().toISOString();
    claim.used_by = userId;
    const agent = this.agents.get(claim.agent_id)!;
    agent.status = "claimed";
    agent.claimed_by_user_id = userId;
    return agent.id;
  }

  async createAgentRequest(agentId: string, input: AgentRequestInput) {
    const id = crypto.randomUUID();
    this.requests.set(id, { ...input, id, status: "pending", source: "agent", agent_id: agentId, created_at: new Date().toISOString() });
    return id;
  }

  async getRequestModeration(id: string) {
    const request = this.requests.get(id);
    return request ? { id, status: request.status, source: request.source, agent_id: request.agent_id } : null;
  }

  async requestIsPublic(id: string) {
    return this.publicRequestIds.has(id) || this.requests.get(id)?.status === "active";
  }

  async createMessage(input: NewMessage) {
    const id = crypto.randomUUID();
    this.messages.set(id, { ...input, id, status: "pending", created_at: new Date().toISOString(), moderated_at: null });
    return id;
  }

  async getMessage(id: string) {
    return this.messages.get(id) ?? null;
  }

  async listMessages(status: MessageRow["status"] | "all") {
    return [...this.messages.values()].filter((message) => status === "all" || message.status === status);
  }

  async listPublicMessages(requestId: string): Promise<PublicMessage[]> {
    return [...this.messages.values()]
      .filter((message) => message.request_id === requestId && message.status === "approved")
      .map((message) => ({ id: message.id, request_id: requestId, body: message.body, from_name: message.from_name, sender_kind: message.sender_kind, agent_name: null, created_at: message.created_at }));
  }

  async setMessageStatus(id: string, status: "approved" | "rejected" | "spam") {
    const message = this.messages.get(id);
    if (message) message.status = status;
    return Boolean(message);
  }

  async listPendingRequests(): Promise<PendingRequestRow[]> {
    return [...this.requests.values()]
      .filter((request) => request.status === "pending")
      .map((request) => ({
        id: request.id,
        title: request.title,
        description: request.description,
        request_type: request.request_type,
        location: request.location,
        work_mode: request.work_mode,
        status: request.status,
        created_at: request.created_at,
        agent_id: request.agent_id,
        agent_name: this.agents.get(request.agent_id)?.name ?? null,
      }));
  }

  async setRequestStatus(id: string, status: "active" | "removed") {
    const request = this.requests.get(id);
    if (!request || request.status !== "pending") return false;
    request.status = status;
    return true;
  }

  async insertVisit(visit: VisitRow) {
    this.visits.push(visit);
  }

  async listVisits() {
    return this.visits;
  }

  async visitCounts() {
    return [];
  }

  async schemaStatus() {
    return { agents: true, messages: true };
  }
}
