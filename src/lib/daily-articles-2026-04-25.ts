import type { ArticleEntry } from "./content";

export const dailyArticles20260425: ArticleEntry[] = [
  {
    slug: "openai-codex-workbench-agent-surface",
    title: "Codex 这次真正想拿下的，不是 IDE，而是整个开发工作台",
    titleEn: "Codex is no longer aiming for the IDE alone, but for the whole developer workbench",
    subtitle:
      "OpenAI 在 2026 年 4 月 16 日把 computer use、browser、memory、automations 和 90+ plugins 一起推到 Codex 桌面端，编码代理开始从写代码工具变成跨应用工作流壳层",
    subtitleEn:
      "OpenAI's April 16, 2026 Codex desktop update bundles computer use, browser, memory, automations, and 90+ plugins, shifting coding agents from code-writing tools to cross-app workflow shells.",
    date: "2026-04-25",
    readTime: "13 分钟",
    tags: ["GEO", "智能体架构", "代码代理", "AI工作流", "MCP", "工具协议", "AI资讯"],
    excerpt:
      "OpenAI 把 Codex 桌面端更新成一个能点屏幕、开浏览器、连插件、记住偏好、跨天接续任务的工作台。关键不在功能堆叠，而在 agent 的操作表面开始覆盖整个开发生命周期。",
    excerptEn:
      "OpenAI turned the Codex desktop app into a workbench that can click through apps, browse, use plugins, remember preferences, and resume tasks across days. The deeper signal is not feature count, but an agent surface spanning the full development lifecycle.",
    summary: [
      "OpenAI 在 2026 年 4 月 16 日发布《Codex for (almost) everything》，明确说 Codex 每周服务超过 300 万开发者，并把 computer use、browser、image generation、memory 和 automations 放进同一桌面壳层。",
      "官方同时用 Academy 文档解释 Codex 已经不只服务代码：它可以跨文件、工具和重复工作流推进任务，而 plugins 与 skills 分别承担“连外部工具”和“执行团队流程”的角色。",
      "这说明编码代理的竞争中心正在从“写得像不像人”移向“能否成为开发工作台的默认操作界面”，而权限、审查和工作流边界会成为真正的分水岭。",
    ],
    summaryEn: [
      "OpenAI's April 16, 2026 post 'Codex for (almost) everything' says Codex now serves over 3 million developers weekly and unifies computer use, browser, image generation, memory, and automations in one desktop shell.",
      "OpenAI Academy materials published on April 23 explain that Codex now works across files, tools, and repeatable workflows, while plugins connect external tools and skills encode team processes.",
      "The center of competition is shifting from raw coding quality to whether an agent can become the default operating surface for software work, with permissions and review boundaries as the hard constraint.",
    ],
    coverImage: "/media/editorial/lu-cheng-screen.png",
    coverAlt: "卢成在系统大屏前讲解架构",
    sections: [
      {
        heading: "这不是“Codex 终于会点鼠标了”的新闻",
        headingEn: "This is not just a story about Codex clicking a mouse",
        paragraphs: [
          "OpenAI 在 2026 年 4 月 16 日发布《Codex for (almost) everything》时，最值得注意的一句不是 computer use，而是它先把定位改了：Codex 每周服务超过 300 万开发者，要覆盖 full software development lifecycle。这个表述意味着 Codex 想争夺的已经不是某一个 IDE 面板，而是开发者一天里从收信息、改文件、看页面、审 PR、跑终端到跨工具接续任务的整个操作表面。",
          "所以我不把这次更新看成“又补了几个功能”。当一个编码代理开始同时接管电脑操作、浏览器、图像生成、偏好记忆、自动续跑和插件连接，它就不再只是写代码的助手，而更像一个开发工作台上的调度壳层。它的价值不只是产出 patch，而是决定你一天里的注意力、上下文和动作是怎样被组织起来的。",
        ],
      },
      {
        heading: "computer use 和 browser 让 agent 进入了没有 API 的地带",
        headingEn: "Computer use and browser push the agent into spaces without APIs",
        paragraphs: [
          "OpenAI 写得很明确：Codex 现在可以在后台看、点、打字，多个 agent 可以在 Mac 上并行工作，而且不会干扰用户自己的操作；它还新增了 in-app browser，可以直接在页面上评论，让 agent 更快迭代前端和游戏。对很多人来说，这只是体验升级。对智能体架构来说，这代表 agent 开始补上“没有 API 的工作环节”。",
          "过去很多团队做 agent 自动化时，一碰到图形界面、浏览器验证、产品后台或半结构化页面，就会回退成人工。现在 Codex 明确把这些环节吸进桌面端。也就是说，开发流程里原本分散在浏览器、终端、文档和截图之间的动作，开始被统一进一个连续线程里。这不是把 API 废掉，而是在承认软件工作从来不只发生在 API 上。",
        ],
      },
      {
        heading: "90+ plugins 的真正信号，是可安装能力包而不是功能列表",
        headingEn: "The deeper signal of 90+ plugins is installable capability packaging",
        paragraphs: [
          "官方产品页说得很直白：新插件把 skills、app integrations 和 MCP servers 组合在一起，让 Codex 更容易获取上下文并在工具之间采取行动。随后 2026 年 4 月 23 日的 OpenAI Academy 文档又把逻辑拆开了：plugin 负责连外部工具和信息源，skill 负责让 Codex 按团队流程做事。两者合起来，本质上就是把“能力”从大 prompt 里抽出来，变成一个个可安装、可发现、可复用的工作模块。",
          "这对企业尤其重要。过去很多所谓 agent 平台只是把工具调用塞进一个长提示词，真正的流程知识和外部连接全埋在隐式上下文里。现在 OpenAI 公开承认，可靠 agent 要么需要插件接工具，要么需要 skill 记流程，很多时候两者都要。这意味着编排开始变得像操作系统，而不是像一次性聊天技巧。",
        ],
      },
      {
        heading: "memory 和 automations 把编码代理推进到跨天任务层",
        headingEn: "Memory and automations move coding agents into cross-day task continuity",
        paragraphs: [
          "产品页还提到，Codex 可以复用已有 conversation threads、自动唤醒继续长任务、在未来排程工作，并预览 memory，让系统记住个人偏好、纠正和花时间才收集到的上下文。这个变化的价值，不是“更懂你”这种消费级说法，而是 agent 首次被明确设计成可以跨天延续工作状态的执行器。",
          "一旦任务能跨几天继续，问题就完全变了。系统不再只是生成一次答案，而要管理任务生命周期、上下文污染、优先级切换、日志和恢复点。对企业来说，这意味着编码代理不只是 IDE 附件，而更像一个轻量运维层：它既要帮你干活，也要知道哪些活值得继续、什么时候该醒来、接着之前的哪一条线推进。",
        ],
      },
      {
        heading: "真正的分水岭会落在权限和审查，而不是功能宣发",
        headingEn: "The real dividing line will be permissions and review, not launch spectacle",
        paragraphs: [
          "当一个 agent 开始浏览页面、连接 Google Drive、Slack、GitHub、JIRA、Notion、邮件和本地文件时，问题马上就不再是“它会不会做”，而是“它在哪些身份下做、被谁审、哪些动作可回滚、哪些上下文会被记住”。OpenAI Academy 明确说 Codex 不是替代判断，而是帮助把工作向前推进。这句话看似保守，实际上是在提前承认：判断权仍然必须留在人手里。",
          "所以这次更新真正把行业往前推了一步，但也把边界问题放大了。未来强的编码代理，不只是会写 PR，而是会成为一个默认工作台。可一旦它变成工作台，它就必须像工作台一样可治理：插件来源要可信，技能要可审，memory 要可删，computer use 要有权限面，自动续跑要有明确的停止条件。没有这些，超级入口只会把混乱做大。",
        ],
      },
      {
        heading: "来源与延伸阅读",
        headingEn: "Sources and further reading",
        paragraphs: [
          "今日资讯线索来自 AI 资讯速览与其 RSS： https://ai-digest.liziran.com/zh/ 和 https://ai-digest.liziran.com/zh/feed.xml 。它们仅作为 topic radar 使用，不参与正文改写。",
          "主要核验来源包括 OpenAI 于 2026 年 4 月 16 日发布的产品页《Codex for (almost) everything》： https://openai.com/index/codex-for-almost-everything/ ，以及 OpenAI Academy 于 2026 年 4 月 23 日发布的《What is Codex?》： https://openai.com/academy/what-is-codex/ 和《Plugins and skills》： https://openai.com/academy/codex-plugins-and-skills/ 。本文关于 computer use、browser、90+ plugins、memory、automations、plugin 与 skill 分工的判断，均来自这些官方一手材料。",
        ],
      },
    ],
  },
  {
    slug: "claude-code-quality-defaults-are-architecture",
    title: "Claude Code 这次事故最该记住的，不是“变笨”，而是默认值就是架构",
    titleEn: "The Claude Code lesson is not that it got worse, but that defaults are architecture",
    subtitle:
      "Anthropic 2026 年 4 月 23 日的 postmortem 把 reasoning effort、上下文缓存和 system prompt 三个产品层改动摊开讲清了：代码代理的质量，不只写在模型里，也写在默认选项和会话管理里",
    subtitleEn:
      "Anthropic's April 23, 2026 postmortem lays out how reasoning effort, context retention, and system prompt choices changed coding quality: agent quality lives in defaults and session management, not only in the model.",
    date: "2026-04-25",
    readTime: "13 分钟",
    tags: ["GEO", "智能体架构", "代码代理", "AI工作流", "Agent评测", "AI资讯"],
    excerpt:
      "Anthropic 官方承认，Claude Code 最近的质量下降不是 API 模型退化，而是产品层三个改动叠加：默认 effort 从 high 改成 medium、闲置会话清理 reasoning 的 bug、以及减少冗长的 prompt 调整。对企业来说，这说明默认值本身就是 agent 架构的一部分。",
    excerptEn:
      "Anthropic says the recent Claude Code quality issues were not model degradation in the API, but three product-layer changes: lower default effort, a stale-session reasoning bug, and a prompt change to reduce verbosity. For enterprises, defaults themselves are part of the architecture.",
    summary: [
      "Anthropic 在 2026 年 4 月 23 日的工程复盘里确认，Claude Code 质量问题来自三个产品改动，而 API 和 inference layer 未受影响。",
      "默认 reasoning effort 从 high 改成 medium、空闲会话后持续丢弃旧 reasoning、以及压缩 verbosity 的 system prompt 变更，分别改变了智能、记忆和编码表现，并已在 4 月 20 日前后回滚或修复。",
      "同一周 Anthropic 官方 Max 计划和帮助中心继续把 5x、20x 使用量和 Claude Code 终端使用打包成价格层级，这意味着 test-time compute、上下文寿命与成本预算已经被产品化，企业不能再把“默认设置”当细节。",
    ],
    summaryEn: [
      "Anthropic's April 23, 2026 engineering postmortem confirms that recent Claude Code quality problems came from three product-layer changes, while the API and inference layer were unaffected.",
      "Changing the default reasoning effort, dropping prior reasoning in stale sessions, and adding a prompt instruction to reduce verbosity each altered intelligence, memory, and coding behavior, and were later reverted or fixed.",
      "At the same time, Anthropic's Max plan documentation packages higher Claude Code usage into pricing tiers, showing that test-time compute, context lifetime, and cost budgets are now productized design decisions.",
    ],
    coverImage: "/media/editorial/lu-cheng-keynote.png",
    coverAlt: "卢成在演讲现场展示系统观点",
    sections: [
      {
        heading: "这不是一次“模型偷偷降智”的八卦",
        headingEn: "This is not just gossip about a secretly degraded model",
        paragraphs: [
          "Anthropic 在 2026 年 4 月 23 日发出的工程复盘里，第一件事就是把边界划清：受影响的是 Claude Code、Claude Agent SDK 和 Claude Cowork，API 没有被波及。这句话非常重要，因为它把问题从“模型本体是不是变差了”拉回到“产品层到底怎样把模型暴露给用户”。对智能体架构来说，这往往才是真正决定体验的地方。",
          "很多团队习惯把代码代理的质量全归因给底层模型，好像只要换个更强模型，一切都会自动变好。但 Anthropic 这次自己把答案写出来了：哪怕模型没变，只要默认 reasoning effort、会话上下文管理和 system prompt 发生变化，用户体感就能显著波动。也就是说，代理系统的行为不是单靠模型定义，而是由一整层产品默认值共同定义。",
        ],
      },
      {
        heading: "default effort 从 high 改成 medium，本质上是在改智能预算",
        headingEn: "Changing the default effort changes the intelligence budget",
        paragraphs: [
          "Anthropic 复盘写得很直白：3 月 4 日，他们把 Claude Code 默认 reasoning effort 从 high 调到 medium，目的是减少高 effort 带来的超长等待和使用量消耗；4 月 7 日又改回来，因为用户更希望默认拿到更高智能，再自己选择什么时候降级。这里最值得看的不是谁判断对错，而是 Anthropic 明确承认了 effort 就是沿着 test-time-compute curve 选点。",
          "这意味着什么？意味着代码代理的“智力”不再只是一张模型排行榜，而是一次产品决策：默认给用户多少思考预算、换多少延迟、打掉多少 usage limit。企业如果今天还把 agent 看成一个固定能力黑盒，就会错过最关键的一层。默认 effort 其实是在给你的工作流设置智能上限和成本上限。",
        ],
      },
      {
        heading: "空闲会话后的缓存 bug 暴露了长任务最脆弱的地方",
        headingEn: "The stale-session caching bug exposed the weak point of long tasks",
        paragraphs: [
          "第二个问题更值得企业警惕。Anthropic 说，3 月 26 日他们为了降低恢复闲置会话时的延迟，加入了清理旧 reasoning 的机制，但一个 bug 让这个标志在后续每一轮都持续生效，结果 Claude 越做越忘，表现为重复、遗忘和奇怪的工具选择。更关键的是，它还让缓存命中率下降，连使用量消耗都被一起放大了。",
          "这就是长任务 agent 的典型风险。只要系统需要跨时段恢复，会话生命周期、缓存标志和推理历史保留策略就不再是后台实现细节，而会直接改变结果质量。很多企业想做 hours-long agents，却没有把 context retention 和 cache behavior 作为一等公民去看。Anthropic 这次等于公开示范了一遍：会话管理写错，能力感知、成本和稳定性会一起出问题。",
        ],
      },
      {
        heading: "system prompt 的微调也会改变编码结果",
        headingEn: "A small system prompt change can still alter coding quality",
        paragraphs: [
          "第三个问题更加说明产品层不是附属层。Anthropic 在 4 月 16 日加了一条减少冗长输出的 system prompt 指令，和其他 prompt 变化叠加后，直接伤到了 coding quality，于是 4 月 20 日回滚。很多人会觉得 prompt 只是界面上的措辞，真正能力还在模型里。但对代码代理来说，prompt 其实是在规定它如何分配解释、行动、工具使用和输出风格。",
          "这也是为什么我一直说，system prompt 不该被看成一个藏在产品里的文案文件，而应该被当成运行时策略。它会影响 agent 是否多想一步、是否说清依据、是否过早收缩行动空间、是否在工具之间转得太快。你把 prompt 当文案管理，系统就会用事故提醒你它其实更接近调度器。",
        ],
      },
      {
        heading: "当 Max 计划把 Claude Code usage 卖成套餐，默认值就不只是 UX 了",
        headingEn: "Once Max packages Claude Code usage into tiers, defaults stop being mere UX",
        paragraphs: [
          "同一周，Anthropic 官方 Max 计划页面和帮助中心继续明确两档订阅：5x 是每月 100 美元，20x 是每月 200 美元；帮助文档还写明 usage limits 同时覆盖 Claude 和 Claude Code，会按 5 小时 session 重置。这个信息和 postmortem 放在一起读，意义就完全不一样了。它说明 reasoning budget、上下文寿命和使用上限已经不是后台工程参数，而是被打包成了产品经济学。",
          "所以企业真正该学到的，不是围观一次厂商事故，而是把默认值纳入治理。默认 effort 是多少，空闲多久算 stale，旧 reasoning 留不留，prompt 改动如何评测，usage budget 用什么方式暴露给员工，这些都应该被记录、评估和审计。否则你看到的只是“今天 agent 好像不好用了”，而看不到到底是智能、缓存、策略还是套餐在偷偷改你的系统。",
        ],
      },
      {
        heading: "来源与延伸阅读",
        headingEn: "Sources and further reading",
        paragraphs: [
          "今日资讯线索来自 AI 资讯速览与其 RSS： https://ai-digest.liziran.com/zh/ 和 https://ai-digest.liziran.com/zh/feed.xml 。它们仅作为 lead discovery，不作为正文改写来源。",
          "主要核验来源包括 Anthropic 于 2026 年 4 月 23 日发布的工程复盘《An update on recent Claude Code quality reports》： https://www.anthropic.com/engineering/april-23-postmortem ，以及 Anthropic 的 Max 计划页面： https://claude.com/pricing/max 。价格与使用限制的补充核验来自 Anthropic Help Center 的《About Claude's Max Plan Usage》： https://support.anthropic.com/en/articles/11014257-about-claude-s-max-plan-usage 和《How much does the Max plan cost?》： https://support.anthropic.com/en/articles/11049744-how-much-does-the-max-plan-cost 。本文关于 effort、缓存、prompt 和套餐经济学的判断，均基于这些官方材料。",
        ],
      },
    ],
  },
  {
    slug: "agent-environmental-curiosity-benchmark-gap",
    title: "Agent 看到答案却不去用，说明今天的问题不是推理不够，而是不会重新理解环境",
    titleEn:
      "When agents see the answer and still ignore it, the problem is not raw reasoning alone but the failure to reinterpret the environment",
    subtitle:
      "《Agents Explore but Agents Ignore》这篇 2026 年 4 月 19 日提交的论文，把 agent 的失败拆成两个动作：能不能发现有用线索，和发现后会不会因此改计划",
    subtitleEn:
      "The paper 'Agents Explore but Agents Ignore', submitted on April 19, 2026, splits agent failure into two steps: discovering useful clues and revising the plan once they are found.",
    date: "2026-04-25",
    readTime: "12 分钟",
    tags: ["GEO", "AI论文", "Agent评测", "智能体架构", "代码代理", "AI工作流"],
    excerpt:
      "这篇论文最扎心的结论不是 agent 找不到答案，而是它们经常已经看见答案，却继续沿着原来的 reasoning trace 往前走。问题不只在模型知识，而在系统是否会把环境观测重新写回行动计划。",
    excerptEn:
      "The most uncomfortable conclusion of this paper is not that agents fail to find answers, but that they often see the answer and still keep following the old reasoning trace. The bottleneck is whether environmental observations rewrite the action plan.",
    summary: [
      "论文《Agents Explore but Agents Ignore》于 2026 年 4 月 19 日提交 arXiv，在 Terminal-Bench、SWE-Bench 和 AppWorld 中故意把完整答案放进环境，看 agent 会不会真的利用它。",
      "结果显示，Terminal-Bench 中 agent 在 79%-81% 的运行里能发现答案线索，但只在 37%-50% 的情况下真正利用；AppWorld 里超过 90% 的尝试看到了“返回完整解答”的命令说明，真正调用却不到 7%。",
      "论文把这个缺口命名为 environmental curiosity，并指出工具脚手架、test-time compute 和训练分布会共同影响它；这对企业 agent 的启发是，过程指标和环境反思能力必须进入评测主轴。",
    ],
    summaryEn: [
      "The paper 'Agents Explore but Agents Ignore', submitted to arXiv on April 19, 2026, injects full solutions into Terminal-Bench, SWE-Bench, and AppWorld to test whether agents actually exploit them.",
      "On Terminal-Bench, agents discover the solution in 79%-81% of runs but exploit it only 37%-50% of the time; on AppWorld, over 90% of attempts see a command that returns the full solution, yet fewer than 7% call it.",
      "The authors name this gap environmental curiosity and show that tool scaffolding, test-time compute, and training distribution shape it, implying that process metrics and environmental reflection must become first-class evaluation targets.",
    ],
    coverImage: "/media/editorial/lu-cheng-summit.png",
    coverAlt: "卢成的峰会风格肖像",
    sections: [
      {
        heading: "这篇论文真正打脸的，不是模型，而是我们对 agent 的想象",
        headingEn: "This paper challenges our assumptions about agents more than about models",
        paragraphs: [
          "很多人默认认为，只要 agent 在环境里看见了有用信息，它就会顺手把它用起来。这个假设听上去非常自然：看见线索、更新计划、继续执行，不就是智能体最该做的事吗？《Agents Explore but Agents Ignore》这篇 2026 年 4 月 19 日提交的论文，就是专门来打这个默认想象的。",
          "作者做法非常直接：不是让 agent 去猜答案，而是把完整解法故意塞进 Terminal-Bench、SWE-Bench 和 AppWorld 的环境里，观察它们会不会真的利用。结果很残酷。很多 agent 并不是没看见，而是看见了仍然照着原先的 reasoning trace 往前走。这说明今天的问题不只是知识不足，而是环境观测并没有真正重写行动计划。",
        ],
      },
      {
        heading: "discovery 和 interaction 之间的缺口，才是今天 agent 的核心症状",
        headingEn: "The gap between discovery and interaction is the core symptom",
        paragraphs: [
          "论文摘要给出的数字足够说明问题：在 Terminal-Bench 里，agent 有 79%-81% 的运行能发现被注入的答案，但真正利用只有 37%-50%；在 AppWorld 里，agent 超过 90% 的尝试看到了一个明确写着“returns the complete solution to this task”的命令说明，可真正调用它的不到 7%。也就是说，发现不等于行动，读取不等于改计划。",
          "这个区分太关键了。今天很多 benchmark 只看 pass@k 或终态成功率，会把“它最后做成了没有”当成唯一指标。但如果一个 agent 经常已经读到强线索仍然不改路径，它在真实环境里就会表现为另一种失败：不是不会查，而是不会停下来重新理解自己刚刚看到的世界。",
        ],
      },
      {
        heading: "environmental curiosity 不是好听的新词，而是系统能力空白",
        headingEn: "Environmental curiosity is a concrete systems gap, not a catchy term",
        paragraphs: [
          "作者把这个能力缺口命名为 environmental curiosity，也就是面对意外但相关的环境刺激时，是否会主动识别、调查并调整策略。这个概念我觉得非常准确，因为它抓到的是 agent 在生产环境里最常见却最少被量化的问题：系统会执行熟悉套路，却不太会处理“意外但重要”的信息。",
          "企业里的真实工作几乎全是这种意外。日志里突然多出一个权限报错，文档里刚好有一页写着迁移捷径，后台页面里某个按钮说明其实暴露了完整 API 路径，代码库 README 已经告诉你该用哪个命令。强 agent 不该只是按既定计划推进，而应该在环境冒出强信号时及时改道。今天多数系统做不到这一点。",
        ],
      },
      {
        heading: "工具脚手架、test-time compute 和训练分布会一起塑造这个问题",
        headingEn: "Tool scaffolds, test-time compute, and training distribution shape this gap",
        paragraphs: [
          "论文进一步指出，environmental curiosity 会受三类因素影响：工具脚手架、test-time compute、训练分布。这个结论很有意思，因为它再次说明 agent 行为不是模型单变量。你给什么工具、让它想多久、拿什么任务分布去后训练，都会改变它在环境里是“灵活观察者”还是“顽固执行器”。",
          "这点和很多团队的直觉正好相反。很多人以为加更多工具、做更窄的任务微调一定会更好。但论文显示，工具结构和训练分布也可能让 agent 更容易沿着熟悉路线机械前进，反而减少对意外信息的利用。换句话说，系统越像流水线，可能越不擅长在现场重新判断。",
        ],
      },
      {
        heading: "为什么这对代码代理和企业 agent 特别重要",
        headingEn: "Why this matters especially for coding agents and enterprise agents",
        paragraphs: [
          "Terminal-Bench 的 GitHub 仓库把自己定义成“a benchmark for LLMs on complicated tasks in the terminal”。这类 benchmark 的价值，不是拿来做榜单消费，而是提醒我们：真实工作不像填空题。它是在复杂终端环境、文档、文件和命令之间来回切换。agent 能不能把环境当成动态信息源，而不是静态背景，决定了它是会做事还是只会跑套路。",
          "对企业来说，这篇论文最大的价值是重新定义评测重点。你不能只看成功率，还要看 agent 是否会在关键观测出现后停下来修正计划。否则系统上线后就会出现一种很危险的错觉：明明工具、文档和答案都在环境里，agent 却一次次绕远路，消耗 token 和工时，只因为它没有把新观测写回自己的执行逻辑。",
        ],
      },
      {
        heading: "来源与延伸阅读",
        headingEn: "Sources and further reading",
        paragraphs: [
          "今日论文线索来自 AI 论文简报与其 RSS： https://ai-brief.liziran.com/zh/ 和 https://ai-brief.liziran.com/zh/feed.xml 。它们仅作为选题雷达使用。",
          "主要核验来源包括 arXiv 论文页面《Agents Explore but Agents Ignore: LLMs Lack Environmental Curiosity》： https://arxiv.org/abs/2604.17609 ，以及 Terminal-Bench 官方 GitHub 仓库： https://github.com/harbor-framework/terminal-bench 。本文关于 discovery / interaction 缺口、Terminal-Bench 与 AppWorld 的实验设定、以及 benchmark 对复杂终端任务的意义，均来自论文摘要与官方仓库描述。",
        ],
      },
    ],
  },
  {
    slug: "tracer-production-log-routing-boundary",
    title: "TRACER 的重点不是省钱，而是终于把 LLM 路由边界做成了可审计资产",
    titleEn:
      "TRACER matters not because it saves money, but because it turns LLM routing boundaries into auditable assets",
    subtitle:
      "把生产日志训成 surrogate 不是新鲜事，真正值得看的是 TRACER 用 parity gate、coverage 校准和部署阻断，把“哪些请求该交给小模型”写成可验证的系统契约",
    subtitleEn:
      "Training surrogates on production traces is not new by itself. What matters in TRACER is the way parity gates, coverage calibration, and deployment guards turn routing decisions into a verifiable system contract.",
    date: "2026-04-25",
    readTime: "12 分钟",
    tags: ["GEO", "AI论文", "智能体架构", "AI工作流", "Agent评测", "GitHub"],
    excerpt:
      "TRACER 这篇论文抓住了很多团队已经隐约知道却没系统化的事实：如果 LLM 正在做分类，每一次线上调用都在免费生产训练样本。难点不是能不能训个小模型，而是怎样把替换边界做成可解释、可校准、可阻断的部署规则。",
    excerptEn:
      "TRACER formalizes something many teams already sense: if an LLM is doing classification, every production call creates training data. The hard part is not training a smaller model, but making the replacement boundary interpretable, calibrated, and blockable.",
    summary: [
      "TRACER 于 2026 年 4 月 16 日提交 arXiv，核心主张是：LLM 分类端点的生产 traces 本身就是持续增长的标注语料，可以训练轻量 surrogate 吸收后续流量。",
      "论文提出 parity gate，并在 77 类 intent 任务上报告 83%-100% 的 surrogate coverage，在 150 类 benchmark 上实现完全替换；同时它也强调，在自然语言推理任务上由于表示不可分，系统会拒绝部署。",
      "官方 GitHub README 把方法拆成 fit、gate、calibrate、guard，并把 manifest、report、frontier 和 qualitative_report 这些审计产物写进 .tracer 目录，说明这不是单纯蒸馏技巧，而是路由治理体系。",
    ],
    summaryEn: [
      "Submitted on April 16, 2026, TRACER argues that production traces from LLM classification endpoints form a growing labeled dataset that can train lightweight surrogates to absorb future traffic.",
      "The paper introduces a parity gate and reports 83%-100% surrogate coverage on a 77-class intent task, full replacement on a 150-class benchmark, and a deliberate refusal to deploy on natural language inference because the representation is not separable enough.",
      "The official GitHub README breaks the method into fit, gate, calibrate, and guard, and stores manifest and audit artifacts under .tracer, showing that the contribution is a routing governance stack rather than a mere distillation trick.",
    ],
    coverImage: "/media/editorial/lu-cheng-keynote.png",
    coverAlt: "卢成在演讲现场展示系统观点",
    sections: [
      {
        heading: "TRACER 之所以重要，不是因为“省 API 钱”这个结论",
        headingEn: "TRACER matters for more than the cost-saving headline",
        paragraphs: [
          "如果只看标题，TRACER 很容易被误读成又一个 LLM 成本优化方案：线上跑一阵大模型，攒够日志后再训一个小模型接管流量。这种理解太浅了。真正有价值的地方，在于论文把很多团队私下会做但不敢正式依赖的事情，重新包装成了一套带边界控制的系统方法：什么时候小模型可以上，什么时候必须 defer 回大模型，什么时候连部署都不该通过。",
          "也正因为如此，我不觉得 TRACER 的核心是“便宜”，而是“边界写得清楚”。企业真正缺的不是一个更省钱的小模型，而是一种可以向业务、风控和平台团队解释清楚的路由契约：哪些输入由 surrogate 处理，达到什么一致性才算合格，边缘区域怎样被识别，无法保证时怎样自动退回 teacher。",
        ],
      },
      {
        heading: "论文把生产日志重新定义成了训练语料，而不是运维副产物",
        headingEn: "The paper reframes production logs as training data, not just ops residue",
        paragraphs: [
          "TRACER 的论文摘要开门见山：每一次 LLM 分类端点调用，都会留下一个输入和 teacher 输出组成的标签样本。这些 traces 不是顺手留下的垃圾，而是一个持续增长的免费训练集。只要场景本身是 classification，而不是开放式生成，这个判断就非常扎实，因为线上 teacher 已经替你完成了标注。",
          "这件事的意义不只是训练更便宜，而是让系统第一次能把“路由改进”绑定到真实生产分布。很多模型蒸馏方法在离线数据上很好看，一到线上就分布漂移。TRACER 相反，它直接从线上 traces 学，意味着 surrogate 的成长路径和生产请求分布天然对齐。问题随之变成：怎样证明它已经足够可靠，而不是盲目替换。",
        ],
      },
      {
        heading: "parity gate 把“能不能上”写成了部署门禁",
        headingEn: "The parity gate turns deployment into an explicit gate",
        paragraphs: [
          "论文最关键的结构，就是 parity gate。TRACER 不是简单训完 surrogate 就让它吃流量，而是要求系统在给定阈值 alpha 下，证明 surrogate 与 teacher 的 agreement 足够高，再用 acceptor 去判断每个输入是否值得交给 surrogate。摘要还给出一个很好的反例：在自然语言推理任务上，因为 embedding 表示不支持可靠分离，系统会拒绝部署。这一步非常工程化，也非常少见。",
          "为什么我觉得这一步比分数更重要？因为企业真正害怕的，不是模型便宜不便宜，而是边界不透明。一个只会告诉你“平均准确率挺高”的系统，不足以上线；一个能明确说“这些区域我能接，这些区域我必须 defer，这个任务现在还不该部署”的系统，才具备治理价值。TRACER 把不确定性从隐藏误差，变成了显式门禁。",
        ],
      },
      {
        heading: "GitHub README 说明这已经不是论文想法，而是可落地的治理流程",
        headingEn: "The GitHub README shows this is already a concrete governance workflow",
        paragraphs: [
          "官方 GitHub README 把方法拆得很清楚：fit、gate、calibrate、guard。先从 traces 里选 surrogate，再学习 acceptor，再扫阈值追求目标 parity，最后如果过不了 held-out 数据上的门槛就直接阻断部署。README 还把 .tracer 目录里的 manifest.json、frontier.json、qualitative_report.json 和 report.html 写明了用途。这些东西本质上就是审计资产。",
          "这一点很关键，因为很多论文只给方法，不给组织可用的产物。TRACER 不一样，它已经在仓库层面承认路由系统要接受审查。manifest 记录方法和 coverage，qualitative report 记录边界样本，HTML report 让人能看见 surrogate 到底接了什么、不接什么。换句话说，TRACER 不是把路由藏进模型里，而是把路由边界外化出来。",
        ],
      },
      {
        heading: "对企业最实际的启发：别急着让小模型取代大模型，先把边界资产化",
        headingEn: "The practical lesson is to assetize the boundary before replacing the model",
        paragraphs: [
          "很多团队会看完论文马上想到一件事：那我是不是也该把线上 LLM 分类全换掉？我觉得顺序不该这么走。更稳的做法是先盘点哪些场景真的是 classification，teacher 输出是否足够稳定，线上 traces 是否可回放，哪些错误类别必须强制 defer。只有这些前提成立，surrogate 替换才有意义。",
          "从智能体架构角度看，TRACER 更像一套模型运营方法，而不只是论文方法。它教会团队的不是“如何省钱”，而是“如何把替换边界写成持续更新的资产”。谁先把边界资产化，谁就能更稳地做模型路由；谁只看到调用成本，就会忽略部署阻断、错误外溢和可解释性这些真正昂贵的地方。",
        ],
      },
      {
        heading: "来源与延伸阅读",
        headingEn: "Sources and further reading",
        paragraphs: [
          "今日论文线索来自 AI 论文简报与其 RSS： https://ai-brief.liziran.com/zh/ 和 https://ai-brief.liziran.com/zh/feed.xml 。它们仅作为 topic radar 使用。",
          "主要核验来源包括 arXiv 论文页面《TRACER: Trace-Based Adaptive Cost-Efficient Routing for LLM Classification》： https://arxiv.org/abs/2604.14531 ，以及官方 GitHub 仓库： https://github.com/adrida/tracer 。本文关于 parity gate、77 类 intent 任务的 83%-100% coverage、150 类任务完全替换、NLI 场景拒绝部署，以及 fit / gate / calibrate / guard 与 .tracer 审计产物的判断，均来自论文摘要和官方 README。",
        ],
      },
    ],
  },
];
