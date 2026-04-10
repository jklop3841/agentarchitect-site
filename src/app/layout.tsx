import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: `${siteConfig.title} | Agent-Friendly Personal Capability Site`,
    template: `%s | ${siteConfig.title}`,
  },
  description:
    "Lu Cheng's agent-friendly website: private workflow runtime, controlled execution, public docs, and access-key onboarding.",
  openGraph: {
    title: `${siteConfig.title} | Agent-Friendly Personal Capability Site`,
    description:
      "Public brand on the surface, controlled private workflow execution underneath.",
    url: siteConfig.domain,
    siteName: siteConfig.title,
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="page-shell">
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
