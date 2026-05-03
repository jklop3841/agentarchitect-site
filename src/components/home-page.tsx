import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import {
  cases,
  deliverySteps,
  entityProfile,
  homeProblems,
  primaryConsultingHref,
  serviceCards,
  templates,
} from "@/lib/commercial-site";
import { articles, authorProfile } from "@/lib/content";
import type { Locale } from "@/lib/types";

type HomePageProps = {
  locale: Locale;
};

export function HomePage({ locale }: HomePageProps) {
  const isEnglish = locale === "en";

  if (isEnglish) {
    return (
      <main className="journal-home">
        <section className="editorial-hero editorial-hero--immersive">
          <div className="editorial-hero__inner">
            <div className="hero-poster hero-poster--plain">
              <p className="eyebrow">Agent Architect Jack Lu</p>
              <p className="editorial-hero__name">Jack Lu (卢成)</p>
              <h1 className="editorial-hero__headline">Turning AI agents from demos into deliverable business systems.</h1>
              <p className="editorial-hero__intro">
                {entityProfile.englishOneLine} Chinese-first advisory site for Agent Factory, business process
                compilation, enterprise AI diagnosis, delivery boundaries, templates, cases, and machine-readable agent
                routing.
              </p>
              <div className="hero__actions">
                <Link href="/enterprise-ai-diagnosis" className="button button--primary">
                  Book AI diagnosis
                </Link>
                <Link href="/articles" className="button button--ghost">
                  Read Chinese essays
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
      </main>
    );
  }

  return (
    <main className="journal-home">
      <section className="editorial-hero editorial-hero--immersive">
        <div className="editorial-hero__inner">
          <div className="hero-poster hero-poster--plain">
            <p className="eyebrow">Agent Architect Jack Lu</p>
            <p className="editorial-hero__name">智能体架构师卢成</p>
            <p className="editorial-hero__location">{authorProfile.location}</p>
            <h1 className="editorial-hero__headline">把智能体能力从演示变成可成交、可交付、可控风险的商业系统。</h1>
            <p className="editorial-hero__intro">
              我帮助中小企业和 AI 服务商判断：该不该做、从哪做、怎么报价、怎么交付、怎么设置边界。
            </p>
            <p className="editorial-hero__intro">{entityProfile.oneLine}</p>
            <div className="hero__actions">
              <Link href={primaryConsultingHref} className="button button--primary">
                预约 AI 落地诊断
              </Link>
              <Link href="/cases" className="button button--ghost">
                查看真实案例
              </Link>
              <Link href="/templates" className="button button--ghost">
                下载诊断表
              </Link>
            </div>
            <p className="form-note">
              Agent Architect Jack Lu · Turning AI agents from demos into deliverable business systems.
            </p>
          </div>
          <div className="hero-visual">
            <div className="hero-visual__card">
              <Image
                src="/media/editorial/lu-cheng-keynote.png"
                alt="卢成的现场演讲形象"
                fill
                priority
                className="hero-visual__image"
                sizes="(max-width: 980px) 100vw, 420px"
              />
            </div>
            <p className="hero-visual__caption">企业 AI 诊断、智能体商业交付、服务商报价与边界设计。</p>
          </div>
        </div>
      </section>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">我解决的问题</p>
          <h2>我解决的不是“怎么用 AI”，而是“怎么让 AI 项目真正落地”。</h2>
          <p className="doc-body">
            很多企业不是不想用 AI，而是不知道 AI 应该接到哪里。很多 AI 服务商不是不会搭工具，而是不知道怎么谈单、报价、验收和止损。
          </p>
        </div>
        <div className="signal-list">
          {homeProblems.map((problem) => (
            <article key={problem} className="signal-item">
              <h3>{problem}</h3>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">方法论</p>
          <h2>智能体商业交付五步法</h2>
        </div>
        <div className="delivery-rail">
          {deliverySteps.map((step, index) => (
            <article key={step.title} className="delivery-step">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">服务入口</p>
          <h2>先诊断，再设计试点；先写边界，再谈交付。</h2>
        </div>
        <div className="service-grid">
          {serviceCards.map((item) => (
            <article key={item.title} className="service-item">
              <h3>{item.title}</h3>
              <p>适合：{item.audience}</p>
              <p>交付：{item.delivery}</p>
              <Link href={item.href} className="text-link">
                查看服务
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">案例库</p>
          <h2>真实项目与商业摩擦复盘</h2>
          <p className="doc-body">
            这里记录的不是完美成功故事，而是真实企业 AI 落地过程中会遇到的谈单、边界、执行、成本、老板心理和交付风险。
          </p>
        </div>
        <div className="article-grid">
          {cases.slice(0, 3).map((item) => (
            <article key={item.id} className="article-card">
              <div className="article-card__meta">
                <span>{item.id}</span>
                <span>{item.publishedAt}</span>
              </div>
              <h3>{item.industry}</h3>
              <p>{item.realProblem}</p>
              <Link href="/cases" className="text-link">
                查看案例库
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="cta-panel">
          <div>
            <p className="eyebrow">模板下载</p>
            <h2>开始前，先把需求、报价和边界说清楚。</h2>
            <p className="doc-body">
              诊断表、报价确认表、交付边界确认单、老板访谈清单、拒单判断表和案例复盘模板已开放下载。
            </p>
          </div>
          <div className="hero__actions">
            {templates.slice(0, 3).map((template) => (
              <Link key={template.title} href={template.href} className="button button--primary">
                {template.title}
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">主站首发</p>
          <h2>文章先在 agentarchitect.me 发布，再分发到外部平台。</h2>
        </div>
        <div className="article-grid">
          {articles.slice(0, 4).map((article) => (
            <article key={article.slug} className="article-card">
              <div className="article-card__meta">
                <span>{article.date}</span>
                <span>主站首发</span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <Link href={`/articles/${article.slug}`} className="text-link">
                阅读全文
              </Link>
            </article>
          ))}
        </div>
      </Reveal>
    </main>
  );
}
