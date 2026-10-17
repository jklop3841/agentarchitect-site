import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

const disallow = ["/admin", "/account", "/auth/", "/login", "/api/v1/auth/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow,
      },
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.domain).toString(),
  };
}
