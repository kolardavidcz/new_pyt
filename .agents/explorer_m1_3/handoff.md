# Handoff Report — Explorer 3: High-Density UI & @media print Design Specifications

## 1. Observation

Direct code examination of `app/css/tokens.css`, `app/css/shell.css`, `app/css/content.css`, `app/index.html`, and `tools/prepare_vercel.mjs` revealed the following structural details:

### A. Theme Variables & Tokens (`app/css/tokens.css`)
- Lines 46–140: Color surface variables (`--bg: #181818`, `--editor: #1f1f1f`, `--sidebar: #181818`, `--text: #cccccc`, `--accent: #0078d4`).
- Lines 87–97: Existing tag colors:
  ```css
  --tag-core: #4ec9b0;          --tag-core-bg: rgba(78, 201, 176, 0.15);
  --tag-wow: #dcdcaa;           --tag-wow-bg: rgba(220, 220, 170, 0.15);
  --tag-legendary: #c586c0;     --tag-legendary-bg: rgba(197, 134, 192, 0.18);
  --tag-tricky: #f48771;        --tag-tricky-bg: rgba(244, 135, 113, 0.15);
  --tag-skip: #6e7681;          --tag-skip-bg: rgba(110, 118, 129, 0.18);
  ```
- Lines 120–130: Font families (`--font-ui: "IBM Plex Sans"`, `--font-mono: "JetBrains Mono"`) and font sizes (`--fs-xs: 12px`, `--fs-sm: 13.5px`, `--fs-md: 15px`).

### B. Shell & Badge Components (`app/css/shell.css`)
- Lines 616–633: Badge base class `.badge` (height 16px, padding 0 5px, font-size 9px, font-weight 600, uppercase).
- Existing badge modifiers: `.badge-Core`, `.badge-WOW`, `.badge-Legendary`, `.badge-Tricky`, `.badge-Skip`.
- Missing required 5-badge specification: `[MEGA EPIC]`, `[CORE]`, `[INSIGHT]`, `[CHALLENGE]`, `[PRACTICE]`.

### C. Difficulty Scores & Existing Content Components (`app/css/content.css`)
- Lines 672–744: Existing difficulty score elements:
  - `.score-badge` (background `var(--bg)`, border `var(--border)`, font-family `var(--font-mono)`).
  - `.score-tech` (cyan color `#4fc1ff`, background `rgba(0, 120, 212, 0.08)`).
  - `.score-log` (amber color `#cda34f`, background `rgba(205, 163, 79, 0.08)`).
  - `.score-bars` & `.score-bar-seg` (5 micro-bars of 4px width, 10px height).
  - `.toc-chip-t`, `.toc-chip-l` (compact text badges like `T3`, `L4`).
- Lines 1629–1841: Existing `@media print` print stylesheet:
  - Hides chrome (`.titlebar`, `.activitybar`, `.sidebar`, `.tabbar`, `.statusbar`, `.breadcrumb`, `#sash`, buttons).
  - Resets background to `#ffffff` and text to `#000000`.
  - Sets `break-inside: avoid` on `.slide`, `.task-card`, `.week-block`.
  - Missing specific print rules for: 4-Level Checklist container (`.checklist-view`, `.checklist-level`), Common Python Footguns table (`.footguns-table`), printable checkboxes (`[ ]`), and self-test audit question cards (`.self-test-card`).

### D. Shell Navigation & Build Tools (`app/index.html` & `tools/prepare_vercel.mjs`)
- `app/index.html` lines 38–52: Activity bar contains 3 active buttons (`explorer`, `search`, `progress`) plus sidebar toggle.
- `tools/prepare_vercel.mjs`: Build script copies `app/`, `data/`, `.old/cjs/`, `.old/vyuka_downloaded/` to `public/` and mirrors `app/index.html` to `public/index.html`.

---

## 2. Logic Chain

1. **Badge System Normalization**:
   - The original requirements mandate 5 explicit badge types: `[MEGA EPIC]`, `[CORE]`, `[INSIGHT]`, `[CHALLENGE]`, `[PRACTICE]`.
   - Existing CSS only maps legacy tags (`Core`, `WOW`, `Legendary`, `Tricky`, `Skip`).
   - *Inference*: Add dedicated CSS token variables and `.badge-MEGA_EPIC`, `.badge-CORE`, `.badge-INSIGHT`, `.badge-CHALLENGE`, `.badge-PRACTICE` modifier classes with high visual contrast in dark mode, light mode, and print mode.

