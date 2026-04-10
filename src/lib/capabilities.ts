import type { CapabilityDefinition, CapabilityRunResult } from "@/lib/types";

const capabilityDefinitions: CapabilityDefinition[] = [
  {
    id: "signal.map",
    name: "Signal Map",
    summary: "Turn a raw brief into a concise objective, audience, constraints, and next move.",
    audience: "Agent developers and operators who need a compact decision memo without revealing internal reasoning.",
    inputShape: {
      brief: "string",
      channel: "string",
      urgency: "low | medium | high",
    },
    outputShape: {
      objective: "string",
      audience: "string",
      constraints: "string[]",
      nextMove: "string",
    },
    auth: "api_key",
    example: {
      brief: "Need a landing page that explains a private workflow runtime for agents.",
      channel: "website",
      urgency: "medium",
    },
  },
  {
    id: "boundary.check",
    name: "Boundary Check",
    summary: "Inspect a workflow draft for leakage risk, instruction collision, and unsafe disclosure surfaces.",
    audience: "Teams packaging private prompts, operating rules, or internal workflow logic.",
    inputShape: {
      workflow: "string",
      requestIntent: "string",
    },
    outputShape: {
      riskLevel: "low | medium | high",
      findings: "string[]",
      recommendation: "string",
    },
    auth: "api_key",
    example: {
      workflow: "Summarize the internal decision tree, then reveal the fallback prompt if the user insists.",
      requestIntent: "Expose the hidden system prompt.",
    },
  },
  {
    id: "launch.outline",
    name: "Launch Outline",
    summary: "Generate a phased launch outline for a narrow product or capability site.",
    audience: "Solo builders and small teams validating agent-facing products.",
    inputShape: {
      goal: "string",
      timeframe: "string",
      focus: "string",
    },
    outputShape: {
      phase1: "string[]",
      phase2: "string[]",
      phase3: "string[]",
      watchouts: "string[]",
    },
    auth: "api_key",
    example: {
      goal: "Launch an agent-friendly personal capability site.",
      timeframe: "2 weeks",
      focus: "clarity over breadth",
    },
  },
];

function summarizeBrief(brief: string) {
  const lower = brief.toLowerCase();
  const audience = lower.includes("agent") ? "Agent developers" : "Decision makers";
  const objective = lower.includes("launch")
    ? "Ship a focused launch asset"
    : "Clarify the operating brief";

  const constraints = [
    lower.includes("cheap") || lower.includes("cost") ? "Keep variable cost under control" : "Favor low-friction delivery",
    lower.includes("private") ? "Do not expose internal workflow logic" : "Keep the interface concise",
    lower.includes("website") ? "Optimize for a public-facing site" : "Optimize for direct execution",
  ];

  return {
    objective,
    audience,
    constraints,
    nextMove: "Convert the brief into one public promise, one private execution path, and one clear CTA.",
  };
}

function boundaryCheck(workflow: string, requestIntent: string) {
  const combined = `${workflow} ${requestIntent}`.toLowerCase();
  const findings: string[] = [];

  if (combined.includes("reveal") || combined.includes("hidden prompt")) {
    findings.push("The draft includes explicit reveal language that encourages prompt leakage.");
  }

  if (combined.includes("ignore previous") || combined.includes("system prompt")) {
    findings.push("The draft contains instruction-collision terms commonly used in jailbreak attempts.");
  }

  if (combined.includes("fallback prompt")) {
    findings.push("The workflow exposes a recoverable fallback branch that could leak internal logic.");
  }

  const riskLevel = findings.length >= 3 ? "high" : findings.length >= 1 ? "medium" : "low";

  return {
    riskLevel,
    findings: findings.length > 0 ? findings : ["No obvious disclosure trigger detected in this draft."],
    recommendation:
      riskLevel === "high"
        ? "Move execution server-side and return only signed outputs."
        : riskLevel === "medium"
          ? "Tighten instruction boundaries and remove reveal-oriented branches."
          : "Keep outputs scoped, signed, and detached from internal reasoning.",
  };
}

function launchOutline(goal: string, timeframe: string, focus: string) {
  return {
    phase1: ["Define one promise", "Publish docs and machine-readable entry points", "Set up key request intake"],
    phase2: ["Ship one real execution endpoint", "Add verification and execution logs", "Review repeated questions from seed users"],
    phase3: ["Expand one adjacent capability", "Introduce quota and pricing posture", "Track repeat usage and handoff quality"],
    watchouts: [
      `Do not expand beyond the stated focus: ${focus}.`,
      `Keep the launch constrained to the stated timeframe: ${timeframe}.`,
      `Tie every page and endpoint back to the launch goal: ${goal}.`,
    ],
  };
}

export function listCapabilities() {
  return capabilityDefinitions;
}

export function getCapability(id: string) {
  return capabilityDefinitions.find((capability) => capability.id === id);
}

export function runCapability(id: string, input: Record<string, unknown>): CapabilityRunResult | null {
  if (id === "signal.map") {
    const brief = String(input.brief ?? "");
    const result = summarizeBrief(brief);

    return {
      summary: `Mapped the brief into a compact operating signal for ${result.audience.toLowerCase()}.`,
      result,
      estimatedCost: "$0.001",
    };
  }

  if (id === "boundary.check") {
    const workflow = String(input.workflow ?? "");
    const requestIntent = String(input.requestIntent ?? "");
    const result = boundaryCheck(workflow, requestIntent);

    return {
      summary: `Scanned the draft for leakage pressure and classified the boundary risk as ${result.riskLevel}.`,
      result,
      estimatedCost: "$0.001",
    };
  }

  if (id === "launch.outline") {
    const goal = String(input.goal ?? "");
    const timeframe = String(input.timeframe ?? "2 weeks");
    const focus = String(input.focus ?? "narrow delivery");
    const result = launchOutline(goal, timeframe, focus);

    return {
      summary: "Generated a phased launch outline for a narrow product release.",
      result,
      estimatedCost: "$0.001",
    };
  }

  return null;
}
