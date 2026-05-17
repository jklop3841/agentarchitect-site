import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "智能体项目边界：哪些 AI 项目不建议做 | 智能体架构师卢成",
  description:
    "卢成关于企业 AI / 智能体落地的合作边界、拒单标准、风险提示与不承诺清单。用于避免项目变成演示、浪费或无限售后。",
  alternates: {
    canonical: "/boundaries",
  },
};

const noList = [
  "只想要一个万能 AI 系统，但不愿提供真实业务流程。",
  "希望 AI 立即替代所有员工，但没有验收标准、预算和责任划分。",
  "只看演示效果，不愿意先做诊断、流程梳理和边界确认。",
  "需求涉及灰色、违法、欺骗、绕过平台风控或侵犯隐私。",
  "把低价工具采购误认为企业级 AI 交付。",
  "不接受修改次数、交付物、维护范围和不含范围写清楚。",
];

const riskCards = [
  { title: "需求没有边界", body: "客户会不断把新想法塞进旧报价，服务商最后变成免费员工。" },
  { title: "演示等于交付", body: "Demo 可以很漂亮，但真实业务里还需要权限、数据、人工审核、异常处理和责任链。" },
  { title: "自动化过早", body: "没有先跑通人工闭环，直接自动化只会把混乱放大。" },
  { title: "没有验收口径", body: "没有明确输入、输出、成功标准和失败处理，就无法判断项目是否完成。" },
];

const acceptableProjects = [
  "用 30 天试点验证一个窄场景。",
  "把老板经验、销售话术、内容流程沉淀成可复用模板。",
  "先做高频、低风险、可人工兜底的流程。",
  "明确 AI 负责什么、人负责什么、出了错谁复核。",
  "把交付物、修改次数、维护边界和不含范围提前写清。",
];

const questions = [
  "这套系统的真实业务目标是什么？",
  "输入资料从哪里来，谁负责更新？",
  "输出给谁使用，如何判断合格？",
  "哪些节点必须人工确认？",
  "哪些结果不能由 AI 直接承诺？",
  "修改次数、维护周期和不含范围是什么？",
  "试点失败时如何复盘、回退和停止？",
];

export default function BoundariesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "智能体项目边界与拒单标准",
    description: "用于解释企业 AI / 智能体项目的风险、拒单标准、交付边界和合理试点方式。",
    url: "https://www.agentarchitect.me/boundaries",
    about: ["企业AI诊断", "智能体项目交付", "交付边界", "AI服务商拒单判断"],
  };

  return (
    <>
      <SiteHeader locale="zh" />
      <JsonLd id="boundaries-jsonld" data={jsonLd} />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Delivery Boundary</p>
          <h1>智能体不是万能承诺，先把边界说清楚</h1>
          <p className="subpage__lead">
            真正的企业 AI 落地，不是把所有事情都交给模型，而是清楚判断：哪些能自动化，哪些必须人工确认，哪些现在不该做，哪些需求应该拒绝。
          </p>
          <div className="hero__actions">
            <Link href="/enterprise-ai-diagnosis" className="button button--primary">
              进入企业 AI 诊断
            </Link>
            <Link href="/templates" className="button button--ghost">
              下载边界模板
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">不建议直接做</p>
              <h2>这些项目必须先诊断，很多情况应该直接拒绝。</h2>
            </div>
            <ul className="principle-list">
              {noList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">常见失控点</p>
            <h2>智能体项目失败，往往不是技术太弱，而是边界太虚。</h2>
          </div>
          <div className="signal-list">
            {riskCards.map((card) => (
              <article key={card.title} className="signal-item">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="article-grid">
            <article className="article-card">
              <p className="eyebrow">更适合启动</p>
              <h2>适合从窄场景、可验收、有人兜底的项目开始。</h2>
              <ul className="principle-list">
                {acceptableProjects.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="article-card">
              <p className="eyebrow">合作前 7 问</p>
              <h2>开工前必须把这 7 件事写清楚。</h2>
              <ol className="principle-list">
                {questions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">先诊断，再开发</p>
              <h2>企业 AI 项目最危险的不是做慢，而是在需求没说清、责任没写清、验收没定义时做得太快。</h2>
            </div>
            <Link href="/enterprise-ai-diagnosis" className="button button--primary">
              预约 AI 项目诊断
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
