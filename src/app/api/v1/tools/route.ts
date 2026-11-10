import { pricingTiers, remoteFetchEnabled, toolLimits, toolQuotas } from "@/lib/tools/config";
import { toolsCors } from "@/lib/tools/http";
import { describeTool, toolDefinitions } from "@/lib/tools/registry";
import { TOOLS_API_VERSION, toolErrorCodes } from "@/lib/tools/types";
import { siteConfig } from "@/lib/site";

// Machine-readable tool catalog. Lists only tools that are implemented and callable.
export const dynamic = "force-dynamic";

export function GET() {
  const base = siteConfig.domain;
  return Response.json(
    {
      service: "AgentArchitect Tools",
      api_version: TOOLS_API_VERSION,
      summary: "Verification tools for AI agents and people: check a file, an image or a statement and get a structured report with evidence and stated limits. Free, no account, no API key.",
      tools: toolDefinitions.map((tool) => describeTool(tool, base)),
      response_envelope: {
        fields: ["tool", "version", "status", "result", "evidence", "limitations", "next_actions", "request_id", "cost", "untrusted_content_notice", "error"],
        error_codes: toolErrorCodes,
      },
      limits: {
        max_inline_file_bytes: toolLimits.maxInlineFileBytes,
        max_remote_file_bytes: toolLimits.maxRemoteFileBytes,
        remote_fetch_enabled: remoteFetchEnabled(),
        calls_per_hour_per_caller: toolQuotas.computePerIpPerHour,
        url_fetches_per_hour_per_caller: toolQuotas.remotePerIpPerHour,
      },
      pricing: { unit: "credits", payment_methods: [], note: "Every tool listed here is free. No payment method is connected; higher tiers are not available yet.", tiers: pricingTiers },
      privacy: "Inspected files and texts are processed in memory and not stored. Usage records hold only tool name, status, size, timing and a salted hash of the caller's IP.",
      docs: { human: `${base}/tools`, openapi: `${base}/openapi.json`, mcp: `${base}/mcp`, skill: `${base}/skill.md` },
    },
    { headers: { ...toolsCors, "Cache-Control": "public, max-age=300, s-maxage=300" } },
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: toolsCors });
}
