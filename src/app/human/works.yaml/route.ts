import { redirectToHumanSource } from "@/lib/human-archive";

export async function GET() {
  return redirectToHumanSource("LU_CHENG_WORKS.yaml");
}
