type WindowEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var __agentFriendlyRateLimit: Map<string, WindowEntry> | undefined;
}

const bucketStore = globalThis.__agentFriendlyRateLimit ?? (globalThis.__agentFriendlyRateLimit = new Map());

function now() {
  return Date.now();
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function consumeRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const timestamp = now();
  const entry = bucketStore.get(options.key);

  if (!entry || entry.resetAt <= timestamp) {
    const resetAt = timestamp + options.windowMs;
    bucketStore.set(options.key, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: options.limit - 1,
      resetAt,
    };
  }

  if (entry.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count += 1;
  bucketStore.set(options.key, entry);

  return {
    allowed: true,
    remaining: options.limit - entry.count,
    resetAt: entry.resetAt,
  };
}
