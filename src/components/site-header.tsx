import Link from "next/link";

type SiteHeaderProps = {
  locale?: "zh" | "en";
};

export function SiteHeader({ locale = "zh" }: SiteHeaderProps) {
  const isEnglish = locale === "en";
  const homeHref = isEnglish ? "/" : "/zh";

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
          <Link href="/articles">{isEnglish ? "Essays" : "文章"}</Link>
          <Link href={`${homeHref}#bio`}>{isEnglish ? "Profile" : "简介"}</Link>
          <Link href={`${homeHref}#products`}>{isEnglish ? "Products" : "产品"}</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/about">{isEnglish ? "About" : "关于"}</Link>
          <div className="language-switch">
            <Link href="/" className={isEnglish ? "is-active" : undefined}>
              EN
            </Link>
            <Link href="/zh" className={!isEnglish ? "is-active" : undefined}>
              中文
            </Link>
          </div>
          <Link href="/apply" className="site-nav__cta">
            {isEnglish ? "Contact" : "微信 / 合作"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
