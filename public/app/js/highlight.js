/**
 * Lightweight VS Code Dark+ style syntax highlighter.
 * Handles pre/code blocks after lecture HTML is injected.
 */

import { DYNAMIC_PY_KEYWORDS, DYNAMIC_PY_BUILTINS } from "./syntax_tokens.js";

const PY_KEYWORDS = DYNAMIC_PY_KEYWORDS;
const PY_BUILTINS = DYNAMIC_PY_BUILTINS;

const JS_KEYWORDS = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default",
  "delete", "do", "else", "export", "extends", "finally", "for", "function",
  "if", "import", "in", "instanceof", "let", "new", "return", "static", "super",
  "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with",
  "yield", "async", "await", "of", "from", "as", "true", "false", "null",
  "undefined",
]);

const BASH_KEYWORDS = new Set([
  "if", "then", "else", "elif", "fi", "for", "while", "do", "done", "case",
  "esac", "function", "in", "select", "time", "until", "export", "local",
  "return", "exit", "source", "alias", "unalias", "set", "unset", "readonly",
  "declare", "typeset", "true", "false", "cd", "echo", "printf", "read",
  "test", "shift", "break", "continue", "eval", "exec",
]);

function detectLang(node) {
  // class="brush: python; ..." or language-python or data-lang
  const cls = (node.getAttribute("class") || "") + " " +
    (node.parentElement?.getAttribute("class") || "");
  const data = node.getAttribute("data-lang") ||
    node.parentElement?.getAttribute("data-lang") || "";

  const hay = (cls + " " + data).toLowerCase();
  const mBrush = hay.match(/brush:\s*([a-z0-9_+-]+)/);
  if (mBrush) return normalizeLang(mBrush[1]);
  const mLang = hay.match(/(?:language|lang|brush)-([a-z0-9_+-]+)/);
  if (mLang) return normalizeLang(mLang[1]);
  if (hay.includes("python") || hay.includes("py")) return "python";
  if (hay.includes("bash") || hay.includes("shell") || hay.includes("sh")) return "bash";
  if (hay.includes("jscript") || hay.includes("javascript") || hay.includes("js")) return "js";
  if (hay.includes("xml") || hay.includes("html")) return "xml";
  if (hay.includes("css")) return "css";
  if (hay.includes("sql")) return "sql";
  if (hay.includes("cmd") || hay.includes("bat") || hay.includes("powershell")) return "bash";
  return "plain";
}

export function normalizeLang(raw) {
  if (!raw) return "python";
  const l = String(raw).toLowerCase().trim();
  if (l === "py" || l === "python3" || l === "python") return "python";
  if (l === "sh" || l === "shell" || l === "zsh" || l === "cmd" || l === "powershell" || l === "ps1" || l === "bash" || l === "bat") return "bash";
  if (l === "jscript" || l === "javascript" || l === "js" || l === "ts" || l === "typescript") return "js";
  if (l === "html" || l === "htm" || l === "xml" || l === "svg") return "xml";
  if (l === "css") return "css";
  if (l === "sql") return "sql";
  if (l === "c" || l === "cpp" || l === "c++") return "c";
  if (l === "java") return "java";
  if (l === "json" || l === "yaml" || l === "yml" || l === "text" || l === "plain" || l === "output") return "plain";
  return l;
}

export function detectCodeLang(code, declaredLang = "") {
  if (declaredLang) {
    return normalizeLang(declaredLang);
  }
  if (!code) return "python";
  const trimmed = String(code).trim();
  if (/^(\$|>|#!\/bin\/)/m.test(trimmed) || /^(python3?|pip3?|conda|venv|git|cd|ls|mkdir|chmod|curl|source)\s/m.test(trimmed)) {
    return "bash";
  }
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE|FROM|WHERE)\b/im.test(trimmed)) {
    return "sql";
  }
  if (/^<(!DOCTYPE|[a-z0-9_-]+)/i.test(trimmed)) {
    return "xml";
  }
  return "python";
}

