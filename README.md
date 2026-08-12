# 🐍 Python Hub — VSČHT Praha Python Course & Study Dashboard

> **High-density, web-based learning environment tailored for developers and students transitioning from C/C++ and Java to Python.**
>
> 🌐 **Production Deployment**: [https://newpyt.vercel.app](https://newpyt.vercel.app)  
> 📁 **GitHub Repository**: [https://github.com/kolardavidcz/new_pyt](https://github.com/kolardavidcz/new_pyt)

---

## 📸 Overview & Features

### 🖥️ 1. VS Code Terminal & Explorer Workspace
- **Modern Terminal Aesthetics**: Built using dark mode glassmorphic VS Code interface design.
- **Explorer Sidebar**: Tree navigation across 12+ course weeks, lectures, and exercises.
- **Multi-Dimensional Filters**: Filter course topics by tag badges (`[Core]`, `[Tricky]`, `[Pythonic]`), 10-segment relevance heat slider, and difficulty ratings.

### 🔑 2. Email Authentication & Cloud Progress Sync
- **Simple Email Login**: Log in or register using your student email (`@vscht.cz`).
- **Salted SHA-256 Hashing**: Secure local password authentication powered by the browser Web Crypto API.
- **Instant Cross-Device Sync**: Progress automatically synchronizes to cloud storage (Upstash Redis KV), keeping your study tracking updated across laptop, tablet, and mobile.

### 🧩 3. Interactive Quizzes & Exercise Dojo
- **Balanced Multiple-Choice Quizzes**: Uniform, unbiased option distribution (~25% A, 25% B, 25% C, 25% D) for all test questions.
- **Code Fill & Output Prediction**: Interactive code completion with draggable nápověda pills and instant evaluation.
- **Dual Exercise Ratings**: Exercises feature **T** (Technical) and **L** (Logical) difficulty ratings to guide your learning path.

### 🖨️ 4. PDF Export & Print Engine (`Ctrl+P`)
- **A4 Printable Study Reports**: Press `Ctrl+P` to generate clean 2-column printable study sheets or PDF exports.
- **WCAG 2.1 AAA Compliant**: High contrast typography guarantees readability on both screen and paper.

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

Created for the **VSČHT Praha Python Course** (Original materials by **Jiří Znamenáček**). Single-page application architecture, security engine, and study tracking system built for **Python Hub**.
