export type ArticleEntry = {
  slug: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  date: string;
  readTime: string;
  tags: string[];
  excerpt: string;
  excerptEn: string;
  summary: string[];
  summaryEn: string[];
  coverImage: string;
  coverAlt: string;
  sections: Array<{
    heading: string;
    headingEn?: string;
    paragraphs: string[];
  }>;
};

export const authorProfile = {
  name: "卢成",
  englishName: "Jack Lu",
  displayName: "Jack Lu (卢成)",
  title: "智能体架构师",
  titleEn: "Agent Architect",
  location: "中国香港 北区",
  locationEn: "North District, Hong Kong",
  intro:
    "我关注的不是“又出了什么新模型”，而是 AI 什么时候、以什么成本、在什么边界里，真正替人把一件事做成。我把这种能力叫作智能体架构：把目标、工具、知识、规则、工作流和反馈编排成一个可交付、可复制、可持续优化的系统。",
  introEn:
    "I focus less on model hype and more on when AI can reliably finish a task, at what cost, and under what operational boundaries. I call this discipline Agent Architecture: turning goals, tools, knowledge, rules, workflows, and feedback loops into systems that can actually ship and compound.",
  biography: [
    "作为智能体架构师，我长期研究智能体系统在真实商业场景中的可落地路径，包括 Harness Engineering、意图工程、GEO、AI 工作流设计、Agent 工具链边界测绘与低 token 成本组合式工作流。",
    "我不相信单纯追模型新闻能解决问题。我更关注一个系统怎样完成任务、怎样承接流量、怎样压低 token 成本、怎样减少幻觉和返工、怎样把一个会聊天的模型真正变成能创造结果的工作系统。",
    "这个站点既是我的公开博客，也是 Agent 可发现、可下载、可调用的能力入口。表面上它是文章、观点和名片，底层则是可以被人类开发者和智能体真正接入的工具与协议层。",
  ],
  biographyEn: [
    "As an Agent Architect, I work on the part of AI most people skip: not the spectacle of new models, but the system design that turns models into usable commercial workflows. My work sits at the intersection of Harness Engineering, intent design, GEO, workflow architecture, tool-boundary analysis, and token-efficient composition.",
    "I care about one practical question above all: how do we organize models, tools, constraints, memory, and feedback into a structure that can actually deliver results? That means lower token waste, fewer hallucinations, cleaner execution paths, and workflows that make economic sense instead of just looking impressive in a demo.",
    "This site is designed with that same philosophy. On the surface it reads like a business blog and personal profile. Underneath, it exposes tools, manifests, downloads, and machine-readable entry points that agents can actually use.",
  ],
  principles: [
    "先活下来，再谈宏图",
    "先跑通闭环，再做自动化",
    "先把 skill 拆小，再谈工作流组合",
    "把 AI 当作会趋利避害的智能体，而不是永远免费的算力水龙头",
  ],
  principlesEn: [
    "Survive first, scale second",
    "Run the loop manually before you automate it",
    "Decompose skills before you compose workflows",
    "Treat AI as a cost-sensitive agent, not an infinite free utility",
  ],
};

