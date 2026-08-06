/** Command palette (Ctrl+K / Ctrl+Shift+P) */

import { state, filteredItems } from "./state.js";
import { clear } from "./ui.js";

let open = false;
let activeIndex = 0;
let results = [];
let onPick = null;

export function setPaletteHandler(fn) {
  onPick = fn;
}

export function openPalette(initial = "") {
  const overlay = document.getElementById("palette");
  const input = document.getElementById("paletteInput");
  if (!overlay || !input) return;
  open = true;
  overlay.classList.add("open");
  input.value = initial;
  activeIndex = 0;
  updateResults(initial);
  requestAnimationFrame(() => input.focus());
}

export function closePalette() {
  const overlay = document.getElementById("palette");
  if (!overlay) return;
  open = false;
  overlay.classList.remove("open");
}

export function isPaletteOpen() {
  return open;
}

export function initPalette() {
  const overlay = document.getElementById("palette");
  const input = document.getElementById("paletteInput");
  const list = document.getElementById("paletteList");
  if (!overlay || !input || !list) return;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePalette();
  });

  input.addEventListener("input", () => {
    activeIndex = 0;
    updateResults(input.value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, results.length - 1);
      paintActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      paintActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(activeIndex);
    }
  });
}

function updateResults(q) {
  const query = (q || "").trim().toLowerCase();
  results = [];

  // Commands
  const commands = [
    { kind: "cmd", title: "Go to Welcome", meta: "home", action: { kind: "home" } },
    { kind: "cmd", title: "Show Progress", meta: "progress", action: { kind: "progress" } },
    { kind: "cmd", title: "Studijní plán (4 Úrovně) 📋", meta: "checklist plan study level", action: { kind: "checklist" } },
    { kind: "cmd", title: "Clear Filters", meta: "filters", action: { kind: "cmd-clear-filters" } },
    { kind: "cmd", title: "Toggle Theme", meta: "theme", action: { kind: "cmd-theme" } },
    { kind: "cmd", title: "Print / Export PDF (Tisk)", meta: "print pdf", action: { kind: "cmd-print" } },
    { kind: "cmd", title: "Toggle Fullscreen (Celá obrazovka)", meta: "fullscreen presentation", action: { kind: "cmd-fullscreen" } },
  ];

  for (const c of commands) {
    if (!query || c.title.toLowerCase().includes(query) || c.meta.includes(query)) {
      results.push(c);
    }
  }

  // Weeks
  for (const w of state.course?.weeks || []) {
    const hay = `w${w.week} ${w.title} ${w.description}`.toLowerCase();
    if (!query || hay.includes(query)) {
      results.push({
        kind: "week",
        title: `Week ${w.week}: ${w.title}`,
        meta: `${(w.lectures || []).length + (w.exercises || []).length} items`,
        action: { kind: "week", id: w.id },
      });
    }
  }

  // Items — use a loose search (ignore active filters for palette, search all)
  for (const item of state.items) {
    const hay = [
      item.title, item.desc, item.compare, item.slug,
      ...(item.tags || []), item.diff, `w${item.weekNum}`,
    ].join(" ").toLowerCase();
    if (!query || hay.includes(query)) {
      results.push({
        kind: item.kind,
        title: item.title,
        meta: `W${item.weekNum} · rel:${item.relevance}/10 · ${(item.tags || []).join(",")}`,
        action: { kind: item.kind, id: item.id },
      });
    }
  }

  results = results.slice(0, 40);
  renderList();
}

function renderList() {
  const list = document.getElementById("paletteList");
  clear(list);
  if (!results.length) {
    const empty = document.createElement("div");
    empty.className = "palette-empty";
    empty.textContent = "No matches";
    list.appendChild(empty);
    return;
  }
  results.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "palette-item" + (i === activeIndex ? " active" : "");
    row.setAttribute("role", "option");
    row.innerHTML = `
      <span class="pi-kind">${escape(r.kind)}</span>
      <span class="pi-title">${escape(r.title)}</span>
      <span class="pi-meta">${escape(r.meta || "")}</span>
    `;
    row.addEventListener("mouseenter", () => {
      activeIndex = i;
      paintActive();
    });
    row.addEventListener("click", () => pick(i));
    list.appendChild(row);
  });
}

function paintActive() {
  const list = document.getElementById("paletteList");
  [...list.querySelectorAll(".palette-item")].forEach((el, i) => {
    el.classList.toggle("active", i === activeIndex);
    if (i === activeIndex) el.scrollIntoView({ block: "nearest" });
  });
}

function pick(i) {
  const r = results[i];
  if (!r) return;
  closePalette();
  if (onPick) onPick(r.action);
}

function escape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// keep import used for potential future filter-aware mode
void filteredItems;
