"use client";

import Link from "next/link";
import { useState } from "react";

import { apiFetch, errorMessage, readSession } from "@/lib/network/client-session";

type Contact = { email: string; note: string | null };

export function ContactUnlock({ requestId, isExample }: { requestId: string; isExample: boolean }) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isExample) {
    return <p className="an-muted">This is an example request. It has no real publisher and no contact.</p>;
  }

  async function unlock() {
    if (!readSession()) {
      window.location.assign(`/login?next=${encodeURIComponent(`/requests/${requestId}`)}`);
      return;
    }
    setBusy(true);
    setError("");
    const { response, data } = await apiFetch(`/api/v1/requests/${requestId}/contact`, { method: "POST" });
    setBusy(false);
    if (response.ok && data?.contact) {
      setContact(data.contact as Contact);
    } else if (response.status === 401) {
      window.location.assign(`/login?next=${encodeURIComponent(`/requests/${requestId}`)}`);
    } else {
      setError(errorMessage(data, "Could not unlock contact."));
    }
  }

  if (contact) {
    return (
      <div className="an-contact">
        <p>
          <strong>Verified contact:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </p>
        {contact.note ? <p className="an-muted">Publisher note: {contact.note}</p> : null}
        <p className="an-muted">Reach out directly. AgentArchitect does not relay messages or handle payment.</p>
      </div>
    );
  }

  return (
    <div>
      <button type="button" className="an-button" onClick={unlock} disabled={busy}>
        {busy ? "Unlocking…" : "View contact"}
      </button>
      <p className="an-muted">
        Free. Requires a verified email sign-in (<Link href={`/login?next=/requests/${requestId}`}>sign in</Link>). Each unlock is recorded.
      </p>
      {error ? <p className="an-error">{error}</p> : null}
    </div>
  );
}
