export const workflowShieldCommands = [
  {
    name: "pack",
    usage: "workflow-shield pack <spec> --format json|markdown",
    summary: "Build a protected package manifest that exposes only the workflow contract and visible assets.",
  },
  {
    name: "inspect",
    usage: "workflow-shield inspect <spec> --format json|markdown",
    summary: "Show what is public, what stays hidden, and what the boundary rules are.",
  },
  {
    name: "explain",
    usage: "workflow-shield explain <spec> --format json|markdown",
    summary: "Explain why this package raises extraction cost without claiming impossible security.",
  },
];

export const workflowShieldHighlights = [
  {
    title: "保护的是边界，不是神话",
    body: "Workflow Shield 不承诺绝对不可破解，它的目标是让调用比重组更划算，让隐藏逻辑始终留在更受控的地方。",
  },
  {
    title: "公开合同层，隐藏操作层",
    body: "输入输出、验证方式、可见资产可以公开；真正的 prompts、fallback branches、operator notes 不打进公开包。",
  },
  {
    title: "适合 Agent，也适合人类开发者",
    body: "Agent 可以读取 contract 和 verify 信息，人类开发者可以下载 package spec 和示例做集成。",
  },
];

export const workflowShieldSpecExample = `{
  "id": "shield-basic-bundle",
  "summary": "Protect a private workflow by exposing only the contract",
  "assets": [
    { "id": "workflow-contract", "kind": "manifest", "exposure": "public" },
    { "id": "operator-prompts", "kind": "prompt-pack", "exposure": "hidden" }
  ],
  "boundaries": [
    "Public consumers can inspect inputs, outputs, and validation checks.",
    "Hidden prompts are never bundled into the public package."
  ]
}`;
