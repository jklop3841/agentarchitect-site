import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { workflowShieldCommands, workflowShieldSpecExample } from "@/lib/workflow-shield";

export const metadata: Metadata = {
  title: "Workflow Shield Docs",
  description: "Command reference and package spec structure for the Workflow Shield CLI.",
};

const installSnippet = `git clone https://github.com/jklop3841/agentarchitect-site.git
cd agentarchitect-site
npm install`;

const packSnippet = `npm run workflow-shield -- pack ./examples/workflow-shield/basic.json --format markdown`;
const inspectSnippet = `npm run workflow-shield -- inspect ./examples/workflow-shield/basic.json --format json`;
const explainSnippet = `npm run workflow-shield -- explain ./examples/workflow-shield/basic.json --format markdown`;

export default function WorkflowShieldDocsPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Docs</p>
          <h1>Workflow Shield CLI</h1>
          <p className="subpage__lead">
            Workflow Shield 用 package spec 描述公开层与隐藏层的边界，让 workflow 先能被调用、验证、签名，再决定哪些部分绝不应该被打进公开包。
          </p>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Install</p>
            <h2>第一版直接从 GitHub 仓库运行，不依赖额外平台。</h2>
          </div>
          <pre className="code-block">
            <code>{installSnippet}</code>
          </pre>
        </section>

        <section className="section section--split">
          <div className="section-heading">
            <p className="eyebrow">Commands</p>
            <h2>三条命令分别对应打包、审视边界、解释保护逻辑。</h2>
          </div>
          <div className="capability-list">
            {workflowShieldCommands.map((command) => (
              <article key={command.name} className="capability-item">
                <p className="capability-item__id">{command.name}</p>
                <h3>{command.usage}</h3>
                <p>{command.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="detail-grid">
            <div>
              <h3>Pack</h3>
              <pre className="code-block">
                <code>{packSnippet}</code>
              </pre>
            </div>
            <div>
              <h3>Inspect</h3>
              <pre className="code-block">
                <code>{inspectSnippet}</code>
              </pre>
            </div>
            <div>
              <h3>Explain</h3>
              <pre className="code-block">
                <code>{explainSnippet}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Spec example</p>
            <h2>第一版只保留最小必需字段：可见资产、隐藏资产、边界规则和验证方式。</h2>
          </div>
          <pre className="code-block">
            <code>{workflowShieldSpecExample}</code>
          </pre>
        </section>
      </main>
    </>
  );
}
