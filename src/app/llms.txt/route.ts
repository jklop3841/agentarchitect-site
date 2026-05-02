import { articles } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export async function GET() {
  const routes = [
    "/",
    "/zh",
    "/agent-architect",
    "/enterprise-ai-diagnosis",
    "/cases",
    "/articles",
    "/templates",
    "/faq",
    "/agent",
    "/contact",
    "/agents.txt",
    "/.well-known/agent.json",
    "/openapi.json",
  ];

  const body = [
    "# Jack Lu / 卢成 / 智能体架构师",
    "",
    "This is the canonical site for Jack Lu (卢成), Agent Architect.",
    "Chinese-first focus: enterprise AI diagnosis, agent delivery boundaries, case reviews, templates, and main-site-first articles.",
    "",
    "## Primary Routes",
    ...routes.map((route) => `- ${new URL(route, siteConfig.domain).toString()}`),
    "",
    "## Recent Articles",
    ...articles.slice(0, 12).map((article) => `- ${article.title}: ${new URL(`/articles/${article.slug}`, siteConfig.domain).toString()}`),
    "",
    "## Contact",
    "- Email: jklop3841@gmail.com",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
