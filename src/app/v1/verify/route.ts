import { NextResponse } from "next/server";

import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { createVerificationToken, secureEqual } from "@/lib/security";
import { findApiKey, findExecutionLog } from "@/lib/store";
import { normalizeApiKey, readJson, sanitizeVerifyInput } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const authRateLimit = consumeRateLimit({
    key: `verify-auth:${ip}`,
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });

  if (!authRateLimit.allowed) {
    return NextResponse.json(
      { message: "Rate limit exceeded." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((authRateLimit.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const apiKey = normalizeApiKey(request.headers.get("x-api-key"));

  if (!apiKey) {
    return NextResponse.json({ message: "Missing x-api-key header." }, { status: 401 });
  }

  const activeKey = await findApiKey(apiKey);
  if (!activeKey) {
    return NextResponse.json({ message: "Invalid API key." }, { status: 401 });
  }

  const rateLimit = consumeRateLimit({
    key: `verify:${activeKey.id}:${ip}`,
    limit: 60,
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

  const payload = sanitizeVerifyInput(body.data as Record<string, unknown>);
  if (!payload) {
    return NextResponse.json({ message: "executionId and verificationToken are required." }, { status: 422 });
  }

  let log;
  try {
    log = await findExecutionLog(payload.executionId);
  } catch (error) {
    console.error("Failed to read execution log", error);
    return NextResponse.json(
      {
        message: "Failed to read execution log.",
      },
      { status: 503 },
    );
  }

  if (!log) {
    return NextResponse.json({ message: "Execution not found." }, { status: 404 });
  }

  if (log.callerKeyId !== activeKey.id) {
    return NextResponse.json({ message: "Execution does not belong to this API key." }, { status: 403 });
  }

  let expected = "";
  try {
    expected = createVerificationToken(log.executionId, log.capabilityId);
  } catch {
    return NextResponse.json({ message: "Execution signing is not configured." }, { status: 503 });
  }

  const valid =
    secureEqual(payload.verificationToken, expected) && secureEqual(payload.verificationToken, log.verificationToken);

  return NextResponse.json({
    valid,
    executionId: log.executionId,
    capabilityId: log.capabilityId,
    createdAt: log.createdAt,
    status: valid ? "verified" : "mismatch",
  }, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
