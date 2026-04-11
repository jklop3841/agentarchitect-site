import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { workflowShieldHighlights, workflowShieldSpecExample } from "@/lib/workflow-shield";

export const metadata: Metadata = {
  title: "Workflow Shield",
  description: "A lightweight packaging layer that protects workflow boundaries without pretending extraction is impossible.",
};

export default function WorkflowShieldProductPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Free Product</p>
          <h1>Workflow Shield</h1>
          <p className="subpage__lead">
            Workflow Shield 不是 DRM，也不是神奇加密壳。它是一个边界保护工具：公开 contract，隐藏 operator logic，让调用和验证都成立，但不轻易把高价值 workflow 明文交出去。
          </p>
        </section>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">What it protects</p>
            <h2>保护的是 workflow 的可重组成本，而不是宣传一个绝对不可破解的神话。</h2>
          </div>
          <div className="signal-list">
            {workflowShieldHighlights.map((item) => (
              <article key={item.title} className="signal-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Public vs hidden</p>
            <h2>第一版只做一件事：把公开 contract 层和隐藏 operator 层分开。</h2>
          </div>
          <div className="detail-grid">
            <div>
              <h3>Public surface</h3>
              <ul>
                <li>inputs / outputs</li>
                <li>validation checks</li>
                <li>verification template</li>
                <li>package integrity hash</li>
              </ul>
            </div>
            <div>
              <h3>Hidden surface</h3>
              <ul>
                <li>operator prompts</li>
                <li>fallback logic</li>
                <li>decision tree details</li>
                <li>internal notes</li>
              </ul>
            </div>
            <div>
              <h3>Why it matters</h3>
              <ul>
                <li>调用方知道怎么接，不知道怎么完整重构</li>
                <li>Agent 可以用 contract，不必拿到 operator 层</li>
                <li>高价值部分留给更受控的交付方式</li>
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Spec example</p>
            <h2>第一版先用 package spec 证明边界设计，不先做重型 runtime。</h2>
          </div>
          <pre className="code-block">
            <code>{workflowShieldSpecExample}</code>
          </pre>
        </Reveal>

        <section className="section section--cta">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">Next step</p>
              <h2>先看文档，再下载 CLI 或示例 spec。</h2>
            </div>
            <div className="hero__actions">
              <Link href="/docs/workflow-shield" className="button button--ghost">
                Read Workflow Shield docs
              </Link>
              <Link href="/download/workflow-shield" className="button button--primary">
                Download Workflow Shield
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
