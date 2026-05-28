import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import {
  cases,
  deliverySteps,
  entityProfile,
  homeProblems,
} from "@/lib/commercial-site";
import { articles, authorProfile } from "@/lib/content";
import { externalProfiles, primaryContact } from "@/lib/site";
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
      <section className="consulting-hero">
        <div className="consulting-hero__media">
          <Image
            src="/media/editorial/lu-cheng-keynote.png"
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
              我帮老板把脑子里的经验、每天在做的流程、团队反复卡住的事，整理成 AI 能帮忙跑起来的方案。
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
            <h2>我不卖万能 AI，我先帮你把生意里的事讲清楚。</h2>
            <p className="doc-body">
              很多老板不是不会用 AI，而是不知道该把 AI 放到哪一步。我做的事，就是先把你的业务动作拆开，看哪些能交给 AI，哪些必须人来把关，哪些项目一开始就不该花钱做。
            </p>
            <div className="contact-strip">
              <a href={primaryContact.emailHref}>
                <strong>Email</strong>
                <span>{primaryContact.email}</span>
              </a>
              <Link href="/contact">
                <strong>微信 / 资料</strong>
                <span>{primaryContact.wechatLabel}</span>
              </Link>
            </div>
          </div>
          <div className="image-placeholder image-placeholder--portrait">
            <span>工作场景图占位</span>
            <small>后续替换为咨询、白板、会议或办公场景照片</small>
          </div>
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading section-heading--compact">
          <p className="eyebrow">我解决的问题</p>
          <h2>老板缺的不是新工具，而是知道这工具到底该用在哪里。</h2>
        </div>
        <div className="consulting-grid consulting-grid--three">
          {homeProblems.map((problem) => (
            <article key={problem} className="consulting-card">
              <div className="image-placeholder image-placeholder--thumb">
                <span>配图占位</span>
              </div>
              <h3>{problem}</h3>
              <p>先把问题说清楚，再决定值不值得做，别一上来就砸钱开发。</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="consulting-split consulting-split--reverse">
          <div className="image-placeholder">
            <span>信任背书 / 公开资料图占位</span>
            <small>可放主站截图、外部分发截图、资料库截图或公开证据拼图</small>
          </div>
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
          <article className="consulting-card">
            <div className="image-placeholder image-placeholder--wide">
              <span>案例图占位</span>
            </div>
            <h3>案例与观察</h3>
            <p>这里只放能说明问题的复盘，不编造夸张案例。</p>
            <Link href="/cases" className="text-link">
              查看案例
            </Link>
          </article>
          <article className="consulting-card">
            <div className="image-placeholder image-placeholder--wide">
              <span>文章封面占位</span>
            </div>
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
          <div className="image-placeholder image-placeholder--qr">
            <span>二维码 / 名片图占位</span>
            <small>{primaryContact.email}</small>
          </div>
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
