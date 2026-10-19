import { buildSkillMarkdown } from "@/lib/agents/skill-md";
import { humanRawUrl } from "@/lib/human-archive";
import { buildLlmsText } from "@/lib/llms-text";

// llms.txt + the full agent guide (/skill.md) in one plain-text file. The long-form
// Human Archive corpus is linked rather than inlined.
export async function GET() {
  const body = [
    buildLlmsText(),
    "",
    "---",
    "",
    buildSkillMarkdown(),
    "",
    "---",
    "",
    `Human Archive full text (long-form corpus): ${humanRawUrl("llms-full.txt")}`,
  ].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