2. **Dual Difficulty Chips (`T3 L4`)**:
   - Technical difficulty ($T1 \dots T5$) represents syntax/framework overhead; Logical difficulty ($L1 \dots L5$) represents algorithmic depth/insight required.
   - High-density list views (such as the 4-level checklist) require an ultra-compact chip layout (`T3 L4`) with micro-segmented rating bars that don't wrap or cause horizontal overflow.
   - *Inference*: Create `.diff-dual-chip` with dual inline flex badges (`.diff-t` and `.diff-l`) featuring 5 vertical bar segments (`width: 3px`, `height: 8px`).

3. **Common Python Footguns / Pitfalls Table**:
   - Needs a high-density cheatsheet presentation comparing C++/Java memory/scope mental models vs. Python runtime behavior.
   - Must support 4 key footguns: mutable default args (`def f(a=[])`), scope leakage in loops (`for x in ...`), `is` vs `==`, mutating list while iterating.
   - *Inference*: Design `.footguns-table` with 4 columns (*Footgun / Topic*, *C++/Java Expectation*, *Python Reality & Fix*, *Severity*), zebra striping, monospace code blocks, and warning callout styling.

4. **"Vytisknout studijní plán 🖨" Button & `@media print` Print Layout**:
   - The user needs a single click button `window.print()` that generates a clean academic study certificate / study guide.
   - Must render cleanly on paper (pure white `#ffffff` background, crisp `#000000` text, zero dark boxes, zero clipped content).
   - Must prevent awkward page cuts across checklist items, footgun rows, or audit questions using `break-inside: avoid` / `page-break-inside: avoid`.
   - Must transform interactive checkboxes into printable square check boxes `[ ]` (`14px × 14px`, 1.5px black border) so students can check them off manually with a pencil when printed.
   - Must include a printable **Self-Test Audit Question Section** (`.self-test-section`) with high-density audit prompt cards.

---

## 3. Caveats

- **Read-Only Scope**: This report provides full CSS and layout specifications, but does not modify application files directly. Implementers (such as Implementer 1 or 2) should apply these CSS rules into `app/css/tokens.css`, `app/css/shell.css`, and `app/css/content.css`.
- **Browser Print Variance**: `@media print` page breaking relies on modern browser implementations (`break-inside: avoid`). Chromium (Chrome/Edge) and Firefox handle page break boundaries reliably when containers have `display: block` or `display: flex`.

---

## 4. Conclusion & Complete Design Specifications

### Specification 1: Design Tokens (`app/css/tokens.css`)

Add these color tokens under `:root` and `html[data-theme="light"]`:

```css
/* ── Checklist Badge Tokens ───────────────────────────── */
:root {
  --badge-mega-epic: #c586c0;
  --badge-mega-epic-bg: rgba(197, 134, 192, 0.22);
  --badge-core: #4ec9b0;
  --badge-core-bg: rgba(78, 201, 176, 0.18);
  --badge-insight: #e2b714;
  --badge-insight-bg: rgba(226, 183, 20, 0.18);
  --badge-challenge: #f48771;
  --badge-challenge-bg: rgba(244, 135, 113, 0.20);
  --badge-practice: #4fc1ff;
  --badge-practice-bg: rgba(79, 193, 255, 0.18);
}

html[data-theme="light"] {
  --badge-mega-epic: #8e24aa;
  --badge-mega-epic-bg: #f3e5f5;
  --badge-core: #00796b;
  --badge-core-bg: #e0f2f1;
  --badge-insight: #b78103;
  --badge-insight-bg: #fffde7;
  --badge-challenge: #d32f2f;
  --badge-challenge-bg: #ffebee;
  --badge-practice: #0288d1;
  --badge-practice-bg: #e1f5fe;
}
```

---

### Specification 2: Badge Component Classes (`app/css/shell.css` / `app/css/content.css`)

