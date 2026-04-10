import { NextResponse } from "next/server";

import type { AccessRequestInput, Locale } from "@/lib/types";

const textEncoder = new TextEncoder();

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }

  return trimmed;
}

function redactSensitiveKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveKeys(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
        const lower = key.toLowerCase();
        if (["password", "token", "secret", "apiKey", "api_key", "key"].includes(lower)) {
          return [key, "[redacted]"];
        }

        return [key, redactSensitiveKeys(entry)];
      }),
    );
  }

  return value;
}

export async function readJson(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { ok: false as const, error: NextResponse.json({ message: "Content-Type must be application/json." }, { status: 415 }) };
  }

  try {
    const raw = await request.text();
    if (textEncoder.encode(raw).length > 10_000) {
      return { ok: false as const, error: NextResponse.json({ message: "Payload too large." }, { status: 413 }) };
    }

    const json = JSON.parse(raw);
    return { ok: true as const, data: json };
  } catch {
    return { ok: false as const, error: NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 }) };
  }
}

export function validateLocale(value: unknown): Locale | null {
  return value === "zh" || value === "en" ? value : null;
}

export function sanitizeAccessRequest(payload: Record<string, unknown>): AccessRequestInput | null {
  const name = normalizeString(payload.name, 120);
  const email = normalizeString(payload.email, 200);
  const useCase = normalizeString(payload.useCase, 2_000);
  const locale = validateLocale(payload.locale);

  if (!name || !email || !useCase || !locale) {
    return null;
  }

  if (!isValidEmail(email)) {
    return null;
  }

  return {
    name,
    email,
    organization: normalizeString(payload.organization, 160) ?? undefined,
    role: normalizeString(payload.role, 120) ?? undefined,
    useCase,
    expectedVolume: normalizeString(payload.expectedVolume, 120) ?? undefined,
    locale,
  };
}

export function sanitizeExecutionInput(payload: Record<string, unknown>) {
  const capabilityId = normalizeString(payload.capabilityId, 64);
  const input = payload.input;

  if (!capabilityId || !input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }

  return {
    capabilityId,
    input: input as Record<string, unknown>,
  };
}

export function sanitizeVerifyInput(payload: Record<string, unknown>) {
  const executionId = normalizeString(payload.executionId, 80);
  const verificationToken = normalizeString(payload.verificationToken, 256);

  if (!executionId || !verificationToken) {
    return null;
  }

  return {
    executionId,
    verificationToken,
  };
}

export function summarizeStructuredInput(value: unknown, maxBytes = 240) {
  const safe = redactSensitiveKeys(value);
  const summary =
    safe && typeof safe === "object" && !Array.isArray(safe)
      ? {
          keys: Object.keys(safe as Record<string, unknown>).slice(0, 10),
          stringLengths: Object.fromEntries(
            Object.entries(safe as Record<string, unknown>)
              .filter(([, entry]) => typeof entry === "string")
              .map(([key, entry]) => [key, (entry as string).length]),
          ),
        }
      : safe;
  const serialized = JSON.stringify(summary);

  if (textEncoder.encode(serialized).length <= maxBytes) {
    return serialized;
  }

  return serialized.slice(0, maxBytes);
}
