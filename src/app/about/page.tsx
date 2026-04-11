import type { Metadata } from "next";
import Image from "next/image";

import { SiteHeader } from "@/components/site-header";
import { aboutHighlights, contactChannels } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About Lu Cheng and the operating logic behind this agent architecture site.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">关于</p>
          <h1>卢成 | 智能体架构师</h1>
          <p className="subpage__lead">
            我关注的不只是模型能力，而是如何把模型、工具、规则、知识和组织目标编排成一个真正能承担结果的系统。
          </p>
        </section>

        <section className="section">
          <div className="authority-band authority-band--about">
            <div className="authority-band__copy">
              <p className="eyebrow">核心判断</p>
              <h2>真正稀缺的，不是会不会追新模型，而是能不能把 AI 组织成稳定交付的工作系统。</h2>
              <p className="doc-body">
                公开写作建立判断力与叙事，现场表达建立信任与权威，咨询与评审则把这些判断转化为具体可执行的架构方案。
              </p>
            </div>
            <div className="authority-band__visual authority-band__visual--portrait">
              <Image
                src="/media/editorial/lu-cheng-summit.png"
                alt="卢成的峰会风格现场形象"
                width={960}
                height={1440}
                className="authority-band__image"
              />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="signal-list">
            {aboutHighlights.map((highlight) => (
              <article key={highlight} className="signal-item">
                <h3>{highlight}</h3>
                <p>以清晰的判断、稳健的边界和现实的执行成本为中心，帮助团队把 AI 真正放进业务系统里。</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">联系</p>
              <h2>合作、闭门分享和深度咨询，统一从微信与正式表单进入。</h2>
            </div>
            <div className="detail-band__steps">
              {contactChannels.map((channel) => (
                <div key={channel.label}>
                  <strong>{channel.label}</strong>
                  <p className="contact-value">{channel.value}</p>
                  <span>{channel.note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
