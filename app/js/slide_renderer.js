/**
 * Slide DOM Node Creation, HTML Entity Decoding, Math/Example Inlining, and Highlighting
 */

import { state, slideDiff } from "./state.js";
import { el, badgesHtml, flavorHtml, starsHtml, escapeHtml } from "./ui.js";
import { highlightRoot, highlightCode, dedentCode } from "./highlight.js";

// ============================================================================
// Adaptive Image Contrast Engine (for transparent images in dark/light themes)
// ============================================================================

export const PRECLASSIFIED_IMAGE_CONTRAST = {
  // Dark + Transparent (needs light background in dark theme)
  "Ulam_spiral_howto.png": "img-contrast-dark-ink",
  "Sacks_spiral.png": "img-contrast-dark-ink",
  "objekty.png": "img-contrast-dark-ink",
  "zivot/1000.png": "img-contrast-dark-ink",
  "logo_[zirael.org].png": "img-contrast-dark-ink",
  "screenshot-0.png": "img-contrast-dark-ink",
  "screenshot-1.png": "img-contrast-dark-ink",
  "screenshot-2.png": "img-contrast-dark-ink",

  // Light + Transparent (needs dark background in light theme)
  "Brown_matplotlib.png": "img-contrast-light-ink",
  "pathlib-inheritance.png": "img-contrast-light-ink",
  "mandelbrot.png": "img-contrast-light-ink",
  "anim-00.png": "img-contrast-light-ink",
  "example_histogram.png": "img-contrast-light-ink",
  "example_subplot.png": "img-contrast-light-ink",
  "example_time.png": "img-contrast-light-ink",
  "plot-01.png": "img-contrast-light-ink",
  "plot-02.png": "img-contrast-light-ink",
  "plot-03.png": "img-contrast-light-ink",
  "plot-04a.png": "img-contrast-light-ink",
  "plot-04b.png": "img-contrast-light-ink",
  "plot-04c.png": "img-contrast-light-ink",
  "plot-04d.png": "img-contrast-light-ink",
  "plot-05a.png": "img-contrast-light-ink",
  "plot-05b.png": "img-contrast-light-ink",
  "showcase_integral.png": "img-contrast-light-ink",
  "faktorial.png": "img-contrast-light-ink",
  "fibonacci.png": "img-contrast-light-ink",
  "notebook.png": "img-contrast-light-ink",
};

export function autoContrastImage(img) {
  if (!img || img.dataset.contrastChecked) return;

  // Check pre-classified map first
  const src = img.getAttribute("src") || "";
  for (const [key, cls] of Object.entries(PRECLASSIFIED_IMAGE_CONTRAST)) {
    if (src.includes(key)) {
      img.classList.add(cls);
      img.dataset.contrastChecked = "1";
      return;
    }
  }

  const analyze = () => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    img.dataset.contrastChecked = "1";

    try {
      const maxDim = 48;
      const w = Math.min(img.naturalWidth, maxDim);
      const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      const totalPixels = w * h;

      let trans = 0;
      let vis = 0;
      let darkVis = 0;
      let lightVis = 0;
      let totLum = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 235) trans++;
        if (a > 25) {
          vis++;
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          totLum += lum;
          if (lum < 95) darkVis++;
          if (lum > 165) lightVis++;
        }
      }

      const transRatio = totalPixels > 0 ? trans / totalPixels : 0;
      const avgLum = vis > 0 ? totLum / vis : 128;
      const darkRatio = vis > 0 ? darkVis / vis : 0;
      const lightRatio = vis > 0 ? lightVis / vis : 0;

      if (transRatio > 0.04) {
        // Dark + transparent: dark ink on transparent background
        if (avgLum < 130 || (darkRatio > 0.35 && avgLum < 160)) {
          img.classList.add("img-contrast-dark-ink");
          img.dataset.contrastType = "dark-transparent";
        }
        // Light + transparent: light ink on transparent background
        else if (avgLum > 165 || (lightRatio > 0.35 && avgLum > 120)) {
          img.classList.add("img-contrast-light-ink");
          img.dataset.contrastType = "light-transparent";
        }
      }
    } catch {
      // Cross-origin canvas restriction, ignore silently
    }
  };

  if (img.complete && img.naturalWidth > 0) {
    analyze();
  } else {
    img.addEventListener("load", analyze, { once: true });
  }
}

