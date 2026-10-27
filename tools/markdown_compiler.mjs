#!/usr/bin/env node
/**
 * newpyt — Pure ESM Zero-Dependency Markdown Presentation Compiler
 * Compiles modern Markdown slide decks (content/**\/*.md) into static JSON slide trees.
 * 
 * Supports:
 * - Slide boundaries: `---`
 * - Slide metadata: `<!-- slide: id=idX title="..." tags="Core,Skip" diff="basics" -->`
 * - Fenced code blocks with language brushes (`python`, `bash`, `text`, etc.)
 * - GFM Alerts (`> [!NOTE]`, `> [!WARNING]`, `> [!IMPORTANT]`, `> [!TIP]`, `> [!CAUTION]`)
 * - Math expressions ($...$ and $$...$$)
 * - Lists, tables, inline formatting, and cross-links
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const CONTENT_DIR = join(ROOT, "content");
const DATA_DIR = join(ROOT, "data", "lectures");
const PUB_DATA_DIR = join(ROOT, "public", "data", "lectures");

/**
 * Escape HTML characters
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Parse slide comment: <!-- slide: id=id1 title="Úvod" tags="Core,Tricky" diff="basics" python="3.12+" -->
 */
function parseSlideMeta(commentStr) {
  const meta = {
    id: null,
    title: null,
    tags: ["Core"],
    diff: "basics",
    already_studied_in: null,
    python: null,
  };

  if (!commentStr) return meta;

  // Match key=value or key="value" or key=[a, b]
  const regex = /([a-zA-Z_]+)=(?:"([^"]*)"|'([^']*)'|\[([^\]]*)\]|([^\s>]+))/g;
  let match;
  while ((match = regex.exec(commentStr)) !== null) {
    const key = match[1];
    const val = match[2] ?? match[3] ?? match[4] ?? match[5];
    if (key === "tags") {
      meta.tags = val.split(",").map((t) => t.trim()).filter(Boolean);
    } else if (key === "diff") {
      meta.diff = val.trim();
    } else if (key === "id") {
      meta.id = val.trim();
    } else if (key === "title") {
      meta.title = val.trim();
    } else if (key === "already_studied_in") {
      meta.already_studied_in = val.trim();
    } else if (key === "python") {
      meta.python = val.trim();
    }
  }

  return meta;
}

/**
 * Render inline markdown formatting (bold, italic, code, links, math)
 */
function renderInlineMarkdown(text) {
  if (!text) return "";

  // 1. Protect inline code
  const codePlaceholders = [];
  let s = text.replace(/`([^`]+)`/g, (_, code) => {
    const idx = codePlaceholders.length;
    codePlaceholders.push(`<code>${escapeHtml(code)}</code>`);
    return `___INLINE_CODE_${idx}___`;
  });

  // 2. Protect inline math: $...$
  const mathPlaceholders = [];
  s = s.replace(/\$([^\$\n]+)\$/g, (_, math) => {
    const idx = mathPlaceholders.length;
    mathPlaceholders.push(`<span class="math-inline">${escapeHtml(math)}</span>`);
    return `___INLINE_MATH_${idx}___`;
  });

  // 3. Links: [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const cleanUrl = url.trim();
    const isExt = cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://");
    const extAttr = isExt ? ' class="external" target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${escapeHtml(cleanUrl)}"${extAttr}>${renderInlineMarkdown(label)}</a>`;
  });

  // 4. Bold + Italic: ***text*** or ___text___
  s = s.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  // Bold: **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic: *text* (avoiding list asterisks)
  s = s.replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, "$1<em>$2</em>$3");

  // 5. Restore inline math and code
  for (let i = 0; i < mathPlaceholders.length; i++) {
    s = s.replace(`___INLINE_MATH_${i}___`, mathPlaceholders[i]);
  }
  for (let i = 0; i < codePlaceholders.length; i++) {
    s = s.replace(`___INLINE_CODE_${i}___`, codePlaceholders[i]);
  }

  return s;
}

/**
 * Render slide body markdown to clean HTML structure
 */
