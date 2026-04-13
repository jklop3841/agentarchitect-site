import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { githubRepo } from "@/lib/site";
import { skillGlueCommands, skillGlueManifests, skillGlueSampleOutput } from "@/lib/skill-glue";
import { skillGlueHighlights } from "@/lib/site";

export const metadata: Metadata = {
  title: "Skill Glue",
  description: "A low-token workflow composer that glues together small skills instead of relying on giant prompts.",
};

export default function SkillGlueProductPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Free Product</p>
          <h1>Skill Glue</h1>
          <p className="subpage__lead">
            它不是工作流平台，也不是全自动大脑。它是一个低 token 成本的 skill 组合器，让你先把 skill 拆小，再按规则拼成可执行流程。
          </p>
        </section>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Why now</p>
            <h2>当 token 变贵，真正有价值的不是 giant skill，而是可拆、可换、可估算的组合能力。</h2>
          </div>
          <div className="signal-list">
            {skillGlueHighlights.map((item) => (
              <article key={item.title} className="signal-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="section section--split">
          <div className="section-heading">
            <p className="eyebrow">CLI surface</p>
            <h2>第一版只做三条命令：组合、估算、解释。</h2>
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
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Manifest examples</p>
            <h2>先给出标准 manifest，再决定怎么组合、替换和缓存。</h2>
          </div>
          <div className="signal-list">
            {skillGlueManifests.map((manifest) => (
              <article key={manifest.id} className="signal-item">
                <h3>{manifest.id}</h3>
                <p>{manifest.summary}</p>
                <p className="form-note">{manifest.steps.length} steps · {manifest.file}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Sample output</p>
            <h2>输出结果先服务于“看懂”和“估算”，不先假装自己是执行平台。</h2>
          </div>
          <pre className="code-block">
            <code>{skillGlueSampleOutput}</code>
          </pre>
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Source & proof</p>
            <h2>真正能拉高信任的不是名字，而是源码、manifest 示例和明确的命令面。</h2>
          </div>
          <div className="detail-grid">
            <div>
              <h3>GitHub source</h3>
              <p>CLI、manifest 数据结构和页面说明都在公开仓库里。</p>
              <a href={githubRepo.treeHref} target="_blank" rel="noreferrer" className="text-link">
                Open source tree
              </a>
            </div>
            <div>
              <h3>Docs</h3>
              <p>命令、输出示例和组合逻辑都可以直接阅读。</p>
              <Link href="/docs/skill-glue" className="text-link">
                Open docs
              </Link>
            </div>
            <div>
              <h3>Examples</h3>
              <p>串行、并行和可替换三组 manifest 示例都已公开。</p>
              <a href={`${githubRepo.treeHref}/examples/skill-glue`} target="_blank" rel="noreferrer" className="text-link">
                Open examples
              </a>
            </div>
          </div>
        </Reveal>

        <section className="section section--cta">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">Next step</p>
              <h2>先看文档，再下载 CLI 或示例 manifest。</h2>
            </div>
            <div className="hero__actions">
              <Link href="/docs/skill-glue" className="button button--ghost">
                Read Skill Glue docs
              </Link>
              <Link href="/download/skill-glue" className="button button--primary">
                Download Skill Glue
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
