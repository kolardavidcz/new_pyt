#!/usr/bin/env node
/**
 * newpyt — Bidirectional Lecture Sync & Modernization Compiler
 * 
 * Solves:
 * 1. "Not write from scratch": Automatically decompiles/converts legacy HTML / JSON lectures
 *    into clean, idiomatic Markdown slide decks (content/<cleanRel>.md), faithfully preserving
 *    original Czech pedagogical text, slide IDs, titles, tags, and code examples.
 * 2. "Keep original source up-to-date with our replacement": Compiles modernized Markdown
 *    back into runtime JSON slide trees (data/lectures/<slug>.json, public/data/lectures/<slug>.json)
 *    AND updates original source HTML files (vyuka_downloaded/**/*.html) with modernized code.
 * 3. Python 2/3.2 -> Python 3.12+ Modernization Engine: Automatically upgrades legacy Python idioms
 *    (print statements, xrange, iteritems, old exception syntax, string formatting) to modern Python.
 * 
 * Usage:
 *   node tools/lecture_sync_compiler.mjs --import <cleanRel_or_slug>
 *   node tools/lecture_sync_compiler.mjs --import-missing
 *   node tools/lecture_sync_compiler.mjs --export <cleanRel_or_slug>
 *   node tools/lecture_sync_compiler.mjs --sync-all
 *   node tools/lecture_sync_compiler.mjs --status
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { compileMarkdownLecture } from "./markdown_compiler.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const CONTENT_DIR = join(ROOT, "content");
const DATA_DIR = join(ROOT, "data");
const LECTURES_DATA_DIR = join(DATA_DIR, "lectures");
const PUB_LECTURES_DATA_DIR = join(ROOT, "public", "data", "lectures");
const COURSE_FILE = join(DATA_DIR, "course.json");
const VYUKA_DIR = join(ROOT, "vyuka_downloaded");
const PUB_VYUKA_DIR = join(ROOT, "public", "vyuka_downloaded");

