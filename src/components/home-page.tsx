import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import {
  articles,
  authorProfile,
  blogIntro,
  productLadder,
} from "@/lib/content";
import { featuredProducts } from "@/lib/site";
import type { Locale } from "@/lib/types";

type HomePageProps = {
  locale: Locale;
};

export function HomePage({ locale }: HomePageProps) {
  const isEnglish = locale === "en";
  const bioParagraphs = isEnglish ? authorProfile.biographyEn : authorProfile.biography;
  const principles = isEnglish ? authorProfile.principlesEn : authorProfile.principles;
  const intro = isEnglish ? authorProfile.introEn : authorProfile.intro;
  const location = isEnglish ? authorProfile.locationEn : authorProfile.location;
  const heroKicker = isEnglish ? "Agent Architect" : "智能体架构师";
  const blogTitle = isEnglish ? blogIntro.titleEn : blogIntro.title;
  const blogSummary = isEnglish ? blogIntro.summaryEn : blogIntro.summary;

  return (
    <main className="journal-home">
      <section className="editorial-hero">
        <div className="editorial-hero__grid">
          <div className="editorial-hero__portrait">
            <div className="portrait-frame portrait-frame--main">
              <Image
                src="/media/portraits/lucheng-main.png"
                alt="卢成"
                fill
                priority
                className="portrait-frame__image"
                sizes="(max-width: 980px) 100vw, 420px"
              />
            </div>
            <div className="portrait-caption">
              <strong>{isEnglish ? "Lu Cheng" : "卢成"}</strong>
              <span>{isEnglish ? "Agent Architect" : "智能体架构师卢成"}</span>
            </div>
          </div>
          <div className="editorial-hero__copy">
            <p className="eyebrow">{heroKicker}</p>
            <p className="editorial-hero__name">
              {isEnglish ? authorProfile.englishName : authorProfile.name} <span>|</span>{" "}
              {isEnglish ? authorProfile.titleEn : authorProfile.title}
            </p>
            <p className="editorial-hero__location">{location}</p>
            <h1 className="editorial-hero__headline">
              {isEnglish
                ? "Agent systems for the real economy, not just the demo stage."
                : "把智能体从“会聊天的模型”编排成“能交付结果的系统”。"}
            </h1>
            <p className="editorial-hero__intro">{intro}</p>
            <div className="hero__actions">
              <Link href="/articles" className="button button--primary">
                {isEnglish ? "Read articles" : "阅读文章"}
              </Link>
              <Link href="#contact" className="button button--ghost">
                {isEnglish ? "Connect on WeChat" : "微信联系"}
              </Link>
            </div>
            <p className="editorial-hero__meta">
              {isEnglish
                ? "Harness Engineering · GEO · Workflow Design · Agent Tooling"
                : "驾驭工程 · GEO · AI 工作流设计 · Agent 工具链"}
            </p>
          </div>
        </div>
      </section>

      <Reveal className="section" id="bio">
        <div className="section-heading">
          <p className="eyebrow">{isEnglish ? "Profile" : "简介"}</p>
          <h2>
            {isEnglish
              ? "Not chasing model hype, but building the layer that turns AI into operating systems."
              : "不是追逐 AI 新闻的人，而是把 AI 能力组织成商业系统的人。"}
          </h2>
        </div>
        <div className="journal-bio">
          <div className="journal-bio__main">
            {bioParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="journal-bio__sidebar">
            <p className="eyebrow">{isEnglish ? "Principles" : "工作原则"}</p>
            <ul className="principle-list">
              {principles.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">{isEnglish ? "Writing" : "文章"}</p>
          <h2>{blogTitle}</h2>
          <p className="doc-body">{blogSummary}</p>
        </div>
        <div className="article-grid">
          {articles.map((article) => (
            <article key={article.slug} className="article-card">
              <div className="article-card__meta">
                <span>{article.date}</span>
                <span>{article.readTime}</span>
              </div>
              <h3>{isEnglish ? article.titleEn : article.title}</h3>
              <p className="article-card__subtitle">{isEnglish ? article.subtitleEn : article.subtitle}</p>
              <p>{isEnglish ? article.excerptEn : article.excerpt}</p>
              <div className="article-card__tags">
                {article.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
              <Link href={`/articles/${article.slug}`} className="text-link">
                {isEnglish ? "Read the essay" : "阅读全文"}
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" id="products">
        <div className="section-heading">
          <p className="eyebrow">{isEnglish ? "Products" : "产品"}</p>
          <h2>
            {isEnglish
              ? "Free tools prove the thesis. Private engagements go deeper."
              : "免费的产品证明判断力，付费的服务承接更深的智能体系统设计。"}
          </h2>
        </div>
        <div className="article-grid">
          {productLadder.map((product) => (
            <article key={product.name} className="article-card">
              <p className="capability-item__id">{product.badge}</p>
              <h3>{product.name}</h3>
              <p>{product.summary}</p>
              <Link href={product.href} className="text-link">
                {product.badge === "Private" ? (isEnglish ? "Private advisory" : "咨询合作") : (isEnglish ? "View entry" : "查看入口")}
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">{isEnglish ? "Agent Entry" : "Agent 入口"}</p>
          <h2>
            {isEnglish
              ? "For people, this is a business blog. For agents, it remains a structured entry layer."
              : "对人它是博客，对 Agent 它是入口。产品、文档、下载和机器接口都可以从这里继续进入。"}
          </h2>
        </div>
        <div className="signal-list">
          {featuredProducts.map((product) => (
            <article key={product.name} className="signal-item">
              <p className="capability-item__id">{product.badge}</p>
              <h3>{product.name}</h3>
              <p>{product.summary}</p>
              <Link href={product.href} className="text-link">
                {isEnglish ? product.cta.replace("查看", "View ").replace("入口", "").replace("Skill Glue", "Skill Glue").replace("Runtime", "Runtime") : product.cta}
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" id="contact">
        <div className="consulting-band">
          <div className="consulting-band__copy">
            <p className="eyebrow">{isEnglish ? "Private Advisory" : "私人定制"}</p>
            <h2>
              {isEnglish
                ? "For bespoke architecture work, workflow strategy, and GEO system design, this is the private entry point."
                : "如果你想做更深的智能体架构设计、GEO 或 workflow 定制，这里是私人承接入口。"}
            </h2>
            <p>
              {isEnglish
                ? "The consulting layer is intentionally kept separate from the public essays and free tools. Start with the essays if you want to understand the thesis. Use this channel when you need custom design, architecture review, or implementation advice."
                : "第二张头像用于后续私人定制与架构咨询场景。现在先把微信入口和公开联系方式挂上，后续你补更多二维码或分场景联系入口时，这一块继续扩展就行。"}
            </p>
            <p className="contact-value">
              {isEnglish ? "Lu Cheng · Agent Architect" : "智能体架构师卢成"}：{authorProfile.phone}
            </p>
            <div className="hero__actions">
              <Link href="/apply" className="button button--primary">
                {isEnglish ? "Start a private conversation" : "申请合作 / 访问"}
              </Link>
            </div>
          </div>
          <div className="consulting-band__visuals">
            <div className="portrait-frame portrait-frame--consulting">
              <Image
                src="/media/portraits/lucheng-consulting.png"
                alt="卢成商务头像"
                fill
                className="portrait-frame__image"
                sizes="(max-width: 980px) 100vw, 360px"
              />
            </div>
            <div className="qr-card">
              <Image
                src="/media/contact/wechat-qr.png"
                alt="微信二维码"
                width={560}
                height={790}
                className="qr-card__image"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
