/** Tab bar + navigation router + browser History API */

import { state } from "./state.js";
import { clear, svgClose } from "./ui.js";
import {
  showHome, showWeek, showFullContent, showPresentation, showPage,
  showSearchResults, showProgress, showLogin,
} from "./content.js";
import { revealItem, renderTree } from "./tree.js";

/** When true, navigate() does not push a new history entry (used for popstate). */
let suppressHistory = false;

/**
 * Navigate to a course view.
 * @param {object} target
 * @param {{ replace?: boolean, skipHistory?: boolean }} [opts]
 */
export function navigate(target, opts = {}) {
  saveCurrentTabScroll();
  const tab = ensureTab(target);
  activateTab(tab.id);
  renderTabs();
  renderBreadcrumb(tab);
  renderView(tab);
  restoreTabScroll(tab);
  updateChrome(tab);

  if (tab.itemId) {
    revealItem(tab.itemId, tab.pageId);
  } else if (tab.weekId) {
    state.focusedTreeKey = tab.weekId;
    state.expanded.set(tab.weekId, true);
    renderTree();
  }

  if (!opts.skipHistory && !suppressHistory) {
    pushHistory(targetToRoute(target), opts.replace);
  }
}

/* ── Tab Scroll Position Memory & Sync ──────────────────── */

export function saveCurrentTabScroll() {
  const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
  const editorBody = document.querySelector(".editor-body");
  if (!activeTab || !editorBody) return;

  if (!state.itemScrollRatios) state.itemScrollRatios = {};

  activeTab.scrollTop = editorBody.scrollTop;
  if (activeTab.itemId && activeTab.kind === "content") {
    const maxScroll = editorBody.scrollHeight - editorBody.clientHeight;
    if (maxScroll > 0) {
      state.itemScrollRatios[activeTab.itemId] = editorBody.scrollTop / maxScroll;
    }
  }
}

export function restoreTabScroll(tab) {
  if (!tab) return;

  if (!state.itemScrollRatios) state.itemScrollRatios = {};

  const performRestore = () => {
    const editorBody = document.querySelector(".editor-body");
    if (!editorBody) return;

    let targetY = tab.scrollTop;

    // Only apply ratio fallback for full continuous lecture documents, NOT for single slide pages
    if (targetY == null && tab.kind === "content" && tab.itemId && state.itemScrollRatios[tab.itemId] != null) {
      const ratio = state.itemScrollRatios[tab.itemId];
      const maxScroll = editorBody.scrollHeight - editorBody.clientHeight;
      if (maxScroll > 0) {
        targetY = Math.round(ratio * maxScroll);
      }
    }

    if (targetY != null && targetY > 0) {
      editorBody.scrollTop = targetY;
    } else if (tab.scrollTop === 0) {
      editorBody.scrollTop = 0;
    }
  };

  requestAnimationFrame(performRestore);
  setTimeout(performRestore, 50);
  setTimeout(performRestore, 200);
  setTimeout(performRestore, 500);
}

let scrollTrackerBound = false;
export function initScrollTracker() {
  const editorBody = document.querySelector(".editor-body");
  if (!editorBody || scrollTrackerBound) return;

  let isTicking = false;
  editorBody.addEventListener(
    "scroll",
    () => {
      if (!isTicking) {
        requestAnimationFrame(() => {
          if (!state.itemScrollRatios) state.itemScrollRatios = {};
          const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
          if (activeTab) {
            activeTab.scrollTop = editorBody.scrollTop;
            if (activeTab.itemId && activeTab.kind === "content") {
              const maxScroll = editorBody.scrollHeight - editorBody.clientHeight;
              if (maxScroll > 0) {
                state.itemScrollRatios[activeTab.itemId] = editorBody.scrollTop / maxScroll;
              }
            }
          }
          isTicking = false;
        });
        isTicking = true;
      }
    },
    { passive: true }
  );

  scrollTrackerBound = true;
}

/* ── History API (browser Back / Forward) ──────────────── */

export function initHistory() {
  // Seed current URL if empty
  if (!location.hash || location.hash === "#" || location.hash === "#/") {
    replaceHistory({ kind: "home" });
  }

  window.addEventListener("popstate", (e) => {
    const route = e.state?.route || parseHash(location.hash);
    suppressHistory = true;
    try {
      applyRoute(route);
    } finally {
      suppressHistory = false;
    }
  });

  // Initial load from hash (deep link)
  const initial = parseHash(location.hash);
  if (initial && initial.kind !== "home") {
    // course data may not be ready — caller invokes navigate after boot
    return initial;
  }
  return { kind: "home" };
}

