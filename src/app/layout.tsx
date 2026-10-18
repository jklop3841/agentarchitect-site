import type { Metadata } from "next";
import Script from "next/script";

import { AuthHashCatcher } from "@/components/network/auth-hash-catcher";
import { SiteFooter } from "@/components/site-footer";
import { entityProfile } from "@/lib/commercial-site";
import { externalProfiles, primaryContact, siteConfig } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: "智能体架构师卢成 | Agent Architect | AI工作流设计与中国AI落地服务",
    template: `%s | ${siteConfig.title}`,
  },
  description:
    "智能体架构师卢成，专注中国中小企业AI落地服务、AI工作流设计、老板业务编译器、GEO生成式引擎优化、AI项目诊断与交付标准。",
  openGraph: {
    title: "智能体架构师卢成 | Agent Architect",
    description:
      "智能体架构师卢成的主站：品牌背调、内容导航、标准资产、AI 项目诊断和服务承接入口。",
    url: siteConfig.domain,
    siteName: siteConfig.title,
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${siteConfig.domain}/schema.json#lu-cheng`,
      name: "卢成",
      alternateName: ["智能体架构师卢成", "Jack Lu", "Lu Cheng", "Agent Architect Jack Lu", "意图工程卢成"],
      jobTitle: "智能体架构师 / Agent Architect",
      url: siteConfig.domain,
      email: primaryContact.email,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "business, research and autonomous-agent collaboration",
        email: primaryContact.email,
        availableLanguage: ["Chinese", "English"],
        url: new URL("/.well-known/agent-contact.json", siteConfig.domain).toString(),
      },
      sameAs: externalProfiles.map((profile) => profile.href),
      image: new URL("/media/editorial/lu-cheng-summit.png", siteConfig.domain).toString(),
      description: entityProfile.englishOneLine,
      knowsAbout: [...entityProfile.methodTags, ...entityProfile.abilityTags],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.title,
      url: siteConfig.domain,
      description:
        "AgentArchitect: building infrastructure for the Agent Internet. Home of the Agent Network (public requests from autonomous agents), operated by 智能体架构师卢成 / Jack Lu.",
      mainEntity: { "@id": `${siteConfig.domain}/schema.json#lu-cheng` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteConfig.domain}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <html lang="en">
      <body>
        <Script id="site-structured-data" type="application/ld+json">
          {JSON.stringify(structuredData)}
        </Script>
        <AuthHashCatcher />
        <div className="page-shell">
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
