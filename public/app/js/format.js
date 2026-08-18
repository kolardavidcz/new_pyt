/**
 * Code formatting, syntax pill inlining, and quiz fill evaluation utilities.
 */

import { highlightCode, dedentCode, detectCodeLang, normalizeLang } from "./highlight.js";
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

  // Handle multiline markdown codeblocks (```lang ... ```) if present
  if (String(str).includes("```")) {
    const blocks = String(str).split("```");
    const outBlocks = [];
    for (let b = 0; b < blocks.length; b++) {
      if (b % 2 === 1) {
        const rawBlock = blocks[b];
        const firstLineBreak = rawBlock.indexOf("\n");
        let langDeclared = "";
        let codeBody = rawBlock;
        if (firstLineBreak !== -1) {
          const possibleLang = rawBlock.slice(0, firstLineBreak).trim();
          if (/^[a-zA-Z0-9_#+-]+$/.test(possibleLang)) {
            langDeclared = possibleLang;
            codeBody = rawBlock.slice(firstLineBreak + 1);
          }
        }
        const dedented = dedentCode(codeBody);
        const lang = detectCodeLang(dedented, langDeclared);
        outBlocks.push(`<pre class="code-block lang-${lang}"><code>${highlightCode(dedented, lang)}</code></pre>`);
      } else {
        outBlocks.push(formatInlineCode(blocks[b]));
      }
    }
    return outBlocks.join("");
  }

  // Split by backticks: even indices are text, odd indices are code snippets
  const parts = String(str).split(/`([^`]+)`/g);
  const out = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      // Code snippet: highlight raw code directly
      const rawCode = parts[i];
      const lang = detectCodeLang(rawCode);
      const highlighted = highlightCode(rawCode, lang);
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
    if (str.includes("#")) {
      str = str.split("#")[0].trim();
    }
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

function isLikelyCodeSection(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return false;
  return lines.some((t) =>
    /^(?:def|class|for|while|if|elif|else|try|except|finally|with|import|from|return|yield|raise|assert|pass)\b/.test(t) ||
    /^(?:print|len|range|type|isinstance|sorted|dict|list|set|tuple)\(/.test(t) ||
    /^\w+\s*=\s*[\{\[\(\'\"0-9a-zA-Z]/.test(t) ||
    /['"]\w+['"]\s*:\s*lambda\b/.test(t) ||
    /^>>>/.test(t) ||
    /^[a-zA-Z_]\w*\[.*\]\s*(?:=|\+=|-=|\*=|\/=|append|extend|pop)/.test(t)
  );
}

export function parseQuestionContent(rawQuestion, rawCode) {
  if (!rawQuestion && !rawCode) return { stemHtml: "", codeSnippetHtml: "" };

  let stemText = rawQuestion || "";
  let codeSnippetHtml = "";

  // If question contains markdown code blocks, render them inline in their natural reading order
  if (stemText.includes("```")) {
    const parts = stemText.split("```");
    const formattedParts = [];
    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
      if (pIdx % 2 === 1) {
        const rawBlock = parts[pIdx];
        const firstLineBreak = rawBlock.indexOf("\n");
        let langDeclared = "";
        let codeBody = rawBlock;
        if (firstLineBreak !== -1) {
          const possibleLang = rawBlock.slice(0, firstLineBreak).trim();
          if (/^[a-zA-Z0-9_#+-]+$/.test(possibleLang)) {
            langDeclared = possibleLang;
            codeBody = rawBlock.slice(firstLineBreak + 1);
          }
        }
        const dedented = dedentCode(codeBody);
        const lang = detectCodeLang(dedented, langDeclared);
        formattedParts.push(`<div class="quiz-code-wrap"><pre class="code-block lang-${lang}"><code>${highlightCode(dedented, lang)}</code></pre></div>`);
      } else {
        formattedParts.push(formatInlineCode(parts[pIdx]));
      }
    }
    stemText = formattedParts.join("");
  } else if (!rawCode && stemText.includes("\n\n")) {
    // If no explicit rawCode and question has multiline paragraphs where trailing paragraph is code
    const paragraphs = stemText.split(/\n\s*\n/);
    const stemParts = [];
    const codeParts = [];
    let inCode = false;

    for (const p of paragraphs) {
      if (inCode || isLikelyCodeSection(p)) {
        inCode = true;
        codeParts.push(p);
      } else {
        stemParts.push(p);
      }
    }

    if (codeParts.length > 0) {
      stemText = formatInlineCode(stemParts.join("\n\n"));
      let extractedCode = codeParts.join("\n\n");
      if (extractedCode.endsWith(":") && !/(?:def|class|for|while|if|elif|else|try|except|finally|with)\s.*:$/.test(extractedCode)) {
        extractedCode = extractedCode.slice(0, -1).trim();
      }
      const dedented = dedentCode(extractedCode);
      const lang = detectCodeLang(dedented);
      codeSnippetHtml = `<pre class="code-block lang-${lang}"><code>${highlightCode(dedented, lang)}</code></pre>`;
    } else {
      stemText = formatInlineCode(stemText);
    }
  } else {
    stemText = formatInlineCode(stemText);
  }

  // If question has a standalone q.code not already embedded in q.question
  if (rawCode && (!rawQuestion || !rawQuestion.includes("```"))) {
    const dedented = dedentCode(rawCode);
    const lang = detectCodeLang(dedented);
    codeSnippetHtml = `<pre class="code-block lang-${lang}"><code>${highlightCode(dedented, lang)}</code></pre>`;
  }

  return { stemHtml: stemText, codeSnippetHtml };
}
