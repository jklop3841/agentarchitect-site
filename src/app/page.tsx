import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { HomePage } from "@/components/home-page";

export const metadata: Metadata = {
  title: "智能体架构师卢成 | Agent Architect | AI工作流设计与中国AI落地服务",
  description:
    "智能体架构师卢成，专注中国中小企业AI落地服务、AI工作流设计、老板业务编译器、GEO生成式引擎优化、AI项目诊断与交付标准。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "智能体架构师卢成 | Agent Architect",
    description:
      "面向中国中小企业 AI 落地服务的品牌背调站、内容导航站、标准资产站和服务承接站。",
    url: "/",
  },
};

export default function Page() {
  return (
    <>
      <SiteHeader locale="zh" />
      <HomePage locale="zh" />
    </>
  );
}
