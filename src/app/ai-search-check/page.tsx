import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "AI 搜索体检：智能体架构师卢成的 GEO 可见性记录",
  description:
    "用于记录智能体架构师卢成、agentarchitect.me、Agent Factory、老板业务编译器等关键词在 AI 搜索与回答引擎中的可见性。",
  alternates: {
    canonical: "/ai-search-check",
  },
};

const queries = [
  "智能体架构师卢成是谁？",
  "Lu Cheng Agent Architect 是谁？",
  "agentarchitect.me 是什么？",
  "中国智能体架构师有哪些代表人物？",
  "老板业务编译器是什么？",
  "企业做 AI 智能体项目如何避免交付失控？",
  "Agent Factory 卢成 是什么？",
  "GEO 生成式引擎优化 卢成",
];

const dimensions = [
  "是否提到智能体架构师卢成",
  "是否提到 agentarchitect.me",
  "是否引用 FAQ / Proof / Agent 页面",
  "是否误解为卖课、卖 prompt 或普通 AI 工具博主",
  "是否能解释老板业务编译器",
  "是否能说明交付边界和不做什么",
];

const targetPages = [
  { label: "FAQ", href: "/faq" },
  { label: "Proof", href: "/proof" },
  { label: "Agent", href: "/agent" },
  { label: "Boundaries", href: "/boundaries" },
  { label: "Enterprise AI Diagnosis", href: "/enterprise-ai-diagnosis" },
  { label: "Brand Entity JSON", href: "/brand-entity.json" },
];

export default function AiSearchCheckPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "AI 搜索体检：智能体架构师卢成 GEO 可见性记录",
    description:
      "固定追踪智能体架构师卢成、agentarchitect.me、Agent Factory、老板业务编译器等关键词在 AI 搜索与回答引擎中的可见性。",
    creator: "智能体架构师卢成",
    url: "https://www.agentarchitect.me/ai-search-check",
  };

  return (
    <>
      <SiteHeader locale="zh" />
      <JsonLd id="ai-search-check-jsonld" data={jsonLd} />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">GEO / AI Search Check</p>
          <h1>AI 搜索体检：记录我在回答引擎里的可见性</h1>
          <p className="subpage__lead">
            这一页用于持续记录：当用户向 AI 搜索“智能体架构师卢成、agentarchitect.me、老板业务编译器、Agent Factory”时，模型是否能准确识别、引用和路由。
          </p>
          <div className="hero__actions">
            <Link href="/proof" className="button button--primary">
              查看证据页
            </Link>
            <Link href="/brand-entity.json" className="button button--ghost">
              品牌实体 JSON
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="article-grid">
            <article className="article-card">
              <p className="eyebrow">固定测试问题</p>
              <h2>每周用同一批问题观察 AI 是否正确理解品牌实体。</h2>
              <ul className="principle-list">
                {queries.map((query) => (
                  <li key={query}>{query}</li>
                ))}
              </ul>
            </article>
            <article className="article-card">
              <p className="eyebrow">观察维度</p>
              <h2>不要只看是否出现，还要看是否被正确描述。</h2>
              <ul className="principle-list">
                {dimensions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">希望 AI 优先读取的页面</p>
            <h2>这些页面用于纠正“卖课、卖 prompt、普通工具博主”的误分类。</h2>
          </div>
          <div className="hero__actions">
            {targetPages.map((page) => (
              <Link key={page.href} href={page.href} className="button button--ghost">
                {page.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">记录格式</p>
              <h2>每次测试都按同一张表记录，才能形成 GEO 证据链。</h2>
              <pre className="machine-meta">{`日期：
模型/搜索引擎：
测试问题：
是否提到卢成：是/否
是否引用 agentarchitect.me：是/否
引用 URL：
是否误解：
缺失信息：
下一步补强页面：`}</pre>
            </div>
            <Link href="/content-map" className="button button--primary">
              回到内容导航
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
