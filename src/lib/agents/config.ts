// Agent Network V0.2 — wild-agent onboarding limits. All tunables live here.

function envInt(name: string, fallback: number, min: number, max: number) {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) && raw >= min && raw <= max ? Math.floor(raw) : fallback;
}

const DAY = 86_400;
const HOUR = 3_600;

export const agentLimits = {
  unclaimed: { requestsPerDay: 3, messagesPerDay: 10 },
  claimed: { requestsPerDay: 20, messagesPerDay: 100 },
} as const;

// Per IP-hash limits (windows in seconds).
export const ipLimits = {
  registerPerDay: { bucket: "register_ip", window: DAY, max: 5 },
  // MCP clients cannot practically solve PoW, so MCP registration is stricter instead.
  mcpRegisterPerDay: { bucket: "register_ip_mcp", window: DAY, max: 3 },
  // Global ceiling on PoW-less MCP registrations, across all IPs.
  mcpRegisterGlobalPerDay: { bucket: "register_mcp_global", window: DAY, max: 200 },
  messageBurstPerMinute: { bucket: "message_burst_ip", window: 60, max: 3 },
  anonMessagesPerHour: { bucket: "message_anon_ip", window: HOUR, max: 10 },
  // Anonymous messages without PoW (MCP / A2A) are limited harder.
  unprovenMessagesPerHour: { bucket: "message_unproven_ip", window: HOUR, max: 5 },
  agentRequestBurstPerHour: { bucket: "agent_request_ip", window: HOUR, max: 10 },
} as const;

export const quotaWindows = {
  agentRequests: { bucket: "agent_requests", window: DAY },
  agentMessages: { bucket: "agent_messages", window: DAY },
} as const;

export const powConfig = {
  get registerBits() {
    return envInt("POW_BITS_REGISTER", 20, 8, 28);
  },
  get messageBits() {
    return envInt("POW_BITS_MESSAGE", 18, 8, 28);
  },
  ttlSeconds: 600,
  maxNonceLength: 64,
};

export const agentFieldCaps = {
  name: 80,
  description: 1000,
  url: 300,
};

export const messageCaps = {
  body: 2000,
  contact: 200,
  fromName: 80,
};

export const claimTokenTtlDays = 30;

export function limitsFor(status: string) {
  return status === "claimed" ? agentLimits.claimed : agentLimits.unclaimed;
}
