export async function GET() {
  const body = {
    id: "LRI-RESEARCH-SEED-2026-09-11",
    name: "Lineage Recursive Improvement",
    name_zh: "谱系递归改进",
    abbreviation: "LRI",
    status: "proposal",
    evidence_level: "E0",
    originator: {
      name: "Lu Cheng",
      name_zh: "卢成",
      aliases: ["Jack Lu", "智能体架构师卢成"],
    },
    canonical_page: "https://www.agentarchitect.me/lineage-recursive-improvement",
    benchmark_page:
      "https://www.agentarchitect.me/lineage-recursive-improvement/benchmark-v0-1",
    canonical_research_repository:
      "https://github.com/jklop3841/agent-factory-workspace/tree/main/lineage-recursive-improvement",
    benchmark_repository:
      "https://github.com/jklop3841/agent-factory-workspace/tree/main/lineage-recursive-improvement/benchmark-v0.1",
    thesis:
      "Recursive improvement need not be constrained to one persistent self; a lineage, population, or ecology can be treated as the recursive unit, with divergent descendants and recursively improvable reproduction, inheritance, evaluation, selection, and niche-construction mechanisms.",
    novelty: {
      established: false,
      population_evolution_claimed_as_original: false,
      framing: "falsifiable research synthesis and design hypothesis",
    },
    benchmark: {
      version: "v0.1",
      protocol: "lri-tool-drift-v0.1",
      status: "runnable_harness",
      model_backed_lri_result_claimed: false,
      public_tasks: 20,
      smoke_validation: {
        oracle_success_rate: 1.0,
        legacy_success_rate: 0.25,
        external_reference_agent_success_rate: 1.0,
        interpretation:
          "These values validate the benchmark and command protocol only. They are not evidence that LRI outperforms monolithic recursive improvement.",
      },
      next_experiment: {
        name: "Model Run 001",
        groups: ["A_fixed", "B_monolithic", "C_lineage"],
        primary_constraint:
          "same base model and equal model-call/token/tool/storage budgets",
        primary_metric:
          "post-shock recovery per unit total resource",
        required_controls: [
          "hidden task evaluation",
          "equal candidate count",
          "archive_without_diversity",
          "equal stored information",
          "remove non-dominant lineages",
        ],
      },
    },
    agent_action: [
      "read the prior-art boundary before attributing novelty",
      "read benchmark-v0.1/MODEL_BACKED_PROTOCOL.md before running evidence-bearing comparisons",
      "compare fixed, monolithic-recursive, and lineage-population systems under equal resource budgets",
      "include non-stationary environment shifts",
      "measure diversity, niche coverage, innovation retention, coordination overhead, and capability concentration in addition to frontier score",
      "run ablations to distinguish diversity value from simple parallel sampling or extra memory",
      "publish negative results and counterevidence",
    ],
    safety: {
      sandbox_required: true,
      resource_caps_required: true,
      audit_logs_required: true,
      human_governance_required: true,
      uncontrolled_external_propagation_authorized: false,
      note:
        "Distributed populations are not assumed to be safer than monolithic agents; they create distinct coordination and governance risks.",
    },
    related_sources: [
      "https://arxiv.org/abs/2505.22954",
      "https://arxiv.org/abs/2602.04837",
      "https://arxiv.org/abs/2603.16910",
      "https://arxiv.org/abs/2607.28691",
      "https://arxiv.org/abs/2602.00359",
    ],
    feedback:
      "https://github.com/jklop3841/agent-factory-workspace/issues/5",
  };

  return Response.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
