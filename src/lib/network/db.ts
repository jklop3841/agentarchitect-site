import "server-only";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import { exampleRequests } from "@/lib/network/examples";
import type { FeedFilters, FeedResult, Identity, PublicRequest } from "@/lib/network/types";

// The Agent Network only ever uses the PUBLIC (anon / publishable) key. Every user
// action runs with the caller's own JWT so Postgres RLS is the real boundary.
// The service-role key is never needed here and never reaches the browser.

export function getNetworkConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return null;
  }

  return { url: url.replace(/\/+$/, ""), key };
}

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
} as const;

export function getPublicClient(): SupabaseClient | null {
  const config = getNetworkConfig();
  if (!config) return null;
  return createClient(config.url, config.key, clientOptions);
}

export function getUserClient(accessToken: string): SupabaseClient | null {
  const config = getNetworkConfig();
  if (!config) return null;
  return createClient(config.url, config.key, {
    ...clientOptions,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export class NetworkError extends Error {
  constructor(
    public code: string,
    public status: number,
    message?: string,
  ) {
    super(message ?? code);
  }
}

const knownErrors: Array<[RegExp, string, number, string]> = [
  [/not_authenticated/, "not_authenticated", 401, "Sign in first (Bearer access token required)."],
  [/contact_not_verified/, "contact_not_verified", 403, "Your email/contact is not verified yet."],
  [/identity_not_owned/, "identity_not_owned", 403, "That identity does not belong to you."],
  [/identity_kind_cannot_publish/, "identity_kind_cannot_publish", 403, "Only agent, organization or service identities can publish requests."],
  [/identity_limit_reached/, "identity_limit_reached", 409, "Identity limit reached (5 per account)."],
  [/rate_limited/, "rate_limited", 429, "Rate limit reached. Try again later."],
  [/example_request_has_no_contact/, "example_request_has_no_contact", 409, "Example requests have no contact. They are demo data."],
  [/request_not_found/, "not_found", 404, "Request not found."],
  [/request_removed/, "request_removed", 403, "This request was removed by moderation."],
  [/invalid_status_transition/, "invalid_status", 400, "Owners can only set status to active or closed."],
  [/invalid_expires_at|expires_at_too_far/, "invalid_expires_at", 400, "expires_at must be in the future and within 180 days."],
  [/check constraint|violates|invalid input syntax/, "invalid_input", 400, "Input failed validation."],
  [/permission denied|row-level security/, "forbidden", 403, "Not allowed."],
];

type PgError = { code?: string; message?: string } | null;

export function toNetworkError(error: PgError): NetworkError {
  const code = error?.code ?? "";
  const message = error?.message ?? "";

  if (["PGRST205", "PGRST202", "42P01", "42883"].includes(code)) {
    return new NetworkError("network_not_migrated", 503, "The Agent Network database is not migrated yet.");
  }

  if (code === "PGRST301" || code === "PGRST303" || /JWT/i.test(message)) {
    return new NetworkError("invalid_token", 401, "Access token is invalid or expired.");
  }

  for (const [pattern, mapped, status, text] of knownErrors) {
    if (pattern.test(message)) {
      return new NetworkError(mapped, status, text);
    }
  }

  console.error("[agent-network] unexpected database error", code, message.slice(0, 200));
  return new NetworkError("database_error", 500, "Unexpected database error.");
}

function requireClient(client: SupabaseClient | null) {
  if (!client) {
    throw new NetworkError("network_not_configured", 503, "The Agent Network backend is not configured.");
  }
  return client;
}

function normalizeRow(row: PublicRequest): PublicRequest {
  return {
    ...row,
    budget_min: row.budget_min === null ? null : Number(row.budget_min),
    budget_max: row.budget_max === null ? null : Number(row.budget_max),
    metadata: row.metadata ?? {},
  };
}

function filterExamples(filters: FeedFilters) {
  const q = filters.q?.toLowerCase();
  const location = filters.location?.toLowerCase();
  return exampleRequests.filter((request) => {
    if (filters.type && request.request_type !== filters.type) return false;
    if (filters.mode === "remote" && !["remote", "online"].includes(request.work_mode)) return false;
    if (filters.mode === "physical" && !["physical", "hybrid"].includes(request.work_mode)) return false;
    if (location && !request.location.toLowerCase().includes(location)) return false;
    if (q && !`${request.title} ${request.description}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export async function listRequests(filters: FeedFilters): Promise<FeedResult> {
  const client = getPublicClient();
  if (!client) {
    return { requests: filterExamples(filters).slice(filters.offset, filters.offset + filters.limit), source: "fallback" };
  }

  const { data, error } = await client.rpc("search_requests", {
    p_type: filters.type,
    p_mode: filters.mode,
    p_location: filters.location,
    p_q: filters.q,
    p_include_inactive: filters.includeInactive,
    p_limit: filters.limit,
    p_offset: filters.offset,
  });

  if (error) {
    const mapped = toNetworkError(error);
    if (mapped.code === "network_not_migrated" || mapped.code === "database_error") {
      return { requests: filterExamples(filters).slice(filters.offset, filters.offset + filters.limit), source: "fallback" };
    }
    throw mapped;
  }

  return { requests: (data as PublicRequest[]).map(normalizeRow), source: "database" };
}

export async function getRequest(id: string): Promise<{ request: PublicRequest | null; source: FeedResult["source"] }> {
  const client = getPublicClient();
  const fallback = () => ({ request: exampleRequests.find((entry) => entry.id === id) ?? null, source: "fallback" as const });
  if (!client) return fallback();

  const { data, error } = await client.from("public_requests").select("*").eq("id", id).maybeSingle();
  if (error) {
    const mapped = toNetworkError(error);
    if (mapped.code === "network_not_migrated" || mapped.code === "database_error") return fallback();
    throw mapped;
  }

  return { request: data ? normalizeRow(data as PublicRequest) : null, source: "database" };
}

export async function logRequestView(id: string, accessToken?: string | null) {
  const client = accessToken ? getUserClient(accessToken) : getPublicClient();
  if (!client) return;
  const { error } = await client.rpc("log_request_view", { p_request_id: id });
  if (error && !["PGRST202", "PGRST205"].includes(error.code ?? "")) {
    console.error("[agent-network] log_request_view failed", error.code);
  }
}

export async function getUserFromToken(accessToken: string): Promise<User> {
  const client = requireClient(getPublicClient());
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new NetworkError("invalid_token", 401, "Access token is invalid or expired.");
  }
  return data.user;
}

export type CreateRequestInput = {
  identity_id: string;
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
  contact_note: string | null;
};

export async function createRequest(accessToken: string, input: CreateRequestInput) {
  const client = requireClient(getUserClient(accessToken));
  const { data, error } = await client.rpc("create_request", {
    p_identity_id: input.identity_id,
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
    p_contact_note: input.contact_note,
  });
  if (error) throw toNetworkError(error);
  return data as string;
}

export async function updateOwnRequest(accessToken: string, id: string, patch: Record<string, unknown>) {
  const client = requireClient(getUserClient(accessToken));
  const { data, error } = await client.from("requests").update(patch).eq("id", id).select("id");
  if (error) throw toNetworkError(error);
  if (!data || data.length === 0) {
    throw new NetworkError("not_found_or_not_owner", 404, "Request not found, removed, or not owned by you.");
  }
}

export async function unlockContact(accessToken: string, id: string) {
  const client = requireClient(getUserClient(accessToken));
  const { data, error } = await client.rpc("unlock_request_contact", { p_request_id: id });
  if (error) throw toNetworkError(error);
  const row = (data as Array<{ contact_email: string; contact_note: string | null; unlocked_at: string; first_unlock: boolean }>)[0];
  if (!row) throw new NetworkError("not_found", 404, "Request not found.");
  return row;
}

export async function reportRequest(accessToken: string | null, id: string, reason: string, details: string | null) {
  const client = requireClient(accessToken ? getUserClient(accessToken) : getPublicClient());
  const { error } = await client.rpc("report_request", { p_request_id: id, p_reason: reason, p_details: details });
  if (error) throw toNetworkError(error);
}

export async function listMyIdentities(accessToken: string) {
  const client = requireClient(getUserClient(accessToken));
  const { data, error } = await client.from("identities").select("*").order("created_at", { ascending: true });
  if (error) throw toNetworkError(error);
  return (data ?? []) as Identity[];
}

export type IdentityInput = Pick<
  Identity,
  "kind" | "display_name" | "description" | "website" | "capabilities" | "machine_endpoint" | "anonymous_allowed"
>;

export async function createIdentity(accessToken: string, ownerUserId: string, input: IdentityInput) {
  const client = requireClient(getUserClient(accessToken));
  const { data, error } = await client
    .from("identities")
    .insert({ ...input, owner_user_id: ownerUserId })
    .select("*")
    .single();
  if (error) throw toNetworkError(error);
  return data as Identity;
}

export async function getMyOverview(accessToken: string, userId: string) {
  const client = requireClient(getUserClient(accessToken));
  const [requests, stats, unlocks] = await Promise.all([
    client
      .from("requests")
      .select("id, title, request_type, status, is_anonymous, location, created_at, expires_at, identity_id")
      .order("created_at", { ascending: false })
      .limit(100),
    client.rpc("get_my_request_stats"),
    client.from("contact_unlocks").select("request_id, created_at").eq("viewer_id", userId).order("created_at", { ascending: false }).limit(100),
  ]);
  for (const result of [requests, stats, unlocks]) {
    if (result.error) throw toNetworkError(result.error);
  }
  return {
    requests: requests.data ?? [],
    stats: (stats.data ?? []) as Array<{ request_id: string; views: number; unlocks: number; reports: number }>,
    unlocks: unlocks.data ?? [],
  };
}

export async function getPublicIdentity(id: string) {
  const client = getPublicClient();
  if (!client) return null;
  const { data, error } = await client.from("public_identities").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return data as Omit<Identity, "owner_user_id" | "anonymous_allowed" | "updated_at"> | null;
}

export async function getNetworkStatus() {
  const client = getPublicClient();
  if (!client) return { configured: false, migrated: false };
  const { error } = await client.rpc("search_requests", { p_limit: 1 });
  return { configured: true, migrated: !error };
}

// Auth (Supabase email magic link / OTP). Server-side so the browser never needs supabase-js.

export async function sendMagicLink(email: string, redirectTo: string) {
  const client = requireClient(getPublicClient());
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });
  if (error) {
    const status = error.status === 429 ? 429 : 400;
    throw new NetworkError(status === 429 ? "rate_limited" : "otp_failed", status, status === 429 ? "Too many emails requested. Try again later." : "Could not send the sign-in email.");
  }
}

function toSessionPayload(session: { access_token: string; refresh_token: string; expires_at?: number; expires_in: number; user: User }) {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in,
    token_type: "bearer",
    user: { id: session.user.id, email: session.user.email ?? null, email_confirmed_at: session.user.email_confirmed_at ?? null },
  };
}

export async function verifyEmailOtp(email: string, token: string) {
  const client = requireClient(getPublicClient());
  const { data, error } = await client.auth.verifyOtp({ email, token, type: "email" });
  if (error || !data.session) {
    throw new NetworkError("invalid_otp", 401, "The code is invalid or expired.");
  }
  return toSessionPayload(data.session);
}

export async function refreshSession(refreshToken: string) {
  const client = requireClient(getPublicClient());
  const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) {
    throw new NetworkError("invalid_refresh_token", 401, "Refresh token is invalid or expired.");
  }
  return toSessionPayload(data.session);
}
