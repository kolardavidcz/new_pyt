/** Explorer tree rendering */

import { state, weekVisibleItems, pagesFor, slideDiff, itemMatchesFilters } from "./state.js";
import {
  clear, starsHtml, badgesHtml, flavorHtml,
  svgChevron, svgFolder, svgFile, svgExercise, svgPage,
} from "./ui.js";

let onSelect = null;

export function setTreeSelectHandler(fn) {
  onSelect = fn;
}

export function renderTree() {
  const root = document.getElementById("treeRoot");
  if (!root || !state.course) return;
  clear(root);

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

    root.appendChild(buildWeekNode(week, items));
  }

  if (!root.childElementCount) {
    const empty = document.createElement("div");
    empty.style.cssText = "padding:16px 12px;color:var(--text-faint);font-size:12px;";
    empty.textContent = "No items match the current filters.";
    root.appendChild(empty);
  }
}

function buildWeekNode(week, items) {
  const open = !!state.expanded.get(week.id);
  const li = document.createElement("div");
  li.className = "tree-node" + (open ? " open" : "");
  li.dataset.key = week.id;

  const row = document.createElement("div");
  row.className = "tree-row";
  row.setAttribute("role", "treeitem");
  row.setAttribute("aria-expanded", String(open));
  row.tabIndex = 0;
  row.dataset.kind = "week";
  row.dataset.id = week.id;
  if (state.focusedTreeKey === week.id) row.classList.add("active");

  row.innerHTML = `
    <span class="tree-twistie">${svgChevron()}</span>
    <span class="tree-icon week">${svgFolder()}</span>
    <span class="tree-label">W${week.week} · ${escape(week.title)}</span>
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

function escape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(s) {
  return escape(s).replace(/"/g, "&quot;");
}
function cssEscape(s) {
  if (window.CSS && CSS.escape) return CSS.escape(s);
  return String(s).replace(/"/g, '\\"');
}

// silence unused import warning in some tooling
void itemMatchesFilters;