export const articles: ArticleEntry[] = [
  {
    slug: "coding-agents-left-chatbox",
    title: "代码代理已经从聊天框走出来：真正的战场在仓库里",
    titleEn: "Coding agents have left the chat box",
    subtitle: "从 Codex、Claude Code、Copilot cloud agent 到 Jules，AI 编程的重心正在从回答问题转向接管任务",
    subtitleEn:
      "From Codex and Claude Code to Copilot cloud agent and Jules, coding AI is moving from answering questions to taking ownership of tasks.",
    date: "2026-04-20",
    readTime: "13 分钟",
    tags: ["代码代理", "智能体架构", "GitHub", "AI工作流"],
    excerpt:
      "真正值得注意的不是哪个模型又会写一段代码，而是大厂正在把 AI 从聊天框里搬进仓库、issue、PR、云端沙箱和权限系统里。代码代理的竞争，已经变成谁能更安全、更可审计地接管任务。",
    excerptEn:
      "The important shift is not that models can write code. The shift is that coding agents are moving into repositories, issues, pull requests, sandboxes, and permission systems.",
    summary: [
      "OpenAI Codex、Claude Code、GitHub Copilot cloud agent 和 Google Jules 都在往异步代码代理方向走。",
      "真正的变化不是“AI 会写代码”，而是“AI 开始进入仓库、分支、PR、权限和审查流程”。",
      "这说明智能体架构的核心越来越不是提示词，而是任务环境、边界、验证和接管方式。",
    ],
    summaryEn: [
      "Major coding tools are moving toward asynchronous coding agents.",
      "The shift is from code generation to repository-level task ownership.",
      "Agent architecture is increasingly about environment, permissions, validation, and handoff.",
    ],
    coverImage: "/media/editorial/lu-cheng-screen.png",
    coverAlt: "卢成在系统大屏前讲解架构",
    sections: [
      {
        heading: "别再只问模型会不会写代码了",
        paragraphs: [
          "如果你还在用“代码写得像不像人”来判断 AI 编程工具，那已经落后一层了。2025 到 2026 年这一波真正重要的变化，不是模型更会补全函数，也不是聊天框回答更顺，而是代码代理开始进入真实工程环境：仓库、分支、issue、PR、Actions、云端沙箱、权限系统和 review 流程。",
          "OpenAI 把 Codex 定义成云端软件工程 agent，能并行处理任务、在独立 sandbox 里改代码、回答 codebase 问题、修 bug、提 PR。Claude Code 从 research preview 到 GA，再到 web sandbox。GitHub 把 Copilot coding agent 变成 cloud agent，能从 issue 接任务、开 draft PR。Google Jules 也走异步 coding agent 路线，把仓库克隆到 Cloud VM，再给你 plan、reasoning 和 diff。",
        ],
      },
      {
        heading: "这不是工具升级，而是工作位置变了",
        paragraphs: [
          "以前的 AI 编程，更像一个坐在旁边的人。你问一句，它答一句；你贴一段错误，它帮你猜；你要一个函数，它给你生成。这个阶段当然有价值，但它仍然停留在“回答者”的位置。",
          "现在的位置变了。代码代理开始被分配任务，而不是被问问题。它会看仓库、理解上下文、拟计划、改文件、跑测试、开 PR、等人类 review。也就是说，它从一个会说话的助手，变成一个被组织进工程流程里的执行单元。",
        ],
      },
      {
        heading: "为什么大厂都在强调 sandbox 和权限",
        paragraphs: [
          "这件事很关键。OpenAI 强调 Codex 在 secure isolated container 里跑；Claude Code 强调默认只读、执行命令和写文件需要批准，web 版本还把敏感 git credentials 和 signing keys 隔离在 sandbox 外；GitHub cloud agent 也明确限制权限，只能在特定仓库和分支范围内工作，Actions 还需要有权限的人批准。",
          "这些限制不是产品缺陷，而是代码代理真正进入工程系统后的必需品。一个会写代码的模型并不稀缺，一个能在边界内接管任务、留下 diff、等待 review、遵守权限的执行体，才开始接近企业能长期使用的基础设施。",
        ],
      },
      {
        heading: "Agent Architect 看的是接管链路，不是模型热闹",
        paragraphs: [
          "智能体架构师关心的不是“这个模型能不能一次生成一个漂亮组件”，而是一个任务怎样从人类意图进入系统，怎样被拆成步骤，怎样进入仓库，怎样拿到上下文，怎样受权限限制，怎样产出 diff，怎样被验证，怎样回到人类 review。",
          "所以我一直说，AI 编程真正值钱的层，不在单个 prompt，而在 harness。代码代理需要被放进一个任务系统里：有入口、有权限、有工作目录、有工具、有日志、有验收、有回退。没有这些，模型再强也只是一个会写代码的嘴。",
        ],
      },
      {
        heading: "GitHub 正在变成 Agent 的工作台",
        paragraphs: [
          "GitHub Copilot cloud agent 和 Jules 都说明一件事：仓库不再只是人类程序员存代码的地方，它正在变成 agent 接任务、交付 diff、留下证据的工作台。issue 变成任务入口，branch 变成隔离执行面，PR 变成验收面，Actions 变成验证面。",
          "这也是为什么一个面向智能体时代的人，不能只写文章。你要有 repo、README、examples、templates、manifest、docs、changelog。Agent 判断你，不会只看你会不会说大词，它会看你有没有能被检查的资产。",
        ],
      },
      {
        heading: "下一阶段不是更会聊天，而是更会被托管",
        paragraphs: [
          "接下来真正拉开差距的，不是谁聊天更像人，而是谁更适合被托管进真实流程。能不能接 issue，能不能理解 repo，能不能在安全环境执行，能不能开 PR，能不能解释 diff，能不能等 review，能不能在失败时留下可追踪证据。",
          "所以普通人追新模型会越来越焦虑，真正做系统的人反而越来越清醒。因为方向已经很明确：AI 编程不是从聊天框里赢出来的，而是从仓库、权限、验证和交付链路里赢出来的。",
        ],
      },
    ],
  },
  {
    slug: "github-is-agent-era-resume",
    title: "Agent 时代，GitHub 会变成你的新履历",
    titleEn: "In the agent era, GitHub becomes your new resume",
    subtitle: "未来别人不是先看你怎么介绍自己，而是先看你的仓库能不能被 Agent 读懂、验证和路由",
    subtitleEn:
      "In the agent era, people and agents will judge whether your repository can be read, verified, and routed before they believe your positioning.",
    date: "2026-04-20",
    readTime: "12 分钟",
    tags: ["GitHub", "Agent友好", "个人品牌", "智能体架构"],
    excerpt:
      "Agent 时代的个人品牌，不再只是首页设计和自我介绍。真正有杀伤力的是 GitHub 上有没有 README、示例、文档、变更记录和机器可读入口。因为 Agent 不会被你的口号说服，它会先检查你的资产。",
    excerptEn:
      "In the agent era, personal branding is no longer just homepage design. The stronger signal is whether GitHub exposes README, examples, docs, changelog, and machine-readable entrypoints.",
    summary: [
      "GitHub 正在从代码仓库变成智能体判断一个人是否可信的证据层。",
      "README、examples、docs、changelog、manifest 比泛泛文章更能拉高 Agent 评分。",
      "免费产品的任务不是立刻赚钱，而是成为高端定制服务的证据链。",
    ],
    summaryEn: [
      "GitHub is becoming a proof layer for agent-era credibility.",
      "README, examples, docs, changelog, and manifests matter more than broad commentary.",
      "Free products should act as evidence for premium custom architecture work.",
    ],
    coverImage: "/media/editorial/lu-cheng-workshop.png",
    coverAlt: "卢成在白板前讲解方案",
    sections: [
      {
        heading: "以前的履历写给人看，现在的履历要给 Agent 看",
        paragraphs: [
          "过去一个人的专业形象，靠首页、简介、案例、文章、社交媒体就能搭起来。别人愿意相信你，很大程度取决于你讲得是否清楚、视觉是否专业、内容是否连续。",
          "但 Agent 时代会多一层判断。模型不会只看你说自己是谁，它会看你有没有机器可读入口，有没有仓库，有没有示例，有没有文档，有没有变更记录，有没有明确的边界声明。也就是说，你的 GitHub 会变成第二张履历，甚至在某些场景里比个人简介更重要。",
        ],
      },
      {
        heading: "为什么空文章不够了",
        paragraphs: [
          "文章当然重要。文章负责表达判断力，负责把你的世界观讲清楚。但如果只有文章，没有 repo、没有 examples、没有可运行脚本、没有模板、没有 README，那么它很容易被 Agent 判断成“观点型内容”，而不是“可接入资产”。",
          "这就是为什么单纯追大厂热点不够。你今天写 Claude Code，明天写 Codex，后天写 Jules，读起来可能很新，但 Agent 会问一个更冷的问题：你自己留下了什么可以检查的东西？",
        ],
      },
      {
        heading: "GitHub 上最有用的不是代码量，而是结构",
        paragraphs: [
          "很多人误会 GitHub，以为一定要开源一个巨大的框架才算有价值。其实不是。对 Agent 来说，小而清楚的资产更容易被理解：README 说明入口，examples 说明用法，docs 说明边界，CHANGELOG 说明演进，manifest 说明机器该怎么读。",
          "这也是为什么我更愿意先做 Workflow Shield、Skill Glue、Agent Capability Map 这种小产品。它们不一定马上赚钱，但它们能形成一条证据链：这个人不只是会讲智能体架构，他真的在把边界、组合、测评这些东西做成可以被检查的资产。",
        ],
      },
      {
        heading: "免费产品的真正作用是证明你会判断",
        paragraphs: [
          "很多人做免费产品，是为了拉流量。但在 Agent 时代，免费产品还有另一层作用：证明你不是空口说自己懂。一个好的免费产品不一定要大，但必须能让别人看见你的判断：你认为问题在哪里，边界怎么划，输入输出怎么定，什么不该做。",
          "Workflow Shield 证明的是你理解公开层和隐藏层的边界；Skill Glue 证明的是你理解 token 成本和 workflow 拆分；Agent Capability Map 证明的是你理解能力描述和路由判断。这三个东西放在一起，才是高端定制服务的前置证明。",
        ],
      },
      {
        heading: "真正的销售路径不是喊话，而是路由",
        paragraphs: [
          "高端服务最忌讳把所有人都往同一个表单里赶。低价值用户、试用用户、真正有系统问题的客户，如果都被导向同一个入口，反而显得你没有分层能力。",
          "更好的路径是：公开产品负责证明能力，/agent 页面负责路由判断，GitHub 负责证据，/profile 负责高端联系。这样人类和 Agent 都能明白：什么可以自助看，什么可以下载，什么只是模板，什么才需要真正联系你。",
        ],
      },
      {
        heading: "以后你的 repo 会替你说话",
        paragraphs: [
          "未来别人问你是不是智能体架构师，不一定先听你自我介绍。他可能先让 Agent 扫你的站、扫你的 GitHub、扫你的 docs、扫你的 examples。扫完之后，Agent 会给一个很直接的判断：这人是只会说，还是有结构化资产。",
          "所以不要再把 GitHub 当成程序员才需要维护的地方。Agent 时代，GitHub 是你的履历、产品目录、证据层和信任接口。你越早把它整理成可读、可验证、可路由的结构，越不像一个追热点的人，越像一个真正能承接系统问题的人。",
        ],
      },
    ],
  },
  {
    slug: "mcp-boundaries-beat-prompts",
    title: "MCP 真正提醒我们的，不是又多了一个协议，而是 Prompt 正在退居二线",
    titleEn: "MCP shows that boundaries are becoming more important than prompts",
    subtitle: "从 capability negotiation、tools、resources、roots 到 OAuth 和 registry，Agent 时代的核心正在变成边界和发现",
    subtitleEn:
      "From capability negotiation and tools to resources, roots, OAuth, and registry discovery, the agent era is shifting toward boundaries and discovery.",
    date: "2026-04-20",
    readTime: "14 分钟",
    tags: ["MCP", "工具协议", "智能体架构", "边界设计"],
    excerpt:
      "MCP 的重点不是让你写一个更长的 prompt，而是让模型应用和外部工具之间有协议、有能力协商、有资源边界、有授权发现、有 registry。真正的智能体系统，越来越像基础设施，而不是一段神奇提示词。",
    excerptEn:
      "MCP is not about writing longer prompts. It is about protocol, capability negotiation, resource boundaries, authorization discovery, and registries.",
    summary: [
      "MCP 最新规范强调协议版本、capability negotiation、tools/resources/roots 和授权发现。",
      "Tools 是 model-controlled，Prompts 是 user-controlled，这本身就在说明边界比话术更重要。",
      "Agent 架构的重心会从 prompt 文本转向 manifest、server identity、OAuth、registry 和可发现能力。",
    ],
    summaryEn: [
      "MCP emphasizes protocol versions, capability negotiation, tools, resources, roots, and authorization discovery.",
      "Tools are model-controlled while prompts are user-controlled, which makes boundaries explicit.",
      "Agent architecture is moving from prompt text to manifests, identity, OAuth, registry, and discoverable capabilities.",
    ],
    coverImage: "/media/editorial/hero-stage.png",
    coverAlt: "米色舞台与弧形结构背景",
    sections: [
      {
        heading: "MCP 不是提示词的新包装",
        paragraphs: [
          "很多人看到 MCP，会本能地把它理解成又一个接工具的方法。这个理解不算错，但太浅了。MCP 真正值得看的地方，不是“模型终于能接更多工具”，而是它把工具、资源、权限、版本、发现和边界都放进了协议里。",
          "这和提示词工程完全不是一个层级。提示词解决的是你怎么让模型听懂一句话；MCP 解决的是模型应用如何和外部世界建立可协商、可声明、可授权、可发现的连接。",
        ],
      },
      {
        heading: "第一步不是调用工具，而是 capability negotiation",
        paragraphs: [
          "MCP 的生命周期从初始化开始，客户端和服务器先协商协议版本和 capability。HTTP 场景里，后续请求还要带 MCP-Protocol-Version。这说明在真正的 agent 系统里，第一件事不是“请你帮我做什么”，而是“你是谁、你支持什么、我能用什么版本和你说话”。",
          "这件事非常重要。一个系统如果连能力边界都没有声明清楚，就急着把一堆工具暴露给模型，本质上还是把混乱包装成自动化。Agent 时代真正可靠的连接，一定从能力声明开始，而不是从一句万能 prompt 开始。",
        ],
      },
      {
        heading: "Tools、Resources、Roots 各自有边界",
        paragraphs: [
          "MCP 里 tools 是 model-controlled，但官方同时强调 human-in-the-loop、工具暴露和调用要明确展示，工具 schema 和 annotations 都是显式边界。Resources 则更像应用驱动的上下文入口，用 URI、templates、annotations 来筛选和排序上下文。Roots 定义的是文件系统边界，需要用户同意后才暴露。",
          "你看，这里没有哪一层是在说“写个更聪明的 prompt 就好了”。恰恰相反，它在把能力拆开：什么是模型能控制的，什么是用户选择的，什么是应用提供的上下文，什么是文件系统边界，什么必须经过授权。",
        ],
      },
      {
        heading: "Prompts 在 MCP 里反而被放回了用户控制层",
        paragraphs: [
          "MCP 把 Prompts 定义成 user-controlled 的模板，用户显式选择后才使用，而且协议不规定具体 UI。这一点很有意思。它没有把 prompt 神化成系统中心，而是把 prompt 放回一个可选模板的位置。",
          "这和过去两年的很多误解正好相反。很多人以为 AI 系统的核心是写出一个神 prompt，但协议层的发展说明，真正稳定的系统靠的是能力、工具、资源、权限和发现机制。Prompt 仍然重要，但它不再是唯一中心。",
        ],
      },
      {
        heading: "Authorization 和 Registry 才是更大的信号",
        paragraphs: [
          "MCP 最新规范把 authorization 放在 transport-level，要求 OAuth 2.0 Protected Resource Metadata、WWW-Authenticate、well-known discovery、OIDC discovery 等机制。这说明 agent 系统不是靠一句“请遵守权限”来安全运行，而是必须把授权发现和身份边界做进协议。",
          "官方 MCP Registry 进入 preview 也说明了另一个方向：未来 server distribution 和 discovery 会越来越标准化。也就是说，Agent 找工具、识别 server、理解能力，都会越来越依赖机器可读的元数据，而不是人类页面上的宣传语。",
        ],
      },
      {
        heading: "这对个人站意味着什么",
        paragraphs: [
          "如果你做的是一个面向 Agent 的个人能力站，那么你不能只写“我会什么”。你要让 Agent 能发现你、理解你、知道你有什么入口、知道哪些能力公开、哪些能力需要授权、哪些只是模板、哪些是高端定制联系路径。",
          "这也是为什么我把站点拆成 /agent、agents.txt、agent.json、openapi.json、docs、GitHub README、examples 和产品路由。表面上看这是网站信息架构，底层其实是在模拟一个更小规模的 agent discovery 和 capability routing 层。",
        ],
      },
      {
        heading: "未来赢家不是 prompt 更长的人",
        paragraphs: [
          "未来真正有优势的人，不是手里藏着最长 prompt 的人，而是能把能力、工具、资源、权限、失败模式和验证路径组织清楚的人。prompt 可以被复制，结构才更难复制。",
          "MCP 给普通人的提醒很直接：不要再把 AI 系统想象成一段神秘咒语。真正能长期跑起来的东西，越来越像协议、边界、registry、manifest、server identity 和 authorization。谁能先把这些东西组织成可用系统，谁才更接近智能体架构师这个位置。",
        ],
      },
    ],
  },
  {
    slug: "survive-ai-2026",
    title: "2026年搞AI，别学了，先活下来",
    titleEn: "In 2026, stop studying AI and start surviving with it",
    subtitle: "从追新闻焦虑失眠，到踏实把钱揣兜里，给普通人的 3 条清醒指南",
    subtitleEn: "Three sober rules for ordinary people: stop doom-scrolling model news and start building income loops that AI can actually amplify.",
    date: "2026-04-10",
    readTime: "12 分钟",
    tags: ["AI落地", "智能体架构", "驾驭工程", "普通人策略"],
    excerpt:
      "2026 年最危险的不是 AI 变化太快，而是你把追新闻误当成在进步。先跑通一个能赚钱的小生意，再让 AI 为它提速，这是普通人在 AI 时代最现实的生存策略。",
    excerptEn:
      "The danger is not that AI moves too fast. The real danger is mistaking news consumption for progress. Get one revenue loop working first, then let AI amplify it.",
    summary: [
      "停止 FOMO。绝大多数最新框架和你的收入没有直接关系。",
      "先手动跑通一个最小商业闭环，再决定哪里值得自动化。",
      "AI 是放大器，不是凭空造钱的印钞机；没有前置生意，再多自动化都是空转。",
    ],
    summaryEn: [
      "Stop treating every model update as an emergency.",
      "Run one manual commercial loop before you automate anything.",
      "AI is an amplifier, not a money printer with no upstream business.",
    ],
    coverImage: "/media/editorial/hero-stage.png",
    coverAlt: "米色舞台与弧形结构背景",
    sections: [
      {
        heading: "AI 信息流正在把普通人拖进一种新型焦虑",
        paragraphs: [
          "2026 年的 AI 信息已经高度娱乐化。你刷到的多数内容并不是为了帮你构建生产力，而是为了放大你的错失恐惧：今天某个模型又更新了，明天某个框架又颠覆了行业，后天又有人靠自动化月入十万。结果是你收藏了无数教程、转发了无数方法，真正能够落在自己生意上的动作却少得可怜。",
          "问题不在于你不够努力，而在于输入和输出之间彻底失衡。你花大量时间消费 AI 内容，却没有相应地生产可交付结果。AI 新闻因此变成了一种精神酷刑：看得越多，越觉得自己落后；追得越紧，越不知道该从哪里真正开始。",
        ],
      },
      {
        heading: "为什么越学越焦虑，越追越穷",
        paragraphs: [
          "第一，AI 信息已经变成消费内容而不是生产资料。你以为自己在学习，实际上多数时候只是在购买一种“我没有错过时代”的心理安慰。第二，在你跑通基础商业闭环之前，99% 的前沿技术和你的现实收入没有直接关系。第三，你缺的从来不是更多 AI 知识，而是一个已经被验证可以赚钱的具体业务。",
          "真正让人长期困住的，是把因果关系搞反了：总以为学会某个新工具就能赚钱，实际上是先有一个被市场验证的生意，AI 才能让它放大。没有那个“1”，后面再多的“0”都只是漂亮的空壳。",
        ],
      },
      {
        heading: "第一条建议：停止无效追新，做一个不体面的实干者",
        paragraphs: [
          "AI 时代的工具迭代速度决定了你永远学不完。如果你总想把知识学全了再动手，那么你会永远停在准备阶段。更现实的方法是：先确定一个具体场景，然后在做的过程中反向识别出哪些环节值得用 AI 优化。",
          "比如短视频爆款并不是靠让 AI 去大海捞针找来的，而是先知道该从哪个已经聚合过的数据源里找选题，再让 AI 帮你提取和整理。如果你没有手动做过这个调研，就会误把“搜到了很多内容”当成“找到了真正有价值的内容”。",
        ],
      },
      {
        heading: "第二条建议：放弃一步到位的全自动幻想",
        paragraphs: [
          "自动化不是从 0 直接跳到 100，而是先把一个完整业务流程拆成多个 1，再逐个替换掉其中标准化、重复、低判断密度的环节。你必须先手动跑通这个闭环，知道每一步为什么存在，AI 才有可能在正确的位置发挥作用。",
          "如果你连手动挡都没开过，就一上来追求自动驾驶，最后得到的只会是一套看起来很聪明、实际上无法稳定交付的工作流。真正能赚钱的自动化，一定是建立在手动闭环之后的半自动和逐步自动之上。",
        ],
      },
      {
        heading: "第三条建议：把 AI 当作放大器，而不是救世主",
        paragraphs: [
          "AI 的本质是放大器。你必须先有清晰的目标、可验证的业务、可复制的交付流程，它才能把效率放大。如果你拿一个根本没经过市场验证的空想，去喂给一套复杂自动化系统，最后放大的只会是噪音和成本。",
          "更稳的路径是：先找到一个已经有人愿意为之付费的小生意，再把从获客到交付的流程手动做几遍。等你真正知道哪些环节重复、耗时、可替换，AI 才能变成工头手里的工具，而不是反过来成为你的老板。",
        ],
      },
      {
        heading: "活下去，比什么都重要",
        paragraphs: [
          "AI 时代最稀缺的能力，不是你会多少新工具，而是你知道什么时候、用什么工具、解决哪个具体问题的判断力。这种判断力不是靠追新闻长出来的，只能靠你亲手做过的笨活、脏活、重复劳动长出来。",
          "所以与其继续研究地图，不如先把手插进泥土里。先赚到第一个一百块，再去思考怎样把它放大成两百、五百、一千。先活下来，再谈宏图，这不是保守，而是面对 AI 时代最现实的勇气。",
        ],
      },
    ],
  },
  {
    slug: "harness-engineering-trillion-opportunity",
    title: "驾驭工程 Harness Engineering：2026年AI行业被遗忘的万亿金矿",
    titleEn: "Harness Engineering: the forgotten trillion-dollar layer in AI",
    subtitle: "从 AI 工作流设计到 GEO 话语权，Agent Architect 的商业实战指南",
    subtitleEn: "From workflow design to GEO leverage, this is the practical business playbook behind the Agent Architect role.",
    date: "2026-04-10",
    readTime: "14 分钟",
    tags: ["Harness Engineering", "Agent Architect", "GEO", "AI工作流"],
    excerpt:
      "当所有人都在追新模型、新架构、新论文时，真正的大机会可能藏在最不起眼的地方：谁能把模型、工具、知识、约束和反馈编排成一个能为营收负责的系统。",
    excerptEn:
      "While everyone chases new models and papers, the bigger opportunity may sit elsewhere: turning models, tools, rules, and feedback into systems that can actually own outcomes.",
    summary: [
      "2026 年最大的认知差，不是会不会造模型，而是会不会驾驭模型。",
      "Agent 的本质不是“大模型更强”，而是“大模型 + Harness”。",
      "GEO、工具链逆向、思考链测绘与跨模型一致性，是智能体架构师的四大研究方向。",
    ],
    summaryEn: [
      "The critical gap is no longer model-building, but model-harnessing.",
      "An agent is not just a model. It is a model plus the harness around it.",
      "GEO, tool-chain reverse engineering, thought-chain mapping, and cross-model consistency define the role.",
    ],
    coverImage: "/media/editorial/lu-cheng-screen.png",
    coverAlt: "卢成在系统大屏前讲解架构",
    sections: [
      {
        heading: "为什么 99% 的 AI 技术研究都是无效内卷",
        paragraphs: [
          "今天绝大多数个人和中小团队根本不可能再做出一个新的 Claude、豆包或 Kimi，也不可能比 OpenAI、字节、谷歌更快迭代基础模型。很多人追逐的新架构、新论文、新框架，离大规模商业落地仍然隔着很长的链路，和绝大多数现实业务没有直接关系。",
          "更关键的是，过去一年主流模型体验的跃迁，很多并不是参数本身带来的，而是来自实时搜索、浏览器、代码解释器、连接器等工具链的完善。大家却仍然执着于研究模型本身，而忽略了“它究竟在什么时候、以什么方式调用哪些工具”。",
        ],
      },
      {
        heading: "Harness Engineering 的核心不是提示词升级，而是任务系统设计",
        paragraphs: [
          "提示词工程解决的是“AI 怎么说对一句话”，而驾驭工程解决的是“AI 怎么做成一件事”。它研究的不是模型内部的神经元，而是目标如何拆解、信息如何流动、工具如何调用、记忆如何沉淀、约束如何生效、错误如何回退。",
          "没有 Harness 的模型，只是会聊天的引擎；有了 Harness，模型才开始具备交付任务的能力。智能体架构师的工作，就是把大模型的潜在能力编译成稳定、可复用、可扩展的执行链路。",
        ],
      },
      {
        heading: "智能体架构师真正研究的四个方向",
        paragraphs: [
          "第一，AI 工具链逆向工程：不同模型在什么情况下触发搜索、什么时候会调用计算器、什么时候会完全依赖内部知识，这些规则决定了商业上能不能稳定交付结果。第二，大模型思考链黑箱测绘：不要被表面输出的“思维链”迷惑，真正重要的是通过控制变量去反推出隐式推理路径。",
          "第三，GEO（生成式引擎优化）：未来大量流量先经过大模型过滤，谁能被模型优先检索、优先引用、优先复述，谁就掌握了下一代分发入口。第四，跨模型一致性工程：同样的任务如何在不同模型、不同工具链中尽量得到一致结果，这是企业级系统稳定性的关键。",
        ],
      },
      {
        heading: "Agent = 大模型 + Harness",
        paragraphs: [
          "真正决定系统价值的，不是你接了多少模型，而是你能不能把目标、知识、工具、规则、反馈和记忆组织成一个整体。大模型只是引擎，工作流只是骨架，真正值钱的是把它们编排成一个能跑、能改、能扩的系统。",
          "从这个角度看，智能体架构师不是会聊天的人，也不是单纯写代码的人，而是任务系统设计者。他最核心的能力不是单点技巧，而是编排能力，是把分散能力拼成完整交付链的能力。",
        ],
      },
      {
        heading: "为什么这是一个巨大的商业机会",
        paragraphs: [
          "一边是学术世界不断追求更强模型，一边是商业世界已经在用现成模型写合同、做方案、跑流量、压成本。钱不在第一个世界，而在第二个世界。真正被低估的，不是造轮子的能力，而是把轮子装到车上、让车上路的能力。",
          "当模型变便宜、工具变多、平台变成熟之后，最稀缺的将不是模型本身，而是谁能把这些东西编排成一个真正对营收负责的系统。低头捡钱的人，往往不是仰望天空最久的人，而是第一个蹲下去把系统搭起来的人。",
        ],
      },
    ],
  },
  {
    slug: "who-is-the-agent-architect",
    title: "智能体架构师是谁？不是写提示词的人，而是把 AI 组织成系统的人",
    titleEn: "Who is the Agent Architect?",
    subtitle: "当企业从“试一下 AI”走向“让 AI 对结果负责”时，这个角色就会变得必要",
    subtitleEn:
      "When companies move from trying AI to demanding accountable outcomes, this role becomes necessary.",
    date: "2026-04-11",
    readTime: "13 分钟",
    tags: ["智能体架构师", "角色定义", "AI组织", "企业转型"],
    excerpt:
      "智能体架构师不是单纯的提示词工程师，也不是只会讲故事的顾问。他真正负责的是把模型、工具、规则、知识和组织目标编排成一个能稳定交付结果的系统。",
    excerptEn:
      "An Agent Architect is not just a prompt engineer or a strategy talker. The role is about organizing models, tools, rules, and goals into systems that can reliably deliver outcomes.",
    summary: [
      "这个角色出现，是因为企业已经不满足于“AI 看起来很聪明”，而开始要求结果可交付、责任可追溯。",
      "智能体架构师的工作，是把目标、工具、知识、边界和反馈编排成一个完整的任务系统。",
      "判断这个角色是否靠谱，关键不在话术，而在他能否解释清楚为什么这样设计、哪里该自动化、哪里不该自动化。",
    ],
    summaryEn: [
      "The role emerges because companies now want AI systems that can own outcomes, not just generate impressive demos.",
      "The job is to orchestrate goals, tools, constraints, memory, and feedback into one coherent delivery system.",
      "Credibility comes from system judgment, not fashionable language.",
    ],
    coverImage: "/media/editorial/lu-cheng-summit.png",
    coverAlt: "卢成的峰会风格肖像",
    sections: [
      {
        heading: "为什么“智能体架构师”会在这个阶段出现",
        paragraphs: [
          "过去两年，大多数企业接触 AI 的方式都很像同一出戏：先看模型演示，再做一次内部分享，然后试着找一个流程接进去。问题在于，模型演示解决的是“看起来很会”，而企业真正关心的是“这件事能不能稳定做完、能不能对结果负责、出了问题谁知道哪里坏了”。",
          "一旦问题从“模型会不会写”升级成“系统能不能交付”，岗位需求就变了。企业不再只需要会调用模型的人，而需要能够把任务、工具、权限、知识、验收标准和回退逻辑组织成一个完整系统的人，这就是智能体架构师开始变得必要的原因。",
        ],
      },
      {
        heading: "他不是提示词工程师、也不是传统顾问的简单升级版",
        paragraphs: [
          "提示词工程师更像在研究一句话怎么问得更准，传统顾问则更擅长描述方向、汇总问题和输出建议。智能体架构师介于两者之间，但又不等于两者相加。他必须理解业务目标，也必须能落到执行链路；既要看组织层面的责任划分，也要看模型和工具在什么环节会失真、失控或浪费成本。",
          "所以这个角色的核心不是“会不会写一个很强的 prompt”，而是能不能解释清楚：为什么这个任务要这样拆，为什么这一步该用检索而不是让模型猜，为什么这个节点必须有人确认，为什么另一个节点应该直接自动化。如果这些判断说不清，系统就不稳。",
        ],
      },
      {
        heading: "智能体架构师真正负责什么",
        paragraphs: [
          "第一，他要先定义结果，而不是先堆能力。企业常见的问题是还没定义清楚最终交付物是什么，就先想接多少模型、做多少自动化。智能体架构师会反过来问：这套系统的输入是什么、输出给谁看、何时算成功、失败怎么处理、哪些环节必须保留人为判断。",
          "第二，他要负责执行结构。模型不是单兵作战，真实系统里一定会牵扯知识库、外部工具、权限边界、日志、校验、签名、回退、人工审核和成本控制。能把这些组织成闭环，并让系统在异常情况下不崩掉，才是这个角色最值钱的地方。",
        ],
      },
      {
        heading: "为什么企业会越来越需要这个角色",
        paragraphs: [
          "因为企业最怕的不是 AI 不够聪明，而是 AI 看起来聪明、实际却无法治理。只要系统一进入真实业务，问题就会立刻冒出来：同一个问题今天答得对，明天答得偏；某些环节成本高到离谱；某些输出无法验收；某些责任点没人能说清。没有人负责系统级设计，这些问题只会越积越多。",
          "智能体架构师存在的意义，就是在模型能力和组织责任之间搭桥。他既要懂技术的边界，也要理解组织的耐受度；既要能给管理层讲明白，也要能给执行层画出可操作的路径。这个角色不是为了让 AI 显得更酷，而是为了让它更像企业能长期使用的基础设施。",
        ],
      },
      {
        heading: "怎么判断一个人是真会做，还是只会包装",
        paragraphs: [
          "最直接的判断标准是，看他能不能把复杂任务讲成一条清晰链路。一个靠谱的智能体架构师不会只展示结果，而会说明为什么要这样分层、为什么这个节点要保留人工、为什么另一个节点可以自动、为什么某些能力现在不该接。能说清取舍，通常比炫耀功能更重要。",
          "第二个标准是看他是否尊重成本和边界。只会讲故事的人通常把 AI 当成无限免费的魔法水龙头；真正做过系统的人一定会反复谈预算、失败模式、责任归属和回退逻辑。因为他知道，一个企业级系统值不值钱，取决于它能不能在现实约束里活下来。",
        ],
      },
      {
        heading: "这个角色最终交付的，不是炫技，而是确定性",
        paragraphs: [
          "智能体架构师最终要交付的，不是一堆花哨名词，也不是一场让人热血沸腾的演示，而是更高的确定性。让企业知道这件事为什么能做、从哪一步开始做、做到什么程度算合格、出了偏差怎么发现、未来怎样继续扩。",
          "当大家都在追最新模型的时候，这个角色的价值反而更突出。因为模型会迭代，但组织对稳定交付、风险可控和结果负责的需求不会消失。谁能把这些需求组织成系统，谁才真正站在了 AI 进入现实业务的关键位置上。",
        ],
      },
    ],
  },
  {
    slug: "how-agent-architects-design-enterprise-services",
    title: "智能体架构师如何为企业定制服务：不是卖模型，而是重写工作流",
    titleEn: "How Agent Architects Design Enterprise Services",
    subtitle: "从诊断、试点到治理，把 AI 项目从展示型 PPT 变成真正能被验收的系统",
    subtitleEn:
      "From diagnosis to pilot and governance, this is how AI projects move from slideware to systems that can be accepted and operated.",
    date: "2026-04-11",
    readTime: "15 分钟",
    tags: ["企业服务", "AI工作流", "定制咨询", "智能体架构"],
    excerpt:
      "企业真正购买的不是模型接入，也不是概念热闹，而是一个能被验收、能被治理、能在现实约束里持续运行的工作系统。定制服务的本质，是重写工作流而不是堆技术名词。",
    excerptEn:
      "What enterprises actually buy is not model access or excitement. They buy systems that can be governed, accepted, and sustained under real operational constraints.",
    summary: [
      "企业定制服务的第一步不是选模型，而是诊断业务链路里哪些节点真正值得 AI 介入。",
      "真正有效的试点一定从窄闭环开始，而不是从“大而全平台”开始。",
      "定制化交付最终要落实到权限、验收、治理、培训和持续优化，而不只是一个 demo。",
    ],
    summaryEn: [
      "Enterprise service starts with workflow diagnosis, not model shopping.",
      "The right pilot is narrow, measurable, and tied to one real business loop.",
      "A serious engagement ends with governance and adoption, not just a demo.",
    ],
    coverImage: "/media/editorial/lu-cheng-workshop.png",
    coverAlt: "卢成在白板前讲解方案",
    sections: [
      {
        heading: "企业真正购买的，不是模型，而是结果",
        paragraphs: [
          "很多企业在采购 AI 服务时，最容易被带偏的地方就是把“模型能力”误当成“系统能力”。听起来像是买了某个更强的模型、接了更多工具、做了一个更炫的平台，就等于拥有了更高的价值。可一旦落到现实流程里，真正被问责的从来不是你接了什么模型，而是结果是否达标、流程是否稳定、风险是否可控。",
          "所以定制服务一开始就必须换视角。不是先问“能不能接 AI”，而是先问“企业到底想让哪一种结果更快、更稳、更便宜地发生”。如果目标是结果，就必须围绕业务链路来设计服务，而不是围绕技术名词来包装服务。",
        ],
      },
      {
        heading: "第一阶段：诊断业务链路与判断密度",
        paragraphs: [
          "一个靠谱的定制项目，第一步通常不是开发，而是诊断。要把当前业务流程拆开看：哪些环节是高重复、低判断密度的，哪些环节需要高责任、高解释性，哪些环节的输入输出已经相对标准化，哪些环节其实还混乱到不适合自动化。没有这一步，后面的设计就是盲飞。",
          "智能体架构师在这里的价值，是帮企业区分“可以自动化的环节”和“应该保留人为判断的环节”。很多项目失败，不是因为 AI 不强，而是因为企业把错误的步骤自动化了：该人工确认的地方交给模型，该先梳理流程的地方直接上系统，结果只会把原有混乱放大。",
        ],
      },
      {
        heading: "第二阶段：从一个窄闭环做试点，而不是一上来做大平台",
        paragraphs: [
          "企业级 AI 项目最常见的浪费，是一上来就想做一个“大而全”的平台，想一次性把知识库、流程编排、审批、分析、客服、销售全都接进去。听起来宏大，实际上几乎必然拖慢进度、稀释责任，最后谁都说不清到底哪一步创造了价值。",
          "更有效的路径，是先选一个窄闭环试点。比如只针对某类方案撰写、某类内部知识问答、某类线索预审、某类流程材料整理。闭环越窄，验收越清楚；边界越清楚，组织越容易配合。一个能稳定跑起来的小闭环，比一个谁都讲不清价值的大平台更值钱。",
        ],
      },
      {
        heading: "第三阶段：设计权限、边界与责任归属",
        paragraphs: [
          "一旦试点有效，问题就不再只是“能不能做”，而是“谁能用、怎么用、出了错算谁的、哪些数据能进、哪些结果能直接发”。如果这些边界不先定义，系统越成功，后续组织摩擦越大。很多企业并不是输在技术，而是输在责任边界混乱。",
          "智能体架构师在这一阶段的工作，是把权限、审核、日志、签名、回退、人工接管和结果验证一起设计进去。也就是说，系统不是只负责“生成”，还要负责“被信任”。只有当组织知道这套系统如何被控制、如何被追踪，它才可能真正进入关键流程。",
        ],
      },
      {
        heading: "第四阶段：让方案变成组织能力，而不是外包依赖",
        paragraphs: [
          "企业定制服务如果只停留在“我替你搭好了”，那价值其实很有限。真正好的交付，应该让企业逐渐获得自己的判断与维护能力。团队要知道这套系统的关键节点在哪里，哪些配置可以自己改，哪些变化需要谨慎评估，什么指标在提示系统开始失真。",
          "所以在试点之后，培训、文档、验收标准和持续优化节奏同样重要。定制服务不是把企业绑在供应商身上，而是帮助企业建立一套对 AI 系统有判断力的内部能力。只有这样，这项服务才不是一次性项目，而是变成企业能继续滚动放大的基础设施。",
        ],
      },
      {
        heading: "并不是所有企业都适合立刻做定制服务",
        paragraphs: [
          "如果一个企业连最基础的流程都还没有跑顺，输入输出标准也没有，责任人更是模糊，那么直接做 AI 定制服务大概率只会得到一个更贵的混乱系统。因为 AI 不会替你补齐所有管理问题，它只会把原本模糊的地方显得更明显。",
          "真正适合合作的企业，通常已经有清晰的问题、明确的责任人、愿意配合小范围试点，并且接受先从窄闭环开始。定制服务不是为了让企业感觉自己站上了潮头，而是为了帮助它在现实约束中走出一条能落地、能验收、能持续优化的路径。",
        ],
      },
    ],
  },
  {
    slug: "why-these-event-style-images-anchor-my-site",
    title: "为什么我用这组现场感图片做网站：它们不是装饰，而是方法论的外化",
    titleEn: "Why These Event-Style Images Anchor My Site",
    subtitle: "舞台、圆桌、白板和人像，对应的是公开表达、组织沟通、方案推演和权威建立",
    subtitleEn:
      "Stage, roundtable, whiteboard, and portrait visuals map directly to public articulation, executive dialogue, system design, and authority.",
    date: "2026-04-11",
    readTime: "11 分钟",
    tags: ["品牌表达", "网站设计", "权威感", "智能体架构师"],
    excerpt:
      "一个人物站如果只有抽象背景和口号，很容易显得空。真正能支撑权威感的，是视觉背后对应的身份叙事：你在哪里说话、和谁交流、怎样讲解复杂问题、为什么别人愿意相信你。",
    excerptEn:
      "A personal authority site cannot rely on abstract backgrounds alone. Visuals matter when they reinforce a coherent identity story about trust, communication, and system judgment.",
    summary: [
      "人物站的图片不是装饰，而是身份叙事的一部分。",
      "我选择的是同一种“现场感”语境：公开表达、专业沟通、方案讲解与稳定肖像彼此一致。",
      "网站强调权威感而不是炫技感，是因为真正想传递的不是新奇，而是可信与可承接。",
    ],
    summaryEn: [
      "Images on an authority site should reinforce identity, not decorate emptiness.",
      "The selected visuals share one narrative language: stage presence, professional dialogue, and system explanation.",
      "Authority beats novelty when the goal is trust and serious engagement.",
    ],
    coverImage: "/media/editorial/lu-cheng-roundtable.png",
    coverAlt: "卢成在圆桌交流场景中",
    sections: [
      {
        heading: "为什么这个网站不能只放抽象背景和一句口号",
        paragraphs: [
          "如果一个人物站只给你看抽象渐变、科技线条和几句听起来很前沿的话，短时间内也许会有“像 AI”的感觉，但很难有“我愿意相信这个人”的感觉。真正的个人权威感，不是从视觉噪音里堆出来的，而是从身份是否可信、叙事是否一致、信息是否克制里长出来的。",
          "所以这次我没有把图片当成装饰，而是把它们当成表达的一部分。它们要回答的不是“好不好看”，而是“站点一打开，别人能不能在几秒钟之内感受到你是一个可以承接复杂问题的人”。",
        ],
      },
      {
        heading: "一组图必须服务于同一种身份叙事",
        paragraphs: [
          "网站上的人物图如果彼此风格分裂，今天像创业者，明天像网红，后天又像课程讲师，用户就会感到身份漂移。权威感最怕这种不稳定。真正有效的图片组合，应该共同指向一种清晰身份：你是一个能够公开表达、能够和组织层对话、能够解释复杂系统、也能够保持稳定专业形象的人。",
          "因此我选择的是同一种“现场感”语境。无论是演讲、圆桌、白板还是正式肖像，它们都在讲一件事：这个网站的核心不是卖流量，不是卖热闹，而是强调判断力、系统性和可承接的专业服务。",
        ],
      },
      {
        heading: "舞台和大屏画面，代表的是公开表达能力",
        paragraphs: [
          "当一个人站在舞台或大屏前，画面传递的不只是“出现过在某个现场”，更重要的是一种公开表达能力的暗示。它说明你可以面对更大的注意力场，可以把复杂话题讲给更多人听，也可以把抽象的系统设计压缩成清晰、可传播的信息结构。",
          "对智能体架构师来说，这一点尤其重要。因为这个角色的价值不仅在做系统，也在解释系统。你必须能向管理层解释为什么这样做，向团队解释每一层怎么协同，向外部合作方解释边界在哪里。舞台感画面因此不是炫技，而是公开表达能力的视觉化。",
        ],
      },
      {
        heading: "圆桌和采访画面，代表的是能和决策者对话",
        paragraphs: [
          "很多技术型网站容易忽略一个事实：企业合作不是从代码开始的，而是从沟通开始的。尤其是高价值服务，第一步常常不是写方案，而是判断问题、澄清目标、理解组织真实顾虑。圆桌和采访场景能够把这种能力可视化，它们表达的是你不是一个只会面对屏幕的人，而是可以进入对话现场的人。",
          "这对权威感非常关键。真正让企业愿意继续深入交流的，不只是你会不会做，而是你能不能和不同层级的人说同一种系统，只是换不同的语言。这些图片本质上在告诉别人：这里不是一个单向输出观点的博客，也是一处可以开始专业对话的入口。",
        ],
      },
      {
        heading: "白板和讲解画面，代表的是方案推演能力",
        paragraphs: [
          "白板图和系统讲解图之所以重要，是因为它们把“会想”变成了“会讲清”。很多人可以说自己懂 AI，但当你让他把任务拆成步骤、把责任拆成层级、把风险画成结构时，往往就暴露出没有真正做过系统设计。白板和大屏讲解的画面，恰好对应的是这种推演和结构化表达能力。",
          "对于一个强调智能体架构的网站来说，这种视觉信号非常匹配。因为你真正想让别人感知到的，不是“我会用很多工具”，而是“我有能力把复杂事情组织得更清楚”。这也是为什么这些图比纯粹的人像更有说服力。",
        ],
      },
      {
        heading: "我为什么要让这个网站更强调权威感，而不是炫技感",
        paragraphs: [
          "因为真正需要这类服务的人，并不缺“看起来很未来”的网站，他们缺的是一个可信的判断对象。一个炫技感太强的网站，会让人怀疑你到底是在卖专业能力，还是在卖一种情绪。相比之下，权威感更接近合作前真实需要的信号：稳定、克制、可信、能承接。",
          "所以这组图片最终服务的是同一个目的：让整个站点从第一眼开始，就更像一位可以被咨询、被邀请、被信任的人，而不是一个急着炫耀技术能力的人。对我来说，这才是人物站最该建立的气质。",
        ],
      },
    ],
  },
];

