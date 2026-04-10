"use client";

import { useState } from "react";
import type { FormEvent } from "react";

const initialState = {
  name: "",
  email: "",
  organization: "",
  role: "",
  useCase: "",
  expectedVolume: "",
  locale: "zh",
};

export function ApplyForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/access-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { message?: string; requestId?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Request failed");
      }

      setStatus("success");
      setMessage(`申请已收到。Request ID: ${payload.requestId}`);
      setForm(initialState);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Request failed");
    }
  }

  return (
    <form className="apply-form" onSubmit={submitForm}>
      <div className="apply-grid">
        <label>
          Name
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Lu Cheng / team contact"
            required
          />
        </label>
        <label>
          Email
          <input
            value={form.email}
            type="email"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="hello@example.com"
            required
          />
        </label>
        <label>
          Organization
          <input
            value={form.organization}
            onChange={(event) => setForm((current) => ({ ...current, organization: event.target.value }))}
            placeholder="Studio / product team"
          />
        </label>
        <label>
          Role
          <input
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            placeholder="Agent developer / operator"
          />
        </label>
      </div>
      <label>
        Use case
        <textarea
          value={form.useCase}
          onChange={(event) => setForm((current) => ({ ...current, useCase: event.target.value }))}
          placeholder="Describe the workflow or agent scenario you want to power."
          rows={6}
          required
        />
      </label>
      <div className="apply-grid">
        <label>
          Expected monthly volume
          <input
            value={form.expectedVolume}
            onChange={(event) => setForm((current) => ({ ...current, expectedVolume: event.target.value }))}
            placeholder="e.g. 50 runs"
          />
        </label>
        <label>
          Preferred language
          <select
            value={form.locale}
            onChange={(event) => setForm((current) => ({ ...current, locale: event.target.value }))}
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <div className="apply-actions">
        <button type="submit" className="button button--primary" disabled={status === "submitting"}>
          {status === "submitting" ? "Submitting..." : "申请访问 Key"}
        </button>
        <p className="form-note">
          当前为种子用户阶段。通过申请后会人工审核并发放 Key，不开放匿名高频试调用。
        </p>
      </div>
      {message ? <p className={`form-status form-status--${status}`}>{message}</p> : null}
    </form>
  );
}
