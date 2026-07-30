## 2026-07-30T13:31:40Z
<USER_REQUEST>
MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You are Worker 1 for the 4-Level Python Checklist & Printable Study Plan project.
Working directory: w:\_solved\python_overview\.agents\worker_m1
Project root: w:\_solved\python_overview

Read the Explorer analysis reports:
- w:\_solved\python_overview\.agents\explorer_m1_1\handoff.md
- w:\_solved\python_overview\.agents\explorer_m1_2\handoff.md
- w:\_solved\python_overview\.agents\explorer_m1_3\handoff.md

Your task is to implement the complete 4-Level Python Checklist & Printable Study Plan:

1. Create `app/js/checklist-data.js`:
   - Export `CHECKLIST_ITEMS`: Array of 23 items across Levels 1-4 with fields `id`, `level`, `levelTitle`, `category`, `title`, `badges` ([MEGA EPIC], [CORE], [INSIGHT], [CHALLENGE], [PRACTICE]), `relevance` (e.g. 98), `difficulty` ("T3 L4"), `codeSnippet`, `footguns`, `selfTestQuestions`. Include all 23 items detailed in Explorer 1's handoff report.
   - Export `FOOTGUN_ITEMS`: Array of 7 common Python footgun rows (Mutable defaults, Modifying list while iterating, `is` vs `==`, Scope leakage, NumPy slice view mutation, Bare `except:`, String concatenation in loops).

2. Update `app/js/state.js`:
   - Add `state.checklist` Set.
   - Add `pcs-checklist-v1` localStorage persistence key.
   - Implement `persistChecklist()`, `isChecklistChecked(id)`, `toggleChecklist(id)`, `resetChecklistState()`.
   - Export progress calculation helper `calculateChecklistProgress(items)`.

3. Update `app/js/router.js`:
   - Support route target `{ kind: "checklist" }` mapping to hash `#/checklist`.
   - Update `renderView()` to call `showChecklist()`.
   - Add breadcrumb support for `"checklist"`.

4. Update `app/js/content.js`:
   - Export `showChecklist()`.
   - Render header with total progress ring/bar (% of 23 items completed).
   - Render interactive level filter tabs (All, Level 1, Level 2, Level 3, Level 4).
   - Render level sections containing high-density checklist item cards with:
     - Checkbox `[ ]` / `[✓]` bound to `toggleChecklist(id)` with localStorage persistence.
     - Badges ([MEGA EPIC], [CORE], [INSIGHT], [CHALLENGE], [PRACTICE]).
     - Relevance bar (e.g. 95%).
     - Dual difficulty micro-bars (T3 L4).
     - Code snippets (with syntax highlighting).
   - Render "Common Python Footguns / Pitfalls" table.
   - Render Self-Test Audit Questions section.
   - Render "Vytisknout studijní plán 🖨" button invoking `window.print()`.
   - Render "Obnovit plán 🔄" reset button.

5. Update `app/js/app.js`, `app/index.html`, `app/js/palette.js`, `app/js/tree.js`:
   - Add Activity Bar button `data-view="checklist"` with task list icon and shortcut `Ctrl+Shift+C`.
   - Bind keyboard shortcut `Ctrl+Shift+C` to setView("checklist").
   - Register Command Palette entry for "Studijní plán (4 Úrovně) 📋".
   - Add tree node `📋 Studijní plán (4 Úrovně)` in sidebar tree if appropriate.

6. Update `app/css/content.css`:
   - Add high-density checklist UI component styles, badge colors, T/L difficulty score bars, footguns table styles.
   - Add comprehensive `@media print` rules:
     - Pure white `#ffffff` background, `#000000` text color.
     - Hide navigation chrome (.titlebar, .activitybar, .sidebar, .tabbar, .statusbar, .breadcrumb, #sash, buttons).
     - Page-break optimization: `break-inside: avoid` on level blocks, item cards, footguns table.
     - Printable checkable boxes `[ ]` / `[✓]`, self-test audit question cards.

7. Run Build & Verification:
   - Execute `node tools/prepare_vercel.mjs` to package `public/`.
   - Verify build runs without error.

Write your completion handoff report to `w:\_solved\python_overview\.agents\worker_m1\handoff.md`.
Report back when finished.
</USER_REQUEST>
