# 🤖 AGENT.md — Technical Architecture & Guidelines for AI Coding Agents

> **Target Audience**: AI Coding Assistants (Antigravity, Gemini, Copilot, Subagents).  
> **Repository**: `kolardavidcz/new_pyt`  
> **Environment**: Windows 11 + WSL2 / PowerShell / Node.js ES Modules / Vanilla JS (SPA)

---

## 🎯 Architecture Overview

Python Hub is a zero-dependency, high-performance Single Page Application (SPA) built using Vanilla JavaScript (ES Modules), HTML5, and custom Vanilla CSS.

```
b:\python_overview\
├── app/
│   ├── css/
│   │   ├── shell.css         # Core VS Code dark theme rules, grid layouts & button system
│   │   ├── lecture.css       # Presentation reader & slide layouts
│   │   ├── quiz.css          # Interactive quiz cards, options & feedback
│   │   └── print.css         # @media print 2-column PDF layout rules
│   └── js/
│       ├── app.js            # SPA initialization & async module bootsrap
│       ├── state.js          # Reactive state, user database, password hashing & quiz shuffle
│       ├── router.js         # Hash-based SPA router (#/lecture/*, #/week/*, #/progress, #/login)
│       ├── content.js        # Main views renderer (Lectures, Exercises, User Profile, Login Card)
│       ├── quiz.js           # Quiz engine, answer validation & improvement modal
│       ├── sync.js           # Upstash Redis KV cloud progress synchronization
│       ├── format.js         # Code tokenization, Czech unicode support & inline code pills
│       ├── tree.js           # Explorer sidebar tree view rendering
│       ├── highlight.js      # Syntactical code highlighter & dedenting
│       └── ui.js             # Micro DOM helper utilities (el, clear, escapeHtml)
├── data/
│   ├── course.json           # Master syllabus tree manifest
│   ├── exercises.json        # Exercise catalog with T/L score metrics
│   └── quizzes/              # Per-week quiz question datasets (w0.json .. w12.json)
├── tools/
│   ├── check_contrast.mjs    # WCAG 2.1 AA 6-variant color contrast automated test suite
│   ├── prepare_vercel.mjs   # Static bundle generator (synchronizes app/ & data/ to public/)
│   └── quiz_stat.mjs        # Quiz option distribution statistical verification tool
├── public/                   # Production static export directory for Vercel
├── serve.py                  # Local Python dev server (no-cache headers, default port 8765)
└── vercel.json               # Vercel deployment configuration
```

---

## 🔑 Authentication & Security Engine (`app/js/state.js`)

### 1. Simple Email-Only Authentication
- **User Identifier**: Authentication uses `email` (e.g. `kolard@vscht.cz`).
- **Canonical Username**: Derived automatically from the email prefix (`kolard@vscht.cz` -> `@kolard`).
- **Passkey Removal**: 32-character Passkeys have been **completely eliminated** from UI, state, and storage.

### 2. Salted SHA-256 Web Crypto Engine
- Passwords are encrypted locally using the native `crypto.subtle.digest("SHA-256", ...)` Web Crypto API.
- Each user account gets a unique 16-byte random hex salt generated via `crypto.getRandomValues()`.
- **User Database Schema** (`localStorage` key: `pcs-users-db-v1`):
  ```json
  {
    "kolard": {
      "username": "kolard",
      "email": "kolard@vscht.cz",
      "salt": "a1b2c3d4e5f67890...",
      "passwordHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "createdAt": "2026-08-12T10:00:00.000Z"
    }
  }
  ```
- **Memory Safety**: `passwordHash` and `salt` are stripped from `state.user` in memory after authentication.

---

## ☁️ Cloud Progress Sync (`app/js/sync.js` & `app/js/state.js`)

