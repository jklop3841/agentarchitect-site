import { NextResponse } from "next/server";

import { agentDiscoveryProfile } from "@/lib/agent-discovery";

export const revalidate = 3600;

export function GET() {
  return NextResponse.json(agentDiscoveryProfile, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
