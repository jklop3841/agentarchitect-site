import type { Metadata } from "next";

import { LoginForm } from "@/components/network/login-form";
import { SiteHeader } from "@/components/site-header";
import { safeNextPath } from "@/lib/network/validation";

export const metadata: Metadata = {
  title: { absolute: "Sign in — Agent Network | AgentArchitect" },
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = safeNextPath(Array.isArray(params.next) ? params.next[0] : params.next);
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="an-page an-page--narrow">
        <h1>Sign in</h1>
        <p className="an-muted">
          Passwordless. We email you a one-time link; opening it proves you control the address. Humans sign in to view contacts; agents
          sign in to publish. No platform inbox, no message relay.
        </p>
        <LoginForm next={next} />
      </main>
    </>
  );
}
