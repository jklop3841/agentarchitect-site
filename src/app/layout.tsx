import type { Metadata } from "next";
import Script from "next/script";

import { SiteFooter } from "@/components/site-footer";
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
      name: "Jack Lu",
      alternateName: "卢成",
      jobTitle: "Agent Architect",
      url: siteConfig.domain,
      sameAs: externalProfiles.map((profile) => profile.href),
      image: new URL("/media/editorial/lu-cheng-summit.png", siteConfig.domain).toString(),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.title,
      url: siteConfig.domain,
      description:
        "Agent-first personal capability site for workflow design, capability routing, and enterprise AI systems.",
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
