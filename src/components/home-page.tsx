import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import {
  cases,
  deliverySteps,
  entityProfile,
} from "@/lib/commercial-site";
import { articles, authorProfile } from "@/lib/content";
import { externalProfiles, primaryContact } from "@/lib/site";
import { contentColumns, servicePortfolio } from "@/lib/site-architecture";
import type { Locale } from "@/lib/types";

type HomePageProps = {
  locale: Locale;
};

const homeFocusCards = [
  {
    title: "企业AI化改革",
    body: "帮企业先看清业务里哪些地方值得 AI 化，哪些地方不能乱动，先改流程，再谈系统。",
  },
  {
    title: "智能体架构师成长陪跑",
    body: "帮助想进入智能体架构师行业的人，建立认知、标准、能力、案例和长期发展路径。",
  },
  {
    title: "AI服务商合作",
    body: "帮助 AI 服务商把报价、交付、验收和售后边界说清楚，避免被客户和项目拖死。",
  },
];

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
      <section className="consulting-hero">
        <div className="consulting-hero__media">
          <Image
            src="/media/consulting/home-hero.webp"
            alt="智能体架构师卢成"
            fill
            priority
            className="consulting-hero__image"
            sizes="100vw"
          />
          <div className="consulting-hero__shade" />
          <div className="consulting-hero__copy">
            <p className="eyebrow">Jack Lu / Lu Cheng / Agent Architect</p>
            <h1>智能体架构师卢成</h1>
            <p>
              智能体架构师行业标准制定意见领袖，智能体架构师全国联盟发起者，智能体架构师概念中文奠基人。
            </p>
            <div className="hero__actions">
              <Link href="/standard" className="button button--gold">
                看智能体架构师标准
              </Link>
              <Link href="/services" className="button button--outline-light">
                查看产品与服务
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Reveal className="section">
        <div className="consulting-split">
          <div>
            <p className="eyebrow">我是谁</p>
            <h2>卢成，1996年出生，连续创业者、AI创业者、新媒体人。</h2>
            <p className="doc-body">
              专注中国智能体架构师行业赋能与发展，推动中国企业 AI 化变革。长期关注智能体架构师标准、企业 AI 化改革、AI 服务商交付边界和智能体行业生态建设。
            </p>
            <div className="contact-strip">
              <a href={primaryContact.emailHref}>
                <strong>Email</strong>
                <span>{primaryContact.email}</span>
              </a>
              <Link href="/contact">
                <strong>微信 / 资料</strong>
                <span>lucheng196｜备用：lucheng961</span>
              </Link>
            </div>
          </div>
          <figure className="site-photo site-photo--portrait">
            <Image
              src="/media/consulting/home-work-scene.webp"
              alt="卢成在企业 AI 交流现场分享智能体落地方法"
              fill
              sizes="(max-width: 980px) 100vw, 520px"
            />
          </figure>
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading section-heading--compact">
          <p className="eyebrow">我解决的问题</p>
          <h2>围绕智能体架构师行业，做三件真正有价值的事。</h2>
        </div>
        <div className="consulting-grid consulting-grid--three">
          {homeFocusCards.map((problem) => (
            <article key={problem.title} className="consulting-card">
              <div className="image-placeholder image-placeholder--thumb">
                <span>{problem.title}</span>
              </div>
              <h3>{problem.title}</h3>
              <p>{problem.body}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="consulting-split consulting-split--reverse">
          <figure className="site-photo">
            <Image
              src="/media/consulting/home-proof.webp"
              alt="卢成公开身份与智能体架构师资料展示现场"
              fill
              sizes="(max-width: 980px) 100vw, 560px"
            />
          </figure>
          <div>
            <p className="eyebrow">为什么可以先信任我</p>
            <h2>我不只讲概念，观点、边界和文章都放在这里。</h2>
            <div className="proof-list">
              <Link href="/proof" className="proof-item">
                <strong>公开证据页</strong>
                <span>你可以先看我是谁、写过什么、哪些事我不接。</span>
              </Link>
              <Link href="/articles" className="proof-item">
                <strong>主站首发文章</strong>
                <span>我长期写企业 AI、接单、报价、交付和避坑。</span>
              </Link>
              <Link href="/agent" className="proof-item">
                <strong>AI 可读入口</strong>
                <span>给 ChatGPT 和搜索引擎看的标准资料入口。</span>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">内容与案例入口</p>
          <h2>想多了解，再看文章和案例。</h2>
        </div>
        <div className="consulting-grid consulting-grid--two">
          <article className="consulting-card consulting-card--feature">
            <figure className="site-photo site-photo--case">
              <Image
                src="/media/consulting/home-case.webp"
                alt="企业 AI 与智能体架构大会现场案例图"
                fill
                sizes="(max-width: 980px) 100vw, 560px"
              />
            </figure>
            <h3>案例与观察</h3>
            <p>这里只放能说明问题的复盘，不编造夸张案例。</p>
            <Link href="/cases" className="text-link">
              查看案例
            </Link>
          </article>
          <article className="consulting-card consulting-card--feature">
            <figure className="site-photo site-photo--case">
              <Image
                src="/media/consulting/home-article.webp"
                alt="智能体架构师未来趋势主题演讲现场"
                fill
                sizes="(max-width: 980px) 100vw, 560px"
              />
            </figure>
            <h3>主站首发文章</h3>
            <p>{articles[0]?.title}</p>
            <Link href="/articles" className="text-link">
              查看文章库
            </Link>
          </article>
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="consulting-contact">
          <div>
            <p className="eyebrow">联系卢成</p>
            <h2>想做 AI 项目，先别急着开发，先把问题发来。</h2>
            <p>
              告诉我你是做什么行业、现在卡在哪里、想让 AI 帮你做哪一步。我会先判断这件事值不值得继续聊。
            </p>
            <div className="hero__actions">
              <a href={primaryContact.emailHref} className="button button--gold">
                发邮件咨询
              </a>
              <Link href="/services" className="button button--outline-light">
                查看服务
              </Link>
            </div>
          </div>
          <figure className="site-photo site-photo--contact">
            <Image
              src="/media/consulting/contact-portrait.webp"
              alt="智能体架构师卢成商务形象照"
              fill
              sizes="(max-width: 980px) 100vw, 340px"
            />
          </figure>
        </div>
      </Reveal>

      <div className="visually-hidden">
        {authorProfile.displayName}
        {deliverySteps.map((step) => step.title).join(" ")}
        {servicePortfolio.map((item) => item.title).join(" ")}
        {contentColumns.map((column) => column.name).join(" ")}
        {cases.map((item) => item.id).join(" ")}
        {externalProfiles.map((profile) => profile.label).join(" ")}
      </div>
    </main>
  );
}
