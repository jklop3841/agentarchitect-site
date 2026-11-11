import "server-only";

import { getAgentStore } from "@/lib/agents/store";
import { consumeRateLimit } from "@/lib/rate-limit";
import { toolQuotas } from "@/lib/tools/config";
import { ToolError } from "@/lib/tools/types";

// Free tools still cost compute and (for URL mode) bandwidth, so every call is counted:
//   1. a per-instance burst limit (cheap, in memory)
//   2. a per-caller hourly limit
//   3. a global daily ceiling that acts as a cost circuit breaker
// 2 and 3 use the shared rate_limits table when the database is configured and fall back to
// in-memory counters when it is not, so a database outage never makes the tools unlimited.

export type QuotaKind = "compute" | "remote_fetch";

const HOUR = 3_600;
const DAY = 86_400;

async function hit(bucket: string, key: string, windowSeconds: number, max: number): Promise<{ allowed: boolean; retryAfter: number }> {
  const store = getAgentStore();
  if (store) {
    try {
      const result = await store.rateLimitHit(bucket, key, windowSeconds, max);
      return { allowed: result.allowed, retryAfter: Math.max(1, Math.ceil((Date.parse(result.reset_at) - Date.now()) / 1000)) };
    } catch {
      // fall through to the in-memory counter
    }
  }
  const local = consumeRateLimit({ key: `${bucket}:${key}`, limit: max, windowMs: windowSeconds * 1000 });
  return { allowed: local.allowed, retryAfter: Math.max(1, Math.ceil((local.resetAt - Date.now()) / 1000)) };
}

export async function consumeQuota(kind: QuotaKind, ipHash: string): Promise<void> {
  const burst = consumeRateLimit({ key: `tool_burst:${ipHash}`, limit: toolQuotas.burstPerMinute, windowMs: 60_000 });
  if (!burst.allowed) {
    throw new ToolError("rate_limited", "Too many requests in a short time. Slow down.", undefined, Math.max(1, Math.ceil((burst.resetAt - Date.now()) / 1000)));
  }
  const perIpMax = kind === "remote_fetch" ? toolQuotas.remotePerIpPerHour : toolQuotas.computePerIpPerHour;
  const globalMax = kind === "remote_fetch" ? toolQuotas.remoteGlobalPerDay : toolQuotas.computeGlobalPerDay;
  // Order matters: the per-caller counter is checked first and the global counter is only
  // touched for calls that pass it. Otherwise one caller hammering past its own limit would
  // burn the shared daily ceiling and shut the service for everyone.
  const perIp = await hit(`tool_${kind}_ip`, ipHash, HOUR, perIpMax);
  if (!perIp.allowed) {
    throw new ToolError("rate_limited", `Hourly limit reached for ${kind === "remote_fetch" ? "URL fetches" : "tool calls"} (${perIpMax} per hour).`, { limit: perIpMax, window: "hour" }, perIp.retryAfter);
  }
  const global = await hit(`tool_${kind}_global`, "all", DAY, globalMax);
  if (!global.allowed) {
    throw new ToolError(
      "quota_exceeded",
      kind === "remote_fetch"
        ? "The free daily capacity for URL fetches is used up. Send the file inline (content_base64) or try again later."
        : "The free daily capacity for this service is used up. Try again later.",
      { window: "day" },
      global.retryAfter,
    );
  }
}
