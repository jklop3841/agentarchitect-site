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
