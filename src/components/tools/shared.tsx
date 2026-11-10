"use client";

import { useCallback, useId, useState, type ReactNode } from "react";

import { buildEnvelope, createRequestId, ToolError, type ToolEnvelope, type ToolId, type ToolOutcome } from "@/lib/tools/types";

export type Locale = "en" | "zh";

export const common = {
  en: {
    drop: "Drop a file here or click to choose",
    local: "Runs in your browser. The file is not uploaded.",
    run: "Check",
    running: "Working…",
    reset: "Clear",
    report: "Machine-readable report (JSON)",
    copy: "Copy JSON",
    copied: "Copied",
    download: "Download JSON",
    limitations: "What this result does not tell you",
    next: "Suggested next steps",
    tooLarge: "This file is too large to process in the browser.",
    error: "Could not complete the check",
  },
  zh: {
    drop: "把文件拖到这里，或点击选择",
    local: "在你的浏览器里本地计算，文件不会上传。",
    run: "开始核验",
    running: "处理中…",
    reset: "清空",
    report: "机器可读报告（JSON）",
    copy: "复制 JSON",
    copied: "已复制",
    download: "下载 JSON",
    limitations: "这个结果不能说明什么",
    next: "建议的下一步",
    tooLarge: "文件太大，浏览器里处理不了。",
    error: "核验未能完成",
  },
} as const;

export const MAX_BROWSER_FILE_BYTES = 512 * 1024 * 1024;

export async function readFileBytes(file: File): Promise<Uint8Array> {
  if (file.size > MAX_BROWSER_FILE_BYTES) throw new ToolError("payload_too_large", "File too large for in-browser processing.");
  return new Uint8Array(await file.arrayBuffer());
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  return btoa(binary);
}

// Wrap a locally computed outcome in the same envelope the API returns.
export function localEnvelope<T>(tool: ToolId, version: string, outcome: ToolOutcome<T>): ToolEnvelope<T> {
  return buildEnvelope(tool, version, outcome, createRequestId(), { charged: false, amount: 0, unit: "credits", tier: "L0", simulated: true });
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof ToolError ? error.message : error instanceof Error && error.message ? `${fallback}: ${error.message}` : fallback;
}

export function FileDrop({ label, file, onFile, accept, locale }: { label: string; file: File | null; onFile: (file: File | null) => void; accept?: string; locale: Locale }) {
  const id = useId();
  const [over, setOver] = useState(false);
  const t = common[locale];
  return (
    <label
      htmlFor={id}
      className={`tp-drop${over ? " is-over" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        onFile(event.dataTransfer.files?.[0] ?? null);
      }}
    >
      <input id={id} type="file" accept={accept} onChange={(event) => onFile(event.target.files?.[0] ?? null)} />
      <span>{label}</span>
      <br />
      {file ? (
        <strong>
          {file.name} · {file.size.toLocaleString()} bytes
        </strong>
      ) : (
        <span>{t.drop}</span>
      )}
    </label>
  );
}

export function Verdict({ tone, title, children }: { tone: "good" | "bad" | "neutral"; title: string; children?: ReactNode }) {
  return (
    <div className={`tp-verdict tp-verdict--${tone}`} role="status" aria-live="polite">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

export function Notes({ envelope, locale }: { envelope: ToolEnvelope<unknown>; locale: Locale }) {
  const t = common[locale];
  return (
    <>
      {envelope.next_actions.length > 0 ? (
        <section className="tp-section">
          <h3>{t.next}</h3>
          <ul className="tp-list">
            {envelope.next_actions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="tp-section">
        <h3>{t.limitations}</h3>
        <ul className="tp-list">
          {envelope.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function JsonReport({ envelope, locale, filename }: { envelope: ToolEnvelope<unknown>; locale: Locale; filename: string }) {
  const t = common[locale];
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(envelope, null, 2);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [text]);
  const download = useCallback(() => {
    const link = document.createElement("a");
    link.href = `data:application/json;charset=utf-8,${encodeURIComponent(text)}`;
    link.download = filename;
    link.click();
  }, [text, filename]);
  return (
    <section className="tp-section">
      <h3>{t.report}</h3>
      <div className="tp-actions">
        <button type="button" className="an-button an-button--ghost" onClick={copy}>
          {copied ? t.copied : t.copy}
        </button>
        <button type="button" className="an-button an-button--ghost" onClick={download}>
          {t.download}
        </button>
      </div>
      <pre className="tp-pre" tabIndex={0}>
        {text}
      </pre>
    </section>
  );
}
