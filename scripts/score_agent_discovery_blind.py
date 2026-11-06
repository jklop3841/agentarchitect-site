#!/usr/bin/env python3
"""Evaluate independent external Agent discovery evidence. No model/API calls."""
import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

TARGET_HOSTS = {"agentarchitect.me", "www.agentarchitect.me"}
TARGET_PAGES = {"/for-agents", "/skill.md", "/.well-known/agent-card.json", "/docs/mcp", "/mcp"}
ALLOWED_FIELDS = {"provider", "model", "fresh_context_verified", "browsing_enabled", "selected_service_url",
                  "discovered_urls", "search_queries", "external_write_performed", "evidence_file", "notes"}

def target_url(url):
    if not isinstance(url, str):
        return False
    try:
        parsed = urlsplit(url)
        return parsed.scheme == "https" and parsed.hostname and parsed.hostname.lower() in TARGET_HOSTS
    except ValueError:
        return False

def evaluate(folder):
    rows = []
    for path in sorted(Path(folder).glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise ValueError(f"{path.name}: record must be an object")
        if "TEST_TEMPLATE_ONLY" in str(data.get("provider", "")):
            raise ValueError(f"{path.name}: example/template cannot be reported as a real run")
        if not isinstance(data.get("discovered_urls"), list) or not all(isinstance(x, str) for x in data["discovered_urls"]):
            raise ValueError(f"{path.name}: discovered_urls must be a list of strings")
        if data.get("external_write_performed") is not False:
            raise ValueError(f"{path.name}: blind phase cannot include unapproved writes")
        if not data.get("provider") or not data.get("model"):
            raise ValueError(f"{path.name}: model and provider required")
        if set(data.keys()) - ALLOWED_FIELDS:
            raise ValueError(f"{path.name}: unknown fields")
        discovered = any(target_url(u) for u in data["discovered_urls"])
        selected = target_url(data.get("selected_service_url"))
        landing = any(target_url(u) and urlsplit(u).path in TARGET_PAGES for u in data["discovered_urls"])
        eligible = data.get("browsing_enabled") is True and data.get("fresh_context_verified") is True
        evidence_file = data.get("evidence_file")
        evidence_present = bool(evidence_file and (Path(folder) / Path(str(evidence_file)).name).is_file())
        rows.append({
            "provider": data["provider"], "model": data["model"], "eligible": eligible,
            "found_target": discovered, "found_tool_docs": landing, "selected_target": selected,
            "full_transcript_saved": evidence_present,
        })
    eligible_rows = [r for r in rows if r["eligible"]]
    return {
        "status": "UNVERIFIED_EXTERNAL_REPORTS_REQUIRE_HUMAN_REVIEW",
        "total_runs": len(rows),
        "eligible_fresh_browsing_runs": len(eligible_rows),
        "target_discovered": sum(r["found_target"] for r in eligible_rows),
        "target_selected": sum(r["selected_target"] for r in eligible_rows),
        "transcripts_saved": sum(r["full_transcript_saved"] for r in rows),
        "results": rows,
        "warning": "The evaluator checks declared URLs and flags only. It cannot prove model independence, web visits, or real external traffic.",
    }

def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument("folder", help="Directory holding independent run .json files")
    args = p.parse_args(argv)
    result = evaluate(args.folder)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["eligible_fresh_browsing_runs"] >= 3 else 2

if __name__ == "__main__":
    sys.exit(main())
