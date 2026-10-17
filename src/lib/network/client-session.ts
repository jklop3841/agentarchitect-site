// Browser-only session helper. Keeps the Supabase session (from the magic-link
// callback) in localStorage and talks only to this site's /api/v1 endpoints, so the
// browser bundle never needs supabase-js and never sees any server key.

export type StoredSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
  email: string | null;
};

const STORAGE_KEY = "aa_network_session";

export function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed.access_token && parsed.refresh_token ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSession(session: StoredSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("aa-session"));
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("aa-session"));
}

function decodeEmail(accessToken: string) {
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { email?: string };
    return payload.email ?? null;
  } catch {
    return null;
  }
}

// Parses "#access_token=...&refresh_token=...&expires_at=..." from a magic-link redirect.
export function consumeHashSession(hash: string): { ok: true } | { ok: false; error: string } | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const error = params.get("error_description") ?? params.get("error");
  if (error) return { ok: false, error };
  const access = params.get("access_token");
  const refresh = params.get("refresh_token");
  if (!access || !refresh) return null;
  const expiresAt = Number(params.get("expires_at")) || Math.floor(Date.now() / 1000) + (Number(params.get("expires_in")) || 3600);
  writeSession({ access_token: access, refresh_token: refresh, expires_at: expiresAt, email: decodeEmail(access) });
  return { ok: true };
}

export async function getAccessToken(): Promise<string | null> {
  const session = readSession();
  if (!session) return null;
  if (session.expires_at - 60 > Date.now() / 1000) return session.access_token;

  try {
    const response = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    if (!response.ok) {
      clearSession();
      return null;
    }
    const data = (await response.json()) as { access_token: string; refresh_token: string; expires_at: number; user?: { email?: string | null } };
    writeSession({ access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at, email: data.user?.email ?? session.email });
    return data.access_token;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, init: RequestInit & { auth?: boolean } = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (init.auth !== false) {
    const token = await getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(path, { ...init, headers });
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { response, data: data as Record<string, unknown> | null };
}

export function errorMessage(data: Record<string, unknown> | null, fallback = "Something went wrong.") {
  const error = data?.error as { message?: string; details?: unknown } | undefined;
  if (!error) return fallback;
  const details = Array.isArray(error.details) ? ` ${error.details.join(" ")}` : "";
  return `${error.message ?? fallback}${details}`;
}
