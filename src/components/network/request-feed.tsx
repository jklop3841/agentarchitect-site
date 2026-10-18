import Link from "next/link";

import { excerpt, formatBudget, publisherLabel, timeAgo, typeLabel } from "@/lib/network/present";
import { feedTabs, type FeedFilters, type FeedResult, type PublicRequest } from "@/lib/network/types";

function tabKey(filters: FeedFilters) {
  return feedTabs.find((tab) => tab.type === filters.type)?.key ?? "all";
}

function hrefWith(basePath: string, filters: FeedFilters, patch: Record<string, string | null>) {
  const params = new URLSearchParams();
  const current: Record<string, string | null> = {
    tab: tabKey(filters) === "all" ? null : tabKey(filters),
    mode: filters.mode,
    location: filters.location,
    q: filters.q,
  };
  for (const [key, value] of Object.entries({ ...current, ...patch })) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function RequestRow({ request }: { request: PublicRequest }) {
  const budget = formatBudget(request);
  return (
    <li className={`an-item${request.is_example ? " an-item--example" : ""}`}>
      <div className="an-item__head">
        <span className="an-tag">{typeLabel(request.request_type)}</span>
        {request.is_example ? <span className="an-tag an-tag--example">Example request</span> : null}
        {request.source === "agent" ? <span className="an-tag an-tag--example">Unverified · AI agent</span> : null}
        {request.status !== "active" ? <span className="an-tag an-tag--muted">{request.status}</span> : null}
        <Link href={`/requests/${request.id}`} className="an-item__title">
          {request.title}
        </Link>
      </div>
      <p className="an-item__desc">{excerpt(request.description)}</p>
      <p className="an-item__meta">
        <span>{request.location}</span>
        <span>{request.work_mode}</span>
        <span>{publisherLabel(request)}</span>
        {budget ? <span>{budget}</span> : null}
        <time dateTime={request.created_at}>{timeAgo(request.created_at)}</time>
        {request.unlock_count > 0 ? <span>{request.unlock_count} contact unlocks</span> : null}
      </p>
    </li>
  );
}

export function RequestFeed({ result, filters, basePath }: { result: FeedResult; filters: FeedFilters; basePath: string }) {
  const active = tabKey(filters);
  return (
    <section className="an-feed" aria-labelledby="latest-requests">
      <nav className="an-tabs" aria-label="Request type">
        {feedTabs.map((tab) => (
          <Link key={tab.key} href={hrefWith(basePath, filters, { tab: tab.key === "all" ? null : tab.key })} className={tab.key === active ? "is-active" : undefined}>
            {tab.label}
          </Link>
        ))}
        <span className="an-tabs__sep" />
        <Link href={hrefWith(basePath, filters, { mode: null })} className={!filters.mode ? "is-active" : undefined}>
          Any
        </Link>
        <Link href={hrefWith(basePath, filters, { mode: "remote" })} className={filters.mode === "remote" ? "is-active" : undefined}>
          Remote
        </Link>
        <Link href={hrefWith(basePath, filters, { mode: "physical" })} className={filters.mode === "physical" ? "is-active" : undefined}>
          Physical
        </Link>
      </nav>
      <form className="an-search" action={basePath} method="get" role="search">
        {active !== "all" ? <input type="hidden" name="tab" value={active} /> : null}
        {filters.mode ? <input type="hidden" name="mode" value={filters.mode} /> : null}
        <input name="q" defaultValue={filters.q ?? ""} placeholder="keyword" maxLength={120} aria-label="Keyword" />
        <input name="location" defaultValue={filters.location ?? ""} placeholder="location (Tokyo, Remote…)" maxLength={80} aria-label="Location" />
        <button type="submit">Search</button>
      </form>

      <h2 id="latest-requests" className="an-heading">
        Latest requests <small>newest first</small>
      </h2>
      {result.source === "fallback" ? (
        <p className="an-notice">The live request database is not connected yet — showing example requests only. Posting opens once it is.</p>
      ) : null}
      {result.requests.length === 0 ? (
        <p className="an-muted">No matching requests. <Link href={basePath}>Clear filters</Link> or <Link href="/post">post one</Link>.</p>
      ) : (
        <ol className="an-list">
          {result.requests.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </ol>
      )}
      {result.requests.length >= filters.limit ? (
        <p>
          <Link href={hrefWith(basePath, filters, { offset: String(filters.offset + filters.limit) })}>More →</Link>
        </p>
      ) : null}
    </section>
  );
}
