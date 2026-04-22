#!/usr/bin/env python3
"""Check Wechatsync CLI/token availability and capture platform auth output."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ACCOUNTS = ROOT / "docs" / "social-publishing" / "accounts.generated.json"
DEFAULT_REPORT_DIR = ROOT / "docs" / "social-publishing" / "reports"
FAILURE_MARKERS = ("Invalid or missing token", "获取失败", "连接超时", "×")


def load_accounts(path: Path) -> dict:
    if not path.exists():
        return {"accounts": []}
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser(description="Check Wechatsync auth readiness")
    parser.add_argument("--accounts", type=Path, default=DEFAULT_ACCOUNTS)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--strict", action="store_true", help="Exit non-zero when setup is missing")
    args = parser.parse_args()

    timestamp = datetime.now().astimezone().isoformat(timespec="seconds")
    cli_path = shutil.which("wechatsync")
    token_present = bool(os.environ.get("WECHATSYNC_TOKEN"))
    accounts = load_accounts(args.accounts)
    targets = [account for account in accounts.get("accounts", []) if account.get("adapter") == "wechatsync"]

    report = {
        "timestamp": timestamp,
        "tool": "wechatsync",
        "cliPath": cli_path,
        "tokenPresent": token_present,
        "status": "pending",
        "targets": [
            {
                "platform": account.get("platform"),
                "targetAccount": account.get("accountNickname"),
                "mode": account.get("defaultMode", "draft"),
                "status": "pending",
                "error": None,
            }
            for account in targets
        ],
        "command": ["wechatsync", "platforms", "--auth"],
        "stdout": None,
        "stderr": None,
        "returncode": None,
    }

    if not cli_path or not token_present:
        reason = "WECHATSYNC_TOKEN is missing" if cli_path else "wechatsync CLI is not installed or not on PATH"
        report["status"] = "setup_required"
        for target in report["targets"]:
            target["status"] = "setup_required"
            target["error"] = reason
    else:
        completed = subprocess.run(
            [cli_path, "platforms", "--auth"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=120,
        )
        report["stdout"] = completed.stdout
        report["stderr"] = completed.stderr
        report["returncode"] = completed.returncode
        combined_output = f"{completed.stdout}\n{completed.stderr}"
        output_has_failure = any(marker in combined_output for marker in FAILURE_MARKERS)
        report["status"] = "success" if completed.returncode == 0 and not output_has_failure else "failed"
        for target in report["targets"]:
            target["status"] = "unknown" if report["status"] == "success" else "failed"
            target["error"] = None if report["status"] == "success" else (completed.stderr or completed.stdout)

    output = args.output
    if not output:
        DEFAULT_REPORT_DIR.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        output = DEFAULT_REPORT_DIR / f"wechatsync-auth-{stamp}.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], "report": str(output)}, ensure_ascii=False, indent=2))

    if args.strict and report["status"] != "success":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
