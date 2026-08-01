# LLM Task: Build the Python Course Shell FROM SCRATCH

You are a **world-class product UI designer and front-end engineer**.  
Design and implement a **new offline Python course workspace** as if this were a greenfield product — **not** a patch of the old code.

The previous codebase has been moved to **`.old/`**. Do **not** extend or “refactor in place” that tree. You may **read** it for content, metadata, and inspiration only. Ship a clean new architecture at the **repository root**.

---

## Mission

Build a complete, beautiful, functional **VS Code–themed** course IDE for students transitioning from **C/Java** to **Python**.

1. **From scratch** — new HTML/CSS/JS (or a small modern static stack), new layout, new components, new data pipeline.
2. **VS Code theme is the visual law** — Dark Modern / Dark+ aesthetic, chrome, density, typography, focus, scrollbars, tree, tabs, editor feel.
3. **Tags + relevance are first-class** — never optional, never broken in catalog, tree, subcategories, slides, or exercises.
4. **Content is not rewritten** — reuse educational materials under `.old/vyuka_downloaded/` via build/import scripts.
5. **Phased delivery** — **Phase 1** = shell + import existing metadata; **Phase 2** = full **retag / relabel** of the course (permission granted; see below + `LLM_LABELING_PROMPT.md`).

You have **full creative freedom** on structure, UX patterns, and polish — as long as the two hard locks hold: **VS Code look** + **tags & relevance**.

---

## Hard constraints (only these are non-negotiable)

| Lock | Rule |
|------|------|
| **Greenfield** | New app lives at **repo root**. `.old/` is archive. Do not import old `dashboard.css` / `new_order.html` as the base. Optional: cherry-pick tokens, fonts, or metadata files by **copying** into the new tree. |
| **VS Code theme** | Visual design must read as VS Code (Dark Modern preferred). Activity bar, sidebar, editor, tabs, status bar, lists, badges, monospaced code, focus rings. No generic “Bootstrap dashboard”. |
| **Tags** | Every lecture/exercise surfaces tags: `Core`, `WOW`, `Legendary`, `Tricky`, `Skip`. Filters work. Tree + main stay in sync. |
| **Relevance** | Numeric ~1–10 (stars/weight) on items; filterable/sortable; visible in UI. |
| **Offline** | Static files + local server. No required cloud backend. |
| **Content integrity** | Do not mass-rewrite Czech educational prose. Structure transforms via **Python scripts** are OK (esp. exercises). |
| **Retagging allowed (Phase 2)** | You **may** revise tags, relevance, difficulty flavors, and related labels on lectures/exercises/slides. Prefer editing the **new** metadata store (`data/course.json` etc.), not mutating `.old/` in place. Follow `LLM_LABELING_PROMPT.md` for taxonomy rules and consistency. |
| **No heavy Pyodide console** | Not the hero feature. Prefer shell UX, search, outline, progress. |

Everything else (router design, framework choice, file layout, component library vs hand-rolled CSS) is **your design call** — choose the approach that best delivers a robust VS Code-quality UI.

---

## What lives in `.old/` (read-only source)

```
.old/
  vyuka_downloaded/
    materialy/     ← lecture XML + compiled HTML + _files assets
    priklady/      ← exercises (XML/HTML/py)
    cjs/           ← old lecture renderer assets (fonts, XSLT, highlighters…)
  cjs/
    course-data.js           ← weeks → lectures: tags, relevance, diff, desc, compare
    slide-classification.js  ← "slug#idN" → difficulty flavor
    tokens.css, fonts/       ← may COPY fonts/tokens into new app
  data/lecture-pages.json    ← prior per-slide extraction (optional seed)
  new_order.html, spa_*, dashboard.css  ← UX ideas only, do not revive as base
  build_html.py              ← reference for XML→HTML if useful
```

**Import strategy (recommended):**

