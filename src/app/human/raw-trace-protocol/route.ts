import { redirectToHumanSource } from "@/lib/human-archive";

export async function GET() {
  return redirectToHumanSource("museum/raw-traces/RAW_TRACE_PROTOCOL.md");
}
