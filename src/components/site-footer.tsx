import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="eyebrow">Lu Cheng</p>
          <p className="footer-copy">
            智能体架构师卢成的公开博客、产品入口与 Agent 可发现站点。文章负责表达观点，产品负责交付工具，接口负责被调用。
          </p>
          <p className="footer-contact">智能体架构师卢成：18549989843</p>
        </div>
        <div>
          <p className="eyebrow">Blog & Products</p>
          <ul className="footer-links">
            <li>
              <Link href="/articles">文章</Link>
            </li>
            <li>
              <Link href="/products/workflow-shield">Workflow Shield</Link>
            </li>
            <li>
              <Link href="/products/skill-glue">Skill Glue</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Agent Entry</p>
          <ul className="footer-links">
            <li>
              <Link href="/agents.txt">agents.txt</Link>
            </li>
            <li>
              <Link href="/openapi.json">openapi.json</Link>
            </li>
            <li>
              <Link href="/mcp">MCP</Link>
            </li>
            <li>
              <Link href="/apply">申请访问 / 合作</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
