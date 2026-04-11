"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function resolveLocale(pathname: string) {
  if (pathname === "/" || pathname.startsWith("/en") || pathname.startsWith("/articles")) {
    return "en";
  }

  return "zh";
}

export function SiteFooter() {
  const pathname = usePathname();
  const locale = resolveLocale(pathname);
  const isEnglish = locale === "en";
  const homeHref = isEnglish ? "/" : "/zh";
  const contactHref = `${homeHref}#contact`;

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="eyebrow">{isEnglish ? "Lu Cheng" : "卢成"}</p>
          <p className="footer-copy">
            {isEnglish
              ? "Research, essays, speaking, and private advisory on agent architecture and practical AI systems."
              : "围绕智能体架构、AI 工作流设计、公开表达与私人咨询展开的个人站点。"}
          </p>
        </div>
        <div>
          <p className="eyebrow">{isEnglish ? "Explore" : "浏览"}</p>
          <ul className="footer-links">
            <li>
              <Link href="/articles">{isEnglish ? "Essays" : "文章"}</Link>
            </li>
            <li>
              <Link href="/about">{isEnglish ? "About" : "关于"}</Link>
            </li>
            <li>
              <Link href="/apply">{isEnglish ? "Private Advisory" : "合作申请"}</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">{isEnglish ? "Contact" : "联系"}</p>
          <ul className="footer-links">
            <li>
              <Link href={contactHref}>{isEnglish ? "WeChat QR" : "微信二维码"}</Link>
            </li>
            <li>
              <Link href="/apply">{isEnglish ? "Application Form" : "申请表单"}</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
