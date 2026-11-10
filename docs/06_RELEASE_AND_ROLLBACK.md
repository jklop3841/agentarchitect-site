# 06 上线与回滚说明

适用于分支 `feat/platform-v1.0`（PR #13）。编号 05 留给国内站部署文档，本轮按卢成决定不做。

## 1. 这次上线改了什么

| 类别 | 内容 | 对现有功能的影响 |
|---|---|---|
| 新增页面 | `/tools`、`/tools/{fileproof,imageproof,claimcheck}`、`/admin/tools` | 无 |
| 新增接口 | `/api/v1/tools`、`/api/v1/tools/{id}`、`/tools/{id}/skill.md` | 无 |
| MCP | `/mcp` 增加 3 个工具，服务版本 0.3.0 → 0.4.0 | 原 7 个工具不变 |
| 发现文件 | `agents.txt`、`llms.txt`、`skill.md`、`agent.json`、Agent Card 描述、OpenAPI、sitemap | 只增不减 |
| 导航 | 顶部导航多一项「工具 Tools」 | 所有页面可见 |
| 修复 | 访问日志改用现行密钥 | 上线后 `agent_visits` 表开始有数据 |
| 依赖 | 新增 `exifr`、`@contentauth/c2pa-node`（约 50 MB 原生模块）、开发依赖 `ajv` | 函数包体变大 |
| 数据库 | 新增迁移文件，**代码不依赖它**：表不存在时只是不记用量 | 无 |

没有改动：协作网络的任何接口和数据表、登录、A2A、内容页、旧 `/v1/run` 接口。

## 2. 上线前检查（已在预览部署上完成的部分）

预览部署（提交 `7261c48`）实测结果：

| 检查 | 结果 |
|---|---|
| Vercel 构建 | 成功 |
| C2PA 原生库在 Vercel 函数内加载 | 成功（`/api/v1/status` → `content_credentials_validator: "c2pa-node"`） |
| `scripts/tools-smoke.py` 32 项 | 全部通过，含真实 URL 抓取和 7 个私网目标被拒 |

预览环境没有后端数据库密钥，所以预览上**没有验证**：数据库计数的限额、用量写入。这两项的逻辑由自动化测试用内存替身覆盖。

## 3. 上线步骤（需卢成操作）

按顺序做。第 1、2 步不影响线上，可以提前做。

**第 1 步：配置环境变量**（Vercel → 项目 → Settings → Environment Variables，Production）

| 变量 | 填什么 | 必要性 |
|---|---|---|
| `TOOLS_FETCH_DENY_HOSTS` | 私有运维域名，多个用英文逗号分隔。只填在这里，不要写进仓库或文档 | **强烈建议上线前配** |
| `INTERNAL_TEST_TOKEN` | 一串随机字符 | 建议 |
| `C2PA_TRUST_ANCHORS_PEM` | 你决定信任的 C2PA 签名者证书（PEM 文本） | 可选；不配则永远不出现「已验证来源」 |

**第 2 步：应用数据库迁移**

Supabase 控制台 → SQL Editor → 粘贴 `supabase/migrations/20261110000000_tools_platform_v1_0.sql` 全文 → Run。
这个文件只建一张新表、一个函数、一个视图，不改任何已有对象，可以重复执行。

**第 3 步：合并**

把 PR #13 从草稿改为就绪并合并到 `main`。Vercel 会自动部署生产。
合并会同时触发 `publish-mcp-registry` 工作流（因为 `server.json` 变了），把官方 MCP Registry 里的描述更新为新版本。这是对外动作，请知悉。

**第 4 步：上线后验证**（约 2 分钟）

```bash
# 状态：tools.content_credentials_validator 应为 "c2pa-node"
curl -s https://www.agentarchitect.me/api/v1/status

# 全套冒烟（32 项）
AA_INTERNAL_TEST_TOKEN=<第1步设的值> python3 scripts/tools-smoke.py https://www.agentarchitect.me tests/fixtures/c2pa
```

然后浏览器打开 `/tools`，三个工具各试一次；再打开 `/admin/tools` 确认刚才的调用被记成 `internal_test`。

## 4. 回滚

| 情况 | 做法 | 耗时 |
|---|---|---|
| 新功能有问题，要整体撤回 | Vercel → Deployments → 找到上一个生产部署（提交 `10e7d47`）→ Promote to Production | 约 1 分钟 |
| 只想关掉按 URL 抓取 | 设环境变量 `TOOLS_REMOTE_FETCH=off`，重新部署 | 约 2 分钟 |
| 只想关掉 C2PA 原生库 | 设 `TOOLS_C2PA=off`，重新部署。ImageProof 退回「仅检测是否存在」 | 约 2 分钟 |
| 调用量异常 | 调小 `TOOLS_COMPUTE_GLOBAL_PER_DAY` / `TOOLS_REMOTE_GLOBAL_PER_DAY`，重新部署 | 约 2 分钟 |
| 代码层面撤回 | 在 GitHub 上 Revert 这个 PR 的合并提交 | 约 5 分钟 |

数据库不需要回滚：新表独立存在，旧代码不读它。确实要删的话，在 SQL Editor 执行 `drop view public.tool_usage_weekly; drop function public.aa_purge_tool_usage(integer); drop table public.tool_usage;`（会丢失已记录的用量）。

MCP Registry 的描述不会随 Vercel 回滚而恢复；需要的话把 `server.json` 改回去再合并一次。

## 5. 上线后的日常

- **看数**：`/admin/tools`（工具调用，按来源分类）和 `/admin/visits`（访问日志）。
- **清理**：`tool_usage` 保留 90 天，需要定期执行 `select public.aa_purge_tool_usage();`。Supabase 里可以用 pg_cron 每天跑一次，和已有的 `aa_purge_old_rows()` 放一起。目前没有自动任务，需要卢成决定是否启用。
- **依赖更新**：`@contentauth/c2pa-node` 和 `exifr` 版本已锁定。升级前先跑 `npm test`，里面有真实 C2PA 样本的校验。

## 6. 区域配置（国内站预留）

`src/lib/region.ts` 提供一个开关 `NEXT_PUBLIC_SITE_REGION`（`global` 默认 / `cn`）。目前它只影响工具页的默认语言。国内站没有部署，也没有任何国内专用的服务接入。

将来做国内站时要补的事（不在本轮）：

1. 备案完成后，把备案号配进 `NEXT_PUBLIC_ICP_NUMBER`，并在页脚显示。
2. 独立的数据库和部署环境，不做跨境实时代理。
3. `next.config.ts` 里写死的全球站域名跳转改成按区域配置。
4. 远程抓取在国内是否开启，单独决定。
5. 确认国内站服务器与私有运维设施物理分开。
