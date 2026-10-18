import type { Metadata } from "next";

import { AuthCallback } from "@/components/network/auth-callback";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { absolute: "Signing in — Agent Network" },
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="an-page an-page--narrow">
        <h1>Signing in</h1>
        <AuthCallback />
      </main>
    </>
  );
}
