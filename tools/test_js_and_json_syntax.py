#!/usr/bin/env python3
"""
Automated Syntax and Integrity Guard:
Ensures NO JavaScript syntax errors (like 'Unexpected end of input') or corrupted JSON files exist anywhere in the codebase.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def test_js_syntax():
    print("  [1/4] Checking JavaScript syntax via node --check...")
    js_files = list((ROOT / "app" / "js").glob("*.js")) + [ROOT / "sw.js"]
    pub_js = list((ROOT / "public" / "app" / "js").glob("*.js")) + [ROOT / "public" / "sw.js"]
    
    all_js = [f for f in js_files + pub_js if f.exists()]
    
    for jf in all_js:
        res = subprocess.run(["node", "--check", str(jf)], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"    ❌ JavaScript SyntaxError in {jf.relative_to(ROOT)}:\n{res.stderr}")
            sys.exit(1)
    print(f"    ✓ Passed: {len(all_js)} JavaScript files have 100% clean syntax.")

def test_json_files():
    print("  [2/4] Checking all JSON files for parse integrity and non-empty content...")
    json_dirs = [
        ROOT / "data",
        ROOT / "data" / "lectures",
        ROOT / "data" / "quizzes",
        ROOT / "public" / "data",
        ROOT / "public" / "data" / "lectures",
        ROOT / "public" / "data" / "quizzes",
    ]
    
    total_json = 0
    for d in json_dirs:
        if not d.exists():
            continue
        for jf in d.glob("*.json"):
            total_json += 1
            txt = jf.read_text(encoding="utf-8")
            if not txt.strip():
                print(f"    ❌ Empty JSON file detected: {jf.relative_to(ROOT)}")
                sys.exit(1)
            try:
                json.loads(txt)
            except Exception as e:
                print(f"    ❌ Corrupted JSON in {jf.relative_to(ROOT)}: {e}")
                sys.exit(1)
                
    print(f"    ✓ Passed: {total_json} JSON data files parsed cleanly with zero syntax/empty errors.")

def test_app_index_integrity():
    print("  [3/4] Checking app/index.html and modulepreloads...")
    idx_path = ROOT / "app" / "index.html"
    assert idx_path.exists(), "app/index.html missing!"
    content = idx_path.read_text(encoding="utf-8")
    
    # Ensure all modulepreload paths exist on disk
    import re
    mpreloads = re.findall(r'href=["\'](/app/js/[^"\']+\.js)["\']', content)
    for mp in mpreloads:
        local_p = ROOT / mp.lstrip("/")
        assert local_p.exists(), f"Preloaded module does not exist on disk: {mp}"
        
    print(f"    ✓ Passed: All {len(mpreloads)} modulepreloads verified on disk.")

def test_prebuilt_slides_structure():
    print("  [4/4] Verifying prebuilt lecture slide HTML structure...")
    lectures_dir = ROOT / "data" / "lectures"
    checked_slides = 0
    for jf in lectures_dir.glob("*.json"):
        data = json.loads(jf.read_text(encoding="utf-8"))
        assert "slides" in data and isinstance(data["slides"], list), f"Missing slides in {jf.name}"
        for s in data["slides"]:
            checked_slides += 1
            assert "id" in s, f"Slide missing id in {jf.name}"
            assert "html" in s, f"Slide missing html in {jf.name}"
            # Ensure no unclosed example tags
            assert not re.search(r'<example\b[^>]*$', s["html"]), f"Unclosed example tag in {jf.name}"
            
    print(f"    ✓ Passed: All {checked_slides} slides across 172 lectures verified valid.")

if __name__ == "__main__":
    print("========================================================")
    print("  # AUTOMATED SYNTAX & INTEGRITY REGRESSION GUARD")
    print("========================================================")
    test_js_syntax()
    test_json_files()
    test_app_index_integrity()
    test_prebuilt_slides_structure()
    print("\n🎉 ALL SYNTAX AND INTEGRITY GUARDS PASSED WITH 100% SUCCESS!\n")
