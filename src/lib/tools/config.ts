// Limits, quotas and the price table for the tool platform. Every tunable lives here.

import type { PricingTier, ToolId } from "@/lib/tools/types";

function envInt(name: string, fallback: number, min: number, max: number) {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) && raw >= min && raw <= max ? Math.floor(raw) : fallback;
}

export const toolLimits = {
  // Vercel rejects request bodies above ~4.5 MB; stay under it with room for JSON framing.
  maxBodyBytes: 4_400_000,
  // Decoded size of an inline (base64) file.
  maxInlineFileBytes: 3_000_000,
  // Size of a file fetched from a URL.
  maxRemoteFileBytes: 8_000_000,
  remoteTimeoutMs: 6_000,
  remoteMaxRedirects: 3,
};

export const toolQuotas = {
  // First line of defence, per server instance.
  get burstPerMinute() {
    return envInt("TOOLS_BURST_PER_MINUTE", 30, 1, 10_000);
  },
  // Shared counters (database-backed when available).
  get computePerIpPerHour() {
    return envInt("TOOLS_COMPUTE_PER_IP_PER_HOUR", 120, 1, 100_000);
  },
  get remotePerIpPerHour() {
    return envInt("TOOLS_REMOTE_PER_IP_PER_HOUR", 20, 1, 100_000);
  },
  // Circuit breakers across all callers: when hit, the mode stops for everyone until the window rolls.
  get computeGlobalPerDay() {
    return envInt("TOOLS_COMPUTE_GLOBAL_PER_DAY", 20_000, 1, 10_000_000);
  },
  get remoteGlobalPerDay() {
    return envInt("TOOLS_REMOTE_GLOBAL_PER_DAY", 1_000, 1, 10_000_000);
  },
};

export function remoteFetchEnabled() {
  return process.env.TOOLS_REMOTE_FETCH !== "off";
}

export const pricingTiers: Record<PricingTier, { name: string; description: string; available: boolean }> = {
  L0: { name: "Free", description: "Local computation and lightweight checks. No account, no payment.", available: true },
  L1: { name: "Metered cloud compute", description: "Heavier server-side processing with a monthly allowance.", available: false },
  L2: { name: "Model analysis and web lookup", description: "Model-assisted analysis and retrieval-backed checking.", available: false },
  L3: { name: "Human service", description: "Review or real-world verification by a person.", available: false },
};

// Prices are in abstract credits. Everything live today costs 0. No payment method is
// connected; the table exists so quotas, budgets and metering are exercised end to end.
export type PriceEntry = { tier: PricingTier; credits: number; available: boolean };
export const priceTable: Record<ToolId, Record<string, PriceEntry>> = {
  fileproof: { default: { tier: "L0", credits: 0, available: true } },
  imageproof: { default: { tier: "L0", credits: 0, available: true } },
  claimcheck: { default: { tier: "L0", credits: 0, available: true } },
};

export function priceFor(tool: ToolId, mode = "default"): PriceEntry {
  return priceTable[tool][mode] ?? priceTable[tool].default;
}