```css
/* Badge Modifiers */
.badge-MEGA_EPIC, .badge-MEGA-EPIC {
  background: var(--badge-mega-epic-bg);
  color: var(--badge-mega-epic);
  border: 1px solid var(--badge-mega-epic);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.badge-CORE {
  background: var(--badge-core-bg);
  color: var(--badge-core);
  border: 1px solid var(--badge-core);
}

.badge-INSIGHT {
  background: var(--badge-insight-bg);
  color: var(--badge-insight);
  border: 1px solid var(--badge-insight);
}

.badge-CHALLENGE {
  background: var(--badge-challenge-bg);
  color: var(--badge-challenge);
  border: 1px solid var(--badge-challenge);
}

.badge-PRACTICE {
  background: var(--badge-practice-bg);
  color: var(--badge-practice);
  border: 1px solid var(--badge-practice);
}
```

---

### Specification 3: Dual Difficulty Scores (`T3 L4`)

```css
/* High-Density Dual Difficulty Score Chips */
.diff-dual-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  user-select: none;
}

.diff-chip-t, .diff-chip-l {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
}

.diff-chip-t {
  background: rgba(0, 120, 212, 0.15);
  border: 1px solid rgba(0, 120, 212, 0.4);
  color: #4fc1ff;
}

.diff-chip-l {
  background: rgba(205, 163, 79, 0.15);
  border: 1px solid rgba(205, 163, 79, 0.4);
  color: #cda34f;
}

.diff-bars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.diff-bar-seg {
  width: 3px;
  height: 8px;
  border-radius: 1px;
  background: rgba(110, 118, 129, 0.3);
}

.diff-chip-t .diff-bar-seg.on {
  background: #4fc1ff;
  box-shadow: 0 0 3px rgba(79, 193, 255, 0.5);
}

.diff-chip-l .diff-bar-seg.on {
  background: #cda34f;
  box-shadow: 0 0 3px rgba(205, 163, 79, 0.5);
}
```

---

### Specification 4: Common Python Footguns Table Styling

```css
/* High-Density Cheatsheet / Footguns Table */
.footguns-section {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.footguns-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.footguns-title {
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--text-bright);
  display: flex;
  align-items: center;
  gap: 8px;
}

.footguns-table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.footguns-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-sm);
  text-align: left;
}

.footguns-table th {
  background: var(--editor);
  color: var(--text-bright);
  font-weight: 600;
  padding: 10px 12px;
  border-bottom: 2px solid var(--border);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footguns-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: top;
  line-height: 1.45;
}

.footguns-table tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.footguns-table tbody tr:hover {
  background: var(--list-hover);
}

.footgun-name {
  font-weight: 600;
  color: var(--text-bright);
}

.footgun-cpp {
  color: var(--text-muted);
  font-size: var(--fs-xs);
}

.footgun-py {
  color: var(--text);
}

.footgun-code {
  font-family: var(--font-mono);
  font-size: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--tag-wow);
  display: inline-block;
  margin-top: 4px;
}

.footgun-risk-high {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 700;
  font-size: 10px;
  background: rgba(244, 135, 113, 0.2);
  color: #f48771;
  border: 1px solid rgba(244, 135, 113, 0.4);
}
```

---

### Specification 5: Print Button & Comprehensive `@media print` Stylesheet

