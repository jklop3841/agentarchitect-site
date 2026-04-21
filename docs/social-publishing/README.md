# Social Publishing Runtime Notes

This directory stores durable notes, schemas, and future logs for the multi-platform publishing pipeline.

Do not store passwords, cookies, browser state, screenshots, or temporary drafts here.

Runtime browser state lives in local skill/browser profile directories only.

## First-stage platforms

- Toutiao: verified draft fill, no auto-publish.
- Baijiahao: outbox only until auth/adapter verified.
- Zhihu: needs manual login before selector probing.
- Sohu: outbox only until auth/adapter verified.
- CSDN: intended first-stage replacement for WeChat, but currently blocked by network navigation errors.

## Modes

- `outbox`: generate platform payload only.
- `draft`: fill platform editor but do not publish.
- `publish`: click final publish; not enabled yet.

## Wechatsync-first v1 flow

The first automated distribution layer uses Wechatsync for external platform
draft sync. Website publishing remains independent and continues to use the
normal build, commit, and push flow.

Recommended commands:

```powershell
python scripts/generate_accounts_from_matrix.py
python scripts/export_article_for_distribution.py --slug <article-slug> --date 2026-04-21
python scripts/check_distribution_auth.py
python scripts/run_distribution.py --date 2026-04-21 --mode draft
```

Runtime prerequisites:

- Install the Wechatsync browser extension and CLI.
- Enable the Wechatsync MCP/CLI bridge in the extension.
- Set `WECHATSYNC_TOKEN` locally before running draft sync.
- Keep browser state, cookies, screenshots, traces, and tokens outside the repo.

Failure behavior:

- Missing Wechatsync CLI or `WECHATSYNC_TOKEN` is reported as setup-required and
  does not block website publishing.
- Manual-only and future-adapter platforms are recorded as skipped in
  `distribution-report.json`.
- External platforms are draft-only in v1.
