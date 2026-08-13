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
  join(ROOT, ".old", "vyuka_downloaded"),
  join(ROOT, "public", "vyuka_downloaded"),
  join(ROOT, "vyuka_downloaded")
];

let htmlFiles = [];
for (const s of htmlSources) {
  findHtmlFiles(s, htmlFiles);
}

// Unique files by basename/slug
const fileMap = new Map();
for (const f of htmlFiles) {
  const name = f.split(/[/\\]/).pop().replace(/\.html?$/, "");
  if (!fileMap.has(name)) {
    fileMap.set(name, f);
  }
}

let prebuiltCount = 0;
for (const [slug, filePath] of fileMap.entries()) {
  try {
    const htmlContent = readFileSync(filePath, "utf-8");
    
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

      slides.push({
        id: sectionId,
        idx,
        title,
        html: sectionInner,
      });
      idx++;
    }

    if (slides.length > 0) {
      const outPath = join(LECTURES_OUT_DIR, `${slug}.json`);
      writeFileSync(outPath, JSON.stringify({ slug, total: slides.length, slides }, null, 2), "utf-8");
      prebuiltCount++;
    }
  } catch { /* ignore */ }
}

console.log(`  ✓ Pre-rendered ${prebuiltCount} static lecture slide trees into public/data/lectures/`);
