import "server-only";

import { after } from "next/server";

import { getAgentKey, requestIpHash } from "@/lib/agents/http";
import type { RunContext } from "@/lib/tools/run";
import { classifyClient, recordUsage, type UsageRow } from "@/lib/tools/usage";

// The tools API is public and credential-free, so it is safe to call from any origin.
export const toolsCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function buildRunContext(request: Request, channel: RunContext["channel"]): Promise<RunContext> {
  return {
    channel,
    ipHash: await requestIpHash(request),
    userAgent: request.headers.get("user-agent"),
    clientClass: classifyClient(request.headers),
    // Presence of an agent key only; quotas do not depend on it, so it is not verified here.
    registeredAgent: Boolean(getAgentKey(request)),
  };
}

// Write the usage row after the response has been sent. Outside a Next request scope
// (unit tests, scripts) `after` throws, so fall back to a detached write.
export function scheduleUsage(row: UsageRow) {
  try {
    after(() => recordUsage(row));
  } catch {
    void recordUsage(row);
  }
}
