import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/lib/site";

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
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
