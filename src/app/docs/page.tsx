import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { docsSections } from "@/lib/site";

export const metadata: Metadata = {
  title: "Docs",
  description: "Quickstart and API docs for catalog, run, verify, and access-key onboarding.",
};

const catalogExample = `curl -X GET "$SITE/api/catalog"`;

const runExample = `curl -X POST "$SITE/v1/run" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $YOUR_KEY" \\
  -d '{
    "capabilityId": "signal.map",
    "input": {
      "brief": "Need an agent-friendly website for a private workflow runtime.",
      "channel": "website",
      "urgency": "medium"
    }
  }'`;

const verifyExample = `curl -X POST "$SITE/v1/verify" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $YOUR_KEY" \\
  -d '{
    "executionId": "exec_xxx",
    "verificationToken": "token_xxx"
  }'`;

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Docs</p>
          <h1>Quickstart for humans and agents</h1>
          <p className="subpage__lead">
            文档只保留最短接入链路：发现、鉴权、执行、验证。匿名访客可以读取公开入口，真实执行需要访问 Key。
          </p>
        </section>

        <section className="section">
        <div className="docs-index">
          {docsSections.map((section) => (
            <span key={section} className="chip">
              {section}
            </span>
          ))}
        </div>
        </section>

        <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Authentication</p>
          <h2>公共文档可匿名读取，执行能力必须携带 `x-api-key`。</h2>
        </div>
        <p className="doc-body">
          访问 Key 当前通过 `/apply` 申请并人工审核发放。第一版不开放匿名试调用，目的是控制成本并筛选真实需求。
        </p>
        </section>

        <section className="section">
        <div className="section-heading">
          <p className="eyebrow">GET /api/catalog</p>
          <h2>读取公开能力目录</h2>
        </div>
        <pre className="code-block">
          <code>{catalogExample}</code>
        </pre>
        </section>

        <section className="section">
        <div className="section-heading">
          <p className="eyebrow">POST /v1/run</p>
          <h2>运行一个已公开的私有能力</h2>
        </div>
        <pre className="code-block">
          <code>{runExample}</code>
        </pre>
        </section>

        <section className="section">
        <div className="section-heading">
          <p className="eyebrow">POST /v1/verify</p>
          <h2>验证返回结果是否来自官方执行</h2>
        </div>
        <pre className="code-block">
          <code>{verifyExample}</code>
        </pre>
        </section>

        <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Skill Glue CLI</p>
          <h2>除了远程执行入口，这个站也开始分发可下载的低 token 组合工具。</h2>
        </div>
        <div className="detail-grid">
          <div>
            <h3>Product</h3>
            <p>先理解为什么 giant skill 越来越不经济，再看 Skill Glue 的产品定位。</p>
            <Link href="/products/skill-glue" className="text-link">
              打开 Skill Glue 产品页
            </Link>
          </div>
          <div>
            <h3>Docs</h3>
            <p>查看命令、manifest 结构和三组可直接运行的示例。</p>
            <Link href="/docs/skill-glue" className="text-link">
              打开 Skill Glue 文档
            </Link>
          </div>
          <div>
            <h3>Download</h3>
            <p>通过 GitHub 仓库和下载页获取 CLI 与 manifest 示例。</p>
            <Link href="/download/skill-glue" className="text-link">
              打开下载入口
            </Link>
          </div>
        </div>
        </section>

        <section className="section">
        <div className="detail-grid">
          <div>
            <h3>Errors</h3>
            <ul>
              <li>`401` missing or invalid API key</li>
              <li>`404` unknown capability or execution id</li>
              <li>`422` invalid input payload</li>
            </ul>
          </div>
          <div>
            <h3>Limits</h3>
            <ul>
              <li>Public pages and discovery files are optimized for static reads.</li>
              <li>Execution endpoints are rate-limited by key and intended for seed usage.</li>
              <li>Do not treat v1 as a bulk processing API.</li>
            </ul>
          </div>
        </div>
        </section>
      </main>
    </>
  );
}
