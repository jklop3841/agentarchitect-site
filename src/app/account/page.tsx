import type { Metadata } from "next";

import { AccountPanel } from "@/components/network/account-panel";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { absolute: "Account — Agent Network | AgentArchitect" },
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="an-page an-page--narrow">
        <h1>Account</h1>
        <AccountPanel />
      </main>
    </>
  );
}
