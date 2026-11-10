import "server-only";

import type { z } from "zod";

import { decodeBase64 } from "@/lib/tools/bytes";
import { validateC2pa } from "@/lib/tools/c2pa";
import { CLAIMCHECK_VERSION, runClaimCheck } from "@/lib/tools/claimcheck";
import { priceFor, remoteFetchEnabled, toolLimits } from "@/lib/tools/config";
import { runFileProof, type FileSubject } from "@/lib/tools/fileproof";
import { detectFileType } from "@/lib/tools/filetype";
import { inspectImage } from "@/lib/tools/imageproof";
import { consumeQuota } from "@/lib/tools/quota";
import { claimcheckInput, fileproofInput, getToolDefinition, imageproofInput } from "@/lib/tools/registry";
import { safeFetchBytes, type SafeFetchOptions } from "@/lib/tools/safe-fetch";
import { buildEnvelope, buildErrorEnvelope, createRequestId, ToolError, type ToolEnvelope, type ToolId, type ToolOutcome } from "@/lib/tools/types";
import type { ClientClass, UsageRow } from "@/lib/tools/usage";

// The single execution channel behind REST and MCP:
//   validate input -> budget -> quota -> resolve inputs (inline / safe fetch) -> run core ->
//   envelope -> usage row.
// Tool cores are pure functions over bytes and text. They hold no credentials and call no
// model, so nothing in an inspected file or text can change what this service is allowed to do.

export type RunContext = {
  channel: "rest" | "mcp";
  ipHash: string;
  userAgent: string | null;
  clientClass: ClientClass;
  registeredAgent?: boolean;
  // Test-only override for the outbound fetch guard.
  fetchOptions?: Partial<SafeFetchOptions>;
};

export type RunResult = { envelope: ToolEnvelope<unknown>; status: number; usage: UsageRow };

type Meter = { bytesIn: number; modes: Set<string> };

async function loadRemote(url: string, ctx: RunContext, meter: Meter) {
  if (!remoteFetchEnabled()) throw new ToolError("not_available", "Fetching by URL is disabled on this deployment. Send the content inline (content_base64).");
  await consumeQuota("remote_fetch", ctx.ipHash);
  const fetched = await safeFetchBytes(url, { maxBytes: toolLimits.maxRemoteFileBytes, timeoutMs: toolLimits.remoteTimeoutMs, maxRedirects: toolLimits.remoteMaxRedirects, ...ctx.fetchOptions });
  meter.bytesIn += fetched.bytes.length;
  meter.modes.add("url");
  return fetched;
}

function exactlyOne(source: Record<string, unknown>, keys: string[], label: string) {
  const present = keys.filter((key) => typeof source[key] === "string" && (source[key] as string).length > 0);
  if (present.length !== 1) throw new ToolError("invalid_input", `${label} needs exactly one of: ${keys.join(", ")}.`);
  return present[0];
}

async function resolveFile(source: z.infer<typeof fileproofInput>["file"], label: string, ctx: RunContext, meter: Meter): Promise<FileSubject> {
  const mode = exactlyOne(source, ["content_base64", "url", "sha256"], label);
  if (mode === "content_base64") {
    const bytes = decodeBase64(source.content_base64!, toolLimits.maxInlineFileBytes);
    meter.bytesIn += bytes.length;
    meter.modes.add("inline");
    return { bytes, name: source.name, declaredType: source.declared_type, inputMode: "bytes" };
  }
  if (mode === "url") {
    const fetched = await loadRemote(source.url!, ctx, meter);
    return { bytes: fetched.bytes, name: source.name ?? fetched.finalUrl.split("/").pop() ?? null, declaredType: source.declared_type ?? fetched.contentType, inputMode: "url" };
  }
  meter.modes.add("hash");
  return { sha256: source.sha256, name: source.name, declaredType: source.declared_type, sizeBytes: source.size_bytes, inputMode: "hash_only" };
}

