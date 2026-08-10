/**
 * Global Re-usable UI Component Library & DOM Utilities
 */

import { formatInlineCode } from "./format.js";

/** DOM Builder utility */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "className") node.className = v;
    else if (k === "dataset") {
      for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv;
    } else if (k === "style" && typeof v === "object") {
      Object.assign(node.style, v);
    } else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "html") {
      node.innerHTML = v;
    } else if (v === false || v == null) {
      // skip
    } else if (v === true) {
      node.setAttribute(k, "");
    } else {
      node.setAttribute(k, String(v));
    }
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function clear(node) {
  if (node) node.textContent = "";
}

/* ── Global Component: Inline Code Pill ────────────────── */
export function renderCodePill(codeText) {
  const wrap = document.createElement("span");
  wrap.innerHTML = formatInlineCode(codeText.startsWith("`") ? codeText : `\`${codeText}\``);
  return wrap.firstElementChild || wrap;
}

/* ── Global Component: Badge Tag List ──────────────────── */
export function badgesHtml(tags = []) {
  return (tags || [])
    .map((t) => `<span class="badge badge-${escapeAttr(t)}">${escapeHtml(t)}</span>`)
    .join("");
}

export function flavorHtml(diff) {
  if (!diff) return "";
  return `<span class="flavor flavor-${escapeAttr(diff)}">${escapeHtml(diff)}</span>`;
}

/* ── Global Component: Relevance & Difficulty Meter ───── */
export function starsHtml(n, max = 10, variant = "compact") {
  const r = Math.max(0, Math.min(max, Number(n) || 0));
  const level = r >= 8 ? "peak" : r >= 6 ? "high" : r >= 5 ? "mid" : "low";
  const segs = segmentsHtml(r, max);
  const heatHint =
    r <= 4 ? "Low priority (grey)"
    : r === 5 ? "Medium (yellow)"
    : r <= 7 ? "Elevated (orange)"
    : "High priority (red)";
  if (variant === "compact") {
    return `<span class="rel-meter rel-compact rel-${level} rel-n-${r}" title="Relevance ${r}/10 — ${heatHint}">` +
      `<span class="rel-segs rel-segs-mini" aria-hidden="true">${segs}</span>` +
      `<span class="rel-pill">${r}</span></span>`;
  }
  if (variant === "full") {
    return `<div class="rel-meter rel-full rel-${level} rel-n-${r}" title="Relevance ${r}/10">` +
      `<div class="rel-full-label"><span>Relevance</span><strong>${r}<span class="rel-max">/10</span></strong></div>` +
      `<span class="rel-segs rel-segs-full" aria-hidden="true">${segs}</span>` +
      `</div>`;
  }
  return `<span class="rel-meter rel-bar rel-${level} rel-n-${r}" title="Relevance ${r}/10">` +
    `<span class="rel-segs" aria-hidden="true">${segs}</span>` +
    `<span class="rel-pill">${r}</span></span>`;
}

function segmentsHtml(filled, max = 10) {
  let html = "";
  for (let i = 1; i <= max; i++) {
    html += `<i class="rel-seg${i <= filled ? " on" : ""}" style="--i:${i}"></i>`;
  }
  return html;
}

export function scoreBarHtml(score, max = 5, axis = "tech") {
  const s = Math.max(0, Math.min(max, Number(score) || 0));
  const segs = segmentsHtml(s, max);
  const label = axis === "tech" ? "T" : "L";
  const full = axis === "tech" ? "Technical Difficulty" : "Insight Difficulty";
  return `<span class="rel-meter rel-compact score-axis-${axis}" title="${full}: ${s}/${max}">` +
    `<span class="rel-segs rel-segs-mini" aria-hidden="true">${segs}</span>` +
    `<span class="rel-pill">${label}${s}</span></span>`;
}

/* ── Global Component: Note Callout Box ─────────────────── */
export function renderNoteCallout({ type = "note", title = "", bodyHtml = "" }) {
  const callout = el("div", { className: `note-item note-${type}` });
  callout.innerHTML = `
    ${title ? `<div class="note-title">${escapeHtml(title)}</div>` : ""}
    <div class="note-body">${bodyHtml}</div>
  `;
  return callout;
}

/* ── Global Component: Score Indicator Pill ────────────── */
export function renderScorePill(correct, total, label = "Skóre") {
  const pill = el("div", { className: "score-indicator-pill", style: "font-size:14px; font-weight:700; color:var(--syntax-string, #ce9178);" });
  pill.innerHTML = `${escapeHtml(label)}: <span class="score-val">${correct} / ${total}</span>`;
  return pill;
}

/* ── Global Component: Modal Overlay Window ─────────────── */
export function renderModalOverlay({ id = "globalModal", title = "", bodyEl = null, footerBtns = [] }) {
  let modal = document.getElementById(id);
  if (!modal) {
    modal = el("div", { className: "modal-overlay hidden", id });
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>${escapeHtml(title)}</h3>
        <button type="button" class="btn-close-modal" aria-label="Zavřít">✕</button>
      </div>
      <div class="modal-body"></div>
      <div class="modal-footer"></div>
    </div>
  `;

  const bodyContainer = modal.querySelector(".modal-body");
  if (bodyEl) bodyContainer.appendChild(bodyEl);

  const footerContainer = modal.querySelector(".modal-footer");
  footerBtns.forEach((btnConfig) => {
    const btn = el("button", {
      type: "button",
      className: `btn ${btnConfig.primary ? "primary" : ""}`,
      onClick: btnConfig.onClick,
    }, btnConfig.label);
    footerContainer.appendChild(btn);
  });

  const closeModal = () => modal.classList.add("hidden");
  modal.querySelector(".btn-close-modal")?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  return {
    modal,
    open: () => modal.classList.remove("hidden"),
    close: closeModal,
  };
}

/* ── String Escaping Helpers ────────────────────────────── */
export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

/* ── SVG Icon Library ──────────────────────────────────── */
export function svgChevron() {
  return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l4 4-4 4V4z"/></svg>`;
}
export function svgFolder() {
  return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3.5l1 1.5H13A1.5 1.5 0 0 1 14.5 5v7A1.5 1.5 0 0 1 13 13.5H3A1.5 1.5 0 0 1 1.5 12V3.5z"/></svg>`;
}
export function svgFile() {
  return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 1.5A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8a1.5 1.5 0 0 0 1.5-1.5V5.5L10 1.5H4zm6 1.2L12.3 5H10V2.7z"/></svg>`;
}
export function svgExercise() {
  return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 2.5h10v1H3zm0 3h10v1H3zm0 3h7v1H3zm0 3h10v1H3z"/></svg>`;
}
export function svgPage() {
  return `<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2.2"/></svg>`;
}
export function svgClose() {
  return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.2 4.2l7.6 7.6m0-7.6L4.2 11.8" stroke="currentColor" stroke-width="1.4"/></svg>`;
}
