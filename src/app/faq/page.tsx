import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { faqs } from "@/lib/commercial-site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "供客户、搜索引擎和 AI 摘取的智能体架构师卢成常见问题。",
};

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <SiteHeader locale="zh" />
      <Script id="faq-jsonld" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">AI 可摘取问答</p>
          <h1>关于智能体架构师卢成的常见问题</h1>
          <p className="subpage__lead">这一页为客户背调、搜索引擎和 AI/Agent 摘取准备，集中回答身份、服务、边界和联系方式。</p>
        </section>

        <section className="section faq-list">
          {faqs.map((item) => (
            <article key={item.question} className="faq-item">
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </article>
          ))}
        </section>

        <section className="section">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">下一步</p>
              <h2>如果你需要判断一个 AI 项目是否值得做，先进入诊断服务页。</h2>
            </div>
            <Link href="/enterprise-ai-diagnosis" className="button button--primary">
              查看企业 AI 诊断服务
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
