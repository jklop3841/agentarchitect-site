import { getSupabaseAdminClient } from "@/lib/supabase";
import { createId, hashValue, secureEqual } from "@/lib/security";
import type {
  AccessRequestInput,
  AccessRequestRecord,
  ApiKeyRecord,
  ExecutionLogRecord,
} from "@/lib/types";

declare global {
  var __agentFriendlyStore:
    | {
        accessRequests: AccessRequestRecord[];
        apiKeys: ApiKeyRecord[];
        executionLogs: ExecutionLogRecord[];
      }
    | undefined;
}

const store =
  globalThis.__agentFriendlyStore ??
  (globalThis.__agentFriendlyStore = {
    accessRequests: [],
    apiKeys: [],
    executionLogs: [],
  });

function mergeApiKeys(...groups: ApiKeyRecord[][]) {
  const merged = new Map<string, ApiKeyRecord>();

  for (const group of groups) {
    for (const key of group) {
      if (!merged.has(key.keyHash)) {
        merged.set(key.keyHash, key);
      }
    }
  }

  return [...merged.values()];
}

function getSeedApiKeys() {
  const demoApiKey = process.env.DEMO_API_KEY;

  if (!demoApiKey) {
    return [];
  }

  return [
    {
      id: "seed-demo-key",
      label: "Seed demo key",
      keyHash: hashValue(demoApiKey),
      status: "active" as const,
      monthlyQuota: 100,
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function createAccessRequest(input: AccessRequestInput) {
  const record: AccessRequestRecord = {
    ...input,
    id: createId(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase.from("access_requests").insert({
      id: record.id,
      name: record.name,
      email: record.email,
      organization: record.organization ?? null,
      role: record.role ?? null,
      use_case: record.useCase,
      expected_volume: record.expectedVolume ?? null,
      locale: record.locale,
      status: record.status,
      notes: null,
      created_at: record.createdAt,
    });

    if (error) {
      throw new Error(`Failed to persist access request: ${error.message}`);
    }
  } else {
    store.accessRequests.unshift(record);
  }

  return record;
}

export async function listAccessRequests() {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to list access requests: ${error.message}`);
    }

    return (
      data?.map((row) => ({
        id: row.id as string,
        name: row.name as string,
        email: row.email as string,
        organization: (row.organization as string | null) ?? undefined,
        role: (row.role as string | null) ?? undefined,
        useCase: row.use_case as string,
        expectedVolume: (row.expected_volume as string | null) ?? undefined,
        locale: row.locale as "zh" | "en",
        status: row.status as "pending" | "approved" | "rejected",
        notes: (row.notes as string | null) ?? undefined,
        createdAt: row.created_at as string,
      })) ?? []
    );
  }

  return store.accessRequests;
}

export async function listApiKeys() {
  const seedKeys = getSeedApiKeys();
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to list API keys: ${error.message}`);
    }

    const dbKeys =
      data?.map((row) => ({
        id: row.id as string,
        label: row.label as string,
        keyHash: row.key_hash as string,
        status: row.status as "active" | "disabled",
        monthlyQuota: row.monthly_quota as number,
        ownerRequestId: (row.owner_request_id as string | null) ?? undefined,
        createdAt: row.created_at as string,
      })) ?? [];

    return mergeApiKeys(dbKeys, seedKeys);
  }

  return mergeApiKeys(seedKeys, store.apiKeys);
}

export async function findApiKey(rawKey: string) {
  const keyHash = hashValue(rawKey);
  const keys = await listApiKeys();
  let matchedKey: ApiKeyRecord | null = null;

  for (const entry of keys) {
    const isMatch = secureEqual(entry.keyHash, keyHash);
    if (isMatch && entry.status === "active") {
      matchedKey = entry;
    }
  }

  return matchedKey;
}

export async function createExecutionLog(input: Omit<ExecutionLogRecord, "id" | "createdAt">) {
  const record: ExecutionLogRecord = {
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase.from("execution_logs").insert({
      id: record.id,
      execution_id: record.executionId,
      capability_id: record.capabilityId,
      caller_key_id: record.callerKeyId,
      caller_label: record.callerLabel,
      input_summary: record.inputSummary,
      output_summary: record.outputSummary,
      estimated_cost: record.estimatedCost,
      verification_token: record.verificationToken,
      status: record.status,
      created_at: record.createdAt,
    });

    if (error) {
      throw new Error(`Failed to persist execution log: ${error.message}`);
    }
  } else {
    store.executionLogs.unshift(record);
  }

  return record;
}

export async function listExecutionLogs() {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("execution_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to list execution logs: ${error.message}`);
    }

    return (
      data?.map((row) => ({
        id: row.id as string,
        executionId: row.execution_id as string,
        capabilityId: row.capability_id as string,
        callerKeyId: row.caller_key_id as string,
        callerLabel: (row.caller_label as string | null) ?? "external-caller",
        inputSummary: row.input_summary as string,
        outputSummary: row.output_summary as string,
        estimatedCost: row.estimated_cost as string,
        verificationToken: row.verification_token as string,
        status: row.status as "completed" | "rejected",
        createdAt: row.created_at as string,
      })) ?? []
    );
  }

  return store.executionLogs;
}

export async function findExecutionLog(executionId: string) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("execution_logs")
      .select("*")
      .eq("execution_id", executionId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch execution log: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id as string,
      executionId: data.execution_id as string,
      capabilityId: data.capability_id as string,
      callerKeyId: data.caller_key_id as string,
      callerLabel: (data.caller_label as string | null) ?? "external-caller",
      inputSummary: data.input_summary as string,
      outputSummary: data.output_summary as string,
      estimatedCost: data.estimated_cost as string,
      verificationToken: data.verification_token as string,
      status: data.status as "completed" | "rejected",
      createdAt: data.created_at as string,
    };
  }

  return store.executionLogs.find((entry) => entry.executionId === executionId) ?? null;
}
