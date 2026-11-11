import { getToolDefinition, toolDefinitions } from "@/lib/tools/registry";
import { buildToolSkill } from "@/lib/tools/skill";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return toolDefinitions.map((tool) => ({ tool: tool.id }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ tool: string }> }) {
  const { tool: toolId } = await params;
  const tool = getToolDefinition(toolId);
  if (!tool) return new Response("Unknown tool.\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(buildToolSkill(tool, siteConfig.domain), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
