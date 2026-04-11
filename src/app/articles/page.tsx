import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { articles } from "@/lib/content";

export const metadata: Metadata = {
  title: "文章",
  description: "卢成关于智能体架构、企业定制服务、AI 工作流与权威表达的中文文章。",
};

export default function ArticlesPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage article-index">
        <section className="subpage__hero">
          <p className="eyebrow">文章</p>
          <h1>关于智能体架构、企业服务与公开表达的写作</h1>
          <p className="subpage__lead">
            这里是站点最核心的公开写作层。文章不追求新闻速度，而是持续解释我如何理解智能体架构、企业落地路径、权威感建立，以及为什么 AI 最终必须回到真实工作系统里。
          </p>
        </section>

        <section className="section">
          <div className="article-grid article-grid--editorial">
            {articles.map((article) => (
              <article key={article.slug} className="article-card article-card--featured">
                <div className="article-card__cover">
                  <Image
                    src={article.coverImage}
                    alt={article.coverAlt}
                    fill
                    className="article-card__cover-image"
                    sizes="(max-width: 980px) 100vw, 560px"
                  />
                </div>
                <div className="article-card__content">
                  <div className="article-card__meta">
                    <span>{article.date}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h2>{article.title}</h2>
                  <p className="article-card__subtitle">{article.subtitle}</p>
                  <p>{article.excerpt}</p>
                  <div className="article-card__tags">
                    {article.tags.map((tag) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={`/articles/${article.slug}`} className="text-link">
                    阅读全文
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
