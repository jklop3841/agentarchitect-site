#!/usr/bin/env python3
"""Run draft distribution through Wechatsync and write an auditable report."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
OUTBOX = ROOT / "docs" / "social-publishing" / "outbox"
ACCOUNTS = ROOT / "docs" / "social-publishing" / "accounts.generated.json"
FIRST_STAGE = ["toutiao", "baijiahao", "zhihu", "sohu", "csdn", "juejin"]


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def load_accounts() -> dict[str, dict[str, Any]]:
    if not ACCOUNTS.exists():
        return {}
    data = load_json(ACCOUNTS)
    return {account["platform"]: account for account in data.get("accounts", [])}


def markdown_for_payload(payload: dict[str, Any], variant: str) -> str:
    distribution = payload["distribution"]
    platform_variant = payload.get("platformVariants", {}).get(variant) or payload.get("platformVariants", {}).get("default", {})
    title = platform_variant.get("title") or distribution["title"]
    body = platform_variant.get("body") or distribution["body"]
    tags = platform_variant.get("tags") or distribution.get("tags", [])
    sources = distribution.get("sourceUrls", [])

    lines = [f"# {title}", "", body.strip(), ""]
    if tags:
        lines.append("## 标签")
        lines.append("")
        lines.append(" ".join(f"#{tag}" for tag in tags))
        lines.append("")
    if sources:
        lines.append("## 延伸阅读")
        lines.append("")
        for url in sources:
            lines.append(f"- {url}")
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def payload_paths(date_value: str, slugs: list[str]) -> list[Path]:
    date_dir = OUTBOX / date_value
    if slugs:
        return [date_dir / f"{slug}.json" for slug in slugs]
    return sorted(path for path in date_dir.glob("*.json") if path.name != "distribution-report.json")


def status_entry(platform: str, account: dict[str, Any] | None, slug: str, status: str, error: str | None = None) -> dict[str, Any]:
    return {
        "platform": platform,
        "targetAccount": (account or {}).get("accountNickname"),
        "mode": (account or {}).get("defaultMode", "draft"),
        "status": status,
        "draftUrl": None,
        "error": error,
        "timestamp": datetime.now().astimezone().isoformat(timespec="seconds"),
        "sourceArticleSlug": slug,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Wechatsync draft distribution for outbox payloads")
    parser.add_argument("--date", required=True)
    parser.add_argument("--mode", default="draft", choices=["draft"])
    parser.add_argument("--platforms", default=",".join(FIRST_STAGE))
    parser.add_argument("--slugs", default="", help="Comma-separated slug filter")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    platforms = [platform.strip() for platform in args.platforms.split(",") if platform.strip()]
    slugs = [slug.strip() for slug in args.slugs.split(",") if slug.strip()]
    accounts = load_accounts()
    cli_path = shutil.which("wechatsync")
    token_present = bool(os.environ.get("WECHATSYNC_TOKEN"))
    date_dir = OUTBOX / args.date
    sync_dir = date_dir / "wechatsync-input"
    sync_dir.mkdir(parents=True, exist_ok=True)

    report: dict[str, Any] = {
        "date": args.date,
        "mode": args.mode,
        "dryRun": args.dry_run,
        "tool": "wechatsync",
        "cliPath": cli_path,
        "tokenPresent": token_present,
        "startedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
        "results": [],
    }

    missing_setup = None
    if not cli_path:
        missing_setup = "wechatsync CLI is not installed or not on PATH"
    elif not token_present:
        missing_setup = "WECHATSYNC_TOKEN is missing"

    for payload_path in payload_paths(args.date, slugs):
        if not payload_path.exists():
            report["results"].append(status_entry("all", None, payload_path.stem, "failed", f"Missing payload: {payload_path}"))
            continue

        payload = load_json(payload_path)
        slug = payload["sourceArticle"]["slug"]
        technical_platforms = [p for p in platforms if (accounts.get(p) or {}).get("variant") == "technical"]
        general_platforms = [p for p in platforms if p not in technical_platforms]
        batches = [("technical", technical_platforms), ("general", general_platforms)]

        for variant, batch_platforms in batches:
            batch_platforms = [p for p in batch_platforms if p]
            if not batch_platforms:
                continue
            md_path = sync_dir / f"{slug}.{variant}.md"
            md_path.write_text(markdown_for_payload(payload, variant), encoding="utf-8")

            if missing_setup:
                for platform in batch_platforms:
                    report["results"].append(status_entry(platform, accounts.get(platform), slug, "setup_required", missing_setup))
                continue

            command = ["wechatsync", "sync", str(md_path), "-p", ",".join(batch_platforms)]
            if args.dry_run:
                for platform in batch_platforms:
                    entry = status_entry(platform, accounts.get(platform), slug, "skipped", "dry-run")
                    entry["command"] = command
                    report["results"].append(entry)
                continue

            completed = subprocess.run(command, cwd=ROOT, text=True, capture_output=True, check=False, timeout=300)
            status = "success" if completed.returncode == 0 else "failed"
            error = None if completed.returncode == 0 else (completed.stderr or completed.stdout or "wechatsync failed")
            for platform in batch_platforms:
                entry = status_entry(platform, accounts.get(platform), slug, status, error)
                entry["command"] = command
                entry["returncode"] = completed.returncode
                entry["stdout"] = completed.stdout
                entry["stderr"] = completed.stderr
                report["results"].append(entry)

    for account in accounts.values():
        if account.get("adapter") == "manual":
            report["results"].append(status_entry(account["platform"], account, "*", "skipped", "manual-only platform"))
        elif account.get("adapter") == "future-adapter":
            report["results"].append(status_entry(account["platform"], account, "*", "skipped", "future adapter not enabled in v1"))

    report["finishedAt"] = datetime.now().astimezone().isoformat(timespec="seconds")
    report_path = date_dir / "distribution-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(report_path), "results": len(report["results"])}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