export function getInitialRoute() {
  return parseHash(location.hash) || { kind: "home" };
}

function targetToRoute(target) {
  // Normalize to a serializable route object
  const kind = target.kind;
  if (kind === "home") return { kind: "home" };
  if (kind === "week") return { kind: "week", id: target.id };
  if (kind === "lecture" || kind === "exercise" || kind === "content") {
    return { kind: kind === "content" ? "lecture" : kind, id: target.id };
  }
  if (kind === "presentation") return { kind: "presentation", id: target.id };
  if (kind === "page") return { kind: "page", id: target.id, pageId: target.pageId };
  if (kind === "search") return { kind: "search" };
  if (kind === "progress") return { kind: "progress" };
  if (kind === "login") return { kind: "login" };
  return { kind: "home" };
}

function routeToHash(route) {
  if (!route || route.kind === "home") return "#/";
  if (route.kind === "week") return `#/week/${enc(route.id)}`;
  if (route.kind === "lecture" || route.kind === "exercise") {
    return `#/${route.kind}/${enc(route.id)}`;
  }
  if (route.kind === "presentation") return `#/presentation/${enc(route.id)}`;
  if (route.kind === "page") return `#/page/${enc(route.id)}/${enc(route.pageId)}`;
  if (route.kind === "search") return "#/search";
  if (route.kind === "progress") return "#/progress";
  if (route.kind === "login") return "#/login";
  return "#/";
}