export function isCodeBlockquote(html, rawText) {
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

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function span(cls, text) {
  return `<span class="tok-${cls}">${esc(text)}</span>`;
}

/** Tokenize a line-oriented language with strings/comments */
function highlightGeneric(code, opts) {
  const {
    lineComment = "#",
    blockComment = null, // [start, end]
    keywords = new Set(),
    builtins = new Set(),
    stringChars = ['"', "'", "`"],
  } = opts;

  let i = 0;
  const n = code.length;
  let out = "";

  while (i < n) {
    // block comment
    if (blockComment && code.startsWith(blockComment[0], i)) {
      const end = code.indexOf(blockComment[1], i + blockComment[0].length);
      const j = end < 0 ? n : end + blockComment[1].length;
      out += span("comment", code.slice(i, j));
      i = j;
      continue;
    }

    // line comment
    if (lineComment && code.startsWith(lineComment, i)) {
      let j = i;
      while (j < n && code[j] !== "\n") j++;
      out += span("comment", code.slice(i, j));
      i = j;
      continue;
    }

    // strings (incl. python prefixes r/f/b/u and triples)
    const ch = code[i];
    const prev = i > 0 ? code[i - 1] : "";
    let strStart = -1;
    let prefix = "";

    if ((ch === "r" || ch === "f" || ch === "b" || ch === "u" || ch === "R" || ch === "F" || ch === "B" || ch === "U") &&
        (i + 1 < n) && (code[i + 1] === '"' || code[i + 1] === "'")) {
      // single letter prefix
      if (i === 0 || /[^A-Za-z0-9_]/.test(prev)) {
        prefix = ch;
        strStart = i + 1;
      }
    } else if ((ch === "r" || ch === "f" || ch === "b") && i + 2 < n &&
               /[fbruFBRU]/.test(code[i + 1]) && (code[i + 2] === '"' || code[i + 2] === "'")) {
      if (i === 0 || /[^A-Za-z0-9_]/.test(prev)) {
        prefix = code.slice(i, i + 2);
        strStart = i + 2;
      }
    }

    if (strStart < 0 && stringChars.includes(ch)) {
      strStart = i;
    }

    if (strStart >= 0) {
      const q = code[strStart];
      const triple = code.startsWith(q + q + q, strStart);
      let j = strStart + (triple ? 3 : 1);
      if (triple) {
        const end = code.indexOf(q + q + q, j);
        j = end < 0 ? n : end + 3;
      } else {
        while (j < n) {
          if (code[j] === "\\") { j += 2; continue; }
          if (code[j] === q) { j++; break; }
          if (code[j] === "\n") break;
          j++;
        }
      }
      const start = strStart - prefix.length;
      out += span("string", code.slice(start, j));
      i = j;
      continue;
    }

    // numbers (including signed numbers like -0, -1, -0.5, +5 when at token start)
    const isSignedNum = (ch === "-" || ch === "+") &&
      (i + 1 < n) && /\d/.test(code[i + 1]) &&
      (i === 0 || /[^A-Za-z0-9_)]/.test(prev));

    if ((/\d/.test(ch) || isSignedNum) && (i === 0 || /[^A-Za-z0-9_)]/.test(prev))) {
      let j = i;
      if (isSignedNum) j++;
      if (code.startsWith("0x", j) || code.startsWith("0X", j) ||
          code.startsWith("0b", j) || code.startsWith("0B", j) ||
          code.startsWith("0o", j) || code.startsWith("0O", j)) {
        j += 2;
        while (j < n && /[0-9a-fA-F_]/.test(code[j])) j++;
      } else {
        while (j < n && /[0-9_]/.test(code[j])) j++;
        if (code[j] === "." && /\d/.test(code[j + 1] || "")) {
          j++;
          while (j < n && /[0-9_]/.test(code[j])) j++;
        }
        if (code[j] === "e" || code[j] === "E") {
          j++;
          if (code[j] === "+" || code[j] === "-") j++;
          while (j < n && /[0-9_]/.test(code[j])) j++;
        }
      }
      out += span("number", code.slice(i, j));
      i = j;
      continue;
    }

    // identifiers / keywords / constants / types (with full Czech character support)
    if (/[a-zA-Z\u00C0-\u024F_]/.test(ch)) {
      let j = i + 1;
      while (j < n && /[a-zA-Z0-9\u00C0-\u024F_\-]/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (keywords.has(word)) out += span("keyword", word);
      else if (builtins.has(word)) out += span("builtin", word);
      else if (/^[A-Z\u00C0-\u024F][A-Z0-9\u00C0-\u024F_\-]+$/.test(word)) out += span("constant", word);
      else if (/^[A-Z\u00C0-\u024F][a-zA-Z0-9\u00C0-\u024F_]*$/.test(word)) out += span("type", word);
      else {
        // function call?
        let k = j;
        while (k < n && /\s/.test(code[k])) k++;
        if (code[k] === "(") out += span("function", word);
        else out += esc(word);
      }
      i = j;
      continue;
    }

    // operators / punctuation
    if (/[+\-*/%=<>!&|^~?:.,;@()[\]{}\\]/.test(ch)) {
      let j = i + 1;
      // multi-char ops
      const two = code.slice(i, i + 2);
      const three = code.slice(i, i + 3);
      if (["//=", ">>=", "<<="].includes(three) || three === "**=") {
        j = i + 3;
      } else if (["==", "!=", "<=", ">=", "//", "**", "<<", ">>", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "->", ":=", "&&", "||"].includes(two)) {
        j = i + 2;
      }
      out += span("operator", code.slice(i, j));
      i = j;
      continue;
    }

    // whitespace / other
    out += esc(ch);
    i++;
  }

  return out;
}

