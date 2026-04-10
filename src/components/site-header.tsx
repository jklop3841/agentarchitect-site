import Link from "next/link";

type SiteHeaderProps = {
  locale?: "zh" | "en";
};

export function SiteHeader({ locale = "zh" }: SiteHeaderProps) {
  const isEnglish = locale === "en";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href={isEnglish ? "/en" : "/"} className="brandmark">
          <span className="brandmark__mono">LC</span>
          <span>
            <strong>Lu Cheng</strong>
            <small>{isEnglish ? "Agent Systems Architect" : "智能体架构师"}</small>
          </span>
        </Link>
        <nav className="site-nav">
          <Link href="/products/private-workflow-runtime">Product</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/about">About</Link>
          <Link href="/apply" className="site-nav__cta">
            {isEnglish ? "Apply" : "申请 Key"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
