# 🤖 AGENTS.md — AI Agent Architecture & UI Style Guidelines

This file outlines core architecture maps, coding conventions, dev/test workflows, and UI design standards for AI agents working on the **`newpyt` / `python_overview`** project.

---

## 🎨 UI & Design Standards ("2 · Terminal" Design Theme)

The project adheres to the **"2 · Terminal"** VS Code Dark+ inspired user interface theme across all modals, control centers, and account management views.

### Core Visual Principles
1. **Typography & Monospace Dominance**:
   - Primary control font: `var(--font-mono)` (`"JetBrains Mono"`, `Consolas`, `ui-monospace`, `monospace`).
   - Use monospace typography for tab triggers, command prompts, status pills, file header comments, code blocks, and form input labels.
   - Use `var(--font-sans)` for body text and long descriptions.

2. **Syntax Color Accents (VS Code Dark+ Palette)**:
   - **Comment Green**: `#6a9955` — Used for file path headers (`// auth/login.ts`, `// admin/control-center.ts`), green status checks (`✓`), and dev box borders.
   - **Type / Identifier Teal**: `#4ec9b0` — Used for highlighted values, completion counts, and numbers (`progress 8/136 studied · 6% complete`).
   - **Sky Blue**: `#38bdf8` — Used for action prompts (`$`), primary highlights, and active tab indicators.
   - **Dark Editor Surface**: `var(--editor)` (`#1e1e1e` / `#161616`) with subtle `#3c3c3c` borders.

3. **Crisp Geometric Geometry**:
   - **Sharp Radii**: Use `border-radius: 2px` across cards (`.v2-card`), buttons (`.btn`), status line containers (`.v2-status-line`), and inputs.
   - **Monospace Prompt Buttons**: Action buttons feature terminal command prompt indicators (e.g. `<span class="prompt">$</span>login --password`, `<span class="prompt">$</span>admin --overview`, `<span class="prompt">$</span>sync`).

4. **Status Badges & List Formatting**:
   - Use bracketed monospace tags for status pills: `[OPEN]`, `[RESOLVED]`, `[DISMISSED]`, `[ADMIN]`, `[STUDENT]`.

---

## 🏗️ Architecture & Module Map

- **`app/index.html`**: SPA shell, titlebar, activity bar, and modal overlay container markup (`#profileModal`, `#adminModal`, `#questionImproveModal`).
- **`app/js/app.js`**: Application bootstrap, global state binding, theme toggle, and event delegation.
- **`app/js/state.js`**: Reactive state store, Web Crypto SHA-256 user database, LocalStorage & Upstash Redis Cloud Sync.
- **`app/js/content.js`**: Catalog rendering, lecture HTML extraction, and rich `"2 · Terminal"` login/profile dashboard views.
- **`app/js/admin.js`**: Multi-admin dashboard control center formatted in `"2 · Terminal"` monospace theme (`[1] vylepšení`, `[2] uživatelé`, `[3] relevance`, `[4] diagnostika`).
- **`app/js/ui.js`**: UI component helpers including `starsHtml()` multi-rating heat bar meter (AI base fill, **S** student white line, **T** teacher blue line).
- **`app/js/quiz.js`**: Interactive quiz section renderer and "Navrhnout úpravu" suggestion modal.

---

## ⚡ Dev & Verification Workflows

1. **WSL2 Execution Mandate**: Execute python and node commands inside WSL2 (`wsl bash -c "..."`).
2. **DevPort System (Port 34060)**:
   - Server runs on port `34060` via `serve.py` (`DEFAULT_PORT = 34060`).
3. **Build Sync**:
   - Always run `node tools/prepare_vercel.mjs` to update `public/` tree prior to completing tasks.
