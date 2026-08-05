---
name: chrome-devtools-mcp-skill
description: Primary skill for visual screenshot verification, real-time UI inspection, pixel-perfection auditing, browser interaction, console error monitoring, and DevTools orchestration using chrome-devtools-mcp.
---

# Chrome DevTools MCP Skill — Visual Screenshot Verification & Browser Auditing

> **CORE SUPERPOWER**: **Visual Screenshot Inspection (`take_screenshot`)**.  
> The single most important capability of `chrome-devtools-mcp` is allowing the AI agent to **see the actual rendered page** inline, eliminating guessing, verifying pixel perfection, and inspecting real-time UI layout, themes, font rendering, and contrast just like a human engineer.

---

## 📸 1. The #1 Rule: Always Take Screenshots for Visual Proof

Whenever modifying HTML, CSS styles, layouts, themes, responsive containers, code block rendering, or user interfaces:

1. **Navigate to the Page**: Use `navigate_page` to open the local dev server URL (e.g. `http://127.0.0.1:8765/app/index.html#/lecture/...`).
2. **Capture Viewport Screenshot**: Call `take_screenshot` (omit `filePath` so the PNG attaches inline into the conversation context).
3. **Visually Inspect**: Inspect the attached image for:
   - Pixel alignment & margins
   - Font rendering (e.g., verifying `JetBrains Mono` vs fallback Courier)
   - Color contrast & dark/light theme legibility
   - Unwanted line wraps or text truncation
4. **Iterate Until Perfect**: If something looks off, adjust the code, refresh/navigate, and capture another screenshot to confirm 100% resolution.

---

## 🛠️ 2. Tool Overview & Signatures

Call via `call_mcp_tool(ServerName: "chrome-devtools-mcp", ToolName: "<name>", Arguments: { ... })`:

| Category | Tool Name | Key Arguments | Superpower / Use Case |
| :--- | :--- | :--- | :--- |
| **📸 Visual Screenshots** | `take_screenshot` | `{ format: "png", fullPage: false }` | **#1 Tool**: Capture inline PNG screenshot of active viewport or full page |
| **Navigation** | `list_pages` | `{}` | List open browser tabs and active page ID |
| | `navigate_page` | `{ url: "http://127.0.0.1:8765/...", type: "url" }` | Open local dev server or target route |
| | `select_page` | `{ pageId: "1" }` | Switch active tab |
| | `close_page` | `{ pageId: "1" }` | Close browser tab |
| **User Interaction** | `click` | `{ uid: "button-id" }` | Click DOM element (buttons, tabs, theme toggles) |
| | `fill` | `{ uid: "search-input", text: "python" }` | Input text into input/search fields |
| | `press_key` | `{ key: "Enter" }` | Trigger key events (e.g. `Ctrl+P`, `Ctrl+K`) |
| **Inspection & Scripts** | `evaluate_script` | `{ script: "window.innerHeight" }` | Evaluate JS in browser context |
| | `list_console_messages` | `{}` | Check uncaught JS exceptions & runtime errors |
| | `list_network_requests` | `{}` | Check 404/500 HTTP failures & asset loading |
| **Performance & WCAG** | `lighthouse_audit` | `{ categories: ["accessibility"] }` | Run automated WCAG & performance audits |
| | `performance_start_trace` | `{}` / `performance_stop_trace` | Trace page rendering bottlenecks |

---

## 📋 3. Standard Visual Verification Workflow

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│  1. Start Dev Server    │ ──► │  2. Navigate Page       │ ──► │  3. Take Screenshot     │
│  python serve.py 8765   │     │  navigate_page(URL)     │     │  take_screenshot()      │
└─────────────────────────┘     └─────────────────────────┘     └────────────┬────────────┘
                                                                             │
┌─────────────────────────┐     ┌─────────────────────────┐                  ▼
│  5. Verify Resolution   │ ◄── │  4. Inspect Screenshot  │ ◄──────────────────┘
│  Re-take Screenshot     │     │  Check layout & colors  │ (If visual bug found)
└─────────────────────────└     └─────────────────────────┘
```

---

## ⚡ 4. Best Practices & Screenshot Rules

1. **Always Use Inline Screenshots**: Never pass a file path to `take_screenshot` unless specifically asked to save a screenshot artifact. Omitting `filePath` returns the PNG directly into conversation context for instant visual analysis.
2. **Combine Screenshots with Console Audits**: After taking a screenshot, run `list_console_messages` to ensure zero hidden JavaScript errors.
3. **Never Guess Browser State**: If a page doesn't look right, take a screenshot first to see the exact render tree before making CSS edits.
