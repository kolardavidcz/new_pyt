# Project: Python 4-Level Checklist & Printable Study Plan

## Architecture
The application is a Vanilla JS Single Page Application (SPA) dashboard located in `app/`.
- `app/index.html`: Main HTML shell.
- `app/js/app.js`: Application bootstrap, event listeners, keyboard shortcuts, activity bar handlers.
- `app/js/router.js`: Navigation state and route management.
- `app/js/content.js`: Main view renders (catalog views, lecture views, progress view, and new checklist view).
- `app/js/state.js`: Application state and localStorage helper methods.
- `app/js/ui.js`: UI element creation and rendering helpers.
- `app/css/content.css`: Main UI styles, component styles, and `@media print` layout.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Data Architecture & State Persistence | Data structure for 4 levels & localStorage logic | none | PLANNED |
| 2 | High-Density UI & Footguns Cheatsheet | Tab rendering, level filter, badges, footguns table | M1 | PLANNED |
| 3 | Printable PDF Layout & Self-Test Audit | `@media print` rules, print button, self-test questions | M2 | PLANNED |
| 4 | Final Integration, Static Build & Commit | `prepare_vercel.mjs` build and E2E verification | M3 | PLANNED |

## Interface Contracts
### Checklist Data Model
```javascript
export interface ChecklistItem {
  id: string; // e.g. "l1-vars"
  level: number; // 1 | 2 | 3 | 4
  title: string;
  category: string; // e.g. "Core Syntax"
  badges: string[]; // ["CORE", "PRACTICE"]
  relevance: number; // 95 (%)
  techScore: number; // T1..T5
  logicScore: number; // L1..L5
  summary: string;
  codeSnippet: string;
  footgunWarning?: string;
  auditQuestion: string; // Self-test question for PDF printout
}
```

### Storage Key
- `pcs-checklist-v1`: JSON stringified array of checked item IDs in `localStorage`.

## Code Layout
- `app/js/checklist-data.js` or inline in `content.js`: Checklist definition and footguns table data.
- `app/js/content.js`: `showChecklist()` export for rendering the interactive tab.
- `app/js/router.js` & `app/js/app.js`: Route `"checklist"` registration in activity bar and command palette.
- `app/css/content.css`: CSS styling for checklist tab, badges, difficulty chips, footguns table, and `@media print`.