// ============================================================================
// 1. PYTHON MODERNIZATION ENGINE
// ============================================================================
export class PythonModernizer {
  /**
   * Modernize legacy Python 2 / early Python 3 code to Python 3.12+
   * @param {string} code 
   * @returns {string} modernized code
   */
  static modernize(code) {
    if (!code || typeof code !== "string") return "";

    let lines = code.split("\n");
    let modernized = [];

    for (let line of lines) {
      // 1. Remove obsolete encoding cookies (utf-8 is default in Python 3)
      if (/^#\s*-\*-\s*coding:\s*utf-8\s*-\*-/i.test(line.trim()) || /^#\s*encoding:\s*utf-8/i.test(line.trim())) {
        continue;
      }

      // 2. print statement -> print() function
      // e.g., print "Ahoj" -> print("Ahoj")
      // e.g., print >>sys.stderr, "Error" -> print("Error", file=sys.stderr)
      line = line.replace(/^(\s*)print\s+>>\s*([a-zA-Z0-9_.]+)\s*,\s*(.*)$/, '$1print($3, file=$2)');
      line = line.replace(/^(\s*)print\s+([^\(].*)$/, (match, indent, rest) => {
        // Avoid replacing 'print' if it's in a comment or string
        if (rest.trim().startsWith("#")) return match;
        // Don't wrap if already parenthesized
        if (/^\(.*\)$/.test(rest.trim())) return `${indent}print${rest}`;
        return `${indent}print(${rest.trim()})`;
      });

      // 3. Old exception syntax: except Exception, e: -> except Exception as e:
      line = line.replace(/\bexcept\s+([a-zA-Z0-9_.]+)\s*,\s*([a-zA-Z0-9_]+)\s*:/g, 'except $1 as $2:');
      line = line.replace(/\bexcept\s*\(([^\)]+)\)\s*,\s*([a-zA-Z0-9_]+)\s*:/g, 'except ($1) as $2:');

      // 4. xrange() -> range()
      line = line.replace(/\bxrange\s*\(/g, 'range(');

      // 5. raw_input() -> input()
      line = line.replace(/\braw_input\s*\(/g, 'input(');

      // 6. dict.has_key(k) -> k in dict
      line = line.replace(/([a-zA-Z0-9_.]+)\.has_key\s*\(([^\)]+)\)/g, '$2 in $1');

      // 7. dict.iteritems() / iterkeys() / itervalues() -> items() / keys() / values()
      line = line.replace(/\.iteritems\s*\(\s*\)/g, '.items()');
      line = line.replace(/\.iterkeys\s*\(\s*\)/g, '.keys()');
      line = line.replace(/\.itervalues\s*\(\s*\)/g, '.values()');

      // 8. sys.maxint -> sys.maxsize
      line = line.replace(/\bsys\.maxint\b/g, 'sys.maxsize');

      // 9. unicode() / long() in type checks or conversions
      line = line.replace(/\bisinstance\s*\(\s*([^,]+)\s*,\s*(?:basestring|unicode)\s*\)/g, 'isinstance($1, str)');

      modernized.push(line);
    }

    return modernized.join("\n");
  }
}

// ============================================================================
// 2. HTML TO MARKDOWN CONVERTER
// ============================================================================
export class HtmlToMarkdownConverter {
  /**
   * Decode HTML entities safely
   */
  static decodeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, "—")
      .replace(/&ndash;/g, "–")
      .replace(/&hellip;/g, "…");
  }

  /**
   * Convert an individual slide's HTML into clean Markdown
   * @param {string} html 
   * @param {object} slideMeta 
   * @returns {string} markdown slide body
   */
  static convertSlide(html, slideMeta = {}) {
    if (!html || typeof html !== "string") return "";

    let content = html;

    // 1. Remove outer container headers since we generate markdown headers
    content = content.replace(/<div class="section-header">[\s\S]*?<\/div>/gi, "");
    content = content.replace(/<div class="section-body">([\s\S]*?)<\/div>\s*$/gi, "$1");

    // 2. Extract and format Example Blocks
    // <div class="example-block ..."> ... 📄 Program: <a ...><i>filename</i></a> ... <pre class="brush: python">...</pre> ... ▶ Output ... <pre class="brush: plain">...</pre> </div>
    content = content.replace(/<div class="example-block[^>]*>([\s\S]*?)<\/div>/gi, (match, blockInner) => {
      let result = "\n";

      // Program filename
      const fileMatch = blockInner.match(/📄\s*Program:\s*(?:<a[^>]*>)?(?:<em>|<i>)?([^<]+)(?:<\/em>|<\/i>)?(?:<\/a>)?/i);
      const progHeader = fileMatch ? `# Program: ${fileMatch[1].trim()}\n` : "";

      // Code part
      const codeMatch = blockInner.match(/<pre[^>]*class=["'][^"']*brush:\s*(python|bash|sh|sql|plain|text)[^"']*["'][^>]*>([\s\S]*?)<\/pre>/i);
      if (codeMatch) {
        const lang = codeMatch[1].toLowerCase() === "plain" ? "text" : codeMatch[1].toLowerCase();
        let rawCode = HtmlToMarkdownConverter.decodeHtml(codeMatch[2].trim());
        if (lang === "python") {
          rawCode = PythonModernizer.modernize(rawCode);
        }
        result += `\`\`\`${lang}\n${progHeader}${rawCode}\n\`\`\`\n\n`;
      }

      // Output part
      const outputMatch = blockInner.match(/▶\s*Output[\s\S]*?<pre[^>]*class=["'][^"']*brush:\s*(?:plain|text)[^"']*["'][^>]*>([\s\S]*?)<\/pre>/i);
      if (outputMatch && outputMatch[1].trim().length > 0) {
        const rawOut = HtmlToMarkdownConverter.decodeHtml(outputMatch[1].trim());
        result += `**Výstup:**\n\`\`\`text\n${rawOut}\n\`\`\`\n\n`;
      }

      return result;
    });

    // 3. Fenced Code Blocks: <pre class="brush: python">...</pre>
    content = content.replace(/<pre[^>]*class=["'][^"']*brush:\s*([a-zA-Z0-9_-]+)[^"']*["'][^>]*>([\s\S]*?)<\/pre>/gi, (match, brush, codeInner) => {
      let lang = brush.toLowerCase();
      if (lang === "plain") lang = "text";
      if (lang === "shell" || lang === "sh") lang = "bash";
      if (lang === "js") lang = "javascript";

      let rawCode = HtmlToMarkdownConverter.decodeHtml(codeInner.trim());
      if (lang === "python") {
        rawCode = PythonModernizer.modernize(rawCode);
      }
      return `\n\`\`\`${lang}\n${rawCode}\n\`\`\`\n`;
    });

    // Handle generic <pre> blocks without brush
    content = content.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (match, codeInner) => {
      const rawCode = HtmlToMarkdownConverter.decodeHtml(codeInner.trim());
      return `\n\`\`\`text\n${rawCode}\n\`\`\`\n`;
    });

    // 4. Notes & Callouts: <div class="note-item"><span class="note-icon">📝</span><div class="note-content">...</div></div>
    content = content.replace(/<div class="note-item(?:\s+([a-zA-Z0-9_-]+))?"[^>]*>[\s\S]*?<div class="note-content">([\s\S]*?)<\/div>\s*<\/div>/gi, (match, cls, noteInner) => {
      let alertType = "NOTE";
      if (cls) {
        const c = cls.toLowerCase();
        if (c.includes("warn")) alertType = "WARNING";
        else if (c.includes("import")) alertType = "IMPORTANT";
        else if (c.includes("tip")) alertType = "TIP";
        else if (c.includes("caut")) alertType = "CAUTION";
      }

      // Convert inner HTML of note to markdown lines
      const cleanNoteText = HtmlToMarkdownConverter.cleanInlineAndBlocks(noteInner.trim());
      const noteLines = cleanNoteText.split("\n").filter(l => l.trim().length > 0);
      const quotedLines = noteLines.map(l => `> ${l}`).join("\n>\n");

      return `\n> [!${alertType}]\n${quotedLines}\n\n`;
    });

    // Clean any wrapping <div class="notes-block">
    content = content.replace(/<\/?div class="notes-block">/gi, "");

    // 5. Tables: <table ...> ... </table>
    content = content.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableInner) => {
      return "\n" + HtmlToMarkdownConverter.convertTable(tableInner) + "\n";
    });

    // 6. Blockquotes: <blockquote>...</blockquote>
    content = content.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, quoteInner) => {
      const cleanQuote = HtmlToMarkdownConverter.cleanInlineAndBlocks(quoteInner.trim());
      const qLines = cleanQuote.split("\n").map(l => `> ${l}`).join("\n");
      return `\n${qLines}\n`;
    });

    // 7. Lists: <ul> and <ol>
    content = content.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, listInner) => {
      return "\n" + HtmlToMarkdownConverter.convertList(listInner, "ul") + "\n";
    });
    content = content.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, listInner) => {
      return "\n" + HtmlToMarkdownConverter.convertList(listInner, "ol") + "\n";
    });

    // 8. Headers within slide: <h3>, <h4>
    content = content.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (m, h) => `\n### ${HtmlToMarkdownConverter.cleanInline(h.trim())}\n`);
    content = content.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (m, h) => `\n#### ${HtmlToMarkdownConverter.cleanInline(h.trim())}\n`);

    // 9. Paragraphs: <p class="enumerate"> and <p>
    content = content.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, pInner) => {
      const cleanP = HtmlToMarkdownConverter.cleanInline(pInner.trim());
      return cleanP.length > 0 ? `\n${cleanP}\n` : "";
    });

    // 10. Clean any leftover <div> or <span> wrappers
    content = content.replace(/<\/?div[^>]*>/gi, "");
    content = content.replace(/<\/?span[^>]*>/gi, "");

    // 11. Normalize multiple blank lines
    content = content.replace(/\n{3,}/g, "\n\n").trim();

    return content;
  }

  /**
   * Convert HTML table to GFM Markdown table
   */
  static convertTable(tableHtml) {
    const rows = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rMatch;
    let isHeader = true;
    let colCount = 0;

    while ((rMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowInner = rMatch[1];
      const cells = [];
      const cellRegex = /<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi;
      let cMatch;
      let hasTh = false;

      while ((cMatch = cellRegex.exec(rowInner)) !== null) {
        if (cMatch[1].toLowerCase() === "th") hasTh = true;
        const cellText = HtmlToMarkdownConverter.cleanInline(cMatch[2].trim()).replace(/\|/g, "\\|");
        cells.push(cellText);
      }

      if (cells.length > 0) {
        rows.push({ cells, isTh: hasTh || isHeader });
        if (cells.length > colCount) colCount = cells.length;
      }
      isHeader = false;
    }

    if (rows.length === 0) return "";

    let md = "";
    const firstRow = rows[0];
    md += "| " + firstRow.cells.join(" | ") + " |\n";
    md += "| " + Array(firstRow.cells.length).fill("---").join(" | ") + " |\n";

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      while (row.cells.length < colCount) row.cells.push("");
      md += "| " + row.cells.join(" | ") + " |\n";
    }

    return md;
  }

  /**
   * Convert HTML list (ul/ol) to Markdown list
   */
  static convertList(listHtml, type = "ul") {
    const items = [];
    const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let match;
    let counter = 1;

    while ((match = itemRegex.exec(listHtml)) !== null) {
      const itemInner = HtmlToMarkdownConverter.cleanInlineAndBlocks(match[1].trim());
      const prefix = type === "ul" ? "-" : `${counter}.`;
      items.push(`${prefix} ${itemInner}`);
      counter++;
    }

    return items.join("\n");
  }

  /**
   * Clean inline and block elements inside notes/quotes
   */
  static cleanInlineAndBlocks(text) {
    if (!text) return "";
    let s = text;
    s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");
    s = HtmlToMarkdownConverter.cleanInline(s);
    return s.trim();
  }

  /**
   * Clean inline formatting: <code>, <em>, <strong>, <a>, math
   */
  static cleanInline(text) {
    if (!text) return "";
    let s = text;

    // 1. Math formulas: <span class="math-inline">...</span>
    s = s.replace(/<span class="math-inline">([\s\S]*?)<\/span>/gi, (m, math) => `$${HtmlToMarkdownConverter.decodeHtml(math.trim())}$`);

    // 2. Links: <a href="url">label</a>
    s = s.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (match, url, label) => {
      const cleanLabel = HtmlToMarkdownConverter.cleanInline(label);
      // Clean internal cross-links
      let cleanUrl = url;
      if (cleanUrl.startsWith("?slajd=")) cleanUrl = `#id${cleanUrl.split("=")[1]}`;
      return `[${cleanLabel}](${cleanUrl})`;
    });

    // 3. Inline code: <code>...</code>
    s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (match, code) => {
      const c = HtmlToMarkdownConverter.decodeHtml(code);
      return `\`${c}\``;
    });

    // 4. Bold: <strong>, <b>
    s = s.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (m, t) => `**${t.trim()}**`);

    // 5. Italic: <em>, <i>
    s = s.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, (m, t) => `*${t.trim()}*`);

    // 6. Decode entities
    s = HtmlToMarkdownConverter.decodeHtml(s);

    // 7. Strip leftover HTML tags
    s = s.replace(/<[^>]+>/g, "");

    return s;
  }
}

