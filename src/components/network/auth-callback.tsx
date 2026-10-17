"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { consumeHashSession } from "@/lib/network/client-session";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/account";
  return value;
}

export function AuthCallback() {
  const [state, setState] = useState<{ status: "working" | "error"; message?: string }>({ status: "working" });

  useEffect(() => {
    const result = consumeHashSession(window.location.hash);
    const next = safeNext(new URLSearchParams(window.location.search).get("next"));
    window.history.replaceState(null, "", window.location.pathname);
    if (result?.ok) {
      window.location.replace(next);
      return;
    }
    // Defer the state update so it does not run synchronously inside the effect.
    const message = result && !result.ok ? result.error : "No sign-in token found in this link. It may have expired or already been used.";
    queueMicrotask(() => setState({ status: "error", message }));
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
