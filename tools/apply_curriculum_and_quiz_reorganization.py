#!/usr/bin/env python3
"""
Reorganize course topics and quiz decks:
1. Move frozenset after set (W3)
2. Move git basics before git advanced (W0)
3. Disambiguate all 17 overview.html lectures and duplicate basenames
4. Recover all authentic question sets from per-week files into data/quizzes.json
5. Enforce 25/25/25/25% balanced option distribution
"""

import json
import re
import random
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
COURSE_JSON = ROOT / "data" / "course.json"
QUIZZES_JSON = ROOT / "data" / "quizzes.json"

def clean_option(opt):
    opt = re.sub(r'^[A-D]\)\s*', '', str(opt)).strip()
    return opt

def main():
    course = json.loads(COURSE_JSON.read_text(encoding="utf-8"))
    
    # ── 1. Fix Topic Ordering in course.json ──────────────────────
    weeks = course["weeks"]
    
    # Week 0: Ensure git.html comes before git.advanced.html
    w0 = next(w for w in weeks if w["week"] == 0)
    w0_lectures = w0["lectures"]
    git_basic = next((l for l in w0_lectures if "git.html" in l["path"] and "git.advanced" not in l["path"]), None)
    git_adv = next((l for l in w0_lectures if "git.advanced.html" in l["path"]), None)
    if git_basic and git_adv:
        w0_lectures = [l for l in w0_lectures if l not in (git_basic, git_adv)]
        w0_lectures.append(git_basic)
        w0_lectures.append(git_adv)
        w0["lectures"] = w0_lectures
        print("  ✓ Week 0: Ordered Git základy -> Git pokročilý")

    # Week 2 & 3: Move frozensets.html from Week 2 to Week 3 (after sets.html)
    w2 = next(w for w in weeks if w["week"] == 2)
    w3 = next(w for w in weeks if w["week"] == 3)
    
    frozen_lec = next((l for l in w2["lectures"] if "frozensets.html" in l["path"]), None)
    if frozen_lec:
        w2["lectures"] = [l for l in w2["lectures"] if l != frozen_lec]
        frozen_lec["week"] = 3
        # Insert into w3 after sets.html
        w3_lectures = w3["lectures"]
        sets_idx = next((i for i, l in enumerate(w3_lectures) if "sets.html" in l["path"]), -1)
        if sets_idx >= 0:
            w3_lectures.insert(sets_idx + 1, frozen_lec)
        else:
            w3_lectures.append(frozen_lec)
        w3["lectures"] = w3_lectures
        print("  ✓ Moved frozensets.html from Week 2 to Week 3 directly after sets.html")

    # ── 2. Assign Unique Slugs and quiz_deck to All Lectures ──────────
    DECK_MAPPING = {
        # Overviews
        "materialy/jupyter/overview.html": ("jupyter_overview", "jupyter_overview"),
        "materialy/python/sorting/overview.html": ("sorting_overview", "sorting_overview"),
        "materialy/python/files/overview.html": ("files_overview", "files_overview"),
        "materialy/python/serialization/overview.html": ("serialization_overview", "serialization_overview"),
        "materialy/python/functions/overview.html": ("functions_overview", "functions_overview"),
        "materialy/python/cmd/overview.html": ("cmd_overview", "cmd_overview"),
        "materialy/python/numpy/overview.html": ("numpy_overview", "numpy_overview"),
        "materialy/python/pandas/overview.html": ("pandas_overview", "pandas_overview"),
        "materialy/python/testing/overview.html": ("testing_overview", "testing_overview"),
        "materialy/python/regexps/overview.html": ("regexps_overview", "regexps_overview"),
        "materialy/python/speed/overview.html": ("speed_overview", "speed_overview"),
        "materialy/python/externalibs/overview.html": ("externalibs_overview", "externalibs_overview"),
        "materialy/python/cython/overview.html": ("cython_overview", "cython_overview"),
        "materialy/techs/recursion/overview.html": ("recursion_overview", "recursion_overview"),
        "materialy/dvcs/overview.html": ("dvcs_overview", "dvcs_overview"),
        "materialy/python/packages/virtual_overview.html": ("virtual_overview", "virtual_overview"),
        "materialy/python/packages/conda_overview.html": ("conda_overview", "conda_overview"),
        # Basics
        "materialy/python/basics.html": ("control_flow", "control_flow"),
        "materialy/python/files/basics.html": ("files_basics", "files_basics"),
        "materialy/python/objects/basics.html": ("objects_basics", "objects_basics"),
        # Examples
        "materialy/python/pandas/example-1.html": ("pandas_example_1", "pandas_example_1"),
        "materialy/python/pandas/example-2.html": ("pandas_example_2", "pandas_example_2"),
        "materialy/python/speed/example-1.html": ("speed_example_1", "speed_example_1"),
        # Decorators
        "materialy/python/functions/decorators.html": ("decorators", "decorators"),
        "materialy/python/objects/decorators.html": ("class_decorators", "class_decorators"),
        # FP
        "materialy/python/fp.html": ("fp", "fp"),
        "materialy/python/functions/advanced-3.html": ("advanced_3", "advanced_3"),
    }

    for w in weeks:
        for lec in w["lectures"]:
            path = lec["path"].replace("vyuka_downloaded/", "")
            for map_path, (slug, quiz_deck) in DECK_MAPPING.items():
                if path.endswith(map_path) or map_path in path:
                    lec["slug"] = slug
                    lec["quiz_deck"] = quiz_deck
                    break

    COURSE_JSON.write_text(json.dumps(course, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("  ✓ Updated data/course.json with unique slugs and quiz_deck bindings")

    # ── 3. Recover All Question Decks from Weekly Files ───────────
    master_quizzes = json.loads(QUIZZES_JSON.read_text(encoding="utf-8")) if QUIZZES_JSON.exists() else {}

    # Load weekly files
    weekly_decks = {}
    for i in list(range(14)) + [99]:
        wf = ROOT / "public" / "data" / "quizzes" / f"w{i}.json"
        if wf.exists():
            weekly_decks[i] = json.loads(wf.read_text(encoding="utf-8"))

    # Map recovered questions
    if 0 in weekly_decks and "overview" in weekly_decks[0]:
        master_quizzes["jupyter_overview"] = weekly_decks[0]["overview"]
    if 1 in weekly_decks and "basics" in weekly_decks[1]:
        master_quizzes["control_flow"] = weekly_decks[1]["basics"]
    if 2 in weekly_decks:
        if "sorting_overview" in weekly_decks[2]:
            master_quizzes["sorting_overview"] = weekly_decks[2]["sorting_overview"]
        if "files_overview" in weekly_decks[2]:
            master_quizzes["files_overview"] = weekly_decks[2]["files_overview"]
    if 3 in weekly_decks and "overview" in weekly_decks[3]:
        master_quizzes["serialization_overview"] = weekly_decks[3]["overview"]
    if 4 in weekly_decks and "overview" in weekly_decks[4]:
        master_quizzes["functions_overview"] = weekly_decks[4]["overview"]
    if 7 in weekly_decks and "overview" in weekly_decks[7]:
        master_quizzes["cmd_overview"] = weekly_decks[7]["overview"]
    if 8 in weekly_decks:
        if "basics" in weekly_decks[8]:
            master_quizzes["files_basics"] = weekly_decks[8]["basics"]
        if "decorators" in weekly_decks[8]:
            master_quizzes["class_decorators"] = weekly_decks[8]["decorators"]
    if 9 in weekly_decks and "overview" in weekly_decks[9]:
        master_quizzes["numpy_overview"] = weekly_decks[9]["overview"]
    if 10 in weekly_decks:
        if "overview" in weekly_decks[10]:
            master_quizzes["pandas_overview"] = weekly_decks[10]["overview"]
        if "example-1" in weekly_decks[10]:
            master_quizzes["pandas_example_1"] = weekly_decks[10]["example-1"]
    if 11 in weekly_decks:
        if "overview" in weekly_decks[11]:
            master_quizzes["regexps_overview"] = weekly_decks[11]["overview"]
    if 12 in weekly_decks:
        if "speed_overview" in weekly_decks[12]:
            master_quizzes["speed_overview"] = weekly_decks[12]["speed_overview"]
        if "speed_example_1" in weekly_decks[12]:
            master_quizzes["speed_example_1"] = weekly_decks[12]["speed_example_1"]
        if "externalibs_overview" in weekly_decks[12]:
            master_quizzes["externalibs_overview"] = weekly_decks[12]["externalibs_overview"]
        if "cython_overview" in weekly_decks[12]:
            master_quizzes["cython_overview"] = weekly_decks[12]["cython_overview"]
    if 99 in weekly_decks:
        if "basics" in weekly_decks[99]:
            master_quizzes["objects_basics"] = weekly_decks[99]["basics"]
        if "example-2" in weekly_decks[99]:
            master_quizzes["pandas_example_2"] = weekly_decks[99]["example-2"]
        if "recursion_overview" in weekly_decks[99]:
            master_quizzes["recursion_overview"] = weekly_decks[99]["recursion_overview"]
        if "dvcs_overview" in weekly_decks[99]:
            master_quizzes["dvcs_overview"] = weekly_decks[99]["dvcs_overview"]
        if "advanced-3" in weekly_decks[99]:
            master_quizzes["advanced_3"] = weekly_decks[99]["advanced-3"]

    # Dedicated testing_overview questions (W11 testing/overview.html)
    master_quizzes["testing_overview"] = [
        {
            "id": "q1",
            "type": "multiple_choice",
            "question": "Jaký je primární účel automatizovaného testování v Pythonu?",
            "options": [
                "A) Ověření správnosti chování kódu a prevence regresních chyb při změnách",
                "B) Automatická kompilace zdrojového kódu do binárního formátu C",
                "C) Zrychlení běhu kódu v interpretru Pythonu",
                "D) Generování dokumentace z docstringů"
            ],
            "answer": 0,
            "explanation": "Hlavním cílem automatizovaného testování je ověřit, že funkce a moduly pracují dle specifikace, a předejít nechtěnému zanesení chyb (regresí) při úpravách."
        },
        {
            "id": "q2",
            "type": "multiple_choice",
            "question": "Které klíčové slovo v Pythonu slouží k základnímu ověření pravdivosti podmínky během vývoje a testování?",
            "options": [
                "A) assert",
                "B) check",
                "C) verify",
                "D) expect"
            ],
            "answer": 0,
            "explanation": "Příkaz `assert podmínka, zpráva` vyhodnotí výraz a v případě False vyvolá výjimku `AssertionError`."
        },
        {
            "id": "q3",
            "type": "multiple_choice",
            "question": "Jaký je rozdíl mezi integračními a jednotkovými (unit) testy?",
            "options": [
                "A) Unit testy testují izolovaně jednotlivé funkce/třídy, zatímco integrační testy ověřují spolupráci více komponent",
                "B) Unit testy se spouštějí v C++, integrační pouze v Pythonu",
                "C) Unit testy testují pouze databáze, integrační pouze uživatelské rozhraní",
                "D) Mezi pojmy není žádný technický rozdíl"
            ],
            "answer": 0,
            "explanation": "Jednotkové (unit) testy ověřují nejmenší izolované jednotky kódu (funkce, metody), zatímco integrační testy ověřují souhru více modulů (např. databáze a aplikační logika)."
        },
        {
            "id": "q4",
            "type": "fill_blank_choice",
            "question": "Doplňte klíčové slovo pro ověření výsledku funkce v testovacím kódu:",
            "code": "def test_add():\n    ________ add(2, 3) == 5, \"Součet 2 + 3 musí být 5\"",
            "expected": "assert",
            "options": ["assert", "check", "verify", "expect"],
            "answer": 0,
            "explanation": "Klíčové slovo `assert` vyhodnocuje pravdivostní podmínku a při neúspěchu vyvolá AssertionError."
        },
        {
            "id": "q5",
            "type": "multiple_choice",
            "question": "Co znamená pojem 'Test Fixture' v testovacích rámcích?",
            "options": [
                "A) Příprava a následný úklid fixního prostředí a dat potřebných pro provedení testů",
                "B) Název chybové hlášky při selhání testu",
                "C) Nástroj pro měření rychlosti procesoru",
                "D) Knihovna pro mockování webových soketů"
            ],
            "answer": 0,
            "explanation": "Fixture představuje přípravu prostředí (inicializace databáze, vytvoření dočasných souborů) a jeho následný úklid po skončení testů (např. metody setUp a tearDown)."
        }
    ]

    print(f"  ✓ Total quiz decks consolidated in master dataset: {len(master_quizzes)}")

    # ── 4. Balance 25/25/25/25% across all decks ───────────────────
    four_opt_cycle = [0, 1, 2, 3]
    two_opt_cycle = [0, 1]
    c4 = 0
    c2 = 0
    
    four_stats = Counter()
    two_stats = Counter()

    for deck_name, q_list in master_quizzes.items():
        for q in q_list:
            opts = q.get("options")
            if not opts or not isinstance(opts, list) or len(opts) < 2:
                continue
                
            old_ans = q.get("answer")
            q_type = q.get("type", "")
            
            if q_type == "fill_blank_choice" and q.get("expected"):
                correct_val = clean_option(q["expected"])
            elif isinstance(old_ans, int) and 0 <= old_ans < len(opts):
                correct_val = clean_option(opts[old_ans])
            else:
                correct_val = clean_option(opts[0])
                
            cleaned_opts = [clean_option(o) for o in opts if o]
            if correct_val not in cleaned_opts:
                cleaned_opts[0] = correct_val
                
            distractors = [o for o in cleaned_opts if o != correct_val]
            seen = set()
            uniq_dist = []
            for d in distractors:
                if d not in seen:
                    seen.add(d)
                    uniq_dist.append(d)
                    
            n_opts = len(cleaned_opts)
            if n_opts == 4:
                target_pos = four_opt_cycle[c4 % 4]
                c4 += 1
                four_stats[target_pos] += 1
            elif n_opts == 2:
                target_pos = two_opt_cycle[c2 % 2]
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
            if q_type == "fill_blank_choice":
                q["expected"] = correct_val

    print(f"\n=== BALANCED ANSWER DISTRIBUTION ({sum(four_stats.values())} 4-opt questions) ===")
    for p in range(4):
        pct = (four_stats[p] / sum(four_stats.values())) * 100
        print(f"  Position {p} ({['A','B','C','D'][p]}): {four_stats[p]} ({pct:.1f}%)")

    # Save to data/quizzes.json
    QUIZZES_JSON.write_text(json.dumps(master_quizzes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("  ✓ Saved consolidated and balanced quizzes to data/quizzes.json")

if __name__ == "__main__":
    main()
