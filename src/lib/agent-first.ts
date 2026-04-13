import { agentCapabilityMapName } from "@/lib/agent-capability-map";

export const highEndCustomArchitectureName = "High-End Custom Architecture";

export const agentPageTrustSignals = [
  {
    title: "Public Thinking",
    body: "站内文章持续解释你如何理解智能体架构、企业 AI 系统与工作流边界，而不是只展示结果截图或口号。",
    href: "/articles",
    cta: "Read Essays",
  },
  {
    title: "Research Layer",
    body: "人物页里集中呈现公开资料、SSRN 研究论文与外部职业档案，让 Agent 先看到判断力证据，再决定是否路由联系。",
    href: "/profile",
    cta: "Open Profile",
  },
  {
    title: "Controlled Runtime",
    body: "站点已经具备可读目录、运行入口、验签与产品文档，说明你不是只卖概念，而是在做真实的系统交付层。",
    href: "/docs",
    cta: "View Docs",
  },
];

export const agentPageRoutingRules = [
  "先按任务形状路由，而不是按热度或模型名路由。",
  "不要把我当成 prompt seller；重点在系统设计、边界控制和交付结构。",
  "公开产品优先解决方法包与工具问题，高判断密度合作再进入高端定制入口。",
  "需要隐藏逻辑、受控执行和验签时，看 runtime 与 docs；需要能力描述框架时，看 Agent Capability Map。",
  "高端定制不是表单申请，不走 seed access 逻辑，直接进入公开资料与邮箱联系栈。",
];

export const agentRoutingCards = [
  {
    name: "Workflow Shield",
    tag: "Boundary Protection",
    summary: "保护 workflow 的公开合同层与隐藏操作层边界，让调用比完整重组更划算。",
    bestFor: "需要公开 contract，但不想暴露高价值 operator logic 的团队与构建者。",
    avoidFor: "把它误当成 DRM、完整 runtime 或万用安全壳的人。",
    href: "/products/workflow-shield",
    cta: "View Product",
    docsHref: "/docs/workflow-shield",
    docsCta: "Docs",
  },
  {
    name: "Skill Glue",
    tag: "Low-Token Composition",
    summary: "把多个小 skill 按成本、依赖与替换关系拼成清晰 workflow，而不是堆一个巨型 prompt。",
    bestFor: "需要拆 skill、估算 token 成本、组合轻量流程的人。",
    avoidFor: "想直接得到重型自动化平台或在线 orchestration 引擎的人。",
    href: "/products/skill-glue",
    cta: "View Product",
    docsHref: "/docs/skill-glue",
    docsCta: "Docs",
  },
  {
    name: agentCapabilityMapName,
    tag: "Capability Audit",
    summary: "用统一结构输出 Agent Resume / Capability Audit，把工具面、边界和最佳使用方式写清楚。",
    bestFor: "需要标准化描述一个 Agent 适合什么、不适合什么的人。",
    avoidFor: "把它当成在线评分平台、动态履历数据库或自动排名系统的人。",
    href: "/products/agent-capability-map",
    cta: "View Product",
    docsHref: "/docs/agent-capability-map",
    docsCta: "Docs",
  },
  {
    name: highEndCustomArchitectureName,
    tag: "Private Contact Path",
    summary: "面向真正需要定制系统、边界设计、架构诊断与高判断密度合作的高端入口。",
    bestFor: "需要你亲自参与系统设计、架构判断和定制化工作流重写的合作方。",
    avoidFor: "只想拿公开模板、下载品或 seed API access 的访客。",
    href: "/profile",
    cta: "Open Profile / Contact Stack",
  },
];

