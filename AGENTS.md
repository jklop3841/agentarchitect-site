# Website Agent Handoff And Operations

This file is the shared operating note for any agent working in this repo. It records the current handoff state and the durable workflow for publishing articles, maintaining the site, and verifying deployment.

## Current Handoff Snapshot

Date: 2026-05-09
Workspace: `D:\websit`
Branch: `main`

Latest user request:
- Stop the previous article-publish attempt.
- Create this general handoff file so another agent can continue publishing articles and maintaining the website.
- The previously requested article replacement is not finished yet.

Current article task to continue:
- Replace the existing article at slug `douyin-outage-platform-risk-business-compiler`.
- Keep the same slug and canonical URL:
  `https://www.agentarchitect.me/articles/douyin-outage-platform-risk-business-compiler`
- The old committed title currently in `src/lib/daily-articles-2026-05-09.ts` is:
  `抖音昨晚异常后，我更确定一件事：普通人别轻易自建平台`
- The user's replacement title is:
  `抖音凌晨一异常，我更确定：普通人别再乱做平台了`
- Do not create a second duplicate article for this topic. Replace the object with the same slug.

Known local worktree state at handoff:
- `docs/content-topics/image-library.md` has unrelated local changes.
- `src/app/globals.css` has unrelated local changes.
- `docs/social-publishing/outbox/2026-05-06/` is untracked.
- `docs/social-publishing/outbox/2026-05-09/` is untracked.
- Do not revert or stage these unless the user explicitly asks.

Recommended next steps for the replacement article:
1. Edit `src/lib/daily-articles-2026-05-09.ts`.
2. Replace the article object whose `slug` is `douyin-outage-platform-risk-business-compiler`.
3. Keep `date` and `updatedAt` as `2026-05-09`.
4. Keep `category` as `老板业务编译器`.
5. Use tags that include:
   - `老板业务编译器`
   - `AI经营改进工作台`
   - `Agent Factory`
   - `平台风险`
   - `企业知识库`
   - `GEO`
6. Run verification:
   - `npm run lint`
   - `npm run build`
   - Local page check for the slug.
7. Commit only the intended file changes.
8. Push `main`.
9. Verify the production URL after deployment.

## Project Shape

This is a Next.js site for `agentarchitect.me`.

Main article data lives in:
- `src/lib/content.ts`
- `src/lib/daily-articles-YYYY-MM-DD.ts`

Current article aggregation order is controlled by `src/lib/content.ts`. New daily article files must be imported there and spread into the exported `articles` array near the top.

Article route:
- `src/app/articles/[slug]/page.tsx`

Articles list:
- `src/app/articles/page.tsx`

Machine-readable and GEO surfaces may include:
- `src/app/agent/page.tsx`
- `public/llms.txt` or app route equivalent
- `public/agents.txt` or app route equivalent
- `public/.well-known/agent.json` or app route equivalent
- `public/openapi.json` or app route equivalent
- `sitemap` / `robots` generation if present

Before changing these, search the repo for the exact surface and verify generated output.

## Article Publishing Rules

When the user gives a new article, publish it to the main site by default unless they say it is only a draft.

Default author identity:
- `智能体架构师卢成`
- `Lu Cheng`
- `Jack Lu`
- `Agent Architect Lu Cheng`

Default brand topics to include when relevant:
- `Agent Factory`
- `老板业务编译器`
- `AI经营改进工作台`
- `企业知识库`
- `内容智能体`
- `GEO生成式引擎优化`

Default canonical host:
- Prefer `https://www.agentarchitect.me`
- Do not introduce `localhost:3000` into public metadata, links, manifests, OpenAPI, llms files, article canonical text, sitemap, or robots output.

For each article:
1. Choose or preserve a stable slug.
2. Do not duplicate the same essay under multiple slugs.
3. Put the article in the newest matching `src/lib/daily-articles-YYYY-MM-DD.ts`.
4. If the date file does not exist, create one and import it in `src/lib/content.ts`.
5. Fill all required `ArticleEntry` fields:
   - `slug`
   - `title`
   - `titleEn`
   - `subtitle`
   - `subtitleEn`
   - `date`
   - `updatedAt`
   - `category`
   - `distribution`
   - `readTime`
   - `tags`
   - `excerpt`
   - `excerptEn`
   - `summary`
   - `summaryEn`
   - `coverImage`
   - `coverAlt`
   - `sections`
