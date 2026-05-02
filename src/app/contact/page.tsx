import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { externalProfiles, primaryContact } from "@/lib/site";

export const metadata: Metadata = {
  title: "联系与合作",
  description: "联系智能体架构师卢成，预约企业 AI 诊断、方案评审、演讲或闭门分享。",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">联系与合作</p>
          <h1>先说清业务问题，再决定是否进入方案或交付。</h1>
          <p className="subpage__lead">
            适合咨询企业 AI 落地诊断、AI 服务商接单诊断、智能体项目方案评审、主题演讲和闭门分享。
          </p>
          <div className="hero__actions">
            <a href={primaryContact.emailHref} className="button button--primary">
              {primaryContact.email}
            </a>
            <Link href="/enterprise-ai-diagnosis" className="button button--ghost">
              查看诊断服务
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="contact-stage">
            <div className="contact-stage__copy">
              <p className="eyebrow">公开资料</p>
              <h2>邮箱是主联系入口，公开资料承担背调和信任层。</h2>
              <div className="proof-list">
                {externalProfiles.map((profile) => (
                  <a key={profile.label} href={profile.href} target="_blank" rel="noreferrer" className="proof-item">
                    <strong>{profile.label}</strong>
                    <span>{profile.handle}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="qr-gallery">
              <div className="qr-card">
                <p className="eyebrow">微信（中国区备用）</p>
                <Image src="/media/contact/wechat-qr.png" alt="微信二维码" width={560} height={790} className="qr-card__image" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