1. Copy or re-export **metadata** (`course-data` + slide classification) into clean JSON/JS under the new app.
2. Build a **content pipeline** (Python) that indexes XML/HTML from `.old/vyuka_downloaded/` into a new `content/` or `data/` folder the shell consumes.
3. Optionally transform exercise XML (stable ids, úkol meta) with **idempotent Python scripts**, writing outputs into the new tree (or updating sources under a controlled `content/` copy — avoid mutating `.old` if possible; prefer copy-then-transform).

---

## Product to design (blank canvas, VS Code rules)

### Shell chrome (must feel like VS Code)

- **Title bar** (app name, optional window controls style)
- **Activity bar** (icons: Explorer, Search, optional: progress / filters)
- **Sidebar** — primary **EXPLORER** tree (resizable)
- **Editor group** — tabs + main content surface
- **Status bar** — path, counts, filter summary
- **Command palette** (Ctrl+P / Ctrl+Shift+P style) strongly recommended
- Theme tokens as CSS variables (see palette below)
- Theme-aware scrollbars; body text **not** globally bold

### Suggested VS Code Dark Modern tokens (adapt freely, stay on-brand)

```css
--bg: #181818;
--editor: #1f1f1f;
--sidebar: #181818;
--activitybar: #181818;
--panel: #181818;
--border: #2b2b2b;
--text: #cccccc;
--text-muted: #9d9d9d;
--text-faint: #6e7681;
--accent: #0078d4;
--list-hover: #2a2d2e;
--list-active: #04395e;
--focus: #007fd4;
/* flavors */
--fl-basics: #9e9e9e;
--fl-resyntax: #5c9bdd;
--fl-newconcept: #e8a44d;
--fl-pythonic: #4ec9b0;
--fl-paradigm: #c586c0;
/* fonts */
--font-ui: "Segoe UI", system-ui, sans-serif; /* or IBM Plex Sans from .old */
--font-mono: "Cascadia Code", "JetBrains Mono", Consolas, monospace;
```

### Information architecture (3 layers)

```
Week (super-category)
  └─ Lecture | Exercise (item with tags + relevance)
        └─ Page / slide / úkol (optional 3rd layer)
```

- Tree **only** in the left sidebar (not a second full tree in the editor).
- Click **week / lecture** → main shows **rich index + page cards** (not full page body dumps).
- Click **page** → open content in the editor (tabbed if you implement tabs).

### Tags & relevance (product-critical)

**Tags** (multi): `Core` | `WOW` | `Legendary` | `Tricky` | `Skip`  
**Relevance**: integer ~1–10, always visible as stars or compact weight.  
**Optional but valuable:** difficulty **flavors**  
`basics` | `resyntax` | `newconcept` | `pythonic` | `paradigm`  
**Optional:** Czech `desc` + C/Java `compare` text from `course-data.js`.

Rules:

- Badges on catalog cards **and** tree nodes (or clear equivalent).
- Global filters: tag, relevance threshold, optional flavor, free text.
- Filters update tree + main together; counts stay honest.
- Slide-level classification keys if used: **`slug#idN`** with **stable** section ids — never `generate-id()` for anchors.
- Exercises / subcategories / úkols: same metadata discipline; if XML lacks hooks, add them via **Python transform scripts**.

### Functional baseline

| Must have | Nice to have |
|-----------|--------------|
| Explorer tree + open content | Command palette |
| Search across titles + metadata | Full-text search index |
| Tag + relevance filters | Progress / “seen” in localStorage |
| Breadcrumbs | Outline / scroll sync |
| Keyboard: sidebar toggle, find | Split editor (skip if costly) |
| No-cache dev server | Light theme toggle (optional) |

### UI craft bar (designer standard)

- Consistent 4/8px spacing rhythm; VS Code density (compact but readable).
- Clear hierarchy: chrome → tree → content.
- Hover / active / focus / disabled states on every interactive control.
- Accessible: keyboard nav for tree + tabs, visible focus, contrast for badges.
- Motion: subtle (100–200ms), no layout thrash.
- Code blocks: monospaced, VS Code–like syntax-ish styling (can reuse highlighter assets from `.old` if needed).
- Empty / loading / error states designed, not blank.

---

## Suggested new repo layout (you may improve)

