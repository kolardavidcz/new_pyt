/** Shared application state */
import { syncEngine } from "./sync.js";

export const TAGS = ["Core", "WOW", "Legendary", "Tricky", "Skip"];
export const FLAVORS = ["basics", "resyntax", "newconcept", "pythonic", "paradigm"];

const SEEN_KEY = "pcs-seen-v1";
const STUDIED_KEY = "pcs-studied-v1";
const CHECKLIST_KEY = "pcs-checklist-v1";
const SIDEBAR_W_KEY = "pcs-sidebar-w";
const USER_KEY = "pcs-user-v1";

export const defaultUser = {
  username: "kolard",
  name: "David Kolar",
  studentId: "987654",
  faculty: "FCHI · VSČHT Praha",
};

export function getStudiedKey() {
  const u = state.user?.username;
  return u ? syncEngine.getKey(u, "studied") : STUDIED_KEY;
}

export function getSeenKey() {
  const u = state.user?.username;
  return u ? syncEngine.getKey(u, "seen") : SEEN_KEY;
}

export function getChecklistKey() {
  const u = state.user?.username;
  return u ? syncEngine.getKey(u, "checklist") : CHECKLIST_KEY;
}

/** @type {import("./types.js").AppState} */
export const state = {
  course: null,
  slides: {},
  pagesIndex: {},
  /** path → structured exercise tasks (from data/exercises.json) */
  exercises: {},
  /** Flat list of all lecture/exercise items */
  items: [],
  /** week id → week object */
  weeksById: new Map(),
  /** item id → item */
  itemsById: new Map(),

  filters: {
    text: "",
    tags: new Set(),       // active tag chips (OR within selection; item must match ALL active if multi? → OR is more UX-friendly)
    flavors: new Set(),
    relMin: 1,
    sort: "course",
  },

  /** Which sidebar view: explorer | search | progress */
  view: "explorer",
  sidebarOpen: false,
  sidebarWidth: 280,

  /** Print code block color theme: "dark" (default VS Code dark) | "light" */
  codeBlockColor: "dark",

  /** Open editor tabs: { id, kind, title, itemId?, weekId?, pageId? } */
  tabs: [],
  activeTabId: null,

  /** Tree expand state: nodeKey → bool */
  expanded: new Map(),

  /** Auto-seen item ids (opened once) */
  seen: new Set(),

  /** Manually marked “studied” item ids (progress source of truth) */
  studied: new Set(),

  /** Checked items in the 4-level checklist */
  checklist: new Set(),

  /** Currently focused tree node key */
  focusedTreeKey: null,

  /** Quizzes dictionary loaded from data/quizzes.json */
  quizzes: {},

  /** Quiz scores: slug -> { qId -> { selected, isCorrect, timestamp } } */
  quizScores: {},

  /** Question improvements logged by user: [{ id, timestamp, deckKey, questionId, category, userNote, questionText }] */
  questionImprovements: [],

  /** Print setting: include quizzes in print export */
  printWithQuizzes: true,

  /** Scroll ratio memory per item id for full lectures */
  itemScrollRatios: {},

  user: null,
};

const QUIZ_SCORES_KEY = "pcs-quiz-scores-v1";
const QUESTION_IMPROVEMENTS_KEY = "pcs-question-improvements-v1";

export function saveQuizScore(slug, qId, scoreInfo) {
  if (!state.quizScores[slug]) state.quizScores[slug] = {};
  state.quizScores[slug][qId] = {
    ...scoreInfo,
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(state.quizScores));
  } catch { /* ignore */ }
  notifyStateChange("quizScore", { slug, qId, scoreInfo });
}

export function resetDeckQuizScores(slug) {
  if (state.quizScores[slug]) {
    delete state.quizScores[slug];
    try {
      localStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(state.quizScores));
    } catch { /* ignore */ }
    notifyStateChange("quizScoreReset", { slug });
  }
}

