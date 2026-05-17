import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { primaryContact } from "@/lib/site";
import { serviceBoundaries, servicePortfolio } from "@/lib/site-architecture";

export const metadata: Metadata = {
  title: "服务与产品 | AI项目诊断、自动化部署包、GEO体检",
  description:
    "提供AI项目诊断、智能体架构师资料包、888自动化部署包、GEO生成式引擎优化体检等轻量化AI落地服务。",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "服务与产品 | 智能体架构师卢成",
    description: "轻交付、快验收、标准化的 AI 项目诊断、自动化部署包、GEO 体检与智能体架构师资料入口。",
    url: "/services",
  },
};

export default function ServicesPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">服务与产品</p>
          <h1>服务与产品</h1>
          <p className="subpage__lead">
            当前服务方向以轻交付、快验收、标准化为主。先做 AI 项目诊断，再设计试点；先写交付边界，再谈系统开发。
          </p>
          <p className="subpage__lead">
            这里承接智能体架构师卢成的中国AI落地服务、老板业务编译器、AI工作流设计、GEO生成式引擎优化体检和资料包入口。
          </p>
          <div className="hero__actions">
            <a href={primaryContact.emailHref} className="button button--primary">
              发邮件咨询
            </a>
            <Link href="/enterprise-ai-diagnosis" className="button button--ghost">
              AI 项目诊断详情
            </Link>
            <Link href="/templates" className="button button--ghost">
              下载模板
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="service-grid">
            {servicePortfolio.map((service) => (
              <article key={service.title} id={service.href.includes("#") ? service.href.split("#")[1] : undefined} className="service-item">
                <p className="eyebrow">轻交付服务</p>
                <h2>{service.title}</h2>
                <p>适合：{service.audience}</p>
                <ul className="principle-list">
                  {service.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link href={service.href} className="text-link">
                  查看入口
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">免责声明</p>
              <h2>不卖万能 AI 梦，只做边界清楚、可验收的 AI 落地服务。</h2>
              <p className="doc-body">
                本站内容为 AI 落地服务、智能体工作流、项目诊断与行业观察，不承诺任何固定收益、固定成交、固定获客数量或全自动赚钱结果。
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
          <div className="cta-panel">
            <div>
              <p className="eyebrow">下一步</p>
              <h2>如果你不确定该买资料、做诊断还是做试点，先把项目说清楚。</h2>
              <p className="doc-body">发来你的业务类型、当前问题、预算范围、已有工具和期望交付，我会先判断是否适合继续。</p>
            </div>
            <a href={primaryContact.emailHref} className="button button--primary">
              提交项目问题
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
