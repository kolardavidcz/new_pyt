import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

with open(ROOT / "data" / "exercises.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Anchors given explicitly in prompt
ANCHORS = {
    ("vyuka_downloaded/priklady/python/zaklady.html", "task-1"): (1, 1, "Direct arithmetic with no design decisions required."),
    ("vyuka_downloaded/priklady/python/zaklady.html", "task-5"): (2, 1, "Loop syntax is mechanical with obvious step-by-step logic."),
    ("vyuka_downloaded/priklady/python/vyjimky.html", "task-1"): (2, 3, "Basic list deletion syntax, but requires insight on mutating during iteration."),
    ("vyuka_downloaded/priklady/python/vyjimky.html", "task-2"): (2, 3, "Deleting occurrences in list requires handling index shifting during loop."),
    ("vyuka_downloaded/priklady/python/vyjimky.html", "task-3"): (2, 3, "Dict deletion requires handling mutation during iteration."),
    ("vyuka_downloaded/priklady/python/vyjimky.html", "task-4"): (2, 3, "Dict item deletion requires care with key iteration during mutation."),
    ("vyuka_downloaded/priklady/python/vyjimky.html", "task-5"): (2, 3, "Set element deletion requires handling KeyError vs popping during iteration."),
    ("vyuka_downloaded/priklady/python/vyjimky.html", "task-6"): (2, 3, "ByteArray element deletion requires handling byte sequence mutation."),
    ("vyuka_downloaded/priklady/python/vyjimky.html", "task-7"): (2, 3, "ByteArray element occurrence deletion requires handling index shifts."),
    ("vyuka_downloaded/priklady/python/dekoratory.html", "task-1"): (4, 2, "Decorator syntax is technically advanced, but inner timing logic is routine."),
    ("vyuka_downloaded/priklady/python/dekoratory.html", "task-5"): (4, 3, "Decorator wrapper mechanics combined with non-trivial regex string stripping."),
    ("vyuka_downloaded/priklady/python/procvicovani.sifry.html", "task-1"): (3, 3, "String index shifting is simple, but key handling requires modest strategy."),
    ("vyuka_downloaded/priklady/python/procvicovani.sifry.html", "task-2"): (3, 3, "Variable shift Caesar cipher requires index arithmetic and key logic."),
    ("vyuka_downloaded/priklady/python/procvicovani.sifry.html", "task-3"): (3, 3, "Brute-force Caesar shift cracking requires frequency/word recognition logic."),
    ("vyuka_downloaded/priklady/python/procvicovani.sifry.html", "task-4"): (3, 5, "Vigenère cipher requires multi-letter index wrapping and key alignment."),
    ("vyuka_downloaded/priklady/python/procvicovani.sifry.html", "task-5"): (3, 5, "Cracking Vigenère ciphertext with wordlist requires open-ended key search."),
    ("vyuka_downloaded/priklady/python/magic.html", "task-1"): (5, 4, "Requires magic-method dunder mechanics and non-trivial cyclic slicing math."),
    ("vyuka_downloaded/priklady/python/big.html", "task-1"): (4, 1, "Dict timing load is standard I/O API use with explicit instructions."),
    ("vyuka_downloaded/priklady/python/big.html", "task-2"): (4, 1, "defaultdict timing load uses stdlib module with no algorithmic complexity."),
    ("vyuka_downloaded/priklady/python/big.html", "task-3"): (4, 1, "mmap binary file reading is technical API learning with direct instructions."),
    ("vyuka_downloaded/priklady/python/big.html", "task-4"): (4, 1, "Pickle serialization timing is stdlib API usage with explicit steps."),
    ("vyuka_downloaded/priklady/python/big.html", "task-5"): (4, 1, "Comparing timing of stored binary structures is direct benchmark execution."),
    ("vyuka_downloaded/priklady/python/procvicovani.pstnost.html", "task-1"): (2, 4, "Simple loop with random module, but Monte Carlo pi estimation requires mathematical insight."),
    ("vyuka_downloaded/priklady/python/procvicovani.pstnost.html", "task-6"): (3, 5, "Simulates Brownian motion with variable steps and compounding random physical modeling."),
    ("vyuka_downloaded/priklady/media/steganografie.html", "task-3"): (3, 4, "Bitwise pixel manipulation with moderate syntax, but requires prose algorithm translation."),
    ("vyuka_downloaded/priklady/media/pnm.sachovnice.html", "task-1"): (2, 1, "Basic PBM file writing with simple checkerboard loop logic."),
    ("vyuka_downloaded/priklady/media/pnm.sachovnice.html", "task-3"): (4, 2, "Binary PNM format encoding needs binary I/O, while checkerboard logic remains flat."),
    ("vyuka_downloaded/priklady/media/pnm.sachovnice.html", "task-4"): (4, 2, "Binary PNM variant encoding needs binary I/O with flat checkerboard logic."),
    ("vyuka_downloaded/priklady/media/pnm.sachovnice.html", "task-5"): (4, 2, "Binary PGM format encoding needs binary I/O with flat checkerboard logic."),
    ("vyuka_downloaded/priklady/media/pnm.sachovnice.html", "task-6"): (4, 2, "Binary PPM format encoding needs binary I/O with flat checkerboard logic."),
    ("vyuka_downloaded/priklady/media/pnm.sachovnice.html", "task-7"): (4, 2, "Binary PPM variant encoding needs binary I/O with flat checkerboard logic.")
}

def rate_task(filepath, task):
    tid = task.get("id")
    if (filepath, tid) in ANCHORS:
        t, l, r = ANCHORS[(filepath, tid)]
        return t, l, r

    title = task.get("title", "")
    prompt = task.get("prompt_html", "") + " " + task.get("summary", "")
    hint = task.get("hint_html", "")
    sol = task.get("solution_html", "")
    full_text = (prompt + " " + hint + " " + sol).lower()

    # Rule-based rating for non-anchor tasks
    # Technical difficulty (T)
    t = 2
    if any(k in full_text for k in ["dekorátor", "decorator", "generátor", "generator", "yield", "mmap", "pickle", " magic ", "__getitem__", "__iter__", "třída", "class "]):
        t = 4
    elif any(k in full_text for k in ["fasta", "fastq", "ansi", "escape", "numpy", "pillow", "struct", "binary", "bajtový", "bytearray"]):
        t = 4
    elif any(k in full_text for k in ["slovník", "dict", "množin", "set", "soubor", "file", "výjimk", "except", " příkazové řádce", "sys.argv"]):
        t = 3
    elif any(k in full_text for k in ["seznam", "list", "řetězec", "string", "funkce", "def ", "cyklus", "for ", "while"]):
        t = 2
    elif any(k in full_text for k in ["sečtěte", "print", "vypište čísl"]):
        t = 1

    # Specific file-level technical adjustments
    if "bioinfo" in filepath or "fastN" in filepath:
        if "dekorátor" in full_text:
            t = 5
        else:
            t = 4
    elif "grafika" in filepath or "pnm" in filepath or "steganografie" in filepath:
        if "numpy" in full_text or "pillow" in full_text or "bajt" in full_text or "binary" in full_text:
            t = 4
        else:
            t = 3
    elif "magic.html" in filepath:
        t = 5
    elif "dekoratory.html" in filepath:
        t = 4
    elif "iteratory.html" in filepath:
        t = 4

    # Insight difficulty (L)
    l = 2
    if any(k in full_text for k in ["brown", "monte carlo", "šifr", "vigenère", "steganograf", "game of life", "život"]):
        l = 4 if "vigenère" not in full_text and "brown" not in full_text else 5
    elif any(k in full_text for k in ["aproxim", "prvočísl", "fibonacci", "iterací rovnici", "rovnici", "komplexní", "převod do desítkové", "prvočísla"]):
        l = 3
    elif any(k in full_text for k in ["smazat", "mazá", "výjimk"]):
        l = 3
    elif any(k in full_text for k in ["přepište", "upravte", "vypište prvních", "sečtěte"]):
        l = 1
    elif any(k in full_text for k in ["porovnejte", "seřaďte", "vyextrahujte"]):
        l = 2

    # Reasoning string synthesis
    reasons = []
    if t == 1: reasons.append("Uses basic arithmetic or print syntax")
    elif t == 2: reasons.append("Uses basic loops and function definitions")
    elif t == 3: reasons.append("Uses dicts, file I/O, or string formatting")
    elif t == 4: reasons.append("Requires advanced decorators, generators, or stdlib APIs")
    elif t == 5: reasons.append("Combines advanced OOP magic methods or custom binary formats")

    if l == 1: reasons.append("direct mechanical step-by-step instructions.")
    elif l == 2: reasons.append("routine logic with obvious problem structure.")
    elif l == 3: reasons.append("requires a standard algorithmic trick or careful edge cases.")
    elif l == 4: reasons.append("requires deriving algorithmic logic or non-obvious data transformations.")
    elif l == 5: reasons.append("requires non-trivial cryptanalysis or physical simulation reasoning.")

    reason = f"{reasons[0]} with {reasons[1]}"
    # Truncate reason if longer than 24 words
    words = reason.split()
    if len(words) > 24:
        reason = " ".join(words[:24])

    return t, l, reason

# Process all tasks
updated_count = 0
for filepath, ex in data.items():
    tasks = ex.get("tasks", [])
    for t in tasks:
        tech, log, reason = rate_task(filepath, t)
        t["technical_score"] = tech
        t["logical_score"] = log
        t["challenge_score"] = max(tech, log) # Keep unified score alias as well
        t["challenge_reason"] = reason
        updated_count += 1

with open(ROOT / "data" / "exercises.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Successfully rated {updated_count} tasks across {len(data)} exercise files!")
