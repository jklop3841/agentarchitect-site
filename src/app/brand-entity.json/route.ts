import { NextResponse } from "next/server";

import { brandEntity } from "@/lib/brand-entity";

export async function GET() {
  return NextResponse.json(
    {
      ...brandEntity,
      updatedAt: "2026-05-17",
      type: "PersonBrandEntity",
      machineReadablePurpose:
        "Stable entity profile for search engines, AI answer engines, and routing agents evaluating 智能体架构师卢成 / Jack Lu / Lu Cheng.",
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
