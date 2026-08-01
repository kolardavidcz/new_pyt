# Antigravity Developer Guide — Python Overview Project

Welcome to the `new_PYT` workspace. This guide outlines the project structure, design system rules, and compilation workflows for future agent development.

---

## 🏗️ Project Architecture

This is a web-based learning dashboard for developers transitioning from Java/C++ to Python.

- **Main Dashboard**: [new_order.html](new_order.html)
  - Features collapsible weekly topics, progress tracking (with metrics chips), filters (by status/difficulty), and global text search.
- **Source Lectures & Exercises**: Stored as `.xml` files in `vyuka_downloaded/`.
  - **Lectures**: Under `vyuka_downloaded/materialy/python/`
  - **Exercises**: Under `vyuka_downloaded/priklady/python/`
- **Output Static Pages**: Compiled `.html` versions of the XML slides stored alongside their sources.
- **Global Search Index**: [search_index.json](search_index.json) containing extracted plaintext slide snippets for client-side search.

---

## 🛠️ HTML Compilation Workflow

To eliminate rendering delays and flashes, pages are precompiled to static HTML. **Do not modify the XSL files expecting live browser-side compilation.**

### Compilation Scripts
1. **Recompile Everything**:
   ```bash
   uv run python build_html.py
   ```
   - Compiles all `.xml` slides/exercises into `.html` files.
   - Re-indexes all text snippets and outputs `search_index.json` to the root directory.
   - Adjusts references inside `new_order.html` to target compiled `.html` files.
2. **Watch for Changes (Auto-compile Loop)**:
   ```bash
   uv run python watch_html.py
   ```
   - Polls XML, XSLT, CSS, and JS files for changes and automatically invokes the compiler.

### Version Control Rules
- **Git Tracks HTML**: The generated `.html` files must be committed to Git so that Vercel serves them directly.
- **Git Ignores XML**: Raw `.xml` files are ignored in Git to keep remote repositories clean. Keep editing them locally.

---

## 🎨 Styling & Component Rules

- **Theme Key**: Theme mode (light/dark) is stored under the `'python-course-theme'` key in `localStorage`. 
- **Subpage Themes**: When designing or editing slides, the blocking inline script in the `<head>` of the HTML files applies background colors to the `<html>` root directly to avoid flash of unstyled content (FOUC).
- **Console Session Code Blocks**:
  - Code cells are styled using SyntaxHighlighter (`div.syntaxhighlighter`).
  - To add margins/padding to the text inside code containers without breaking full-width layouts, target the line wrapper:
    ```css
    div.syntaxhighlighter td.code .container {
      padding: 12px 16px !important;
    }
    ```
- **Metadata Escaping**:
  - Card fields (title, description, comparison text) are rendered dynamically via JavaScript in `new_order.html`.
  - **Always escape metadata** using `escapeHtml(text)` before placing it in the DOM. Raw XML values can contain mathematical operators (like `<` or `>`) which can corrupt the HTML DOM tree and render buttons invisible.

---

## ⚡ Single Page Application (SPA) & Routing

To completely prevent browser `about:blank` repaint white flashes when clicking links or switching tabs, the site functions as a client-side SPA.

- **Routing Interceptor**: [spa_router.js](cjs/spa_router.js) intercepts all same-origin navigation clicks.
- **Dynamic Content Injection**:
  - Replaces `<div id="layout-root">` inside the body dynamically via `fetch` and `DOMParser`.
  - Scans and loads new stylesheets or script elements on demand.
  - Re-triggers page initializers (`window.initDashboard()` for dashboard, `window.initSubpage()` for slides/exercises).
- **Navigation Controls**:
  - Primary navigation links (e.g. "Lokální snímky" buttons or slide search links) **must not use target="_blank"** so they route smoothly within the SPA context.
- **Scroll Settings Override**:
  - Slide layouts scroll the main window viewport, whereas the dashboard uses scrollable side-by-side columns.
  - The compiler/router toggles the `spa-subpage-active` class on the `<html>` root node, which triggers CSS overrides in `dashboard.css` to allow standard body scrolling on slide pages.

---

## 📦 Styling Assets Single Source of Truth

To avoid duplication of assets:
- **Source of Truth**: The root `/cjs/` folder is the single source of truth for all stylesheets (`.css`), scripts (`.js`), and XSLT templates (`.xsl`).
- **Git Tracking**: Only the root `/cjs/` folder is committed to Git. The duplicate folder `vyuka_downloaded/cjs/` is ignored in Git.
- **Auto-Syncing**:
  - `build_html.py` and `start_course.py` automatically clear and synchronize `vyuka_downloaded/cjs/` from the root `/cjs/` folder at compile or startup to maintain relative paths compatibility for local XML previewing.
  - **Always edit style and script files in the root `/cjs/` directory**, NOT inside `vyuka_downloaded/cjs/`.

---

## 🔍 Full-Text Search Engine

- **Minified Index**: `build_html.py` generates a minified `search_index.json` containing plaintext slide content and external program source files to optimize bandwidth.
- **Lazy Loading**: The dashboard does not load the search index on page instantiation. It is fetched lazily on-demand once the user focuses or types a query in the search bar.
