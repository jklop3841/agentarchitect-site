import "server-only";

import { NextResponse } from "next/server";

import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { NetworkError } from "@/lib/network/db";

export const MAX_BODY_BYTES = 24_000;

const jsonHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex",
};

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(data, { status, headers: { ...jsonHeaders, ...headers } });
}

export function errorResponse(code: string, status: number, message: string, details?: unknown) {
  return json({ error: { code, message, ...(details ? { details } : {}) } }, status);
}

export function handleError(error: unknown) {
  if (error instanceof NetworkError) {
    return errorResponse(error.code, error.status, error.message);
  }
  console.error("[agent-network] unhandled", error instanceof Error ? error.message : error);
  return errorResponse("internal_error", 500, "Unexpected error.");
}

export function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token || token.length > 4096 || /\s/.test(token)) return null;
  return token;
}

export function rateLimit(request: Request, bucket: string, limit: number, windowMs: number) {
  const result = consumeRateLimit({ key: `${bucket}:${getClientIp(request)}`, limit, windowMs });
  if (!result.allowed) {
    return json(
      { error: { code: "rate_limited", message: "Too many requests. Slow down." } },
      429,
      { "Retry-After": String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))) },
    );
  }
  return null;
}

export async function readJsonBody(request: Request, maxBytes = MAX_BODY_BYTES) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { ok: false as const, response: errorResponse("unsupported_media_type", 415, "Content-Type must be application/json.") };
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false as const, response: errorResponse("payload_too_large", 413, `Body must be <= ${maxBytes} bytes.`) };
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > maxBytes) {
    return { ok: false as const, response: errorResponse("payload_too_large", 413, `Body must be <= ${maxBytes} bytes.`) };
  }
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false as const, response: errorResponse("invalid_json", 400, "Body must be a JSON object.") };
    }
    return { ok: true as const, data: data as Record<string, unknown> };
  } catch {
    return { ok: false as const, response: errorResponse("invalid_json", 400, "Invalid JSON.") };
  }
}