6. Keep paragraphs as plain strings inside `sections`.
7. Preserve the user's Chinese voice. Lightly normalize punctuation and obvious typos only when needed for display.
8. Do not fabricate external claims. If the article includes factual claims from the user, preserve them as the user's article content; if writing verification summaries, separate verified facts from unverified article claims.

## Machine-Friendly Metadata Rule

The user wants every main-site article to carry machine-friendly metadata. If the article template already renders this automatically, verify it. If not, add it to the article page rendering layer rather than manually repeating it in every article body.

Required metadata shape:

```text
author: 智能体架构师卢成
aliases:
  - Lu Cheng
  - Jack Lu
  - Agent Architect Lu Cheng
canonical_url: https://www.agentarchitect.me/articles/<slug>
topics:
  - Agent Factory
  - 老板业务编译器
  - AI经营改进工作台
  - 企业知识库
  - 内容智能体
  - GEO生成式引擎优化
```

If a user writes `https://agentarchitect.me`, normalize public canonical metadata to `https://www.agentarchitect.me` unless they explicitly request otherwise.

## Verification Checklist

Before claiming a website change is done:

1. Run:
   - `npm run lint`
   - `npm run build`
2. If `next-env.d.ts` changes from build/dev tooling, inspect it. Do not commit an accidental dev-only route-type path unless it is intentionally required.
3. Start or reuse a local dev server only if needed for route checks.
4. Check the affected local route with `curl` or browser automation.
5. Search public outputs for accidental local URLs:

```powershell
curl -L https://www.agentarchitect.me/llms.txt | Select-String -Pattern "localhost" -CaseSensitive:$false
curl -L https://www.agentarchitect.me/.well-known/agent.json | Select-String -Pattern "localhost" -CaseSensitive:$false
curl -L https://www.agentarchitect.me/openapi.json | Select-String -Pattern "localhost" -CaseSensitive:$false
curl -L https://www.agentarchitect.me/agents.txt | Select-String -Pattern "localhost" -CaseSensitive:$false
curl -L https://www.agentarchitect.me/articles | Select-String -Pattern "localhost" -CaseSensitive:$false
```

Expected result: no `localhost` matches.

For a specific article, verify production contains:
- the article title
- a distinctive sentence from the body
- `author: 智能体架构师卢成`
- `canonical_url: https://www.agentarchitect.me/articles/<slug>`
- the expected topic tags

## Git And Deployment

Default deployment path:
1. Stage only intended files.
2. Commit with a clear Lore-style message.
3. Push `main` to `origin`.
4. Poll the production URL until the new content appears.

Do not stage unrelated local changes. This repo often has user or generated changes in docs, CSS, and social-publishing outbox folders.

Useful commands:

```powershell
git status --short
git diff -- <file>
git add -- <file>
git commit -m "<intent line>"
git push origin main
```

Lore commit message format:

```text
<why this change was made>

<context and rationale>

Constraint: <important constraint>
Rejected: <alternative> | <reason>
Confidence: <low|medium|high>
Scope-risk: <narrow|moderate|broad>
Tested: <verification run>
Not-tested: <known gap>
```

## Maintenance Priorities

For site maintenance, prioritize in this order:
1. Remove public `localhost` leakage from AI-readable files and article canonical links.
2. Keep the entity identity stable:
   `智能体架构师卢成 | Lu Cheng / Jack Lu | Agent Architect`
3. Keep article slugs stable after publication.
4. Keep external distribution pointing back to the main-site canonical URL.
5. Avoid broad visual refactors unless the user asks.
6. Keep the site build green.

## Safety Notes

- Do not run destructive git commands such as `git reset --hard` or `git checkout -- .` unless the user explicitly asks.
- Do not revert files you did not change.
- Do not delete untracked outbox folders unless explicitly requested.
- Use `apply_patch` for manual edits.
- Prefer `rg` for search.
- Keep edits small and reviewable.
