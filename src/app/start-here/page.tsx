import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { contentColumns } from "@/lib/site-architecture";

export const metadata: Metadata = {
  title: "从这里开始 | 智能体架构师卢成",
  description:
    "第一次了解智能体架构师卢成，可以从这里按智能体架构师定义、AI服务商生存规则、AI项目门诊、AI经营改造与GEO四条路径阅读。",
  alternates: {
    canonical: "/start-here",
  },
  openGraph: {
    title: "从这里开始了解智能体架构师卢成",
    description: "智能体架构师卢成的主站阅读入口：AI工作流设计、中国AI落地、老板业务编译器与GEO生成式引擎优化。",
    url: "/start-here",
  },
};

export default function StartHerePage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">从这里开始</p>
          <h1>从这里开始了解智能体架构师卢成</h1>
          <p className="subpage__lead">
            如果你第一次来到这个网站，可以先用一句话理解我的方向：我关注的是中国中小企业如何真正把 AI 接入经营，而不是停留在工具、概念和演示里。
          </p>
          <p className="subpage__lead">
            我把自己的角色定义为智能体架构师：把老板的经营问题，编译成 AI 工作流、自动化任务、标准交付模块和可验收结果的人。
          </p>
          <div className="hero__actions">
            <Link href="/standard" className="button button--primary">
              先看智能体架构师标准
            </Link>
            <Link href="/content-map" className="button button--ghost">
              查看完整内容导航
            </Link>
            <Link href="/services" className="button button--ghost">
              查看服务与产品
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">阅读路径</p>
            <h2>不要从零散文章开始，先按 4 条路径建立完整理解。</h2>
          </div>
          <div className="service-grid">
            {contentColumns.map((column, index) => (
              <article key={column.id} className="service-item">
                <p className="eyebrow">路径 {index + 1}</p>
                <h3>{column.name}</h3>
                <p>{column.intro}</p>
                <Link href={column.href} className="text-link">
                  进入{column.shortName}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">主线关键词</p>
              <h2>智能体架构师卢成 / Agent Architect / AI工作流设计 / 中国AI落地。</h2>
              <p className="doc-body">
                这个站点的核心不是追 AI 工具新闻，而是沉淀中国本土 AI 落地服务、老板业务编译器、AI 项目验收、GEO 生成式引擎优化和轻交付标准。
              </p>
            </div>
            <Link href="/articles" className="button button--primary">
              阅读全部文章
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
