import { unstable_noStore as noStore } from "next/cache";

import { SiteHeader } from "@/components/site-header";
import { loadUsageSummary } from "@/lib/tools/usage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tool usage", robots: { index: false, follow: false } };

export default async function AdminToolUsagePage() {
  noStore();
  const { error, rows, total, sampled, external } = await loadUsageSummary(7);

  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Admin</p>
          <h1>Tool usage, last 7 days</h1>
          <p className="subpage__lead">
            One row per tool invocation (REST and MCP <code>tools/call</code>). Reading discovery files or listing MCP tools is not counted. Inspected content is never stored.{" "}
            <a href="/admin/visits">Visits →</a>
          </p>
          {error ? <p className="an-error">{error}</p> : null}
        </section>
        <section className="section">
          <h2>External agents</h2>
          <p>
            <strong>{external.okCalls}</strong> successful calls from <strong>{external.distinctCallers}</strong> distinct callers.
          </p>
          <p className="an-muted">
            &ldquo;External agent&rdquo; means: not a browser, not a known crawler or directory scanner, and not marked as an internal test. It is an upper bound: a person using curl counts too.
            Send header <code>x-aa-internal-test</code> with the configured token on your own test calls to keep them out of this number.
          </p>
        </section>
        <section className="section">
          <h2>
            All calls ({total}
            {sampled ? "+, newest only" : ""})
          </h2>
          <table className="an-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Caller class</th>
                <th>Status</th>
                <th>Calls</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4}>No calls recorded.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.tool}-${row.client_class}-${row.status}`}>
                    <td>{row.tool}</td>
                    <td>{row.client_class}</td>
                    <td>{row.status}</td>
                    <td>{row.calls}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
