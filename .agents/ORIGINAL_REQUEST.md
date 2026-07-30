# Original User Request

## 2026-07-30T13:29:45Z

# Teamwork Project Prompt — 4-Level Python Checklist & Printable Study Plan

Build a high-density, 4-level "Checklist & Printable Study Plan" for Python (inspired by the FIT PA2-to-AG1 study guide format in `vscht_uceni_web/src/features/bioinformatics`).

Working directory: `w:\_solved\python_overview`
Integrity mode: development

## Requirements

### R1. 4-Level Python Checklist Architecture
Create a 4-level progressive mastery checklist for Python:
- **Level 1 — Essential Core (Základní syntaxe & Řízení běhu)**: Variables, data types, `if`/`elif`/`else`, `for`/`while` loops, basic functions (`def`), `print` formatting.
- **Level 2 — Data Structures & Pythonic Idioms**: `list`, `tuple`, `set`, `dict`, list/dict comprehensions, file I/O (`with open`), exception handling (`try`/`except`), `sys.argv`.
- **Level 3 — Advanced Mechanics & OOP**: Classes (`class`, `self`, `__init__`), magic dunder methods (`__str__`, `__len__`, `__getitem__`, `__iter__`), generators (`yield`), decorators (`@`), context managers.
- **Level 4 — Specialized Systems, Algorithms & Libraries**: NumPy array broadcasting & slicing, Pillow pixel image ops (PNM/PBM/PGM/PPM), Cryptography (César, Vigenère), Simulations (Monte Carlo, Brownian motion, Game of Life), Bioinformatics (FASTA/FASTQ generator parsing).

### R2. High-Density UI & Badge System
- Implement a UI-compressed interactive Checklist tab `"Studijní plán (4 Úrovně) 📋"` in the Python dashboard (`app/js/content.js`, `app/js/app.js`, `app/css/content.css`).
- Display badges (`[MEGA EPIC]`, `[CORE]`, `[INSIGHT]`, `[CHALLENGE]`, `[PRACTICE]`), relevance bars (`95%`), dual difficulty scores (`T3 L4`), code snippets, and interactive `[ ]` / `[✓]` checkboxes saved in `localStorage`.
- Include a "Common Python Footguns / Pitfalls" table (e.g. mutating list while iterating, mutable default arguments `def f(a=[])`, scope leakage in loops, `is` vs `==`).

### R3. Printable PDF Layout (`@media print`)
- Single-click **"Vytisknout studijní plán 🖨"** button triggering browser print (`window.print()`).
- High-density `@media print` CSS layout formatted like an official university study guide / certificate: pure white background, crisp typography, page-break optimizations (`break-inside: avoid` per level), printable checkable boxes `[ ]`, and self-test audit questions.

## Acceptance Criteria

### Level Structure & UI Completeness
- [ ] Interactive 4-level checklist tab renders cleanly with UI compression, level filters, badges, and progress bar.
- [ ] Checkbox state persists reliably in `localStorage`.
- [ ] Contains "Common Python Footguns" cheatsheet section with code examples.

### Verification & Print Quality
- [ ] Clicking "Vytisknout studijní plán 🖨" opens browser print view.
- [ ] `@media print` renders all 4 levels, code snippets, footguns table, and self-test checklist with high contrast and zero dark blocks or broken page breaks.
- [ ] Rebuild static assets with `node tools/prepare_vercel.mjs` and commit to Git.

## 2026-07-30T13:32:20Z

Here are the finalized specifications from the user grilling session:

1. **Location**: Place the 4-Level Checklist inside the Progress page via a view toggle switch ('Deska' vs 'Checklist (Studijní plán 📋)').
2. **Organization**: Grouped chronologically by Course Weeks (W1 to W12) with explicit Level Badges (Lv 1 to Lv 4) attached to each homework task:
   - Lv 1 (Basics): W1-W2 syntax, numbers, strings
   - Lv 2 (Data Structures & Idioms): lists, dicts, tuples, sets, file I/O, exceptions
   - Lv 3 (Advanced Mechanics): functions, iterators/generators, decorators, magic methods
   - Lv 4 (Specialized Systems & Dojo): PNM/graphics, steganography, ciphers, Monte Carlo/probability, bioinfo FASTQ/FASTA
3. **Checklist Interactive Behavior**: Checkable boxes `[ ]` / `[✓]` that sync directly with `state.studied` and `localStorage`.
4. **Printable PDF Layout (@media print)**: High-density 2-column printable checklist grid with checkable boxes, Level badges, T/L segment bars, relevance tags, and page-break protection (`break-inside: avoid`).

Please implement this structure in `app/js/content.js` and `app/css/content.css`, run `node tools/prepare_vercel.mjs`, and commit to Git.