export function scanAndContrastImages(root = document) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll("img").forEach((img) => autoContrastImage(img));
}

if (typeof window !== "undefined") {
  window.autoContrastImage = autoContrastImage;
  window.scanAndContrastImages = scanAndContrastImages;
}

// ============================================================================
// Content Link Resolution and URL Rewriting
// ============================================================================

export const LINK_REMAP_TABLE = {
  "xML.encoding.xml": "text/encoding_xML.html",
  "encoding.xml": "text/encoding_xML.html",
  "/materialy/python/modules/html.entites.xml": "python/modules/_modules.html",
  "html.entites.xml": "python/modules/_modules.html",
  "strings.xml": "python/types/_sequences.html",
  "dictionaries.xml": "python/types/dictionaries.html",
  "sets.xml": "python/types/sets.html",
  "tuples.xml": "python/types/tuples.html",
  "lists.xml": "python/types/lists.html",
  "frozensets.xml": "python/types/frozensets.html",
  "print.xml": "python/cmd/overview.html",
  "functional.xml": "python/functions/functional.html",
  "generic.xml": "python/functions/generic.html",
  "advanced.xml": "python/functions/advanced-1.html",
  "advanced-3.xml": "python/functions/advanced-3.html",
  "generators.xml": "python/generators/generators.html",
  "tempfile.xml": "python/files/tempfile.html",
  "virtualenv.xml": "python/packages/venv.html",
  "scope.xml": "python/functions/scope.html",
  "decorators.xml": "python/functions/decorators.html",
  "parameters.xml": "python/functions/parameters.html",
  "xslt.xml": "web/xml/overview.html?slide=id12",
  "dtd.xml": "web/xml/xml.html?slide=id10",
  "relaxng.xml": "web/xml/overview.html?slide=id9",
  "xmlschema.xml": "web/xml/overview.html?slide=id8",
  "xpath.xml": "web/xml/xpath.html",
  "xpath2.xml": "web/xml/xpath2.html",
  "xml.xml": "web/xml/xml.html",
  "hopfield.xml": "python/numpy/vectorization.html",
  "XXX.xml": "web/css/overview.html",
  "new_order.html": "#/",
  "/new_order.html": "#/",
};

