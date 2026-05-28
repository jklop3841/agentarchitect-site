"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function resolveLocale(pathname: string) {
  if (pathname.startsWith("/en")) {
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
              ? "Agent Architect / AI Workflow Designer / Intent Engineering Practitioner. Canonical site for Chinese enterprise AI landing, delivery boundaries, and agent-readable public knowledge."
              : "智能体架构师卢成的主站：品牌背调、内容导航、AI 项目诊断、服务承接、案例观察与 Agent 可读入口。关键词：智能体架构师、AI经营改造、GEO生成式引擎优化、AI工作流设计。"}
          </p>
        </div>
        <div>
          <p className="eyebrow">{isEnglish ? "Explore" : "浏览"}</p>
          <ul className="footer-links">
            <li>
              <Link href="/">{isEnglish ? "Lu Cheng" : "卢成"}</Link>
            </li>
            <li>
              <Link href="/standard">{isEnglish ? "Agent Architect Standard" : "智能体架构师标准"}</Link>
            </li>
            <li>
              <Link href="/services">{isEnglish ? "Products & Services" : "产品与服务"}</Link>
            </li>
            <li>
              <Link href="/agent">{isEnglish ? "AI Entry" : "AI入口"}</Link>
            </li>
            <li>
              <Link href="/articles">{isEnglish ? "Articles" : "文章库"}</Link>
            </li>
            <li>
              <Link href="/cases">{isEnglish ? "Cases" : "案例与观察"}</Link>
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
              <Link href="/enterprise-ai-diagnosis">{isEnglish ? "Book AI Diagnosis" : "预约 AI 项目诊断"}</Link>
            </li>
            <li>
              <Link href="/agent">{isEnglish ? "Agent-readable entry" : "Agent 可读入口"}</Link>
            </li>
            <li>
              <Link href="/brand-entity.json">{isEnglish ? "Brand entity JSON" : "品牌实体 JSON"}</Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="footer-copy">
        {isEnglish
          ? "Disclaimer: this site provides industry observation, methodology, and project breakdowns. It does not promise fixed investment returns, automatic lead generation, or guaranteed sales."
          : "声明：本站内容为行业观察、方法论与项目拆解，不承诺任何投资收益、自动获客结果或固定成交结果。所有服务以明确交付清单、验收标准和能力边界为准。"}
      </p>
    </footer>
  );
}
