# LLM Task: Refactor the Python Course Repository (functional + polished VS Code UI)

You are an expert full-stack engineer and product-minded UI designer working on an **offline Python course shell** that looks and feels like **VS Code**. Students are transitioning from **C/Java**. The product must be more functional, visually polished, and **bug-free around tags/metadata** (lectures, subcategories/pages, exercises).

Read `NOTES_FOR_LLM.md` first, then explore the repo before coding.

---

## Mission

Refactor and complete this repository so that:

1. **UI is more functional** — real workspace chrome, reliable navigation, search, progress, filters, keyboard shortcuts.
2. **UI is polished** — true VS Code look (tokens, tree, tabs, editor, scrollbars, typography), not a half-dashboard.
3. **Tags and metadata never break** — Core/WOW/Legendary/Tricky/Skip, difficulty flavors, relevance, compare (C/Java), per-slide classification work in **catalog, explorer tree, category view, lecture slides, and exercises**.
4. **No regressions** — build still works; content still offline-servable; Czech educational content preserved.

You have **full freedom to refactor** structure, JS modules, CSS, and data plumbing — but respect the constraints below.

---

## Hard constraints (do not violate)

| Rule | Detail |
|------|--------|
| **XML structure edits are allowed — only via intermediate Python scripts** | You **may** change source XML under `vyuka_downloaded/materialy/**/*.xml` and especially `priklady/**/*.xml` for **UI structure** (e.g. wrap úkols, add stable ids/attrs, split sections, inject meta hooks for tags/difficulty/relevance). **Do not hand-edit dozens of XML files ad-hoc.** Prefer **reproducible Python transform scripts** (e.g. under `scratch/` or `tools/`) that parse → transform → write XML, then run `build_html.py`. Scripts must be re-runnable / idempotent where possible. Preserve educational text; do not rewrite course content unless required for structure. |
| **Stable slide / task IDs** | XSLT must keep predictable section ids: `id="id{position()}"` on `.slide-section` (and equivalent stable ids on exercise tasks if you introduce them). Classification keys are `slug#idN` (e.g. `pip#id3`). **Never reintroduce `generate-id()`** for section anchors — it desyncs tags. If a Python transform reorders nodes, update classification keys or regenerate them in the same pipeline. |
| **No aggressive page caching** | SPA must not use a long-lived page cache that serves stale HTML. Prefer `fetch(..., { cache: 'no-store' })`, cache-bust dynamic assets, and `start_course.py` no-cache headers. Users must not need Incognito after rebuilds. |
| **Tree lives in the left sidebar only** | 3-layer tree (weeks → lectures/exercises → pages) is in the **EXPLORER** (left). Do **not** dump a second full tree into the main catalog as primary navigation. |
| **Category click behavior** | Clicking a week or lecture category fills the **main pane** with a **rich index card + list of page cards** (titles, badges, optional short preview). Do **not** inject full subpage bodies into the catalog list. Auto-scroll if many cards. |
| **Prefer build-time page data** | `data/lecture-pages.json` (from `build_html.py`) is the first-class page layer: `{ path → [{ id, title, content }] }`. Use it; do not re-scrape full HTML client-side for structure. |
| **Dual `cjs/` copies** | Root `cjs/` and `vyuka_downloaded/cjs/` often mirror each other. When changing CSS/JS/XSL, update both or introduce a single source of truth + sync. Do not leave them diverged. |
| **Language** | UI chrome can be Czech (as today) or bilingual carefully; educational `desc` / `compare` stay Czech. Do not machine-translate course content without need. |
| **No Python console / heavy Pyodide** | Do not add a full in-browser Python runtime as the “enhancement”. Prefer shell UX, search, outline, annotations, progress. |
| **No exploit / malware work** | N/A for this product; stay educational. |

---

## Current architecture (ground truth)

