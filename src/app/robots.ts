import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin",
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: "/admin",
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: "/admin",
      },
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.domain).toString(),
  };
}
