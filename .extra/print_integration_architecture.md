# "Print with tests" — integration architecture

Based on your stylesheet inventory (tokens.css, shell.css, content.css, syntax.css, print.css)
and confirmed usage: interactive in-app quizzes (click-to-answer, JS-graded), plus a separate
print-optimized view.

## 1. Data flow
```
quiz_output_{{deck}}.json  →  loaded alongside the deck's slide HTML in app/index.html's
                               #mainContent mount point, rendered as a "Quiz" tab/section
                               appended after the deck's last slide.
```
Keep quiz JSON as a sibling artifact per deck (already your convention) rather than inlining it
into the slide HTML — this keeps regeneration (this whole subagent pipeline) from needing to
touch or re-render the slide HTML at all. Quiz rendering is purely additive at load time.

## 2. Settings toggle — "Print with tests"
- Location: wherever your existing print/export control lives in the header toolbar (shell.css
  "Header toolbar" region) — add a checkbox/toggle next to it: **"Zahrnout testy"** (or
  "Print with tests"), persisted the same way your other view-state toggles are (localStorage /
  app state, whatever shell.css's existing pattern is).
- When OFF (default): print output = slides only, current behavior unchanged.
- When ON: print output = slides, then each deck's quiz questions appended at the end of that
  deck's section, in print.css's existing 2-column grid pattern.

## 3. print.css additions needed
You already have: A4 portrait, 12mm margins, 2-column quiz grids, hidden UI chrome,
auto-scaled images. Extend with:
- `.quiz-print-section` — page-break-before: always (start each deck's quiz on a fresh page,
  don't let it run onto the last slide's page).
- Answer visibility in print: since print is a *supplementary* view of an already-interactive
  quiz, decide once: does print show correct answers inline (answer key mode) or blank
  (worksheet mode)? Recommend two sub-toggles under "Zahrnout testy": "Se správnými odpověďmi"
  vs "Bez odpovědí (pracovní list)" — reuses the same quiz data, just toggles a CSS class
  (`.print-show-answers`) that reveals/hides `.answer-correct` / `.explanation-block` elements.
- `.inline-code-fill-input` in print mode: renders as an underlined blank
  (`border-bottom: 1px solid var(--ink-color); min-width: 4ch;`) instead of an interactive
  `<input>`, so it reads naturally on paper either as a worksheet blank or, in answer-key mode,
  with the answer text inserted in its place.
- `.quiz-terminal-wrap` in print mode: keep syntax.css's token colors even under
  `@media print` — don't let a print reset strip them to plain black/white, since your
  code-highlighting is part of what makes predict_output questions legible. Confirm
  `print-color-adjust: exact;` (and `-webkit-print-color-adjust: exact;`) is set on that class
  so browsers don't silently discard background/token colors when printing.

## 4. Syntax highlighting consistency
syntax.css already defines VS Code dark-theme tokens for Python/C/C++/HTML/Bash/SQL/JSON — reuse
those exact token classes inside quiz code blocks (code_fill snippets, predict_output snippets)
rather than a separate quiz-specific highlighter. This is what makes a code_fill question visually
indistinguishable from a normal slide's code block except for the inline blank, which is the UX
goal from point 4 of your brief.

## 5. Theming
tokens.css's dark/light HSL variables should be the only source of color for quiz elements too —
don't hardcode quiz-specific colors. `.inline-code-fill-input`, option buttons, and
`.quiz-terminal-wrap` should all reference the same `--*` custom properties the slide content
uses, so a theme switch (dark/light) recolors quizzes automatically with zero quiz-specific CSS
changes.

## 6. Open decisions for you (I don't have enough context to decide these)
- Does grading state (which answers the student picked) persist across sessions, or reset per
  visit? This affects whether print's "with answers" mode should show the *student's* answers or
  just the *correct* answers.
- Is the quiz JSON schema per-deck 1:1 with the slide HTML file, or can one slide HTML map to
  multiple quiz files (e.g. a retake variant)? This affects the loader logic in step 1.
