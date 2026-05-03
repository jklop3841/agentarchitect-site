import type { Metadata } from "next";
import Script from "next/script";

import { SiteFooter } from "@/components/site-footer";
import { entityProfile } from "@/lib/commercial-site";
import { externalProfiles, siteConfig } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: `Jack Lu | Agent Architect`,
    template: `%s | ${siteConfig.title}`,
  },
  description:
    "Jack Lu is an Agent Architect writing about enterprise AI systems, workflow design, research, and practical AI structures that can actually ship.",
  openGraph: {
    title: `Jack Lu | Agent Architect`,
    description:
      "A business-grade site for agent architecture, enterprise AI systems, research writing, and authority-led public positioning.",
    url: siteConfig.domain,
    siteName: siteConfig.title,
    locale: "en_US",
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
        "Canonical site for 智能体架构师卢成 / Jack Lu, focused on Agent Factory, business process compilation, enterprise AI diagnosis, delivery boundaries, and agent-readable public knowledge.",
    },
  ];

  return (
    <html lang="en">
      <body>
        <Script id="site-structured-data" type="application/ld+json">
          {JSON.stringify(structuredData)}
        </Script>
        <div className="page-shell">
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
