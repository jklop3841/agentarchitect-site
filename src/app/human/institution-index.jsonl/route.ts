import { redirectToHumanSource } from "@/lib/human-archive";

export async function GET() {
  return redirectToHumanSource("exports/agent-readable/institution-index.jsonl");
}
