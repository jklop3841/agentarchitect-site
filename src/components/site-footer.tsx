"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function resolveLocale(pathname: string) {
  if (pathname === "/" || pathname.startsWith("/en")) {
    return "en";
  }

  return "zh";
}

export function SiteFooter() {
  const pathname = usePathname();
  const locale = resolveLocale(pathname);
  const isEnglish = locale === "en";
  const contactHref = "/profile";

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="eyebrow">{isEnglish ? "Jack Lu" : "Jack Lu（卢成）"}</p>
          <p className="footer-copy">
            {isEnglish
              ? "Research, essays, speaking, and advisory on agent architecture, enterprise AI systems, and long-form public writing."
              : "围绕智能体架构、企业级 AI 系统、研究写作与公开表达展开的个人站点。"}
          </p>
        </div>
        <div>
          <p className="eyebrow">{isEnglish ? "Explore" : "浏览"}</p>
          <ul className="footer-links">
            <li>
              <Link href="/articles">{isEnglish ? "Essays (CN)" : "文章"}</Link>
            </li>
            <li>
              <Link href="/agent">{isEnglish ? "Agent Page" : "Agent 页面"}</Link>
            </li>
            <li>
              <Link href="/profile">{isEnglish ? "Profile Page" : "人物页"}</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">{isEnglish ? "Contact" : "联系"}</p>
          <ul className="footer-links">
            <li>
              <Link href={contactHref}>{isEnglish ? "Email & Profiles" : "邮箱与外部资料"}</Link>
            </li>
            <li>
              <Link href="/profile">
                {isEnglish ? "High-End Custom Architecture" : "高端定制架构合作"}
              </Link>
            </li>
            <li>
              <Link href="/apply">{isEnglish ? "Runtime Key Application" : "Runtime Key 申请表单"}</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
