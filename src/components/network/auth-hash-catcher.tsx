"use client";

import { useEffect } from "react";

import { consumeHashSession } from "@/lib/network/client-session";

// If Supabase redirects a magic link to any page (e.g. the configured Site URL
// instead of /auth/callback), pick the session out of the URL fragment anyway.
export function AuthHashCatcher() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/auth/callback")) return;
    const hash = window.location.hash;
    if (!hash.includes("access_token=") && !hash.includes("error_description=")) return;
    const result = consumeHashSession(hash);
    if (!result) return;
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    if (result.ok) window.location.assign("/account");
  }, []);

  return null;
}
