/**
 * Catalog View Module
 * Home view, week catalog view, shelf grouping, and item card rendering.
 */

import { state, weekVisibleItems, getWeekStats } from "./state.js";
import { clear, el, escapeHtml, badgesHtml, flavorHtml, starsHtml } from "./ui.js";
import { toggleFullscreen } from "./presentation_view.js";

/* ── Welcome: All Weeks + Full Course Catalogs ─────────── */

export function showHome() {
  const main = document.getElementById("main");
  const course = state.course;
  const weeks = course?.weeks || [];

  if (main) {
    main.className = "catalog catalog-home";
    clear(main);

    const header = el("div", { className: "catalog-header" });
    header.innerHTML = `
      <h1>Python Course Workspace</h1>
      <p class="desc">Jiný UI pro <a href="http://vyuka.ookami.cz/index.python.html" target="_blank" rel="noopener noreferrer">ookami-&gt;pyt</a> od Pana Inženýra Znamenáčka, senior Full stack developera a pedagoga :)<br>Pokud něco nebude fungovat napište mi na <a href="mailto:kolarv@vscht.cz">kolarv@vscht.cz</a> &lt;3</p>

      <div class="welcome-keys" style="justify-content:flex-start;margin-top:12px">
        <span><kbd class="kbd">Ctrl+P</kbd> Tisk / Print</span>
        <span><kbd class="kbd">Ctrl+K</kbd> Quick open</span>
        <span><kbd class="kbd">Ctrl+B</kbd> Toggle sidebar</span>
        <span><kbd class="kbd">Ctrl+Shift+F</kbd> Search</span>
        <span><kbd class="kbd">Browser ←</kbd> Previous view</span>
      </div>
    `;
    main.appendChild(header);

    for (const week of weeks) {
      main.appendChild(buildWeekCatalogBlock(week, { showWeekLink: true, hideMasterLecture: false }));
    }

    if (!weeks.length) {
      main.appendChild(el("p", { className: "desc" }, "No weeks loaded."));
    }
  }
}

/* ── Single Week Catalog ───────────────────────────────── */

