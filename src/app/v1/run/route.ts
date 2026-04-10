import { NextResponse } from "next/server";

import { getCapability, runCapability } from "@/lib/capabilities";
import { createExecutionId, createVerificationToken } from "@/lib/security";
import { createExecutionLog, findApiKey } from "@/lib/store";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ message: "Missing x-api-key header." }, { status: 401 });
  }

  const activeKey = await findApiKey(apiKey);

  if (!activeKey) {
    return NextResponse.json({ message: "Invalid API key." }, { status: 401 });
  }

  const payload = (await request.json()) as {
    capabilityId?: string;
    input?: Record<string, unknown>;
  };

  if (!payload.capabilityId || !payload.input) {
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
  const verificationToken = createVerificationToken(executionId, capability.id);

  await createExecutionLog({
    executionId,
    capabilityId: capability.id,
    callerLabel: activeKey.label,
    inputSummary: JSON.stringify(payload.input).slice(0, 240),
    outputSummary: outcome.summary,
    estimatedCost: outcome.estimatedCost,
    verificationToken,
    status: "completed",
  });

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
  });
}
