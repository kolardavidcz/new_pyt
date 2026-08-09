# Example filled-in subagent prompt (copy this SHAPE, not these literal values)

This is what one actual dispatched prompt looks like, per master spec §4's pattern. Everything
in [brackets] is what you replace per chunk. The deck JSON goes in whole — don't summarize it,
don't link to it, paste it.

---

You are QuizAuthorSubagent generating FRESH, high-pedagogical-quality End-of-Presentation Quiz /
Takeaways Test questions for Batch w4 based on the following input deck data:

```json
[FULL CONTENTS OF scratch/quiz_input_w4.json PASTED HERE — every slide/section/takeaway point
the orchestrator read in Step 1, verbatim, not summarized]
```

Target audience: first-year VŠCHT Python students who already know C and Java from basic
university courses. Do not repeatedly invoke "v C a Javě" comparisons — only when a contrast
gives a genuine, high-value mental model difference (e.g. `del` vs `free()`, mutable default
argument trap, pointer array vs contiguous buffer). Most questions should need no C/Java mention
at all.

CRITICAL AUTHORING RULES (violating any of these invalidates the output — apply all of them to
every single question before finalizing):

1. **NO YAPPING.** Never open with "Co se stane, pokud se v Pythonu pokusíte...",
   "Věděli byste, co se stane když...", "Které z následujících tvrzení je pravdivé...". Ask the
   question directly. Good: "Jaký je hlavní rozdíl mezi `==` a `is`?" Good: "Co vrátí
   `[1, 2] + [3, 4]`?"

2. **EQUAL OPTION LENGTH (MANDATORY, CHECK EVERY QUESTION).** For every `multiple_choice`,
   `code_fill`, and `predict_output` question, all 4 options must be approximately equal in word
   and character count. For `true_false_tricky`, both rationale options must be approximately
   equal length. The correct answer must never be identifiable by being the longest or most
   detailed option — if it currently is, rewrite the distractors to match its length and
   specificity, don't shorten the correct answer. Every distractor must be a real, technically
   plausible misconception, not filler.

3. **DECK DEPTH DRIVES VOLUME, NOT A FIXED COUNT.** Classify this deck as wide (syntax/feature/
   tool overview → 6-10+ questions, test breadth) or deep (memory model, GIL, descriptors,
   metaclasses, async, broadcasting → 4-8 questions, test the resulting insight and edge-case
   traps, not a slide-summary recap).

4. **QUESTION TYPE FOLLOWS CONTENT, NOT QUOTA.** Do not force one of each type. Use whichever of
   `multiple_choice` / `code_fill` / `predict_output` / `true_false_tricky` genuinely fits each
   takeaway point. Zero questions of a given type is fine if nothing in the deck suits it.

5. **INLINE FILL FORMAT.** `code_fill` blanks use literal `________` positioned inline inside the
   code block at the exact spot the token belongs — never a separate answer line or box below the
   snippet.

Save the resulting output JSON object to `scratch/quiz_output_w4.json` using exactly this format:

```json
{
  "week": 4,
  "quizzes": {
    "[deck_slug_or_id]": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "question": "...",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "answer": 0,
        "explanation": "..."
      }
    ]
  }
}
```

---

## Notes for the orchestrator building each real instance
- Replace `w4` (both in the header and the save path) with the actual chunk id — `w0_a`, `w9`,
  `w99_c`, etc.
- Replace `"week": 4` with the actual week number for that chunk.
- If a batch chunk spans multiple decks (e.g. `w0_a` bundles two short decks), the
  `"quizzes"` object gets one key per deck slug — keep them as separate arrays under one JSON
  object, matching the schema above, don't merge their questions into one list.
- Nothing in this prompt should say "read the guide at [path]" or "read the input at [path]" —
  if you find yourself tempted to add a file reference instead of inlining something, that's the
  exact failure mode master spec §4 exists to prevent.
