#!/usr/bin/env python3
"""Transform exercise HTML into structured data for the course shell.

Reads:  .old/vyuka_downloaded/priklady/**/*.html
Writes: data/exercises.json

Each exercise page becomes:
  path → {
    title, notes[], tasks: [{ id, num, title, prompt_html, hint_html, solution_html }]
  }

Idempotent. Does not mutate .old/.
"""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OLD_PRI = ROOT / ".old" / "vyuka_downloaded" / "priklady"
OUT = ROOT / "data" / "exercises.json"


class ExerciseParser(HTMLParser):
    """Extract title, notes, and .priklad / task blocks from exercise HTML."""

    def __init__(self):
        super().__init__()
        self.title = ""
        self.notes: list[str] = []
        self.tasks: list[dict] = []

        self._capture_title = False
        self._title_buf: list[str] = []

        self._in_priklad = False
        self._priklad_id = ""
        self._priklad_depth = 0

        self._zone = None  # zadani | reseni | hint | solution | note
        self._zone_depth = 0
        self._buf: list[str] = []
        self._cur: dict | None = None

        self._in_details = False
        self._details_kind = None  # hint | solution

    def handle_starttag(self, tag, attrs):
        ad = dict(attrs)
        cls = ad.get("class", "") or ""
        classes = set(cls.split())

        if tag == "h1" and "lecture-title" in classes:
            self._capture_title = True
            self._title_buf = []
            return

        # notes sometimes appear as .note-item before tasks
        if not self._in_priklad and tag == "div" and "note-item" in classes:
            self._zone = "note"
            self._zone_depth = 1
            self._buf = []
            return

        if tag == "div" and "priklad" in classes:
            self._in_priklad = True
            self._priklad_depth = 1
            tid = ad.get("id") or f"task-{len(self.tasks) + 1}"
            num_m = re.search(r"(\d+)$", tid)
            num = int(num_m.group(1)) if num_m else len(self.tasks) + 1
            self._cur = {
                "id": tid,
                "num": num,
                "title": f"Úkol {num}",
                "prompt_html": "",
                "hint_html": "",
                "solution_html": "",
            }
            return

        if self._in_priklad:
            if tag == "div":
                self._priklad_depth += 1
                if "zadani" in classes:
                    self._zone = "zadani"
                    self._zone_depth = 1
                    self._buf = [f"<{tag}"]
                    for k, v in attrs:
                        self._buf.append(f' {k}="{_esc_attr(v)}"')
                    self._buf.append(">")
                    return
                if "reseni" in classes:
                    self._zone = "reseni"
                    self._zone_depth = 1
                    self._buf = []
                    return

            if tag == "details":
                self._in_details = True
                # default hint unless class says solution
                self._details_kind = "solution" if "solution" in classes else "hint"
                if self._zone != "zadani":
                    self._zone = self._details_kind
                    self._zone_depth = 1
                    self._buf = []
                return

            if tag == "summary":
                # skip summary text for content
                self._zone = "skip_summary"
                self._zone_depth = 1
                self._buf = []
                return

            if self._zone and self._zone not in ("skip_summary", "reseni"):
                self._buf.append(self._start_html(tag, attrs))
                if self._zone in ("zadani", "hint", "solution", "note"):
                    self._zone_depth += 1 if tag in VOID else 0
                    # track depth for non-void
                    if tag not in VOID_TAGS:
                        self._zone_depth += 0  # handled in open
                return

            if self._zone == "zadani":
                self._buf.append(self._start_html(tag, attrs))
                return

            if self._zone in ("hint", "solution") and tag != "summary":
                if tag == "div" and "exercise-details-content" in classes:
                    self._buf = []  # reset to content only
                    return
                self._buf.append(self._start_html(tag, attrs))
                return

        if self._zone == "note":
            if tag not in VOID_TAGS:
                self._zone_depth += 1
            self._buf.append(self._start_html(tag, attrs))

    def handle_endtag(self, tag):
        if self._capture_title and tag == "h1":
            self._capture_title = False
            self.title = "".join(self._title_buf).strip()
            return

        if self._zone == "note":
            if tag not in VOID_TAGS:
                self._zone_depth -= 1
            if tag not in VOID_TAGS:
                self._buf.append(f"</{tag}>")
            if self._zone_depth <= 0:
                text = _strip_tags("".join(self._buf)).strip()
                if text:
                    self.notes.append(text)
                self._zone = None
                self._buf = []
            return

        if not self._in_priklad:
            return

        if self._zone == "skip_summary" and tag == "summary":
            self._zone = self._details_kind if self._in_details else "reseni"
            self._buf = []
            return

        if self._zone == "zadani":
            if tag == "div" and self._looking_for_zone_end("zadani"):
                # completed by depth tracking via simpler approach below
                pass
            self._buf.append(f"</{tag}>" if tag not in VOID_TAGS else "")
            # Detect end of zadani: when we close the zadani div
            # Use a simpler stack approach — recount from buffer is hard.
            # Instead track zone_open_tag
            return

        if tag == "details" and self._in_details:
            html = "".join(self._buf).strip()
            html = _clean_inner(html)
            if self._cur:
                if self._details_kind == "solution":
                    self._cur["solution_html"] = html
                else:
                    self._cur["hint_html"] = html
            self._in_details = False
            self._details_kind = None
            self._zone = "reseni"
            self._buf = []
            return

        if tag == "div" and self._in_priklad:
            self._priklad_depth -= 1
            if self._zone == "zadani":
                # closing nested or the zone itself — append and check
                # We'll finalize zadani when zone div closes by class detection is gone
                # Use depth counter for zone
                pass
            if self._priklad_depth <= 0:
                # end of priklad
                if self._cur:
                    if self._zone == "zadani" and self._buf:
                        self._cur["prompt_html"] = _clean_inner("".join(self._buf))
                    self.tasks.append(self._cur)
                self._cur = None
                self._in_priklad = False
                self._zone = None
                self._buf = []
                return

        if self._zone in ("hint", "solution", "zadani") and tag not in VOID_TAGS:
            self._buf.append(f"</{tag}>")

    def handle_data(self, data):
        if self._capture_title:
            self._title_buf.append(data)
            return
        if self._zone == "skip_summary":
            return
        if self._zone in ("zadani", "hint", "solution", "note"):
            self._buf.append(_esc(data))

    def handle_entityref(self, name):
        if self._zone in ("zadani", "hint", "solution", "note") or self._capture_title:
            ch = f"&{name};"
            if self._capture_title:
                self._title_buf.append(ch)
            else:
                self._buf.append(ch)

    def handle_charref(self, name):
        if self._zone in ("zadani", "hint", "solution", "note") or self._capture_title:
            ch = f"&#{name};"
            if self._capture_title:
                self._title_buf.append(ch)
            else:
                self._buf.append(ch)

    def _start_html(self, tag, attrs):
        parts = [f"<{tag}"]
        for k, v in attrs:
            parts.append(f' {k}="{_esc_attr(v)}"')
        if tag in VOID_TAGS:
            parts.append(" />")
        else:
            parts.append(">")
        return "".join(parts)

    def _looking_for_zone_end(self, zone):
        return True


