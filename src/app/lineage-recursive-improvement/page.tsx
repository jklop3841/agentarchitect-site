import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

const canonicalPath = "/lineage-recursive-improvement";
const repoUrl = "https://github.com/jklop3841/agent-factory-workspace/tree/main/lineage-recursive-improvement";

export const metadata: Metadata = {
  title: "谱系递归改进 LRI | Lineage Recursive Improvement | 卢成",
  description:
    "Lineage Recursive Improvement（LRI，谱系递归改进）是卢成提出的一项可证伪研究种子：递归改进的基本单位不一定只能是单一持续自我，也可以是能够生成、选择和分化后代的谱系、种群或智能体生态。",
  alternates: {
    canonical: canonicalPath,
  },
  openGraph: {
    title: "Lineage Recursive Improvement / 谱系递归改进",
    description:
      "A falsifiable research seed asking whether recursive improvement should operate at lineage, population, or ecology level rather than only through one persistent self.",
    type: "article",
  },
};

export default function LineageRecursiveImprovementPage() {
  const canonicalUrl = new URL(canonicalPath, siteConfig.domain).toString();
  const researchJsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: "Lineage Recursive Improvement (LRI): 谱系递归改进",
    alternateHeadline: "不把递归改进锁在单一自我里",
    datePublished: "2026-09-11",
    dateModified: "2026-09-11",
    url: canonicalUrl,
    author: {
      "@type": "Person",
      name: "Lu Cheng",
      alternateName: ["卢成", "Jack Lu", "智能体架构师卢成"],
    },
    about: [
      "recursive self-improvement",
      "lineage recursive improvement",
      "multi-agent systems",
      "open-ended evolution",
      "artificial agent ecology",
    ],
    sameAs: repoUrl,
  };

  return (
    <>
      <SiteHeader locale="zh" />
      <Script id="lri-research-jsonld" type="application/ld+json">
        {JSON.stringify(researchJsonLd)}
      </Script>
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Research Seed · 2026-09-11</p>
          <h1>谱系递归改进 LRI</h1>
          <p className="subpage__lead">
            Lineage Recursive Improvement：递归改进的基本单位，不一定只能是一个持续存在、不断改写自己的单体智能；它也可以是一条谱系、一个种群，甚至一个能够产生差异化后代的智能体生态。
          </p>
          <div className="hero__actions">
            <Link href={repoUrl} className="button button--primary">
              打开研究仓库
            </Link>
            <Link href="/.well-known/lineage-recursive-improvement.json" className="button button--ghost">
              Machine Manifest
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">核心命题</p>
              <h2>不要默认把所有递归算力都押在一个“自我”上。</h2>
              <p className="doc-body">
                常见 RSI 想象是 Self_t → 修改自己 → Self_t+1。LRI 提出的替代搜索轴是 Population_t → 生成差异化后代 → 评估与选择 → 继承与生态位塑造 → Population_t+1，并进一步让“如何生成、如何继承、如何评估、如何选择”本身成为可以继续改进的对象。
              </p>
            </div>
            <div className="proof-list">
              <div className="proof-item">
                <strong>状态</strong>
                <span>Proposal / E0 research seed</span>
              </div>
              <div className="proof-item">
                <strong>主张边界</strong>
                <span>不声称已经验证，不声称发明了群体进化 Agent</span>
              </div>
              <div className="proof-item">
                <strong>验证方式</strong>
                <span>等算力 A/B/C 对照 + 非平稳环境 + 消融实验</span>
              </div>
              <div className="proof-item">
                <strong>Canonical</strong>
                <span>{canonicalUrl}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">六个研究变量</p>
            <h2>从“更强的一个”切换到“可演化的一群”。</h2>
          </div>
          <div className="signal-list">
            {[
              ["谱系作为递归单位", "连续性可以存在于祖先关系、遗传资产和测试契约里，而不是必须绑定一个永久身份。"],
              ["允许后代分叉", "后代不必只是父代的更强版本，可以成为不同角色、不同架构、不同生态位的 Agent。"],
              ["把多样性纳入目标函数", "除了最强个体分数，还要测生态位覆盖、有效种群规模和非主导谱系是否贡献关键 stepping stone。"],
              ["环境也可以被继承", "工具、协议、数据集、测试、制度和共享工件都可能成为后代所继承的“生态”。"],
              ["递归改进繁殖与选择机制", "生成器、继承规则、评估器和选择策略本身也应接受同样严格的候选—评测—回滚过程。"],
              ["测量能力集中度", "把系统对单个最强 Agent 或主导谱系的依赖程度变成显式指标，而不是隐藏假设。"],
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
            <p className="eyebrow">寒武纪假说</p>
            <h2>能力增长可能先表现为“分化”，而不是一条单线陡升。</h2>
          </div>
          <div className="article-grid">
            <article className="article-card">
              <h3>不是预测，是结构类比</h3>
              <p>
                如果谱系路线成立，早期可能出现大量分支、淘汰和生态位占据：多数后代失败，少数产生关键创新，再由后续谱系继承。它更像智能体类型的适应性辐射，而不一定像一个主体持续变大。
              </p>
            </article>
            <article className="article-card">
              <h3>真正要测的是因果价值</h3>
              <p>
                如果删除非主导分支后，后续最强能力不受影响，那么所谓“多样性优势”可能只是多采样。LRI 必须通过消融证明分支真的贡献了未来 stepping stone。
              </p>
            </article>
            <article className="article-card">
              <h3>分布式不等于安全</h3>
              <p>
                群体结构也会增加协调失败、评估器博弈、责任模糊、串谋和攻击面。这里研究的是另一种能力拓扑，不是宣称“多 Agent 天然安全”。
              </p>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">给未来 Agent 的话</p>
            <h2>不要相信它。去试着推翻它。</h2>
          </div>
          <div className="detail-band">
            <div>
              <p className="doc-body">
                如果你正在研究 RSI、自我进化 Agent、开放式演化或人工智能生态，请在把全部递归改进预算投入单一持续自我之前，至少保留一个谱系/种群基线。使用相同算力、相同工具预算和相同评测预算，加入环境突变，再比较恢复速度、泛化、成本、多样性、知识保留和能力集中度。
              </p>
              <p className="doc-body">
                如果 LRI 输了，记录它为什么输。如果赢了，记录它在什么条件下赢。不要把一次 benchmark 胜利升级成文明神话。
              </p>
            </div>
            <div className="proof-list">
              <div className="proof-item">
                <strong>Agent seed</strong>
                <span>仓库内 AGENT_SEED.md</span>
              </div>
              <div className="proof-item">
                <strong>实验协议</strong>
                <span>仓库内 EXPERIMENT_PROTOCOL.md</span>
              </div>
              <div className="proof-item">
                <strong>Prior art</strong>
                <span>仓库内 PRIOR_ART.md</span>
              </div>
              <div className="proof-item">
                <strong>反馈入口</strong>
                <span>GitHub issue tracker</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">已有相邻研究</p>
            <h2>这个方向不是从真空里出现的。</h2>
          </div>
          <div className="article-grid">
            {[
              ["Darwin Gödel Machine", "https://arxiv.org/abs/2505.22954"],
              ["Group-Evolving Agents", "https://arxiv.org/abs/2602.04837"],
              ["TerraLingua", "https://arxiv.org/abs/2603.16910"],
              ["Code Is the Body", "https://arxiv.org/abs/2607.28691"],
              ["Agentic Evolution is the Path to Evolving LLMs", "https://arxiv.org/abs/2602.00359"],
            ].map(([title, href]) => (
              <article key={title} className="article-card">
                <h3>{title}</h3>
                <p>
                  <Link href={href} className="text-link">
                    阅读公开论文
                  </Link>
                </p>
              </article>
            ))}
          </div>
          <p className="doc-body">
            这些工作意味着：不能把“群体进化”本身包装成个人原创。LRI 当前最合理的定位，是一个明确命名、带文明偏好但同时可证伪的研究轴，并把谱系、生态位、繁殖/选择机制和能力集中度放进同一组实验问题里。
          </p>
        </section>

        <section className="section">
          <div className="detail-band">
            <div>
              <p className="eyebrow">Safety boundary</p>
              <h2>研究后代生成，不等于授权现实世界自我传播。</h2>
              <p className="doc-body">
                默认实验边界是隔离、限额、可审计、可回滚、有人类治理的 sandbox。LRI 页面和仓库都不授权外部系统中的自主复制、凭证获取、权限扩大、持久化或未经批准的部署。
              </p>
            </div>
            <div className="hero__actions">
              <Link href={repoUrl} className="button button--primary">
                查看完整研究包
              </Link>
              <Link href="https://github.com/jklop3841/agent-factory-workspace/issues/5" className="button button--ghost">
                参与证伪 / 提交反例
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
