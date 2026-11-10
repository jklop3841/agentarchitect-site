"use client";

import { useState } from "react";

import { IMAGEPROOF_VERSION, inspectImage, type ImageProofResult } from "@/lib/tools/imageproof";
import type { ToolEnvelope } from "@/lib/tools/types";

import { common, errorMessage, FileDrop, JsonReport, localEnvelope, Notes, readFileBytes, toBase64, Verdict, type Locale } from "./shared";

const MAX_UPLOAD_BYTES = 3_000_000;

const text = {
  en: {
    image: "Image to inspect",
    expected: "SHA-256 of the original, if you have it (optional)",
    claimedTime: "When were you told it was taken? (optional)",
    claimedDevice: "What device were you told took it? (optional)",
    needFile: "Choose an image first.",
    verdicts: {
      verified_origin: "Verified origin: a trusted signer vouches for this file",
      contradiction_found: "Contradiction found: the evidence conflicts",
      insufficient_evidence: "Insufficient evidence: origin information is present but unverified",
      cannot_determine: "Cannot determine: the file carries no usable origin information",
    },
    cloud: "Validate Content Credentials on the server",
    cloudNote: "This uploads the image (max 3 MB) for cryptographic C2PA validation. It is processed in memory and not stored.",
    cloudTooBig: "The image is larger than 3 MB, so it cannot be sent for server-side validation.",
    rows: { sha: "SHA-256", format: "Format", size: "Dimensions", device: "Camera", captured: "Capture time (as written)", software: "Software", gps: "GPS", c2pa: "Content Credentials", signer: "Signed by" },
    c2pa: {
      absent: "none found",
      present_unvalidated: "present, not validated yet",
      valid_untrusted_signer: "valid signature, signer not on a trust list",
      trusted: "valid and signed by a trusted signer",
      invalid: "present but INVALID for this image",
    },
    findings: "Findings",
    none: "none",
  },
  zh: {
    image: "要检查的图片",
    expected: "原图的 SHA-256（如果你有，可选）",
    claimedTime: "对方说是什么时候拍的？（可选）",
    claimedDevice: "对方说是什么设备拍的？（可选）",
    needFile: "请先选择图片。",
    verdicts: {
      verified_origin: "已验证来源：有受信任的签名者为这个文件背书",
      contradiction_found: "发现证据矛盾：证据之间互相冲突",
      insufficient_evidence: "证据不足：有来源信息，但未经验证",
      cannot_determine: "无法判断：文件里没有可用的来源信息",
    },
    cloud: "在服务器上校验内容凭证",
    cloudNote: "会上传图片（最大 3 MB）做 C2PA 密码学校验。仅在内存中处理，不保存。",
    cloudTooBig: "图片超过 3 MB，无法发送到服务器校验。",
    rows: { sha: "SHA-256", format: "格式", size: "尺寸", device: "相机", captured: "拍摄时间（原样）", software: "软件", gps: "GPS", c2pa: "内容凭证", signer: "签名者" },
    c2pa: {
      absent: "未发现",
      present_unvalidated: "存在，尚未校验",
      valid_untrusted_signer: "签名有效，签名者不在信任列表",
      trusted: "有效，且由受信任的签名者签发",
      invalid: "存在，但对这张图片无效",
    },
    findings: "发现",
    none: "无",
  },
} as const;

