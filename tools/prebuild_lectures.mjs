#!/usr/bin/env node
/**
 * Build-Time Static Slide Pre-Rendering ("Static Shell + Dynamic Dojo")
 * Pre-parses HTML lecture files into optimized JSON slide trees during build time.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const PUB_DIR = join(ROOT, "public");
const LECTURES_OUT_DIR = join(PUB_DIR, "data", "lectures");
const QUIZZES_OUT_DIR = join(PUB_DIR, "data", "quizzes");

mkdirSync(LECTURES_OUT_DIR, { recursive: true });
mkdirSync(QUIZZES_OUT_DIR, { recursive: true });

console.log("⚡ Pre-building Quiz Chunks and Static Lectures...");

// 1. SPLIT QUIZZES.JSON INTO PER-DECK JSON CHUNKS
const quizFile = join(ROOT, "data", "quizzes.json");
if (existsSync(quizFile)) {
  try {
    const rawQuizzes = JSON.parse(readFileSync(quizFile, "utf-8"));
    let count = 0;
    for (const [deckKey, questions] of Object.entries(rawQuizzes)) {
      if (deckKey && Array.isArray(questions)) {
        const outPath = join(QUIZZES_OUT_DIR, `${deckKey}.json`);
        writeFileSync(outPath, JSON.stringify(questions, null, 2), "utf-8");
        count++;
      }
    }
    console.log(`  ✓ Split quizzes.json into ${count} per-deck static quiz chunks in public/data/quizzes/`);
  } catch (err) {
    console.error("  ❌ Error splitting quizzes:", err);
  }
}

// 2. PRE-RENDER LECTURE HTML FILES TO JSON SLIDES
function findHtmlFiles(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    try {
      if (statSync(full).isDirectory()) {
        findHtmlFiles(full, fileList);
      } else if (name.endsWith(".html") || name.endsWith(".htm")) {
        fileList.push(full);
      }
    } catch { /* ignore */ }
  }
  return fileList;
}

const htmlSources = [
  join(ROOT, "public", "vyuka_downloaded"),
  join(ROOT, "vyuka_downloaded"),
  join(ROOT, ".old", "vyuka_downloaded"),
];

let htmlFiles = [];
for (const s of htmlSources) {
  findHtmlFiles(s, htmlFiles);
}

// Map unique files by canonical relative path
const fileMap = new Map();
for (const f of htmlFiles) {
  const norm = f.replace(/\\/g, "/");
  const relPath = norm.includes("vyuka_downloaded/")
    ? norm.split("vyuka_downloaded/").pop()
    : norm.split(/[/\\]/).pop();
  if (!fileMap.has(relPath)) {
    fileMap.set(relPath, f);
  }
}

// Load slide tags and difficulty metadata
let slidesMetadata = {};
const slidesJsonPath = join(ROOT, "data", "slides.json");
if (existsSync(slidesJsonPath)) {
  try {
    slidesMetadata = JSON.parse(readFileSync(slidesJsonPath, "utf-8"));
  } catch (err) {
    console.error("  ❌ Error reading slides.json metadata:", err);
  }
}

let prebuiltCount = 0;
for (const [relPath, filePath] of fileMap.entries()) {
  try {
    const htmlContent = readFileSync(filePath, "utf-8");
    const cleanRel = relPath.replace(/\.html?$/, "");
    const pathSlug = cleanRel.replace(/[\/\\]/g, "--");
    const baseName = filePath.split(/[/\\]/).pop().replace(/\.html?$/, "");
    
    // Extract section chunks
    const slides = [];
    const sectionRegex = /<section[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/section>/gi;
    let match;
    let idx = 0;

    while ((match = sectionRegex.exec(htmlContent)) !== null) {
      const sectionId = match[1];
      const sectionInner = match[2];
      
      // Extract title header if present
      const hMatch = sectionInner.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
      const title = hMatch ? hMatch[1].replace(/<[^>]+>/g, "").trim() : `Section ${idx + 1}`;

      // Check metadata with multiple key variants
      const candidateKeys = [
        `${cleanRel}#${sectionId}`,
        `${pathSlug}#${sectionId}`,
        `${baseName}#${sectionId}`,
      ];
      let slideMeta = null;
      for (const ck of candidateKeys) {
        if (slidesMetadata[ck]) {
          slideMeta = slidesMetadata[ck];
          break;
        }
      }

      const tags = (slideMeta && Array.isArray(slideMeta.tags)) ? slideMeta.tags : [];
      const diff = (slideMeta && typeof slideMeta === "object") ? (slideMeta.diff || null) : (typeof slideMeta === "string" ? slideMeta : null);
      const alreadyStudiedIn = (slideMeta && typeof slideMeta === "object") ? (slideMeta.already_studied_in || null) : null;

      slides.push({
        id: sectionId,
        idx,
        title,
        tags,
        diff,
        already_studied_in: alreadyStudiedIn,
        html: sectionInner,
      });
      idx++;
    }

    if (slides.length > 0) {
      const payload = JSON.stringify({ slug: pathSlug, total: slides.length, slides }, null, 2);
      
      // Primary: write pathSlug-based JSON (e.g. materialy--python--sorting--overview.json)
      writeFileSync(join(LECTURES_OUT_DIR, `${pathSlug}.json`), payload, "utf-8");
      
      // Secondary: also write baseName if it's not a known duplicate/collision
      const collisions = ["overview", "basics", "fp", "coroutines", "decorators", "example-1", "magic", "pnm", "procvicovani.2", "_comprehensions"];
      if (!collisions.includes(baseName)) {
        writeFileSync(join(LECTURES_OUT_DIR, `${baseName}.json`), payload, "utf-8");
      }

      prebuiltCount++;
    }
  } catch { /* ignore */ }
}

console.log(`  ✓ Pre-rendered ${prebuiltCount} static lecture slide trees into public/data/lectures/`);
