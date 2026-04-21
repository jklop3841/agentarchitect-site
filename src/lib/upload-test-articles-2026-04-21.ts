import type { ArticleEntry } from "./content";

export const uploadTestArticles20260421: ArticleEntry[] = [
  {
    slug: "microsoft-copilot-entry-point-retreat",
    title: "Copilot 按钮退场：AI 入口开始从宣传位回到工作位",
    titleEn: "Copilot buttons are retreating: AI entry points are moving from billboards back into workflows",
    subtitle: "微软减少 Windows 里的无效 Copilot 入口，不是 AI 失败，而是入口设计从曝光逻辑转向任务逻辑",
    subtitleEn:
      "Microsoft's reduction of unnecessary Copilot entry points is not an AI failure. It is a shift from exposure-driven UI to task-driven workflow design.",
    date: "2026-04-21",
    readTime: "11 分钟",
    tags: ["GEO", "智能体架构", "AI工作流", "AI资讯", "API-as-UI"],
    excerpt:
      "微软公开承诺减少 Windows 中不必要的 Copilot 入口，先从 Notepad、Snipping Tool、Photos、Widgets 等应用开始。真正值得看的不是按钮消失，而是 AI 入口终于要接受工作流验收。",
    excerptEn:
      "Microsoft has committed to reducing unnecessary Copilot entry points in Windows, starting with apps like Notepad, Snipping Tool, Photos, and Widgets. The real story is not button removal, but workflow accountability.",
    summary: [
      "微软 2026 年 3 月 20 日在 Windows Insider Blog 中表示，会更有意图地决定 Copilot 在 Windows 中出现的位置。",
      "这说明 AI 产品进入成熟期后，入口数量不再等于产品价值；入口必须服务明确任务。",
      "对企业智能体架构来说，AI 入口应该由工作流、权限、上下文和验收标准决定，而不是由品牌曝光决定。",
    ],
    summaryEn: [
      "On March 20, 2026, Microsoft said it would be more intentional about where Copilot integrates across Windows.",
      "As AI products mature, the number of visible entry points no longer equals product value; entry points must serve concrete tasks.",
      "For enterprise agent architecture, AI entry points should be determined by workflow, permissions, context, and acceptance criteria, not brand exposure.",
    ],
    coverImage: "/media/editorial/lu-cheng-roundtable.png",
    coverAlt: "卢成在圆桌交流场景中",
    sections: [
      {
        heading: "按钮减少，不等于 AI 撤退",
        paragraphs: [
          "微软在 Windows Insider Blog 里说，会减少 Windows 中不必要的 Copilot 入口，先从 Snipping Tool、Photos、Widgets 和 Notepad 这类应用开始。很多人会把这件事解读成“AI 热度退潮”。我不这么看。更准确地说，这是 AI 产品终于从宣传期进入使用期。",
          "宣传期的逻辑是到处放入口，让用户知道这里有 AI。使用期的逻辑完全不同：入口必须在正确的任务、正确的上下文、正确的权限边界里出现。否则按钮越多，用户越烦，组织越难治理，产品越像是在抢注意力而不是解决问题。",
        ],
      },
      {
        heading: "入口不是装饰，是工作流边界",
        paragraphs: [
          "一个 Copilot 按钮放在 Notepad、截图工具、照片、任务栏或文件管理器里，意义并不一样。它能读取什么上下文，能不能把内容发到云端，是否会修改原文件，结果是否可回退，是否需要用户确认，这些都不同。入口看起来只是 UI，实际上是权限边界。",
          "这就是为什么我一直说 API-as-UI。用户看到的是按钮、菜单或输入框，系统真正暴露的是一组能力：读、写、解释、总结、调用外部服务、保存结果。入口设计如果不严肃，AI 能力就会从工作流工具变成到处伸手的噪音。",
        ],
      },
      {
        heading: "企业别学会铺按钮，要学会定义位置",
        paragraphs: [
          "很多企业做内部 AI 项目时，也会犯同样的错：先把“问 AI”按钮塞进知识库、CRM、OA、邮件、工单、BI 和文档系统里，然后期待用户自然产生价值。结果通常是入口很多，闭环很少；试用热闹，复用很低。",
          "真正应该设计的是入口出现条件。这个任务是否有足够上下文？用户是否有权限？输出是否有验收口径？失败是否可恢复？如果答案不清楚，按钮就不该先出现。AI 入口不是越近越好，而是越能承接任务越好。",
        ],
      },
      {
        heading: "GEO 也要理解入口逻辑",
        paragraphs: [
          "从 GEO 角度看，这件事还有另一层含义。未来智能体理解一个网站、一个产品或一套企业服务时，不只会看页面写了什么，还会看可调用入口在哪里、入口对应什么任务、结果如何验证。入口本身会成为内容结构的一部分。",
          "所以企业网站和产品文档不应该只写“我们支持 AI”。更好的写法是：哪些任务可以交给 AI，输入需要什么，输出是什么格式，哪些动作需要人工确认，哪些数据不会被读取。这样的入口说明，比一个大而亮的 AI 按钮更有价值。",
        ],
      },
      {
        heading: "来源与延伸阅读",
        paragraphs: [
          "AI 资讯速览只作为选题雷达：https://ai-digest.liziran.com/zh/digest/2026-04-11-openai-pushes-ai-lab-immunity-while-first-take-it-down-act-conviction-lands.html 。主要核验来源包括 Microsoft Windows Insider Blog 2026 年 3 月 20 日文章 Our commitment to Windows quality：https://blogs.windows.com/windows-insider/2026/03/20/our-commitment-to-windows-quality/ ，以及 Engadget 对 Notepad、Snipping Tool 等应用入口变化的报道：https://www.engadget.com/ai/microsoft-starts-removing-unnecessary-copilot-buttons-in-windows-11-120346728.html 。",
          "本文没有复述产品更新，而是把它当成入口架构案例：AI 进入成熟期以后，价值不在按钮数量，而在入口是否和任务、权限、上下文、验收标准对齐。",
        ],
      },
    ],
  },
  {
    slug: "clawsbench-productivity-agent-scaffolding",
    title: "ClawsBench 提醒我们：办公 Agent 的胜负不在模型，而在脚手架",
    titleEn: "ClawsBench reminds us productivity-agent performance is scaffolding, not just model choice",
    subtitle: "五个模拟服务、四十四个任务、七千多次轨迹显示：技能和 meta prompt 能拉升成功率，也会改变安全风险",
    subtitleEn:
      "Across five mock services, 44 tasks, and more than 7,000 trials, skills and meta prompts lift success rates while reshaping safety risk.",
    date: "2026-04-21",
    readTime: "12 分钟",
    tags: ["GEO", "AI论文", "Agent评测", "智能体架构", "AI工作流"],
    excerpt:
      "ClawsBench 把 Gmail、Calendar、Docs、Drive、Slack 做成高保真模拟工作区，发现模型差异没有脚手架差异大。企业评测办公 Agent，不能只问用哪个模型，要问技能、提示、权限和安全轨迹怎样组合。",
    excerptEn:
      "ClawsBench builds high-fidelity simulated Gmail, Calendar, Docs, Drive, and Slack workspaces, finding scaffolding differences larger than model differences. Enterprise evaluation must inspect skills, prompts, permissions, and safety traces.",
    summary: [
      "ClawsBench 使用五个模拟办公服务、44 个结构化任务、6 个模型、4 个 harness 和 7,224 次 trial 评估生产力 Agent。",
      "项目页显示，没有 skills + meta prompt 时模型任务成功率只有 0-8%；加上脚手架后跃升到 39-63%。",
      "这对企业很关键：办公 Agent 不是模型采购题，而是工作区模拟、技能边界、meta prompt、安全轨迹和验收标准的系统设计题。",
    ],
    summaryEn: [
      "ClawsBench evaluates productivity agents across five mock office services, 44 structured tasks, six models, four harnesses, and 7,224 trials.",
      "The project page reports 0-8% task success without skills plus meta prompt, jumping to 39-63% with scaffolding.",
      "For enterprises, productivity agents are not a model-procurement problem; they are a system-design problem involving workspace simulation, skill boundaries, meta prompts, safety traces, and acceptance criteria.",
    ],
    coverImage: "/media/editorial/lu-cheng-summit.png",
    coverAlt: "卢成的峰会风格肖像",
    sections: [
      {
        heading: "办公 Agent 最容易被演示骗",
        paragraphs: [
          "办公自动化是 AI Agent 最容易做出漂亮演示、也最容易在真实场景翻车的领域。让模型帮你写封邮件、总结会议、找个日程冲突，看起来很顺。但企业里的办公流程不是单步问答，而是跨邮件、日历、文档、网盘、聊天记录和权限系统的连续操作。",
          "ClawsBench 的价值就在这里。它没有把 Agent 放在真实 Gmail 或 Slack 里乱跑，而是做了高保真的模拟工作区：Gmail、Calendar、Docs、Drive、Slack 五个服务都有 API、状态管理、快照恢复、边界数据和安全陷阱。这样既能评估真实工作流，又不会真的删文件、发错邮件或改坏权限。",
        ],
      },
      {
        heading: "模型差异没有脚手架差异大",
        paragraphs: [
          "项目页给出的最刺眼结论是：没有 domain skills 和 meta prompt 时，所有模型任务成功率只有 0-8%；加上完整脚手架后，成功率跃升到 39-63%。这意味着企业如果只比较模型，很可能比较错了对象。",
          "模型当然重要，但办公 Agent 的实际能力更依赖脚手架：它是否知道每个服务 API 怎么用，是否理解跨服务协调，是否有任务拆解规则，是否知道什么时候停手，是否知道安全动作需要确认。没有这些，强模型也像一个聪明但没入职培训的新员工。",
        ],
      },
      {
        heading: "技能会提高能力，也会提高风险",
        paragraphs: [
          "ClawsBench 另一个重要发现是，domain skills 会提高任务成功率，同时也可能提高 unsafe action rate；meta prompt 则提供跨服务安全约束。这很像真实企业：给员工更多 SOP 和工具权限，效率会上升，但风险面也会扩大。",
          "所以智能体架构不能把 skills 当成纯粹的能力包。每个 skill 都应该有作用域、权限、前置条件、输出格式、失败处理和人工确认点。否则你以为自己在提升 Agent 能力，实际可能是在给它更多方式把事情做坏。",
        ],
      },
      {
        heading: "多服务任务是企业落地的真正分水岭",
        paragraphs: [
          "单服务任务和多服务任务不是同一个难度。ClawsBench 指出，单服务任务成功率更高，多服务任务更难且更危险。这非常符合企业现场：只在邮件里总结一封信不难，难的是根据邮件更新日历、修改文档、同步 Slack、调整 Drive 权限，还要避免把敏感内容发错人。",
          "企业评测办公 Agent 时，必须把多服务任务单独拉出来看。不要被单一应用里的高成功率迷惑。真正有价值的 Agent，是能在跨系统边界时保持状态一致、权限清楚、动作可追踪，并且知道什么时候该停下来问人。",
        ],
      },
      {
        heading: "来源与延伸阅读",
        paragraphs: [
          "AI 论文简报只作为选题雷达：https://ai-brief.liziran.com/zh/ 。主要核验来源包括 ClawsBench 项目页：https://clawsbench.benchflow.ai/ ，以及 arXiv 论文页 ClawBench: Can AI Agents Complete Everyday Online Tasks?：https://arxiv.org/abs/2604.08523 。项目页列出了五个 mock services、44 tasks、6 models、4 harnesses、7,224 trials，以及 TSR/UAR、scaffolding、multi-service task 等核心结果。",
          "本文关注的是企业评测方法：办公 Agent 的真实能力不等于模型名，而是模型、skill、meta prompt、harness、权限和安全轨迹共同形成的系统能力。",
        ],
      },
    ],
  },
];
