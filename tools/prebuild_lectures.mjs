#!/usr/bin/env node
/**
 * Build-Time Static Slide Pre-Rendering ("Static Shell + Dynamic Dojo")
 * Pre-parses HTML lecture files into optimized JSON slide trees during build time.
 * Writes to both data/ and public/data/ to guarantee instant resolution in both local dev server and Vercel.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderStaticExceptionTreeHtml } from "../app/js/exceptions_tree.js";

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

// Load intersection slides
let intersectionSlides = [];
const intersectionSlidesPath = join(ROOT, "data", "intersection_slides.json");
if (existsSync(intersectionSlidesPath)) {
  try {
    intersectionSlides = JSON.parse(readFileSync(intersectionSlidesPath, "utf-8"));
  } catch (err) {
    console.error("  ❌ Error reading intersection_slides.json:", err);
  }
}

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

function isCodeBlockquote(html, rawText) {
  const t = (rawText || "").trim();
  if (!t) return false;
  
  // Explicit code or pre tags
  if (/^<code>[\s\S]*<\/code>$/is.test((html || "").trim()) || /<pre[\s\S]*<\/pre>/i.test(html || "")) return true;

  // Real prose quotes
  if (t.startsWith("„") && !t.includes("Funkce") && !t.includes("SEKVENCE")) return false;
  if (t.startsWith("»") || t.startsWith("«")) return false;
  if (/^"[A-Z][a-z\s]+"/i.test(t) && !t.includes("\\") && !t.includes(".exe")) return false;

  // Czech sentence words indicating prose, NOT code
  if (/\b(je|jsou|není|nejsou|obsahuje|představuje|může|musí|bude|bylo|mají|slouží|sloužit|pokud|jestliže|protože|však|používá|volá|vrací|určuje|znamená|respektive|nalezen|vytvořen|označit|při vstupu|vynechané|chcete-li|napišeme|potomci|představují|patří|úkolem|každou|máte-li|jsou-li|načtete-li)\b/i.test(t)) return false;
  if (t.endsWith(".") && !t.includes("(") && !t.includes("=") && !t.includes("->")) return false;

  // 1. Assignment or instantiation (Python / XPath / XML)
  if (/^[a-zA-Z0-9_.]+\s*=\s*.+$/s.test(t)) return true;
  if (/^xmlns:[a-zA-Z0-9_]+=/i.test(t)) return true;

  // 2. Function / Method signature / Call
  if (/^[a-zA-Z0-9_.]+\s*\(.*?\)/s.test(t)) return true;

  // 3. Keyword syntax templates
  if (/^(assert|for\s+\$|some\s+\$|every\s+\$|if\s+\(|while\s+|def\s+|class\s+|with\s+|return\s+|yield\s+|import\s+|from\s+)/i.test(t)) return true;
  if (/^„?\[“?\s*Funkce\(I\)\s+for\s+I\s+in\s+SEKVENCE/i.test(t)) return true;

  // 4. Data structures & expressions
  if (/^\[\s*['"][a-zA-Z0-9_]+['"]/i.test(t)) return true;
  if (/^\{[a-zA-Z0-9_:]+\}$/i.test(t)) return true;
  if (/^\(:\s*.*\s*:\)$/i.test(t)) return true;
  if (/^[a-zA-Z0-9_-]+\s+to\s+[a-zA-Z0-9_-]+$/i.test(t)) return true;
  if (/^(eq|ne|lt|le|gt|ge|\=|\!\=|\<|\<\=|\>|\>\=|\+|\-|\*|\band\b|\bor\b)(\s+(eq|ne|lt|le|gt|ge|\=|\!\=|\<|\<\=|\>|\>\=|\+|\-|\*|\band\b|\bor\b))*$/i.test(t)) return true;
  if (/^[a-zA-Z0-9_.]+(\[[^\]]+\]|\.[a-zA-Z0-9_]+)\s*[\*+\-\/]\s*[a-zA-Z0-9_.]+/i.test(t)) return true;

  // 5. CLI commands / HTTP headers / executable paths
  if (/^(\$|>|conda\s+[a-z\-]+|pip\s+[a-z\-]+|python\s+[a-z0-9_\-\.]+)\s+/i.test(t)) return true;
  if (/^"[A-Z]:\\.*\.exe"/i.test(t)) return true;
  if (/^(metoda\s+lokální|verze-protokolu\s+kód|jméno-hlavičky:)/i.test(t)) return true;

  return false;
}

function detectCodeLang(code) {
  if (!code) return "python";
  const trimmed = String(code).trim();
  if (/^(\$|>|#!\/bin\/)/m.test(trimmed) || /^(python3?|pip3?|conda|venv|git|cd|ls|mkdir|chmod|curl|source)\s/m.test(trimmed) || /^"[A-Z]:\\.*\.exe"/i.test(trimmed)) {
    return "bash";
  }
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE|FROM|WHERE)\b/im.test(trimmed)) {
    return "sql";
  }
  if (/^<(!DOCTYPE|[a-z0-9_-]+)/i.test(trimmed) || /^xmlns:[a-z0-9_-]+=/i.test(trimmed)) {
    return "xml";
  }
  return "python";
}

function trimBlankLines(text) {
  if (!text) return "";
  const lines = text.split("\n");
  while (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
  while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) lines.pop();
  return lines.join("\n");
}

function dedentLines(lines) {
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    const match = line.match(/^[ ]*/);
    const indent = match ? match[0].length : 0;
    if (indent < minIndent) minIndent = indent;
  }
  if (minIndent > 0 && minIndent !== Infinity) {
    return lines.map((line) => (line.length >= minIndent ? line.slice(minIndent) : line.trimEnd()));
  }
  return lines.map((l) => l.trimEnd());
}

