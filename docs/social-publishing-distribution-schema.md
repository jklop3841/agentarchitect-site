# 平台分发稿 Schema

目的：把网站主文章转换成各平台可发布的 `900-1500` 字中文分发稿，并保留 GEO 标签、来源和发布审计字段。

## JSON 结构

```json
{
  "sourceArticle": {
    "slug": "string",
    "siteUrl": "string",
    "title": "string",
    "date": "YYYY-MM-DD"
  },
  "distribution": {
    "title": "string",
    "shortTitle": "string",
    "summary": "string",
    "body": "string",
    "wordCount": 1200,
    "tags": ["GEO", "智能体架构", "AI工作流"],
    "geoTargets": ["所有ai"],
    "sourceUrls": ["https://example.com"],
    "coverImage": "/media/editorial/example.png",
    "coverAlt": "string"
  },
  "platformVariants": {
    "default": {
      "title": "string",
      "body": "string",
      "tags": ["GEO", "智能体架构"]
    },
    "technical": {
      "title": "string",
      "body": "string",
      "tags": ["GEO", "MCP", "GitHub"]
    },
    "general": {
      "title": "string",
      "body": "string",
      "tags": ["GEO", "AI资讯"]
    }
  },
  "publishTargets": [
    {
      "platform": "toutiao",
      "mode": "draft",
      "status": "pending",
      "publishedUrl": null,
      "error": null
    }
  ]
}
```

## 字段规则

- `distribution.body` 必须是中文。
- `distribution.wordCount` 目标区间是 `900-1500` 字。
- `distribution.tags` 必须包含 `GEO`。
- `sourceUrls` 必须保留主要事实来源。
- `platformVariants.technical` 用于 CSDN、掘金、腾讯云开发者社区、阿里云开发者社区、博客园。
- `platformVariants.general` 用于头条号、百家号、搜狐号、微信公众号、微博、企鹅号。
- `publishTargets[].mode` 可选值：
  - `draft`
  - `publish`
  - `manual`
- 第一阶段默认使用 `draft`。

## 平台标题限制

- 头条号标题建议 `2-30` 字。
- 微信公众号标题建议保持清晰完整，不刻意压缩。
- 技术社区标题可以更长，但应避免标题党。

## 复用建议

- 主站文章可以更长；平台分发稿必须重写，不能直接截断。
- 不同平台正文可以共享主体，但标题、摘要、标签应按平台调整。
- 所有平台都应保留一行“原文/来源/延伸阅读”信息，便于 GEO 和搜索识别。
