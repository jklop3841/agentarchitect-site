#!/usr/bin/env python3
"""
Probe CSDN editor selectors using a dedicated Edge profile.

This script does not publish. It helps establish login state and editor
selectors before building a CSDN draft-fill adapter.
"""

from __future__ import annotations

import json
import time
from pathlib import Path

from patchright.sync_api import sync_playwright


PROFILE_DIR = Path.home() / ".agents" / "browser-profiles" / "csdn"
STATE_FILE = PROFILE_DIR / "state.json"
EDITOR_URL = "https://mp.csdn.net/mp_blog/creation/editor?spm=1000.2115.3001.5352"
HOME_URL = "https://www.csdn.net/"
LOGIN_URL = "https://passport.csdn.net/login"


def collect_candidates(page) -> dict:
    return page.evaluate(
        """() => {
        const summarize = (el) => ({
          tag: el.tagName,
          text: (el.innerText || el.textContent || '').slice(0, 120),
          placeholder: el.getAttribute('placeholder'),
          ariaLabel: el.getAttribute('aria-label'),
          role: el.getAttribute('role'),
          className: typeof el.className === 'string' ? el.className : '',
          contenteditable: el.getAttribute('contenteditable'),
          dataTrack: el.getAttribute('data-track-click'),
          id: el.id,
          name: el.getAttribute('name')
        });
        return {
          url: location.href,
          title: document.title,
          textareas: Array.from(document.querySelectorAll('textarea')).slice(0, 20).map(summarize),
          inputs: Array.from(document.querySelectorAll('input')).slice(0, 30).map(summarize),
          editors: Array.from(document.querySelectorAll('[contenteditable="true"], .ProseMirror, .CodeMirror, .bytemd-editor, [role="textbox"]')).slice(0, 30).map(summarize),
          buttons: Array.from(document.querySelectorAll('button, a')).slice(0, 60).map(summarize)
        };
      }"""
    )


def main() -> None:
    PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    output_dir = Path("tmp/social-tests")
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Opening CSDN editor probe in Edge.")
    print("If login is required, complete it in the browser window. The script will wait up to 8 minutes.")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            channel="msedge",
            headless=False,
            no_viewport=True,
            ignore_default_args=["--enable-automation"],
            args=["--disable-blink-features=AutomationControlled", "--no-first-run", "--no-default-browser-check"],
        )
        page = context.pages[0] if context.pages else context.new_page()
        last_error = None
        for url in [EDITOR_URL, HOME_URL, LOGIN_URL, EDITOR_URL]:
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                break
            except Exception as error:
                last_error = error
                print(f"Navigation failed for {url}: {error}")
                time.sleep(3)
        else:
            context.close()
            raise last_error

        start = time.time()
        while time.time() - start < 8 * 60:
            url = page.url
            if "mp_blog/creation/editor" in url or "editor" in url:
                time.sleep(8)
                break
            time.sleep(2)

        context.storage_state(path=str(STATE_FILE))
        page.screenshot(path=str(output_dir / "csdn-probe.png"), full_page=True)
        candidates = collect_candidates(page)
        (output_dir / "csdn-candidates.json").write_text(
            json.dumps(candidates, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(json.dumps(candidates, ensure_ascii=False, indent=2)[:5000])
        context.close()


if __name__ == "__main__":
    main()
