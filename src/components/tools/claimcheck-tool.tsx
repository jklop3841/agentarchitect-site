"use client";

import { useState } from "react";

import { CLAIMCHECK_VERSION, claimLimits, runClaimCheck, type ClaimCheckResult } from "@/lib/tools/claimcheck";
import type { ToolEnvelope } from "@/lib/tools/types";

import { common, errorMessage, JsonReport, localEnvelope, Notes, Verdict, type Locale } from "./shared";

const text = {
  en: {
    statement: "Statement to analyse",
    placeholder: "Paste the statement, message or paragraph here.",
    evidence: "Evidence texts to compare against (optional)",
    evidenceText: "Evidence text",
    source: "Where it came from",
    add: "Add evidence",
    remove: "Remove",
    local: "Runs in your browser with fixed rules. Nothing is sent to a server or to an AI model.",
    summary: (r: ClaimCheckResult["summary"]) => `${r.claims} checkable claim(s) in ${r.sentences} sentence(s)`,
    counts: (r: ClaimCheckResult["summary"]) => `supported ${r.supported} · contradicted ${r.contradicted} · inconclusive ${r.inconclusive} · not checked ${r.not_checked} · internal contradictions ${r.internal_contradictions}`,
    sentences: "Sentences by type",
    claims: "Checkable claims",
    contradictions: "Sentences that may contradict each other",
    plan: "Verification plan",
    missing: "Still needed",
    noClaims: "No checkable factual claims found.",
  },
  zh: {
    statement: "要分析的陈述",
    placeholder: "把那段话、消息或段落粘贴到这里。",
    evidence: "用来对照的证据文本（可选）",
    evidenceText: "证据文本",
    source: "证据出处",
    add: "添加证据",
    remove: "移除",
    local: "在你的浏览器里按固定规则运行，不发送到服务器，也不发送给任何 AI 模型。",
    summary: (r: ClaimCheckResult["summary"]) => `${r.sentences} 句话中有 ${r.claims} 条可核对的主张`,
    counts: (r: ClaimCheckResult["summary"]) => `支持 ${r.supported} · 反驳 ${r.contradicted} · 无法定论 ${r.inconclusive} · 未核查 ${r.not_checked} · 内部矛盾 ${r.internal_contradictions}`,
    sentences: "逐句分类",
    claims: "可核对的主张",
    contradictions: "可能互相矛盾的句子",
    plan: "核验计划",
    missing: "还缺",
    noClaims: "没有找到可核对的事实主张。",
  },
} as const;

type EvidenceDraft = { text: string; source: string };

export function ClaimCheckTool({ locale }: { locale: Locale }) {
  const t = text[locale];
  const c = common[locale];
  const [statement, setStatement] = useState("");
  const [evidence, setEvidence] = useState<EvidenceDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [envelope, setEnvelope] = useState<ToolEnvelope<ClaimCheckResult> | null>(null);

  function run() {
    setError(null);
    setEnvelope(null);
    try {
      const outcome = runClaimCheck({
        text: statement,
        evidence: evidence.filter((item) => item.text.trim()).map((item, index) => ({ id: `E${index + 1}`, text: item.text, source: item.source.trim() || null })),
      });
      setEnvelope(localEnvelope("claimcheck", CLAIMCHECK_VERSION, outcome));
    } catch (caught) {
      setError(errorMessage(caught, c.error));
    }
  }

  const update = (index: number, patch: Partial<EvidenceDraft>) => setEvidence((items) => items.map((item, position) => (position === index ? { ...item, ...patch } : item)));
  const result = envelope?.result;
  const tone = result ? (result.summary.contradicted + result.summary.internal_contradictions > 0 ? "bad" : result.summary.supported > 0 && result.summary.supported === result.summary.claims ? "good" : "neutral") : "neutral";

  return (
    <div>
      <p className="an-notice">{t.local}</p>
      <div className="an-form">
        <label>
          {t.statement}
          <textarea rows={7} value={statement} onChange={(event) => setStatement(event.target.value)} maxLength={claimLimits.maxTextChars} placeholder={t.placeholder} />
        </label>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend>{t.evidence}</legend>
          {evidence.map((item, index) => (
            <div key={index} className="tp-card" style={{ marginBottom: "0.6rem" }}>
              <label>
                {t.evidenceText} E{index + 1}
                <textarea rows={3} value={item.text} onChange={(event) => update(index, { text: event.target.value })} maxLength={claimLimits.maxEvidenceChars} />
              </label>
              <label>
                {t.source}
                <input value={item.source} onChange={(event) => update(index, { source: event.target.value })} maxLength={200} />
              </label>
              <button type="button" className="an-button an-button--ghost" onClick={() => setEvidence((items) => items.filter((_, position) => position !== index))}>
                {t.remove}
              </button>
            </div>
          ))}
          {evidence.length < claimLimits.maxEvidenceItems ? (
            <button type="button" className="an-button an-button--ghost" onClick={() => setEvidence((items) => [...items, { text: "", source: "" }])}>
              {t.add}
            </button>
          ) : null}
        </fieldset>
      </div>
      <div className="tp-actions">
        <button type="button" className="an-button" onClick={run}>
          {c.run}
        </button>
        <button
          type="button"
          className="an-button an-button--ghost"
          onClick={() => {
            setStatement("");
            setEvidence([]);
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
          <Verdict tone={tone} title={t.summary(result.summary)}>
            <span>{t.counts(result.summary)}</span>
          </Verdict>
          <section className="tp-section">
            <h3>{t.claims}</h3>
            {result.claims.length === 0 ? <p className="an-muted">{t.noClaims}</p> : null}
            <ul className="tp-list">
              {result.claims.map((claim) => (
                <li key={claim.id}>
                  <span className={`tp-level tp-level--${claim.verdict}`}>{claim.verdict}</span>
                  <strong>{claim.id}</strong> {claim.text}
                  <br />
                  <span className="an-muted">{claim.basis}</span>
                  {claim.matches.map((match) => (
                    <span key={`${match.evidence_id}-${match.relation}`} className="an-muted">
                      <br />
                      {match.evidence_id} {match.relation}: “{match.quote}”
                    </span>
                  ))}
                  {claim.missing_evidence.length > 0 ? (
                    <span className="an-muted">
                      <br />
                      {t.missing}: {claim.missing_evidence.join("; ")}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
          {result.internal_contradictions.length > 0 ? (
            <section className="tp-section">
              <h3>{t.contradictions}</h3>
              <ul className="tp-list">
                {result.internal_contradictions.map((item) => (
                  <li key={item.claim_ids.join("-")}>
                    <strong>{item.claim_ids.join(" ↔ ")}</strong> {item.reason}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {result.verification_plan.length > 0 ? (
            <section className="tp-section">
              <h3>{t.plan}</h3>
              <ol className="tp-list">
                {result.verification_plan.map((step) => (
                  <li key={step.step}>
                    {step.action} <span className="an-muted">({step.claim_ids.join(", ")})</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          <section className="tp-section">
            <h3>{t.sentences}</h3>
            <ul className="tp-list">
              {result.sentences.map((sentence) => (
                <li key={sentence.index}>
                  <span className="tp-level">{sentence.type}</span>
                  {sentence.text}
                </li>
              ))}
            </ul>
          </section>
          <Notes envelope={envelope} locale={locale} />
          <JsonReport envelope={envelope} locale={locale} filename="claimcheck-report.json" />
        </>
      ) : null}
    </div>
  );
}
