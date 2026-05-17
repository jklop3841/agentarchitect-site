import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { cases } from "@/lib/commercial-site";

export const metadata: Metadata = {
  title: "案例与观察",
  description: "智能体架构师卢成关于公开行业现象、老板需求、AI项目门诊、交付失败和避坑复盘的案例与观察。",
  alternates: {
    canonical: "/cases",
  },
};

export default function CasesPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">案例与观察</p>
          <h1>案例与观察</h1>
          <p className="subpage__lead">
            这里不伪造客户案例。当前主要整理三类内容：公开行业现象拆解、老板需求与 AI 项目门诊、AI 服务交付失败或避坑复盘。
          </p>
          <p className="subpage__lead">
            未来如有真实客户案例，会在获得授权或脱敏后发布。现阶段更重要的是把项目风险、交付边界、验收标准和智能体商业落地中的真实摩擦讲清楚。
          </p>
        </section>

        <section className="section case-library">
          {cases.map((item) => (
            <article key={item.id} className="case-item">
              <div>
                <p className="eyebrow">{item.id}</p>
                <h2>{item.industry}</h2>
                <div className="article-card__meta">
                  <span>{item.customer}</span>
                  <span>{item.publishedAt}</span>
                  <span>{item.visibility}</span>
                </div>
                <div className="article-card__tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <dl className="case-facts">
                <div>
                  <dt>原始需求</dt>
                  <dd>{item.originalNeed}</dd>
                </div>
                <div>
                  <dt>真实问题</dt>
                  <dd>{item.realProblem}</dd>
                </div>
                <div>
                  <dt>关键冲突</dt>
                  <dd>{item.conflict}</dd>
                </div>
                <div>
                  <dt>卢成诊断</dt>
                  <dd>{item.diagnosis}</dd>
                </div>
                <div>
                  <dt>沉淀方法论</dt>
                  <dd>{item.method}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>

        <section className="section">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">复盘你的项目</p>
              <h2>如果你的 AI 项目已经卡在谈单、边界或验收阶段，可以先做一次项目门诊。</h2>
            </div>
            <Link href="/services" className="button button--primary">
              查看服务与产品
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
