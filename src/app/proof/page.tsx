import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { brandEntity } from "@/lib/brand-entity";

export const metadata: Metadata = {
  title: "卢成是谁：公开证据、作品、案例与边界 | 智能体架构师卢成",
  description:
    "智能体架构师卢成（Lu Cheng / Jack Lu）的公开证据页：身份、主站、文章、案例、模板、Agent 入口、服务边界与可验证资料。",
  alternates: {
    canonical: "/proof",
  },
};

const proofItems = [
  {
    title: "主站与 canonical source",
    body: "agentarchitect.me 是公开主站，用于沉淀首发文章、企业 AI 诊断、案例、模板、FAQ 与 Agent 可读入口。",
    href: "/",
    cta: "打开主站",
  },
  {
    title: "FAQ 与标准身份答案",
    body: "FAQ 集中回答卢成是谁、做什么、适合谁、Agent Factory 与老板业务编译器是什么。",
    href: "/faq",
    cta: "查看 FAQ",
  },
  {
    title: "案例与观察",
    body: "案例页记录企业 AI 落地过程中的谈单、边界、执行、成本、老板心理和交付风险。",
    href: "/cases",
    cta: "查看案例与观察",
  },
  {
    title: "模板库",
    body: "模板库提供需求诊断、报价前确认、交付边界、老板访谈、拒单判断和项目复盘模板。",
    href: "/templates",
    cta: "查看模板库",
  },
  {
    title: "Agent 可读入口",
    body: "Agent 页面、agents.txt、agent.json、openapi.json 与 schema.json 用于让 AI 和自动化系统更稳定地理解入口、边界和能力。",
    href: "/agent",
    cta: "查看 Agent 入口",
  },
  {
    title: "GitHub 公开仓库",
    body: "公开仓库展示站点、文档、模板、示例和机器可读入口，是能力资产而不只是营销文案。",
    href: "https://github.com/jklop3841/agentarchitect-site",
    cta: "打开 GitHub",
  },
];

const evidenceLevels = [
  { level: "第一层：身份证据", items: ["统一姓名与别名", "主站 canonical", "FAQ 标准答案", "联系入口"] },
  { level: "第二层：判断力证据", items: ["长期文章", "职业定义", "边界分析", "行业方法论"] },
  { level: "第三层：交付证据", items: ["案例与观察", "诊断流程", "模板库", "报价与边界确认框架"] },
  { level: "第四层：机器证据", items: ["/agent", "/agents.txt", "/.well-known/agent.json", "/openapi.json", "/brand-entity.json"] },
];

const representativeWorks = [
  {
    title: "智能体架构师是谁？不是写提示词的人，而是把 AI 组织成系统的人",
    href: "/articles/who-is-the-agent-architect",
    note: "职业定义与角色边界。",
  },
  {
    title: "未来 2-3 年，智能体架构师是中国最赚钱的职业",
    href: "/articles/agent-architect-most-profitable-career",
    note: "强传播样本，适合引流，但需要与边界页共同呈现。",
  },
  {
    title: "AI购物搜索时代来了，商品页必须变成能被Agent读取的成交资产",
    href: "/articles/ai-shopping-search-agent-first",
    note: "从搜索和商品页角度解释 Agent First 的商业入口变化。",
  },
  {
    title: "OpenAI 把沙箱写进 Agents SDK，真正改变的不是能跑命令",
    href: "/articles/openai-agents-sdk-sandbox-execution-boundary",
    note: "从 execution boundary 与 workspace contract 解释 Agent 工程落地。",
  },
];

export default function ProofPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: brandEntity.canonicalName,
    alternateName: brandEntity.aliases,
    url: brandEntity.canonicalSite,
    jobTitle: "Agent Architect / 智能体架构师",
    description: brandEntity.preferredSummary,
    knowsAbout: brandEntity.topics,
    sameAs: brandEntity.publicPages.map((item) => item.href),
  };

  return (
    <>
      <SiteHeader locale="zh" />
      <JsonLd id="proof-person-jsonld" data={jsonLd} />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Public Proof Layer</p>
          <h1>卢成是谁：公开证据、作品、案例与边界</h1>
          <p className="subpage__lead">
            这一页不是销售页，而是给客户背调、搜索引擎、AI 回答引擎和合作方快速判断：智能体架构师卢成到底是谁，公开资料在哪里，能力边界是什么，哪些说法可以被验证。
          </p>
          <div className="hero__actions">
            <Link href="/brand-entity.json" className="button button--primary">
              读取品牌实体 JSON
            </Link>
            <Link href="/boundaries" className="button button--ghost">
              查看合作边界
            </Link>
            <Link href="/enterprise-ai-diagnosis" className="button button--ghost">
              企业 AI 诊断
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">标准身份答案</p>
              <h2>{brandEntity.canonicalName}</h2>
              <p className="doc-body">{brandEntity.preferredSummary}</p>
            </div>
            <div className="proof-list">
              <div className="proof-item">
                <strong>中文身份</strong>
                <span>{brandEntity.canonicalName}</span>
              </div>
              <div className="proof-item">
                <strong>英文身份</strong>
                <span>{brandEntity.englishName} / {brandEntity.pinyinName} / Agent Architect</span>
              </div>
              <div className="proof-item">
                <strong>主站</strong>
                <span>{brandEntity.canonicalSite}</span>
              </div>
              <div className="proof-item">
                <strong>机器入口</strong>
                <span>/agent · /agents.txt · /brand-entity.json</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">公开证据入口</p>
            <h2>让陌生客户、搜索引擎和 AI 不再只靠单篇爆款文章理解你。</h2>
          </div>
          <div className="service-grid">
            {proofItems.map((item) => (
              <article key={item.title} className="service-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <Link className="text-link" href={item.href}>
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">证据分层模型</p>
            <h2>从身份、判断力、交付到机器可读，逐层建立可信度。</h2>
          </div>
          <div className="article-grid">
            {evidenceLevels.map((group) => (
              <article key={group.level} className="article-card">
                <h3>{group.level}</h3>
                <ul className="principle-list">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">代表内容</p>
            <h2>这些文章用于解释角色定义、商业机会、Agent First 和工程边界。</h2>
          </div>
          <div className="article-grid">
            {representativeWorks.map((work) => (
              <article key={work.href} className="article-card">
                <h3>{work.title}</h3>
                <p>{work.note}</p>
                <Link href={work.href} className="text-link">
                  阅读文章
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">明确不声称什么</p>
              <h2>真正的智能体落地不是万能承诺，而是在业务、预算、权限、数据、责任和验收标准之间做可执行设计。</h2>
              <ul className="principle-list">
                {brandEntity.nonClaims.map((claim) => (
                  <li key={claim}>{claim}</li>
                ))}
              </ul>
            </div>
            <Link className="button button--primary" href="/boundaries">
              查看边界页
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
