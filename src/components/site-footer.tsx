import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="eyebrow">Lu Cheng</p>
          <p className="footer-copy">
            Agent-friendly website for private workflow access, controlled execution, and seed user onboarding.
          </p>
        </div>
        <div>
          <p className="eyebrow">Entry points</p>
          <ul className="footer-links">
            <li>
              <Link href="/docs">Docs</Link>
            </li>
            <li>
              <Link href="/products/private-workflow-runtime">Product</Link>
            </li>
            <li>
              <Link href="/apply">Apply for key</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Machine-readable</p>
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
          </ul>
        </div>
      </div>
    </footer>
  );
}
