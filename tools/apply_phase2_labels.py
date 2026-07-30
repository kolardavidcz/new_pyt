#!/usr/bin/env python3
"""Phase 2 labeling: apply pedagogically consistent tags/relevance/diff.

Reads data/course.json, writes back with revised labels.
Does not touch .old/. Leaves data/LABELING_CHANGELOG.md.
"""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSE = ROOT / "data" / "course.json"
CHANGELOG = ROOT / "data" / "LABELING_CHANGELOG.md"

# Explicit overrides keyed by item path (authoritative for Phase 2).
# Only fields listed are changed; omit a field to keep imported value.
# Policy: ≤2 tags; Core⊥Skip; Legendary rare; Skip usually ≤5; Core usually ≥6.

OVERRIDES: dict[str, dict] = {
    # ── W0 environment ──────────────────────────────────────────
    "vyuka_downloaded/materialy/python/install.html": {
        "tags": ["Skip"], "relevance": 4, "diff": "basics",
    },
    "vyuka_downloaded/materialy/python/more-versions.html": {
        "tags": ["Skip"], "relevance": 4, "diff": "basics",
    },
    "vyuka_downloaded/materialy/python/packages/virtual_overview.html": {
        "tags": ["Core"], "relevance": 9, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/packages/venv.html": {
        "tags": ["Core"], "relevance": 9, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/packages/pip.html": {
        "tags": ["Core"], "relevance": 9, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/packages/conda_overview.html": {
        "tags": ["Skip"], "relevance": 3, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/packages/conda.html": {
        "tags": ["Skip"], "relevance": 3, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/jupyter/overview.html": {
        "tags": ["WOW"], "relevance": 6, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/jupyter/usage.html": {
        "tags": ["WOW"], "relevance": 6, "diff": "newconcept",
    },

    # ── W1 types & syntax ───────────────────────────────────────
    "vyuka_downloaded/materialy/python/types/_remarks.html": {
        "tags": ["Core", "Tricky"], "relevance": 9, "diff": "paradigm",
    },
    "vyuka_downloaded/materialy/python/basics.html": {
        "tags": ["Core"], "relevance": 10, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/types/numbers.html": {
        "tags": ["Core"], "relevance": 9, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/types/strings.html": {
        "tags": ["Core", "WOW"], "relevance": 10, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/text/encoding.html": {
        "tags": ["Core"], "relevance": 8, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/cmd/print.html": {
        "tags": ["WOW"], "relevance": 6, "diff": "resyntax",
    },
    "vyuka_downloaded/priklady/python/zaklady.html": {
        "tags": ["Core"], "relevance": 7, "diff": "basics",
    },
    "vyuka_downloaded/priklady/python/typy.cisla.html": {
        "tags": ["Core"], "relevance": 7, "diff": "basics",
    },
    "vyuka_downloaded/priklady/python/typy.retezce.html": {
        "tags": ["Core"], "relevance": 8, "diff": "resyntax",
    },
    "vyuka_downloaded/priklady/python/procvicovani.ansi-print.html": {
        "tags": ["WOW"], "relevance": 5, "diff": "resyntax",
    },

    # ── W2 sequences ────────────────────────────────────────────
    "vyuka_downloaded/materialy/python/types/tuples.html": {
        "tags": ["Core"], "relevance": 8, "diff": "resyntax",
    },
    # namedtuple path may vary — handled if present
    "vyuka_downloaded/materialy/python/types/lists.html": {
        "tags": ["Core"], "relevance": 10, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/types/array.html": {
        "tags": ["Skip"], "relevance": 3, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/types/sorting.html": {
        "tags": ["Core", "WOW"], "relevance": 9, "diff": "pythonic",
    },
    "vyuka_downloaded/materialy/python/files/text.html": {
        "tags": ["Core"], "relevance": 9, "diff": "resyntax",
    },

    # ── W3 dicts/sets/exceptions ────────────────────────────────
    "vyuka_downloaded/materialy/python/types/dicts.html": {
        "tags": ["Core"], "relevance": 10, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/types/defaultdict.html": {
        "tags": ["WOW"], "relevance": 7, "diff": "pythonic",
    },
    "vyuka_downloaded/materialy/python/types/sets.html": {
        "tags": ["Core"], "relevance": 8, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/exceptions.html": {
        "tags": ["Core"], "relevance": 9, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/files/pickle.html": {
        "tags": ["Skip"], "relevance": 4, "diff": "newconcept",
    },

    # ── W4 functions I ──────────────────────────────────────────
    "vyuka_downloaded/materialy/python/functions/basics.html": {
        "tags": ["Core"], "relevance": 10, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/functions/arguments.html": {
        "tags": ["Core", "Tricky"], "relevance": 10, "diff": "pythonic",
    },
    "vyuka_downloaded/materialy/python/functions/scope.html": {
        "tags": ["Core", "Tricky"], "relevance": 9, "diff": "paradigm",
    },
    "vyuka_downloaded/materialy/python/functions/first-class.html": {
        "tags": ["Core", "WOW"], "relevance": 8, "diff": "paradigm",
    },
    "vyuka_downloaded/materialy/python/functions/annotations.html": {
        "tags": ["Core"], "relevance": 7, "diff": "newconcept",
    },

    # ── W5 generators & decorators (peak topics) ────────────────
    "vyuka_downloaded/materialy/python/generators/generators.html": {
        "tags": ["Core", "WOW"], "relevance": 9, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/generators/comprehensions.html": {
        "tags": ["Core", "WOW"], "relevance": 10, "diff": "pythonic",
    },
    "vyuka_downloaded/materialy/python/functions/closures.html": {
        "tags": ["Core", "Tricky"], "relevance": 8, "diff": "paradigm",
    },
    "vyuka_downloaded/materialy/python/functions/decorators.html": {
        "tags": ["Legendary"], "relevance": 8, "diff": "pythonic",
    },
    "vyuka_downloaded/materialy/python/functions/memoization.html": {
        "tags": ["WOW"], "relevance": 6, "diff": "newconcept",
    },

    # ── W6 OOP ──────────────────────────────────────────────────
    "vyuka_downloaded/materialy/python/objects/classes.html": {
        "tags": ["Core"], "relevance": 9, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/objects/inheritance.html": {
        "tags": ["Core"], "relevance": 7, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/objects/magic.html": {
        "tags": ["Core", "Legendary"], "relevance": 10, "diff": "pythonic",
    },
    "vyuka_downloaded/materialy/python/objects/iterators.html": {
        "tags": ["Core"], "relevance": 9, "diff": "paradigm",
    },
    "vyuka_downloaded/materialy/python/objects/context.html": {
        "tags": ["Core", "WOW"], "relevance": 9, "diff": "pythonic",
    },
    "vyuka_downloaded/materialy/python/objects/descriptors.html": {
        "tags": ["Tricky"], "relevance": 5, "diff": "newconcept",
    },

    # ── W7 modules ──────────────────────────────────────────────
    "vyuka_downloaded/materialy/python/modules/doctest.html": {
        "tags": ["Core"], "relevance": 7, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/modules/modules.html": {
        "tags": ["Core"], "relevance": 9, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/modules/import.html": {
        "tags": ["Tricky"], "relevance": 6, "diff": "paradigm",
    },
    "vyuka_downloaded/materialy/python/web/cherrypy.html": {
        "tags": ["Skip"], "relevance": 3, "diff": "newconcept",
    },

    # ── W8 files/CLI ────────────────────────────────────────────
    "vyuka_downloaded/materialy/python/types/bytes.html": {
        "tags": ["Core"], "relevance": 8, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/files/binary.html": {
        "tags": ["Core"], "relevance": 8, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/files/pathlib.html": {
        "tags": ["Core", "WOW"], "relevance": 9, "diff": "pythonic",
    },
    "vyuka_downloaded/materialy/python/files/mmap.html": {
        "tags": ["Skip"], "relevance": 3, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/cmd/argparse.html": {
        "tags": ["Core"], "relevance": 8, "diff": "newconcept",
    },

    # ── W9 NumPy ────────────────────────────────────────────────
    "vyuka_downloaded/materialy/python/numpy/intro.html": {
        "tags": ["Core"], "relevance": 8, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/numpy/broadcasting.html": {
        "tags": ["WOW"], "relevance": 7, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/numpy/vectorization.html": {
        "tags": ["Core", "WOW"], "relevance": 8, "diff": "paradigm",
    },
    "vyuka_downloaded/materialy/python/numpy/numba.html": {
        "tags": ["Skip"], "relevance": 3, "diff": "newconcept",
    },

    # ── W10 Pandas ──────────────────────────────────────────────
    "vyuka_downloaded/materialy/python/pandas/intro.html": {
        "tags": ["Core"], "relevance": 7, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/pandas/klementinum.html": {
        "tags": ["WOW"], "relevance": 5, "diff": "newconcept",
    },

    # ── W11 testing/SQL/regex ───────────────────────────────────
    "vyuka_downloaded/materialy/python/testing/unittest.html": {
        "tags": ["Core"], "relevance": 8, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/testing/profiling.html": {
        "tags": ["WOW"], "relevance": 6, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/db/sqlite.html": {
        "tags": ["Core"], "relevance": 7, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/regexp/python.html": {
        "tags": ["Core"], "relevance": 8, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/plot/matplotlib.html": {
        "tags": ["WOW"], "relevance": 6, "diff": "newconcept",
    },

    # ── W12 system ──────────────────────────────────────────────
    "vyuka_downloaded/materialy/python/system/subprocess.html": {
        "tags": ["Core"], "relevance": 8, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/system/ctypes.html": {
        "tags": ["Skip", "Tricky"], "relevance": 3, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/cython/overview.html": {
        "tags": ["Skip"], "relevance": 3, "diff": "newconcept",
    },

    # ── W13 bonus ───────────────────────────────────────────────
    "vyuka_downloaded/materialy/python/objects/ABCs.html": {
        "tags": ["WOW"], "relevance": 6, "diff": "resyntax",
    },
    "vyuka_downloaded/materialy/python/objects/meta.html": {
        "tags": ["Skip", "Tricky"], "relevance": 2, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/generators/coroutines.html": {
        "tags": ["Skip"], "relevance": 4, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/python/fp.html": {
        "tags": ["WOW"], "relevance": 6, "diff": "pythonic",
    },
    "vyuka_downloaded/materialy/python/pitfalls.html": {
        "tags": ["Core", "Tricky"], "relevance": 10, "diff": "pythonic",
    },
    "vyuka_downloaded/materialy/techs/L-systems/overview.html": {
        "tags": ["Skip", "WOW"], "relevance": 4, "diff": "newconcept",
    },
    "vyuka_downloaded/materialy/brainfuck/overview.html": {
        "tags": ["Skip", "Tricky"], "relevance": 3, "diff": "newconcept",
    },
}


