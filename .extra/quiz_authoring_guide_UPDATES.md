# quiz_authoring_guide.md — proposed updates

I have not seen your actual guide file, so I can't give you a clean diff against real line
numbers. Below are the specific sections to add or rewrite, written so you can drop each one
into the right place in your real guide. Flagged [NEW] or [REPLACE existing rule].

---

## [REPLACE existing rule] "Include a balanced mix of all 4 question types"

Old framing forced an even split across multiple_choice / code_fill / predict_output /
true_false_tricky for every deck. Replace with:

> Question type follows content, not quota. For each takeaway point in the deck, pick whichever
> question type best tests that specific point. Do not force a type you'd have to invent a weak
> question for just to hit a distribution target. It is fine for a deck to end up with zero
> questions of a given type if nothing in the deck suits that format.
>
> As a rough guide only (not a requirement): wide/overview decks tend to produce more
> multiple_choice and code_fill; deep/conceptual decks tend to produce more predict_output and
> true_false_tricky, because those formats better test whether the student can apply a mechanism
> rather than recall a fact.

## [NEW] Deck depth classification

> Before writing questions, classify the deck as "wide" or "deep":
> - **Wide**: the deck introduces many distinct, mostly-independent facts (tool names, CLI
>   commands, config keys, syntax variants). Goal: test breadth of recall. Target ~6-10+
>   questions, err toward more coverage of distinct facts over depth on any one.
> - **Deep**: the deck builds toward a small number of concepts the student must actually
>   understand and be able to apply (a mechanism, a control-flow pattern, a paradigm). Goal:
>   test the resulting understanding, not the summary. Target ~4-8 questions. Do NOT write a
>   "what was this slide about" recap question — write a question that only someone who
>   understood the mechanism can answer.
>
> A deck can be mixed. When it is, write wide-style questions for its wide sections and
> deep-style questions for its deep sections rather than forcing one mode for the whole deck.

## [NEW] Anti-length-bias rule

> LLM-authored multiple-choice and true/false questions have a well-documented bias: the correct
> answer tends to be noticeably longer and more hedged/specific than distractors, which lets
> students guess correctly ~90% of the time from length alone without knowing the material. This
> defeats the quiz's purpose.
>
> Before finalizing each question:
> - Compare the correct answer's length/specificity to each distractor. If the correct answer is
>   the clear outlier, rewrite distractors to be comparably detailed and plausible — never shorten
>   or vague-out the correct answer to compensate.
> - Distractors should reflect real misconceptions a student at this level would plausibly have,
>   not filler wrong answers.

## [NEW] Stem brevity rule

> Cut question-stem preamble. Bad (padded): "Co se stane, pokud se v Pythonu pokusíte přistoupit
> k prvku seznamu na indexu, který neexistuje?" Better (direct): "Co vrátí `seznam[10]`, pokud má
> seznam jen 5 prvků?" Ask the direct question; don't narrate a hypothetical scenario the student
> has to parse before reaching the actual question. This applies to explanations too — instructive
> but not padded.

## [REPLACE existing rule] code_fill blank formatting

> Blanks must be written inline within the code line using the literal token `___BLANK___` at the
> exact character position of the missing piece, e.g. `import ___BLANK___ as pd`. Do NOT format
> fill questions as a full code block followed by a separate answer box/line below the snippet —
> the app renders `___BLANK___` as an inline input (`.inline-code-fill-input` CSS class) sitting
> directly in the code line, matching the surrounding syntax highlighting. A fill question that
> isn't inline breaks this rendering and reads as a UX regression compared to the rest of the app.

## [NEW] Required output metadata field

> Every `quiz_output_*.json` must include a top-level field:
> ```json
> "source_guide_confirmed": "<a specific rule from this guide, to prove the guide was actually read>"
> ```
> This is used by the orchestrator to detect subagent runs that generated questions without
> reading this guide (common failure mode when the WSL bridge skill silently fails to trigger).
