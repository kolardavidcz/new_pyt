# Implementation Plan — 4-Level Python Checklist & Printable Study Plan

## Overview
This plan breaks down the development of the high-density 4-level Python Checklist & Printable Study Plan into 4 execution milestones:

1. **Milestone 1 — Data Architecture & State Persistence**:
   - Define full 4-level checklist data structure in JavaScript (Level 1 Essential Core, Level 2 Data Structures & Idioms, Level 3 Advanced Mechanics & OOP, Level 4 Specialized Systems & Algorithms).
   - Each checklist item contains: `id`, `level` (1-4), `title`, `badges` (`[MEGA EPIC]`, `[CORE]`, `[INSIGHT]`, `[CHALLENGE]`, `[PRACTICE]`), `relevance` (e.g. `95%`), `diffScore` (e.g. `T3 L4`), `snippet` (code snippet string), `auditQuestion` (self-test audit question for print mode).
   - Implement `localStorage` read/write helper (`pcs-checklist-v1`).

2. **Milestone 2 — High-Density UI & Footguns Cheatsheet**:
   - Add new view tab `"Studijní plán (4 Úrovně) 📋"` in activity bar and routing in `app/js/app.js`, `app/js/router.js`, `app/js/content.js`, `app/js/ui.js`, `app/css/content.css`.
   - Render interactive level filter tabs (All, Level 1, Level 2, Level 3, Level 4), progress bar, checklist items with interactive checkable boxes `[ ]` / `[✓]`, badges, relevance bars, dual difficulty chips (`T3 L4`), and expandable code snippets.
   - Include "Common Python Footguns / Pitfalls" table (mutating list while iterating, mutable defaults `def f(a=[])`, loop variable leakage, `is` vs `==`, early return in try-finally, etc.).

3. **Milestone 3 — Printable PDF Layout & Self-Test Audit**:
   - Add single-click button **"Vytisknout studijní plán 🖨"** calling `window.print()`.
   - Add comprehensive `@media print` CSS in `app/css/content.css`:
     - Clean white background, high contrast text.
     - Hide navigation bars, sidebars, activity bars, buttons.
     - `break-inside: avoid` per level section and item box.
     - Render printable checkable boxes `[ ]` and self-test audit questions.

4. **Milestone 4 — Verification, Build & Git Status**:
   - Test checklist tab rendering, filter switching, check box clicking, persistence reload, print stylesheet.
   - Run `node tools/prepare_vercel.mjs` to package everything into `public/`.
   - Verify zero errors, clean git status or commit changes.