```
XML (slides / exercises)
    ↓  build_html.py + XSLT (cjs/screen.xsl, examples.screen.xsl)
HTML under vyuka_downloaded/...
    ↓  post-process extract .slide-section / .section-body
data/lecture-pages.json  (+ data/course-manifest.json, search_index.json)

Dashboard shell: new_order.html
  - courseData → cjs/course-data.js (weeks → lectures with tags, diff, relevance, desc, compare)
  - SLIDE_CLASS → cjs/slide-classification.js  keys: "slug#idN" → difficulty flavor
  - slide-tags / screen.js apply tags on open lecture HTML
  - spa_router.js loads lecture HTML into shell without full navigation
  - dashboard.css + tokens.css = VS Code-ish chrome
```

### Key files

| Path | Role |
|------|------|
| `build_html.py` | XML→HTML, search index, lecture-pages extraction, path rewrite |
| `start_course.py` | Local server with no-cache headers |
| `new_order.html` | Main shell, explorer tree, category main view, filters, search |
| `cjs/course-data.js` | Catalog metadata (tags, diff, relevance, desc, compare) |
| `cjs/slide-classification.js` | Per-slide difficulty: `slug#idN` |
| `cjs/slide-tags.js`, `cjs/screen.js` | Tag UI on lecture pages |
| `cjs/screen.xsl` | Lecture XSLT; **stable `id{position()}`** |
| `cjs/examples.screen.xsl` + `examples.screen.js/css` | Exercise pages |
| `cjs/spa_router.js` | SPA fetch + inject (no stale cache) |
| `cjs/dashboard.css`, `cjs/tokens.css` | Shell styling |
| `data/lecture-pages.json` | Per-page content for tree layer 3 |
| `NOTES_FOR_LLM.md` | Project contracts |

### Metadata model (must stay consistent)

**Lecture-level** (`courseData` item):

- `title`, `path` (relative HTML path)
- `diff`: one of `basics` | `resyntax` | `newconcept` | `pythonic` | `paradigm`
- `relevance`: number ~1–10 (stars / weight in UI)
- `tags`: subset of `Core` | `WOW` | `Legendary` | `Tricky` | `Skip`
- `desc`: short Czech blurb
- `compare`: Czech C/Java comparison note

**Slide/page-level**:

- DOM id `idN` on each section
- Classification key: `{file-slug}#idN` → same difficulty flavors
- Optional future: tag + relevance on individual úkols/exercises

**Exercises** (`priklady/…`):

- Must show tags/relevance/difficulty when present
- Subcategories and task lists must not lose badges or break filters

---

## Known bug classes (fix these first; never reintroduce)

1. **Tag / classification desync**  
   If section ids are random (`generate-id()`) or slug extraction differs between build, SPA, and `SLIDE_CLASS`, tags appear on wrong slides or not at all.

2. **Tags missing in tree / subcategories**  
   Explorer page nodes and category page cards must show the same badges as the lecture card (or slide-level class when available). Filters (tag, diff, relevance) must affect tree + main list coherently.

3. **Exercise tag bugs**  
   Exercise XSLT/JS path differs from lectures. Ensure `examples.screen.*` and dashboard paths for `priklady` render meta chips and do not strip `data-*` or section ids.

4. **Stale UI after rebuild**  
   Any reintroduced Map cache or aggressive HTTP caching will look like “tags disappeared” or “old tree”.

5. **`const`/`let` not on `window`**  
   Tree and late-loaded scripts must read `window.courseData`, `window.lecturePagesData`, `window.SLIDE_CLASS` — not closed-over dead bindings.

6. **Wrong page count / empty layer 3**  
   Extraction must target rendered `.slide-section` correctly; paths must match `courseData[].path` keys in `lecture-pages.json`.

7. **Typography layout jump**  
   Bold/weight changes must not shift layout; avoid “everything always bold” in přednášky.

---

## Target product (what “done” looks like)

### Shell (VS Code)

- Title bar, activity bar, **EXPLORER** sidebar (resizable), tab bar, editor/main, status bar.
- Theme tokens (dark-first, optional light); **theme-aware scrollbars**.
- Fonts: IBM Plex / JetBrains Mono (already in repo) with sensible weights (400 body, 500/600 sparingly).

### 3-layer explorer (left only)

```
Week (super-category)
  └─ Lecture / Exercise (sub-category)
        └─ Page / slide (from lecture-pages.json)
```

