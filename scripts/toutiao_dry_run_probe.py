#!/usr/bin/env python3
"""
Probe Toutiao publish page selectors using the saved publisher auth state.

This script does not publish. It is a diagnostics helper for finding stable
title/body selectors before we build the final adapter.
"""

from __future__ import annotations

import json
import time
from pathlib import Path

from patchright.sync_api import sync_playwright


SKILL_DIR = Path(r"C:\Users\97566\.agents\skills\toutiao-publisher")
STATE_FILE = SKILL_DIR / "data" / "browser_state" / "state.json"
PROFILE_DIR = SKILL_DIR / "data" / "browser_state" / "edge_profile"
PUBLISH_URL = "https://mp.toutiao.com/profile_v4/graphic/publish"


def remove_blocking_overlays(page) -> None:
    page.evaluate(
        """() => {
        const selectors = [
          '.ai-assistant-drawer',
          '.byte-drawer-wrapper',
          '.byte-drawer-mask',
          '.byte-modal-mask',
          '[class*="assistant-drawer"]',
          '[class*="drawer-mask"]'
        ];
        for (const selector of selectors) {
          document.querySelectorAll(selector).forEach((node) => node.remove());
        }
        document.body.style.overflow = 'auto';
      }"""
    )


def collect_candidates(page) -> dict:
    return page.evaluate(
        """() => {
        const summarize = (el) => ({
          tag: el.tagName,
          text: (el.innerText || el.textContent || '').slice(0, 80),
          placeholder: el.getAttribute('placeholder'),
          ariaLabel: el.getAttribute('aria-label'),
          role: el.getAttribute('role'),
          className: el.className,
          contenteditable: el.getAttribute('contenteditable'),
          dataE2E: el.getAttribute('data-e2e'),
          id: el.id,
          name: el.getAttribute('name')
        });
        return {
          url: location.href,
          textareas: Array.from(document.querySelectorAll('textarea')).slice(0, 12).map(summarize),
          inputs: Array.from(document.querySelectorAll('input')).slice(0, 20).map(summarize),
          editors: Array.from(document.querySelectorAll('[contenteditable="true"], .ProseMirror, [role="textbox"]')).slice(0, 20).map(summarize),
          buttons: Array.from(document.querySelectorAll('button')).slice(0, 30).map(summarize)
        };
      }"""
    )


def main() -> None:
    if not STATE_FILE.exists():
        raise SystemExit(f"Missing auth state: {STATE_FILE}")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            channel="msedge",
            headless=False,
            no_viewport=True,
            ignore_default_args=["--enable-automation"],
            args=["--disable-blink-features=AutomationControlled", "--no-first-run", "--no-default-browser-check"],
        )
        context.add_cookies(json.loads(STATE_FILE.read_text(encoding="utf-8")).get("cookies", []))
        page = context.pages[0] if context.pages else context.new_page()
        page.goto(PUBLISH_URL, wait_until="domcontentloaded", timeout=60000)
        time.sleep(5)
        remove_blocking_overlays(page)
        time.sleep(2)
        output_dir = Path("tmp/social-tests")
        output_dir.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(output_dir / "toutiao-probe.png"), full_page=True)
        candidates = collect_candidates(page)
        (output_dir / "toutiao-candidates.json").write_text(
            json.dumps(candidates, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(json.dumps(candidates, ensure_ascii=False, indent=2)[:4000])
        context.close()


if __name__ == "__main__":
    main()
