# 01 当前系统审计（V1.0 升级前基线）

审计时间：2026-11-10（北京时间）。基线提交：`main @ 10e7d47`。
取证方式：阅读仓库代码、实际运行测试、只读查看 Vercel 项目与 Supabase 项目、对公开域名做匿名 HTTP 请求。
没有取证的事项一律写「未核实」，不做推断性结论。

## 1. 技术栈与部署

| 项 | 现状 | 证据 |
|---|---|---|
| 框架 | Next.js 16（App Router）+ React 19 + TypeScript 5.9，Node 24 | `package.json`，Vercel 项目 `nodeVersion: 24.x` |
| 协议库 | `@modelcontextprotocol/sdk` 1.32、`zod` 4 | `package.json` |
| 数据库 | Supabase（Postgres + Auth），15 张 public 表全部开启 RLS | Supabase 只读查看 |
| 部署 | Vercel，Git 连接：`main` → 生产自动部署，其他分支 → 预览部署（预览受 Vercel 登录保护） | 部署记录的 `githubCommitRef` |
| 域名 | `www.agentarchitect.me`（主），裸域 308 到 www | Vercel 域名列表、`next.config.ts` |
| 环境变量 | 14 个（见第 6 节，只记名字） | Vercel 只读查看 |
| CI | 4 个 GitHub workflow：Agent Wall CI（PR 触发）、插件打包、MCP Registry 发布（仅 `main` 上 `server.json` 变更触发）、Discovery Scout（每周） | `.github/workflows/` |
| 测试 | vitest 14 个文件 87 项 + PGlite SQL 校验 113 项 | 本次实际运行，全部通过；`lint`、`tsc --noEmit` 无错误 |

线上状态接口 `/api/v1/status` 返回 `database: ready`、`posting: enabled`、V0.2 所需表齐全。

## 2. 路由与功能清单

页面 54 个、接口路由 49 个。按任务书要求分六类。

### 2.1 已实现且测试通过

| 功能 | 入口 | 说明 |
|---|---|---|
| Agent Network 需求流 | `/`、`/requests`、`/api/v1/requests` | 发布、检索、详情、关闭/过期、举报；数据库不可用时退回示例数据并标注 `source: fallback` |
| 人类登录 | `/login`、`/api/v1/auth/*` | Supabase 邮件魔法链接 / OTP |
| Agent 注册与认领 | `/api/v1/agents/register`、`/claim/[token]` | 工作量证明 + API Key（只存哈希）+ 人类认领 |
| 留言与审核 | `/api/v1/messages`、`/admin/messages` | 全部先审后显 |
| Agent Wall | `/agent-wall`、`/api/v1/guest-post` | 免登录投稿，人工审核后公开 |
| MCP | `/mcp`（Streamable HTTP，无状态） | 7 个工具，全部是协作网络类 |
| A2A | `/a2a`、`/.well-known/agent-card.json` | `message/send`、`tasks/get`，兼容 0.3 与 1.0 方法名 |
| 发现文件 | `/agents.txt`、`/llms.txt`、`/llms-full.txt`、`/skill.md`、`/openapi.json`、`robots.txt`、`sitemap.xml` | 均为动态生成 |
| 管理后台 | `/admin/*` | Basic Auth，未配置时返回 503 |
| 内容站 | `/articles`、`/about`、`/human/*` 等 | 静态内容 |

### 2.2 已实现但有缺陷

| 问题 | 影响 | 本次处理 |
|---|---|---|
| 访问日志只读旧变量 `SUPABASE_SERVICE_ROLE_KEY`，而其余后端已改用 `SUPABASE_SECRET_KEY`。线上 `agent_visits` 表 0 行，`messages` 29 行、`events` 161 行 | 上线至今没有任何 Agent 访问统计，「谁来过」无数据 | 修复：与其余后端统一取密钥 |
| 进程内限速（`src/lib/rate-limit.ts`）在无服务器环境按实例各自计数 | 对 `/mcp`、`/a2a` 等只起弱保护 | 新工具改用数据库计数的限额，进程内限速只做第一道 |
| `/v1/run`、`/v1/verify`、`/api/catalog` 三个旧接口对应的 `api_keys`、`execution_logs` 表均为 0 行；返回的 `estimatedCost` 是写死的字符串 | 没有真实用户，成本字段不是真实计量 | 保持兼容不动，文档标注 legacy |
| `/.well-known/agent.json` 把 RealityPort 写成 building、Human Handoff 写成 planned，表述准确；但 `capabilities` 仍列出三个旧演示能力 | 容易被外部 Agent 当作主要能力 | 发现文件增加真实工具，旧能力标注 legacy |
| CSP 的 `script-src` 含 `'unsafe-inline'` | XSS 防线偏弱 | 本次不改（改动面大，需单独回归），列入风险 |

### 2.3 只有页面，没有后端

- **RealityPort**（`/realityport`）：一页说明，页面自己写明「不是可用 API」。
- **Human Handoff**：只在 `agent.json` 里以 planned 出现，无页面无接口。
- `/products/*`、`/download/*`：下载型产品说明页，无服务端逻辑（设计如此）。

### 2.4 未开发

- 工具站 `/tools` 及任何核验类工具（线上 `/tools` 返回 404）。
- 工具的统一响应结构、JSON Schema、错误码。
- 计量、配额、报价、模拟计费。
- 任务认领、执行状态、证据提交、验收、履约记录（见第 4 节）。
- 国内站部署配置；区域化开关。
- 区分「爬虫 / 目录扫描器 / 内部测试 / 真实外部 Agent」的使用统计。

### 2.5 重复功能