export async function saveQuestionImprovement(data) {
  const entry = {
    id: data.id || `imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: data.timestamp || new Date().toISOString(),
    deckKey: data.deckKey || "",
    questionId: data.questionId || "presentation-content",
    questionText: data.questionText || "",
    questionType: data.questionType || "presentation",
    category: data.category || "content_error",
    categoryLabel: data.categoryLabel || "Chyba v obsahu prezentace",
    userNote: data.userNote || "",
    status: data.status || "open",
  };

  if (!Array.isArray(state.questionImprovements)) state.questionImprovements = [];
  state.questionImprovements.unshift(entry);

  let synced = false;

  // 1. Post to /api/question-improvement (Cloud-first)
  try {
    const res = await fetch("/api/question-improvement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      synced = true;
      const data = await res.json();
      if (data && Array.isArray(data.result)) {
        state.questionImprovements = data.result;
      }
    }
  } catch { /* fallback to direct Upstash */ }

  // 2. Direct Upstash Redis Cloud DB fallback if serverless proxy unreachable
  if (!synced) {
    try {
      const kvUrl = "https://tough-husky-101028.upstash.io";
      const kvToken = "gQAAAAAAAYqkAAIgcDFiZjJmZTQ3MWE4OTg0MWJjOWUwYmY5ZjU3MGEzOTg3NA";
      
      const getRes = await fetch(`${kvUrl}/get/pyt:global:question_improvements`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      let remoteList = [];
      if (getRes.ok) {
        const gData = await getRes.json();
        if (gData && gData.result) {
          let parsed = gData.result;
          while (typeof parsed === "string") {
            try { parsed = JSON.parse(parsed); } catch { break; }
          }
          remoteList = Array.isArray(parsed) ? parsed : [];
        }
      }

      const byId = new Map();
      for (const item of remoteList) if (item && item.id) byId.set(item.id, item);
      byId.set(entry.id, entry);
      const mergedList = Array.from(byId.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      await fetch(`${kvUrl}/set/pyt:global:question_improvements`, {
        method: "POST",
        headers: { Authorization: `Bearer ${kvToken}` },
        body: JSON.stringify(JSON.stringify(mergedList)),
      });
      state.questionImprovements = mergedList;
    } catch (err) {
      console.warn("[Upstash Direct Sync Warning]", err);
    }
  }

  notifyStateChange("questionImprovement", { entry });
  return entry;
}

export async function loadQuestionImprovements() {
  const kvUrl = "https://tough-husky-101028.upstash.io";
  const kvToken = "gQAAAAAAAYqkAAIgcDFiZjJmZTQ3MWE4OTg0MWJjOWUwYmY5ZjU3MGEzOTg3NA";
  
  let remoteItems = null;

  // 1. Fetch from /api/question-improvement (Cloud-first)
  try {
    const res = await fetch("/api/question-improvement");
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.result)) {
        remoteItems = data.result;
      }
    }
  } catch { /* fallback */ }

  // 2. Direct Upstash fallback if /api/question-improvement failed
  if (!remoteItems) {
    try {
      const getRes = await fetch(`${kvUrl}/get/pyt:global:question_improvements`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      if (getRes.ok) {
        const gData = await getRes.json();
        if (gData && gData.result) {
          let parsed = gData.result;
          while (typeof parsed === "string") {
            try { parsed = JSON.parse(parsed); } catch { break; }
          }
          if (Array.isArray(parsed)) remoteItems = parsed;
        }
      }
    } catch (err) {
      console.warn("[Upstash Fetch Improvements Warning]", err);
    }
  }

  if (Array.isArray(remoteItems)) {
    state.questionImprovements = remoteItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } else if (!Array.isArray(state.questionImprovements)) {
    state.questionImprovements = [];
  }

  return state.questionImprovements;
}

export async function updateQuestionImprovement(id, updates = {}) {
  if (!Array.isArray(state.questionImprovements)) state.questionImprovements = [];
  const idx = state.questionImprovements.findIndex((item) => item.id === id);
  if (idx !== -1) {
    if (updates.status === "resolved" && !updates.resolvedAt) {
      updates.resolvedAt = new Date().toISOString();
    }
    state.questionImprovements[idx] = { ...state.questionImprovements[idx], ...updates };
  }

  // Sync to API and Upstash
  try {
    const res = await fetch("/api/question-improvement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, ...updates }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.result)) {
        state.questionImprovements = data.result;
      }
    }
  } catch {
    try {
      const kvUrl = "https://tough-husky-101028.upstash.io";
      const kvToken = "gQAAAAAAAYqkAAIgcDFiZjJmZTQ3MWE4OTg0MWJjOWUwYmY5ZjU3MGEzOTg3NA";
      await fetch(`${kvUrl}/set/pyt:global:question_improvements`, {
        method: "POST",
        headers: { Authorization: `Bearer ${kvToken}` },
        body: JSON.stringify(JSON.stringify(state.questionImprovements)),
      });
    } catch { /* ignore */ }
  }

  notifyStateChange("questionImprovementUpdated", { id, updates });
}

export async function updateQuestionImprovementStatus(id, newStatus, fixSummary = "") {
  return updateQuestionImprovement(id, { status: newStatus, fixSummary });
}

export async function deleteQuestionImprovement(id) {
  if (Array.isArray(state.questionImprovements)) {
    state.questionImprovements = state.questionImprovements.filter((item) => item.id !== id);
  }

  try {
    const res = await fetch("/api/question-improvement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.result)) {
        state.questionImprovements = data.result;
      }
    }
  } catch {
    try {
      const kvUrl = "https://tough-husky-101028.upstash.io";
      const kvToken = "gQAAAAAAAYqkAAIgcDFiZjJmZTQ3MWE4OTg0MWJjOWUwYmY5ZjU3MGEzOTg3NA";
      await fetch(`${kvUrl}/set/pyt:global:question_improvements`, {
        method: "POST",
        headers: { Authorization: `Bearer ${kvToken}` },
        body: JSON.stringify(JSON.stringify(state.questionImprovements)),
      });
    } catch { /* ignore */ }
  }

  notifyStateChange("questionImprovementDeleted", { id });
}

const ADMINS_LIST_KEY = "pcs-admins-list-v1";
const RELEVANCE_OVERRIDES_KEY = "pcs-relevance-overrides-v1";

export function getAdminsList() {
  try {
    const raw = localStorage.getItem(ADMINS_LIST_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        if (!list.includes("kolard")) list.push("kolard");
        return list;
      }
    }
  } catch { /* ignore */ }
  return ["kolard"];
}

export function isAdminUser(user = state.user) {
  if (!user || !user.username) return false;
  const clean = user.username.toLowerCase();
  if (clean === "kolard") return true;
  if (user.role === "admin" || user.isAdmin === true) return true;
  const admins = getAdminsList();
  return admins.includes(clean);
}

export function addAdminUser(username) {
  const clean = String(username || "").trim().toLowerCase();
  if (!clean) return;
  const list = getAdminsList();
  if (!list.includes(clean)) {
    list.push(clean);
    try {
      localStorage.setItem(ADMINS_LIST_KEY, JSON.stringify(list));
    } catch { /* ignore */ }
  }
  // Promote in DB if present
  const db = getUsersDb();
  if (db[clean]) {
    db[clean].role = "admin";
    saveUserToDb(db[clean]);
  }
  notifyStateChange("adminListUpdated", { list });
}

export function removeAdminUser(username) {
  const clean = String(username || "").trim().toLowerCase();
  if (!clean || clean === "kolard") return; // kolard is superadmin, cannot be removed
  let list = getAdminsList();
  list = list.filter((u) => u !== clean);
  try {
    localStorage.setItem(ADMINS_LIST_KEY, JSON.stringify(list));
  } catch { /* ignore */ }

  const db = getUsersDb();
  if (db[clean]) {
    db[clean].role = "student";
    saveUserToDb(db[clean]);
  }
  notifyStateChange("adminListUpdated", { list });
}

export async function resetUserPassword(usernameOrEmail, newPassword) {
  const clean = String(usernameOrEmail || "").trim().toLowerCase();
  if (!clean || !newPassword) throw new Error("Zadejte e-mail nebo uživatelské jméno a nové heslo.");
  const db = getUsersDb();
  let userRecord = db[clean];
  if (!userRecord) {
    const foundKey = Object.keys(db).find((k) => (db[k].email || "").toLowerCase() === clean);
    if (foundKey) userRecord = db[foundKey];
  }
  if (!userRecord) throw new Error(`Uživatel s e-mailem "${clean}" nebyl nalezen v databázi.`);

  const salt = generateSalt();
  const passwordHash = await hashPassword(newPassword, salt);
  userRecord.salt = salt;
  userRecord.passwordHash = passwordHash;
  saveUserToDb(userRecord);
  notifyStateChange("userPasswordReset", { username: userRecord.username });
  return true;
}

export function loadRelevanceOverrides() {
  let overrides = {};
  try {
    const raw = localStorage.getItem(RELEVANCE_OVERRIDES_KEY);
    if (raw) overrides = JSON.parse(raw);
  } catch { /* ignore */ }

  if (state.items && state.items.length) {
    state.items.forEach((item) => {
      const key = item.slug || item.id || item.path;
      if (item.relevanceAI === undefined) {
        item.relevanceAI = item.relevance || 5;
      }
      if (overrides[key] !== undefined && overrides[key] !== null) {
        item.relevanceTeacher = Number(overrides[key]);
      }
    });
  }
  return overrides;
}

export function saveRelevanceOverride(deckKey, newRelevance) {
  let overrides = {};
  try {
    const raw = localStorage.getItem(RELEVANCE_OVERRIDES_KEY);
    if (raw) overrides = JSON.parse(raw);
  } catch { /* ignore */ }

  const relNum = newRelevance !== null && newRelevance !== undefined && newRelevance !== ""
    ? Math.max(1, Math.min(10, Number(newRelevance)))
    : null;

  if (relNum !== null) {
    overrides[deckKey] = relNum;
  } else {
    delete overrides[deckKey];
  }

  try {
    localStorage.setItem(RELEVANCE_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch { /* ignore */ }

  // Apply to current loaded state
  if (state.items) {
    state.items.forEach((item) => {
      const key = item.slug || item.id || item.path;
      if (key === deckKey) {
        item.relevanceTeacher = relNum;
      }
    });
  }

  notifyStateChange("relevanceUpdated", { deckKey, relevanceTeacher: relNum });

  // Optional Upstash sync
  try {
    const kvUrl = "https://tough-husky-101028.upstash.io";
    const kvToken = "gQAAAAAAAYqkAAIgcDFiZjJmZTQ3MWE4OTg0MWJjOWUwYmY5ZjU3MGEzOTg3NA";
    fetch(`${kvUrl}/set/pyt:global:relevance_overrides`, {
      method: "POST",
      headers: { Authorization: `Bearer ${kvToken}` },
      body: JSON.stringify(JSON.stringify(overrides)),
    });
  } catch { /* ignore */ }
}

const ERROR_LOG_KEY = "pcs-error-link-log-v1";

export function logLinkError(errData) {
  if (!errData || (!errData.href && !errData.targetId)) return;
  const entry = {
    id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    href: errData.href || "",
    targetId: errData.targetId || "",
    source: errData.source || window.location.hash || "app",
    message: errData.message || "Item not found",
    tag: errData.tag || "bad_link",
    status: "open",
    count: 1,
  };

  const existing = state.errorLinkLog.find((e) => e.targetId === entry.targetId && e.message === entry.message);
  if (existing) {
    existing.count += 1;
    existing.timestamp = entry.timestamp;
    existing.status = "open";
  } else {
    state.errorLinkLog.unshift(entry);
  }

  if (state.errorLinkLog.length > 200) state.errorLinkLog.pop();

  try {
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(state.errorLinkLog));
  } catch { /* ignore */ }

  console.warn("[Link Error DB]", entry);
  notifyStateChange("errorLog", { entry });
}

export function markLinkErrorFixed(id) {
  const item = state.errorLinkLog.find((e) => e.id === id);
  if (item) {
    item.status = "fixed";
    try {
      localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(state.errorLinkLog));
    } catch { /* ignore */ }
    notifyStateChange("errorLog", { item });
  }
}

export function clearLinkErrorLog() {
  state.errorLinkLog = [];
  try {
    localStorage.removeItem(ERROR_LOG_KEY);
  } catch { /* ignore */ }
  notifyStateChange("errorLog");
}

export function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const u = JSON.parse(raw);
      if (u && u.username) {
        state.user = u;
        return;
      }
    }
  } catch { /* ignore */ }
  state.user = null;
}

const USERS_DB_KEY = "pcs-users-db-v1";

/** Hash password with Web Crypto API SHA-256 + Salt */
export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(password + ":" + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Generate a 16-byte random hex salt */
export function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getUsersDb() {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

export function saveUserToDb(userRecord) {
  const db = getUsersDb();
  db[userRecord.username] = userRecord;
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  } catch { /* ignore */ }
}

export async function registerUser({ email, password }) {
  const rawEmail = String(email || "").trim().toLowerCase();
  if (!rawEmail) {
    throw new Error("Zadejte platný e-mail.");
  }
  const cleanUsername = rawEmail.includes("@") ? rawEmail.split("@")[0] : rawEmail;
  const fullEmail = rawEmail.includes("@") ? rawEmail : `${cleanUsername}@vscht.cz`;

  const db = getUsersDb();
  if (db[cleanUsername]) {
    throw new Error(`Účet pro ${fullEmail} již existuje. Přihlaste se.`);
  }
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const userRecord = {
    username: cleanUsername,
    email: fullEmail,
    salt,
    passwordHash,
    faculty: "VSČHT Praha",
    studentId: String(Math.floor(100000 + Math.random() * 900000)),
  };
  saveUserToDb(userRecord);
  const sessionUser = { ...userRecord };
  delete sessionUser.passwordHash;
  delete sessionUser.salt;
  setUser(sessionUser);
  await syncCloudProgress();
  return sessionUser;
}

export async function loginWithPassword({ usernameOrEmail, password }) {
  const clean = usernameOrEmail.includes("@") ? usernameOrEmail.split("@")[0].toLowerCase() : usernameOrEmail.toLowerCase();
  const db = getUsersDb();
  let userRecord = db[clean];

  // Auto-seed dev accounts if not present
  if (!userRecord && (clean === "kolard" || clean === "student1")) {
    const salt = generateSalt();
    const passwordHash = await hashPassword(clean === "kolard" ? "kolard123" : "student123", salt);
    userRecord = {
      username: clean,
      email: `${clean}@vscht.cz`,
      salt,
      passwordHash,
      faculty: clean === "kolard" ? "FCHI · VSČHT Praha" : "FPBT · VSČHT Praha",
      studentId: clean === "kolard" ? "987654" : "123456",
    };
    saveUserToDb(userRecord);
  }

  if (!userRecord) {
    throw new Error("Uživatel nenalezen. Zkontrolujte jméno nebo se zaregistrujte.");
  }

  const computedHash = await hashPassword(password, userRecord.salt);
  if (computedHash !== userRecord.passwordHash) {
    throw new Error("Nespárované heslo. Zkontrolujte zadané heslo.");
  }

  const sessionUser = { ...userRecord };
  delete sessionUser.passwordHash;
  delete sessionUser.salt;
  setUser(sessionUser);
  await syncCloudProgress();
  return sessionUser;
}

export function setUser(userObj) {
  if (userObj && typeof userObj === "object") {
    const rawName = String(userObj.username || userObj.name || "").trim();
    if (rawName) {
      const cleanUsername = rawName.includes("@") ? rawName.split("@")[0].toLowerCase() : rawName.toLowerCase();
      userObj.username = cleanUsername;
      if (!userObj.name || userObj.name === cleanUsername) userObj.name = cleanUsername;
      if (!userObj.faculty) userObj.faculty = "VSČHT Praha";
      if (!userObj.studentId) userObj.studentId = String(Math.floor(100000 + Math.random() * 900000));
      state.user = userObj;
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      } catch { /* ignore */ }
    } else {
      state.user = null;
      try { localStorage.removeItem(USER_KEY); } catch { /* ignore */ }
    }
  } else {
    state.user = null;
    try { localStorage.removeItem(USER_KEY); } catch { /* ignore */ }
  }
  loadPersisted();
  notifyStateChange("user", { user: state.user });
}

export function logoutUser() {
  state.user = null;
  try {
    localStorage.removeItem(USER_KEY);
  } catch { /* ignore */ }
  state.studied = new Set();
  state.seen = new Set();
  state.checklist = new Set();
  notifyStateChange("user", { user: null });
}

export function loadPersisted() {
  loadUser();
  const sKey = getStudiedKey();
  const seKey = getSeenKey();
  const chKey = getChecklistKey();

  state.studied = new Set();
  state.seen = new Set();
  state.checklist = new Set();

  try {
    const raw = localStorage.getItem(seKey);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) state.seen = new Set(arr);
    }
  } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem(sKey);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) state.studied = new Set(arr);
    }
  } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem(chKey) || localStorage.getItem(CHECKLIST_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) state.checklist = new Set(arr);
    }
  } catch { /* ignore */ }
  try {
    const w = parseInt(localStorage.getItem(SIDEBAR_W_KEY) || "", 10);
    if (w >= 180 && w <= 520) state.sidebarWidth = w;
  } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem(QUIZ_SCORES_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") state.quizScores = obj;
    }
  } catch { /* ignore */ }
  try {
    const sOpen = localStorage.getItem("pcs-sidebar-open");
    if (sOpen !== null) state.sidebarOpen = JSON.parse(sOpen) === true;
    else state.sidebarOpen = false;
  } catch {
    state.sidebarOpen = false;
  }
  try {
    const cbc = localStorage.getItem("pcs-code-block-color") || localStorage.getItem("pcs-print-theme");
    if (cbc === "dark" || cbc === "light") state.codeBlockColor = cbc;
  } catch { /* ignore */ }
  try {
    const pwq = localStorage.getItem("pcs-print-quizzes");
    if (pwq !== null) state.printWithQuizzes = pwq === "true";
  } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem(ERROR_LOG_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) state.errorLinkLog = arr;
    }
  } catch { /* ignore */ }
  document.documentElement.setAttribute("data-code-block-color", state.codeBlockColor);
  document.documentElement.setAttribute("data-print-quizzes", state.printWithQuizzes ? "true" : "false");

  syncCloudProgress();
}

export function setCodeBlockColor(color) {
  const next = color === "light" ? "light" : "dark";
  state.codeBlockColor = next;
  document.documentElement.setAttribute("data-code-block-color", next);
  try {
    localStorage.setItem("pcs-code-block-color", next);
    localStorage.setItem("pcs-print-theme", next);
  } catch { /* ignore */ }
  notifyStateChange("codeBlockColor", { color: next });
}

export function setPrintWithQuizzes(enabled) {
  state.printWithQuizzes = !!enabled;
  document.documentElement.setAttribute("data-print-quizzes", state.printWithQuizzes ? "true" : "false");
  try {
    localStorage.setItem("pcs-print-quizzes", state.printWithQuizzes ? "true" : "false");
  } catch { /* ignore */ }
  notifyStateChange("printWithQuizzes", { enabled: state.printWithQuizzes });
}

let quizNormCache = null;

function getQuizNormCache() {
  if (!quizNormCache) {
    quizNormCache = new Map();
    for (const k in state.quizzes) {
      quizNormCache.set(normalizeKey(k), state.quizzes[k]);
    }
  }
  return quizNormCache;
}

export function invalidateQuizNormCache() {
  quizNormCache = null;
}

function normalizeKey(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

const GENERIC_DISTRACTORS = [
  "Žádná z uvedených možností",
  "SyntaxError (neplatná syntaxe)",
  "TypeError (nekompatibilní typy)",
  "AttributeError (objekt nemá tento atribut)",
  "None (metoda nevrací hodnotu)",
  "Všechny uvedené možnosti jsou správné"
];

/** FNV-1a 32-bit hash for uniform 25% option distribution */
function hashFnv32(str) {
  let hVal = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hVal ^= str.charCodeAt(i);
    hVal += (hVal << 1) + (hVal << 4) + (hVal << 7) + (hVal << 8) + (hVal << 24);
  }
  return hVal >>> 0;
}

/** Deterministically shuffles q.options with uniform ~25% A/B/C/D distribution ONCE forever */
export function ensureShuffledOptions(q, deckKey = "", idx = 0) {
  if (!q || q._shuffled || !Array.isArray(q.options) || q.options.length <= 1) return;

  // Do not shuffle True/False binary questions
  const cleanFirst = String(q.options[0] || "").replace(/^[A-D]\)\s*/, "").trim().toLowerCase();
  if (q.type === "true_false_tricky" || (q.options.length === 2 && (cleanFirst === "pravda" || cleanFirst === "ano" || cleanFirst === "true"))) {
    q._shuffled = true;
    return;
  }

  // Determine original correct option text
  let originalCorrectText = "";
  if (typeof q.answer === "number" && q.options[q.answer] !== undefined) {
    originalCorrectText = q.options[q.answer];
  } else if (typeof q.answer === "string" && q.answer) {
    originalCorrectText = q.answer;
  } else {
    originalCorrectText = q.options[0];
  }

  const cleanOriginalCorrect = String(originalCorrectText).replace(/^[A-D]\)\s*/, "").trim();

  // If question has 3 options, add plausible 4th distractor so Option D gets ~25% representation
  if (q.options.length === 3) {
    const dIdx = hashFnv32(`${deckKey}:${q.id || idx}:distractor`) % GENERIC_DISTRACTORS.length;
    const newOpt = GENERIC_DISTRACTORS[dIdx];
    if (!q.options.includes(newOpt) && !q.options.some(o => String(o).replace(/^[A-D]\)\s*/, "").trim() === newOpt)) {
      q.options.push(newOpt);
    }
  }

  const cleanOpts = q.options.map(opt => String(opt).replace(/^[A-D]\)\s*/, "").trim());

  // Uniform seed based on deckKey, question ID, index, and stem text
  const seedStr = `${deckKey}:${q.id || idx}:${q.question || ""}:${cleanOpts.length}`;
  const hash = hashFnv32(seedStr);
  const targetIdx = hash % cleanOpts.length;

  // Filter out correct option and shuffle distractors
  const distractors = cleanOpts.filter(opt => opt !== cleanOriginalCorrect);
  const shuffledDistract = [...distractors];
  for (let i = shuffledDistract.length - 1; i > 0; i--) {
    const swapIdx = (hash + i * 17) % (i + 1);
    const tmp = shuffledDistract[i];
    shuffledDistract[i] = shuffledDistract[swapIdx];
    shuffledDistract[swapIdx] = tmp;
  }

  // Reconstruct options array placing correct answer exactly at targetIdx (25% A, 25% B, 25% C, 25% D)
  let newOptions = [];
  let distPointer = 0;
  for (let i = 0; i < cleanOpts.length; i++) {
    if (i === targetIdx) {
      newOptions.push(cleanOriginalCorrect);
    } else {
      newOptions.push(shuffledDistract[distPointer++] || "Není k dispozici");
    }
  }

}

export async function getQuizForDeck(item) {
  return getQuizFor(item);
}

/**
 * Asynchronous & resilient quiz lookup with multi-key normalization and lazy per-week fallback.
 */
export async function getQuizFor(item) {
  if (!item) return null;
  const item_id = item.id || "";
  const slug = item.slug || "";
  const path = (item.path || "").replace(/\\/g, "/");
  const cleanPath = path.replace(/^vyuka_downloaded\/materialy\//, "").replace(/^vyuka_downloaded\//, "");
  const cleanPathNoExt = cleanPath.replace(/\.(html|xml)$/, "");
  const parts = cleanPathNoExt.split("/");
  const base = parts[parts.length - 1];
  const lastTwo = parts.length >= 2 ? `${parts[parts.length - 2]}_${parts[parts.length - 1]}` : base;
  const idClean = item_id.replace(/^lecture:/, "").replace(/^exercise:/, "");

  const candidates = [
    item_id,
    cleanPathNoExt,
    lastTwo,
    base,
    slug,
    path,
    idClean,
    "lecture:" + cleanPath,
  ];

  const checkMemory = () => {
    for (const c of candidates) {
      if (c && state.quizzes[c]) return state.quizzes[c];
    }
    const normMap = getQuizNormCache();
    for (const c of candidates) {
      if (c) {
        const norm = normalizeKey(c);
        if (normMap.has(norm)) return normMap.get(norm);
      }
    }
    return null;
  };

  let found = checkMemory();
  if (!found) {
    // 1. Try per-deck chunk
    const targetKey = item.slug || item.id || idClean || "";
    if (targetKey) {
      try {
        const res = await fetch(`data/quizzes/${targetKey}.json`);
        if (res.ok) {
          const qList = await res.json();
          if (Array.isArray(qList)) {
            state.quizzes[targetKey] = qList;
            invalidateQuizNormCache();
            found = qList;
          }
        }
      } catch { /* ignore */ }
    }

    // 2. Fallback: Lazy fetch per-week chunk if missing
    if (!found) {
      const weekNum = item.weekNum !== undefined ? item.weekNum : (item.week ? item.week : null);
      if (weekNum != null) {
        const urls = [
          `data/quizzes/w${weekNum}.json`,
          `./data/quizzes/w${weekNum}.json`,
          `../data/quizzes/w${weekNum}.json`,
          `/data/quizzes/w${weekNum}.json`
        ];
        for (const u of urls) {
          try {
            const res = await fetch(u);
            if (res.ok) {
              const chunkData = await res.json();
              if (chunkData && typeof chunkData === "object") {
                Object.assign(state.quizzes, chunkData);
                invalidateQuizNormCache();
                found = checkMemory();
                if (found) break;
              }
            }
          } catch { /* ignore */ }
        }
      }
    }
  }

  if (Array.isArray(found)) {
    const deckKey = item.slug || item.id || item.path || "";
    found.forEach((q, idx) => ensureShuffledOptions(q, deckKey, idx));
  }

  return found;
}

export function loadQuizForDeck(item) {
  return getQuizForDeck(item);
}

const listeners = new Set();

/** Subscribe to state changes. Returns unsubscribe function. */
export function onStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notifyStateChange(changeType, detail) {
  for (const fn of listeners) {
    try {
      fn(state, changeType, detail);
    } catch (err) {
      console.error("State listener error:", err);
    }
  }
}

export async function syncCloudProgress() {
  const username = state.user?.username;
  if (!username) return;

  try {
    const studiedResult = await syncEngine.syncSet(
      username,
      "studied",
      state.studied,
      getStudiedKey()
    );
    const seenResult = await syncEngine.syncSet(
      username,
      "seen",
      state.seen,
      getSeenKey()
    );
    const checklistResult = await syncEngine.syncSet(
      username,
      "checklist",
      state.checklist,
      getChecklistKey()
    );

    let changed = false;
    if (studiedResult.changed) {
      state.studied = studiedResult.set;
      changed = true;
    }
    if (seenResult.changed) {
      state.seen = seenResult.set;
      changed = true;
    }
    if (checklistResult.changed) {
      state.checklist = checklistResult.set;
      changed = true;
    }

    if (changed) {
      notifyStateChange("cloudSync");
    }
  } catch (err) {
    console.warn("Cloud sync error:", err);
  }
}

export function persistSeen() {
  const seKey = getSeenKey();
  const arr = [...state.seen];
  try {
    localStorage.setItem(seKey, JSON.stringify(arr));
  } catch { /* ignore */ }
  if (state.user?.username) {
    syncEngine.kvSet(syncEngine.getKey(state.user.username, "seen"), arr);
  }
}

export function persistStudied() {
  const sKey = getStudiedKey();
  const arr = [...state.studied];
  try {
    localStorage.setItem(sKey, JSON.stringify(arr));
  } catch { /* ignore */ }
  if (state.user?.username) {
    syncEngine.kvSet(syncEngine.getKey(state.user.username, "studied"), arr);
  }
}

export function persistChecklist() {
  const chKey = getChecklistKey();
  const arr = [...state.checklist];
  try {
    localStorage.setItem(chKey, JSON.stringify(arr));
  } catch { /* ignore */ }
  if (state.user?.username) {
    syncEngine.kvSet(syncEngine.getKey(state.user.username, "checklist"), arr);
  }
}

export function isChecklistChecked(id) {
  return !!(id && state.checklist.has(id));
}

export function toggleChecklist(id) {
  if (!id) return false;
  let now = false;
  if (state.checklist.has(id)) {
    state.checklist.delete(id);
    now = false;
  } else {
    state.checklist.add(id);
    now = true;
  }
  persistChecklist();
  notifyStateChange("checklist", { id, now });
  return now;
}

export function resetChecklistState() {
  state.checklist.clear();
  try {
    localStorage.removeItem(CHECKLIST_KEY);
  } catch { /* ignore */ }
  notifyStateChange("checklist");
}

export function calculateChecklistProgress(items = []) {
  const total = items.length;
  let checkedCount = 0;
  const byLevel = {
    1: { total: 0, checked: 0, pct: 0 },
    2: { total: 0, checked: 0, pct: 0 },
    3: { total: 0, checked: 0, pct: 0 },
    4: { total: 0, checked: 0, pct: 0 },
  };

  for (const item of items) {
    const isChecked = state.checklist.has(item.id);
    if (isChecked) checkedCount++;
    if (byLevel[item.level]) {
      byLevel[item.level].total++;
      if (isChecked) byLevel[item.level].checked++;
    }
  }

  for (const lvl in byLevel) {
    const l = byLevel[lvl];
    l.pct = l.total > 0 ? Math.round((l.checked / l.total) * 100) : 0;
  }

  const pctTotal = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  return {
    total,
    checked: checkedCount,
    pct: pctTotal,
    byLevel,
  };
}

export function persistSidebarW() {
  try {
    localStorage.setItem(SIDEBAR_W_KEY, String(state.sidebarWidth));
  } catch { /* ignore */ }
}

export function markSeen(itemId) {
  if (!itemId || state.seen.has(itemId)) return;
  state.seen.add(itemId);
  persistSeen();
  notifyStateChange("seen", { itemId });
}

export function isStudied(itemId) {
  return !!(itemId && state.studied.has(itemId));
}

/** Toggle manual “studied” flag. Returns new studied state. */
export function toggleStudied(itemId) {
  if (!itemId) return false;
  let now = false;
  if (state.studied.has(itemId)) {
    state.studied.delete(itemId);
    now = false;
  } else {
    state.studied.add(itemId);
    markSeen(itemId);
    now = true;
  }
  persistStudied();
  notifyStateChange("studied", { itemId, now });
  return now;
}

export function setStudied(itemId, on) {
  if (!itemId) return;
  if (on) {
    state.studied.add(itemId);
    markSeen(itemId);
  } else {
    state.studied.delete(itemId);
  }
  persistStudied();
  notifyStateChange("studied", { itemId, now: on });
}

export function buildIndexes(course) {
  state.course = course;
  state.items = [];
  state.weeksById.clear();
  state.itemsById.clear();

  for (const week of course.weeks || []) {
    state.weeksById.set(week.id, week);
    // default expand first few weeks
    if (!state.expanded.has(week.id)) {
      state.expanded.set(week.id, week.week <= 2);
    }
    for (const lec of week.lectures || []) {
      const item = { ...lec, weekId: week.id, weekTitle: week.title, weekNum: week.week };
      state.items.push(item);
      state.itemsById.set(item.id, item);
      const cleanPath = item.path ? item.path.replace(/\\/g, "/") : "";
      if (cleanPath) {
        state.itemsById.set("lecture:" + cleanPath.replace(/^vyuka_downloaded\//, ""), item);
        state.itemsById.set("lecture:" + cleanPath.replace(/^vyuka_downloaded\/materialy\//, ""), item);
      }
      if (item.slug) {
        state.itemsById.set("lecture:" + item.slug, item);
      }
    }
    for (const ex of week.exercises || []) {
      const item = { ...ex, weekId: week.id, weekTitle: week.title, weekNum: week.week };
      state.items.push(item);
      state.itemsById.set(item.id, item);
      const cleanPath = item.path ? item.path.replace(/\\/g, "/") : "";
      if (cleanPath) {
        state.itemsById.set("exercise:" + cleanPath.replace(/^vyuka_downloaded\//, ""), item);
        state.itemsById.set("exercise:" + cleanPath.replace(/^vyuka_downloaded\/materialy\//, ""), item);
      }
      if (item.slug) {
        state.itemsById.set("exercise:" + item.slug, item);
      }
    }
  }
}

export function itemMatchesFilters(item, f = state.filters) {
  if ((item.relevance ?? 0) < f.relMin) return false;

  if (f.tags.size > 0) {
    const tags = item.tags || [];
    let hit = false;
    for (const t of f.tags) {
      if (tags.includes(t)) { hit = true; break; }
    }
    if (!hit) return false;
  }

  if (f.flavors.size > 0) {
    if (!f.flavors.has(item.diff)) return false;
  }

  if (f.text) {
    const q = f.text.toLowerCase().trim();
    if (q) {
      const hay = [
        item.title,
        item.desc,
        item.compare,
        item.slug,
        item.path,
        ...(item.tags || []),
        item.diff,
        item.weekTitle,
      ].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
  }
  return true;
}

export function filteredItems() {
  let list = state.items.filter((it) => itemMatchesFilters(it));
  const sort = state.filters.sort;
  if (sort === "relevance-desc") {
    list = [...list].sort((a, b) => (b.relevance - a.relevance) || a.title.localeCompare(b.title, "cs"));
  } else if (sort === "relevance-asc") {
    list = [...list].sort((a, b) => (a.relevance - b.relevance) || a.title.localeCompare(b.title, "cs"));
  } else if (sort === "title") {
    list = [...list].sort((a, b) => a.title.localeCompare(b.title, "cs"));
  }
  // course order: keep original
  return list;
}

export function weekVisibleItems(week) {
  const all = [...(week.lectures || []), ...(week.exercises || [])];
  const f = state.filters;
  let list = all
    .map((it) => state.itemsById.get(it.id) || it)
    .filter((it) => itemMatchesFilters(it, f));

  if (f.sort === "relevance-desc") {
    list.sort((a, b) => (b.relevance - a.relevance) || a.title.localeCompare(b.title, "cs"));
  } else if (f.sort === "relevance-asc") {
    list.sort((a, b) => (a.relevance - b.relevance) || a.title.localeCompare(b.title, "cs"));
  } else if (f.sort === "title") {
    list.sort((a, b) => a.title.localeCompare(b.title, "cs"));
  }
  return list;
}

export function filtersActive() {
  const f = state.filters;
  return (
    f.text.trim() !== "" ||
    f.tags.size > 0 ||
    f.flavors.size > 0 ||
    f.relMin > 1 ||
    f.sort !== "course"
  );
}

export function clearFilters() {
  state.filters.text = "";
  state.filters.tags.clear();
  state.filters.flavors.clear();
  state.filters.relMin = 1;
  state.filters.sort = "course";
}

export function pagesFor(path) {
  const pages = state.pagesIndex[path];
  if (pages && pages.length) return pages;
  // Exercises: surface úkols as page-level nodes
  const ex = state.exercises[path];
  if (ex?.tasks?.length) {
    return ex.tasks.map((t) => ({
      id: t.id,
      title: t.title || t.summary || t.id,
    }));
  }
  return [];
}

export function slideDiff(slug, pageId) {
  const key = `${slug}#${pageId}`;
  const entry = state.slides[key];
  if (!entry) return null;
  return typeof entry === "string" ? entry : entry.diff || null;
}

export function slideTags(slug, pageId) {
  const key = `${slug}#${pageId}`;
  const entry = state.slides[key];
  if (!entry || typeof entry === "string") return [];
  return entry.tags || [];
}

