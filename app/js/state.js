/** Shared application state */
import { syncEngine } from "./sync.js";

export const TAGS = ["Core", "WOW", "Legendary", "Tricky", "Skip"];
export const FLAVORS = ["basics", "resyntax", "newconcept", "pythonic", "paradigm"];

const SEEN_KEY = "pcs-seen-v1";
const STUDIED_KEY = "pcs-studied-v1";
const CHECKLIST_KEY = "pcs-checklist-v1";
const SIDEBAR_W_KEY = "pcs-sidebar-w";
const USER_KEY = "pcs-user-v1";

export const defaultUser = {
  username: "kolard",
  name: "David Kolar",
  studentId: "987654",
  faculty: "FCHI · VSČHT Praha",
};

export function getStudiedKey() {
  const u = state.user?.username;
  return u ? syncEngine.getKey(u, "studied") : STUDIED_KEY;
}

export function getSeenKey() {
  const u = state.user?.username;
  return u ? syncEngine.getKey(u, "seen") : SEEN_KEY;
}

export function getChecklistKey() {
  const u = state.user?.username;
  return u ? syncEngine.getKey(u, "checklist") : CHECKLIST_KEY;
}

export const state = {
  course: null,
  slides: {},
  pagesIndex: {},
  /** path → structured exercise tasks (from data/exercises.json) */
  exercises: {},
  /** Flat list of all lecture/exercise items */
  items: [],
  /** week id → week object */
  weeksById: new Map(),
  /** item id → item */
  itemsById: new Map(),

  filters: {
    text: "",
    tags: new Set(),       // active tag chips (OR within selection; item must match ALL active if multi? → OR is more UX-friendly)
    flavors: new Set(),
    relMin: 1,
    sort: "course",
  },

  /** Which sidebar view: explorer | search | progress */
  view: "explorer",
  sidebarOpen: true,
  sidebarWidth: 280,

  /** Open editor tabs: { id, kind, title, itemId?, weekId?, pageId? } */
  tabs: [],
  activeTabId: null,

  /** Tree expand state: nodeKey → bool */
  expanded: new Map(),

  /** Auto-seen item ids (opened once) */
  seen: new Set(),

  /** Manually marked “studied” item ids (progress source of truth) */
  studied: new Set(),

  /** Checked items in the 4-level checklist */
  checklist: new Set(),

  /** Currently focused tree node key */
  focusedTreeKey: null,
  
  user: null,
};

export function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const u = JSON.parse(raw);
      if (u && u.username) {
        state.user = u;
        return;
      }
    }
  } catch { /* ignore */ }
  state.user = null;
}

export function setUser(userObj) {
  state.user = userObj;
  try {
    if (userObj) {
      localStorage.setItem(USER_KEY, JSON.stringify(userObj));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch { /* ignore */ }
  loadPersisted();
  notifyStateChange("user", { user: userObj });
}

export function logoutUser() {
  state.user = null;
  try {
    localStorage.removeItem(USER_KEY);
  } catch { /* ignore */ }
  state.studied = new Set();
  state.seen = new Set();
  state.checklist = new Set();
  notifyStateChange("user", { user: null });
}

export function loadPersisted() {
  loadUser();
  const sKey = getStudiedKey();
  const seKey = getSeenKey();
  const chKey = getChecklistKey();

  state.studied = new Set();
  state.seen = new Set();
  state.checklist = new Set();

  try {
    const raw = localStorage.getItem(seKey);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) state.seen = new Set(arr);
    }
  } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem(sKey);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) state.studied = new Set(arr);
    }
  } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem(chKey) || localStorage.getItem(CHECKLIST_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) state.checklist = new Set(arr);
    }
  } catch { /* ignore */ }
  try {
    const w = parseInt(localStorage.getItem(SIDEBAR_W_KEY) || "", 10);
    if (w >= 180 && w <= 520) state.sidebarWidth = w;
  } catch { /* ignore */ }

  syncCloudProgress();
}

const listeners = new Set();

/** Subscribe to state changes. Returns unsubscribe function. */
export function onStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notifyStateChange(changeType, detail) {
  for (const fn of listeners) {
    try {
      fn(state, changeType, detail);
    } catch (err) {
      console.error("State listener error:", err);
    }
  }
}