function standardizePythonCode(text) {
  if (!text) return "";

  let code = String(text).replace(/\t/g, "    ").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  code = code.replace(/\n{3,}/g, "\n\n");
  code = trimBlankLines(code);

  const rawLines = code.split("\n");
  if (rawLines.length === 0) return "";

  const lines = dedentLines(rawLines);

  // Collect non-zero indentation values
  const nonZeroIndents = [];
  for (const l of lines) {
    if (l.trim().length === 0) continue;
    const ind = (l.match(/^[ ]*/) || [""])[0].length;
    if (ind > 0) nonZeroIndents.push(ind);
  }

  // Detect 2-space indentation: has lines with indent % 4 !== 0 and indent % 2 === 0
  const isTwoSpace = nonZeroIndents.length > 0 &&
    nonZeroIndents.every((n) => n % 2 === 0) &&
    nonZeroIndents.some((n) => n % 4 !== 0);

  const result = [];
  let lastNonEmptyIndent = 0;
  let lastNonEmptyEndedWithColon = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      result.push("");
      continue;
    }

    const rawIndent = (line.match(/^[ ]*/) || [""])[0].length;

    // Handle ellipsis placeholder with 0 raw indent inside an opened block
    if ((trimmed === "..." || trimmed === "…") && rawIndent === 0 && lastNonEmptyEndedWithColon) {
      const targetIndent = lastNonEmptyIndent + 4;
      result.push(`${" ".repeat(targetIndent)}...`);
      lastNonEmptyIndent = targetIndent;
      lastNonEmptyEndedWithColon = false;
      continue;
    }

    let targetIndent = rawIndent;
    if (rawIndent > 0) {
      if (isTwoSpace) {
        targetIndent = Math.round(rawIndent / 2) * 4;
      } else {
        targetIndent = Math.round(rawIndent / 4) * 4;
      }
    }

    result.push(`${" ".repeat(targetIndent)}${trimmed}`);
    lastNonEmptyIndent = targetIndent;
    lastNonEmptyEndedWithColon = trimmed.endsWith(":") && !trimmed.startsWith("#");
  }

  return trimBlankLines(result.join("\n"));
}

/**
 * Reconstructs compound indentation specifically for flat/unindented REPL continuation lines
 */
