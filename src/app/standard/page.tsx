import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { articles } from "@/lib/content";
import { serviceBoundaries, standardAbilities } from "@/lib/site-architecture";

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
            <p>
              这个角色真正值钱的地方，不是把词讲得多高级，而是能把老板一句“我想用 AI 提效”，拆成具体该做什么、谁来做、做到什么算完成。
            </p>
            <div className="hero__actions">
              <Link href="/services" className="button button--gold">
                看产品与服务
              </Link>
              <Link href="/articles" className="button button--ghost">
                看相关文章
              </Link>
            </div>
          </div>
          <figure className="site-photo site-photo--standard">
            <Image
              src="/media/consulting/standard-hero.webp"
              alt="智能体架构师在现场讲解企业 AI 流程"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 460px"
            />
          </figure>
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
            <figure className="site-photo">
              <Image
                src="/media/consulting/standard-flow.webp"
                alt="AI 业务实施流程讲解现场"
                fill
                sizes="(max-width: 980px) 100vw, 560px"
              />
            </figure>
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
          <div className="consulting-split consulting-split--reverse">
            <div>
              <p className="eyebrow">能力模型</p>
              <h2>我不能替你保证赚钱，但能帮你少踩很多坑。</h2>
              <ul className="principle-list">
                {serviceBoundaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <figure className="site-photo">
              <Image
                src="/media/consulting/standard-model.webp"
                alt="智能体架构师能力模型与公开资料展示"
                fill
                sizes="(max-width: 980px) 100vw, 560px"
              />
            </figure>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">推荐文章</p>
            <h2>想继续了解，可以从这些文章看起。</h2>
          </div>
          <div className="consulting-grid consulting-grid--two">
            {recommendedArticles.map((article) => (
              <article key={article.slug} className="consulting-card">
                <div className="image-placeholder image-placeholder--wide">
                  <span>推荐文章缩略图占位</span>
                </div>
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
