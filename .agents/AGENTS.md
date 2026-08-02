# Antigravity Developer Guide — Python Overview Project (`new_pyt`)

Welcome to the `new_PYT` workspace. This guide serves as the comprehensive single source of truth for the codebase architecture, state management, build pipelines, design rules, and development workflows.

---

## 🏗️ Project Architecture

This application is a high-density, web-based learning dashboard for developers transitioning from C/C++/Java to Python.

- **Production URL**: [https://newpyt.vercel.app](https://newpyt.vercel.app)
- **GitHub Repository**: [https://github.com/kolardavidcz/new_pyt](https://github.com/kolardavidcz/new_pyt)
- **Primary Shell & Application**:
  - `app/index.html`: Main Single Page Application (SPA) entry point (VS Code Dark Modern layout).
  - `app/js/`: Modular ES JavaScript modules (`app.js`, `state.js`, `router.js`, `content.js`, `tree.js`, `palette.js`, `ui.js`, `highlight.js`).
  - `app/css/`: Modular stylesheets (`tokens.css`, `shell.css`, `content.css`).
- **Structured Data Stores**:
  - `data/course.json`: Core curriculum manifest (weekly topics, lectures, exercises).
  - `data/slides.json`: Extracted slide sections per lecture.
  - `data/exercises.json`: Structured exercise tasks with difficulty metadata (Technical score $T1-T5$, Logical score $L1-L5$), prompt HTML, nápověda (hint) HTML, and řešení (solution) HTML.
  - `data/pages-index.json`: Slide outline index for presentation mode navigation.

---

## ⚡ Single Page Application (SPA) & State Architecture

### 1. State Management (`app/js/state.js`)
- `state.seen`: Set of item IDs auto-marked as seen when opened.
- `state.studied`: Set of item IDs manually marked as studied (the primary progress metric).
- `state.filters`: Active search query, tag filters (`Core`, `WOW`, `Legendary`, `Tricky`, `Skip`), difficulty flavor filters, relevance threshold ($1-10$), and sorting.
- `state.tabs`: Active editor tabs.

### 2. Dual Local & Cloud Persistence
- **Local Storage Keys**: `pcs-seen-v1`, `pcs-studied-v1`, `pcs-sidebar-w`.
- **Cloud Database (Vercel KV / Upstash Redis)**:
  - Endpoint: `https://tough-husky-101028.upstash.io`
  - Helpers: `kvGet(key)` and `kvSet(key, val)` in `app/js/state.js`.
  - Non-blocking execution: Cloud network requests run asynchronously in the background so local UI state toggles remain sub-millisecond fast.

### 3. Instant UI Toggle & Button Synchronization
- Clicking **`☐ Mark studied`** / **`✓ Studied`** invokes `updatePageStudyButtons(now)` in `app/js/content.js`.
- Both top (`.study-btn`) and bottom (`.bottom-nav-study-btn`) buttons update DOM classes, text content, tooltips, and the sidebar tree simultaneously without requiring page reloads or triggering DOM re-renders.
- CSS rule `transition: none !important;` on study buttons guarantees 0ms visual feedback latency on click.

---

## 🛠️ Vercel Deployment & Build Pipeline

### 1. Static Export Script (`tools/prepare_vercel.mjs`)
- Prepares the `public/` export directory for Vercel deployment by assembling `app/`, `data/`, `cjs/`, and `vyuka_downloaded/`.
- Uses `optionalCopyDir()` so missing local `.old` paths on Vercel build servers do not fail the build.

### 2. Version Control & Git Rules (`.gitignore`)
- **Tracked in Git**: Root code (`app/`, `data/`, `tools/`), build configuration (`vercel.json`), and precompiled static output (`public/`) so Vercel serves static files cleanly.
- **Ignored in Git**: `.env.local` (Upstash credentials), `.venv/`, `__pycache__/`, `.old/`, and temporary `scratch/` files.

---

## 🖨️ Printable PDF Layout (`@media print`)

- **Trigger**: Single-click **"Tisk 🖨"** button (`window.print()`).
- **CSS Overrides**: `@media print` in `app/css/content.css` forces high contrast black-on-white text for slides and exercise cards.
- **Clean Footer**: `.bottom-nav-bar`, `.lecture-toolbar`, `.sidebar`, `.titlebar`, and `.statusbar` are set to `display: none !important;` in print mode to eliminate empty outline boxes at the bottom of printed pages.

---

## 🌐 Dev Server & DevTools MCP Guidelines

- **Dev Server Command**: `python serve.py 8765` running on `http://127.0.0.1:8765/app/index.html`.
- **DevTools MCP Navigation**:
  - Always check `window.__pcsState` or active route data before attempting `navigate_page`.
  - **Do NOT navigate to guessed or non-existent URLs** to prevent `net::ERR_EMPTY_RESPONSE` or broken frame states.