def find_item(course: dict, path: str) -> dict | None:
    for w in course["weeks"]:
        for kind in ("lectures", "exercises"):
            for it in w.get(kind, []):
                if it.get("path") == path:
                    return it
    return None


def all_items(course: dict):
    for w in course["weeks"]:
        for kind in ("lectures", "exercises"):
            for it in w.get(kind, []):
                yield it, kind, w


def validate(item: dict) -> list[str]:
    issues = []
    tags = item.get("tags") or []
    if len(tags) > 2:
        issues.append(f">2 tags: {tags}")
    if "Core" in tags and "Skip" in tags:
        issues.append("Core+Skip forbidden")
    if tags.count("Legendary") and tags.count("Legendary"):
        pass
    r = item.get("relevance", 5)
    if "Skip" in tags and r > 5:
        issues.append(f"Skip with relevance {r}")
    if "Core" in tags and r < 6:
        issues.append(f"Core with relevance {r}")
    return issues


def main() -> int:
    course = json.loads(COURSE.read_text(encoding="utf-8"))
    before = deepcopy(course)

    # Build path→title index for fuzzy path matching when override keys differ slightly
    by_title: dict[str, list[dict]] = {}
    for it, kind, w in all_items(course):
        by_title.setdefault(it["title"], []).append(it)

    changes = []
    applied = 0
    unmatched = []

    # First: apply by exact path
    for path, ov in OVERRIDES.items():
        it = find_item(course, path)
        if not it:
            unmatched.append(path)
            continue
        old = {k: it.get(k) for k in ("tags", "relevance", "diff")}
        for k, v in ov.items():
            it[k] = v
        new = {k: it.get(k) for k in ("tags", "relevance", "diff")}
        if old != new:
            changes.append((it["title"], path, old, new))
            applied += 1

    # Path-agnostic bulk fixes by title for items whose paths differ from guesses
    TITLE_OVERRIDES = {
        "Pojmenované n-tice (namedtuple)": {"tags": ["WOW"], "relevance": 6, "diff": "pythonic"},
        "Boolean a priority operátorů": {"tags": ["Core"], "relevance": 7, "diff": "basics"},
        "Typovaná pole array": {"tags": ["Skip"], "relevance": 3, "diff": "resyntax"},
        "Základy řazení v Pythonu": {"tags": ["Core", "WOW"], "relevance": 9, "diff": "pythonic"},
        "Seznamy (Lists) & array": {"tags": ["Core"], "relevance": 10, "diff": "resyntax"},
        "Čtení a zápis ze/do souborů": {"tags": ["Core"], "relevance": 9, "diff": "resyntax"},
        "Slovníky (Dictionaries) & defaultdict": {"tags": ["Core"], "relevance": 10, "diff": "resyntax"},
        "DefaultDict": {"tags": ["WOW"], "relevance": 7, "diff": "pythonic"},
        "Serializace a modul pickle": {"tags": ["Skip"], "relevance": 4, "diff": "newconcept"},
        "Funkce - základy": {"tags": ["Core"], "relevance": 10, "diff": "resyntax"},
        "Argumenty a parametry": {"tags": ["Core", "Tricky"], "relevance": 10, "diff": "pythonic"},
        "Scope (obor viditelnosti LEGB)": {"tags": ["Core", "Tricky"], "relevance": 9, "diff": "paradigm"},
        "Funkce jako First-Class Citizen": {"tags": ["Core", "WOW"], "relevance": 8, "diff": "paradigm"},
        "Anotace funkcí & modul typing": {"tags": ["Core"], "relevance": 7, "diff": "newconcept"},
        "Generátory & generátorové výrazy": {"tags": ["Core", "WOW"], "relevance": 9, "diff": "newconcept"},
        "List & Generator Comprehensions": {"tags": ["Core", "WOW"], "relevance": 10, "diff": "pythonic"},
        "Uzávěry (Closures) & Lambda": {"tags": ["Core", "Tricky"], "relevance": 8, "diff": "paradigm"},
        "Dekorátory funkcí": {"tags": ["Legendary"], "relevance": 8, "diff": "pythonic"},
        "Memoizace a rekurze": {"tags": ["WOW"], "relevance": 6, "diff": "newconcept"},
        "Třídy a konstruktory (OOP)": {"tags": ["Core"], "relevance": 9, "diff": "resyntax"},
        "Vícenásobná dědičnost & super()": {"tags": ["Core"], "relevance": 7, "diff": "resyntax"},
        "Magické (dunder) metody": {"tags": ["Core", "Legendary"], "relevance": 10, "diff": "pythonic"},
        "Iterátory (Protokol)": {"tags": ["Core"], "relevance": 9, "diff": "paradigm"},
        "Kontextový manažer (with)": {"tags": ["Core", "WOW"], "relevance": 9, "diff": "pythonic"},
        "Deskriptory a properties": {"tags": ["Tricky"], "relevance": 5, "diff": "newconcept"},
        "Dokumentační testy (doctest)": {"tags": ["Core"], "relevance": 7, "diff": "newconcept"},
        "Moduly a namespaces": {"tags": ["Core"], "relevance": 9, "diff": "resyntax"},
        "Importy pod kapotou": {"tags": ["Tricky"], "relevance": 6, "diff": "paradigm"},
        "CherryPy a webové formuláře": {"tags": ["Skip"], "relevance": 3, "diff": "newconcept"},
        "Bajtové řetězce (bytes, bytearray)": {"tags": ["Core"], "relevance": 8, "diff": "newconcept"},
        "Práce se soubory (binární/textové)": {"tags": ["Core"], "relevance": 8, "diff": "resyntax"},
        "Modul pathlib (cesty)": {"tags": ["Core", "WOW"], "relevance": 9, "diff": "pythonic"},
        "Mapování souborů do paměti (mmap)": {"tags": ["Skip"], "relevance": 3, "diff": "newconcept"},
        "Příkazová řádka (argparse)": {"tags": ["Core"], "relevance": 8, "diff": "newconcept"},
        "Úvod do NumPy": {"tags": ["Core"], "relevance": 8, "diff": "newconcept"},
        "Broadcasting": {"tags": ["WOW"], "relevance": 7, "diff": "newconcept"},
        "Vektorizace a řezy v NumPy": {"tags": ["Core", "WOW"], "relevance": 8, "diff": "paradigm"},
        "Optimalizace a Numba JIT": {"tags": ["Skip"], "relevance": 3, "diff": "newconcept"},
        "Pandas - úvod": {"tags": ["Core"], "relevance": 7, "diff": "newconcept"},
        "Příklad - Klementinum": {"tags": ["WOW"], "relevance": 5, "diff": "newconcept"},
        "Unit-testy (unittest)": {"tags": ["Core"], "relevance": 8, "diff": "resyntax"},
        "Měření času (timeit) & cProfile": {"tags": ["WOW"], "relevance": 6, "diff": "newconcept"},
        "Vestavěná databáze SQLite": {"tags": ["Core"], "relevance": 7, "diff": "newconcept"},
        "Regulární výrazy v Pythonu": {"tags": ["Core"], "relevance": 8, "diff": "resyntax"},
        "Matplotlib (Grafy)": {"tags": ["WOW"], "relevance": 6, "diff": "newconcept"},
        "Spouštění procesů (subprocess)": {"tags": ["Core"], "relevance": 8, "diff": "newconcept"},
        "FFI a modul ctypes": {"tags": ["Skip"], "relevance": 3, "diff": "newconcept"},
        "Cython - kompilace do C": {"tags": ["Skip"], "relevance": 3, "diff": "newconcept"},
        "Abstract Base Classes (ABCs)": {"tags": ["WOW"], "relevance": 6, "diff": "resyntax"},
        "Metatřídy (Metaclasses)": {"tags": ["Skip", "Tricky"], "relevance": 2, "diff": "newconcept"},
        "Asynchronní Python & Korutiny": {"tags": ["Skip"], "relevance": 4, "diff": "newconcept"},
        "Funkcionální Python (itertools)": {"tags": ["WOW"], "relevance": 6, "diff": "pythonic"},
        "Záludnosti v Pythonu (Pitfalls)": {"tags": ["Core", "Tricky"], "relevance": 10, "diff": "pythonic"},
        "L-systémy a želví grafika": {"tags": ["Skip", "WOW"], "relevance": 4, "diff": "newconcept"},
        "Brainfuck Interpreter": {"tags": ["Skip", "Tricky"], "relevance": 3, "diff": "newconcept"},
        # Exercises
        "Rozcvička se syntaxí": {"tags": ["Core"], "relevance": 7, "diff": "basics"},
        "Číselné operace": {"tags": ["Core"], "relevance": 7, "diff": "basics"},
        "Práce s řetězci": {"tags": ["Core"], "relevance": 8, "diff": "resyntax"},
        "Hrátky s printem (ANSI)": {"tags": ["WOW"], "relevance": 5, "diff": "resyntax"},
        "Cvičení na seznamy": {"tags": ["Core"], "relevance": 8, "diff": "resyntax"},
        "Hra s čísly a indexy": {"tags": ["Core"], "relevance": 6, "diff": "basics"},
        "Parsování textových souborů I": {"tags": ["Core"], "relevance": 8, "diff": "resyntax"},
        "Cvičení na slovníky": {"tags": ["Core"], "relevance": 8, "diff": "resyntax"},
        "Parsování textových souborů II": {"tags": ["Core"], "relevance": 8, "diff": "resyntax"},
        "Hustota obyvatelstva států": {"tags": ["Tricky"], "relevance": 6, "diff": "resyntax"},
        "Zpracování velkých dat (profilace)": {"tags": ["Skip"], "relevance": 4, "diff": "newconcept"},
        "Generátory pro bioinformatiku": {"tags": ["Core", "WOW"], "relevance": 7, "diff": "newconcept"},
        "Dekorátory v praxi": {"tags": ["WOW"], "relevance": 7, "diff": "pythonic"},
        "Parsování FASTA a FASTQ": {"tags": ["WOW"], "relevance": 6, "diff": "newconcept"},
        "Vlastní iterátor": {"tags": ["Core"], "relevance": 8, "diff": "paradigm"},
        "Cyklický seznam (Magic)": {"tags": ["Tricky"], "relevance": 7, "diff": "pythonic"},
        "Šifrovací algoritmy": {"tags": ["WOW"], "relevance": 5, "diff": "resyntax"},
        "Zpracování PNM obrázků": {"tags": ["Tricky"], "relevance": 5, "diff": "resyntax"},
        "Maticová grafika": {"tags": ["WOW"], "relevance": 5, "diff": "newconcept"},
        "Steganografie (Skrytí dat)": {"tags": ["Skip", "Tricky"], "relevance": 4, "diff": "newconcept"},
        "Náhoda a pravděpodobnost": {"tags": ["Skip"], "relevance": 4, "diff": "basics"},
        "Vícero verzí Pythonu v systému": {"tags": ["Skip"], "relevance": 4, "diff": "basics"},
        "Instalační kuchařka": {"tags": ["Skip"], "relevance": 4, "diff": "basics"},
    }

    for title, ov in TITLE_OVERRIDES.items():
        items = by_title.get(title) or []
        for it in items:
            old = {k: deepcopy(it.get(k)) for k in ("tags", "relevance", "diff")}
            for k, v in ov.items():
                it[k] = v
            new = {k: it.get(k) for k in ("tags", "relevance", "diff")}
            if old != new:
                # avoid duplicate change log lines
                if not any(c[0] == title and c[2] == old for c in changes):
                    changes.append((title, it["path"], old, new))
                    applied += 1

    # Global hygiene pass
    legendary_count = 0
    issues_all = []
    for it, kind, w in all_items(course):
        tags = list(it.get("tags") or [])
        # forbid Core+Skip
        if "Core" in tags and "Skip" in tags:
            tags = [t for t in tags if t != "Skip"]
            it["tags"] = tags
        # cap tags at 2 — prefer Core over WOW if both with Legendary
        if len(tags) > 2:
            priority = ["Core", "Legendary", "Tricky", "WOW", "Skip"]
            tags = sorted(tags, key=lambda t: priority.index(t) if t in priority else 99)[:2]
            it["tags"] = tags
        if "Legendary" in (it.get("tags") or []):
            legendary_count += 1
        for iss in validate(it):
            issues_all.append(f"{it['title']}: {iss}")

    course["meta"]["labeling"] = {
        "phase": 2,
        "source": "tools/apply_phase2_labels.py",
        "legendary_count": legendary_count,
        "changes": len(changes),
    }

    COURSE.write_text(json.dumps(course, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Changelog
    lines = [
        "# Phase 2 labeling changelog",
        "",
        "Applied via `tools/apply_phase2_labels.py` on top of imported `.old/cjs/course-data.js` labels.",
        "",
        "## Policy shifts",
        "",
        "- **Legendary is rare** — only landmark topics (decorators, dunder methods). Demoted many former Legendary items to Core/WOW.",
        "- **Conda / Cython / ctypes / mmap / CherryPy / metaclasses / brainfuck / L-systems → Skip** (optional for C/Java → Python main path).",
        "- **venv / pip / core syntax / lists / dicts / functions / comprehensions → Core** with high relevance.",
        "- **Early exercises** (syntax, numbers) promoted from Skip → Core practice.",
        "- **Pitfalls** stays high relevance but tag is Core+Tricky (not Legendary).",
        "- **Max 2 tags**; Core and Skip never together.",
        "",
        f"## Stats",
        "",
        f"- Label field changes applied: **{len(changes)}**",
        f"- Legendary items after pass: **{legendary_count}**",
        f"- Unmatched path overrides (title pass may still have hit): {len(unmatched)}",
        "",
        "## Open questions",
        "",
        "- NumPy/Pandas: marked Core for data-oriented track; pure systems track might prefer WOW/Skip.",
        "- Decorators as sole Legendary without Core — intentional “stretch goal” landmark.",
        "- Slide-level `data/slides.json` left as imported flavors (not re-audited per slide).",
        "",
        "## Sample changes",
        "",
    ]
    for title, path, old, new in changes[:40]:
        lines.append(f"- **{title}**")
        lines.append(f"  - `{old}` → `{new}`")
    if len(changes) > 40:
        lines.append(f"- … and {len(changes) - 40} more")
    if issues_all:
        lines.append("")
        lines.append("## Validation notes")
        lines.append("")
        for iss in issues_all[:30]:
            lines.append(f"- {iss}")

    CHANGELOG.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Updated {COURSE}")
    print(f"  changes: {len(changes)}")
    print(f"  legendary: {legendary_count}")
    print(f"  unmatched paths: {len(unmatched)}")
    print(f"  changelog: {CHANGELOG}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
