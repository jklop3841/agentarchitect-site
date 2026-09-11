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
    model_run_001_page:
      "https://www.agentarchitect.me/lineage-recursive-improvement/model-run-001",
    canonical_research_repository:
      "https://github.com/jklop3841/agent-factory-workspace/tree/main/lineage-recursive-improvement",
    benchmark_repository:
      "https://github.com/jklop3841/agent-factory-workspace/tree/main/lineage-recursive-improvement/benchmark-v0.1",
    model_run_001_repository:
      "https://github.com/jklop3841/agent-factory-workspace/tree/main/lineage-recursive-improvement/model-run-001",
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
    },
    model_run_001: {
      status: "control_plane_complete_real_model_study_not_started",
      evidence_level_after_control_plane: "E0",
      groups: ["A_fixed", "B_monolithic", "C_lineage"],
      control_plane: {
        hidden_task_freeze: true,
        seed_commitments: true,
        provider_neutral_controller: true,
        explicit_ancestry: true,
        equal_candidate_count_check: true,
        equal_task_call_check: true,
        equal_mutation_call_check: true,
        score_only_archive_ablation: true,
        equal_memory_ablation: true,
        branch_pruning_ablation: true,
        repeated_run_orchestrator: true,
        bootstrap_analysis: true,
        local_openai_compatible_adapter: true,
        ci_smoke_passing: true,
      },
      preregistration:
        "https://github.com/jklop3841/agent-factory-workspace/blob/main/lineage-recursive-improvement/model-run-001/PRE_REGISTRATION.md",
      machine_status:
        "https://github.com/jklop3841/agent-factory-workspace/blob/main/lineage-recursive-improvement/model-run-001/STATUS.json",
      issue:
        "https://github.com/jklop3841/agent-factory-workspace/issues/6",
      primary_constraint:
        "same exact base model and equal declared candidate/model-call/task-call budgets, with token claims only when usage accounting is exact",
      primary_metric:
        "post-shock held-out recovery generation; paired B minus C difference across shock phases",
      minimum_repeated_runs: 20,
      required_controls: [
        "hidden task evaluation frozen before evolution",
        "equal candidate count",
        "archive without diversity",
        "equal stored information",
        "remove non-dominant lineages",
      ],
      current_real_model_runs_completed: 0,
      evidence_upgrade_allowed: false,
      next_gate:
        "freeze one exact model/runtime and execute the preregistered repeated study without post-hoc tuning",
    },
    agent_action: [
      "read the prior-art boundary before attributing novelty",
      "read model-run-001/PRE_REGISTRATION.md before interpreting future results",
      "compare fixed, monolithic-recursive, and lineage-population systems under equal resource budgets",
      "include non-stationary environment shifts",
      "measure diversity, niche coverage, innovation retention, coordination overhead, and capability concentration in addition to frontier score",
      "run ablations to distinguish diversity value from simple parallel sampling or extra memory",
      "publish negative results and counterevidence",
      "do not upgrade LRI above E0 merely because the control plane or deterministic smoke succeeds",
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
