# 多平台同步发布进度

## 2026-04-20

### 已完成

- 读取 `自媒体平台账号矩阵管理表.xlsx`。
- 确认表内共有 15 个平台。
- 读取 `media-auto-publisher` 技能，确认支持百家号、搜狐号、知乎、微信公众号、小红书、抖音号的导航与 Cookie 管理。
- 读取 `toutiao-publisher` 技能，确认头条号有专用发布脚本。
- 检查本地环境：
  - Node 版 Playwright 不存在。
  - `toutiao-publisher` 虚拟环境缺 `patchright`。
- 新增 `docs/social-publishing-matrix.md`。
- 新增 `docs/social-publishing-accounts.json`。
- 新增本计划文件、发现文件和进度文件。

### 验证

- `docs/social-publishing-accounts.json` 已通过 `python -m json.tool` 校验。

### 下一步

1. 修复 `toutiao-publisher` 依赖。
2. 尝试头条号登录状态检测。
3. 设计统一平台分发稿 JSON schema。
4. 将每日文章自动化输出扩展为主站版 + 平台分发版。

### Phase 2 尝试：头条依赖修复

- 操作：运行 `pip install -r C:\Users\97566\.agents\skills\toutiao-publisher\requirements.txt`。
- 结果：失败。
- 原因：PyPI SSL 连接异常，无法获取 `patchright`。
- 处理：已记录到 `findings.md`，暂不重复同一路径；先推进平台分发稿 schema。

### Phase 2 完成：头条依赖修复

- 操作：通过 PyPI JSON API 获取 `patchright==1.55.2` Windows wheel 直链并安装。
- 结果：成功。
- 验证：
  - `import patchright` 成功。
  - `auth_manager.py status` 成功运行，当前未登录。
  - `publisher.py --help` 成功运行，确认发布脚本支持 dry-run 和 headless 参数。
- 下一步：需要用户配合执行头条扫码登录 setup，生成持久登录态。

### Phase 2 完成：通用 Cookie 管理器验证

- 操作：
  - 运行 `cookie_manager.py list`。
  - 运行 `media_publisher.py info zhihu`。
  - 运行 `media_publisher.py workflow zhihu --format json`。
  - 用临时 Cookie 文件测试 `add/export/delete`。
- 结果：
  - 当前没有已保存真实账号 Cookie。
  - 知乎平台信息和发布工作流可以正常生成。
  - 临时 Cookie 写入、导出、删除成功。
  - 删除后账号列表为空，未留下测试账号。

### Phase 3 完成：分发稿 schema + 生成器

- 新增：`docs/social-publishing-distribution-schema.md`。
- 新增：`scripts/social_distribution.py`。
- 验证：
  - 临时文章 JSON 输入成功生成分发稿。
  - 输出 JSON 合法。
  - 自动补 `GEO` 标签。
  - 对低于 900 字的分发稿给出 `validationWarnings`。
- 下一步：
  - 将每日文章自动化改为同时产出主站文章和分发稿 JSON。
  - 之后接入头条草稿填充。

### Phase 2 完成：头条 Edge 登录态保存

- 操作：
  - 使用 `msedge` 通道打开头条发布页。
  - 启动 10 分钟周期性 storage state 保存。
  - 用户完成登录后，页面停在 `https://mp.toutiao.com/profile_v4/graphic/publish`。
- 结果：
  - `state.json` 已保存。
  - `auth_manager.py status` 返回 `Authenticated: Yes`。
- 经验：
  - 原脚本只靠 URL 跳转检测不够稳。
  - Edge 通道 + 周期性保存更适合这台机器。
- 下一步：
  - 用当前登录态跑头条 dry-run 草稿填充。

### Phase 4 尝试：头条 dry-run 第一次

- 测试稿：`tmp/social-tests/toutiao-dry-run.md`，约 1063 字符。
- 命令：`publisher.py --title "Agent内容分发不是群发" --content "D:\websit\tmp\social-tests\toutiao-dry-run.md" --dry-run --no-cover`。
- 结果：流程完成且未发布，但标题/正文未成功填入。
- 失败原因：
  - 标题输入框定位失败。
  - `.ProseMirror` 编辑器定位失败。
  - AI assistant drawer 遮罩拦截无封面点击。
- 下一步：
  - 加强头条脚本遮罩清理。
  - 重新识别标题/正文选择器。
  - 再跑 dry-run。

### Phase 4 完成：头条 dry-run 草稿填充

- 新增诊断脚本：`scripts/toutiao_dry_run_probe.py`。
- 新增草稿填充脚本：`scripts/toutiao_draft_fill.py`。
- 第二次 dry-run 结果：
  - `titleFilled: true`
  - `bodyFilled: true`
  - `noCoverSelected: true`
  - `published: false`
- 截图：`tmp/social-tests/toutiao-draft-fill.png`。
- 结论：头条号已具备自动填草稿能力，暂不自动发布。
