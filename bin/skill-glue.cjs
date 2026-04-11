#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function fail(message) {
  console.error(`skill-glue: ${message}`);
  process.exit(1);
}

function readManifest(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    fail(`manifest not found: ${absolutePath}`);
  }

  try {
    const raw = fs.readFileSync(absolutePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    fail(`failed to parse manifest: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function normalizeCost(costHint) {
  const tokenBand = typeof costHint?.tokens === "string" ? costHint.tokens : "unknown";
  const score = typeof costHint?.score === "number" ? costHint.score : 0;

  return { tokenBand, score };
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== "object") {
    fail("manifest must be an object");
  }

  if (!manifest.id || !manifest.summary || !Array.isArray(manifest.steps)) {
    fail("manifest must include id, summary, and steps");
  }

  const ids = new Set();

  for (const step of manifest.steps) {
    if (!step.id || ids.has(step.id)) {
      fail("every step must have a unique id");
    }

    ids.add(step.id);

    if (!step.summary || !Array.isArray(step.inputs) || !Array.isArray(step.outputs)) {
      fail(`step ${step.id} must include summary, inputs, and outputs`);
    }

    if (!Array.isArray(step.dependencies) || !Array.isArray(step.validation_checks)) {
      fail(`step ${step.id} must include dependencies and validation_checks arrays`);
    }
  }

  for (const step of manifest.steps) {
    for (const dependency of step.dependencies) {
      if (!ids.has(dependency)) {
        fail(`step ${step.id} references unknown dependency ${dependency}`);
      }
    }
  }
}

function buildExecutionGroups(steps) {
  const stepMap = new Map(steps.map((step) => [step.id, step]));
  const pending = new Set(stepMap.keys());
  const done = new Set();
  const groups = [];

  while (pending.size > 0) {
    const ready = [...pending]
      .map((id) => stepMap.get(id))
      .filter((step) => step.dependencies.every((dependency) => done.has(dependency)));

    if (ready.length === 0) {
      fail("cyclic dependency detected in manifest");
    }

    groups.push(ready.map((step) => step.id));

    for (const step of ready) {
      pending.delete(step.id);
      done.add(step.id);
    }
  }

  return groups;
}

function estimateManifest(manifest) {
  const steps = manifest.steps.map((step) => ({
    id: step.id,
    tokenBand: normalizeCost(step.cost_hint).tokenBand,
    score: normalizeCost(step.cost_hint).score,
    cacheable: Boolean(step.cacheable),
  }));

  const totalScore = steps.reduce((sum, step) => sum + step.score, 0);

  return {
    totalScore,
    estimatedBudget: totalScore <= 4 ? "very-low" : totalScore <= 8 ? "low" : totalScore <= 12 ? "medium" : "high",
    steps,
  };
}

function composeManifest(manifest) {
  const executionOrder = buildExecutionGroups(manifest.steps);
  const estimate = estimateManifest(manifest);

  return {
    id: manifest.id,
    summary: manifest.summary,
    execution_order: executionOrder,
    estimated_cost: {
      total_score: estimate.totalScore,
      budget_band: estimate.estimatedBudget,
    },
    cacheable_steps: manifest.steps.filter((step) => step.cacheable).map((step) => step.id),
    validation_checks: manifest.steps.flatMap((step) =>
      step.validation_checks.map((check) => ({
        step: step.id,
        check,
      })),
    ),
    steps: manifest.steps.map((step) => ({
      id: step.id,
      summary: step.summary,
      inputs: step.inputs,
      outputs: step.outputs,
      dependencies: step.dependencies,
      replaceable_with: step.replaceable_with ?? [],
      cost_hint: normalizeCost(step.cost_hint),
      cacheable: Boolean(step.cacheable),
      condition: step.condition ?? null,
    })),
  };
}

function explainManifest(manifest) {
  const plan = composeManifest(manifest);

  return {
    id: manifest.id,
    summary: manifest.summary,
    explanation: plan.steps.map((step) => ({
      step: step.id,
      why_here:
        step.dependencies.length === 0
          ? "This step can start immediately because it has no upstream dependencies."
          : `This step waits for ${step.dependencies.join(", ")} before it runs.`,
      why_replaceable:
        step.replaceable_with.length > 0
          ? `It can be swapped with ${step.replaceable_with.join(", ")} if you need a cheaper or more specialized path.`
          : "It is currently the only step in this manifest handling this responsibility.",
      why_cacheable: step.cacheable
        ? "Outputs from this step are good candidates for reuse across runs."
        : "This step should run fresh because its value depends on current context.",
    })),
  };
}

function formatMarkdown(title, payload) {
  if (payload.execution_order) {
    const lines = [
      `# ${title}`,
      "",
      payload.summary,
      "",
      "## Execution Order",
      ...payload.execution_order.map((group, index) => `${index + 1}. ${group.join(" + ")}`),
      "",
      "## Step Plan",
      ...payload.steps.map((step) => {
        const linesForStep = [
          `### ${step.id}`,
          `- Summary: ${step.summary}`,
          `- Inputs: ${step.inputs.join(", ") || "none"}`,
          `- Outputs: ${step.outputs.join(", ") || "none"}`,
          `- Depends on: ${step.dependencies.join(", ") || "none"}`,
          `- Replaceable with: ${step.replaceable_with.join(", ") || "none"}`,
          `- Cost hint: ${step.cost_hint.tokenBand} (${step.cost_hint.score})`,
          `- Cacheable: ${step.cacheable ? "yes" : "no"}`,
        ];

        if (step.condition) {
          linesForStep.push(`- Condition: ${step.condition}`);
        }

        return linesForStep.join("\n");
      }),
      "",
      `## Estimated Cost\n- Total score: ${payload.estimated_cost.total_score}\n- Budget band: ${payload.estimated_cost.budget_band}`,
      "",
      `## Cacheable Steps\n- ${payload.cacheable_steps.join(", ") || "none"}`,
    ];

    return lines.join("\n");
  }

  if (payload.explanation) {
    return [
      `# ${title}`,
      "",
      payload.summary,
      "",
      ...payload.explanation.map((item) =>
        [`## ${item.step}`, `- Why here: ${item.why_here}`, `- Replaceability: ${item.why_replaceable}`, `- Cacheability: ${item.why_cacheable}`].join("\n"),
      ),
    ].join("\n");
  }

  return [
    `# ${title}`,
    "",
    `- Total score: ${payload.totalScore}`,
    `- Budget band: ${payload.estimatedBudget}`,
    "",
    "## Step Costs",
    ...payload.steps.map((step) => `- ${step.id}: ${step.tokenBand} (${step.score})${step.cacheable ? " [cacheable]" : ""}`),
  ].join("\n");
}

