# Session Checkpoint: Python Course Shell & Quiz Architecture

- **Goal**: Full modernization, disambiguation, and bug fixing for the Python course platform (`newpyt` / `python_overview`), covering quiz structures, curriculum topic ordering, slide signatures, print sizing, and local dev serving.
- **Decisions & Rules**:
  - Theme: "2 · Terminal" VS Code Dark+ styling (`var(--font-mono)`, `#6a9955` green comments, `#4ec9b0` type teal, `#38bdf8` prompts).
  - WSL2 execution mandate (`wsl bash -c "..."`) for Python/Node commands; port 34060 dev server (`serve.py`).
  - Prebuild step: Static lecture trees in `data/lectures/` and `public/data/lectures/`, quiz chunks in `data/quizzes/` and `public/data/quizzes/`.
  - Balanced 25/25/25/25% option distribution enforced across all 4-option questions.
  - Handwritten fill blanks in `@media print` sized strictly to the expected codeword with `--blank-len`.
  - Modern Python 3 syntax across all slides (eliminated BNF `[, key][, reverse]` artifacts).

- **File Changes & Modules**:
  - `data/course.json`: Reordered `frozensets.html` to Week 3 (after `sets.html`) and `git.html` before `git.advanced.html` in Week 0; bound unique `slug` and `quiz_deck` for all 17 overviews and duplicate basenames.
  - `data/quizzes.json`: 753 total questions across 115 dedicated decks; separated prompt sentences from code; removed duplicate `vysledek = ________` inputs; converted fill suggestions to `code  # comment`; balanced answer distribution.
  - `app/js/quiz.js`: Imported `escapeAttr`; added `--blank-len` and `data-len` to `.inline-code-fill-input`; formatted hint chips with `# comment` styling in syntax green; cleaned 180° rotated print answer key to output pure codewords for fill questions.
  - `app/js/format.js`: Stripped `# comments` in `normalizeToken` for flexible evaluation.
  - `app/js/admin.js`: Added `autocomplete="off" name="search_admin_improvements_filter" spellcheck="false" data-lpignore="true" data-form-type="other" data-1p-ignore` to `#admSearchImp` to block Chrome password manager username autofill.
  - `app/css/print.css`: Sized `.inline-code-fill-input` and `.filled-blank` with `border-bottom: 1.5px solid #0f172a` and `width: calc(var(--blank-len, 8) * 1.15ch + 10px)` for handwritten exam fill-in on paper.
  - `serve.py`: Added `ROOT / "public"` candidates for `/data/` and `/app/` requests.
  - `tools/prebuild_lectures.mjs`: Outputs static slide trees and quiz chunks to both `data/` and `public/data/` including `w0..w13`, `w99` bundles.
  - `tools/modernize_slide_signatures.py`: Modernized BNF bracket signatures (`sorted(iterable, key=None, reverse=False)`, `replace(old, new, count=-1)`, etc.) across all 172 lecture files.
  - `tools/verify_curriculum_and_quizzes.py`: Permanent regression test suite asserting topic sequence, quiz isolation, option balancing, and link validity.

- **Current State & Verification**:
  - `python3 tools/verify_curriculum_and_quizzes.py` ➔ **7/7 Passed (100%)**.
  - `python3 scratch/verify_signatures_and_print.py` ➔ **3/3 Passed (0 legacy BNF bracket artifacts in lecture JSONs)**.
  - `python3 tools/test_all_links_in_app.py` ➔ **4027 / 4027 Links Passed (100.0%) with 0 failures**.
  - Latest Git Commits: `9af19de` (quiz structure sanitization), `e664e73` (escapeAttr import fix), `80ab219` (print sizing & signature modernization).

- **Pending / Next Potential Tasks**:
  1. Continue any further user-requested visual polish or exercise enhancements.
  2. Monitor and triage user improvement feedback from Upstash Redis via Admin Control Center (`#adminModal`).
