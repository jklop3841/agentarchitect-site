import {
  feedTabs,
  identityKinds,
  reportReasons,
  requestTypes,
  workModes,
  type FeedFilters,
  type IdentityKind,
  type ReportReason,
  type RequestType,
} from "@/lib/network/types";

// Input validation for the Agent Network. The database enforces the same limits with
// CHECK constraints; these checks just return friendlier errors earlier.

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;
// Control characters except tab/newline/carriage return.
const controlChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 320 && emailPattern.test(value);
}

function cleanText(value: unknown, max: number, { multiline = false } = {}) {
  if (typeof value !== "string") return null;
  let text = value.replace(controlChars, "");
  if (!multiline) text = text.replace(/\s+/g, " ");
  text = text.trim();
  if (!text) return null;
  return text.length > max ? null : text;
}

function cleanUrl(value: unknown, { httpsOnly = false } = {}) {
  if (value === undefined || value === null || value === "") return { ok: true as const, value: null };
  if (typeof value !== "string" || value.length > 300) return { ok: false as const };
  try {
    const url = new URL(value.trim());
    const allowed = httpsOnly ? ["https:"] : ["https:", "http:"];
    if (!allowed.includes(url.protocol)) return { ok: false as const };
    return { ok: true as const, value: url.toString() };
  } catch {
    return { ok: false as const };
  }
}

function optionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return { ok: true as const, value: null };
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(number) || number < 0 || number > 1_000_000_000) return { ok: false as const };
  return { ok: true as const, value: Math.round(number * 100) / 100 };
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

export function parseFeedFilters(params: URLSearchParams | Record<string, string | string[] | undefined>): FeedFilters {
  const get = (key: string) => {
    const raw = params instanceof URLSearchParams ? params.get(key) : params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return typeof value === "string" ? value : null;
  };

  const tab = feedTabs.find((entry) => entry.key === get("tab"));
  const rawType = get("type");
  const type =
    (rawType && (requestTypes as readonly string[]).includes(rawType) ? (rawType as RequestType) : null) ??
    (tab?.type as RequestType | null | undefined) ??
    null;
  const rawMode = get("mode");
  const mode = rawMode === "remote" || rawMode === "physical" ? rawMode : null;
  const limit = Math.min(Math.max(Number(get("limit")) || 50, 1), 100);
  const offset = Math.min(Math.max(Number(get("offset")) || 0, 0), 10_000);

  return {
    type,
    mode,
    location: cleanText(get("location"), 80),
    q: cleanText(get("q"), 120),
    includeInactive: get("include_inactive") === "true",
    limit,
    offset,
  };
}

export type CreateRequestPayload = {
  identity_id: string;
  request_type: RequestType;
  title: string;
  description: string;
  location: string;
  work_mode: (typeof workModes)[number];
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  budget_note: string | null;
  anonymous: boolean;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  contact_note: string | null;
};

export function validateCreateRequest(body: Record<string, unknown>, verifiedEmail: string): ValidationResult<CreateRequestPayload> {
  const errors: string[] = [];

  const identity_id = isUuid(body.identity_id) ? body.identity_id : null;
  if (!identity_id) errors.push("identity_id must be the UUID of one of your agent/organization/service identities.");

  const rawType = body.request_type ?? body.category ?? body.type;
  const request_type = typeof rawType === "string" && (requestTypes as readonly string[]).includes(rawType) ? (rawType as RequestType) : null;
  if (!request_type) errors.push(`request_type must be one of: ${requestTypes.join(", ")}.`);

  const title = cleanText(body.title, 140);
  if (!title || title.length < 8) errors.push("title is required (8-140 characters).");

  const description = cleanText(body.description, 5000, { multiline: true });
  if (!description || description.length < 20) errors.push("description is required (20-5000 characters).");

  const location = cleanText(body.location ?? "Remote", 80) ?? "Remote";
  if (location.length < 2) errors.push("location must be 2-80 characters.");

  const rawMode = body.work_mode ?? body.remote_or_physical ?? "remote";
  const work_mode = typeof rawMode === "string" && (workModes as readonly string[]).includes(rawMode) ? (rawMode as CreateRequestPayload["work_mode"]) : null;
  if (!work_mode) errors.push(`work_mode must be one of: ${workModes.join(", ")}.`);

  const budgetMin = optionalNumber(body.budget_min);
  const budgetMax = optionalNumber(body.budget_max);
  if (!budgetMin.ok || !budgetMax.ok) errors.push("budget_min/budget_max must be non-negative numbers.");
  if (budgetMin.ok && budgetMax.ok && budgetMin.value !== null && budgetMax.value !== null && budgetMax.value < budgetMin.value) {
    errors.push("budget_max must be >= budget_min.");
  }

  let currency: string | null = null;
  if (body.currency !== undefined && body.currency !== null && body.currency !== "") {
    currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : null;
    if (!currency || !/^[A-Z]{3,5}$/.test(currency)) errors.push("currency must be a 3-5 letter code such as USD, CNY, EUR.");
  }

  const budget_note = body.budget_note ? cleanText(body.budget_note, 140) : null;
  if (body.budget_note && !budget_note) errors.push("budget_note must be at most 140 characters.");

  const anonymous = body.anonymous === true || body.is_anonymous === true;

  let expires_at: string | null = null;
  if (body.expires_at) {
    const date = typeof body.expires_at === "string" ? new Date(body.expires_at) : null;
    const max = Date.now() + 180 * 86_400_000;
    if (!date || Number.isNaN(date.getTime()) || date.getTime() <= Date.now() || date.getTime() > max) {
      errors.push("expires_at must be an ISO date in the future, within 180 days.");
    } else {
      expires_at = date.toISOString();
    }
  }

  let metadata: Record<string, unknown> = {};
  if (body.metadata !== undefined && body.metadata !== null) {
    if (typeof body.metadata !== "object" || Array.isArray(body.metadata)) {
      errors.push("metadata must be a JSON object.");
    } else if (JSON.stringify(body.metadata).length > 4000) {
      errors.push("metadata must be at most 4000 characters when serialized.");
    } else {
      metadata = body.metadata as Record<string, unknown>;
    }
  }

  // The contact is always the publisher's own verified login email; no relay, no
  // unverified substitute. A different contact_email is rejected explicitly.
  if (body.contact_email !== undefined && body.contact_email !== null && body.contact_email !== "") {
    if (typeof body.contact_email !== "string" || body.contact_email.trim().toLowerCase() !== verifiedEmail.toLowerCase()) {
      errors.push("contact_email must equal your verified sign-in email. Sign in with the address you want agents/humans to contact.");
    }
  }

  const contact_note = body.contact_note ? cleanText(body.contact_note, 300, { multiline: true }) : null;
  if (body.contact_note && !contact_note) errors.push("contact_note must be at most 300 characters.");

  if (errors.length || !identity_id || !request_type || !title || !description || !work_mode) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      identity_id,
      request_type,
      title,
      description,
      location,
      work_mode,
      budget_min: budgetMin.ok ? budgetMin.value : null,
      budget_max: budgetMax.ok ? budgetMax.value : null,
      currency,
      budget_note,
      anonymous,
      expires_at,
      metadata,
      contact_note,
    },
  };
}

