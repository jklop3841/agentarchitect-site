import type { MetadataRoute } from "next";

import { articles } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
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

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route, siteConfig.domain).toString(),
      lastModified: new Date(route.includes("lineage-recursive-improvement") ? "2026-09-11" : "2026-05-02"),
    })),
    ...articles.map((article) => ({
      url: new URL(`/articles/${article.slug}`, siteConfig.domain).toString(),
      lastModified: new Date(article.updatedAt || article.date),
    })),
  ];
}
