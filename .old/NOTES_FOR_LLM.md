# Notes for LLM / Future Agents — Python Course Workspace

This is the "VS Code looking Python course" project.

## Core Architecture (post-refactor)

- **Content source**: Original rich educational content lives in XML (`vyuka_downloaded/materialy/**/*.xml` and `priklady/**/*.xml`).
  - **XML structure edits are allowed** (especially exercises / úkols), but **only via intermediate Python transform scripts** (e.g. `tools/` or `scratch/*_transform.py`) that parse → transform → write, then `python build_html.py`. Prefer idempotent scripts; do not hand-edit dozens of XML files ad-hoc. Preserve educational prose.
  - Full agent brief: `LLM_REFACTOR_PROMPT.md` (visual: `LLM_REFACTOR_PROMPT.html`).
  - Slides are `<slide title="...">` elements. Their order and titles are authoritative for the 3rd layer (unless a transform intentionally restructures them and updates classification keys).

- **Build** (`build_html.py`):
  - Compiles XML → HTML using XSLT (`cjs/screen.xsl`, `examples.screen.xsl`).
  - Extracts full-text for `search_index.json`.
  - **Robust "XML → page content"**: After rendering, parses the HTML and extracts per-slide `content` (the `.section-body` innerHTML). Result stored in `data/lecture-pages.json`.
    - Keys: relative html path (e.g. "vyuka_downloaded/materialy/python/types.plus/NamedTuples.html")
    - Each page: `{ "id": "idN", "title": "...", "content": "<div class=...>...</div>" }`
  - This gives a **first-class, queryable, enhanceable** representation of every page/slide without touching XML or relying on fragile client-side scraping.

- **Data for the 3-layer tree**:
  - Weeks / super-categories come from the structure in `new_order.html` (the `courseData` weeks).
  - Lectures / sub-categories are the items under weeks.
  - Pages (3rd layer) come from `data/lecture-pages.json` (or will be merged into a future `data/course-manifest.json`).

- **UI Shell** (`new_order.html` + cjs):
  - Persistent VS Code-like chrome (titlebar, tabbar, activitybar, statusbar).
  - Goal: real explorer tree (3 levels) + tabbed editor + outline sync.
  - Content for a page is injected as HTML into the editor pane (`innerHTML = page.content`).

- **Stable IDs for tags / classification**:
  - XSLT now outputs `id="id{position()}"` on `.slide-section` (predictable, matches what the build search index has always used).
  - `screen.js` and classification data should now align on keys like `slug#id3`.

- **Legacy / prototype things removed or de-emphasized**:
  - `exportHtml` button and "save standalone" flow was prototype-only → removed.
  - Heavy duplication of `cjs/` into `vyuka_downloaded/` is only for direct XML preview; prefer the dev server.

## How to add content (sustainable flow)

1. Add or edit XML under `vyuka_downloaded/materialy/...` or `priklady/...` (use existing patterns for `<slide>`, `<example>`, etc.).
2. (Optional) Add rich metadata (tags, relevance, compare text, diff) in the dashboard data or future annotations sidecar.
3. Run `python build_html.py`.
4. The new pages will appear in `data/lecture-pages.json` and (when wired) in the 3-layer explorer.
5. No need to hand-edit huge arrays or classification files for basic structure.

## Key files

- `build_html.py` — the generator (most important for data robustness).
- `data/lecture-pages.json` — first-class per-page content (the sustainable layer).
- `cjs/screen.xsl` — rendering rules + now stable ids.
- `new_order.html` — current shell + (legacy) courseData. Being evolved into the VS Code workspace.
- `cjs/screen.js`, `cjs/dashboard.css`, `cjs/tokens.css` — UI logic and VS Code-ish styling.

## Future iteration friendly

Because page content is extracted as clean HTML strings in JSON:
- Easy to post-process pages at build time (wrap, add data-*, inject components).
- Easy to attach per-page annotations later without XML changes.
- The main app can render pages without depending on full XSLT at runtime.
- Adding "micro features" (per-page notes, quizzes, highlights, better search) becomes simple data + render work.

## VS Code look goals

- Activity bar + resizable explorer (3-layer tree).
- Tabs for open lectures.
- Editor pane shows the page/slide content with good typography + code blocks that feel like VS Code.
- Outline / tree selection ↔ main content scroll sync.
- Breadcrumbs, status, keyboard niceties (Ctrl+P style quick open, etc.).

## Dev tips

- Use `python start_course.py` (it sets strong no-cache headers).
- After changing XML or build, just refresh or SPA-navigate — no more incognito required.
- The `data/` folder is generated — treat it as build artifact.

This document exists so future LLMs/agents have the "why" and current contracts without re-reading the entire history.