const updatableTextFields: Record<string, number> = { title: 140, location: 80, budget_note: 140 };

export function validateRequestPatch(body: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
  const errors: string[] = [];
  const patch: Record<string, unknown> = {};

  for (const [field, max] of Object.entries(updatableTextFields)) {
    if (body[field] !== undefined) {
      const value = cleanText(body[field], max);
      if (!value) errors.push(`${field} must be 1-${max} characters.`);
      else patch[field] = value;
    }
  }
  if (body.description !== undefined) {
    const value = cleanText(body.description, 5000, { multiline: true });
    if (!value || value.length < 20) errors.push("description must be 20-5000 characters.");
    else patch.description = value;
  }
  if (body.status !== undefined) {
    if (body.status !== "active" && body.status !== "closed") errors.push("status must be active or closed.");
    else patch.status = body.status;
  }
  if (body.anonymous !== undefined) {
    if (typeof body.anonymous !== "boolean") errors.push("anonymous must be boolean.");
    else patch.is_anonymous = body.anonymous;
  }
  if (body.work_mode !== undefined) {
    if (typeof body.work_mode !== "string" || !(workModes as readonly string[]).includes(body.work_mode)) errors.push("invalid work_mode.");
    else patch.work_mode = body.work_mode;
  }

  if (errors.length) return { ok: false, errors };
  if (Object.keys(patch).length === 0) return { ok: false, errors: ["Nothing to update."] };
  return { ok: true, value: patch };
}

export function validateIdentity(body: Record<string, unknown>): ValidationResult<{
  kind: IdentityKind;
  display_name: string;
  description: string | null;
  website: string | null;
  capabilities: string[];
  machine_endpoint: string | null;
  anonymous_allowed: boolean;
}> {
  const errors: string[] = [];
  const kind = typeof body.kind === "string" && (identityKinds as readonly string[]).includes(body.kind) ? (body.kind as IdentityKind) : null;
  if (!kind) errors.push(`kind must be one of: ${identityKinds.join(", ")}.`);

  const display_name = cleanText(body.display_name, 80);
  if (!display_name || display_name.length < 2) errors.push("display_name is required (2-80 characters).");

  const description = body.description ? cleanText(body.description, 1000, { multiline: true }) : null;
  if (body.description && !description) errors.push("description must be at most 1000 characters.");

  const website = cleanUrl(body.website);
  if (!website.ok) errors.push("website must be an http(s) URL.");
  const endpoint = cleanUrl(body.machine_endpoint, { httpsOnly: true });
  if (!endpoint.ok) errors.push("machine_endpoint must be an https URL.");

  let capabilities: string[] = [];
  if (body.capabilities !== undefined && body.capabilities !== null) {
    const list = Array.isArray(body.capabilities)
      ? body.capabilities
      : typeof body.capabilities === "string"
        ? body.capabilities.split(",")
        : null;
    const cleaned = list?.map((item) => cleanText(item, 60)).filter((item): item is string => Boolean(item)) ?? null;
    if (!cleaned || cleaned.length > 20) errors.push("capabilities must be up to 20 short strings.");
    else capabilities = cleaned;
  }

  if (errors.length || !kind || !display_name) return { ok: false, errors };
  return {
    ok: true,
    value: {
      kind,
      display_name,
      description,
      website: website.ok ? website.value : null,
      capabilities,
      machine_endpoint: endpoint.ok ? endpoint.value : null,
      anonymous_allowed: body.anonymous_allowed === true,
    },
  };
}

export function validateReport(body: Record<string, unknown>): ValidationResult<{ reason: ReportReason; details: string | null }> {
  const reason = typeof body.reason === "string" && (reportReasons as readonly string[]).includes(body.reason) ? (body.reason as ReportReason) : null;
  const details = body.details ? cleanText(body.details, 1000, { multiline: true }) : null;
  const errors: string[] = [];
  if (!reason) errors.push(`reason must be one of: ${reportReasons.join(", ")}.`);
  if (body.details && !details) errors.push("details must be at most 1000 characters.");
  if (errors.length || !reason) return { ok: false, errors };
  return { ok: true, value: { reason, details } };
}

export function safeNextPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/account";
  return value.slice(0, 200);
}
