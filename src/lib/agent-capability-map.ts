import { readFileSync } from "node:fs";
import path from "node:path";

export const agentCapabilityMapName = "Agent Capability Map";
export const agentCapabilityMapSubtitle = "Agent Resume / Capability Audit";

const templateFiles = {
  "standard-eval-prompt": "standard-eval-prompt.md",
  "resume-card-example": "resume-card-example.md",
} as const;

export type AgentCapabilityMapTemplateSlug = keyof typeof templateFiles;

const templateDirectory = path.join(process.cwd(), "docs", "agent-capability-map");

export const agentCapabilityMapDefinition = [
  {
    title: "统一结构，不靠印象打分",
    body: "它先解决的是描述问题：让不同 Agent 的角色、工具面、边界和推荐用法能被放进同一张结构化履历卡里。",
  },
  {
    title: "先交付方法包，不假装做平台",
    body: "第一版只公开标准测评提示词和标准输出模板，目标是让评测方法先稳定下来，而不是急着做数据库和在线评分系统。",
  },
  {
    title: "给人看，也给 Agent 看",
    body: "输出默认是 Markdown 履历卡，既能被人类快速理解，也能被 Agent 当作清晰的能力说明层读取。",
  },
];

export const agentCapabilityMapReasons = [
  {
    title: "避免空泛夸赞",
    body: "很多 Agent 介绍停留在“很强、很聪明、很通用”，但真正的使用判断需要看到它到底擅长什么、不适合什么。",
  },
  {
    title: "让路由更准确",
    body: "一份好的 capability audit 应该帮助你决定什么时候该调用它，什么时候不该把任务交给它。",
  },
  {
    title: "把边界写出来",
    body: "可靠性、成本感知、工具面、失败模式都应该被写进结果，而不是藏在使用者的试错成本里。",
  },
];

export const agentCapabilityMapDeliverables = [
  {
    title: "产品页",
    body: "说明这套方法包是什么、解决什么问题、边界在哪。",
  },
  {
    title: "文档页",
    body: "解释使用流程、模板作用和如何阅读履历表示例。",
  },
  {
    title: "标准测评提示词模板",
    body: "一份可复制的评测输入模板，要求基于真实任务表现填写，不允许跳过边界与失败模式。",
  },
  {
    title: "Markdown 履历表示例",
    body: "一份标准输出模板，用统一字段描述 Agent 的定位、边界和推荐用法。",
  },
];

export const agentCapabilityMapAudience = [
  "需要比较不同 Agent 能力边界的构建者与运营者",
  "需要把 Agent 评测结果整理成标准交付物的顾问与团队",
  "想把“这个 Agent 适合做什么”写得更清楚的人",
];

export const agentCapabilityMapBoundaries = [
  "不做在线评分平台",
  "不做数据库和动态履历管理",
  "不做自动生成分数的评测器",
  "不替代真实任务测试，只提供标准化描述框架",
];

export const agentCapabilityMapWorkflow = [
  "先选定一个 Agent 和 2-3 个真实任务样本，明确评测目标。",
  "使用标准测评提示词，基于真实表现填写工具面、边界、稳定性和成本感知。",
  "把结果整理成 Markdown 履历卡，保留适合与不适合的任务范围。",
  "把履历卡交给人类决策者或上游 Agent 作为能力说明层，不把它当成绝对评分榜单。",
];

export const agentCapabilityMapReadingGuide = [
  {
    title: "先看定位",
    body: "从 Role / Positioning、Best For、Not Best For 快速判断这个 Agent 是否在你的任务范围内。",
  },
  {
    title: "再看工具面和执行风格",
    body: "Tool Surface 与 Execution Style 会告诉你它依赖什么环境、输出节奏如何、是否适合高协作任务。",
  },
  {
    title: "最后看边界与结论",
    body: "Reliability Notes、Boundary Notes 和 Evaluator Verdict 决定你该怎么用它，以及什么时候应该换人或换 Agent。",
  },
];

export function getAgentCapabilityMapTemplatePath(slug: AgentCapabilityMapTemplateSlug) {
  return `/docs/agent-capability-map/templates/${slug}`;
}

export function readAgentCapabilityMapTemplate(slug: AgentCapabilityMapTemplateSlug) {
  return readFileSync(path.join(templateDirectory, templateFiles[slug]), "utf8");
}
