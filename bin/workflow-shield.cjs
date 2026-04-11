#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function fail(message) {
  console.error(`workflow-shield: ${message}`);
  process.exit(1);
}

function readSpec(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`spec not found: ${absolutePath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    fail(`failed to parse spec: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function validateSpec(spec) {
  if (!spec.id || !spec.summary || !Array.isArray(spec.assets) || !Array.isArray(spec.boundaries)) {
    fail("spec must include id, summary, assets, and boundaries");
  }
}

function hashSpec(spec) {
  return crypto.createHash("sha256").update(JSON.stringify(spec)).digest("hex");
}

function packSpec(spec) {
  const integrityHash = hashSpec(spec);

  return {
    id: spec.id,
    summary: spec.summary,
    package_type: "workflow-shield-bundle",
    integrity_hash: integrityHash,
    access_mode: spec.access_mode || "controlled-execution",
    assets: spec.assets.map((asset) => ({
      id: asset.id,
      kind: asset.kind,
      exposure: asset.exposure,
    })),
    boundaries: spec.boundaries,
    extraction_cost_notes: spec.extraction_cost_notes || [],
    operator_guidance: spec.operator_guidance || [],
  };
}

function inspectSpec(spec) {
  const packed = packSpec(spec);

  return {
    id: packed.id,
    summary: packed.summary,
    what_is_visible: packed.assets.filter((asset) => asset.exposure !== "hidden").map((asset) => asset.id),
    what_stays_hidden: packed.assets.filter((asset) => asset.exposure === "hidden").map((asset) => asset.id),
    boundaries: packed.boundaries,
    access_mode: packed.access_mode,
  };
}

function explainSpec(spec) {
  return {
    id: spec.id,
    summary: spec.summary,
    explanation: [
      "Workflow Shield is not cryptographic DRM. It is a packaging layer that raises extraction cost and makes controlled execution more attractive than direct copying.",
      `This package keeps ${spec.assets.filter((asset) => asset.exposure === "hidden").length} assets hidden and exposes ${spec.assets.filter((asset) => asset.exposure !== "hidden").length} surface-level assets.`,
      "The primary goal is to preserve boundaries, not to claim that extraction is impossible.",
    ],
  };
}

function formatMarkdown(title, payload) {
  if (payload.package_type) {
    return [
      `# ${title}`,
      "",
      payload.summary,
      "",
      `- Package type: ${payload.package_type}`,
      `- Integrity hash: ${payload.integrity_hash}`,
      `- Access mode: ${payload.access_mode}`,
      "",
      "## Assets",
      ...payload.assets.map((asset) => `- ${asset.id} (${asset.kind}) -> ${asset.exposure}`),
      "",
      "## Boundaries",
      ...payload.boundaries.map((boundary) => `- ${boundary}`),
      "",
      "## Extraction Cost Notes",
      ...payload.extraction_cost_notes.map((note) => `- ${note}`),
    ].join("\n");
  }

  if (payload.what_is_visible) {
    return [
      `# ${title}`,
      "",
      payload.summary,
      "",
      `- Access mode: ${payload.access_mode}`,
      "",
      "## Visible",
      ...payload.what_is_visible.map((item) => `- ${item}`),
      "",
      "## Hidden",
      ...payload.what_stays_hidden.map((item) => `- ${item}`),
      "",
      "## Boundaries",
      ...payload.boundaries.map((item) => `- ${item}`),
    ].join("\n");
  }

  return [
    `# ${title}`,
    "",
    payload.summary,
    "",
    "## Explanation",
    ...payload.explanation.map((line) => `- ${line}`),
  ].join("\n");
}

const [, , command, specPath, ...restArgs] = process.argv;
if (!command || !specPath) {
  fail("usage: workflow-shield <pack|inspect|explain> <spec> [--format json|markdown]");
}

if (!["pack", "inspect", "explain"].includes(command)) {
  fail(`unknown command: ${command}`);
}

const formatIndex = restArgs.indexOf("--format");
const format = formatIndex >= 0 ? restArgs[formatIndex + 1] : "json";

if (!["json", "markdown"].includes(format)) {
  fail("format must be json or markdown");
}

const spec = readSpec(specPath);
validateSpec(spec);

const payload =
  command === "pack" ? packSpec(spec) : command === "inspect" ? inspectSpec(spec) : explainSpec(spec);

process.stdout.write(
  format === "markdown"
    ? formatMarkdown(`Workflow Shield ${command} :: ${spec.id}`, payload)
    : JSON.stringify(payload, null, 2),
);
