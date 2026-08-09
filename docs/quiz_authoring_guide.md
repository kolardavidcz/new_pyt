# Quiz Authoring Guide — Presentation Takeaways Test Master Spec

This document is the master spec for generating End-of-Presentation Quiz / Takeaways Test questions across all presentation decks in `python_overview`.

---

## 1. Target Audience & Tone

- **Audience**: First-year VŠCHT students taking their introductory Python course. They have basic knowledge of C and Java from prior university courses.
- **Language**: All question stems, options, and explanations must be in clear, natural Czech.
- **C/Java Context**: Do NOT repeatedly mention C or Java in question text. Only invoke a C/Java contrast when it provides a genuine, high-value mental model difference (e.g., `del` vs `free()`, mutable default arguments, or reference vs contiguous memory). Most questions should require no C/Java mention at all.

---

## 2. Deck Depth Classification (Wide vs Deep)

Before generating questions, classify the deck based on its pedagogical intent:

- **Wide Decks** (syntax/feature/tool overviews, packaging, CLI tools):
  - Focus: Test breadth of recall across distinct facts, commands, and syntax variants.
  - Question count: Content-driven (typically 6–10+ questions).
- **Deep Decks** (memory model, GIL, descriptors, metaclasses, async, scoping, broadcasting):
  - Focus: Test deep conceptual mechanisms, execution order, and edge-case traps.
  - Question count: Content-driven (typically 4–8 questions).
  - Do NOT write surface-level "what was this slide about" recap questions. Test resulting insights that require actual understanding to solve.

---

## 3. Critical Quality & Anti-Bias Rules

1. **Direct Stem Brevity ("No Yapping")**:
   - Cut question-stem preamble. Do NOT open with "Co se stane, pokud se v Pythonu pokusíte...", "Věděli byste, co se stane když...", or "Které z následujících tvrzení je pravdivé...".
   - Ask the question directly.
   - *Good*: "Jaký je hlavní rozdíl mezi `==` a `is`?"
   - *Good*: "Co vrátí `[1, 2] + [3, 4]`?"

2. **Equal Option Length (Anti-LLM Bias)**:
   - LLMs systematically bias toward making the correct answer the longest and most detailed option.
   - **Mandatory check**: All 4 options (`multiple_choice`, `code_fill`, `predict_output`) or both rationale statements (`true_false_tricky`) MUST be approximately equal in length and detail.
   - The correct answer must never be identifiable by being the longest option. If it is, expand and add technical specificity to the distractors—do NOT shorten or water down the correct answer.
   - Every distractor must reflect a plausible, real-world student misconception, not filler.

3. **Content-Driven Question Types**:
   - Question type follows content, not quotas. Do not force an artificial split across types.
   - Available types: `multiple_choice`, `code_fill`, `predict_output`, `true_false_tricky`.
   - Zero questions of a given type is fine if nothing in the deck suits it.

4. **Inline Code Fill (`code_fill`)**:
   - The snippet MUST contain the literal token `________` positioned inline inside the code line at the exact spot the missing code belongs.
   - Do NOT format as a separate answer line or box below the snippet—the blank's position inside the code line IS the question.

5. **Instructive Czech Explanations**:
   - Every question gets a detailed, instructive Czech explanation explaining *why* the correct answer is right and why the strongest distractor is wrong. Keep explanations direct and unpadded.

---

## 4. Required Output JSON Format

Subagents save their generated quiz output to `scratch/quiz_output_[CHUNK_ID].json` using this exact structure:

```json
{
  "week": 1,
  "quizzes": {
    "deck_slug_here": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "question": "Jaký je hlavní rozdíl mezi == a is?",
        "options": [
          "A) == porovnává hodnoty objektů, zatímco is porovnává jejich identitu v paměti.",
          "B) == porovnává identitu v paměti, zatímco is porovnává hodnoty objektů.",
          "C) Obě operace jsou v Pythonu zcela identické a vzájemně zastupitelné.",
          "D) is se používá výhradně pro čísla, zatímco == se používá pro řetězce."
        ],
        "answer": 0,
        "explanation": "Operátor == volá __eq__() pro porovnání obsahu, zatímco is kontroluje id(a) == id(b)."
      }
    ]
  }
}
```
