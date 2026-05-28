import Link from "next/link";

type SiteHeaderProps = {
  locale?: "zh" | "en";
};

const mainNavItems = [
  { href: "/", label: "卢成", labelEn: "Lu Cheng" },
  { href: "/standard", label: "智能体架构师标准", labelEn: "Standard" },
  { href: "/services", label: "产品与服务", labelEn: "Services" },
  { href: "/agent", label: "AI入口", labelEn: "AI Entry" },
];

export function SiteHeader({ locale = "zh" }: SiteHeaderProps) {
  const isEnglish = locale === "en";
  const homeHref = isEnglish ? "/en" : "/";

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
          {mainNavItems.map((item) => (
            <Link key={item.href} href={isEnglish && item.href === "/" ? "/en" : item.href}>
              {isEnglish ? item.labelEn : item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