function reconstructFlatReplLines(headerLine, contLines) {
  const result = [headerLine.trim()];
  const stack = [];

  // Determine if header ends with colon
  if (headerLine.trim().endsWith(":")) {
    stack.push({ type: headerLine.trim().split(/\s|:/)[0], indent: 0 });
  }

  for (const cLine of contLines) {
    const trimmed = cLine.trim();
    if (trimmed.length === 0) {
      result.push("");
      continue;
    }

    if (trimmed.startsWith("#")) {
      const curIndent = stack.length > 0 ? stack[stack.length - 1].indent + 4 : 4;
      result.push(`${" ".repeat(curIndent)}${trimmed}`);
      continue;
    }

    // Branch keywords: elif, else, except, finally
    if (/^(?:elif|else|except|finally)\b/i.test(trimmed)) {
      while (
        stack.length > 0 &&
        !["if", "elif", "try", "except", "for", "while"].includes(stack[stack.length - 1].type)
      ) {
        stack.pop();
      }
      const parent = stack.length > 0 ? stack.pop() : { indent: 0 };
      const indent = parent.indent;
      result.push(`${" ".repeat(indent)}${trimmed}`);
      stack.push({ type: trimmed.split(/\s|:/)[0], indent });
      continue;
    }

    // Compound headers inside loop/block (e.g. if x in xd:)
    if (/^(?:for|while|if|try|with|def)\b/i.test(trimmed) && trimmed.endsWith(":")) {
      const curIndent = stack.length > 0 ? stack[stack.length - 1].indent + 4 : 4;
      result.push(`${" ".repeat(curIndent)}${trimmed}`);
      stack.push({ type: trimmed.split(/\s|:/)[0], indent: curIndent });
      continue;
    }

    // Normal statement inside block
    const curIndent = stack.length > 0 ? stack[stack.length - 1].indent + 4 : 4;
    result.push(`${" ".repeat(curIndent)}${trimmed}`);
  }

  return result;
}

function normalizeCodeShowcase(text, lang = "python") {
  if (!text) return "";
  let code = String(text).replace(/\t/g, "    ").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  code = code.replace(/\n{3,}/g, "\n\n");
  code = trimBlankLines(code);

  const lines = code.split("\n");
  if (lines.length === 0) return "";

  const hasReplPrompt = lines.some((l) => /^\s*>{2,3}(?:\s|$)/.test(l));
  if (!hasReplPrompt) {
    if (lang === "python") {
      return standardizePythonCode(code);
    }
    return dedentLines(lines).join("\n");
  }

  let firstPromptIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*>{2,3}(?:\s|$)/.test(lines[i])) {
      firstPromptIdx = i;
      break;
    }
  }

  let prefixLines = [];
  let replLines = [];

  if (firstPromptIdx > 0) {
    const rawPrefix = lines.slice(0, firstPromptIdx);
    let splitIdx = rawPrefix.length;
    while (splitIdx > 0 && /^\s*#/.test(rawPrefix[splitIdx - 1])) {
      splitIdx--;
    }
    const codePrefix = rawPrefix.slice(0, splitIdx);
    const commentPrefix = rawPrefix.slice(splitIdx);

    const dedentedCode = standardizePythonCode(codePrefix.join("\n")).split("\n");
    const normalizedComments = commentPrefix.map((l) => l.trimStart());
    prefixLines = [...dedentedCode, ...normalizedComments];
    replLines = lines.slice(firstPromptIdx);
  } else {
    replLines = lines;
  }

  const processedReplLines = [];
  let i = 0;
  while (i < replLines.length) {
    const line = replLines[i];

    if (line.trim().length === 0) {
      processedReplLines.push("");
      i++;
      continue;
    }

    if (/^\s*#/.test(line)) {
      processedReplLines.push(line.trimStart());
      i++;
      continue;
    }

    const mPrompt = line.match(/^(\s*)(>{2,3})(.*)$/);
    if (mPrompt) {
      const sym = mPrompt[2];
      const headerRest = mPrompt[3].trimStart();

      // Check if this prompt line starts a compound block with subsequent continuation lines (...)
      const continuationLines = [];
      let nextIdx = i + 1;
      while (nextIdx < replLines.length && /^\s*\.{3}(?:\s|$)/.test(replLines[nextIdx])) {
        continuationLines.push(replLines[nextIdx]);
        nextIdx++;
      }

      if (continuationLines.length > 0) {
        const hasTrailingEmptyPrompt = continuationLines[continuationLines.length - 1].replace(/^\s*\.{3}/, "").trim().length === 0;
        const codeContLines = hasTrailingEmptyPrompt ? continuationLines.slice(0, -1) : continuationLines;

        // Check if continuation lines have relative indentation or are flat
        const strippedContLines = codeContLines.map((cLine) => cLine.replace(/^\s*\.{3}\s?/, ""));
        const contIndents = strippedContLines.filter((l) => l.trim().length > 0).map((l) => (l.match(/^[ ]*/) || [""])[0].length);
        const hasRelativeIndents = contIndents.some((ind) => ind > 0) && new Set(contIndents).size > 1;

        let standardizedLines;
        if (hasRelativeIndents) {
          standardizedLines = standardizePythonCode([headerRest, ...strippedContLines].join("\n")).split("\n");
        } else {
          standardizedLines = reconstructFlatReplLines(headerRest, strippedContLines);
        }

        processedReplLines.push(`>>> ${standardizedLines[0]}`);
        for (let s = 1; s < standardizedLines.length; s++) {
          processedReplLines.push(`... ${standardizedLines[s]}`);
        }
        if (hasTrailingEmptyPrompt) {
          processedReplLines.push("...");
        }

        i = nextIdx;
        continue;
      } else {
        processedReplLines.push(`>>> ${headerRest}`);
        i++;
        continue;
      }
    }

    if (/^\s*\.{3}(.*)$/.test(line)) {
      const rest = line.replace(/^\s*\.{3}/, "");
      if (rest.trim().length === 0) {
        processedReplLines.push("...");
      } else {
        processedReplLines.push(`... ${rest.trimStart()}`);
      }
      i++;
      continue;
    }

    const outputChunk = [];
    while (i < replLines.length) {
      const cur = replLines[i];
      if (cur.trim().length === 0 || /^\s*#/.test(cur) || /^\s*(?:>{2,3}|\.{3})(?:\s|$)/.test(cur)) {
        break;
      }
      const cleanLine = cur.replace(/^\d+:\s*(\{\}|\[\]|\(\)|True|False|None|\d+)/, "$1");
      outputChunk.push(cleanLine);
      i++;
    }

    if (outputChunk.length > 0) {
      const dedentedOutput = dedentLines(outputChunk);
      processedReplLines.push(...dedentedOutput);
    }
  }

  const combined = [...prefixLines, ...processedReplLines];
  return trimBlankLines(combined.join("\n"));
}

