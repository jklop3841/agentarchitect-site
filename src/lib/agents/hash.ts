// Edge- and Node-safe hashing helpers (WebCrypto only), shared by middleware and routes.

const encoder = new TextEncoder();

export function toHex(buffer: ArrayBuffer | Uint8Array) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

export async function sha256Hex(value: string) {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

export async function hmacSha256(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

export async function hmacHex(secret: string, value: string) {
  return toHex(await hmacSha256(secret, value));
}

export function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return diff === 0;
}

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Unbiased base62 string from crypto randomness (rejection sampling).
export function randomBase62(length: number) {
  let out = "";
  while (out.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const byte of bytes) {
      if (byte < 248 && out.length < length) out += BASE62[byte % 62];
    }
  }
  return out;
}

// Secret derivation: explicit env var wins; otherwise derive from the server-only
// service-role key (one-way HMAC) so preview deploys work without extra setup.
// Outside production a fixed dev secret is used. Returns null if nothing is available.
const derived = new Map<string, string>();

async function deriveSecret(envName: string, label: string) {
  const explicit = process.env[envName];
  if (explicit) return explicit;
  const cacheKey = `${envName}:${process.env.SUPABASE_SERVICE_ROLE_KEY ? "svc" : "none"}`;
  const cached = derived.get(cacheKey);
  if (cached) return cached;
  const value = await deriveUncached(label);
  if (value) derived.set(cacheKey, value);
  return value;
}

async function deriveUncached(label: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) return hmacHex(serviceKey, `agentarchitect:${label}:v1`);
  if (process.env.NODE_ENV !== "production") return `agentarchitect-dev-${label}`;
  return null;
}

export function getPowSecret() {
  return deriveSecret("POW_SECRET", "pow");
}

export async function getIpSalt() {
  return (await deriveSecret("IP_HASH_SALT", "ip")) ?? "agentarchitect-ip-unsalted";
}

// Raw IPs are never stored; only this salted hash.
export async function hashIp(ip: string) {
  return sha256Hex(`${await getIpSalt()}:${ip || "unknown"}`);
}

// API keys are stored as SHA-256 (HMAC with AGENT_KEY_PEPPER when set).
// Changing AGENT_KEY_PEPPER later invalidates every issued key.
export async function hashApiKey(key: string) {
  const pepper = process.env.AGENT_KEY_PEPPER;
  return pepper ? hmacHex(pepper, key) : sha256Hex(key);
}

export function hashToken(token: string) {
  return sha256Hex(`claim:${token}`);
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
