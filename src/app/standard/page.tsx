import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ImageStrip } from "@/components/image-strip";
import { SiteHeader } from "@/components/site-header";
import { articles } from "@/lib/content";
import { standardAbilities } from "@/lib/site-architecture";

export const metadata: Metadata = {
  title: "智能体架构师标准",
  description:
    "用老板能听懂的方式解释智能体架构师是什么、有什么标准、如何判断 AI 项目能不能落地、怎么验收和控风险。",
  alternates: {
    canonical: "/standard",
  },
  openGraph: {
    title: "智能体架构师标准",
    description: "智能体架构师不是写提示词的人，而是帮老板判断 AI 该用在哪里、怎么少走弯路、怎么把结果验收清楚的人。",
    url: "/standard",
  },
};

const implementationSteps = [
  "先判断业务痛点",
  "再拆真实流程",
  "设计小试点",
  "写清验收标准",
  "控制风险边界",
  "复盘后再放大",
];

const standardGallery = [
  { src: "/media/consulting3/graduation-01.webp", alt: "智能体架构师陪跑结业现场", title: "行业标准", caption: "先定义角色，再定义交付。" },
  { src: "/media/consulting3/whiteboard-03.webp", alt: "智能体架构师白板流程拆解", title: "流程拆解", caption: "从业务痛点开始。" },
  { src: "/media/consulting3/screen-teaching-01.webp", alt: "智能体架构师企业培训讲解", title: "企业培训", caption: "老板能听懂，团队能执行。" },
  { src: "/media/consulting3/presentation-02.webp", alt: "智能体架构师现场讲解", title: "架构讲解", caption: "不只会工具，还要懂业务。" },
  { src: "/media/consulting2/training-room-01.webp", alt: "智能体架构师企业课堂", title: "企业课堂", caption: "把风险和边界说透。" },
  { src: "/media/consulting3/group-banner-01.webp", alt: "智能体架构师线下活动", title: "线下活动", caption: "用行业语言建立共识。" },
  { src: "/media/consulting3/workshop-table-01.webp", alt: "智能体架构师工作坊", title: "工作坊", caption: "从小闭环开始落地。" },
  { src: "/media/consulting3/standing-teaching-01.webp", alt: "卢成现场分享智能体架构师标准", title: "现场分享", caption: "标准、验收、边界。" },
];

const articleThumbs = [
  "/media/consulting3/screen-pointing-01.webp",
  "/media/consulting3/whiteboard-02.webp",
  "/media/consulting3/presentation-01.webp",
  "/media/consulting3/group-room-01.webp",
];

export default function StandardPage() {
  const recommendedArticles = articles
    .filter((article) => article.tags.some((tag) => ["智能体架构师", "企业AI落地", "交付边界", "老板业务编译器"].includes(tag)))
    .slice(0, 4);

  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage consulting-page">
        <section className="standard-hero">
          <div>
            <p className="eyebrow">行业标准版</p>
            <h1>什么是智能体架构师？</h1>
            <div className="definition-box">
              <strong>定义：</strong>
              <span>
                智能体架构师不是写提示词的人，而是帮老板判断 AI 该用在哪里、怎么少走弯路、怎么把结果验收清楚的人。
              </span>
            </div>
            <p>把“我想用 AI 提效”，拆成具体该做什么、谁来做、做到什么算完成。</p>
            <div className="hero__actions">
              <Link href="/services" className="button button--gold">
                看产品与服务
              </Link>
              <Link href="/articles" className="button button--ghost">
                看相关文章
              </Link>
            </div>
          </div>
          <ImageStrip images={standardGallery} />
        </section>

        <section className="section">
          <div className="section-heading section-heading--compact">
            <p className="eyebrow">核心标准</p>
            <h2>这个人靠不靠谱，就看他能不能讲清这六件事。</h2>
          </div>
          <div className="standard-matrix">
            {standardAbilities.map((ability) => (
              <article key={ability.title}>
                <h3>{ability.title}</h3>
                <p>{ability.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="consulting-split">
            <ImageStrip images={standardGallery} variant="compact" />
            <div>
              <p className="eyebrow">AI 业务实施全流程</p>
              <h2>先小范围跑通，再考虑放大，别一上来就做大系统。</h2>
              <div className="process-strip">
                {implementationSteps.map((step, index) => (
                  <div key={step}>
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <ImageStrip images={standardGallery} variant="compact" />
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">推荐文章</p>
            <h2>想继续了解，可以从这些文章看起。</h2>
          </div>
          <div className="consulting-grid consulting-grid--two">
            {recommendedArticles.map((article, index) => (
              <article key={article.slug} className="consulting-card">
                <figure className="site-photo site-photo--card">
                  <Image
                    src={articleThumbs[index % articleThumbs.length]}
                    alt={`${article.title}推荐图`}
                    fill
                    sizes="(max-width: 980px) 100vw, 44vw"
                  />
                </figure>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <Link href={`/articles/${article.slug}`} className="text-link">
                  阅读文章
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
