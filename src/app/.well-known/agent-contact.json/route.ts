import { NextResponse } from "next/server";

import { agentContactManifest } from "@/lib/agent-discovery";

export function GET() {
  return NextResponse.json(agentContactManifest, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
