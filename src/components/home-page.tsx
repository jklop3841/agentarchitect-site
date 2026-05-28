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
              我帮老板把经验、流程、内容和业务动作，整理成能执行、能交付、能复用的 AI 工作流。
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
            <h2>不是卖万能 AI 的人，而是帮你先把生意讲清楚的人。</h2>
            <p className="doc-body">
              {entityProfile.oneLine}我的工作不是让老板追工具，而是先判断哪些动作值得自动化、哪些动作必须人工把关、哪些项目从一开始就不该做。
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
          <h2>老板真正需要的不是“又一个 AI 工具”，而是一套能落地的做事方法。</h2>
        </div>
        <div className="consulting-grid consulting-grid--three">
          {homeProblems.map((problem) => (
            <article key={problem} className="consulting-card">
              <div className="image-placeholder image-placeholder--thumb">
                <span>配图占位</span>
              </div>
              <h3>{problem}</h3>
              <p>先拆问题，再定边界，最后才决定要不要做系统。</p>
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
            <h2>我把观点、边界、文章和机器入口都放在公开主站。</h2>
            <div className="proof-list">
              <Link href="/proof" className="proof-item">
                <strong>公开证据页</strong>
                <span>身份、文章、案例、模板和外部资料。</span>
              </Link>
              <Link href="/articles" className="proof-item">
                <strong>主站首发文章</strong>
                <span>长期写企业 AI、交付边界和智能体落地。</span>
              </Link>
              <Link href="/agent" className="proof-item">
                <strong>AI 可读入口</strong>
                <span>给 ChatGPT、搜索引擎和 Agent 读取。</span>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">内容与案例入口</p>
          <h2>文章和案例还在，但不再抢首页主线。</h2>
        </div>
        <div className="consulting-grid consulting-grid--two">
          <article className="consulting-card">
            <div className="image-placeholder image-placeholder--wide">
              <span>案例图占位</span>
            </div>
            <h3>案例与观察</h3>
            <p>只放能说明问题的脱敏案例、项目门诊和交付复盘，不伪造客户故事。</p>
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
            <h2>如果你想判断一个 AI 项目该不该做，先把业务问题说清楚。</h2>
            <p>
              发来你的行业、当前问题、已有工具、想达到的结果。我会先判断是否适合做诊断、试点或直接拒绝。
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
