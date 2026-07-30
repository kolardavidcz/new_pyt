/**
 * Python Course Shell — application bootstrap
 */
import {
  state, loadPersisted, buildIndexes, clearFilters, filtersActive,
  filteredItems, persistSidebarW, pagesFor,
} from "./state.js";
import { renderTree, setTreeSelectHandler, expandAll, collapseAll } from "./tree.js";
import { navigate, refreshActiveView, closeTab, initHistory, getInitialRoute } from "./router.js";
import { openPalette, closePalette, isPaletteOpen, initPalette, setPaletteHandler } from "./palette.js";
import { toggleFullscreen } from "./content.js";

async function loadJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

async function boot() {
  loadPersisted();
  applySidebarWidth();
  bindChrome();
  initPalette();
  setPaletteHandler(handleNavigate);
  setTreeSelectHandler(handleNavigate);
  window.__pcsNavigate = handleNavigate;
  window.__pcsUpdateStatus = updateStatus;
  initHistory();

  try {
    const [course, slides, pages, exercises] = await Promise.all([
      loadJson("/data/course.json"),
      loadJson("/data/slides.json").catch(() => ({})),
      loadJson("/data/pages-index.json").catch(() => ({})),
      loadJson("/data/exercises.json").catch(() => ({})),
    ]);
    state.slides = slides || {};
    state.pagesIndex = pages || {};
    state.exercises = exercises || {};
    buildIndexes(course);
    renderTree();
    updateStatus();
    // Restore deep link or land on welcome
    const initial = getInitialRoute();
    navigate(initial, { replace: true });
  } catch (err) {
    const main = document.getElementById("main");
    main.className = "state-panel";
    main.innerHTML = `
      <h2>Could not load course data</h2>
      <p>${escape(err.message)}</p>
      <p class="hint">Run: python tools/import_course_data.py<br/>then: python serve.py</p>
    `;
  }
}

function handleNavigate(action) {
  if (!action) return;
  if (action.kind === "cmd-clear-filters") {
    clearFilters();
    syncFilterUI();
    renderTree();
    refreshActiveView();
    updateStatus();
    return;
  }
  if (action.kind === "cmd-theme") {
    toggleTheme();
    return;
  }
  if (action.kind === "cmd-print") {
    window.print();
    return;
  }
  if (action.kind === "cmd-fullscreen") {
    toggleFullscreen();
    return;
  }
  navigate(action);
  updateStatus();
}

function stepSlide(dir) {
  const tab = state.tabs.find((t) => t.id === state.activeTabId);
  if (!tab || !tab.itemId) return;
  const item = state.itemsById.get(tab.itemId);
  if (!item) return;
  const pages = pagesFor(item.path);
  if (!pages.length) return;

  if (tab.kind === "presentation") {
    if (dir > 0) {
      navigate({ kind: "page", id: item.id, pageId: pages[0].id });
    }
    return;
  }

  if (tab.kind === "page") {
    const idx = pages.findIndex((p) => p.id === tab.pageId);
    const nextIdx = idx + dir;
    if (nextIdx >= 0 && nextIdx < pages.length) {
      navigate({ kind: "page", id: item.id, pageId: pages[nextIdx].id });
    }
  }
}

function bindChrome() {
  // Theme
  document.getElementById("btnTheme")?.addEventListener("click", toggleTheme);
  document.getElementById("btnPalette")?.addEventListener("click", () => openPalette());

  // Activity bar
  document.querySelectorAll(".activity-btn[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      setView(view);
    });
  });

  document.getElementById("btnSidebarToggle")?.addEventListener("click", toggleSidebar);
  document.getElementById("btnExpandAll")?.addEventListener("click", expandAll);
  document.getElementById("btnCollapseAll")?.addEventListener("click", collapseAll);

  // Filters
  const text = document.getElementById("filterText");
  text?.addEventListener("input", () => {
    state.filters.text = text.value;
    onFiltersChanged();
  });

  document.querySelectorAll("#tagChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const tag = chip.dataset.tag;
      if (state.filters.tags.has(tag)) state.filters.tags.delete(tag);
      else state.filters.tags.add(tag);
      chip.classList.toggle("active", state.filters.tags.has(tag));
      onFiltersChanged();
    });
  });

  document.querySelectorAll("#flavorChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const fl = chip.dataset.flavor;
      if (state.filters.flavors.has(fl)) state.filters.flavors.delete(fl);
      else state.filters.flavors.add(fl);
      chip.classList.toggle("active", state.filters.flavors.has(fl));
      onFiltersChanged();
    });
  });

  const rel = document.getElementById("relMin");
  const relVal = document.getElementById("relVal");
  rel?.addEventListener("input", () => {
    state.filters.relMin = parseInt(rel.value, 10) || 1;
    if (relVal) relVal.textContent = `≥ ${state.filters.relMin}`;
    onFiltersChanged();
  });

  document.getElementById("sortBy")?.addEventListener("change", (e) => {
    state.filters.sort = e.target.value;
    onFiltersChanged();
  });

  document.getElementById("sbClearFilters")?.addEventListener("click", () => {
    clearFilters();
    syncFilterUI();
    onFiltersChanged();
  });

  // Sash resize
  initSash();

  // Keyboard
  document.addEventListener("keydown", (e) => {
    const meta = e.ctrlKey || e.metaKey;
    if (meta && e.key.toLowerCase() === "p") {
      e.preventDefault();
      if (isPaletteOpen()) closePalette();
      else openPalette();
      return;
    }
    if (meta && e.key.toLowerCase() === "b") {
      e.preventDefault();
      toggleSidebar();
      return;
    }
    if (meta && e.shiftKey && e.key.toLowerCase() === "e") {
      e.preventDefault();
      setView("explorer");
      return;
    }
    if (meta && e.shiftKey && e.key.toLowerCase() === "f") {
      e.preventDefault();
      setView("search");
      document.getElementById("filterText")?.focus();
      return;
    }
    if (meta && e.shiftKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      setView("checklist");
      return;
    }
    if (e.key === "Escape") {
      if (isPaletteOpen()) {
        e.preventDefault();
        closePalette();
      }
    }
    // Close tab Ctrl+W
    if (meta && e.key.toLowerCase() === "w") {
      e.preventDefault();
      if (state.activeTabId) closeTab(state.activeTabId);
    }

    // Slide navigation & Fullscreen shortcut (ArrowLeft / ArrowRight, PageUp / PageDown, Space, F)
    const isInput = !!e.target.closest("input, textarea, select, [contenteditable]");
    if (!isInput && !isPaletteOpen() && !meta) {
      const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
      const isPresentation = activeTab && (activeTab.kind === "page" || activeTab.kind === "presentation");
      const isFS = document.documentElement.classList.contains("presentation-fullscreen-mode");

      if (isPresentation || isFS) {
        if (e.key === "ArrowRight" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
          e.preventDefault();
          stepSlide(1);
          return;
        }
        if (e.key === "ArrowLeft" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
          e.preventDefault();
          stepSlide(-1);
          return;
        }
        if (e.key.toLowerCase() === "f") {
          e.preventDefault();
          toggleFullscreen();
          return;
        }
      }
    }
  });
}

