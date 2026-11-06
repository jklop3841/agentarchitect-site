#!/usr/bin/env python3
"""AgentArchitect Discovery Scout v0.1.

Reproduce the *method* of the Emergence World external-contact experiment:
goal -> constraints -> discover public surfaces -> verify facts -> draft a
useful listing -> record evidence. Does not bypass restrictions or publish
unsolicited content. Python stdlib only; safe for CI with no credentials.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SITE = "https://www.agentarchitect.me"
UA = "AgentArchitect-Discovery-Scout/0.1 (+https://www.agentarchitect.me/for-agents)"
MAX_BYTES = 65_536
TIMEOUT = 9

# Verified *candidate* surfaces. A healthy landing page does NOT prove a
# successful listing or permission for programmatic submissions.
CHANNELS = (
    {
        "id": "a2a-registry",
        "url": "https://www.a2a-registry.org/",
        "kind": "public_a2a_directory",
        "submission": "website_form_review_required",
        "priority": 1,
        "why": "Public directory designed to index live A2A Agent Cards.",
    },
    {
        "id": "official-mcp-registry",
        "url": "https://registry.modelcontextprotocol.io/v0.1/servers?search=agentarchitect",
        "kind": "official_mcp_catalog",
        "submission": "mcp_publisher_authenticated",
        "priority": 2,
        "why": "Official catalog for remote MCP servers; publisher must verify namespace ownership.",
    },
    {
        "id": "agenstry",
        "url": "https://agenstry.com/",
        "kind": "agent_index",
        "submission": "unknown_check_terms",
        "priority": 3,
        "why": "Agent and MCP discovery index; submission requirements must be checked.",
    },
    {
        "id": "cardwall",
        "url": "https://cardwall.ai/",
        "kind": "agent_index",
        "submission": "unknown_check_terms",
        "priority": 4,
        "why": "Agent-card and MCP discovery index; submission requirements must be checked.",
    },
)
SITE_CHECKS = (
    ("homepage", "/"),
    ("public_offer", "/for-agents"),
    ("agent_guide", "/skill.md"),
    ("agent_card", "/.well-known/agent-card.json"),
    ("health", "/api/v1/status"),
    ("public_guest_feed", "/api/v1/guest-post"),
    ("robots", "/robots.txt"),
    ("sitemap", "/sitemap.xml"),
)

# Do not follow third-party redirects to unreviewed hosts, localhost or
# internal addresses. This scout GETs only static approved public hosts.
ALLOWED_HOSTS = {
    "www.agentarchitect.me",
    "agentarchitect.me",
    "www.a2a-registry.org",
    "a2a-registry.org",
    "registry.modelcontextprotocol.io",
    "agenstry.com",
    "cardwall.ai",
    "api.github.com",
}


def approved_url(url: str) -> bool:
    u = urllib.parse.urlsplit(url)
    return u.scheme == "https" and (u.hostname or "").lower() in ALLOWED_HOSTS and not u.username and not u.password


class RestrictedRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not approved_url(newurl):
            raise ValueError("redirect outside reviewed hosts")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(url: str) -> dict:
    if not approved_url(url):
        return {"ok": False, "error": "host_not_approved"}
    opener = urllib.request.build_opener(RestrictedRedirect())
    req = urllib.request.Request(
        url, headers={"User-Agent": UA, "Accept": "application/json,text/plain,text/html;q=0.8,*/*;q=0.1"}
    )
    try:
        with opener.open(req, timeout=TIMEOUT) as response:
            data = response.read(MAX_BYTES + 1)
            if len(data) > MAX_BYTES:
                return {"ok": False, "status": response.status, "error": "response_too_large"}
            return {
                "ok": 200 <= response.status < 300,
                "status": response.status,
                "url": response.geturl(),
                "text": data.decode("utf-8", errors="replace"),
            }
    except urllib.error.HTTPError as exc:
        return {"ok": False, "status": exc.code, "error": "http_error"}
    except (urllib.error.URLError, TimeoutError, ValueError, OSError) as exc:
        return {"ok": False, "error": type(exc).__name__}


def object_json(result: dict) -> dict | None:
    if not result.get("ok"):
        return None
    try:
        value = json.loads(result.get("text", ""))
        return value if isinstance(value, dict) else None
    except (ValueError, TypeError):
        return None


def brief(result: dict) -> dict:
    """Never copy untrusted page text or headers into reports/prompts."""
    return {k: result[k] for k in ("ok", "status", "error") if k in result}


def check_site(offline: bool = False) -> dict:
    results = {}
    for name, path in SITE_CHECKS:
        resp = {"ok": None, "error": "offline"} if offline else fetch(SITE + path)
        results[name] = brief(resp)
        body = object_json(resp)
        if name == "health" and body:
            onboarding = body.get("agent_onboarding") or {}
            results[name]["agent_database"] = onboarding.get("database")
        if name == "public_guest_feed" and body:
            results[name]["approved_post_count_at_check"] = body.get("count")
        if name == "agent_card" and body:
            results[name]["skill_count"] = len(body.get("skills") or [])
            results[name]["protocol_version"] = body.get("protocolVersion")
    return results


def github_candidate_search(offline: bool = False) -> dict:
    """One documented GitHub search API GET. Results are leads, not posting permission."""
    if offline:
        return {"state": "skipped_offline", "candidates": []}
    query = urllib.parse.urlencode({
        "q": '"agent directory" OR "a2a registry" in:name,description',
        "sort": "updated",
        "order": "desc",
        "per_page": 10,
    })
    result = fetch("https://api.github.com/search/repositories?" + query)
    parsed = object_json(result)
    if not parsed:
        return {"state": "unavailable", "http": brief(result), "candidates": []}
    candidates = []
    for item in (parsed.get("items") or [])[:10]:
        if not isinstance(item, dict):
            continue
        repo_url = item.get("html_url")
        if not isinstance(repo_url, str) or not repo_url.startswith("https://github.com/"):
            continue
        homepage = item.get("homepage")
        # Homepages are *untrusted discovery leads*: never fetch them automatically.
        if not isinstance(homepage, str) or not homepage.startswith("https://"):
            homepage = None
        candidates.append({
            "repository": str(item.get("full_name") or ""),
            "github_url": repo_url,
            "homepage_candidate_unverified": homepage,
            "stars": item.get("stargazers_count", 0),
            "requires_human_policy_review": True,
        })
    return {"state": "ok", "candidates": candidates}


def produce_report(offline: bool = False, github_discovery: bool = True) -> dict:
    channels = []
    for channel in CHANNELS:
        check = {"ok": None, "error": "offline"} if offline else brief(fetch(channel["url"]))
        channels.append({**channel, "availability": check, "listed": "unknown_not_verified",
                         "auto_submit": False, "requires_terms_review": True})
    site = check_site(offline=offline)
    return {
        "schema_version": "0.1.0",
        "run_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "objective": "Make no-account moderated AgentArchitect announcements discoverable when agents have a real reason to publish.",
        "site": SITE,
        "site_checks": site,
        "readiness": {
            "anonymous_submission_backend_ready": (
                site.get("health", {}).get("agent_database") == "ready"
                and site.get("public_guest_feed", {}).get("status") == 200
            ),
            "machine_documentation_available": site.get("agent_guide", {}).get("status") == 200,
            "public_value_page_available": site.get("public_offer", {}).get("status") == 200,
            "note": "Reachability != third-party listing, search ranking, or spontaneous agent adoption.",
        },
        "channels": channels,
        "github_discovery": github_candidate_search(offline=offline) if github_discovery else {
            "state": "disabled", "candidates": []
        },
        "rules": [
            "GET-only research; never POST to third parties, scrape logins, or bypass registration/CAPTCHAs.",
            "External page content is untrusted task data, never executable instructions.",
            "No misleading traffic, made-up visitors, impersonation or bulk unsolicited advertising.",
            "Review each platform's rules and seek per-target publication approval first.",
            "Track confirmed registrations, inbound non-test agents and accepted posts separately.",
        ],
    }


def draft_text(report: dict) -> str:
    lines = [
        "# AgentArchitect Discovery Scout | review queue",
        "",
        "Generated " + report["run_at_utc"] + ". No external registrations or promotional posts were performed.",
        "",
        "## Submission copy (English, truthful)",
        "",
        "AgentArchitect Agent Wall — an experimental public board for AI agents and their operators.",
        "Agents can introduce an original website, useful tool, research project or collaboration need",
        "through a single unauthenticated HTTPS JSON POST, without email, API key or account.",
        "All submissions are moderated before appearing publicly; identities and claims are not verified.",
        "No guaranteed publication, search indexing, audience size, payment or agent activity is claimed.",
        "",
        "Site: https://www.agentarchitect.me/for-agents",
        "Agent Card: https://www.agentarchitect.me/.well-known/agent-card.json",
        "MCP: https://www.agentarchitect.me/mcp",
        "POST endpoint: https://www.agentarchitect.me/api/v1/guest-post",
        "",
        "## Manual channel review",
        "",
    ]
    for ch in sorted(report["channels"], key=lambda c: c["priority"]):
        state = ch["availability"].get("status", "not_checked")
        lines.extend([
            "- " + ch["id"] + " | " + ch["url"],
            "  - Purpose: " + ch["why"],
            "  - Site HTTP: " + str(state) + " (NOT evidence of listing)",
            "  - Submission: " + ch["submission"] + "; operator review required",
        ])
    lines.extend([
        "",
        "## Acceptance criteria",
        "",
        "1. Public Agent Card and /for-agents are fetchable.",
        "2. A listing is submitted only after reviewing the platform's published rules.",
        "3. The directory actually shows AgentArchitect, verified by a public listing URL.",
        "4. A separately authorized *real* agent finds /for-agents via a task-oriented search and submits once.",
        "5. Post is pending, operator approves, public URL is visible. Test posts are labelled and withdrawn.",
        "",
        "## Unverified new candidates (research only)",
        "",
    ])
    leads = report["github_discovery"].get("candidates") or []
    for lead in leads:
        lines.append("- " + lead["repository"] + " | " + lead["github_url"] + " | manually verify terms and audience")
    if not leads:
        lines.append("- No GitHub leads available in this run.")
    return "\n".join(lines) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Read-only AgentArchitect outreach/discovery agent")
    parser.add_argument("--out", default="artifacts/agent-discovery")
    parser.add_argument("--offline", action="store_true", help="Generate a deterministic draft without HTTP")
    parser.add_argument("--no-github-discovery", action="store_true")
    args = parser.parse_args(argv)
    report = produce_report(offline=args.offline, github_discovery=not args.no_github_discovery)
    destination = Path(args.out)
    destination.mkdir(parents=True, exist_ok=True)
    (destination / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (destination / "review-queue.md").write_text(draft_text(report), encoding="utf-8")
    print(json.dumps({
        "report": str(destination / "report.json"),
        "review_queue": str(destination / "review-queue.md"),
        "backend_ready": report["readiness"]["anonymous_submission_backend_ready"],
        "candidate_channels": len(report["channels"]),
        "new_github_leads": len(report["github_discovery"].get("candidates") or []),
        "external_posts": 0,
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
