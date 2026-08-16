#!/usr/bin/env python3
"""
Clean all quiz question structures across data/quizzes.json:
1. Separate question prompt from code blocks (remove duplicated code from question stem).
2. Clean code blocks: strip markdown fences, remove redundant prompt comments, remove duplicate 'vysledek = ________'.
3. For fill questions with explanation dashes, transform 'code — text' into 'code # text' (Python comment style).
4. For all questions showcasing code (multiple choice, predict output, fill), extract code into q.code so it renders in syntax codeblocks.
5. Guarantee balanced 25/25/25/25% answer distribution across all 4-option questions.
"""

import json
import re
import random
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
QUIZZES_JSON = ROOT / "data" / "quizzes.json"

def clean_code_block(code_str):
    if not code_str:
        return None
        
    c = code_str.strip()
    c = re.sub(r'^```(?:python|bash|cmd|html)?\n?', '', c)
    c = re.sub(r'\n?```$', '', c)
    c = re.sub(r'^`+(?:python)?\n?', '', c)
    c = re.sub(r'\n?`+$', '', c)
    
    lines = []
    for line in c.splitlines():
        stripped = line.strip()
        if stripped in ["`python", "`", "```python", "```"]:
            continue
        # Remove redundant comments repeating prompt keywords
        if stripped.startswith("#") and any(k in stripped for k in ["Doplňte", "Který", "Jaký", "Kterou", "Jak se", "Jakou", "Co vrátí", "Co vypíše", "Co se stane"]):
            continue
        lines.append(line)
        
    c_clean = "\n".join(lines).strip()
    
    # Remove duplicate vysledek = ________ if another blank already exists
    if c_clean.count("________") > 1 and "vysledek = ________" in c_clean:
        c_clean = c_clean.replace("\nvysledek = ________", "").replace("vysledek = ________", "").strip()
        
    return c_clean if c_clean else None

def extract_prompt_and_code(raw_question, existing_code):
    q_text = raw_question or ""
    code_text = existing_code or ""
    
    # 1. Extract triple-backtick blocks
    if "```" in q_text:
        matches = re.findall(r'```(?:python|bash|cmd|html)?\n([\s\S]*?)```', q_text)
        if matches and not code_text:
            code_text = "\n".join(matches)
        q_text = re.sub(r'```(?:python|bash|cmd|html)?\n[\s\S]*?```', '', q_text).strip()
        
    # 2. Extract `python...` blocks
    if "`python" in q_text:
        matches = re.findall(r'`python\n([\s\S]*?)`', q_text)
        if matches and not code_text:
            code_text = "\n".join(matches)
        q_text = re.sub(r'`python\n[\s\S]*?`', '', q_text).strip()
        
    # 3. Extract un-fenced multiline code from question
    if not code_text and "\n\n" in q_text:
        parts = q_text.split("\n\n", 1)
        second = parts[1].strip()
        if any(second.startswith(k) for k in [
            "import ", "from ", "def ", "class ", "with ", "for ", "while ", "if ", "try:",
            "print(", "xs =", "res =", "p =", "data =", "$ ", "> ", "In [", "python ",
            "items =", "molar_masses =", "elements =", "arr =", "v =", "ph_array =", "filename ="
        ]):
            q_text = parts[0].strip()
            code_text = second

    clean_code = clean_code_block(code_text)
    
    # Clean question text
    q_text = q_text.strip()
    q_text = re.sub(r'`python\n[\s\S]*?`', '', q_text).strip()
    q_text = re.sub(r'```[\s\S]*?```', '', q_text).strip()
    
    # Normalize question ending
    if q_text and not q_text.endswith("?") and not q_text.endswith(":") and not q_text.endswith("."):
        q_text += ":"

    return q_text, clean_code

def transform_fill_option(opt):
    if not opt:
        return ""
    opt = str(opt).strip()
    # If option has A) B) C) D) prefix
    opt = re.sub(r'^[A-D]\)\s*', '', opt).strip()
    
    if " — " in opt:
        parts = opt.split(" — ", 1)
        code_part = parts[0].strip().strip('`')
        comment_part = parts[1].strip()
        return f"{code_part}  # {comment_part}"
    elif " - " in opt and len(opt.split(" - ")[0]) < 25 and len(opt.split(" - ")[1]) > 15:
        parts = opt.split(" - ", 1)
        code_part = parts[0].strip().strip('`')
        comment_part = parts[1].strip()
        return f"{code_part}  # {comment_part}"
        
    return opt

