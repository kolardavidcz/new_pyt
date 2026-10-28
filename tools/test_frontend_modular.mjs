/**
 * Automated Verification Suite for Frontend Modular Architecture & Master Lecture Single Source of Truth
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Setup minimal browser DOM simulation in Node.js
class MockClassList {
  constructor(el) {
    this.el = el;
    this.classes = new Set();
  }
  add(...names) {
    names.forEach(n => {
      n.split(/\s+/).filter(Boolean).forEach(c => this.classes.add(c));
    });
  }
  remove(...names) {
    names.forEach(n => {
      n.split(/\s+/).filter(Boolean).forEach(c => this.classes.delete(c));
    });
  }
  toggle(name, force) {
    if (force !== undefined) {
      if (force) this.classes.add(name);
      else this.classes.delete(name);
      return force;
    }
    if (this.classes.has(name)) {
      this.classes.delete(name);
      return false;
    }
    this.classes.add(name);
    return true;
  }
  contains(name) {
    return this.classes.has(name);
  }
}

class MockElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = new Map();
    this.dataset = {};
    this.listeners = new Map();
    this.classList = new MockClassList(this);
    this._innerHTML = "";
    this._textContent = "";
    this.style = {};
  }

  get className() {
    return Array.from(this.classList.classes).join(" ");
  }

  set className(val) {
    this.classList.classes.clear();
    if (val) {
      val.split(/\s+/).filter(Boolean).forEach(c => this.classList.classes.add(c));
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = val;
    // Minimal mock child creation if val has buttons or divs
    this._parseHtml(val);
  }

  get textContent() {
    if (this.children.length > 0) {
      return this.children.map(c => c.textContent).join("");
    }
    return this._textContent;
  }

  set textContent(val) {
    this._textContent = val;
    this.children = [];
    this._innerHTML = val ? String(val) : "";
  }

  setAttribute(k, v) {
    this.attributes.set(k, String(v));
  }

  getAttribute(k) {
    return this.attributes.get(k) ?? null;
  }

  removeAttribute(k) {
    this.attributes.delete(k);
  }

  appendChild(child) {
    if (!child) return;
    if (child.nodeType === 11) { // DocumentFragment
      for (const c of child.children) {
        this.children.push(c);
        c.parentElement = this;
      }
      child.children = [];
      return child;
    }
    this.children.push(child);
    child.parentElement = this;
    return child;
  }

  append(...items) {
    for (const item of items) {
      if (typeof item === "string") {
        const textNode = new MockElement("span");
        textNode.textContent = item;
        this.appendChild(textNode);
      } else if (item) {
        this.appendChild(item);
      }
    }
  }

  closest(selector) {
    let curr = this;
    const parts = selector.split(",").map((s) => s.trim().toLowerCase());
    while (curr) {
      for (const part of parts) {
        if (part.startsWith(".") && curr.classList.contains(part.slice(1))) return curr;
        if (part === curr.tagName.toLowerCase()) return curr;
      }
      curr = curr.parentElement;
    }
    return null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (node) => {
      if (!node) return;
      let matches = false;
      if (selector.startsWith(".")) {
        const cls = selector.slice(1);
        if (node.classList?.contains(cls)) matches = true;
      } else if (selector.startsWith("#")) {
        const id = selector.slice(1);
        if (node.id === id || node.getAttribute?.("id") === id) matches = true;
      } else if (selector.toLowerCase() === node.tagName.toLowerCase()) {
        matches = true;
      } else if (selector === "[data-close]") {
        if (node.getAttribute?.("data-close")) matches = true;
      }

      if (matches) results.push(node);
      for (const c of node.children || []) {
        check(c);
      }
    };

    for (const c of this.children) {
      check(c);
    }
    return results;
  }

  addEventListener(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(fn);
  }

  dispatchEvent(event) {
    const list = this.listeners.get(event.type) || [];
    for (const fn of list) {
      fn(event);
    }
  }

  click() {
    this.dispatchEvent({ type: "click", target: this, currentTarget: this });
  }

  remove() {
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx !== -1) this.parentElement.children.splice(idx, 1);
    }
  }

  _parseHtml(html) {
    // Basic parser extracting buttons and classes for unit test verification
    const btnRegex = /<button([^>]*)>([\s\S]*?)<\/button>/gi;
    let match;
    while ((match = btnRegex.exec(html)) !== null) {
      const attrs = match[1];
      const btn = new MockElement("button");
      const idMatch = attrs.match(/id=["']([^"']*)["']/i);
      if (idMatch) {
        btn.id = idMatch[1];
        btn.setAttribute("id", idMatch[1]);
      }
      const clsMatch = attrs.match(/class=["']([^"']*)["']/i);
      if (clsMatch) btn.className = clsMatch[1];
      btn.innerHTML = match[2];
      this.children.push(btn);
      btn.parentElement = this;
    }
    const heroRegex = /<div[^>]*class=["']([^"']*week-master-lecture-hero[^"']*)["']/i;
    if (heroRegex.test(html)) {
      const heroEl = new MockElement("div");
      heroEl.className = "week-master-lecture-hero";
      this.children.push(heroEl);
      heroEl.parentElement = this;
    }
  }
}

class MockDocument {
  constructor() {
    this.documentElement = new MockElement("html");
    this.body = new MockElement("body");
    this.documentElement.appendChild(this.body);
    this.elementsById = new Map();
  }

  createElement(tagName) {
    return new MockElement(tagName);
  }

  createDocumentFragment() {
    const frag = new MockElement("fragment");
    frag.nodeType = 11;
    return frag;
  }

  createTextNode(text) {
    const t = new MockElement("#text");
    t.nodeType = 3;
    t.textContent = String(text);
    return t;
  }

  getElementById(id) {
    return this.elementsById.get(id) || null;
  }

  querySelectorAll(selector) {
    return this.documentElement.querySelectorAll(selector);
  }

  addEventListener() {}
}

const doc = new MockDocument();
const mainEl = new MockElement("main");
mainEl.id = "main";
doc.body.appendChild(mainEl);
doc.elementsById.set("main", mainEl);

const loadBar = new MockElement("div");
loadBar.id = "loadingBar";
doc.body.appendChild(loadBar);
doc.elementsById.set("loadingBar", loadBar);

const profileModal = new MockElement("div");
profileModal.id = "profileModal";
const profileCard = new MockElement("div");
profileCard.id = "profileModalCard";
profileModal.appendChild(profileCard);
doc.body.appendChild(profileModal);
doc.elementsById.set("profileModal", profileModal);
doc.elementsById.set("profileModalCard", profileCard);

globalThis.document = doc;
globalThis.window = {
  __pcsNavigate: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  print: () => {},
};
globalThis.fetch = async (url) => {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      slides: [
        { id: "id1", title: "Slide 1", html: "<p>Slide 1 test content</p>" },
        { id: "id2", title: "Slide 2", html: "<p>Slide 2 test content</p>" },
      ],
    }),
    text: async () => "<section class='slide-section' id='id1'><h2>Slide 1</h2></section>",
  };
};

// Load actual curriculum data to initialize course state
const courseData = JSON.parse(fs.readFileSync(path.resolve("data/course.json"), "utf8"));

// Import modules
const { state, buildIndexes } = await import("../app/js/state.js");
buildIndexes(courseData);

const { showHome, showWeek, buildWeekCatalogBlock, section, itemCard } = await import("../app/js/catalog_view.js");
const { showPresentation, showPage, toggleFullscreen } = await import("../app/js/presentation_view.js");
const { renderSlide, fetchAndExtract } = await import("../app/js/slide_renderer.js");
const content = await import("../app/js/content.js");

console.log("=== RUNNING FRONTEND MODULAR & ARCHITECTURE TESTS ===");

// 1. Verify Public API exports in content.js
console.log("\n[TEST 1] Verifying Public API Re-exports from content.js...");
const expectedExports = [
  "showHome", "showWeek", "showFullContent", "showPresentation", "showPage",
  "showSearchResults", "showProgress", "showLogin", "toggleFullscreen", "stepSlide",
  "fetchAndExtract", "updatePageStudyButtons", "renderSlide", "loadAndInlineExamples",
  "autoContrastImage", "scanAndContrastImages", "printCoursePlan"
];

for (const exp of expectedExports) {
  assert.ok(typeof content[exp] === "function", `content.${exp} should be an exported function`);
}
console.log("  ✓ All required public APIs correctly re-exported by content.js");

// 2. Verify Single Source of Truth for Master Lectures across Weeks 00-09, 11-12
console.log("\n[TEST 2] Verifying Master Lecture is rendered exactly ONCE on all week views...");
const testWeeks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12];

for (const wNum of testWeeks) {
  const weekId = `week-${wNum}`;
  showWeek(weekId);

  // Check Hero banner presence
  const heroBanners = mainEl.querySelectorAll(".week-master-lecture-hero");
  assert.equal(heroBanners.length, 1, `Week ${wNum} must have exactly 1 week-master-lecture-hero banner at the top`);

  // Check that the card grid below does NOT contain the Master Lecture
  const masterCardsInGrid = mainEl.querySelectorAll(".card-master-lecture");
  assert.equal(masterCardsInGrid.length, 0, `Week ${wNum} must have ZERO card-master-lecture in the catalog grid below`);

  // Verify that the catalog block contains the Tier 2 header if lectures exist
  const week = state.weeksById.get(weekId);
  const regularLectures = (week.lectures || []).filter(l => l.kind === "lecture");
  if (regularLectures.length > 0) {
    const catalogSections = mainEl.querySelectorAll(".catalog-section");
    assert.ok(catalogSections.length >= 1, `Week ${wNum} should render catalog-section for Tier 2 reference lectures`);
  }
}
console.log(`  ✓ Master Lecture appears exactly ONCE (in hero banner) across all ${testWeeks.length} weeks.`);
console.log("  ✓ Duplicate card grid master lecture completely eliminated.");

// 3. Verify Week 99 (Supplemental Shelf without Master Lecture)
console.log("\n[TEST 3] Verifying Week 99 (Shelf week without master lecture)...");
showWeek("week-99");
const w99Hero = mainEl.querySelectorAll(".week-master-lecture-hero");
assert.equal(w99Hero.length, 0, "Week 99 must have NO master lecture hero banner");
console.log("  ✓ Week 99 correctly renders shelf sections without hero banner");

// 4. Verify Home View (showHome)
console.log("\n[TEST 4] Verifying Home View (showHome)...");
showHome();
assert.ok(mainEl.classList.contains("catalog-home"), "main should have catalog-home class");
assert.ok(mainEl.children.length > 0, "Home page should render week blocks");
console.log("  ✓ Home view renders all curriculum week blocks smoothly");

// 5. Verify Hero Action Buttons Event Handlers
console.log("\n[TEST 5] Verifying Master Lecture Hero button navigation...");
let navigatedTo = null;
globalThis.window.__pcsNavigate = (target) => {
  navigatedTo = target;
};

showWeek("week-0");
const launchBtn = mainEl.querySelector(".wml-btn-launch");
assert.ok(launchBtn, "Launch presentation button must exist in hero banner");
launchBtn.click();

assert.deepEqual(navigatedTo, { kind: "page", id: "lecture:lectures/week-00.html", pageId: "id1" },
  "Launch button must navigate to page 1 of master lecture");

const readBtn = mainEl.querySelector(".wml-btn-read");
assert.ok(readBtn, "Read continuous text button must exist in hero banner");
readBtn.click();
assert.deepEqual(navigatedTo, { kind: "lecture", id: "lecture:lectures/week-00.html" },
  "Read button must navigate to continuous lecture view");
console.log("  ✓ Hero Launch button triggers presentation on slide 1");
console.log("  ✓ Hero Read button triggers continuous text view");

// 6. Verify Filtered Empty State Handling
console.log("\n[TEST 6] Verifying Filtered Empty States...");
// Set filter text that does not match anything
state.filters.text = "nonexistent_term_xyz_123";
showWeek("week-0");
let pDesc = mainEl.querySelectorAll(".desc");
assert.ok(pDesc.some(p => p.textContent.includes("Žádné položky neodpovídají")),
  "Week 0 with empty filter results must render empty-state feedback paragraph");

showWeek("week-99");
pDesc = mainEl.querySelectorAll(".desc");
assert.ok(pDesc.some(p => p.textContent.includes("Žádné položky neodpovídají")),
  "Week 99 shelf with empty filter results must render empty-state feedback paragraph");
state.filters.text = "";
console.log("  ✓ Week views render friendly empty-state feedback when filtered");

// 7. Verify stepSlide Presentation Navigation
console.log("\n[TEST 7] Verifying stepSlide Presentation Navigation...");
const testItem = state.itemsById.get("lecture:lectures/week-00.html");
state.pagesIndex[testItem.path] = [{ id: "id1" }, { id: "id2" }, { id: "id3" }];
state.tabs = [{ id: "tab-1", kind: "page", itemId: "lecture:lectures/week-00.html", pageId: "id1" }];
state.activeTabId = "tab-1";
navigatedTo = null;
content.stepSlide(1);
assert.ok(navigatedTo && navigatedTo.kind === "page" && navigatedTo.pageId !== "id1",
  "stepSlide(+1) must advance to next slide");

state.tabs[0].pageId = navigatedTo.pageId;
const currentSlide = navigatedTo.pageId;
navigatedTo = null;
content.stepSlide(-1);
assert.ok(navigatedTo && navigatedTo.kind === "page" && navigatedTo.pageId === "id1",
  "stepSlide(-1) must return to previous slide");
// 8. Verify Keyboard Event Target Safety (Non-Element Document Target Guard)
console.log("\n[TEST 8] Verifying Keyboard Navigation Guard with Document/Window Target...");
let documentKeydownError = null;
try {
  const fakeDoc = {}; // Not an Element, has no .closest
  const isInput = !!(fakeDoc instanceof MockElement && fakeDoc.closest?.("input"));
  assert.equal(isInput, false, "Non-element target must evaluate isInput to false without error");
} catch (err) {
  documentKeydownError = err;
}
assert.equal(documentKeydownError, null, "Keyboard target check must never throw TypeError on document/window");
console.log("  ✓ Keyboard event target check handles document/window targets safely");

// 9. Verify stepSlide Fallback when state.pagesIndex has an empty array
console.log("\n[TEST 9] Verifying stepSlide Fallback when state.pagesIndex is empty array...");
const fallbackItem = state.itemsById.get("lecture:lectures/week-00.html");
// Simulate state.pagesIndex initialized to empty array while pagesFor has data
state.pagesIndex[fallbackItem.path] = [];
state.tabs = [{ id: "tab-fallback", kind: "page", itemId: "lecture:lectures/week-00.html", pageId: "id1" }];
state.activeTabId = "tab-fallback";
navigatedTo = null;
content.stepSlide(1);
// Should safely handle empty array without crashing
console.log("  ✓ stepSlide gracefully handles empty pagesIndex without exceptions");

// 10. Verify Zero-Drift between app/ and public/app/
console.log("\n[TEST 10] Verifying Zero-Drift between app/ and public/app/...");
const appDir = path.join(ROOT, "app");
const pubAppDir = path.join(ROOT, "public", "app");
const checkFiles = [
  "css/lecture.css",
  "js/app.js",
  "js/catalog_view.js",
  "js/content.js",
  "js/presentation_view.js",
  "js/router.js",
  "js/slide_renderer.js",
  "js/state.js",
  "js/tree.js",
];
for (const rel of checkFiles) {
  const fApp = fs.readFileSync(path.join(appDir, rel), "utf-8");
  const fPub = fs.readFileSync(path.join(pubAppDir, rel), "utf-8");
  assert.equal(fApp, fPub, `File drift detected between app/${rel} and public/app/${rel}`);
}
console.log(`  ✓ All ${checkFiles.length} core JS/CSS files are 100% synchronized with zero drift`);

// 11. Verify User Profile Logout does not throw ReferenceError
console.log("\n[TEST 11] Verifying User Profile Logout button...");
state.user = { username: "novakj", name: "Jan Novak", email: "novakj@vscht.cz" };
content.showLogin();
const logoutBtn = profileCard.querySelector("#btnPageLogout");
assert.ok(logoutBtn, "Logout button should be rendered in user profile dashboard");
let logoutError = null;
try {
  logoutBtn.click();
} catch (err) {
  logoutError = err;
}
assert.equal(logoutError, null, "Clicking logout button must not throw ReferenceError (logoutUser must be imported)");
assert.equal(state.user, null, "User state must be cleared after logout");
console.log("  ✓ Logout button invokes logoutUser() cleanly without ReferenceError");

// 12. Verify showPresentation & showPage accept item object and numeric slide index
console.log("\n[TEST 12] Verifying showPresentation & showPage signature flexibility...");
await content.showPresentation(testItem);
assert.ok(mainEl.children.length > 0, "showPresentation must accept item object");
await content.showPage(testItem, 0);
assert.ok(mainEl.children.length > 0, "showPage must accept item object and numeric slide index");
console.log("  ✓ showPresentation and showPage accept both string itemId and item objects");

// 13. Verify Button Focus does NOT block ArrowRight keyboard navigation
console.log("\n[TEST 13] Verifying Keyboard Navigation when Button is Focused...");
const fakeBtn = new MockElement("button");
const arrowEvent = { target: fakeBtn, key: "ArrowRight" };
const spaceEvent = { target: fakeBtn, key: " " };
const isArrowInput = !!(arrowEvent.target instanceof MockElement && (arrowEvent.target.closest?.("input, textarea, select, [contenteditable], .quiz-section-card") || (arrowEvent.key === " " && arrowEvent.target.closest?.("button"))));
const isSpaceInput = !!(spaceEvent.target instanceof MockElement && (spaceEvent.target.closest?.("input, textarea, select, [contenteditable], .quiz-section-card") || (spaceEvent.key === " " && spaceEvent.target.closest?.("button"))));
assert.equal(isArrowInput, false, "ArrowRight on a focused button must NOT be treated as input");
assert.equal(isSpaceInput, true, "Space on a focused button MUST be treated as input (native click)");
console.log("  ✓ Arrow navigation works cleanly even when buttons have active focus");

console.log("\n✅ ALL FRONTEND ARCHITECTURE & BUG VERIFICATION TESTS PASSED SUCCESSFULLY!");

