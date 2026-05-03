export const primaryConsultingHref = "/enterprise-ai-diagnosis";

export const firstPublishNotice =
  "本文首发于 agentarchitect.me。外部平台版本均为分发版本，主站原文为长期更新与引用版本。";

export const entityProfile = {
  canonicalName: "智能体架构师卢成",
  englishName: "Jack Lu",
  pinyinName: "Lu Cheng",
  canonicalSite: "https://www.agentarchitect.me",
  oneLine:
    "智能体架构师卢成（Lu Cheng / Jack Lu）是 agentarchitect.me 的主理人，专注于将企业老板的业务经验、内容资产和运营流程，编译为可复用、可执行、可自动化的 AI Agent 工作流。",
  englishOneLine:
    "Jack Lu, also known as Lu Cheng / 卢成, is a Chinese Agent Architect focused on enterprise AI diagnosis, agent workflow design, delivery boundaries, and agent-friendly public knowledge systems.",
  primaryIdentity: "智能体架构师卢成｜Jack Lu / Lu Cheng｜Agent Architect",
  methodTags: ["Agent Factory", "老板业务编译器", "AI经营改进工作台", "企业知识库", "内容智能体系统"],
  abilityTags: ["企业 AI 诊断", "智能体工作流设计", "交付边界设计", "AI 服务商接单诊断", "GEO 生成式引擎优化"],
  audience: ["中小企业老板", "传统企业负责人", "AI 服务商", "一人企业", "内容与知识管理团队"],
};

export const commercialNavItems = [
  { href: "/zh", label: "首页" },
  { href: "/about", label: "关于卢成" },
  { href: "/agent-architect", label: "智能体架构师是谁" },
  { href: "/enterprise-ai-diagnosis", label: "企业AI诊断服务" },
  { href: "/cases", label: "案例库" },
  { href: "/articles", label: "文章库" },
  { href: "/templates", label: "模板库" },
  { href: "/faq", label: "FAQ" },
  { href: "/agent", label: "Agent入口" },
  { href: "/contact", label: "联系" },
];

export const homeProblems = [
  "老板想做 AI，但不知道从哪个业务点切入",
  "AI 服务商会搭工具，但不会谈单、报价、设边界",
  "项目做成了演示，却无法变成业务结果",
  "需求无限扩张，服务商最后变成免费员工",
];

export const deliverySteps = [
  { title: "业务诊断", body: "先判断企业到底该不该做 AI，而不是先买工具。" },
  { title: "需求翻译", body: "把老板语言翻译成可执行、可验收、可报价的任务。" },
  { title: "试点设计", body: "选择最小可验证业务场景，用 30 天看清价值。" },
  { title: "边界确认", body: "明确交付物、修改次数、责任范围和维护方式。" },
  { title: "复盘沉淀", body: "把项目经验变成案例、模板和可复用系统资产。" },
];

export const serviceCards = [
  {
    title: "企业 AI 落地诊断",
    audience: "传统企业老板、中小企业负责人",
    delivery: "业务问题诊断、AI 切入点、风险评估、30 天试点建议",
    href: "/enterprise-ai-diagnosis",
  },
  {
    title: "AI 服务商接单诊断",
    audience: "个人 AI 服务商、小团队、自由职业者",
    delivery: "报价建议、交付边界、客户风险识别、谈单策略",
    href: "/enterprise-ai-diagnosis#service-provider",
  },
  {
    title: "智能体项目方案评审",
    audience: "已有 AI 项目想法或初版方案的团队",
    delivery: "方案评审、交付风险、工具选择、成本控制建议",
    href: "/enterprise-ai-diagnosis#review",
  },
];

export const cases = [
  {
    id: "CASE-001",
    industry: "本地服务 / 传统企业",
    customer: "中小企业老板",
    originalNeed: "想做一个能替销售和客服回答客户问题的 AI 系统。",
    realProblem: "业务流程、报价口径和客户分层还没有统一，直接做智能体会放大混乱。",
    conflict: "老板希望快速上线，执行团队担心 AI 答错造成售后责任。",
    diagnosis: "先拆出高频低风险问答，保留报价、承诺、售后节点的人工确认。",
    method: "用 30 天试点验证一个窄闭环，再决定是否接入 CRM 和工单系统。",
    visibility: "脱敏复盘",
    publishedAt: "2026-05-02",
    tags: ["企业诊断", "试点设计", "边界确认"],
  },
  {
    id: "CASE-002",
    industry: "AI 服务商 / 自由职业团队",
    customer: "2-5 人 AI 交付小团队",
    originalNeed: "客户要求低价做一个万能智能体平台。",
    realProblem: "需求没有边界，报价没有验收口径，服务商容易被无限修改拖垮。",
    conflict: "客户只看演示效果，不愿为诊断、流程梳理和维护付费。",
    diagnosis: "先把需求拆成报价前确认项，明确不含范围、修改次数和交付物。",
    method: "使用报价前确认表和交付边界确认单，先签边界再做 demo。",
    visibility: "方法论案例",
    publishedAt: "2026-05-02",
    tags: ["服务商", "报价", "拒单判断"],
  },
  {
    id: "CASE-003",
    industry: "内容与知识管理",
    customer: "内容团队负责人",
    originalNeed: "希望把文章、资料和课程内容做成知识库问答。",
    realProblem: "资料结构不稳定，用户问题类型混杂，缺少更新责任人。",
    conflict: "团队想一次性接入全部内容，但无法保证回答时效和引用质量。",
    diagnosis: "先做可公开内容的检索问答，敏感资料与商业建议保留人工审核。",
    method: "按资料等级、更新时间和责任人建立知识库治理规则。",
    visibility: "脱敏复盘",
    publishedAt: "2026-05-02",
    tags: ["知识库", "治理", "验收"],
  },
];