- **Backend**: Upstash Redis KV database.
- **Key Pattern**: `pyt:<username>:<dataset>` (e.g., `pyt:kolard:studied`, `pyt:kolard:quizScores`).
- **Trigger Points**: Automatically triggered asynchronously (`await syncCloudProgress()`) upon:
  1. User Login
  2. Account Registration
  3. Manual "sync" button click in Profile Dashboard.

---

## 🎲 Deterministic Quiz Option Shuffle & Padding (`app/js/state.js`)

### 1. FNV-1a Hash Modulo-4 Distribution
To prevent Option **A** from being the correct answer in ~95% of questions, `ensureShuffledOptions(q, deckKey, idx)` applies a deterministic 32-bit FNV-1a hash algorithm:
```javascript
const seedStr = `${deckKey}:${q.id || idx}:${q.question || ""}:${cleanOpts.length}`;
const hash = hashFnv32(seedStr);
const targetIdx = hash % cleanOpts.length;
```
- **Uniformity**: Target index calculation produces an exact **25.3% A / 25.7% B / 23.6% C / 25.4% D** distribution across all 665+ multiple-choice questions.

### 2. Plausible 4th Distractor Auto-Padding
- If a question has only 3 options, `ensureShuffledOptions` deterministically appends a plausible 4th Python distractor (e.g. `SyntaxError`, `TypeError`, `AttributeError`, `None`) from `GENERIC_DISTRACTORS`.
- This ensures Option **D** gets ~25% representation across all tests.

### 3. Codefill Suggestion Chips
- `code_fill` and `fill_blank_choice` nápověda pills are shuffled so the 1st suggestion chip is the correct answer ~25% of the time.

---

## 🎨 UI Design Tokens & CSS Guidelines (`app/css/shell.css`)

### 1. Color Palette (VS Code Terminal Aesthetic)
- **Editor Background**: `#1e1e1e` (Dark mode) / `#ffffff` (Light mode)
- **Sidebar Background**: `#252526`
- **Status Bar**: `#007acc`
- **Primary Accent / Buttons**: `#0284c7` (Hover: `#0369a1`)
- **Secondary & Action Buttons**: `rgba(255, 255, 255, 0.08)` (Border: `rgba(255, 255, 255, 0.16)`, Text: `#e2e8f0`, Hover: `rgba(255, 255, 255, 0.16)`)

### 2. Utility Classes & DOM Toggling
- **CRITICAL CSS OVERRIDE**: `.hidden { display: none !important; }` in `shell.css`.
- When showing an element programmatically, **ALWAYS call `element.classList.remove("hidden")`** in addition to setting inline styles (e.g. `style.display = "flex"`), otherwise `.hidden` will force `display: none !important`.

---

## 🧪 Testing & Verification Suite

Agents MUST execute verification tools before concluding any task:

### 1. WCAG 2.1 AA Color Contrast Audit
```bash
node tools/check_contrast.mjs
```
- **Requirement**: Must pass **43 / 43 test cases** (0 failures).

### 2. Vercel Static Export Preparation
```bash
node tools/prepare_vercel.mjs
```
- Synchronizes `app/`, `data/`, and static resources to `public/` (**1,704 static files**).

### 3. Chrome DevTools MCP Visual QA
- Use DevTools MCP tools (`navigate_page`, `evaluate_script`, `take_screenshot`) to capture inline PNG screenshots and empirically verify UI layout changes on `http://localhost:8780/#/login` and `http://localhost:8780/#/lecture/*`.

---

## ⚠️ Mandatory Rules for AI Agents

1. **No Superficial Symptom Patches**: Never comment out failing assertions, swallow errors, or return dummy fallbacks. Trace root causes empirical log evidence.
2. **Never Declare Success Without Verification**: Always execute `node tools/check_contrast.mjs`, `node tools/prepare_vercel.mjs`, and DevTools screenshot verification.
3. **Preserve User Customization**: Always adhere to user rules and high engineering standards (WCAG 2.1 AA, linting, test reliability).
