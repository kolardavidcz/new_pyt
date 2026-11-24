/**
 * Interactive Python Standard Exceptions Hierarchy Explorer (#/exceptions)
 */

import { EXCEPTION_TAGS, EXCEPTION_TREE_DATA } from "./exceptions_tree.js";
import { clear, el, escapeHtml } from "./ui.js";

let searchQuery = "";
let activeTagFilter = "all"; // "all" | "bug" | "guard" | "flow" | "sys" | "warn" | "base"
const collapsedNodes = new Set();

function nodeMatches(node, q, tagFilter) {
  const selfTagOk = tagFilter === "all" || node.tag === tagFilter;
  const selfTextOk = !q ||
    node.name.toLowerCase().includes(q) ||
    (node.meaning || "").toLowerCase().includes(q) ||
    (node.tagLabel || "").toLowerCase().includes(q);
  const selfMatch = selfTagOk && selfTextOk;

  const matchingChildren = (node.children || [])
    .map((child) => nodeMatches(child, q, tagFilter))
    .filter(Boolean);

  if (selfMatch || matchingChildren.length > 0) {
    return { node, selfMatch, children: matchingChildren };
  }
  return null;
}

function countTreeMatches(filtered) {
  if (!filtered) return 0;
  return (filtered.selfMatch ? 1 : 0) + filtered.children.reduce((s, c) => s + countTreeMatches(c), 0);
}

export function showExceptions() {
  const main = document.getElementById("main");
  if (!main) return;
  main.className = "catalog exceptions-view";
  clear(main);

  const header = el("div", { className: "catalog-header" });
  header.innerHTML = `
    <h1>⚡ Interaktivní strom výjimek v Pythonu</h1>
    <p class="desc">Kompletní hierarchie vestavěných výjimek (Python 3.12+) rozdělená podle toho, zda jde o chybu v kódu, nutnost <code>try/except</code> ochrany, řízení toku nebo systémový zásah.</p>
  `;
  main.appendChild(header);

  // Search + Tag Filter Controls
  const controls = el("div", { className: "exc-controls" });
  const searchInput = el("input", {
    type: "search",
    className: "exc-search-input",
    placeholder: "Hledat výjimku nebo význam (např. KeyError, soubor, Unicode, Ctrl+C)…",
    value: searchQuery,
    "aria-label": "Hledat ve stromu výjimek",
    onInput: (e) => {
      searchQuery = e.target.value;
      renderTreeBody();
    },
  });

  const tagRow = el("div", { className: "exc-tag-filters", role: "group", "aria-label": "Filtrovat podle kategorie" });
  const allChip = el("button", {
    type: "button",
    className: `chip${activeTagFilter === "all" ? " active" : ""}`,
    onClick: () => {
      activeTagFilter = "all";
      showExceptions();
    },
  }, "Vše");
  tagRow.appendChild(allChip);

  for (const [key, meta] of Object.entries(EXCEPTION_TAGS)) {
    tagRow.appendChild(el("button", {
      type: "button",
      className: `chip exc-chip-${key}${activeTagFilter === key ? " active" : ""}`,
      title: meta.desc,
      onClick: () => {
        activeTagFilter = activeTagFilter === key ? "all" : key;
        showExceptions();
      },
    }, meta.label));
  }

  const actionsRow = el("div", { className: "exc-tree-actions" });
  actionsRow.append(
    el("button", {
      type: "button",
      className: "btn sm",
      onClick: () => {
        collapsedNodes.clear();
        renderTreeBody();
      },
    }, "Rozbalit vše"),
    el("button", {
      type: "button",
      className: "btn sm",
      onClick: () => {
        const collectParents = (n) => {
          if (n.children?.length) {
            if (n.name !== "BaseException" && n.name !== "Exception") collapsedNodes.add(n.name);
            n.children.forEach(collectParents);
          }
        };
        collectParents(EXCEPTION_TREE_DATA);
        renderTreeBody();
      },
    }, "Sbalit podstromy"),
  );

  controls.append(searchInput, tagRow, actionsRow);
  main.appendChild(controls);

  const countBanner = el("div", { className: "exc-count-banner" });
  main.appendChild(countBanner);

  const treeContainer = el("div", { className: "exc-explorer-tree" });
  main.appendChild(treeContainer);

  function renderNode(entry, ancestors = []) {
    const { node, selfMatch, children } = entry;
    const hasKids = children.length > 0;
    const isFiltering = Boolean(searchQuery.trim() || activeTagFilter !== "all");
    const isCollapsed = !isFiltering && collapsedNodes.has(node.name);
    const chain = [...ancestors, node.name];

    const wrap = el("div", {
      className: `exc-node${selfMatch ? " is-match" : " is-ancestor"}${isCollapsed ? " is-collapsed" : ""}`,
    });

    const row = el("div", { className: "exc-node-row" });
    const toggle = el("button", {
      type: "button",
      className: `exc-toggle${hasKids ? "" : " leaf"}`,
      "aria-label": isCollapsed ? "Rozbalit" : "Sbalit",
      onClick: () => {
        if (!hasKids) return;
        if (collapsedNodes.has(node.name)) collapsedNodes.delete(node.name);
        else collapsedNodes.add(node.name);
        renderTreeBody();
      },
    }, hasKids ? (isCollapsed ? "▸" : "▾") : "•");

    const info = el("div", { className: "exc-node-info" });
    info.innerHTML = `
      <div class="exc-node-top">
        <code class="exc-node-name tag-${escapeHtml(node.tag)}">${escapeHtml(node.name)}</code>
        <span class="exc-node-pill tag-${escapeHtml(node.tag)}">${escapeHtml(node.tagLabel || node.tag)}</span>
        ${ancestors.length ? `<span class="exc-node-chain" title="Řetězec dědičnosti">${escapeHtml(chain.join(" › "))}</span>` : ""}
      </div>
      <div class="exc-node-meaning">${escapeHtml(node.meaning || "")}</div>
    `;

    row.append(toggle, info);
    wrap.appendChild(row);

    if (hasKids && !isCollapsed) {
      const kidsEl = el("div", { className: "exc-node-children" });
      for (const child of children) {
        kidsEl.appendChild(renderNode(child, chain));
      }
      wrap.appendChild(kidsEl);
    }

    return wrap;
  }

  function renderTreeBody() {
    clear(treeContainer);
    const q = searchQuery.trim().toLowerCase();
    const filtered = nodeMatches(EXCEPTION_TREE_DATA, q, activeTagFilter);
    const matches = countTreeMatches(filtered);
    countBanner.textContent = filtered
      ? `Nalezeno ${matches} výjimek`
      : "Žádná výjimka neodpovídá filtru.";

    if (filtered) {
      treeContainer.appendChild(renderNode(filtered, []));
    }
  }

  renderTreeBody();
}