export function resolvePresentationHref(href, lecturePath) {
  if (!href) return null;

  // Static asset downloads (_files/ directory or C/code assets)
  if (href.includes("_files/") || /\.(c|h|base64|pyx|d|sh|cmd|log|txt|png|jpg|jpeg|gif|sqlite)$/i.test(href)) {
    const normLecture = lecturePath.replace(/\\/g, "/");
    const dir = normLecture.substring(0, normLecture.lastIndexOf("/"));
    const cleanAsset = href.replace(/^(\.\/|\/)/, "");
    const assetUrl = "/" + (cleanAsset.startsWith("vyuka_downloaded") ? cleanAsset : `${dir}/${cleanAsset.replace(/^[./]+/, "")}`);
    return { type: "external", url: assetUrl };
  }

  // External link (not ookami.cz or vercel)
  if (/^https?:\/\//i.test(href) && !href.includes("ookami.cz") && !href.includes("vercel.app")) {
    return { type: "external", url: href };
  }
  if (href.startsWith("zetcode.com")) {
    return { type: "external", url: "http://" + href };
  }

  // Clean domain
  let clean = href.replace(/^https?:\/\/vyuka\.ookami\.cz\//i, "/").replace(/^https?:\/\/[^/]+\//i, "/");
  if (clean.includes("slad=")) clean = clean.replace("slad=", "slajd=");
  let slideParam = null;
  if (/^slajd=\d+/i.test(clean)) {
    slideParam = clean.replace(/^slajd=/i, "");
    clean = "";
  }

  // Extract & strip slide and parameter query params (?slajd=5, &slajd=5, ?slide=5, &par=1, &amp;par=1)
  const slajdMatch = clean.match(/[?&](slajd|slide)=([^&]*)/i);
  if (slajdMatch && slajdMatch[2].trim() !== "") {
    slideParam = slajdMatch[2].trim();
  }
  clean = clean.replace(/([?&]|&amp;)(slajd|slide|par)=[^&]*/gi, "");

  let hashFrag = "";
  if (clean.includes("#")) {
    const parts = clean.split("#");
    clean = parts[0];
    hashFrag = parts[1];
  }

  // Apply explicit LINK_REMAP_TABLE override if available
  const cleanBasename = clean.split("/").pop();
  if (LINK_REMAP_TABLE[cleanBasename]) {
    clean = LINK_REMAP_TABLE[cleanBasename];
  } else if (LINK_REMAP_TABLE[clean]) {
    clean = LINK_REMAP_TABLE[clean];
  }

  const normalizedPath = lecturePath.replace(/\\/g, "/");
  const curBasename = normalizedPath.split("/").pop();

  // Same-presentation link
  if (!clean || clean === curBasename || clean.replace(/\.xml$/, ".html") === curBasename) {
    let targetSlide = slideParam || hashFrag || "";
    if (targetSlide && !targetSlide.startsWith("id") && /^\d+$/.test(targetSlide)) {
      targetSlide = `id${targetSlide}`;
    }
    const curLectureId = "lecture:" + normalizedPath.replace(/^vyuka_downloaded\//, "");
    let hash = `#/lecture/${encodeURIComponent(curLectureId)}`;
    if (targetSlide) hash += `?slide=${encodeURIComponent(targetSlide)}`;
    return { type: "same_presentation", hash, slide: targetSlide };
  }

  // Home / new_order link
  if (clean === "/new_order.html" || clean === "new_order.html" || clean === "/index.html" || clean === "#/") {
    return { type: "home", hash: "#/" };
  }

  // Cross-presentation link
  if (clean.endsWith(".xml")) {
    clean = clean.slice(0, -4) + ".html";
  }

  const currentDirParts = normalizedPath.split("/").slice(0, -1);
  let targetPath = "";

  const knownCategories = ["python/", "web/", "text/", "techs/", "media/", "dvcs/", "jupyter/"];
  const isCategoryAbs = knownCategories.some(cat => clean.startsWith(cat) || clean.startsWith("/" + cat));

  if (clean.startsWith("/materialy/")) {
    targetPath = "vyuka_downloaded" + clean;
  } else if (clean.startsWith("materialy/")) {
    targetPath = "vyuka_downloaded/" + clean;
  } else if (isCategoryAbs) {
    targetPath = "vyuka_downloaded/materialy/" + clean.replace(/^\//, "");
  } else if (clean.startsWith("/")) {
    targetPath = "vyuka_downloaded/materialy" + clean;
  } else {
    // Relative path resolution
    const combined = [...currentDirParts, ...clean.split("/")];
    const norm = [];
    for (const p of combined) {
      if (p === "..") {
        if (norm.length) norm.pop();
      } else if (p !== "." && p !== "") {
        norm.push(p);
      }
    }
    targetPath = norm.join("/");
  }

  let targetSlide = slideParam || hashFrag || "";
  if (targetSlide && !targetSlide.startsWith("id") && /^\d+$/.test(targetSlide)) {
    targetSlide = `id${targetSlide}`;
  }

  let canonicalId = "lecture:" + targetPath.replace(/^vyuka_downloaded\//, "");
  if (state.itemsById) {
    const matchedItem = state.itemsById.get(canonicalId) ||
                        state.itemsById.get("lecture:" + targetPath.replace(/^vyuka_downloaded\/materialy\//, "")) ||
                        state.itemsById.get("lecture:" + clean);
    if (matchedItem && matchedItem.id) {
      canonicalId = matchedItem.id;
    }
  }

  let hash = `#/lecture/${encodeURIComponent(canonicalId)}`;
  if (targetSlide) hash += `?slide=${encodeURIComponent(targetSlide)}`;

  return { type: "cross_presentation", hash, targetPath, slide: targetSlide };
}

export function rewriteContentUrls(html, lecturePath) {
  const baseDir = lecturePath.replace(/\\/g, "/").replace(/\/[^/]+$/, "/");
  const baseUrl = "/" + baseDir;

  const wrap = document.createElement("div");
  wrap.innerHTML = html;

  wrap.querySelectorAll("[src]").forEach((node) => {
    const src = node.getAttribute("src");
    if (!src || /^(https?:|data:|\/|#)/i.test(src)) return;
    const resolvedUrl = baseUrl + src.replace(/^\.\//, "");
    node.setAttribute("src", resolvedUrl);

    if (node.tagName === "IMG") {
      node.setAttribute("loading", "lazy");
      const cleanRel = resolvedUrl.replace(/^\/vyuka_downloaded\//, "").replace(/^\//, "");
      node.dataset.fallbackSrc = `http://vyuka.ookami.cz/${cleanRel}`;
      node.setAttribute(
        "onerror",
        "if(!this.dataset.fallbackTried){this.dataset.fallbackTried='1';this.src=this.dataset.fallbackSrc;}else{this.style.display='none';}"
      );
      node.setAttribute("onload", "window.autoContrastImage && window.autoContrastImage(this)");

      // Check preclassified map right during HTML generation
      for (const [key, cls] of Object.entries(PRECLASSIFIED_IMAGE_CONTRAST)) {
        if (resolvedUrl.includes(key)) {
          node.classList.add(cls);
          break;
        }
      }
    }
  });

  wrap.querySelectorAll("a[href]").forEach((node) => {
    const href = node.getAttribute("href");
    if (!href || /^(mailto:|data:)/i.test(href)) return;

    const res = resolvePresentationHref(href, lecturePath);
    if (!res) return;

    if (res.type === "external") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
      node.classList.add("external-link");
    } else if (res.hash) {
      node.setAttribute("href", res.hash);
      node.classList.add("internal-pres-link");
      if (res.slide) node.dataset.targetSlide = res.slide;
    }
  });

  wrap.querySelectorAll("example").forEach((ex) => {
    const src = ex.getAttribute("src") || "";
    let lang = ex.getAttribute("lang") || "python";
    if (src.endsWith(".out") || src.endsWith(".txt")) lang = "plain";

    const fullUrl = /^(https?:|\/)/i.test(src) ? src : baseUrl + src.replace(/^\.\//, "");
    const pre = document.createElement("pre");
    pre.className = `code-block lang-${lang}`;
    pre.dataset.exampleSrc = fullUrl;
    pre.dataset.exampleLang = lang;
    pre.innerHTML = `<code># Loading ${escapeHtml(src)}…</code>`;
    ex.replaceWith(pre);
  });

  return wrap.innerHTML;
}

export async function loadAndInlineExamples(root) {
  if (!root) return;
  const examplePres = root.querySelectorAll("pre[data-example-src]");
  if (!examplePres.length) return;

  await Promise.all(
    [...examplePres].map(async (pre) => {
      const url = pre.dataset.exampleSrc;
      const lang = pre.dataset.exampleLang || "python";
      const cleanUrl = url.replace(/^\//, "");
      const urlsToTry = [
        "/" + cleanUrl,
        "/public/" + cleanUrl,
        "/app/" + cleanUrl,
      ];

      let text = null;
      for (const tryUrl of urlsToTry) {
        try {
          const res = await fetch(tryUrl, { cache: "no-store" });
          if (res.ok) {
            text = await res.text();
            break;
          }
        } catch { /* try next url fallback */ }
      }

      if (text !== null) {
        const formatted = dedentCode(text);
        pre.innerHTML = `<code>${highlightCode(formatted, lang)}</code>`;
        pre.dataset.hl = "1";
        delete pre.dataset.exampleSrc;
      } else {
        const code = pre.querySelector("code") || pre;
        code.textContent = `# example file: ${url}\n# (HTTP 404 - Not found)`;
      }
    })
  );
}

// ============================================================================
// Slide Metadata & Recap Banner Helpers
// ============================================================================

export function resolveSlideTags(slide, slug, pageId) {
  if (Array.isArray(slide?.tags)) return slide.tags;
  const skey = `${slug}#${pageId}`;
  if (state.slides && state.slides[skey] && Array.isArray(state.slides[skey].tags)) {
    return state.slides[skey].tags;
  }
  if (!state.slides || Object.keys(state.slides).length === 0) {
    return ["Loading…"];
  }
  return [];
}

export function resolveSlideDiff(slide, slug, pageId) {
  if (slide?.diff) return slide.diff;
  return slideDiff(slug, pageId);
}

export function resolveAlreadyStudied(slide, slug, pageId) {
  if (slide?.already_studied_in) return slide.already_studied_in;
  const key = `${slug}#${pageId}`;
  if (state.slides?.[key]?.already_studied_in) return state.slides[key].already_studied_in;
  return null;
}

export function getRecapReturn() {
  if (state.recapReturn) return state.recapReturn;
  try {
    const raw = sessionStorage.getItem("pcs_recap_return");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function setRecapReturn(data) {
  state.recapReturn = data;
  try {
    if (data) sessionStorage.setItem("pcs_recap_return", JSON.stringify(data));
    else sessionStorage.removeItem("pcs_recap_return");
  } catch {}
}

export function renderRecapReturnBreadcrumb(currentItem) {
  const ret = getRecapReturn();
  if (!ret) return null;
  // If we navigated back to the origin, dismiss the breadcrumb
  if (ret.fromId === currentItem?.id && (!ret.fromPageId || ret.fromPageId === currentItem?.pageId)) {
    setRecapReturn(null);
    return null;
  }

  const bar = el("div", { className: "recap-return-floating-banner" });
  const fromWeekStr = typeof ret.fromWeek === "number" ? (ret.fromWeek === 99 ? "Gray" : `W${ret.fromWeek}`) : "";
  bar.innerHTML = `
    <span class="recap-return-icon">↶</span>
    <span class="recap-return-text">Přešli jste z: <strong>${fromWeekStr ? fromWeekStr + " " : ""}${escapeHtml(ret.fromTitle || "předchozího výkladu")}</strong> (slajd #${escapeHtml(ret.fromPageId || "1")})</span>
    <button type="button" class="recap-return-btn" title="Vrátit se zpět na předchozí přednášku">
      ← Zpět na původní místo
    </button>
    <button type="button" class="recap-return-dismiss" title="Zavřít" aria-label="Zavřít">×</button>
  `;
  const btn = bar.querySelector(".recap-return-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      const target = { ...ret };
      setRecapReturn(null);
      window.__pcsNavigate?.({ kind: target.fromKind || "lecture", id: target.fromId, pageId: target.fromPageId });
    });
  }
  const close = bar.querySelector(".recap-return-dismiss");
  if (close) {
    close.addEventListener("click", () => {
      setRecapReturn(null);
      bar.remove();
    });
  }
  return bar;
}

// Global click delegation for cross-lecture recap buttons
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const recapBtn = e.target?.closest?.(".recap-link-btn");
    if (!recapBtn) return;
    e.preventDefault();
    const lectureId = recapBtn.getAttribute("data-lecture-id");
    const slideId = recapBtn.getAttribute("data-slide-id");
    const fromId = recapBtn.getAttribute("data-from-id");
    const fromTitle = recapBtn.getAttribute("data-from-title");
    const fromWeek = recapBtn.getAttribute("data-from-week");
    const fromPageId = recapBtn.getAttribute("data-from-page-id");

    if (lectureId) {
      setRecapReturn({
        fromKind: "page",
        fromId,
        fromTitle,
        fromWeek: fromWeek !== "" ? Number(fromWeek) : null,
        fromPageId,
      });
      window.__pcsNavigate?.({ kind: "lecture", id: lectureId, pageId: slideId });
    }
  });
}

// ============================================================================
// Slide Node Creation
// ============================================================================

export function renderSlide(page, item, num) {
  const diff = resolveSlideDiff(page, item.slug, page.id);
  const tags = resolveSlideTags(page, item.slug, page.id);
  const alreadyStudied = resolveAlreadyStudied(page, item.slug, page.id);

  const slide = el("article", {
    className: "slide" + (page.is_intersection ? " is-intersection" : ""),
    id: page.id,
  });
  const header = el("div", { className: "slide-header" });
  header.innerHTML = `
    <span class="slide-num">${String(num).padStart(2, "0")}</span>
    <h2 class="slide-title">${escapeHtml(page.title)}</h2>
    ${page.is_intersection ? '<span class="slide-intersection-badge">✦ Extra Přehled</span>' : ""}
    ${badgesHtml(tags)}
    ${diff ? flavorHtml(diff) : ""}
  `;
  slide.appendChild(header);

  if (alreadyStudied) {
    const recapBanner = el("div", { className: "slide-recap-banner" });
    const primWeek = alreadyStudied.week === 99 ? "Gray" : `W${alreadyStudied.week}`;
    const primLec = alreadyStudied.lecture_title || "původní přednášce";
    recapBanner.innerHTML = `
      <span class="recap-pill">[JIŽ PROBRÁNO]</span>
      <span class="recap-desc">Tento výklad / příklad byl původně probrán v:</span>
      <button type="button" class="recap-link-btn"
        data-lecture-id="${escapeHtml(alreadyStudied.lecture_id)}"
        data-slide-id="${escapeHtml(alreadyStudied.slide_id)}"
        data-from-id="${escapeHtml(item.id)}"
        data-from-title="${escapeHtml(item.title)}"
        data-from-week="${escapeHtml(item.week != null ? String(item.week) : "")}"
        data-from-page-id="${escapeHtml(page.id)}"
        title="Přejít na původní výklad">
        <strong>${primWeek} ${escapeHtml(primLec)}</strong> (slajd #${escapeHtml(alreadyStudied.slide_id)}) →
      </button>
    `;
    slide.appendChild(recapBanner);
  }

  const body = el("div", { className: "slide-body" });
  body.innerHTML = rewriteContentUrls(page.html || "", item.path);
  slide.appendChild(body);

  return slide;
}

// ============================================================================
// Slide Extraction and Fetching Engine
// ============================================================================

const cache = new Map();

export async function fetchAndExtract(path) {
  if (!path) return [];
  if (cache.has(path)) {
    const cached = cache.get(path);
    if (Array.isArray(cached) && cached.length > 0) return cached;
  }

  const cleanRel = path.replace(/\\/g, "/").replace(/^.*?(vyuka_downloaded|content)\//, "").replace(/^\//, "").replace(/\.(html?|md)$/, "");
  const pathSlug = cleanRel.replace(/[\/\\]/g, "--");
  const baseName = path.split("/").pop().replace(/\.(html?|md)$/, "");

  // 1. Try static pre-rendered JSON slide tree (canonical pathSlug, then fallback to baseName)
  const candidates = [pathSlug, baseName].filter(Boolean);
  for (const s of candidates) {
    try {
      const res = await fetch(`/data/lectures/${s}.json`);
      if (res.ok) {
        const data = await res.json();
        const slides = Array.isArray(data) ? data : (data?.slides && Array.isArray(data.slides) ? data.slides : null);
        if (slides && slides.length > 0) {
          cache.set(path, slides);
          if (!state.pagesIndex[path] || state.pagesIndex[path].length !== slides.length) {
            const mappedPages = slides.map((sl) => ({
              id: sl.id,
              title: sl.title,
              tags: sl.tags || ["Core"],
              diff: sl.diff || "basics",
              is_intersection: !!sl.is_intersection,
            }));
            state.pagesIndex[path] = mappedPages;
            state.pagesIndex[pathSlug] = mappedPages;
          }
          return slides;
        }
      }
    } catch { /* ignore */ }
  }

  // 2. Fallback: Raw HTML fetch + client-side DOMParser
  const cleanPath = path.replace(/^\//, "");
  const urlsToTry = [
    "/" + cleanPath,
    "/app/" + cleanPath,
    "/public/" + cleanPath,
  ];

  let html = null;
  for (const url of urlsToTry) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text && text.includes("<")) {
          html = text;
          break;
        }
      }
    } catch { /* try next url fallback */ }
  }

  if (!html) {
    console.warn(`Could not fetch content HTML for path: ${path}`);
    return [];
  }

  const slides = extractSlides(html);
  if (slides.length > 0) {
    cache.set(path, slides);
  }
  return slides;
}

export function extractSlides(html) {
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
