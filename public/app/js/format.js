/**
 * Code formatting, syntax pill inlining, and quiz fill evaluation utilities.
 */

import { highlightCode, dedentCode } from "./highlight.js";
import { DYNAMIC_PY_BUILTINS } from "./syntax_tokens.js";

const DYNAMIC_PY_FUNC_REGEX = new RegExp(
  `\\b(${Array.from(DYNAMIC_PY_BUILTINS).join("|")})\\(\\)`,
  "g"
);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatInlineCode(str) {
  if (!str) return "";

  // Split by backticks: even indices are text, odd indices are code snippets
  const parts = String(str).split(/`([^`]+)`/g);
  const out = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      // Code snippet: highlight raw code directly (single clean escape in highlighter)
      const rawCode = parts[i];
      const highlighted = highlightCode(rawCode, "python");
      out.push(`<code class="inline-code">${highlighted}</code>`);
    } else {
      // Text fragment: escape HTML safely for text nodes (preserve existing HTML tags if any)
      const textFrag = parts[i];
      if (!textFrag) continue;

      const HTML_TAG_REGEX = /(<\/?(?:span|code|pre|div|input|button|label|strong|em|small|details|summary|b|i|a|p|ul|li|ol)[^>]*>)/gi;
      if (HTML_TAG_REGEX.test(textFrag)) {
        const subParts = textFrag.split(HTML_TAG_REGEX);
        for (let j = 0; j < subParts.length; j++) {
          if (!HTML_TAG_REGEX.test(subParts[j])) {
            const escaped = escapeHtml(subParts[j]);
            const withBuiltins = escaped.replace(DYNAMIC_PY_FUNC_REGEX, '<code class="inline-code"><span class="tok-builtin">$1</span>()</code>');
            out.push(withBuiltins);
          } else {
            out.push(subParts[j]);
          }
        }
      } else {
        const escaped = escapeHtml(textFrag);
        const withBuiltins = escaped.replace(DYNAMIC_PY_FUNC_REGEX, '<code class="inline-code"><span class="tok-builtin">$1</span>()</code>');
        out.push(withBuiltins);
      }
    }
  }

  return out.join("");
}

export function isFlexibleCodeFillCorrect(userVal, expectedVal, options = [], answerIdx = null) {
  if (!userVal) return false;

  const normalizeToken = (str) => {
    if (!str) return "";
    str = String(str).trim();
    str = str.replace(/^[`'"]+|[`'"]+$/g, "");
    str = str.replace(/^[A-D]\)\s*/i, "");
    str = str.replace(/^[a-zA-Z_]\w*\s*=\s*/, "");
    str = str.replace(/\s*\(\s*\)\s*/g, "()");
    str = str.replace(/\s+/g, "");
    return str;
  };

  const getVariants = (raw) => {
    if (!raw) return [];
    const norm = normalizeToken(raw);
    if (!norm) return [];
    const variants = new Set([norm]);
    const methodMatch = norm.match(/(?:[a-zA-Z_]\w*\.)?([a-zA-Z_]\w*)(?:\(.*\))?/);
    if (methodMatch && methodMatch[1]) {
      const methodName = methodMatch[1];
      variants.add(methodName);
      variants.add(methodName + "()");
    }
    if (norm.endsWith("()")) {
      variants.add(norm.slice(0, -2));
    } else {
      variants.add(norm + "()");
    }
    return Array.from(variants);
  };

  const userVariants = new Set(getVariants(userVal));
  const candidateList = [];

  const addTarget = (raw) => {
    if (!raw) return;
    const parts = String(raw).split(/\||,|\/|\bnebo\b/i);
    for (const p of parts) {
      const vars = getVariants(p);
      for (const v of vars) {
        if (v) candidateList.push(v);
      }
    }
  };

  addTarget(expectedVal);

  if (Array.isArray(options)) {
    if (typeof answerIdx === "number" && options[answerIdx]) {
      addTarget(options[answerIdx]);
    }
    for (const opt of options) {
      const optNorm = normalizeToken(opt);
      const expNorm = normalizeToken(expectedVal);
      if (optNorm === expNorm || optNorm === expNorm + "()" || optNorm + "()" === expNorm) {
        addTarget(opt);
      }
    }
  }

  for (const uVar of userVariants) {
    if (!uVar) continue;
    for (const cand of candidateList) {
      if (uVar === cand) return true;
    }
  }

  return false;
}

export function parseQuestionContent(rawQuestion, rawCode) {
  if (!rawQuestion && !rawCode) return { stemHtml: "", codeSnippetHtml: "" };

  let stemText = rawQuestion || "";
  let codeSnippetHtml = "";

  if (stemText.includes("```")) {
    const parts = stemText.split("```");
    let promptParts = [];
    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
      if (pIdx % 2 === 1) {
        let codeText = parts[pIdx].replace(/^(python|bash|c|java)\n?/i, "");
        const dedented = dedentCode(codeText);
        const lang = parts[pIdx].match(/^(python|bash|c|java)/i)?.[1] || "python";
        codeSnippetHtml += `<pre class="code-block lang-${lang}"><code>${highlightCode(dedented, lang)}</code></pre>`;
      } else {
        promptParts.push(parts[pIdx]);
      }
    }
    stemText = promptParts.join("").trim();
  }

  if (!codeSnippetHtml && rawCode) {
    const dedented = dedentCode(rawCode);
    const lang = "python";
    codeSnippetHtml = `<pre class="code-block lang-${lang}"><code>${highlightCode(dedented, lang)}</code></pre>`;
  }

  const stemHtml = formatInlineCode(stemText);
  return { stemHtml, codeSnippetHtml };
}