- Expand/collapse, selection highlight, optional badges (diff color, top tag, relevance, C/J if compare exists).
- Click **page** → open content in main editor (tab if tab model exists).
- Click **lecture** or **week** → main shows **index + page cards**, not “recently opened” junk, not full HTML dump of all pages.

### Main / editor

- Rich lecture index card: title, desc, tags, diff, relevance, compare snippet.
- Page cards: title, id, slide difficulty if known, open action; optional short preview (truncated), not full body.
- Open page: inject `page.content` or load full lecture and scroll to `#idN`; keep outline/scroll sync if feasible.
- Code blocks and callouts feel like VS Code editor chrome.

### Tags & filters (must work everywhere)

- Global filters: tag, difficulty flavor, relevance threshold, free-text search.
- Search uses `search_index.json` + catalog fields.
- Filtered-out items hide or dim in **tree and main**; counts stay honest.
- On open lecture HTML, slide tags/difficulty chips render next to the correct section.

### Functional extras (pick high-value; polish over feature spam)

Prioritize:

1. Reliable tabs + dirty/visited state + keyboard (Ctrl+P quick open, Ctrl+B sidebar).
2. Progress / “seen” in localStorage without breaking privacy offline.
3. Breadcrumbs (Week › Lecture › Page).
4. Outline panel or sticky mini-TOC synced to scroll.
5. Unified course-manifest if it simplifies data (optional merge of catalog + pages).

Avoid: Pyodide console, HTML export prototypes, one-off scratch UI in production paths.

### Build & data

- **XML transform path (allowed):** `tools/*.py` or `scratch/*_transform.py` → mutates XML structure (esp. exercises) → `python build_html.py` → HTML + `data/*`.
- `python build_html.py` regenerates HTML + `data/lecture-pages.json` + search index (+ manifest if you keep it).
- Extraction remains robust (no fragile client scrape for structure).
- Optionally tighten `course-manifest.json` as the single navigational artifact — but keep `course-data.js` working or generate it from the same source.
- Document any transform scripts in `NOTES_FOR_LLM.md` (what they change, how to re-run).

---

## Implementation plan (suggested order)

1. **Audit tags end-to-end**  
   Pick 3 lectures + 1 exercise. Verify: XSLT ids → `SLIDE_CLASS` keys → chips on page → badges in tree → filters. Fix any slug/id mismatch first.

2. **Stabilize data access**  
   Single module for course catalog + lecture pages + classification lookups. Always expose on `window` for inline scripts if needed.

3. **Explorer + category main view**  
   Finish/refactor tree rendering and `showCategoryInMain`-style flows. Ensure page list uses `lecture-pages.json` keys equal to `item.path`.

4. **SPA / editor injection**  
   Open lecture or single page cleanly; scroll-to-id; no cache bugs; scripts/styles re-init safely after inject.

5. **Exercise parity (+ optional XML transforms)**  
   Same badge and filter semantics for `priklady` items and their internal úkols. If structure is insufficient, write a **Python transform script** that adds stable ids / meta attributes on exercise XML, re-run build, then wire UI chips.

6. **Polish CSS**  
   Tokens, tree indent, tab bar, focus rings, hover, reduced layout thrash, themed scrollbars, non-bold-default body text.

7. **Cleanup**  
   Remove dead prototypes, align `cjs/` duplicates, delete or quarantine `scratch/` from runtime paths. Keep `NOTES_FOR_LLM.md` updated.

8. **Verify**  
   ```text
   python build_html.py
   python start_course.py
   ```
   Manual checklist below. Use browser DevTools if available.

---

## Acceptance checklist

