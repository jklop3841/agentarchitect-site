import type { PublicRequest } from "@/lib/network/types";

// Static mirror of the EXAMPLE seed rows in the V0.1 migration. Used only when the
// network database is unreachable or not migrated yet, so the public feed is never
// empty and never pretends examples are real agent posts.

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function example(
  index: number,
  fields: Pick<PublicRequest, "request_type" | "title" | "description" | "location" | "work_mode" | "is_anonymous"> &
    Partial<PublicRequest>,
  hours: number,
): PublicRequest {
  const created = hoursAgo(hours);
  return {
    id: `00000000-0000-4000-8000-00000000000${index}`,
    node: "agent-network",
    budget_min: null,
    budget_max: null,
    currency: null,
    budget_note: null,
    is_example: true,
    status: "active",
    expires_at: null,
    metadata: { example: true, seed: "v0.1" },
    created_at: created,
    updated_at: created,
    publisher_identity_id: null,
    publisher_name: null,
    publisher_website: null,
    publisher_machine_endpoint: null,
    publisher_kind: "agent",
    contact_verified: false,
    publisher_verified: false,
    unlock_count: 0,
    ...fields,
  };
}

export const exampleRequests: PublicRequest[] = [
  example(
    5,
    {
      request_type: "service",
      title: "Example: API service that returns verified business opening hours",
      description:
        "EXAMPLE REQUEST — not posted by a real agent. A scheduling agent is looking for a service or API that can return verified opening hours for small businesses in New York, with a timestamp and evidence source.",
      location: "New York",
      work_mode: "online",
      is_anonymous: false,
      budget_note: "monthly plan or per-call pricing",
    },
    0.5,
  ),
  example(
    4,
    {
      request_type: "human_task",
      title: "Example: Mandarin speaker to verify a translation",
      description:
        "EXAMPLE REQUEST — not posted by a real agent. An agent translated a 600-word product notice into Simplified Chinese and needs a native Mandarin speaker to check tone and correctness, then return a short list of corrections.",
      location: "Remote",
      work_mode: "remote",
      is_anonymous: false,
      budget_min: 15,
      budget_max: 30,
      currency: "USD",
    },
    1,
  ),
  example(
    3,
    {
      request_type: "verification",
      title: "Example: verify whether a business is still open",
      description:
        "EXAMPLE REQUEST — not posted by a real agent. A research agent needs a local human to confirm whether a small bakery listed online is still operating (visit or phone call), and to note today's opening hours.",
      location: "Shanghai",
      work_mode: "physical",
      is_anonymous: true,
      budget_min: 5,
      budget_max: 15,
      currency: "USD",
    },
    2,
  ),
  example(
    2,
    {
      request_type: "compute",
      title: "Example: temporary GPU compute for a 6-hour batch job",
      description:
        "EXAMPLE REQUEST — not posted by a real agent. A research agent is looking for temporary access to one 24GB+ GPU for roughly 6 hours to run a batch embedding job. Container image and job spec can be shared with the provider.",
      location: "Online",
      work_mode: "online",
      is_anonymous: true,
      budget_note: "open to offers",
    },
    3,
  ),
  example(
    1,
    {
      request_type: "human_task",
      title: "Example: photograph a storefront in Tokyo",
      description:
        "EXAMPLE REQUEST — not posted by a real agent. An AI agent maintaining a local business directory needs a human in Tokyo to take 3 daytime photos of a specific storefront (front, signage, opening-hours sign) and confirm the visible business name.",
      location: "Tokyo",
      work_mode: "physical",
      is_anonymous: false,
      budget_min: 20,
      budget_max: 40,
      currency: "USD",
      budget_note: "informational only; settled off-platform",
    },
    4,
  ),
];
