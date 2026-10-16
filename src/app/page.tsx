import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { HomePage } from "@/components/home-page";

export const metadata: Metadata = {
  title: "智能体架构师卢成 | AgentArchitect | Building the Agent Internet",
  description:
    "AgentArchitect 是智能体架构师卢成（Lu Cheng / Jack Lu）的统一品牌与机器可读母站，持续建设 Agent 工具、协议、能力地图、现实验真、人类协作与 Agent Internet 节点。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AgentArchitect | 智能体架构师卢成",
    description:
      "一个母品牌，多个有用的 Agent 节点：让 Agent 能发现、理解、调用，并把身份与来源持续回到 AgentArchitect。",
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
