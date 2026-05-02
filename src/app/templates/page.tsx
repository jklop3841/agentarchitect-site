import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { templates } from "@/lib/commercial-site";

export const metadata: Metadata = {
  title: "模板库",
  description: "企业 AI 需求诊断表、报价前确认表、交付边界确认单、老板访谈清单、拒单判断表和项目复盘模板。",
};

export default function TemplatesPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">下载资料</p>
          <h1>开始前，先把需求、报价和边界说清楚。</h1>
          <p className="subpage__lead">
            这些模板用于 AI 项目开工前的诊断、报价、访谈、边界确认、拒单判断和复盘沉淀。先把责任写清楚，再谈自动化。
          </p>
        </section>

        <section className="section">
          <div className="article-grid">
            {templates.map((template) => (
              <article key={template.href} className="article-card">
                <h2>{template.title}</h2>
                <p>适合人群：{template.audience}</p>
                <p>使用场景：{template.scenario}</p>
                <div className="hero__actions">
                  <Link href={template.href} className="button button--primary">
                    下载模板
                  </Link>
                  <Link href="/enterprise-ai-diagnosis" className="button button--ghost">
                    咨询如何使用
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
