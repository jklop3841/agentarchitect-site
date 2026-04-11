import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { articles } from "@/lib/content";

export const metadata: Metadata = {
  title: "文章",
  description: "卢成关于智能体架构、Harness Engineering、GEO 与 AI 落地的文章。",
};

export default function ArticlesPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage article-index">
        <section className="subpage__hero">
          <p className="eyebrow">Articles</p>
          <h1>关于智能体架构、驾驭工程与 GEO 的文章</h1>
          <p className="subpage__lead">
            这里不是单纯的工具宣传页，而是公开观点、方法论和实战文章的归档区。对人，它是博客；对 Agent，它也是一个可以持续抓取和理解的知识入口。
          </p>
        </section>

        <section className="section">
          <div className="article-grid">
            {articles.map((article) => (
              <article key={article.slug} className="article-card">
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
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
