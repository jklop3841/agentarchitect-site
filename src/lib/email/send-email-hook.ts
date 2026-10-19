// Supabase Auth "Send Email Hook" core logic.
// Pure module (no Next.js / server-only imports) so it can be unit tested with a mocked fetch.
//
// Flow: verify Standard Webhooks signature -> render branded email -> send via primary
// provider (Resend by default) -> on any failure fall back to the secondary (Brevo).
// Logs only provider names and action types; never addresses, tokens or keys.

export type EmailActionType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email"
  | "reauthentication"
  | (string & {});

export interface HookUser {
  id?: string;
  email: string;
  new_email?: string;
}

export interface HookEmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: EmailActionType;
  site_url: string;
  token_new?: string;
  token_hash_new?: string;
}

export interface HookPayload {
  user: HookUser;
  email_data: HookEmailData;
}

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type ProviderName = "resend" | "brevo";

export interface EmailEnv {
  SEND_EMAIL_HOOK_SECRET?: string;
  SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  RESEND_API_KEY?: string;
  BREVO_API_KEY?: string;
  EMAIL_PRIMARY?: string;
  EMAIL_FROM_ADDRESS?: string;
  EMAIL_FROM_NAME?: string;
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export const BRAND = "AgentArchitect";
export const PROVENANCE = "AgentArchitect · Jack Lu / Lu Cheng · https://agentarchitect.me/";
const DEFAULT_FROM_ADDRESS = "noreply@agentarchitect.me";
const PROVIDER_TIMEOUT_MS = 5000;
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

export class HookError extends Error {
  constructor(
    message: string,
    public readonly httpCode: number,
  ) {
    super(message);
    this.name = "HookError";
  }
}

// ---------------------------------------------------------------------------
// Standard Webhooks signature verification (https://www.standardwebhooks.com/)
// signed content = `${webhook-id}.${webhook-timestamp}.${body}`, HMAC-SHA256,
// key = base64 decode of the secret after stripping "v1,whsec_" / "whsec_".

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

export function normalizeHookSecret(secret: string): string {
  return secret.trim().replace(/^v1,/, "").replace(/^whsec_/, "");
}

export async function signWebhook(secret: string, id: string, timestamp: number, body: string): Promise<string> {
  const keyBytes = base64ToBytes(normalizeHookSecret(secret));
  const key = await crypto.subtle.importKey("raw", keyBytes as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  return `v1,${bytesToBase64(new Uint8Array(signature))}`;
}

export async function verifyWebhook(
  secret: string,
  headers: Headers,
  body: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<HookPayload> {
  const id = headers.get("webhook-id");
  const timestampRaw = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!id || !timestampRaw || !signatureHeader) throw new HookError("Missing webhook signature headers.", 401);

  const timestamp = Number.parseInt(timestampRaw, 10);
  if (!Number.isFinite(timestamp) || Math.abs(nowSeconds - timestamp) > SIGNATURE_TOLERANCE_SECONDS) {
    throw new HookError("Webhook timestamp outside tolerance.", 401);
  }

  let expected: string;
  try {
    expected = (await signWebhook(secret, id, timestamp, body)).slice(3);
  } catch {
    throw new HookError("Webhook secret is malformed.", 500);
  }

  const valid = signatureHeader
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("v1,"))
    .some((part) => constantTimeEqual(part.slice(3), expected));
  if (!valid) throw new HookError("Invalid webhook signature.", 401);

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new HookError("Invalid JSON payload.", 400);
  }
  const payload = parsed as Partial<HookPayload>;
  if (!payload?.user?.email || !payload.email_data?.email_action_type) {
    throw new HookError("Payload missing user.email or email_data.", 400);
  }
  return payload as HookPayload;
}

// ---------------------------------------------------------------------------
// Email content

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

export function buildVerifyUrl(supabaseUrl: string, tokenHash: string, type: string, redirectTo: string): string {
  const params = new URLSearchParams({ token: tokenHash, type });
  if (redirectTo) params.set("redirect_to", redirectTo);
  return `${supabaseUrl.replace(/\/+$/, "")}/auth/v1/verify?${params.toString()}`;
}

interface Copy {
  subject: string;
  heading: string;
  intro: string;
  zh: string;
  cta?: string;
}

