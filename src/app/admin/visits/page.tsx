import { unstable_noStore as noStore } from "next/cache";

import { SiteHeader } from "@/components/site-header";
import { getAgentStore } from "@/lib/agents/store";
import { NetworkError } from "@/lib/network/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Visits", robots: { index: false, follow: false } };

async function load() {
  const store = getAgentStore();
  if (!store) return { error: "SUPABASE_SERVICE_ROLE_KEY is not set on this deployment.", visits: [], counts: [] };
  try {
    const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const [visits, counts] = await Promise.all([store.listVisits(200), store.visitCounts(since)]);
    return { error: null, visits, counts };
  } catch (error) {
    return { error: error instanceof NetworkError ? `${error.code}: ${error.message}` : "Could not load visits.", visits: [], counts: [] };
  }
}

export default async function AdminVisitsPage() {
  noStore();
  const { error, visits, counts } = await load();

  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Admin</p>
          <h1>Agent visits</h1>
          <p className="subpage__lead">
            Sampled request log (known AI bots and agent endpoints: 100%; other traffic: VISIT_LOG_SAMPLE, default 20%). IPs are stored only as salted
            hashes. <a href="/admin/messages">Moderation →</a>
          </p>
          {error ? <p className="an-error">{error}</p> : null}
        </section>
        <section className="section">
          <h2>Last 7 days by bot</h2>
          <table>
            <thead>
              <tr>
                <th align="left">bot_name</th>
                <th align="right">visits</th>
              </tr>
            </thead>
            <tbody>
              {counts.map((row) => (
                <tr key={row.bot_name}>
                  <td>{row.bot_name}</td>
                  <td align="right">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="section">
          <h2>Last {visits.length} visits</h2>
          <table style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th align="left">ts (UTC)</th>
                <th align="left">method</th>
                <th align="left">path</th>
                <th align="left">bot</th>
                <th align="left">agent endpoint</th>
                <th align="left">referer</th>
                <th align="left">ip hash</th>
                <th align="left">user agent</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit, index) => (
                <tr key={`${visit.ts}-${index}`}>
                  <td>{visit.ts.slice(0, 19).replace("T", " ")}</td>
                  <td>{visit.method}</td>
                  <td>{visit.path}</td>
                  <td>{visit.bot_name ?? ""}</td>
                  <td>{visit.agent_endpoint ? "yes" : ""}</td>
                  <td>{visit.referer_host ?? ""}</td>
                  <td>{visit.ip_hash?.slice(0, 10) ?? ""}</td>
                  <td>{visit.user_agent ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
