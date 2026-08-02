# Phase 2 labeling changelog

Applied via `tools/apply_phase2_labels.py` on top of imported `.old/cjs/course-data.js` labels.

## Policy shifts

- **Legendary is rare** — only landmark topics (decorators, dunder methods). Demoted many former Legendary items to Core/WOW.
- **Conda / Cython / ctypes / mmap / CherryPy / metaclasses / brainfuck / L-systems → Skip** (optional for C/Java → Python main path).
- **venv / pip / core syntax / lists / dicts / functions / comprehensions → Core** with high relevance.
- **Early exercises** (syntax, numbers) promoted from Skip → Core practice.
- **Pitfalls** stays high relevance but tag is Core+Tricky (not Legendary).
- **Max 2 tags**; Core and Skip never together.

## Stats

- Label field changes applied: **84**
- Legendary items after pass: **2**
- Unmatched path overrides (title pass may still have hit): 32

## Open questions

- NumPy/Pandas: marked Core for data-oriented track; pure systems track might prefer WOW/Skip.
- Decorators as sole Legendary without Core — intentional “stretch goal” landmark.
- Slide-level `data/slides.json` left as imported flavors (not re-audited per slide).

## Sample changes

- **Instalační kuchařka**
  - `{'tags': ['Skip'], 'relevance': 3, 'diff': 'basics'}` → `{'tags': ['Skip'], 'relevance': 4, 'diff': 'basics'}`
- **Vícero verzí Pythonu v systému**
  - `{'tags': ['WOW'], 'relevance': 6, 'diff': 'resyntax'}` → `{'tags': ['Skip'], 'relevance': 4, 'diff': 'basics'}`
- **Virtuální prostředí - úvod**
  - `{'tags': ['Core'], 'relevance': 8, 'diff': 'newconcept'}` → `{'tags': ['Core'], 'relevance': 9, 'diff': 'newconcept'}`
- **Modul venv**
  - `{'tags': ['Core'], 'relevance': 8, 'diff': 'newconcept'}` → `{'tags': ['Core'], 'relevance': 9, 'diff': 'newconcept'}`
- **Správce balíčků pip & wheel**
  - `{'tags': ['Core'], 'relevance': 8, 'diff': 'newconcept'}` → `{'tags': ['Core'], 'relevance': 9, 'diff': 'newconcept'}`
- **Conda - víc než Python?**
  - `{'tags': ['Skip'], 'relevance': 5, 'diff': 'newconcept'}` → `{'tags': ['Skip'], 'relevance': 3, 'diff': 'newconcept'}`
- **Conda - základy práce**
  - `{'tags': ['Skip'], 'relevance': 5, 'diff': 'newconcept'}` → `{'tags': ['Skip'], 'relevance': 3, 'diff': 'newconcept'}`
- **Jupyter - úvod & instalace**
  - `{'tags': ['WOW'], 'relevance': 7, 'diff': 'newconcept'}` → `{'tags': ['WOW'], 'relevance': 6, 'diff': 'newconcept'}`
- **Jupyter - základy práce**
  - `{'tags': ['WOW'], 'relevance': 7, 'diff': 'newconcept'}` → `{'tags': ['WOW'], 'relevance': 6, 'diff': 'newconcept'}`
- **Obecné poznámky k typům**
  - `{'tags': ['Core', 'Tricky'], 'relevance': 7, 'diff': 'paradigm'}` → `{'tags': ['Core', 'Tricky'], 'relevance': 9, 'diff': 'paradigm'}`
- **Základní řídicí konstrukce**
  - `{'tags': ['Core'], 'relevance': 8, 'diff': 'basics'}` → `{'tags': ['Core'], 'relevance': 10, 'diff': 'resyntax'}`
- **Čísla (int, float, complex)**
  - `{'tags': ['Core'], 'relevance': 8, 'diff': 'basics'}` → `{'tags': ['Core'], 'relevance': 9, 'diff': 'resyntax'}`
- **Řetězce (str)**
  - `{'tags': ['Core', 'WOW'], 'relevance': 9, 'diff': 'resyntax'}` → `{'tags': ['Core', 'WOW'], 'relevance': 10, 'diff': 'resyntax'}`
- **Kódování textů & Unicode**
  - `{'tags': ['Core'], 'relevance': 8, 'diff': 'resyntax'}` → `{'tags': ['Core'], 'relevance': 8, 'diff': 'newconcept'}`
- **Hrátky s printem**
  - `{'tags': ['WOW'], 'relevance': 7, 'diff': 'resyntax'}` → `{'tags': ['WOW'], 'relevance': 6, 'diff': 'resyntax'}`
- **Rozcvička se syntaxí**
  - `{'tags': ['Skip'], 'relevance': 5, 'diff': 'basics'}` → `{'tags': ['Core'], 'relevance': 7, 'diff': 'basics'}`
- **Číselné operace**
  - `{'tags': ['Skip'], 'relevance': 6, 'diff': 'basics'}` → `{'tags': ['Core'], 'relevance': 7, 'diff': 'basics'}`
- **Práce s řetězci**
  - `{'tags': ['Core'], 'relevance': 7, 'diff': 'resyntax'}` → `{'tags': ['Core'], 'relevance': 8, 'diff': 'resyntax'}`
