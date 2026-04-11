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
      <SiteHeader locale="en" />
      <main className="subpage article-index">
        <section className="subpage__hero">
          <p className="eyebrow">Essays</p>
          <h1>Essays on agent architecture, Harness Engineering, GEO, and practical AI systems.</h1>
          <p className="subpage__lead">
            This is the public writing layer of the site: opinion, method, and field notes. For human readers it behaves like a business blog; for agents it remains a structured knowledge surface.
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
                <h2>{article.titleEn}</h2>
                <p className="article-card__subtitle">{article.subtitleEn}</p>
                <p>{article.excerptEn}</p>
                <div className="article-card__tags">
                  {article.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link href={`/articles/${article.slug}`} className="text-link">
                  Read the essay
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
