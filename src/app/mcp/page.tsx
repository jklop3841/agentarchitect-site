import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "MCP",
  description: "Model Context Protocol entry notes for the private workflow runtime.",
};

export default function McpPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">MCP</p>
          <h1>Model Context Protocol entry</h1>
          <p className="subpage__lead">
            v1 先提供清晰的目录与 HTTP 接口，MCP 入口保留为稳定发现层说明页。后续可在此挂接远程 MCP 服务。
          </p>
        </section>

        <section className="section">
        <div className="detail-grid">
          <div>
            <h3>Current state</h3>
            <ul>
              <li>`catalog` 已公开可读</li>
              <li>`run` 与 `verify` 通过 HTTP 承载</li>
              <li>MCP server 可作为下一阶段接入层补充</li>
            </ul>
          </div>
          <div>
            <h3>Why this is enough for v1</h3>
            <ul>
              <li>先把价值、契约和访问控制做稳</li>
              <li>避免过早引入更多协议运维面</li>
              <li>保留协议扩展空间，不阻塞种子用户验证</li>
            </ul>
          </div>
        </div>
        </section>
      </main>
    </>
  );
}
