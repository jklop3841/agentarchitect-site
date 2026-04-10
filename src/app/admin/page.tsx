import { unstable_noStore as noStore } from "next/cache";

import { SiteHeader } from "@/components/site-header";
import { listAccessRequests, listApiKeys, listExecutionLogs } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  noStore();

  const [accessRequests, apiKeys, executionLogs] = await Promise.all([
    listAccessRequests(),
    listApiKeys(),
    listExecutionLogs(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Admin</p>
          <h1>Seed operations dashboard</h1>
          <p className="subpage__lead">
            极简运营视图：申请、Key 与执行记录。生产环境建议通过 Basic Auth 或 Vercel 访问保护进行保护。
          </p>
        </section>

        <section className="section">
        <div className="detail-grid">
          <div>
            <h3>Access requests ({accessRequests.length})</h3>
            <ul>
              {accessRequests.map((request) => (
                <li key={request.id}>
                  {request.name} · {request.email} · {request.status}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>API keys ({apiKeys.length})</h3>
            <ul>
              {apiKeys.map((key) => (
                <li key={key.id}>
                  {key.label} · {key.status} · quota {key.monthlyQuota}
                </li>
              ))}
            </ul>
          </div>
        </div>
        </section>

        <section className="section">
          <h2>Execution logs ({executionLogs.length})</h2>
          <ul className="admin-log-list">
            {executionLogs.map((log) => (
              <li key={log.id}>
                <strong>{log.executionId}</strong> · {log.capabilityId} · {log.estimatedCost} · {log.inputSummary}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
