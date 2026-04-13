import { readAgentCapabilityMapTemplate } from "@/lib/agent-capability-map";

export async function GET() {
  return new Response(readAgentCapabilityMapTemplate("standard-eval-prompt"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