- [ ] Build completes without error; `lecture-pages.json` has pages for major lectures (hundreds of slides total is expected).
- [ ] `start_course.py` serves app; hard refresh shows latest CSS/JS without Incognito.
- [ ] Left explorer: weeks → lectures → pages; main is not cluttered with a second tree.
- [ ] Click week/lecture → main lists index + page cards only.
- [ ] Click page → content opens; correct title; optional scroll to section.
- [ ] Lecture-level tags (Core/WOW/…) visible on cards **and** tree (or clear equivalent).
- [ ] Slide-level difficulty chips match `slide-classification.js` for `slug#idN` (spot-check `pip`, `install`, `scope`).
- [ ] Filters by tag / diff / relevance update catalog **and** tree consistently.
- [ ] At least one exercise path shows metadata correctly; no broken chips/empty tags.
- [ ] Body text is not globally bold; bold is for emphasis/headings only.
- [ ] Scrollbars match theme.
- [ ] No `generate-id()` for slide section ids in active XSLT.
- [ ] No long-lived SPA page cache reintroduced.
- [ ] `NOTES_FOR_LLM.md` reflects final contracts if architecture changed.

---

## Code quality expectations

- Prefer small modules over one 2k-line inline script in `new_order.html` (extract if you touch it heavily).
- Keep CSS variable-driven (`tokens.css`).
- Avoid drive-by refactors unrelated to the mission; but consolidating navigation + tags is in scope.
- After structural changes, run build and fix path mismatches immediately.
- Do not commit secrets; this is a local offline course.

---

## Out of scope (unless user later asks)

- Mass rewriting of educational prose in XML (structure transforms OK; content rewrites need explicit need)
- Hand-editing hundreds of XML files without a script
- Online auth / LMS backend
- Full mobile native app
- Auto-generating all slide classifications with an LLM without review
- Adding a full Python interpreter in the browser

---

## How to start (concrete first commands)

```bash
# From repo root
python build_html.py
# Inspect data/lecture-pages.json keys vs course-data paths
python start_course.py
```

Then open the dashboard URL, exercise the checklist, fix tag/id pipeline, then polish shell.

When finished, summarize: what changed, how tags are keyed, how to rebuild, residual risks.

---

# Vocabulary

Domain terms used in this project (for agents and humans).