```
/
  README.md
  LLM_FROM_SCRATCH_PROMPT.md
  LLM_FROM_SCRATCH_PROMPT.html
  .old/                          # archive — do not treat as app root
  app/                           # or src/ — your shell
    index.html
    css/
      tokens.css
      shell.css
      content.css
    js/
      app.js
      tree.js
      router.js
      filters.js
      search.js
  data/                          # generated or curated
    course.json                  # weeks, items, tags, relevance, paths
    pages.json                   # optional per-slide units
    labels/                      # Phase 2: reviewed / retagged metadata (optional)
  content/                       # optional copy/transform of materials
  tools/
    import_course_data.py        # from .old course-data → data/course.json
    build_content.py             # index/copy HTML/XML assets
    transform_exercises.py       # stable ids / meta on exercises
  serve.py                       # no-cache local server
  LLM_LABELING_PROMPT.md         # Phase 2: retag / relabel brief
```

---

## Implementation plan

### Phase 1 — Product (build the shell)

1. **Scaffold shell** — empty VS Code chrome (activity bar, sidebar, editor, status) with tokens only; no old CSS.
2. **Import metadata** — script → `data/course.json` from `.old/cjs/course-data.js` (tags + relevance required fields). Use existing labels as a **starting point**; do not block UI on perfect taxonomy.
3. **Wire explorer** — render weeks → lectures/exercises; badges for tags + relevance.
4. **Category + open** — main index/cards; open lecture HTML or extracted pages.
5. **Content pipeline** — serve assets from `.old/vyuka_downloaded/...` or copy into `content/`; fix relative paths.
6. **Filters + search** — tag, relevance, text; keep tree/main sync.
7. **Exercises** — parity for badges; Python transforms if structure needs stable ids/meta.
8. **Slide difficulty (optional)** — import `slide-classification.js`; stable `idN`.
9. **Polish** — palette, scrollbars, focus, command palette, empty states.
10. **Document** — root README: how to import, serve, rebuild.

### Phase 2 — Retag / relabel (permission granted)

**You are allowed to retag files and rewrite labels.** This is a deliberate second phase so the shell works first on imported data, then taxonomy is improved for students coming from C/Java.

11. **Open and execute `LLM_LABELING_PROMPT.md`** (or hand that file to a specialized labeling agent).
12. **Retag** lectures, exercises, and (optionally) slides/úkols:
    - `tags` (Core / WOW / Legendary / Tricky / Skip)
    - `relevance` (1–10)
    - `diff` / flavor (basics / resyntax / newconcept / pythonic / paradigm)
    - optional: refresh `desc` / `compare` if wrong or empty (Czech)
13. **Write results into the new app’s data layer** (e.g. `data/course.json`, `data/labels/*`, or regenerate from a script). Prefer **not** overwriting `.old/cjs/course-data.js` as the only store — keep a clear, versionable JSON source of truth at the root.
14. **Re-verify UI** — filters, badges, tree decorations still correct after retag.
15. **Leave a short labeling changelog** (what policy changed, bulk shifts e.g. “many Conda → Skip”, open questions).

Phase 1 may ship with legacy tags. Phase 2 makes labels **course-quality**.

---

## Acceptance checklist

- [ ] App runs from **repo root** (not from inside `.old/`).
- [ ] Looks unmistakably like **VS Code** (dark shell, tree, editor, chrome).
- [ ] Tags visible and filterable on lectures (and exercises when present).
- [ ] Relevance visible and filterable/sortable.
- [ ] 3-layer or 2-layer tree in **left sidebar only**; category main = index + cards.
- [ ] Opening a lecture/exercise shows real content (from archive/content pipeline).
- [ ] No dependence on loading `.old/new_order.html` as the app.
- [ ] Dev server works; rebuilds visible without Incognito (no-cache).
- [ ] Keyboard focus visible; body text not always bold.
- [ ] README documents start + data import commands.
- [ ] **Phase 2 (when run):** retagged metadata is the active source of truth; UI reflects new tags/relevance; labeling notes exist; see `LLM_LABELING_PROMPT.md` checklist.

---

## Anti-patterns (do not do)

