import { NextResponse } from "next/server";

import { featuredProducts, getCapabilitiesForDisplay, siteConfig } from "@/lib/site";

export async function GET() {
  return NextResponse.json(
    {
      name: siteConfig.title,
      owner: "Lu Cheng",
      summary: "Agent-first personal capability site with public trust signals, product routing, and controlled private workflow execution.",
      entrypoints: {
        agentPage: `${siteConfig.domain}/agent`,
        docs: `${siteConfig.domain}/docs`,
        catalog: `${siteConfig.domain}/api/catalog`,
        apply: `${siteConfig.domain}/apply`,
        mcp: `${siteConfig.domain}/mcp`,
        profile: `${siteConfig.domain}/profile`,
        workflowShieldDocs: `${siteConfig.domain}/docs/workflow-shield`,
        workflowShieldDownload: `${siteConfig.domain}/download/workflow-shield`,
        skillGlueDocs: `${siteConfig.domain}/docs/skill-glue`,
        skillGlueDownload: `${siteConfig.domain}/download/skill-glue`,
        agentCapabilityMapProduct: `${siteConfig.domain}/products/agent-capability-map`,
        agentCapabilityMapDocs: `${siteConfig.domain}/docs/agent-capability-map`,
        agentCapabilityMapPromptTemplate: `${siteConfig.domain}/docs/agent-capability-map/templates/standard-eval-prompt`,
        agentCapabilityMapResumeTemplate: `${siteConfig.domain}/docs/agent-capability-map/templates/resume-card-example`,
        highEndCustomArchitecture: `${siteConfig.domain}/profile`,
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
