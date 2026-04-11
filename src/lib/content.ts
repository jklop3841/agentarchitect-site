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
  sections: Array<{
    heading: string;
    headingEn?: string;
    paragraphs: string[];
  }>;
};

export const authorProfile = {
  name: "卢成",
  englishName: "Lu Cheng",
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
];

export const blogIntro = {
  title: "一个表面是博客，底层是 Agent 入口的个人站",
  titleEn: "A business blog on the surface, an agent entry layer underneath",
  summary:
    "这里首先是一张清晰、可信、能沉淀观点的公开名片。文章、方法论和案例对人类读者负责，站点同时保留严谨的结构与入口设计。",
  summaryEn:
    "This site behaves like a business-grade editorial presence first: essays, methods, and case-based thinking for human readers, with a disciplined information structure underneath.",
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
    badge: "Soon",
    href: "/apply",
    summary: "把不同 Agent 的真实工具链、能力边界与最佳使用方式整理成可比较的履历表。",
  },
  {
    name: "私人定制 / 架构咨询",
    badge: "Private",
    href: "/apply",
    summary: "围绕 AI 工作流设计、Harness Engineering、GEO 与商业闭环做定制化架构服务。",
  },
];
