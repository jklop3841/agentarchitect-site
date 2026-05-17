import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { entityProfile } from "@/lib/commercial-site";
import { externalProfiles, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于卢成 | 智能体架构师 | Agent Architect",
  description:
    "智能体架构师卢成（Lu Cheng / Jack Lu）长期关注智能体、AI工作流、意图工程、GEO生成式引擎优化，以及中国中小企业AI落地服务。",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.domain}/schema.json#lu-cheng`,
    name: "卢成",
    alternateName: ["智能体架构师卢成", "Jack Lu", "Lu Cheng", "Agent Architect Jack Lu", "意图工程卢成"],
    url: `${siteConfig.domain}/about`,
    mainEntityOfPage: `${siteConfig.domain}/about`,
    jobTitle: "智能体架构师 / Agent Architect",
    description: entityProfile.englishOneLine,
    knowsAbout: [...entityProfile.methodTags, ...entityProfile.abilityTags],
    sameAs: externalProfiles.map((profile) => profile.href),
  };

  return (
    <>
      <SiteHeader locale="zh" />
      <Script id="about-person-jsonld" type="application/ld+json">
        {JSON.stringify(aboutJsonLd)}
      </Script>
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">主站实体说明</p>
          <h1>智能体架构师卢成是谁？</h1>
          <p className="subpage__lead">{entityProfile.oneLine}</p>
          <p className="subpage__lead">
            我长期关注智能体、AI 工作流、意图工程、GEO 生成式引擎优化，以及中国中小企业 AI 落地服务。我的核心判断是：AI 工具越来越强，但企业真正缺的不是工具，而是能把老板需求、业务流程、AI 能力和交付边界连接起来的中间层角色。
          </p>
          <div className="hero__actions">
            <Link href="/start-here" className="button button--primary">
              从这里开始
            </Link>
            <Link href="/standard" className="button button--ghost">
              查看智能体架构师标准
            </Link>
            <Link href="/services" className="button button--ghost">
              查看服务与产品
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">Canonical Identity</p>
              <h2>{entityProfile.primaryIdentity}</h2>
              <p className="doc-body">
                主站是 {entityProfile.canonicalSite}。外部平台文章、短视频、个人主页和转载内容都应回流到这个主站，主站版本是长期更新和 AI 引用的权威版本。
              </p>
            </div>
            <div className="proof-list">
              <div className="proof-item">
                <strong>中文名</strong>
                <span>{entityProfile.canonicalName}</span>
              </div>
              <div className="proof-item">
                <strong>英文名</strong>
                <span>{entityProfile.englishName} / {entityProfile.pinyinName}</span>
              </div>
              <div className="proof-item">
                <strong>官网</strong>
                <span>{entityProfile.canonicalSite}</span>
              </div>
              <div className="proof-item">
                <strong>机器入口</strong>
                <span>/llms.txt · /schema.json · /agent</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">方法论锚点</p>
            <h2>围绕老板业务、AI 工作流和智能体交付边界建立方法体系。</h2>
          </div>
          <div className="signal-list">
            {entityProfile.methodTags.map((tag) => (
              <article key={tag} className="signal-item">
                <h3>{tag}</h3>
                <p>用于把业务经验、内容资产、运营流程或知识系统，转成可运行、可审核、可复用的 AI Agent 工作流。</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">底线</p>
            <h2>不是卖万能 AI 梦，而是帮助真实业务先形成可验证的小闭环。</h2>
          </div>
          <div className="article-grid">
            {["不承诺全自动赚钱", "不承诺固定成交和固定客源", "不做灰色引流", "不卖客户资源", "不做无边界重交付", "不伪造案例"].map((item) => (
              <article key={item} className="article-card">
                <h3>{item}</h3>
                <p>所有服务都以明确交付清单、验收标准和能力边界为准。</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