- **Hrátky s printem (ANSI)**
  - `{'tags': ['WOW'], 'relevance': 7, 'diff': 'resyntax'}` → `{'tags': ['WOW'], 'relevance': 5, 'diff': 'resyntax'}`
- **N-tice (Tuples) & NamedTuples**
  - `{'tags': ['Core', 'WOW'], 'relevance': 8, 'diff': 'resyntax'}` → `{'tags': ['Core'], 'relevance': 8, 'diff': 'resyntax'}`
- **Seznamy (Lists) & array**
  - `{'tags': ['Core'], 'relevance': 9, 'diff': 'resyntax'}` → `{'tags': ['Core'], 'relevance': 10, 'diff': 'resyntax'}`
- **Anotace funkcí & modul typing**
  - `{'tags': ['Core'], 'relevance': 8, 'diff': 'resyntax'}` → `{'tags': ['Core'], 'relevance': 7, 'diff': 'newconcept'}`
- **Generátory & generátorové výrazy**
  - `{'tags': ['Legendary'], 'relevance': 9, 'diff': 'pythonic'}` → `{'tags': ['Core', 'WOW'], 'relevance': 9, 'diff': 'newconcept'}`
- **Dekorátory funkcí**
  - `{'tags': ['Core', 'Legendary'], 'relevance': 10, 'diff': 'pythonic'}` → `{'tags': ['Legendary'], 'relevance': 8, 'diff': 'pythonic'}`
- **Deskriptory a properties**
  - `{'tags': ['Tricky'], 'relevance': 6, 'diff': 'newconcept'}` → `{'tags': ['Tricky'], 'relevance': 5, 'diff': 'newconcept'}`
- **Bajtové řetězce (bytes, bytearray)**
  - `{'tags': ['Core'], 'relevance': 8, 'diff': 'resyntax'}` → `{'tags': ['Core'], 'relevance': 8, 'diff': 'newconcept'}`
- **Modul pathlib (cesty)**
  - `{'tags': ['Core', 'WOW'], 'relevance': 8, 'diff': 'newconcept'}` → `{'tags': ['Core', 'WOW'], 'relevance': 9, 'diff': 'pythonic'}`
- **Mapování souborů do paměti (mmap)**
  - `{'tags': ['WOW'], 'relevance': 7, 'diff': 'newconcept'}` → `{'tags': ['Skip'], 'relevance': 3, 'diff': 'newconcept'}`
- **Broadcasting**
  - `{'tags': ['WOW'], 'relevance': 8, 'diff': 'newconcept'}` → `{'tags': ['WOW'], 'relevance': 7, 'diff': 'newconcept'}`
- **Vektorizace a řezy v NumPy**
  - `{'tags': ['Legendary'], 'relevance': 9, 'diff': 'newconcept'}` → `{'tags': ['Core', 'WOW'], 'relevance': 8, 'diff': 'paradigm'}`
- **Vestavěná databáze SQLite**
  - `{'tags': ['Core'], 'relevance': 8, 'diff': 'newconcept'}` → `{'tags': ['Core'], 'relevance': 7, 'diff': 'newconcept'}`
- **Cython - kompilace do C**
  - `{'tags': ['Tricky'], 'relevance': 6, 'diff': 'newconcept'}` → `{'tags': ['Skip'], 'relevance': 3, 'diff': 'newconcept'}`
- **Abstract Base Classes (ABCs)**
  - `{'tags': ['WOW'], 'relevance': 7, 'diff': 'resyntax'}` → `{'tags': ['WOW'], 'relevance': 6, 'diff': 'resyntax'}`
- **Metatřídy (Metaclasses)**
  - `{'tags': ['Tricky'], 'relevance': 5, 'diff': 'newconcept'}` → `{'tags': ['Skip', 'Tricky'], 'relevance': 2, 'diff': 'newconcept'}`
- **Asynchronní Python & Korutiny**
  - `{'tags': ['Legendary'], 'relevance': 7, 'diff': 'newconcept'}` → `{'tags': ['Skip'], 'relevance': 4, 'diff': 'newconcept'}`
- **Funkcionální Python (itertools)**
  - `{'tags': ['WOW'], 'relevance': 6, 'diff': 'resyntax'}` → `{'tags': ['WOW'], 'relevance': 6, 'diff': 'pythonic'}`
- **Záludnosti v Pythonu (Pitfalls)**
  - `{'tags': ['Core', 'Legendary'], 'relevance': 9, 'diff': 'pythonic'}` → `{'tags': ['Core', 'Tricky'], 'relevance': 10, 'diff': 'pythonic'}`
- **L-systémy a želví grafika**
  - `{'tags': ['Legendary'], 'relevance': 7, 'diff': 'newconcept'}` → `{'tags': ['Skip', 'WOW'], 'relevance': 4, 'diff': 'newconcept'}`
- **Brainfuck Interpreter**
  - `{'tags': ['Tricky'], 'relevance': 8, 'diff': 'newconcept'}` → `{'tags': ['Skip', 'Tricky'], 'relevance': 3, 'diff': 'newconcept'}`
- **Pojmenované n-tice (namedtuple)**
  - `{'tags': ['Core', 'WOW'], 'relevance': 8, 'diff': 'resyntax'}` → `{'tags': ['WOW'], 'relevance': 6, 'diff': 'pythonic'}`
- … and 44 more
