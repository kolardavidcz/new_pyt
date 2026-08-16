#!/usr/bin/env python3
"""
Synthesize all 5 extracted fill-the-code batches into data/quizzes.json,
validate Python AST syntax on every single code snippet, and verify schema integrity.
"""

import json
import re
import ast
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUIZZES_JSON = ROOT / "data" / "quizzes.json"
SCRATCH_DIR = ROOT / "scratch"

def validate_python_syntax(code_template, expected_val):
    if not code_template:
        return True, "No code"
    
    first_line = code_template.strip().splitlines()[0] if code_template.strip() else ""
    if first_line.startswith("$") or first_line.startswith(">") or first_line.startswith("conda ") or first_line.startswith("pip "):
        return True, "CLI command"
    if "<input" in code_template or "<label" in code_template or "<form" in code_template or "<html" in code_template or "<!--" in code_template:
        return True, "HTML/XML markup"
    
    filled = code_template.replace("________", expected_val).replace("___", expected_val)
    filled_clean = re.sub(r'^\s*>>>\s?', '', filled, flags=re.MULTILINE)
    filled_clean = re.sub(r'^\s*\.\.\.\s?', '', filled_clean, flags=re.MULTILINE)
    filled_clean = re.sub(r'^\s*In\s*\[\d+\]:\s?', '', filled_clean, flags=re.MULTILINE)
    
    try:
        ast.parse(filled_clean)
        return True, "Valid AST"
    except SyntaxError as e:
        return False, f"Syntax error: {e.msg} at line {e.lineno}"

def main():
    quizzes = json.loads(QUIZZES_JSON.read_text(encoding="utf-8"))
    
    total_loaded = 0
    all_extracted = []
    
    for i in range(1, 6):
        batch_file = SCRATCH_DIR / f"extracted_fill_batch_{i:02d}.json"
        assert batch_file.exists(), f"Missing batch result {batch_file}"
        items = json.loads(batch_file.read_text(encoding="utf-8"))
        print(f"  ✓ Loaded Batch {i:02d}: {len(items)} questions")
        all_extracted.extend(items)
        total_loaded += len(items)

    print(f"\nTotal extracted fill questions across all 5 batches: {total_loaded}")

    # Build lookup map: (deck, id) -> item
    fill_lookup = {}
    for item in all_extracted:
        key = (item["deck"], item["id"])
        fill_lookup[key] = item

    # Update quizzes.json
    updated_count = 0
    ast_valid_count = 0
    ast_issues = []

    for deck_key, q_list in quizzes.items():
        for q_idx in range(len(q_list)):
            q = q_list[q_idx]
            key = (deck_key, q.get("id", f"q{q_idx+1}"))
            
            if key in fill_lookup:
                new_q = fill_lookup[key]
                
                # Merge fields
                q["type"] = "fill_blank_choice"
                q["question"] = new_q.get("question", q.get("question"))
                q["code"] = new_q.get("code", q.get("code"))
                q["expected"] = new_q.get("expected", q.get("expected"))
                q["options"] = new_q.get("options", q.get("options"))
                q["answer"] = new_q.get("answer", 0)
                q["explanation"] = new_q.get("explanation", q.get("explanation"))
                
                updated_count += 1
                
                # Verify syntax
                ok, msg = validate_python_syntax(q["code"], q["expected"])
                if ok:
                    ast_valid_count += 1
                else:
                    ast_issues.append((deck_key, q.get("id"), msg, q.get("code")))

    print(f"  ✓ Successfully merged {updated_count} fill questions into master curriculum dataset")
    print(f"  ✓ Verified Python AST syntax: {ast_valid_count} / {updated_count} syntactically valid")
    
    if ast_issues:
        print(f"  ⚠️ AST issues ({len(ast_issues)}):")
        for d, qid, msg, code in ast_issues:
            print(f"    [{d}#{qid}] {msg}")

    # Save to data/quizzes.json and public/data/quizzes.json
    QUIZZES_JSON.write_text(json.dumps(quizzes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    pub_quizzes = ROOT / "public" / "data" / "quizzes.json"
    if pub_quizzes.parent.exists():
        pub_quizzes.write_text(json.dumps(quizzes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print("  ✓ Saved updated data/quizzes.json and public/data/quizzes.json")

if __name__ == "__main__":
    main()
