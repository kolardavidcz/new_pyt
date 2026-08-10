#!/usr/bin/env python3
"""
Comprehensive Lecture Content Artifact & REPL Formatter.
1. Removes line number artifacts like `6: {}` -> `{}` and `7: {}` -> `{}` inside REPL code blocks.
2. Normalizes `    >>>` and `    ...` to `>>>` and `...` (0-indentation).
3. Normalizes REPL return value outputs to 0-level indentation.
Runs on all HTML and JSON files across the project.
"""

import re
import glob
import os

def clean_pre_content(content):
    lines = content.split('\n')
    fixed = []
    for line in lines:
        raw = line
        stripped = line.strip()

        # Fix prompt indentation: "    >>>" -> ">>>", "    ..." -> "..."
        if stripped.startswith("&gt;&gt;&gt;") or stripped.startswith(">>>") or stripped.startswith("\\u0026gt;\\u0026gt;\\u0026gt;"):
            raw = re.sub(r'^\s*(?:&gt;&gt;&gt;|>>>|\\u0026gt;\\u0026gt;\\u0026gt;)', '>>>', line)
            if "\\u0026gt;" in line:
                raw = re.sub(r'^\s*\\u0026gt;\\u0026gt;\\u0026gt;', '\\u0026gt;\\u0026gt;\\u0026gt;', line)
            elif "&gt;&gt;&gt;" in line:
                raw = re.sub(r'^\s*&gt;&gt;&gt;', '&gt;&gt;&gt;', line)
            else:
                raw = re.sub(r'^\s*>>>', '>>>', line)
        elif stripped.startswith("&lt;...&gt;") or stripped.startswith("...") or stripped.startswith("\\u0026lt;...\\u0026gt;"):
            if "\\u0026lt;" in line:
                raw = re.sub(r'^\s*\\u0026lt;...\u0026gt;', '\\u0026lt;...\\u0026gt;', line)
            elif "&lt;...&gt;" in line:
                raw = re.sub(r'^\s*&lt;...\&gt;', '&lt;...&gt;', line)
            else:
                raw = re.sub(r'^\s*\.\.\.', '...', line)

        # Fix line number prefixes like "6: {}" -> "{}" or "7: {}" -> "{}"
        raw = re.sub(r'^\s*\d+:\s*(\{\}|\[\]|\(\))', r'\1', raw)
        raw = re.sub(r'\b\d+:\s*(\{\}|\[\]|\(\))', r'\1', raw)

        fixed.append(raw)
    return '\n'.join(fixed)

def process_file_text(text):
    # Process inside <pre...>...</pre> in HTML or JSON
    pattern = re.compile(r'(<pre[^>]*>)(.*?)(</pre>)|(\\u003cpre[^>]*\\u003e)(.*?)(\\u003c/pre\\u003e)', re.DOTALL)

    def sub_func(m):
        prefix = m.group(1) or m.group(4)
        body = m.group(2) or m.group(5)
        suffix = m.group(3) or m.group(6)
        cleaned_body = clean_pre_content(body)
        return f"{prefix}{cleaned_body}{suffix}"

    return pattern.sub(sub_func, text)

def run():
    modified = 0
    file_patterns = [
        "vyuka_downloaded/**/*.html",
        "public/vyuka_downloaded/**/*.html",
        "data/**/*.json",
        "public/data/**/*.json"
    ]
    files = set()
    for pat in file_patterns:
        files.update(glob.glob(pat, recursive=True))

    for fpath in sorted(files):
        if not os.path.isfile(fpath):
            continue
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            new_content = process_file_text(content)

            # Extra global cleanup for `6: {}` / `7: {}` if present
            new_content = new_content.replace("6: {}", "{}").replace("7: {}", "{}")

            if new_content != content:
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                modified += 1
                print(f"  [OK] Cleaned REPL artifacts in {fpath}")
        except Exception as e:
            print(f"  [ERROR] {fpath}: {e}")

    print(f"\nCompleted artifact cleanup: {modified} files updated.")

if __name__ == "__main__":
    run()
