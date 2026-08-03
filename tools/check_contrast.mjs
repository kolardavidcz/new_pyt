#!/usr/bin/env node
/**
 * Comprehensive WCAG 2.1 Color Contrast Audit Tool for Python Hub.
 * Tests Dark Theme Screen, Light Theme Screen, and Print Mode stylesheets.
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
  // ── 1. PRINT MODE DOCUMENT (Paper = #FFFFFF) ───────────────────────────
  { category: "Print Mode", label: "Print Headings (#000000 on White)", fg: "#000000", bg: "#ffffff", target: 7.0 },
  { category: "Print Mode", label: "Print Body Text (#111827 on White)", fg: "#111827", bg: "#ffffff", target: 7.0 },
  { category: "Print Mode", label: "Print Bold Text [strong/b] (#000000 on White)", fg: "#000000", bg: "#ffffff", target: 7.0 },
  { category: "Print Mode", label: "Print Italic Text [em/i] (#111827 on White)", fg: "#111827", bg: "#ffffff", target: 7.0 },
  { category: "Print Mode", label: "Print Subscript/Superscript [sub/sup] (#111827 on White)", fg: "#111827", bg: "#ffffff", target: 7.0 },
  { category: "Print Mode", label: "Print Highlighted Text [mark] (#000000 on #FEF08A)", fg: "#000000", bg: "#fef08a", target: 7.0 },
  { category: "Print Mode", label: "Print Note Callout Text (#111827 on #F3F4F6)", fg: "#111827", bg: "#f3f4f6", target: 7.0 },
  { category: "Print Mode", label: "Print Lecture Description (#111827 on White)", fg: "#111827", bg: "#ffffff", target: 7.0 },
  { category: "Print Mode", label: "Print C++/Java Comparison Text (#111827 on White)", fg: "#111827", bg: "#ffffff", target: 7.0 },
  { category: "Print Mode", label: "Print Inline Code Text (#8B1014 on #F3F4F6)", fg: "#8b1014", bg: "#f3f4f6", target: 4.5 },
  { category: "Print Mode", label: "Print Subtitle/Metadata (#374151 on White)", fg: "#374151", bg: "#ffffff", target: 7.0 },
  { category: "Print Mode", label: "Print Link Text (#0369A1 on White)", fg: "#0369a1", bg: "#ffffff", target: 4.5 },

  // ── 2. DARK CODE BLOCK TOKENS (Background = #1E1E1E) ─────────────────
  { category: "Dark Code", label: "Dark Code Comment (#6A9955 on #1E1E1E)", fg: "#6a9955", bg: "#1e1e1e", target: 4.5 },
  { category: "Dark Code", label: "Dark Code String (#CE9178 on #1E1E1E)", fg: "#ce9178", bg: "#1e1e1e", target: 4.5 },
  { category: "Dark Code", label: "Dark Code Keyword (#569CD6 on #1E1E1E)", fg: "#569cd6", bg: "#1e1e1e", target: 4.5 },
  { category: "Dark Code", label: "Dark Code Function (#DCDCAA on #1E1E1E)", fg: "#dcdcaa", bg: "#1e1e1e", target: 4.5 },
  { category: "Dark Code", label: "Dark Code Number (#B5CEA8 on #1E1E1E)", fg: "#b5cea8", bg: "#1e1e1e", target: 4.5 },
  { category: "Dark Code", label: "Dark Code Builtin (#4EC9B0 on #1E1E1E)", fg: "#4ec9b0", bg: "#1e1e1e", target: 4.5 },
  { category: "Dark Code", label: "Dark Code Base Text (#D4D4D4 on #1E1E1E)", fg: "#d4d4d4", bg: "#1e1e1e", target: 7.0 },

  // ── 3. LIGHT CODE BLOCK TOKENS (Background = #F8F9FA) ────────────────
  { category: "Light Code", label: "Light Code Comment (#008000 on #F8F9FA)", fg: "#008000", bg: "#f8f9fa", target: 4.5 },
  { category: "Light Code", label: "Light Code String (#A31515 on #F8F9FA)", fg: "#a31515", bg: "#f8f9fa", target: 4.5 },
  { category: "Light Code", label: "Light Code Keyword (#0000FF on #F8F9FA)", fg: "#0000ff", bg: "#f8f9fa", target: 4.5 },
  { category: "Light Code", label: "Light Code Function (#795E26 on #F8F9FA)", fg: "#795e26", bg: "#f8f9fa", target: 4.5 },
  { category: "Light Code", label: "Light Code Base Text (#1F2937 on #F8F9FA)", fg: "#1f2937", bg: "#f8f9fa", target: 7.0 },

  // ── 4. DARK UI SCREEN THEME (Editor Surface = #1F1F1F, Surface = #181818) ─
  { category: "Dark UI Screen", label: "Dark UI Main Text (#CCCCCC on #1F1F1F)", fg: "#cccccc", bg: "#1f1f1f", target: 7.0 },
  { category: "Dark UI Screen", label: "Dark UI Bold Text [strong/b] (#E8E8E8 on #1F1F1F)", fg: "#e8e8e8", bg: "#1f1f1f", target: 7.0 },
  { category: "Dark UI Screen", label: "Dark UI Inline Code Pill (#DCDCAA on #2D2D2D)", fg: "#dcdcaa", bg: "#2d2d2d", target: 4.5 },
  { category: "Dark UI Screen", label: "Dark UI Note Callout Text (#CCCCCC on #1E293B)", fg: "#cccccc", bg: "#1e293b", target: 7.0 },
  { category: "Dark UI Screen", label: "Dark UI Muted Text (#9D9D9D on #1F1F1F)", fg: "#9d9d9d", bg: "#1f1f1f", target: 4.5 },
  { category: "Dark UI Screen", label: "Dark UI Faint Text (#A0A0A0 on #181818)", fg: "#a0a0a0", bg: "#181818", target: 4.5 },
  { category: "Dark UI Screen", label: "Dark UI Accent Link (#38BDF8 on #1F1F1F)", fg: "#38bdf8", bg: "#1f1f1f", target: 4.5 },
  { category: "Dark UI Screen", label: "Dark UI Tag Core (#4EC9B0 on #181818)", fg: "#4ec9b0", bg: "#181818", target: 4.5 },
  { category: "Dark UI Screen", label: "Dark UI Tag WOW (#DCDCAA on #181818)", fg: "#dcdcaa", bg: "#181818", target: 4.5 },
  { category: "Dark UI Screen", label: "Dark UI Tag Legendary (#C586C0 on #181818)", fg: "#c586c0", bg: "#181818", target: 4.5 },

  // ── 5. LIGHT UI SCREEN THEME (Editor Surface = #FFFFFF, Surface = #F3F3F3) ─
  { category: "Light UI Screen", label: "Light UI Main Text (#1F2937 on White)", fg: "#1f2937", bg: "#ffffff", target: 7.0 },
  { category: "Light UI Screen", label: "Light UI Bold Text [strong/b] (#000000 on White)", fg: "#000000", bg: "#ffffff", target: 7.0 },
  { category: "Light UI Screen", label: "Light UI Inline Code Pill (#8B1014 on #F3F4F6)", fg: "#8b1014", bg: "#f3f4f6", target: 4.5 },
  { category: "Light UI Screen", label: "Light UI Note Callout Text (#111827 on #EFF6FF)", fg: "#111827", bg: "#eff6ff", target: 7.0 },
  { category: "Light UI Screen", label: "Light UI Muted Text (#4B5563 on White)", fg: "#4b5563", bg: "#ffffff", target: 4.5 },
  { category: "Light UI Screen", label: "Light UI Accent Link (#007ACC on White)", fg: "#007acc", bg: "#ffffff", target: 4.5 },
];

console.log("🔍 Running Full WCAG 2.1 Color Contrast Audit …\n");

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
