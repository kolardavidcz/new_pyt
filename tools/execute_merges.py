import json
from pathlib import Path

root = Path(".")
course_path = root / "data" / "course.json"
slides_path = root / "data" / "slides.json"

with open(course_path, encoding="utf-8") as f:
    course = json.load(f)

with open(slides_path, encoding="utf-8") as f:
    slides = json.load(f)

print("Executing presentation merges in course.json and slides.json...")

# 1. Map of files to remove from active lectures (merged into primary targets)
merged_sources_to_remove = {
    "vyuka_downloaded/materialy/python/types/_annotations.html",
    "vyuka_downloaded/materialy/python/cmd/execution_ossystem.html",
    "vyuka_downloaded/materialy/python/testing/profiling.html",
    "vyuka_downloaded/materialy/python/files/texts.html",
    "vyuka_downloaded/materialy/python/files/binary.html",
    "vyuka_downloaded/materialy/python/modules/_basics.html",
}

# Updates to primary lecture titles and descriptions
primary_updates = {
    "vyuka_downloaded/materialy/python/functions/annotations.html": {
        "title": "Anotace typů & Modul typing (PEP 526)",
        "desc": "Anotace funkcí, proměnných a objektů, typování kontejnerů, ClassVar a __future__.annotations.",
        "week": 4
    },
    "vyuka_downloaded/materialy/python/cmd/execution_subprocess.html": {
        "title": "Spouštění procesů: od os.system() k subprocess",
        "desc": "Spouštění vnějších příkazů, os.system vs subprocess.run, pipes, stdio přesměrování a bezpečnost.",
        "week": 12
    },
    "vyuka_downloaded/materialy/python/testing/timeit.html": {
        "title": "Měření výkonu & Profilování (timeit, cProfile, pstats)",
        "desc": "Mikro-benchmarking pomocí timeit a komplexní profilování aplikací přes cProfile a pstats.",
        "week": 11
    },
    "vyuka_downloaded/materialy/python/files/basics.html": {
        "title": "Práce se soubory (Textové a binární stromy)",
        "desc": "Základy I/O operací, textové soubory, kódování UTF-8, binární data, seek/tell a buffering.",
        "week": 8
    },
    "vyuka_downloaded/materialy/python/modules/_modules.html": {
        "title": "Moduly, Balíčky & Namespaces",
        "desc": "Architektura modulů, importy, sys.path, __name__ == '__main__', __init__.py a balíčky.",
        "week": 4
    },
    "vyuka_downloaded/materialy/python/testing/doctests.html": {
        "title": "Dokumentační testy (doctest)",
        "desc": "Spustitelná dokumentace v docstringách a CLI testování.",
        "week": 11
    },
    "vyuka_downloaded/materialy/python/pitfalls.html": {
        "title": "Pythoní záludnosti & Pasti v jazyce",
        "desc": "Master přehled záludností, mutabilních výchozích argumentů, LEGB scopingu a tuple mutací.",
        "week": 13
    }
}

# Deduplicate lectures in course.json and update titles/weeks
for w in course["weeks"]:
    new_lectures = []
    seen_paths = set()
    for l in w.get("lectures", []):
        path = l["path"]
        if path in merged_sources_to_remove:
            print(f"  • Removed merged lecture from W{w['week']}: {l['title']} ({path})")
            continue
        if path in seen_paths:
            print(f"  • Deduplicated lecture from W{w['week']}: {l['title']} ({path})")
            continue
        seen_paths.add(path)

        if path in primary_updates:
            up = primary_updates[path]
            l["title"] = up["title"]
            l["desc"] = up["desc"]
            l["week"] = up["week"]

        new_lectures.append(l)
    w["lectures"] = new_lectures

# Ensure moved/updated lectures are in their correct target week
for path, up in primary_updates.items():
    target_w_num = up["week"]
    # Find lecture obj
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
        found_lecture["week"] = target_w_num
        target_w = next(w for w in course["weeks"] if w["week"] == target_w_num)
        target_w["lectures"].append(found_lecture)
        print(f"  ✓ Placed updated primary lecture into W{target_w_num}: {found_lecture['title']}")

# Update stats
total_active = sum(len(w.get("lectures", [])) for w in course["weeks"] if w["week"] != 99)
course["meta"]["stats"]["lectures"] = total_active

with open(course_path, "w", encoding="utf-8") as f:
    json.dump(course, f, indent=2, ensure_ascii=False)

print(f"\n✅ Merges applied successfully! Total active lectures now: {total_active}")
