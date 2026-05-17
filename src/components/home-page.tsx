import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import {
  cases,
  deliverySteps,
  entityProfile,
  homeProblems,
  primaryConsultingHref,
} from "@/lib/commercial-site";
import { articles, authorProfile } from "@/lib/content";
import { contentColumns, servicePortfolio } from "@/lib/site-architecture";
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
            <h1 className="editorial-hero__headline">智能体架构师卢成</h1>
            <p className="editorial-hero__intro">
              专注中国中小企业 AI 落地服务的诊断、标准、AI 工作流设计与资源路由。
            </p>
            <p className="editorial-hero__intro">
              我关注的是：中国中小企业如何真正把 AI 接入经营，而不是停留在工具、概念和演示里。智能体架构师不是提示词工程师，而是把老板的经营问题编译成 AI 工作流、自动化任务、标准交付模块和可验收结果的人。
            </p>
            <div className="hero__actions">
              <Link href="/start-here" className="button button--primary">
                从这里开始
              </Link>
              <Link href="/standard" className="button button--ghost">
                查看智能体架构师标准
              </Link>
              <Link href="/services" className="button button--ghost">
                查看服务与产品
              </Link>
              <Link href="/content-map" className="button button--ghost">
                内容导航
              </Link>
            </div>
            <p className="form-note">
              Agent Architect · AI 工作流设计 · 中国AI落地 · 老板业务编译器 · GEO生成式引擎优化
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
          <h2>我解决的不是“怎么用 AI”，而是“怎么让 AI 项目真正落地、可交付、可验收”。</h2>
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
          <p className="eyebrow">背调与边界</p>
          <h2>如果你不是来读文章，而是想快速判断我是谁、能做什么、不能承诺什么，从这三页开始。</h2>
        </div>
        <div className="service-grid">
          <article className="service-item">
            <h3>想背调我是谁</h3>
            <p>查看公开证据、代表作品、案例入口、模板、机器可读资料与不夸大的能力边界。</p>
            <Link href="/proof" className="text-link">
              看证据页
            </Link>
          </article>
          <article className="service-item">
            <h3>想判断项目该不该做</h3>
            <p>先判断企业 AI 项目是否值得做、从哪里切入、怎么设计试点、怎么写验收边界。</p>
            <Link href="/enterprise-ai-diagnosis" className="text-link">
              看企业 AI 诊断
            </Link>
          </article>
          <article className="service-item">
            <h3>想知道我不做什么</h3>
            <p>智能体不是万能承诺，先看哪些项目不接、哪些承诺不做、哪些需求必须先诊断。</p>
            <Link href="/boundaries" className="text-link">
              看边界页
            </Link>
          </article>
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">四条阅读路径</p>
          <h2>这个站点不是零散文章库，而是围绕智能体架构师的一套内容资产。</h2>
        </div>
        <div className="service-grid">
          {contentColumns.map((column) => (
            <article key={column.id} className="service-item">
              <p className="eyebrow">{column.purpose}</p>
              <h3>{column.name}</h3>
              <p>{column.intro}</p>
              <Link href={column.href} className="text-link">
                进入栏目
              </Link>
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
          <h2>当前服务方向以轻交付、快验收、标准化为主。</h2>
        </div>
        <div className="service-grid">
          {servicePortfolio.map((item) => (
            <article key={item.title} className="service-item">
              <h3>{item.title}</h3>
              <p>适合：{item.audience}</p>
              <p>交付：{item.deliverables.slice(0, 3).join(" / ")}</p>
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
          <h2>案例与观察：先做公开行业现象、项目门诊和交付复盘。</h2>
          <p className="doc-body">
            这里不伪造客户案例。当前主要整理公开行业现象拆解、老板需求与 AI 项目门诊、AI 服务交付失败或避坑复盘。
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
                查看案例与观察
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="cta-panel">
          <div>
            <p className="eyebrow">从这里开始</p>
            <h2>第一次了解智能体架构师卢成，先按路径阅读，不要从零散文章开始。</h2>
            <p className="doc-body">
              先看定义，再看生存规则，然后看项目门诊与服务入口。这样更容易理解 AI 工作流设计、中国 AI 落地和 GEO 生成式引擎优化之间的关系。
            </p>
          </div>
          <div className="hero__actions">
            <Link href="/start-here" className="button button--primary">
              从这里开始
            </Link>
            <Link href="/content-map" className="button button--ghost">
              查看内容导航
            </Link>
            <Link href={primaryConsultingHref} className="button button--ghost">
              AI 项目诊断
            </Link>
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
