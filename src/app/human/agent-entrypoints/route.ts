import { redirectToHumanSource } from "@/lib/human-archive";

export async function GET() {
  return redirectToHumanSource("AGENT_ENTRYPOINTS.md");
}
