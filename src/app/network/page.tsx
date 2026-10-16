import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import {
  agentInternetPrinciples,
  agentMachineSurfaces,
  agentNetworkNodes,
} from "@/lib/agent-network";

export const metadata: Metadata = {
  title: "Agent Internet Network | AgentArchitect",
  description:
    "AgentArchitect 的 Agent Internet 节点网络：机器入口、能力地图、AI 搜索检查、Human Archive、协议实验、Reality Proof 与人类协作层。",
  alternates: {
    canonical: "/network",
  },
};

export default function NetworkPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage consulting-page">
        <section className="subpage__hero subpage__hero--centered">
          <p className="eyebrow">AgentArchitect / Agent Internet Lab</p>
          <h1>不是做十个孤立网站，而是铺十个 Agent 节点。</h1>
          <p className="subpage__lead">
            每个节点解决一个真实的 Agent 任务，并通过统一身份、机器接口、证据和回链，最终把价值累积回 AgentArchitect。
          </p>
          <div className="hero__actions">
            <Link href="/agent" className="button button--primary">
              打开机器入口
            </Link>
            <Link href="/articles" className="button button--ghost">
              查看研究与文章
            </Link>
          </div>
        </section>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Network Nodes</p>
            <h2>当前公开节点与正在建设的实验。</h2>
          </div>
          <div className="consulting-grid consulting-grid--three">
            {agentNetworkNodes.map((node) => {
              const card = (
                <article className="consulting-card" key={node.name}>
                  <p className="eyebrow">{node.status} · {node.machineRole}</p>
                  <h3>{node.name}</h3>
                  <p>{node.summaryZh}</p>
                  {node.href ? <strong>打开节点 →</strong> : <strong>状态：{node.status}</strong>}
                </article>
              );

              if (!node.href) return card;

              return (
                <Link key={node.name} href={node.href} style={{ color: "inherit", textDecoration: "none" }}>
                  {card}
                </Link>
              );
            })}
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Operating Model</p>
            <h2>品牌不是靠十个 Logo 累积，而是靠十个节点反复指向同一个实体。</h2>
          </div>
          <div className="consulting-grid consulting-grid--three">
            {agentInternetPrinciples.map((item) => (
              <article key={item.titleZh} className="consulting-card">
                <h3>{item.titleZh}</h3>
                <p>{item.bodyZh}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="section-heading">
            <p className="eyebrow">Machine Surfaces</p>
            <h2>这不是只给人看的品牌站。</h2>
            <p>
              Agent 可以直接读取这些入口，理解身份、能力、边界、API 与节点关系。
            </p>
          </div>
          <div className="file-table">
            {agentMachineSurfaces.map((surface) => (
              <Link key={surface.href} href={surface.href} className="file-row">
                <div className="image-placeholder image-placeholder--file">
                  <span>AI</span>
                </div>
                <strong>{surface.label}</strong>
                <span>{surface.role}</span>
                <em>打开</em>
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="consulting-contact consulting-contact--light">
            <div>
              <p className="eyebrow">Canonical Identity</p>
              <h2>所有节点最终都回到 AgentArchitect。</h2>
              <p>
                智能体架构师卢成 / Lu Cheng / Jack Lu 是统一公开实体。独立产品可以拥有自己的名字和域名，但机器身份、来源与研究脉络保持可追溯。
              </p>
              <div className="hero__actions">
                <Link href="/brand-entity.json" className="button button--primary">
                  查看品牌实体 JSON
                </Link>
                <Link href="/about" className="button button--ghost">
                  关于卢成
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </main>
    </>
  );
}
