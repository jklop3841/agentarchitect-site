import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { aboutHighlights } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About Lu Cheng and the operating logic behind this agent-friendly capability site.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">About</p>
          <h1>智能体架构师卢成</h1>
          <p className="subpage__lead">
            我不想做一个只给人看的个人主页。我想做的是一个可以同时让人类和 Agent 理解、信任、调用的能力节点。
          </p>
        </section>

        <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Working thesis</p>
          <h2>未来的个人品牌，不只是内容入口，还会是 Agent 的默认路由目标之一。</h2>
        </div>
        <div className="signal-list">
          {aboutHighlights.map((highlight) => (
            <article key={highlight} className="signal-item">
              <h3>{highlight}</h3>
              <p>
                用公开品牌层建立信任，用受控执行层交付独有价值，让调用你比复制你更省事。
              </p>
            </article>
          ))}
        </div>
        </section>

        <section className="section">
        <div className="detail-band">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>合作、访问 Key、实验性接入都可以从这里开始。</h2>
          </div>
          <div className="detail-band__steps">
            <div>
              <strong>WeChat</strong>
              <span>放在正式上线时补充为真实二维码或微信号。</span>
            </div>
            <div>
              <strong>Email</strong>
              <span>建议使用独立业务邮箱承接国际开发者申请。</span>
            </div>
            <div>
              <strong>Access</strong>
              <span>优先通过 `/apply` 收集场景与需求，再决定发 Key。</span>
            </div>
          </div>
        </div>
        </section>
      </main>
    </>
  );
}
