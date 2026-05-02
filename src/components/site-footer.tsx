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
  const contactHref = "/contact";

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="eyebrow">{isEnglish ? "Jack Lu" : "Jack Lu（卢成）"}</p>
          <p className="footer-copy">
            {isEnglish
              ? "Research, essays, speaking, and advisory on agent architecture, enterprise AI systems, and long-form public writing."
              : "智能体架构师卢成的主站：内容首发、企业 AI 诊断、案例沉淀、模板下载与 Agent 可读入口。"}
          </p>
        </div>
        <div>
          <p className="eyebrow">{isEnglish ? "Explore" : "浏览"}</p>
          <ul className="footer-links">
            <li>
              <Link href="/articles">{isEnglish ? "Essays (CN)" : "文章"}</Link>
            </li>
            <li>
              <Link href="/enterprise-ai-diagnosis">{isEnglish ? "AI Diagnosis" : "企业 AI 诊断"}</Link>
            </li>
            <li>
              <Link href="/cases">{isEnglish ? "Cases" : "案例库"}</Link>
            </li>
            <li>
              <Link href="/templates">{isEnglish ? "Templates" : "模板库"}</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
            <li>
              <Link href="/agent">{isEnglish ? "Agent Page" : "Agent 页面"}</Link>
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
              <Link href="/enterprise-ai-diagnosis">{isEnglish ? "Book AI Diagnosis" : "预约 AI 落地诊断"}</Link>
            </li>
            <li>
              <Link href="/agent-architect">{isEnglish ? "What is Agent Architect" : "什么是智能体架构师"}</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
