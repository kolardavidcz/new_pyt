import json
from pathlib import Path

root = Path(".")
course_path = root / "data" / "course.json"

with open(course_path, encoding="utf-8") as f:
    course = json.load(f)

# Define move targets
restorations = {
    # Git presentations -> Week 0 (Příprava prostředí & Rychlý start)
    "vyuka_downloaded/materialy/dvcs/git.html": {
        "target_week": 0,
        "title": "Verzovací systém Git – základy",
        "relevance": 7
    },
    "vyuka_downloaded/materialy/dvcs/git.advanced.html": {
        "target_week": 0,
        "title": "Git pokročilý – rebase, vetvení & hooks",
        "relevance": 7
    },
    # Performance toolchains -> Week 12 (Systémová interakce & FFI / Speed)
    "vyuka_downloaded/materialy/python/speed/overview.html": {
        "target_week": 12,
        "title": "Přehled akcelerace & Performance toolchains (PyPy, Numba, Cython)",
        "relevance": 7
    },
    "vyuka_downloaded/materialy/python/speed/example-1.html": {
        "target_week": 12,
        "title": "Příklad: Filtrace obrázků & JIT akcelerace",
        "relevance": 6
    },
    # All NumPy presentations -> Week 9 (NumPy & Vektorizace for Bioinformatics)
    "vyuka_downloaded/materialy/python/numpy/arrays.creation.html": {
        "target_week": 9,
        "title": "NumPy: Tvorba polí, datové typy & vlastnosti (ndarrays)",
        "relevance": 8
    },
    "vyuka_downloaded/materialy/python/numpy/arrays.operation.html": {
        "target_week": 9,
        "title": "NumPy: Základní matematické operace & univerzální funkce (ufuncs)",
        "relevance": 8
    },
    "vyuka_downloaded/materialy/python/numpy/arrays.slicing.html": {
        "target_week": 9,
        "title": "NumPy: Pokročilé výřezy, 2D/3D slicing & paměťové rozvržení",
        "relevance": 8
    }
}

week_map = {w["week"]: w for w in course["weeks"]}

moved_count = 0
for path, config in restorations.items():
    target_week_num = config["target_week"]
    target_week = week_map[target_week_num]

    # Find and remove from Week 99 (or wherever it currently is)
    found_lecture = None
    for w in course["weeks"]:
        for l in list(w.get("lectures", [])):
            if l["path"] == path:
                found_lecture = l
                w["lectures"].remove(l)
                break
        if found_lecture:
            break
    
    if found_lecture:
        found_lecture["week"] = target_week_num
        found_lecture["title"] = config["title"]
        found_lecture["relevance"] = config["relevance"]
        target_week["lectures"].append(found_lecture)
        moved_count += 1
        print(f"  ✓ Moved to W{target_week_num}: {found_lecture['title']} ({path})")

# Update active lectures count
total_active = sum(len(w.get("lectures", [])) for w in course["weeks"] if w["week"] != 99)
course["meta"]["stats"]["lectures"] = total_active

with open(course_path, "w", encoding="utf-8") as f:
    json.dump(course, f, indent=2, ensure_ascii=False)

print(f"\n✅ Restored {moved_count} requested lectures! Total active lectures now: {total_active}")
