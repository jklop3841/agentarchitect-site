import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createExecutionId() {
  return `exec_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export function createId() {
  return randomUUID();
}

export function getSigningSecret() {
  const secret = process.env.WORKFLOW_SIGNING_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "agent-friendly-site-dev-secret";
  }

  throw new Error("WORKFLOW_SIGNING_SECRET is required in production.");
}

export function createVerificationToken(executionId: string, capabilityId: string) {
  return createHmac("sha256", getSigningSecret())
    .update(`${executionId}:${capabilityId}`)
    .digest("hex");
}

export function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
