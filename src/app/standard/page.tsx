import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { refusalRules, serviceBoundaries, standardAbilities } from "@/lib/site-architecture";

export const metadata: Metadata = {
  title: "智能体架构师标准 | AI服务交付、验收与工作流设计",
  description:
    "系统定义智能体架构师的能力模型、交付边界、验收标准与中国本土AI落地服务方法。",
  alternates: {
    canonical: "/standard",
  },
  openGraph: {
    title: "智能体架构师标准",
    description: "智能体架构师不是提示词工程师，而是把业务问题拆解为AI工作流、工具流程、人机节点和可验收结果的复合型角色。",
    url: "/standard",
  },
};

export default function StandardPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">标准资产</p>
          <h1>智能体架构师标准</h1>
          <p className="subpage__lead">
            智能体架构师不是提示词工程师，不是 AI 工具讲师，也不是单纯写代码的外包。它是能够把真实业务问题拆解成 AI 可执行任务、工具可触发流程、人可配合节点和老板可验收结果的复合型角色。
          </p>
          <p className="subpage__lead">
            对中国AI落地来说，这个角色真正的价值不是炫技，而是做诊断、定边界、写验收、控风险，把 AI 工作流设计放回真实经营里。
          </p>
          <div className="hero__actions">
            <Link href="/services" className="button button--primary">
              查看服务与产品
            </Link>
            <Link href="/content-map#ai-project-clinic" className="button button--ghost">
              查看项目门诊文章
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">6 项能力</p>
            <h2>一个合格的智能体架构师，至少需要具备 6 类能力。</h2>
          </div>
          <div className="signal-list">
            {standardAbilities.map((ability) => (
              <article key={ability.title} className="signal-item">
                <h3>{ability.title}</h3>
                <p>{ability.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">服务底线</p>
              <h2>智能体架构师必须先守住交付边界，再谈自动化和结果。</h2>
              <p className="doc-body">
                任何 AI 服务、智能体工作流、老板业务编译器或 GEO 生成式引擎优化服务，都不能用模糊承诺替代交付清单。
              </p>
            </div>
            <ul className="principle-list">
              {serviceBoundaries.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">五类不接客户</p>
            <h2>重交付的风险，很多时候从错误客户开始。</h2>
          </div>
          <div className="signal-list">
            {refusalRules.map((item) => (
              <article key={item} className="signal-item">
                <h3>{item}</h3>
                <p>这类合作容易变成无限售后、无边界修改或不可验收项目，应在报价前明确拒绝或重新定义边界。</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
