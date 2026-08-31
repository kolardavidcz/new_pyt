# 🐍 Python Hub — VSČHT Praha Python Course & Study Dashboard

> **High-density, web-based learning environment tailored for developers and university engineering students transitioning from C/C++ and Java to modern, idiomatic Python.**
>
> 🌐 **Production Deployment**: [https://newpyt.vercel.app](https://newpyt.vercel.app)  
> 📁 **GitHub Repository**: [https://github.com/kolardavidcz/new_pyt](https://github.com/kolardavidcz/new_pyt)

---

## 📸 Overview & Features

### 🖥️ 1. VS Code Terminal & Explorer Workspace
- **Modern Terminal Aesthetics**: Built using dark mode glassmorphic VS Code interface design with zero extraneous visual noise.
- **Explorer Sidebar**: Tree navigation across 12+ structured course weeks, 77 core lectures, and 26 companion exercises.
- **Multi-Dimensional Filters**: Filter course topics by tag badges (`[Core]`, `[WOW]`, `[Tricky]`), 10-segment relevance heat slider, and difficulty ratings.

### 🔑 2. Student Authentication & Cloud Progress Sync
- **Instant Student Login**: Log in or register using your student email (`@vscht.cz`).
- **Salted SHA-256 Hashing**: Secure local password authentication powered by the browser Web Crypto API.
- **Instant Cross-Device Sync**: Progress automatically synchronizes to cloud storage (Upstash Redis KV), keeping your study tracking updated across laptop, tablet, and mobile.

### 🧩 3. Interactive Quizzes & Exercise Dojo
- **Balanced Multiple-Choice Quizzes**: Uniform, unbiased option distribution (~25% A, 25% B, 25% C, 25% D) across 665+ questions using deterministic FNV-1a hashing.
- **Code Fill & Output Prediction**: Interactive code completion with draggable nápověda pills and instant evaluation.
- **Dual Exercise Ratings**: Exercises feature independent **T** (Technical Syntax) and **L** (Logical/Algorithmic) difficulty ratings.

### 🖨️ 4. Unified Print Engine (`Ctrl+P`)
- **A4 Printable Study Plans**: Single-click PDF export generating clean, 2-column printable study sheets ordered chronologically (W1–W12 followed by W0 tooling).
- **WCAG 2.1 AAA Compliant**: High contrast typography guarantees readability on both screen and paper.

---

## 🎓 Pedagogical Philosophy & Cognitive Architecture

Python Hub is engineered upon modern **Computing Education Research (CER)** and **Sweller's Cognitive Load Theory (CLT)**, tailored specifically for university students with prior background in compiled, statically typed languages (C, C++, Java).

### 🧠 1. Cognitive Load Management in 90-Minute Lectures
- **Extraneous Load Elimination**: Single-page application architecture, instant hotkey navigation, and unified dark syntax tokens matching students' actual developer tooling suppress extraneous interface overhead.
- **Dual Coding Theory & Visuospatial Scaffolding**: Rather than explaining abstract memory models in text alone, code snippets are paired with explicit visual reference diagrams (name-binding arrows, heap object identity, and 2D/3D tensor broadcasting grids).
- **Faded Worked Examples (Renkl & Sweller)**: Lectures transition from fully annotated code solutions to interactive Code-Fill (cloze tests) and Parson's line-reordering tasks before students tackle unguided code synthesis in the Exercise Dojo.
- **Tri-State Metacognitive Self-Regulation**: Drawing from Zimmerman’s Self-Regulated Learning (SRL) model, students control their learning path via a 3-state progression model:
  - **`✓ Prostudováno` (Studied)**: Mastered and verified through quizzes or exercises.
  - **`↷ Znáno` (Known / Skipped)**: Previously mastered from C++/Java coursework, preventing cognitive boredom.
  - **`○ Ke studiu` (To-Study)**: Default queue for upcoming lecture material.

---

## 🔄 Contrastive Mental Models: Transitioning from C/C++ & Java

Students transitioning from static languages frequently experience **negative transfer**—projecting C/Java memory allocation, scoping, and typing assumptions onto Python. Python Hub directly addresses these friction points through explicit contrastive callouts (`compare`).

### ⚡ Paradigm Comparison Matrix

| Concept | C / C++ / Java Mental Model | Pythonic Mental Model | Common Transition Pitfall | Pedagogical Remedy |
| :--- | :--- | :--- | :--- | :--- |
| **Variables & Memory** | Statically typed memory "boxes" holding raw bits or addresses (`int x = 5`). | Dynamic "name tags" bound to heap `PyObject` references. | Mutable default arguments (`def f(x=[]):`), unintended aliasing (`b = a`). | Teach the *Sticky Note* mental model; inspect object identity with `id()`; enforce `None` default sentinels. |
| **Scope Resolution** | Lexical block scope `{ ... }`; loop variables destroyed on block exit. | LEGB scope (Local, Enclosing, Global, Built-in); `for`/`if` blocks do **not** create scope. | Loop variable leakage; closure late-binding (`[lambda: i ...]`); `UnboundLocalError`. | Diagram LEGB search chains; freeze default arguments (`lambda i=i: i`); explain `nonlocal` and `global`. |
| **Resource Cleanup** | C++ deterministic RAII stack destructors (`~Class()`). | Generational GC + explicit Context Management Protocol (`with`). | Relying on `__del__` as a destructor to close files, sockets, or DB handles. | Contrast stack unwinding with Python Context Managers; teach `with open(...) as f:` and `@contextmanager`. |
| **Typing System** | Nominal typing (`implements Interface`, compile-time vtables). | Dynamic Duck Typing & Structural Protocols (`typing.Protocol`). | Overusing `isinstance()` checks instead of protocol interfaces (`__iter__`, `__len__`). | Teach dunder protocol contracts; introduce structural subtyping via `typing.Protocol` (PEP 544). |
| **Error Handling** | LBYL (*Look Before You Leap*) defensive checks (`if (ptr != NULL)`). | EAFP (*Easier to Ask for Forgiveness than Permission*) via `try/except`. | Multi-level defensive `if` branches causing TOCTOU race conditions; bare `except:`. | Demonstrate TOCTOU race conditions; teach atomic EAFP blocks and narrow exception catching. |
| **Data Structures** | Contiguous homogeneous memory buffers (`int[]`, `std::vector<int>`). | Dynamic array of pointers (`PyListObject` storing `PyObject*` references). | Writing manual nested loops over arrays; expecting $O(1)$ memory locality in `list`. | Contrast Python `list` pointer arrays with contiguous strided C-buffers in NumPy `ndarray`. |
| **Performance** | Native compiled machine code; manual loops vectorized by compiler. | Bytecode interpreter loop; heavy opcode dispatch overhead. | 100x slowdown from nested pure-Python loops on numerical data. | Benchmark Pure Python vs List Comprehensions vs **NumPy vectorization** vs **Numba JIT (`@njit`)** vs **Cython**. |

### 🚀 Three Golden Rules for Engineers in Python
1. **Stop Writing C-Style Loops Over Data**: Use **NumPy array vectorization** (`C = A + B`) or **Numba JIT** (`@njit`) to execute numerical algorithms at compiled C speeds.
2. **Embrace Context Managers**: Always manage files, database handles, and hardware resources using `with resource:` to guarantee deterministic teardown.
3. **Think in Protocols, Not Hierarchies**: If an object implements `__iter__()` and `__getitem__()`, treat it as a sequence. Do not force rigid class inheritance.

---

## 🎯 5-Tier Pedagogical Slide Triage Taxonomy

To maximize instructional return on investment (ROI) during **90-minute live university lectures**, course slides and topics are categorized into a rigorous 5-tier pedagogical rubric:

| Tier | Share | Focus & Target Audience Goal | Live 90-Min Lecture Treatment |
| :--- | :---: | :--- | :--- |
| **`[Core]`** | ~55% | **Essential Foundation**: Dynamic reference model, primary collections (`dict`, `set`, `list`, `tuple`), iteration protocols, context managers, and error handling. | In-depth presentation, live coding demonstrations, and active interactive Q&A. *(~50 min)* |
| **`[WOW]`** | ~15% | **Modern Expressivity**: Python 3.8–3.13 gems (`match/case`, f-string specifiers, comprehensions, `@cached_property`, `pathlib`). | High-energy showcase demonstrating massive boilerplate reduction compared to C/Java. *(~14 min)* |
| **`[Tricky]`** | ~15% | **False Friends & Pitfalls**: Traps for C/Java devs (mutable defaults, late-binding closures, shallow copies, $O(n)$ `list.pop(0)`). | Interactive bug dissection, diagnostic quizzes, and mental model inoculation. *(~14 min)* |
| **`[Already Studied]`** | ~3–5% | **Bidirectional Breadcrumbs**: Spaced repetition linking advanced features to previously mastered protocols. | Rapid 60-second recap bridges reinforcing cumulative learning. *(~4 min)* |
| **`[Skip]`** | ~12% | **Self-Study Minutiae**: Opcode dumps, exhaustive API matrices, and niche legacy details. | Relegated to self-study reference shelves (W99); filtered out during live projection. *(0 min live)* |

---

## 🧩 Formative Assessment & Exercise Difficulty Calibration

Python Hub applies evidence-based pedagogical engineering to maximize active recall, minimize extraneous cognitive load, and provide transparent difficulty calibration:

### 1. Dual-Axis Exercise Metrics (Technical $T$ vs Logical $L$)
Every coding task in the Exercise Dojo is calibrated across two independent dimensions (1 to 5 scale):
- **Technical Score ($T1–T5$)**: Syntax complexity, Pythonic idioms, library surface (e.g., standard collections, context managers, decorators, generator protocols, C-interop/Cython).
- **Logical Score ($L1–L5$)**: Algorithmic depth, state tracking, branch reasoning, edge-case combinatorics, and mathematical problem-solving.
- **Challenge Score**: Composite index `(T + L) / 2` accompanied by a concrete diagnostic rationale for every exercise.

```
┌──────────────────┬────────────────────────────────────────────────────────┐
│ Level            │ Technical (T) vs Logical (L) Complexity               │
├──────────────────┼────────────────────────────────────────────────────────┤
│ T1 / L1          │ Basic assignments / Direct 1-step formulas             │
│ T2 / L2          │ Core collections & loops / Linear accumulator state    │
│ T3 / L3          │ Comprehensions & context mgrs / Multi-pass parsing     │
│ T4 / L4          │ Decorators, generators, OOP / Recursion & DP           │
│ T5 / L5          │ Metaprogramming & C-interop / Combinatorial search     │
└──────────────────┴────────────────────────────────────────────────────────┘
```

### 2. Balanced Active Recall Quizzes & Instant Contract Feedback
- **Uniform Option Equilibrium**: All 665+ quiz questions utilize deterministic FNV-1a hashing to maintain an exact **~25% A / 25% B / 25% C / 25% D** answer distribution, eliminating positional guessing bias.
- **Authentic Misconception Distractors**: Distractors target documented Python pitfalls (reference aliasing, mutable default arguments, late-binding lambdas, truthiness).
- **Faded Cognitive Scaffolding**: Interactive Code-Fill tasks with draggable token chips bridge the gap between lecture slides and blank-canvas coding, guiding learners through structured synthesis with immediate assertion-driven verification.

---

## ⚡ Quick Start & Local Running

Running Python Hub locally requires no heavy dependencies—just Python 3:

```bash
# 1. Start the local server (Default port 8765)
python serve.py 8765

# 2. Open in your browser:
# → http://127.0.0.1:8765/app/index.html
```

---

## 🎹 Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl+P` | Open Print Preview / Generate PDF Study Report |
| `Ctrl+K` | Open Search & Command Palette |
| `Ctrl+B` | Expand / Collapse Explorer Sidebar |
| `Ctrl+Shift+E` | Focus Course Explorer |
| `Ctrl+Shift+F` | Focus Filter Bar |
| `Space / ← / →` | Slide Navigation (Presentation mode) |
| `F` | Toggle Fullscreen Presentation Mode |

---

## 📄 Credits & License

Created for the **VSČHT Praha Python Course** (Original materials by **Jiří Znamenáček**). Single-page application architecture, security engine, pedagogical taxonomy, and study tracking system built for **Python Hub**.
