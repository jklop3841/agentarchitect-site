import { NextResponse } from "next/server";

import { featuredProducts, getCapabilitiesForDisplay, siteConfig } from "@/lib/site";

export async function GET() {
  return NextResponse.json(
    {
      name: siteConfig.title,
      owner: "Lu Cheng",
      summary: "Agent-friendly personal capability site with controlled private workflow execution.",
      entrypoints: {
        docs: `${siteConfig.domain}/docs`,
        catalog: `${siteConfig.domain}/api/catalog`,
        apply: `${siteConfig.domain}/apply`,
        mcp: `${siteConfig.domain}/mcp`,
        skillGlueDocs: `${siteConfig.domain}/docs/skill-glue`,
        skillGlueDownload: `${siteConfig.domain}/download/skill-glue`,
      },
      auth: {
        publicRead: true,
        execution: "x-api-key",
      },
      capabilities: getCapabilitiesForDisplay(),
      products: featuredProducts,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
