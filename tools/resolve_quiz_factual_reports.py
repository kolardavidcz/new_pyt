#!/usr/bin/env python3
"""
Fix factual/unclear quiz questions in data/quizzes.json and mark the corresponding reports resolved in local and Upstash DB.
"""

import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
QUIZZES_JSON = ROOT / "data" / "quizzes.json"
DB_JSON = ROOT / "data" / "question_improvements.json"
PUB_DB_JSON = ROOT / "public" / "data" / "question_improvements.json"

def main():
    quizzes = json.loads(QUIZZES_JSON.read_text(encoding="utf-8"))
    
    # ── 1. Fix NamedTuples#q5 ─────────────────────────────────────
    nt_list = quizzes.get("NamedTuples", [])
    q5 = next((q for q in nt_list if q.get("id") == "q5"), None)
    if q5:
        q5["question"] = "Proč vestavěné pomocné metody a atributy třídy `namedtuple` (např. `_fields`, `_make`, `_asdict`, `_replace`) začínají podtržítkem?"
        q5["options"] = [
            "A) Aby se zabránilo kolizi s názvy uživatelských polí a atributů dané n-tice (např. pokud se pole jmenuje 'fields' nebo 'make').",
            "B) Jde o striktní interní privátní metody, které standardní uživatelský kód nesmí nikdy volat.",
            "C) Podtržítko signalizuje kompilátoru Cythonu přímé volání nativní C funkce v CPythonu.",
            "D) Aby se odlišily instanční metody od statických metod rodičovské třídy tuple."
        ]
        q5["answer"] = 0
        q5["explanation"] = "Tvůrci standardní knihovny použili úvodní podtržítko u metod pojmenované n-tice záměrně, aby umožnili pojmenovat uživatelská pole jakkoliv (např. 'make', 'fields', 'replace') bez rizika kolize s metodami n-tice."
        print("  ✓ Updated NamedTuples#q5 with crystal-clear phrasing")

    # ── 2. Fix DefaultDicts#q4 ────────────────────────────────────
    dd_list = quizzes.get("DefaultDicts", [])
    q4 = next((q for q in dd_list if q.get("id") == "q4"), None)
    if q4:
        q4["question"] = "Jaký je zásadní rozdíl v chování a výkonu mezi `defaultdict(list)` a voláním běžné metody `d.setdefault(k, [])`?"
        q4["options"] = [
            "A) defaultdict volá tovární funkci líně pouze při absenci klíče, zatímco u setdefault(k, []) se nový prázdný seznam vytvoří v paměti při každém volání.",
            "B) defaultdict neumí do slovníku vložit nově vytvořený klíč, zatímco setdefault klíč vždy trvale zapíše.",
            "C) setdefault funguje pouze s neměnnými typy (int, str), zatímco defaultdict akceptuje pouze měnitelné kontejnery.",
            "D) Mezi oběma přístupy není žádný výkonnostní ani sémantický rozdíl, liší se pouze zápisem syntaxe."
        ]
        q4["answer"] = 0
        q4["explanation"] = "Při volání d.setdefault(k, []) se prázdný seznam [] v argumentu vytvoří v paměti vždy (eagerly), i když klíč ve slovníku již existuje. Naproti tomu defaultdict volá továrnu list líně (lazy) výhradně ve chvíli, kdy klíč skutečně chybí."
        print("  ✓ Updated DefaultDicts#q4 with crystal-clear phrasing")

    # ── 3. Balance 25/25/25/25% distribution across all 115 decks ──
    four_stats = Counter()
    c4 = 0
    import random
    
    for deck_name, q_list in quizzes.items():
        for q in q_list:
            opts = q.get("options")
            if not opts or len(opts) != 4:
                continue
            old_ans = q.get("answer") if isinstance(q.get("answer"), int) and 0 <= q.get("answer") < 4 else 0
            correct_val = opts[old_ans]
            # Strip A) B) C) D)
            import re
            cleaned_opts = [re.sub(r'^[A-D]\)\s*', '', str(o)).strip() for o in opts]
            correct_clean = re.sub(r'^[A-D]\)\s*', '', str(correct_val)).strip()
            
            distractors = [o for o in cleaned_opts if o != correct_clean]
            seen = set()
            uniq_dist = []
            for d in distractors:
                if d not in seen:
                    seen.add(d)
                    uniq_dist.append(d)
                    
            target_pos = [0, 1, 2, 3][c4 % 4]
            c4 += 1
            four_stats[target_pos] += 1
            
            rnd = random.Random(hash(f"{deck_name}_{q.get('id')}"))
            rnd.shuffle(uniq_dist)
            
            final_opts = list(uniq_dist[:3])
            final_opts.insert(target_pos, correct_clean)
            
            q_type = q.get("type", "multiple_choice")
            if q_type in ["multiple_choice", "predict_output", "true_false_tricky"]:
                letter_map = ["A) ", "B) ", "C) ", "D) "]
                final_opts = [f"{letter_map[idx]}{opt}" for idx, opt in enumerate(final_opts)]
                
            q["options"] = final_opts
            q["answer"] = target_pos

    print(f"  ✓ Rebalanced 4-option questions: {dict(four_stats)}")
    QUIZZES_JSON.write_text(json.dumps(quizzes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("  ✓ Saved quizzes.json")

    # ── 4. Update Database of Reports ──────────────────────────────
    local_items = []
    if DB_JSON.exists():
        try:
            local_items = json.loads(DB_JSON.read_text(encoding="utf-8"))
        except:
            local_items = []

    remote_items = []
    kv_url = "https://tough-husky-101028.upstash.io"
    kv_token = "gQAAAAAAAYqkAAIgcDFiZjJmZTQ3MWE4OTg0MWJjOWUwYmY5ZjU3MGEzOTg3NA"

    try:
        req = urllib.request.Request(
            f"{kv_url}/get/pyt:global:question_improvements",
            headers={"Authorization": f"Bearer {kv_token}"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data and data.get("result"):
                res_val = data["result"]
                while isinstance(res_val, str):
                    try:
                        res_val = json.loads(res_val)
                    except:
                        break
                remote_items = res_val if isinstance(res_val, list) else []
    except Exception as e:
        print(f"  ⚠️ Could not fetch remote items: {e}")

    by_id = {}
    for item in (remote_items or []) + (local_items or []):
        if isinstance(item, dict) and item.get("id"):
            by_id[item["id"]] = item

    now_iso = datetime.now(timezone.utc).isoformat()

    # Update NamedTuples report
    if "imp-1786792491221-w0eq" in by_id:
        r = by_id["imp-1786792491221-w0eq"]
        r["status"] = "resolved"
        r["resolvedAt"] = now_iso
        r["fixSummary"] = "Zpřesněna formulace otázky, možností a vysvětlení: explicitně vysvětleno předcházení kolizím s uživatelskými názvy atributů/polí n-tice."
        print("  ✓ Marked imp-1786792491221-w0eq as resolved")

    # Update DefaultDicts report
    if "imp-1786923441890-uugn" in by_id:
        r = by_id["imp-1786923441890-uugn"]
        r["status"] = "resolved"
        r["resolvedAt"] = now_iso
        r["fixSummary"] = "Zpřesněna formulace otázky a možností: detailně vysvětleno líné (lazy) volání továrny list u defaultdict oproti zbytečné alokaci prázdného seznamu [] v paměti při každém volání d.setdefault()."
        print("  ✓ Marked imp-1786923441890-uugn as resolved")

    merged_list = sorted(list(by_id.values()), key=lambda x: x.get("timestamp", ""), reverse=True)

    # Save to local disk
    data_str = json.dumps(merged_list, indent=2, ensure_ascii=False) + "\n"
    DB_JSON.write_text(data_str, encoding="utf-8")
    if PUB_DB_JSON.parent.exists():
        PUB_DB_JSON.write_text(data_str, encoding="utf-8")
    print("  ✓ Saved updated reports to data/question_improvements.json and public/data/question_improvements.json")

    # Push to Upstash Redis
    try:
        set_req = urllib.request.Request(
            f"{kv_url}/set/pyt:global:question_improvements",
            data=json.dumps(json.dumps(merged_list, ensure_ascii=False)).encode("utf-8"),
            headers={"Authorization": f"Bearer {kv_token}"},
            method="POST"
        )
        with urllib.request.urlopen(set_req, timeout=5) as resp:
            if resp.status == 200:
                print("  ✓ Successfully synced resolved reports to Upstash Cloud DB!")
    except Exception as e:
        print(f"  ⚠️ Could not push to Upstash Redis: {e}")

if __name__ == "__main__":
    main()
