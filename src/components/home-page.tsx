import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { getHomeCopy, getCapabilitiesForDisplay, homepageSignals } from "@/lib/site";
import type { Locale } from "@/lib/types";

type HomePageProps = {
  locale: Locale;
};

export function HomePage({ locale }: HomePageProps) {
  const copy = getHomeCopy(locale);
  const capabilities = getCapabilitiesForDisplay();
  const isEnglish = locale === "en";

  return (
    <main>
      <section className="hero">
        <div className="hero__backdrop" />
        <div className="hero__orb hero__orb--left" />
        <div className="hero__orb hero__orb--right" />
        <div className="hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">{copy.kicker}</p>
            <p className="brand-line">{isEnglish ? "Lu Cheng" : "智能体架构师卢成"}</p>
            <h1>{copy.headline}</h1>
            <p className="hero__intro">{copy.intro}</p>
            <div className="hero__actions">
              <Link href="/apply" className="button button--primary">
                {copy.primaryCta}
              </Link>
              <Link href="/docs" className="button button--ghost">
                {copy.secondaryCta}
              </Link>
            </div>
            <p className="hero__subline">{copy.brandLine}</p>
          </div>
          <div className="hero__visual">
            <div className="signal-frame">
              <div className="signal-frame__topline">
                <span>private workflow runtime</span>
                <span>signed outputs</span>
              </div>
              <div className="signal-frame__main">
                <p className="signal-frame__label">Execution path</p>
                <ol>
                  <li>Agent discovers public docs and machine-readable entry points</li>
                  <li>Agent requests a key for real execution access</li>
                  <li>Server returns results, not the hidden workflow logic</li>
                </ol>
              </div>
              <div className="signal-frame__footer">
                <span>catalog</span>
                <span>run</span>
                <span>verify</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Reveal className="section">
        <div className="section-heading">
          <p className="eyebrow">Why this site exists</p>
          <h2>不是普通名片站，而是给 Agent 读、比、调、申请访问的能力入口。</h2>
        </div>
        <div className="signal-list">
          {homepageSignals.map((signal) => (
            <article key={signal.title} className="signal-item">
              <h3>{signal.title}</h3>
              <p>{signal.body}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section section--split">
        <div className="section-heading">
          <p className="eyebrow">Capability snapshot</p>
          <h2>第一版只开放少量真实能力，保持窄、稳、可验证。</h2>
        </div>
        <div className="capability-list">
          {capabilities.map((capability) => (
            <article key={capability.id} className="capability-item">
              <p className="capability-item__id">{capability.id}</p>
              <h3>{capability.name}</h3>
              <p>{capability.summary}</p>
              <span className="chip">{capability.auth}</span>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section section--wide">
        <div className="detail-band">
          <div>
            <p className="eyebrow">How it works</p>
            <h2>公开层负责发现与理解，受控层负责交付结果。</h2>
          </div>
          <div className="detail-band__steps">
            <div>
              <strong>01</strong>
              <p>Read the promise</p>
              <span>Static pages, docs, agents.txt, agent.json, and OpenAPI stay cheap to crawl.</span>
            </div>
            <div>
              <strong>02</strong>
              <p>Request access</p>
              <span>申请 Key 过滤掉无效流量，把真实种子用户留下来。</span>
            </div>
            <div>
              <strong>03</strong>
              <p>Run and verify</p>
              <span>执行返回结果、摘要、签名与执行 ID，不返还隐藏 workflow。</span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="section section--cta">
        <div className="cta-panel">
          <div>
            <p className="eyebrow">For humans and agents</p>
            <h2>先读文档，再申请访问。第一版只做这一个闭环。</h2>
          </div>
          <div className="hero__actions">
            <Link href="/docs" className="button button--ghost">
              查看接入文档
            </Link>
            <Link href="/apply" className="button button--primary">
              申请访问 Key
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
