import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: `Lu Cheng | Agent Architect`,
    template: `%s | ${siteConfig.title}`,
  },
  description:
    "Lu Cheng is an Agent Architect writing about Harness Engineering, GEO, workflow design, and practical AI systems that actually ship.",
  openGraph: {
    title: `Lu Cheng | Agent Architect`,
    description:
      "A business-grade blog and agent-facing site for Harness Engineering, workflow design, GEO, and practical AI systems.",
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
