/**
 * 4-Level Python Study Plan & C/Java -> Python Footguns Cheatsheet View (#/checklist)
 */

import { CHECKLIST_ITEMS, FOOTGUN_ITEMS } from "./checklist-data.js";
import { state, toggleChecklist, isChecklistChecked, calculateChecklistProgress } from "./state.js";
import { clear, el, escapeHtml } from "./ui.js";
import { highlightCode } from "./highlight.js";
import { formatInlineCode } from "./format.js";
import { enhanceCodeBlocks } from "./content.js";

let activeTab = "all"; // "all" | "1" | "2" | "3" | "4" | "footguns"

export function showChecklist() {
  const main = document.getElementById("main");
  if (!main) return;
  main.className = "catalog checklist-view";
  clear(main);

  const prog = calculateChecklistProgress(CHECKLIST_ITEMS);

  // Header
  const header = el("div", { className: "catalog-header" });
  header.innerHTML = `
    <h1>📋 Studijní plán Pythonu (4 Úrovně)</h1>
    <p class="desc">Strukturovaný checklist klíčových kompetencí od základů po vědecké výpočty (NumPy, Pillow, simulace) + přehled nejčastějších pastí při přechodu z C/C++ a Javy.</p>
    <div class="checklist-overall-bar">
      <div class="checklist-overall-meta">
        <span>Celkový pokrok: <strong>${prog.checked} / ${prog.total}</strong> kompetencí</span>
        <strong>${prog.pct} %</strong>
      </div>
      <div class="progress-bar-track">
        <span class="progress-bar-fill core" style="width:${prog.pct}%"></span>
      </div>
    </div>
  `;
  main.appendChild(header);

  // Level Filter Tabs
  const tabsBar = el("div", { className: "checklist-tabs", role: "tablist" });
  const tabDefs = [
    { id: "all", label: `Vše (${prog.checked}/${prog.total})` },
    { id: "1", label: `Úroveň 1: Základy (${prog.byLevel[1].checked}/${prog.byLevel[1].total})` },
    { id: "2", label: `Úroveň 2: Struktury (${prog.byLevel[2].checked}/${prog.byLevel[2].total})` },
    { id: "3", label: `Úroveň 3: OOP & Protokoly (${prog.byLevel[3].checked}/${prog.byLevel[3].total})` },
    { id: "4", label: `Úroveň 4: Knihovny (${prog.byLevel[4].checked}/${prog.byLevel[4].total})` },
    { id: "footguns", label: `⚠ Top ${FOOTGUN_ITEMS.length} pastí C/Java → Python` },
  ];

  for (const t of tabDefs) {
    tabsBar.appendChild(el("button", {
      type: "button",
      role: "tab",
      "aria-selected": String(activeTab === t.id),
      className: `btn sm checklist-tab-btn${activeTab === t.id ? " primary active" : ""}`,
      onClick: () => {
        activeTab = t.id;
        showChecklist();
      },
    }, t.label));
  }
  main.appendChild(tabsBar);

  if (activeTab === "footguns") {
    const fgWrap = el("div", { className: "footgun-list" });
    for (const fg of FOOTGUN_ITEMS) {
      const card = el("article", { className: `footgun-card severity-${String(fg.severity || "medium").toLowerCase()}` });
      card.innerHTML = `
        <div class="footgun-head">
          <h3>${escapeHtml(fg.name)}</h3>
          <span class="footgun-severity ${String(fg.severity || "medium").toLowerCase()}">${escapeHtml(fg.severity || "MEDIUM")}</span>
        </div>
        <p class="footgun-exp">${formatInlineCode(fg.explanation)}</p>
        <div class="footgun-compare-grid">
          <div class="footgun-col bad">
            <div class="footgun-col-label">✕ C / Java návyk (Past)</div>
            <pre class="code-block lang-python"><code>${highlightCode(fg.cppExpectation, "python")}</code></pre>
          </div>
          <div class="footgun-col good">
            <div class="footgun-col-label">✓ Pythonic řešení</div>
            <pre class="code-block lang-python"><code>${highlightCode(fg.pythonSolution, "python")}</code></pre>
          </div>
        </div>
      `;
      fgWrap.appendChild(card);
    }
    main.appendChild(fgWrap);
    enhanceCodeBlocks(fgWrap);
    return;
  }

  const visibleItems = activeTab === "all"
    ? CHECKLIST_ITEMS
    : CHECKLIST_ITEMS.filter((it) => String(it.level) === activeTab);

  // Group by level
  const grouped = new Map();
  for (const item of visibleItems) {
    if (!grouped.has(item.level)) grouped.set(item.level, { title: item.levelTitle, items: [] });
    grouped.get(item.level).items.push(item);
  }

  for (const [lvl, group] of grouped.entries()) {
    const lvlProg = prog.byLevel[lvl] || { checked: 0, total: group.items.length, pct: 0 };
    const sec = el("section", { className: "checklist-level-section" });
    sec.innerHTML = `
      <div class="checklist-level-head">
        <h2>${escapeHtml(group.title)}</h2>
        <span class="checklist-level-pct">${lvlProg.checked}/${lvlProg.total} (${lvlProg.pct} %)</span>
      </div>
    `;

    const grid = el("div", { className: "checklist-cards-grid" });
    for (const item of group.items) {
      const checked = isChecklistChecked(item.id);
      const card = el("article", { className: `checklist-card${checked ? " is-checked" : ""}` });

      const head = el("div", { className: "checklist-card-head" });
      const checkBtn = el("button", {
        type: "button",
        className: `checklist-toggle-btn${checked ? " checked" : ""}`,
        title: checked ? "Označeno jako zvládnuto (kliknutím zrušíte)" : "Označit jako zvládnuto",
        "aria-pressed": String(checked),
        onClick: () => {
          toggleChecklist(item.id);
        },
      }, checked ? "✓" : "");

      const titleBlock = el("div", { className: "checklist-card-title-block" });
      titleBlock.innerHTML = `
        <div class="checklist-card-meta">
          <span class="checklist-cat">${escapeHtml(item.category)}</span>
          <span class="checklist-diff">${escapeHtml(item.difficulty)}</span>
        </div>
        <h3 class="checklist-card-title">${formatInlineCode(item.title)}</h3>
      `;
      head.append(checkBtn, titleBlock);
      card.appendChild(head);

      if (item.codeSnippet) {
        const pre = el("pre", { className: "code-block lang-python" });
        pre.innerHTML = `<code>${highlightCode(item.codeSnippet, "python")}</code>`;
        card.appendChild(pre);
      }

      if (item.footguns?.length) {
        const fgBox = el("div", { className: "checklist-footguns" });
        fgBox.innerHTML = `
          <div class="checklist-sub-label">⚠ Pozor na pasti</div>
          <ul>${item.footguns.map((f) => `<li>${formatInlineCode(f)}</li>`).join("")}</ul>
        `;
        card.appendChild(fgBox);
      }

      if (item.selfTestQuestions?.length) {
        const det = el("details", { className: "checklist-selftest" });
        det.innerHTML = `
          <summary>🧠 Kontrolní otázky k sebehodnocení (${item.selfTestQuestions.length})</summary>
          <ul>${item.selfTestQuestions.map((q) => `<li>${formatInlineCode(q)}</li>`).join("")}</ul>
        `;
        card.appendChild(det);
      }

      grid.appendChild(card);
    }

    sec.appendChild(grid);
    main.appendChild(sec);
  }

  enhanceCodeBlocks(main);
}

// Keep state reference for future filter extensions
void state;
