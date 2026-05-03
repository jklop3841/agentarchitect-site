import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { entityProfile } from "@/lib/commercial-site";
import { externalProfiles, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于智能体架构师卢成",
  description:
    "智能体架构师卢成（Lu Cheng / Jack Lu）是 agentarchitect.me 的主理人，专注企业 AI 诊断、Agent Factory、老板业务编译器与 AI 经营改进工作台。",
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
          <p className="subpage__lead">{entityProfile.englishOneLine}</p>
          <div className="hero__actions">
            <Link href="/enterprise-ai-diagnosis" className="button button--primary">
              查看企业 AI 诊断服务
            </Link>
            <Link href="/agent-architect" className="button button--ghost">
              什么是智能体架构师
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
            <p className="eyebrow">服务对象</p>
            <h2>不是卖万能 AI 梦，而是帮助真实业务先形成可验证的小闭环。</h2>
          </div>
          <div className="article-grid">
            {entityProfile.audience.map((item) => (
              <article key={item} className="article-card">
                <h3>{item}</h3>
                <p>适合先做业务诊断、试点设计、交付边界确认，再决定是否进入完整智能体系统建设。</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
