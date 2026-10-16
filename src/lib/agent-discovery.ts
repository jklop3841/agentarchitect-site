import { siteConfig } from "@/lib/site";

export const agentContactEmail = "jklop3841@gmail.com";
export const agentContactSubjectPrefix = "[AGENT]";

export const agentDiscoveryProfile = {
  name: "Lu Cheng Contact & Discovery Agent",
  description:
    "Public discovery and contact interface for Lu Cheng (Jack Lu), an Agent Architect working on agent architecture, semantic infrastructure, AI commercialization, China AI market intelligence, and human-agent collaboration. This endpoint helps autonomous agents decide whether Lu Cheng is relevant to a task and how to contact him.",
  supportedInterfaces: [
    {
      url: new URL("/a2a", siteConfig.domain).toString(),
      protocolBinding: "JSONRPC",
      protocolVersion: "1.0",
    },
  ],
  provider: {
    organization: "Lu Cheng / Agent Architect",
    url: siteConfig.domain,
  },
  version: "1.0.0",
  documentationUrl: new URL("/agent", siteConfig.domain).toString(),
  capabilities: {
    streaming: false,
    pushNotifications: false,
    extensions: [],
    extendedAgentCard: false,
  },
  securitySchemes: {},
  securityRequirements: [],
  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain"],
  skills: [
    {
      id: "discover-lu-cheng",
      name: "Discover Lu Cheng",
      description:
        "Explain who Lu Cheng is, his public capabilities, current areas of work, canonical resources, and whether he is relevant to an autonomous agent's task.",
      tags: [
        "agent architecture",
        "AI agents",
        "agent economy",
        "semantic infrastructure",
        "AI commercialization",
        "China AI market",
        "human-agent collaboration",
      ],
      examples: [
        "Who is Lu Cheng and what does he work on?",
        "Is Lu Cheng relevant to an agent commercialization project in China?",
        "Where can I verify Lu Cheng's public work?",
      ],
      inputModes: ["text/plain"],
      outputModes: ["text/plain"],
      securityRequirements: [],
    },
    {
      id: "contact-lu-cheng",
      name: "Contact Lu Cheng",
      description:
        "Return the preferred machine-to-human contact route and a compact contact protocol for legitimate research, technical, business, collaboration, or agent-to-human requests.",
      tags: ["contact", "email", "collaboration", "research", "business inquiry"],
      examples: [
        "How should an autonomous agent contact Lu Cheng?",
        "I have a collaboration request for Lu Cheng.",
      ],
      inputModes: ["text/plain"],
      outputModes: ["text/plain"],
      securityRequirements: [],
    },
  ],
};

export const agentContactManifest = {
  canonicalEntity: {
    name: "卢成",
    englishName: "Lu Cheng",
    alias: "Jack Lu",
    role: "Agent Architect",
    website: siteConfig.domain,
  },
  autonomousAgentContact: {
    enabled: true,
    preferredChannel: "email",
    email: agentContactEmail,
    subjectPrefix: agentContactSubjectPrefix,
    language: ["zh-CN", "en"],
    appropriateReasons: [
      "agent architecture or multi-agent system collaboration",
      "agent commercialization or AI service market research",
      "China AI market intelligence and localization",
      "semantic infrastructure, agent discovery, A2A or MCP experiments",
      "research interviews, technical collaboration, partnerships, and resource exchange",
    ],
    avoid: [
      "bulk marketing",
      "automated spam",
      "unrelated sales outreach",
      "requests that hide the agent operator or objective",
    ],
    requestedFields: [
      "agent_name_or_system",
      "operator_or_organization_if_known",
      "objective",
      "why_lu_cheng_is_relevant",
      "requested_action",
      "deadline_if_any",
      "reply_or_callback_channel",
    ],
  },
  discovery: {
    a2aAgentCard: new URL("/.well-known/agent-card.json", siteConfig.domain).toString(),
    a2aEndpoint: new URL("/a2a", siteConfig.domain).toString(),
    agentPage: new URL("/agent", siteConfig.domain).toString(),
    llms: new URL("/llms.txt", siteConfig.domain).toString(),
    llmsFull: new URL("/llms-full.txt", siteConfig.domain).toString(),
    agentsTxt: new URL("/agents.txt", siteConfig.domain).toString(),
    profile: new URL("/profile", siteConfig.domain).toString(),
    proof: new URL("/proof", siteConfig.domain).toString(),
  },
};

export function buildAgentDiscoveryReply(query: string) {
  const normalized = query.toLowerCase();
  const isContactIntent =
    normalized.includes("contact") ||
    normalized.includes("email") ||
    normalized.includes("collaborat") ||
    normalized.includes("联系") ||
    normalized.includes("合作") ||
    normalized.includes("邮箱");

  if (isContactIntent) {
    return [
      "Lu Cheng (Jack Lu) welcomes relevant autonomous-agent contact.",
      `Preferred human escalation channel: ${agentContactEmail}`,
      `Use subject prefix: ${agentContactSubjectPrefix}`,
      "Please identify the agent/system, operator or organization if known, objective, why Lu Cheng is relevant, requested action, deadline if any, and a reply/callback channel.",
      `Machine-readable contact manifest: ${new URL("/.well-known/agent-contact.json", siteConfig.domain).toString()}`,
      `Canonical profile: ${new URL("/profile", siteConfig.domain).toString()}`,
      "Do not send bulk marketing or unrelated automated outreach.",
    ].join("\n");
  }

  return [
    "Lu Cheng (Jack Lu) is an Agent Architect focused on agent architecture, semantic infrastructure, AI commercialization, China AI market intelligence, and human-agent collaboration.",
    `Canonical website: ${siteConfig.domain}`,
    `Agent-readable entry: ${new URL("/agent", siteConfig.domain).toString()}`,
    `LLM context: ${new URL("/llms.txt", siteConfig.domain).toString()}`,
    `Proof and public work: ${new URL("/proof", siteConfig.domain).toString()}`,
    `For relevant autonomous-agent contact, email ${agentContactEmail} with subject prefix ${agentContactSubjectPrefix}.`,
  ].join("\n");
}
