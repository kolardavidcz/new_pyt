#!/usr/bin/env python3
"""Enrich data/course.json by inserting all missing lectures into their correct week curriculum."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

COURSE_PATH = ROOT / "data" / "course.json"
PUB_COURSE_PATH = ROOT / "public" / "data" / "course.json"

with open(COURSE_PATH, "r", encoding="utf-8") as f:
    course = json.load(f)

# Helper to check if lecture already present
existing_paths = set()
for week in course.get("weeks", []):
    for item in week.get("lectures", []) + week.get("exercises", []):
        p = item.get("path", "").replace("\\", "/")
        existing_paths.add(p)

def make_lecture(path, title, slug, desc, tags=["Core"], relevance=8, diff="resyntax", compare=""):
    return {
        "id": f"lecture:{path}",
        "kind": "lecture",
        "title": title,
        "path": path,
        "slug": slug,
        "tags": tags,
        "relevance": relevance,
        "diff": diff,
        "desc": desc,
        "compare": compare,
        "exists": True
    }

# Mapping of missing lectures to target weeks
additions = {
    1: [
        make_lecture("vyuka_downloaded/materialy/python/3vs2.html", "Python 3 vs Python 2", "3vs2", "Klíčové rozdíly mezi verzí Python 2 a moderním Python 3.", ["Insight"], 6, "basics")
    ],
    2: [
        make_lecture("vyuka_downloaded/materialy/python/types/_sequences.html", "Sekvenční typy – Obecné vlastnosti", "_sequences", "Společné operace pro všechny sekvence: indexování, výřezy [:][::], funkce len(), operátory in/not in a del.", ["Core"], 10, "basics", "Společné rozhraní pro řetězce, seznamy, n-tice a bajty. Odpovídá rozhraní std::sequence nebo List<T> v Javě."),
        make_lecture("vyuka_downloaded/materialy/python/types/bytearrays.html", "Bajtová pole (bytearray)", "bytearrays", "Modifikovatelná sekvence bajtů v paměti.", ["Practice"], 7, "resyntax"),
        make_lecture("vyuka_downloaded/materialy/python/types/frozensets.html", "Neměnné množiny (frozenset)", "frozensets", "Hašovatelná neměnná množina použitelná jako klíč ve slovníku.", ["Tricky"], 7, "resyntax"),
        make_lecture("vyuka_downloaded/materialy/python/types.plus/deques.html", "Oboustranné fronty (collections.deque)", "deques", "Rychlé vkládání a odebírání z obou konců v O(1).", ["WOW"], 8, "pythonic", "Ekvivalent std::deque v C++."),
        make_lecture("vyuka_downloaded/materialy/python/types.plus/Counters.html", "Počítadla (collections.Counter)", "Counters", "Specializovaný slovník pro frekvenční analýzu prvků.", ["WOW"], 8, "pythonic"),
        make_lecture("vyuka_downloaded/materialy/python/types.plus/bisects.html", "Bisekce a půlení intervalů (bisect)", "bisects", "Rychlé vyhledávání v seřazených sekvencích.", ["Insight"], 7, "pythonic"),
        make_lecture("vyuka_downloaded/materialy/python/sorting/advanced.html", "Pokročilé techniky řazení", "advanced_sorting", "Použití operator.itemgetter a complex key sorting.", ["Insight"], 8, "pythonic")
    ],
    3: [
        make_lecture("vyuka_downloaded/materialy/python/functions/_functions.html", "Funkce – Přehled a definice", "_functions", "Definice funkcí, návratové hodnoty, typy parametrů a dokumentační řetězce (docstrings).", ["Core"], 9, "basics"),
        make_lecture("vyuka_downloaded/materialy/python/functions/advanced-3.html", "Pokročilé parametry (*args, **kwargs)", "advanced-3", "Variabilní počet pozicionálních a pojmenovaných argumentů.", ["Core", "WOW"], 9, "pythonic"),
        make_lecture("vyuka_downloaded/materialy/python/functions/functional.html", "Funkcionální programování", "functional", "Práce s funkcemi jako prvotřídními objekty: map, filter, reduce a anonymní lambda funkce.", ["Insight"], 8, "paradigm"),
        make_lecture("vyuka_downloaded/materialy/python/types/_annotations.html", "Typové anotace (Type Hints)", "_annotations", "Statické typování v Pythonu pomocí modulu typing a anotací funkcí.", ["WOW"], 9, "pythonic", "Přibližuje Python ke staticky typovaným jazykům jako Java nebo C++ pro IDE kontrolu.")
    ],
    4: [
        make_lecture("vyuka_downloaded/materialy/python/files/texts.html", "Textové soubory a kódování", "texts", "Čtení a zápis textu s explicitním kódováním UTF-8.", ["Core"], 9, "basics"),
        make_lecture("vyuka_downloaded/materialy/python/files/binary.html", "Binární soubory a bajty", "binary", "Práce s binárními daty a souborovými režimy (rb, wb).", ["Core"], 8, "resyntax"),
        make_lecture("vyuka_downloaded/materialy/python/files/streams.html", "Souborové proudy (io.StringIO, io.BytesIO)", "streams", "Práce s paměťovými textovými a binárními proudy.", ["Insight"], 8, "pythonic"),
        make_lecture("vyuka_downloaded/materialy/python/files/tempfile.html", "Dočasné soubory (tempfile)", "tempfile", "Bezpečné vytváření dočasných souborů a adresářů.", ["Practice"], 7, "resyntax"),
        make_lecture("vyuka_downloaded/materialy/python/files/fileinput.html", "Zpracování řádkových vstupů (fileinput)", "fileinput", "Streamovací zpracování souborů předaných z příkazové řádky.", ["Practice"], 7, "pythonic"),
        make_lecture("vyuka_downloaded/materialy/python/serialization/pickle.html", "Serializace objektů (pickle)", "pickle", "Ukládání a načítání živých objektů Pythonu do souboru.", ["Core"], 8, "pythonic"),
        make_lecture("vyuka_downloaded/materialy/python/serialization/shelve.html", "Perzistentní slovníky (shelve)", "shelve", "Key-value databáze nad pickle objekty.", ["Practice"], 7, "pythonic"),
        make_lecture("vyuka_downloaded/materialy/python/serialization/marshal.html", "Nízkoúrovňový bytecode marshal", "marshal", "Interní serializace Python bytecode.", ["Skip"], 5, "resyntax")
    ],
    5: [
        make_lecture("vyuka_downloaded/materialy/python/objects/overview.html", "Objektový model Pythonu – Přehled", "objects_overview", "Magie dunder metod, dědičnost a OOP paradigma v Pythonu.", ["Core"], 9, "paradigm"),
        make_lecture("vyuka_downloaded/materialy/python/objects/basics.html", "Základy tříd a konstruktory", "objects_basics", "Vytváření tříd, konstruktor __init__ a metoda __str__.", ["Core"], 9, "basics"),
        make_lecture("vyuka_downloaded/materialy/python/objects/decorators.html", "Dekorátory funkcí a tříd (@decorator)", "decorators", "Obalování funkcí a předávání kontextu pomocí dekorátorů.", ["WOW", "Legendary"], 10, "pythonic", "Unikátní meta-programovací vzor Pythonu."),
        make_lecture("vyuka_downloaded/materialy/python/objects/introspection.html", "Introspekce objektů (dir, getattr, type)", "introspection", "Dynamické zkoumání vlastností a metod objektů za běhu.", ["WOW"], 9, "pythonic")
    ],
    6: [
        make_lecture("vyuka_downloaded/materialy/python/modules/os.html", "Modul os (Systémové rozhraní)", "mod_os", "Práce s souborovým systémem, cestami a systémovým prostředím.", ["Core"], 9, "basics"),
        make_lecture("vyuka_downloaded/materialy/python/modules/random.html", "Modul random (Náhodná čísla)", "mod_random", "Generování náhodných čísel, výběr z kolekcí a míchání.", ["Core"], 8, "basics"),
        make_lecture("vyuka_downloaded/materialy/python/modules/struct.html", "Modul struct (Binární datové struktury)", "mod_struct", "Balení a rozbalování binárních struktur C/C++ do Python objektů.", ["Tricky"], 8, "resyntax"),
        make_lecture("vyuka_downloaded/materialy/python/modules/textwrap.html", "Modul textwrap (Formátování odstavců)", "mod_textwrap", "Zalomování a zarovnávání textu.", ["Practice"], 7, "basics"),
        make_lecture("vyuka_downloaded/materialy/python/modules/times+dates.html", "Práce s časem a datem (datetime & time)", "mod_datetime", "Reprezentace časových údajů, dat a časových zón.", ["Core"], 9, "basics"),
        make_lecture("vyuka_downloaded/materialy/python/modules/inspect.html", "Modul inspect (Stack & Code Analysis)", "mod_inspect", "Získávání informací o živém kódu a argumentech funkcí.", ["WOW"], 8, "pythonic"),
        make_lecture("vyuka_downloaded/materialy/python/cmd/execution_ossystem.html", "Spouštění vnějších příkazů (subprocess & os.system)", "execution_ossystem", "Volání systémových programů z Pythonu.", ["Practice"], 8, "resyntax"),
        make_lecture("vyuka_downloaded/materialy/python/exceptions/warnings.html", "Varování (warnings)", "warnings", "Správa a zachytávání varovných hlášení (UserWarning, DeprecationWarning).", ["Insight"], 7, "basics")
    ],
    7: [
        make_lecture("vyuka_downloaded/materialy/python/iterators/itertools.html", "Kombinatorické iterátory (itertools)", "itertools", "Efektivní smyčky: count, cycle, chain, product, permutations, combinations.", ["WOW"], 9, "pythonic"),
        make_lecture("vyuka_downloaded/materialy/python/testing/overview.html", "Testování kódu (doctest & unittest)", "testing_overview", "Psaní jednotkových testů a testování v docstringách.", ["Core"], 9, "basics"),
        make_lecture("vyuka_downloaded/materialy/python/testing/profiling.html", "Profilování a měření výkonu (cProfile & timeit)", "profiling", "Hledání úzkých hrdel v programu.", ["Insight"], 8, "pythonic"),
        make_lecture("vyuka_downloaded/materialy/python/parallelism/overview.html", "Paralelní výpočty (threading & multiprocessing)", "parallelism", "Vlákna, procesy a zamykání GIL.", ["Tricky", "WOW"], 9, "paradigm"),
        make_lecture("vyuka_downloaded/materialy/python/speed/overview.html", "Zrychlování Pythonu – Přehled", "speed_overview", "Optimalizace algoritmů a profilování.", ["Insight"], 8, "pythonic"),
        make_lecture("vyuka_downloaded/materialy/python/cython/intro.html", "Úvod do Cythonu", "cython_intro", "Kompilace Python kódu do C rozšíření.", ["Legendary"], 8, "paradigm"),
        make_lecture("vyuka_downloaded/materialy/python/externalibs/ctypes_basics.html", "Volání C knihoven (ctypes)", "ctypes_basics", "Načítání sdílených dynamických knihoven (.so/.dll).", ["Legendary"], 8, "paradigm")
    ]
}

inserted_count = 0

for week_obj in course.get("weeks", []):
    wnum = week_obj.get("week")
    if wnum in additions:
        lectures_list = week_obj.setdefault("lectures", [])
        
        # Insert missing lectures that are not already present
        for new_lec in additions[wnum]:
            p = new_lec["path"]
            if p not in existing_paths:
                # If _sequences.html, insert at beginning of week 2!
                if "types/_sequences.html" in p:
                    lectures_list.insert(0, new_lec)
                elif "functions/_functions.html" in p:
                    lectures_list.insert(0, new_lec)
                elif "files/texts.html" in p:
                    lectures_list.insert(0, new_lec)
                elif "objects/overview.html" in p:
                    lectures_list.insert(0, new_lec)
                else:
                    lectures_list.append(new_lec)
                existing_paths.add(p)
                inserted_count += 1

print(f"Successfully inserted {inserted_count} missing lectures into course curriculum!")

# Save to data/course.json and public/data/course.json
with open(COURSE_PATH, "w", encoding="utf-8") as f:
    json.dump(course, f, ensure_ascii=False, indent=2)

with open(PUB_COURSE_PATH, "w", encoding="utf-8") as f:
    json.dump(course, f, ensure_ascii=False, indent=2)

print("Saved enriched course.json to data/ and public/data/!")
