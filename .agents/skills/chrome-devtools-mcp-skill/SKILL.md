---
name: chrome-devtools-mcp-skill
description: Primary skill for visual screenshot verification, real-time UI/UX auditing, presentation slide debugging, DOM/console/network inspection, and Chrome DevTools MCP orchestration across any web project.
---

# 🌐 Chrome DevTools MCP Skill — Universal Visual Auditing & Web/Presentation Debugging

> **CORE SUPERPOWER**: **Inline Visual Verification (`take_screenshot`)**.  
> The single most powerful capability of `chrome-devtools-mcp` is giving the AI agent **direct visual perception** of rendered web pages inline. Never guess layout errors, font fallbacks, theme contrast issues, or CSS breakage — inspect real-time visual proof just like a human frontend engineer.

---

## 🚀 1. Universal Debugging Workflow (5-Step Protocol)

Whenever developing, styling, or debugging any web application, single-page app (SPA), presentation slide deck, dashboard, or UI component:

```
┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│  1. Dev Server Check   │ ──► │  2. Navigate & View    │ ──► │  3. Take Screenshot    │
│  Verify URL & port     │     │  navigate_page(url)    │     │  take_screenshot()     │
└────────────────────────┘     └────────────────────────┘     └───────────┬────────────┘
                                                                          │
┌────────────────────────┐     ┌────────────────────────┐                 ▼
│  5. Verify Fix         │ ◄── │  4. Audit & Inspect    │ ◄───────────────┘
│  Cache-bust reload     │     │  Console, Net & JS DOM │ (If visual or runtime bug found)
└────────────────────────┘     └────────────────────────┘
```

---

## 🛠️ 2. Tool Reference & Valid Argument Structure

> **IMPORTANT**: Always pass arguments matching the exact MCP schema.

| Tool Name | Key Parameters & Example Arguments | Primary Use Case & Superpower |
| :--- | :--- | :--- |
| **`take_screenshot`** | `{ format: "png" }` *(omit `filePath` for inline visual context)* | **#1 Tool**: Visual screenshot verification of active viewport or layout |
| **`navigate_page`** | `{ type: "url", url: "http://127.0.0.1:8765/..." }`<br>`{ type: "reload", ignoreCache: true }` | Open target URL or force cache-busted page reload |
| **`evaluate_script`** | `{ function: "() => { return document.title; }" }`<br>`{ function: "async () => await fetch('/data/...') " }` | **Must use `function` key** (string function declaration) to query DOM/State |
| **`list_console_messages`** | `{}` | Check uncaught JS exceptions, `SyntaxError`, & runtime warnings |
| **`list_network_requests`** | `{}` | Identify 404 missing assets, 500 server errors, CORS, & broken paths |
| **`click`** | `{ uid: "<element-uid>" }` | Click interactive elements, tabs, buttons, or slide controls |
| **`fill`** | `{ uid: "<input-uid>", text: "query" }` | Type text into search bars or form inputs |
| **`press_key`** | `{ key: "Enter" }` / `{ key: "ArrowRight" }` | Trigger keyboard shortcuts (`Ctrl+P`, `Ctrl+K`, slide arrows) |
| **`list_pages`** | `{}` / `{ select_page: { pageId: "1" } }` | List open browser tabs and switch active window context |
| **`lighthouse_audit`** | `{ categories: ["accessibility", "performance"] }` | Automated WCAG 2.1 contrast & performance audits |

---

## 🔍 3. Domain-Specific Debugging Guides

### A. Presentation Slides & Educational Decks
- **Slide Section Navigation & IDs**: Inspect section IDs (e.g. `#id1`, `#id27`), section titles, slide counters (`1 / 27`), and hash routing (`#/page/...`).
- **External Code Snippet Inlining**:
  - Debug `<example src="...">` tags pointing to external `.py`, `.out`, `.txt`, `.cmd`, or `.sh` files.
  - Verify that relative paths in `href` and `src` attributes correctly resolve relative to the slide's base directory (`/vyuka_downloaded/.../_files/...`).
  - Use `evaluate_script` to ensure inlined code blocks receive proper syntax highlighting classes (`code-block lang-python`).
- **Full Slide Presentation Mode**: Test fullscreen slide toggles, header auto-hiding, slide outline sidebars, and keyboard arrow navigation (`ArrowRight` / `ArrowLeft`).

### B. Scroll Position Memory & Tab Sync
- **Scroll Container Identification**: Use `evaluate_script` to determine whether `window`, `#main`, or a parent flex container (e.g. `.editor-body`) is the actual scrolling element (`scrollTop` & `scrollHeight`).
- **Frame-Throttled Scroll Tracking**: Ensure scroll listeners use `{ passive: true }` and `requestAnimationFrame` to track `scrollTop` and relative scroll ratios (`0.0` to `1.0`) with 0ms UI latency.
- **Tab Restoration Verification**: When switching between tabs, verify that `editorBody.scrollTop` is cleanly restored without jumping or resetting to top.

### C. Contrast, Themes & Print Engine (`@media print`)
- **Dark / Light Mode Verification**: Capture screenshots in both dark and light modes to verify text legibility, card borders, tag badges (`[Core]`, `[WOW]`, `[Tricky]`), and code block background contrast.
- **Print Layout Auditing (`Ctrl+P`)**: Verify `@media print` rules force clean white paper backgrounds (`#ffffff`), dark high-contrast text (`#111827`), 2-column report structures, and hidden UI Chrome.
- **Font Fallbacks**: Verify monospace code blocks render crisp preloaded fonts (`JetBrains Mono`, `IBM Plex Sans`) rather than ugly default system fallbacks (`Courier New`).

### D. Server Connections & Asset Loading
- **Connection Refused (`ERR_CONNECTION_REFUSED`)**: Dev server process has stopped or port changed. Check server status or restart local server (`python serve.py <port>` or `npm run dev`).
- **Port Already in Use (`Errno 98`)**: Free port via terminal (`fuser -k <port>/tcp` or `Stop-Process`) before restarting dev server.
- **Asset 404s**: Run `list_network_requests` to catch double-slashes in URLs (e.g. `/path//path/file.py`), missing routes, or missing static build exports (`public/`).

---

## ⚡ 4. Best Practices & Anti-Patterns

1. **Always Use Inline Screenshots**: Omit `filePath` when calling `take_screenshot` so the PNG is returned directly into conversation context for instant AI visual inspection.
2. **Never Guess DOM State**: Use `evaluate_script` (`function: "() => { ... }"`) to query real runtime state (`window.__pcsState`, DOM tree, element bounds) rather than making assumptions.
3. **Bust Browser Caches After Code Edits**: When verifying JS/CSS modifications, use `navigate_page` with `{ type: "reload", ignoreCache: true }` to ensure fresh asset execution.
4. **Audit Console Errors Concurrently**: Always pair visual screenshot inspection with `list_console_messages` to ensure zero hidden JavaScript runtime exceptions.
