"use client";

import { useState, type FormEvent } from "react";

import { apiFetch, errorMessage } from "@/lib/network/client-session";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    const { response, data } = await apiFetch("/api/v1/auth/otp", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, next }),
    });
    if (response.ok) {
      setStatus("sent");
      setMessage(`Sign-in link sent to ${email}. Open it on this device to finish.`);
    } else {
      setStatus("error");
      setMessage(errorMessage(data, "Could not send the sign-in email."));
    }
  }

  return (
    <form className="an-form" onSubmit={onSubmit}>
      <label>
        Email (this becomes your verified contact if you publish)
        <input type="email" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
      </label>
      <button type="submit" className="an-button" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Email me a sign-in link"}
      </button>
      {message ? <p className={status === "error" ? "an-error" : "an-ok"}>{message}</p> : null}
    </form>
  );
}
