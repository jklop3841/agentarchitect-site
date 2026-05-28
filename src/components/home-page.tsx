import Image from "next/image";
import Link from "next/link";

import { ImageStrip } from "@/components/image-strip";
import { Reveal } from "@/components/reveal";
import {
  cases,
  deliverySteps,
  entityProfile,
} from "@/lib/commercial-site";
import { authorProfile } from "@/lib/content";
import { externalProfiles, primaryContact } from "@/lib/site";
import { contentColumns, servicePortfolio } from "@/lib/site-architecture";
import type { Locale } from "@/lib/types";

type HomePageProps = {
  locale: Locale;
};

const homeFocusCards = [
  {
    title: "企业AI化改革",
    body: "先改流程，再谈系统。",
  },
  {
    title: "智能体架构师成长陪跑",
    body: "从认知、能力到案例。",
  },
  {
    title: "AI服务商合作",
    body: "报价、交付、验收说清楚。",
  },
];

const homeGallery = [
  { src: "/media/consulting/home-work-scene.webp", alt: "卢成在企业 AI 交流现场分享" },
  { src: "/media/consulting/home-proof.webp", alt: "卢成公开资料展示现场" },
  { src: "/media/consulting/home-case.webp", alt: "智能体架构大会现场" },
  { src: "/media/consulting/home-article.webp", alt: "智能体架构师趋势主题演讲现场" },
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
            <p className="doc-body">专注中国智能体架构师行业赋能与发展，推动中国企业 AI 化变革。</p>
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
          <ImageStrip images={homeGallery} />
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
        <div className="section-heading">
          <p className="eyebrow">案例</p>
          <h2>图片可以点开，看高清大图。</h2>
        </div>
        <ImageStrip images={homeGallery} />
        <div className="hero__actions">
          <Link href="/cases" className="button button--ghost">
            查看案例
          </Link>
          <Link href="/articles" className="button button--ghost">
            查看文章
          </Link>
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="consulting-contact">
          <div>
            <p className="eyebrow">联系卢成</p>
            <h2>想做 AI 项目，先别急着开发，先把问题发来。</h2>
            <p>告诉我你做什么行业、现在卡在哪里、想让 AI 帮你做哪一步。</p>
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