- “Just fix” `.old/new_order.html` and call it done.
- Copy-paste the entire old `dashboard.css` + 2k-line inline script as the product.
- Tags only on catalog cards but missing from tree / exercises / filters.
- Random section ids that break classification.
- Stale SPA `pageCache` that lies after rebuild.
- Feature spam (Pyodide, export HTML prototypes) before the shell is solid.

---

## How to start

```bash
# Explore content & metadata (read-only)
# .old/cjs/course-data.js
# .old/vyuka_downloaded/materialy/
# .old/vyuka_downloaded/priklady/

# Then scaffold at repo root and implement.
```

When finished: summarize architecture, how tags/relevance flow, how to serve, and residual risks.

---

# Vocabulary

| Term | Meaning |
|------|---------|
| **`.old/`** | Archived previous implementation + original course files. Reference only. |
| **Activity bar** | Narrow left icon strip (Explorer, Search…). |
| **Badge / chip** | Compact UI label for a tag or flavor. |
| **Catalog** | Main-pane list/cards of course items. |
| **Category view** | Main pane after selecting a week/lecture: index + page cards. |
| **Command palette** | Quick open / command UI (Ctrl+P style). |
| **Compare** | Czech note relating Python to C/Java. |
| **Content pipeline** | Scripts that import/transform materials into what the shell serves. |
| **Core** | Tag: must-learn material. |
| **course-data** | Historical source of lecture metadata (tags, relevance, …). |
| **Dark Modern** | VS Code dark theme family used as visual target. |
| **Editor** | Main content surface (lecture/page HTML). |
| **EXPLORER** | Sidebar tree of the course. |
| **Exercise / příklad** | Practice content under `priklady/`. |
| **Flavor** | Difficulty class: basics, resyntax, newconcept, pythonic, paradigm. |
| **From scratch / greenfield** | New app at root; not incremental patch of `.old`. |
| **Greenfield** | Same as from scratch. |
| **idN** | Stable section id (`id1`, `id2`, …). |
| **Legendary** | Tag: landmark / peak topic. |
| **Materialy** | Lecture materials. |
| **Page (layer 3)** | Single slide/section navigable unit. |
| **Priklady** | Exercises tree. |
| **Relevance** | Importance score ~1–10. |
| **Shell** | VS Code-like chrome around content. |
| **Skip** | Tag: optional for main path. |
| **slug#idN** | Classification key for a slide. |
| **Status bar** | Bottom chrome strip. |
| **Subcategory** | Middle tree layer (lecture/exercise under a week). |
| **Tab bar** | Open documents above the editor. |
| **Tag** | Core / WOW / Legendary / Tricky / Skip. |
| **Tokens** | CSS variables for the VS Code palette. |
| **Tree decoration** | Badges/colors on explorer nodes. |
| **Tricky** | Tag: subtle pitfalls. |
| **Úkol** | Task inside an exercise. |
| **VS Code theme** | Hard visual constraint for the whole product. |
| **Week** | Top-level course grouping. |
| **WOW** | Tag: highlight / surprising capability. |
| **XML transform script** | Python that adjusts source structure (esp. exercises) before/with build. |
| **Phase 1** | Build shell + import existing metadata; UI works end-to-end. |
| **Phase 2** | Retag / relabel course items (tags, relevance, flavors, optional desc/compare). Permission granted. |
| **Labeling / retagging** | Revising metadata for pedagogy; see `LLM_LABELING_PROMPT.md`. |

### Tags (quick)

| Tag | Meaning |
|-----|---------|
| **Core** | Must learn |
| **WOW** | Cool / highlight |
| **Legendary** | Landmark |
| **Tricky** | Pitfalls |
| **Skip** | Optional |

### Flavors (optional but recommended)

| Value | Meaning |
|-------|---------|
| `basics` | Foundation |
| `resyntax` | Same idea, new syntax |
| `newconcept` | New vs C/Java |
| `pythonic` | Idiomatic Python |
| `paradigm` | Mental-model shift |

---

*End of prompt. Execute this brief; build at repo root; leave `.old/` intact as archive.*