const COPY: Record<string, Copy> = {
  signup: {
    subject: "Confirm your AgentArchitect email",
    heading: "Confirm your email",
    intro: "Confirm this address to finish signing up to Agent Network.",
    zh: "请确认邮箱以完成注册。",
    cta: "Confirm email",
  },
  magiclink: {
    subject: "Your AgentArchitect sign-in link",
    heading: "Sign in to Agent Network",
    intro: "Use the link or the one-time code below to sign in. It expires shortly and works once.",
    zh: "点击链接或使用验证码登录，链接仅可使用一次。",
    cta: "Sign in",
  },
  recovery: {
    subject: "Reset your AgentArchitect password",
    heading: "Reset your password",
    intro: "We received a request to reset your password. If it wasn't you, ignore this email.",
    zh: "重置密码请求；如非本人操作请忽略。",
    cta: "Reset password",
  },
  invite: {
    subject: "You're invited to AgentArchitect",
    heading: "You've been invited",
    intro: "You've been invited to join Agent Network on AgentArchitect.",
    zh: "你被邀请加入 AgentArchitect Agent Network。",
    cta: "Accept invitation",
  },
  email_change: {
    subject: "Confirm your AgentArchitect email change",
    heading: "Confirm email change",
    intro: "Confirm this email change request. If you didn't request it, ignore this email.",
    zh: "请确认邮箱变更；如非本人操作请忽略。",
    cta: "Confirm change",
  },
  reauthentication: {
    subject: "Your AgentArchitect verification code",
    heading: "Verification code",
    intro: "Use this code to confirm your identity. It expires shortly.",
    zh: "请使用以下验证码确认身份。",
  },
};

const FALLBACK_COPY: Copy = {
  subject: "AgentArchitect notification",
  heading: "Account notification",
  intro: "There was activity on your Agent Network account.",
  zh: "你的账户有新的动态。",
};