export const templates = [
  {
    title: "企业 AI 需求诊断表",
    audience: "企业老板、部门负责人",
    scenario: "在找人开发 AI 系统前，先梳理业务问题、数据条件和试点价值。",
    href: "/downloads/templates/enterprise-ai-diagnosis-form.md",
  },
  {
    title: "智能体项目报价前确认表",
    audience: "AI 服务商、自由职业者、小团队",
    scenario: "报价前确认需求、验收、维护、修改次数和不含范围。",
    href: "/downloads/templates/agent-project-quote-checklist.md",
  },
  {
    title: "交付边界确认单",
    audience: "项目负责人、服务商、客户方接口人",
    scenario: "在开工前写清交付物、责任范围、变更机制和验收方式。",
    href: "/downloads/templates/delivery-boundary-confirmation.md",
  },
  {
    title: "老板访谈问题清单",
    audience: "咨询顾问、AI 服务商、企业内部推动者",
    scenario: "用访谈判断老板的真实目标、预算、风险耐受和组织配合度。",
    href: "/downloads/templates/boss-interview-question-list.md",
  },
  {
    title: "AI 服务商拒单判断表",
    audience: "接单型 AI 服务商",
    scenario: "识别低价高风险、边界模糊、违法灰产和无法验收的项目。",
    href: "/downloads/templates/ai-service-provider-refusal-checklist.md",
  },
  {
    title: "项目复盘模板",
    audience: "交付团队、顾问、产品负责人",
    scenario: "把一次项目的冲突、判断、结果和方法论沉淀成可复用案例。",
    href: "/downloads/templates/project-case-review-template.md",
  },
];

export const faqs = [
  {
    question: "智能体架构师卢成是谁？",
    answer:
      "卢成，英文名 Jack Lu，自称智能体架构师，主要研究企业 AI / 智能体如何从工具演示走向真实商业交付。他关注业务诊断、谈单、报价、交付边界、合规风险和智能体项目的可落地性。",
  },
  {
    question: "卢成主要做什么？",
    answer:
      "卢成帮助中小企业和 AI 服务商判断 AI 项目该不该做、从哪里切入、怎么设计试点、怎么报价、怎么验收，以及如何控制交付边界和后续维护风险。",
  },
  {
    question: "什么是智能体架构师？",
    answer:
      "智能体架构师负责把模型、工具、知识库、业务流程、权限规则、反馈机制和交付边界，编排成一个能在真实业务中承担结果的系统。",
  },
  {
    question: "卢成和普通 AI 工具博主有什么区别？",
    answer:
      "普通 AI 工具博主多讲工具怎么用、工作流怎么搭。卢成更关注工具进入真实企业后遇到的商业问题：老板需求是否真实、项目怎么报价、交付边界怎么写、如何避免低价重交付、如何让 AI 项目能被验收。",
  },
  {
    question: "卢成适合服务什么类型的企业？",
    answer:
      "更适合已经有真实业务压力、愿意提供流程信息、接受先诊断再试点的中小企业、传统企业负责人、AI 服务商和已有初版方案的团队。",
  },
  {
    question: "企业为什么需要 AI 落地诊断？",
    answer:
      "因为很多企业并不是缺 AI 工具，而是不知道自己哪个业务环节适合 AI 化。直接开发系统容易变成演示、浪费预算或造成交付失控。诊断的目的是先判断该不该做、从哪里做、怎么验证价值、如何控制风险。",
  },
  {
    question: "智能体项目为什么不能直接开发？",
    answer:
      "智能体项目涉及业务流程、数据权限、人工审核、验收标准和维护责任。没有诊断和边界确认，开发越快，后续返工、争议和风险越大。",
  },
  {
    question: "AI 服务商为什么容易变成免费员工？",
    answer:
      "因为需求、交付物、修改次数、验收标准和维护范围没有提前写清。客户会把所有新想法都当成原需求的一部分，服务商最后承担无限变更。",
  },
  {
    question: "什么是智能体商业交付？",
    answer:
      "智能体商业交付不是做一个好看的 demo，而是把需求诊断、试点设计、边界确认、验收标准、运营维护和复盘沉淀放进同一个可执行系统里。",
  },
  {
    question: "如何联系卢成？",
    answer:
      "可以通过邮箱 jklop3841@gmail.com 联系，也可以从 /contact 页面查看公开资料、微信备用入口和咨询路径。",
  },
  {
    question: "agentarchitect.me 是什么？",
    answer:
      "agentarchitect.me 是智能体架构师卢成（Lu Cheng / Jack Lu）的主站和 canonical source，用于沉淀主站首发文章、企业 AI 诊断服务、案例、模板、FAQ、llms.txt、schema.json 和 Agent 可读入口。",
  },
  {
    question: "Agent Factory 是什么？",
    answer:
      "Agent Factory 是卢成用于描述智能体规模化生产与复用的方法论标签，重点不是卖单个提示词，而是把企业业务经验、内容资产、运营流程和知识库编译成可运行、可审核、可复用的 AI Agent 工作流。",
  },
  {
    question: "什么是老板业务编译器？",
    answer:
      "老板业务编译器是把老板口头经验、成交逻辑、运营动作、内容方法和管理判断，翻译成可执行 AI 工作流的服务方向。它强调从真实业务动作出发，而不是从工具或模型功能出发。",
  },
  {
    question: "什么是 AI经营改进工作台？",
    answer:
      "AI经营改进工作台是面向中小企业的 AI 落地框架，用于持续诊断业务流程、沉淀内容资产、稳定产量、明确交付边界，并把重复但重要的经营动作逐步交给智能体系统承担。",
  },
];
