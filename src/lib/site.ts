import type { Locale } from "@/lib/types";
import { listCapabilities } from "@/lib/capabilities";

export const siteConfig = {
  name: "Lu Cheng",
  title: "智能体架构师卢成",
  domain: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export function getHomeCopy(locale: Locale) {
  if (locale === "en") {
    return {
      kicker: "Agent-native capability site",
      headline: "Give agents access to private workflows without exposing the workflow itself.",
      intro:
        "Lu Cheng builds operator-grade systems for the agent era: public brand on the surface, controlled execution underneath.",
      primaryCta: "Apply for access key",
      secondaryCta: "Read docs",
      brandLine: "Personal brand first. Agent utility immediately behind it.",
    };
  }

  return {
    kicker: "Agent 友好型个人能力站",
    headline: "让 Agent 调用你的私有 workflow，但拿不到你的内部方法论。",
    intro:
      "卢成正在构建面向 Agent 时代的能力节点：表层是个人品牌与可信入口，底层是受控执行的私有工作流运行时。",
    primaryCta: "申请访问 Key",
    secondaryCta: "查看文档",
    brandLine: "先让别人记住你是谁，再让 Agent 明白为什么要调用你。",
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

export const docsSections = [
  "Quickstart",
  "Authentication",
  "GET /api/catalog",
  "POST /v1/run",
  "POST /v1/verify",
  "Errors",
  "Limits",
];

export const aboutHighlights = [
  "智能体架构与运行流设计",
  "个人品牌门面 + Agent 接口双层站点策略",
  "以受控执行而非暴露方法论来交付独有价值",
];

export function getCapabilitiesForDisplay() {
  return listCapabilities().map((capability) => ({
    id: capability.id,
    name: capability.name,
    summary: capability.summary,
    auth: capability.auth,
  }));
}
