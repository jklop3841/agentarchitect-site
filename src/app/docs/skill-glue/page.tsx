import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { skillGlueCommands, skillGlueSampleOutput } from "@/lib/skill-glue";

export const metadata: Metadata = {
  title: "Skill Glue Docs",
  description: "Command reference and manifest structure for the Skill Glue CLI.",
};

const installSnippet = `git clone https://github.com/jklop3841/agentarchitect-site.git
cd agentarchitect-site
npm install`;

const composeSnippet = `npm run skill-glue -- compose ./examples/skill-glue/parallel.json --format markdown --sample-run`;
const estimateSnippet = `npm run skill-glue -- estimate ./examples/skill-glue/replaceable.json --format json`;
const explainSnippet = `npm run skill-glue -- explain ./examples/skill-glue/serial.json --format markdown`;

export default function SkillGlueDocsPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Docs</p>
          <h1>Skill Glue CLI</h1>
          <p className="subpage__lead">
            Skill Glue 先把 skill 拆成带边界的节点，再给出执行顺序、token 预算和替换建议。第一版先做组合认知，不做重型执行引擎。
          </p>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Install</p>
            <h2>第一版通过 GitHub 仓库直接运行，不依赖额外平台。</h2>
          </div>
          <pre className="code-block">
            <code>{installSnippet}</code>
          </pre>
        </section>

        <section className="section section--split">
          <div className="section-heading">
            <p className="eyebrow">Commands</p>
            <h2>三条命令对应三种最小任务：组合、估算、解释。</h2>
          </div>
          <div className="capability-list">
            {skillGlueCommands.map((command) => (
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
              <h3>Compose</h3>
              <pre className="code-block">
                <code>{composeSnippet}</code>
              </pre>
            </div>
            <div>
              <h3>Estimate</h3>
              <pre className="code-block">
                <code>{estimateSnippet}</code>
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
            <p className="eyebrow">Manifest schema</p>
            <h2>每个 step 都是独立节点，带输入、输出、成本提示和替换候选。</h2>
          </div>
          <pre className="code-block">
            <code>{`{
  "id": "parallel-content-stack",
  "summary": "Short description",
  "steps": [
    {
      "id": "topic.intake",
      "summary": "What this step does",
      "inputs": ["topic"],
      "outputs": ["topic_card"],
      "cost_hint": { "tokens": "low", "score": 1 },
      "dependencies": [],
      "replaceable_with": [],
      "cacheable": true,
      "validation_checks": ["topic_card includes audience and tone"]
    }
  ]
}`}</code>
          </pre>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Sample output</p>
            <h2>输出既能给 Agent 读，也能给人类审阅。</h2>
          </div>
          <pre className="code-block">
            <code>{skillGlueSampleOutput}</code>
          </pre>
        </section>
      </main>
    </>
  );
}
