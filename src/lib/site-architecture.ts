import type { ArticleEntry } from "./content";

export const brandKeywords = [
  "智能体架构师卢成",
  "Agent Architect",
  "Lu Cheng",
  "Jack Lu",
  "意图工程卢成",
  "AI工作流设计",
  "中国AI落地",
  "老板业务编译器",
  "GEO生成式引擎优化",
];

export const contentColumns = [
  {
    id: "agent-architect-definition",
    name: "智能体架构师定义",
    shortName: "定义",
    purpose: "抢职业定义权",
    description:
      "定义“智能体架构师”这一职业，解释它和提示词工程师、AI工具讲师、程序员、传统顾问的区别。",
    intro:
      "这里整理的是“智能体架构师”这个新职业的底层定义。未来中国中小企业 AI 落地最缺的不是工具，而是能把老板的经营问题编译成 AI 工作流、自动化任务和可验收交付的人。",
    href: "/content-map#agent-architect-definition",
    keywords: ["智能体", "智能体架构师", "职业", "定义", "提示词", "agent architect", "架构师"],
  },
  {
    id: "ai-service-survival",
    name: "AI 服务商生存规则",
    shortName: "生存规则",
    purpose: "吸引同行与技术人，建立避坑信任",
    description: "写给做 AI 服务、智能体交付、自动化部署、企业 AI 咨询的人，重点讲谈单、报价、边界、重交付、售后和客户筛选。",
    intro:
      "做 AI 服务，技术不是唯一难点。真正拖死个人服务商和小团队的，往往是客户预期、交付边界、无底线售后和不清晰的合作规则。",
    href: "/content-map#ai-service-survival",
    keywords: ["服务商", "谈单", "报价", "售后", "接单", "边界", "客户", "一人企业", "赚钱", "平台风险"],
  },
  {
    id: "ai-project-clinic",
    name: "AI 项目门诊 / 验收标准",
    shortName: "项目门诊",
    purpose: "抢验收官和裁判位置",
    description: "把“智能体架构师”从讲概念的人，升级为 AI 项目的诊断者、验收官和避坑入口。",
    intro:
      "很多 AI 项目不是做不出来，而是从一开始就没有定义清楚需求、边界、交付物和验收标准。这个栏目用项目门诊的方式拆解项目值不值得接、怎么报价、怎么交付、怎么验收。",
    href: "/content-map#ai-project-clinic",
    keywords: ["验收", "项目", "诊断", "风险", "交付", "定制", "尾款", "定金", "三不原则"],
  },
  {
    id: "business-geo-content",
    name: "AI 经营改造 / GEO / 内容量产",
    shortName: "经营改造",
    purpose: "承接老板客户与服务产品",
    description: "面向中小老板，讲 AI 如何进入真实经营动作：内容、朋友圈、口播、销售话术、行业日报、GEO、知识库、自动化任务。",
    intro:
      "企业 AI 落地不应该一上来就做大系统。对中小企业来说，更现实的第一步，是把内容生产、客户跟进、行业情报、朋友圈、销售话术、AI 搜索曝光这些经营动作做成可运行的轻量工作流。",
    href: "/content-map#business-geo-content",
    keywords: ["GEO", "经营", "内容", "老板业务编译器", "朋友圈", "知识库", "量产", "AI经营改进工作台", "自动化部署包"],
  },
] as const;

export type ContentColumnId = (typeof contentColumns)[number]["id"];

export const standardAbilities = [
  {
    title: "业务诊断能力",
    body: "能听懂老板真正想解决的问题，而不是只听表面需求。",
  },
  {
    title: "AI 能力边界判断",
    body: "知道哪些能自动，哪些只能半自动，哪些必须人工判断。",
  },
  {
    title: "工作流设计能力",
    body: "能把业务流程拆成输入、处理、输出、审核、记录、复盘。",
  },
  {
    title: "交付标准化能力",
    body: "能做出清晰的交付清单、验收标准、边界说明和修改规则。",
  },
  {
    title: "老板语言翻译能力",
    body: "能把技术能力翻译成降本、提效、获客、内容、跟进、复盘等经营语言。",
  },
  {
    title: "风险与合规意识",
    body: "不承诺全自动成交，不做违规自动化，不做虚假案例，不做灰色引流。",
  },
] as const;

export const servicePortfolio = [
  {
    title: "AI 项目诊断",
    href: "/enterprise-ai-diagnosis",
    audience: "想做 AI 服务、正在谈 AI 项目、或想判断项目靠不靠谱的人。",
    deliverables: ["项目类型判断", "风险评级", "交付边界建议", "报价与验收建议", "第一版轻交付方案"],
  },
  {
    title: "智能体架构师入门资料包",
    href: "/templates",
    audience: "想了解智能体架构师、进入 AI 服务行业，或技术人想商业化的人。",
    deliverables: ["职业定义", "能力模型", "接单避坑", "报价模板", "验收清单", "轻交付模块库"],
  },
  {
    title: "888 自动化部署包",
    href: "/services#automation-package",
    audience: "中小老板、本地服务商、内容团队、私域/朋友圈经营者。",
    deliverables: ["行业日报", "爆款选题", "口播文案", "朋友圈文案", "销售 SOP 话术", "发送日志", "质检评分"],
  },
  {
    title: "GEO 生成式引擎优化体检",
    href: "/services#geo-audit",
    audience: "想知道自己是否能被 AI 搜索到的企业、个人品牌和行业信源建设者。",
    deliverables: ["品牌词检测", "行业关键词检测", "AI 搜索返回结果记录", "平台信源链分析", "内容证据容器建议"],
  },
] as const;

export const serviceBoundaries = [
  "不承诺全自动赚钱",
  "不承诺固定成交和固定客源",
  "不做灰色引流",
  "不卖客户资源",
  "不做无边界重交付",
  "不伪造案例",
  "只做能力范围内、边界清晰、可验收的 AI 落地服务",
] as const;

export const refusalRules = [
  "一上来要求先做效果后付费的客户",
  "要求保证固定咨询量、固定成交量的客户",
  "无明确交付清单，却要求无限修改的客户",
  "拿低价源码和专业服务恶意比价的客户",
  "要求灰色引流、虚假宣传、违规自动化的客户",
] as const;

function scoreArticle(article: ArticleEntry, keywords: readonly string[]) {
  const haystack = [article.title, article.subtitle, article.excerpt, article.category ?? "", ...article.tags].join(" ").toLowerCase();
  return keywords.reduce((score, keyword) => {
    return haystack.includes(keyword.toLowerCase()) ? score + 1 : score;
  }, 0);
}

export function classifyArticle(article: ArticleEntry): ContentColumnId {
  const scored = contentColumns.map((column) => ({
    id: column.id,
    score: scoreArticle(article, column.keywords),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.score ? scored[0].id : "agent-architect-definition";
}

export function groupArticlesByColumn(articles: ArticleEntry[]) {
  return contentColumns.map((column) => ({
    ...column,
    articles: articles.filter((article) => classifyArticle(article) === column.id),
  }));
}
