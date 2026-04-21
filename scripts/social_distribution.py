#!/usr/bin/env python3
"""
Generate social-platform distribution payloads from a normalized article JSON.

This script does not publish anything. It prepares a reusable handoff payload
for platform adapters so publishing can stay separate from writing.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path
from typing import Any


REQUIRED_TAG = "GEO"
MIN_CHARS = 900
MAX_CHARS = 1500


def compact_whitespace(text: str) -> str:
    return re.sub(r"\n{3,}", "\n\n", text.strip())


def chinese_length(text: str) -> int:
    return len(re.sub(r"\s+", "", text))


def truncate_at_paragraph(body: str, max_chars: int = MAX_CHARS) -> str:
    paragraphs = [paragraph.strip() for paragraph in body.split("\n\n") if paragraph.strip()]
    selected: list[str] = []
    total = 0

    for paragraph in paragraphs:
      paragraph_length = chinese_length(paragraph)
      if selected and total + paragraph_length > max_chars:
          break
      selected.append(paragraph)
      total += paragraph_length

    if not selected:
        return body[:max_chars]

    return "\n\n".join(selected)


def ensure_geo_tags(tags: list[str]) -> list[str]:
    normalized = []
    for tag in tags:
        if tag and tag not in normalized:
            normalized.append(tag)

    if REQUIRED_TAG not in normalized:
        normalized.insert(0, REQUIRED_TAG)

    return normalized


def build_variant_body(body: str, summary: str, source_urls: list[str], flavor: str) -> str:
    body = compact_whitespace(body)
    if chinese_length(body) > MAX_CHARS:
        body = truncate_at_paragraph(body)

    if chinese_length(body) < MIN_CHARS:
        body = compact_whitespace(f"{summary}\n\n{body}")

    if source_urls:
        source_line = "延伸阅读：" + " ".join(source_urls[:3])
        with_sources = compact_whitespace(f"{body}\n\n{source_line}")
        if chinese_length(with_sources) <= MAX_CHARS:
            body = with_sources

    if flavor == "technical":
        prefix = "这篇更适合从智能体架构和工程落地角度读。\n\n"
        return truncate_at_paragraph(compact_whitespace(prefix + body))

    if flavor == "general":
        prefix = "这不是普通 AI 热点，而是一个关于系统边界和工作流变化的信号。\n\n"
        return truncate_at_paragraph(compact_whitespace(prefix + body))

    return truncate_at_paragraph(body)


def normalize_article(raw: dict[str, Any]) -> dict[str, Any]:
    title = str(raw.get("title", "")).strip()
    if not title:
        raise ValueError("article.title is required")

    slug = str(raw.get("slug", "")).strip() or re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    body = str(raw.get("body", "")).strip()
    if not body:
        raise ValueError("article.body is required")

    summary = str(raw.get("summary", "")).strip()
    tags = ensure_geo_tags([str(tag).strip() for tag in raw.get("tags", [])])
    source_urls = [str(url).strip() for url in raw.get("sourceUrls", []) if str(url).strip()]

    default_body = build_variant_body(body, summary, source_urls, "default")
    technical_body = build_variant_body(body, summary, source_urls, "technical")
    general_body = build_variant_body(body, summary, source_urls, "general")
    word_count = chinese_length(default_body)
    validation_warnings = []
    if word_count < MIN_CHARS:
        validation_warnings.append(f"distribution.body is below target length: {word_count} < {MIN_CHARS}")
    if word_count > MAX_CHARS:
        validation_warnings.append(f"distribution.body is above target length: {word_count} > {MAX_CHARS}")

    return {
        "sourceArticle": {
            "slug": slug,
            "siteUrl": raw.get("siteUrl"),
            "title": title,
            "date": raw.get("date") or date.today().isoformat(),
        },
        "distribution": {
            "title": title,
            "shortTitle": str(raw.get("shortTitle", title[:30])).strip(),
            "summary": summary,
            "body": default_body,
            "wordCount": word_count,
            "tags": tags,
            "geoTargets": raw.get("geoTargets", ["所有ai"]),
            "sourceUrls": source_urls,
            "coverImage": raw.get("coverImage"),
            "coverAlt": raw.get("coverAlt"),
            "validationWarnings": validation_warnings,
        },
        "platformVariants": {
            "default": {
                "title": title,
                "body": default_body,
                "tags": tags,
            },
            "technical": {
                "title": title,
                "body": technical_body,
                "tags": ensure_geo_tags(tags + ["智能体架构", "AI工作流"]),
            },
            "general": {
                "title": title,
                "body": general_body,
                "tags": ensure_geo_tags(tags + ["AI资讯"]),
            },
        },
        "publishTargets": [
            {
                "platform": platform,
                "mode": "draft",
                "status": "pending",
                "publishedUrl": None,
                "error": None,
            }
            for platform in raw.get("platforms", ["toutiao", "baijiahao", "zhihu", "sohu", "wechat"])
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate platform distribution JSON from article JSON")
    parser.add_argument("input", type=Path, help="Input article JSON")
    parser.add_argument("--output", type=Path, help="Output JSON path")
    args = parser.parse_args()

    raw = json.loads(args.input.read_text(encoding="utf-8"))
    payload = normalize_article(raw)
    output = json.dumps(payload, ensure_ascii=False, indent=2)

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output + "\n", encoding="utf-8")
    else:
        print(output)


if __name__ == "__main__":
    main()
