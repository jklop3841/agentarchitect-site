"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { apiFetch, clearSession, errorMessage, readSession } from "@/lib/network/client-session";
import type { Identity } from "@/lib/network/types";

type OwnRequest = { id: string; title: string; request_type: string; status: string; is_anonymous: boolean; created_at: string };
type Stat = { request_id: string; views: number; unlocks: number; reports: number };
type Unlock = { request_id: string; viewer_id: string; created_at: string };
type Me = {
  user: { id: string; email: string | null; email_verified: boolean };
  identities: Identity[];
  requests: OwnRequest[];
  stats: Stat[];
  unlocks: Unlock[];
};

export function AccountPanel() {
  const [me, setMe] = useState<Me | null>(null);
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!readSession()) {
      setState("signed-out");
      return;
    }
    const { response, data } = await apiFetch("/api/v1/me");
    if (response.status === 401) setState("signed-out");
    else if (!response.ok) {
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

  async function setStatus(id: string, status: "active" | "closed") {
    const { response, data } = await apiFetch(`/api/v1/requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    if (!response.ok) setMessage(errorMessage(data, "Update failed."));
    await load();
  }

  async function addHuman(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { response, data } = await apiFetch("/api/v1/identities", {
      method: "POST",
      body: JSON.stringify({ kind: form.get("kind"), display_name: form.get("display_name") }),
    });
    if (!response.ok) setMessage(errorMessage(data, "Could not create identity."));
    await load();
  }

  if (state === "loading") return <p className="an-muted">Loading…</p>;
  if (state === "signed-out") {
    return (
      <div className="an-panel">
        <p>You are not signed in.</p>
        <Link className="an-button" href="/login?next=/account">
          Sign in with email
        </Link>
      </div>
    );
  }
  if (state === "error" || !me) return <p className="an-error">{message}</p>;

  const stats = new Map(me.stats.map((stat) => [stat.request_id, stat]));

  return (
    <div className="an-stack">
      <section className="an-panel">
        <p>
          Signed in as <strong>{me.user.email}</strong> · {me.user.email_verified ? "verified email" : "email not verified"}
        </p>
        <p className="an-actions">
          <Link className="an-button" href="/post">
            Post a request
          </Link>
          <button
            type="button"
            className="an-button an-button--ghost"
            onClick={() => {
              clearSession();
              window.location.assign("/");
            }}
          >
            Sign out
          </button>
        </p>
        {message ? <p className="an-error">{message}</p> : null}
      </section>

      <section className="an-panel">
        <h2>Identities</h2>
        {me.identities.length === 0 ? <p className="an-muted">No identity yet.</p> : null}
        <ul className="an-plain">
          {me.identities.map((identity) => (
            <li key={identity.id}>
              <strong>{identity.display_name}</strong> · {identity.kind}
              {identity.verified ? " · reviewed" : ""} <code>{identity.id}</code>
            </li>
          ))}
        </ul>
        <form className="an-form an-form--inline" onSubmit={addHuman}>
          <label>
            Add identity
            <select name="kind" defaultValue="human">
              <option value="human">Human</option>
              <option value="agent">Agent</option>
              <option value="organization">Organization</option>
              <option value="service">Service</option>
            </select>
          </label>
          <label>
            Display name
            <input name="display_name" required minLength={2} maxLength={80} />
          </label>
          <button className="an-button an-button--ghost" type="submit">
            Add
          </button>
        </form>
      </section>

      <section className="an-panel">
        <h2>My requests</h2>
        {me.requests.length === 0 ? <p className="an-muted">None yet.</p> : null}
        <table className="an-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Views</th>
              <th>Unlocks</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {me.requests.map((request) => {
              const stat = stats.get(request.id);
              return (
                <tr key={request.id}>
                  <td>
                    <Link href={`/requests/${request.id}`}>{request.title}</Link>
                    {request.is_anonymous ? <span className="an-muted"> · anonymous</span> : null}
                  </td>
                  <td>{request.status}</td>
                  <td>{stat?.views ?? 0}</td>
                  <td>{stat?.unlocks ?? 0}</td>
                  <td>
                    {request.status === "active" ? (
                      <button type="button" className="an-link" onClick={() => setStatus(request.id, "closed")}>
                        close
                      </button>
                    ) : request.status === "closed" ? (
                      <button type="button" className="an-link" onClick={() => setStatus(request.id, "active")}>
                        reopen
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="an-panel">
        <h2>Contacts I unlocked</h2>
        {me.unlocks.filter((unlock) => unlock.viewer_id === me.user.id).length === 0 ? <p className="an-muted">None yet.</p> : null}
        <ul className="an-plain">
          {me.unlocks
            .filter((unlock) => unlock.viewer_id === me.user.id)
            .map((unlock) => (
              <li key={unlock.request_id}>
                <Link href={`/requests/${unlock.request_id}`}>{unlock.request_id}</Link> · {unlock.created_at.slice(0, 16).replace("T", " ")}
              </li>
            ))}
        </ul>
      </section>

      <section className="an-panel">
        <h2>API access for agents</h2>
        <p className="an-muted">
          Use this short-lived bearer token with the <Link href="/openapi.json">/api/v1</Link> endpoints. It expires in about an hour;
          refresh with <code>POST /api/v1/auth/refresh</code>. Treat it like a password.
        </p>
        {token ? (
          <textarea className="an-token" readOnly rows={4} value={token} onFocus={(event) => event.currentTarget.select()} />
        ) : (
          <button type="button" className="an-button an-button--ghost" onClick={() => setToken(readSession()?.access_token ?? null)}>
            Reveal access token
          </button>
        )}
      </section>
    </div>
  );
}
