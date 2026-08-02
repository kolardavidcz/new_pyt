#!/usr/bin/env node
/**
 * Build a static `public/` tree for Vercel.
 *
 * Layout served at the site root:
 *   /              → app/index.html
 *   /app/*         → app/*
 *   /data/*        → data/*
 *   /cjs/*         → .old/cjs/*
 *   /vyuka_downloaded/* → .old/vyuka_downloaded/*
 *
 * Run: node tools/prepare_vercel.mjs
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const PUB = join(ROOT, "public");

function mustExist(rel) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) {
    console.error(`Missing required path: ${rel}`);
    process.exit(1);
  }
  return p;
}

function copyDir(srcRel, destRel) {
  const src = mustExist(srcRel);
  const dest = join(PUB, destRel);
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`  ✓ ${srcRel} → public/${destRel}`);
}

function countFiles(dir) {
  let n = 0;
  const walk = (d) => {
    try {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        try {
          if (statSync(p).isDirectory()) walk(p);
          else n++;
        } catch {
          // ignore broken symlink / missing target
        }
      }
    } catch {
      // ignore unreadable directory
    }
  };
  if (existsSync(dir)) walk(dir);
  return n;
}

function optionalCopyDir(srcRel, destRel) {
  const src = join(ROOT, srcRel);
  const dest = join(PUB, destRel);
  if (existsSync(src)) {
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
    console.log(`  ✓ ${srcRel} → public/${destRel}`);
  } else {
    console.log(`  - ${srcRel} not present (preserving prebuilt public/${destRel})`);
  }
}

console.log("Preparing public/ for Vercel …");

mkdirSync(PUB, { recursive: true });

copyDir("app", "app");
copyDir("data", "data");
optionalCopyDir(join(".old", "cjs"), "cjs");
optionalCopyDir(join(".old", "vyuka_downloaded"), "vyuka_downloaded");
optionalCopyDir("cjs", "cjs");
optionalCopyDir("vyuka_downloaded", "vyuka_downloaded");

// ── Build Optimization: CSS Bundling, Minification & JSON Compression ─

function minifyCss(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "") // Strip CSS comments
    .replace(/\s+/g, " ")             // Collapse whitespace
    .replace(/\s*([\{\}:;,])\s*/g, "$1") // Strip spaces around syntax characters
    .replace(/;\}/g, "}")            // Strip trailing semicolons before closing brace
    .trim();
}

function minifyJsonFile(filePath) {
  try {
    const raw = readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);
    writeFileSync(filePath, JSON.stringify(json), "utf8");
    return true;
  } catch {
    return false;
  }
}

function processOptimizations() {
  console.log("  ⚡ Running build optimizations & minification …");
  let minifiedJsonCount = 0;
  let cssBytesSaved = 0;

  // 1. Minify JSON files in data/
  const dataDir = join(PUB, "data");
  if (existsSync(dataDir)) {
    const walkJson = (d) => {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        if (statSync(p).isDirectory()) {
          walkJson(p);
        } else if (name.endsWith(".json")) {
          if (minifyJsonFile(p)) minifiedJsonCount++;
        }
      }
    };
    walkJson(dataDir);
  }

  // 2. Bundle & Minify CSS files in app/css/
  const cssDir = join(PUB, "app", "css");
  if (existsSync(cssDir)) {
    const cssFiles = ["tokens.css", "shell.css", "syntax.css", "content.css", "print.css"];
    let bundledContent = "";

    for (const f of cssFiles) {
      const p = join(cssDir, f);
      if (existsSync(p)) {
        const raw = readFileSync(p, "utf8");
        const minified = minifyCss(raw);
        cssBytesSaved += (raw.length - minified.length);
        writeFileSync(p, minified, "utf8");
        bundledContent += minified + "\n";
      }
    }

    // Write minified combined bundle
    writeFileSync(join(cssDir, "bundle.min.css"), bundledContent.trim(), "utf8");
    console.log(`  ✓ Bundled & minified ${cssFiles.length} CSS files into public/app/css/bundle.min.css`);
  }

  console.log(`  ✓ Minified ${minifiedJsonCount} JSON data files`);
  console.log(`  ✓ Saved ${(cssBytesSaved / 1024).toFixed(1)} KB of CSS payload`);
}

processOptimizations();

// Root index so `/` works without rewrites (rewrites still set as backup)
if (existsSync(join(PUB, "app", "index.html"))) {
  cpSync(join(PUB, "app", "index.html"), join(PUB, "index.html"));
  console.log("  ✓ app/index.html → public/index.html");
}

// Favicon if present
const fav = join(PUB, "app", "favicon.ico");
if (existsSync(fav)) {
  cpSync(fav, join(PUB, "favicon.ico"));
}

// Lightweight deploy stamp (debug)
writeFileSync(
  join(PUB, "deploy.json"),
  JSON.stringify(
    {
      builtAt: new Date().toISOString(),
      files: countFiles(PUB),
      note: "Generated by tools/prepare_vercel.mjs — do not edit",
    },
    null,
    2,
  ) + "\n",
  "utf8",
);

console.log(`Done. public/ has ${countFiles(PUB)} files.`);
console.log(`Output: ${relative(ROOT, PUB) || "public"}`);
