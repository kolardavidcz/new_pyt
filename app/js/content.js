/** Content loading: catalog views + lecture HTML extraction */

import {
  state, pagesFor, slideDiff, weekVisibleItems, filteredItems, markSeen,
  isStudied, toggleStudied,
} from "./state.js";
import { clear, el, starsHtml, badgesHtml, flavorHtml, escapeHtml } from "./ui.js";
import { highlightRoot } from "./highlight.js";
import { renderTree } from "./tree.js";

export function setLoading(on) {
  const bar = document.getElementById("loadingBar");
  if (!bar) return;
  bar.classList.toggle("active", !!on);
}

/* ── Welcome: all weeks + full lecture/exercise catalogs ─ */

export function showHome() {
  const main = document.getElementById("main");
  const course = state.course;
  const stats = course?.meta?.stats || {};
  const weeks = course?.weeks || [];

  main.className = "catalog catalog-home";
  clear(main);

  const header = el("div", { className: "catalog-header" });
  header.innerHTML = `
    <h1>Python Course Workspace</h1>
    <p class="desc">VS Code–style shell for students moving from <strong>C / Java</strong> to <strong>Python</strong>.
      Click a card to open the full lecture. Use filters in the sidebar to narrow the path.</p>
    <div class="catalog-stats">
      <span>${stats.weeks ?? weeks.length} weeks</span>
      <span>${stats.lectures ?? "—"} lectures</span>
      <span>${stats.exercises ?? "—"} exercises</span>
      <span>${state.seen.size} seen</span>
    </div>
    <div class="welcome-keys" style="justify-content:flex-start;margin-top:12px">
      <span><kbd class="kbd">Ctrl+P</kbd> Quick open</span>
      <span><kbd class="kbd">Ctrl+B</kbd> Toggle sidebar</span>
      <span><kbd class="kbd">Ctrl+Shift+F</kbd> Search</span>
      <span><kbd class="kbd">Browser ←</kbd> Previous view</span>
    </div>
  `;
  main.appendChild(header);

  for (const week of weeks) {
    main.appendChild(buildWeekCatalogBlock(week, { showWeekLink: true }));
  }

  if (!weeks.length) {
    main.appendChild(el("p", { className: "desc" }, "No weeks loaded."));
  }
}

/* ── Single week catalog ───────────────────────────────── */

export function showWeek(weekId) {
  const week = state.weeksById.get(weekId);
  const main = document.getElementById("main");
  if (!week) {
    main.className = "";
    main.innerHTML = `<div class="error-box">Week not found: <code>${escapeHtml(weekId)}</code></div>`;
    return;
  }

  main.className = "catalog";
  clear(main);

  const items = weekVisibleItems(week);
  const header = el("div", { className: "catalog-header" },
    el("h1", {}, `Week ${week.week}: ${week.title}`),
    week.description ? el("p", { className: "desc" }, week.description) : null,
    el("div", { className: "catalog-stats" },
      el("span", {}, `${items.length} items visible`),
      el("span", {}, `${(week.lectures || []).length} lectures`),
      el("span", {}, `${(week.exercises || []).length} exercises`),
    ),
  );
  main.appendChild(header);
  main.appendChild(buildWeekCatalogBlock(week, { hideTitle: true }));
}

/**
 * Shared week body: Lectures + Exercises card grids (same as week click).
 */
function buildWeekCatalogBlock(week, { showWeekLink = false, hideTitle = false } = {}) {
  const items = weekVisibleItems(week);
  const wrap = el("div", { className: "week-block", dataset: { weekId: week.id } });

  if (!hideTitle) {
    const titleRow = el("div", { className: "week-block-header" });
    if (showWeekLink) {
      const btn = el("button", {
        type: "button",
        className: "week-block-title",
        onClick: () => window.__pcsNavigate?.({ kind: "week", id: week.id }),
      });
      btn.innerHTML = `<span class="week-num">W${week.week}</span> ${escapeHtml(week.title)}`;
      titleRow.appendChild(btn);
    } else {
      titleRow.innerHTML = `<h2 class="week-block-title static"><span class="week-num">W${week.week}</span> ${escapeHtml(week.title)}</h2>`;
    }
    if (week.description) {
      titleRow.appendChild(el("p", { className: "week-block-desc" }, week.description));
    }
    const count = el("span", { className: "week-block-count" }, `${items.length} items`);
    titleRow.appendChild(count);
    wrap.appendChild(titleRow);
  }

  const lectures = items.filter((i) => i.kind === "lecture");
  const exercises = items.filter((i) => i.kind === "exercise");

  if (lectures.length) wrap.appendChild(section("Lectures", lectures));
  if (exercises.length) wrap.appendChild(section("Exercises", exercises));
  if (!items.length) {
    wrap.appendChild(el("p", { className: "desc" }, "No items match the current filters in this week."));
  }
  return wrap;
}

function section(title, items) {
  const sec = el("div", { className: "catalog-section" },
    el("h2", {}, title),
  );
  const grid = el("div", { className: "card-grid" });
  for (const item of items) grid.appendChild(itemCard(item));
  sec.appendChild(grid);
  return sec;
}

function itemCard(item) {
  // Default open = full lecture / structured exercise
  const card = el("button", {
    type: "button",
    className: "card" + (item.kind === "exercise" ? " card-exercise" : ""),
    onClick: () => window.__pcsNavigate?.({ kind: item.kind, id: item.id }),
  });
  const exMeta = state.exercises[item.path];
  const taskCount = exMeta?.task_count || exMeta?.tasks?.length || 0;
  card.innerHTML = `
    <div class="card-top">
      <div class="card-title">${escapeHtml(item.title)}</div>
      <div class="card-kind">${escapeHtml(item.kind)}</div>
    </div>
    ${item.desc ? `<div class="card-desc">${escapeHtml(item.desc)}</div>` : ""}
    ${item.compare ? `<div class="card-compare">${escapeHtml(item.compare)}</div>` : ""}
    <div class="card-footer">
      ${badgesHtml(item.tags)}
      ${flavorHtml(item.diff)}
      ${taskCount ? `<span class="task-count-chip">${taskCount} úkolů</span>` : ""}
      ${starsHtml(item.relevance, 10, "bar")}
    </div>
  `;
  return card;
}

