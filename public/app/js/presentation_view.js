/**
 * Presentation View Module
 * Slide-by-slide presentation mode, floating navigation, fullscreen toggle, keyboard shortcuts, and slide counter.
 */

import { state, pagesFor, markSeen } from "./state.js";
import { clear, el, escapeHtml, badgesHtml, flavorHtml } from "./ui.js";
import { highlightRoot } from "./highlight.js";
import { renderQuizSection, openPresentationImprovementModal } from "./quiz.js";
import {
  renderSlide, loadAndInlineExamples, scanAndContrastImages,
  renderRecapReturnBreadcrumb, resolveSlideDiff, resolveSlideTags, fetchAndExtract,
} from "./slide_renderer.js";
import {
  setLoading, lectureHero, lectureToolbar, loadFullContent,
  fetchAndExtractExercise, renderExerciseView,
} from "./content.js";

/* ── Fullscreen Toggle ─────────────────────────────────── */

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

/* ── Presentation Outline (All Slides) ─────────────────── */

export async function showPresentation(itemId) {
  const item = state.itemsById.get(itemId);
  const main = document.getElementById("main");
  if (!item) {
    if (main) {
      main.className = "";
      main.innerHTML = `<div class="error-box">Item not found.</div>`;
    }
    return;
  }

  markSeen(item.id);
  const pages = pagesFor(item.path);

  main.className = "lecture-view";
  clear(main);

  const hero = lectureHero(item);
  hero.appendChild(lectureToolbar(item, "presentation"));
  main.appendChild(hero);

  if (pages.length) {
    const sec = el("div", { className: "catalog", style: { paddingTop: "4px", paddingBottom: "16px" } },
      el("div", { className: "catalog-section" },
        el("h2", {}, `Presentation Outline · ${pages.length} slides`),
      ),
    );
    const list = el("div", { className: "page-list" });
    pages.forEach((p, i) => {
      const diff = resolveSlideDiff(p, item.slug, p.id);
      const tags = resolveSlideTags(p, item.slug, p.id);
      const row = el("button", {
        type: "button",
        className: "page-row",
        onClick: () => window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: p.id }),
      });
      row.innerHTML = `
        <span class="page-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="page-title">${escapeHtml(p.title)}</span>
        ${badgesHtml(tags)}
        ${diff ? flavorHtml(diff) : ""}
      `;
      list.appendChild(row);
    });
    sec.querySelector(".catalog-section").appendChild(list);
    main.appendChild(sec);
  }

  // Always load full lecture content below outline
  await loadFullContent(item, main);
}

/** @deprecated alias kept for any leftover imports */
export function showItemIndex(itemId) {
  return showPresentation(itemId);
}

/* ── Single Slide (Presentation Step) ──────────────────── */

export async function showPage(itemId, pageId) {
  const item = state.itemsById.get(itemId);
  const main = document.getElementById("main");
  if (!item) {
    if (main) main.innerHTML = `<div class="error-box">Item not found.</div>`;
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
    const subTitle = page.title || pageId;
    document.title = item.weekNum != null ? `W${item.weekNum} • ${subTitle}` : `newpyt • ${subTitle}`;

    const returnBreadcrumb = renderRecapReturnBreadcrumb(item);
    if (returnBreadcrumb) main.appendChild(returnBreadcrumb);

    const hero = lectureHero(item, { compact: true });
    main.appendChild(hero);

    const pages = pagesFor(item.path);
    const effectivePages = (pages && pages.length) ? pages : slides;
    const actualPageId = page.id || pageId;
    const idx = effectivePages.findIndex((p) => p.id === actualPageId);
    const currentSlideNum = Math.max(idx, 0) + 1;
    const totalSlideCount = effectivePages.length;

    const nav = el("div", { className: "item-actions lecture-toolbar presentation-floating-nav" });
    nav.appendChild(el("button", {
      type: "button", className: "btn primary",
      title: "Open full lecture",
      onClick: () => {
        toggleFullscreen(false);
        window.__pcsNavigate?.({ kind: item.kind, id: item.id });
      },
    }, "Open full lecture"));
    nav.appendChild(el("button", {
      type: "button", className: "btn",
      title: "View all slides",
      onClick: () => window.__pcsNavigate?.({ kind: "presentation", id: item.id }),
    }, "All slides"));

    if (idx > 0) {
      nav.appendChild(el("button", {
        type: "button", className: "btn",
        title: "Previous slide (←)",
        onClick: () => window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: effectivePages[idx - 1].id }),
      }, "← Prev"));
    }
    if (idx >= 0 && idx < totalSlideCount - 1) {
      nav.appendChild(el("button", {
        type: "button", className: "btn",
        title: "Next slide (→)",
        onClick: () => window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: effectivePages[idx + 1].id }),
      }, "Next →"));
    }

    nav.appendChild(el("button", {
      type: "button", className: "btn btn-suggest-update",
      title: "Suggest an edit to the presentation content or report an issue",
      onClick: () => openPresentationImprovementModal(item),
    }, "Navrhnout úpravu"));

    if (totalSlideCount) {
      const pos = el("span", {
        className: "slide-pos",
        title: "Aktuální pozice v prezentaci",
      }, `${currentSlideNum} / ${totalSlideCount}`);
      nav.appendChild(pos);
    }
    main.appendChild(nav);

    const slideEl = renderSlide(page, item, currentSlideNum);
    main.appendChild(slideEl);
    await loadAndInlineExamples(slideEl);
    highlightRoot(slideEl);
    scanAndContrastImages(slideEl);

    const isLastSlide = idx < 0 || idx === totalSlideCount - 1;
    if (isLastSlide) {
      const quizEl = await renderQuizSection(item);
      if (quizEl) main.appendChild(quizEl);
    }
  } catch (err) {
    main.innerHTML = `<div class="error-box">Failed to load content.<br/><code>${escapeHtml(err.message)}</code></div>`;
  } finally {
    setLoading(false);
  }
}

/* ── Presentation Keyboard Shortcuts Helper ─────────────── */

export function stepSlide(dir) {
  const tab = state.tabs.find((t) => t.id === state.activeTabId);
  if (!tab || !tab.itemId) return;
  const item = state.itemsById.get(tab.itemId);
  if (!item) return;
  const pages = pagesFor(item.path);
  const slides = state.pagesIndex[item.path] || pages;
  if (!slides.length) return;

  if (tab.kind === "presentation") {
    if (dir > 0) {
      window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: slides[0].id });
    }
    return;
  }

  if (tab.kind === "page") {
    const idx = slides.findIndex((p) => p.id === tab.pageId);
    const nextIdx = idx + dir;
    if (nextIdx >= 0 && nextIdx < slides.length) {
      window.__pcsNavigate?.({ kind: "page", id: item.id, pageId: slides[nextIdx].id });
    }
  }
}
