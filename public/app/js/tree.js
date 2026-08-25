import { state, weekVisibleItems, pagesFor, slideDiff, itemMatchesFilters, getQuizFor } from "./state.js";
import { fetchAndExtract } from "./content.js";
import {
  clear, starsHtml, badgesHtml, flavorHtml,
  svgChevron, svgFolder, svgFile, svgExercise, svgPage,
  escapeAttr, escapeHtml as escape,
} from "./ui.js";

const prefetchedPaths = new Set();
export function prefetchItem(item) {
  if (!item) return;
  if (item.path && !prefetchedPaths.has(item.path)) {
    prefetchedPaths.add(item.path);
    fetchAndExtract(item.path).catch(() => {});
  }
  if (item.id) {
    getQuizFor(item).catch(() => {});
  }
}

let onSelect = null;

export function setTreeSelectHandler(fn) {
  onSelect = fn;
}

export function renderTree() {
  const root = document.getElementById("treeRoot");
  if (!root || !state.course) return;
  clear(root);

  const frag = document.createDocumentFragment();

  // Top special node for Checklist
  const checkNode = document.createElement("div");
  checkNode.className = "tree-node";
  checkNode.dataset.key = "checklist";
  const checkRow = document.createElement("div");
  checkRow.className = "tree-row" + (state.focusedTreeKey === "checklist" ? " active" : "");
  checkRow.setAttribute("role", "treeitem");
  checkRow.tabIndex = 0;
  checkRow.dataset.kind = "checklist";
  checkRow.dataset.id = "checklist";
  checkRow.innerHTML = `
    <span class="tree-twistie"></span>
    <span class="tree-icon" style="color:var(--accent)">📋</span>
    <span class="tree-label">Studijní plán (4 Úrovně)</span>
  `;
  checkRow.addEventListener("click", () => select("checklist", "checklist"));
  checkRow.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select("checklist", "checklist");
    }
  });
  checkNode.appendChild(checkRow);
  frag.appendChild(checkNode);

  const weeks = state.course.weeks || [];
  for (const week of weeks) {
    const items = weekVisibleItems(week);
    const hasMatch = items.length > 0;
    // When filters active, hide empty weeks; when not, show all
    const filtersOn =
      state.filters.text ||
      state.filters.tags.size ||
      state.filters.flavors.size ||
      state.filters.relMin > 1;

    if (filtersOn && !hasMatch) continue;

    // Auto-expand when filtering
    if (filtersOn && hasMatch) {
      state.expanded.set(week.id, true);
    }

    frag.appendChild(buildWeekNode(week, items));
  }

  if (!frag.childElementCount) {
    const empty = document.createElement("div");
    empty.style.cssText = "padding:16px 12px;color:var(--text-faint);font-size:12px;";
    empty.textContent = "No items match the current filters.";
    frag.appendChild(empty);
  }

  root.appendChild(frag);
}

function buildWeekNode(week, items) {
  const open = !!state.expanded.get(week.id);
  const isGrayShelf = week.week === 99;
  const li = document.createElement("div");
  li.className = "tree-node" + (open ? " open" : "") + (isGrayShelf ? " tree-node-gray-shelf" : "");
  li.dataset.key = week.id;

  const row = document.createElement("div");
  row.className = "tree-row" + (isGrayShelf ? " tree-row-gray-shelf" : "");
  row.setAttribute("role", "treeitem");
  row.setAttribute("aria-expanded", String(open));
  row.tabIndex = 0;
  row.dataset.kind = "week";
  row.dataset.id = week.id;
  if (state.focusedTreeKey === week.id) row.classList.add("active");

  const weekLabel = isGrayShelf
    ? `🗑️ ${escape(week.title)}`
    : `W${week.week} · ${escape(week.title)}`;

  row.innerHTML = `
    <span class="tree-twistie">${svgChevron()}</span>
    <span class="tree-icon week" style="${isGrayShelf ? 'color:var(--text-faint)' : ''}">${svgFolder()}</span>
    <span class="tree-label">${weekLabel}</span>
    <span class="tree-meta"><span class="rel-pill" style="color:var(--text-faint)">${items.length}</span></span>
  `;

  row.addEventListener("click", (e) => {
    const onTwistie = e.target.closest(".tree-twistie");
    if (onTwistie) {
      toggleExpand(week.id);
      renderTree();
      return;
    }
    // double purpose: select week + ensure expanded
    state.expanded.set(week.id, true);
    select("week", week.id);
  });
  row.addEventListener("keydown", (e) => treeKey(e, week.id, "week"));

  li.appendChild(row);

  const children = document.createElement("div");
  children.className = "tree-children";
  children.setAttribute("role", "group");

  for (const item of items) {
    children.appendChild(buildItemNode(item));
  }
  li.appendChild(children);
  return li;
}

