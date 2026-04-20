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

- 微信公众号
- 头条号
- 百家号
- 知乎
- 搜狐号

原因：

- URL 和发布后台明确。
- 本地已有 `media-auto-publisher` 或 `toutiao-publisher` 技能基础。
- 对搜索、私域或内容分发价值较高。

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
