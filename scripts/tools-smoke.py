"""Smoke test of the tool platform against a deployed base URL.

Usage: python3 scripts/tools-smoke.py <base-url> <fixtures-dir> [cookie-jar]

Makes about 20 real tool calls. Set AA_INTERNAL_TEST_TOKEN to the deployment's
INTERNAL_TEST_TOKEN so these calls are recorded as internal tests, not external usage.
Prints one line per check. Never prints cookies or tokens.
"""
import base64
import json
import os
import subprocess
import sys

base = sys.argv[1].rstrip("/")
fixtures = sys.argv[2]
jar = sys.argv[3] if len(sys.argv) > 3 else None


def curl(method, path, body=None, headers=None):
    cmd = ["curl", "-sS", "-m", "40", "-X", method, base + path, "-w", "\n%{http_code}"]
    if jar:
        cmd += ["-b", jar]
    if os.environ.get("AA_INTERNAL_TEST_TOKEN"):
        cmd += ["-H", "x-aa-internal-test: " + os.environ["AA_INTERNAL_TEST_TOKEN"]]
    for key, value in (headers or {}).items():
        cmd += ["-H", f"{key}: {value}"]
    data = None
    if body is not None:
        cmd += ["-H", "content-type: application/json", "--data-binary", "@-"]
        data = json.dumps(body).encode()
    out = subprocess.run(cmd, input=data, capture_output=True).stdout.decode("utf-8", "replace")
    text, _, code = out.rpartition("\n")
    try:
        return int(code), json.loads(text)
    except Exception:
        return int(code or 0), text[:200]


def b64(name):
    return base64.b64encode(open(f"{fixtures}/{name}", "rb").read()).decode()


results = []


def check(name, ok, detail=""):
    results.append(ok)
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""))


code, body = curl("GET", "/api/v1/tools")
check("catalog lists 3 tools", code == 200 and [t["id"] for t in body["tools"]] == ["fileproof", "imageproof", "claimcheck"], str(code))

code, body = curl("GET", "/api/v1/tools/imageproof")
check("imageproof definition reports the C2PA SDK", code == 200 and body.get("runtime", {}).get("content_credentials_validator") == "c2pa-node", str(body.get("runtime") if isinstance(body, dict) else body))

code, body = curl("POST", "/api/v1/tools/fileproof", {"file": {"content_base64": "aGVsbG8="}, "expected_sha256": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"})
check("fileproof inline: verified_against_reference", code == 200 and body["result"]["integrity"] == "verified_against_reference", str(code))

for name, want_state, want_verdict in [
    ("adobe-20220124-C.jpg", "valid_untrusted_signer", "insufficient_evidence"),
    ("adobe-20220124-E-dat-CA.jpg", "invalid", "contradiction_found"),
    ("adobe-20220124-A.jpg", "absent", None),
]:
    code, body = curl("POST", "/api/v1/tools/imageproof", {"image": {"content_base64": b64(name)}})
    ok = code == 200 and body["result"]["content_credentials"]["state"] == want_state and (want_verdict is None or body["result"]["verdict"] == want_verdict)
    detail = f"{code} {body['result']['content_credentials']['state']}/{body['result']['content_credentials']['validator']} -> {body['result']['verdict']}" if code == 200 else str(body)[:160]
    check(f"imageproof inline {name}", ok, detail)

remote = "https://raw.githubusercontent.com/c2pa-org/public-testfiles/main/legacy/1.4/image/jpeg/adobe-20220124-C.jpg"
code, body = curl("POST", "/api/v1/tools/imageproof", {"image": {"url": remote}})
ok = code == 200 and body["result"]["file"]["input_mode"] == "url" and body["result"]["content_credentials"]["state"] == "valid_untrusted_signer"
check("imageproof by public URL (real DNS + TLS through the SSRF guard)", ok, f"{code} {body['result']['file']['size_bytes']} bytes sha256 {body['result']['file']['sha256'][:12]}" if code == 200 else json.dumps(body.get("error") if isinstance(body, dict) else body)[:200])

code, body = curl("POST", "/api/v1/tools/fileproof", {"file": {"url": remote}, "expected_sha256": "0" * 64})
check("fileproof by public URL: mismatch against a wrong hash", code == 200 and body["result"]["integrity"] == "mismatch", str(code))

for target in [
    "http://169.254.169.254/latest/meta-data/",
    "http://127.0.0.1/",
    "http://localhost:3000/",
    "http://[::1]/",
    "http://10.0.0.1/",
    "http://metadata.google.internal/computeMetadata/v1/",
    "file:///etc/passwd",
]:
    code, body = curl("POST", "/api/v1/tools/fileproof", {"file": {"url": target}})
    check(f"SSRF refused: {target}", code == 422 and body.get("error", {}).get("code") == "url_not_allowed", f"{code} {body.get('error', {}).get('code') if isinstance(body, dict) else body}")

code, body = curl("POST", "/api/v1/tools/claimcheck", {"text": "The plant produced 40 tonnes in 2025.", "evidence": [{"text": "The plant produced 55 tonnes in 2025."}]})
check("claimcheck: contradicted", code == 200 and body["result"]["claims"][0]["verdict"] == "contradicted", str(code))

code, body = curl(
    "POST",
    "/mcp",
    {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}},
    {"accept": "application/json, text/event-stream"},
)
names = sorted(t["name"] for t in body["result"]["tools"]) if code == 200 and isinstance(body, dict) else []
check("mcp tools/list has 10 tools incl. the 3 new ones", len(names) == 10 and {"fileproof_check", "imageproof_inspect", "claimcheck_analyze"} <= set(names), str(len(names)))

code, body = curl(
    "POST",
    "/mcp",
    {"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "imageproof_inspect", "arguments": {"image": {"content_base64": b64("adobe-20220124-E-dat-CA.jpg")}}}},
    {"accept": "application/json, text/event-stream"},
)
ok = code == 200 and body["result"]["structuredContent"]["result"]["verdict"] == "contradiction_found"
check("mcp imageproof_inspect on altered image: contradiction_found", ok, str(code))

code, body = curl("POST", "/api/v1/tools/fileproof", {"file": {}})
check("invalid input -> 422 invalid_input", code == 422 and body["error"]["code"] == "invalid_input", str(code))

for path in ["/tools", "/tools/fileproof", "/tools/imageproof", "/tools/claimcheck?lang=zh", "/tools/fileproof/skill.md", "/openapi.json", "/llms.txt", "/agents.txt", "/skill.md", "/", "/requests", "/api/v1/requests", "/.well-known/agent-card.json"]:
    code, _ = curl("GET", path)
    check(f"GET {path}", code == 200, str(code))

print(f"\n{sum(results)} passed, {len(results) - sum(results)} failed")
sys.exit(0 if all(results) else 1)
