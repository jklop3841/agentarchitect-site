#!/usr/bin/env python3
"""Create a deterministic, minimal, self-contained portable AgentArchitect plugin ZIP."""
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLUGIN = ROOT / "plugins" / "agentarchitect-network"
DIST = ROOT / "dist"
OUTPUT = DIST / "agentarchitect-network-plugin-0.1.0.zip"
INCLUDE = [
    "plugin.json",
    "mcp.json",
    "README.md",
    "skills/get-started/SKILL.md",
    "assets/agentarchitect-icon.svg",
    "assets/agentarchitect-logo.svg",
]

def validate():
    manifest = json.loads((PLUGIN / "plugin.json").read_text(encoding="utf-8"))
    mcp = json.loads((PLUGIN / "mcp.json").read_text(encoding="utf-8"))
    assert manifest["$schema"].startswith("https://agent-plugins.org/schemas/")
    assert manifest["name"] == "agentarchitect-network"
    assert manifest["version"] == "0.1.0"
    servers = mcp["mcpServers"]
    assert len(servers) == 1 and servers["agentarchitect"]["url"] == "https://www.agentarchitect.me/mcp"
    interface = manifest["extensions"]["com.openai"]["interface"]
    for name in ["websiteURL", "privacyPolicyURL", "supportURL", "termsOfServiceURL"]:
        assert interface[name].startswith("https://www.agentarchitect.me/")
    assert len(interface["shortDescription"]) <= 30
    review = manifest["extensions"]["com.openai"]["review"]["test_cases"]
    assert len(review["positive"]) == 5 and len(review["negative"]) == 3
    assert all(t.get("prompt") and t.get("tools_triggered") and t.get("expected_behavior") for t in review["positive"])
    assert all(t.get("prompt") for t in review["negative"])
    for field in ["logo", "composerIcon"]:
        icon = PLUGIN / interface[field].removeprefix("./")
        assert icon.is_file() and icon.stat().st_size < 5*1024*1024
    for file in INCLUDE:
        p = (PLUGIN / file).resolve()
        assert p.is_relative_to(PLUGIN.resolve()) and p.is_file(), file
    skill = (PLUGIN / "skills/get-started/SKILL.md").read_text(encoding="utf-8")
    assert skill.startswith("---\n") and "description:" in skill and "name:" in skill
    return manifest

def main():
    manifest = validate()
    DIST.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUTPUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as out:
        for name in sorted(INCLUDE):
            info = zipfile.ZipInfo(name, date_time=(2026, 11, 6, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            out.writestr(info, (PLUGIN / name).read_bytes())
    with zipfile.ZipFile(OUTPUT) as check:
        assert len(check.namelist()) == len(INCLUDE) and check.testzip() is None
    digest = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
    print(json.dumps({"file":str(OUTPUT.relative_to(ROOT)),"bytes":OUTPUT.stat().st_size,
                      "sha256":digest,"plugin":manifest["name"],"version":manifest["version"],
                      "included_files":len(INCLUDE)},indent=2))
    return 0

if __name__ == "__main__":
    sys.exit(main())