export async function syncCloudProgress() {
  const username = state.user?.username;
  if (!username) return;

  try {
    const studiedResult = await syncEngine.syncSet(
      username,
      "studied",
      state.studied,
      getStudiedKey()
    );
    const seenResult = await syncEngine.syncSet(
      username,
      "seen",
      state.seen,
      getSeenKey()
    );
    const checklistResult = await syncEngine.syncSet(
      username,
      "checklist",
      state.checklist,
      getChecklistKey()
    );

    let changed = false;
    if (studiedResult.changed) {
      state.studied = studiedResult.set;
      changed = true;
    }
    if (seenResult.changed) {
      state.seen = seenResult.set;
      changed = true;
    }
    if (checklistResult.changed) {
      state.checklist = checklistResult.set;
      changed = true;
    }

    if (changed) {
      notifyStateChange("cloudSync");
    }
  } catch (err) {
    console.warn("Cloud sync error:", err);
  }
}

export function persistSeen() {
  const seKey = getSeenKey();
  const arr = [...state.seen];
  try {
    localStorage.setItem(seKey, JSON.stringify(arr));
  } catch { /* ignore */ }
  if (state.user?.username) {
    syncEngine.kvSet(syncEngine.getKey(state.user.username, "seen"), arr);
  }
}

export function persistStudied() {
  const sKey = getStudiedKey();
  const arr = [...state.studied];
  try {
    localStorage.setItem(sKey, JSON.stringify(arr));
  } catch { /* ignore */ }
  if (state.user?.username) {
    syncEngine.kvSet(syncEngine.getKey(state.user.username, "studied"), arr);
  }
}

export function persistChecklist() {
  const chKey = getChecklistKey();
  const arr = [...state.checklist];
  try {
    localStorage.setItem(chKey, JSON.stringify(arr));
  } catch { /* ignore */ }
  if (state.user?.username) {
    syncEngine.kvSet(syncEngine.getKey(state.user.username, "checklist"), arr);
  }
}

export function isChecklistChecked(id) {
  return !!(id && state.checklist.has(id));
}

export function toggleChecklist(id) {
  if (!id) return false;
  let now = false;
  if (state.checklist.has(id)) {
    state.checklist.delete(id);
    now = false;
  } else {
    state.checklist.add(id);
    now = true;
  }
  persistChecklist();
  notifyStateChange("checklist", { id, now });
  return now;
}

export function resetChecklistState() {
  state.checklist.clear();
  try {
    localStorage.removeItem(CHECKLIST_KEY);
  } catch { /* ignore */ }
  notifyStateChange("checklist");
}

export function calculateChecklistProgress(items = []) {
  const total = items.length;
  let checkedCount = 0;
  const byLevel = {
    1: { total: 0, checked: 0, pct: 0 },
    2: { total: 0, checked: 0, pct: 0 },
    3: { total: 0, checked: 0, pct: 0 },
    4: { total: 0, checked: 0, pct: 0 },
  };

  for (const item of items) {
    const isChecked = state.checklist.has(item.id);
    if (isChecked) checkedCount++;
    if (byLevel[item.level]) {
      byLevel[item.level].total++;
      if (isChecked) byLevel[item.level].checked++;
    }
  }

  for (const lvl in byLevel) {
    const l = byLevel[lvl];
    l.pct = l.total > 0 ? Math.round((l.checked / l.total) * 100) : 0;
  }

  const pctTotal = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  return {
    total,
    checked: checkedCount,
    pct: pctTotal,
    byLevel,
  };
}

export function persistSidebarW() {
  try {
    localStorage.setItem(SIDEBAR_W_KEY, String(state.sidebarWidth));
  } catch { /* ignore */ }
}

export function markSeen(itemId) {
  if (!itemId || state.seen.has(itemId)) return;
  state.seen.add(itemId);
  persistSeen();
  notifyStateChange("seen", { itemId });
}

export function isStudied(itemId) {
  return !!(itemId && state.studied.has(itemId));
}

/** Toggle manual “studied” flag. Returns new studied state. */
export function toggleStudied(itemId) {
  if (!itemId) return false;
  let now = false;
  if (state.studied.has(itemId)) {
    state.studied.delete(itemId);
    now = false;
  } else {
    state.studied.add(itemId);
    markSeen(itemId);
    now = true;
  }
  persistStudied();
  notifyStateChange("studied", { itemId, now });
  return now;
}