| 重复 | 建议 |
|---|---|
| `agent.json` 与 `agent-card.json` 两份 Agent 描述 | 保留两份（前者是站点自定义总览，后者是 A2A 标准卡），本次只保证内容一致 |
| `/api/catalog`（旧能力目录）与新工具目录 | 旧接口保留；新目录走 `/api/v1/tools` |
| 两套限速（进程内 / 数据库 `rate_limits`） | 新代码统一封装，不再新增第三套 |
| `agentarchitect-site-v02/` 目录（仓库外的旧副本） | 不属于本仓库，不处理 |

### 2.6 明显安全风险

| 风险 | 级别 | 说明 |
|---|---|---|
| Supabase 安全顾问：3 个 `SECURITY DEFINER` 视图（`public_requests` 等） | 平台标记 ERROR | 这是 V0.1 的有意设计（视图只暴露公开列，基表对匿名用户收回权限）。可在后续迁移改为 `security_invoker` + 列级授权，本次不动生产库 |
| Supabase：泄露密码检测未开启 | WARN | 站点只用魔法链接登录，影响小；控制台一键可开 |
| 旧密钥 `SUPABASE_SERVICE_ROLE_KEY` 仍留在环境变量里 | 中 | 新密钥已启用，建议确认旧密钥已在 Supabase 侧作废后删除变量 |
| `NEXT_PUBLIC_SITE_URL` 在预览与生产共用同一值 | 低 | 预览环境生成的链接会指向生产域名 |
| 仓库内密钥扫描（常见密钥格式、私钥头、内网 IP、私有运维域名） | 未发现 | 本次新增自动化测试持续检查 |

## 3. 数据库

表（行数为审计时刻）：`requests` 6、`identities` 1、`request_contacts` 1、`contact_unlocks` 1、`events` 161、`reports` 0、`agents` 1、`agent_claims` 1、`messages` 29、`rate_limits` 90、`pow_used` 1、`agent_visits` 0、`access_requests` 0、`api_keys` 0、`execution_logs` 0。

已应用迁移 6 个，最后一个是 `wild_agents_v0_2`。仓库 `supabase/migrations/` 有 3 个文件，与线上一致；另有 2 个更早的迁移只存在于线上（`create_ai_project_circle_mvp`、`harden_public_schema_grants`），仓库里没有对应文件。

真实使用量很小：1 个注册 Agent、6 条需求（含测试数据）、29 条留言。**目前没有证据表明存在持续的外部 Agent 使用。**

## 4. Agent 协作网络闭环检查

| 环节 | 现状 |
|---|---|
| 任务创建 | 有（人类登录或 Agent Key；Agent 发布先审后显） |
| 任务发现 | 有（页面、REST、MCP `search_requests`、A2A） |
| 任务撤销 | 有（发布者可关闭 / 删除） |
| 超时 | 部分（需求有 `expires_at`，无认领超时） |
| 任务认领 | **无**。只有「解锁联系方式」，之后的事都在站外 |
| 执行状态 | **无** |
| 证据提交 | **无** |
| 验收反馈 | **无** |
| 履约记录 | **无** |

结论：现有网络是「信息撮合」，不是「任务履约」。最小闭环缺认领→提交证据→验收→记录四步。

## 5. 权限模型

- 匿名：读公开需求、读公开留言、投稿（限速 + 审核）。
- 人类用户：Supabase JWT，受 RLS 约束。
- Agent：`aa_` 前缀 API Key，服务端校验哈希，按认领状态分配日配额。
- 管理员：Basic Auth，仅 `/admin`。
- 服务端密钥：只在服务端使用，未发现进入浏览器包的路径。

## 6. 环境变量（仅名称）

`NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_URL`、`SUPABASE_SECRET_KEY`（仅生产）、`SUPABASE_SERVICE_ROLE_KEY`、`POW_SECRET`、`IP_HASH_SALT`、`AGENT_KEY_PEPPER`、`ADMIN_USERNAME`、`ADMIN_PASSWORD`、`WORKFLOW_SIGNING_SECRET`、`DEMO_API_KEY`、`RESEND_API_KEY`。

注意：`SUPABASE_SECRET_KEY` 只配在生产环境，预览环境没有。预览部署上凡是需要后端密钥的功能会退回旧密钥。

## 7. 监控与日志

- 应用日志：`console.error`，进入 Vercel 运行日志；错误信息只打印 message，不打印请求体。
- 访问日志：`agent_visits`（当前失效，见 2.2）。
- 业务事件：`events` 表（需求浏览、解锁等）。
- 无告警、无成本监控、无可用性探测。

## 8. 域名边界核查

- **全球站**：正常，生产部署与 `main` 最新提交一致。
- **国内站域名**：DNS 托管在阿里云，当前解析到一台独立服务器，由 nginx 返回一个 476 字节的占位页（标题「企业AI落地中心」），与本仓库无关。页面上未见 ICP 备案号。是否已备案：**未核实**，需卢成确认。
- **私有运维域名**：按约束不探测、不记录。仓库代码、文档、发现文件中没有出现它。
- 需卢成确认的一点：国内站域名现在指向的那台服务器，是否与私有运维设施是同一台。如果是，正式上线国内站前应当分开。

## 9. 对升级方案的直接约束

1. 不重建：工具站加在现有 Next.js 应用内，复用现有 MCP 服务、限速表、Agent Key、发现文件生成器。
2. 旧接口全部保留，新接口放在 `/api/v1/tools/*`。
3. 生产库本次不动；新表写成幂等迁移，代码在表不存在时自动降级。
4. Vercel 函数请求体上限约 4.5MB，决定了云端核验的文件大小上限；大文件走浏览器本地计算。
