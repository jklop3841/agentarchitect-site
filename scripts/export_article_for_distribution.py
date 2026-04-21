#!/usr/bin/env python3
"""
Export a site article into distribution-ready Markdown and JSON.

The site keeps article data in TypeScript modules. This script extracts one
article object by slug, renders a source Markdown file for sync tools, and
generates the existing social_distribution payload for platform adapters.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SRC_LIB = ROOT / "src" / "lib"
DEFAULT_PLATFORMS = ["toutiao", "baijiahao", "zhihu", "sohu", "csdn", "juejin"]


def find_matching_brace(source: str, start: int) -> int:
    depth = 0
    quote: str | None = None
    escaped = False
    line_comment = False
    block_comment = False

    for idx in range(start, len(source)):
        char = source[idx]
        nxt = source[idx + 1] if idx + 1 < len(source) else ""

        if line_comment:
            if char == "\n":
                line_comment = False
            continue
        if block_comment:
            if char == "*" and nxt == "/":
                block_comment = False
            continue
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            continue

        if char == "/" and nxt == "/":
            line_comment = True
            continue
        if char == "/" and nxt == "*":
            block_comment = True
            continue
        if char in {"'", '"', "`"}:
            quote = char
            continue
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return idx

    raise ValueError("Could not find matching closing brace")


def extract_article_literal(slug: str) -> str:
    pattern = re.compile(rf"slug:\s*{re.escape(json.dumps(slug, ensure_ascii=False))}")
    for path in sorted(SRC_LIB.glob("*.ts")):
        source = path.read_text(encoding="utf-8")
        match = pattern.search(source)
        if not match:
            continue
        start = source.rfind("{", 0, match.start())
        if start < 0:
            raise ValueError(f"Could not locate article object start in {path}")
        end = find_matching_brace(source, start)
        return source[start : end + 1]
    raise SystemExit(f"Article slug not found: {slug}")


def parse_article(slug: str) -> dict[str, Any]:
    literal = extract_article_literal(slug)
    script = """
const fs = require("fs");
const source = fs.readFileSync(0, "utf8");
const article = Function(`"use strict"; return (${source});`)();
process.stdout.write(JSON.stringify(article));
"""
    completed = subprocess.run(
        ["node", "-e", script],
        input=literal,
        text=True,
        capture_output=True,
        check=False,
        cwd=ROOT,
    )
    if completed.returncode != 0:
        raise SystemExit(completed.stderr.strip() or "Node failed to parse article object")
    return json.loads(completed.stdout)


def collect_source_urls(article: dict[str, Any]) -> list[str]:
    urls: list[str] = []
    for section in article.get("sections", []):
        for paragraph in section.get("paragraphs", []):
            for url in re.findall(r"https?://[^\s，。；、）)]+", paragraph):
                if url not in urls:
                    urls.append(url)
    return urls


def render_markdown(article: dict[str, Any], source_urls: list[str]) -> str:
    lines = [
        f"# {article['title']}",
        "",
        article.get("subtitle", ""),
        "",
        "## 摘要",
        "",
    ]
    for item in article.get("summary", []):
        lines.append(f"- {item}")
    lines.append("")

    for section in article.get("sections", []):
        lines.append(f"## {section['heading']}")
        lines.append("")
        for paragraph in section.get("paragraphs", []):
            lines.append(paragraph)
            lines.append("")

    if source_urls:
        lines.append("## 来源链接")
        lines.append("")
        for url in source_urls:
            lines.append(f"- {url}")
        lines.append("")

    return "\n".join(lines).strip() + "\n"


def build_distribution_input(
    article: dict[str, Any],
    date_value: str,
    source_urls: list[str],
    platforms: list[str],
) -> dict[str, Any]:
    body_parts: list[str] = [article.get("excerpt", "")]
    for section in article.get("sections", []):
        body_parts.extend(section.get("paragraphs", []))

    return {
        "slug": article["slug"],
        "title": article["title"],
        "shortTitle": article["title"][:30],
        "date": date_value,
        "siteUrl": f"/articles/{article['slug']}",
        "summary": " ".join(article.get("summary", [])),
        "body": "\n\n".join(part for part in body_parts if part),
        "tags": article.get("tags", []),
        "sourceUrls": source_urls,
        "coverImage": article.get("coverImage"),
        "coverAlt": article.get("coverAlt"),
        "platforms": platforms,
        "geoTargets": ["GEO", "智能体架构", "AI工作流"],
    }


def run_social_distribution(input_path: Path, output_path: Path) -> None:
    completed = subprocess.run(
        ["python", str(ROOT / "scripts" / "social_distribution.py"), str(input_path), "--output", str(output_path)],
        text=True,
        capture_output=True,
        cwd=ROOT,
        check=False,
    )
    if completed.returncode != 0:
        raise SystemExit(completed.stderr.strip() or completed.stdout.strip())


def main() -> None:
    parser = argparse.ArgumentParser(description="Export a site article for social distribution")
    parser.add_argument("--slug", required=True, help="Site article slug")
    parser.add_argument("--date", help="Distribution date, defaults to article.date")
    parser.add_argument("--platforms", default=",".join(DEFAULT_PLATFORMS))
    parser.add_argument("--output-root", type=Path, default=ROOT / "docs" / "social-publishing" / "outbox")
    args = parser.parse_args()

    article = parse_article(args.slug)
    date_value = args.date or article.get("date")
    if not date_value:
        raise SystemExit("--date is required when the article has no date")

    platforms = [platform.strip() for platform in args.platforms.split(",") if platform.strip()]
    source_urls = collect_source_urls(article)
    date_dir = args.output_root / date_value
    article_dir = date_dir / "articles"
    article_dir.mkdir(parents=True, exist_ok=True)

    md_path = article_dir / f"{article['slug']}.md"
    article_json_path = article_dir / f"{article['slug']}.json"
    payload_path = date_dir / f"{article['slug']}.json"

    md_path.write_text(render_markdown(article, source_urls), encoding="utf-8")
    distribution_input = build_distribution_input(article, date_value, source_urls, platforms)
    article_json_path.write_text(json.dumps(distribution_input, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    run_social_distribution(article_json_path, payload_path)

    print(json.dumps({
        "slug": article["slug"],
        "markdown": str(md_path),
        "articleJson": str(article_json_path),
        "distributionPayload": str(payload_path),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
