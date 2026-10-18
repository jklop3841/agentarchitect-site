import type { MetadataRoute } from "next";

import { articles } from "@/lib/content";
import { listRequests } from "@/lib/network/db";
import { siteConfig } from "@/lib/site";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/requests",
    "/post",
    "/realityport",
    "/network",
    "/a2a",
    "/.well-known/agent-card.json",
    "/.well-known/agent-contact.json",
    "/.well-known/agent.json",
    "/llms-full.txt",
    "/zh",
    "/start-here",
    "/standard",
    "/content-map",
    "/services",
    "/agent-architect",
    "/about",
    "/proof",
    "/boundaries",
    "/ai-search-check",
    "/enterprise-ai-diagnosis",
    "/cases",
    "/articles",
    "/templates",
    "/faq",
    "/agent",
    "/lineage-recursive-improvement",
    "/lineage-recursive-improvement/benchmark-v0-1",
    "/lineage-recursive-improvement/model-run-001",
    "/.well-known/lineage-recursive-improvement.json",
    "/contact",
    "/profile",
    "/openapi.json",
    "/agents.txt",
    "/llms.txt",
    "/schema.json",
    "/brand-entity.json",
  ];

  const networkRoutes = new Set(["", "/requests", "/post", "/realityport", "/network", "/a2a"]);
  let requestEntries: MetadataRoute.Sitemap = [];
  try {
    const feed = await listRequests({ type: null, mode: null, location: null, q: null, includeInactive: false, limit: 100, offset: 0 });
    requestEntries = feed.requests
      .filter((request) => !request.is_example)
      .map((request) => ({
        url: new URL(`/requests/${request.id}`, siteConfig.domain).toString(),
        lastModified: new Date(request.updated_at),
      }));
  } catch {
    requestEntries = [];
  }

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route, siteConfig.domain).toString(),
      lastModified: new Date(
        networkRoutes.has(route) || route.includes("agent-card") || route.includes("agent-contact")
          ? "2026-10-17"
          : route.includes("lineage-recursive-improvement")
            ? "2026-09-11"
            : "2026-05-02",
      ),
    })),
    ...requestEntries,
    ...articles.map((article) => ({
      url: new URL(`/articles/${article.slug}`, siteConfig.domain).toString(),
      lastModified: new Date(article.updatedAt || article.date),
    })),
  ];
}
