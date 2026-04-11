import Link from "next/link";

type SiteHeaderProps = {
  locale?: "zh" | "en";
};

export function SiteHeader({ locale = "zh" }: SiteHeaderProps) {
  const isEnglish = locale === "en";
  const homeHref = isEnglish ? "/" : "/zh";
  const authorityHref = `${homeHref}#authority`;
  const contactHref = `${homeHref}#contact`;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href={homeHref} className="brandmark">
          <span className="brandmark__mono">LC</span>
          <span>
            <strong>Lu Cheng</strong>
            <small>{isEnglish ? "Agent Architect" : "智能体架构师"}</small>
          </span>
        </Link>
        <nav className="site-nav">
          <Link href="/articles">{isEnglish ? "Essays (CN)" : "文章"}</Link>
          <Link href={`${homeHref}#bio`}>{isEnglish ? "Profile" : "简介"}</Link>
          <Link href={authorityHref}>{isEnglish ? "Authority" : "权威表达"}</Link>
          <Link href="/about">{isEnglish ? "About" : "关于"}</Link>
          <div className="language-switch">
            <Link href="/" className={isEnglish ? "is-active" : undefined}>
              EN
            </Link>
            <Link href="/zh" className={!isEnglish ? "is-active" : undefined}>
              中文
            </Link>
          </div>
          <Link href={contactHref} className="site-nav__cta">
            {isEnglish ? "WeChat" : "微信联系"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
