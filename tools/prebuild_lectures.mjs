#!/usr/bin/env node
/**
 * Build-Time Static Slide Pre-Rendering ("Static Shell + Dynamic Dojo")
 * Pre-parses HTML lecture files into optimized JSON slide trees during build time.
 * Writes to both data/ and public/data/ to guarantee instant resolution in both local dev server and Vercel.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data");
const PUB_DIR = join(ROOT, "public");

const LECTURES_OUT_DIRS = [join(DATA_DIR, "lectures"), join(PUB_DIR, "data", "lectures")];
const QUIZZES_OUT_DIRS = [join(DATA_DIR, "quizzes"), join(PUB_DIR, "data", "quizzes")];

for (const d of [...LECTURES_OUT_DIRS, ...QUIZZES_OUT_DIRS]) {
  mkdirSync(d, { recursive: true });
}

console.log("⚡ Pre-building Quiz Chunks and Static Lectures...");

// 1. SPLIT QUIZZES.JSON INTO PER-DECK AND PER-WEEK JSON CHUNKS
const quizFile = join(ROOT, "data", "quizzes.json");
const courseFile = join(ROOT, "data", "course.json");

if (existsSync(quizFile)) {
  try {
    const rawQuizzes = JSON.parse(readFileSync(quizFile, "utf-8"));
    let count = 0;
    
    // Per-deck chunks
    for (const [deckKey, questions] of Object.entries(rawQuizzes)) {
      if (deckKey && Array.isArray(questions)) {
        const payload = JSON.stringify(questions, null, 2);
        for (const outDir of QUIZZES_OUT_DIRS) {
          writeFileSync(join(outDir, `${deckKey}.json`), payload, "utf-8");
        }
        count++;
      }
    }
    console.log(`  ✓ Split quizzes.json into ${count} per-deck static quiz chunks in data/quizzes/ and public/data/quizzes/`);

    // Per-week chunks (fallback compatibility)
    if (existsSync(courseFile)) {
      const course = JSON.parse(readFileSync(courseFile, "utf-8"));
      const weekDecks = {};
      
      for (const w of course.weeks || []) {
        const wNum = w.week;
        const wKey = `w${wNum}`;
        weekDecks[wKey] = {};
        
        for (const lec of w.lectures || []) {
          const dKey = lec.quiz_deck || lec.slug;
          if (dKey && rawQuizzes[dKey]) {
            weekDecks[wKey][dKey] = rawQuizzes[dKey];
          }
        }
      }
      
      for (const [wKey, decks] of Object.entries(weekDecks)) {
        const payload = JSON.stringify(decks, null, 2);
        for (const outDir of QUIZZES_OUT_DIRS) {
          writeFileSync(join(outDir, `${wKey}.json`), payload, "utf-8");
        }
      }
      console.log(`  ✓ Generated per-week fallback quiz bundles (w0..w13, w99)`);
    }
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
      
      // Write to both data/lectures and public/data/lectures
      for (const outDir of LECTURES_OUT_DIRS) {
        writeFileSync(join(outDir, `${pathSlug}.json`), payload, "utf-8");
        
        // Also write baseName if it's not a known duplicate collision
        const collisions = ["overview", "basics", "fp", "coroutines", "decorators", "example-1", "example-2", "magic", "pnm", "procvicovani.2", "_comprehensions"];
        if (!collisions.includes(baseName)) {
          writeFileSync(join(outDir, `${baseName}.json`), payload, "utf-8");
        }
      }

      prebuiltCount++;
    }
  } catch { /* ignore */ }
}

console.log(`  ✓ Pre-rendered ${prebuiltCount} static lecture slide trees into data/lectures/ and public/data/lectures/`);
