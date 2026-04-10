import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { listCapabilities } from "@/lib/capabilities";

export const metadata: Metadata = {
  title: "Private Workflow Runtime",
  description: "A controlled execution surface for agents that need results without internal prompt access.",
};

export default function ProductPage() {
  const capabilities = listCapabilities();

  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Product</p>
          <h1>Private Workflow Runtime for Agents</h1>
          <p className="subpage__lead">
            这不是开放 prompt 分享站，而是一个受控执行入口。Agent 只拿结果、摘要和验证信息，不拿内部规则。
          </p>
        </section>

        <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">Why this product exists</p>
          <h2>让“调用你”比“拆解你”更省事。</h2>
        </div>
        <div className="signal-list">
          <article className="signal-item">
            <h3>For agent builders</h3>
            <p>接入方不需要理解你的完整方法论，也能稳定拿到结果。</p>
          </article>
          <article className="signal-item">
            <h3>For private workflows</h3>
            <p>内部 prompt、决策规则、回退逻辑都保留在服务端，不通过公共页面泄露。</p>
          </article>
          <article className="signal-item">
            <h3>For reliability</h3>
            <p>每次执行都有执行 ID 和校验 token，便于后续追踪与可信验证。</p>
          </article>
        </div>
        </Reveal>

        <Reveal className="section section--split">
        <div className="section-heading">
          <p className="eyebrow">Current capabilities</p>
          <h2>第一版只上线少量真实能力，保持边界清晰。</h2>
        </div>
        <div className="capability-list">
          {capabilities.map((capability) => (
            <article key={capability.id} className="capability-item">
              <p className="capability-item__id">{capability.id}</p>
              <h3>{capability.name}</h3>
              <p>{capability.summary}</p>
            </article>
          ))}
        </div>
        </Reveal>

        <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">What agents get</p>
          <h2>输入清晰、输出稳定、边界明确。</h2>
        </div>
        <div className="detail-grid">
          <div>
            <h3>Agents get</h3>
            <ul>
              <li>Readable docs and OpenAPI hints</li>
              <li>Stable input/output contracts</li>
              <li>Execution IDs and verification tokens</li>
              <li>Low-friction key-based access</li>
            </ul>
          </div>
          <div>
            <h3>Agents do not get</h3>
            <ul>
              <li>Hidden prompts</li>
              <li>Fallback chains</li>
              <li>Internal operator notes</li>
              <li>General-purpose workflow authoring</li>
            </ul>
          </div>
        </div>
        </Reveal>

        <section className="section section--cta">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">Next step</p>
              <h2>阅读文档或直接申请访问 Key。</h2>
            </div>
            <div className="hero__actions">
              <Link href="/docs" className="button button--ghost">
                View docs
              </Link>
              <Link href="/apply" className="button button--primary">
                Apply for access
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
