# 🧪 Subagent Guide: Chrome DevTools Visual & Console Error Testing Protocol

> **FILE PATHS FOR SUBAGENTS**:
> - **Windows Path**: `b:\python_overview\test_newpyt_screenshots_chrome.md`
> - **WSL Ubuntu Path**: `/mnt/b/python_overview/test_newpyt_screenshots_chrome.md`
> - **Artifact Path**: `file:///C:/Users/kolar/.gemini/antigravity/brain/2077823f-6f5c-49da-8d2a-4a2c9a554670/test_newpyt_screenshots_chrome.md`

---

## 🎯 Primary QA Subagent Objective

The primary objective of the Visual QA Subagent is to browse **all parts of the application website** using Chrome DevTools MCP tools (`navigate_page`, `evaluate_script`, `list_console_messages`, `take_screenshot`) and automatically collect:
1. **Uncaught Console Errors & Exceptions** (e.g., `ReferenceError: formatInlineCode is not defined`, `TypeError`, broken DOM calls).
2. **Inline Viewport Screenshots** of all major routes across the 4-Theme Matrix and Print Mode.

---

## 🛠️ Step-by-Step QA Execution Protocol

### Step 1: Ensure Local Server is Active
Server URL: `http://127.0.0.1:8765/public/index.html`  
If connection fails, start server in terminal:
```bash
python serve.py 8765
```

---

### Step 2: Full Route Navigation & Console Auditing

Navigate through all application routes in sequence:

| Route Kind | Target Hash / URL | Expected Visual Element | Console Check Command |
| :--- | :--- | :--- | :--- |
| **Home Catalog** | `http://127.0.0.1:8765/public/index.html#/` | `#main.catalog-home`, Week Blocks W0–W14 | `list_console_messages` |
| **Week View** | `http://127.0.0.1:8765/public/index.html#/week/w1` | `.week-block`, Lectures & Exercises | `list_console_messages` |
| **Lecture View** | `http://127.0.0.1:8765/public/index.html#/lecture/basics` | `.item-hero`, `.note-item`, `#quizSection` | `list_console_messages` |
| **Slide Presentation** | `http://127.0.0.1:8765/public/index.html#/presentation/basics` | `.slide-card`, `.slide-pos`, tags | `list_console_messages` |
| **Exercise View** | `http://127.0.0.1:8765/public/index.html#/exercise/ex-1` | `.exercise-view`, `.task-card` | `list_console_messages` |
| **Progress View** | `http://127.0.0.1:8765/public/index.html#/progress` | `.progress-hero`, `.study-exercise-card` | `list_console_messages` |
| **Search View** | `http://127.0.0.1:8765/public/index.html#/search?q=hash` | `.card-grid`, matching cards | `list_console_messages` |

---

### Step 3: Console Error Identification & Screenshot Collection

Whenever `list_console_messages` returns an error (e.g. `ReferenceError`, `TypeError`):
1. **Extract Error Details**:
   - Stack trace line (e.g., `content.js:1301 Uncaught ReferenceError: formatInlineCode is not defined at detailedExerciseCard`).
   - Function call origin (e.g., `showProgress -> detailedExerciseCard`).
2. **Capture Inline Screenshot**:
   - Immediately call `take_screenshot` (`format: "png"`) to visually document the exact UI state during failure.
3. **Log Error in Report**:
   - Add error to the Subagent Error Log Table.

---

### Step 4: 6-Variant Theme Permutation Audit

For each major route, execute the following script via `evaluate_script` and take an inline screenshot:

1. **Dark Web + Dark Code**: Default state.
2. **Dark Web + Light Code**:
   ```js
   document.querySelector("pre")?.setAttribute("data-code-theme", "light");
   ```
3. **Light Web + Dark Code**:
   ```js
   document.documentElement.setAttribute("data-theme", "light");
   ```
4. **Light Web + Light Code**:
   ```js
   document.documentElement.setAttribute("data-theme", "light");
   document.querySelectorAll("pre").forEach(p => p.setAttribute("data-code-theme", "light"));
   ```
5. **Print View + Dark Code**:
   ```js
   window.print(); // or emulate @media print
   ```
6. **Print View + Light Code**:
   ```js
   document.documentElement.setAttribute("data-code-block-color", "light");
   ```

---

## 📊 Subagent QA Error Log Template

```markdown
### 🚨 Detected Runtime Errors

| # | Route / URL | Error Message | Source Location | Visual Screenshot | Status |
| :- | :--- | :--- | :--- | :--- | :--- |
| 1 | `#/progress` | `Uncaught ReferenceError: formatInlineCode is not defined` | `content.js:1301` | Attached inline PNG | ✅ RESOLVED |
```
