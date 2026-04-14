export type SkillGlueStep = {
  id: string;
  summary: string;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  replaceableWith: string[];
  cacheable: boolean;
  condition?: string;
  costHint: {
    tokens: "low" | "medium" | "high";
    score: number;
  };
};

export type SkillGlueManifest = {
  id: string;
  summary: string;
  file: string;
  steps: SkillGlueStep[];
};

export const skillGlueCommands = [
  {
    name: "compose",
    usage: "skill-glue compose <manifest> --format json|markdown [--sample-run]",
    summary: "Generate the composed workflow plan with step order, validation checks, and cacheable stages.",
  },
  {
    name: "estimate",
    usage: "skill-glue estimate <manifest> --format json|markdown",
    summary: "Estimate total token budget and show which steps drive cost.",
  },
  {
    name: "explain",
    usage: "skill-glue explain <manifest> --format json|markdown",
    summary: "Explain why steps are ordered this way and what can be replaced or cached.",
  },
];

export const skillGlueValueProps = [
  {
    title: "低 token 成本优先",
    body: "不是先做巨型 workflow，再看看多少钱，而是先从成本上约束 workflow 结构。",
  },
  {
    title: "技能可解耦可替换",
    body: "每个 step 都是独立节点，能换、能拆、能并行，不会因为一个大 prompt 拖死全局。",
  },
  {
    title: "先组合，再执行",
    body: "第一版先把组合逻辑做稳，让 Agent 和人都能先看懂 plan，再决定是否真的执行。",
  },
];

export const skillGlueSampleOutput = `{
  "id": "parallel-content-stack",
  "execution_order": [
    ["topic.intake"],
    ["hook.builder", "evidence.bundle"],
    ["assembly.pass"]
  ],
  "estimated_cost": {
    "total_score": 5,
    "budget_band": "low"
  },
  "cacheable_steps": ["topic.intake", "hook.builder", "evidence.bundle"]
}`;

export const skillGlueCaseStudy = {
  title: "Before / After",
  before:
    "Before：把选题、研究、hooks、整合全塞进一个巨型 prompt，结果 token 消耗高、输出不稳、每次改一点都要整体重跑。",
  after:
    "After：拆成 intake、hook builder、evidence bundle、assembly pass 四个节点，能并行的并行，能缓存的缓存，解释和估算都更清楚。",
  verdict:
    "它最适合那些已经知道大 prompt 越来越贵，但还没把 workflow 结构显式化的任务。",
};

export const skillGlueManifests: SkillGlueManifest[] = [
  {
    id: "serial-brief-stack",
    summary: "A narrow serial flow for intake -> research squeeze -> final brief generation.",
    file: "/examples/skill-glue/serial.json",
    steps: [
      {
        id: "brief.intake",
        summary: "Normalize the brief into a structured intake card.",
        inputs: ["raw_brief"],
        outputs: ["intake"],
        dependencies: [],
        replaceableWith: ["brief.minify"],
        cacheable: true,
        costHint: { tokens: "low", score: 1 },
      },
      {
        id: "research.squeeze",
        summary: "Keep only the 3-5 external facts needed for the task.",
        inputs: ["intake"],
        outputs: ["fact_pack"],
        dependencies: ["brief.intake"],
        replaceableWith: ["research.cached-pack"],
        cacheable: true,
        costHint: { tokens: "medium", score: 2 },
      },
      {
        id: "draft.output",
        summary: "Generate the final brief without rerunning upstream reasoning.",
        inputs: ["intake", "fact_pack"],
        outputs: ["final_brief"],
        dependencies: ["research.squeeze"],
        replaceableWith: [],
        cacheable: false,
        costHint: { tokens: "low", score: 1 },
      },
    ],
  },
  {
    id: "parallel-content-stack",
    summary: "A mixed serial + parallel flow that prepares hooks and evidence separately before assembly.",
    file: "/examples/skill-glue/parallel.json",
    steps: [
      {
        id: "topic.intake",
        summary: "Turn the raw topic into a clean topic card.",
        inputs: ["topic"],
        outputs: ["topic_card"],
        dependencies: [],
        replaceableWith: [],
        cacheable: true,
        costHint: { tokens: "low", score: 1 },
      },
      {
        id: "hook.builder",
        summary: "Draft hooks in parallel with evidence gathering.",
        inputs: ["topic_card"],
        outputs: ["hooks"],
        dependencies: ["topic.intake"],
        replaceableWith: ["hook.cached"],
        cacheable: true,
        costHint: { tokens: "low", score: 1 },
      },
      {
        id: "evidence.bundle",
        summary: "Gather the smallest evidence pack that can support the piece.",
        inputs: ["topic_card"],
        outputs: ["evidence"],
        dependencies: ["topic.intake"],
        replaceableWith: ["evidence.archive"],
        cacheable: true,
        costHint: { tokens: "medium", score: 2 },
      },
      {
        id: "assembly.pass",
        summary: "Merge hooks and evidence into one outline.",
        inputs: ["hooks", "evidence"],
        outputs: ["outline"],
        dependencies: ["hook.builder", "evidence.bundle"],
        replaceableWith: [],
        cacheable: false,
        costHint: { tokens: "low", score: 1 },
      },
    ],
  },
  {
    id: "replaceable-agent-stack",
    summary: "A flow that can swap a heavy planner for a lighter planner depending on branch count.",
    file: "/examples/skill-glue/replaceable.json",
    steps: [
      {
        id: "intent.card",
        summary: "Convert the request into a compact intent card.",
        inputs: ["request"],
        outputs: ["intent_card"],
        dependencies: [],
        replaceableWith: [],
        cacheable: true,
        costHint: { tokens: "low", score: 1 },
      },
      {
        id: "planner.heavy",
        summary: "Use richer planning only when the task truly branches.",
        inputs: ["intent_card"],
        outputs: ["route_plan"],
        dependencies: ["intent.card"],
        replaceableWith: ["planner.light"],
        cacheable: false,
        condition: "Use only when the task has 3 or more branches.",
        costHint: { tokens: "high", score: 4 },
      },
      {
        id: "planner.light",
        summary: "Use a cheaper planner for narrow tasks.",
        inputs: ["intent_card"],
        outputs: ["route_plan"],
        dependencies: ["intent.card"],
        replaceableWith: ["planner.heavy"],
        cacheable: false,
        condition: "Use when the task is narrow and branch count is below 3.",
        costHint: { tokens: "low", score: 1 },
      },
      {
        id: "executor.pass",
        summary: "Execute against the chosen route without redoing global planning.",
        inputs: ["route_plan"],
        outputs: ["delivery"],
        dependencies: ["planner.heavy", "planner.light"],
        replaceableWith: [],
        cacheable: false,
        costHint: { tokens: "medium", score: 2 },
      },
    ],
  },
];
