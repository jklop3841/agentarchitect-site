// Basic-auth check for /admin, shared by middleware and admin route handlers
// (defence in depth). Edge-safe: WebCrypto only.

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return bytesToHex(new Uint8Array(digest));
}

export type AdminAuthResult = "ok" | "unconfigured" | "denied";

export async function checkAdminAuth(authHeader: string | null): Promise<AdminAuthResult> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return "unconfigured";
  }

  if (!authHeader?.startsWith("Basic ")) {
    return "denied";
  }

  let decoded = "";
  try {
    decoded = atob(authHeader.replace("Basic ", ""));
  } catch {
    return "denied";
  }
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex < 0) {
    return "denied";
  }

  const providedUser = decoded.slice(0, separatorIndex);
  const providedPass = decoded.slice(separatorIndex + 1);

  const [expectedUserHash, expectedPassHash, providedUserHash, providedPassHash] = await Promise.all([
    sha256Hex(username),
    sha256Hex(password),
    sha256Hex(providedUser ?? ""),
    sha256Hex(providedPass ?? ""),
  ]);

  if (!timingSafeEqual(expectedUserHash, providedUserHash) || !timingSafeEqual(expectedPassHash, providedPassHash)) {
    return "denied";
  }
  return "ok";
}
