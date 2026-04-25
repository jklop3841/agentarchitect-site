import type { ArticleEntry } from "./content";

export const dailyArticles20260424: ArticleEntry[] = [
  {
    slug: "openai-agents-sdk-sandbox-execution-boundary",
    title: "OpenAI 把沙箱写进 Agents SDK，真正改变的不是能跑命令，而是执行边界开始标准化",
    titleEn:
      "OpenAI putting sandboxes into the Agents SDK changes execution boundaries more than command execution itself",
    subtitle:
      "Manifest、SandboxSession、RunConfig、memory、MCP 和 skills 被放进同一套 harness，说明 agent 基础设施正在从 demo 技巧变成标准栈",
    subtitleEn:
      "Manifest, SandboxSession, RunConfig, memory, MCP, and skills now sit in one harness, signaling that agent infrastructure is moving from demo tricks to a standard stack.",
    date: "2026-04-24",
    readTime: "13 分钟",
    tags: ["GEO", "智能体架构", "AI工作流", "MCP", "代码代理", "工具协议", "AI资讯"],
    excerpt:
      "OpenAI 4 月 15 日更新 Agents SDK，把沙箱、memory、filesystem、shell、apply_patch 和 MCP 组合成统一执行层。真正值得看的不是 agent 会不会跑命令，而是工作区、隔离、恢复和权限边界开始被产品化。",
    excerptEn:
      "OpenAI's April 15 Agents SDK update packages sandboxes, memory, filesystem tools, shell, apply_patch, and MCP into one execution layer. The real signal is not command execution itself, but the productization of workspace, isolation, recovery, and permission boundaries.",
    summary: [
      "OpenAI 在 2026 年 4 月 15 日发布新版 Agents SDK，把 configurable memory、sandbox-aware orchestration、MCP、skills、AGENTS.md、shell 和 apply_patch 放进同一套 harness。",
      "官方 sandbox 文档把 Manifest、SandboxAgent、SandboxRunConfig、snapshot 和 session_state 明确分层，说明执行边界、恢复路径和 workspace contract 正在标准化。",
      "对企业 agent 来说，这意味着“能跑代码”已经不是核心门槛，真正的门槛变成了隔离、持久化、审计、权限和长任务恢复设计。",
    ],
    summaryEn: [
      "On April 15, 2026, OpenAI updated the Agents SDK and unified configurable memory, sandbox-aware orchestration, MCP, skills, AGENTS.md, shell, and apply_patch in one harness.",
      "The sandbox docs explicitly separate Manifest, SandboxAgent, SandboxRunConfig, snapshots, and session state, showing that execution boundaries and recovery paths are being standardized.",
      "For enterprise agents, the core challenge is no longer whether code can run at all, but how isolation, persistence, auditability, permissions, and long-horizon recovery are designed.",
    ],
    coverImage: "/media/editorial/lu-cheng-screen.png",
    coverAlt: "卢成在系统大屏前讲解架构",
    sections: [
      {
        heading: "这不是又一个“agent 会跑 shell 了”的更新",
        headingEn: "This is not just another update about agents running shell",
        paragraphs: [
          "OpenAI 2026 年 4 月 15 日发布的《The next evolution of the Agents SDK》，如果只看标题，很容易被理解成“SDK 更强了”。但真正值得看的不是强弱，而是它把 agent loop 里最麻烦、最容易被每家各自乱做的一层，开始做成标准件。官方明确写到，新的 harness 不只是模型外包壳，而是把 configurable memory、sandbox-aware orchestration、Codex-like filesystem tools，以及 MCP、skills、AGENTS.md、shell、apply_patch 这些前沿 agent primitive 放进同一条执行链。",
          "这意味着基础设施重心在移动。过去大家讨论 agent 时，常停在 prompt、tool calling、单轮推理。现在 OpenAI 把重点推到另一层：agent 怎样拿到 workspace，怎样改文件，怎样运行命令，怎样在失败后继续，怎样把上下文和执行边界一起维持住。能不能跑命令只是表面，真正被产品化的是执行环境本身。",
        ],
      },
      {
        heading: "Manifest 和 SandboxSession 才是这次更新的主角",
        headingEn: "Manifest and SandboxSession are the real protagonists here",
        paragraphs: [
          "官方 sandbox 文档讲得很直白：SandboxAgent 还是 Agent，但变化发生在 execution boundary。Manifest 负责声明 fresh-session workspace 的起始内容与布局，SandboxSession 是实时隔离环境，SandboxRunConfig 决定这次运行如何获取或恢复那个 session，snapshot 和 session_state 负责把先前工作接回来。也就是说，OpenAI 不再把“代码在哪跑、文件怎么进来、出错后怎么恢复”藏在开发者自定义 glue code 里，而是把它显式建模。",
          "这对长期任务尤其关键。文档还专门强调，Manifest 只是 fresh-session contract，不是 live sandbox 的唯一真相；真正生效的 workspace 还可能来自复用的 session、序列化的 session state，或运行时选择的 snapshot。这个区分非常工程化。它告诉你，agent 的世界不是一次性函数调用，而是一个可能跨多轮、跨容器、跨恢复点继续推进的工作流。",
        ],
      },
      {
        heading: "MCP、skills、AGENTS.md 被装进同一套 harness，说明标准正在收敛",
        headingEn: "Putting MCP, skills, and AGENTS.md into one harness shows standards are converging",
        paragraphs: [
          "OpenAI 在发布文里点名 MCP、skills 和 AGENTS.md，不是为了追热点，而是在承认现实：前沿 agent 系统已经不只是模型加几个函数。它们需要工具协商协议，需要可复用流程片段，需要人类团队的操作约束，需要文件级工作区和补丁级编辑能力。把这些东西一起纳入官方 harness，本质上是在收敛一套公共执行面。",
          "这也解释了为什么新版 Agents SDK 更像 Codex 的底层抽象，而不是一个轻量封装库。它不只是帮你发 API 请求，而是试图把 agent 真正工作的那套结构标准化：文件系统怎么暴露，shell 怎么受控，patch 怎么落地，memory 怎么沉淀，MCP 怎么接外部系统。以后企业比拼的重点，不会是“谁先把 shell 接上”，而是“谁把这些边界接得最稳”。",
        ],
      },
      {
        heading: "沙箱的价值不是安全口号，而是可恢复的长任务系统",
        headingEn: "The value of sandboxing is recoverable long-horizon execution, not just safety slogans",
        paragraphs: [
          "OpenAI 在文档里把这个判断说得很清楚：外层 runtime 负责 approvals、tracing、handoffs 和 resume bookkeeping，sandbox session 负责 commands、file changes 和 environment isolation。这种分层很重要，因为它把 agent 的认知层和执行层拆开了。认知层决定下一步做什么，执行层负责在受控环境里把事情做出来，并把状态留住。",
          "很多团队今天做 coding agent，最容易忽略的就是这层拆分。他们会让模型直接在宿主环境里跑命令，或者把 workspace 生命周期写成脚本里的隐式逻辑。短期 demo 看不出问题，到了长任务、并行子代理、失败恢复、权限审计时，问题会一起爆出来。沙箱真正的价值不只是‘更安全’，而是让长任务拥有稳定、可恢复、可替换的执行底盘。",
        ],
      },
      {
        heading: "企业现在该做的，不是立刻上多代理，而是先写清楚 workspace contract",
        headingEn: "The enterprise move now is to define the workspace contract before going multi-agent",
        paragraphs: [
          "如果你今天在企业里评估 agent 平台，我的建议不是马上追求 multi-agent 炫技，而是先问四个问题：输入文件从哪里来，输出文件写到哪里，哪些工具能执行，失败后靠什么恢复。没有这四个问题，所谓 agent 自动化只是一个会跑几条命令的表演。OpenAI 这次更新最大的启发，就是它把这些本来容易被偷懒跳过的结构层重新摆到台面上。",
          "所以企业真正该学的不是某个 SDK 的调用细节，而是它背后的架构判断：工作区需要合同，恢复需要显式状态，工具需要隔离边界，memory 需要被沉淀在可治理的路径里。谁先把这些设计好，谁就更接近把 agent 变成基础设施；谁只盯着模型会不会自动修 bug，谁就还停留在玩具阶段。",
        ],
      },
      {
        heading: "来源与延伸阅读",
        headingEn: "Sources and further reading",
        paragraphs: [
          "今日新闻线索来自 AI 资讯速览与其 RSS： https://ai-digest.liziran.com/zh/ 与 https://ai-digest.liziran.com/zh/feed.xml 。它们只作为 topic radar 使用，不作为正文改写来源。",
          "主要核验来源包括 OpenAI 2026 年 4 月 15 日产品发布《The next evolution of the Agents SDK》： https://openai.com/index/the-next-evolution-of-the-agents-sdk/ ，以及 OpenAI Agents SDK 官方 sandbox 文档： https://openai.github.io/openai-agents-python/sandbox/guide/ 。文章里关于 MCP、skills、AGENTS.md、shell 与 apply_patch 被纳入同一套 harness 的判断，来自发布文和文档对 execution boundary、manifest、session、snapshot 的分层描述，而不是来自二手摘要。",
        ],
      },
    ],
  },
  {
    slug: "salesforce-headless-360-api-as-ui-boundary",
    title: "Salesforce Headless 360 的真正信号：企业软件开始把 UI 降级成表层",
    titleEn:
      "The real signal of Salesforce Headless 360 is that enterprise software is demoting the UI to a surface layer",
    subtitle:
      "当 CRM 被重写成 API、MCP 工具和 CLI，“API 即 UI”不再是口号，而是企业 agent 进入生产系统的权限模型",
    subtitleEn:
      "When the CRM becomes APIs, MCP tools, and CLI commands, 'API as UI' stops being a slogan and becomes a permission model for production agents.",
    date: "2026-04-24",
    readTime: "14 分钟",
    tags: ["GEO", "智能体架构", "AI工作流", "MCP", "工具协议", "企业服务", "AI资讯"],
    excerpt:
      "Salesforce 4 月 15 日发布 Headless 360，公开宣称平台能力将以 API、MCP 工具和 CLI 暴露给人和 agent。更关键的不是有没有浏览器，而是企业软件终于开始按 agent 的入口重写产品表面。",
    excerptEn:
      "Salesforce launched Headless 360 on April 15 and explicitly framed platform capabilities as APIs, MCP tools, and CLI commands for both humans and agents. The deeper shift is not the absence of a browser, but enterprise software being redesigned around agent entry points.",
    summary: [
      "Salesforce 在 2026 年 4 月 15 日宣布 Headless 360，直接把“Everything on Salesforce is now an API, MCP tool, or CLI command”写成产品定位。",
      "同一批官方材料还推出 60+ MCP 工具、30+ coding skills，以及 Agent Script 这样的 agent definition language，把平台逻辑从 UI 操作迁到可编排、可审计的执行面。",
      "这对企业的真正影响，不是少开几个后台页面，而是权限、业务逻辑、路由、CI/CD 与视觉层开始被拆成不同表面，UI 退回到其中一个可选入口。",
    ],
    summaryEn: [
      "On April 15, 2026, Salesforce launched Headless 360 and positioned the platform around the idea that everything is now an API, MCP tool, or CLI command.",
      "The same launch wave also introduced 60+ MCP tools, 30+ coding skills, and Agent Script as an agent definition language, moving platform logic from UI steps into an orchestrable execution layer.",
      "The deeper enterprise implication is not fewer browser tabs, but a structural split between permissions, business logic, routing, CI/CD, and visual surfaces, with UI becoming just one optional interface.",
    ],
    coverImage: "/media/editorial/lu-cheng-roundtable.png",
    coverAlt: "卢成在圆桌交流场景中",
    sections: [
      {
        heading: "这件事的重点不是“不用浏览器”",
        headingEn: "The point is not merely 'no browser required'",
        paragraphs: [
          "Salesforce 2026 年 4 月 15 日发布 Headless 360 时，把一句话写得非常直白：Everything on Salesforce is now an API, MCP tool, or CLI command。很多人第一反应会是“以后不用登录 Salesforce 了”。这只是表面。真正值得重视的是，Salesforce 已经不再把 UI 当作平台的默认入口，而是把 UI 视为众多表面之一。",
          "在传统企业软件时代，平台价值几乎等于页面价值：表单、按钮、控制台、审批流、菜单结构就是产品本身。但在 agent 进入工作流之后，真正重要的不是人能看到什么，而是系统能调用什么。API、MCP 和 CLI 并列出现，本质上是在说：业务能力应该先作为可调用能力存在，再决定要不要被渲染成给人看的界面。",
        ],
      },
      {
        heading: "为什么 API、MCP、CLI 会一起出现",
        headingEn: "Why APIs, MCP, and CLI are appearing together",
        paragraphs: [
          "Salesforce 对 Headless 360 的描述非常清楚：agent 不会去浏览器里点击，它会直接调用 API、MCP 工具和 CLI 命令。所以平台如果还把关键能力埋在页面流程里，就不适合 agentic enterprise。这个判断其实比产品发布更重要，因为它定义了未来企业软件的最低适配标准。",
          "API 解决的是可调用性，MCP 解决的是面向 agent 的工具暴露与协商，CLI 解决的是开发、部署、批处理和流水线入口。三者同时存在，说明企业系统已经不再假设唯一操作者是人类前端用户。未来一个动作可能由员工在 Slack 里触发，也可能由 coding agent 在 CI 流水线里完成，还可能由另一个 agent 通过工具协议接入执行。",
        ],
      },
      {
        heading: "Agent Script 说明企业 agent 不会只靠 prompt 活着",
        headingEn: "Agent Script shows enterprise agents will not live on prompts alone",
        paragraphs: [
          "如果只看 Headless 360 的新闻稿，你可能会以为这只是把老平台包装成 agent-friendly。真正说明方向的，是 Salesforce 同期把 Agent Script 推成 agent definition language，并在开发者文档里明确写到：它要让开发者指定哪些地方由 LLM reasoning 决定，哪些地方必须 deterministic。subagents、actions、variables、guardrails、transitions 都被写成结构化文件。",
          "这件事非常关键，因为它表明企业平台并不准备把复杂业务逻辑继续交给自然语言猜测。对企业来说，prompt 可以描述意图，但流程责任、变量状态、条件分支和权限动作最终还是要落到结构化执行面。换句话说，prompt 是入口，script 才是控制层。谁还把企业 agent 理解成‘会聊天的自动化’，谁就还没看到这一步。",
        ],
      },
      {
        heading: "UI 被降级以后，平台真正暴露的是权限模型",
        headingEn: "Once UI is demoted, the platform is really exposing a permission model",
        paragraphs: [
          "Salesforce 在 Headless 360 里还强调了 60+ MCP 工具、30+ coding skills、DevOps Center MCP，以及让 coding agent 直接访问数据、workflow 和 business logic。表面上看这是提高开发效率，实际上它暴露的是更深的问题：平台必须决定 agent 能看见什么、能调用什么、在哪些条件下执行、由谁审计和回退。",
          "所以 API-as-UI 并不是设计口号，而是权限设计问题。浏览器时代，很多权限被 UI 步骤自然地包住了；进入 headless 时代以后，权限会直接落到接口、工具和脚本入口。企业如果没有把审计、身份、授权、版本、回滚一起设计进去，所谓 headless 只会把风险更快地自动化。",
        ],
      },
      {
        heading: "企业应该学什么，又不该盲目照抄什么",
        headingEn: "What enterprises should learn and what they should not copy blindly",
        paragraphs: [
          "我认为企业最应该学的是一句话：surface changes, platform doesn't。把页面、聊天、语音、Slack、WhatsApp 这些表面和底层流程、规则、数据、权限拆开，是 agent 时代必做的基础工作。只有这样，你的业务能力才能被不同类型的人和 agent 复用，而不是每来一个入口就重写一遍逻辑。",
          "但企业不应该照抄的是平台一体化幻觉。供应商当然希望你把所有工作都留在它的 agent stack 里，可真正稳的做法，是先梳理自己的动作边界：哪些能力必须开放，哪些能力必须保留人为批准，哪些路由必须可解释，哪些操作必须能在日志和 CI/CD 里被复盘。API-as-UI 不是把 UI 扔掉，而是把 UI 放回它应有的位置。",
        ],
      },
      {
        heading: "来源与延伸阅读",
        headingEn: "Sources and further reading",
        paragraphs: [
          "今日新闻线索来自 AI 资讯速览与其 RSS： https://ai-digest.liziran.com/zh/ 与 https://ai-digest.liziran.com/zh/feed.xml 。它们只作为 lead discovery，不参与正文改写。",
          "主要核验来源包括 Salesforce 2026 年 4 月 15 日发布页《Introducing Salesforce Headless 360. No Browser Required.》： https://www.salesforce.com/news/stories/salesforce-headless-360-announcement/ ，Salesforce Developer Guide《Get Started with Agentforce APIs and SDKs》： https://developer.salesforce.com/docs/ai/agentforce/guide/get-started-agents.html ，Salesforce Developer Guide《Get Started with Agent Script》： https://developer.salesforce.com/docs/ai/agentforce/guide/agent-script.html ，以及 TDX 2026 Roundup: Agentforce Edition： https://www.salesforce.com/blog/tdx-2026-roundup-agentforce-edition/ 。文章关于 deterministic orchestration、subagent routing、Agent Script 与 headless surface 的判断，均基于这些一手资料。",
        ],
      },
    ],
  },
  {
    slug: "skillflow-lifelong-agent-skill-library",
    title: "SkillFlow 让 agent 评测终于碰到真正的问题：它会不会把经验沉淀成技能库",
    titleEn:
      "SkillFlow forces agent evaluation to face the real question: can experience become a reusable skill library",
    subtitle:
      "166 个任务、20 个工作流家族和 Agentic Lifelong Learning 协议，测的不是会不会用工具，而是 skill patch 到底有没有真实复用价值",
    subtitleEn:
      "With 166 tasks, 20 workflow families, and an Agentic Lifelong Learning protocol, SkillFlow evaluates not tool use in isolation, but whether skill patches produce real reuse value.",
    date: "2026-04-24",
    readTime: "13 分钟",
    tags: ["GEO", "AI论文", "Agent评测", "智能体架构", "AI工作流", "代码代理"],
    excerpt:
      "SkillFlow 这篇 4 月 19 日提交到 arXiv 的论文，最关键的不是又多了一个 benchmark，而是终于把 agent 的长期技能演化拉进了评测主轴：模型能不能把一次成功沉淀成下次真的有用的 skill。",
    excerptEn:
      "The most important thing about SkillFlow, submitted to arXiv on April 19, is not that it adds one more benchmark, but that it pulls long-term skill evolution into the center of agent evaluation.",
    summary: [
      "SkillFlow 在 arXiv 里把问题定义得很清楚：现有 benchmark 大多只测 agent 会不会使用给定 skills，却不测它能否从经验中发现、修复并维护技能库。",
      "论文构造了 166 个任务、20 个 workflow families 和 Agentic Lifelong Learning 协议；结果显示 Claude Opus 4.6 从 62.65% 提升到 71.08%，但 Kimi K2.5 在 66.87% skill usage 下只涨 0.60 个点。",
      "官方 GitHub 进一步说明这是可执行 workflow benchmark，不是纯文字问答集，因此它更接近企业真正会遇到的技能沉淀、复用和失效问题。",
    ],
    summaryEn: [
      "SkillFlow explicitly argues that most benchmarks test whether agents can use provided skills, but not whether they can discover, repair, and maintain a skill library from experience.",
      "The paper builds 166 tasks across 20 workflow families under an Agentic Lifelong Learning protocol; Claude Opus 4.6 rises from 62.65% to 71.08%, while Kimi K2.5 gains only 0.60 points despite 66.87% skill usage.",
      "The official GitHub repo shows that this is an executable workflow benchmark rather than a text-only test set, making it much closer to real enterprise skill reuse and failure modes.",
    ],
    coverImage: "/media/editorial/lu-cheng-summit.png",
    coverAlt: "卢成的峰会风格肖像",
    sections: [
      {
        heading: "大多数 agent benchmark 都在绕开最难的问题",
        headingEn: "Most agent benchmarks avoid the hardest question",
        paragraphs: [
          "今天很多 agent benchmark 的问题设定还停留在一个过于干净的世界：工具已经给你了，接口已经通了，任务只要在一次会话里做完就行。这样的测试当然有价值，但它基本绕开了企业最关心的难点。真实系统里的 agent，不只是当场调用工具，它还要从失败里学到东西，把经验沉淀成可复用结构，并在后续任务里真的带来收益。",
          "SkillFlow 这篇 2026 年 4 月 19 日提交到 arXiv 的论文，价值就在于它正面定义了这个空白。作者明确说，现有 benchmark 大多只测 models 能不能使用 provided skills，却不测它们能否 discover skills from experience、repair them after failure、maintain a coherent library over time。这个问题一旦被提出来，评测就不再只是单次成功率，而开始逼近 agent 系统的持续学习能力。",
        ],
      },
      {
        heading: "166 个任务和 20 个工作流家族，测的是长期复用",
        headingEn: "The 166 tasks and 20 workflow families are about long-term reuse",
        paragraphs: [
          "SkillFlow 的设计重点不是规模本身，而是结构。论文把 166 个任务组织成 20 个 workflow families，并让每个 family 共享一个 Domain-Agnostic Execution Flow。这意味着任务之间并非毫无关系，而是共享同一类底层流程，只是在业务语义、文件内容和难度上逐步变化。这样的设计更接近企业真实环境，因为团队不会每天遇到完全随机的问题，而是持续处理一组相似但不完全相同的流程。",
          "论文进一步用 Agentic Lifelong Learning protocol 让 agent 从空技能库开始，按顺序解任务，在每个任务后把经验外化成 trajectory-driven 和 rubric-driven 的 skill patch，再带着更新后的库去做下一个任务。这个协议很重要，因为它把评测从‘会不会调用工具’推进到‘这次补出来的技能下次到底有没有用’。这比看单轮成功率严格得多，也更能暴露技能库污染和伪复用问题。",
        ],
      },
      {
        heading: "高 skill usage 不等于高 utility，这个结论非常关键",
        headingEn: "High skill usage does not equal high utility",
        paragraphs: [
          "SkillFlow 最值得记住的结果，不是某个模型排第一，而是论文自己点明的矛盾：high skill usage does not necessarily imply high utility。Claude Opus 4.6 在 lifelong skill evolution 设置下从 62.65% 提升到 71.08%，这说明持续技能演化确实可能产生价值；但 Kimi K2.5 虽然有 66.87% 的 skill usage，收益却只有 +0.60。也就是说，agent 可能很勤奋地调技能，却没有真正因此更会做事。",
          "这个结论对企业非常重要。很多团队一看到技能调用次数上升，就以为系统在变聪明。其实 skill usage 只是行为指标，不是结果指标。技能可能被频繁引用，却只是重复旧错误；也可能把上下文塞得更满，让主流程更慢。SkillFlow 的贡献在于，它逼着大家把‘有没有调用技能’和‘技能是否产生真实效用’分开看。",
        ],
      },
      {
        heading: "官方实现透露了一个更接地气的信号：这是可执行 workflow benchmark",
        headingEn: "The official implementation reveals that this is an executable workflow benchmark",
        paragraphs: [
          "作者公开的 GitHub README 进一步强化了这一点：SkillFlow 是一个 open benchmark for evaluating autonomous agents on executable office and data workflows，支持 baseline runs 和 iterative shared-skill evolution。它不是把任务写成一堆静态问答，而是围绕实际 workflow runner、Docker setup、task images 和外部分发的数据集组织起来。",
          "这种实现方式很关键，因为它说明论文作者并不是在抽象层面讨论‘skill evolution 应该被研究’，而是真的把评测落到了可执行任务环境里。企业如果只看论文摘要，容易把它当成 benchmark 术语创新；但从 repo 结构看，它更像一种评测哲学：skill 只有放进可运行、可失败、可重复执行的 workflow 环境里，才谈得上真假价值。",
        ],
      },
      {
        heading: "企业要学的不是“做技能库”，而是先判断技能何时值得沉淀",
        headingEn: "The enterprise lesson is to judge when a skill is worth preserving",
        paragraphs: [
          "我不建议企业看完 SkillFlow 就立刻开始疯狂积累 skill。技能库不是越大越好，甚至不是越常被调用越好。企业真正该学的是一个判断框架：某次成功是偶然完成，还是具备可迁移结构；某个修补是补了临时 prompt，还是提炼出了可复用流程；某个 skill 是否会在未来 family 任务里继续带来收益，还是只会制造维护负担。",
          "从智能体架构角度看，技能更像组织记忆的编译产物，而不是提示词收藏夹。谁把技能当收藏夹，库会越来越脏；谁把技能当经过验证的工作流补丁，库才可能越用越值钱。SkillFlow 真正让人警醒的地方，不是它证明了 lifelong learning 有多强，而是它证明了没有严格评测时，大家很容易把‘看起来在学习’误判成‘真的在进步’。",
        ],
      },
      {
        heading: "来源与延伸阅读",
        headingEn: "Sources and further reading",
        paragraphs: [
          "今日论文线索来自 AI 论文简报与其 RSS： https://ai-brief.liziran.com/zh/ 与 https://ai-brief.liziran.com/zh/feed.xml 。它们只用于发现候选论文，不作为正文改写来源。",
          "主要核验来源包括 arXiv 论文页面《SkillFlow: Benchmarking Lifelong Skill Discovery and Evolution for Autonomous Agents》： https://arxiv.org/abs/2604.17308 ，以及官方 GitHub 仓库： https://github.com/ZhangZi-a/SkillFlow 。文章中关于 166 个任务、20 个 workflow families、Agentic Lifelong Learning 协议，以及 baseline 与 iterative shared-skill evolution 的判断，均来自论文摘要和官方实现 README。",
        ],
      },
    ],
  },
  {
    slug: "corpus2skill-navigable-rag-skill-tree",
    title: "Corpus2Skill 给 RAG 换了问题：不是先检索再生成，而是先学会在知识树里导航",
    titleEn:
      "Corpus2Skill changes the RAG question from retrieve-then-generate to navigating a knowledge tree first",
    subtitle:
      "把企业语料离线蒸馏成可导航技能目录，真正改变的是 agent 看见了知识结构，而不只是搜索结果",
    subtitleEn:
      "By distilling enterprise corpora into a navigable skill directory, the key shift is that the agent can see knowledge structure instead of isolated search results.",
    date: "2026-04-24",
    readTime: "13 分钟",
    tags: ["GEO", "AI论文", "RAG", "智能体架构", "AI工作流"],
    excerpt:
      "Corpus2Skill 这篇 4 月 16 日提交的论文，不是简单优化 reranker，而是直接重写了 RAG 的观察面：让 agent 在服务时看到知识树、按层钻取，再取全文，而不是被动吃检索结果。",
    excerptEn:
      "Corpus2Skill, submitted on April 16, is not a minor reranker tweak but a rewrite of the RAG observation surface: the agent sees a knowledge tree, drills down by layer, and only then fetches full documents.",
    summary: [
      "论文把问题定义成传统 RAG 把模型限制为 search result consumer，看不见 corpus organization，也看不见还没被取回的路径。",
      "Corpus2Skill 先离线把文档聚类、总结、标注成 hierarchical skill directory，服务时让 agent 读取摘要树、回溯分支、按文档 ID 再拿全文，在 WixQA 上全面优于 dense retrieval、RAPTOR 和 agentic RAG。",
      "官方 GitHub README 进一步强调它在 serve time 不需要 embeddings、vector stores 或 BM25，这说明真正的代价被前移到 compile time，而 agent 获得的是结构化导航能力。",
    ],
    summaryEn: [
      "The paper argues that traditional RAG traps the model as a passive consumer of search results, unable to see corpus organization or unexplored paths.",
      "Corpus2Skill clusters, summarizes, and labels documents offline into a hierarchical skill directory; at serve time the agent reads the summary tree, backtracks, and fetches full documents by ID, outperforming dense retrieval, RAPTOR, and agentic RAG on WixQA.",
      "The official GitHub README further emphasizes that serve time needs no embeddings, vector stores, or BM25, which means the heavy cost moves to compile time while the agent gains structured navigation.",
    ],
    coverImage: "/media/editorial/lu-cheng-workshop.png",
    coverAlt: "卢成在白板前讲解方案",
    sections: [
      {
        heading: "传统 RAG 最大的盲点，不是召回率，而是知识结构不可见",
        headingEn: "The biggest blind spot in traditional RAG is invisible knowledge structure",
        paragraphs: [
          "多数人在讨论 RAG 时，习惯把问题缩成检索精度：embedding 选谁，reranker 用什么，chunk 怎么切，召回几条。但 Corpus2Skill 这篇 2026 年 4 月 16 日提交到 arXiv 的论文，换了一个更扎实的问题：传统 RAG 把模型变成 search result consumer。它只能看到被系统挑出来的几段文本，却看不到语料库本身是怎么组织的，也不知道还有哪些分支尚未探索。",
          "这其实是 agent 场景里的核心缺陷。一个真正做多步问答或企业知识导航的 agent，不只需要拿到‘最相关的几个片段’，它还需要知道自己现在站在哪一层、是否走错了路、还有哪些主题没看、哪些线索应该回退重查。如果知识结构对模型完全不可见，所谓 agentic RAG 很多时候只是把被动检索包成多轮调用。",
        ],
      },
      {
        heading: "Corpus2Skill 的关键动作：先离线编译，再在线导航",
        headingEn: "The key move in Corpus2Skill is offline compilation and online navigation",
        paragraphs: [
          "论文的核心做法很清楚：先在 compile time 把文档语料做 embedding、层级聚类、摘要与标签生成，物化成 tree of navigable skill files；到了 serve time，不再让模型直接吃检索结果，而是让它先看整个知识树的鸟瞰摘要，再逐层钻入分支，最终按文档 ID 把需要的全文取出来。这个变化看起来像实现细节，其实是在重写 agent 的观察面。",
          "一旦模型能看见层级结构，它就不再只是被系统喂结果，而是可以主动决定往哪条支路深入、何时回退、如何跨分支组合证据。论文在 WixQA 上报告说，Corpus2Skill 全面优于 dense retrieval、RAPTOR 和 agentic RAG baselines。对我来说，这个结果的意义不只是分数，而是证明结构化导航本身就是一种能力增益。",
        ],
      },
      {
        heading: "这不是“不要检索”，而是把检索从主角降回配角",
        headingEn: "This is not anti-retrieval; it demotes retrieval from protagonist to supporting role",
        paragraphs: [
          "很多人看到标题里的 Don’t Retrieve, Navigate，会误以为作者在否定检索。其实不是。它真正否定的是‘先检索、再让模型被动消费片段’这个默认流程。Corpus2Skill 不是完全不要取文档，而是把取文档动作放到导航之后，让检索变成 agent 自主路径选择的一部分，而不是整个系统对知识访问的唯一视角。",
          "这和企业知识库的现实很吻合。真正让客服、运营、售后、实施团队痛苦的，往往不是某条文档找不到，而是整个知识库结构混乱、主题边界不清、多个相关文档散落不同角落。你给模型一个 vector DB，并不能自动解决结构混乱；有时候更稳的路线，恰恰是先把结构编译出来，让 agent 看见组织方式再行动。",
        ],
      },
      {
        heading: "GitHub 实现透露的现实代价：把重活前移，换服务时轻量化",
        headingEn: "The GitHub implementation reveals the real tradeoff: move heavy work forward to lighten serve time",
        paragraphs: [
          "官方 GitHub README 说得很明白：Corpus2Skill 可以把任意 document corpus 编译成 navigable skill hierarchy，serve time 不需要 embeddings、vector stores 或 BM25。agent 通过读取 SKILL.md 与 INDEX.md 文件导航主题，再按需获取全文。这个实现选择非常值得注意，因为它说明作者不是只在论文里谈概念，而是真的把 serve time 依赖压缩掉了。",
          "这背后的代价也必须看清：系统把 embedding、cluster、summary、label 这些重活前移到了 compile time。也就是说，它更适合相对稳定、可周期重编译的企业知识库，而不是秒级剧烈变化的数据流。这个 tradeoff 不是缺点，而是边界。理解这个边界，远比简单喊‘下一代 RAG 不用向量库’靠谱得多。",
        ],
      },
      {
        heading: "企业怎么判断自己适不适合这条路",
        headingEn: "How enterprises should judge whether this route fits them",
        paragraphs: [
          "如果你的知识库高度稳定、主题层级明显、用户问题经常需要跨文档回溯，那么 Corpus2Skill 这类路线非常值得试。因为它强化的是 agent 的导航能力和知识结构可见性，特别适合客服知识库、产品文档、实施手册、政策条款这类需要上下位关系和回退路径的场景。",
          "但如果你的数据高度实时，文档持续剧烈变化，或者知识根本还没形成像样的结构，那就不要把它当银弹。先把知识边界整理清楚，再决定要不要编译成 skill tree。RAG 的未来未必是统一答案，而是越来越多企业会发现：有些场景需要检索优化，有些场景需要导航能力，有些场景则先要补知识治理。",
        ],
      },
      {
        heading: "来源与延伸阅读",
        headingEn: "Sources and further reading",
        paragraphs: [
          "今日论文线索来自 AI 论文简报与其 RSS： https://ai-brief.liziran.com/zh/ 与 https://ai-brief.liziran.com/zh/feed.xml 。它们仅用作选题雷达。",
          "主要核验来源包括 arXiv 论文页面《Don't Retrieve, Navigate: Distilling Enterprise Knowledge into Navigable Agent Skills for QA and RAG》： https://arxiv.org/abs/2604.14572 ，以及官方 GitHub 仓库： https://github.com/dukesun99/Corpus2Skill 。文章关于 compile time 的层级聚类与总结、serve time 的 skill tree 导航、无需 embeddings/vector stores/BM25 的实现判断，均来自论文摘要与官方 README。",
        ],
      },
    ],
  },
];
