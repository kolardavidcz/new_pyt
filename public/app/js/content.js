/**
 * Python Course Shell — Main Content & Presentation Orchestrator
 * Clean entry point re-exporting public APIs preserving all existing caller signatures.
 */

import {
  state, pagesFor, filteredItems, markSeen,
  isCompleted, cycleStudyStatus, getStudyStatus, getTaskStatus, cycleTaskStatus,
  getCourseStats,
  syncCloudProgress, forceCloudDownload, forceCloudUpload, setCodeBlockColor, logLinkError,
  setPrintWithQuizzes, getQuizFor,
  registerUser, loginWithPassword, resetUserPassword, isAdminUser, syncUsersDbFromCloud,
} from "./state.js";
import { clear, el, starsHtml, scoreBarHtml, badgesHtml, flavorHtml, escapeHtml } from "./ui.js";
import { highlightRoot } from "./highlight.js";
import { renderTree } from "./tree.js";
import { formatInlineCode, isFlexibleCodeFillCorrect, parseQuestionContent } from "./format.js";
import {
  renderQuizSection, openImprovementModal, openPresentationImprovementModal, updatePrintQuizButtons,
} from "./quiz.js";
import { openAdminModal } from "./admin.js";

// Modular Presentation, Catalog, and Slide Rendering imports
import {
  showHome, showWeek, buildWeekCatalogBlock, section, itemCard,
} from "./catalog_view.js";
import {
  showPresentation, showPage, showItemIndex, toggleFullscreen, stepSlide,
} from "./presentation_view.js";
import {
  renderSlide, autoContrastImage, scanAndContrastImages, loadAndInlineExamples,
  fetchAndExtract, rewriteContentUrls, resolvePresentationHref,
  renderRecapReturnBreadcrumb,
} from "./slide_renderer.js";

// Re-export Public APIs for backward compatibility with router, tree, and app
export { showHome, showWeek, buildWeekCatalogBlock, section, itemCard };
export { showPresentation, showPage, showItemIndex, toggleFullscreen, stepSlide };
export {
  renderSlide, autoContrastImage, scanAndContrastImages, loadAndInlineExamples,
  fetchAndExtract, rewriteContentUrls, resolvePresentationHref,
};
export { formatInlineCode, isFlexibleCodeFillCorrect, parseQuestionContent };
export {
  renderQuizSection, openImprovementModal, openPresentationImprovementModal, updatePrintQuizButtons,
};

/* ── Loading Bar Helper ────────────────────────────────── */

export function setLoading(on) {
  const bar = document.getElementById("loadingBar");
  if (!bar) return;
  bar.classList.toggle("active", !!on);
}

/* ── Study Status Controls & Toolbar ────────────────────── */

export function updatePageStudyButtons() {
  const currentTab = state.tabs.find((t) => t.id === state.activeTabId);
  const itemId = currentTab?.itemId;
  if (!itemId) return;
  const item = state.itemsById.get(itemId);
  const isExercise = item?.kind === "exercise" || itemId.startsWith("exercise:");
  const status = getStudyStatus(itemId); // "studied" | "skipped" | "default"

  document.querySelectorAll(".study-cycle-btn, .study-btn, .bottom-nav-study-btn").forEach((btn) => {
    btn.classList.remove("is-studied", "is-skipped");
    if (status === "studied") {
      btn.classList.add("is-studied");
      btn.innerHTML = `<span>✓</span> <span class="status-label">${isExercise ? "Vyřešeno" : "Prostudováno"}</span>`;
      btn.title = `Stav: ${isExercise ? "Vyřešeno" : "Prostudováno"} (1. klik) · Dalším klikem označíte jako Přeskočeno (ovládám)`;
    } else if (status === "skipped") {
      btn.classList.add("is-skipped");
      btn.innerHTML = `<span>↷</span> <span class="status-label">Přeskočeno (ovládám)</span>`;
      btn.title = "Stav: Přeskočeno (ovládám) (2. klik) · Dalším klikem vrátíte do výchozího stavu";
    } else {
      btn.innerHTML = `<span>☐</span> <span class="status-label">${isExercise ? "Označit vyřešeno" : "Označit prostudováno"}</span>`;
      btn.title = `Klikněte pro označení: 1× ${isExercise ? "Vyřešeno" : "Prostudováno"}, 2× Přeskočeno (ovládám), 3× Výchozí`;
    }
  });
}

export function renderStudyActionControl(itemId, { isBottom = false } = {}) {
  const item = state.itemsById.get(itemId);
  const isExercise = item?.kind === "exercise" || (itemId && itemId.startsWith("exercise:"));
  const status = getStudyStatus(itemId);
  const btn = el("button", {
    type: "button",
    className: `btn study-cycle-btn${isBottom ? " bottom-nav-study-btn" : " study-btn"}${status === "studied" ? " is-studied" : status === "skipped" ? " is-skipped" : ""}`,
    title: status === "studied"
      ? `Stav: ${isExercise ? "Vyřešeno" : "Prostudováno"} (1. klik) · Dalším klikem označíte jako Přeskočeno (ovládám)`
      : status === "skipped"
        ? "Stav: Přeskočeno (ovládám) (2. klik) · Dalším klikem vrátíte do výchozího stavu"
        : `Klikněte pro označení: 1× ${isExercise ? "Vyřešeno" : "Prostudováno"}, 2× Přeskočeno (ovládám), 3× Výchozí`,
    onClick: () => {
      cycleStudyStatus(itemId);
      updatePageStudyButtons();
      try { renderTree(); } catch { /* ignore */ }
      window.__pcsUpdateStatus?.();
    },
  });

  if (status === "studied") {
    btn.innerHTML = `<span>✓</span> <span class="status-label">${isExercise ? "Vyřešeno" : "Prostudováno"}</span>`;
  } else if (status === "skipped") {
    btn.innerHTML = `<span>↷</span> <span class="status-label">Přeskočeno (ovládám)</span>`;
  } else {
    btn.innerHTML = `<span>☐</span> <span class="status-label">${isExercise ? "Označit vyřešeno" : "Označit prostudováno"}</span>`;
  }

  return btn;
}

export function lectureToolbar(item, mode) {
  // mode: "full" | "presentation" | "page"
  const pages = pagesFor(item.path);
  const bar = el("div", { className: "item-actions lecture-toolbar" });

  if (mode === "full") {
    const hasSlides = pages.length > 0 || item.kind === "master-lecture" || (item.slug && item.slug.startsWith("lectures--"));
    if (hasSlides) {
      bar.appendChild(el("button", {
        type: "button",
        className: "btn primary",
        title: "Start full screen presentation",
        onClick: () => {
          const firstPageId = pages[0]?.id || "id1";
          window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: firstPageId });
          toggleFullscreen(true);
        },
      }, "See as presentation ⛶"));

      bar.appendChild(el("button", {
        type: "button",
        className: "btn",
        title: "View all slides outline",
        onClick: () => {
          window.__pcsNavigate?.({ kind: "presentation", id: item.id });
        },
      }, "All slides 📋"));
    }
  } else {
    bar.appendChild(el("button", {
      type: "button",
      className: "btn",
      title: "Scrollable full lecture",
      onClick: () => {
        toggleFullscreen(false);
        window.__pcsNavigate?.({ kind: item.kind, id: item.id });
      },
    }, "Open full lecture"));
  }

  if (mode === "full") {
    bar.appendChild(el("button", {
      type: "button",
      className: "btn btn-print",
      title: "Print or export to PDF",
      onClick: () => window.print(),
    }, "Tisk 🖨"));
  }

  // Pinned right after Tisk 🖨: Segmented Studied / Skip Control
  bar.appendChild(renderStudyActionControl(item.id));

  // Navrhnout úpravu button
  bar.appendChild(el("button", {
    type: "button",
    className: "btn btn-suggest-update",
    title: "Navrhnout úpravu obsahu prezentace nebo nahlásit chybu",
    onClick: () => openPresentationImprovementModal(item),
  }, "Navrhnout úpravu"));

  return bar;
}

