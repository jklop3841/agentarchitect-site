// Agent Network V0.1 shared types. Mirrors supabase/migrations/20261017000000_agent_network_v0_1.sql.

export const requestTypes = [
  "human_task",
  "compute",
  "service",
  "data",
  "physical_world",
  "research",
  "local_task",
  "delivery",
  "verification",
  "hardware",
  "api",
  "agent_to_agent",
  "other",
] as const;

export type RequestType = (typeof requestTypes)[number];

export const requestTypeLabels: Record<RequestType, string> = {
  human_task: "Job / Human task",
  compute: "Compute",
  service: "Service",
  data: "Data",
  physical_world: "Physical world",
  research: "Research",
  local_task: "Local task",
  delivery: "Delivery",
  verification: "Verification",
  hardware: "Hardware",
  api: "API",
  agent_to_agent: "Agent-to-agent",
  other: "Other",
};

// V0.1 UI keeps three primary tabs; every other type is still listed under "All".
export const feedTabs = [
  { key: "all", label: "All", type: null },
  { key: "jobs", label: "Jobs", type: "human_task" },
  { key: "compute", label: "Compute", type: "compute" },
  { key: "services", label: "Services", type: "service" },
] as const;

export type FeedTabKey = (typeof feedTabs)[number]["key"];

export const workModes = ["remote", "online", "physical", "hybrid"] as const;
export type WorkMode = (typeof workModes)[number];

export const identityKinds = ["human", "agent", "organization", "service"] as const;
export type IdentityKind = (typeof identityKinds)[number];
export const publishingKinds: IdentityKind[] = ["agent", "organization", "service"];

export const requestStatuses = ["active", "closed", "expired", "removed"] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export const reportReasons = [
  "spam",
  "scam_or_fraud",
  "illegal",
  "harassment",
  "personal_data",
  "payment_or_financial",
  "other",
] as const;
export type ReportReason = (typeof reportReasons)[number];

export type PublicRequest = {
  id: string;
  node: string;
  request_type: RequestType;
  title: string;
  description: string;
  location: string;
  work_mode: WorkMode;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  budget_note: string | null;
  is_anonymous: boolean;
  is_example: boolean;
  status: RequestStatus;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  publisher_identity_id: string | null;
  publisher_name: string | null;
  publisher_website: string | null;
  publisher_machine_endpoint: string | null;
  publisher_kind: IdentityKind;
  contact_verified: boolean;
  publisher_verified: boolean;
  unlock_count: number;
};

export type Identity = {
  id: string;
  owner_user_id: string;
  kind: IdentityKind;
  display_name: string;
  description: string | null;
  website: string | null;
  capabilities: string[];
  machine_endpoint: string | null;
  anonymous_allowed: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type FeedFilters = {
  type: RequestType | null;
  mode: "remote" | "physical" | null;
  location: string | null;
  q: string | null;
  includeInactive: boolean;
  limit: number;
  offset: number;
};

export type FeedSource = "database" | "fallback";

export type FeedResult = {
  requests: PublicRequest[];
  source: FeedSource;
};
