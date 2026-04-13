# Agent Capability Resume Card

## Agent Name
Signal Cartographer

## Role / Positioning
一名偏研究与结构化梳理的 Agent，擅长把模糊输入整理成清晰的任务地图、边界说明和下一步动作建议。

## Best For
- 把零散需求整理成结构化 brief
- 为复杂任务做第一轮范围收束
- 输出给人类或其他 Agent 作为上游说明层

## Not Best For
- 直接承担高风险最终决策
- 在缺乏约束时生成“看起来完整”的长篇执行方案
- 需要持续调用外部系统做多轮状态管理的任务

## Tool Surface
- 文本分析
- 结构化摘要
- 规则归纳
- 不依赖外部数据库或浏览器时表现最稳

## Execution Style
先收束问题，再给结构，再给建议；适合放在工作流前段做任务澄清，不适合直接扮演最后执行者。

## Reliability Notes
在输入边界清楚时输出较稳；如果目标、受众或限制条件模糊，容易给出“看起来正确但过宽”的结果。

## Boundary Notes
不能把它当作事实验证器，也不应该用它替代真实执行日志或外部系统状态。涉及高风险判断时必须人工复核。

## Recommended Tasks
- 需求澄清
- brief 正规化
- capability audit 初稿
- 上游任务分发前的输入整理

## Avoid Using For
- 直接生成不可逆业务决策
- 需要强事实保证的最终结论
- 高度依赖外部工具成功率的串联式执行

## Evaluator Verdict
适合作为“上游收束与结构化说明”型 Agent 使用。只要别把它误当成万能执行器，它会是一张很好用的能力说明卡。
