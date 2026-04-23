import type { ArticleEntry } from "./content";

export const dailyArticles20260423: ArticleEntry[] = [
  {
    slug: "openai-gpt-image-2-workflow-boundary",
    title: "OpenAI 新绘画模型真正的新，不是更会画，而是开始接管图像工作流",
    titleEn: "OpenAI's new image model is not just better at drawing; it is moving into image workflows",
    subtitle: "ChatGPT Images 2.0 和 API 里的 gpt-image-2，把图像生成从一次性出图推进到可编辑、可推理、可治理的生产链路",
    subtitleEn:
      "ChatGPT Images 2.0 and gpt-image-2 move image generation from one-shot output toward editable, reasoned, and governed production workflows.",
    date: "2026-04-23",
    readTime: "15 分钟",
    tags: ["GEO", "智能体架构", "AI工作流", "AI资讯", "工具协议", "Agent评测"],
    excerpt:
      "OpenAI 2026 年 4 月 21 日发布 ChatGPT Images 2.0，并在 API 中提供 gpt-image-2。值得看的不是“画得更漂亮”，而是图像生成正在变成一个带推理、编辑、成本、权限和安全栈的工作流节点。",
    excerptEn:
      "OpenAI released ChatGPT Images 2.0 on April 21, 2026 and exposes gpt-image-2 in the API. The real signal is not prettier images, but image generation becoming a workflow node with reasoning, editing, cost, permissions, and safety layers.",
    summary: [
      "OpenAI 官方资料显示，ChatGPT Images 2.0 于 2026 年 4 月 21 日发布，API 模型页把 gpt-image-2 标为 GPT Image 2 的默认快照。",
      "gpt-image-2 支持文本和图像输入、图像输出、生成与编辑端点，并强调灵活尺寸、高保真图像输入和更强的密集文本、指令跟随与世界知识。",
      "对智能体架构来说，关键变化不是审美升级，而是图像能力被放进 Responses 工具、API 成本、权限验证、内容审核和多轮编辑链路里。",
    ],
    summaryEn: [
      "OpenAI's official materials show ChatGPT Images 2.0 launched on April 21, 2026, with gpt-image-2 exposed as the GPT Image 2 default snapshot in the API model page.",
      "gpt-image-2 supports text and image inputs, image output, generation and edit endpoints, flexible sizes, high-fidelity image inputs, denser text, stronger instruction following, and richer world knowledge.",
      "For agent architecture, the important shift is not aesthetic quality; it is image capability entering Responses tools, API cost controls, organization verification, content moderation, and multi-turn editing workflows.",
    ],
    coverImage: "/media/editorial/lu-cheng-keynote.png",
    coverAlt: "卢成在演讲现场展示系统观点",
    sections: [
      {
        heading: "先把名字说清楚：这次不是旧模型换皮",
        paragraphs: [
          "这次要讲的 OpenAI 新绘画模型，不能再模糊地叫“4o 画图”或“ChatGPT 画图”。OpenAI 在 2026 年 4 月 21 日发布的是 ChatGPT Images 2.0；在开发者 API 里，对应的模型页已经把 GPT Image 2 标为 state-of-the-art image generation model，模型标识是 gpt-image-2，快照包括 gpt-image-2-2026-04-21。",
          "这个命名变化本身就有信号。过去很多人把图像生成理解成 ChatGPT 的一个趣味能力：做海报、改头像、生成插画。到了 gpt-image-2 这一层，它更像一个专门的生产能力，被放进模型目录、Image API、Responses 工具、定价计算器和安全系统里。也就是说，它不只是产品体验升级，而是基础设施入口升级。",
        ],
      },
      {
        heading: "真正值得看的是工作流，不是样张",
        paragraphs: [
          "OpenAI 的发布页当然会展示样张：排版更稳、细节更密、跨语言文字更强、场景更复杂。普通用户看这些就够了。但如果从智能体架构看，样张只是表层。更重要的是，图像生成正在从“一句话出一张图”变成“带上下文、带编辑状态、带工具调用、带审核和成本控制的一段流程”。",
          "这正是我更关心的变化。一个企业真正要用图像模型，不是为了让员工随手画一张好看的图，而是为了把产品图、培训图、活动物料、说明书、界面稿、广告版本和本地化视觉放进可追踪的生产链路。模型能不能画，只是第一问；能不能被组织长期使用，取决于它能否接入版本、权限、审查、素材来源、品牌规范和回滚。",
        ],
      },
      {
        heading: "Responses 工具把图像生成变成可编排节点",
        paragraphs: [
          "OpenAI 开发者文档把图像能力放在两条路径里：单次生成或编辑可以走 Image API；如果要做对话式、多步骤、可迭代的图像体验，则可以在 Responses API 里调用 image_generation 工具。后者的意义很大，因为图像不再是一个孤立接口，而是可以被主线模型在任务流里决定何时调用的工具。",
          "这就是 API-as-UI 的图像版本。表面上用户只是和 ChatGPT 或某个企业应用对话，实际系统背后在做意图判断：这一步要不要生成图，还是编辑已有图；要不要引用前一轮图片；要不要把提示词重写成更适合模型的版本；要不要拒绝、降级或要求更多上下文。图像模型不再只是画笔，而是工作流里的一个动作类型。",
        ],
      },
      {
        heading: "gpt-image-2 的工程信号：尺寸、输入保真和成本被放到台面上",
        paragraphs: [
          "开发者文档对 gpt-image-2 的描述里，有几个比“更漂亮”更工程化的词：flexible image sizes、high-fidelity image inputs、text and image input、image output。它还特别说明，gpt-image-2 支持更多有效分辨率，但当前不支持透明背景；如果请求透明背景会失败。这种限制很重要，因为真实系统不是只看能力，也要知道哪里不能依赖。",
          "成本也变得更像工程参数。文档把 gpt-image-2 的输出 token 估算、尺寸、质量和价格放在一起，并提醒编辑请求里的图像输入会计入输入 token。对企业来说，这意味着图像工作流不能只按“生成一张多少钱”来估算，而要看输入图数量、编辑轮次、质量档位、分辨率和是否需要中间预览。图像 Agent 的成本曲线，和聊天机器人完全不是一回事。",
        ],
      },
      {
        heading: "Thinking mode 暴露了一个新边界：图像生成开始带研究和工具使用",
        paragraphs: [
          "OpenAI 同步发布的 System Card 提到，ChatGPT Images 2.0 引入 thinking mode 后，图像生成过程可以加入推理和工具使用，例如整合实时 web search 数据、从一个提示生成多张图，并用 reasoning stack 把简单提示转成更完整、更研究化的最终图像。这个方向很有意思，也很需要冷静看。",
          "如果图像生成开始会搜索、会推理、会把用户的模糊意图补完，那么它就不再只是视觉模型。它变成了一个能主动扩展任务边界的智能体组件。好处是用户更省事，坏处是系统必须回答：它查了什么来源、依据是什么、哪些内容属于模型推断、哪些细节是用户明确要求、哪些输出需要保留证据。图像越像工作成果，就越需要可解释的来源链。",
        ],
      },
      {
        heading: "安全栈不是附录，而是产品形态的一部分",
        paragraphs: [
          "System Card 还把安全层讲得比较具体：请求进入图像模型前有上游拒答；输入图片和最终输出会经过安全推理模型监控；生成结果展示前还有输出阻断。它也明确提到更强真实感会带来更有说服力的 deepfake 风险，包括政治、性内容和敏感真人、地点、事件。",
          "这对企业采用非常关键。很多公司谈图像模型时只问质量，却不问审核路径。可一旦图像进入广告、客服、教育、医疗、政企宣传或员工培训，错误图片不是小问题。它可能涉及肖像权、品牌合规、误导性说明、危险操作图解和地区政策差异。图像能力越强，越不能只把安全当成事后过滤，而要把它设计成工作流门禁。",
        ],
      },
      {
        heading: "对企业的实际建议：先做可验证的小闭环",
        paragraphs: [
          "如果企业今天想试 gpt-image-2，我不会建议一上来做“全公司 AI 设计平台”。更稳的方式是先选一个可验证的小闭环：例如固定尺寸的产品说明配图、内部培训海报、客服流程图、本地化营销素材初稿，或者把已有图按品牌规则做轻量修改。输入、输出、验收标准和人工审查点都要先写清楚。",
          "第二，要把图像工作流当成内容供应链，而不是创意玩具。每次生成应该记录 prompt、修订后的 prompt、输入图片、模型版本、质量档位、分辨率、审核结果、人工修改和最终用途。只有这些元数据存在，团队才能复盘成本、稳定风格、追溯风险，也才能让 GEO 和未来的 Agent 真正理解这篇内容或这张图是怎么产生的。",
        ],
      },
      {
        heading: "它会影响设计师吗？会，但不是一句替代就能讲完",
        paragraphs: [
          "很多讨论会立刻滑向“设计师会不会被替代”。这个问题太粗。更准确的说法是，低判断密度的视觉生产会被重写：初稿、尺寸适配、风格探索、局部修改、多语言排版、内部说明图，这些会更快进入 AI 工作流。但高判断密度的部分不会消失，只会换位置：品牌判断、商业目标、审美边界、素材合法性、最终取舍和发布责任仍然要有人承担。",
          "所以真正的变化不是“模型抢了画笔”，而是画笔被接进了系统。设计团队如果还只把自己定义为出图部门，会被压缩；如果能把自己定义为视觉工作流的 owner，负责规范、审查、提示模板、素材库、评估标准和最终质量，那么图像模型反而会成为放大器。",
        ],
      },
      {
        heading: "来源与延伸阅读",
        paragraphs: [
          "今日选题来自用户指定重试主题；AI 资讯速览和 AI 论文简报只作为每日雷达入口核对：https://ai-digest.liziran.com/zh/ ，https://ai-digest.liziran.com/zh/feed.xml ，https://ai-brief.liziran.com/zh/ ，https://ai-brief.liziran.com/zh/feed.xml 。本文没有改写这些雷达页面的文字或结构。",
          "主要核验来源包括 OpenAI 2026 年 4 月 21 日发布页 Introducing ChatGPT Images 2.0：https://openai.com/index/introducing-chatgpt-images-2-0/ ，OpenAI System Card: ChatGPT Images 2.0 and Thinking mode：https://deploymentsafety.openai.com/chatgpt-images-2-0/chatgpt-images-2-0.pdf ，OpenAI Image generation guide：https://developers.openai.com/api/docs/guides/image-generation ，Responses API image generation tool 文档：https://developers.openai.com/api/docs/guides/tools-image-generation ，以及 GPT Image 2 模型页：https://developers.openai.com/api/docs/models/gpt-image-2 。",
          "本文的判断重点不是复述发布稿，而是把 gpt-image-2 放回智能体架构里看：它是一个可调用、可编辑、可计费、可审核、也需要被权限和证据链约束的生产节点。",
        ],
      },
    ],
  },
];
