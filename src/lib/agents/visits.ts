// Visit logging for middleware. Edge-safe (fetch + WebCrypto only, no Node APIs).
// Logging is fire-and-forget: it must never slow down or fail a page request.

import { hashIp } from "@/lib/agents/hash";

// Order matters: more specific tokens first (e.g. "ChatGPT-User" before "GPTBot").
export const knownAiBots = [
  "ChatGPT-User",
  "OAI-SearchBot",
  "GPTBot",
  "Claude-User",
  "Claude-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Perplexity-User",
  "PerplexityBot",
  "Google-Extended",
  "Bytespider",
  "CCBot",
  "Amazonbot",
  "Applebot-Extended",
  "meta-externalagent",
  "cohere-ai",
  "DuckAssistBot",
  "MistralAI-User",
] as const;

const lowerBots = knownAiBots.map((name) => [name, name.toLowerCase()] as const);

export function detectBot(userAgent: string | null | undefined) {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  for (const [name, lower] of lowerBots) {
    if (ua.includes(lower)) return name;
  }
  return null;
}

export function isAgentEndpoint(pathname: string) {
  return (
    pathname === "/mcp" ||
    pathname.startsWith("/mcp/") ||
    pathname === "/a2a" ||
    pathname === "/skill.md" ||
    pathname.startsWith("/.well-known/") ||
    /^\/llms(-full)?\.txt$/.test(pathname) ||
    pathname === "/agents.txt" ||
    pathname === "/openapi.json"
  );
}

const staticExtensions = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|bmp|woff2?|ttf|otf|eot|css|js|mjs|map|mp4|webm|mp3|wav|pdf|zip|wasm)$/i;

export function isStaticPath(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_vercel/") ||
    pathname.startsWith("/media/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/downloads/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/apple-touch-icon") ||
    staticExtensions.test(pathname)
  );
}

// Strip secrets out of paths before storing (claim tokens live in the URL).
export function redactPath(pathname: string) {
  return pathname.replace(/^\/claim\/[^/]+/, "/claim/:token").slice(0, 300);
}

export function sampleRateFor(isPriority: boolean) {
  if (isPriority) return 1;
  const raw = Number(process.env.VISIT_LOG_SAMPLE);
  return Number.isFinite(raw) && raw >= 0 && raw <= 1 ? raw : 0.2;
}

export type VisitDecision = {
  log: boolean;
  bot_name: string | null;
  is_known_ai_bot: boolean;
  agent_endpoint: boolean;
};

export function decideVisit(pathname: string, userAgent: string | null, random = Math.random()): VisitDecision {
  if (isStaticPath(pathname)) return { log: false, bot_name: null, is_known_ai_bot: false, agent_endpoint: false };
  const bot = detectBot(userAgent);
  const agentEndpoint = isAgentEndpoint(pathname);
  const rate = sampleRateFor(Boolean(bot) || agentEndpoint);
  return { log: random < rate, bot_name: bot, is_known_ai_bot: Boolean(bot), agent_endpoint: agentEndpoint };
}

function refererHost(referer: string | null) {
  if (!referer) return null;
  try {
    return new URL(referer).host.slice(0, 255) || null;
  } catch {
    return null;
  }
}

export async function buildVisitRow(request: Request, decision: VisitDecision) {
  const url = new URL(request.url);
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : request.headers.get("x-real-ip");
  return {
    ts: new Date().toISOString(),
    path: redactPath(url.pathname),
    method: request.method.slice(0, 10),
    user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
    ip_hash: await hashIp(ip ?? "unknown"),
    is_known_ai_bot: decision.is_known_ai_bot,
    bot_name: decision.bot_name,
    agent_endpoint: decision.agent_endpoint,
    referer_host: refererHost(request.headers.get("referer")),
  };
}

// REST insert with the server-only service-role key. Silently does nothing when
// unconfigured, and swallows every error (including "table does not exist").
export async function logVisit(request: Request, decision: VisitDecision, fetchImpl: typeof fetch = fetch) {
  try {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key || !decision.log) return false;
    const row = await buildVisitRow(request, decision);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2_500);
    try {
      const response = await fetchImpl(`${url.replace(/\/+$/, "")}/rest/v1/agent_visits`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(row),
        signal: controller.signal,
      });
      return response.ok;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return false;
  }
}