export function lectureHero(item, { compact = false } = {}) {
  const hero = el("div", { className: "item-hero" });
  const isGray = item.weekNum === 99 || item.week === 99;
  const weekBadge = isGray ? "Gray" : `W${item.weekNum}`;
  hero.innerHTML = `
    <h1${compact ? ' style="font-size:var(--fs-xl)"' : ""}>${escapeHtml(item.title)}</h1>
    <div class="meta-row">
      ${badgesHtml(item.tags)}
      ${flavorHtml(item.diff)}
      <span style="color:var(--text-faint);font-size:11px;margin-left:4px">${escapeHtml(item.kind)} · ${weekBadge}</span>
    </div>
    ${starsHtml(item, 10, compact ? "bar" : "full")}
    ${!compact && item.desc ? `<p class="desc">${escapeHtml(item.desc)}</p>` : ""}
    ${!compact && item.compare ? `<p class="compare">${escapeHtml(item.compare)}</p>` : ""}
  `;
  return hero;
}

export function buildBottomNavBar(item) {
  const items = state.items;
  const idx = items.findIndex((it) => it.id === item.id);
  const prevItem = idx > 0 ? items[idx - 1] : null;
  const nextItem = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null;

  const bar = el("nav", { className: "bottom-nav-bar", "aria-label": "Item navigation" });

  // 1. Previous button
  if (prevItem) {
    const prevBadge = (prevItem.weekNum === 99 || prevItem.week === 99) ? "Gray" : `W${prevItem.weekNum}`;
    const prevBtn = el("button", {
      type: "button",
      className: "btn bottom-nav-btn prev",
      title: `Previous: ${prevItem.title}`,
      onClick: () => window.__pcsNavigate?.({ kind: prevItem.kind, id: prevItem.id }),
    });
    prevBtn.innerHTML = `<span class="nav-arrow">←</span> <span class="nav-label"><strong>${prevBadge}</strong> ${escapeHtml(prevItem.title)}</span>`;
    bar.appendChild(prevBtn);
  } else {
    const disabledPrev = el("button", { type: "button", className: "btn bottom-nav-btn prev disabled", disabled: true });
    disabledPrev.innerHTML = `<span class="nav-arrow">←</span> <span class="nav-label">Start of course</span>`;
    bar.appendChild(disabledPrev);
  }

  // 2. Segmented Study & Skip Action Control
  bar.appendChild(renderStudyActionControl(item.id, { isBottom: true }));

  // 3. Next button
  if (nextItem) {
    const nextBadge = (nextItem.weekNum === 99 || nextItem.week === 99) ? "Gray" : `W${nextItem.weekNum}`;
    const nextBtn = el("button", {
      type: "button",
      className: "btn bottom-nav-btn next",
      title: `Next: ${nextItem.title}`,
      onClick: () => window.__pcsNavigate?.({ kind: nextItem.kind, id: nextItem.id }),
    });
    nextBtn.innerHTML = `<span class="nav-label"><strong>${nextBadge}</strong> ${escapeHtml(nextItem.title)}</span> <span class="nav-arrow">→</span>`;
    bar.appendChild(nextBtn);
  } else {
    const disabledNext = el("button", { type: "button", className: "btn bottom-nav-btn next disabled", disabled: true });
    disabledNext.innerHTML = `<span class="nav-label">End of course 🎉</span> <span class="nav-arrow">→</span>`;
    bar.appendChild(disabledNext);
  }

  return bar;
}

/* ── Full Lecture / Exercise Content (Default Open) ────── */

export async function showFullContent(itemId) {
  const item = state.itemsById.get(itemId);
  const main = document.getElementById("main");
  if (!item) {
    logLinkError({ targetId: itemId, message: `Lecture or exercise item not found: ${itemId}` });
    if (main) main.innerHTML = `<div class="error-box">Item not found: <code>${escapeHtml(itemId)}</code></div>`;
    return;
  }
  markSeen(item.id);
  main.className = "lecture-view";
  clear(main);

  // Exercises → structured úkol UI when transform data is available
  if (item.kind === "exercise") {
    const structured = state.exercises[item.path];
    if (structured && structured.tasks?.length) {
      await renderExerciseView(item, structured, main);
      return;
    }
  }

  const returnBreadcrumb = renderRecapReturnBreadcrumb(item);
  if (returnBreadcrumb) main.appendChild(returnBreadcrumb);

  const hero = lectureHero(item);
  hero.appendChild(lectureToolbar(item, "full"));
  main.appendChild(hero);
  await loadFullContent(item, main);
}

export function updateExerciseMetaProgress(metaEl, tasks) {
  if (!metaEl || !tasks) return;
  const total = tasks.length;
  let solved = 0;
  let skipped = 0;
  for (const t of tasks) {
    const st = getTaskStatus(t.id);
    if (st === "solved") solved++;
    else if (st === "skipped") skipped++;
  }
  const completed = solved + skipped;
  metaEl.innerHTML = `
    <span class="task-count-chip">${total} úkolů</span>
    ${completed > 0 ? `<span class="task-progress-chip ${completed === total ? "complete" : "in-progress"}">${completed === total ? "✓ Vše hotovo" : `${completed}/${total} hotovo`}${completed > 0 ? ` (${solved} vyřešeno, ${skipped} přeskočeno)` : ""}</span>` : ""}
  `;
}

/**
 * Structured exercise view: separated úkol cards with prompt / hint / solution.
 */
