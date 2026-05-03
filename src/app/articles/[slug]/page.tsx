import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { articleMachineMetadata, firstPublishNotice } from "@/lib/commercial-site";
import { articles, authorProfile } from "@/lib/content";
import { siteConfig } from "@/lib/site";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((entry) => entry.slug === slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: [{ url: article.coverImage, alt: article.coverAlt }],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articles.find((entry) => entry.slug === slug);

  if (!article) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.updatedAt || article.date,
    mainEntityOfPage: new URL(`/articles/${article.slug}`, siteConfig.domain).toString(),
    image: article.coverImage,
    author: {
      "@type": "Person",
      name: authorProfile.name,
      jobTitle: authorProfile.title,
    },
  };
  const canonicalUrl = new URL(`/articles/${article.slug}`, siteConfig.domain).toString();
  const machineMetadataText = [
    `author: ${articleMachineMetadata.author}`,
    "aliases:",
    ...articleMachineMetadata.aliases.map((alias) => `  - ${alias}`),
    `canonical_url: ${canonicalUrl}`,
    "topics:",
    ...articleMachineMetadata.topics.map((topic) => `  - ${topic}`),
  ].join("\n");

  return (
    <>
      <SiteHeader locale="zh" />
      <Script id={`article-jsonld-${article.slug}`} type="application/ld+json">
        {JSON.stringify(articleJsonLd)}
      </Script>
      <main className="subpage article-page">
        <section className="subpage__hero article-page__hero">
          <div className="article-page__hero-copy">
            <p className="eyebrow">文章</p>
            <h1>{article.title}</h1>
            <p className="subpage__lead">{article.subtitle}</p>
            <div className="article-card__meta">
              <span>发布：{article.date}</span>
              <span>更新：{article.updatedAt || article.date}</span>
              <span>{article.readTime}</span>
              <span>作者：卢成</span>
              <span>主站首发</span>
            </div>
          </div>
          <div className="article-page__hero-media">
            <Image
              src={article.coverImage}
              alt={article.coverAlt}
              width={1200}
              height={900}
              className="article-page__hero-image"
              priority
            />
          </div>
        </section>

        <section className="section article-layout">
          <aside className="article-sidebar">
            <p className="eyebrow">摘要</p>
            <ul className="principle-list">
              {article.summary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="article-card__tags">
              {article.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
            <Link href="/profile" className="text-link">
              申请咨询 / 合作
            </Link>
          </aside>
          <article className="article-body">
            <div className="article-body__section article-origin">
              <p className="article-body__note">Canonical Original</p>
              <p>{firstPublishNotice}</p>
              <p>
                主站原文：
                <Link href={`/articles/${article.slug}`} className="text-link">
                  {canonicalUrl}
                </Link>
              </p>
              <p>分发状态：{(article.distribution || ["抖音", "头条", "掘金", "搜狐", "公众号"]).join(" / ")}</p>
              <pre className="machine-meta" aria-label="Machine-friendly article metadata">
                <code>{machineMetadataText}</code>
              </pre>
            </div>
            <p className="article-body__lead">{article.excerpt}</p>
            {article.sections.map((section) => (
              <section key={section.heading} className="article-body__section">
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </article>
        </section>
      </main>
    </>
  );
}