export function showWeek(weekId) {
  let week = state.weeksById.get(weekId);
  if (!week && weekId) {
    const normalized = "week-" + String(weekId).replace(/^w/, "");
    week = state.weeksById.get(normalized);
  }
  const main = document.getElementById("main");
  if (!week) {
    if (main) {
      main.className = "";
      main.innerHTML = `<div class="error-box">Week not found: <code>${escapeHtml(weekId)}</code></div>`;
    }
    return;
  }

  main.className = "catalog";
  clear(main);

  const items = weekVisibleItems(week);
  let weekLabel = `Týden ${week.week}`;
  if (week.week === 99) weekLabel = "Doplňkový regál (W99)";
  const wStats = getWeekStats(week);
  
  const header = el("div", { className: "catalog-header" },
    el("h1", {}, `${weekLabel}: ${week.title}`),
    week.description ? el("p", { className: "desc" }, week.description) : null,
    el("div", { className: "catalog-stats" },
      el("span", { className: "catalog-stat-pill" }, `⏱️ ${week.time_estimate || "90 min přednáška + 45 min lab"}`),
      el("span", { className: "catalog-stat-pill" }, `📚 ${wStats.lecturesCompleted}/${wStats.lecturesTotal} přednášek`),
      el("span", { className: "catalog-stat-pill" }, `💻 ${wStats.exercisesCompleted}/${wStats.exercisesTotal} cvičení`),
      el("span", { className: "catalog-stat-pill" }, `🎯 ${wStats.pct}% splněno`),
    ),
  );

  // Pedagogical Callouts
  if (week.objective || week.c_java_bridge) {
    const callouts = el("div", { className: "week-hero-callouts" });
    if (week.objective) {
      callouts.appendChild(el("div", { className: "week-hero-callout objective" },
        el("span", { className: "callout-icon" }, "🎯"),
        el("div", { className: "callout-body" },
          el("strong", {}, "Cíl týdne"),
          el("span", {}, week.objective),
        ),
      ));
    }
    if (week.c_java_bridge) {
      callouts.appendChild(el("div", { className: "week-hero-callout bridge" },
        el("span", { className: "callout-icon" }, "⚡"),
        el("div", { className: "callout-body" },
          el("strong", {}, "Most z C / C++ / Javy"),
          el("span", {}, week.c_java_bridge),
        ),
      ));
    }
    header.appendChild(callouts);
  }

  // Milestone Banner
  if (week.milestone) {
    const m = week.milestone;
    const milestoneEl = el("div", { className: "week-milestone-card" },
      el("div", { className: "milestone-badge" }, `🏆 Semestrální projektový milník ${m.number}`),
      el("h3", { className: "milestone-title" }, m.title),
      el("p", { className: "milestone-desc" }, m.desc),
      el("div", { className: "milestone-skills" },
        ...(m.skills || []).map((s) => el("span", { className: "milestone-skill-pill" }, s)),
      ),
    );
    header.appendChild(milestoneEl);
  }

  // Master Lecture (Tier 1) Hero Banner
  const masterLec = (week.lectures || []).find((l) => l.kind === "master-lecture");
  if (masterLec) {
    const mlCard = el("div", { className: "week-master-lecture-hero" });
    const slideCount = masterLec.totalSlides || 27;
    mlCard.innerHTML = `
      <div class="wml-badge-row">
        <span class="wml-badge">⭐ TIER 1 · 90MIN MASTER PŘEDNÁŠKA</span>
        <span class="wml-badge-sub">${slideCount} slajdů · Kontrastivní model C/Java → Python 3.12+ stdlib</span>
      </div>
      <h2 class="wml-title">${escapeHtml(masterLec.title)}</h2>
      <p class="wml-desc">${escapeHtml(masterLec.desc || "")}</p>
      ${masterLec.compare ? `<div class="wml-compare"><strong>💡 Didaktický most:</strong> ${escapeHtml(masterLec.compare)}</div>` : ""}
      <div class="wml-actions">
        <button type="button" class="btn primary wml-btn-launch" title="Spustit celoobrazovkovou prezentaci se slajdy">
          ▶ Spustit prezentaci (slajd po slajdu ⛶)
        </button>
        <button type="button" class="btn wml-btn-read" title="Otevřít celou přednášku jako souvislý text">
          📖 Číst jako ucelený text (scrollable)
        </button>
      </div>
    `;
    const btnLaunch = mlCard.querySelector(".wml-btn-launch");
    if (btnLaunch) {
      btnLaunch.addEventListener("click", () => {
        window.__pcsNavigate?.({ kind: "page", id: masterLec.id, pageId: "id1" });
        toggleFullscreen(true);
      });
    }
    const btnRead = mlCard.querySelector(".wml-btn-read");
    if (btnRead) {
      btnRead.addEventListener("click", () => {
        window.__pcsNavigate?.({ kind: "lecture", id: masterLec.id });
      });
    }
    header.appendChild(mlCard);
  }

  main.appendChild(header);
  // When prominent Tier 1 Master Lecture Hero is displayed at the top,
  // hideMasterLecture: true ensures catalog card grid below shows ONLY Tier 2 Reference Archive topics & labs
  main.appendChild(buildWeekCatalogBlock(week, { hideTitle: true, hideMasterLecture: Boolean(masterLec) }));
}

/**
 * Shared week body: Lectures + Exercises card grids.
 */
