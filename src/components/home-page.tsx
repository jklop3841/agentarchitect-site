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
  { src: "/media/consulting2/training-keynote-01.webp", alt: "卢成在企业培训现场", title: "企业培训", caption: "把 AI 落地讲给老板听。" },
  { src: "/media/consulting2/training-room-01.webp", alt: "企业 AI 课程现场", title: "课程现场", caption: "围绕流程、内容、协作拆解。" },
  { src: "/media/consulting2/ip-masterclass-01.webp", alt: "AI IP 主题课程现场", title: "主题课程", caption: "讲清 AI 服务怎么交付。" },
  { src: "/media/consulting2/workshop-board-01.webp", alt: "AI 工作坊白板讲解", title: "工作坊", caption: "把经验整理成可执行方案。" },
  { src: "/media/consulting2/stage-blue-01.webp", alt: "大型会场演讲现场", title: "公开演讲", caption: "智能体架构师行业表达。" },
  { src: "/media/consulting2/portrait-mic-01.webp", alt: "卢成持麦分享", title: "现场分享", caption: "少讲玄学，多讲边界。" },
  { src: "/media/consulting2/duo-01.webp", alt: "商业访谈现场", title: "对谈交流", caption: "围绕老板业务和 AI 化。" },
  { src: "/media/consulting2/ai-training-01.webp", alt: "AI 培训课程海报", title: "AI 训练营", caption: "从概念走向交付。" },
];

const homeCaseGallery = [
  { src: "/media/consulting2/training-keynote-02.webp", alt: "企业合作培训现场", title: "企业合作", caption: "先把业务问题说清楚。" },
  { src: "/media/consulting2/workshop-board-02.webp", alt: "业务编译工作坊现场", title: "业务编译", caption: "把老板经验变成流程。" },
  { src: "/media/consulting2/stage-blue-02.webp", alt: "大会演讲现场", title: "行业大会", caption: "输出智能体架构师标准。" },
  { src: "/media/consulting2/ip-masterclass-02.webp", alt: "AI IP 实战课程", title: "AI IP 课程", caption: "内容、产品、服务一起拆。" },
  { src: "/media/consulting2/training-room-02.webp", alt: "企业 AI 培训课堂", title: "课堂交付", caption: "让团队知道怎么用。" },
  { src: "/media/consulting2/workshop-stand-01.webp", alt: "卢成在课程现场讲解", title: "现场讲解", caption: "把抽象 AI 变成动作。" },
  { src: "/media/consulting2/stage-speech-01.webp", alt: "卢成台上演讲", title: "台上表达", caption: "面向老板的 AI 语言。" },
  { src: "/media/consulting2/portrait-mic-02.webp", alt: "卢成持麦讲课", title: "持麦分享", caption: "谈交付、风险和边界。" },
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
          <h2>图片可以点开，看高清大图。</h2>
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
