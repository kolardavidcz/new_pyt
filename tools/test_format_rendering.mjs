#!/usr/bin/env node
/**
 * Automated Unit Test Suite for formatInlineCode & Syntax Pill Rendering
 */

import { formatInlineCode, isFlexibleCodeFillCorrect } from "../app/js/format.js";
import assert from "node:assert";

console.log("🧪 Running Format & Syntax Pill Unit Tests …\n");

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
  if (actual === expected) {
    console.log(`  [PASS] ${label}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${label}\n         Expected: ${expected}\n         Actual:   ${actual}`);
    failed++;
  }
}

// 1. Markdown backtick code pill transformation
check(
  "Markdown backtick `hash()` to inline-code pill",
  formatInlineCode("`hash()`"),
  '<code class="inline-code"><span class="tok-builtin">hash</span><span class="tok-operator">(</span><span class="tok-operator">)</span></code>'
);

// 2. Bare Python builtin function call auto-inlining
check(
  "Bare hash() to inline-code pill",
  formatInlineCode("hash()"),
  '<code class="inline-code"><span class="tok-builtin">hash</span>()</code>'
);

check(
  "Bare id() to inline-code pill",
  formatInlineCode("id()"),
  '<code class="inline-code"><span class="tok-builtin">id</span>()</code>'
);

check(
  "Bare set() to inline-code pill",
  formatInlineCode("set()"),
  '<code class="inline-code"><span class="tok-builtin">set</span>()</code>'
);

check(
  "Sentence with `hash()` and `id()`",
  formatInlineCode("Použijte `hash()` a `id()`"),
  'Použijte <code class="inline-code"><span class="tok-builtin">hash</span><span class="tok-operator">(</span><span class="tok-operator">)</span></code> a <code class="inline-code"><span class="tok-builtin">id</span><span class="tok-operator">(</span><span class="tok-operator">)</span></code>'
);

// 3. Flexible fill evaluation tests
const fillTests = [
  { user: "set", target: "set()", expected: true, label: "set matching set()" },
  { user: "set()", target: "set", expected: true, label: "set() matching set" },
  { user: "frozenset", target: "set()", expected: false, label: "frozenset NOT matching set()" },
  { user: "hash()", target: "hash() | id()", expected: true, label: "hash() matching hash() | id()" },
  { user: "id", target: "hash() | id()", expected: true, label: "id matching hash() | id()" },
];

for (const ft of fillTests) {
  const res = isFlexibleCodeFillCorrect(ft.user, ft.target);
  check(`Fill Eval: ${ft.label}`, res, ft.expected);
}

console.log(`\nFormat Unit Tests Complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