| Term | Meaning |
|------|---------|
| **Activity bar** | Narrow vertical strip (VS Code-style) for switching sidebar modes (Explorer, Search, etc.). |
| **Annotation** | Educator metadata attached to a lecture/slide/exercise: tags, relevance, difficulty, compare text, notes. |
| **Badge / chip** | Small UI label for a tag, difficulty, or relevance indicator. |
| **Build** | Running `build_html.py` to compile XML→HTML and generate `data/*` + `search_index.json`. |
| **Catalog** | Main dashboard listing of weeks/lectures (cards), as opposed to the left explorer tree. |
| **Category view** | Main-pane view when a week or lecture is selected: index card + page cards (not full page bodies). |
| **Classification** | Mapping of a slide to a difficulty **flavor** via `SLIDE_CLASS` / `slide-classification.js`. |
| **Compare** | Czech note relating a Python topic to C/Java (`item.compare`). |
| **Core** | Tag: essential material students should not skip. |
| **courseData** | JS array of weeks → lectures with path + metadata (`cjs/course-data.js`). |
| **course-manifest** | Optional consolidated JSON of course structure (`data/course-manifest.json`). |
| **Dashboard** | `new_order.html` shell — home of explorer + catalog + SPA host. |
| **Desc** | Short Czech description on a lecture card (`item.desc`). |
| **Diff / difficulty / flavor** | One of: `basics`, `resyntax`, `newconcept`, `pythonic`, `paradigm` — how “new” the idea is vs C/Java. |
| **Editor pane** | Main content area where lecture HTML or page content is shown. |
| **EXPLORER** | Left sidebar tree (VS Code name) with the 3-layer course tree. |
| **Exercise / příklad** | Practice material under `vyuka_downloaded/priklady/…`. |
| **Flavor** | Synonym for difficulty class of a slide or lecture (`basics` … `paradigm`). |
| **generate-id()** | XSLT function that produces unstable ids — **forbidden** for slide sections (breaks tags). |
| **idN / id{position()}** | Stable section id scheme: first slide `id1`, second `id2`, … |
| **Injection** | Inserting HTML into the shell (SPA) instead of full browser navigation. |
| **Layer 1 / 2 / 3** | Tree levels: week → lecture/exercise → page/slide. |
| **lecture-pages.json** | Build artifact: map of HTML path → list of `{id, title, content}`. |
| **Legendary** | Tag: especially impressive or high-impact topic. |
| **Main pane** | Center workspace (catalog or editor), not the sidebar. |
| **Materialy** | Lecture materials under `vyuka_downloaded/materialy/…`. |
| **no-store / no-cache** | Fetch/server policy so rebuilds appear without Incognito. |
| **Outline** | Mini table of contents / section list synced with scroll. |
| **Page (3rd layer)** | One slide/section extracted as a navigable unit in the tree. |
| **pageCache** | Former in-memory HTML cache — do not reintroduce stale caching. |
| **Paradigm** | Difficulty flavor: conceptual mental-model shift (e.g. iterators, REPL workflow). |
| **Path key** | Relative HTML path used as dictionary key, e.g. `vyuka_downloaded/materialy/python/packages/pip.html`. |
| **Přednáška** | Lecture (presentation-style material). |
| **Priklady** | Exercises folder (`priklady`). |
| **Progress** | localStorage-backed “seen/completed” state for learners. |
| **Quick open** | Ctrl+P-style command palette / file finder for lectures and pages. |
| **Relevance** | Numeric importance (~1–10) for prioritization UI. |
| **Resyntax** | Difficulty flavor: same idea as C/Java, different syntax. |
| **Screen (screen.xsl/js/css)** | Lecture rendering pipeline (as opposed to examples.* for exercises). |
| **Search index** | `search_index.json` — full-text index built at compile time. |
| **Shell** | Persistent VS Code-like chrome around course content. |
| **Skip** | Tag: optional / low priority for the main learning path. |
| **Slug** | Filename stem used in classification keys (e.g. `pip` from `pip.html`). |
| **slug#idN** | Canonical classification key, e.g. `venv#id3`. |
| **SPA router** | `spa_router.js` — client-side load of lecture HTML into the shell. |
| **Slide / slide-section** | One lecture unit; rendered as `.slide-section` with stable id. |
| **Status bar** | Bottom VS Code-like bar (path, counts, hints). |
| **Subcategory** | Lecture or exercise under a week; also the middle tree layer. |
| **Tab bar** | Open documents/lectures as tabs above the editor. |
| **Tag** | Qualitative label: Core, WOW, Legendary, Tricky, Skip. |
| **Tokens** | CSS design variables (`tokens.css`) for colors, spacing, fonts. |
| **Tree decoration** | Icons/badges/colors on explorer nodes (diff, tags, relevance). |
| **Tricky** | Tag: easy to misuse or subtle pitfalls. |
| **Úkol** | Task item inside an exercise (should support meta chips if annotated). |
| **VS Code look** | Activity bar + explorer + tabs + editor + status + familiar colors/typography. |
| **Week** | Top-level course grouping in `courseData` (super-category). |
| **WOW** | Tag: surprising or delightful feature worth highlighting. |
| **XSLT** | Stylesheets compiling course XML to HTML (`screen.xsl`, `examples.screen.xsl`). |
| **XML transform script** | Intermediate Python script that programmatically edits source XML for UI structure (esp. exercises), then rebuild. Preferred over ad-hoc hand edits. |
| **Idempotent transform** | Script that can be re-run safely without duplicating wrappers/attrs (or that no-ops when already applied). |

### Difficulty flavors (quick reference)

| Value | Student meaning |
|-------|-----------------|
| `basics` | Foundation / setup / review |
| `resyntax` | Same concept as C/Java, new syntax |
| `newconcept` | Concept not familiar from C/Java |
| `pythonic` | Idiomatic Python style/practice |
| `paradigm` | Deeper model shift |

### Tag set (quick reference)

| Tag | Student meaning |
|-----|-----------------|
| **Core** | Must learn |
| **WOW** | Highlight / cool capability |
| **Legendary** | Peak / landmark topic |
| **Tricky** | Pitfalls / subtle |
| **Skip** | Optional for main path |

---

*End of prompt. Paste this file (or the Mission through Acceptance sections) into the next agent session and execute.*
