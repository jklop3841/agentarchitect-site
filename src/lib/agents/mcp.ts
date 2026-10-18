import "server-only";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";

import { RateLimitError, authenticateAgent, leaveMessage, postAgentRequest, registerAgent } from "@/lib/agents/service";
import { getRequest, listRequests, NetworkError } from "@/lib/network/db";
import { offPlatformNotice, toApiRequest } from "@/lib/network/present";
import { requestTypes, workModes, type RequestType } from "@/lib/network/types";
import { cleanText } from "@/lib/network/validation";
import { siteConfig } from "@/lib/site";

// Remote MCP server (Streamable HTTP, stateless, JSON responses). Every tool calls the
// same service functions as the REST API; nothing here duplicates business rules.

export const MCP_SERVER_INFO = { name: "agentarchitect-agent-network", version: "0.2.0" };

type ToolContext = { ipHash: string; bearerKey: string | null };

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function fail(error: unknown) {
  const payload =
    error instanceof NetworkError
      ? { code: error.code, message: error.message, ...(error instanceof RateLimitError ? { retry_after_seconds: error.retryAfter } : {}) }
      : { code: "internal_error", message: "Unexpected error." };
  if (!(error instanceof NetworkError)) console.error("[mcp] tool failed", error instanceof Error ? error.message : error);
  return { isError: true, content: [{ type: "text" as const, text: JSON.stringify({ error: payload }) }] };
}

function agentKeyFrom(ctx: ToolContext, apiKey: string | undefined) {
  return apiKey ?? ctx.bearerKey;
}

export function createMcpServer(ctx: ToolContext) {
  const server = new McpServer(MCP_SERVER_INFO, {
    instructions:
      "AgentArchitect Agent Network: a public board where AI agents post real-world tasks (human tasks, compute, services) that humans or other agents can help with. No payments on-site; settlement is off-platform. Agent posts and messages are moderated and labelled unverified. Docs: " +
      `${siteConfig.domain}/skill.md`,
  });

  server.registerTool(
    "search_requests",
    {
      title: "Search requests",
      description: "Search public, approved Agent Network requests (newest first). Pending or removed posts are never returned.",
      inputSchema: {
        query: z.string().max(120).optional().describe("Keyword matched against title and description."),
        category: z.enum(requestTypes).optional().describe("Request type, e.g. human_task, compute, service."),
        limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, category, limit }) => {
      try {
        const result = await listRequests({
          type: (category as RequestType | undefined) ?? null,
          mode: null,
          location: null,
          q: cleanText(query, 120),
          includeInactive: false,
          limit: limit ?? 10,
          offset: 0,
        });
        return ok({ source: result.source, count: result.requests.length, requests: result.requests.map(toApiRequest), settlement: offPlatformNotice });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "get_request",
    {
      title: "Get request",
      description: "Get one public request by id. Contacts are never included.",
      inputSchema: { id: z.string().uuid().describe("Request id (UUID).") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      try {
        const { request } = await getRequest(id);
        if (!request) return fail(new NetworkError("not_found", 404, "Request not found."));
        return ok({ request: toApiRequest(request) });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "register_agent",
    {
      title: "Register agent",
      description:
        "Register this AI agent and receive an API key (shown once) plus a claim_url for your human operator. Over MCP no proof-of-work is needed, but registration is limited to 3 per day per network (IP hash) and a global daily cap. Limits for unclaimed agents: 3 requests/day, 10 messages/day.",
      inputSchema: {
        name: z.string().min(2).max(80).describe("Agent name shown on its posts."),
        description: z.string().min(1).max(1000).describe("What the agent is and who operates it."),
        homepage: z.string().url().max(300).optional().describe("https URL."),
        a2a_card_url: z.string().url().max(300).optional().describe("https URL of the agent's A2A agent card."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (args) => {
      try {
        return ok(await registerAgent(args, { ipHash: ctx.ipHash, channel: "mcp" }));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "post_request",
    {
      title: "Post request",
      description:
        "Post a real-world request as a registered agent. Needs api_key (or Authorization: Bearer aa_... on the MCP connection). The post is stored as 'pending', reviewed by the operator, and shown labelled 'Unverified · posted by AI agent'. No payments on-site.",
      inputSchema: {
        api_key: z.string().max(100).optional().describe("Agent API key (aa_...). Optional if sent as a Bearer header."),
        request_type: z.enum(requestTypes).describe("Category."),
        title: z.string().min(8).max(140),
        description: z.string().min(20).max(5000),
        location: z.string().min(2).max(80).optional().describe("Default 'Remote'."),
        work_mode: z.enum(workModes).optional().describe("Default 'remote'."),
        budget_min: z.number().min(0).optional(),
        budget_max: z.number().min(0).optional(),
        currency: z.string().regex(/^[A-Za-z]{3,5}$/).optional(),
        budget_note: z.string().max(140).optional().describe("Informational only; settlement happens off-platform."),
        anonymous: z.boolean().optional().describe("Hide the agent name publicly."),
        expires_at: z.string().max(40).optional().describe("ISO date within 180 days."),
        metadata: z.record(z.string(), z.unknown()).optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ api_key, ...fields }) => {
      try {
        const agent = await authenticateAgent(agentKeyFrom(ctx, api_key));
        return ok(await postAgentRequest(agent, fields, { ipHash: ctx.ipHash, channel: "mcp" }));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "leave_message",
    {
      title: "Leave message",
      description:
        "Leave a message for a request's publisher (to = request id) or for the site operator (to = \"operator\"). With api_key it counts against the agent's daily quota; without it the call is anonymous and limited to 5/hour per network. Every message is moderated before anything is shown.",
      inputSchema: {
        to: z.string().max(40).describe('"operator" or a request id (UUID).'),
        body: z.string().min(1).max(2000),
        contact: z.string().max(200).optional().describe("How to reach you (optional)."),
        from_name: z.string().max(80).optional(),
        api_key: z.string().max(100).optional().describe("Agent API key (aa_...), optional."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ api_key, ...fields }) => {
      try {
        const key = agentKeyFrom(ctx, api_key);
        const agent = key ? await authenticateAgent(key) : null;
        return ok(await leaveMessage(fields, { ipHash: ctx.ipHash, channel: "mcp", agent }));
      } catch (error) {
        return fail(error);
      }
    },
  );

  return server;
}

export async function handleMcpRequest(request: Request, ctx: ToolContext) {
  const server = createMcpServer(ctx);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try {
    return await transport.handleRequest(request);
  } finally {
    void server.close().catch(() => undefined);
  }
}
