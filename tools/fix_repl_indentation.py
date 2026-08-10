#!/usr/bin/env python3
"""
Standardize Python REPL Output Indentation in pre/code blocks.
Converts indented REPL output lines (`>>> expr\\n    output`) into standard Python REPL format (`>>> expr\\noutput`).
"""

import re
import glob
import os

def fix_repl_in_text(text):
    def replacer(match):
        lines = match.group(0).split('\n')
        fixed = []
        in_prompt = False
        in_continuation = False

        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped.startswith("&gt;&gt;&gt;") or stripped.startswith(">>>") or stripped.startswith("\\u0026gt;\\u0026gt;\\u0026gt;"):
                in_prompt = True
                in_continuation = False
                fixed.append(line)
            elif stripped.startswith("&lt;...&gt;") or stripped.startswith("...") or stripped.startswith("\\u0026lt;...\\u0026gt;"):
                in_continuation = True
                fixed.append(line)
            elif in_prompt and not in_continuation and re.match(r'^\s{4}\S', line):
                fixed.append(line[4:])
            else:
                if not stripped:
                    in_prompt = False
                    in_continuation = False
                fixed.append(line)

        return '\n'.join(fixed)

    pattern = re.compile(r'<pre[^>]*>.*?</pre>|\\u003cpre[^>]*\\u003e.*?\\u003c/pre\\u003e', re.DOTALL)

    def process_pre(m):
        block = m.group(0)
        if ("&gt;&gt;&gt;" in block or ">>>" in block or "\\u0026gt;" in block) and "    " in block:
            return replacer(m)
        return block

    return pattern.sub(process_pre, text)

def run():
    modified = 0
    files = glob.glob("vyuka_downloaded/**/*.html", recursive=True) + \
            glob.glob("public/vyuka_downloaded/**/*.html", recursive=True) + \
            glob.glob("data/**/*.json", recursive=True)

    for fpath in files:
        if not os.path.isfile(fpath):
            continue
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            new_content = fix_repl_in_text(content)
            if new_content != content:
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                modified += 1
                print(f"  [OK] Standardized REPL output in {fpath}")
        except Exception as e:
            print(f"  [ERROR] {fpath}: {e}")

    print(f"\nCompleted REPL output standardization: {modified} files updated.")

if __name__ == "__main__":
    run()
