# 多平台同步发布发现记录

## 2026-04-20：账号矩阵读取结果

来源文件：`C:\Users\97566\Desktop\自媒体平台账号矩阵管理表.xlsx`

读取到 15 个平台：

- 微信公众号
- 头条号
- 百家号
- 知乎
- 企鹅号
- 微博
- 搜狐号
- CSDN
- 腾讯开发者社区
- 阿里云开发者社区
- 稀土掘金
- SegmentFault
- 博客园
- 豆丁网
- 电子发烧友

## 自动化分级

### A 级

优先接入：

- 头条号
- 百家号
- 知乎
- 搜狐号
- CSDN

原因：

- URL 和发布后台明确。
- 本地已有 `media-auto-publisher` 或 `toutiao-publisher` 技能基础。
- 对搜索、技术社区或内容分发价值较高。

### B 级

需要新增 adapter：

- 企鹅号
- 微博
- CSDN
- 腾讯开发者社区
- 阿里云开发者社区
- 稀土掘金
- SegmentFault
- 博客园
- 微信公众号（跳过第一批，后续专项）

原因：

- 发布后台明确，但没有现成完整发布脚本。
- 需要逐个平台确认编辑器选择器、标签入口和发布流程。

### C 级

不建议第一批每日自动发：

- 豆丁网
- 电子发烧友

原因：

- 豆丁更像文档上传平台。
- 电子发烧友与智能体架构主题匹配度较弱。

## 现有工具限制

- `media-auto-publisher` 支持平台导航、Cookie 管理和流程生成，但不等于完整自动填充发布器。
- `toutiao-publisher` 有更完整的自动发布脚本，但当前本机虚拟环境缺 `patchright`。
- Node 环境没有 `playwright` 包。
- 微信、头条、百家、知乎等平台可能触发扫码、验证码或风控。

## 架构判断

同一套内容生成管线可以统一，但发布层必须做平台 adapter。

正确路线：

1. 主站文章发布。
2. 生成平台分发稿。
3. 每个平台 adapter 分发。
4. 每个平台独立日志。
5. 失败不影响主站。

## 待验证

- `toutiao-publisher` 是否能通过安装依赖恢复。
- `media-auto-publisher` 的 Cookie 存储位置是否适合复用。
- 各平台是否允许当前账号长期保持登录态。
- 各平台是否支持纯文本/Markdown 粘贴保持格式。

## 2026-04-20：跳过公众号，CSDN 替代进入第一批

用户要求“换一下一个网站，跳过公众号”。

调整：

- 微信公众号从第一批自动化中移除，状态改为 `skip-first-stage-manual-only`。
- CSDN 从 B 级提升到 A 级，作为第一批替代平台。

理由：

- 公众号排版、封面、摘要、群发、风控和私域运营复杂度更高，不适合当前阶段直接自动化。
- CSDN 更适合技术文章、MCP、GitHub 证据层、代码代理和智能体架构内容。
- CSDN 对搜索/技术读者/GEO 的价值更直接，适合先做草稿模式。

## 2026-04-20：头条发布环境依赖安装失败

尝试命令：

```powershell
C:\Users\97566\.agents\skills\toutiao-publisher\.venv\Scripts\python.exe -m pip install -r C:\Users\97566\.agents\skills\toutiao-publisher\requirements.txt
```

结果：

- `requirements.txt` 需要 `patchright==1.55.2` 和 `python-dotenv==1.0.0`。
- 安装失败原因是访问 `https://pypi.org/simple/patchright/` 时 SSL 连接异常：`SSLEOFError: UNEXPECTED_EOF_WHILE_READING`。
- 当前不能判断为依赖不存在，更像本机/网络/PyPI TLS 通道问题。

复用建议：

- 后续重试可先升级 pip 证书链，或切换镜像源。
- 头条 adapter 的实现可先继续设计 schema，不阻塞内容分发稿生成。

## 2026-04-20：头条发布环境依赖修复成功

默认 PyPI 和清华 HTTPS 镜像均因为 SSL EOF 失败。HTTP 镜像能访问但未列出 `patchright` 包版本。

最终有效路径：

1. 用 PyPI JSON API 获取 `patchright==1.55.2` 的 Windows x86-64 wheel 直链。
2. 直接通过 wheel URL 安装。

成功命令：

```powershell
C:\Users\97566\.agents\skills\toutiao-publisher\.venv\Scripts\python.exe -m pip install https://files.pythonhosted.org/packages/19/06/57ecc1bce388bdb970141aedb45ebc6f91e3914e0fb92d4a8aa1535c8ca4/patchright-1.55.2-py3-none-win_amd64.whl --trusted-host files.pythonhosted.org --trusted-host pypi.org
```

验证：

- `import patchright` 成功。
- `auth_manager.py status` 可运行，当前显示 `Authenticated: No`。
- `publisher.py --help` 可运行，支持 `--title`、`--content`、`--cover`、`--dry-run`、`--headless`、`--no-cover`、`--raw`。

复用建议：

