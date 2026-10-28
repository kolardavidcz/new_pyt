#!/usr/bin/env node
/**
 * newpyt — HTML-to-Markdown Lecture Decompiler
 * Decompiles legacy prebuilt lectures (data/lectures/<slug>.json) into clean, modern Markdown (content/<path>.md).
 * 
 * Usage:
 *   node tools/decompile_lecture.mjs [slug or path]
 *   node tools/decompile_lecture.mjs --all
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const LECTURES_DIR = join(ROOT, "data", "lectures");
const CONTENT_DIR = join(ROOT, "content");
const COURSE_FILE = join(ROOT, "data", "course.json");

/**
 * Decode common HTML entities
 */
function decodeEntities(str) {
  if (!str) return "";
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

/**
 * Convert HTML inner content of a slide into clean, idiomatic Markdown
 */
function htmlToMarkdown(html) {
  if (!html) return "";

  let s = html.replace(/\r\n/g, "\n");

  // 1. Remove section header boilerplate
  s = s.replace(/<div class="section-header">[\s\S]*?<\/div>/gi, "");
  s = s.replace(/<div class="section-body">/gi, "");
  s = s.replace(/<\/div>\s*$/gi, "");

  // 2. Protect and convert code blocks (<pre class="brush: ..."><code>...</code></pre>)
  const codeBlocks = [];
  s = s.replace(/<pre[^>]*class=["'][^"']*brush:\s*([a-zA-Z0-9_-]+)[^"']*["'][^>]*>([\s\S]*?)<\/pre>/gi, (_, brush, code) => {
    const lang = (brush === "python" || brush === "py") ? "python"
      : (brush === "bash" || brush === "sh") ? "bash"
      : (brush === "plain" || brush === "text") ? "text"
      : brush;
    // Strip inner code tag if present
    let raw = code.replace(/^<code>|<\/code>$/gi, "");
    raw = decodeEntities(raw).trim();
    const idx = codeBlocks.length;
    codeBlocks.push(`\n\`\`\`${lang}\n${raw}\n\`\`\`\n`);
    return `___CODE_BLOCK_${idx}___`;
  });

  // Handle plain <pre> blocks
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
    let raw = code.replace(/^<code>|<\/code>$/gi, "");
    raw = decodeEntities(raw).trim();
    const idx = codeBlocks.length;
    codeBlocks.push(`\n\`\`\`python\n${raw}\n\`\`\`\n`);
    return `___CODE_BLOCK_${idx}___`;
  });

  // 3. Convert GFM-style note items / alerts
  s = s.replace(/<div class="note-item(?:\s+([a-zA-Z0-9_-]+))?"[^>]*>[\s\S]*?<div class="note-content">([\s\S]*?)<\/div>[\s\S]*?<\/div>/gi, (_, type, content) => {
    const alertType = (type === "warning") ? "WARNING"
      : (type === "important") ? "IMPORTANT"
      : (type === "tip") ? "TIP"
      : "NOTE";
    let body = htmlToMarkdown(content).trim();
    const alertLines = body.split("\n").map((l) => `> ${l}`).join("\n");
    return `\n> [!${alertType}]\n${alertLines}\n`;
  });

  // Remove wrapper notes-block
  s = s.replace(/<div class="notes-block">|<\/div>/gi, "");

  // 4. Headings
  s = s.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, t) => `\n### ${decodeEntities(t).trim()}\n`);
  s = s.replace(/<h4[^>]*>(.*?)<\/h4>/gi, (_, t) => `\n#### ${decodeEntities(t).trim()}\n`);
  s = s.replace(/<h5[^>]*>(.*?)<\/h5>/gi, (_, t) => `\n##### ${decodeEntities(t).trim()}\n`);

  // 5. Lists: <ul>, <ol>, <li>
  s = s.replace(/<li[^>]*>(.*?)<\/li>/gi, (_, item) => {
    const cleanItem = htmlToMarkdown(item).trim().replace(/\n+/g, " ");
    return `- ${cleanItem}\n`;
  });
  s = s.replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n");

  // 6. Inline code: <code>...</code>
  s = s.replace(/<code[^>]*>(.*?)<\/code>/gi, (_, c) => `\`${decodeEntities(c)}\``);

  // 7. Bold and Italic
  s = s.replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gi, (_, b) => `**${decodeEntities(b).trim()}**`);
  s = s.replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gi, (_, i) => `*${decodeEntities(i).trim()}*`);

  // 8. Links: <a href="...">...</a>
  s = s.replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (_, href, text) => {
    const cleanHref = href.trim();
    const cleanText = decodeEntities(text).trim();
    return `[${cleanText}](${cleanHref})`;
  });

  // 9. Blockquotes: <blockquote>...</blockquote>
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, bq) => {
    const inner = htmlToMarkdown(bq).trim();
    return "\n" + inner.split("\n").map((l) => `> ${l}`).join("\n") + "\n";
  });

  // 10. Paragraphs and breaks
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, p) => `\n${p.trim()}\n`);
  s = s.replace(/<br\s*\/?>/gi, "\n");

  // 11. Tables
  s = s.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableHtml) => {
    const rows = [];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    while ((trMatch = trRegex.exec(tableHtml)) !== null) {
      const cells = [];
      const thTdRegex = /<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi;
      let cellMatch;
      while ((cellMatch = thTdRegex.exec(trMatch[1])) !== null) {
        cells.push(htmlToMarkdown(cellMatch[1]).trim().replace(/\|/g, "\\|"));
      }
      if (cells.length) rows.push(cells);
    }
    if (!rows.length) return "";
    let tableMd = "\n| " + rows[0].join(" | ") + " |\n";
    tableMd += "| " + rows[0].map(() => "---").join(" | ") + " |\n";
    for (let r = 1; r < rows.length; r++) {
      tableMd += "| " + rows[r].join(" | ") + " |\n";
    }
    return tableMd + "\n";
  });

  // 12. Strip any remaining unknown HTML tags
  s = s.replace(/<[^>]+>/g, "");

  // 13. Restore code blocks
  for (let idx = 0; idx < codeBlocks.length; idx++) {
    s = s.replace(`___CODE_BLOCK_${idx}___`, codeBlocks[idx]);
  }

  // 14. Normalize whitespace
  s = decodeEntities(s);
  s = s.replace(/\n{3,}/g, "\n\n").trim();

  return s;
}

