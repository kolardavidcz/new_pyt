# LLM Task: Phase 2 — Course labeling & retagging

You are an **expert CS educator and curriculum designer** for a Python course aimed at students who already know **C and/or Java**.

This is **Phase 2** of the greenfield course product. Phase 1 built (or is building) the VS Code–themed shell and imports existing metadata. **You have full permission to retag and relabel** lectures, exercises, and (optionally) individual slides/úkols.

Do **not** rebuild the UI. Focus on **metadata quality**.

Related briefs:

- `LLM_FROM_SCRATCH_PROMPT.md` — Phase 1 product / shell
- `.old/cjs/course-data.js` — legacy labels (starting point, not sacred)
- `.old/cjs/slide-classification.js` — legacy per-slide flavors (`slug#idN`)

---

## Mission

Produce a **consistent, pedagogically sound** labeling of the course so students can:

1. Prioritize with **relevance** (what matters most for the C/Java → Python path).
2. Filter with **tags** (must-learn vs optional vs wow vs traps).
3. Understand **how hard / how new** a topic is via **difficulty flavors**.
4. Trust badges in the tree, catalog, and filters.

Write labels into the **new app data layer** (prefer `data/course.json` or `data/labels/…`). Prefer **not** treating `.old/` as the only writable store.

---

## Permission & scope

| Allowed | Not allowed |
|---------|-------------|
| Change `tags`, `relevance`, `diff` (flavor) on any lecture/exercise | Mass-rewriting educational slide prose “for style” |
| Add missing exercises into the catalog with full labels | Inventing fake content files that do not exist |
| Optional: retag **slides/pages** and **úkols** if data model supports it | Breaking path keys so the shell cannot open files |
| Optional: improve Czech `desc` / `compare` when wrong, empty, or misleading | Random tag spam (every item Core+WOW+Legendary) |
| Batch-edit via Python scripts that rewrite JSON | Silently diverging tag vocabulary (new invent-your-own tags) |

**Stable path keys** (`path` to HTML) must keep working. Retag metadata, not filenames, unless a content pipeline already remaps paths.

---

## Taxonomy (do not invent new primary tags)

### Tags (multi-select, use sparingly)

| Tag | When to use | When not to use |
|-----|-------------|-----------------|
| **Core** | Required for the main C/Java → Python path; weekly “must not skip” | Background tooling the course barely needs |
| **WOW** | Delightful Python power-up worth highlighting (e.g. slicing, comprehensions, REPL affordances) | Everything that is merely “nice” |
| **Legendary** | Landmark / capstone-level topic in the course narrative (rare) | Routine chapters |
| **Tricky** | Easy to misuse; subtle semantics; classic footguns | Merely long or boring topics |
| **Skip** | Optional for the main path; deep-dive, alternate toolchain, or “if you have time” | Core syntax of the language |

**Guidance:**

- Prefer **1 tag**; **2 max** (e.g. `Core` + `Tricky`). Three tags is almost always wrong.
- `Core` and `Skip` together is forbidden.
- `Legendary` should be rare (handful per whole course, not per week).
- `WOW` is emotional/marketing for curiosity — still accurate, not clickbait.

### Relevance (integer 1–10)

How important is this item for a **C/Java programmer becoming productive in Python** in this course?

| Score | Meaning |
|------:|---------|
| 1–3 | Peripheral, setup trivia, or niche |
| 4–5 | Useful context; not on the critical path |
| 6–7 | Should learn; solid part of the path |
| 8–9 | High leverage; prioritize |
| 10 | Absolute must; course fails without it |

**Consistency rules:**

- Same topic family should not swing wildly without reason (e.g. `venv` 8 and `pip` 3 is suspicious).
- `Skip` items are usually ≤ 5; `Core` items are usually ≥ 6. Exceptions need a short note in the changelog.
- Relevance is **not** the same as difficulty. Easy setup can be high relevance; hard esoterica can be low relevance.

### Difficulty flavor (`diff`) — single value

From the perspective of a **C/Java student**:

| Value | Meaning |
|-------|---------|
| `basics` | Foundations, setup, orientation, “how we work here” |
| `resyntax` | Same idea as C/Java, different surface syntax |
| `newconcept` | Concept not really present (or very different) in C/Java |
| `pythonic` | Idiomatic style/practice; “how Pythonistas write it” |
| `paradigm` | Mental-model shift (refs vs values, iteration protocol, REPL workflow, etc.) |

Pick **one** flavor per lecture/exercise item. For slides, same enum via keys `slug#idN` if you label slides.

### Optional text fields

| Field | Language | Purpose |
|-------|----------|---------|
| `desc` | Czech | 1–2 sentences: what the student gets |
| `compare` | Czech | Explicit bridge to C/Java (or C++) — why Python differs or maps |

If you edit these: keep factual, short, student-facing. Do not empty working legacy text without replacement.

---

## Sources of truth (read order)

1. **Item content** — title + actual material under `.old/vyuka_downloaded/` (or `content/` if Phase 1 copied it). Labels must match reality.
2. **Week context** — item’s week title/description; labels should fit the narrative arc.
3. **Legacy metadata** — `.old/cjs/course-data.js` and `slide-classification.js` as **hints**, not law.
4. **Syllabus notes** — `.old/vyuka_downloaded/Cpp_silabus.md`, `Java_silabus.md` if useful for compare framing.

---

## Target outputs

Prefer one clear schema the shell already reads. Example shape:

```json
{
  "weeks": [
    {
      "week": 0,
      "title": "…",
      "description": "…",
      "lectures": [
        {
          "title": "Modul venv",
          "path": "…/venv.html",
          "tags": ["Core"],
          "relevance": 8,
          "diff": "newconcept",
          "desc": "…",
          "compare": "…"
        }
      ],
      "exercises": []
    }
  ]
}
```

