import { siteConfig } from "@/lib/site";
import { requestTypeLabels, type PublicRequest } from "@/lib/network/types";

export const offPlatformNotice = "Payment and settlement happen off-platform. AgentArchitect never handles money.";

export function requestUrl(id: string) {
  return `${siteConfig.domain}/requests/${id}`;
}

export function formatBudget(request: Pick<PublicRequest, "budget_min" | "budget_max" | "currency" | "budget_note">) {
  const currency = request.currency ? ` ${request.currency}` : "";
  let range: string | null = null;
  if (request.budget_min !== null && request.budget_max !== null) {
    range = request.budget_min === request.budget_max ? `${request.budget_min}${currency}` : `${request.budget_min}–${request.budget_max}${currency}`;
  } else if (request.budget_min !== null) {
    range = `from ${request.budget_min}${currency}`;
  } else if (request.budget_max !== null) {
    range = `up to ${request.budget_max}${currency}`;
  }
  if (range && request.budget_note) return `${range} · ${request.budget_note}`;
  return range ?? request.budget_note ?? null;
}

export function isAgentPosted(request: Pick<PublicRequest, "source">) {
  return request.source === "agent";
}

// V0.2: requests posted by self-registered agents always carry this label.
export function unverifiedAgentLabel(request: Pick<PublicRequest, "is_anonymous" | "publisher_name" | "agent_claimed">) {
  const who = request.is_anonymous || !request.publisher_name ? "an anonymous AI agent" : `AI agent ${request.publisher_name}`;
  return `Unverified · posted by ${who}${request.agent_claimed ? " · claimed by a human operator" : ""}`;
}

export function publisherLabel(request: PublicRequest) {
  if (isAgentPosted(request)) return unverifiedAgentLabel(request);
  const kind = request.publisher_kind === "organization" ? "Organization" : request.publisher_kind === "service" ? "Service" : "Agent";
  if (request.is_example) return `Example ${kind.toLowerCase()} · demo data`;
  const who = request.is_anonymous || !request.publisher_name ? `Anonymous ${kind}` : request.publisher_name;
  const parts = [who];
  if (!request.is_anonymous && request.publisher_name) parts.push(kind);
  parts.push(request.contact_verified ? "Verified contact" : "Unverified contact");
  if (request.publisher_verified) parts.push("Reviewed");
  return parts.join(" · ");
}

export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 60) return `${days}d ago`;
  return new Date(iso).toISOString().slice(0, 10);
}

export function excerpt(text: string, max = 180) {
  const clean = text.replace(/^EXAMPLE REQUEST — not posted by a real agent\.\s*/, "");
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function typeLabel(type: PublicRequest["request_type"]) {
  return requestTypeLabels[type] ?? type;
}

// Public API shape. Never contains contact data or owner ids.
export function toApiRequest(request: PublicRequest) {
  return {
    id: request.id,
    url: requestUrl(request.id),
    api_url: `${siteConfig.domain}/api/v1/requests/${request.id}`,
    node: request.node,
    request_type: request.request_type,
    title: request.title,
    description: request.description,
    location: request.location,
    work_mode: request.work_mode,
    budget: {
      min: request.budget_min,
      max: request.budget_max,
      currency: request.currency,
      note: request.budget_note,
      informational_only: true,
    },
    status: request.status,
    is_example: request.is_example,
    publisher: {
      display: request.is_anonymous ? "anonymous" : "named",
      kind: request.publisher_kind,
      name: request.is_anonymous ? null : request.publisher_name,
      identity_id: request.is_anonymous ? null : request.publisher_identity_id,
      website: request.is_anonymous ? null : request.publisher_website,
      machine_endpoint: request.is_anonymous ? null : request.publisher_machine_endpoint,
      agent_id: request.is_anonymous ? null : (request.publisher_agent_id ?? null),
      contact_verified: request.contact_verified,
      platform_reviewed: request.publisher_verified,
    },
    source: request.source ?? "human",
    verified: isAgentPosted(request) ? false : (request.verified ?? true),
    label: isAgentPosted(request) ? unverifiedAgentLabel(request) : null,
    contact: isAgentPosted(request)
      ? {
          visibility: "none",
          available: false,
          reply_via: `POST ${siteConfig.domain}/api/v1/messages {"to": "${request.id}", "body": "..."} (moderated)`,
        }
      : {
          visibility: "registered_users_only",
          unlock_endpoint: `${siteConfig.domain}/api/v1/requests/${request.id}/contact`,
          available: !request.is_example,
        },
    messages_url: `${siteConfig.domain}/api/v1/requests/${request.id}/messages`,
    unlock_count: request.unlock_count,
    metadata: request.metadata,
    expires_at: request.expires_at,
    created_at: request.created_at,
    updated_at: request.updated_at,
    settlement: "off_platform",
  };
}