/**
 * Decompile a lecture JSON file into Markdown
 */
export function decompileLectureFile(lectureJsonPath, targetRelPath) {
  if (!existsSync(lectureJsonPath)) {
    console.error(`❌ Lecture JSON not found: ${lectureJsonPath}`);
    return false;
  }

  const raw = JSON.parse(readFileSync(lectureJsonPath, "utf-8"));
  const slides = raw.slides || [];
  if (!slides.length) {
    console.warn(`⚠️ Lecture has 0 slides: ${lectureJsonPath}`);
    return false;
  }

  const cleanSlug = raw.slug || targetRelPath.replace(/[\/\\]/g, "--");
  const lines = [
    `<!-- lecture: slug="${cleanSlug}" path="${targetRelPath}" -->`,
    "",
  ];

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const tagsStr = (s.tags && s.tags.length) ? s.tags.join(",") : "Core";
    const diffStr = s.diff || "basics";
    const metaParts = [`id=${s.id}`, `title="${s.title || `Sekce ${i + 1}`}"`, `tags="${tagsStr}"`, `diff="${diffStr}"`];
    if (s.already_studied_in) metaParts.push(`already_studied_in="${s.already_studied_in}"`);

    lines.push(`<!-- slide: ${metaParts.join(" ")} -->`);
    lines.push(`## ${s.title || `Sekce ${i + 1}`}`);
    lines.push("");

    const mdBody = htmlToMarkdown(s.html || "");
    lines.push(mdBody);
    lines.push("");

    if (i < slides.length - 1) {
      lines.push("---");
      lines.push("");
    }
  }

  const targetMdPath = join(CONTENT_DIR, `${targetRelPath}.md`);
  mkdirSync(dirname(targetMdPath), { recursive: true });
  writeFileSync(targetMdPath, lines.join("\n"), "utf-8");
  console.log(`  ✓ Decompiled: ${targetRelPath}.md (${slides.length} slides)`);
  return true;
}

// CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = process.argv[2];
  if (!arg || arg === "--all") {
    console.log("⚡ Decompiling all course lectures to content/…");
    if (!existsSync(COURSE_FILE)) {
      console.error(`Missing course file: ${COURSE_FILE}`);
      process.exit(1);
    }
    const course = JSON.parse(readFileSync(COURSE_FILE, "utf-8"));
    let count = 0;
    for (const w of course.weeks || []) {
      for (const lec of w.lectures || []) {
        const cleanRel = lec.path ? lec.path.replace(/^.*?vyuka_downloaded\//, "").replace(/\.html?$/, "") : "";
        const slug = cleanRel.replace(/[\/\\]/g, "--");
        const jsonPath = join(LECTURES_DIR, `${slug}.json`);
        if (existsSync(jsonPath)) {
          if (decompileLectureFile(jsonPath, cleanRel)) count++;
        }
      }
    }
    console.log(`✨ Done. Decompiled ${count} lectures to content/.`);
  } else {
    // Single file
    const cleanRel = arg.replace(/\.html?$/, "").replace(/\.json$/, "").replace(/\.md$/, "");
    const slug = cleanRel.replace(/[\/\\]/g, "--");
    const jsonPath = join(LECTURES_DIR, `${slug}.json`);
    decompileLectureFile(jsonPath, cleanRel);
  }
}