export function ImageProofTool({ locale }: { locale: Locale }) {
  const t = text[locale];
  const c = common[locale];
  const [file, setFile] = useState<File | null>(null);
  const [expected, setExpected] = useState("");
  const [claimedTime, setClaimedTime] = useState("");
  const [claimedDevice, setClaimedDevice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [envelope, setEnvelope] = useState<ToolEnvelope<ImageProofResult> | null>(null);

  const claimed = () => (claimedTime.trim() || claimedDevice.trim() ? { captured_at: claimedTime.trim() || undefined, device: claimedDevice.trim() || undefined } : undefined);

  async function runLocal() {
    setError(null);
    setEnvelope(null);
    if (!file) return setError(t.needFile);
    setBusy(true);
    try {
      const bytes = await readFileBytes(file);
      const outcome = await inspectImage({ bytes, name: file.name, declaredType: file.type || null, inputMode: "bytes", expectedSha256: expected.trim() || null, claimed: claimed() ?? null });
      setEnvelope(localEnvelope("imageproof", IMAGEPROOF_VERSION, outcome));
    } catch (caught) {
      setError(errorMessage(caught, c.error));
    } finally {
      setBusy(false);
    }
  }

  async function runCloud() {
    if (!file) return setError(t.needFile);
    if (file.size > MAX_UPLOAD_BYTES) return setError(t.cloudTooBig);
    setError(null);
    setBusy(true);
    try {
      const bytes = await readFileBytes(file);
      const response = await fetch("/api/v1/tools/imageproof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: { content_base64: toBase64(bytes), name: file.name }, ...(expected.trim() ? { expected_sha256: expected.trim() } : {}), ...(claimed() ? { claimed: claimed() } : {}) }),
      });
      const body = (await response.json()) as ToolEnvelope<ImageProofResult>;
      if (body.status === "ok") setEnvelope(body);
      else setError(body.error?.message ?? c.error);
    } catch (caught) {
      setError(errorMessage(caught, c.error));
    } finally {
      setBusy(false);
    }
  }

  const result = envelope?.result;
  const tone = result?.verdict === "verified_origin" ? "good" : result?.verdict === "contradiction_found" ? "bad" : "neutral";
  const device = result ? [result.metadata.device.make, result.metadata.device.model].filter(Boolean).join(" ") : "";

  return (
    <div>
      <p className="an-notice">{c.local}</p>
      <FileDrop label={t.image} file={file} onFile={setFile} accept="image/*,.heic,.heif,.avif,.tif,.tiff" locale={locale} />
      <div className="an-form tp-fields" style={{ marginTop: "0.8rem" }}>
        <label>
          {t.claimedTime}
          <input type="datetime-local" value={claimedTime} onChange={(event) => setClaimedTime(event.target.value)} />
        </label>
        <label>
          {t.claimedDevice}
          <input value={claimedDevice} onChange={(event) => setClaimedDevice(event.target.value)} maxLength={80} placeholder="iPhone 15" />
        </label>
        <label>
          {t.expected}
          <input value={expected} onChange={(event) => setExpected(event.target.value)} spellCheck={false} autoComplete="off" className="tp-mono" />
        </label>
      </div>
      <div className="tp-actions">
        <button type="button" className="an-button" onClick={runLocal} disabled={busy}>
          {busy ? c.running : c.run}
        </button>
        <button type="button" className="an-button an-button--ghost" onClick={runCloud} disabled={busy || !file}>
          {t.cloud}
        </button>
      </div>
      <p className="an-muted">{t.cloudNote}</p>
      {error ? <p className="an-error">{error}</p> : null}
      {envelope && result ? (
        <>
          <Verdict tone={tone} title={t.verdicts[result.verdict]}>
            <span>{result.verdict_reason}</span>
          </Verdict>
          <table className="tp-kv">
            <tbody>
              <tr>
                <th>{t.rows.sha}</th>
                <td className="tp-mono">{result.file.sha256}</td>
              </tr>
              <tr>
                <th>{t.rows.format}</th>
                <td>
                  {result.file.format} · {result.file.size_bytes.toLocaleString()} bytes
                </td>
              </tr>
              <tr>
                <th>{t.rows.size}</th>
                <td>{result.file.width && result.file.height ? `${result.file.width} × ${result.file.height}` : t.none}</td>
              </tr>
              <tr>
                <th>{t.rows.device}</th>
                <td>{device || t.none}</td>
              </tr>
              <tr>
                <th>{t.rows.captured}</th>
                <td>{result.metadata.captured_at ?? t.none}</td>
              </tr>
              <tr>
                <th>{t.rows.software}</th>
                <td>{result.metadata.software ?? t.none}</td>
              </tr>
              <tr>
                <th>{t.rows.gps}</th>
                <td>{result.metadata.gps ? `${result.metadata.gps.latitude}, ${result.metadata.gps.longitude}` : t.none}</td>
              </tr>
              <tr>
                <th>{t.rows.c2pa}</th>
                <td>{t.c2pa[result.content_credentials.state]}</td>
              </tr>
              {result.content_credentials.active_manifest ? (
                <tr>
                  <th>{t.rows.signer}</th>
                  <td>
                    {[result.content_credentials.active_manifest.signer.common_name, result.content_credentials.active_manifest.signer.issuer, result.content_credentials.active_manifest.signer.time].filter(Boolean).join(" · ") || t.none}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <section className="tp-section">
            <h3>{t.findings}</h3>
            <ul className="tp-list">
              {result.findings.map((finding) => (
                <li key={finding.code}>
                  <span className={`tp-level tp-level--${finding.level}`}>{finding.level}</span>
                  {finding.message}
                </li>
              ))}
            </ul>
          </section>
          <Notes envelope={envelope} locale={locale} />
          <JsonReport envelope={envelope} locale={locale} filename="imageproof-report.json" />
        </>
      ) : null}
    </div>
  );
}
