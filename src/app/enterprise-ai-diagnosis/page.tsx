import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { templates } from "@/lib/commercial-site";
import { primaryContact, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "企业 AI / 智能体落地诊断服务",
  description: "在开发系统之前，先判断企业适不适合做 AI、该从哪里切入、如何避免项目变成演示和浪费。",
};

const fitItems = [
  "想做 AI，但不知道从哪个业务环节开始",
  "看了很多工具，但不知道如何变成公司内部流程",
  "员工抵触 AI，老板又想降本增效",
  "想找人做智能体，但担心被外包忽悠",
  "已经做了 AI 项目，但效果停留在演示",
  "不知道项目应该怎么报价、验收和维护",
];

const diagnosisItems = [
  "当前业务流程是否适合 AI 化",
  "哪些环节适合做智能体试点",
  "哪些需求不应该现在做",
  "项目最小可行试点怎么设计",
  "需要哪些数据、人员、工具和权限",
  "可能出现哪些交付风险",
  "如何设置验收标准和维护边界",
];

const deliverables = ["企业 AI 落地诊断摘要", "AI 可改造环节清单", "30 天试点路线图", "风险与边界建议", "是否适合继续开发的判断"];
const process = ["提交你的业务问题", "进行 30-60 分钟访谈", "梳理业务流程与 AI 切入点", "输出诊断结论和试点建议", "决定是否进入后续方案设计或执行"];
const unsuitable = ["只想要一个万能 AI 系统", "不愿意提供真实业务流程", "只想低价买工具，不愿意做诊断", "希望 AI 立即替代所有员工", "项目涉及灰色、违法、欺骗性用途", "不接受明确交付边界"];

export default function EnterpriseAiDiagnosisPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "企业 AI / 智能体落地诊断服务",
    url: new URL("/enterprise-ai-diagnosis", siteConfig.domain).toString(),
    areaServed: "China",
    provider: {
      "@type": "Person",
      name: "卢成",
      alternateName: "Jack Lu",
      jobTitle: "智能体架构师",
    },
    serviceType: "Enterprise AI diagnosis and agent delivery architecture",
  };

  return (
    <>
      <SiteHeader locale="zh" />
      <Script id="enterprise-ai-diagnosis-jsonld" type="application/ld+json">
        {JSON.stringify(serviceJsonLd)}
      </Script>
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">成交页</p>
          <h1>企业 AI / 智能体落地诊断服务</h1>
          <p className="subpage__lead">
            在花钱开发系统之前，先判断你的企业到底适不适合做 AI、该从哪里切入、怎么避免项目变成演示和浪费。
          </p>
          <div className="hero__actions">
            <a href={primaryContact.emailHref} className="button button--primary">
              提交你的企业 AI 问题
            </a>
            <Link href="/contact" className="button button--ghost">
              添加微信咨询
            </Link>
            <Link href={templates[0].href} className="button button--ghost">
              下载诊断表
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">适合谁</p>
            <h2>适合你，如果你正在遇到这些问题。</h2>
          </div>
          <div className="signal-list">
            {fitItems.map((item) => (
              <article key={item} className="signal-item">
                <h3>{item}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">诊断什么</p>
              <h2>先判断该不该做，再判断从哪里做。</h2>
            </div>
            <ol className="principle-list">
              {diagnosisItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section">
          <div className="article-grid">
            <article className="article-card">
              <p className="eyebrow">交付物</p>
              <h2>你会得到什么</h2>
              <ul className="principle-list">
                {deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="article-card">
              <p className="eyebrow">流程</p>
              <h2>服务流程</h2>
              <ol className="principle-list">
                {process.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">不适合的人</p>
            <h2>这些情况不建议合作。</h2>
          </div>
          <div className="signal-list">
            {unsuitable.map((item) => (
              <article key={item} className="signal-item">
                <h3>{item}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="service-provider">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">AI 服务商接单诊断 / 方案评审</p>
              <h2>如果你已经遇到项目失控、需求不清、报价困难，可以先做一次诊断。</h2>
              <p className="doc-body">服务重点会放在报价建议、交付边界、客户风险识别、谈单策略和方案可交付性评审。</p>
            </div>
            <a href={primaryContact.emailHref} className="button button--primary">
              发邮件预约诊断
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
