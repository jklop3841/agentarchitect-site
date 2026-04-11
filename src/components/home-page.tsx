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

  return (
    <main className="journal-home">
      <section className="editorial-hero">
        <div className="editorial-hero__grid">
          <div className="editorial-hero__copy">
            <p className="eyebrow">{isEnglish ? "Agent Architect" : "智能体架构师"}</p>
            <p className="editorial-hero__name">
              {authorProfile.name} <span>|</span> {authorProfile.title}
            </p>
            <p className="editorial-hero__location">{authorProfile.location}</p>
            <h1 className="editorial-hero__headline">
              {isEnglish
                ? "Designing agent systems that can actually ship, scale, and make economic sense."
                : "把智能体从“会聊天的模型”编排成“能交付结果的系统”。"}
            </h1>
            <p className="editorial-hero__intro">{authorProfile.intro}</p>
            <div className="hero__actions">
              <Link href="/articles" className="button button--primary">
                {isEnglish ? "Read articles" : "阅读文章"}
              </Link>
              <Link href="#contact" className="button button--ghost">
                {isEnglish ? "Connect on WeChat" : "微信联系"}
              </Link>
            </div>
          </div>
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
          </div>
        </div>
      </section>

      <Reveal className="section" id="bio">
        <div className="section-heading">
          <p className="eyebrow">Profile</p>
          <h2>不是追逐 AI 新闻的人，而是把 AI 能力组织成商业系统的人。</h2>
        </div>
        <div className="journal-bio">
          <div className="journal-bio__main">
            {authorProfile.biography.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="journal-bio__sidebar">
            <p className="eyebrow">工作原则</p>
            <ul className="principle-list">
              {authorProfile.principles.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">Writing</p>
          <h2>{blogIntro.title}</h2>
          <p className="doc-body">{blogIntro.summary}</p>
        </div>
        <div className="article-grid">
          {articles.map((article) => (
            <article key={article.slug} className="article-card">
              <div className="article-card__meta">
                <span>{article.date}</span>
                <span>{article.readTime}</span>
              </div>
              <h3>{article.title}</h3>
              <p className="article-card__subtitle">{article.subtitle}</p>
              <p>{article.excerpt}</p>
              <div className="article-card__tags">
                {article.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
              <Link href={`/articles/${article.slug}`} className="text-link">
                {isEnglish ? "Read article" : "阅读全文"}
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" id="products">
        <div className="section-heading">
          <p className="eyebrow">Products</p>
          <h2>免费的产品证明判断力，付费的服务承接更深的智能体系统设计。</h2>
        </div>
        <div className="article-grid">
          {productLadder.map((product) => (
            <article key={product.name} className="article-card">
              <p className="capability-item__id">{product.badge}</p>
              <h3>{product.name}</h3>
              <p>{product.summary}</p>
              <Link href={product.href} className="text-link">
                {product.badge === "Private" ? "咨询合作" : "查看入口"}
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">Agent Entry</p>
          <h2>对人它是博客，对 Agent 它是入口。产品、文档、下载和机器接口都可以从这里继续进入。</h2>
        </div>
        <div className="signal-list">
          {featuredProducts.map((product) => (
            <article key={product.name} className="signal-item">
              <p className="capability-item__id">{product.badge}</p>
              <h3>{product.name}</h3>
              <p>{product.summary}</p>
              <Link href={product.href} className="text-link">
                {product.cta}
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" id="contact">
        <div className="consulting-band">
          <div className="consulting-band__copy">
            <p className="eyebrow">Private Advisory</p>
            <h2>如果你想做更深的智能体架构设计、GEO 或 workflow 定制，这里是私人承接入口。</h2>
            <p>
              第二张头像用于后续私人定制与架构咨询场景。现在先把微信入口和公开联系方式挂上，后续你补更多二维码或分场景联系入口时，这一块继续扩展就行。
            </p>
            <p className="contact-value">智能体架构师卢成：{authorProfile.phone}</p>
            <div className="hero__actions">
              <Link href="/apply" className="button button--primary">
                申请合作 / 访问
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