```css
/* Print Trigger Button */
.btn-print-checklist {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: background var(--dur) var(--ease);
}
.btn-print-checklist:hover {
  background: var(--accent-hover);
}

/* Comprehensive @media print Rules */
@media print {
  @page {
    size: A4 portrait;
    margin: 12mm 15mm 15mm 15mm;
  }

  *,
  *::before,
  *::after {
    background: transparent !important;
    color: #000000 !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  html, body {
    background: #ffffff !important;
    color: #000000 !important;
    font-family: "IBM Plex Sans", -apple-system, sans-serif !important;
    font-size: 11pt !important;
    line-height: 1.4 !important;
    height: auto !important;
    overflow: visible !important;
  }

  /* Hide interactive web chrome */
  .titlebar,
  .activitybar,
  .sidebar,
  .tabbar,
  .statusbar,
  .breadcrumb,
  #sash,
  .palette-overlay,
  .item-actions,
  .lecture-toolbar,
  .welcome-keys,
  .btn-print-checklist,
  .btn-print-progress,
  .progress-reset,
  button {
    display: none !important;
  }

  /* Full width container reset */
  #app,
  .workbench,
  .editor-group,
  #editorBody,
  #main,
  .catalog,
  .checklist-view {
    display: block !important;
    position: static !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    background: #ffffff !important;
    color: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Academic Certificate / Study Plan Header */
  .print-header {
    display: block !important;
    border-bottom: 2px solid #000000 !important;
    padding-bottom: 10px !important;
    margin-bottom: 16px !important;
  }

  .print-header h1 {
    font-size: 18pt !important;
    font-weight: 700 !important;
    margin: 0 0 4pt 0 !important;
  }

  .print-header .print-meta {
    font-size: 9pt !important;
    color: #333333 !important;
    display: flex !important;
    justify-content: space-between !important;
  }

  /* Page Break Optimizations */
  .checklist-level,
  .checklist-card,
  .footguns-section,
  .footguns-table-wrap,
  .self-test-card,
  .study-week {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    margin-bottom: 14pt !important;
  }

  .checklist-level-header {
    border-bottom: 1.5pt solid #000000 !important;
    padding-bottom: 4pt !important;
    margin-bottom: 8pt !important;
  }

  /* High-Contrast Badges for Print */
  .badge {
    border: 1px solid #000000 !important;
    color: #000000 !important;
    background: #ffffff !important;
    font-size: 7.5pt !important;
    padding: 1px 4px !important;
    font-weight: 700 !important;
  }

  /* Difficulty Chips in Print */
  .diff-dual-chip, .score-chip {
    border: 1px solid #666666 !important;
    background: #ffffff !important;
    color: #000000 !important;
    font-size: 8pt !important;
  }
  .diff-bar-seg.on {
    background: #000000 !important;
  }

  /* Printable Checkboxes [ ] */
  .printable-checkbox {
    display: inline-block !important;
    width: 14px !important;
    height: 14px !important;
    border: 1.5px solid #000000 !important;
    border-radius: 2px !important;
    margin-right: 8px !important;
    vertical-align: middle !important;
    background: #ffffff !important;
  }

  .printable-checkbox.checked::after {
    content: "✓" !important;
    display: block !important;
    font-size: 11px !important;
    font-weight: bold !important;
    text-align: center !important;
    line-height: 12px !important;
    color: #000000 !important;
  }

  /* Footguns Table Print */
  .footguns-table {
    width: 100% !important;
    border: 1px solid #000000 !important;
  }
  .footguns-table th,
  .footguns-table td {
    border: 1px solid #666666 !important;
    padding: 6px 8px !important;
    font-size: 9pt !important;
  }
  .footguns-table th {
    background: #f0f0f0 !important;
    font-weight: bold !important;
  }
  .footgun-code {
    background: #f5f5f5 !important;
    border: 1px solid #cccccc !important;
    color: #000000 !important;
    font-size: 8.5pt !important;
  }

  /* Self-Test Audit Questions Print Formatting */
  .self-test-section {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    margin-top: 20pt !important;
    border: 1.5px solid #000000 !important;
    padding: 12pt !important;
    border-radius: 4px !important;
  }
  .self-test-title {
    font-size: 13pt !important;
    font-weight: bold !important;
    margin-bottom: 8pt !important;
    border-bottom: 1px solid #000000 !important;
    padding-bottom: 4pt !important;
  }
  .self-test-card {
    margin-bottom: 10pt !important;
    padding-bottom: 8pt !important;
    border-bottom: 1px stroke #cccccc !important;
  }
  .self-test-q {
    font-weight: 600 !important;
    font-size: 10pt !important;
    margin-bottom: 4pt !important;
  }
  .self-test-lines {
    border-bottom: 1px dashed #999999 !important;
    height: 18pt !important;
    margin-top: 4pt !important;
  }
}
```

---

## 5. Verification Method

To verify these design specifications:

1. **CSS Parsing & Token Validation**:
   - Inspect `app/css/tokens.css` to confirm standard `:root` variable definitions.
   - Inspect `app/css/shell.css` to verify badge classes `.badge-MEGA_EPIC`, `.badge-CORE`, `.badge-INSIGHT`, `.badge-CHALLENGE`, `.badge-PRACTICE`.

2. **UI Compression & Dual Chip Verification**:
   - Inspect `app/css/content.css` for `.diff-dual-chip` micro-bar rendering.

3. **Print Layout Verification**:
   - Execute `node tools/prepare_vercel.mjs` to ensure built assets pass static staging.
   - Open browser print preview (`Ctrl+P`) on the Checklist tab to confirm:
     - Background is pure white `#ffffff`.
     - `break-inside: avoid` prevents orphan headers.
     - Checkboxes render as printable `[ ]` boxes.
     - Self-test audit question cards render with clean answer lines.