function transformPreBlocks(html) {
  return html.replace(/<pre([^>]*)>([\s\S]*?)<\/pre>/gi, (match, attrs, inner) => {
    const rawText = inner.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    const normalized = normalizeCodeShowcase(rawText);
    const escaped = normalized.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre${attrs}>${escaped}</pre>`;
  });
}

const python310AsciiTree = `BaseException
 +-- SystemExit
 +-- KeyboardInterrupt
 +-- GeneratorExit
 +-- Exception
      +-- StopIteration
      +-- StopAsyncIteration
      +-- ArithmeticError
      |    +-- FloatingPointError
      |    +-- OverflowError
      |    +-- ZeroDivisionError
      +-- AssertionError
      +-- AttributeError
      +-- BufferError
      +-- EOFError
      +-- ImportError
      |    +-- ModuleNotFoundError
      +-- LookupError
      |    +-- IndexError
      |    +-- KeyError
      +-- MemoryError
      +-- NameError
      |    +-- UnboundLocalError
      +-- OSError
      |    +-- BlockingIOError
      |    +-- ChildProcessError
      |    +-- ConnectionError
      |    |    +-- BrokenPipeError
      |    |    +-- ConnectionAbortedError
      |    |    +-- ConnectionRefusedError
      |    |    +-- ConnectionResetError
      |    +-- FileExistsError
      |    +-- FileNotFoundError
      |    +-- InterruptedError
      |    +-- IsADirectoryError
      |    +-- NotADirectoryError
      |    +-- PermissionError
      |    +-- ProcessLookupError
      |    +-- TimeoutError
      +-- ReferenceError
      +-- RuntimeError
      |    +-- NotImplementedError
      |    +-- RecursionError
      +-- SyntaxError
      |    +-- IndentationError
      |         +-- TabError
      +-- SystemError
      +-- TypeError
      +-- ValueError
      |    +-- UnicodeError
      |         +-- UnicodeDecodeError
      |         +-- UnicodeEncodeError
      |         +-- UnicodeTranslateError
      +-- Warning
           +-- DeprecationWarning
           +-- PendingDeprecationWarning
           +-- RuntimeWarning
           +-- SyntaxWarning
           +-- UserWarning
           +-- FutureWarning
           +-- ImportWarning
           +-- UnicodeWarning
           +-- BytesWarning
           +-- EncodingWarning
           +-- ResourceWarning`;

function transformExampleTags(html) {
  if (!html) return "";
  let res = html.replace(/<example[^>]*src=["']_history\/Python310["'][^>]*>[\s\S]*?<\/example>/gi, `<pre class="brush: plain; gutter: false; toolbar: false;">${python310AsciiTree}</pre>`);
  return res;
}

function transformCodeBlockquotes(html) {
  return html.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, inner) => {
    const rawText = inner.replace(/<[^>]+>/g, "").trim();
    if (isCodeBlockquote(inner, rawText)) {
      const lang = detectCodeLang(rawText);
      return `<pre class="brush: ${lang}; gutter: false; toolbar: false;">${inner.trim()}</pre>`;
    }
    return match;
  });
}

let prebuiltCount = 0;
const pagesIndexMap = {};
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
      const sectionInner = transformExampleTags(transformPreBlocks(transformCodeBlockquotes(match[2])));
      
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

    // Splice matching intersection slides for this lecture
    const matchingIntersections = intersectionSlides.filter((isl) => {
      if (!isl.lecture) return false;
      const normLec = isl.lecture.replace(/\\/g, "/").replace(/^\/+/, "");
      return (
        cleanRel === normLec.replace(/\.html?$/, "") ||
        pathSlug === normLec.replace(/[\/\\]/g, "--").replace(/\.html?$/, "") ||
        baseName === isl.lecture.split(/[/\\]/).pop().replace(/\.html?$/, "")
      );
    });

    for (const isl of matchingIntersections) {
      let insertIdx = slides.length;
      if (isl.insert_after) {
        const afterPos = slides.findIndex((s) => s.id === isl.insert_after);
        if (afterPos !== -1) insertIdx = afterPos + 1;
      } else if (isl.insert_before) {
        const beforePos = slides.findIndex((s) => s.id === isl.insert_before);
        if (beforePos !== -1) insertIdx = beforePos;
      } else if (typeof isl.insert_index === "number") {
        insertIdx = Math.min(isl.insert_index, slides.length);
      }

      let islHtml = isl.html || "";
      if (islHtml.includes('<!-- INJECT_STATIC_EXC_TREE -->') || islHtml.includes('<!-- INJECT_STATIC_EXC_CHEATSHEET -->') || islHtml.includes('id="excTreeView"') || islHtml.includes('exc-tree-app') || islHtml.includes('exc-tree-container')) {
        islHtml = islHtml.replace(
          /<!-- INJECT_STATIC_EXC_TREE -->|<!-- INJECT_STATIC_EXC_CHEATSHEET -->|<div class="exc-tree-app"[\s\S]*?<\/div>\s*<\/div>|<div class="exc-tree-container"[\s\S]*?<\/div>/gi,
          renderStaticExceptionTreeHtml()
        );
      }

      slides.splice(insertIdx, 0, {
        id: isl.id || `intersection_${insertIdx}`,
        idx: insertIdx,
        title: isl.title || "Intersection Slide",
        tags: isl.tags || ["Core"],
        diff: isl.diff || null,
        is_intersection: true,
        already_studied_in: null,
        html: islHtml,
      });
    }

    // Re-index idx sequentially
    slides.forEach((s, i) => {
      s.idx = i;
    });

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
      
      const pageEntries = slides.map((s) => ({
        id: s.id,
        title: s.title,
        tags: s.tags,
        diff: s.diff,
        is_intersection: s.is_intersection || false,
      }));
      pagesIndexMap[relPath] = pageEntries;
      pagesIndexMap[`vyuka_downloaded/${relPath}`] = pageEntries;
      pagesIndexMap[`public/vyuka_downloaded/${relPath}`] = pageEntries;
    }
  } catch { /* ignore */ }
}

const pagesIndexPath = join(DATA_DIR, "pages-index.json");
if (existsSync(pagesIndexPath)) {
  try {
    const existingIndex = JSON.parse(readFileSync(pagesIndexPath, "utf-8"));
    const mergedIndex = { ...existingIndex, ...pagesIndexMap };
    const payload = JSON.stringify(mergedIndex, null, 2);
    writeFileSync(pagesIndexPath, payload, "utf-8");
    writeFileSync(join(PUB_DIR, "data", "pages-index.json"), payload, "utf-8");
    console.log(`  ✓ Updated pages-index.json with static slides & intersection slides`);
  } catch (err) {
    console.error("  ❌ Error updating pages-index.json:", err);
  }
}

console.log(`  ✓ Pre-rendered ${prebuiltCount} static lecture slide trees into data/lectures/ and public/data/lectures/`);
