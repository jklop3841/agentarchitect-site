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
    image: "/media/consulting2/training-room-01.webp",
  },
  {
    title: "智能体架构师成长陪跑",
    body: "从认知、能力到案例。",
    image: "/media/consulting2/ip-masterclass-02.webp",
  },
  {
    title: "AI服务商合作",
    body: "报价、交付、验收说清楚。",
    image: "/media/consulting2/duo-01.webp",
  },
];

const homeGallery = [
  { src: "/media/consulting3/screen-pointing-01.webp", alt: "卢成屏幕讲解智能体架构师", title: "智能体架构师", caption: "讲标准，也讲交付。" },
  { src: "/media/consulting3/meeting-screen-01.webp", alt: "卢成会议室讲解AI方案", title: "企业AI化", caption: "先从业务场景开始。" },
  { src: "/media/consulting3/whiteboard-02.webp", alt: "卢成白板拆解业务", title: "业务拆解", caption: "把经验变成流程。" },
  { src: "/media/consulting3/small-consulting-01.webp", alt: "小范围AI咨询交流", title: "小范围咨询", caption: "问题具体，方案才具体。" },
  { src: "/media/consulting3/paper-discussion-01.webp", alt: "AI服务方案资料讨论", title: "资料讨论", caption: "把边界写清楚。" },
  { src: "/media/consulting3/standing-consulting-01.webp", alt: "站立式AI咨询沟通", title: "现场沟通", caption: "围绕真实项目推进。" },
  { src: "/media/consulting3/presentation-02.webp", alt: "卢成演示AI方案", title: "方案演示", caption: "让老板知道下一步。" },
  { src: "/media/consulting3/group-room-02.webp", alt: "卢成线下课程合影", title: "线下课程", caption: "从认知到行动。" },
];

const homeCaseGallery = [
  { src: "/media/consulting3/group-room-01.webp", alt: "卢成企业AI化改革现场合影", title: "企业AI化改革", caption: "把老板问题拆成动作。" },
  { src: "/media/consulting3/whiteboard-01.webp", alt: "卢成白板讲解业务流程", title: "白板拆解", caption: "先拆流程，再谈系统。" },
  { src: "/media/consulting3/graduation-01.webp", alt: "智能体架构师陪跑结业合影", title: "陪跑结业", caption: "从学习走向案例。" },
  { src: "/media/consulting3/presentation-01.webp", alt: "卢成讲解企业AI方案", title: "方案讲解", caption: "让老板听懂 AI 怎么用。" },
  { src: "/media/consulting3/consulting-talk-01.webp", alt: "AI服务商合作咨询现场", title: "服务商合作", caption: "一起把边界说清楚。" },
  { src: "/media/consulting3/screen-teaching-01.webp", alt: "智能体架构师课程屏幕讲解", title: "课程现场", caption: "围绕标准、产品和交付。" },
  { src: "/media/consulting3/workshop-table-01.webp", alt: "AI业务工作坊会议桌现场", title: "工作坊", caption: "把业务经验整理出来。" },
  { src: "/media/consulting3/certificate-01.webp", alt: "智能体架构师资料交付展示", title: "资料交付", caption: "可复盘，可沉淀。" },
  { src: "/media/consulting3/group-banner-01.webp", alt: "智能体架构师线下活动合影", title: "线下活动", caption: "行业共识持续沉淀。" },
  { src: "/media/consulting3/standing-teaching-01.webp", alt: "卢成站立讲解智能体架构师", title: "现场讲解", caption: "少讲概念，多讲落地。" },
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

      <Reveal className="section section--tight">
        <ImageStrip images={homeCaseGallery} variant="compact" />
      </Reveal>

      <Reveal className="section">
        <div className="section-heading section-heading--compact">
          <p className="eyebrow">我解决的问题</p>
          <h2>围绕智能体架构师行业，做三件真正有价值的事。</h2>
        </div>
        <div className="consulting-grid consulting-grid--three">
          {homeFocusCards.map((problem) => (
            <article key={problem.title} className="consulting-card">
              <figure className="site-photo site-photo--card">
                <Image src={problem.image} alt={`${problem.title}现场`} fill sizes="(max-width: 980px) 100vw, 30vw" />
              </figure>
              <h3>{problem.title}</h3>
              <p>{problem.body}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">案例</p>
          <h2>卢成过往案例</h2>
        </div>
        <ImageStrip images={homeCaseGallery} />
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