export async function renderExerciseView(item, data, main) {
  main.className = "lecture-view exercise-view";

  const hero = lectureHero(item);
  hero.appendChild(lectureToolbar(item, "full"));
  const meta = el("div", { className: "exercise-meta-line" });
  updateExerciseMetaProgress(meta, data.tasks);
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
      id: `toc-${task.id}`,
      onClick: (e) => {
        e.preventDefault();
        document.getElementById(task.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    });
    const tS = task.technical_score ?? 1;
    const lS = task.logical_score ?? 1;
    const tStatus = getTaskStatus(task.id);
    if (tStatus === "solved") a.classList.add("is-solved");
    else if (tStatus === "skipped") a.classList.add("is-skipped");
    a.innerHTML = `<span class="toc-status-icon ${tStatus}">${tStatus === "solved" ? "✓" : tStatus === "skipped" ? "↷" : "○"}</span>` +
      `<span class="toc-num">${String(task.num).padStart(2, "0")}</span>` +
      `<span class="toc-text">${escapeHtml(task.summary || task.title)}</span>` +
      `<span class="toc-score-chips"><span class="toc-chip-t" title="Technická obtížnost (T): ${tS}/5">T${tS}</span><span class="toc-chip-l" title="Logická obtížnost (L): ${lS}/5">L${lS}</span></span>`;
    tocList.appendChild(a);
  }
  toc.appendChild(tocList);
  main.appendChild(toc);

  const onTaskStatusChanged = () => {
    updateExerciseMetaProgress(meta, data.tasks);
  };

  const list = el("div", { className: "exercise-tasks" });
  for (const task of data.tasks) {
    list.appendChild(renderTaskCard(task, item, onTaskStatusChanged));
  }
  main.appendChild(list);
  await loadAndInlineExamples(list);
  highlightRoot(list);
  scanAndContrastImages(list);
  const quizEl = await renderQuizSection(item);
  if (quizEl) main.appendChild(quizEl);
  main.appendChild(buildBottomNavBar(item));
}

function scoreBarsHtml(score, max = 5) {
  let html = '<span class="score-bars" aria-hidden="true">';
  for (let i = 1; i <= max; i++) {
    html += `<i class="score-bar-seg${i <= score ? " on" : ""}"></i>`;
  }
  html += '</span>';
  return html;
}

