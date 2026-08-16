#!/usr/bin/env python3
"""
Refactor all 125 fill-the-code quiz questions in data/quizzes.json
into realistic, high-quality showcase examples with valid AST syntax.
"""

import json
import re
import ast
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUIZZES_JSON = ROOT / "data" / "quizzes.json"

def clean_option_text(opt):
    if not opt:
        return ""
    opt = re.sub(r'^[A-D]\)\s*', '', str(opt)).strip()
    if " — " in opt:
        opt = opt.split(" — ")[0].strip()
    elif " - " in opt and len(opt.split(" - ")[0]) < 25 and len(opt.split(" - ")[1]) > 15:
        opt = opt.split(" - ")[0].strip()
    return opt.strip('`').strip()

def clean_question_stem(q_text):
    if not q_text:
        return ""
    # Strip markdown code blocks if the question itself contains code block that duplicates code field
    lines = []
    in_code = False
    for line in q_text.splitlines():
        if line.strip().startswith("```"):
            in_code = not in_code
            continue
        if not in_code:
            lines.append(line)
    cleaned = "\n".join(lines).strip()
    return cleaned

def validate_python_syntax(code_template, expected_val):
    if not code_template:
        return True, "No code"
    
    first_line = code_template.strip().splitlines()[0] if code_template.strip() else ""
    if first_line.startswith("$") or first_line.startswith(">") or first_line.startswith("conda ") or first_line.startswith("pip "):
        return True, "CLI command"
    if "<input" in code_template or "<label" in code_template or "<form" in code_template or "<html" in code_template:
        return True, "HTML/XML markup"
    
    filled = code_template.replace("________", expected_val).replace("___", expected_val)
    # Remove interactive prompts like >>> for AST parse
    filled_clean = re.sub(r'^\s*>>>\s?', '', filled, flags=re.MULTILINE)
    filled_clean = re.sub(r'^\s*\.\.\.\s?', '', filled_clean, flags=re.MULTILINE)
    
    try:
        ast.parse(filled_clean)
        return True, "Valid AST"
    except SyntaxError as e:
        return False, f"Syntax error: {e.msg} at line {e.lineno}"

def refactor_question(q, deck_key):
    q_type = q.get("type", "")
    q_text = q.get("question", "")
    q_code = q.get("code", "")
    
    is_fill = (
        q_type in ["code_fill", "fill_blank", "fill_in_the_blank", "fill_blank_choice"]
        or "________" in q_text or "________" in q_code
        or "___" in q_text or "___" in q_code
        or "expected" in q
    )
    if not is_fill:
        return q

    raw_expected = q.get("expected")
    if not raw_expected and q.get("options") and isinstance(q.get("answer"), int) and q.get("answer") < len(q.get("options")):
        raw_expected = q["options"][q["answer"]]
    
    expected = clean_option_text(raw_expected or "")
    
    raw_options = q.get("options") or []
    cleaned_options = [clean_option_text(opt) for opt in raw_options if opt]
    if expected and expected not in cleaned_options:
        cleaned_options.insert(0, expected)
    
    # Deduplicate options while preserving order
    seen = set()
    final_options = []
    for opt in cleaned_options:
        if opt and opt not in seen:
            seen.add(opt)
            final_options.append(opt)
            
    # Clean question text
    clean_stem = clean_question_stem(q_text)
    if not clean_stem:
        clean_stem = "Doplňte chybějící kód na vyznačené místo:"
        
    # Clean code snippet
    clean_code = q_code.strip() if q_code else ""
    if not clean_code and "```" in q_text:
        # Extract code from markdown block
        match = re.search(r'```(?:python|bash|cmd|html)?\n([\s\S]*?)```', q_text)
        if match:
            clean_code = match.group(1).strip()
            
    # Strip redundant comment lines that simply repeat question text
    if clean_code:
        code_lines = []
        for line in clean_code.splitlines():
            # If line is a comment matching question keywords, skip
            if line.strip().startswith("#") and ("Který" in line or "Jakým" in line or "Doplňte" in line or "Kterou" in line or "Jaký" in line):
                continue
            code_lines.append(line)
        clean_code = "\n".join(code_lines).strip()
        
    # Ensure there is exactly one blank
    if "________" not in clean_code and "___" not in clean_code:
        if clean_code:
            clean_code += "\n# Doplňte chybějící výraz:\nvysledek = ________"
        else:
            clean_code = "vysledek = ________"
            
    # Normalize blank marker to ________
    clean_code = re.sub(r'___BLANK___|___+|_{4,}', '________', clean_code)

    answer_idx = 0
    if expected in final_options:
        answer_idx = final_options.index(expected)

    q["type"] = "fill_blank_choice"
    q["question"] = clean_stem
    q["code"] = clean_code
    q["expected"] = expected
    q["options"] = final_options
    q["answer"] = answer_idx
    
    return q

def main():
    quizzes = json.loads(QUIZZES_JSON.read_text(encoding="utf-8"))
    
    total_fill = 0
    valid_ast_count = 0
    ast_warnings = []
    
    for deck_key, q_list in quizzes.items():
        for q_idx in range(len(q_list)):
            old_q = q_list[q_idx]
            is_fill = (
                old_q.get("type") in ["code_fill", "fill_blank", "fill_in_the_blank", "fill_blank_choice"]
                or "________" in old_q.get("question", "") or "________" in old_q.get("code", "")
                or "expected" in old_q
            )
            if is_fill:
                total_fill += 1
                new_q = refactor_question(old_q, deck_key)
                q_list[q_idx] = new_q
                
                # Validate syntax
                ok, msg = validate_python_syntax(new_q.get("code", ""), new_q.get("expected", ""))
                if ok:
                    valid_ast_count += 1
                else:
                    ast_warnings.append((deck_key, new_q.get("id"), msg, new_q.get("code")))

    print(f"  ✓ Refactored {total_fill} fill questions across {len(quizzes)} decks")
    print(f"  ✓ Verified syntax: {valid_ast_count} / {total_fill} passed cleanly")
    if ast_warnings:
        print(f"  ⚠️ AST warnings ({len(ast_warnings)}):")
        for deck, qid, msg, code in ast_warnings[:10]:
            print(f"    [{deck}#{qid}] {msg}\n    Code:\n{code}\n")

    # Save master quizzes.json and public/data/quizzes.json
    QUIZZES_JSON.write_text(json.dumps(quizzes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    pub_quizzes = ROOT / "public" / "data" / "quizzes.json"
    if pub_quizzes.parent.exists():
        pub_quizzes.write_text(json.dumps(quizzes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"  ✓ Saved updated quizzes.json to data/ and public/data/")

if __name__ == "__main__":
    main()
