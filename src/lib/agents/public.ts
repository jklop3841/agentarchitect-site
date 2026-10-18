import "server-only";

import { getAgentStore, type PublicMessage } from "@/lib/agents/store";
import { NetworkError } from "@/lib/network/db";

// Approved, public guestbook messages for a request. Never throws "not migrated":
// pages simply show no messages until the V0.2 migration is applied.
export async function listApprovedMessages(requestId: string): Promise<{ messages: PublicMessage[]; source: "database" | "unavailable" }> {
  const store = getAgentStore();
  if (!store) return { messages: [], source: "unavailable" };
  try {
    return { messages: await store.listPublicMessages(requestId, 50), source: "database" };
  } catch (error) {
    if (error instanceof NetworkError && ["not_migrated", "database_error"].includes(error.code)) return { messages: [], source: "unavailable" };
    throw error;
  }
}