export function setStudied(itemId, on) {
  if (!itemId) return;
  if (on) {
    state.studied.add(itemId);
    markSeen(itemId);
  } else {
    state.studied.delete(itemId);
  }
  persistStudied();
  notifyStateChange("studied", { itemId, now: on });
}

export function buildIndexes(course) {
  state.course = course;
  state.items = [];
  state.weeksById.clear();
  state.itemsById.clear();

  for (const week of course.weeks || []) {
    state.weeksById.set(week.id, week);
    // default expand first few weeks
    if (!state.expanded.has(week.id)) {
      state.expanded.set(week.id, week.week <= 2);
    }
    for (const lec of week.lectures || []) {
      const item = { ...lec, weekId: week.id, weekTitle: week.title, weekNum: week.week };
      state.items.push(item);
      state.itemsById.set(item.id, item);
    }
    for (const ex of week.exercises || []) {
      const item = { ...ex, weekId: week.id, weekTitle: week.title, weekNum: week.week };
      state.items.push(item);
      state.itemsById.set(item.id, item);
    }
  }
}

export function itemMatchesFilters(item, f = state.filters) {
  if ((item.relevance ?? 0) < f.relMin) return false;

  if (f.tags.size > 0) {
    const tags = item.tags || [];
    let hit = false;
    for (const t of f.tags) {
      if (tags.includes(t)) { hit = true; break; }
    }
    if (!hit) return false;
  }

  if (f.flavors.size > 0) {
    if (!f.flavors.has(item.diff)) return false;
  }

  if (f.text) {
    const q = f.text.toLowerCase().trim();
    if (q) {
      const hay = [
        item.title,
        item.desc,
        item.compare,
        item.slug,
        item.path,
        ...(item.tags || []),
        item.diff,
        item.weekTitle,
      ].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
  }
  return true;
}

export function filteredItems() {
  let list = state.items.filter((it) => itemMatchesFilters(it));
  const sort = state.filters.sort;
  if (sort === "relevance-desc") {
    list = [...list].sort((a, b) => (b.relevance - a.relevance) || a.title.localeCompare(b.title, "cs"));
  } else if (sort === "relevance-asc") {
    list = [...list].sort((a, b) => (a.relevance - b.relevance) || a.title.localeCompare(b.title, "cs"));
  } else if (sort === "title") {
    list = [...list].sort((a, b) => a.title.localeCompare(b.title, "cs"));
  }
  // course order: keep original
  return list;
}

export function weekVisibleItems(week) {
  const all = [...(week.lectures || []), ...(week.exercises || [])];
  const f = state.filters;
  let list = all
    .map((it) => state.itemsById.get(it.id) || it)
    .filter((it) => itemMatchesFilters(it, f));

  if (f.sort === "relevance-desc") {
    list.sort((a, b) => (b.relevance - a.relevance) || a.title.localeCompare(b.title, "cs"));
  } else if (f.sort === "relevance-asc") {
    list.sort((a, b) => (a.relevance - b.relevance) || a.title.localeCompare(b.title, "cs"));
  } else if (f.sort === "title") {
    list.sort((a, b) => a.title.localeCompare(b.title, "cs"));
  }
  return list;
}

export function filtersActive() {
  const f = state.filters;
  return (
    f.text.trim() !== "" ||
    f.tags.size > 0 ||
    f.flavors.size > 0 ||
    f.relMin > 1 ||
    f.sort !== "course"
  );
}

export function clearFilters() {
  state.filters.text = "";
  state.filters.tags.clear();
  state.filters.flavors.clear();
  state.filters.relMin = 1;
  state.filters.sort = "course";
}

export function pagesFor(path) {
  const pages = state.pagesIndex[path];
  if (pages && pages.length) return pages;
  // Exercises: surface úkols as page-level nodes
  const ex = state.exercises[path];
  if (ex?.tasks?.length) {
    return ex.tasks.map((t) => ({
      id: t.id,
      title: t.title || t.summary || t.id,
    }));
  }
  return [];
}

export function slideDiff(slug, pageId) {
  const key = `${slug}#${pageId}`;
  const entry = state.slides[key];
  if (!entry) return null;
  return typeof entry === "string" ? entry : entry.diff || null;
}
