import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { articles, authorProfile, blogIntro } from "@/lib/content";
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
  const blogTitle = isEnglish ? blogIntro.titleEn : blogIntro.title;
  const blogSummary = isEnglish ? blogIntro.summaryEn : blogIntro.summary;

  const practiceAreas = isEnglish
    ? [
        "Agent architecture and execution-system design",
        "Workflow review, boundary control, and delivery structure",
        "Executive briefings, speaking, and closed-door sessions",
      ]
    : [
        "智能体架构与执行系统设计",
        "AI 工作流诊断、边界控制与交付结构",
        "公开演讲、闭门分享与高层简报",
      ];

  const authorityNotes = isEnglish
    ? [
        "From keynote stages to project rooms, the focus stays the same: turning AI from a capability demo into an operating system.",
        "The work is deliberately human-first on the surface: clear writing, disciplined positioning, and a credible contact path.",
      ]
    : [
        "从公开演讲到项目现场，我关注的始终不是“模型多强”，而是如何把 AI 组织成能承担结果的系统。",
        "这个站点也遵循同样的逻辑：先建立可信的人物品牌，再承接真正需要深入设计与评审的合作。",
      ];

  const serviceItems = isEnglish
    ? [
        {
          title: "Architecture Review",
          body: "Review your current AI stack, workflow shape, and decision boundaries before you scale the wrong system.",
        },
        {
          title: "Workflow Design",
          body: "Design practical agent workflows that balance clarity, control, quality, and operating cost.",
        },
        {
          title: "Speaking & Briefings",
          body: "Deliver executive-ready talks, workshops, and private briefings for teams navigating AI transformation.",
        },
      ]
    : [
        {
          title: "架构诊断",
          body: "在真正扩大投入之前，先看清当前 AI 栈、工作流结构与决策边界哪里有问题。",
        },
        {
          title: "工作流设计",
          body: "围绕清晰度、可控性、交付质量与运行成本，设计更稳的智能体系统。",
        },
        {
          title: "演讲与闭门分享",
          body: "为企业、团队和决策者提供更适合管理语境的主题演讲、工作坊与内部简报。",
        },
      ];

  return (
    <main className="journal-home">
      <section className="editorial-hero editorial-hero--immersive">
        <div className="editorial-hero__inner">
          <div className="hero-poster">
            <p className="eyebrow">{isEnglish ? "Agent Architect" : "智能体架构师"}</p>
            <p className="editorial-hero__name">
              {isEnglish ? authorProfile.englishName : authorProfile.name}
            </p>
            <p className="editorial-hero__location">{location}</p>
            <h1 className="editorial-hero__headline">
              {isEnglish
                ? "Architecting AI systems that operate beyond the demo."
                : "把 AI 能力组织成真正能交付结果的系统。"}
            </h1>
            <p className="editorial-hero__intro">{intro}</p>
            <ul className="hero-poster__list">
              {practiceAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
            <div className="hero__actions">
              <Link href="/articles" className="button button--primary">
                {isEnglish ? "Read essays" : "阅读文章"}
              </Link>
              <Link href="#contact" className="button button--ghost">
                {isEnglish ? "WeChat contact" : "微信联系"}
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-visual__card">
              <Image
                src="/media/editorial/lu-cheng-keynote.png"
                alt="卢成在台上演讲"
                fill
                priority
                className="hero-visual__image"
                sizes="(max-width: 980px) 100vw, 420px"
              />
            </div>
            <p className="hero-visual__caption">
              {isEnglish
                ? "Keynotes, executive briefings, and practical AI systems."
                : "主题演讲、管理层简报与可落地的 AI 系统设计。"}
            </p>
          </div>
        </div>
      </section>

      <Reveal className="section" id="bio">
        <div className="profile-layout">
          <div className="profile-layout__image">
            <Image
              src="/media/editorial/lu-cheng-portrait.png"
              alt="卢成肖像"
              width={960}
              height={1440}
              className="profile-layout__photo"
            />
          </div>
          <div className="profile-layout__copy">
            <div className="section-heading">
              <p className="eyebrow">{isEnglish ? "Profile" : "简介"}</p>
              <h2>
                {isEnglish
                  ? "Not chasing AI spectacle, but designing systems that can actually take responsibility."
                  : "不是追逐模型热闹的人，而是把 AI 能力编排成工作系统的人。"}
              </h2>
            </div>
            {bioParagraphs.map((paragraph) => (
              <p key={paragraph} className="doc-body">
                {paragraph}
              </p>
            ))}
            <div className="profile-layout__principles">
              <p className="eyebrow">{isEnglish ? "Principles" : "工作原则"}</p>
              <ul className="principle-list principle-list--tight">
                {principles.map((principle) => (
                  <li key={principle}>{principle}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="section" id="authority">
        <div className="authority-band">
          <div className="authority-band__copy">
            <p className="eyebrow">{isEnglish ? "Authority" : "权威表达"}</p>
            <h2>
              {isEnglish
                ? "Authority is built through public articulation, closed-door judgment, and systems that survive contact with reality."
                : "权威感来自公开表达、闭门判断，以及真正经得起现实碰撞的系统设计。"}
            </h2>
            {authorityNotes.map((note) => (
              <p key={note} className="doc-body">
                {note}
              </p>
            ))}
          </div>
          <div className="authority-band__visual">
            <Image
              src="/media/editorial/lu-cheng-summit.png"
              alt="卢成在 Global AI Summit"
              width={960}
              height={1440}
              className="authority-band__image"
            />
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

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">{isEnglish ? "Collaboration" : "合作方向"}</p>
          <h2>
            {isEnglish
              ? "The current site is optimized for a small number of high-trust conversations."
              : "当前站点更适合承接少量高信任度、需要判断力的合作。"}
          </h2>
        </div>
        <div className="service-grid">
          {serviceItems.map((item) => (
            <article key={item.title} className="service-item">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section" id="contact">
        <div className="contact-stage">
          <div className="contact-stage__copy">
            <p className="eyebrow">{isEnglish ? "WeChat Contact" : "微信联系"}</p>
            <h2>
              {isEnglish
                ? "All private conversations route through WeChat first. More QR entrances can be added later by scenario."
                : "私人沟通统一通过微信二维码进入，后续也可以按场景继续扩展更多二维码入口。"}
            </h2>
            <p className="doc-body">
              {isEnglish
                ? "If you are exploring architecture review, speaking, workflow design, or strategic AI adoption, start here."
                : "如果你正在考虑架构评审、主题演讲、工作流设计或 AI 转型相关合作，可以先从这里建立联系。"}
            </p>
            <div className="hero__actions">
              <Link href="/apply" className="button button--primary">
                {isEnglish ? "Open application form" : "打开申请表单"}
              </Link>
            </div>
          </div>
          <div className="qr-gallery">
            <div className="qr-card">
              <p className="eyebrow">{isEnglish ? "Official WeChat" : "官方微信"}</p>
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
