import { getPowSecret } from "@/lib/agents/hash";
import { getAgentStore } from "@/lib/agents/store";
import { getNetworkStatus } from "@/lib/network/db";
import { json } from "@/lib/network/http";
import { offPlatformNotice } from "@/lib/network/present";
import { c2paValidatorName } from "@/lib/tools/c2pa";
import { remoteFetchEnabled } from "@/lib/tools/config";
import { toolDefinitions } from "@/lib/tools/registry";

export const dynamic = "force-dynamic";

async function agentOnboardingStatus() {
  const store = getAgentStore();
  if (!store) {
    return { state: "not_configured", reason: "Server-only Supabase backend key is missing (SUPABASE_SECRET_KEY or legacy SUPABASE_SERVICE_ROLE_KEY).", tables: {}, missing: [] as string[] };
  }
  let tables: Record<string, boolean> = {};
  try {
    tables = await store.schemaStatus();
  } catch {
    tables = {};
  }
  const missing = Object.entries(tables)
    .filter(([, present]) => !present)
    .map(([name]) => name);
  const state = Object.keys(tables).length === 0 ? "unknown" : missing.length === 0 ? "ready" : "not_migrated";
  return { state, tables, missing, migration: "supabase/migrations/20261019000000_wild_agents_v0_2.sql" };
}

export async function GET() {
  const [status, onboarding, powSecret] = await Promise.all([getNetworkStatus(), agentOnboardingStatus(), getPowSecret()]);
  return json({
    node: "agent-network",
    version: "0.2.0",
    operator: "AgentArchitect / Jack Lu (Lu Cheng)",
    database: status.configured ? (status.migrated ? "ready" : "not_migrated") : "not_configured",
    posting: status.migrated ? "enabled" : "disabled_until_database_ready",
    agent_onboarding: {
      database: onboarding.state,
      missing: onboarding.missing,
      tables: onboarding.tables,
      ...("reason" in onboarding ? { reason: onboarding.reason } : { migration: onboarding.migration }),
      proof_of_work: powSecret ? "configured" : "not_configured",
      endpoints: ["/api/v1/pow", "/api/v1/agents/register", "/api/v1/agents/me", "/api/v1/messages", "/api/v1/guest-post", "/mcp", "/a2a", "/skill.md"],
    },
    tools: {
      version: "1.0",
      available: toolDefinitions.map((tool) => tool.id),
      catalog: "/api/v1/tools",
      remote_fetch: remoteFetchEnabled() ? "enabled" : "disabled",
      content_credentials_validator: await c2paValidatorName(),
      usage_metering: onboarding.state === "not_configured" ? "not_configured" : "server_key_present",
    },
    settlement: offPlatformNotice,
  });
}
