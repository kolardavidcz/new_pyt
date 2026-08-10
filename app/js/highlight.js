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

function normalizeLang(raw) {
  const l = raw.toLowerCase();
  if (l === "py" || l === "python3") return "python";
  if (l === "sh" || l === "shell" || l === "zsh" || l === "cmd" || l === "powershell" || l === "ps1") return "bash";
  if (l === "jscript" || l === "javascript" || l === "ts" || l === "typescript") return "js";
  if (l === "html" || l === "htm") return "xml";
  return l;
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
  let lastPromptWasSingleLine = false;

  const highlightedLines = lines.map((line) => {
    // Comment line inside REPL block (e.g. "# a) Zaveďme seznam...")
    if (/^\s*#/.test(line)) {
      return highlightGeneric(line, opts);
    }

    // Match >>> prompt or ... prompt
    const mPrompt = line.match(/^(\s*)(>{3}|\.{3})(\s*)(.*)$/);
    if (mPrompt) {
      inContinuation = mPrompt[2] === "...";
      lastPromptWasSingleLine = mPrompt[2] === ">>>";
      const leadingSpace = esc(mPrompt[1]);
      const promptSymbol = span("prompt", mPrompt[2]);
      const spacing = esc(mPrompt[3]);
      const codePart = highlightGeneric(mPrompt[4], opts);
      return `${leadingSpace}${promptSymbol}${spacing}${codePart}`;
    }

    // Check if line is indented continuation of a multiline statement following ...
    if (inContinuation && /^\s{4,}/.test(line) && line.trim().length > 0) {
      return highlightGeneric(line, opts);
    }

    // Dedent indented REPL output lines following prompts (e.g. "    15" -> "15" or "    !,?AJaee..." -> "!,?AJaee...")
    let activeLine = line;
    if (/^\s+\S/.test(activeLine)) {
      activeLine = activeLine.trimStart();
    }
    // Strip line number prefix artifacts like "6: {}" -> "{}" or "7: {}" -> "{}"
    activeLine = activeLine.replace(/^\d+:\s*(\{\}|\[\]|\(\))/, "$1");

    // Check if line is a Python REPL object return representation (repr)
    if (isPythonReprOutput(activeLine)) {
      inContinuation = false;
      lastPromptWasSingleLine = false;
      return highlightGeneric(activeLine, opts);
    }

    // Otherwise, this is a raw stdout/stderr print output line!
    inContinuation = false;
    lastPromptWasSingleLine = false;
    return span("term-output", activeLine);
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
      if (code.includes(">>>") || code.includes("...")) {
        return highlightPythonRepl(code, opts);
      }
      return highlightGeneric(code, opts);
    }
    case "text":
    case "plain": {
      const opts = {
        lineComment: "#",
        keywords: PY_KEYWORDS,
        builtins: PY_BUILTINS,
        stringChars: ['"', "'"],
      };
      const lines = code.split("\n");
      return lines.map((line) => {
        if (/^\s*#/.test(line) || isPythonReprOutput(line)) {
          return highlightGeneric(line, opts);
        }
        return span("term-output", line);
      }).join("\n");
    }
    case "bash":
      return highlightGeneric(code, {
        lineComment: "#",
        keywords: BASH_KEYWORDS,
        builtins: new Set(["python", "python3", "pip", "pip3", "conda", "venv", "git", "ls", "cat", "grep", "mkdir", "rm", "cp", "mv", "chmod", "sudo", "apt", "brew"]),
        stringChars: ['"', "'", "`"],
      });
    case "js":
      return highlightGeneric(code, {
        lineComment: "//",
        blockComment: ["/*", "*/"],
        keywords: JS_KEYWORDS,
        builtins: new Set(["console", "window", "document", "Array", "Object", "String", "Number", "Math", "JSON", "Promise", "Map", "Set"]),
        stringChars: ['"', "'", "`"],
      });
    case "css":
      return highlightGeneric(code, {
        lineComment: null,
        blockComment: ["/*", "*/"],
        keywords: new Set(["important", "from", "to"]),
        builtins: new Set(),
        stringChars: ['"', "'"],
      });
    case "sql":
      return highlightGeneric(code, {
        lineComment: "--",
        blockComment: ["/*", "*/"],
        keywords: new Set(["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "TABLE", "INTO", "VALUES", "AND", "OR", "NOT", "NULL", "JOIN", "LEFT", "RIGHT", "INNER", "ON", "AS", "ORDER", "BY", "GROUP", "LIMIT", "INDEX", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "select", "from", "where", "insert", "update", "delete", "create", "table", "into", "values", "and", "or", "not", "null", "join", "left", "right", "inner", "on", "as", "order", "by", "group", "limit"]),
        builtins: new Set(),
        stringChars: ['"', "'"],
      });
    case "xml":
    case "html":
      return highlightXmlRaw(code);
    default:
      return esc(code);
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

export function dedentCode(text) {
  if (!text) return "";
  text = trimBlankLines(text);
  const lines = text.split("\n");
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    const match = line.match(/^[ \t]*/);
    const indent = match ? match[0].length : 0;
    if (indent < minIndent) minIndent = indent;
  }
  if (minIndent > 0 && minIndent !== Infinity) {
    return lines
      .map((line) => (line.length >= minIndent ? line.slice(minIndent) : line))
      .join("\n");
  }
  return text;
}

function getCodeText(pre) {
  // Prefer raw text; strip syntaxhighlighter leftovers if any
  const code = pre.querySelector("code");
  let text = code ? code.textContent : pre.textContent;
  return dedentCode(text);
}

/**
 * Highlight all code blocks under root element.
 */
export function highlightRoot(root) {
  if (!root) return;

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
