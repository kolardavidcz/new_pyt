#!/usr/bin/env node
/**
 * 6-Variant WCAG 2.1 AA Color Contrast Audit Tool for Python Course Hub.
 * Strictly tests all 6 Theme & Code Block Permutations + UI Screens.
 */

function hexToRgb(hex) {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
}

function getsRGB(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function getLuminance(rgb) {
  const r = getsRGB(rgb[0]);
  const g = getsRGB(rgb[1]);
  const b = getsRGB(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hexToRgb(hex1));
  const l2 = getLuminance(hexToRgb(hex2));
  const max = Math.max(l1, l2);
  const min = Math.min(l1, l2);
  return (max + 0.05) / (min + 0.05);
}

const TESTS = [
  // ── VARIANT 1: Dark Web Theme + Dark Code Block ─────────────────────────
  { category: "Variant 1: Dark Web + Dark Code", label: "Dark Code Comment (#6A9955 on #1E1E1E)", fg: "#6a9955", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 1: Dark Web + Dark Code", label: "Dark Code String (#CE9178 on #1E1E1E)", fg: "#ce9178", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 1: Dark Web + Dark Code", label: "Dark Code Keyword (#569CD6 on #1E1E1E)", fg: "#569cd6", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 1: Dark Web + Dark Code", label: "Dark Code Function (#DCDCAA on #1E1E1E)", fg: "#dcdcaa", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 1: Dark Web + Dark Code", label: "Dark Code Number (#B5CEA8 on #1E1E1E)", fg: "#b5cea8", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 1: Dark Web + Dark Code", label: "Dark Code Builtin (#4EC9B0 on #1E1E1E)", fg: "#4ec9b0", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 1: Dark Web + Dark Code", label: "Dark Code Prompt (#38BDF8 on #1E1E1E)", fg: "#38bdf8", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 1: Dark Web + Dark Code", label: "Dark Code Base Text (#D4D4D4 on #1E1E1E)", fg: "#d4d4d4", bg: "#1e1e1e", target: 7.0 },

  // ── VARIANT 2: Dark Web Theme + Light Code Block ────────────────────────
  { category: "Variant 2: Dark Web + Light Code", label: "Light Code Comment (#008000 on #F8F9FA)", fg: "#008000", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 2: Dark Web + Light Code", label: "Light Code String (#A31515 on #F8F9FA)", fg: "#a31515", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 2: Dark Web + Light Code", label: "Light Code Keyword (#0000FF on #F8F9FA)", fg: "#0000ff", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 2: Dark Web + Light Code", label: "Light Code Function (#795E26 on #F8F9FA)", fg: "#795e26", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 2: Dark Web + Light Code", label: "Light Code Prompt (#0369A1 on #F8F9FA)", fg: "#0369a1", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 2: Dark Web + Light Code", label: "Light Code Base Text (#1F2937 on #F8F9FA)", fg: "#1f2937", bg: "#f8f9fa", target: 7.0 },

  // ── VARIANT 3: Light Web Theme + Dark Code Block ────────────────────────
  { category: "Variant 3: Light Web + Dark Code", label: "Dark Code Comment (#6A9955 on #1E1E1E)", fg: "#6a9955", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 3: Light Web + Dark Code", label: "Dark Code String (#CE9178 on #1E1E1E)", fg: "#ce9178", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 3: Light Web + Dark Code", label: "Dark Code Keyword (#569CD6 on #1E1E1E)", fg: "#569cd6", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 3: Light Web + Dark Code", label: "Dark Code Function (#DCDCAA on #1E1E1E)", fg: "#dcdcaa", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 3: Light Web + Dark Code", label: "Dark Code Prompt (#38BDF8 on #1E1E1E)", fg: "#38bdf8", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 3: Light Web + Dark Code", label: "Dark Code Base Text (#D4D4D4 on #1E1E1E)", fg: "#d4d4d4", bg: "#1e1e1e", target: 7.0 },

  // ── VARIANT 4: Light Web Theme + Light Code Block ───────────────────────
  { category: "Variant 4: Light Web + Light Code", label: "Light Code Comment (#008000 on #F8F9FA)", fg: "#008000", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 4: Light Web + Light Code", label: "Light Code String (#A31515 on #F8F9FA)", fg: "#a31515", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 4: Light Web + Light Code", label: "Light Code Keyword (#0000FF on #F8F9FA)", fg: "#0000ff", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 4: Light Web + Light Code", label: "Light Code Function (#795E26 on #F8F9FA)", fg: "#795e26", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 4: Light Web + Light Code", label: "Light Code Prompt (#0369A1 on #F8F9FA)", fg: "#0369a1", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 4: Light Web + Light Code", label: "Light Code Base Text (#1F2937 on #F8F9FA)", fg: "#1f2937", bg: "#f8f9fa", target: 7.0 },

  // ── VARIANT 5: Print View + Dark Code Block ─────────────────────────────
  { category: "Variant 5: Print View + Dark Code", label: "Print Dark Code Comment (#6A9955 on #1E1E1E)", fg: "#6a9955", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 5: Print View + Dark Code", label: "Print Dark Code String (#CE9178 on #1E1E1E)", fg: "#ce9178", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 5: Print View + Dark Code", label: "Print Dark Code Keyword (#569CD6 on #1E1E1E)", fg: "#569cd6", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 5: Print View + Dark Code", label: "Print Dark Code Function (#DCDCAA on #1E1E1E)", fg: "#dcdcaa", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 5: Print View + Dark Code", label: "Print Dark Code Prompt (#38BDF8 on #1E1E1E)", fg: "#38bdf8", bg: "#1e1e1e", target: 4.5 },
  { category: "Variant 5: Print View + Dark Code", label: "Print Dark Code Base Text (#D4D4D4 on #1E1E1E)", fg: "#d4d4d4", bg: "#1e1e1e", target: 7.0 },

  // ── VARIANT 6: Print View + Light Code Block ────────────────────────────
  { category: "Variant 6: Print View + Light Code", label: "Print Light Code Comment (#008000 on #F8F9FA)", fg: "#008000", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 6: Print View + Light Code", label: "Print Light Code String (#B45309 on #F8F9FA)", fg: "#b45309", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 6: Print View + Light Code", label: "Print Light Code Keyword (#0000FF on #F8F9FA)", fg: "#0000ff", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 6: Print View + Light Code", label: "Print Light Code Function (#795E26 on #F8F9FA)", fg: "#795e26", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 6: Print View + Light Code", label: "Print Light Code Prompt (#0369A1 on #F8F9FA)", fg: "#0369a1", bg: "#f8f9fa", target: 4.5 },
  { category: "Variant 6: Print View + Light Code", label: "Print Light Code Base Text (#1F2937 on #F8F9FA)", fg: "#1f2937", bg: "#f8f9fa", target: 7.0 },

  // ── General Document & UI Elements ──────────────────────────────────────
  { category: "Document Body & UI Chrome", label: "Dark UI Main Text (#CCCCCC on #1F1F1F)", fg: "#cccccc", bg: "#1f1f1f", target: 7.0 },
  { category: "Document Body & UI Chrome", label: "Dark UI Bold Text (#E8E8E8 on #1F1F1F)", fg: "#e8e8e8", bg: "#1f1f1f", target: 7.0 },
  { category: "Document Body & UI Chrome", label: "Dark UI Inline Code Pill (#DCDCAA on #2D2D2D)", fg: "#dcdcaa", bg: "#2d2d2d", target: 4.5 },
  { category: "Document Body & UI Chrome", label: "Light UI Main Text (#1F2937 on White)", fg: "#1f2937", bg: "#ffffff", target: 7.0 },
  { category: "Document Body & UI Chrome", label: "Light UI Bold Text (#000000 on White)", fg: "#000000", bg: "#ffffff", target: 7.0 },
  { category: "Document Body & UI Chrome", label: "Light UI Inline Code Pill (#0369A1 on #F3F4F6)", fg: "#0369a1", bg: "#f3f4f6", target: 4.5 },
  { category: "Document Body & UI Chrome", label: "Light UI Quiz Number Token (#098658 on White)", fg: "#098658", bg: "#ffffff", target: 4.5 },
  { category: "Document Body & UI Chrome", label: "Light UI Quiz String Token (#A31515 on White)", fg: "#a31515", bg: "#ffffff", target: 4.5 },
  { category: "Document Body & UI Chrome", label: "Light UI Quiz Operator Token (#1F2937 on White)", fg: "#1f2937", bg: "#ffffff", target: 7.0 },
  { category: "Document Body & UI Chrome", label: "Print Document Headings (#000000 on White)", fg: "#000000", bg: "#ffffff", target: 7.0 },
  { category: "Document Body & UI Chrome", label: "Print Document Body Text (#111827 on White)", fg: "#111827", bg: "#ffffff", target: 7.0 },
];

console.log("🔍 Running 6-Variant WCAG 2.1 AA Color Contrast Audit …\n");

let passed = 0;
let failed = 0;
let lastCat = "";

for (const t of TESTS) {
  if (t.category !== lastCat) {
    console.log(`--- ${t.category} ---`);
    lastCat = t.category;
  }
  const ratio = getContrastRatio(t.fg, t.bg);
  const isPass = ratio >= t.target;
  const statusStr = isPass ? "PASS" : "FAIL";
  if (isPass) passed++;
  else failed++;

  console.log(
    `  [${statusStr}] ${t.label.padEnd(52)} -> ${ratio.toFixed(2)}:1 (Target >= ${t.target}:1)`
  );
}

console.log(`\nAudit Complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
