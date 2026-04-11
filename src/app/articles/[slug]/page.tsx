import type { Metadata } from "next";
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
    author: {
      "@type": "Person",
      name: authorProfile.name,
      jobTitle: authorProfile.title,
    },
  };

  return (
    <>
      <SiteHeader locale="en" />
      <Script id={`article-jsonld-${article.slug}`} type="application/ld+json">
        {JSON.stringify(articleJsonLd)}
      </Script>
      <main className="subpage article-page">
        <section className="subpage__hero">
          <p className="eyebrow">Essay</p>
          <h1>{article.titleEn}</h1>
          <p className="subpage__lead">{article.subtitleEn}</p>
          <div className="article-card__meta">
            <span>{article.date}</span>
            <span>{article.readTime}</span>
          </div>
        </section>

        <section className="section article-layout">
          <aside className="article-sidebar">
            <p className="eyebrow">Summary</p>
            <ul className="principle-list">
              {article.summaryEn.map((item) => (
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
              Request advisory access
            </Link>
          </aside>
          <article className="article-body">
            <p className="article-body__lead">{article.excerptEn}</p>
            <p className="article-body__note">Chinese original below</p>
            {article.sections.map((section) => (
              <section key={section.heading} className="article-body__section">
                <h2>{section.headingEn ?? section.heading}</h2>
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