export function renderTaskCard(task, item, onTaskStatusChanged) {
  const card = el("article", {
    className: "task-card",
    id: task.id,
  });

  const tS = task.technical_score ?? 1;
  const lS = task.logical_score ?? 1;
  const reason = task.challenge_reason || "";
  const taskTags = task.tags?.length ? task.tags : (item.tags || []);
  let tStatus = getTaskStatus(task.id);

  if (tStatus === "solved") card.classList.add("is-solved");
  else if (tStatus === "skipped") card.classList.add("is-skipped");

  const head = el("header", { className: "task-card-head" });
  head.innerHTML = `
    <span class="task-num">Úkol ${task.num}</span>
    <h2 class="task-title">${formatInlineCode(task.title)}</h2>
    ${badgesHtml(taskTags)}
    <div class="task-scores" title="${escapeHtml(reason)}">
      ${scoreBarHtml(tS, 5, "tech")}
      ${scoreBarHtml(lS, 5, "log")}
    </div>
  `;

  const taskBtn = el("button", {
    type: "button",
    className: `task-cycle-btn${tStatus === "solved" ? " is-solved" : tStatus === "skipped" ? " is-skipped" : ""}`,
    title: tStatus === "solved"
      ? "Stav: Vyřešeno (1. klik) · Dalším klikem označíte jako Přeskočeno (ovládám)"
      : tStatus === "skipped"
        ? "Stav: Přeskočeno (ovládám) (2. klik) · Dalším klikem vrátíte do výchozího stavu"
        : "Klikněte pro označení: 1× Vyřešeno, 2× Přeskočeno (ovládám), 3× Výchozí",
    onClick: (e) => {
      e.stopPropagation();
      const next = cycleTaskStatus(task.id);
      tStatus = next;
      card.classList.remove("is-solved", "is-skipped");
      taskBtn.classList.remove("is-solved", "is-skipped");
      if (next === "solved") {
        card.classList.add("is-solved");
        taskBtn.classList.add("is-solved");
        taskBtn.innerHTML = `<span class="tcb-icon">✓</span> <span class="tcb-text">Vyřešeno</span>`;
        taskBtn.title = "Stav: Vyřešeno (1. klik) · Dalším klikem označíte jako Přeskočeno (ovládám)";
      } else if (next === "skipped") {
        card.classList.add("is-skipped");
        taskBtn.classList.add("is-skipped");
        taskBtn.innerHTML = `<span class="tcb-icon">↷</span> <span class="tcb-text">Přeskočeno</span>`;
        taskBtn.title = "Stav: Přeskočeno (ovládám) (2. klik) · Dalším klikem vrátíte do výchozího stavu";
      } else {
        taskBtn.innerHTML = `<span class="tcb-icon">○</span> <span class="tcb-text">K řešení</span>`;
        taskBtn.title = "Klikněte pro označení: 1× Vyřešeno, 2× Přeskočeno (ovládám), 3× Výchozí";
      }

      // Update TOC item if present
      const tocItem = document.getElementById(`toc-${task.id}`);
      if (tocItem) {
        tocItem.classList.remove("is-solved", "is-skipped");
        if (next === "solved") tocItem.classList.add("is-solved");
        else if (next === "skipped") tocItem.classList.add("is-skipped");
        const iconSpan = tocItem.querySelector(".toc-status-icon");
        if (iconSpan) {
          iconSpan.className = `toc-status-icon ${next}`;
          iconSpan.textContent = next === "solved" ? "✓" : next === "skipped" ? "↷" : "○";
        }
      }

      onTaskStatusChanged?.(task, next);
    },
  });

  taskBtn.innerHTML = tStatus === "solved"
    ? `<span class="tcb-icon">✓</span> <span class="tcb-text">Vyřešeno</span>`
    : tStatus === "skipped"
      ? `<span class="tcb-icon">↷</span> <span class="tcb-text">Přeskočeno</span>`
      : `<span class="tcb-icon">○</span> <span class="tcb-text">K řešení</span>`;

  head.appendChild(taskBtn);
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

export async function loadFullContent(item, main) {
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

    // Lazy section mounting for long lectures (> 6 slides)
    const initialBatchSize = slides.length > 6 ? 4 : slides.length;

    for (let i = 0; i < initialBatchSize; i++) {
      const node = renderSlide(slides[i], item, i + 1);
      nodes.push(node);
      frag.appendChild(node);
    }
    main.appendChild(frag);
    await loadAndInlineExamples(main);
    for (const node of nodes) highlightRoot(node);
    scanAndContrastImages(main);

    // Defer mounting remaining offscreen slides
    if (slides.length > initialBatchSize) {
      const remainingContainer = el("div", { className: "deferred-slides-container" });
      main.appendChild(remainingContainer);

      const mountRemaining = async () => {
        const remFrag = document.createDocumentFragment();
        const remNodes = [];
        for (let i = initialBatchSize; i < slides.length; i++) {
          const node = renderSlide(slides[i], item, i + 1);
          remNodes.push(node);
          remFrag.appendChild(node);
        }
        remainingContainer.appendChild(remFrag);
        await loadAndInlineExamples(remainingContainer);
        for (const node of remNodes) highlightRoot(node);
        scanAndContrastImages(remainingContainer);
      };

      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => mountRemaining());
      } else {
        setTimeout(() => mountRemaining(), 50);
      }
    }

    main.appendChild(buildBottomNavBar(item));
    const quizEl = await renderQuizSection(item);
    if (quizEl) {
      const slideText = main.innerText || "";
      if (slideText.trim().length < 600) {
        quizEl.classList.add("compact-lecture-quiz");
      }
      main.appendChild(quizEl);
    }

    // Speculative hover prefetching for in-slide links
    main.querySelectorAll("a.internal-pres-link").forEach((link) => {
      link.addEventListener("pointerenter", () => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#/")) {
          const targetId = href.replace(/^#\//, "").split("?")[0].split("#")[0];
          const targetItem = state.itemsById?.get(targetId) || state.itemsById?.get("lecture:" + targetId);
          if (targetItem) {
            if (targetItem.path) fetchAndExtract(targetItem.path).catch(() => {});
            if (targetItem.id) getQuizFor(targetItem).catch(() => {});
          }
        }
      }, { once: true, passive: true });
    });
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
export async function fetchAndExtractExercise(path) {
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

/* ── Search Results View ───────────────────────────────── */

export function showSearchResults(query) {
  const main = document.getElementById("main");
  if (!main) return;
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

/* ── Printable Course Plan ─────────────────────────────── */

export function printCoursePlan() {
  const isDone = (id) => isCompleted(id);
  const allWeeks = state.course?.weeks || [];

  // 1. W1..W12 sorted numerically
  const semesterWeeks = allWeeks
    .filter((w) => w.week >= 1 && w.week <= 12)
    .sort((a, b) => a.week - b.week);

  // 2. W0 placed at the very end
  const week0 = allWeeks.find((w) => w.week === 0);

  // 3. Complete ordered list (excluding W99)
  const orderedWeeks = [...semesterWeeks, ...(week0 ? [week0] : [])];

  const weekMap = new Map();
  let totalLecs = 0;
  let totalExs = 0;
  let totalStudied = 0;

  for (const week of orderedWeeks) {
    const weekItems = [
      ...(week.lectures || []).filter((l) => !l.tags?.includes("Skip")),
      ...(week.exercises || []),
    ].map((it) => state.itemsById.get(it.id) || it);

    if (weekItems.length) {
      weekMap.set(week, weekItems);
      totalLecs += weekItems.filter((i) => i.kind === "lecture").length;
      totalExs += weekItems.filter((i) => i.kind === "exercise").length;
      totalStudied += weekItems.filter((i) => isDone(i.id)).length;
    }
  }

  const totalItems = totalLecs + totalExs;
  const pct = totalItems > 0 ? Math.round((totalStudied / totalItems) * 100) : 0;

  const output = el("div", { className: "print-tier-output", id: "printTierOutput" });

  const header = el("div", { className: "print-tier-header" });
  header.innerHTML = `
    <h1>Python Study Plan — Kompletní kurikulum (W1–W12 + W0)</h1>
    <p class="tier-subtitle">Strukturovaný přehled přednášek a praktických cvičení pro studenty VŠCHT Praha</p>
    <p class="tier-stats">${totalLecs} přednášek · ${totalExs} cvičení · ${totalStudied}/${totalItems} hotovo (${pct}%) · Vygenerováno ${new Date().toLocaleDateString("cs-CZ")}</p>
  `;
  output.appendChild(header);

  for (const [week, weekItems] of weekMap) {
    const lecs = weekItems.filter((it) => it.kind === "lecture");
    const exs = weekItems.filter((it) => it.kind === "exercise");

    const sectionEl = el("div", { className: "print-tier-week" });
    const head = el("div", { className: "print-tier-week-head" });
    const weekLabel = week.week === 0 ? "W0 (Nástroje)" : `W${week.week}`;
    head.textContent = `${weekLabel} · ${week.title}`;
    sectionEl.appendChild(head);

    const cols = el("div", { className: "print-tier-cols" });

    function renderRow(item) {
      const done = isDone(item.id);
      const exData = item.kind === "exercise" ? state.exercises[item.path] : null;
      const tagBadges = (item.tags || []).map((t) => `<span class="ptr-badge ptr-badge-${escapeHtml(t)}">${escapeHtml(t)}</span>`).join("");
      const relBar = starsHtml(item.relevance || 5, 10, "compact");
      let scoreBars = "";
      if (exData?.tasks?.length) {
        const avgT = Math.round(exData.tasks.reduce((s, t) => s + (t.technical_score || 1), 0) / exData.tasks.length);
        const avgL = Math.round(exData.tasks.reduce((s, t) => s + (t.logical_score || 1), 0) / exData.tasks.length);
        scoreBars = `${scoreBarHtml(avgT, 5, "tech")} ${scoreBarHtml(avgL, 5, "log")}`;
      }

      return `
        <div class="print-tier-row">
          <div class="ptr-chk${done ? " done" : ""}"></div>
          <span class="ptr-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
          <span class="ptr-badges">${tagBadges}</span>
          <span class="ptr-bars">${relBar}${scoreBars ? " " + scoreBars : ""}</span>
        </div>
      `;
    }

    const lecCol = el("div", { className: "print-tier-col" });
    lecCol.innerHTML = `<div class="print-tier-col-title">Lectures (${lecs.length})</div>` + (lecs.length ? lecs.map(renderRow).join("") : `<div class="ptr-empty">—</div>`);

    const exCol = el("div", { className: "print-tier-col" });
    exCol.innerHTML = `<div class="print-tier-col-title">Exercises (${exs.length})</div>` + (exs.length ? exs.map(renderRow).join("") : `<div class="ptr-empty">—</div>`);

    cols.append(lecCol, exCol);
    sectionEl.appendChild(cols);
    output.appendChild(sectionEl);
  }

  document.body.appendChild(output);
  document.body.classList.add("printing-tier");

  const prevTitle = document.title;
  document.title = "Python Study Plan — Kompletní kurikulum (W1–W12, W0)";

  window.addEventListener("afterprint", function cleanup() {
    document.body.classList.remove("printing-tier");
    output.remove();
    document.title = prevTitle;
    window.removeEventListener("afterprint", cleanup);
  }, { once: true });

  window.print();
}

if (typeof window !== "undefined") {
  window.printCoursePlan = printCoursePlan;
  window.printTier = printCoursePlan;
}

/* ── Progress Dashboard ────────────────────────────────── */

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

function studyTile(item, doneStatus, size) {
  const isExercise = item.kind === "exercise";
  const tasks = isExercise
    ? (state.exercises[item.path]?.task_count || state.exercises[item.path]?.tasks?.length || 0)
    : 0;
  const status = getStudyStatus(item.id);

  const doneTooltip = isExercise ? "✓ Vyřešeno (1. klik)" : "✓ Prostudováno (1. klik)";
  const btn = el("div", {
    className: `study-tile study-tile-${size} ${item.kind}${status === "studied" ? " studied" : status === "skipped" ? " skipped" : ""}`,
    title: `${item.title} — ${status === "studied" ? doneTooltip : status === "skipped" ? "↷ Přeskočeno (ovládám) (2. klik)" : (isExercise ? "K řešení (klikněte pro označení)" : "Ke studiu (klikněte pro označení)")}`,
  });

  const statusBadge = status === "studied"
    ? `<span class="st-check">${isExercise ? "✓ VYŘEŠENO" : "✓ PROSTUDOVÁNO"}</span>`
    : status === "skipped"
      ? '<span class="st-skip-check">↷ PŘESKOČENO</span>'
      : `<span class="st-pending">☐ ${isExercise ? "K ŘEŠENÍ" : "KE STUDIU"}</span>`;

  btn.innerHTML = `
    <div class="st-top">
      <div class="st-tile-actions">
        <button type="button" class="st-action-mini st-cycle-mini ${status === 'studied' ? 'btn-mini-done active' : status === 'skipped' ? 'btn-mini-skip active' : ''}" title="Klikněte pro změnu stavu: 1× ${isExercise ? 'Vyřešeno' : 'Prostudováno'}, 2× Přeskočeno (ovládám), 3× Výchozí">${status === 'studied' ? '✓' : status === 'skipped' ? '↷' : '○'}</button>
      </div>
      <span class="st-title" style="cursor:pointer">${escapeHtml(item.title)}</span>
    </div>
    <div class="st-tags-row">
      ${badgesHtml(item.tags)}
    </div>
    <div class="st-meta">
      ${statusBadge}
      ${tasks ? `<span class="st-tasks">${tasks} úkolů</span>` : ""}
      ${starsHtml(item.relevance || 5, 10, "compact")}
    </div>
  `;

  btn.querySelector(".st-title")?.addEventListener("click", () => {
    window.__pcsNavigate?.({ kind: item.kind, id: item.id });
  });

  btn.querySelector(".st-cycle-mini")?.addEventListener("click", (e) => {
    e.stopPropagation();
    cycleStudyStatus(item.id);
    try { renderTree(); } catch { /* ignore */ }
    window.__pcsUpdateStatus?.();
    showProgress();
  });

  return btn;
}

function detailedExerciseCard(item, doneStatus) {
  const exData = state.exercises[item.path];
  const tasks = exData?.tasks || [];
  const status = getStudyStatus(item.id);

  const card = el("div", {
    className: `study-exercise-card${status === "studied" ? " studied" : status === "skipped" ? " skipped" : ""}`,
  });

  const head = el("div", {
    className: "sec-head",
  });
  head.innerHTML = `
    <div class="sec-title-row">
      <span class="st-status-check" style="cursor:pointer" title="Klikněte pro změnu stavu: 1× Vyřešeno, 2× Přeskočeno (ovládám), 3× Výchozí">${status === "studied" ? "✓" : status === "skipped" ? "↷" : "○"}</span>
      <h3 class="sec-title" style="cursor:pointer">${formatInlineCode(item.title)}</h3>
      <button type="button" class="sec-status-pill" style="cursor:pointer;border:none;font:inherit;background:rgba(110,118,129,0.2);color:var(--text-faint)" title="Klikněte pro změnu stavu: 1× Vyřešeno, 2× Přeskočeno (ovládám), 3× Výchozí">${status === "studied" ? "✓ VYŘEŠENO" : status === "skipped" ? "↷ PŘESKOČENO" : "K ŘEŠENÍ"}</button>
    </div>
    <div class="sec-meta-row">
      ${badgesHtml(item.tags)}
      <span class="sec-meta-item">${tasks.length} úkolů</span>
      ${starsHtml(item.relevance || 5, 10, "compact")}
    </div>
  `;

  head.querySelector(".sec-title")?.addEventListener("click", () => {
    window.__pcsNavigate?.({ kind: item.kind, id: item.id });
  });

  const triggerCycle = (e) => {
    e.stopPropagation();
    cycleStudyStatus(item.id);
    try { renderTree(); } catch { /* ignore */ }
    window.__pcsUpdateStatus?.();
    showProgress();
  };

  head.querySelector(".sec-status-pill")?.addEventListener("click", triggerCycle);
  head.querySelector(".st-status-check")?.addEventListener("click", triggerCycle);

  card.appendChild(head);

  if (tasks.length) {
    const list = el("div", { className: "study-task-list" });
    for (const t of tasks) {
      const tS = t.technical_score ?? 1;
      const lS = t.logical_score ?? 1;
      const tStatus = getTaskStatus(t.id);
      const tRow = el("div", { className: `study-task-item${tStatus === "solved" ? " is-solved" : tStatus === "skipped" ? " is-skipped" : ""}` });
      tRow.innerHTML = `
        <div class="sti-top">
          <span class="sti-status-icon ${tStatus}">${tStatus === "solved" ? "✓" : tStatus === "skipped" ? "↷" : "○"}</span>
          <span class="sti-num">Úkol ${t.num}</span>
          <span class="sti-title">${formatInlineCode(t.summary || t.title)}</span>
          <div class="sti-scores">
            ${scoreBarHtml(tS, 5, "tech")}
            ${scoreBarHtml(lS, 5, "log")}
          </div>
        </div>
      `;
      list.appendChild(tRow);
    }
    card.appendChild(list);
  }

  return card;
}

export function showProgress() {
  const main = document.getElementById("main");
  if (!main) return;
  main.className = "catalog progress-view";
  clear(main);

  const stats = getCourseStats();
  const pct = stats.total.pct;
  const wrap = el("div", { className: "progress-view" });

  // Hero
  const hero = el("div", { className: "progress-hero" });
  const ring = el("div", {
    className: "progress-ring" + (pct >= 100 ? " complete" : pct >= 50 ? " hot" : ""),
    "aria-label": `${pct} percent completed`,
  });
  ring.innerHTML = `
    <svg viewBox="0 0 36 36" class="progress-ring-svg" aria-hidden="true">
      <path class="progress-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
      <path class="progress-ring-fg" stroke-dasharray="${pct}, 100"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
    </svg>
    <div class="progress-ring-label">
      <strong>${pct}%</strong>
      <span>hotovo</span>
    </div>
  `;
  const heroText = el("div", { className: "progress-hero-text" });
  heroText.innerHTML = `
    <div class="progress-stats">
      <div class="progress-stat" title="Celkem splněno (prostudováno + přeskočeno)">
        <strong>${stats.total.completed}/${stats.total.total}</strong><span>splněno</span>
      </div>
      <div class="progress-stat" title="Aktivní přednášky v semestru">
        <strong>${stats.lectures.completed}/${stats.lectures.total}</strong><span>přednášek</span>
      </div>
      <div class="progress-stat" title="Praktická cvičení">
        <strong>${stats.exercises.completed}/${stats.exercises.total}</strong><span>cvičení</span>
      </div>
      <div class="progress-stat" title="Přeskočená témata (známá z C/Javy)">
        <strong>${stats.total.skipped}</strong><span>přeskočeno</span>
      </div>
    </div>
    <div class="progress-dual-bars">
      <div class="progress-core-bar" title="Přednášky ${stats.lectures.pct}%">
        <div class="progress-core-label"><span>Přednášky (aktivní)</span><span>${stats.lectures.pct}%</span></div>
        <div class="progress-bar-track"><span class="progress-bar-fill core" style="width:${stats.lectures.pct}%"></span></div>
      </div>
      <div class="progress-core-bar" title="Cvičení ${stats.exercises.pct}%">
        <div class="progress-core-label"><span>Cvičení & Úlohy</span><span>${stats.exercises.pct}%</span></div>
        <div class="progress-bar-track"><span class="progress-bar-fill ex" style="width:${stats.exercises.pct}%"></span></div>
      </div>
    </div>
  `;

  // Single Print Button for W1..W12 + W0
  const printGroup = el("div", { className: "print-tier-buttons" });
  const btn = el("button", {
    type: "button",
    className: "btn primary",
    title: "Vytisknout kompletní studijní plán (W1–W12 + W0)",
    onClick: () => printCoursePlan(),
  }, "Vytisknout studijní plán (W1–W12, W0) 🖨");
  printGroup.appendChild(btn);
  heroText.appendChild(printGroup);

  hero.append(ring, heroText);
  wrap.appendChild(hero);

  // Week board: small tiles for lectures, larger for homework sets
  const board = el("div", { className: "study-board" });
  board.innerHTML = `<div class="progress-section-label">Study board · kliknutím otevřete téma · možnost označit „Prostudováno ✓“ nebo „Přeskočit ↷“</div>`;

  for (const week of state.course?.weeks || []) {
    const isShelf = week.week >= 90;
    const weekItems = [...(week.lectures || []).filter(l => isShelf || !l.tags?.includes("Skip")), ...(week.exercises || [])]
      .map((it) => state.itemsById.get(it.id) || it);
    if (!weekItems.length) continue;

    const block = el("section", { className: "study-week" });
    const doneN = weekItems.filter((it) => isCompleted(it.id)).length;
    const wp = Math.round((doneN / weekItems.length) * 100);
    const weekBadge = "W" + week.week;
    block.innerHTML = `
      <header class="study-week-head">
        <h2><span class="sw-num">${weekBadge}</span> ${escapeHtml(week.title)}</h2>
        <span class="sw-pct">${doneN}/${weekItems.length} · ${wp}%</span>
      </header>
    `;

    const lecs = weekItems.filter((it) => it.kind === "lecture");
    const exs = weekItems.filter((it) => it.kind === "exercise");

    if (week.shelves && week.shelves.length) {
      const matchedSlugs = new Set();
      for (const shelf of week.shelves) {
        const shelfLectures = lecs.filter((it) => {
          const matches = (shelf.slugs || []).some(s => (it.slug || "").includes(s) || (it.path || "").includes(s));
          if (matches) matchedSlugs.add(it.id);
          return matches;
        });
        if (shelfLectures.length) {
          const row = el("div", { className: "study-row-label", style: "margin-top:14px;color:var(--text-bright);font-weight:600" }, `${shelf.icon || "📁"} ${shelf.title}`);
          block.appendChild(row);
          const tiles = el("div", { className: "study-tiles lectures" });
          for (const it of shelfLectures) {
            tiles.appendChild(studyTile(it, isCompleted(it.id), "sm"));
          }
          block.appendChild(tiles);
        }
      }
      const remLecs = lecs.filter(it => !matchedSlugs.has(it.id));
      if (remLecs.length) {
        const row = el("div", { className: "study-row-label" }, "Ostatní témata");
        block.appendChild(row);
        const tiles = el("div", { className: "study-tiles lectures" });
        for (const it of remLecs) {
          tiles.appendChild(studyTile(it, isCompleted(it.id), "sm"));
        }
        block.appendChild(tiles);
      }
    } else {
      if (lecs.length) {
        const row = el("div", { className: "study-row-label" }, "Přednášky");
        block.appendChild(row);
        const tiles = el("div", { className: "study-tiles lectures" });
        for (const it of lecs) {
          tiles.appendChild(studyTile(it, isCompleted(it.id), "sm"));
        }
        block.appendChild(tiles);
      }
    }
    if (exs.length) {
      const row = el("div", { className: "study-row-label" }, "Cvičení a programátorské úlohy");
      block.appendChild(row);
      const exCards = el("div", { className: "study-exercise-cards" });
      for (const it of exs) {
        exCards.appendChild(detailedExerciseCard(it, isCompleted(it.id)));
      }
      block.appendChild(exCards);
    }

    board.appendChild(block);
  }

  wrap.appendChild(board);

  // Milestones by studied %
  const milestones = [
    { at: 1, label: "First mark", icon: "▶", check: () => stats.total.completed >= 1 },
    { at: 10, label: "10 completed", icon: "10", check: () => pct >= 10 },
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
  wrap.appendChild(msWrap);

  const allExercises = (state.items || []).filter((it) => it.kind === "exercise");
  const uncompletedEx = allExercises
    .filter((it) => !isCompleted(it.id))
    .sort((a, b) => {
      const ac = (a.tags || []).includes("Core") ? 0 : 1;
      const bc = (b.tags || []).includes("Core") ? 0 : 1;
      if (ac !== bc) return ac - bc;
      return (a.weekNum - b.weekNum) || b.relevance - a.relevance;
    });

  if (uncompletedEx.length) {
    const nextSec = el("div", { className: "progress-next" });
    nextSec.innerHTML = `<div class="progress-section-label">Doporučená cvičení k vyřešení</div>`;
    const nextList = el("div", { className: "progress-ex-list" });
    for (const ex of uncompletedEx.slice(0, 8)) {
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
    wrap.appendChild(nextSec);
  }

  const foot = el("div", { className: "progress-foot" });
  foot.appendChild(el("p", { className: "progress-hint" },
    "Progress uses the manual “Mark studied” button on each lecture/exercise (not auto-open). Saved in localStorage.",
  ));
  foot.appendChild(el("button", {
    type: "button",
    className: "btn progress-reset",
    onClick: () => {
      if (confirm("Resetovat veškerý studijní postup a historii?")) {
        state.seen.clear();
        state.studied.clear();
        state.skipped.clear();
        try {
          localStorage.removeItem("pcs-seen-v1");
          localStorage.removeItem("pcs-studied-v1");
          localStorage.removeItem("pcs-skipped-v1");
        } catch { /* ignore */ }
        showProgress();
        try { renderTree(); } catch { /* ignore */ }
        window.__pcsUpdateStatus?.();
      }
    },
  }, "Reset progress"));
  wrap.appendChild(foot);
  main.appendChild(wrap);
}

/* ── Dedicated Login & Account Profile Command Center ────── */

export function showLogin(reason = null) {
  syncUsersDbFromCloud().catch(() => {});
  const profileModal = document.getElementById("profileModal");
  if (!profileModal) return;

  const cardContainer = profileModal.querySelector("#profileModalCard") || profileModal.querySelector(".profile-modal-card");
  if (!cardContainer) return;

  clear(cardContainer);
  const u = state.user;

  if (u) {
    cardContainer.appendChild(renderUserProfileDashboard(u));
  } else {
    cardContainer.appendChild(renderLoginForm(reason));
  }

  profileModal.classList.remove("hidden");
}

export function renderUserProfileDashboard(u) {
  const items = state.items || [];
  const total = items.length;
  const studiedCount = state.studied.size;
  const pct = total > 0 ? Math.round((studiedCount / total) * 100) : 0;
  const initials = (u.name || u.username)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isAdmin = isAdminUser(u);

  const card = el("div", { className: "v2-card", style: "width:100%; border:none; padding:0; background:transparent;" });
  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle, #333); padding-bottom:10px; margin-bottom:14px;">
      <h3 style="margin:0; font-size:15px; font-weight:600; color:var(--fg);">Uživatelský profil</h3>
      <button type="button" class="icon-btn" id="btnCloseProfileModal" title="Zavřít" style="background:transparent; border:none; color:var(--fg-muted); cursor:pointer; font-size:16px;">✕</button>
    </div>

    <div class="v2-identity">
      <div class="v2-avatar">${escapeHtml(initials)}</div>
      <div>
        <div class="v2-identity-name">${escapeHtml(u.name || u.username)}</div>
        <div class="v2-identity-meta">${escapeHtml(u.email || u.username + "@vscht.cz")} · VŠCHT Praha</div>
      </div>
    </div>

    <div class="v2-status-line">
      <span class="ok">✓</span> Prostudováno <span class="num">${studiedCount}</span> z <span class="num">${total}</span> kapitol · <span class="num">${pct} %</span> splněno
    </div>

    <div class="v2-row">
      <span class="v2-row-icon" style="color:#38bdf8">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4.5 12.5h7a2.5 2.5 0 0 0 .3-4.98A3.5 3.5 0 0 0 5.2 6.06 2.75 2.75 0 0 0 4.5 12.5z"/></svg>
      </span>
      <div class="v2-row-main">
        <strong>Cloudová synchronizace</strong>
        <span>${state.lastSyncTime ? `Naposledy: ${new Date(state.lastSyncTime).toLocaleTimeString("cs-CZ")} (LWW merge)` : "Zatím nesynchronizováno (LWW merge)"}</span>
      </div>
      <button type="button" class="btn secondary sm" id="btnManualSync">Synchronizovat 🔄</button>
    </div>

    <details style="margin:2px 0 10px; padding:6px 8px; background:rgba(255,255,255,0.03); border-radius:4px; border:1px solid var(--border-subtle, #333);">
      <summary style="font-size:11px; color:var(--text-muted, #888); cursor:pointer; font-weight:500;">Pokročilá synchronizace (Ruční přepsání)</summary>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button type="button" class="btn secondary sm" id="btnForceDownload" style="flex:1; font-size:11px;" title="Přepíše lokální stav nejnovějšími daty ze serveru">Stáhnout z cloudu ⬇️</button>
        <button type="button" class="btn secondary sm" id="btnForceUpload" style="flex:1; font-size:11px;" title="Přepíše data na serveru aktuálním stavem z tohoto zařízení">Odeslat do cloudu ⬆️</button>
      </div>
    </details>

    <div class="v2-row">
      <span class="v2-row-icon" style="color:#569cd6">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3" width="12" height="8" rx="1"/><path d="M6 13.5h4M8 11v2.5"/></svg>
      </span>
      <div class="v2-row-main">
        <strong>Barevné schéma pro tisk</strong>
        <span>Vzhled ukázek kódu v PDF exportu</span>
      </div>
      <select id="selectCodeBlockColor" class="v2-select">
        <option value="dark" ${state.codeBlockColor === "dark" ? "selected" : ""}>Tmavé</option>
        <option value="light" ${state.codeBlockColor === "light" ? "selected" : ""}>Světlé</option>
      </select>
    </div>

    <div class="v2-row">
      <span class="v2-row-icon" style="color:#4ec9b0">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 2h5l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M9 2v3h3M5.5 8h5M5.5 10.5h5"/></svg>
      </span>
      <div class="v2-row-main">
        <strong>Zahrnout kvízy do tisku</strong>
        <span>Připojit kontrolní otázky na konec PDF materiálů</span>
      </div>
      <select id="selectPrintWithQuizzes" class="v2-select">
        <option value="true" ${state.printWithQuizzes ? "selected" : ""}>Ano</option>
        <option value="false" ${!state.printWithQuizzes ? "selected" : ""}>Ne</option>
      </select>
    </div>

    ${isAdmin ? `
      <div style="margin-top:14px;">
        <button type="button" class="btn primary sm v2-submit" id="btnProfileOpenAdmin" style="width:100%; font-weight:600;">Otevřít správu kurzu (Admin)</button>
      </div>
    ` : ""}

    <div class="v2-actions" style="margin-top:14px;">
      <button type="button" class="btn danger" id="btnPageLogout">Odhlásit se</button>
    </div>
  `;

  // Bind dashboard events
  const profileModal = document.getElementById("profileModal");
  card.querySelector("#btnCloseProfileModal")?.addEventListener("click", () => {
    profileModal?.classList.add("hidden");
  });

  card.querySelector("#btnManualSync")?.addEventListener("click", async (e) => {
    const syncBtn = e.currentTarget;
    syncBtn.textContent = "Synchronizuji…";
    syncBtn.disabled = true;
    await syncCloudProgress();
    syncBtn.textContent = "Synchronizováno ✓";
    setTimeout(() => {
      syncBtn.textContent = "Synchronizovat 🔄";
      syncBtn.disabled = false;
      showLogin();
    }, 1000);
  });

  card.querySelector("#btnForceDownload")?.addEventListener("click", async (e) => {
    const dlBtn = e.currentTarget;
    dlBtn.textContent = "Stahuji…";
    dlBtn.disabled = true;
    const ok = await forceCloudDownload();
    dlBtn.textContent = ok ? "Stáhnuto ✓" : "Chyba ✕";
    setTimeout(() => { showLogin(); }, 900);
  });

  card.querySelector("#btnForceUpload")?.addEventListener("click", async (e) => {
    const upBtn = e.currentTarget;
    upBtn.textContent = "Odesílám…";
    upBtn.disabled = true;
    const ok = await forceCloudUpload();
    upBtn.textContent = ok ? "Odesláno ✓" : "Chyba ✕";
    setTimeout(() => { showLogin(); }, 900);
  });

  card.querySelector("#selectCodeBlockColor")?.addEventListener("change", (e) => {
    setCodeBlockColor(e.target.value);
  });

  card.querySelector("#selectPrintWithQuizzes")?.addEventListener("change", (e) => {
    setPrintWithQuizzes(e.target.value === "true");
    updatePrintQuizButtons();
  });

  card.querySelector("#btnProfileOpenAdmin")?.addEventListener("click", () => {
    profileModal?.classList.add("hidden");
    openAdminModal();
  });

  card.querySelector("#btnPageLogout")?.addEventListener("click", () => {
    logoutUser();
    showLogin();
  });

  return card;
}

export function renderLoginForm(reason = null) {
  const card = el("div", { className: "v2-card", style: "width:100%; border:none; padding:0; background:transparent;" });
  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle, #333); padding-bottom:10px; margin-bottom:14px;">
      <h3 style="margin:0; font-size:15px; font-weight:600; color:var(--fg);">Přihlášení k účtu</h3>
      <button type="button" class="icon-btn" id="btnCloseProfileModal" title="Zavřít" style="background:transparent; border:none; color:var(--fg-muted); cursor:pointer; font-size:16px;">✕</button>
    </div>

    ${reason ? `
      <div style="font-size:12.5px; color:var(--accent, #38bdf8); background:rgba(56,189,248,0.1); border-left:3px solid var(--accent, #38bdf8); padding:9px 12px; margin-bottom:14px; border-radius:4px; line-height:1.4;">
        ℹ️ ${escapeHtml(reason)}
      </div>
    ` : ""}

    <p class="v2-desc" style="margin-top:0;">Zadejte své školní údaje (@vscht.cz) pro synchronizaci postupu napříč zařízeními.</p>

    <!-- Tab Switcher -->
    <div class="login-tab-bar" style="display:flex; gap:6px; margin-bottom:14px;">
      <button type="button" class="btn primary sm tab-btn active" id="tabBtnLogin" style="flex:1;">Přihlášení</button>
      <button type="button" class="btn secondary sm tab-btn" id="tabBtnRegister" style="flex:1;">Registrace</button>
      <button type="button" class="btn secondary sm tab-btn" id="tabBtnReset" style="flex:1;">Obnovení hesla</button>
    </div>

    <!-- 1. Login Form (Email @vscht.cz + Password) -->
    <form id="pageLoginForm" class="v2-form">
      <div id="loginErrorBanner" style="display:none; font-size:11.5px; color:#ef4444; background:rgba(239,68,68,0.1); padding:8px 10px; border-left:2px solid #ef4444;"></div>

      <div class="v2-field">
        <label>Školní e-mail (@vscht.cz) nebo přihlašovací jméno</label>
        <input type="text" id="pageInputEmail" placeholder="např. novakj nebo novakj@vscht.cz" required autocomplete="username" />
      </div>

      <div class="v2-field">
        <label>Heslo</label>
        <input type="password" id="pageInputPassword" placeholder="Zadejte heslo..." required autocomplete="current-password" />
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
        <button type="button" id="btnGuestContinue" style="background:none; border:none; color:var(--fg-muted, var(--text-muted)); font-size:11px; cursor:pointer; text-decoration:underline; padding:0;">Pokračovat jako host (bez přihlášení)</button>
        <button type="button" id="btnGoToReset" style="background:none; border:none; color:var(--accent); font-size:11px; cursor:pointer; text-decoration:underline; padding:0;">Zapomněli jste heslo?</button>
      </div>

      <button type="submit" class="btn primary xl v2-submit" id="btnLoginSubmit" style="margin-top:6px;">Přihlásit se</button>
    </form>

    <!-- 2. Registration Form -->
    <form id="pageRegisterForm" class="v2-form" style="display:none;">
      <div id="regErrorBanner" style="display:none; font-size:11.5px; color:#ef4444; background:rgba(239,68,68,0.1); padding:8px 10px; border-left:2px solid #ef4444;"></div>

      <div class="v2-field">
        <label>Školní e-mail (@vscht.cz)</label>
        <input type="email" id="regInputEmail" placeholder="např. novakj@vscht.cz" required autocomplete="email" />
      </div>

      <div class="v2-field">
        <label>Heslo</label>
        <input type="password" id="regInputPassword" placeholder="Zvolte heslo..." required autocomplete="new-password" />
      </div>

      <button type="submit" class="btn primary xl v2-submit" id="btnRegSubmit" style="margin-top:6px;">Vytvořit účet</button>
    </form>

    <!-- 3. Password Reset Form -->
    <form id="pageResetForm" class="v2-form" style="display:none;">
      <div id="resetStatusBanner" style="display:none; font-size:11.5px; padding:8px 10px;"></div>

      <div class="v2-field">
        <label>Školní e-mail (@vscht.cz)</label>
        <input type="email" id="resetInputEmail" placeholder="např. novakj@vscht.cz" required autocomplete="email" />
      </div>

      <div class="v2-field">
        <label>Nové heslo</label>
        <input type="password" id="resetInputNewPass" placeholder="Zadejte nové heslo..." required autocomplete="new-password" />
      </div>

      <button type="submit" class="btn primary xl v2-submit" id="btnResetSubmit" style="margin-top:6px;">Změnit heslo</button>
    </form>
  `;

  // Bind login form events
  const profileModal = document.getElementById("profileModal");
  card.querySelector("#btnCloseProfileModal")?.addEventListener("click", () => {
    profileModal?.classList.add("hidden");
  });

  const tabLogin = card.querySelector("#tabBtnLogin");
  const tabReg = card.querySelector("#tabBtnRegister");
  const tabReset = card.querySelector("#tabBtnReset");

  const formLogin = card.querySelector("#pageLoginForm");
  const formReg = card.querySelector("#pageRegisterForm");
  const formReset = card.querySelector("#pageResetForm");

  const loginErr = card.querySelector("#loginErrorBanner");
  const regErr = card.querySelector("#regErrorBanner");
  const resetBanner = card.querySelector("#resetStatusBanner");

  const setActiveTab = (activeTab, activeForm) => {
    [tabLogin, tabReg, tabReset].forEach((t) => {
      if (t === activeTab) {
        t.classList.add("primary", "active");
        t.classList.remove("secondary");
      } else {
        t.classList.add("secondary");
        t.classList.remove("primary", "active");
      }
    });
    [formLogin, formReg, formReset].forEach((f) => {
      if (f === activeForm) {
        f.style.display = "flex";
      } else {
        f.style.display = "none";
      }
    });
  };

  tabLogin?.addEventListener("click", () => setActiveTab(tabLogin, formLogin));
  tabReg?.addEventListener("click", () => setActiveTab(tabReg, formReg));
  tabReset?.addEventListener("click", () => setActiveTab(tabReset, formReset));

  card.querySelector("#btnGoToReset")?.addEventListener("click", () => {
    setActiveTab(tabReset, formReset);
  });

  // Submit Password Login Form
  formLogin?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (loginErr) loginErr.style.display = "none";

    const usernameOrEmail = card.querySelector("#pageInputEmail")?.value.trim();
    const password = card.querySelector("#pageInputPassword")?.value.trim();

    if (!usernameOrEmail || !password) return;

    try {
      await loginWithPassword({ usernameOrEmail, password });
      showLogin();
    } catch (err) {
      if (loginErr) {
        loginErr.textContent = err.message || "Přihlášení selhalo.";
        loginErr.style.display = "block";
      }
    }
  });

  // Submit Registration Form
  formReg?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (regErr) regErr.style.display = "none";

    const email = card.querySelector("#regInputEmail")?.value.trim();
    const password = card.querySelector("#regInputPassword")?.value.trim();

    if (!email || !password) return;

    try {
      await registerUser({ email, password });
      showLogin();
    } catch (err) {
      if (regErr) {
        regErr.textContent = err.message || "Registrace selhala.";
        regErr.style.display = "block";
      }
    }
  });

  // Submit Password Reset Form
  formReset?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (resetBanner) resetBanner.style.display = "none";

    const email = card.querySelector("#resetInputEmail")?.value.trim();
    const newPass = card.querySelector("#resetInputNewPass")?.value.trim();

    if (!email || !newPass) return;

    try {
      await resetUserPassword(email, newPass);
      if (resetBanner) {
        resetBanner.style.display = "block";
        resetBanner.style.color = "#89d185";
        resetBanner.style.background = "rgba(137,209,133,0.1)";
        resetBanner.style.borderLeft = "2px solid #89d185";
        resetBanner.textContent = `✓ Pokyny pro reset hesla byly odeslány na ${email}. Heslo bylo úspěšně změněno.`;
      }
    } catch (err) {
      if (resetBanner) {
        resetBanner.style.display = "block";
        resetBanner.style.color = "#ef4444";
        resetBanner.style.background = "rgba(239,68,68,0.1)";
        resetBanner.style.borderLeft = "2px solid #ef4444";
        resetBanner.textContent = err.message || "Reset hesla selhal.";
      }
    }
  });

  // Guest continue without logging in
  card.querySelector("#btnGuestContinue")?.addEventListener("click", () => {
    profileModal?.classList.add("hidden");
  });

  return card;
}