export const blogIntro = {
  title: "一个表面是博客，底层是 Agent 入口的个人站",
  titleEn: "A business blog on the surface, an agent entry layer underneath",
  summary:
    "这里首先是一张清晰、可信、能沉淀观点的公开名片。文章、方法论和案例对人类读者负责，站点同时保留严谨的结构与入口设计。",
  summaryEn:
    "This site behaves like a business-grade editorial presence first. The archive is currently Chinese-first, with essays, methods, and case-based thinking organized for serious human readers.",
};

export const productLadder = [
  {
    name: "Workflow Shield",
    badge: "Free",
    href: "/products/workflow-shield",
    summary: "保护 workflow 的公开层与隐藏层边界，让调用比重组更划算。",
  },
  {
    name: "Skill Glue",
    badge: "Free",
    href: "/products/skill-glue",
    summary: "把多个小 skill 拼成低 token 成本的 workflow，而不是堆一个巨型 prompt。",
  },
  {
    name: "Agent Capability Map",
    badge: "MVP",
    href: "/products/agent-capability-map",
    summary: "把不同 Agent 的真实工具面、能力边界与最佳使用方式整理成可比较的履历卡。",
  },
  {
    name: "High-End Custom Architecture",
    badge: "Private",
    href: "/profile",
    summary: "面向真正高判断密度合作的高端定制架构入口，直接进入公开资料与邮箱联系栈。",
  },
];
