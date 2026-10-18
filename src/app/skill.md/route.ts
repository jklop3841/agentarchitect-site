import { buildSkillMarkdown } from "@/lib/agents/skill-md";

export function GET() {
  return new Response(buildSkillMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
