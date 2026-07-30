# Python Course Shell

Greenfield **VS Code–themed** offline workspace for a Python course aimed at students who already know **C / Java**.

Previous implementation lives in **`.old/`** (archive + educational content). The app at the repository root does **not** extend that code.

| Path | Role |
|------|------|
| `app/` | Shell UI (HTML/CSS/JS modules) |
| `data/course.json` | **Source of truth** — weeks, tags, relevance, flavors |
| `data/slides.json` | Per-slide difficulty (`slug#idN`) |
| `data/pages-index.json` | Page outlines (id + title) for the explorer |
| `data/LABELING_CHANGELOG.md` | Phase 2 retag notes |
| `tools/import_course_data.py` | Import metadata from `.old/` |
| `tools/apply_phase2_labels.py` | Phase 2 retag / relabel |
| `serve.py` | No-cache local server + path aliases |
| `.old/vyuka_downloaded/` | Lecture/exercise HTML (served, not copied) |
| `.old/cjs/` | Fonts, highlighters, legacy assets (served as `/cjs/`) |

---

## Quick start

```bash
# 1) Import / refresh metadata from the archive (optional if data/ already present)
python tools/import_course_data.py

# 2) Optional Phase 2 retag (rewrites data/course.json)
python tools/apply_phase2_labels.py

# 3) Structure exercises into úkol cards (data/exercises.json)
python tools/transform_exercises.py

# 4) Serve
python serve.py
# → http://127.0.0.1:8765/
```

Custom port: `python serve.py 9000`

The server sends **Cache-Control: no-store** so rebuilds show without hard-refresh/Incognito.

---

## Deploy to Vercel

The site is a **static export**. Build copies the shell, data, and course assets into `public/`.

```bash
# Preview build locally
node tools/prepare_vercel.mjs
# then serve public/ with any static server, e.g.:
# npx serve public
```

| File | Role |
|------|------|
| `vercel.json` | Build command, `outputDirectory: public`, rewrites, cache headers |
| `tools/prepare_vercel.mjs` | Assembles `public/` from `app/`, `data/`, `.old/cjs`, `.old/vyuka_downloaded` |
| `.vercelignore` | Skips non-deploy junk from the upload |

**Deploy**

```bash
# CLI (from repo root)
npx vercel          # preview
npx vercel --prod   # production
```

Or connect the GitHub repo in the Vercel dashboard — it will run `node tools/prepare_vercel.mjs` and publish `public/`.

**Notes**

- App URLs stay absolute: `/app/…`, `/data/…`, `/vyuka_downloaded/…`, `/cjs/…`
- Hash routing (`#/lecture/…`) needs no server fallback
- `public/` is generated and gitignored — do not commit it
- Ensure course data exists before deploy (`data/course.json`, `data/exercises.json`, …)

---

## Architecture

```
┌─────────────┬──────────────────┬────────────────────────────┐
│ Activity    │ Sidebar          │ Editor group               │
│ bar         │ EXPLORER tree    │ Tabs + breadcrumbs + main  │
│ Explorer    │ Filters: tags,   │ Catalog cards / slides     │
│ Search      │ relevance,       │                            │
│ Progress    │ flavor, text     │                            │
├─────────────┴──────────────────┴────────────────────────────┤
│ Status bar — path · counts · filter summary                 │
└─────────────────────────────────────────────────────────────┘
```

**Information architecture (3 layers)**

1. **Week** — open → catalog cards for lectures & exercises  
2. **Lecture / exercise** — open → metadata + page index  
3. **Page** — open → single slide in the editor (or full lecture)

Tree lives **only** in the left sidebar. Tags and relevance appear on tree nodes **and** catalog cards.

### Tags & relevance flow

```
.old/cjs/course-data.js
        │  tools/import_course_data.py
        ▼
 data/course.json   ◄── tools/apply_phase2_labels.py (Phase 2)
        │
        ▼
 app/js/state.js → filters → tree.js + content.js (badges, cards)
```

| Field | Values |
|-------|--------|
| `tags` | `Core`, `WOW`, `Legendary`, `Tricky`, `Skip` (≤2) |
| `relevance` | 1–10 |
| `diff` | `basics`, `resyntax`, `newconcept`, `pythonic`, `paradigm` |

Filters (sidebar) update **tree and main** together. Status bar shows visible/total counts.

### Content pipeline

- Metadata paths stay as `vyuka_downloaded/materialy/...` / `priklady/...`.
- `serve.py` maps `/vyuka_downloaded/*` → `.old/vyuka_downloaded/*` and `/cjs/*` → `.old/cjs/*`.
- The shell **fetches** lecture HTML and **extracts** `section.slide-section` bodies (does not embed the old SPA chrome).
- Relative assets (`_files/...`) are rewritten against the lecture directory.

### Keyboard

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` | Command palette / quick open |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+Shift+E` | Explorer |
| `Ctrl+Shift+F` | Search (focus filter) |
| `Ctrl+W` | Close tab |
| Tree arrows | Expand / collapse / move focus |

---

## Data rebuild

```bash
# Fresh import from archive (overwrites data/*.json — re-run Phase 2 after if needed)
python tools/import_course_data.py
python tools/apply_phase2_labels.py
```

For labeling policy see `LLM_LABELING_PROMPT.md` and `data/LABELING_CHANGELOG.md`.

---

## Design tokens

VS Code **Dark Modern** palette in `app/css/tokens.css` (optional light theme via title-bar **Theme**). UI font: IBM Plex Sans; mono: JetBrains Mono (copied into `app/fonts/`).

---

## Residual risks

- Some lecture HTML still contains old SPA chrome; extraction strips most of it, but edge-case pages may fall back to a partial dump or iframe.
- Custom `<example src="...">` tags are shown as placeholders (not live-loaded).
- `pages-index.json` is built from `.old/data/lecture-pages.json` when present — outlines without full bodies.
- Slide flavors in `slides.json` are imported as-is (not fully re-audited in Phase 2).
- Path overrides in `apply_phase2_labels.py` may miss renamed files; title-based overrides cover most items.