function renderSlideMarkdownBody(rawBody, slideNum, slideTitle, slideMeta) {
  const lines = rawBody.replace(/\r\n/g, "\n").split("\n");
  const out = [];

  let inCodeBlock = false;
  let codeLang = "python";
  let codeBuffer = [];

  let inList = false;
  let listType = "ul"; // "ul" | "ol"

  let inAlert = false;
  let alertType = "NOTE"; // "NOTE", "WARNING", "IMPORTANT", "TIP", "CAUTION"
  let alertBuffer = [];

  let inTable = false;
  let tableBuffer = [];

  function flushList() {
    if (inList) {
      out.push(`</${listType}>`);
      inList = false;
    }
  }

  function flushAlert() {
    if (inAlert) {
      const icon = alertType === "WARNING" ? "⚠️"
        : alertType === "IMPORTANT" ? "💡"
        : alertType === "TIP" ? "✨"
        : alertType === "CAUTION" ? "🛑"
        : "📝";
      const cls = alertType.toLowerCase();
      const contentHtml = alertBuffer.map((l) => `<p>${renderInlineMarkdown(l)}</p>`).join("");
      out.push(
        `<div class="notes-block"><div class="note-item ${cls}"><span class="note-icon">${icon}</span><div class="note-content">${contentHtml}</div></div></div>`
      );
      inAlert = false;
      alertBuffer = [];
    }
  }

  function flushTable() {
    if (inTable && tableBuffer.length > 0) {
      let html = '<table class="slide-table"><thead>';
      const headerRow = tableBuffer[0];
      const headerCells = headerRow.split("|").slice(1, -1).map((c) => c.trim());
      html += "<tr>" + headerCells.map((c) => `<th>${renderInlineMarkdown(c)}</th>`).join("") + "</tr></thead><tbody>";

      // Skip separator row (index 1) if present
      const startIdx = (tableBuffer.length > 1 && /^[\s|:-]+$/.test(tableBuffer[1])) ? 2 : 1;
      for (let i = startIdx; i < tableBuffer.length; i++) {
        const rowCells = tableBuffer[i].split("|").slice(1, -1).map((c) => c.trim());
        html += "<tr>" + rowCells.map((c) => `<td>${renderInlineMarkdown(c)}</td>`).join("") + "</tr>";
      }
      html += "</tbody></table>";
      out.push(html);
      inTable = false;
      tableBuffer = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Block Fence (```lang)
    if (trimmed.startsWith("```")) {
      if (!inCodeBlock) {
        flushList();
        flushAlert();
        flushTable();
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim().toLowerCase() || "python";
        codeBuffer = [];
        continue;
      } else {
        inCodeBlock = false;
        const brush = (codeLang === "py" || codeLang === "python") ? "python"
          : (codeLang === "bash" || codeLang === "sh" || codeLang === "shell") ? "bash"
          : (codeLang === "sql") ? "sql"
          : (codeLang === "xml" || codeLang === "html") ? "xml"
          : "plain";
        const codeText = codeBuffer.join("\n");
        out.push(`<pre class="brush: ${brush}; gutter: false; toolbar: false;">${escapeHtml(codeText)}</pre>`);
        codeBuffer = [];
        continue;
      }
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // 2. GFM Alert Callout (> [!NOTE], > [!WARNING], etc.)
    const alertMatch = trimmed.match(/^>\s*\[!(NOTE|WARNING|IMPORTANT|TIP|CAUTION)\]/i);
    if (alertMatch) {
      flushList();
      flushTable();
      flushAlert();
      inAlert = true;
      alertType = alertMatch[1].toUpperCase();
      continue;
    }

    if (inAlert) {
      if (trimmed.startsWith(">")) {
        const alertLine = trimmed.replace(/^>\s?/, "");
        if (alertLine.trim().length > 0) {
          alertBuffer.push(alertLine);
        }
        continue;
      } else if (trimmed.length === 0) {
        continue;
      } else {
        flushAlert();
      }
    }

    // 3. Tables (| cell | cell |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      flushAlert();
      inTable = true;
      tableBuffer.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // 4. Lists (* or - or 1.)
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (ulMatch || olMatch) {
      flushAlert();
      flushTable();
      const targetType = ulMatch ? "ul" : "ol";
      const itemText = ulMatch ? ulMatch[1] : olMatch[2];

      if (!inList) {
        inList = true;
        listType = targetType;
        out.push(`<${listType}>`);
      } else if (listType !== targetType) {
        out.push(`</${listType}>`);
        listType = targetType;
        out.push(`<${listType}>`);
      }
      out.push(`  <li>${renderInlineMarkdown(itemText)}</li>`);
      continue;
    } else if (inList && trimmed.length === 0) {
      // blank line might close list
      flushList();
      continue;
    } else if (inList) {
      flushList();
    }

    // 5. Blank line
    if (trimmed.length === 0) {
      continue;
    }

    // 6. Headers inside slide body (### Subheading)
    const h3Match = trimmed.match(/^###\s+(.*)$/);
    const h4Match = trimmed.match(/^####\s+(.*)$/);
    if (h3Match) {
      flushAlert();
      flushTable();
      out.push(`<h3>${renderInlineMarkdown(h3Match[1])}</h3>`);
      continue;
    }
    if (h4Match) {
      flushAlert();
      flushTable();
      out.push(`<h4>${renderInlineMarkdown(h4Match[1])}</h4>`);
      continue;
    }

    // 7. Regular paragraph
    out.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  }

  flushList();
  flushAlert();
  flushTable();

  // Modern Python Badge if specified
  const modernBadge = slideMeta?.python
    ? `<span class="modern-python-pill" title="Modernizovaný výklad pro Python ${escapeHtml(slideMeta.python)}">✨ Python ${escapeHtml(slideMeta.python)}</span>`
    : "";

  const headerHtml = `    <div class="section-header">\n        <span class="section-num">${slideNum}</span>\n        <h2 class="section-title">${escapeHtml(slideTitle)}</h2>\n        ${modernBadge}\n    </div>`;
  const bodyHtml = `    <div class="section-body">\n${out.map((l) => `        ${l}`).join("\n")}\n    </div>`;

  return `${headerHtml}\n${bodyHtml}`;
}

/**
 * Compile a single .md file into JSON slide tree format
 */
export function compileMarkdownLecture(mdContent, slug) {
  // Normalize line endings
  const raw = mdContent.replace(/\r\n/g, "\n");

  // Split slides by `---` (surrounded by newlines)
  const parts = raw.split(/\n---\n+/);
  const slides = [];

  let globalMeta = {};
  let startIndex = 0;

  // Check if first block is global frontmatter
  const firstBlock = parts[0].trim();
  if (firstBlock.startsWith("<!-- lecture:") || firstBlock.startsWith("lecture_title:")) {
    // Process document-level header if present
    startIndex = 1;
  }

  let slideIndex = 0;
  for (let i = startIndex; i < parts.length; i++) {
    const block = parts[i].trim();
    if (!block) continue;

    // Extract slide comment: <!-- slide: ... -->
    const commentMatch = block.match(/<!--\s*slide:\s*([^\>]+)-->/i);
    let slideMeta = {};
    let contentWithoutComment = block;

    if (commentMatch) {
      slideMeta = parseSlideMeta(commentMatch[1]);
      contentWithoutComment = block.replace(commentMatch[0], "").trim();
    }

    // Extract slide title: from ## Title or slideMeta.title or default
    let title = slideMeta.title;
    const titleMatch = contentWithoutComment.match(/^##?\s+(?:(\d+)\.\s+)?(.*)$/m);
    if (titleMatch) {
      if (!title) title = titleMatch[2].trim();
      contentWithoutComment = contentWithoutComment.replace(titleMatch[0], "").trim();
    }
    if (!title) title = `Sekce ${slideIndex + 1}`;

    const slideId = slideMeta.id || `id${slideIndex + 1}`;
    const slideNum = slideIndex + 1;

    // Render HTML body
    const html = renderSlideMarkdownBody(contentWithoutComment, slideNum, title, slideMeta);

    slides.push({
      id: slideId,
      idx: slideIndex,
      title,
      tags: slideMeta.tags || ["Core"],
      diff: slideMeta.diff || "basics",
      already_studied_in: slideMeta.already_studied_in || null,
      python: slideMeta.python || null,
      html,
    });

    slideIndex++;
  }

  return {
    slug,
    total: slides.length,
    slides,
  };
}

/**
 * Scan content/ and compile all .md lectures to data/lectures and public/data/lectures
 */
export function buildAllMarkdownLectures() {
  if (!existsSync(CONTENT_DIR)) {
    console.log(`ℹ️ No ${CONTENT_DIR} directory found.`);
    return 0;
  }

  function findMdFiles(dir, fileList = []) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      try {
        if (statSync(full).isDirectory()) findMdFiles(full, fileList);
        else if (name.endsWith(".md")) fileList.push(full);
      } catch { /* ignore */ }
    }
    return fileList;
  }

  const mdFiles = findMdFiles(CONTENT_DIR);
  if (!mdFiles.length) {
    console.log(`ℹ️ No .md files found in ${CONTENT_DIR}.`);
    return 0;
  }

  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(PUB_DATA_DIR, { recursive: true });

  let compiledCount = 0;
  for (const f of mdFiles) {
    try {
      const rel = relative(CONTENT_DIR, f).replace(/\\/g, "/").replace(/\.md$/, "");
      const slug = rel.replace(/\//g, "--");
      const baseName = rel.split("/").pop();
      const content = readFileSync(f, "utf-8");

      const compiled = compileMarkdownLecture(content, slug);
      const jsonPayload = JSON.stringify(compiled, null, 2);

      // Write to both data/lectures and public/data/lectures (canonical slug only, avoiding redundant baseName duplicates)
      for (const outDir of [DATA_DIR, PUB_DATA_DIR]) {
        writeFileSync(join(outDir, `${slug}.json`), jsonPayload, "utf-8");
      }

      console.log(`  ✓ Compiled Markdown: ${rel}.md → ${slug}.json (${compiled.total} slides)`);
      compiledCount++;
    } catch (err) {
      console.error(`  ❌ Error compiling ${f}:`, err);
    }
  }

  return compiledCount;
}

// CLI entry point
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log("⚡ Building Markdown Lectures from content/…");
  const n = buildAllMarkdownLectures();
  console.log(`✨ Done. Compiled ${n} Markdown presentation(s).`);
}
