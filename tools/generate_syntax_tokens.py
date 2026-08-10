#!/usr/bin/env python3
"""
Dynamic Python Syntax Token Generator.
Imports standard library `builtins` & `keyword` directly from Python runtime,
and generates standard ES module token sets for app/js/highlight.js and app/js/format.js.
"""

import builtins
import keyword
import json
import os

def generate_tokens():
    # 1. Fetch official Python keywords
    py_keywords = sorted([kw for kw in keyword.kwlist if not kw.startswith('_')])

    # 2. Fetch official Python builtins (functions and types)
    builtin_names = set(dir(builtins))
    # Exclude internal dunder attributes, exceptions, and non-function identifiers
    py_builtins = sorted([
        name for name in builtin_names
        if not name.startswith('_')
        and not (name[0].isupper() and name.endswith('Error'))
        and name not in {'BaseException', 'Exception', 'Warning', 'Copyright', 'Credits', 'License'}
    ])

    # Add standard self/cls convention
    if 'self' not in py_builtins:
        py_builtins.append('self')
    if 'cls' not in py_builtins:
        py_builtins.append('cls')
    py_builtins.sort()

    js_tokens = f"""/**
 * Auto-generated Python Syntax Tokens from Python Runtime.
 * Generated via tools/generate_syntax_tokens.py using official Python standard library `builtins` & `keyword`.
 */

export const DYNAMIC_PY_KEYWORDS = new Set({json.dumps(py_keywords, indent=2)});

export const DYNAMIC_PY_BUILTINS = new Set({json.dumps(py_builtins, indent=2)});
"""

    output_path = os.path.join("app", "js", "syntax_tokens.js")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(js_tokens)

    print(f"[OK] Generated {len(py_keywords)} Python keywords and {len(py_builtins)} Python builtins in {output_path}")

if __name__ == "__main__":
    generate_tokens()
