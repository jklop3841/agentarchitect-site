"use client";

import { useState } from "react";

import { FILEPROOF_VERSION, runFileProof, signatureAlgorithms, type FileProofResult, type FileReport, type SignatureAlgorithm } from "@/lib/tools/fileproof";
import type { ToolEnvelope } from "@/lib/tools/types";

import { common, errorMessage, FileDrop, JsonReport, localEnvelope, Notes, readFileBytes, toBase64, Verdict, type Locale } from "./shared";

const text = {
  en: {
    fileA: "File to check",
    fileB: "Second file to compare (optional)",
    expected: "Expected SHA-256 from the publisher (optional)",
    signature: "Verify a detached signature (optional)",
    algorithm: "Algorithm",
    publicKey: "Signer's public key (PEM, BEGIN PUBLIC KEY)",
    sigFile: "Signature file (.sig), or paste base64 below",
    sigText: "Signature (base64)",
    needFile: "Choose a file first.",
    verdicts: {
      verified_against_reference: "Match: the file agrees with your reference",
      mismatch: "Mismatch: the file does NOT agree with your reference",
      no_reference: "Hash computed. Nothing to compare it with yet",
    },
    rows: { sha: "SHA-256", size: "Size", type: "Detected type", declared: "Name matches type", compare: "Second file", known: "Expected hash", sig: "Signature" },
    yes: "yes",
    no: "NO",
    identical: "identical bytes",
    different: "DIFFERENT bytes",
    matches: "matches",
    notMatch: "does NOT match",
    valid: "valid for this key",
    invalid: "NOT valid for this key",
    unknown: "not recognised",
  },
  zh: {
    fileA: "要核验的文件",
    fileB: "用来比对的第二份文件（可选）",
    expected: "发布方公布的 SHA-256（可选）",
    signature: "验证分离式签名（可选）",
    algorithm: "算法",
    publicKey: "签名者公钥（PEM，BEGIN PUBLIC KEY）",
    sigFile: "签名文件（.sig），或在下方粘贴 base64",
    sigText: "签名（base64）",
    needFile: "请先选择文件。",
    verdicts: {
      verified_against_reference: "一致：文件与你提供的参照相符",
      mismatch: "不一致：文件与你提供的参照不符",
      no_reference: "已算出哈希，但还没有可对照的参照",
    },
    rows: { sha: "SHA-256", size: "大小", type: "识别出的类型", declared: "文件名与类型相符", compare: "第二份文件", known: "预期哈希", sig: "签名" },
    yes: "是",
    no: "否",
    identical: "字节完全相同",
    different: "字节不同",
    matches: "相符",
    notMatch: "不相符",
    valid: "对该公钥有效",
    invalid: "对该公钥无效",
    unknown: "未识别",
  },
} as const;

function FileRows({ report, t }: { report: FileReport; t: (typeof text)[Locale] }) {
  return (
    <>
      <tr>
        <th>{t.rows.sha}</th>
        <td className="tp-mono">{report.sha256}</td>
      </tr>
      <tr>
        <th>{t.rows.size}</th>
        <td>{report.size_bytes?.toLocaleString()} bytes</td>
      </tr>
      <tr>
        <th>{t.rows.type}</th>
        <td>{report.detected_type ? `${report.detected_type.label} (${report.detected_type.mime})` : t.unknown}</td>
      </tr>
      {report.type_matches_declared !== null ? (
        <tr>
          <th>{t.rows.declared}</th>
          <td>{report.type_matches_declared ? t.yes : t.no}</td>
        </tr>
      ) : null}
    </>
  );
}