/* ── Lecture toolbar (shared) ──────────────────────────── */

export function toggleFullscreen(forceState) {
  const isFS = !!document.fullscreenElement || document.documentElement.classList.contains("presentation-fullscreen-mode");
  const targetState = forceState !== undefined ? forceState : !isFS;

  if (targetState) {
    document.documentElement.classList.add("presentation-fullscreen-mode");
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  } else {
    document.documentElement.classList.remove("presentation-fullscreen-mode");
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      document.documentElement.classList.remove("presentation-fullscreen-mode");
    }
  });
}

function lectureToolbar(item, mode) {
  // mode: "full" | "presentation" | "page"
  const pages = pagesFor(item.path);
  const bar = el("div", { className: "item-actions lecture-toolbar" });

  if (mode === "full") {
    if (pages.length) {
      bar.appendChild(el("button", {
        type: "button",
        className: "btn primary",
        title: "Start full screen presentation",
        onClick: () => {
          window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: pages[0].id });
          toggleFullscreen(true);
        },
      }, "See as presentation ⛶"));
    }
  } else {
    bar.appendChild(el("button", {
      type: "button",
      className: "btn primary",
      title: "Scrollable full lecture",
      onClick: () => window.__pcsNavigate?.({ kind: item.kind, id: item.id }),
    }, "Open full lecture"));
  }

  bar.appendChild(el("button", {
    type: "button",
    className: "btn btn-print",
    title: "Print or export to PDF",
    onClick: () => window.print(),
  }, "Tisk 🖨"));

  return bar;
}

function lectureHero(item, { compact = false } = {}) {
  const hero = el("div", { className: "item-hero" });
  hero.innerHTML = `
    <h1${compact ? ' style="font-size:var(--fs-xl)"' : ""}>${escapeHtml(item.title)}</h1>
    <div class="meta-row">
      ${badgesHtml(item.tags)}
      ${flavorHtml(item.diff)}
      <span style="color:var(--text-faint);font-size:11px;margin-left:4px">${escapeHtml(item.kind)} · W${item.weekNum}</span>
    </div>
    ${starsHtml(item.relevance, 10, compact ? "bar" : "full")}
    ${!compact && item.desc ? `<p class="desc">${escapeHtml(item.desc)}</p>` : ""}
    ${!compact && item.compare ? `<p class="compare">${escapeHtml(item.compare)}</p>` : ""}
  `;

  // Manual “Studied” toggle — progress source of truth
  const studyRow = el("div", { className: "study-row" });
  const studied = isStudied(item.id);
  const btn = el("button", {
    type: "button",
    className: "btn study-btn" + (studied ? " is-studied" : " primary"),
    title: studied ? "Unmark as studied" : "Mark as studied (manual progress)",
    onClick: () => {
      const now = toggleStudied(item.id);
      btn.classList.toggle("is-studied", now);
      btn.classList.toggle("primary", !now);
      btn.textContent = now ? "✓ Studied" : "Mark studied";
      btn.title = now ? "Unmark as studied" : "Mark as studied (manual progress)";
      try { renderTree(); } catch { /* tree may not care */ }
      // refresh status counts if progress open
      window.__pcsUpdateStatus?.();
    },
  }, studied ? "✓ Studied" : "Mark studied");
  studyRow.appendChild(btn);
  studyRow.appendChild(el("span", { className: "study-hint" },
    studied ? "Counts toward Progress" : "Manual — does not auto-check when you only open",
  ));
  hero.appendChild(studyRow);
  return hero;
}

/**
 * Presentation mode: page index (outline of slides).
 * Replaces the old "item index" as secondary view.
 */
export function showPresentation(itemId) {
  const item = state.itemsById.get(itemId);
  const main = document.getElementById("main");
  if (!item) {
    main.className = "";
    main.innerHTML = `<div class="error-box">Item not found.</div>`;
    return;
  }

  markSeen(item.id);
  const pages = pagesFor(item.path);

  main.className = "lecture-view";
  clear(main);

  const hero = lectureHero(item);
  hero.appendChild(lectureToolbar(item, "presentation"));
  main.appendChild(hero);

  if (!pages.length) {
    main.appendChild(el("p", { className: "desc", style: { padding: "0 28px" } },
      "No page outline available — opening full lecture instead."));
    loadFullContent(item, main);
    return;
  }

  const sec = el("div", { className: "catalog", style: { paddingTop: "4px" } },
    el("div", { className: "catalog-section" },
      el("h2", {}, `Presentation · ${pages.length} slides`),
    ),
  );
  const list = el("div", { className: "page-list" });
  pages.forEach((p, i) => {
    const diff = slideDiff(item.slug, p.id);
    const row = el("button", {
      type: "button",
      className: "page-row",
      onClick: () => window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: p.id }),
    });
    row.innerHTML = `
      <span class="page-num">${String(i + 1).padStart(2, "0")}</span>
      <span class="page-title">${escapeHtml(p.title)}</span>
      ${diff ? flavorHtml(diff) : ""}
    `;
    list.appendChild(row);
  });
  sec.querySelector(".catalog-section").appendChild(list);
  main.appendChild(sec);

  // Quick start first slide
  const start = el("div", { className: "item-actions", style: { padding: "8px 28px 24px" } });
  start.appendChild(el("button", {
    type: "button",
    className: "btn primary",
    onClick: () => window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: pages[0].id }),
  }, "Start presentation"));
  start.appendChild(el("button", {
    type: "button",
    className: "btn primary btn-fullscreen",
    onClick: () => {
      window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: pages[0].id });
      toggleFullscreen(true);
    },
  }, "Start fullscreen ⛶"));
  main.appendChild(start);
}

/** @deprecated alias kept for any leftover imports */
export function showItemIndex(itemId) {
  return showPresentation(itemId);
}

/* ── Single slide (presentation step) ──────────────────── */

