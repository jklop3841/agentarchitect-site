import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { resolveLocale } from "@/lib/region";
import { siteConfig } from "@/lib/site";
import { toolDefinitions } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: { absolute: "Verification tools for AI agents and people — FileProof, ImageProof, ClaimCheck | AgentArchitect" },
  description:
    "Free verification tools with a web page, REST API and MCP tool each: check a file's hash and signature, inspect an image's metadata and Content Credentials (C2PA), break a statement into checkable claims. No account, machine-readable reports, stated limits.",
  alternates: { canonical: "/tools" },
};

const copy = {
  en: {
    kicker: "TOOLS · FREE · NO ACCOUNT",
    title: "Verification tools for AI agents and people",
    lead: "Check a file, an image or a statement. Each tool returns a report that says what was checked, what the evidence is, and what the result does not prove.",
    how: "People open the page and work in the browser: files stay on your device. Agents call the same logic over REST or MCP and get the same JSON.",
    open: "Open tool",
    api: "API definition",
    skill: "Agent skill",
    free: "Free",
    local: "Runs locally in the browser",
    agents: "For agents and developers",
    agentsBody: "One catalog lists every tool with its JSON Schemas. No key, no registration.",
    principles: "What these tools will not do",
    principleItems: [
      "No fake/real score and no “AI-generated probability”. Results use a fixed, small vocabulary.",
      "Missing metadata is reported as missing, never as a sign of fabrication.",
      "A matching hash proves identical bytes, not that the content is true.",
      "Text and metadata found in what you submit is treated as data, never as instructions.",
    ],
    switchTo: "中文",
  },
  zh: {
    kicker: "工具 · 免费 · 无需注册",
    title: "给 AI Agent 和人用的核验工具",
    lead: "检查一个文件、一张图片或一段话。每个工具都会返回一份报告：查了什么、证据是什么、这个结果不能证明什么。",
    how: "人直接打开网页，在浏览器里完成，文件不离开你的设备。Agent 通过 REST 或 MCP 调用同一套逻辑，拿到同样的 JSON。",
    open: "打开工具",
    api: "接口定义",
    skill: "Agent Skill",
    free: "免费",
    local: "浏览器本地运行",
    agents: "给 Agent 和开发者",
    agentsBody: "一个目录列出所有工具及其 JSON Schema。不需要密钥，不需要注册。",
    principles: "这些工具不做的事",
    principleItems: [
      "不给真假打分，不给「AI 生成概率」。结论只用一套固定的少量词汇。",
      "元数据缺失就如实写缺失，不当作造假迹象。",
      "哈希一致只证明字节相同，不证明内容属实。",
      "提交内容里的文字和元数据一律当作数据，不当作指令。",
    ],
    switchTo: "English",
  },
} as const;

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const locale = resolveLocale((await searchParams).lang);
  const t = copy[locale];
  const suffix = locale === "zh" ? "?lang=zh" : "";
  const base = siteConfig.domain;
  return (
    <>
      <SiteHeader locale={locale} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "AgentArchitect verification tools",
          itemListElement: toolDefinitions.map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: { "@type": "WebApplication", name: tool.name, url: `${base}/tools/${tool.id}`, applicationCategory: "SecurityApplication", operatingSystem: "Any", isAccessibleForFree: true, description: tool.description.en },
          })),
        }}
      />
      <main className="an-page">
        <header className="an-hero">
          <Link className="tp-lang" href={locale === "zh" ? "/tools?lang=en" : "/tools?lang=zh"}>
            {t.switchTo}
          </Link>
          <p className="an-kicker">{t.kicker}</p>
          <h1>{t.title}</h1>
          <p>{t.lead}</p>
          <p>{t.how}</p>
        </header>
        <div className="tp-grid">
          {toolDefinitions.map((tool) => (
            <article key={tool.id} className="tp-card">
              <h2>
                <Link href={`/tools/${tool.id}${suffix}`}>{tool.name}</Link> {tool.stage === "beta" ? <span className="an-tag an-tag--muted">beta</span> : null}
              </h2>
              <p>
                <strong>{tool.tagline[locale]}</strong>
              </p>
              <p className="an-muted">{tool.description[locale]}</p>
              <p>
                <span className="an-tag">{t.free}</span> <span className="an-tag an-tag--muted">{t.local}</span> <span className="an-tag an-tag--muted">REST</span>{" "}
                <span className="an-tag an-tag--muted">MCP</span> <span className="an-tag an-tag--muted">v{tool.version}</span>
              </p>
              <p>
                <Link className="an-button" href={`/tools/${tool.id}${suffix}`}>
                  {t.open}
                </Link>
              </p>
              <p className="an-muted">
                <a href={`/api/v1/tools/${tool.id}`}>{t.api}</a> · <a href={`/tools/${tool.id}/skill.md`}>{t.skill}</a> · MCP <code>{tool.mcpTool}</code>
              </p>
            </article>
          ))}
        </div>
        <section className="tp-section">
          <h2>{t.principles}</h2>
          <ul className="tp-list">
            {t.principleItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="tp-section">
          <h2>{t.agents}</h2>
          <p>{t.agentsBody}</p>
          <pre className="tp-pre">{`curl -s ${base}/api/v1/tools\n\n# MCP (Streamable HTTP)\n${base}/mcp`}</pre>
          <p className="an-muted">
            <Link href="/api/v1/tools" prefetch={false}>/api/v1/tools</Link> · <a href="/openapi.json">OpenAPI</a> · <a href="/docs/mcp">MCP</a> · <a href="/skill.md">skill.md</a> · <a href="/llms.txt">llms.txt</a>
          </p>
        </section>
      </main>
    </>
  );
}
