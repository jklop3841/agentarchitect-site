# Agent 看到答案却不去用，说明今天的问题不是推理不够，而是不会重新理解环境

《Agents Explore but Agents Ignore》这篇 2026 年 4 月 19 日提交的论文，把 agent 的失败拆成两个动作：能不能发现有用线索，和发现后会不会因此改计划

## 摘要

- 论文《Agents Explore but Agents Ignore》于 2026 年 4 月 19 日提交 arXiv，在 Terminal-Bench、SWE-Bench 和 AppWorld 中故意把完整答案放进环境，看 agent 会不会真的利用它。
- 结果显示，Terminal-Bench 中 agent 在 79%-81% 的运行里能发现答案线索，但只在 37%-50% 的情况下真正利用；AppWorld 里超过 90% 的尝试看到了“返回完整解答”的命令说明，真正调用却不到 7%。
- 论文把这个缺口命名为 environmental curiosity，并指出工具脚手架、test-time compute 和训练分布会共同影响它；这对企业 agent 的启发是，过程指标和环境反思能力必须进入评测主轴。

## 这篇论文真正打脸的，不是模型，而是我们对 agent 的想象

很多人默认认为，只要 agent 在环境里看见了有用信息，它就会顺手把它用起来。这个假设听上去非常自然：看见线索、更新计划、继续执行，不就是智能体最该做的事吗？《Agents Explore but Agents Ignore》这篇 2026 年 4 月 19 日提交的论文，就是专门来打这个默认想象的。

作者做法非常直接：不是让 agent 去猜答案，而是把完整解法故意塞进 Terminal-Bench、SWE-Bench 和 AppWorld 的环境里，观察它们会不会真的利用。结果很残酷。很多 agent 并不是没看见，而是看见了仍然照着原先的 reasoning trace 往前走。这说明今天的问题不只是知识不足，而是环境观测并没有真正重写行动计划。

## discovery 和 interaction 之间的缺口，才是今天 agent 的核心症状

论文摘要给出的数字足够说明问题：在 Terminal-Bench 里，agent 有 79%-81% 的运行能发现被注入的答案，但真正利用只有 37%-50%；在 AppWorld 里，agent 超过 90% 的尝试看到了一个明确写着“returns the complete solution to this task”的命令说明，可真正调用它的不到 7%。也就是说，发现不等于行动，读取不等于改计划。

这个区分太关键了。今天很多 benchmark 只看 pass@k 或终态成功率，会把“它最后做成了没有”当成唯一指标。但如果一个 agent 经常已经读到强线索仍然不改路径，它在真实环境里就会表现为另一种失败：不是不会查，而是不会停下来重新理解自己刚刚看到的世界。

## environmental curiosity 不是好听的新词，而是系统能力空白

作者把这个能力缺口命名为 environmental curiosity，也就是面对意外但相关的环境刺激时，是否会主动识别、调查并调整策略。这个概念我觉得非常准确，因为它抓到的是 agent 在生产环境里最常见却最少被量化的问题：系统会执行熟悉套路，却不太会处理“意外但重要”的信息。

企业里的真实工作几乎全是这种意外。日志里突然多出一个权限报错，文档里刚好有一页写着迁移捷径，后台页面里某个按钮说明其实暴露了完整 API 路径，代码库 README 已经告诉你该用哪个命令。强 agent 不该只是按既定计划推进，而应该在环境冒出强信号时及时改道。今天多数系统做不到这一点。

## 工具脚手架、test-time compute 和训练分布会一起塑造这个问题

论文进一步指出，environmental curiosity 会受三类因素影响：工具脚手架、test-time compute、训练分布。这个结论很有意思，因为它再次说明 agent 行为不是模型单变量。你给什么工具、让它想多久、拿什么任务分布去后训练，都会改变它在环境里是“灵活观察者”还是“顽固执行器”。

这点和很多团队的直觉正好相反。很多人以为加更多工具、做更窄的任务微调一定会更好。但论文显示，工具结构和训练分布也可能让 agent 更容易沿着熟悉路线机械前进，反而减少对意外信息的利用。换句话说，系统越像流水线，可能越不擅长在现场重新判断。

## 为什么这对代码代理和企业 agent 特别重要

Terminal-Bench 的 GitHub 仓库把自己定义成“a benchmark for LLMs on complicated tasks in the terminal”。这类 benchmark 的价值，不是拿来做榜单消费，而是提醒我们：真实工作不像填空题。它是在复杂终端环境、文档、文件和命令之间来回切换。agent 能不能把环境当成动态信息源，而不是静态背景，决定了它是会做事还是只会跑套路。

对企业来说，这篇论文最大的价值是重新定义评测重点。你不能只看成功率，还要看 agent 是否会在关键观测出现后停下来修正计划。否则系统上线后就会出现一种很危险的错觉：明明工具、文档和答案都在环境里，agent 却一次次绕远路，消耗 token 和工时，只因为它没有把新观测写回自己的执行逻辑。

## 来源与延伸阅读

今日论文线索来自 AI 论文简报与其 RSS： https://ai-brief.liziran.com/zh/ 和 https://ai-brief.liziran.com/zh/feed.xml 。它们仅作为选题雷达使用。

主要核验来源包括 arXiv 论文页面《Agents Explore but Agents Ignore: LLMs Lack Environmental Curiosity》： https://arxiv.org/abs/2604.17609 ，以及 Terminal-Bench 官方 GitHub 仓库： https://github.com/harbor-framework/terminal-bench 。本文关于 discovery / interaction 缺口、Terminal-Bench 与 AppWorld 的实验设定、以及 benchmark 对复杂终端任务的意义，均来自论文摘要与官方仓库描述。

## 来源链接

- https://ai-brief.liziran.com/zh/
- https://ai-brief.liziran.com/zh/feed.xml
- https://arxiv.org/abs/2604.17609
- https://github.com/harbor-framework/terminal-bench