export async function showPage(itemId, pageId) {
  const item = state.itemsById.get(itemId);
  const main = document.getElementById("main");
  if (!item) {
    main.innerHTML = `<div class="error-box">Item not found.</div>`;
    return;
  }
  markSeen(item.id);

  // Exercise úkol: show full exercise UI and scroll/focus one task
  if (item.kind === "exercise") {
    const structured = state.exercises[item.path]
      || await fetchAndExtractExercise(item.path).catch(() => null);
    if (structured?.tasks?.length) {
      main.className = "lecture-view exercise-view";
      clear(main);
      renderExerciseView(item, structured, main);
      requestAnimationFrame(() => {
        const node = document.getElementById(pageId);
        if (node) {
          node.classList.add("task-card-focus");
          node.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      return;
    }
  }

  setLoading(true);
  main.className = "lecture-view presentation-page-view";
  clear(main);

  try {
    const slides = await fetchAndExtract(item.path);
    const page = slides.find((s) => s.id === pageId) || slides[0];
    if (!page) {
      main.innerHTML = `<div class="error-box">Page <code>${escapeHtml(pageId)}</code> not found in lecture.</div>`;
      return;
    }

    const hero = lectureHero(item, { compact: true });
    main.appendChild(hero);

    const pages = pagesFor(item.path);
    const idx = pages.findIndex((p) => p.id === pageId);

    const nav = el("div", { className: "item-actions lecture-toolbar", style: { padding: "0 28px 8px" } });
    nav.appendChild(el("button", {
      type: "button", className: "btn primary",
      onClick: () => window.__pcsNavigate?.({ kind: item.kind, id: item.id }),
    }, "Open full lecture"));
    nav.appendChild(el("button", {
      type: "button", className: "btn",
      onClick: () => window.__pcsNavigate?.({ kind: "presentation", id: item.id }),
    }, "All slides"));
    if (idx > 0) {
      nav.appendChild(el("button", {
        type: "button", className: "btn",
        onClick: () => window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: pages[idx - 1].id }),
      }, "← Prev"));
    }
    if (idx >= 0 && idx < pages.length - 1) {
      nav.appendChild(el("button", {
        type: "button", className: "btn",
        onClick: () => window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: pages[idx + 1].id }),
      }, "Next →"));
    }
    nav.appendChild(el("button", {
      type: "button", className: "btn primary btn-fullscreen",
      title: "Celá obrazovka (F)",
      onClick: () => toggleFullscreen(),
    }, "Celá obrazovka ⛶"));
    nav.appendChild(el("button", {
      type: "button", className: "btn btn-print",
      title: "Tisk slajdu / přednášky",
      onClick: () => window.print(),
    }, "Tisk 🖨"));

    if (pages.length) {
      const pos = el("span", {
        className: "slide-pos",
        style: { marginLeft: "auto", fontSize: "12px", color: "var(--text-faint)", alignSelf: "center" },
      }, `${Math.max(idx, 0) + 1} / ${pages.length}`);
      nav.appendChild(pos);
    }
    main.appendChild(nav);

    const slideEl = renderSlide(page, item, idx >= 0 ? idx + 1 : 1);
    main.appendChild(slideEl);
    highlightRoot(slideEl);
  } catch (err) {
    main.innerHTML = `<div class="error-box">Failed to load content.<br/><code>${escapeHtml(err.message)}</code></div>`;
  } finally {
    setLoading(false);
  }
}

/* ── Full lecture / exercise (default open) ────────────── */

export async function showFullContent(itemId) {
  const item = state.itemsById.get(itemId);
  const main = document.getElementById("main");
  if (!item) {
    main.innerHTML = `<div class="error-box">Item not found.</div>`;
    return;
  }
  markSeen(item.id);
  main.className = "lecture-view";
  clear(main);

  // Exercises → structured úkol UI when transform data is available
  if (item.kind === "exercise") {
    const structured = state.exercises[item.path];
    if (structured && structured.tasks?.length) {
      renderExerciseView(item, structured, main);
      return;
    }
  }

  const hero = lectureHero(item);
  hero.appendChild(lectureToolbar(item, "full"));
  main.appendChild(hero);
  await loadFullContent(item, main);
}

/**
 * Structured exercise view: separated úkol cards with prompt / hint / solution.
 */