function onFiltersChanged() {
  renderTree();
  // If on week/search view, refresh cards
  const tab = state.tabs.find((t) => t.id === state.activeTabId);
  if (tab && (tab.kind === "week" || tab.kind === "search" || tab.kind === "home")) {
    refreshActiveView();
  }
  updateStatus();
}

function syncFilterUI() {
  const text = document.getElementById("filterText");
  if (text) text.value = state.filters.text;
  document.querySelectorAll("#tagChips .chip").forEach((chip) => {
    chip.classList.toggle("active", state.filters.tags.has(chip.dataset.tag));
  });
  document.querySelectorAll("#flavorChips .chip").forEach((chip) => {
    chip.classList.toggle("active", state.filters.flavors.has(chip.dataset.flavor));
  });
  const rel = document.getElementById("relMin");
  const relVal = document.getElementById("relVal");
  if (rel) rel.value = String(state.filters.relMin);
  if (relVal) relVal.textContent = `≥ ${state.filters.relMin}`;
  const sort = document.getElementById("sortBy");
  if (sort) sort.value = state.filters.sort;
}

function updateStatus() {
  const counts = document.getElementById("sbCounts");
  const filter = document.getElementById("sbFilter");
  const total = state.items.length;
  const visible = filteredItems().length;
  if (counts) {
    counts.textContent = `${visible} / ${total} items · ${state.studied?.size || 0} studied`;
  }
  if (filter) {
    if (!filtersActive()) {
      filter.textContent = "no filters";
    } else {
      const parts = [];
      if (state.filters.text) parts.push(`“${state.filters.text}”`);
      if (state.filters.tags.size) parts.push([...state.filters.tags].join("+"));
      if (state.filters.flavors.size) parts.push([...state.filters.flavors].join("+"));
      if (state.filters.relMin > 1) parts.push(`rel≥${state.filters.relMin}`);
      if (state.filters.sort !== "course") parts.push(state.filters.sort);
      filter.textContent = parts.join(" · ");
    }
  }
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".activity-btn[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === view);
  });
  const title = document.getElementById("sidebarTitle");
  const treeRoot = document.getElementById("treeRoot");
  const filterStrip = document.getElementById("filterStrip");

  if (view === "explorer") {
    if (title) title.textContent = "Explorer";
    treeRoot?.classList.remove("hidden");
    filterStrip?.classList.remove("hidden");
  } else if (view === "checklist") {
    if (title) title.textContent = "Studijní plán";
    navigate({ kind: "checklist" });
  }

  // Ensure sidebar open when switching views
  if (!state.sidebarOpen) {
    state.sidebarOpen = true;
    document.getElementById("workbench")?.classList.remove("sidebar-collapsed");
    applySidebarWidth();
  }
}

function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  const wb = document.getElementById("workbench");
  wb?.classList.toggle("sidebar-collapsed", !state.sidebarOpen);
  // Inline grid from resize must not fight the collapsed class
  applySidebarWidth();
}

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", next);
  try { localStorage.setItem("pcs-theme", next); } catch { /* */ }
}

function applySidebarWidth() {
  document.documentElement.style.setProperty("--sidebar-w", state.sidebarWidth + "px");
  const wb = document.getElementById("workbench");
  if (!wb) return;
  // Only set inline columns when sidebar is open; when collapsed, let CSS rule win
  if (state.sidebarOpen) {
    wb.style.gridTemplateColumns =
      `var(--activitybar-w) ${state.sidebarWidth}px 4px 1fr`;
  } else {
    wb.style.gridTemplateColumns = "";
  }
}

function initSash() {
  const sash = document.getElementById("sash");
  if (!sash) return;
  let dragging = false;

  sash.addEventListener("mousedown", (e) => {
    e.preventDefault();
    dragging = true;
    sash.classList.add("dragging");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    // activity bar 48px
    const w = Math.min(520, Math.max(180, e.clientX - 48));
    state.sidebarWidth = w;
    applySidebarWidth();
  });

  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    sash.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    persistSidebarW();
  });
}

function escape(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

boot();
