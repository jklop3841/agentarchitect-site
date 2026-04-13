import { NextResponse } from "next/server";

import { listCapabilities } from "@/lib/capabilities";
import { featuredProducts, siteConfig } from "@/lib/site";

export async function GET() {
  const downloadableProducts = featuredProducts.filter((product) => product.delivery === "download");

  return NextResponse.json(
    {
      site: siteConfig.title,
      summary: "Public capability catalog for an agent-friendly personal capability site.",
      auth: {
        publicRead: true,
        execution: "x-api-key required",
      },
      capabilities: listCapabilities(),
      products: featuredProducts,
      downloadable_products: downloadableProducts,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
