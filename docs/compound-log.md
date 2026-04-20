# Compound Log

## 2026-04-20：多平台同步发布自动化启动

- 任务：把每日网站文章扩展为自媒体平台同步发布管线。
- 产物：
  - `task_plan.md`
  - `findings.md`
  - `progress.md`
  - `docs/social-publishing-matrix.md`
  - `docs/social-publishing-accounts.json`
- 关键发现：
  - 平台发布不能做成单一脚本横扫所有平台，必须平台 adapter 化。
  - 第一批建议聚焦：网站、头条号、百家号、知乎、搜狐号、微信公众号。
  - 头条号已有专用技能，但当前本机缺 `patchright`。
  - 通用自媒体技能偏导航和 Cookie 管理，还需要补自动填充发布能力。
- 下一步：修复头条发布环境，并建立平台分发稿 schema。

## 2026-04-20：头条依赖安装被 PyPI SSL 阻断

- 尝试安装 `toutiao-publisher` 依赖时，`patchright==1.55.2` 无法从 PyPI 拉取。
- 错误类型是 SSL EOF，不应立即判断为包名错误。
- 后续可尝试证书/镜像源方案；当前先推进平台分发稿 schema，避免被单个平台环境阻塞。

## 2026-04-20：头条依赖通过 wheel 直链修复

- PyPI 索引和清华 HTTPS 镜像都被 SSL EOF 阻断。
- HTTP 镜像不报 SSL，但未返回 `patchright` 版本。
- 可复用解法：使用 PyPI JSON API 找到目标 wheel 直链，再 `pip install <wheel-url>`。
- 结果：`patchright` 导入成功，头条发布脚本 help/status 可运行。
- 仍需人工扫码登录一次才能进入发布验证。

## 2026-04-20：平台分发稿生成器落地

- 新增 `scripts/social_distribution.py`，把标准文章 JSON 转成平台分发稿 JSON。
- 生成器只负责内容结构，不负责发布，避免写作层和平台自动化耦合。
- 关键保护：
  - 自动补 `GEO` 标签。
  - 输出 `default` / `technical` / `general` 三种变体。
  - 对不满足 `900-1500` 字的稿件写 `validationWarnings`。
- 复用方式：后续每日文章自动化应在主站文章生成后调用该脚本，分发稿通过后再交给平台 adapter。

## 2026-04-20：头条登录态用 Edge 周期保存方案跑通

- 原 Chrome 通道登录流程超时，未保存 state。
- 改用 Edge (`msedge`) 通道，并每 5 秒保存 `storage_state`。
- 用户完成登录后，最后 URL 为头条发布页：`https://mp.toutiao.com/profile_v4/graphic/publish`。
- `auth_manager.py status` 已确认 `Authenticated: Yes`。
- 复用方式：后续头条认证优先使用 Edge profile + periodic saver，不要只依赖固定 URL 跳转检测。

## 2026-04-20：头条 dry-run 被 AI assistant drawer 遮罩阻断

- 登录态可用，发布页可进入。
- 第一次 dry-run 未发布，但也未成功填入标题/正文。
- 主要阻塞是头条发布页的 `ai-assistant-drawer` 遮罩拦截点击，同时标题/正文选择器需要重新识别。
- 后续修复方向：先移除 `.ai-assistant-drawer` / `.byte-drawer-wrapper` / `.byte-drawer-mask`，再执行字段定位。

## 2026-04-20：头条草稿填充跑通

- 通过 `scripts/toutiao_dry_run_probe.py` 找到稳定选择器：
  - 标题：`textarea[placeholder*="文章标题"]`
  - 正文：`.ProseMirror`
- 通过 `scripts/toutiao_draft_fill.py` 完成 dry-run：
  - 标题填入成功。
  - 正文填入成功。
  - 无封面选择成功。
  - 未发布。
- 复用方式：头条 adapter 应以新脚本为基础，先保持 draft-only。

## 2026-04-20：第一批平台调整，公众号跳过，CSDN 替补

- 用户要求跳过微信公众号。
- 调整原因：公众号发布涉及排版、封面、摘要、群发和风控，当前阶段自动化成本高。
- 替代平台：CSDN。
- 判断：CSDN 更适合智能体架构、MCP、代码代理、GitHub 证据层等技术文章，适合作为第一批草稿模式平台。
