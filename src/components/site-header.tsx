import Link from "next/link";

type SiteHeaderProps = {
  locale?: "zh" | "en";
};

export function SiteHeader({ locale = "zh" }: SiteHeaderProps) {
  const isEnglish = locale === "en";
  const homeHref = isEnglish ? "/" : "/zh";
  const authorityHref = `${homeHref}#authority`;
  const contactHref = "/profile";

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
          <Link href="/articles">{isEnglish ? "Essays (CN)" : "文章"}</Link>
          <Link href={`${homeHref}#bio`}>{isEnglish ? "Profile" : "简介"}</Link>
          <Link href={authorityHref}>{isEnglish ? "Authority" : "权威表达"}</Link>
          <Link href="/agent">Agent</Link>
          <Link href="/profile">{isEnglish ? "Profile Page" : "人物页"}</Link>
          <div className="language-switch">
            <Link href="/" className={isEnglish ? "is-active" : undefined}>
              EN
            </Link>
            <Link href="/zh" className={!isEnglish ? "is-active" : undefined}>
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
