import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { primaryContact } from "@/lib/site";
import { serviceBoundaries } from "@/lib/site-architecture";

export const metadata: Metadata = {
  title: "产品与服务",
  description:
    "智能体架构师卢成的产品与服务：企业 AI 项目诊断、老板业务编译器、AI 服务商交付边界顾问、GEO / AI 搜索可见性体检。",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "产品与服务 | 智能体架构师卢成",
    description: "不卖万能 AI 梦，先帮你把问题、边界、交付结果说清楚。",
    url: "/services",
  },
};

const services = [
  {
    title: "企业 AI 项目诊断",
    audience: "想做 AI，但不知道从哪里下手的老板。",
    pain: "怕花钱做成演示，最后业务没变、团队也用不起来。",
    method: "先看业务流程、数据条件、人员配合和风险，再决定要不要做试点。",
    delivery: "AI 切入点、风险判断、试点建议、交付边界和验收口径。",
  },
  {
    title: "老板业务编译器",
    audience: "有经验、有方法，但流程和内容都靠自己临时发挥的老板。",
    pain: "销售话术、客户判断、内容经验、成交逻辑都在脑子里，员工和 AI 接不住。",
    method: "把你的经验整理成话术、流程、标签和内容模板，让团队和 AI 都能照着做。",
    delivery: "业务动作清单、内容流程、客户分层、话术库和可复用模板。",
  },
  {
    title: "AI 服务商交付边界顾问",
    audience: "做代运营、智能体定制、AI 交付的一人企业或小团队。",
    pain: "客户不断加需求、压报价、拖尾款，项目最后变成无限售后。",
    method: "先拆需求、报价、验收、修改次数和不含范围，再决定接不接。",
    delivery: "报价边界、拒单判断、验收标准、售后范围和沟通话术。",
  },
  {
    title: "GEO / AI 搜索可见性体检",
    audience: "想让 ChatGPT、AI 搜索和搜索引擎正确理解自己的个人品牌或企业。",
    pain: "外部平台有内容，但主站不够权威，AI 也说不清你是谁。",
    method: "检查主站结构、品牌实体、文章体系、机器可读文件和外部回链。",
    delivery: "体检报告、关键词建议、主站结构建议和 AI 识别优化清单。",
  },
];

const serviceSteps = ["说清问题", "判断能不能做", "拆交付边界", "设计试点", "交付复盘", "沉淀模板"];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage consulting-page">
        <section className="subpage__hero subpage__hero--centered">
          <p className="eyebrow">商业交付版</p>
          <h1>产品与服务</h1>
          <p className="subpage__lead">
            不卖万能 AI 梦。先把问题说清楚，把边界写清楚，把你最后能拿到什么说清楚。
          </p>
          <div className="hero__actions">
            <a href={primaryContact.emailHref} className="button button--gold">
              立即咨询
            </a>
            <Link href="/standard" className="button button--ghost">
              先看标准
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="service-board">
            {services.map((service, index) => (
              <article key={service.title} className="service-sheet">
                <div className="service-sheet__header">
                  <div className="image-placeholder image-placeholder--icon">
                    <span>{index + 1}</span>
                  </div>
                  <h2>
                    {index + 1}. {service.title}
                  </h2>
                </div>
                <dl>
                  <div>
                    <dt>适合谁</dt>
                    <dd>{service.audience}</dd>
                  </div>
                  <div>
                    <dt>核心痛点</dt>
                    <dd>{service.pain}</dd>
                  </div>
                  <div>
                    <dt>方法</dt>
                    <dd>{service.method}</dd>
                  </div>
                  <div>
                    <dt>交付结果</dt>
                    <dd>{service.delivery}</dd>
                  </div>
                </dl>
                <a href={primaryContact.emailHref} className="button button--primary service-sheet__cta">
                  立即咨询
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="consulting-split">
            <div>
              <p className="eyebrow">服务流程</p>
              <h2>不是上来就开发，先把事情做小、做清楚。</h2>
              <div className="process-strip">
                {serviceSteps.map((step, index) => (
                  <div key={step}>
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="image-placeholder">
              <span>服务流程图占位</span>
              <small>可替换为咨询流程、项目路线图或交付看板图片</small>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="consulting-split consulting-split--reverse">
            <div className="image-placeholder">
              <span>咨询场景图占位</span>
              <small>可放会议、沟通、白板、资料整理或远程咨询图</small>
            </div>
            <div>
              <p className="eyebrow">不承诺什么</p>
              <h2>我能做什么会说清楚，不能做什么也会提前说。</h2>
              <ul className="principle-list">
                {serviceBoundaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="consulting-contact">
            <div>
              <p className="eyebrow">联系方式</p>
              <h2>想咨询，先把你的项目问题发来。</h2>
              <p>
                写清楚你做什么行业、现在怎么做、哪里卡住、想让 AI 帮你解决什么。我先判断这事适不适合继续。
              </p>
              <div className="hero__actions">
                <a href={primaryContact.emailHref} className="button button--gold">
                  发邮件咨询
                </a>
                <Link href="/contact" className="button button--outline-light">
                  查看更多联系方式
                </Link>
              </div>
            </div>
            <div className="image-placeholder image-placeholder--qr">
              <span>二维码 / 预约图占位</span>
              <small>{primaryContact.email}</small>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
