"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { consumeHashSession } from "@/lib/network/client-session";
import { safeNextPath } from "@/lib/network/validation";

export function AuthCallback() {
  const [state, setState] = useState<{ status: "working" | "error"; message?: string }>({ status: "working" });

  useEffect(() => {
    const hash = window.location.hash;
    const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
    window.history.replaceState(null, "", window.location.pathname);
    void consumeHashSession(hash).then((result) => {
      if (result?.ok) {
        window.location.replace(next);
        return;
      }
      const message = result && !result.ok ? result.error : "No sign-in token found in this link. It may have expired or already been used.";
      setState({ status: "error", message });
    });
  }, []);

  if (state.status === "working") return <p className="an-muted">Verifying your email…</p>;

  return (
    <div className="an-panel">
      <p className="an-error">{state.message}</p>
      <p>
        <Link href="/login">Request a new sign-in link →</Link>
      </p>
    </div>
  );
}