export function buildWeekCatalogBlock(week, { showWeekLink = false, hideTitle = false, hideMasterLecture = false } = {}) {
  const items = weekVisibleItems(week);
  const wrap = el("div", { className: "week-block", dataset: { weekId: week.id } });

  if (!hideTitle) {
    const isGray = week.week === 99 || week.isRemovedSection;
    const badgeText = isGray ? "Shelf" : `W${week.week}`;
    const titleRow = el("div", { className: "week-block-header" });
    if (showWeekLink) {
      const btn = el("button", {
        type: "button",
        className: "week-block-title",
        onClick: () => window.__pcsNavigate?.({ kind: "week", id: week.id }),
      });
      btn.innerHTML = `<span class="week-num">${badgeText}</span> ${escapeHtml(week.title)}`;
      titleRow.appendChild(btn);
    } else {
      titleRow.innerHTML = `<h2 class="week-block-title static"><span class="week-num">${badgeText}</span> ${escapeHtml(week.title)}</h2>`;
    }
    if (week.description) {
      titleRow.appendChild(el("p", { className: "week-block-desc" }, week.description));
    }
    const count = el("span", { className: "week-block-count" }, `${items.length} items`);
    titleRow.appendChild(count);
    wrap.appendChild(titleRow);
  }

  // Pull out Master Lectures (Tier 1) only if not suppressed by prominent Hero banner
  const masterLectures = items.filter((i) => i.kind === "master-lecture");
  if (!hideMasterLecture && masterLectures.length) {
    wrap.appendChild(section("⭐ Master Přednáška (Tier 1 — 90min výklad)", masterLectures));
  }

  const regularItems = items.filter((i) => i.kind !== "master-lecture");

  // If week has shelves, group them nicely
  if (week.shelves && week.shelves.length) {
    let renderedAnyShelf = false;
    const matchedSlugs = new Set();
    for (const shelf of week.shelves) {
      const shelfItems = regularItems.filter((it) => {
        const matches = (shelf.slugs || []).some(s => (it.slug || "").includes(s) || (it.path || "").includes(s));
        if (matches) matchedSlugs.add(it.id);
        return matches;
      });

      if (shelfItems.length) {
        renderedAnyShelf = true;
        const shelfSec = el("div", { className: "shelf-section" },
          el("div", { className: "shelf-header" },
            el("h2", {}, `${shelf.icon || "📁"} ${shelf.title}`),
            shelf.desc ? el("p", {}, shelf.desc) : null,
          ),
        );
        const grid = el("div", { className: "card-grid" });
        for (const item of shelfItems) grid.appendChild(itemCard(item));
        shelfSec.appendChild(grid);
        wrap.appendChild(shelfSec);
      }
    }

    // Uncategorized shelf items
    const remainingItems = regularItems.filter(it => !matchedSlugs.has(it.id));
    if (remainingItems.length) {
      renderedAnyShelf = true;
      wrap.appendChild(section("Ostatní doplňková témata", remainingItems));
    }
    if (!renderedAnyShelf) {
      wrap.appendChild(el("p", { className: "desc" }, "Žádné položky neodpovídají aktuálnímu filtru."));
    }
    return wrap;
  }

  const lectures = regularItems.filter((i) => i.kind === "lecture");
  const exercises = regularItems.filter((i) => i.kind === "exercise");

  if (lectures.length) wrap.appendChild(section("📚 Referenční archiv témat (Tier 2)", lectures));
  if (exercises.length) wrap.appendChild(section("Cvičení & Projekty (Labs)", exercises));
  if (!lectures.length && !exercises.length && (hideMasterLecture || !masterLectures.length)) {
    wrap.appendChild(el("p", { className: "desc" }, "Žádné položky neodpovídají aktuálnímu filtru."));
  }
  return wrap;
}

export function section(title, items) {
  const sec = el("div", { className: "catalog-section" },
    el("h2", {}, title),
  );
  const grid = el("div", { className: "card-grid" });
  for (const item of items) grid.appendChild(itemCard(item));
  sec.appendChild(grid);
  return sec;
}

export function itemCard(item) {
  // Default open = full lecture / structured exercise
  const isMaster = item.kind === "master-lecture";
  const card = el("button", {
    type: "button",
    className: "card" + (item.kind === "exercise" ? " card-exercise" : "") + (isMaster ? " card-master-lecture" : ""),
    onClick: () => window.__pcsNavigate?.({ kind: item.kind, id: item.id }),
  });
  const exMeta = state.exercises[item.path];
  const taskCount = exMeta?.task_count || exMeta?.tasks?.length || 0;
  const slideCount = item.totalSlides || 27;
  card.innerHTML = `
    <div class="card-top">
      <div class="card-title">${escapeHtml(item.title)}</div>
      <div class="card-kind">${isMaster ? "⭐ Tier 1 Master" : escapeHtml(item.kind)}</div>
    </div>
    ${item.desc ? `<div class="card-desc">${escapeHtml(item.desc)}</div>` : ""}
    ${item.compare ? `<div class="card-compare">${escapeHtml(item.compare)}</div>` : ""}
    <div class="card-footer">
      ${badgesHtml(item.tags)}
      ${flavorHtml(item.diff)}
      ${taskCount ? `<span class="task-count-chip">${taskCount} úkolů</span>` : ""}
      ${isMaster ? `<span class="task-count-chip" style="background:rgba(56,189,248,0.2);color:#38bdf8;border-color:rgba(56,189,248,0.4)">${slideCount} slajdů ⛶</span>` : ""}
      ${starsHtml(item, 10, "bar")}
    </div>
  `;
  return card;
}