function formatOutput(command, manifest, format) {
  const title = `Skill Glue ${command} :: ${manifest.id}`;
  const payload =
    command === "compose"
      ? composeManifest(manifest)
      : command === "estimate"
        ? estimateManifest(manifest)
        : explainManifest(manifest);

  if (format === "markdown") {
    return formatMarkdown(title, payload);
  }

  return JSON.stringify(payload, null, 2);
}

function simulateRun(manifest) {
  const executionOrder = buildExecutionGroups(manifest.steps);

  return executionOrder.map((group, index) => ({
    group: index + 1,
    steps: group,
    simulated_output: `${group.join(" + ")} completed`,
  }));
}

const [, , command, manifestPath, ...restArgs] = process.argv;

if (!command || !manifestPath) {
  fail("usage: skill-glue <compose|estimate|explain> <manifest> [--format json|markdown] [--sample-run]");
}

if (!["compose", "estimate", "explain"].includes(command)) {
  fail(`unknown command: ${command}`);
}

const formatIndex = restArgs.indexOf("--format");
const format = formatIndex >= 0 ? restArgs[formatIndex + 1] : "json";
const sampleRun = restArgs.includes("--sample-run");

if (!["json", "markdown"].includes(format)) {
  fail("format must be json or markdown");
}

const manifest = readManifest(manifestPath);
validateManifest(manifest);

const output = formatOutput(command, manifest, format);
process.stdout.write(output);

if (sampleRun && command === "compose") {
  process.stdout.write(format === "markdown" ? "\n\n## Sample Run\n" : "\n");
  process.stdout.write(
    format === "markdown"
      ? simulateRun(manifest)
          .map((entry) => `- Group ${entry.group}: ${entry.steps.join(" + ")} -> ${entry.simulated_output}`)
          .join("\n")
      : JSON.stringify({ sample_run: simulateRun(manifest) }, null, 2),
  );
}
