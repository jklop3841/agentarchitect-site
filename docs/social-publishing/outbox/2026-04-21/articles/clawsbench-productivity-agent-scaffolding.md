# ClawsBench 提醒我们：办公 Agent 的胜负不在模型，而在脚手架

五个模拟服务、四十四个任务、七千多次轨迹显示：技能和 meta prompt 能拉升成功率，也会改变安全风险

## 摘要

- ClawsBench 使用五个模拟办公服务、44 个结构化任务、6 个模型、4 个 harness 和 7,224 次 trial 评估生产力 Agent。
- 项目页显示，没有 skills + meta prompt 时模型任务成功率只有 0-8%；加上脚手架后跃升到 39-63%。
- 这对企业很关键：办公 Agent 不是模型采购题，而是工作区模拟、技能边界、meta prompt、安全轨迹和验收标准的系统设计题。

## 办公 Agent 最容易被演示骗

办公自动化是 AI Agent 最容易做出漂亮演示、也最容易在真实场景翻车的领域。让模型帮你写封邮件、总结会议、找个日程冲突，看起来很顺。但企业里的办公流程不是单步问答，而是跨邮件、日历、文档、网盘、聊天记录和权限系统的连续操作。

ClawsBench 的价值就在这里。它没有把 Agent 放在真实 Gmail 或 Slack 里乱跑，而是做了高保真的模拟工作区：Gmail、Calendar、Docs、Drive、Slack 五个服务都有 API、状态管理、快照恢复、边界数据和安全陷阱。这样既能评估真实工作流，又不会真的删文件、发错邮件或改坏权限。

## 模型差异没有脚手架差异大

项目页给出的最刺眼结论是：没有 domain skills 和 meta prompt 时，所有模型任务成功率只有 0-8%；加上完整脚手架后，成功率跃升到 39-63%。这意味着企业如果只比较模型，很可能比较错了对象。

模型当然重要，但办公 Agent 的实际能力更依赖脚手架：它是否知道每个服务 API 怎么用，是否理解跨服务协调，是否有任务拆解规则，是否知道什么时候停手，是否知道安全动作需要确认。没有这些，强模型也像一个聪明但没入职培训的新员工。

## 技能会提高能力，也会提高风险

ClawsBench 另一个重要发现是，domain skills 会提高任务成功率，同时也可能提高 unsafe action rate；meta prompt 则提供跨服务安全约束。这很像真实企业：给员工更多 SOP 和工具权限，效率会上升，但风险面也会扩大。

所以智能体架构不能把 skills 当成纯粹的能力包。每个 skill 都应该有作用域、权限、前置条件、输出格式、失败处理和人工确认点。否则你以为自己在提升 Agent 能力，实际可能是在给它更多方式把事情做坏。

## 多服务任务是企业落地的真正分水岭

单服务任务和多服务任务不是同一个难度。ClawsBench 指出，单服务任务成功率更高，多服务任务更难且更危险。这非常符合企业现场：只在邮件里总结一封信不难，难的是根据邮件更新日历、修改文档、同步 Slack、调整 Drive 权限，还要避免把敏感内容发错人。

企业评测办公 Agent 时，必须把多服务任务单独拉出来看。不要被单一应用里的高成功率迷惑。真正有价值的 Agent，是能在跨系统边界时保持状态一致、权限清楚、动作可追踪，并且知道什么时候该停下来问人。

## 来源与延伸阅读

AI 论文简报只作为选题雷达：https://ai-brief.liziran.com/zh/ 。主要核验来源包括 ClawsBench 项目页：https://clawsbench.benchflow.ai/ ，以及 arXiv 论文页 ClawBench: Can AI Agents Complete Everyday Online Tasks?：https://arxiv.org/abs/2604.08523 。项目页列出了五个 mock services、44 tasks、6 models、4 harnesses、7,224 trials，以及 TSR/UAR、scaffolding、multi-service task 等核心结果。

本文关注的是企业评测方法：办公 Agent 的真实能力不等于模型名，而是模型、skill、meta prompt、harness、权限和安全轨迹共同形成的系统能力。

## 来源链接

- https://ai-brief.liziran.com/zh/
- https://clawsbench.benchflow.ai/
- https://arxiv.org/abs/2604.08523