function renderExerciseView(item, data, main) {
  main.className = "lecture-view exercise-view";

  const hero = lectureHero(item);
  const meta = el("div", { className: "exercise-meta-line" });
  meta.innerHTML = `<span class="task-count-chip">${data.tasks.length} úkolů</span>`;
  hero.appendChild(meta);
  main.appendChild(hero);

  if (data.notes?.length) {
    const notes = el("div", { className: "exercise-notes" });
    for (const n of data.notes) {
      notes.appendChild(el("div", { className: "exercise-note" }, n));
    }
    main.appendChild(notes);
  }

  // TOC of úkols
  const toc = el("nav", { className: "exercise-toc", "aria-label": "Úkoly" });
  toc.innerHTML = `<div class="exercise-toc-label">Obsah</div>`;
  const tocList = el("div", { className: "exercise-toc-list" });
  for (const task of data.tasks) {
    const a = el("a", {
      href: `#${task.id}`,
      className: "exercise-toc-item",
      onClick: (e) => {
        e.preventDefault();
        document.getElementById(task.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    });
    const tS = task.technical_score ?? 1;
    const lS = task.logical_score ?? 1;
    a.innerHTML = `<span class="toc-num">${String(task.num).padStart(2, "0")}</span>` +
      `<span class="toc-text">${escapeHtml(task.summary || task.title)}</span>` +
      `<span class="toc-score-chips"><span class="toc-chip-t" title="Technická obtížnost (T): ${tS}/5">T${tS}</span><span class="toc-chip-l" title="Logická obtížnost (L): ${lS}/5">L${lS}</span></span>`;
    tocList.appendChild(a);
  }
  toc.appendChild(tocList);
  main.appendChild(toc);

  const list = el("div", { className: "exercise-tasks" });
  for (const task of data.tasks) {
    list.appendChild(renderTaskCard(task, item));
  }
  main.appendChild(list);
  highlightRoot(list);
}

function scoreBarsHtml(score, max = 5) {
  let html = '<span class="score-bars" aria-hidden="true">';
  for (let i = 1; i <= max; i++) {
    html += `<i class="score-bar-seg${i <= score ? " on" : ""}"></i>`;
  }
  html += '</span>';
  return html;
}

function renderTaskCard(task, item) {
  const card = el("article", {
    className: "task-card",
    id: task.id,
  });

  const tS = task.technical_score ?? 1;
  const lS = task.logical_score ?? 1;
  const reason = task.challenge_reason || "";

  const head = el("header", { className: "task-card-head" });
  head.innerHTML = `
    <span class="task-num">Úkol ${task.num}</span>
    <h2 class="task-title">${escapeHtml(task.title)}</h2>
    <div class="task-scores" title="${escapeHtml(reason)}">
      <span class="score-badge score-tech" title="Technical Difficulty (T): ${tS}/5 — ${escapeHtml(reason)}">
        <span class="score-label">T</span>
        ${scoreBarsHtml(tS, 5)}
        <span class="score-num">${tS}/5</span>
      </span>
      <span class="score-badge score-log" title="Insight Difficulty (L): ${lS}/5 — ${escapeHtml(reason)}">
        <span class="score-label">L</span>
        ${scoreBarsHtml(lS, 5)}
        <span class="score-num">${lS}/5</span>
      </span>
    </div>
  `;
  card.appendChild(head);

  const prompt = el("div", { className: "task-prompt slide-body" });
  prompt.innerHTML = rewriteContentUrls(task.prompt_html || "", item.path);
  card.appendChild(prompt);

  if (task.hint_html) {
    const det = el("details", { className: "task-details task-hint" });
    det.innerHTML = `<summary>Nápověda</summary><div class="task-details-body slide-body">${rewriteContentUrls(task.hint_html, item.path)}</div>`;
    card.appendChild(det);
  }
  if (task.solution_html) {
    const det = el("details", { className: "task-details task-solution" });
    det.innerHTML = `<summary>Řešení</summary><div class="task-details-body slide-body">${rewriteContentUrls(task.solution_html, item.path)}</div>`;
    card.appendChild(det);
  }

  return card;
}

async function loadFullContent(item, main) {
  setLoading(true);
  try {
    // Runtime fallback: extract .priklad blocks if no transform data
    if (item.kind === "exercise") {
      const live = await fetchAndExtractExercise(item.path);
      if (live?.tasks?.length) {
        renderExerciseView(item, live, main);
        return;
      }
    }

    const slides = await fetchAndExtract(item.path);
    if (!slides.length) {
      main.appendChild(el("div", { className: "error-box" },
        "No content sections found. Raw path: ",
        el("code", {}, item.path),
      ));
      const iframe = el("iframe", {
        src: "/" + item.path.replace(/^\//, ""),
        style: {
          width: "100%",
          height: "70vh",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          margin: "16px",
          background: "var(--editor)",
        },
        title: item.title,
      });
      main.appendChild(iframe);
      return;
    }
    const frag = document.createDocumentFragment();
    const nodes = [];
    slides.forEach((s, i) => {
      const node = renderSlide(s, item, i + 1);
      nodes.push(node);
      frag.appendChild(node);
    });
    main.appendChild(frag);
    for (const node of nodes) highlightRoot(node);
  } catch (err) {
    main.appendChild(el("div", { className: "error-box" },
      "Failed to load: ",
      el("code", {}, err.message),
    ));
  } finally {
    setLoading(false);
  }
}

/** Live parse exercise HTML in the browser (fallback if JSON missing). */
async function fetchAndExtractExercise(path) {
  const url = "/" + path.replace(/^\//, "");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const title = doc.querySelector("h1.lecture-title")?.textContent?.trim() || "";
  const tasks = [];
  doc.querySelectorAll("div.priklad").forEach((block, i) => {
    const id = block.id || `task-${i + 1}`;
    const numM = id.match(/(\d+)$/);
    const num = numM ? parseInt(numM[1], 10) : i + 1;
    const promptEl = block.querySelector(".zadani");
    const prompt = promptEl ? promptEl.innerHTML : block.innerHTML;
    let hint = "";
    let solution = "";
    block.querySelectorAll("details").forEach((d) => {
      const sum = (d.querySelector("summary")?.textContent || "").toLowerCase();
      const body = d.querySelector(".exercise-details-content")?.innerHTML
        || [...d.childNodes].filter((n) => n.nodeType === 1 && n.tagName !== "SUMMARY")
          .map((n) => n.outerHTML || n.textContent).join("");
      if (sum.includes("řeš") || sum.includes("solut") || d.classList.contains("solution")) {
        solution = body;
      } else {
        hint = body;
      }
    });
    const plain = promptEl?.textContent?.replace(/\s+/g, " ").trim() || "";
    tasks.push({
      id,
      num,
      title: `Úkol ${num}`,
      summary: plain.slice(0, 72) + (plain.length > 72 ? "…" : ""),
      prompt_html: prompt,
      hint_html: hint,
      solution_html: solution,
    });
  });
  return { title, notes: [], tasks, task_count: tasks.length, path };
}

function renderSlide(page, item, num) {
  const diff = slideDiff(item.slug, page.id);
  const slide = el("article", {
    className: "slide",
    id: page.id,
  });
  const header = el("div", { className: "slide-header" });
  header.innerHTML = `
    <span class="slide-num">${String(num).padStart(2, "0")}</span>
    <h2 class="slide-title">${escapeHtml(page.title)}</h2>
    ${diff ? flavorHtml(diff) : ""}
  `;
  const body = el("div", { className: "slide-body" });
  body.innerHTML = rewriteContentUrls(page.html, item.path);
  slide.append(header, body);
  return slide;
}

/* ── Fetch / extract ───────────────────────────────────── */

const cache = new Map();

export async function fetchAndExtract(path) {
  if (cache.has(path)) return cache.get(path);

  const url = "/" + path.replace(/^\//, "");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const slides = extractSlides(html);
  cache.set(path, slides);
  return slides;
}

function extractSlides(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const sections = doc.querySelectorAll("section.slide-section, section[id^='id']");
  const slides = [];

  if (sections.length) {
    sections.forEach((sec) => {
      const id = sec.id || `id${slides.length + 1}`;
      const title =
        sec.getAttribute("data-title") ||
        sec.querySelector(".section-title, h2")?.textContent?.trim() ||
        id;
      const body = sec.querySelector(".section-body") || sec;
      slides.push({ id, title, html: body.innerHTML });
    });
    return slides;
  }

  const main =
    doc.querySelector("#contentMain, .content-main, main, article, .slides-container") ||
    doc.body;
  if (main) {
    main.querySelectorAll(
      ".titlebar, .tabbar, .activitybar, .obsah-sidebar, .app-container > .titlebar, script, link, style",
    ).forEach((n) => n.remove());
    slides.push({
      id: "id1",
      title: doc.title || "Content",
      html: main.innerHTML,
    });
  }
  return slides;
}

function rewriteContentUrls(html, lecturePath) {
  const baseDir = lecturePath.replace(/\\/g, "/").replace(/\/[^/]+$/, "/");
  const baseUrl = "/" + baseDir;

  const wrap = document.createElement("div");
  wrap.innerHTML = html;

  wrap.querySelectorAll("[src]").forEach((node) => {
    const src = node.getAttribute("src");
    if (!src || /^(https?:|data:|\/|#)/i.test(src)) return;
    node.setAttribute("src", baseUrl + src.replace(/^\.\//, ""));
  });
  wrap.querySelectorAll("[href]").forEach((node) => {
    const href = node.getAttribute("href");
    if (!href || /^(https?:|mailto:|data:|\/|#)/i.test(href)) return;
    if (href.endsWith(".html") || href.endsWith(".xml")) {
      node.setAttribute("href", baseUrl + href.replace(/^\.\//, ""));
    }
  });

  wrap.querySelectorAll("example").forEach((ex) => {
    const src = ex.getAttribute("src") || "";
    const pre = document.createElement("pre");
    pre.className = "brush: python";
    pre.innerHTML = `<code># example: ${escapeHtml(src)}\n# (source file not inlined in shell)</code>`;
    ex.replaceWith(pre);
  });

  return wrap.innerHTML;
}

/* ── Search / progress ─────────────────────────────────── */

export function showSearchResults(query) {
  const main = document.getElementById("main");
  main.className = "catalog";
  clear(main);

  const q = (query || state.filters.text || "").trim();
  const prev = state.filters.text;
  if (query != null) state.filters.text = query;
  const items = filteredItems();
  if (query != null) state.filters.text = prev;

  main.appendChild(el("div", { className: "catalog-header" },
    el("h1", {}, q ? `Search: “${q}”` : "Search"),
    el("p", { className: "desc" }, `${items.length} matching items`),
  ));

  if (!items.length) {
    main.appendChild(el("p", { className: "desc" }, "No matches. Try a broader query or clear tag filters."));
    return;
  }

  const grid = el("div", { className: "card-grid" });
  for (const item of items) grid.appendChild(itemCard(item));
  main.appendChild(grid);
}

export function showProgress() {
  const main = document.getElementById("main");
  main.className = "catalog progress-view";
  clear(main);

  // Progress counts **studied** (manual Mark studied), not auto-open alone
  const done = (id) => state.studied.has(id);
  const total = state.items.length;
  const studiedN = state.studied.size;
  const pct = total ? Math.round((studiedN / total) * 100) : 0;

  const lectures = state.items.filter((it) => it.kind === "lecture");
  const lecDone = lectures.filter((it) => done(it.id)).length;
  const exercises = state.items.filter((it) => it.kind === "exercise");
  const exTotal = exercises.length;
  const exDone = exercises.filter((it) => done(it.id)).length;
  const exPct = exTotal ? Math.round((exDone / exTotal) * 100) : 0;

  let taskTotal = 0;
  let taskInStudied = 0;
  for (const ex of exercises) {
    const data = state.exercises[ex.path];
    const n = data?.task_count || data?.tasks?.length || 0;
    taskTotal += n;
    if (done(ex.id)) taskInStudied += n;
  }

  const coreItems = state.items.filter((it) => (it.tags || []).includes("Core"));
  const coreDone = coreItems.filter((it) => done(it.id)).length;
  const corePct = coreItems.length ? Math.round((coreDone / coreItems.length) * 100) : 0;

  const level = progressLevel(pct);
  const wrap = el("div", { className: "progress-view" });

  // View toggle bar
  const toggleRow = el("div", { className: "progress-view-toggle-row" });
  toggleRow.innerHTML = `
    <div class="view-toggle-group">
      <button type="button" class="btn view-toggle-btn active" id="btnViewBoard">Deska (Study Board)</button>
      <button type="button" class="btn view-toggle-btn" id="btnViewChecklist">Studijní plán 📋</button>
    </div>
  `;
  wrap.appendChild(toggleRow);

  toggleRow.querySelector("#btnViewChecklist")?.addEventListener("click", () => showChecklist());

  // Hero
  const hero = el("div", { className: "progress-hero" });
  const ring = el("div", {
    className: "progress-ring" + (pct >= 100 ? " complete" : pct >= 50 ? " hot" : ""),
    "aria-label": `${pct} percent studied`,
  });
  ring.innerHTML = `
    <svg viewBox="0 0 36 36" class="progress-ring-svg" aria-hidden="true">
      <path class="progress-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
      <path class="progress-ring-fg" stroke-dasharray="${pct}, 100"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
    </svg>
    <div class="progress-ring-label">
      <strong>${pct}%</strong>
      <span>studied</span>
    </div>
  `;
  const heroText = el("div", { className: "progress-hero-text" });
  heroText.innerHTML = `
    <div class="progress-level-badge">${escapeHtml(level.badge)}</div>
    <h1>Study log</h1>
    <p class="progress-level-name">${escapeHtml(level.name)}</p>
    <p class="progress-vibe">${escapeHtml(vibe)}</p>
    <div class="progress-stats">
      <div class="progress-stat">
        <strong>${studiedN}/${total}</strong><span>studied</span>
      </div>
      <div class="progress-stat">
        <strong>${lecDone}/${lectures.length}</strong><span>lectures</span>
      </div>
      <div class="progress-stat">
        <strong>${exDone}/${exTotal}</strong><span>exercises</span>
      </div>
      <div class="progress-stat">
        <strong>${coreDone}/${coreItems.length}</strong><span>Core</span>
      </div>
      <div class="progress-stat">
        <strong>${taskInStudied}/${taskTotal || "—"}</strong><span>úkolů</span>
      </div>
    </div>
    <div class="progress-dual-bars">
      <div class="progress-core-bar" title="Core path ${corePct}%">
        <div class="progress-core-label"><span>Core path</span><span>${corePct}%</span></div>
        <div class="progress-bar-track"><span class="progress-bar-fill core" style="width:${corePct}%"></span></div>
      </div>
      <div class="progress-core-bar" title="Exercise sets ${exPct}%">
        <div class="progress-core-label"><span>Exercise dojo</span><span>${exPct}%</span></div>
        <div class="progress-bar-track"><span class="progress-bar-fill ex" style="width:${exPct}%"></span></div>
      </div>
    </div>
  `;

  const printProgressBtn = el("button", {
    type: "button",
    className: "btn primary btn-print-progress",
    style: { marginTop: "14px" },
    title: "Vytisknout studijní přehled s plněním (Ctrl+P)",
    onClick: () => window.print(),
  }, "Vytisknout přehled 🖨");
  heroText.appendChild(printProgressBtn);

  hero.append(ring, heroText);
  main.appendChild(hero);

  // Week board: small tiles for lectures, larger for homework sets
  const board = el("div", { className: "study-board" });
  board.innerHTML = `<div class="progress-section-label">Study board · click tile to open · use “Mark studied” on the item</div>`;

  for (const week of state.course?.weeks || []) {
    const weekItems = [...(week.lectures || []), ...(week.exercises || [])]
      .map((it) => state.itemsById.get(it.id) || it);
    if (!weekItems.length) continue;

    const block = el("section", { className: "study-week" });
    const doneN = weekItems.filter((it) => done(it.id)).length;
    const wp = Math.round((doneN / weekItems.length) * 100);
    block.innerHTML = `
      <header class="study-week-head">
        <h2><span class="sw-num">W${week.week}</span> ${escapeHtml(week.title)}</h2>
        <span class="sw-pct">${doneN}/${weekItems.length} · ${wp}%</span>
      </header>
    `;

    const lecs = weekItems.filter((it) => it.kind === "lecture");
    const exs = weekItems.filter((it) => it.kind === "exercise");

    if (lecs.length) {
      const row = el("div", { className: "study-row-label" }, "Lectures");
      block.appendChild(row);
      const tiles = el("div", { className: "study-tiles lectures" });
      for (const it of lecs) {
        tiles.appendChild(studyTile(it, done(it.id), "sm"));
      }
      block.appendChild(tiles);
    }
    if (exs.length) {
      const row = el("div", { className: "study-row-label" }, "Homework & Exercise sets");
      block.appendChild(row);
      const exCards = el("div", { className: "study-exercise-cards" });
      for (const it of exs) {
        exCards.appendChild(detailedExerciseCard(it, done(it.id)));
      }
      block.appendChild(exCards);
    }
    board.appendChild(block);
  }
  main.appendChild(board);

  // Milestones by studied %
  const milestones = [
    { at: 1, label: "First mark", icon: "▶", check: () => studiedN >= 1 },
    { at: 10, label: "10 studied", icon: "10", check: () => pct >= 10 },
    { at: 25, label: "Quarter", icon: "¼", check: () => pct >= 25 },
    { at: 50, label: "Halfway", icon: "½", check: () => pct >= 50 },
    { at: 75, label: "Nearly there", icon: "¾", check: () => pct >= 75 },
    { at: 100, label: "Path cleared", icon: "🏆", check: () => pct >= 100 },
  ];

  const msWrap = el("div", { className: "progress-milestones" });
  msWrap.innerHTML = `<div class="progress-section-label">Milestones</div>`;
  const msRow = el("div", { className: "progress-ms-row" });
  for (const m of milestones) {
    const on = m.check();
    const chip = el("div", {
      className: "progress-ms" + (on ? " unlocked" : ""),
      title: on ? `Unlocked · ${m.label}` : `Study more to unlock`,
    });
    chip.innerHTML = `
      <span class="progress-ms-icon">${m.icon}</span>
      <span class="progress-ms-label">${escapeHtml(m.label)}</span>
      <span class="progress-ms-at">${m.at}%</span>
    `;
    msRow.appendChild(chip);
  }
  msWrap.appendChild(msRow);
  main.appendChild(msWrap);

  const unstudiedEx = exercises
    .filter((it) => !done(it.id))
    .sort((a, b) => {
      const ac = (a.tags || []).includes("Core") ? 0 : 1;
      const bc = (b.tags || []).includes("Core") ? 0 : 1;
      if (ac !== bc) return ac - bc;
      return (a.weekNum - b.weekNum) || b.relevance - a.relevance;
    });

  if (unstudiedEx.length) {
    const nextSec = el("div", { className: "progress-next" });
    nextSec.innerHTML = `<div class="progress-section-label">Next practice (not studied yet)</div>`;
    const nextList = el("div", { className: "progress-ex-list" });
    for (const ex of unstudiedEx.slice(0, 8)) {
      const tasks = state.exercises[ex.path]?.task_count
        || state.exercises[ex.path]?.tasks?.length
        || 0;
      const row = el("button", {
        type: "button",
        className: "progress-ex-row",
        onClick: () => window.__pcsNavigate?.({ kind: "exercise", id: ex.id }),
      });
      row.innerHTML = `
        <span class="pex-week">W${ex.weekNum}</span>
        <span class="pex-title">${escapeHtml(ex.title)}</span>
        <span class="pex-meta">
          ${badgesHtml(ex.tags)}
          ${tasks ? `<span class="task-count-chip">${tasks} úkolů</span>` : ""}
          ${starsHtml(ex.relevance, 10, "compact")}
        </span>
      `;
      nextList.appendChild(row);
    }
    nextSec.appendChild(nextList);
    main.appendChild(nextSec);
  }

  const foot = el("div", { className: "progress-foot" });
  foot.appendChild(el("p", { className: "progress-hint" },
    "Progress uses the manual “Mark studied” button on each lecture/exercise (not auto-open). Saved in localStorage.",
  ));
  foot.appendChild(el("button", {
    type: "button",
    className: "btn primary btn-print-progress",
    onClick: () => window.print(),
  }, "Vytisknout přehled 🖨"));
  foot.appendChild(el("button", {
    type: "button",
    className: "btn progress-reset",
    onClick: () => {
      if (confirm("Clear all studied marks (and open history)?")) {
        state.seen.clear();
        state.studied.clear();
        try {
          localStorage.removeItem("pcs-seen-v1");
          localStorage.removeItem("pcs-studied-v1");
        } catch { /* */ }
        showProgress();
      }
    },
  }, "Reset progress"));
  main.appendChild(foot);
}

function studyTile(item, studied, size) {
  const tasks = item.kind === "exercise"
    ? (state.exercises[item.path]?.task_count || state.exercises[item.path]?.tasks?.length || 0)
    : 0;
  const btn = el("button", {
    type: "button",
    className: `study-tile study-tile-${size} ${item.kind}${studied ? " studied" : ""}`,
    title: `${item.title} — ${studied ? "✓ Studied" : "Not studied"}`,
    onClick: () => window.__pcsNavigate?.({ kind: item.kind, id: item.id }),
  });
  btn.innerHTML = `
    <div class="st-top">
      <span class="st-status-check">${studied ? "✓" : "○"}</span>
      <span class="st-title">${escapeHtml(item.title)}</span>
    </div>
    <div class="st-tags-row">
      ${badgesHtml(item.tags)}
    </div>
    <div class="st-meta">
      ${studied ? "<span class=\"st-check\">✓ SPLNĚNO</span>" : "<span class=\"st-pending\">KE STUDIU</span>"}
      ${tasks ? `<span class="st-tasks">${tasks} úkolů</span>` : ""}
      <span class="st-rel">rel: ${item.relevance ?? "—"}/10</span>
    </div>
  `;
  return btn;
}

function detailedExerciseCard(item, studied) {
  const exData = state.exercises[item.path];
  const tasks = exData?.tasks || [];

  const card = el("div", {
    className: `study-exercise-card${studied ? " studied" : ""}`,
  });

  const head = el("div", {
    className: "sec-head",
    onClick: () => window.__pcsNavigate?.({ kind: item.kind, id: item.id }),
  });
  head.innerHTML = `
    <div class="sec-title-row">
      <span class="st-status-check">${studied ? "✓" : "○"}</span>
      <h3 class="sec-title">${escapeHtml(item.title)}</h3>
      <span class="sec-status-pill">${studied ? "✓ SPLNĚNO" : "KE STUDIU"}</span>
    </div>
    <div class="sec-meta-row">
      ${badgesHtml(item.tags)}
      <span class="sec-meta-item">${tasks.length} úkolů</span>
      <span class="sec-meta-item">rel: ${item.relevance ?? "—"}/10</span>
    </div>
  `;
  card.appendChild(head);

  if (tasks.length) {
    const list = el("div", { className: "study-task-list" });
    for (const t of tasks) {
      const tS = t.technical_score ?? 1;
      const lS = t.logical_score ?? 1;
      const tRow = el("div", { className: "study-task-item" });
      tRow.innerHTML = `
        <div class="sti-top">
          <span class="sti-num">Úkol ${t.num}</span>
          <span class="sti-title">${escapeHtml(t.summary || t.title)}</span>
          <div class="sti-scores">
            <span class="score-chip score-tech" title="Technická obtížnost (T): ${tS}/5 — ${escapeHtml(t.challenge_reason || "")}">T${tS} ${scoreBarsHtml(tS, 5)}</span>
            <span class="score-chip score-log" title="Logická obtížnost (L): ${lS}/5 — ${escapeHtml(t.challenge_reason || "")}">L${lS} ${scoreBarsHtml(lS, 5)}</span>
          </div>
        </div>
      `;
      list.appendChild(tRow);
    }
    card.appendChild(list);
  }

  return card;
}

function progressVibe(pct, studiedN, total) {
  if (total === 0) return "Catalog is empty — run the import tools first.";
  if (studiedN <= 0) return "Nothing marked studied yet — open a topic and hit “Mark studied”.";
  if (pct < 25) return "Warming up… mark Core lectures and homework as you finish them.";
  if (pct < 50) return "Nice study streak — keep clearing homework sets.";
  if (pct < 75) return "Solid log. Prioritize remaining Core + exercises.";
  if (pct < 100) return "Almost done — finish the last unstudied tiles!";
  return "Study log complete 🎉 Everything is marked studied.";
}

function progressLevel(pct) {
  if (pct <= 0) return { badge: "Lv 0", name: "Hello, world" };
  if (pct < 15) return { badge: "Lv 1", name: "REPL tourist" };
  if (pct < 35) return { badge: "Lv 2", name: "Syntax settler" };
  if (pct < 55) return { badge: "Lv 3", name: "Pythonic apprentice" };
  if (pct < 75) return { badge: "Lv 4", name: "Path runner" };
  if (pct < 100) return { badge: "Lv 5", name: "Almost legend" };
  return { badge: "Lv MAX", name: "Course complete" };
}

let activeChecklistLvl = "all";

function getItemLevel(item) {
  const w = item.weekNum || 1;
  if (w <= 2) return "LVL1";
  if (w <= 5) return "LVL2";
  if (w <= 8) return "LVL3";
  return "LVL4";
}

function getItemBadges(item) {
  const badges = [];
  const rel = (item.relevance || 5) * 10;
  if (rel >= 90) badges.push({ text: "MEGA EPIC", cls: "bg-mega-epic" });
  else if (rel >= 70) badges.push({ text: "EPIC", cls: "bg-epic" });

  const tags = item.tags || [];
  if (tags.includes("WOW")) badges.push({ text: "INSIGHT", cls: "bg-insight" });
  if (tags.includes("Legendary")) badges.push({ text: "CHALLENGE", cls: "bg-challenge" });

  if (item.kind === "exercise") badges.push({ text: "PRACTICE", cls: "bg-practice" });
  else badges.push({ text: "SHOWCASE", cls: "bg-showcase" });

  return badges;
}

export function showChecklist() {
  const main = document.getElementById("main");
  if (!main) return;
  main.replaceChildren();

  const wrap = el("div", { className: "progress-view checklist-view" });

  // View toggle bar
  const toggleRow = el("div", { className: "progress-view-toggle-row" });
  toggleRow.innerHTML = `
    <div class="view-toggle-group">
      <button type="button" class="btn view-toggle-btn" id="btnViewBoard">Deska (Study Board)</button>
      <button type="button" class="btn view-toggle-btn active" id="btnViewChecklist">Studijní plán 📋</button>
    </div>
  `;
  wrap.appendChild(toggleRow);

  toggleRow.querySelector("#btnViewBoard")?.addEventListener("click", () => showProgress());

  // Hero header
  const hero = el("div", { className: "checklist-hero" });
  hero.innerHTML = `
    <div class="chk-hero-title">
      <h1>Studijní plán & 4-Úrovňový Checklist 📋</h1>
      <p class="chk-hero-subtitle">Přehled všech lekcí a cvičení Python kurzu rozdělený do 4 úrovní náročnosti (LVL1–LVL4).</p>
    </div>
    <div class="chk-print-actions">
      <button type="button" class="btn primary btn-print-all" title="Vytisknout všechny úrovně (Ctrl+P)">Vytisknout všechny úrovně 🖨</button>
      <button type="button" class="btn secondary btn-print-lvl" title="Vytisknout vybranou úroveň">Vytisknout aktivní úroveň 🖨</button>
    </div>
  `;
  wrap.appendChild(hero);

  hero.querySelector(".btn-print-all")?.addEventListener("click", () => window.print());
  hero.querySelector(".btn-print-lvl")?.addEventListener("click", () => window.print());

  // Level Filter Tabs
  const tabsRow = el("div", { className: "chk-lvl-tabs" });
  const levels = [
    { id: "all", label: "Všechny úrovně (All)" },
    { id: "LVL1", label: "1. TÝDEN - 2. TÝDEN · LVL1 Core" },
    { id: "LVL2", label: "3. TÝDEN - 5. TÝDEN · LVL2 Idiomy" },
    { id: "LVL3", label: "6. TÝDEN - 8. TÝDEN · LVL3 OOP & Mechaniky" },
    { id: "LVL4", label: "9. TÝDEN - 12. TÝDEN · LVL4 Dojo & System" },
  ];

  for (const lvl of levels) {
    const btn = el("button", {
      type: "button",
      className: `chk-lvl-tab${activeChecklistLvl === lvl.id ? " active" : ""}`,
      onClick: () => {
        activeChecklistLvl = lvl.id;
        showChecklist();
      },
    }, lvl.label);
    tabsRow.appendChild(btn);
  }
  wrap.appendChild(tabsRow);

  // Render Weeks & Cards
  const board = el("div", { className: "chk-board" });

  for (const week of state.course?.weeks || []) {
    const weekItems = [...(week.lectures || []), ...(week.exercises || [])]
      .map((it) => state.itemsById.get(it.id) || it)
      .filter((it) => activeChecklistLvl === "all" || getItemLevel(it) === activeChecklistLvl);

    if (!weekItems.length) continue;

    const wBlock = el("section", { className: "chk-week-block" });
    const weekLvl = getItemLevel(weekItems[0]);

    wBlock.innerHTML = `
      <header class="chk-week-head">
        <h2><span class="sw-num">${week.week}. TÝDEN</span> ${escapeHtml(week.title)} <span class="chk-lvl-badge">${weekLvl}</span></h2>
      </header>
    `;

    const grid = el("div", { className: "chk-card-grid" });

    for (const item of weekItems) {
      const isDone = isStudied(item.id);
      const relPct = (item.relevance || 5) * 10;
      const badges = getItemBadges(item);

      const card = el("div", {
        className: `chk-card${isDone ? " studied" : ""}`,
      });

      card.innerHTML = `
        <label class="chk-checkbox-label">
          <input type="checkbox" class="chk-box" ${isDone ? "checked" : ""} />
          <span class="chk-title">${escapeHtml(item.title)}</span>
        </label>
        <div class="chk-badges">
          ${badges.map(b => `<span class="chk-badge ${b.cls}">${b.text}</span>`).join("")}
        </div>
        <div class="chk-sub">
          <span>${item.kind === "exercise" ? "Exercise" : "Lecture"} · ${item.path || ""}</span>
          <div class="chk-rel-wrap" title="Relevance: ${relPct}%">
            <span class="chk-rel-num">${relPct}%</span>
            <div class="chk-rel-bar"><div class="chk-rel-fill" style="width:${relPct}%"></div></div>
          </div>
        </div>
      `;

      // Checkbox click handler
      const chkInput = card.querySelector(".chk-box");
      chkInput?.addEventListener("change", (e) => {
        if (e.target.checked) state.studied.add(item.id);
        else state.studied.delete(item.id);

        try {
          localStorage.setItem("pcs-studied-v1", JSON.stringify(Array.from(state.studied)));
        } catch { /* */ }

        card.classList.toggle("studied", e.target.checked);
      });

      grid.appendChild(card);
    }

    wBlock.appendChild(grid);
    board.appendChild(wBlock);
  }

  wrap.appendChild(board);
  main.appendChild(wrap);
}
