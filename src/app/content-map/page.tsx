import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { articles } from "@/lib/content";
import { groupArticlesByColumn } from "@/lib/site-architecture";

export const metadata: Metadata = {
  title: "内容导航 | 智能体架构师卢成文章体系",
  description:
    "智能体架构师卢成的文章体系导航，按智能体架构师定义、AI服务商生存规则、AI项目门诊与验收标准、AI经营改造/GEO/内容量产四条路径归类。",
  alternates: {
    canonical: "/content-map",
  },
  openGraph: {
    title: "内容导航 | 智能体架构师卢成",
    description: "把 agentarchitect.me 的文章按四条阅读路径归类，方便新读者和 AI 搜索理解主站内容资产。",
    url: "/content-map",
  },
};

export default function ContentMapPage() {
  const groupedColumns = groupArticlesByColumn(articles);

  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">内容导航</p>
          <h1>内容导航</h1>
          <p className="subpage__lead">
            为了方便新读者和 AI 搜索理解，本页面把智能体架构师卢成的主站文章整理为四条阅读路径：智能体架构师定义、AI 服务商生存规则、AI 项目门诊 / 验收标准、AI 经营改造 / GEO / 内容量产。
          </p>
          <div className="hero__actions">
            <Link href="/start-here" className="button button--primary">
              从这里开始
            </Link>
            <Link href="/standard" className="button button--ghost">
              智能体架构师标准
            </Link>
            <Link href="/services" className="button button--ghost">
              服务与产品
            </Link>
          </div>
        </section>

        {groupedColumns.map((column) => (
          <section key={column.id} id={column.id} className="section">
            <div className="section-heading">
              <p className="eyebrow">{column.purpose}</p>
              <h2>{column.name}</h2>
              <p className="doc-body">{column.intro}</p>
            </div>
            <div className="article-grid">
              {column.articles.slice(0, 12).map((article) => (
                <article key={article.slug} className="article-card">
                  <div className="article-card__meta">
                    <span>{article.date}</span>
                    <span>{article.category || article.tags[0] || "文章"}</span>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <div className="article-card__tags">
                    {article.tags.slice(0, 4).map((tag) => (
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
            {column.articles.length > 12 ? <p className="form-note">本栏目还有 {column.articles.length - 12} 篇文章，可在文章库继续阅读。</p> : null}
          </section>
        ))}
      </main>
    </>
  );
}
