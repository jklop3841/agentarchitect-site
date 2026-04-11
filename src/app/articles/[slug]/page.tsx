import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { articles, authorProfile } from "@/lib/content";

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
    image: article.coverImage,
    author: {
      "@type": "Person",
      name: authorProfile.name,
      jobTitle: authorProfile.title,
    },
  };

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
              <span>{article.date}</span>
              <span>{article.readTime}</span>
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
            <Link href="/apply" className="text-link">
              申请咨询 / 合作
            </Link>
          </aside>
          <article className="article-body">
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
