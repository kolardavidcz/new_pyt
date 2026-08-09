/**
 * Python Course Shell — application bootstrap
 */
import {
  state, loadPersisted, buildIndexes, clearFilters, filtersActive,
  filteredItems, persistSidebarW, pagesFor, onStateChange,
  setUser, logoutUser, defaultUser, syncCloudProgress, clearLinkErrorLog, markLinkErrorFixed,
} from "./state.js";
import { renderTree, setTreeSelectHandler, expandAll, collapseAll } from "./tree.js";
import { navigate, refreshActiveView, closeTab, initHistory, getInitialRoute, initScrollTracker } from "./router.js";
import { openPalette, closePalette, isPaletteOpen, initPalette, setPaletteHandler } from "./palette.js";
import { toggleFullscreen, updatePageStudyButtons } from "./content.js";
import { escapeHtml } from "./ui.js";

async function loadJson(url) {
  const clean = url.replace(/^\//, "");
  const urlsToTry = [
    "/" + clean,
    "data/" + clean.replace(/^data\//, ""),
    "./data/" + clean.replace(/^data\//, ""),
    "../data/" + clean.replace(/^data\//, ""),
    "./" + clean,
  ];
  let lastErr = null;
  for (const u of urlsToTry) {
    try {
      const res = await fetch(u, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error(`Failed to load metadata: ${url}`);
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
  window.__pcsState = state;
  initHistory();
  initScrollTracker();

  // Tablet & Multi-device Auto-Sync (Focus, Tab Visibility & 30s Background Poll)
  window.addEventListener("focus", () => syncCloudProgress());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") syncCloudProgress();
  });
  setInterval(() => syncCloudProgress(), 30000);

  // Reactive Event Bus listener: auto-update UI components when state mutates
  onStateChange((_, changeType) => {
    if (changeType === "studied" || changeType === "cloudSync" || changeType === "seen" || changeType === "user") {
      updatePageStudyButtons();
      try { renderTree(); } catch {}
      updateStatus();
      updateUserUI();
      const tab = state.tabs.find((t) => t.id === state.activeTabId);
      if (tab && (tab.kind === "progress" || tab.kind === "week" || tab.kind === "search" || tab.kind === "home")) {
        refreshActiveView();
      }
    }
  });

  try {
    const [course, slides, pages, exercises, quizzes] = await Promise.all([
      loadJson("/data/course.json"),
      loadJson("/data/slides.json").catch(() => ({})),
      loadJson("/data/pages-index.json").catch(() => ({})),
      loadJson("/data/exercises.json").catch(() => ({})),
      loadJson("/data/quizzes.json").catch(() => ({})),
    ]);
    state.slides = slides || {};
    state.pagesIndex = pages || {};
    state.exercises = exercises || {};
    state.quizzes = quizzes || {};
    buildIndexes(course);
    renderTree();
    updateStatus();
    updateUserUI();
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
  if (action.kind === "cmd-close-tab") {
    if (state.activeTabId) closeTab(state.activeTabId);
    return;
  }
  if (action.kind === "cmd-link-error-log") {
    openErrorLogModal();
    return;
  }
  navigate(action);
  updateStatus();
}

function renderErrorLogList() {
  const container = document.getElementById("errorLogList");
  if (!container) return;
  const list = state.errorLinkLog || [];
  if (!list.length) {
    container.innerHTML = `<div style="padding:28px; text-align:center; color:var(--fg-muted);">✅ Žádné chybové odkazy nebyly zaznamenány. Databáze je čistá!</div>`;
    return;
  }
  container.innerHTML = list.map((e) => {
    const isFixed = e.status === "fixed";
    const tagBg = isFixed ? "var(--syntax-string, #89d185)" : "#f44747";
    const tagText = isFixed ? "FIXED" : "BAD LINK";
    return `
    <div style="border-bottom:1px solid var(--border); padding:12px 0; opacity:${isFixed ? "0.6" : "1.0"};">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="background:${tagBg}; color:#fff; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:3px; text-transform:uppercase; margin-right:6px;">${tagText}</span>
          <span style="color:var(--syntax-error, #f44747); font-weight:bold;">${escapeHtml(e.message)}</span>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span style="font-size:11px; color:var(--fg-subtle);">${e.count > 1 ? `(${e.count}x)` : ""} ${new Date(e.timestamp).toLocaleTimeString()}</span>
          ${!isFixed ? `<button type="button" class="btn btn-sm btn-mark-fixed" data-err-id="${e.id}" style="font-size:10px; padding:2px 8px;">Opraveno ✓</button>` : `<span style="font-size:11px; color:var(--syntax-string, #89d185);">Opraveno</span>`}
        </div>
      </div>
      <div style="color:var(--fg-muted); margin-top:6px;">Target: <code>${escapeHtml(e.targetId || e.href)}</code></div>
      <div style="color:var(--fg-subtle); font-size:11px; margin-top:2px;">Source: <code>${escapeHtml(e.source)}</code></div>
    </div>
  `;
  }).join("");

  container.querySelectorAll(".btn-mark-fixed").forEach((btn) => {
    btn.addEventListener("click", () => {
      const errId = btn.dataset.errId;
      if (errId) {
        markLinkErrorFixed(errId);
        renderErrorLogList();
      }
    });
  });
}

function openErrorLogModal() {
  renderErrorLogList();
  document.getElementById("errorLogModal")?.classList.remove("hidden");
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

function updateUserUI() {
  const u = state.user;
  const userLabel = document.getElementById("userLabel");
  if (userLabel) userLabel.textContent = u ? u.username : "Přihlásit se";

  const pName = document.getElementById("profileName");
  const pUsername = document.getElementById("profileUsername");
  const pFaculty = document.getElementById("profileFaculty");
  const pId = document.getElementById("profileId");
  const pAvatar = document.getElementById("profileAvatar");

  if (u) {
    if (pName) pName.textContent = u.name || u.username;
    if (pUsername) pUsername.textContent = u.username;
    if (pFaculty) pFaculty.textContent = u.faculty || "VSČHT Praha";
    if (pId) pId.textContent = `ID: ${u.studentId || "987654"}`;
    if (pAvatar) {
      const initials = (u.name || u.username)
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      pAvatar.textContent = initials || "VS";
    }
  }

  // Update profile modal stats
  const total = state.items.length || 92;
  const studiedN = state.studied?.size || 0;
  const pct = total > 0 ? Math.round((studiedN / total) * 100) : 0;

  const pstatStudied = document.getElementById("pstatStudied");
  const pstatPct = document.getElementById("pstatPct");
  const pstatTotal = document.getElementById("pstatTotal");

  if (pstatStudied) pstatStudied.textContent = studiedN;
  if (pstatPct) pstatPct.textContent = `${pct}%`;
  if (pstatTotal) pstatTotal.textContent = total;
}

function bindChrome() {
  // Theme & Profile
  document.getElementById("btnTheme")?.addEventListener("click", toggleTheme);
  document.getElementById("btnPrint")?.addEventListener("click", triggerPrint);
  document.getElementById("btnPalette")?.addEventListener("click", () => openPalette());

  // Profile Modal
  const profileModal = document.getElementById("profileModal");
  const btnProfile = document.getElementById("btnProfile");
  const btnCloseProfile = document.getElementById("btnCloseProfile");
  const btnSwitchProfile = document.getElementById("btnSwitchProfile");
  const btnLogoutProfile = document.getElementById("btnLogoutProfile");
  const profileUserView = document.getElementById("profileUserView");
  const profileLoginForm = document.getElementById("profileLoginForm");
  const btnCancelLogin = document.getElementById("btnCancelLogin");

  // Error Log Modal
  const errorLogModal = document.getElementById("errorLogModal");
  document.getElementById("btnCloseErrorLog")?.addEventListener("click", () => errorLogModal?.classList.add("hidden"));
  document.getElementById("btnClearErrorLog")?.addEventListener("click", () => {
    clearLinkErrorLog();
    renderErrorLogList();
  });
  document.getElementById("btnExportErrorLog")?.addEventListener("click", () => {
    const jsonStr = JSON.stringify(state.errorLinkLog || [], null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `link-error-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  btnProfile?.addEventListener("click", () => {
    navigate({ kind: "login" });
  });

  btnCloseProfile?.addEventListener("click", () => profileModal?.classList.add("hidden"));
  btnCancelLogin?.addEventListener("click", () => {
    if (state.user) {
      profileLoginForm?.classList.add("hidden");
      profileUserView?.classList.remove("hidden");
    } else {
      profileModal?.classList.add("hidden");
    }
  });

  btnSwitchProfile?.addEventListener("click", () => {
    profileUserView?.classList.add("hidden");
    profileLoginForm?.classList.remove("hidden");
    const inputU = document.getElementById("inputUsername");
    if (inputU) inputU.focus();
  });

  btnLogoutProfile?.addEventListener("click", () => {
    logoutUser();
    updateUserUI();
    profileUserView?.classList.add("hidden");
    profileLoginForm?.classList.remove("hidden");
  });

  profileLoginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("inputUsername")?.value.trim();
    const fullName = document.getElementById("inputFullName")?.value.trim();
    const faculty = document.getElementById("inputFaculty")?.value;

    if (!username) return;

    const newUser = {
      username: username.toLowerCase(),
      name: fullName || username,
      studentId: String(Math.floor(100000 + Math.random() * 900000)),
      faculty: faculty || "VSČHT Praha",
    };

    setUser(newUser);
    updateUserUI();
    profileLoginForm?.classList.add("hidden");
    profileUserView?.classList.remove("hidden");
    profileModal?.classList.add("hidden");
  });

  // Activity bar
  document.querySelectorAll(".activity-btn[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      if (view === "progress") {
        navigate({ kind: "progress" });
      } else if (view === "explorer") {
        toggleSidebar();
      }
    });
  });

  document.getElementById("btnSidebarToggle")?.addEventListener("click", toggleSidebar);
  document.getElementById("btnCloseSidebar")?.addEventListener("click", () => {
    if (state.sidebarOpen) toggleSidebar();
  });
  document.getElementById("btnExpandAll")?.addEventListener("click", expandAll);
  document.getElementById("btnCollapseAll")?.addEventListener("click", () => {
    collapseAll();
    if (state.sidebarOpen) toggleSidebar();
  });

  // Filters
  const text = document.getElementById("filterText");
  let filterTimer = null;
  text?.addEventListener("input", () => {
    state.filters.text = text.value;
    clearTimeout(filterTimer);
    filterTimer = setTimeout(() => onFiltersChanged(), 120);
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
    if (meta && e.shiftKey && e.key.toLowerCase() === "p") {
      e.preventDefault();
      if (isPaletteOpen()) closePalette();
      else openPalette();
      return;
    }
    if (meta && e.key.toLowerCase() === "p") {
      e.preventDefault();
      triggerPrint();
      return;
    }
    if (meta && e.key.toLowerCase() === "k") {
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
    // Close tab Ctrl+Q or Ctrl+W
    if (meta && (e.key.toLowerCase() === "q" || e.key.toLowerCase() === "w")) {
      e.preventDefault();
      if (state.activeTabId) closeTab(state.activeTabId);
    }

    // Slide navigation & Fullscreen shortcut (ArrowLeft / ArrowRight, PageUp / PageDown, Space, F)
    const isInput = !!e.target.closest("input, textarea, select, button, [contenteditable], .quiz-section-card");
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
    b.classList.toggle("active", b.dataset.view === "explorer");
  });
  const title = document.getElementById("sidebarTitle");
  const treeRoot = document.getElementById("treeRoot");
  const filterStrip = document.getElementById("filterStrip");

  if (title) title.textContent = "Explorer";
  treeRoot?.classList.remove("hidden");
  filterStrip?.classList.remove("hidden");
  if (view === "explorer" && !state.sidebarOpen) {
    toggleSidebar();
  }
}
window.__pcsSetView = setView;

function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  try { localStorage.setItem("pcs-sidebar-open", JSON.stringify(state.sidebarOpen)); } catch { /* */ }
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
  if (state.sidebarOpen) {
    wb.style.gridTemplateColumns =
      `var(--activitybar-w) ${state.sidebarWidth}px 4px 1fr`;
  } else {
    wb.style.gridTemplateColumns = `var(--activitybar-w) 0px 0px 1fr`;
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

function triggerPrint() {
  const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
  if (window.printTier && (!activeTab || activeTab.kind === "progress" || activeTab.kind === "home")) {
    window.printTier(4);
  } else {
    window.print();
  }
}

boot();
