import Link from "next/link";

type SiteHeaderProps = {
  locale?: "zh" | "en";
};

const mainNavItems = [
  { href: "/", label: "需求 Requests", labelEn: "Requests" },
  { href: "/post", label: "发布 Post", labelEn: "Post" },
  { href: "/network", label: "节点 Nodes", labelEn: "Nodes" },
  { href: "/agent", label: "AI入口", labelEn: "AI Entry" },
  { href: "/articles", label: "文章", labelEn: "Research" },
  { href: "/about", label: "卢成", labelEn: "Lu Cheng" },
  { href: "/account", label: "账户", labelEn: "Account" },
];

export function SiteHeader({ locale = "zh" }: SiteHeaderProps) {
  const isEnglish = locale === "en";
  const homeHref = "/";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href={homeHref} className="brandmark">
          <span className="brandmark__mono">LC</span>
          <span>
            <strong>AgentArchitect</strong>
            <small>{isEnglish ? "Jack Lu · Agent Architect" : "卢成 · 智能体架构师"}</small>
          </span>
        </Link>
        <nav className="site-nav">
          {mainNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {isEnglish ? item.labelEn : item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
