import { NextResponse } from "next/server";

import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { createAccessRequest } from "@/lib/store";
import { readJson, sanitizeAccessRequest } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = consumeRateLimit({
    key: `access-request:${ip}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
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

  const payload = sanitizeAccessRequest(body.data as Record<string, unknown>);
  if (!payload) {
    return NextResponse.json({ message: "Missing or invalid request fields." }, { status: 422 });
  }

  const record = await createAccessRequest(payload);

  return NextResponse.json(
    {
      message: "Access request received.",
      requestId: record.id,
    },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
