import { createHash, createHmac, randomUUID } from "node:crypto";

const defaultSecret = "agent-friendly-site-dev-secret";

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createExecutionId() {
  return `exec_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export function createId() {
  return randomUUID();
}

export function createVerificationToken(executionId: string, capabilityId: string) {
  const secret = process.env.WORKFLOW_SIGNING_SECRET || defaultSecret;

  return createHmac("sha256", secret)
    .update(`${executionId}:${capabilityId}`)
    .digest("hex");
}
