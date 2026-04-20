#!/usr/bin/env python3
"""
Fill Toutiao article draft using saved Edge auth state.

This script intentionally does not publish. It fills title/body and saves
diagnostic screenshots so we can validate selectors before enabling publishing.
"""

from __future__ import annotations

import argparse
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


def fill_title(page, title: str) -> bool:
    title = title[:30]
    candidates = [
        page.locator('textarea[placeholder*="文章标题"]').first,
        page.locator('textarea[placeholder*="标题"]').first,
        page.locator("textarea").first,
    ]
    for candidate in candidates:
        try:
            if candidate.count() > 0 and candidate.is_visible():
                candidate.fill(title)
                return True
        except Exception:
            continue
    return False


def fill_body(page, body: str) -> bool:
    candidates = [
        page.locator(".ProseMirror").first,
        page.locator('[contenteditable="true"]').first,
        page.locator('[role="textbox"]').first,
    ]
    for candidate in candidates:
        try:
            if candidate.count() > 0 and candidate.is_visible():
                candidate.click()
                page.keyboard.press("Control+A")
                page.keyboard.type(body, delay=1)
                return True
        except Exception:
            continue
    return False


def select_no_cover(page) -> bool:
    try:
        remove_blocking_overlays(page)
        no_cover = page.locator("div, span, label").filter(has_text="无封面").last
        if no_cover.count() > 0 and no_cover.is_visible():
            no_cover.click(force=True)
            return True
    except Exception:
        return False
    return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Fill Toutiao draft without publishing")
    parser.add_argument("--title", required=True)
    parser.add_argument("--content", required=True, type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path("tmp/social-tests"))
    args = parser.parse_args()

    if not STATE_FILE.exists():
        raise SystemExit(f"Missing auth state: {STATE_FILE}")

    body = args.content.read_text(encoding="utf-8")
    args.output_dir.mkdir(parents=True, exist_ok=True)

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
        time.sleep(1)

        title_ok = fill_title(page, args.title)
        body_ok = fill_body(page, body)
        no_cover_ok = select_no_cover(page)
        time.sleep(2)

        page.screenshot(path=str(args.output_dir / "toutiao-draft-fill.png"), full_page=True)
        result = {
            "url": page.url,
            "titleFilled": title_ok,
            "bodyFilled": body_ok,
            "noCoverSelected": no_cover_ok,
            "published": False,
        }
        (args.output_dir / "toutiao-draft-fill-result.json").write_text(
            json.dumps(result, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(json.dumps(result, ensure_ascii=False, indent=2))
        context.close()

        if not title_ok or not body_ok:
            raise SystemExit(1)


if __name__ == "__main__":
    main()
