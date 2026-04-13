import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import {
  agentCapabilityMapBoundaries,
  agentCapabilityMapName,
  agentCapabilityMapReadingGuide,
  agentCapabilityMapSubtitle,
  agentCapabilityMapWorkflow,
  getAgentCapabilityMapTemplatePath,
  readAgentCapabilityMapTemplate,
} from "@/lib/agent-capability-map";

export const metadata: Metadata = {
  title: `${agentCapabilityMapName} Docs`,
  description: `Usage notes, templates, and resume-card guidance for ${agentCapabilityMapName}.`,
};

const useCases = [
  "给不同 Agent 做一份可比较的能力履历卡",
  "把零散试用感受整理成结构化 capability audit",
  "给团队、客户或上游 Agent 一份更克制的能力说明层",
];

const evalPromptTemplate = readAgentCapabilityMapTemplate("standard-eval-prompt");
const resumeCardTemplate = readAgentCapabilityMapTemplate("resume-card-example");

export default function AgentCapabilityMapDocsPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Docs</p>
          <h1>{agentCapabilityMapName}</h1>
          <p className="subpage__lead">
            {agentCapabilityMapSubtitle}。文档只解释最短使用链路：什么场景适合、怎么评、用什么模板输出，以及这套
            MVP 明确不做什么。
          </p>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Use cases</p>
            <h2>这套框架适合先把能力说明层写清楚，而不是马上追求自动评分。</h2>
          </div>
          <div className="detail-grid">
            <div>
              <h3>适用场景</h3>
              <ul>
                {useCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>使用流程</h3>
              <ol>
                {agentCapabilityMapWorkflow.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Standard eval prompt</p>
            <h2>先用一份统一提示词收集事实，再决定这个 Agent 的定位与边界。</h2>
          </div>
          <p className="doc-body">
            这份模板要求评测者基于真实任务表现填写，不允许只写优点，也不允许跳过失败模式、边界与成本感知。
          </p>
          <p className="form-note">
            Raw template:{" "}
            <Link href={getAgentCapabilityMapTemplatePath("standard-eval-prompt")} className="text-link">
              standard-eval-prompt.md
            </Link>
          </p>
          <pre className="code-block">
            <code>{evalPromptTemplate}</code>
          </pre>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Output template</p>
            <h2>默认输出就是 Markdown 履历卡，不额外引入 JSON 或平台字段。</h2>
          </div>
          <p className="doc-body">
            输出模板的目标不是“显得专业”，而是让人和 Agent 都能快速读懂一个能力体到底适合什么、不适合什么。
          </p>
          <p className="form-note">
            Raw template:{" "}
            <Link href={getAgentCapabilityMapTemplatePath("resume-card-example")} className="text-link">
              resume-card-example.md
            </Link>
          </p>
          <pre className="code-block">
            <code>{resumeCardTemplate}</code>
          </pre>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">How to read the card</p>
            <h2>一份好的履历卡不追求华丽，而追求可判断、可比较、可路由。</h2>
          </div>
          <div className="signal-list">
            {agentCapabilityMapReadingGuide.map((item) => (
              <article key={item.title} className="signal-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">MVP boundaries</p>
            <h2>这套公开方法包先服务于标准化描述，不承担平台化承诺。</h2>
          </div>
          <ul className="principle-list principle-list--tight">
            {agentCapabilityMapBoundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
