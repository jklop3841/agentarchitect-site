import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { ClaimCheckTool } from "@/components/tools/claimcheck-tool";
import { FileProofTool } from "@/components/tools/fileproof-tool";
import { ImageProofTool } from "@/components/tools/imageproof-tool";
import { resolveLocale } from "@/lib/region";
import { siteConfig } from "@/lib/site";
import { toolLimits, toolQuotas } from "@/lib/tools/config";
import { getToolDefinition } from "@/lib/tools/registry";
import { curlExample, mcpExample } from "@/lib/tools/skill";

type Props = { params: Promise<{ tool: string }>; searchParams: Promise<{ lang?: string | string[] }> };

const titles: Record<string, string> = {
  fileproof: "FileProof — check a file's SHA-256, compare files, verify a signature (free, in your browser)",
  imageproof: "ImageProof — image EXIF and Content Credentials (C2PA) checker with honest verdicts",
  claimcheck: "ClaimCheck — split a statement into checkable claims and compare with evidence",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getToolDefinition((await params).tool);
  if (!tool) return {};
  return { title: { absolute: `${titles[tool.id]} | AgentArchitect` }, description: tool.description.en, alternates: { canonical: `/tools/${tool.id}` } };
}

const copy = {
  en: { all: "Tools", use: "Use it when", avoid: "Do not use it to", limits: "Limits", agents: "Call it from an agent", rest: "REST", mcp: "MCP tools/call", free: "Free, no account, no API key.", quota: (calls: number, urls: number, bytes: number) => `${calls} calls per hour per caller, ${urls} URL fetches per hour, inline files up to ${(bytes / 1e6).toFixed(0)} MB.`, schema: "Definition and JSON Schemas", skill: "Agent skill (Markdown)", switchTo: "中文", beta: "Beta: rule-based. It compares wording and numbers and does not understand meaning." },
  zh: { all: "工具", use: "适合用在", avoid: "不要用它来", limits: "局限", agents: "从 Agent 调用", rest: "REST", mcp: "MCP tools/call", free: "免费，无需注册，无需密钥。", quota: (calls: number, urls: number, bytes: number) => `每个调用方每小时 ${calls} 次调用、${urls} 次 URL 抓取，内联文件最大 ${(bytes / 1e6).toFixed(0)} MB。`, schema: "接口定义与 JSON Schema", skill: "Agent Skill（Markdown）", switchTo: "English", beta: "Beta：基于规则，只比对措辞和数字，不理解语义。" },
} as const;

export default async function ToolPage({ params, searchParams }: Props) {
  const tool = getToolDefinition((await params).tool);
  if (!tool) notFound();
  const locale = resolveLocale((await searchParams).lang);
  const t = copy[locale];
  const base = siteConfig.domain;
  return (
    <>
      <SiteHeader locale={locale} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: tool.name,
          url: `${base}/tools/${tool.id}`,
          applicationCategory: "SecurityApplication",
          operatingSystem: "Any",
          isAccessibleForFree: true,
          softwareVersion: tool.version,
          description: tool.description.en,
          provider: { "@type": "Organization", name: "AgentArchitect", url: base },
        }}
      />
      <main className="an-page an-page--narrow">
        <p className="an-crumbs">
          <Link href={locale === "zh" ? "/tools?lang=zh" : "/tools"}>{t.all}</Link> › {tool.name}
          <Link className="tp-lang" href={`/tools/${tool.id}?lang=${locale === "zh" ? "en" : "zh"}`}>
            {t.switchTo}
          </Link>
        </p>
        <header className="an-hero">
          <h1>
            {tool.name} {tool.stage === "beta" ? <span className="an-tag an-tag--muted">beta</span> : null}
          </h1>
          <p>
            <strong>{tool.tagline[locale]}</strong>
          </p>
          <p>{tool.description[locale]}</p>
          {tool.stage === "beta" ? <p className="an-muted">{t.beta}</p> : null}
        </header>

        {tool.id === "fileproof" ? <FileProofTool locale={locale} /> : tool.id === "imageproof" ? <ImageProofTool locale={locale} /> : <ClaimCheckTool locale={locale} />}

        <section className="tp-section">
          <h2>{t.use}</h2>
          <ul className="tp-list">
            {tool.when_to_use.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2>{t.avoid}</h2>
          <ul className="tp-list">
            {tool.when_not_to_use.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2>{t.limits}</h2>
          <ul className="tp-list">
            {tool.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="tp-section">
          <h2>{t.agents}</h2>
          <p>
            {t.free} {t.quota(toolQuotas.computePerIpPerHour, toolQuotas.remotePerIpPerHour, toolLimits.maxInlineFileBytes)}
          </p>
          <h3>{t.rest}</h3>
          <pre className="tp-pre">{curlExample(tool, base)}</pre>
          <h3>
            {t.mcp} · <code>{base}/mcp</code>
          </h3>
          <pre className="tp-pre">{mcpExample(tool)}</pre>
          <p className="an-muted">
            <a href={`/api/v1/tools/${tool.id}`}>{t.schema}</a> · <a href={`/tools/${tool.id}/skill.md`}>{t.skill}</a> · <a href="/openapi.json">OpenAPI</a>
          </p>
        </section>
      </main>
    </>
  );
}