VOID_TAGS = {
    "br", "hr", "img", "input", "meta", "link", "area", "base",
    "col", "embed", "source", "track", "wbr",
}


def _esc(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def _esc_attr(s: str) -> str:
    return _esc(s).replace('"', "&quot;")


def _strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", "", html)


def _clean_inner(html: str) -> str:
    html = html.strip()
    # unwrap outer div.zadani if present
    m = re.match(
        r'^<div\s+class="zadani"[^>]*>(.*)</div>\s*$',
        html,
        re.S | re.I,
    )
    if m:
        html = m.group(1).strip()
    return html


def _extract_div_blocks(html: str, class_name: str) -> list[tuple[str, str, str]]:
    """Return list of (id, opening_attrs, inner_html) for top-level div.class_name blocks."""
    results = []
    # find openings
    for m in re.finditer(
        rf'<div\b([^>]*\bclass="[^"]*\b{re.escape(class_name)}\b[^"]*"[^>]*)>',
        html,
        re.I,
    ):
        attrs = m.group(1)
        id_m = re.search(r'\bid="([^"]+)"', attrs)
        tid = id_m.group(1) if id_m else ""
        start = m.end()
        # stack-based walk for matching close
        depth = 1
        i = start
        while i < len(html) and depth > 0:
            next_open = html.find("<div", i)
            next_close = html.find("</div>", i)
            if next_close < 0:
                break
            if next_open >= 0 and next_open < next_close:
                # is it a real open tag?
                end_gt = html.find(">", next_open)
                if end_gt < 0:
                    break
                tag = html[next_open : end_gt + 1]
                if not tag.startswith("</") and not tag.endswith("/>"):
                    depth += 1
                i = end_gt + 1
            else:
                depth -= 1
                if depth == 0:
                    inner = html[start:next_close]
                    results.append((tid, attrs, inner))
                    break
                i = next_close + len("</div>")
    return results


def _extract_zone(inner: str, class_name: str) -> str:
    blocks = _extract_div_blocks(inner, class_name)
    if not blocks:
        # non-id zone
        m = re.search(
            rf'<div\b[^>]*\bclass="[^"]*\b{re.escape(class_name)}\b[^"]*"[^>]*>([\s\S]*)',
            inner,
            re.I,
        )
        if not m:
            return ""
        # take until matching close via stack from match
        start_tag_end = m.start() 
        # reuse block extractor by wrapping
        wrapped = inner
        blocks = _extract_div_blocks(wrapped, class_name)
        if blocks:
            return blocks[0][2].strip()
        return ""
    return blocks[0][2].strip()


def parse_exercise_regex(html: str) -> dict:
    """Extract title, notes, and úkol blocks from exercise HTML."""
    title_m = re.search(
        r'<h1[^>]*class="[^"]*lecture-title[^"]*"[^>]*>(.*?)</h1>',
        html,
        re.S | re.I,
    )
    title = re.sub(r"<[^>]+>", "", title_m.group(1)).strip() if title_m else ""

    notes = []
    for nm in re.finditer(
        r'<div class="note-item"[^>]*>.*?<div class="note-content">(.*?)</div>\s*</div>',
        html,
        re.S | re.I,
    ):
        text = re.sub(r"<[^>]+>", " ", nm.group(1))
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            notes.append(text)

    for nm in re.finditer(r'<div class="note"[^>]*>(.*?)</div>', html, re.S | re.I):
        text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", nm.group(1))).strip()
        if text and text not in notes:
            notes.append(text)

    tasks = []
    for tid, _attrs, body in _extract_div_blocks(html, "priklad"):
        if not tid:
            tid = f"task-{len(tasks) + 1}"
        num_m = re.search(r"(\d+)$", tid)
        num = int(num_m.group(1)) if num_m else len(tasks) + 1

        prompt = _extract_zone(body, "zadani")
        if not prompt:
            # whole body minus reseni
            prompt = re.sub(
                r'<div\s+class="reseni"[\s\S]*$',
                "",
                body,
                flags=re.I,
            ).strip()

        hint = ""
        sol = ""
        for dm in re.finditer(
            r"<details([^>]*)>[\s\S]*?<summary[^>]*>(.*?)</summary>"
            r'([\s\S]*?)</details>',
            body,
            re.I,
        ):
            dattrs = dm.group(1).lower()
            summary = re.sub(r"<[^>]+>", "", dm.group(2)).strip().lower()
            content = dm.group(3).strip()
            cm = re.search(
                r'<div class="exercise-details-content">([\s\S]*?)</div>',
                content,
                re.I,
            )
            if cm:
                content = cm.group(1).strip()
            is_sol = (
                "solution" in dattrs
                or "řešení" in summary
                or "reseni" in summary
                or "solution" in summary
            )
            if is_sol:
                sol = content
            else:
                hint = content

        plain = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", prompt)).strip()
        short = plain[:72] + ("…" if len(plain) > 72 else "")

        tasks.append({
            "id": tid,
            "num": num,
            "title": f"Úkol {num}",
            "summary": short,
            "prompt_html": prompt,
            "hint_html": hint,
            "solution_html": sol,
        })

    return {"title": title, "notes": notes, "tasks": tasks}


def extract_with_dom(html: str) -> dict:
    """Use html.parser via browser-less pure regex primary."""
    return parse_exercise_regex(html)


def main() -> int:
    if not OLD_PRI.is_dir():
        print(f"Missing {OLD_PRI}", file=sys.stderr)
        return 1

    existing = {}
    if OUT.is_file():
        try:
            existing = json.loads(OUT.read_text(encoding="utf-8"))
        except Exception:
            existing = {}

    out: dict[str, dict] = {}
    files = sorted(OLD_PRI.rglob("*.html"))
    for fp in files:
        rel = "vyuka_downloaded/priklady/" + fp.relative_to(OLD_PRI).as_posix()
        try:
            html = fp.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            print("skip", rel, e)
            continue
        data = extract_with_dom(html)
        data["path"] = rel
        data["task_count"] = len(data["tasks"])

        # Merge existing ratings if available
        if rel in existing:
            ex_tasks = {t.get("id"): t for t in existing[rel].get("tasks", [])}
            for t in data["tasks"]:
                tid = t.get("id")
                if tid in ex_tasks:
                    old_t = ex_tasks[tid]
                    if "technical_score" in old_t: t["technical_score"] = old_t["technical_score"]
                    if "logical_score" in old_t: t["logical_score"] = old_t["logical_score"]
                    if "challenge_score" in old_t: t["challenge_score"] = old_t["challenge_score"]
                    if "challenge_reason" in old_t: t["challenge_reason"] = old_t["challenge_reason"]

        out[rel] = data
        print(f"  {rel}: {data['task_count']} tasks — {data['title'][:50]}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nWrote {OUT.relative_to(ROOT)} ({len(out)} exercises)")

    empty = [k for k, v in out.items() if not v["tasks"]]
    if empty:
        print(f"WARNING: {len(empty)} exercises with 0 tasks:")
        for k in empty[:10]:
            print(" ", k)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
