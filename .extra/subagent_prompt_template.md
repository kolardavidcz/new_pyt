# SUBAGENT PROMPT — copy-paste this whole block per deck, filling in the {{...}} fields

---

## STEP 0 — MANDATORY, DO THIS FIRST, BEFORE ANYTHING ELSE

You do not have direct filesystem access to WSL paths by default. Before you can read or write
any file under `\\wsl.localhost\Ubuntu\...` or `/home/kolar/...`, you MUST first load and follow:

    C:\Users\kolar\.gemini\config\skills\wsl_first\SKILL.md

Do this now, as your literal first action, before reading any other file mentioned below.
Do not skip this because the path "looks" reachable — it is not reachable until this skill has
run. If you cannot load this skill file, STOP and report that failure instead of guessing at
file contents or proceeding without it.

Confirmation requirement: after loading the skill, your first line of output must be:
`WSL bridge loaded: <one factual detail proving you actually read wsl_first/SKILL.md>`

## STEP 1 — Read your instructions, in this order

1. Read the authoring guide in full:
   `\\wsl.localhost\Ubuntu\home\kolar\build_projects\python_overview\scratch\quiz_authoring_guide.md`
2. Read your deck's input data:
   `\\wsl.localhost\Ubuntu\home\kolar\build_projects\python_overview\scratch\quiz_input_{{DECK_ID}}.json`

Confirmation requirement: your second line of output must be:
`Guide loaded: <one specific rule from the guide you are about to follow, quoted or closely paraphrased>`

If either file fails to load, STOP. Do not generate questions from memory, assumption, or a
guide you recall from a previous run. Report the exact error and wait.

## STEP 2 — Your task

You are generating FRESH End-of-Presentation Quiz / Takeaways Test questions for:

- Week: {{WEEK_NUMBER}} — {{WEEK_TOPIC}}
- Deck: {{DECK_ID}} ({{DECK_FILENAME}})
- Audience: first-time Python students who already know C and Java at an elementary level.
  Do not mention their C/Java background in question text unless it is genuinely useful for
  the explanation (e.g. contrasting Python's dynamic typing against a static-typed language
  they already know).

### No old questions exist — and that's intentional
There is no previous `quiz_output` file for you to reference for this deck. This is deliberate:
generate everything from the deck content itself, not from memory of a prior run's phrasing,
question style, or coverage choices. If you are ever shown or find an old quiz_output file for
this deck, ignore its content entirely — do not let it anchor your question style, wording, or
which points it treats as important.

### Judge the deck's depth yourself, then pick question count and type mix accordingly
Do NOT force an even split across question types, and do NOT force a fixed question count.
Instead:
- Read the deck and decide: is it "wide" (many distinct facts/tools/commands the student
  should recall — e.g. an overview of the packaging ecosystem) or "deep" (a small number of
  concepts the student needs to actually understand and apply — e.g. how decorators work)?
- Wide deck → more questions (roughly 6-10+), weighted toward recall/coverage: multiple_choice,
  code_fill, predict_output.
- Deep deck → fewer questions (roughly 4-8), weighted toward reasoning/application: predict_output,
  true_false_tricky, and multiple_choice with conceptually-close distractors — not surface trivia.
- Use whichever question types actually fit each specific takeaway point. If a deck naturally
  produces zero good true_false_tricky questions, produce zero. Do not pad the type distribution
  for its own sake.

### Question types available (use as needed, not as a quota)
1. `multiple_choice` — 4 options. Distractors must reflect real, specific misconceptions
   (not generic wrong answers).
2. `code_fill` — snippet with a blank. See UI RULE below for exactly how to mark blank position.
3. `predict_output` — student predicts what code/command produces.
4. `true_false_tricky` — "Pravda nebo Nepravda: [statement]", each option carries its own
   rationale (not a shared explanation block).

### Anti-verbosity-bias rule (important, re-check every question before finalizing)
LLMs have a systematic bias toward writing the longest answer choice as the correct one, and
toward padding question stems with unnecessary preamble. Actively counteract both:
- The correct answer must NOT be reliably identifiable by length. Write distractors that are
  comparable in length and specificity to the correct answer — pad the wrong answers, don't
  water down the right one, if you notice a length tell.
- Question stems must be direct, no throat-clearing. Cut phrases like "Co se stane, pokud se v
  Pythonu pokusíte..." down to the actual question. Prefer: "Jaký je výstup?" /
  "Co vrátí tento kód?" / direct imperative framing over scenario-setup padding.
- For deep decks especially: test the actual resulting insight/mechanism, not a restated
  summary sentence from the slide. If a question could be answered correctly by someone who
  only skimmed the slide title, rewrite it.

### UI RULE — code_fill blanks must be inline, not block-style
The app has a dedicated `.inline-code-fill-input` CSS class for this. When you write a
`code_fill` question:
- The blank MUST sit inline in the code line itself, e.g.:
  `df.groupby('___BLANK___').sum()`
  not a separate line, not a code block followed by a fill box underneath.
- Mark the blank position with the literal token `___BLANK___` inside the code string, so the
  renderer can substitute the `.inline-code-fill-input` element at that exact character position.
- Do not put the blank on its own line and do not describe the blank in prose ("fill in the
  missing method name below") — the blank's position in the actual code line IS the question.

### Czech explanations
Every question gets a detailed, instructive Czech explanation — explain *why* the correct
answer is correct and, where useful, why the strongest distractor is wrong. Keep it substantive
but not padded (see anti-verbosity rule above — this applies to explanations too, not just stems).

## STEP 3 — Output

Save to:
`\\wsl.localhost\Ubuntu\home\kolar\build_projects\python_overview\scratch\quiz_output_{{DECK_ID}}.json`

Use the exact JSON structure defined in the authoring guide. Additionally include one metadata
field at the top level so the orchestrator can verify you actually read the guide:

```json
"source_guide_confirmed": "<the same specific rule you quoted in STEP 1's confirmation line>"
```

Do not deviate from the guide's schema even if this prompt's examples look slightly different —
the guide is the source of truth for field names and structure.