def main():
    quizzes = json.loads(QUIZZES_JSON.read_text(encoding="utf-8"))
    
    total_q = 0
    extracted_code_count = 0
    cleaned_fill_count = 0
    
    four_stats = Counter()
    two_stats = Counter()
    c4 = 0
    c2 = 0

    for deck_name, q_list in quizzes.items():
        for q in q_list:
            total_q += 1
            old_q_text = q.get("question", "")
            old_code = q.get("code")
            q_type = q.get("type", "multiple_choice")
            
            # 1. Separate Prompt & Code
            new_q_text, new_code = extract_prompt_and_code(old_q_text, old_code)
            q["question"] = new_q_text
            q["code"] = new_code
            if new_code and not old_code:
                extracted_code_count += 1
                
            # 2. Options and Expected transformation
            opts = q.get("options") or []
            old_ans = q.get("answer")
            
            if q_type == "fill_blank_choice":
                cleaned_fill_count += 1
                raw_exp = q.get("expected", "")
                if " — " in raw_exp:
                    raw_exp = raw_exp.split(" — ")[0].strip()
                elif " - " in raw_exp:
                    raw_exp = raw_exp.split(" - ")[0].strip()
                elif "  # " in raw_exp:
                    raw_exp = raw_exp.split("  # ")[0].strip()
                q["expected"] = raw_exp.strip('`').strip()
                
                # Transform all options to "code  # comment" style
                new_opts = [transform_fill_option(o) for o in opts if o]
            else:
                # Multiple choice, predict output, true/false
                new_opts = [re.sub(r'^[A-D]\)\s*', '', str(o)).strip() for o in opts if o]

            # Determine correct value
            if q_type == "fill_blank_choice" and q.get("expected"):
                # Find which option matches expected
                exp_token = q["expected"]
                matched_idx = 0
                for i, o in enumerate(new_opts):
                    token = o.split("  # ")[0].split(" # ")[0].strip()
                    if token == exp_token or token == exp_token + "()" or exp_token == token + "()":
                        matched_idx = i
                        break
                correct_val = new_opts[matched_idx] if new_opts else exp_token
            elif isinstance(old_ans, int) and 0 <= old_ans < len(new_opts):
                correct_val = new_opts[old_ans]
            else:
                correct_val = new_opts[0] if new_opts else ""

            if correct_val not in new_opts and new_opts:
                new_opts[0] = correct_val

            distractors = [o for o in new_opts if o != correct_val]
            seen = set()
            uniq_dist = []
            for d in distractors:
                if d not in seen:
                    seen.add(d)
                    uniq_dist.append(d)

            n_opts = len(new_opts)
            if n_opts == 4:
                target_pos = [0, 1, 2, 3][c4 % 4]
                c4 += 1
                four_stats[target_pos] += 1
            elif n_opts == 2:
                target_pos = [0, 1][c2 % 2]
                c2 += 1
                two_stats[target_pos] += 1
            else:
                target_pos = 0

            # Shuffle distractors with question seed
            rnd = random.Random(hash(f"{deck_name}_{q.get('id')}"))
            rnd.shuffle(uniq_dist)

            final_opts = list(uniq_dist[:n_opts - 1])
            final_opts.insert(target_pos, correct_val)

            if q_type in ["multiple_choice", "predict_output", "true_false_tricky"]:
                letter_map = ["A) ", "B) ", "C) ", "D) "]
                final_opts = [f"{letter_map[idx]}{opt}" for idx, opt in enumerate(final_opts)]

            q["options"] = final_opts
            q["answer"] = target_pos

    print("=== QUIZ STRUCTURE REFACTORING RESULTS ===")
    print(f"Total questions processed: {total_q}")
    print(f"Code snippets extracted to dedicated codeblocks: {extracted_code_count}")
    print(f"Fill questions transformed: {cleaned_fill_count}")
    print(f"4-Option Balanced Distribution: {dict(four_stats)}")

    QUIZZES_JSON.write_text(json.dumps(quizzes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("  ✓ Saved cleaned quizzes to data/quizzes.json")

if __name__ == "__main__":
    main()
