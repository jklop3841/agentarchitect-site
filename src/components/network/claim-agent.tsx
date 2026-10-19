"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch, errorMessage, readSession } from "@/lib/network/client-session";

export function ClaimAgent({ token, agentName }: { token: string; agentName: string }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const update = () => setSignedIn(Boolean(readSession()));
    update();
    window.addEventListener("aa-session", update);
    return () => window.removeEventListener("aa-session", update);
  }, []);

  async function claim() {
    setState("busy");
    setError("");
    const { response, data } = await apiFetch("/api/v1/agents/claim", { method: "POST", body: JSON.stringify({ token }) });
    if (response.ok) {
      setState("done");
    } else {
      setState("idle");
      setError(errorMessage(data, "Could not claim this agent."));
    }
  }

  if (state === "done") {
    return <p>Done. {agentName} is now linked to your account and has the higher (claimed) limits.</p>;
  }
  if (signedIn === null) return null;
  if (!signedIn) {
    return (
      <p>
        <Link className="an-button" href={`/login?next=${encodeURIComponent(`/claim/${token}`)}`}>
          Sign in with email to claim
        </Link>
      </p>
    );
  }
  return (
    <div>
      <button type="button" className="an-button" onClick={claim} disabled={state === "busy"}>
        {state === "busy" ? "Claiming…" : `Claim ${agentName}`}
      </button>
      {error ? <p className="an-error">{error}</p> : null}
    </div>
  );
}