function parseHash(hash) {
  const rawHash = (hash || "").replace(/^#/, "") || "/";
  const [pathPart, queryPart] = rawHash.split("?");
  const queryParams = new URLSearchParams(queryPart || "");
  const slideVal = queryParams.get("slide") || queryParams.get("slajd") || null;

  const parts = pathPart.split("/").filter(Boolean);
  if (!parts.length) return { kind: "home" };
  const [a, b, c] = parts;

  if (a === "week" && b) return { kind: "week", id: dec(b) };
  if ((a === "lecture" || a === "exercise" || a === "content" || a === "item") && b) {
    const itemId = dec(parts.slice(1).join("/"));
    if (slideVal) {
      const formattedSlide = (!slideVal.startsWith("id") && /^\d+$/.test(slideVal)) ? `id${slideVal}` : slideVal;
      return { kind: "page", id: itemId, pageId: formattedSlide };
    }
    return { kind: a === "content" || a === "item" ? "lecture" : a, id: itemId };
  }
  if (a === "presentation" && b) return { kind: "presentation", id: dec(parts.slice(1).join("/")) };
  if (a === "page" && b && c) return { kind: "page", id: dec(b), pageId: dec(c) };
  if (a === "search") return { kind: "search" };
  if (a === "progress") return { kind: "progress" };
  if (a === "login") return { kind: "login" };
  return { kind: "home" };
}

function enc(s) {
  return encodeURIComponent(s);
}
function dec(s) {
  try { return decodeURIComponent(s); } catch { return s; }
}

function pushHistory(route, replace = false) {
  const hash = routeToHash(route);
  const url = hash;
  const data = { route };
  if (replace) {
    history.replaceState(data, "", url);
  } else {
    // Avoid duplicate consecutive entries
    const cur = history.state?.route;
    if (cur && routeKey(cur) === routeKey(route)) {
      history.replaceState(data, "", url);
      return;
    }
    history.pushState(data, "", url);
  }
}

function replaceHistory(route) {
  history.replaceState({ route }, "", routeToHash(route));
}

function routeKey(r) {
  if (!r) return "";
  return [r.kind, r.id || "", r.pageId || ""].join("|");
}

function applyRoute(route) {
  if (!route) {
    navigate({ kind: "home" }, { skipHistory: true });
    return;
  }
  if (route.kind === "week") {
    let weekId = route.id;
    if (!state.weeksById.has(weekId)) {
      const normalized = "week-" + String(weekId).replace(/^w/, "");
      if (state.weeksById.has(normalized)) {
        weekId = normalized;
      }
    }
    if (weekId !== route.id) {
      navigate({ kind: "week", id: weekId }, { skipHistory: true });
      return;
    }
  }
  // Resolve content kind: prefer item existence, fallback to dynamic item registration for disk files
  if (route.kind === "lecture" || route.kind === "exercise" || route.kind === "presentation") {
    let item = state.itemsById.get(route.id);
    if (!item && route.id) {
      const allItems = Array.from(state.itemsById.values());
      const matched = allItems.find(i => 
        i.slug === route.id ||
        i.id.endsWith("/" + route.id + ".html") ||
        i.id.endsWith("/" + route.id) ||
        i.path.endsWith("/" + route.id + ".html") ||
        i.path.endsWith("/" + route.id)
      ) || (route.id.startsWith("ex-") ? allItems.filter(i => i.kind === "exercise")[(parseInt(route.id.replace(/^ex-/, ""), 10) || 1) - 1] : null);
      if (matched) {
        item = matched;
      }
    }
    if (!item && route.id) {
      const rawPath = route.id.replace(/^(lecture|exercise|presentation):/, "");
      const fullPath = rawPath.startsWith("vyuka_downloaded/")
        ? rawPath
        : (rawPath.startsWith("materialy/") ? "vyuka_downloaded/" + rawPath : "vyuka_downloaded/materialy/" + rawPath.replace(/^\//, ""));
      const baseName = fullPath.split("/").pop().replace(/\.html$/, "");
      const titleName = baseName.replace(/^[_.-]+/, "").replace(/[-_]/g, " ");
      const displayTitle = titleName.charAt(0).toUpperCase() + titleName.slice(1);

      item = {
        id: route.id,
        kind: route.kind,
        title: displayTitle,
        path: fullPath,
        slug: baseName,
        weekNum: 99,
        relevance: 5,
        tags: ["Core"],
      };
      state.itemsById.set(route.id, item);
      state.itemsById.set("lecture:" + fullPath.replace(/^vyuka_downloaded\//, ""), item);
      state.itemsById.set("lecture:" + fullPath.replace(/^vyuka_downloaded\/materialy\//, ""), item);
    }
    if (item) {
      navigate({ kind: route.kind === "presentation" ? "presentation" : item.kind, id: item.id }, { skipHistory: true });
      return;
    }
  }
  navigate(route, { skipHistory: true });
}

/* ── Tabs ──────────────────────────────────────────────── */

const PINNED_HOME = {
  id: "home",
  kind: "home",
  title: "Welcome",
  itemId: null,
  weekId: null,
  pageId: null,
  pinned: true,
};

const PINNED_PROGRESS = {
  id: "progress",
  kind: "progress",
  title: "Progress",
  itemId: null,
  weekId: null,
  pageId: null,
  pinned: true,
};

/** Ensure the Welcome (1st) and Progress (2nd) tabs always exist as pinned tabs. */
function ensurePinnedTabs() {
  let home = state.tabs.find((t) => t.id === "home");
  if (!home) {
    home = { ...PINNED_HOME };
    state.tabs.unshift(home);
  }
  home.pinned = true;

  let progress = state.tabs.find((t) => t.id === "progress");
  if (!progress) {
    progress = { ...PINNED_PROGRESS };
    state.tabs.splice(1, 0, progress);
  }
  progress.pinned = true;

  // Preserve order: [home, progress, ...unpinned]
  const others = state.tabs.filter((t) => t.id !== "home" && t.id !== "progress");
  state.tabs = [home, progress, ...others];
}

function ensureTab(target) {
  ensurePinnedTabs();
  const kind = target.kind;
  let id, title, itemId, weekId, pageId, tabKind;

  if (kind === "home") {
    id = "home";
    title = "Welcome";
    tabKind = "home";
  } else if (kind === "week") {
    id = `week:${target.id}`;
    weekId = target.id;
    const w = state.weeksById.get(weekId);
    title = w ? `W${w.week}: ${w.title}` : target.id;
    tabKind = "week";
  } else if (kind === "lecture" || kind === "exercise" || kind === "content") {
    // Default: full lecture content
    itemId = target.id;
    const item = state.itemsById.get(itemId);
    id = `content:${itemId}`;
    title = item?.title || itemId;
    tabKind = "content";
  } else if (kind === "presentation") {
    itemId = target.id;
    const item = state.itemsById.get(itemId);
    id = `presentation:${itemId}`;
    title = item ? `${item.title} · slides` : itemId;
    tabKind = "presentation";
  } else if (kind === "page") {
    itemId = target.id;
    pageId = target.pageId;
    const item = state.itemsById.get(itemId);
    id = `page:${itemId}`;
    const pages = item ? (state.pagesIndex[item.path] || []) : [];
    const p = pages.find((x) => x.id === pageId);
    title = p?.title || pageId;
    if (item && title.length < 28) title = `${item.title} · ${title}`;
    if (title.length > 42) title = (p?.title || pageId);
    tabKind = "page";
  } else if (kind === "search") {
    id = "search";
    title = "Search";
    tabKind = "search";
  } else if (kind === "progress") {
    id = "progress";
    title = "Progress";
    tabKind = "progress";
  } else if (kind === "login") {
    id = "login";
    title = "Přihlášení / Profil";
    tabKind = "login";
  } else {
    id = "home";
    title = "Welcome";
    tabKind = "home";
  }

  let tab = state.tabs.find((t) => t.id === id);
  if (!tab) {
    tab = {
      id,
      kind: tabKind,
      title,
      itemId: itemId || null,
      weekId: weekId || null,
      pageId: pageId || null,
      pinned: id === "home" || id === "progress",
    };
    // Cap unpinned tabs
    const unpinned = state.tabs.filter((t) => t.id !== "home" && t.id !== "progress");
    if (unpinned.length >= 13) {
      const drop = unpinned[0];
      state.tabs = state.tabs.filter((t) => t.id !== drop.id);
    }
    state.tabs.push(tab);
    ensurePinnedTabs();
  } else {
    tab.title = title;
    tab.pageId = pageId || tab.pageId;
    tab.kind = tabKind;
    if (id === "home" || id === "progress") tab.pinned = true;
  }
  return tab;
}

function activateTab(tabId) {
  state.activeTabId = tabId;
}

export function closeTab(tabId) {
  // Pinned tabs — never close
  if (tabId === "home" || tabId === "progress") {
    navigate({ kind: tabId });
    return;
  }
  const i = state.tabs.findIndex((t) => t.id === tabId);
  if (i < 0) return;
  const tab = state.tabs[i];
  if (tab.pinned) return;
  state.tabs.splice(i, 1);
  ensurePinnedTabs();
  if (state.activeTabId === tabId) {
    const next = state.tabs[i] || state.tabs[i - 1] || state.tabs[0] || null;
    if (next) {
      navigate(tabToTarget(next), { replace: true });
    } else {
      navigate({ kind: "home" }, { replace: true });
    }
  } else {
    renderTabs();
  }
}

function tabToTarget(tab) {
  if (tab.kind === "home") return { kind: "home" };
  if (tab.kind === "week") return { kind: "week", id: tab.weekId };
  if (tab.kind === "content") {
    const item = state.itemsById.get(tab.itemId);
    return { kind: item?.kind || "lecture", id: tab.itemId };
  }
  if (tab.kind === "presentation") return { kind: "presentation", id: tab.itemId };
  if (tab.kind === "page") return { kind: "page", id: tab.itemId, pageId: tab.pageId };
  if (tab.kind === "search") return { kind: "search" };
  if (tab.kind === "progress") return { kind: "progress" };
  if (tab.kind === "login") return { kind: "login" };
  return { kind: "home" };
}

export function renderTabs() {
  const list = document.getElementById("tabsList");
  if (!list) return;
  clear(list);
  ensurePinnedTabs();

  for (const tab of state.tabs) {
    const btn = document.createElement("button");
    btn.type = "button";
    const isActive = tab.id === state.activeTabId;
    const isPinned = tab.pinned || tab.id === "home" || tab.id === "progress";
    btn.className = "tab"
      + (isActive ? " active" : "")
      + (isPinned ? " tab-pinned" : "");
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(isActive));
    if (isPinned) {
      btn.innerHTML = `
        <span class="tab-pin" title="Pinned" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8.5 1.5l.9 2.8 2.9.1-2.3 1.9.8 2.9L8.5 7.5 6.2 9.2l.8-2.9L4.7 4.4l2.9-.1.9-2.8z"/></svg>
        </span>
        <span class="tab-label" title="${escapeAttr(tab.title)}">${escape(tab.title)}</span>
      `;
    } else {
      btn.innerHTML = `
        <span class="tab-label" title="${escapeAttr(tab.title)}">${escape(tab.title)}</span>
        <span class="tab-close" data-close="${escapeAttr(tab.id)}" title="Close">${svgClose()}</span>
      `;
    }
    btn.addEventListener("click", (e) => {
      const close = e.target.closest("[data-close]");
      if (close) {
        e.stopPropagation();
        closeTab(close.getAttribute("data-close"));
        return;
      }
      navigate(tabToTarget(tab));
    });
    list.appendChild(btn);
  }
}

function renderView(tab) {
  if (!tab) {
    showHome();
    return;
  }
  switch (tab.kind) {
    case "home":
      showHome();
      break;
    case "week":
      showWeek(tab.weekId);
      break;
    case "content":
      showFullContent(tab.itemId);
      break;
    case "presentation":
      showPresentation(tab.itemId);
      break;
    case "page":
      showPage(tab.itemId, tab.pageId);
      break;
    case "search":
      showSearchResults(state.filters.text);
      break;
    case "progress":
      showProgress();
      break;
    case "login":
      showLogin();
      break;
    default:
      showHome();
  }
}

export function renderBreadcrumb(tab) {
  const nav = document.getElementById("breadcrumb");
  if (!nav) return;
  clear(nav);

  const parts = [];
  parts.push(crumbBtn("Course", () => navigate({ kind: "home" })));

  if (!tab || tab.kind === "home") {
    parts.push(sep());
    parts.push(crumbCurrent("Welcome"));
  } else if (tab.kind === "week") {
    const w = state.weeksById.get(tab.weekId);
    parts.push(sep());
    parts.push(crumbCurrent(w ? `Week ${w.week}` : tab.weekId));
  } else if (tab.itemId) {
    const item = state.itemsById.get(tab.itemId);
    if (item) {
      parts.push(sep());
      parts.push(crumbBtn(`W${item.weekNum}`, () => navigate({ kind: "week", id: item.weekId })));
      parts.push(sep());
      if (tab.kind === "page") {
        parts.push(crumbBtn(item.title, () => navigate({ kind: item.kind, id: item.id })));
        parts.push(sep());
        const pages = state.pagesIndex[item.path] || [];
        const p = pages.find((x) => x.id === tab.pageId);
        parts.push(crumbCurrent(p?.title || tab.pageId));
      } else if (tab.kind === "presentation") {
        parts.push(crumbBtn(item.title, () => navigate({ kind: item.kind, id: item.id })));
        parts.push(sep());
        parts.push(crumbCurrent("Presentation"));
      } else {
        parts.push(crumbCurrent(item.title));
      }
    }
  } else if (tab.kind === "search") {
    parts.push(sep());
    parts.push(crumbCurrent("Search"));
  } else if (tab.kind === "progress") {
    parts.push(sep());
    parts.push(crumbCurrent("Progress"));
  } else if (tab.kind === "login") {
    parts.push(sep());
    parts.push(crumbCurrent("Přihlášení / Profil"));
  }

  for (const p of parts) nav.appendChild(p);
}

function crumbBtn(label, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}
function crumbCurrent(label) {
  const s = document.createElement("span");
  s.className = "current";
  s.textContent = label;
  return s;
}
function sep() {
  const s = document.createElement("span");
  s.className = "sep";
  s.textContent = "›";
  s.setAttribute("aria-hidden", "true");
  return s;
}

function updateChrome(tab) {
  const titlePath = document.getElementById("titlePath");
  const sbPath = document.getElementById("sbPath");
  let path = "python-course";
  let pageTitle = "C/Java → Python";
  let docTitle = "newpyt · VSČHT Praha";

  if (!tab || tab.kind === "home") {
    pageTitle = "Welcome";
    docTitle = "newpyt · VSČHT Praha";
  } else {
    const item = tab.itemId ? state.itemsById.get(tab.itemId) : null;
    if (item) path = item.path;
    else if (tab.weekId) path = tab.weekId;
    else if (tab.kind === "search" || tab.kind === "progress" || tab.kind === "login") path = tab.kind;

    const w = tab.weekId ? state.weeksById.get(tab.weekId) : (item?.weekNum != null ? state.weeksById.get(item.weekId) : null);
    const weekNum = item?.weekNum ?? w?.week;

    const tabTitle = tab.title || "newpyt";
    const cleanTabTitle = tabTitle.replace(/^W\d+:\s*/, "");
    pageTitle = cleanTabTitle;

    if (weekNum != null) {
      docTitle = `W${weekNum} • ${cleanTabTitle}`;
    } else {
      docTitle = `newpyt • ${cleanTabTitle}`;
    }
  }

  document.title = docTitle;
  if (titlePath) titlePath.textContent = " — " + pageTitle;
  if (sbPath) sbPath.textContent = path;
}

function escape(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s) {
  return escape(s).replace(/"/g, "&quot;");
}

/** Re-render current tab view (e.g. after filter change on week/search) */
export function refreshActiveView() {
  const tab = state.tabs.find((t) => t.id === state.activeTabId);
  if (tab) renderView(tab);
  else showHome();
}