function buildItemNode(item) {
  const key = item.id;
  const pages = pagesFor(item.path);
  const hasPages = pages.length > 0;
  const open = !!state.expanded.get(key);

  const li = document.createElement("div");
  li.className = "tree-node" + (open ? " open" : "");
  li.dataset.key = key;

  const row = document.createElement("div");
  row.className = "tree-row";
  row.setAttribute("role", "treeitem");
  if (hasPages) row.setAttribute("aria-expanded", String(open));
  row.tabIndex = 0;
  row.dataset.kind = item.kind;
  row.dataset.id = item.id;
  if (state.focusedTreeKey === key) row.classList.add("active");

  const icon = item.kind === "exercise" ? svgExercise() : svgFile();
  const iconClass = item.kind === "exercise" ? "exercise" : "lecture";
  const studied = state.studied?.has(item.id)
    ? `<span class="studied-dot" title="Studied"></span>`
    : state.seen.has(item.id)
      ? `<span class="seen-dot" title="Opened"></span>`
      : "";

  row.innerHTML = `
    <span class="tree-twistie">${hasPages ? svgChevron() : ""}</span>
    <span class="tree-icon ${iconClass}">${icon}</span>
    <span class="tree-label" title="${escapeAttr(item.title)}">${escape(item.title)}</span>
    <span class="tree-meta">
      ${studied}
      ${badgesHtml(item.tags)}
      ${starsHtml(item.relevance)}
    </span>
  `;

  let prefetchTimer = null;
  row.addEventListener("pointerenter", () => {
    prefetchTimer = setTimeout(() => {
      prefetchItem(item);
    }, 35);
  });
  row.addEventListener("pointerleave", () => {
    if (prefetchTimer) clearTimeout(prefetchTimer);
  });
  row.addEventListener("touchstart", () => {
    prefetchItem(item);
  }, { passive: true });

  row.addEventListener("click", (e) => {
    if (e.target.closest(".tree-twistie") && hasPages) {
      toggleExpand(key);
      renderTree();
      return;
    }
    if (hasPages) state.expanded.set(key, true);
    select(item.kind, item.id);
  });
  row.addEventListener("keydown", (e) => treeKey(e, key, item.kind));

  li.appendChild(row);

  if (hasPages) {
    const children = document.createElement("div");
    children.className = "tree-children";
    children.setAttribute("role", "group");
    for (const page of pages) {
      children.appendChild(buildPageNode(item, page));
    }
    li.appendChild(children);
  }
  return li;
}

function buildPageNode(item, page) {
  const key = `${item.id}#${page.id}`;
  const diff = slideDiff(item.slug, page.id);

  const li = document.createElement("div");
  li.className = "tree-node";
  li.dataset.key = key;

  const row = document.createElement("div");
  row.className = "tree-row";
  row.setAttribute("role", "treeitem");
  row.tabIndex = 0;
  row.dataset.kind = "page";
  row.dataset.id = item.id;
  row.dataset.page = page.id;
  if (state.focusedTreeKey === key) row.classList.add("active");

  row.innerHTML = `
    <span class="tree-twistie"></span>
    <span class="tree-icon page">${svgPage()}</span>
    <span class="tree-label" title="${escapeAttr(page.title)}">${escape(page.title)}</span>
    <span class="tree-meta">${diff ? flavorHtml(diff) : ""}</span>
  `;

  let pagePrefetchTimer = null;
  row.addEventListener("pointerenter", () => {
    pagePrefetchTimer = setTimeout(() => {
      prefetchItem(item);
    }, 35);
  });
  row.addEventListener("pointerleave", () => {
    if (pagePrefetchTimer) clearTimeout(pagePrefetchTimer);
  });
  row.addEventListener("touchstart", () => {
    prefetchItem(item);
  }, { passive: true });

  row.addEventListener("click", () => select("page", item.id, page.id));
  row.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select("page", item.id, page.id);
    }
  });

  li.appendChild(row);
  return li;
}

function toggleExpand(key) {
  state.expanded.set(key, !state.expanded.get(key));
}

function select(kind, id, pageId) {
  state.focusedTreeKey = pageId ? `${id}#${pageId}` : id;
  if (onSelect) onSelect({ kind, id, pageId });
  // re-highlight without full rebuild when possible — full rebuild is fine for density
  highlightActive();
}

function highlightActive() {
  document.querySelectorAll(".tree-row.active").forEach((r) => r.classList.remove("active"));
  const key = state.focusedTreeKey;
  if (!key) return;
  const node = document.querySelector(`.tree-node[data-key="${cssEscape(key)}"] > .tree-row`);
  if (node) node.classList.add("active");
}

function treeKey(e, key, kind) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    e.currentTarget.click();
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    if (!state.expanded.get(key)) {
      state.expanded.set(key, true);
      renderTree();
      focusKey(key);
    }
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (state.expanded.get(key)) {
      state.expanded.set(key, false);
      renderTree();
      focusKey(key);
    }
  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const rows = [...document.querySelectorAll(".tree-row")];
    const i = rows.indexOf(e.currentTarget);
    const next = e.key === "ArrowDown" ? rows[i + 1] : rows[i - 1];
    if (next) next.focus();
  }
}

function focusKey(key) {
  requestAnimationFrame(() => {
    const node = document.querySelector(`.tree-node[data-key="${cssEscape(key)}"] > .tree-row`);
    if (node) node.focus();
  });
}

export function expandAll() {
  if (!state.course) return;
  for (const w of state.course.weeks) {
    state.expanded.set(w.id, true);
    for (const it of [...(w.lectures || []), ...(w.exercises || [])]) {
      if (pagesFor(it.path).length) state.expanded.set(it.id, true);
    }
  }
  renderTree();
}

export function collapseAll() {
  state.expanded.clear();
  renderTree();
}

export function revealItem(itemId, pageId) {
  const item = state.itemsById.get(itemId);
  if (!item) return;
  state.expanded.set(item.weekId, true);
  if (pageId) state.expanded.set(itemId, true);
  state.focusedTreeKey = pageId ? `${itemId}#${pageId}` : itemId;
  renderTree();
  requestAnimationFrame(() => {
    const key = state.focusedTreeKey;
    const node = document.querySelector(`.tree-node[data-key="${cssEscape(key)}"]`);
    if (node) node.scrollIntoView({ block: "nearest" });
    highlightActive();
  });
}

function cssEscape(s) {
  if (window.CSS && CSS.escape) return CSS.escape(s);
  return String(s).replace(/"/g, '\\"');
}

// silence unused import warning in some tooling
void itemMatchesFilters;
