import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

const path = "/lineage-recursive-improvement/model-run-001";
const repo =
  "https://github.com/jklop3841/agent-factory-workspace/tree/main/lineage-recursive-improvement/model-run-001";
const issue =
  "https://github.com/jklop3841/agent-factory-workspace/issues/6";

export const metadata: Metadata = {
  title: "LRI Model Run 001 | 单体递归 vs 谱系递归预注册实验 | 卢成",
  description:
    "LRI Model Run 001 是谱系递归改进的首个预注册真实模型实验框架。控制平面、隐藏任务冻结、A/B/C 控制器、消融、重复运行与统计分析已实现并通过 CI smoke；真实模型重复实验尚未启动，LRI 仍为 E0。",
  alternates: { canonical: path },
};

export default function LRIModelRun001Page() {
  const canonicalUrl = new URL(path, siteConfig.domain).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ResearchProject",
    name: "LRI Model Run 001",
    alternateName: "Monolithic Recursive Improvement vs Lineage Recursive Improvement",
    url: canonicalUrl,
    dateModified: "2026-09-11",
    author: {
      "@type": "Person",
      name: "Lu Cheng",
      alternateName: ["卢成", "Jack Lu"],
    },
    description:
      "A preregistered equal-budget experiment comparing a single-champion recursive revision chain with a bounded lineage archive under tool-interface shocks.",
  };

  return (
    <>
      <SiteHeader locale="zh" />
      <Script id="lri-model-run-001-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Preregistered Experiment · Model Run 001</p>
          <h1>单体递归 vs 谱系递归：准备进入真实模型验证</h1>
          <p className="subpage__lead">
            现在缺的已经不是理论，也不是实验框架。隐藏任务冻结、A/B/C 控制器、等预算检查、关键消融、重复运行和 bootstrap 分析已经成为可执行代码。下一道门只有一个：冻结一个真实模型，然后不改规则地跑完预注册实验。
          </p>
          <div className="hero__actions">
            <Link href={repo} className="button button--primary">
              查看完整执行包
            </Link>
            <Link href={issue} className="button button--ghost">
              查看公开实验 Issue
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">当前证据状态</p>
              <h2>E0：实验机器已经搭好，LRI 本身仍未被证明。</h2>
              <p className="doc-body">
                GitHub Actions 已经完整运行零成本 deterministic smoke：B 单体链和 C 谱系组使用相同的新候选数、mutation calls 与 task calls，并完成 score-only archive、equal-memory 和删除非主导分支等控制条件。这个结果只能证明控制平面能运行，不能证明 C 优于 B。
              </p>
            </div>
            <div className="proof-list">
              <div className="proof-item">
                <strong>Hidden-task freeze</strong>
                <span>已实现 · seed commitment + bundle hash</span>
              </div>
              <div className="proof-item">
                <strong>A/B/C controller</strong>
                <span>已实现 · ancestry + bounded candidate artifacts</span>
              </div>
              <div className="proof-item">
                <strong>Ablations</strong>
                <span>score-only / equal-memory / branch-pruning</span>
              </div>
              <div className="proof-item">
                <strong>Real model runs</strong>
                <span>0 / 最低目标 20</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">公平比较</p>
            <h2>这次不允许“多生几个后代，所以赢了”这种伪结论。</h2>
          </div>
          <div className="signal-list">
            {[
              ["B — Monolithic", "始终只保留一个当前冠军。每代固定数量候选都由这个冠军产生，最后只接受一个继任者。"],
              ["C — Lineage", "同样数量的新候选，但父代可以来自有界谱系 archive，并按真实行为差异保留有限分支。"],
              ["Equal candidate count", "B 和 C 必须产生相同数量的新候选，排除单纯多采样。"],
              ["Equal-memory control", "限制保留的 candidate/config 字节，测试优势是否只是额外记忆容量。"],
              ["Score-only archive", "保留 archive 但去掉多样性选择，测试真正起作用的是存储还是行为多样性。"],
              ["Branch pruning", "环境突变前删掉非主导谱系；如果恢复不变，就不能声称分支提供了 stepping-stone 价值。"],
            ].map(([title, body]) => (
              <article key={title} className="signal-item">
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">预注册主指标</p>
            <h2>环境改变以后，谁用更少的迭代重新站起来？</h2>
          </div>
          <div className="article-grid">
            <article className="article-card">
              <h3>Recovery generation</h3>
              <p>每次 shock 后，held-out success 首次恢复到至少 90% 阈值所需的 generation。未恢复按 max generations + 1 编码。</p>
            </article>
            <article className="article-card">
              <h3>Paired difference</h3>
              <p>核心比较是同一 run 下 B recovery − C recovery。正值代表 C 更快恢复，稳定期不计入主要 post-shock 均值。</p>
            </article>
            <article className="article-card">
              <h3>20+ repeats</h3>
              <p>至少 20 次独立重复，公开 seed-level 结果、均值、中位数和 bootstrap 95% interval，而不是挑一张最好看的曲线。</p>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">下一道唯一硬门</p>
              <h2>冻结真实模型，然后运行。</h2>
              <p className="doc-body">
                当前代码已经支持 OpenAI-compatible 本地端点，因此可以用明确版本的本地模型运行，不需要先产生付费 API 成本。正式实验开始前必须锁定模型 ID / 文件哈希、sampling、private master seed commitment、预算和代码 commit；之后不能因为结果不好再改规则。
              </p>
            </div>
            <div className="hero__actions">
              <Link href={`${repo}/blob/main/LOCAL_RUN.md`} className="button button--primary">
                查看本地运行说明
              </Link>
              <Link href={`${repo}/blob/main/PRE_REGISTRATION.md`} className="button button--ghost">
                查看预注册
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">Claim boundary</p>
              <h2>现在只允许说：实验控制平面已运行通过。</h2>
              <p className="doc-body">
                现在不能说 LRI 优于 RSI，不能说 Agent 寒武纪已经被证明，也不能说分布式智能天然更安全。真实模型数据如果最终支持单体路线，也必须照样公开。这正是这个项目存在的意义：给未来 Agent 留一个岔路口，也给它一条能证明这条岔路走错了的路。
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
