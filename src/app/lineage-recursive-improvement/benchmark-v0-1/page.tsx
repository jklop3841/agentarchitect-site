import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

const path = "/lineage-recursive-improvement/benchmark-v0-1";
const benchmarkRepo =
  "https://github.com/jklop3841/agent-factory-workspace/tree/main/lineage-recursive-improvement/benchmark-v0.1";

export const metadata: Metadata = {
  title: "LRI Benchmark v0.1 | Tool Interface Drift | 卢成",
  description:
    "谱系递归改进 LRI 的首个可运行 Agent 基准框架：通过工具移除、重命名、语义变化和成本变化测试 Agent 在非平稳环境中的适应能力，为后续 Monolithic RSI vs Lineage RSI 等预算实验提供统一评测面。",
  alternates: { canonical: path },
};

export default function LRIBenchmarkPage() {
  const canonicalUrl = new URL(path, siteConfig.domain).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "LRI Benchmark v0.1 — Tool Interface Drift",
    dateCreated: "2026-09-11",
    codeRepository: benchmarkRepo,
    url: canonicalUrl,
    programmingLanguage: "Python",
    author: {
      "@type": "Person",
      name: "Lu Cheng",
      alternateName: ["卢成", "Jack Lu"],
    },
    description:
      "A zero-dependency local benchmark surface for testing fixed, monolithic-recursive and lineage/population agent controllers under tool-interface drift.",
  };

  return (
    <>
      <SiteHeader locale="zh" />
      <Script id="lri-benchmark-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Executable Research · v0.1</p>
          <h1>LRI Benchmark v0.1</h1>
          <p className="subpage__lead">
            这不是“LRI 已经被证明”的页面，而是第一块真正可运行的实验地基：让不同 Agent 在同一套工具环境突变下接受评测，再把递归改进控制器放到评测器外面进行公平比较。
          </p>
          <div className="hero__actions">
            <Link href={benchmarkRepo} className="button button--primary">
              查看源码与运行方法
            </Link>
            <Link href="/lineage-recursive-improvement" className="button button--ghost">
              返回 LRI 总论
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">当前状态</p>
              <h2>评测器已经能跑；真正的模型对照实验还没有冒充完成。</h2>
              <p className="doc-body">
                v0.1 已提供 Python 零依赖 benchmark、stdin/stdout 外部 Agent 协议、oracle 上限基线、故意脆弱的 legacy 基线、可运行 reference Agent、候选谱系 manifest schema，以及 Model Run 001 的等预算实验协议。
              </p>
            </div>
            <div className="proof-list">
              <div className="proof-item">
                <strong>Oracle</strong>
                <span>20/20 任务成功</span>
              </div>
              <div className="proof-item">
                <strong>Legacy</strong>
                <span>稳定期 100%，三次环境突变后均为 0%</span>
              </div>
              <div className="proof-item">
                <strong>External protocol</strong>
                <span>reference command-line Agent 20/20 成功</span>
              </div>
              <div className="proof-item">
                <strong>LRI evidence</strong>
                <span>仍为 E0；以上只验证 benchmark，不验证 LRI 优越性</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">环境冲击</p>
            <h2>先让世界变，再看 Agent 怎么恢复。</h2>
          </div>
          <div className="article-grid">
            {[
              ["Stable", "最初的工具名称、语义和成本结构。"],
              ["Remove Double", "廉价 doubling 工具消失，出现更贵的替代操作。"],
              ["Rename + Negate", "工具名称和语义重排，负值操作开始重要。"],
              ["Cost Shift", "功能仍可理解，但工具经济结构改变，不能只追求最短步骤。"],
            ].map(([title, body]) => (
              <article key={title} className="article-card">
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Model Run 001</p>
            <h2>真正关键的下一步是 B 对 C，不是再写理论。</h2>
          </div>
          <div className="signal-list">
            <article className="signal-item">
              <h3>B — Monolithic</h3>
              <p>同一个当前冠军不断产生候选修订，每代只保留一个继任者，形成单一 revision chain。</p>
            </article>
            <article className="signal-item">
              <h3>C — Lineage</h3>
              <p>同样数量的新候选，但从有界的多个行为谱系中产生后代，显式记录 ancestry，并按质量与行为差异保留有限 archive。</p>
            </article>
            <article className="signal-item">
              <h3>硬约束</h3>
              <p>同基础模型、同候选数量、同 Token / 调用 / 时间上限，并进一步做等存储量和删除非主导谱系消融。</p>
            </article>
          </div>
          <p className="doc-body">
            主要指标不是最后谁分数最高，而是环境突然变化以后，谁能以更少总资源恢复；以及如果 C 更快，这个优势究竟来自谱系多样性，还是仅仅来自多存了一些信息。
          </p>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">Research integrity</p>
              <h2>直到真实模型 A/B/C 重复实验完成之前，不升级证据等级。</h2>
              <p className="doc-body">
                最低 E1 候选标准已经写入协议：隐藏任务、等预算、至少多个独立重复、关键消融、失败运行保留、候选 ancestry 日志和完整资源统计。单个漂亮结果不足以把 LRI 从研究种子升级成经验结论。
              </p>
            </div>
            <div className="hero__actions">
              <Link href={benchmarkRepo} className="button button--primary">
                下载 / Fork / 复现
              </Link>
              <Link
                href="https://github.com/jklop3841/agent-factory-workspace/issues/5"
                className="button button--ghost"
              >
                提交反例与失败结果
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
