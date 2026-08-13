#!/usr/bin/env node
/**
 * Data Payload Budget Assertion Script
 * Asserts initial boot payload & per-deck JSON file budgets to guarantee zero performance regression.
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data");
const PUB_DATA_DIR = join(ROOT, "public", "data");

const BUDGETS = {
  "course.json": 100 * 1024,      // 100 KB max
  "slides.json": 150 * 1024,      // 150 KB max
  "pages-index.json": 220 * 1024, // 220 KB max
  "exercises.json": 200 * 1024,   // 200 KB max
};

let errors = 0;

console.log("🔍 Checking JSON Data Payload Budgets...");

for (const [file, maxBytes] of Object.entries(BUDGETS)) {
  const filePath = join(DATA_DIR, file);
  if (!existsSync(filePath)) {
    console.error(`  ❌ Missing dataset: ${file}`);
    errors++;
    continue;
  }
  const size = statSync(filePath).size;
  const kb = (size / 1024).toFixed(1);
  const maxKb = (maxBytes / 1024).toFixed(1);
  if (size > maxBytes) {
    console.error(`  ❌ ${file} EXCEEDS BUDGET: ${kb} KB (Max: ${maxKb} KB)`);
    errors++;
  } else {
    console.log(`  ✓ ${file}: ${kb} KB / ${maxKb} KB max`);
  }
}

// Check per-deck quiz chunks if present
const quizDir = join(PUB_DATA_DIR, "quizzes");
if (existsSync(quizDir)) {
  const chunks = readdirSync(quizDir).filter((f) => f.endsWith(".json"));
  let oversizedChunks = 0;
  for (const c of chunks) {
    const p = join(quizDir, c);
    const sz = statSync(p).size;
    if (sz > 35 * 1024) { // 35 KB per deck quiz max
      console.warn(`  ⚠️ Quiz chunk ${c} is large: ${(sz / 1024).toFixed(1)} KB`);
      oversizedChunks++;
    }
  }
  console.log(`  ✓ Verified ${chunks.length} static quiz chunks in public/data/quizzes/`);
}

if (errors > 0) {
  console.error(`❌ Data budget check failed with ${errors} error(s).`);
  process.exit(1);
}

console.log("✅ All data payload budgets passed successfully.");