- 如果 pip 索引被 SSL/网络阻断，可用 PyPI JSON API 获取 wheel URL 后直装。
- 下一步需要人工扫码登录一次，生成 `data/browser_state/state.json`。

## 2026-04-20：平台分发稿生成器完成

新增脚本：`scripts/social_distribution.py`

用途：

- 从标准文章 JSON 生成平台分发稿 JSON。
- 自动补齐 `GEO` 标签。
- 输出 `default`、`technical`、`general` 三种正文变体。
- 生成 `publishTargets`，默认使用 `draft` 模式。
- 统计正文长度，并对低于 `900` 字或高于 `1500` 字的内容生成 `validationWarnings`。

验证：

- 用临时 JSON 输入跑通脚本。
- 输出 JSON 通过 `python -m json.tool` 校验。
- 临时短文样例触发了 `distribution.body is below target length` 警告，说明字数防线生效。

复用建议：

- 每日文章自动化应先生成完整主站文章，再生成平台分发稿。
- 分发稿不足 900 字时不应进入自动发布，应回到改写步骤扩展内容。
- `technical` 变体适合 CSDN、掘金、开发者社区；`general` 变体适合头条、百家、搜狐、公众号。

## 2026-04-20：头条 Edge 登录态保存成功

Chrome 通道登录流程曾经超时，脚本没有检测到登录跳转。

有效路径：

- 使用 Edge (`msedge`) 通道。
- 使用独立持久 profile：`C:\Users\97566\.agents\skills\toutiao-publisher\data\browser_state\edge_profile`。
- 不再只依赖跳转检测，而是每 5 秒保存一次 `storage_state`。
- 用户登录后页面停在 `https://mp.toutiao.com/profile_v4/graphic/publish`。
- 最终 `state.json` 成功保存到：`C:\Users\97566\.agents\skills\toutiao-publisher\data\browser_state\state.json`。

验证：

```powershell
C:\Users\97566\.agents\skills\toutiao-publisher\.venv\Scripts\python.exe C:\Users\97566\.agents\skills\toutiao-publisher\scripts\run.py auth_manager.py status
```

结果：

- `Authenticated: Yes`
- `State age: 0.0 hours`
- `Last auth: 2026-04-20 13:00:02`

复用建议：

- 头条登录优先使用 Edge 通道。
- 站点不稳定跳转时，用周期性保存 storage state 比等待固定 URL 更稳。
- 登录态文件在技能目录，不写入仓库。

## 2026-04-20：头条 dry-run 第一次失败原因

测试命令：

```powershell
C:\Users\97566\.agents\skills\toutiao-publisher\.venv\Scripts\python.exe C:\Users\97566\.agents\skills\toutiao-publisher\scripts\run.py publisher.py --title "Agent内容分发不是群发" --content "D:\websit\tmp\social-tests\toutiao-dry-run.md" --dry-run --no-cover
```

结果：

- 登录态有效，成功进入 `https://mp.toutiao.com/profile_v4/graphic/publish`。
- 没有点击最终发布。
- 标题未填入：脚本找不到标题输入框。
- 正文未填入：脚本没有找到 `.ProseMirror` 编辑器。
- 选择无封面失败：`ai-assistant-drawer` 的 `.byte-drawer-mask` 遮罩拦截点击。

判断：

- 这是页面 UI/选择器问题，不是登录态问题。
- 头条页面打开后可能默认弹出 AI assistant drawer，必须先移除完整 drawer wrapper，而不只是 mask。

复用建议：

- 在头条脚本里更早执行遮罩清理。
- 需要清理的选择器包括 `.ai-assistant-drawer`、`.byte-drawer-wrapper`、`.byte-drawer-mask`、`.byte-modal-mask`。
- 清理后再定位标题和正文编辑器。

## 2026-04-20：头条 dry-run 第二次成功

新增诊断脚本：

- `scripts/toutiao_dry_run_probe.py`

用途：

- 使用 Edge 登录态进入头条发布页。
- 移除 AI assistant drawer 遮罩。
- 导出 `textarea`、`input`、`contenteditable`、button 候选。
- 保存截图和候选 JSON 到 `tmp/social-tests/`。

诊断结果：

- 标题框：`textarea[placeholder*="文章标题"]`，placeholder 为 `请输入文章标题（2～30个字）`。
- 正文编辑器：`.ProseMirror`，`contenteditable="true"`。
- 发布按钮存在，但 dry-run 不点击。

新增草稿填充脚本：

- `scripts/toutiao_draft_fill.py`

第二次 dry-run 结果：

```json
{
  "url": "https://mp.toutiao.com/profile_v4/graphic/publish",
  "titleFilled": true,
  "bodyFilled": true,
  "noCoverSelected": true,
  "published": false
}
```

截图确认标题、正文、无封面设置成功。

复用建议：

- 头条草稿模式优先使用 `scripts/toutiao_draft_fill.py`，不要直接复用旧 publisher 的选择器。
- 继续保持 `published: false`，直到 3-7 天草稿模式稳定。
