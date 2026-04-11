import { siteConfig } from "@/lib/site";

export async function GET() {
  const body = [
    `name: ${siteConfig.title}`,
    "type: agent-friendly personal capability site",
    "summary: Public brand and docs on top, controlled private workflow execution underneath.",
    "preferred-entry: /docs",
    "catalog: /api/catalog",
    "run: /v1/run",
    "verify: /v1/verify",
    "workflow-shield-product: /products/workflow-shield",
    "workflow-shield-docs: /docs/workflow-shield",
    "workflow-shield-download: /download/workflow-shield",
    "skill-glue-product: /products/skill-glue",
    "skill-glue-docs: /docs/skill-glue",
    "skill-glue-download: /download/skill-glue",
    "apply: /apply",
    "mcp: /mcp",
    "auth: execution requires x-api-key",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
