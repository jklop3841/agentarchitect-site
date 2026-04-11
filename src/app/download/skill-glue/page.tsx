import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Download Skill Glue",
  description: "Download and use the Skill Glue CLI from the public GitHub repository.",
};

const repoUrl = "https://github.com/jklop3841/agentarchitect-site";

export default function SkillGlueDownloadPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Download</p>
          <h1>Download Skill Glue</h1>
          <p className="subpage__lead">
            第一版通过 GitHub 仓库公开分发。你可以直接克隆仓库、运行 CLI，并读取内置的三组 manifest 示例。
          </p>
        </section>

        <section className="section">
          <div className="detail-grid">
            <div>
              <h3>GitHub repository</h3>
              <p>源码、CLI、manifest 示例都在同一个公开仓库里。</p>
              <Link href={repoUrl} className="button button--primary">
                Open GitHub
              </Link>
            </div>
            <div>
              <h3>Docs first</h3>
              <p>先读文档，再决定是只做 dry-run 组合，还是跑示例流程。</p>
              <Link href="/docs/skill-glue" className="button button--ghost">
                Open docs
              </Link>
            </div>
            <div>
              <h3>Why no installer yet</h3>
              <p>第一版优先验证组合规则和成本认知，不优先做复杂安装器和云执行器。</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
