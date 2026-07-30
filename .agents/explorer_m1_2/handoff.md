# Explorer 2 Handoff Report — State Persistence & UI Integration Design (Milestone 1)

## 1. Observation

Direct observations from examining existing codebase files:

### A. State Persistence Architecture in `app/js/state.js`
- **Current `state` Object**: Defined on lines 6–47 of `app/js/state.js`. Main state properties include sets `state.seen` (auto-seen items) and `state.studied` (manually marked studied items), plus filter states, active view, and open tabs.
- **LocalStorage Keys**:
  - `pcs-seen-v1` (line 49): `const SEEN_KEY = "pcs-seen-v1";`
  - `pcs-studied-v1` (line 50): `const STUDIED_KEY = "pcs-studied-v1";`
  - `pcs-sidebar-w` (line 51): `const SIDEBAR_W_KEY = "pcs-sidebar-w";`
  - `pcs-theme`: Handled in `app/index.html` (lines 8–13) and `app/js/app.js` (lines 334–339) under key `'pcs-theme'`.
- **Persistence Pattern**:
  - `loadPersisted()` (lines 53–72) reads stringified JSON arrays from `localStorage` inside individual `try ... catch` blocks to gracefully handle missing or corrupted data:
    ```javascript
    try {
      const raw = localStorage.getItem(STUDIED_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) state.studied = new Set(arr);
      }
    } catch { /* ignore */ }
    ```
  - `persistStudied()` (lines 80–84) serializes sets into JSON arrays:
    ```javascript
    export function persistStudied() {
      try {
        localStorage.setItem(STUDIED_KEY, JSON.stringify([...state.studied]));
      } catch { /* ignore */ }
    }
    ```

### B. Navigation & View System in `app/js/app.js` and `app/js/router.js`
- **Views**: Currently supported activity views in `app/js/app.js` (lines 288–324) are `"explorer"`, `"search"`, `"progress"`.
- **Hash Router**: `app/js/router.js` handles client-side hash routing (`#/`, `#/week/:id`, `#/lecture/:id`, `#/exercise/:id`, `#/presentation/:id`, `#/page/:id/:pageId`, `#/search`, `#/progress`).
- **Tab Bar**: Managed by `ensureTab()`, `renderTabs()`, and `closeTab()` in `app/js/router.js` (lines 167–357). Welcome tab (`home`) is pinned at index 0.
- **Activity Bar & Shortcuts**:
  - `app/index.html` (lines 38–52) defines activity bar buttons with `data-view` attributes.
  - `app/js/app.js` (lines 173–236) handles global keyboard shortcuts (`Ctrl+P` command palette, `Ctrl+B` sidebar toggle, `Ctrl+Shift+E` explorer view, `Ctrl+Shift+F` search view).
  - `app/js/palette.js` (lines 77–84) registers global command palette actions.

---

## 2. Logic Chain

From these observations, we derive the design choices for `pcs-checklist-v1`:

1. **Storage Schema Consistency**:
   - Since `pcs-seen-v1` and `pcs-studied-v1` use JSON-serialized string arrays backed by JS `Set<string>` in memory, `pcs-checklist-v1` should follow the exact same pattern.
   - Storage key: `const CHECKLIST_KEY = "pcs-checklist-v1";`.
   - Memory state: `state.checklistChecked = new Set();`.
   - Stored payload: JSON array of checked item IDs, e.g., `["l1-vars", "l1-control", "l2-list-comprehension", "l3-dunder-init", "l4-numpy-broadcasting"]`.

2. **Persistence API Extension in `app/js/state.js`**:
   - Extend `loadPersisted()` to parse `pcs-checklist-v1`.
   - Export helper functions:
     - `persistChecklist()`: Writes `state.checklistChecked` to `localStorage`.
     - `isChecklistItemChecked(id)`: Returns boolean status.
     - `toggleChecklistItem(id)`: Mutates set, persists, and returns new state.
     - `resetChecklistState()`: Clears `state.checklistChecked` and removes `pcs-checklist-v1` from `localStorage`.

3. **Progress Calculation Logic**:
   - Calculate progress both **per level** ($L \in \{1, 2, 3, 4\}$) and **total percentage**.
   - Formula per level: $\text{Pct}_L = \text{Math.round}\left(\frac{N_{L, \text{checked}}}{N_{L, \text{total}}} \times 100\right)$.
   - Total formula: $\text{Pct}_{\text{total}} = \text{Math.round}\left(\frac{\sum N_{L, \text{checked}}}{\sum N_{L, \text{total}}} \times 100\right)$.
   - Export helper function `calculateChecklistProgress(checklistItems)` to compute percentages, total checked counts, and level breakdowns dynamically.

4. **Reset Functionality**:
   - UI trigger: "Obnovit plán 🔄" button in checklist header/toolbar.
   - Action: Displays confirmation dialog (`confirm(...)`). On approval, invokes `resetChecklistState()`, re-renders the checklist view, and triggers status bar update via `window.__pcsUpdateStatus?.()`.

5. **UI & Keyboard Integration**:
   - **Activity Bar**: Add button `data-view="checklist"` with task list SVG icon in `app/index.html`. Add shortcut hint `Ctrl+Shift+C`.
   - **Keyboard Shortcut**: Bind `Ctrl+Shift+C` (or `Cmd+Shift+C`) in `app/js/app.js` to trigger `setView("checklist")`.
   - **Command Palette**: Register command `{ kind: "cmd", title: "Studijní plán (4 Úrovně) 📋", meta: "checklist plan study level", action: { kind: "checklist" } }` in `app/js/palette.js`.
   - **Router & Tabs**: Add route `#/checklist` and tab kind `"checklist"` with tab title `"Studijní plán 📋"`.
   - **Sidebar Tree**: Integrate top-level special node `📋 Studijní plán (4 Úrovně)` at top of tree in `app/js/tree.js` with 4 collapsible level sub-nodes for rapid navigation.

---

## 3. Caveats

- **No Caveats**: Analysis covers all relevant application files (`state.js`, `app.js`, `content.js`, `router.js`, `tree.js`, `palette.js`, `index.html`) without ambiguity.

---

## 4. Conclusion

The state persistence schema for the Python Checklist can be seamlessly added to `app/js/state.js` using `pcs-checklist-v1` with zero breaking changes to existing `pcs-seen-v1` or `pcs-studied-v1` logic. The checklist integration fits standard SPA navigation patterns across Activity Bar, Router, Sidebar Tree, Command Palette, and Keyboard Shortcuts (`Ctrl+Shift+C`).

---

## 5. Verification Method

To verify the proposed implementation once created:

1. **LocalStorage Inspection**:
   - Open browser developer tools -> Application -> Local Storage.
   - Verify checking a box creates entry `"pcs-checklist-v1": "[\"l1-vars\"]"`.
   - Reload page and verify state restores correctly.
2. **Reset Test**:
   - Click "Obnovit plán 🔄", confirm reset, verify `"pcs-checklist-v1"` key is deleted from `localStorage` and UI checkboxes clear.
3. **Progress Bar Verification**:
   - Toggle checkboxes in Level 1 and verify Level 1 progress bar and Total progress bar update accurately.
4. **Navigation & Shortcut Verification**:
   - Press `Ctrl+Shift+C` or click Activity Bar icon -> verify routing to `#/checklist` and tab `"Studijní plán 📋"` opens.
   - Open Command Palette (`Ctrl+P`), type `Studijní`, press Enter -> verify navigation to checklist.