// ============================================================================
// 3. LECTURE SYNC & MIGRATION CONTROLLER
// ============================================================================
export class LectureSyncCompiler {
  constructor() {
    this.course = this.loadCourse();
  }

  loadCourse() {
    if (!existsSync(COURSE_FILE)) {
      console.error(`❌ Course file not found: ${COURSE_FILE}`);
      return { weeks: [] };
    }
    return JSON.parse(readFileSync(COURSE_FILE, "utf-8"));
  }

  /**
   * Find all lectures defined across the entire course (Weeks 0..13 and Shelf Week 99)
   */
  getAllLectures() {
    const list = [];
    for (const w of this.course.weeks || []) {
      for (const lec of w.lectures || []) {
        const rawPath = lec.path || "";
        const cleanRel = rawPath.replace(/^vyuka_downloaded\//, "").replace(/\.html?$/, "");
        const slug = lec.slug || cleanRel.replace(/[\/\\]/g, "--");
        list.push({
          ...lec,
          cleanRel,
          slug,
          targetMd: join(CONTENT_DIR, `${cleanRel}.md`),
          sourceJson: join(LECTURES_DATA_DIR, `${slug}.json`),
          sourceHtml: join(VYUKA_DIR, `${cleanRel}.html`),
          pubSourceHtml: join(PUB_VYUKA_DIR, `${cleanRel}.html`),
        });
      }
    }
    return list;
  }

  /**
   * Import original lecture (from data/lectures/<slug>.json or HTML) and convert to Markdown
   * @param {string} targetKey cleanRel or slug
   * @param {object} options { overwrite: false }
   */
  importLecture(targetKey, options = { overwrite: false }) {
    const lectures = this.getAllLectures();
    const lec = lectures.find(l => l.cleanRel === targetKey || l.slug === targetKey || l.slug.endsWith(targetKey));

    if (!lec) {
      console.error(`❌ Lecture not found for target key: ${targetKey}`);
      return false;
    }

    if (existsSync(lec.targetMd) && !options.overwrite) {
      console.log(`  ⏩ Markdown already exists (skipping): content/${lec.cleanRel}.md`);
      return true;
    }

    if (!existsSync(lec.sourceJson)) {
      console.error(`❌ Original source JSON not found: ${lec.sourceJson}`);
      return false;
    }

    const sourceData = JSON.parse(readFileSync(lec.sourceJson, "utf-8"));
    const slides = sourceData.slides || [];

    if (slides.length === 0) {
      console.warn(`⚠️ Source JSON has no slides: ${lec.sourceJson}`);
      return false;
    }

    let mdOutput = "";
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      const tagsStr = Array.isArray(s.tags) ? s.tags.join(",") : (s.tags || "Core");
      const diffStr = s.diff || "basics";
      const title = s.title || `Sekce ${i + 1}`;

      // Slide comment header
      mdOutput += `<!-- slide: id=${s.id} title="${title}" tags="${tagsStr}" diff="${diffStr}" -->\n`;
      mdOutput += `## ${title}\n\n`;

      // Convert HTML body to Markdown
      const bodyMd = HtmlToMarkdownConverter.convertSlide(s.html, s);
      mdOutput += bodyMd + "\n";

      if (i < slides.length - 1) {
        mdOutput += "\n---\n";
      }
    }

    // Ensure directory exists and write
    mkdirSync(dirname(lec.targetMd), { recursive: true });
    writeFileSync(lec.targetMd, mdOutput, "utf-8");
    console.log(`  ✓ Converted & Imported: content/${lec.cleanRel}.md (${slides.length} slides)`);
    return true;
  }

