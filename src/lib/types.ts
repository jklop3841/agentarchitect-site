export type Locale = "zh" | "en";

export type CapabilityDefinition = {
  id: string;
  name: string;
  summary: string;
  audience: string;
  inputShape: Record<string, string>;
  outputShape: Record<string, string>;
  auth: "api_key";
  example: Record<string, unknown>;
};

export type AccessRequestInput = {
  name: string;
  email: string;
  organization?: string;
  role?: string;
  useCase: string;
  expectedVolume?: string;
  locale: Locale;
};

export type AccessRequestRecord = AccessRequestInput & {
  id: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
};

export type ApiKeyRecord = {
  id: string;
  label: string;
  keyHash: string;
  status: "active" | "disabled";
  monthlyQuota: number;
  ownerRequestId?: string;
  createdAt: string;
};

export type ExecutionLogRecord = {
  id: string;
  executionId: string;
  capabilityId: string;
  callerKeyId: string;
  callerLabel: string;
  inputSummary: string;
  outputSummary: string;
  estimatedCost: string;
  verificationToken: string;
  status: "completed" | "rejected";
  createdAt: string;
};

export type CapabilityRunResult = {
  summary: string;
  result: Record<string, unknown>;
  estimatedCost: string;
};
