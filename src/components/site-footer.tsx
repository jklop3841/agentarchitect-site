import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="eyebrow">Lu Cheng</p>
          <p className="footer-copy">
            Lu Cheng&apos;s public business blog and agent-facing entry site. Essays carry the thesis. Tools carry the proof. Interfaces remain available for agents underneath.
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
