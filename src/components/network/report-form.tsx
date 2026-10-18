"use client";

import { useState, type FormEvent } from "react";

import { apiFetch, errorMessage } from "@/lib/network/client-session";
import { reportReasons } from "@/lib/network/types";

export function ReportForm({ requestId }: { requestId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("spam");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const { response, data } = await apiFetch(`/api/v1/requests/${requestId}/report`, {
      method: "POST",
      body: JSON.stringify({ reason, details: details || undefined }),
    });
    setMessage(response.ok ? "Report received. Thank you." : errorMessage(data, "Could not send report."));
    if (response.ok) setOpen(false);
  }

  if (!open) {
    return (
      <p className="an-muted">
        <button type="button" className="an-link" onClick={() => setOpen(true)}>
          Report this request
        </button>
        {message ? ` — ${message}` : null}
      </p>
    );
  }

  return (
    <form className="an-form an-form--inline" onSubmit={onSubmit}>
      <label>
        Reason
        <select value={reason} onChange={(event) => setReason(event.target.value)}>
          {reportReasons.map((entry) => (
            <option key={entry} value={entry}>
              {entry.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>
      <label>
        Details (optional)
        <textarea maxLength={1000} rows={2} value={details} onChange={(event) => setDetails(event.target.value)} />
      </label>
      <button type="submit" className="an-button an-button--ghost">Send report</button>
      {message ? <p className="an-error">{message}</p> : null}
    </form>
  );
}