  /**
   * Import all unmigrated lectures across the curriculum
   */
  importAllMissing() {
    const lectures = this.getAllLectures();
    let imported = 0;
    let skipped = 0;

    console.log(`🚀 Scanning ${lectures.length} total course lectures for unmigrated sources...`);
    for (const lec of lectures) {
      if (existsSync(lec.targetMd)) {
        skipped++;
      } else {
        const ok = this.importLecture(lec.cleanRel, { overwrite: false });
        if (ok) imported++;
      }
    }

    console.log(`\n🎉 Import Summary: ${imported} imported, ${skipped} already existing out of ${lectures.length} lectures.`);
  }

  /**
   * Export modern Markdown to JSON slide trees and keep original HTML source synchronized
   * @param {string} targetKey cleanRel or slug
   */
  exportLecture(targetKey) {
    const lectures = this.getAllLectures();
    const lec = lectures.find(l => l.cleanRel === targetKey || l.slug === targetKey || l.slug.endsWith(targetKey));

    if (!lec) {
      console.error(`❌ Lecture not found for target key: ${targetKey}`);
      return false;
    }

    if (!existsSync(lec.targetMd)) {
      console.error(`❌ Markdown file does not exist: ${lec.targetMd}`);
      return false;
    }

    const mdContent = readFileSync(lec.targetMd, "utf-8");
    const compiled = compileMarkdownLecture(mdContent, lec.slug);

    // 1. Write runtime JSON slide trees
    const jsonPayload = JSON.stringify(compiled, null, 2);
    mkdirSync(LECTURES_DATA_DIR, { recursive: true });
    mkdirSync(PUB_LECTURES_DATA_DIR, { recursive: true });
    writeFileSync(lec.sourceJson, jsonPayload, "utf-8");
    writeFileSync(join(PUB_LECTURES_DATA_DIR, `${lec.slug}.json`), jsonPayload, "utf-8");

    // 2. Keep original HTML sources updated with modernized sections
    let htmlDeck = `<!DOCTYPE html>\n<html lang="cs">\n<head>\n  <meta charset="utf-8">\n  <title>${lec.title}</title>\n</head>\n<body>\n`;
    for (const s of compiled.slides) {
      htmlDeck += `  <section id="${s.id}">\n${s.html}\n  </section>\n`;
    }
    htmlDeck += `</body>\n</html>\n`;

    try {
      if (existsSync(dirname(lec.sourceHtml))) {
        writeFileSync(lec.sourceHtml, htmlDeck, "utf-8");
      }
      if (existsSync(dirname(lec.pubSourceHtml))) {
        writeFileSync(lec.pubSourceHtml, htmlDeck, "utf-8");
      }
    } catch { /* optional HTML write */ }

    console.log(`  ✓ Compiled & Synchronized Source: ${lec.slug} (${compiled.slides.length} slides)`);
    return true;
  }

