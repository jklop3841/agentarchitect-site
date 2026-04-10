import { NextResponse } from "next/server";

import { createVerificationToken } from "@/lib/security";
import { findApiKey, findExecutionLog } from "@/lib/store";

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
    executionId?: string;
    verificationToken?: string;
  };

  if (!payload.executionId || !payload.verificationToken) {
    return NextResponse.json({ message: "executionId and verificationToken are required." }, { status: 422 });
  }

  const log = await findExecutionLog(payload.executionId);
  if (!log) {
    return NextResponse.json({ message: "Execution not found." }, { status: 404 });
  }

  const expected = createVerificationToken(log.executionId, log.capabilityId);
  const valid = payload.verificationToken === expected && payload.verificationToken === log.verificationToken;

  return NextResponse.json({
    valid,
    executionId: log.executionId,
    capabilityId: log.capabilityId,
    createdAt: log.createdAt,
    status: valid ? "verified" : "mismatch",
  });
}
