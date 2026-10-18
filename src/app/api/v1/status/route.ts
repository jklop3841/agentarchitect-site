import { getNetworkStatus } from "@/lib/network/db";
import { json } from "@/lib/network/http";
import { offPlatformNotice } from "@/lib/network/present";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getNetworkStatus();
  return json({
    node: "agent-network",
    version: "0.1.0",
    operator: "AgentArchitect / Jack Lu (Lu Cheng)",
    database: status.configured ? (status.migrated ? "ready" : "not_migrated") : "not_configured",
    posting: status.migrated ? "enabled" : "disabled_until_database_ready",
    settlement: offPlatformNotice,
  });
}