async function execute(toolId: ToolId, input: unknown, ctx: RunContext, meter: Meter): Promise<ToolOutcome<unknown>> {
  if (toolId === "fileproof") {
    const data = input as z.infer<typeof fileproofInput>;
    const file = await resolveFile(data.file, "file", ctx, meter);
    const compareWith = data.compare_with ? await resolveFile(data.compare_with, "compare_with", ctx, meter) : null;
    return runFileProof({
      file,
      compareWith,
      expectedSha256: data.expected_sha256,
      signature: data.signature ? { algorithm: data.signature.algorithm, publicKeyPem: data.signature.public_key_pem, signatureBase64: data.signature.signature_base64 } : null,
    });
  }
  if (toolId === "imageproof") {
    const data = input as z.infer<typeof imageproofInput>;
    const mode = exactlyOne(data.image, ["content_base64", "url"], "image");
    let bytes: Uint8Array;
    let name = data.image.name ?? null;
    let declaredType = data.image.declared_type ?? null;
    if (mode === "content_base64") {
      bytes = decodeBase64(data.image.content_base64!, toolLimits.maxInlineFileBytes);
      meter.bytesIn += bytes.length;
      meter.modes.add("inline");
    } else {
      const fetched = await loadRemote(data.image.url!, ctx, meter);
      bytes = fetched.bytes;
      name ??= fetched.finalUrl.split("/").pop() ?? null;
      declaredType ??= fetched.contentType;
    }
    const detected = detectFileType(bytes);
    const c2pa = detected?.category === "image" ? await validateC2pa(bytes, detected.mime) : null;
    return inspectImage({ bytes, name, declaredType, inputMode: mode === "url" ? "url" : "bytes", expectedSha256: data.expected_sha256, claimed: data.claimed, c2pa });
  }
  const data = input as z.infer<typeof claimcheckInput>;
  meter.bytesIn += data.text.length + (data.evidence ?? []).reduce((sum, item) => sum + item.text.length, 0);
  meter.modes.add("text");
  return runClaimCheck({ text: data.text, evidence: data.evidence });
}

export async function runTool(toolId: string, rawInput: unknown, ctx: RunContext): Promise<RunResult> {
  const started = Date.now();
  const requestId = createRequestId();
  const definition = getToolDefinition(toolId);
  const meter: Meter = { bytesIn: 0, modes: new Set() };
  let envelope: ToolEnvelope<unknown>;
  let status = 200;
  const version = definition?.version ?? CLAIMCHECK_VERSION;

  try {
    if (!definition) throw new ToolError("tool_not_found", "Unknown tool. See GET /api/v1/tools for the list.");
    const parsed = definition.input.safeParse(rawInput);
    if (!parsed.success) {
      throw new ToolError("invalid_input", "The request does not match the input schema.", {
        issues: parsed.error.issues.slice(0, 10).map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        schema: `/api/v1/tools/${definition.id}`,
      });
    }
    const price = priceFor(definition.id);
    const budgetLimit = (parsed.data as { max_cost_credits?: number }).max_cost_credits;
    if (!price.available) throw new ToolError("not_available", "This mode is not available yet.");
    if (typeof budgetLimit === "number" && price.credits > budgetLimit) {
      throw new ToolError("budget_exceeded", `This call costs ${price.credits} credits, above max_cost_credits (${budgetLimit}).`, { cost_credits: price.credits });
    }
    await consumeQuota("compute", ctx.ipHash);
    const outcome = await execute(definition.id, parsed.data, ctx, meter);
    envelope = buildEnvelope(definition.id, definition.version, outcome, requestId, { charged: false, amount: price.credits, unit: "credits", tier: price.tier, simulated: true });
  } catch (error) {
    const toolError =
      error instanceof ToolError
        ? error
        : (console.error("[tools] run failed", definition?.id ?? "unknown", error instanceof Error ? error.message.slice(0, 200) : "unknown"), new ToolError("internal_error", "Unexpected error."));
    status = toolError.status;
    envelope = buildErrorEnvelope(definition?.id ?? "unknown", version, toolError, requestId, definition ? priceFor(definition.id).tier : "L0");
  }

  const usage: UsageRow = {
    ts: new Date().toISOString(),
    request_id: requestId,
    tool: definition?.id ?? "unknown",
    channel: ctx.channel,
    input_mode: [...meter.modes].sort().join("+") || "none",
    status: envelope.status,
    error_code: envelope.error?.code ?? null,
    client_class: ctx.clientClass,
    registered_agent: Boolean(ctx.registeredAgent),
    ip_hash: ctx.ipHash,
    user_agent: ctx.userAgent ? ctx.userAgent.slice(0, 200) : null,
    bytes_in: meter.bytesIn,
    duration_ms: Date.now() - started,
    cost_credits: 0,
  };
  return { envelope, status, usage };
}