export function FileProofTool({ locale }: { locale: Locale }) {
  const t = text[locale];
  const c = common[locale];
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [expected, setExpected] = useState("");
  const [algorithm, setAlgorithm] = useState<SignatureAlgorithm>("ed25519");
  const [publicKey, setPublicKey] = useState("");
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [envelope, setEnvelope] = useState<ToolEnvelope<FileProofResult> | null>(null);

  async function run() {
    setError(null);
    setEnvelope(null);
    if (!fileA) return setError(t.needFile);
    setBusy(true);
    try {
      const bytes = await readFileBytes(fileA);
      const other = fileB ? await readFileBytes(fileB) : null;
      const outcome = await runFileProof({
        file: { bytes, name: fileA.name, declaredType: fileA.type || null, inputMode: "bytes" },
        compareWith: other && fileB ? { bytes: other, name: fileB.name, declaredType: fileB.type || null, inputMode: "bytes" } : null,
        expectedSha256: expected.trim() || null,
        signature: publicKey.trim() && signature.trim() ? { algorithm, publicKeyPem: publicKey, signatureBase64: signature } : null,
      });
      setEnvelope(localEnvelope("fileproof", FILEPROOF_VERSION, outcome));
    } catch (caught) {
      setError(errorMessage(caught, c.error));
    } finally {
      setBusy(false);
    }
  }

  const result = envelope?.result;
  const tone = result?.integrity === "verified_against_reference" ? "good" : result?.integrity === "mismatch" ? "bad" : "neutral";

  return (
    <div>
      <p className="an-notice">{c.local}</p>
      <div className="tp-fields">
        <FileDrop label={t.fileA} file={fileA} onFile={setFileA} locale={locale} />
        <FileDrop label={t.fileB} file={fileB} onFile={setFileB} locale={locale} />
      </div>
      <div className="an-form" style={{ marginTop: "0.8rem" }}>
        <label>
          {t.expected}
          <input value={expected} onChange={(event) => setExpected(event.target.value)} placeholder="e3b0c442…" spellCheck={false} autoComplete="off" className="tp-mono" />
        </label>
        <details>
          <summary>{t.signature}</summary>
          <label>
            {t.algorithm}
            <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value as SignatureAlgorithm)}>
              {signatureAlgorithms.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.publicKey}
            <textarea rows={4} value={publicKey} onChange={(event) => setPublicKey(event.target.value)} spellCheck={false} className="tp-mono" />
          </label>
          <label>
            {t.sigFile}
            <input
              type="file"
              onChange={async (event) => {
                const picked = event.target.files?.[0];
                if (picked && picked.size <= 4096) setSignature(toBase64(new Uint8Array(await picked.arrayBuffer())));
              }}
            />
          </label>
          <label>
            {t.sigText}
            <input value={signature} onChange={(event) => setSignature(event.target.value)} spellCheck={false} autoComplete="off" className="tp-mono" />
          </label>
        </details>
      </div>
      <div className="tp-actions">
        <button type="button" className="an-button" onClick={run} disabled={busy}>
          {busy ? c.running : c.run}
        </button>
        <button
          type="button"
          className="an-button an-button--ghost"
          onClick={() => {
            setFileA(null);
            setFileB(null);
            setExpected("");
            setPublicKey("");
            setSignature("");
            setEnvelope(null);
            setError(null);
          }}
        >
          {c.reset}
        </button>
      </div>
      {error ? <p className="an-error">{error}</p> : null}
      {envelope && result ? (
        <>
          <Verdict tone={tone} title={t.verdicts[result.integrity]} />
          <table className="tp-kv">
            <tbody>
              <FileRows report={result.file} t={t} />
              {result.compare ? (
                <tr>
                  <th>{t.rows.compare}</th>
                  <td>
                    {result.compare.identical ? t.identical : t.different}
                    <br />
                    <span className="tp-mono">{result.compare.other.sha256}</span>
                  </td>
                </tr>
              ) : null}
              {result.known_hash ? (
                <tr>
                  <th>{t.rows.known}</th>
                  <td>{result.known_hash.match ? t.matches : t.notMatch}</td>
                </tr>
              ) : null}
              {result.signature ? (
                <tr>
                  <th>{t.rows.sig}</th>
                  <td>
                    {result.signature.algorithm}: {result.signature.valid ? t.valid : t.invalid}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <Notes envelope={envelope} locale={locale} />
          <JsonReport envelope={envelope} locale={locale} filename="fileproof-report.json" />
        </>
      ) : null}
    </div>
  );
}