function render(to: string, copy: Copy, token: string, link?: string, extra?: string): OutgoingEmail {
  const codeLine = token ? `Code / 验证码: ${token}` : "";
  const agentNote = token
    ? "Agents: POST {\"email\", \"token\"} to https://www.agentarchitect.me/api/v1/auth/verify instead of clicking."
    : "";
  const text = [
    copy.heading,
    "",
    copy.intro,
    copy.zh,
    extra ?? "",
    link ? `${copy.cta ?? "Open"}: ${link}` : "",
    codeLine,
    agentNote,
    "",
    "--",
    PROVENANCE,
  ]
    .filter((line, index, all) => line !== "" || (index > 0 && all[index - 1] !== ""))
    .join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f6f4;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111">
<table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e5e0;border-radius:8px"><tr><td style="padding:28px">
<div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#666">${BRAND} · Agent Network</div>
<h1 style="font-size:20px;margin:12px 0 8px">${escapeHtml(copy.heading)}</h1>
<p style="margin:0 0 6px;line-height:1.5">${escapeHtml(copy.intro)}</p>
<p style="margin:0 0 16px;color:#555;line-height:1.5">${escapeHtml(copy.zh)}</p>
${extra ? `<p style="margin:0 0 16px;line-height:1.5">${escapeHtml(extra)}</p>` : ""}
${link ? `<p style="margin:0 0 20px"><a href="${escapeHtml(link)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px">${escapeHtml(copy.cta ?? "Open")}</a></p>` : ""}
${token ? `<p style="margin:0 0 4px;color:#555">Code / 验证码</p><p style="margin:0 0 16px;font-size:26px;letter-spacing:.2em;font-family:Menlo,Consolas,monospace">${escapeHtml(token)}</p><p style="margin:0 0 16px;font-size:12px;color:#777">${escapeHtml(agentNote)}</p>` : ""}
<hr style="border:none;border-top:1px solid #eee;margin:20px 0 12px"><p style="margin:0;font-size:12px;color:#888">${escapeHtml(PROVENANCE)}</p>
</td></tr></table></body></html>`;

  return { to, subject: copy.subject, html, text };
}

export function buildEmails(payload: HookPayload, supabaseUrl: string): OutgoingEmail[] {
  const { user, email_data: data } = payload;
  const type = data.email_action_type;
  const copy = COPY[type] ?? FALLBACK_COPY;
  const link = (hash: string) => (hash ? buildVerifyUrl(supabaseUrl, hash, type, data.redirect_to || data.site_url) : undefined);

  if (type === "email_change") {
    // Supabase field names are reversed for backward compatibility:
    // current email (user.email) -> token + token_hash_new; new email (user.new_email) -> token_new + token_hash.
    const newEmail = user.new_email ?? "";
    const secureBoth = Boolean(data.token_hash_new && data.token_hash);
    if (secureBoth) {
      const emails = [render(user.email, copy, data.token, link(data.token_hash_new ?? ""), `New address: ${newEmail}`)];
      if (newEmail) emails.push(render(newEmail, copy, data.token_new ?? "", link(data.token_hash)));
      return emails;
    }
    const target = newEmail || user.email;
    return [render(target, copy, data.token || data.token_new || "", link(data.token_hash || data.token_hash_new || ""))];
  }

  if (type === "reauthentication") return [render(user.email, copy, data.token)];
  return [render(user.email, copy, data.token, link(data.token_hash))];
}

// ---------------------------------------------------------------------------
// Providers

async function fetchWithTimeout(fetchImpl: FetchLike, url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

interface SendContext {
  fetchImpl: FetchLike;
  env: EmailEnv;
  timeoutMs: number;
}

function sender(env: EmailEnv) {
  return { name: env.EMAIL_FROM_NAME || BRAND, address: env.EMAIL_FROM_ADDRESS || DEFAULT_FROM_ADDRESS };
}

async function sendViaResend(email: OutgoingEmail, ctx: SendContext): Promise<void> {
  const key = ctx.env.RESEND_API_KEY;
  if (!key) throw new Error("resend not configured");
  const from = sender(ctx.env);
  const response = await fetchWithTimeout(
    ctx.fetchImpl,
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: `${from.name} <${from.address}>`, to: [email.to], subject: email.subject, html: email.html, text: email.text }),
    },
    ctx.timeoutMs,
  );
  if (!response.ok) throw new Error(`resend status ${response.status}`);
}

async function sendViaBrevo(email: OutgoingEmail, ctx: SendContext): Promise<void> {
  const key = ctx.env.BREVO_API_KEY;
  if (!key) throw new Error("brevo not configured");
  const response = await fetchWithTimeout(
    ctx.fetchImpl,
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ sender: sender(ctx.env), to: [{ email: email.to }], subject: email.subject, htmlContent: email.html, textContent: email.text }),
    },
    ctx.timeoutMs,
  );
  if (!response.ok) throw new Error(`brevo status ${response.status}`);
}

const PROVIDERS: Record<ProviderName, (email: OutgoingEmail, ctx: SendContext) => Promise<void>> = {
  resend: sendViaResend,
  brevo: sendViaBrevo,
};

export function providerOrder(env: EmailEnv): ProviderName[] {
  return env.EMAIL_PRIMARY?.trim().toLowerCase() === "brevo" ? ["brevo", "resend"] : ["resend", "brevo"];
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.name === "AbortError" ? "timeout" : error.message;
  return "unknown error";
}

export async function sendWithFailover(
  email: OutgoingEmail,
  options: { env: EmailEnv; fetchImpl?: FetchLike; timeoutMs?: number; log?: (line: string) => void; label?: string },
): Promise<ProviderName> {
  const ctx: SendContext = { env: options.env, fetchImpl: options.fetchImpl ?? fetch, timeoutMs: options.timeoutMs ?? PROVIDER_TIMEOUT_MS };
  const log = options.log ?? ((line: string) => console.log(line));
  const label = options.label ?? "email";
  const failures: string[] = [];
  for (const provider of providerOrder(options.env)) {
    try {
      await PROVIDERS[provider](email, ctx);
      log(`[send-email-hook] ${label} sent via ${provider}${failures.length ? ` (after: ${failures.join("; ")})` : ""}`);
      return provider;
    } catch (error) {
      failures.push(`${provider}: ${describe(error)}`);
    }
  }
  log(`[send-email-hook] ${label} failed on all providers (${failures.join("; ")})`);
  throw new HookError("All email providers failed.", 502);
}

// ---------------------------------------------------------------------------
// Request handler (framework-agnostic)

function errorBody(message: string, httpCode: number): string {
  return JSON.stringify({ error: { http_code: httpCode, message } });
}

export async function handleSendEmailHook(
  request: Request,
  options: { env: EmailEnv; fetchImpl?: FetchLike; timeoutMs?: number; log?: (line: string) => void; nowSeconds?: number },
): Promise<Response> {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  const log = options.log ?? ((line: string) => console.log(line));
  try {
    const secret = options.env.SEND_EMAIL_HOOK_SECRET;
    const supabaseUrl = options.env.SUPABASE_URL ?? options.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!secret || !supabaseUrl) throw new HookError("Send email hook is not configured.", 500);

    const body = await request.text();
    const payload = await verifyWebhook(secret, request.headers, body, options.nowSeconds);
    const emails = buildEmails(payload, supabaseUrl);
    for (const [index, email] of emails.entries()) {
      await sendWithFailover(email, { ...options, log, label: `${payload.email_data.email_action_type}#${index + 1}` });
    }
    return new Response("{}", { status: 200, headers });
  } catch (error) {
    const hookError = error instanceof HookError ? error : new HookError("Unexpected error.", 500);
    if (!(error instanceof HookError)) log(`[send-email-hook] unexpected: ${describe(error)}`);
    return new Response(errorBody(hookError.message, hookError.httpCode), { status: hookError.httpCode, headers });
  }
}
