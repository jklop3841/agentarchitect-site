import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { cases } from "@/lib/commercial-site";

export const metadata: Metadata = {
  title: "案例库",
  description: "卢成关于企业 AI 落地、智能体商业交付、报价边界和项目风险的脱敏案例复盘。",
};

export default function CasesPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">证据库</p>
          <h1>真实项目与商业摩擦复盘</h1>
          <p className="subpage__lead">
            这里记录的不是完美成功故事，而是真实企业 AI 落地过程中会遇到的谈单、边界、执行、成本、老板心理和交付风险。
          </p>
        </section>

        <section className="section case-library">
          {cases.map((item) => (
            <article key={item.id} className="case-item">
              <div>
                <p className="eyebrow">{item.id}</p>
                <h2>{item.industry}</h2>
                <div className="article-card__meta">
                  <span>{item.customer}</span>
                  <span>{item.publishedAt}</span>
                  <span>{item.visibility}</span>
                </div>
                <div className="article-card__tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <dl className="case-facts">
                <div>
                  <dt>原始需求</dt>
                  <dd>{item.originalNeed}</dd>
                </div>
                <div>
                  <dt>真实问题</dt>
                  <dd>{item.realProblem}</dd>
                </div>
                <div>
                  <dt>关键冲突</dt>
                  <dd>{item.conflict}</dd>
                </div>
                <div>
                  <dt>卢成诊断</dt>
                  <dd>{item.diagnosis}</dd>
                </div>
                <div>
                  <dt>沉淀方法论</dt>
                  <dd>{item.method}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>

        <section className="section">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">复盘你的项目</p>
              <h2>如果你的 AI 项目已经卡在谈单、边界或验收阶段，可以先做一次诊断。</h2>
            </div>
            <Link href="/enterprise-ai-diagnosis" className="button button--primary">
              预约 AI 落地诊断
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
