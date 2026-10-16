import Image from "next/image";
import Link from "next/link";

import { ConsultationTrigger } from "@/components/consultation-modal";
import { Reveal } from "@/components/reveal";
import {
  agentInternetPrinciples,
  agentMachineSurfaces,
  agentNetworkNodes,
} from "@/lib/agent-network";
import { featuredProducts } from "@/lib/site";
import type { Locale } from "@/lib/types";

type HomePageProps = {
  locale: Locale;
};

export function HomePage({ locale }: HomePageProps) {
  const isEnglish = locale === "en";

  const copy = isEnglish
    ? {
        eyebrow: "AgentArchitect / Agent Internet Lab",
        name: "Jack Lu · Agent Architect",
        headline: "Building useful nodes for the Agent Internet.",
        intro:
          "AgentArchitect is the canonical brand and machine-readable hub behind a growing set of agent tools, protocols, verification systems and human handoff experiments. The goal is not more empty websites. The goal is more useful endpoints that agents can discover, understand and invoke.",
        primary: "Explore the network",
        secondary: "Open AI entry",
        networkEyebrow: "Agent Network",
        networkTitle: "One identity. Many useful nodes.",
        networkIntro:
          "Each node solves a different agent problem, while identity, provenance and routing resolve back to AgentArchitect.",
        principlesEyebrow: "Distribution Model",
        principlesTitle: "The brand compounds through usage, not advertising.",
        machineEyebrow: "Machine-readable surfaces",
        machineTitle: "The website is only the human-facing layer.",
        productsEyebrow: "Public tools",
        productsTitle: "Reusable building blocks already exposed from this site.",
        contactEyebrow: "Build with AgentArchitect",
        contactTitle: "If an agent repeatedly gets stuck at the same boundary, that boundary may deserve its own node.",
        contactBody:
          "Send the real task, the failure point and the expected machine-readable result. Start from the constraint, not from a feature list.",
      }
    : {
        eyebrow: "AgentArchitect / Agent Internet Lab",
        name: "智能体架构师卢成 · Jack Lu",
        headline: "我不只研究 Agent，我在给 Agent 互联网铺有用的节点。",
        intro:
          "AgentArchitect 是统一母品牌与机器可读入口。工具、协议、Reality Proof、人类协作和发现层可以拥有不同产品名，但都持续回到同一身份、同一证据链和同一公开研究体系。目标不是多做空壳网站，而是让 Agent 多几个真正能发现、理解、调用的端点。",
        primary: "查看 Agent 节点网络",
        secondary: "打开 AI 入口",
        networkEyebrow: "Agent Network",
        networkTitle: "一个身份，多个真正有用的 Agent 节点。",
        networkIntro:
          "每个节点解决一个不同问题；所有节点通过统一品牌、canonical、机器入口与来源关系，把分散流量重新累积回 AgentArchitect。",
        principlesEyebrow: "传播模型",
        principlesTitle: "不要求 Agent 替我发广告，让它在完成任务时自然调用和引用。",
        machineEyebrow: "Machine-readable surfaces",
        machineTitle: "网页只是给人看的表层，机器入口才是 Agent 时代的基础设施。",
        productsEyebrow: "公开工具",
        productsTitle: "主站已经公开的可复用能力与产品。",
        contactEyebrow: "Build with AgentArchitect",
        contactTitle: "如果 Agent 总在同一个现实边界卡住，这个边界就可能值得独立做成一个节点。",
        contactBody:
          "把真实任务、卡点和你希望机器最终拿到的结果发来。先从约束和任务开始，而不是从功能清单开始。",
      };

  return (
    <main className="journal-home">
      <section className="editorial-hero editorial-hero--immersive">
        <div className="editorial-hero__inner">
          <div className="hero-poster hero-poster--plain">
            <p className="eyebrow">{copy.eyebrow}</p>
            <p className="editorial-hero__name">{copy.name}</p>
            <h1 className="editorial-hero__headline">{copy.headline}</h1>
            <p className="editorial-hero__intro">{copy.intro}</p>
            <div className="hero__actions">
              <Link href="/network" className="button button--primary">
                {copy.primary}
              </Link>
              <Link href="/agent" className="button button--ghost">
                {copy.secondary}
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-visual__card">
              <Image
                src="/media/editorial/lu-cheng-keynote.png"
                alt="Jack Lu speaking about agent architecture"
                fill
                priority
                className="hero-visual__image"
                sizes="(max-width: 980px) 100vw, 420px"
              />
            </div>
          </div>
        </div>
      </section>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">{copy.networkEyebrow}</p>
          <h2>{copy.networkTitle}</h2>
          <p>{copy.networkIntro}</p>
        </div>
        <div className="consulting-grid consulting-grid--three">
          {agentNetworkNodes.slice(0, 6).map((node) => {
            const body = (
              <article className="consulting-card">
                <p className="eyebrow">{node.status} · {node.machineRole}</p>
                <h3>{node.name}</h3>
                <p>{isEnglish ? node.summaryEn : node.summaryZh}</p>
                <strong>{node.href ? (isEnglish ? "Open node →" : "打开节点 →") : node.status}</strong>
              </article>
            );

            if (!node.href) {
              return <div key={node.name}>{body}</div>;
            }

            return (
              <Link key={node.name} href={node.href} style={{ color: "inherit", textDecoration: "none" }}>
                {body}
              </Link>
            );
          })}
        </div>
        <div className="hero__actions">
          <Link href="/network" className="button button--ghost">
            {isEnglish ? "See all nodes" : "查看完整节点网络"}
          </Link>
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">{copy.principlesEyebrow}</p>
          <h2>{copy.principlesTitle}</h2>
        </div>
        <div className="consulting-grid consulting-grid--three">
          {agentInternetPrinciples.map((item) => (
            <article key={item.titleZh} className="consulting-card">
              <h3>{isEnglish ? item.titleEn : item.titleZh}</h3>
              <p>{isEnglish ? item.bodyEn : item.bodyZh}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">{copy.machineEyebrow}</p>
          <h2>{copy.machineTitle}</h2>
        </div>
        <div className="file-table">
          {agentMachineSurfaces.map((surface) => (
            <Link key={surface.href} href={surface.href} className="file-row">
              <div className="image-placeholder image-placeholder--file">
                <span>AI</span>
              </div>
              <strong>{surface.label}</strong>
              <span>{surface.role}</span>
              <em>{isEnglish ? "Open" : "打开"}</em>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">{copy.productsEyebrow}</p>
          <h2>{copy.productsTitle}</h2>
        </div>
        <div className="consulting-grid consulting-grid--three">
          {featuredProducts.slice(0, 3).map((product) => (
            <Link key={product.name} href={product.href} style={{ color: "inherit", textDecoration: "none" }}>
              <article className="consulting-card">
                <p className="eyebrow">{product.badge}</p>
                <h3>{product.name}</h3>
                <p>{product.summary}</p>
                <strong>{product.cta} →</strong>
              </article>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="consulting-contact consulting-contact--light">
          <div>
            <p className="eyebrow">{copy.contactEyebrow}</p>
            <h2>{copy.contactTitle}</h2>
            <p>{copy.contactBody}</p>
            <div className="hero__actions">
              <ConsultationTrigger
                label={isEnglish ? "Contact Jack Lu" : "联系卢成"}
                className="button button--primary"
              />
              <Link href="/articles" className="button button--ghost">
                {isEnglish ? "Read research" : "查看文章与研究"}
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
