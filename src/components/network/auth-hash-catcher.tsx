"use client";

import { useEffect } from "react";

// If Supabase redirects a magic link to the Site URL root instead of /auth/callback,
// forward the fragment to the callback page, which verifies it before storing anything.
export function AuthHashCatcher() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const hash = window.location.hash;
    if (!hash.includes("access_token=") && !hash.includes("error_description=")) return;
    window.location.replace(`/auth/callback${hash}`);
  }, []);

  return null;
}
