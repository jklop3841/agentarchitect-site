import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import {
  agentCapabilityMapAudience,
  agentCapabilityMapBoundaries,
  agentCapabilityMapCaseStudy,
  agentCapabilityMapDefinition,
  agentCapabilityMapDeliverables,
  agentCapabilityMapName,
  agentCapabilityMapReasons,
  agentCapabilityMapSubtitle,
  getAgentCapabilityMapTemplatePath,
} from "@/lib/agent-capability-map";
import { githubRepo } from "@/lib/site";

export const metadata: Metadata = {
  title: agentCapabilityMapName,
  description: `${agentCapabilityMapName} is a public framework for describing an agent's real tool surface, boundaries, and best-fit usage.`,
};

export default function AgentCapabilityMapProductPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">MVP Product</p>
          <h1>{agentCapabilityMapName}</h1>
          <p className="subpage__lead">
            {agentCapabilityMapSubtitle}。它不是评分平台，也不是数据库产品，而是一套公开的 capability audit
            方法包：先用统一结构描述一个 Agent 的真实工具面、能力边界和最佳使用方式。
          </p>
        </section>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Product definition</p>
            <h2>先把描述层做标准化，再谈更复杂的测评系统。</h2>
          </div>
          <div className="signal-list">
            {agentCapabilityMapDefinition.map((item) => (
              <article key={item.title} className="signal-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Why capability audit</p>
            <h2>真正有用的能力说明，不是吹它多强，而是写清它该做什么、不该做什么。</h2>
          </div>
          <div className="signal-list">
            {agentCapabilityMapReasons.map((item) => (
              <article key={item.title} className="signal-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">MVP deliverables</p>
            <h2>第一版只交付 4 个静态资产，把框架做稳，不把范围做重。</h2>
          </div>
          <div className="signal-list">
            {agentCapabilityMapDeliverables.map((item) => (
              <article key={item.title} className="signal-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Who this is for</p>
            <h2>适合需要标准化描述 Agent 能力边界的人，不适合想一步到位做平台的人。</h2>
          </div>
          <div className="detail-grid">
            <div>
              <h3>适用对象</h3>
              <ul>
                {agentCapabilityMapAudience.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>MVP 边界</h3>
              <ul>
                {agentCapabilityMapBoundaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Source & proof</p>
            <h2>这不是空框架。模板、页面和原始文件都已经公开，可以直接检查和复用。</h2>
          </div>
          <div className="detail-grid">
            <div>
              <h3>GitHub source</h3>
              <p>模板文件、产品页和文档页都在同一个仓库里公开维护。</p>
              <a href={githubRepo.treeHref} target="_blank" rel="noreferrer" className="text-link">
                Open source tree
              </a>
            </div>
            <div>
              <h3>Prompt template</h3>
              <p>标准测评提示词模板可以直接打开和复制。</p>
              <Link href={getAgentCapabilityMapTemplatePath("standard-eval-prompt")} className="text-link">
                Open prompt template
              </Link>
            </div>
            <div>
              <h3>Resume example</h3>
              <p>Markdown 履历表示例已经公开，便于人类和 Agent 共同读取。</p>
              <Link href={getAgentCapabilityMapTemplatePath("resume-card-example")} className="text-link">
                Open resume example
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">{agentCapabilityMapCaseStudy.title}</p>
            <h2>这个产品不是在制造新 Agent，而是在制造更清楚的能力判断。</h2>
          </div>
          <div className="detail-grid">
            <div>
              <h3>Before</h3>
              <p>{agentCapabilityMapCaseStudy.before}</p>
            </div>
            <div>
              <h3>After</h3>
              <p>{agentCapabilityMapCaseStudy.after}</p>
            </div>
            <div>
              <h3>Verdict</h3>
              <p>{agentCapabilityMapCaseStudy.verdict}</p>
            </div>
          </div>
        </Reveal>

        <section className="section section--cta">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">Next step</p>
              <h2>先读文档，再直接复制模板开始做第一份 capability audit。</h2>
            </div>
            <div className="hero__actions">
              <Link href="/docs/agent-capability-map" className="button button--ghost">
                Read Agent Capability Map docs
              </Link>
              <Link href={getAgentCapabilityMapTemplatePath("standard-eval-prompt")} className="button button--primary">
                Open standard eval prompt
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
