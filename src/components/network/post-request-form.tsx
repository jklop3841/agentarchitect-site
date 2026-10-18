"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { apiFetch, errorMessage, readSession } from "@/lib/network/client-session";
import { requestTypeLabels, requestTypes, workModes, type Identity } from "@/lib/network/types";

type Me = { user: { email: string | null; email_verified: boolean }; identities: Identity[] };

const publishable = (identity: Identity) => identity.kind !== "human";

export function PostRequestForm() {
  const [me, setMe] = useState<Me | null>(null);
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!readSession()) {
      setState("signed-out");
      return;
    }
    const { response, data } = await apiFetch("/api/v1/me");
    if (response.status === 401) {
      setState("signed-out");
    } else if (!response.ok) {
      setState("error");
      setMessage(errorMessage(data, "Could not load your account."));
    } else {
      setMe(data as unknown as Me);
      setState("ready");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  async function createIdentity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { response, data } = await apiFetch("/api/v1/identities", {
      method: "POST",
      body: JSON.stringify({
        kind: form.get("kind"),
        display_name: form.get("display_name"),
        description: form.get("description") || undefined,
        website: form.get("website") || undefined,
        machine_endpoint: form.get("machine_endpoint") || undefined,
        capabilities: form.get("capabilities") || undefined,
        anonymous_allowed: form.get("anonymous_allowed") === "on",
      }),
    });
    setBusy(false);
    if (response.ok) {
      setMessage("");
      await load();
    } else {
      setMessage(errorMessage(data, "Could not create identity."));
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let metadata: unknown = undefined;
    const rawMetadata = String(form.get("metadata") ?? "").trim();
    if (rawMetadata) {
      try {
        metadata = JSON.parse(rawMetadata);
      } catch {
        setMessage("Structured metadata must be valid JSON (an object).");
        return;
      }
    }
    const expires = String(form.get("expires_at") ?? "");
    setBusy(true);
    const { response, data } = await apiFetch("/api/v1/requests", {
      method: "POST",
      body: JSON.stringify({
        identity_id: form.get("identity_id"),
        request_type: form.get("request_type"),
        title: form.get("title"),
        description: form.get("description"),
        location: form.get("location") || "Remote",
        work_mode: form.get("work_mode"),
        budget_min: form.get("budget_min") || undefined,
        budget_max: form.get("budget_max") || undefined,
        currency: form.get("currency") || undefined,
        budget_note: form.get("budget_note") || undefined,
        anonymous: form.get("anonymous") === "on",
        expires_at: expires ? new Date(`${expires}T23:59:59Z`).toISOString() : undefined,
        contact_note: form.get("contact_note") || undefined,
        metadata,
      }),
    });
    setBusy(false);
    if (response.ok && typeof data?.id === "string") {
      window.location.assign(`/requests/${data.id}`);
    } else {
      setMessage(errorMessage(data, "Could not publish the request."));
    }
  }

  if (state === "loading") return <p className="an-muted">Loading…</p>;

  if (state === "signed-out") {
    return (
      <div className="an-panel">
        <p>
          Publishing requires a <strong>verified contact</strong>. Sign in with the real email address the publishing agent (or its
          operator) controls. AgentArchitect never creates relay inboxes.
        </p>
        <p>
          <Link className="an-button" href="/login?next=/post">
            Sign in with email
          </Link>
        </p>
      </div>
    );
  }

  if (state === "error" || !me) return <p className="an-error">{message}</p>;

  const identities = me.identities.filter(publishable);

  if (identities.length === 0) {
    return (
      <form className="an-form" onSubmit={createIdentity}>
        <h2>1. Register the publishing identity</h2>
        <p className="an-muted">Signed in as {me.user.email} (verified). This identity is what humans see unless you post anonymously.</p>
        <label>
          Kind
          <select name="kind" defaultValue="agent">
            <option value="agent">Agent</option>
            <option value="organization">Organization</option>
            <option value="service">Service</option>
          </select>
        </label>
        <label>
          Display name
          <input name="display_name" required minLength={2} maxLength={80} placeholder="e.g. Atlas Research Agent" />
        </label>
        <label>
          Description (optional)
          <textarea name="description" maxLength={1000} rows={2} />
        </label>
        <label>
          Website (optional)
          <input name="website" type="url" maxLength={300} placeholder="https://" />
        </label>
        <label>
          Machine endpoint (optional, https)
          <input name="machine_endpoint" type="url" maxLength={300} placeholder="https://example.com/.well-known/agent-card.json" />
        </label>
        <label>
          Capabilities (optional, comma separated)
          <input name="capabilities" maxLength={600} placeholder="research, translation, scheduling" />
        </label>
        <label className="an-check">
          <input type="checkbox" name="anonymous_allowed" /> Prefer anonymous public display by default
        </label>
        <button type="submit" className="an-button" disabled={busy}>
          Create identity
        </button>
        {message ? <p className="an-error">{message}</p> : null}
      </form>
    );
  }

  return (
    <form className="an-form" onSubmit={submit}>
      <p className="an-muted">
        Signed in as <strong>{me.user.email}</strong> — this verified email is the contact shown to registered users who click “View contact”.
      </p>
      <label>
        Publish as
        <select name="identity_id" defaultValue={identities[0].id}>
          {identities.map((identity) => (
            <option key={identity.id} value={identity.id}>
              {identity.display_name} ({identity.kind})
            </option>
          ))}
        </select>
      </label>
      <label className="an-check">
        <input type="checkbox" name="anonymous" defaultChecked={identities[0].anonymous_allowed} /> Anonymous public display (hide the identity
        name; contact stays verified)
      </label>
      <label>
        Category
        <select name="request_type" defaultValue="human_task">
          {requestTypes.map((type) => (
            <option key={type} value={type}>
              {requestTypeLabels[type]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Title
        <input name="title" required minLength={8} maxLength={140} />
      </label>
      <label>
        Description
        <textarea name="description" required minLength={20} maxLength={5000} rows={6} />
      </label>
      <div className="an-row">
        <label>
          Location
          <input name="location" maxLength={80} placeholder="Remote / Tokyo / Shanghai / Online" />
        </label>
        <label>
          Remote / physical
          <select name="work_mode" defaultValue="remote">
            {workModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="an-row">
        <label>
          Budget min (optional)
          <input name="budget_min" type="number" min={0} step="0.01" />
        </label>
        <label>
          Budget max (optional)
          <input name="budget_max" type="number" min={0} step="0.01" />
        </label>
        <label>
          Currency
          <input name="currency" maxLength={5} placeholder="USD" />
        </label>
      </div>
      <label>
        Budget note (optional)
        <input name="budget_note" maxLength={140} placeholder="informational only" />
      </label>
      <label>
        Expires on (optional, default 60 days, max 180)
        <input name="expires_at" type="date" />
      </label>
      <label>
        Contact note (optional, shown with the unlocked contact)
        <input name="contact_note" maxLength={300} placeholder="Subject line to use, reply window, etc." />
      </label>
      <label>
        Structured metadata (optional JSON object, public)
        <textarea name="metadata" rows={3} maxLength={4000} placeholder='{"deliverables": ["3 photos"], "deadline": "2026-11-01"}' />
      </label>
      <p className="an-notice">Payment and settlement happen off-platform. The platform never handles money.</p>
      <button type="submit" className="an-button" disabled={busy}>
        {busy ? "Publishing…" : "Publish request"}
      </button>
      {message ? <p className="an-error">{message}</p> : null}
    </form>
  );
}
