# Orchestrator run instructions — Quiz regeneration batch

Matches the documented pattern in Master Spec §4-5. The core fix for "subagent can't find the
guide" is: **subagents never read files themselves.** You (the orchestrator) read everything and
inline it into the prompt string. This is more robust than any skill-trigger fix, because it
removes the file-read step from the subagent entirely — there's nothing to fail to find.

## Step 0 — Pre-flight cleanup (orchestrator does this, not subagents)
1. Delete/archive current `scratch/quiz_output_*.json` for every deck in this run — move to
   `scratch/_archive/<timestamp>/` rather than hard-delete, so a bad run is recoverable.
2. Do not reference old quiz_output files anywhere in the prompts you build below. Subagents get
   zero visibility into prior question phrasing, so there's nothing to anchor on.

## Step 1 — Read once, yourself
Read `scratch/quiz_authoring_guide.md` (the master spec) and each deck's
`scratch/quiz_input_[chunk_id].json` yourself, as the orchestrator. Subagents never touch these
paths directly.

## Step 2 — Build one fully-inlined prompt per chunk
For each chunk (`w0_a`, `w0_b`, `w1`, ... `w99_c`), take the Subagent Prompt Template from the
master spec §4 and:
- Paste the chunk's full input deck JSON directly into the `[INLINED_INPUT_DECK_JSON_HERE]` slot.
- Fill in `[BATCH_NAME]` and `[WEEK_NUM]`.
- Leave the CRITICAL AUTHORING RULES block exactly as written in the master spec — don't
  paraphrase or shorten it; every rule in it exists because a prior run violated it.

The resulting prompt should be fully self-contained: a subagent given only this string, with no
other file access, should be able to produce a correct, in-spec quiz_output file. If it can't,
something is missing from the inline — add it, don't add a file reference instead.

## Step 3 — Dispatch in batches of ≤5
- Group chunks into batches of at most 5, per the master spec's example batching (§4).
- Launch a batch, wait for all 5 to report completion, then launch the next batch. (The master
  spec's concurrency cap is a hard rate-limit constraint, not a soft preference — going over 5
  risks 429s across the whole batch, not just the excess subagent.)
- Track completion by checking for the matching `scratch/quiz_output_[chunk_id].json` file on
  disk, not by trusting the subagent's self-reported "done" message.

## Step 4 — Post-batch verification (before moving to consolidation)
For each `quiz_output_[chunk_id].json`:
1. Confirm it parses as valid JSON.
2. Confirm question count is in the expected 4-10 range per the deck's wide/deep classification
   (reject and redispatch if a subagent produced e.g. 1 question or 30).
3. Spot check 2-3 questions for the option-length anti-bias rule — if the correct answer is
   visibly the longest option across multiple questions, that chunk's subagent ignored the rule;
   redispatch with an even more explicit restatement of Rule 3 at the top of its prompt.
4. Spot check code_fill questions use inline `________` inside the code block, not a separate
   answer line/box below it.

## Step 5 — Consolidation (only after all chunks pass verification)
Run exactly as documented in master spec §5:
```bash
wsl bash -c "cd ~/build_projects/python_overview && python3 tools/consolidate_quizzes.py"
wsl bash -c "cd ~/build_projects/python_overview && node --check app/js/app.js && python3 tools/verify_clean_state.py"
```
Only after both succeed:
```bash
wsl bash -c "rm -rf ~/build_projects/python_overview/scratch/*"
```
Do not wipe scratch before consolidation succeeds — if consolidation fails partway, you'll want
the scratch outputs to debug against or rerun from.
