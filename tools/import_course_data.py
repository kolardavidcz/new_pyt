#!/usr/bin/env python3
"""Import legacy course metadata into data/course.json and data/slides.json.

Reads:
  .old/cjs/course-data.js
  .old/cjs/slide-classification.js
  .old/data/lecture-pages.json (optional page outlines)

Writes:
  data/course.json
  data/slides.json
  data/pages-index.json  (id + title per lecture path, no full HTML bodies)
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OLD = ROOT / ".old"
OUT = ROOT / "data"


def extract_js_assignment(path: Path, var_patterns: list[str]) -> str:
    text = path.read_text(encoding="utf-8")
    for pat in var_patterns:
        m = re.search(pat, text, re.S)
        if m:
            return m.group(1).rstrip().rstrip(";")
    raise ValueError(f"Could not extract assignment from {path}")


def js_value_to_json(js_expr: str) -> object:
    """Evaluate a JS expression via Node and return parsed JSON.

    Writes a temp script (Windows cmdline length limits make -e unsafe for large payloads).
    """
    import tempfile

    script = (
        "const v = (" + js_expr + ");\n"
        "process.stdout.write(JSON.stringify(v));\n"
    )
    with tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        suffix=".mjs",
        delete=False,
        dir=str(ROOT / "tools"),
    ) as tmp:
        tmp.write(script)
        tmp_path = tmp.name
    try:
        proc = subprocess.run(
            ["node", tmp_path],
            capture_output=True,
            text=True,
            encoding="utf-8",
            cwd=str(ROOT),
        )
    finally:
        try:
            Path(tmp_path).unlink(missing_ok=True)
        except OSError:
            pass
    if proc.returncode != 0:
        raise RuntimeError(f"Node parse failed:\n{proc.stderr}")
    return json.loads(proc.stdout)


def slug_from_path(path: str) -> str:
    name = Path(path).stem
    return name


def item_id(kind: str, path: str) -> str:
    # stable id from path
    clean = path.replace("\\", "/").removeprefix("vyuka_downloaded/")
    return f"{kind}:{clean}"


def normalize_item(item: dict, kind: str, week: int) -> dict:
    path = item.get("path", "").replace("\\", "/")
    tags = item.get("tags") or []
    if isinstance(tags, str):
        tags = [tags]
    tags = [str(t) for t in tags]
    relevance = item.get("relevance")
    try:
        relevance = int(relevance) if relevance is not None else 5
    except (TypeError, ValueError):
        relevance = 5
    relevance = max(1, min(10, relevance))

    return {
        "id": item_id(kind, path),
        "kind": kind,  # lecture | exercise
        "title": item.get("title") or Path(path).stem,
        "path": path,
        "slug": slug_from_path(path),
        "tags": tags,
        "relevance": relevance,
        "diff": item.get("diff") or "basics",
        "desc": item.get("desc") or "",
        "compare": item.get("compare") or "",
        "week": week,
    }


def resolve_path(path: str) -> Path:
    """Logical path under vyuka_downloaded → filesystem under .old/."""
    p = path.replace("\\", "/")
    if p.startswith("vyuka_downloaded/"):
        return OLD / p
    return OLD / "vyuka_downloaded" / p


def build_course() -> dict:
    raw = extract_js_assignment(
        OLD / "cjs" / "course-data.js",
        [r"window\.courseData\s*=\s*(\[[\s\S]*\])\s*;?\s*$",
         r"window\.courseData\s*=\s*(\[[\s\S]*\])"],
    )
    weeks_in = js_value_to_json(raw)
    weeks_out = []
    stats = {"lectures": 0, "exercises": 0, "missing": 0, "missing_paths": []}

    for w in weeks_in:
        week_num = int(w.get("week", 0))
        lectures = [normalize_item(x, "lecture", week_num) for x in (w.get("lectures") or [])]
        exercises = [normalize_item(x, "exercise", week_num) for x in (w.get("exercises") or [])]

        for item in lectures + exercises:
            fs = resolve_path(item["path"])
            item["exists"] = fs.is_file()
            if not item["exists"]:
                stats["missing"] += 1
                if len(stats["missing_paths"]) < 20:
                    stats["missing_paths"].append(item["path"])

        stats["lectures"] += len(lectures)
        stats["exercises"] += len(exercises)

        weeks_out.append({
            "week": week_num,
            "id": f"week-{week_num}",
            "title": w.get("title") or f"Týden {week_num}",
            "description": w.get("description") or "",
            "lectures": lectures,
            "exercises": exercises,
        })

    return {
        "meta": {
            "title": "Python — C/Java → Python",
            "source": ".old/cjs/course-data.js",
            "version": 1,
            "stats": {
                "weeks": len(weeks_out),
                "lectures": stats["lectures"],
                "exercises": stats["exercises"],
                "missing": stats["missing"],
            },
        },
        "weeks": weeks_out,
        "_import_notes": {
            "missing_paths": stats["missing_paths"],
        },
    }


def build_slides() -> dict:
    path = OLD / "cjs" / "slide-classification.js"
    if not path.is_file():
        return {}
    raw = extract_js_assignment(
        path,
        [r"window\.SLIDE_CLASS\s*=\s*(\{[\s\S]*\})\s*;?\s*$",
         r"window\.SLIDE_CLASS\s*=\s*(\{[\s\S]*\})",
         r"SLIDE_CLASS\s*=\s*(\{[\s\S]*\})"],
    )
    data = js_value_to_json(raw)
    # Normalize to { "slug#idN": { "diff": "..." } }
    out = {}
    for key, val in data.items():
        if isinstance(val, str):
            out[key] = {"diff": val}
        elif isinstance(val, dict):
            out[key] = val
        else:
            out[key] = {"diff": str(val)}
    return out


def build_pages_index() -> dict:
    """Lightweight page outline from lecture-pages.json or by scanning HTML."""
    lp = OLD / "data" / "lecture-pages.json"
    index: dict[str, list[dict]] = {}

    if lp.is_file():
        full = json.loads(lp.read_text(encoding="utf-8"))
        for path, pages in full.items():
            path = path.replace("\\", "/")
            index[path] = [
                {"id": p.get("id"), "title": p.get("title") or p.get("id")}
                for p in pages
                if isinstance(p, dict) and p.get("id")
            ]
        return index

    # Fallback: scan HTML for section.slide-section
    from html.parser import HTMLParser

    class SectionParser(HTMLParser):
        def __init__(self):
            super().__init__()
            self.pages = []
            self._in_h2 = False
            self._cur_id = None
            self._buf = []

        def handle_starttag(self, tag, attrs):
            ad = dict(attrs)
            if tag == "section" and "slide-section" in (ad.get("class") or ""):
                self._cur_id = ad.get("id")
                title = ad.get("data-title")
                if self._cur_id:
                    self.pages.append({"id": self._cur_id, "title": title or self._cur_id})
            if tag == "h2" and self._cur_id and self.pages and not self.pages[-1].get("title"):
                self._in_h2 = True
                self._buf = []

        def handle_endtag(self, tag):
            if tag == "h2" and self._in_h2:
                self._in_h2 = False
                if self.pages:
                    self.pages[-1]["title"] = "".join(self._buf).strip() or self.pages[-1]["id"]

        def handle_data(self, data):
            if self._in_h2:
                self._buf.append(data)

    for html in (OLD / "vyuka_downloaded").rglob("*.html"):
        try:
            text = html.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        if "slide-section" not in text:
            continue
        parser = SectionParser()
        try:
            parser.feed(text)
        except Exception:
            continue
        if not parser.pages:
            continue
        rel = "vyuka_downloaded/" + html.relative_to(OLD / "vyuka_downloaded").as_posix()
        index[rel] = parser.pages

    return index


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)

    print("Importing course-data.js …")
    course = build_course()
    course_path = OUT / "course.json"
    course_path.write_text(
        json.dumps(course, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    s = course["meta"]["stats"]
    print(f"  → {course_path.relative_to(ROOT)}")
    print(f"     weeks={s['weeks']} lectures={s['lectures']} exercises={s['exercises']} missing={s['missing']}")

    print("Importing slide-classification.js …")
    slides = build_slides()
    slides_path = OUT / "slides.json"
    slides_path.write_text(
        json.dumps(slides, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"  → {slides_path.relative_to(ROOT)} ({len(slides)} keys)")

    print("Building pages index …")
    pages = build_pages_index()
    pages_path = OUT / "pages-index.json"
    pages_path.write_text(
        json.dumps(pages, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"  → {pages_path.relative_to(ROOT)} ({len(pages)} lectures with pages)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
