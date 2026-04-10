import { NextResponse } from "next/server";

import { listCapabilities } from "@/lib/capabilities";
import { siteConfig } from "@/lib/site";

export async function GET() {
  const paths = {
    "/api/catalog": {
      get: {
        summary: "Read the public capability catalog",
      },
    },
    "/v1/run": {
      post: {
        summary: "Execute one private capability",
        security: [{ apiKeyHeader: [] }],
      },
    },
    "/v1/verify": {
      post: {
        summary: "Verify a signed execution result",
        security: [{ apiKeyHeader: [] }],
      },
    },
  };

  return NextResponse.json(
    {
      openapi: "3.1.0",
      info: {
        title: `${siteConfig.title} API`,
        version: "0.1.0",
        description: "Minimal API surface for the agent-friendly personal capability site.",
      },
      servers: [{ url: siteConfig.domain }],
      paths,
      components: {
        securitySchemes: {
          apiKeyHeader: {
            type: "apiKey",
            in: "header",
            name: "x-api-key",
          },
        },
        examples: {
          capabilities: listCapabilities(),
        },
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
