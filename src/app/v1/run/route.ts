import { NextResponse } from "next/server";

import { getCapability, runCapability } from "@/lib/capabilities";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { createExecutionId, createVerificationToken } from "@/lib/security";
import { createExecutionLog, findApiKey } from "@/lib/store";
import { readJson, sanitizeExecutionInput, summarizeStructuredInput } from "@/lib/validation";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ message: "Missing x-api-key header." }, { status: 401 });
  }

  const activeKey = await findApiKey(apiKey);

  if (!activeKey) {
    return NextResponse.json({ message: "Invalid API key." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const rateLimit = consumeRateLimit({
    key: `run:${activeKey.id}:${ip}`,
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Rate limit exceeded." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const body = await readJson(request);
  if (!body.ok) {
    return body.error;
  }

  const payload = sanitizeExecutionInput(body.data as Record<string, unknown>);
  if (!payload) {
    return NextResponse.json({ message: "capabilityId and input are required." }, { status: 422 });
  }

  const capability = getCapability(payload.capabilityId);
  if (!capability) {
    return NextResponse.json({ message: "Unknown capability." }, { status: 404 });
  }

  const outcome = runCapability(payload.capabilityId, payload.input);
  if (!outcome) {
    return NextResponse.json({ message: "Capability execution failed." }, { status: 422 });
  }

  const executionId = createExecutionId();
  let verificationToken = "";
  try {
    verificationToken = createVerificationToken(executionId, capability.id);
  } catch {
    return NextResponse.json({ message: "Execution signing is not configured." }, { status: 503 });
  }

  try {
    await createExecutionLog({
      executionId,
      capabilityId: capability.id,
      callerKeyId: activeKey.id,
      callerLabel: activeKey.label,
      inputSummary: summarizeStructuredInput(payload.input),
      outputSummary: outcome.summary,
      estimatedCost: outcome.estimatedCost,
      verificationToken,
      status: "completed",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to persist execution log.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    executionId,
    capabilityId: capability.id,
    summary: outcome.summary,
    result: outcome.result,
    verification: {
      method: "hmac-sha256",
      verificationToken,
    },
    metering: {
      estimatedCost: outcome.estimatedCost,
      quotaModel: "seed-key",
    },
  }, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
