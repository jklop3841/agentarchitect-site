import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Download Workflow Shield",
  description: "Download and use the Workflow Shield CLI from the public GitHub repository.",
};

const repoUrl = "https://github.com/jklop3841/agentarchitect-site";

export default function WorkflowShieldDownloadPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Download</p>
          <h1>Download Workflow Shield</h1>
          <p className="subpage__lead">
            第一版通过 GitHub 仓库公开分发。你可以直接克隆仓库、运行 CLI，并用示例 spec 测试 contract 层与 operator 层如何分离。
          </p>
        </section>

        <section className="section">
          <div className="detail-grid">
            <div>
              <h3>GitHub repository</h3>
              <p>源码、CLI 和示例 spec 都在同一个公开仓库里。</p>
              <Link href={repoUrl} className="button button--primary">
                Open GitHub
              </Link>
            </div>
            <div>
              <h3>Docs first</h3>
              <p>先理解 package spec 与边界规则，再决定如何接入你的 workflow。</p>
              <Link href="/docs/workflow-shield" className="button button--ghost">
                Open docs
              </Link>
            </div>
            <div>
              <h3>What this is not</h3>
              <p>它不是完整 workflow engine，也不是魔法 DRM。它先服务于边界定义和受控交付。</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
