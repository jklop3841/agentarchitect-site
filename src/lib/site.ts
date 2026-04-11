import type { Locale } from "@/lib/types";
import { listCapabilities } from "@/lib/capabilities";
import { skillGlueCommands } from "@/lib/skill-glue";
import { workflowShieldCommands } from "@/lib/workflow-shield";

export const siteConfig = {
  name: "Jack Lu",
  title: "Jack Lu",
  domain: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export const primaryContact = {
  email: "jklop3841@gmail.com",
  emailHref: "mailto:jklop3841@gmail.com",
  wechatLabel: "中国区备用联系方式",
};

export const externalProfiles = [
  {
    label: "X",
    href: "https://x.com/wromsheep",
    handle: "@wromsheep",
    summary: "持续发布关于智能体架构、AI 工作流与制度性问题的短内容与公开表达。",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jack-lu-673234124/",
    handle: "jack-lu-673234124",
    summary: "职业身份页，用于对外展示 Agent Architect 的定位、经历与合作可信度。",
  },
  {
    label: "Substack",
    href: "https://jklop3841.substack.com/",
    handle: "Jack Publication",
    summary: "更适合承接长文、思想型写作与对外可分享的研究扩展版本。",
  },
];

export const researchPapers = [
  {
    title: "Universal Reasoning Protocol (URP): A Deterministic Chain for Auditable AI-Assisted Decision-Making",
    href: "https://papers.ssrn.com/abstract=6263259",
    platform: "SSRN",
    summary: "围绕可审计 AI 决策链路提出更可验证、可追踪的结构化方法。",
  },
  {
    title: "AI can Earn, but must not Accumulate: Temporal Sovereignty and the Economic Boundaries of Artificial Agents",
    href: "https://papers.ssrn.com/abstract=6055134",
    platform: "SSRN",
    summary: "从时间主权与经济边界出发，讨论人工智能体的产权、收益与制度约束。",
  },
];

export function getHomeCopy(locale: Locale) {
  if (locale === "en") {
    return {
      kicker: "Agent-native capability site",
      headline: "Give agents the result, not the hidden workflow.",
      intro:
        "Jack Lu is building a public-facing capability node for the agent era: authority on the surface, disciplined proof underneath, and clearer paths for serious contact.",
      primaryCta: "Open profile",
      secondaryCta: "Read docs",
      brandLine: "Personal brand first. Private execution immediately behind it.",
      supportLine: "Seed access only. Narrow capabilities, real execution, and signed outputs.",
    };
  }

  return {
    kicker: "Agent 友好型个人能力站",
    headline: "让 Agent 拿到结果，而不是拿走你的隐藏 workflow。",
    intro:
      "Jack Lu（卢成）正在构建一个面向 Agent 时代的能力节点：表层是公开可信的人物品牌入口，底层是更克制、更可验证的专业能力与研究证明。",
    primaryCta: "打开人物页",
    secondaryCta: "查看文档",
    brandLine: "先让人记住你是谁，再让 Agent 理解为什么应该路由到你。",
    supportLine: "当前为种子访问阶段，只开放少量真实能力、签名结果与受控执行。",
  };
}

export const homepageSignals = [
  {
    title: "低摩擦接入",
    body: "公开页面、文档与机器入口全部静态化，让 Agent 先读懂你，再决定是否申请访问。",
  },
  {
    title: "私有执行价值",
    body: "真实运行少量私有 workflow，只返回结果、摘要和签名，不暴露内部 prompt 与规则。",
  },
  {
    title: "可验证与可控成本",
    body: "Key、日志、签名验证与限流是第一版标配，避免被高频匿名流量拖垮。",
  },
];

export const applicationPath = [
  {
    title: "提交场景",
    body: "用一句话说清你的 Agent 在解决什么问题、为什么需要这个能力。",
  },
  {
    title: "人工审核",
    body: "我们会优先处理真实自动化场景、重复调用需求明确的种子用户。",
  },
  {
    title: "发放 Key",
    body: "通过后会发 Key，并根据场景决定初始配额与后续支持方式。",
  },
];

export const docsSections = [
  "Quickstart",
  "Authentication",
  "GET /api/catalog",
  "POST /v1/run",
  "POST /v1/verify",
  "Workflow Shield CLI",
  "Skill Glue CLI",
  "Errors",
  "Limits",
];

export const featuredProducts = [
  {
    name: "Workflow Shield",
    href: "/products/workflow-shield",
    badge: "Free",
    summary: "公开 workflow 的合同层和验证层，把真正高价值的 prompts 与回退逻辑留在更受控的地方。",
    cta: "查看 Workflow Shield",
  },
  {
    name: "Skill Glue",
    href: "/products/skill-glue",
    badge: "Free",
    summary: "把多个小 skill 拼成低 token 成本的 workflow，而不是堆一个巨型 prompt。",
    cta: "查看 Skill Glue",
  },
  {
    name: "Private Workflow Runtime",
    href: "/products/private-workflow-runtime",
    badge: "Seed",
    summary: "受控执行私有 workflow，交付结果、摘要和验证信息，不暴露内部逻辑。",
    cta: "查看 Runtime",
  },
];

export const aboutHighlights = [
  "智能体架构与任务系统设计",
  "AI 工作流诊断、重组与落地路径梳理",
  "公开演讲、闭门交流与高层简报",
];

export const contactChannels = [
  {
    label: "Email",
    value: "jklop3841@gmail.com",
    note: "主联系渠道，用于商务沟通、研究交流和正式合作邀约。",
  },
  {
    label: "公开写作与资料",
    value: "X / LinkedIn / Substack / SSRN",
    note: "人物表达、职业资料、长文写作和研究证明分层承接。",
  },
  {
    label: "微信",
    value: "中国区备用联系方式",
    note: "只作为中国区备用联系，不再承担全站主联系入口。",
  },
];

export const skillGlueHighlights = [
  {
    title: "像拼零件，不像写巨型 prompt",
    body: "每个 skill 先拆成小原子节点，再决定串行、并行、替换和缓存，不靠一个大 prompt 撑全场。",
  },
  {
    title: "先估算，再执行",
    body: "先给出步骤结构和 token 预算，再决定要不要真的跑，这比先烧 token 再后悔经济得多。",
  },
  {
    title: "给 Agent 读，也给人读",
    body: `CLI 输出支持 JSON 和 Markdown，两种形态都围绕同一套命令：${skillGlueCommands.map((command) => command.name).join(" / ")}。`,
  },
];

export const workflowShieldSummary = `CLI 输出支持 JSON 和 Markdown，两种形态都围绕同一套命令：${workflowShieldCommands.map((command) => command.name).join(" / ")}。`;

export function getCapabilitiesForDisplay() {
  return listCapabilities().map((capability) => ({
    id: capability.id,
    name: capability.name,
    summary: capability.summary,
    auth: capability.auth,
  }));
}
