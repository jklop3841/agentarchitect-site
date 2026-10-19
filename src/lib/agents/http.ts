import "server-only";

import { clientIp, hashIp } from "@/lib/agents/hash";
import { isAgentApiKey } from "@/lib/agents/keys";
import { getBearerToken } from "@/lib/network/http";

export function requestIpHash(request: Request) {
  return hashIp(clientIp(request));
}

// Returns the agent API key if the Bearer token looks like one ("aa_..."), else null.
// Supabase access tokens (JWTs) never start with "aa_", so the two flows cannot collide.
export function getAgentKey(request: Request) {
  const token = getBearerToken(request);
  return token && token.startsWith("aa_") ? token : null;
}

export function looksLikeAgentKey(value: unknown): value is string {
  return typeof value === "string" && isAgentApiKey(value);
}
