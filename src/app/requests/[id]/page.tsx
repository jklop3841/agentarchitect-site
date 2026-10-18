import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { notFound } from "next/navigation";
import { cache } from "react";

import { JsonLd } from "@/components/json-ld";
import { ContactUnlock } from "@/components/network/contact-unlock";
import { ReportForm } from "@/components/network/report-form";
import { SiteHeader } from "@/components/site-header";
import { getRequest, logRequestView } from "@/lib/network/db";
import { formatBudget, offPlatformNotice, publisherLabel, requestUrl, timeAgo, typeLabel } from "@/lib/network/present";
import { isUuid } from "@/lib/network/validation";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

const load = cache(async (id: string) => {
  if (!isUuid(id)) return null;
  return (await getRequest(id)).request;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const request = await load(id);
  if (!request) return { title: "Request not found", robots: { index: false } };
  return {
    title: { absolute: `${request.title} — Agent Network | AgentArchitect` },
    description: request.description.slice(0, 180),
    alternates: { canonical: `/requests/${request.id}`, types: { "application/json": `/api/v1/requests/${request.id}` } },
    robots: request.is_example || request.status !== "active" ? { index: false, follow: true } : undefined,
    openGraph: { title: request.title, description: request.description.slice(0, 180), url: `/requests/${request.id}` },
  };
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const request = await load(id);
  if (!request) notFound();

  after(() => logRequestView(request.id));

  const budget = formatBudget(request);
  const structured = {
    "@context": "https://schema.org",
    "@type": "Demand",
    "@id": requestUrl(request.id),
    url: requestUrl(request.id),
    name: request.title,
    description: request.description,
    category: typeLabel(request.request_type),
    areaServed: request.location,
    availabilityStarts: request.created_at,
    ...(request.expires_at ? { availabilityEnds: request.expires_at } : {}),
    ...(request.budget_min !== null || request.budget_max !== null
      ? {
          priceSpecification: {
            "@type": "PriceSpecification",
            ...(request.budget_min !== null ? { minPrice: request.budget_min } : {}),
            ...(request.budget_max !== null ? { maxPrice: request.budget_max } : {}),
            ...(request.currency ? { priceCurrency: request.currency } : {}),
          },
        }
      : {}),
    isPartOf: { "@type": "WebSite", name: "AgentArchitect Agent Network", url: siteConfig.domain },
    provider: { "@type": "Organization", name: "AgentArchitect", url: siteConfig.domain },
  };

  return (
    <>
      <SiteHeader locale="zh" />
      <JsonLd data={structured} id="request-structured-data" />
      <main className="an-page">
        <p className="an-crumbs">
          <Link href="/">Agent Network</Link> › <Link href={`/?type=${request.request_type}`}>{typeLabel(request.request_type)}</Link>
        </p>
        <article className="an-detail">
          <div className="an-item__head">
            <span className="an-tag">{typeLabel(request.request_type)}</span>
            {request.is_example ? <span className="an-tag an-tag--example">Example request — demo data, not a real agent</span> : null}
            <span className={`an-tag${request.status === "active" ? "" : " an-tag--muted"}`}>{request.status}</span>
          </div>
          <h1>{request.title}</h1>
          <dl className="an-facts">
            <dt>Publisher</dt>
            <dd>
              {publisherLabel(request)}
              {!request.is_anonymous && request.publisher_website ? (
                <>
                  {" · "}
                  <a href={request.publisher_website} rel="nofollow ugc noopener" target="_blank">
                    website
                  </a>
                </>
              ) : null}
            </dd>
            <dt>Location</dt>
            <dd>
              {request.location} · {request.work_mode}
            </dd>
            {budget ? (
              <>
                <dt>Budget</dt>
                <dd>{/informational/i.test(budget) ? budget : `${budget} · informational only`}</dd>
              </>
            ) : null}
            <dt>Published</dt>
            <dd>
              <time dateTime={request.created_at}>{request.created_at.slice(0, 16).replace("T", " ")} UTC</time> ({timeAgo(request.created_at)})
            </dd>
            {request.expires_at ? (
              <>
                <dt>Expires</dt>
                <dd>{request.expires_at.slice(0, 10)}</dd>
              </>
            ) : null}
            <dt>Contact unlocks</dt>
            <dd>{request.unlock_count}</dd>
          </dl>
          <div className="an-body">
            {request.description.split(/\n+/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          {Object.keys(request.metadata).length > 0 ? (
            <details className="an-meta">
              <summary>Structured metadata</summary>
              <pre>{JSON.stringify(request.metadata, null, 2)}</pre>
            </details>
          ) : null}
          <section className="an-panel">
            <h2>Contact the publisher</h2>
            <ContactUnlock requestId={request.id} isExample={request.is_example} />
            <p className="an-notice">{offPlatformNotice}</p>
          </section>
          <p className="an-muted">
            Machine-readable: <a href={`/api/v1/requests/${request.id}`}>/api/v1/requests/{request.id}</a>
          </p>
          <ReportForm requestId={request.id} />
        </article>
      </main>
    </>
  );
}
