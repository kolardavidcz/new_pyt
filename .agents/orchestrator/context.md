# Context — Python 4-Level Checklist & Printable Study Plan

## Requirements Summary
- **R1: 4-Level Python Checklist Architecture**:
  - Level 1: Essential Core (Variables, data types, `if`/`elif`/`else`, `for`/`while`, `def`, `print` formatting).
  - Level 2: Data Structures & Idioms (`list`, `tuple`, `set`, `dict`, list/dict comprehensions, file I/O `with open`, `try`/`except`, `sys.argv`).
  - Level 3: Advanced Mechanics & OOP (`class`, `self`, `__init__`, dunder methods `__str__`, `__len__`, `__getitem__`, `__iter__`, generators `yield`, decorators `@`, context managers).
  - Level 4: Specialized Systems, Algorithms & Libraries (NumPy array broadcasting & slicing, Pillow pixel image ops, Cryptography César/Vigenère, Simulations Monte Carlo/Brownian/Game of Life, Bioinformatics FASTA/FASTQ).

- **R2: High-Density UI & Badge System**:
  - Located inside Progress view via a view toggle switch ('Deska' vs 'Checklist (Studijní plán 📋)').
  - Grouped chronologically by Course Weeks (W1 to W12) with explicit Level Badges (Lv 1 to Lv 4).
  - Badges: `[MEGA EPIC]`, `[CORE]`, `[INSIGHT]`, `[CHALLENGE]`, `[PRACTICE]`, Level Badges (`Lv 1`..`Lv 4`).
  - Relevance bars (`95%`), dual difficulty scores (`T3 L4`), code snippets, interactive `[ ]` / `[✓]` checkboxes synced with `state.studied` / `localStorage`.
  - Footguns cheatsheet table (mutating list while iterating, mutable default args `def f(a=[])`, loop variable leakage, `is` vs `==`, etc.).

- **R3: Printable PDF Layout (`@media print`)**:
  - Single-click **"Vytisknout studijní plán 🖨"** button (`window.print()`).
  - High-density 2-column printable checklist grid with checkable boxes, Level badges, T/L segment bars, relevance tags, and page-break protection (`break-inside: avoid`).

- **Verification & Build**:
  - `node tools/prepare_vercel.mjs` packaging.
  - Verification of static HTML/JS/CSS assets.
