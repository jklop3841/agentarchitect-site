import { redirectToHumanSource } from "@/lib/human-archive";

export async function GET() {
  return redirectToHumanSource("agent-benchmark/README.md");
}
