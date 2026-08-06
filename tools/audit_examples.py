import os
import re
from pathlib import Path

root = Path("public/vyuka_downloaded")
html_files = list(root.glob("**/*.html"))

examples = []
missing_src = []
missing_out = []
py_files_needing_out = []

for h in html_files:
    try:
        content = h.read_text(encoding="utf-8", errors="ignore")
        matches = re.findall(r'<example\s+[^>]*src=["\']([^"\']+)["\'][^>]*>', content)
        for m in matches:
            examples.append((h, m))
            target = h.parent / m
            if not target.exists():
                missing_src.append((h, m, target))
            elif target.suffix == ".py":
                # Check if matching .out exists
                out_target = target.with_suffix(".out")
                if not out_target.exists():
                    missing_out.append((h, target, out_target))
                else:
                    py_files_needing_out.append((target, out_target))
    except Exception as e:
        pass

print(f"Total <example> tags found: {len(examples)}")
print(f"Missing referenced files (.py/.txt/.out): {len(missing_src)}")
print(f".py files with existing .out files: {len(py_files_needing_out)}")
print(f".py files missing corresponding .out files: {len(missing_out)}")

if missing_out:
    print("\nSample .py files missing .out file:")
    for h, py, out in missing_out[:10]:
        print(f"  {py} -> missing {out.name}")