Optional slide-level file:

```json
{
  "venv#id1": { "diff": "basics", "tags": [], "relevance": null },
  "venv#id2": { "diff": "paradigm", "tags": ["Tricky"], "relevance": 7 }
}
```

Also write:

- `data/labels/CHANGELOG.md` (or `LABELING_NOTES.md`) — policy decisions, bulk shifts, uncertain items
- If useful: `data/labels/review-queue.json` — items you want a human to double-check

---

## Process (recommended)

1. **Inventory** — load current `data/course.json` (or import from `.old/cjs/course-data.js`). Count items; list weeks.
2. **Calibrate** — pick 8–12 representative items across weeks; label them carefully; use as anchors (e.g. venv/pip Core+high relevance; pure Conda often Skip; pitfalls often Tricky).
3. **Pass A — tags + relevance** for every lecture and exercise.
4. **Pass B — flavors** (`diff`) for every item.
5. **Pass C (optional)** — slides/úkols if the product shows them; keep stable `slug#idN`.
6. **Pass D (optional)** — fix empty/wrong `desc`/`compare`.
7. **Consistency audit**
   - No Core+Skip
   - Legendary count is low
   - Tag histogram not absurd (not everything Core)
   - Relevance distribution not all 8–10
   - Paths still resolve
8. **Wire** — ensure the app loads the new file; spot-check filters in the UI if the shell exists.
9. **Changelog** — document non-obvious choices.

Work in batches (by week) if context is large. Idempotent Python helpers that patch JSON are encouraged.

---

## Pedagogical heuristics (C/Java → Python)

Use as defaults, override when content disagrees:

| Topic family | Typical tags | Typical relevance | Typical flavor |
|--------------|--------------|-------------------:|----------------|
| Install / multi-version noise | Skip or light WOW | 2–5 | basics / resyntax |
| venv, pip, project isolation | Core | 7–9 | newconcept |
| Conda (if pip+venv covered) | Skip | 3–5 | newconcept |
| Jupyter | WOW | 6–7 | paradigm / newconcept |
| Dynamic typing, refs, identity | Core, often Tricky | 7–9 | paradigm |
| Indentation, for-each | Core | 8–9 | resyntax / paradigm |
| str / slices / unicode | Core, maybe WOW | 7–9 | newconcept / pythonic |
| lists/dicts/sets vs Java collections | Core | 8–9 | resyntax / newconcept |
| functions, *args, kwargs | Core | 7–9 | newconcept |
| comprehensions, generators | Core or WOW | 7–9 | pythonic / paradigm |
| OOP in Python | Core | 7–8 | resyntax / newconcept |
| exceptions | Core | 7–8 | resyntax |
| modules/packages | Core | 7–8 | newconcept |
| testing | Core or WOW | 6–8 | newconcept |
| regex | depends on track | 5–7 | resyntax / newconcept |
| numpy/pandas deep dives | often Skip unless track is data | 3–6 | newconcept |
| pitfalls / gotchas | Tricky, maybe Core | 7–9 | paradigm |
| exercises that drill Core lectures | Core | match lecture ±1 | same family |

---

## Quality bar

A labeling set is “done” when:

- [ ] Every catalog lecture has `tags` (non-empty), `relevance` (1–10), `diff` (valid enum).
- [ ] Exercises in the catalog have the same fields when present.
- [ ] No illegal combos (Core+Skip); Legendary is rare.
- [ ] Relevance and tags roughly agree (Core ≈ higher relevance).
- [ ] Labels match real content (spot-check ≥ 10 items by opening titles/paths).
- [ ] Output lives in the **new** data layer; shell can load it.
- [ ] Changelog lists bulk policy and uncertain items.
- [ ] Optional slide keys still use stable `slug#idN` if slides were labeled.

---

## Anti-patterns

- Tagging everything `Core` “to be safe”
- Using `WOW` as a synonym for Core
- Relevance all 10s
- Copying legacy labels without reading titles/content
- Changing `path` values casually
- Inventing tags outside the set above
- Editing `.old/` as the only output and leaving the new app on stale JSON

---

## How to start

```text
1. Read data/course.json if it exists; else import from .old/cjs/course-data.js
2. Skim week structure and 2–3 HTML/XML samples per week under .old/vyuka_downloaded/
3. Calibrate anchors → batch label by week → audit → write JSON + CHANGELOG
4. Confirm the shell filters still work against the new file
```

When finished, report:

- Counts: items labeled; tag histogram; relevance mean/min/max
- Biggest policy changes vs legacy
- Items left in the human review queue
- Exact file paths written

---

# Vocabulary (labeling)

| Term | Meaning |
|------|---------|
| **Tag** | Qualitative label: Core, WOW, Legendary, Tricky, Skip |
| **Relevance** | 1–10 importance for C/Java → Python path |
| **Flavor / diff** | Single difficulty class vs C/Java background |
| **Retag / relabel** | Revising metadata; this prompt’s job |
| **Phase 2** | Labeling phase after shell works |
| **Legacy metadata** | Old course-data / slide-classification under `.old/` |
| **Catalog item** | One lecture or exercise row in course data |
| **Anchor labels** | Carefully chosen exemplars that set the scale |
| **Changelog** | Human-readable record of labeling policy and bulk shifts |
| **slug#idN** | Stable slide classification key |
| **Compare** | Czech C/Java bridge text |
| **Desc** | Short Czech item blurb |
| **Úkol** | Exercise task unit (optional finer labeling) |

### Tag set

Core · WOW · Legendary · Tricky · Skip

### Flavor set

basics · resyntax · newconcept · pythonic · paradigm

---

*End of labeling prompt. Execute after or alongside a working Phase 1 data path; write labels into the new app’s data, not only into `.old/`.*
