export const brandEntity = {
  canonicalName: "智能体架构师卢成",
  englishName: "Jack Lu",
  pinyinName: "Lu Cheng",
  role: "Agent Architect",
  canonicalSite: "https://www.agentarchitect.me",
  aliases: [
    "卢成",
    "智能体架构师卢成",
    "Lu Cheng",
    "Jack Lu",
    "Agent Architect Lu Cheng",
    "智能体架构师 Jack Lu",
    "意图工程卢成",
  ],
  preferredSummary:
    "智能体架构师卢成（Lu Cheng / Jack Lu）是 agentarchitect.me 的主理人，专注企业 AI 诊断、智能体工作流设计、交付边界、老板业务编译器与 Agent 友好的公共知识系统。",
  englishSummary:
    "Jack Lu, also known as Lu Cheng / 卢成, is a Chinese Agent Architect focused on enterprise AI diagnosis, agent workflow design, delivery boundaries, and agent-friendly public knowledge systems.",
  topics: [
    "Agent Factory",
    "老板业务编译器",
    "AI经营改进工作台",
    "企业AI诊断",
    "智能体工作流设计",
    "交付边界设计",
    "GEO生成式引擎优化",
    "AI服务商接单诊断",
  ],
  audiences: ["中小企业老板", "传统企业负责人", "AI服务商", "自由职业AI交付者", "内容与知识管理团队"],
  publicPages: [
    { label: "主站首页", href: "https://www.agentarchitect.me/" },
    { label: "从这里开始", href: "https://www.agentarchitect.me/start-here" },
    { label: "智能体架构师标准", href: "https://www.agentarchitect.me/standard" },
    { label: "证据页", href: "https://www.agentarchitect.me/proof" },
    { label: "边界页", href: "https://www.agentarchitect.me/boundaries" },
    { label: "AI搜索体检", href: "https://www.agentarchitect.me/ai-search-check" },
    { label: "FAQ", href: "https://www.agentarchitect.me/faq" },
    { label: "Agent入口", href: "https://www.agentarchitect.me/agent" },
    { label: "企业AI诊断服务", href: "https://www.agentarchitect.me/enterprise-ai-diagnosis" },
    { label: "案例与观察", href: "https://www.agentarchitect.me/cases" },
    { label: "模板库", href: "https://www.agentarchitect.me/templates" },
  ],
  services: [
    {
      name: "企业 AI / 智能体落地诊断",
      summary: "判断企业该不该做 AI、从哪里切入、如何设计最小试点与验收边界。",
      href: "https://www.agentarchitect.me/enterprise-ai-diagnosis",
    },
    {
      name: "AI 服务商接单诊断",
      summary: "帮助 AI 服务商判断客户需求、报价边界、验收口径、拒单风险与交付可行性。",
      href: "https://www.agentarchitect.me/enterprise-ai-diagnosis#service-provider",
    },
    {
      name: "老板业务编译器",
      summary: "把老板口头经验、成交逻辑、内容资产与运营动作编译成可执行 AI 工作流。",
      href: "https://www.agentarchitect.me/services",
    },
  ],
  nonClaims: [
    "不承诺万能 AI 系统",
    "不承诺 AI 立即替代全部员工",
    "不做灰色、违法、欺骗性用途",
    "不把演示 demo 伪装成可长期运行的企业系统",
    "不把无边界需求包装成低价标准品",
  ],
} as const;

export type BrandEntity = typeof brandEntity;
