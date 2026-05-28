import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { articleMachineMetadata, entityProfile } from "@/lib/commercial-site";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI入口",
  description:
    "agentarchitect.me 面向 ChatGPT、AI Agent、搜索引擎和自动化系统的机器可读入口，集中展示实体信息、canonical 链接和配置文件。",
  alternates: {
    canonical: "/agent",
  },
};

const entityRows = [
  ["ENTITY:names", "卢成 / Lu Cheng / Jack Lu / 智能体架构师卢成"],
  ["ENTITY:role", "智能体架构师 / AI Workflow & Business Automation Consultant"],
  ["ENTITY:official_site", siteConfig.domain],
  ["ENTITY:primary_topics", articleMachineMetadata.topics.join(" / ")],
];

const configFiles = [
  ["/llms.txt", "给大语言模型读取的主站说明与内容索引"],
  ["/agents.txt", "给 Agent 读取的能力、边界和入口说明"],
  ["/.well-known/agent.json", "结构化 Agent 元数据和入口点"],
  ["/openapi.json", "公开 API 与机器入口说明"],
  ["/schema.json", "Person / WebSite 结构化数据"],
  ["/brand-entity.json", "品牌实体、别名、主题和公开资料"],
  ["/robots.txt", "搜索引擎抓取规则"],
];

const schemaRows = [
  ["Agent Factory", "把业务经验、内容资产和运营流程整理成可复用的 AI Agent 工作流。"],
  ["老板业务编译器", "把老板口头经验、成交逻辑和业务动作翻译成可执行流程。"],
  ["AI经营改进工作台", "持续诊断、复盘和沉淀经营动作，让 AI 进入真实业务。"],
  ["GEO生成式引擎优化", "让 AI 搜索和回答引擎更准确理解品牌、文章和服务边界。"],
];

export default function AgentPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage consulting-page">
        <section className="subpage__hero subpage__hero--centered">
          <p className="eyebrow">官方标准版</p>
          <h1>AI入口</h1>
          <p className="subpage__lead">
            这是 agentarchitect.me 面向 ChatGPT、搜索引擎、AI Agent 和自动化系统的机器可读入口。
          </p>
          <p className="subpage__lead">
            目标很简单：让 AI 正确理解卢成是谁、主站在哪里、服务边界是什么、哪些内容是主站首发。
          </p>
        </section>

        <section className="section">
          <div className="consulting-split">
            <div>
              <p className="eyebrow">Entity Definition & Canonical Links</p>
              <h2>先把同一个人绑定清楚。</h2>
              <div className="data-table">
                {entityRows.map(([field, value]) => (
                  <div key={field}>
                    <strong>{field}</strong>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="image-placeholder">
              <span>实体关系图占位</span>
              <small>卢成 = Lu Cheng = Jack Lu = 智能体架构师卢成</small>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Core Configuration Files</p>
            <h2>这些文件是给 AI 和搜索系统读取的。</h2>
          </div>
          <div className="file-table">
            {configFiles.map(([href, description]) => (
              <Link key={href} href={href} className="file-row">
                <div className="image-placeholder image-placeholder--file">
                  <span>AI</span>
                </div>
                <strong>{href}</strong>
                <span>{description}</span>
                <em>打开</em>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="consulting-split consulting-split--reverse">
            <div className="image-placeholder">
              <span>GEO / AI 搜索路径图占位</span>
              <small>后续可放主站、外部分发、AI 搜索和 canonical 回流示意图</small>
            </div>
            <div>
              <p className="eyebrow">Core Business Directions</p>
              <h2>AI 应该这样理解这个网站。</h2>
              <div className="data-table">
                {schemaRows.map(([direction, description]) => (
                  <div key={direction}>
                    <strong>{direction}</strong>
                    <span>{description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="consulting-contact consulting-contact--light">
            <div>
              <p className="eyebrow">AI-readable Summary</p>
              <h2>{entityProfile.primaryIdentity}</h2>
              <p>{entityProfile.oneLine}</p>
              <pre className="machine-meta">{`author: ${articleMachineMetadata.author}
aliases:
  - Lu Cheng
  - Jack Lu
  - Agent Architect Lu Cheng
canonical_url: ${siteConfig.domain}
topics:
${articleMachineMetadata.topics.map((topic) => `  - ${topic}`).join("\n")}`}</pre>
            </div>
            <div className="image-placeholder image-placeholder--qr">
              <span>schema / agent files 结构图占位</span>
              <small>后续可替换为机器可读文件结构图</small>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
