import { readJsonBody } from "@/lib/network/http";
import { c2paValidatorName } from "@/lib/tools/c2pa";
import { toolLimits } from "@/lib/tools/config";
import { buildRunContext, scheduleUsage, toolsCors } from "@/lib/tools/http";
import { describeTool, getToolDefinition, inputJsonSchema, outputJsonSchema } from "@/lib/tools/registry";
import { runTool } from "@/lib/tools/run";
import { buildErrorEnvelope, createRequestId, ToolError } from "@/lib/tools/types";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

type Params = { params: Promise<{ tool: string }> };

function respond(body: unknown, status: number, extra: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { ...toolsCors, "Cache-Control": "no-store", "X-Robots-Tag": "noindex", ...extra } });
}

function errorResponse(toolId: string, error: ToolError) {
  const definition = getToolDefinition(toolId);
  return respond(buildErrorEnvelope(definition?.id ?? "unknown", definition?.version ?? "1.0.0", error, createRequestId()), error.status);
}

// Tool definition: description, when to use it, limits and both JSON Schemas.
export async function GET(_request: Request, { params }: Params) {
  const { tool: toolId } = await params;
  const definition = getToolDefinition(toolId);
  if (!definition) return errorResponse(toolId, new ToolError("tool_not_found", "Unknown tool. See GET /api/v1/tools for the list."));
  return Response.json(
    {
      ...describeTool(definition, siteConfig.domain),
      INPUT_SCHEMA: inputJsonSchema(definition),
      OUTPUT_SCHEMA: outputJsonSchema(definition),
      ...(definition.id === "imageproof" ? { runtime: { content_credentials_validator: await c2paValidatorName() } } : {}),
    },
    { headers: { ...toolsCors, "Cache-Control": "public, max-age=300, s-maxage=300" } },
  );
}

export async function POST(request: Request, { params }: Params) {
  const { tool: toolId } = await params;
  const body = await readJsonBody(request, toolLimits.maxBodyBytes);
  if (!body.ok) {
    const status = body.response.status;
    const error =
      status === 413
        ? new ToolError("payload_too_large", `Request body must be <= ${toolLimits.maxBodyBytes} bytes. For larger files send a url, or compute the hash locally.`)
        : status === 415
          ? new ToolError("unsupported_media_type", "Content-Type must be application/json.")
          : new ToolError("invalid_input", "The request body must be a JSON object.");
    return errorResponse(toolId, error);
  }
  const { envelope, status, usage } = await runTool(toolId, body.data, await buildRunContext(request, "rest"));
  scheduleUsage(usage);
  const retryAfter = envelope.error?.retry_after_seconds;
  return respond(envelope, status, retryAfter ? { "Retry-After": String(retryAfter) } : {});
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: toolsCors });
}
