# Python Course Shell — C/Java → Python

Greenfield **VS Code–themed** offline workspace for a Python course tailored for students moving from **C / Java** to **Python**.

Previous implementation lives in **`.old/`** (archive + educational content). The app at the repository root serves the extracted learning content through a fast, modern shell.

---

## Quick Start

```bash
# 1) Import / refresh metadata from the archive (optional if data/ already present)
python tools/import_course_data.py

# 2) Apply Phase 2 retag & relevance labels
python tools/apply_phase2_labels.py

# 3) Structure exercises into úkol cards with T/L scores (data/exercises.json)
python tools/transform_exercises.py

# 4) Serve locally
python serve.py
# → http://127.0.0.1:8765/
```

Custom port: `python serve.py 9000`

The server sends **`Cache-Control: no-store`** so updates take effect immediately without hard-refreshing.

---

## Deploy to Vercel

The site is a **static export**. Build copies the shell, data, and course assets into `public/`.

```bash
# Prepare static build directory
node tools/prepare_vercel.mjs

# Deploy using Vercel CLI (or connect GitHub repository)
npx vercel --prod
```

| File / Command | Role |
|----------------|------|
| `vercel.json` | Vercel configuration (`outputDirectory: public`, rewrites, headers) |
| `tools/prepare_vercel.mjs` | Assembles `public/` (1,600+ static files) from `app/`, `data/`, `.old/cjs/`, `.old/vyuka_downloaded/` |
| `.vercelignore` | Excludes temporary scratch scripts and non-deploy files |

---

## Architecture & Features

```
┌─────────────┬──────────────────┬────────────────────────────────────────────────────────┐
│ Activity    │ Sidebar          │ Editor group                                           │
│ bar         │ EXPLORER tree    │ Tabs + breadcrumbs + main content                      │
│ Explorer    │ Filters: tags,   │ Catalog cards / slides / úkol cards                   │
│ Progress    │ relevance,       │                                                        │
│             │ flavor, text     │ Bottom Nav: ← Prev | Mark Studied | Next →             │
├─────────────┴──────────────────┴────────────────────────────────────────────────────────┤
│ Status bar — path · counts · filter summary                                             │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Sidebar Explorer & Multi-Dimensional Filters
- **Interactive Tree**: Course weeks, lectures, homework sets, and individual slides.
- **Tag Badges**: `[Core]`, `[WOW]`, `[Legendary]`, `[Tricky]`, `[Skip]`.
- **Relevance Meter**: 10-segment heat scale (Slate Grey → Amber → Orange → Crimson Red).
- **Flavors**: `basics`, `resyntax`, `newconcept`, `pythonic`, `paradigm`.
- **Sorting**: Course order, relevance descending/ascending, title A–Z.

### 2. Study Log & Progress View
- **Progress Ring & Level Badges**: Dynamic percentage calculation based on manual `Mark studied` status.
- **Dual Progress Bars**: Separate tracking for *Core path* and *Exercise dojo*.
- **4-Tier Cumulative Study Plan PDF Print**:
  - `Pass` (Level 1) — Minimum to finish the course (Core, relevance ≥ 7).
  - `Solid` (Level 2) — Confident practitioner (Core + relevance ≥ 5, no Skip).
  - `Advanced` (Level 3) — Everything except Skip.
  - `Complete` (Level 4) — Full deep understanding (all 94 course items).
  - **A4 2-Column Print Layout**: High-contrast side-by-side Lectures vs Exercises columns with colorful badges and heat segment meters (`@media print`).

### 3. Homework & Exercise Dojo
- **Úkol Cards**: Extracted problem statements with expandable Nápověda (Hint) and Řešení (Solution) blocks.
- **Dual Difficulty Segment Meters**: Visual 5-segment rating bars for **T** (Technical score, `#4fc1ff`) and **L** (Logical score, `#cda34f`) difficulty axes calibrated across all 135 tasks.

### 4. Bottom Page Navigation Bar
Every lecture, exercise set, and presentation slide includes a bottom footer toolbar:
- **`← Previous`**: Navigates to the previous topic in course order.
- **`Mark Studied` / `✓ Studied`**: Toggles manual study progress in `localStorage` and updates status globally.
- **`Next →`**: Navigates to the next topic in course order.

### 5. Responsive Widescreen (16:9) Layout
- Fluid max-width scaling (`1440px`) with auto-filling card grids (`repeat(auto-fill, minmax(...))`) for optimal space usage on 16:9 monitors.
- Explicit CSS Grid column placement (`grid-column: 1..4`) ensuring collapsing the sidebar expands main content without collapsing the workspace.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` | Trigger Print mode (Generates 2-column Study Plan PDF or prints current page) |
| `Ctrl+K` | Open Command palette |
| `Ctrl+B` | Toggle sidebar (collapses / expands left panel) |
| `Ctrl+Shift+E` | Switch to Explorer view |
| `Ctrl+Shift+F` | Focus filter search |
| `Ctrl+W` | Close active editor tab |
| `← / → / Space` | Next / Previous slide (in presentation or fullscreen mode) |
| `F` | Toggle presentation fullscreen mode |

---

## Data Model & Files

| Path | Description |
|------|-------------|
| `app/` | Single-Page Application (HTML5, Vanilla CSS, ES Modules) |
| `data/course.json` | Primary course structure (weeks, items, tags, relevance scores) |
| `data/exercises.json` | 135 structured úkol items with T/L ratings and HTML prompts |
| `data/slides.json` | Per-slide difficulty ratings |
| `data/pages-index.json` | Outline metadata for presentation slides |
| `tools/` | Python & Node.js build scripts for Vercel, data import, and labeling |