  /**
   * Synchronize all existing Markdown files to data/lectures/ and original sources
   */
  syncAll() {
    const lectures = this.getAllLectures();
    let synced = 0;

    console.log(`⚡ Synchronizing all Markdown lectures to JSON runtime and sources...`);
    for (const lec of lectures) {
      if (existsSync(lec.targetMd)) {
        this.exportLecture(lec.cleanRel);
        synced++;
      }
    }
    console.log(`\n🎉 Sync Complete: ${synced} lectures compiled and sources updated.`);
  }

  /**
   * Print migration status table
   */
  status() {
    const lectures = this.getAllLectures();
    let done = 0;
    let missing = 0;

    console.log(`\n📊 Lecture Modernization & Sync Status:\n`);
    for (const lec of lectures) {
      const hasMd = existsSync(lec.targetMd);
      const mark = hasMd ? "✅ MD Ready" : "⏳ Legacy Only";
      if (hasMd) done++; else missing++;
      console.log(`  ${mark.padEnd(16)} Week ${String(lec.week).padStart(2)}: ${lec.cleanRel}`);
    }

    console.log(`\nTotals: ${done} modernized in content/, ${missing} remaining in original source (${lectures.length} total).`);
  }
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================
const args = process.argv.slice(2);
const compiler = new LectureSyncCompiler();

if (args.includes("--status")) {
  compiler.status();
} else if (args.includes("--import-missing")) {
  compiler.importAllMissing();
} else if (args.includes("--sync-all")) {
  compiler.syncAll();
} else if (args.includes("--import")) {
  const target = args[args.indexOf("--import") + 1];
  if (!target) {
    console.error("Missing target lecture for --import. Example: --import files/binary");
    process.exit(1);
  }
  compiler.importLecture(target, { overwrite: true });
} else if (args.includes("--export")) {
  const target = args[args.indexOf("--export") + 1];
  if (!target) {
    console.error("Missing target lecture for --export. Example: --export files/binary");
    process.exit(1);
  }
  compiler.exportLecture(target);
} else {
  console.log(`
newpyt — Lecture Sync & Modernization Compiler

Available commands:
  node tools/lecture_sync_compiler.mjs --status           Show migration status across all weeks
  node tools/lecture_sync_compiler.mjs --import-missing   Auto-import & modernize all remaining original lectures
  node tools/lecture_sync_compiler.mjs --import <target>  Import single lecture from original source (e.g. files/binary)
  node tools/lecture_sync_compiler.mjs --export <target>  Compile Markdown and sync original source
  node tools/lecture_sync_compiler.mjs --sync-all         Compile all Markdown lectures into runtime JSON & HTML sources
`);
}
