import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { authorProfile } from "@/lib/content";
import { contactChannels, externalProfiles, primaryContact, researchPapers } from "@/lib/site";

export const metadata: Metadata = {
  title: "Profile",
  description: "Jack Lu (卢成) profile, public links, research papers, and contact stack.",
};

const profileParagraphs = [
  "Jack Lu（卢成）关注的核心不是模型热闹，而是如何把模型、工具、知识、规则、权限和组织目标编排成一个真正能承担结果的系统。",
  "他的工作集中在智能体架构、AI 工作流设计、企业级 AI 系统、研究写作与公开表达。对外部世界来说，这意味着更清晰的判断、更稳的边界和更能被组织采纳的 AI 方案。",
  "这个人物页承担的是站点的权威档案功能：让别人一眼知道你是谁、写什么、研究什么、在哪些公开平台持续发声，以及应该通过什么方式建立联系。",
];

export default function ProfilePage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage profile-page">
        <section className="subpage__hero profile-page__hero">
          <div className="profile-page__intro">
            <p className="eyebrow">人物页</p>
            <h1>{authorProfile.displayName}</h1>
            <p className="subpage__lead">
              Agent Architect | AI Workflow Design | Enterprise AI Systems | Research & Advisory
            </p>
            <div className="profile-page__actions">
              <a href={primaryContact.emailHref} className="button button--primary">
                {primaryContact.email}
              </a>
              <Link href="/articles" className="button button--ghost">
                阅读站内文章
              </Link>
            </div>
          </div>
          <div className="profile-page__portrait">
            <Image
              src="/media/editorial/lu-cheng-summit.png"
              alt="Jack Lu（卢成）人物肖像"
              width={960}
              height={1440}
              className="profile-page__portrait-image"
              priority
            />
          </div>
        </section>

        <section className="section">
          <div className="profile-page__grid">
            <article className="profile-panel">
              <p className="eyebrow">人物简介</p>
              <h2>把 AI 从能力演示，推进到可交付、可验证、可治理的工作系统。</h2>
              {profileParagraphs.map((paragraph) => (
                <p key={paragraph} className="doc-body">
                  {paragraph}
                </p>
              ))}
            </article>
            <article className="profile-panel">
              <p className="eyebrow">工作重心</p>
              <ul className="principle-list">
                <li>智能体架构与任务系统设计</li>
                <li>AI 工作流重组与边界控制</li>
                <li>企业级 AI 系统与管理层沟通</li>
                <li>研究写作、公开表达与长期思想资产建设</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">公开资料</p>
            <h2>公开资料页负责建立身份一致性与持续可见性。</h2>
          </div>
          <div className="profile-links-grid">
            {externalProfiles.map((profile) => (
              <article key={profile.label} className="profile-link-card">
                <p className="capability-item__id">{profile.label}</p>
                <h3>{profile.handle}</h3>
                <p>{profile.summary}</p>
                <a href={profile.href} target="_blank" rel="noreferrer" className="text-link">
                  打开 {profile.label}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">研究成果</p>
            <h2>研究成果负责建立更深的判断力与长期可信度。</h2>
          </div>
          <div className="profile-links-grid">
            {researchPapers.map((paper) => (
              <article key={paper.title} className="profile-link-card">
                <p className="capability-item__id">{paper.platform}</p>
                <h3>{paper.title}</h3>
                <p>{paper.summary}</p>
                <a href={paper.href} target="_blank" rel="noreferrer" className="text-link">
                  阅读论文
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">联系栈</p>
              <h2>邮箱是主联系入口，微信只保留为中国区备用联系方式。</h2>
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
