import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "什么是智能体架构师",
  description: "智能体架构师的定义、边界、职责，以及卢成为什么使用这个定位。",
};

const notItems = ["不是提示词工程师", "不是单纯的工具配置员", "不是只做演示的 AI 工具博主", "不是传统软件外包的换名包装"];

const realProblems = ["识别真实业务问题", "拆解可自动化流程", "设计人机协作边界", "控制交付风险", "让 AI 能被验收、被管理、被持续迭代"];

export default function AgentArchitectPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">定义权</p>
          <h1>什么是智能体架构师？</h1>
          <p className="subpage__lead">
            智能体架构师不是提示词工程师，也不是单纯的工具配置员。它的核心工作，是把模型、工具、知识库、业务流程、权限规则、反馈机制和交付边界，编排成一个能在真实业务中承担结果的系统。
          </p>
          <div className="hero__actions">
            <Link href="/enterprise-ai-diagnosis" className="button button--primary">
              咨询你的 AI 项目是否需要智能体架构师
            </Link>
            <Link href="/articles" className="button button--ghost">
              推荐阅读文章
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">不是什么</p>
              <h2>这个角色不是把旧岗位换一个新名字。</h2>
            </div>
            <div className="detail-band__steps">
              {notItems.map((item) => (
                <div key={item}>
                  <strong>{item}</strong>
                  <span>如果只停留在单点工具、口号或演示，就无法对真实业务结果负责。</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">真实问题</p>
            <h2>企业场景里，智能体架构师最重要的能力不是炫技。</h2>
          </div>
          <div className="signal-list">
            {realProblems.map((item) => (
              <article key={item} className="signal-item">
                <h3>{item}</h3>
                <p>把这个判断落到流程、权限、验收和交付边界里，而不是只写一段更漂亮的 prompt。</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="cta-panel">
            <div>
              <p className="eyebrow">卢成为什么使用这个定位</p>
              <h2>因为企业需要的不是更多 AI 热闹，而是能承担交付结果的系统设计。</h2>
              <p className="doc-body">
                卢成把智能体架构师定义为商业系统角色：既理解模型、工具和知识库，也理解老板目标、报价、验收、风险和组织边界。
              </p>
            </div>
            <Link href="/enterprise-ai-diagnosis" className="button button--primary">
              进入企业 AI 诊断服务
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
