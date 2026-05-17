import Link from "next/link";

import { commercialNavItems } from "@/lib/commercial-site";

type SiteHeaderProps = {
  locale?: "zh" | "en";
};

export function SiteHeader({ locale = "zh" }: SiteHeaderProps) {
  const isEnglish = locale === "en";
  const homeHref = isEnglish ? "/en" : "/";
  const contactHref = "/contact";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href={homeHref} className="brandmark">
          <span className="brandmark__mono">LC</span>
          <span>
            <strong>Jack Lu</strong>
            <small>{isEnglish ? "Agent Architect" : "卢成 · 智能体架构师"}</small>
          </span>
        </Link>
        <nav className="site-nav">
          {isEnglish ? (
            <>
              <Link href="/en">Home</Link>
              <Link href="/start-here">Start here</Link>
              <Link href="/standard">Standard</Link>
              <Link href="/content-map">Content map</Link>
              <Link href="/services">Services</Link>
              <Link href="/cases">Cases</Link>
              <Link href="/agent-architect">Agent Architect</Link>
              <Link href="/about">About</Link>
            </>
          ) : (
            commercialNavItems.slice(1, 9).map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))
          )}
          <div className="language-switch">
            <Link href="/en" className={isEnglish ? "is-active" : undefined}>
              EN
            </Link>
            <Link href="/" className={!isEnglish ? "is-active" : undefined}>
              中文
            </Link>
          </div>
          <Link href={contactHref} className="site-nav__cta">
            {isEnglish ? "Contact" : "联系方式"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
