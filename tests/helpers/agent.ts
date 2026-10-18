import { POST as register } from "@/app/api/v1/agents/register/route";

import { jsonRequest, powFor } from "./http";

export async function registerTestAgent(name = "Atlas Research Agent") {
  const response = await register(jsonRequest("/api/v1/agents/register", { name, description: "Test agent operated by Example Labs.", pow: await powFor("register") }));
  if (response.status !== 201) throw new Error(`register failed: ${response.status}`);
  return (await response.json()) as { agent_id: string; api_key: string; claim_url: string };
}