function highlightXml(code) {
  // crude but readable
  return code.replace(
    /(<!--[\s\S]*?-->)|(&lt;\/?)([A-Za-z_][\w:.-]*)|(\s)([A-Za-z_:][\w:.-]*)(=)|("[^"]*"|'[^']*')|(\/?&gt;)/g,
    (m, comment, open, tag, sp, attr, eq, str, close) => {
      if (comment) return span("comment", comment.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"))
        .replace(/&lt;/g, "&lt;"); // already escaped path — use simpler
      return m;
    },
  );
}

// Simpler XML highlighter on raw source
function highlightXmlRaw(code) {
  let i = 0;
  const n = code.length;
  let out = "";
  while (i < n) {
    if (code.startsWith("<!--", i)) {
      const end = code.indexOf("-->", i + 4);
      const j = end < 0 ? n : end + 3;
      out += span("comment", code.slice(i, j));
      i = j;
      continue;
    }
    if (code[i] === "<") {
      let j = i + 1;
      const isClose = code[j] === "/";
      if (isClose) j++;
      const tagStart = j;
      while (j < n && /[A-Za-z0-9_:-]/.test(code[j])) j++;
      const tag = code.slice(tagStart, j);
      out += span("operator", code.slice(i, tagStart));
      out += span("keyword", tag);
      // attributes until >
      while (j < n && code[j] !== ">") {
        if (code[j] === '"' || code[j] === "'") {
          const q = code[j];
          let k = j + 1;
          while (k < n && code[k] !== q) k++;
          if (k < n) k++;
          out += span("string", code.slice(j, k));
          j = k;
          continue;
        }
        if (/[A-Za-z_:]/.test(code[j])) {
          let k = j;
          while (k < n && /[A-Za-z0-9_:-]/.test(code[k])) k++;
          out += span("type", code.slice(j, k));
          j = k;
          continue;
        }
        out += esc(code[j]);
        j++;
      }
      if (j < n) {
        out += span("operator", ">");
        j++;
      }
      i = j;
      continue;
    }
    // text
    let j = i;
    while (j < n && code[j] !== "<") j++;
    out += esc(code.slice(i, j));
    i = j;
  }
  return out;
}

function isPythonReprOutput(line) {
  const t = line.trim();
  if (!t) return false;

  // 1. Structural data objects: [...], (...), {...} or line containing list/tuple/dict representations
  if (/(?:\[.*\]|\{.*\}|\(.*\))/.test(t)) {
    return true;
  }
  // 2. String repr '...' or "..."
  if (/['"][^'"]*['"]/.test(t)) {
    return true;
  }
  // 3. Class / object repr <class '...'> or <... at 0x...>
  if (t.startsWith("<") && t.endsWith(">")) {
    return true;
  }
  // 4. Numeric repr 42, -1, 3.14, 0x12
  if (/^[+-]?(?:0[xXbBoO][0-9a-fA-F_]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)$/.test(t)) {
    return true;
  }
  // 5. Keyword repr True, False, None
  if (t === "True" || t === "False" || t === "None") {
    return true;
  }
  return false;
}

function highlightPythonRepl(code, opts) {
  const lines = code.split("\n");
  let inContinuation = false;

  const highlightedLines = lines.map((line) => {
    // Empty line
    if (line.trim().length === 0) {
      inContinuation = false;
      return "";
    }

    // Comment line inside REPL block (e.g. "# a) Zaveďme seznam...")
    if (/^\s*#/.test(line)) {
      return highlightGeneric(line, opts);
    }

    // Match >>>, >>, or ... prompt
    const mPrompt = line.match(/^(\s*)(>{2,3}|\.{3})(\s*)(.*)$/);
    if (mPrompt) {
      const sym = mPrompt[2];
      const rest = mPrompt[4];
      inContinuation = sym === "...";

      const promptDisplay = sym === ">>" ? "&gt;&gt;&gt;" : esc(sym);
      const promptSymbol = `<span class="tok-prompt">${promptDisplay}</span>`;
      const spacing = esc(mPrompt[3] || " ");
      const codePart = highlightGeneric(rest, opts);
      return `${esc(mPrompt[1])}${promptSymbol}${spacing}${codePart}`;
    }

    // Check if line is indented continuation of a multiline statement following ...
    if (inContinuation && /^\s{4,}/.test(line)) {
      return highlightGeneric(line, opts);
    }

    // Check if line is Python definition code before/inside REPL (e.g. "def funkce(...):" or "    for arg in args:")
    if (/^\s*(?:def|class|for|while|if|elif|else|try|except|finally|with|return|yield|import|from|async|await)\b/.test(line)) {
      return highlightGeneric(line, opts);
    }

    // Check if line is a Python REPL object return representation (repr)
    if (isPythonReprOutput(line)) {
      inContinuation = false;
      return highlightGeneric(line, opts);
    }

    // Otherwise, this is a raw stdout/stderr print output line!
    inContinuation = false;
    return span("term-output", line);
  });

  return highlightedLines.join("\n");
}

export function highlightCode(code, lang) {
  switch (lang) {
    case "python": {
      const opts = {
        lineComment: "#",
        keywords: PY_KEYWORDS,
        builtins: PY_BUILTINS,
        stringChars: ['"', "'"],
      };
      const normalized = normalizeCodeShowcase(code, "python");
      if (normalized.includes(">>>") || normalized.includes(">>") || normalized.includes("...")) {
        return highlightPythonRepl(normalized, opts);
      }
      return highlightGeneric(normalized, opts);
    }
    case "text":
    case "plain": {
      const opts = {
        lineComment: "#",
        keywords: PY_KEYWORDS,
        builtins: PY_BUILTINS,
        stringChars: ['"', "'"],
      };
      const normalized = normalizeCodeShowcase(code, "plain");
      const lines = normalized.split("\n");
      return lines.map((line) => {
        if (/^\s*#/.test(line) || isPythonReprOutput(line)) {
          return highlightGeneric(line, opts);
        }
        return span("term-output", line);
      }).join("\n");
    }
    case "bash": {
      const normalized = normalizeCodeShowcase(code, "bash");
      return highlightGeneric(normalized, {
        lineComment: "#",
        keywords: BASH_KEYWORDS,
        builtins: new Set(["python", "python3", "pip", "pip3", "conda", "venv", "git", "ls", "cat", "grep", "mkdir", "rm", "cp", "mv", "chmod", "sudo", "apt", "brew"]),
        stringChars: ['"', "'", "`"],
      });
    }
    case "js": {
      const normalized = normalizeCodeShowcase(code, "js");
      return highlightGeneric(normalized, {
        lineComment: "//",
        blockComment: ["/*", "*/"],
        keywords: JS_KEYWORDS,
        builtins: new Set(["console", "window", "document", "Array", "Object", "String", "Number", "Math", "JSON", "Promise", "Map", "Set"]),
        stringChars: ['"', "'", "`"],
      });
    }
    case "css": {
      const normalized = normalizeCodeShowcase(code, "css");
      return highlightGeneric(normalized, {
        lineComment: null,
        blockComment: ["/*", "*/"],
        keywords: new Set(["important", "from", "to"]),
        builtins: new Set(),
        stringChars: ['"', "'"],
      });
    }
    case "sql": {
      const normalized = normalizeCodeShowcase(code, "sql");
      return highlightGeneric(normalized, {
        lineComment: "--",
        blockComment: ["/*", "*/"],
        keywords: new Set(["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "TABLE", "INTO", "VALUES", "AND", "OR", "NOT", "NULL", "JOIN", "LEFT", "RIGHT", "INNER", "ON", "AS", "ORDER", "BY", "GROUP", "LIMIT", "INDEX", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "select", "from", "where", "insert", "update", "delete", "create", "table", "into", "values", "and", "or", "not", "null", "join", "left", "right", "inner", "on", "as", "order", "by", "group", "limit"]),
        builtins: new Set(),
        stringChars: ['"', "'"],
      });
    }
    case "xml":
    case "html":
      return highlightXmlRaw(normalizeCodeShowcase(code, "xml"));
    default:
      return esc(normalizeCodeShowcase(code, "plain"));
  }
}

export function trimBlankLines(text) {
  if (!text) return "";
  const lines = text.split("\n");
  while (lines.length > 0 && lines[0].trim().length === 0) {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
    lines.pop();
  }
  return lines.join("\n");
}

export function dedentLines(lines) {
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

export function dedentCode(text) {
  if (!text) return "";
  text = trimBlankLines(text.replace(/\t/g, "    "));
  const lines = text.split("\n");
  return dedentLines(lines).join("\n");
}

/**
 * Normalizes and standardizes indentation for pure Python code blocks:
 * - Expands tabs to 4 spaces
 * - Collapses \n{3,} to \n\n
 * - Detects 2-space indentation and normalizes to standard 4-space tabs
 * - Correctly nests methods (4 spaces), method bodies (8 spaces), sub-blocks (12 spaces)
 * - Properly indents ellipsis (...) placeholders inside classes, functions, and loops
 * - Resets top-level classes, functions, and post-class calls to column 0
 */
/**
 * Normalizes and standardizes indentation for pure Python code blocks:
 * - Expands tabs to 4 spaces
 * - Collapses \n{3,} to \n\n
 * - Dedents common outer container margin
 * - Normalizes 2-space indentation to 4-space tab stops
 * - Preserves nested functions, closures, decorators, and multi-level returns
 * - Indents ellipsis (...) placeholders contextually
 */
export function standardizePythonCode(text) {
  if (!text) return "";

  // 1. Expand tabs and normalize newlines
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
export function reconstructFlatReplLines(headerLine, contLines) {
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

/**
 * Normalizes code showcases:
 * - Expands tabs to 4 spaces
 * - Collapses excessive blank lines (\n{3,} -> \n\n)
 * - Pure Python blocks: applies standardizePythonCode()
 * - REPL sessions: preserves prefix functions, comments, commands, and outputs while standardizing compound blocks
 */
export function normalizeCodeShowcase(text, lang = "python") {
  if (!text) return "";

  // 1. Expand tabs and normalize line endings
  let code = String(text).replace(/\t/g, "    ").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 2. Collapse excessive blank lines (max 1 empty line between blocks) and trim ends
  code = code.replace(/\n{3,}/g, "\n\n");
  code = trimBlankLines(code);

  const lines = code.split("\n");
  if (lines.length === 0) return "";

  // Check if snippet contains REPL prompts (>>> or >>)
  const hasReplPrompt = lines.some((l) => /^\s*>{2,3}(?:\s|$)/.test(l));

  if (!hasReplPrompt) {
    if (lang === "python") {
      return standardizePythonCode(code);
    }
    return dedentLines(lines).join("\n");
  }

  // Find index of first prompt
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
    
    // Check if trailing lines of prefix are comments introducing the REPL
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

  // Process REPL lines while preserving all elements and standardizing compound blocks
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
        // Multi-line compound REPL block: extract, standardize, re-prefix
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
        // Single-line REPL command
        processedReplLines.push(`>>> ${headerRest}`);
        i++;
        continue;
      }
    }

    // Standalone continuation line not preceded by >>>
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

    // Accumulate consecutive output lines
    const outputChunk = [];
    while (i < replLines.length) {
      const cur = replLines[i];
      if (cur.trim().length === 0 || /^\s*#/.test(cur) || /^\s*(?:>{2,3}|\.{3})(?:\s|$)/.test(cur)) {
        break;
      }
      // Strip artifact line numbers
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

function getCodeText(pre) {
  // Prefer raw text; strip syntaxhighlighter leftovers if any
  const code = pre.querySelector("code");
  let text = code ? code.textContent : pre.textContent;
  return normalizeCodeShowcase(text, detectLang(pre));
}

/**
 * Highlight all code blocks under root element.
 */
export function highlightRoot(root) {
  if (!root) return;

  // Convert code blockquotes into standard code-block pre elements
  root.querySelectorAll("blockquote").forEach((bq) => {
    if (bq.dataset.hl === "1") return;
    const text = (bq.textContent || "").trim();
    if (!text) return;
    if (isCodeBlockquote(bq.innerHTML, text)) {
      const codeText = dedentCode(text);
      const lang = detectCodeLang(codeText, "python");
      const pre = document.createElement("pre");
      pre.className = `code-block lang-${lang}`;
      pre.innerHTML = `<code>${highlightCode(codeText, lang)}</code>`;
      pre.dataset.hl = "1";
      bq.replaceWith(pre);
    }
  });

  // Convert SyntaxHighlighter-ish pre.brush to plain pre
  root.querySelectorAll("pre").forEach((pre) => {
    if (pre.dataset.hl === "1") return;

    // If already processed by old SH into tables, try to recover
    if (pre.classList.contains("syntaxhighlighter")) {
      const lines = [...pre.querySelectorAll(".line .code .content, .container .line")];
      if (lines.length) {
        const text = dedentCode(lines.map((l) => l.textContent).join("\n"));
        const lang = detectLang(pre);
        pre.className = `code-block lang-${lang}`;
        pre.innerHTML = `<code>${highlightCode(text, lang)}</code>`;
        pre.dataset.hl = "1";
        return;
      }
    }

    const lang = detectLang(pre);
    const text = getCodeText(pre);
    pre.className = `code-block lang-${lang}`;
    pre.innerHTML = `<code>${highlightCode(text, lang)}</code>`;
    pre.dataset.hl = "1";
  });

  // Inline code that looks like multi-token? leave mono only
  root.querySelectorAll("code:not(pre code)").forEach((code) => {
    if (code.dataset.hl === "1") return;
    code.classList.add("inline-code");
    code.dataset.hl = "1";
  });
}

// silence unused
void highlightXml;
