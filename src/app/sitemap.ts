import type { MetadataRoute } from "next";

import { articles } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/zh",
    "/agent-architect",
    "/about",
    "/enterprise-ai-diagnosis",
    "/cases",
    "/articles",
    "/templates",
    "/faq",
    "/agent",
    "/contact",
    "/profile",
    "/openapi.json",
    "/agents.txt",
    "/llms.txt",
    "/schema.json",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route, siteConfig.domain).toString(),
      lastModified: new Date("2026-05-02"),
    })),
    ...articles.map((article) => ({
      url: new URL(`/articles/${article.slug}`, siteConfig.domain).toString(),
      lastModified: new Date(article.updatedAt || article.date),
    })),
  ];
}
