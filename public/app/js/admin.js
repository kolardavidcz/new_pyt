/**
 * Admin Panel Master Module
 * Scalable multi-admin dashboard formatted in VS Code "2 · Terminal" theme style.
 */

import {
  state,
  isAdminUser,
  getAdminsList,
  addAdminUser,
  removeAdminUser,
  getUsersDb,
  resetUserPassword,
  loadQuestionImprovements,
  updateQuestionImprovementStatus,
  deleteQuestionImprovement,
  saveRelevanceOverride,
  clearLinkErrorLog,
  registerUser,
} from "./state.js";
import { el, escapeHtml, starsHtml } from "./ui.js";

let adminModalEl = null;

export function initAdminPanel() {
  updateAdminUIElements();
}

export function updateAdminUIElements() {
  const admin = isAdminUser(state.user);

  // 1. Activity Bar Admin button
  let actBtn = document.querySelector('.activity-btn[data-view="admin"]');
  if (actBtn) {
    actBtn.style.display = admin ? "grid" : "none";
  }

  // 2. Titlebar Admin badge button
  let tbAdminBtn = document.getElementById("btnTitlebarAdmin");
  if (tbAdminBtn) {
    tbAdminBtn.style.display = admin ? "inline-flex" : "none";
  }

  // 3. Profile Modal Admin shortcut button
  let profAdminBtn = document.getElementById("btnProfileAdmin");
  if (profAdminBtn) {
    profAdminBtn.style.display = admin ? "inline-flex" : "none";
  }
}

export async function openAdminModal() {
  if (!isAdminUser(state.user)) {
    alert("Přístup odepřen. Administrátorský panel je dostupný pouze pro autorizované správce.");
    return;
  }

  if (!adminModalEl) {
    adminModalEl = el("div", { className: "modal-overlay hidden", id: "adminModal" });
    document.body.appendChild(adminModalEl);
  }

  // Load fresh improvements
  await loadQuestionImprovements();

  renderAdminModalContent("improvements");
  adminModalEl.classList.remove("hidden");
}

export function closeAdminModal() {
  if (adminModalEl) {
    adminModalEl.classList.add("hidden");
  }
}

function renderAdminModalContent(activeTab = "improvements") {
  if (!adminModalEl) return;

  const improvements = state.questionImprovements || [];
  const openCount = improvements.filter((i) => (i.status || "open") === "open").length;

  adminModalEl.innerHTML = `
    <div class="modal-card admin-modal-card" style="font-family:var(--font-mono, monospace);">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div class="v2-comment" style="margin:0 0 2px;">// admin/control-center.ts</div>
          <h3 style="font-family:var(--font-mono, monospace); font-size:15px; margin:0; display:flex; align-items:center; gap:8px; color:var(--fg);">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            [ADMIN PANEL] — newpyt course control
          </h3>
        </div>
        <button type="button" class="btn-close-modal" id="btnCloseAdminModal" aria-label="Zavřít">✕</button>
      </div>

      <div class="admin-nav-tabs">
        <button type="button" class="admin-tab-btn ${activeTab === "improvements" ? "active" : ""}" data-tab="improvements">
          [1] vylepšení ${openCount > 0 ? `<span class="admin-badge-count">${openCount}</span>` : ""}
        </button>
        <button type="button" class="admin-tab-btn ${activeTab === "users" ? "active" : ""}" data-tab="users">
          [2] uživatelé
        </button>
        <button type="button" class="admin-tab-btn ${activeTab === "relevance" ? "active" : ""}" data-tab="relevance">
          [3] relevance
        </button>
        <button type="button" class="admin-tab-btn ${activeTab === "diagnostics" ? "active" : ""}" data-tab="diagnostics">
          [4] diagnostika
        </button>
      </div>

      <div class="modal-body" style="padding:16px 20px;">
        <!-- TAB 1: QUESTION IMPROVEMENTS OVERVIEW -->
        <div class="admin-tab-content ${activeTab === "improvements" ? "active" : ""}" id="tab-improvements">
          <div class="admin-toolbar" style="display:flex; gap:10px; margin-bottom:12px;">
            <input type="text" class="admin-search-input" id="admSearchImp" placeholder="$ search --query (otázka, ID)..." style="flex:1; font-family:var(--font-mono);" />
            <select class="admin-search-input" id="admFilterStatus" style="min-width:140px; font-family:var(--font-mono);">
              <option value="all">všechny stavy</option>
              <option value="open" selected>pouze otevřené (${openCount})</option>
              <option value="resolved">vyřešené</option>
              <option value="dismissed">zamítnuté</option>
            </select>
          </div>
          <div class="admin-card-list" id="admImpList"></div>
        </div>

        <!-- TAB 2: USER & ADMIN MANAGEMENT -->
        <div class="admin-tab-content ${activeTab === "users" ? "active" : ""}" id="tab-users">
          <div class="v2-comment">// admin/users-manager.ts</div>
          <div style="background:var(--editor, #1e1e1e); border:1px solid var(--border-subtle, #333); border-radius:2px; padding:12px 14px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:14px;">
            <input type="text" id="admNewAdminUsername" class="admin-search-input" placeholder="e-mail (@vscht.cz)" style="flex:1; font-family:var(--font-mono);" />
            <input type="password" id="admNewAdminPass" class="admin-search-input" placeholder="heslo" style="flex:1; font-family:var(--font-mono);" />
            <button type="button" class="btn primary sm v2-submit" id="btnAdmCreateAdmin" style="width:auto;"><span class="prompt">$</span>grant-admin</button>
            <div id="admUserCreateMsg" style="font-size:11.5px; color:#89d185; width:100%; font-family:var(--font-mono);"></div>
          </div>

          <div class="admin-toolbar" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; color:var(--text-muted); font-family:var(--font-mono);">/* uživatelé a oprávnění */</span>
            <input type="text" class="admin-search-input" id="admSearchUsers" placeholder="$ filter --user..." style="min-width:200px; font-family:var(--font-mono);" />
          </div>
          <div class="admin-card-list" id="admUsersList" style="margin-top:10px;"></div>
        </div>

        <!-- TAB 3: PRESENTATION RELEVANCE MANAGER -->
        <div class="admin-tab-content ${activeTab === "relevance" ? "active" : ""}" id="tab-relevance">
          <div class="admin-toolbar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-size:12px; color:var(--text-muted); font-family:var(--font-mono);">/* relevance 1–10 (AI / Teacher T / Student S) */</span>
            <input type="text" class="admin-search-input" id="admSearchRel" placeholder="$ search --deck..." style="min-width:220px; font-family:var(--font-mono);" />
          </div>
          <div class="admin-card-list" id="admRelList"></div>
        </div>

        <!-- TAB 4: DIAGNOSTICS & SYSTEM -->
        <div class="admin-tab-content ${activeTab === "diagnostics" ? "active" : ""}" id="tab-diagnostics">
          <div class="v2-comment">// system/diagnostics.log</div>
          <div class="v2-status-line" style="display:flex; justify-content:space-around; margin:8px 0 16px; font-family:var(--font-mono);">
            <div>témat: <span class="num">${state.items ? state.items.length : 0}</span></div>
            <div>připomínek: <span class="num">${improvements.length}</span></div>
            <div>chyb v odkazech: <span class="num">${state.errorLinkLog ? state.errorLinkLog.length : 0}</span></div>
          </div>

          <div style="background:var(--editor, #1e1e1e); border:1px solid var(--border-subtle, #333); border-radius:2px; padding:14px; display:flex; flex-direction:column; gap:10px;">
            <div class="v2-comment">/* mezipaměť a cloud sync */</div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button type="button" class="btn secondary sm" id="btnAdmForceSync" style="font-family:var(--font-mono);"><span class="prompt">$</span>sync --force</button>
              <button type="button" class="btn secondary sm" id="btnAdmClearErrors" style="font-family:var(--font-mono);"><span class="prompt">$</span>clear-logs</button>
            </div>
            <div id="admDiagMsg" style="font-size:11.5px; color:#89d185; font-family:var(--font-mono);"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Close handlers
  adminModalEl.querySelector("#btnCloseAdminModal")?.addEventListener("click", closeAdminModal);
  adminModalEl.addEventListener("click", (e) => {
    if (e.target === adminModalEl) closeAdminModal();
  });

  // Tab switching
  adminModalEl.querySelectorAll(".admin-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      renderAdminModalContent(tab);
    });
  });

  // Bind active tab sub-renders
  if (activeTab === "improvements") renderImprovementsTab();
  else if (activeTab === "users") renderUsersTab();
  else if (activeTab === "relevance") renderRelevanceTab();
  else if (activeTab === "diagnostics") renderDiagnosticsTab();
}

function renderImprovementsTab() {
  const container = adminModalEl?.querySelector("#admImpList");
  const searchInput = adminModalEl?.querySelector("#admSearchImp");
  const statusSelect = adminModalEl?.querySelector("#admFilterStatus");
  if (!container) return;

  function updateList() {
    const q = (searchInput?.value || "").toLowerCase();
    const statusFilter = statusSelect?.value || "all";
    const list = (state.questionImprovements || []).filter((item) => {
      const status = item.status || "open";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      return (
        (item.questionId || "").toLowerCase().includes(q) ||
        (item.deckKey || "").toLowerCase().includes(q) ||
        (item.userNote || "").toLowerCase().includes(q) ||
        (item.questionText || "").toLowerCase().includes(q)
      );
    });

    if (!list.length) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--fg-muted); font-family:var(--font-mono); font-size:12px;">// Žádné připomínky k otázkám neodpovídají zadání.</div>`;
      return;
    }

    container.innerHTML = list.map((item) => {
      const status = item.status || "open";
      let statusLabel = "[OPEN]";
      if (status === "resolved") statusLabel = "[RESOLVED]";
      else if (status === "dismissed") statusLabel = "[DISMISSED]";

      return `
        <div class="admin-item-card" data-id="${item.id}" style="font-family:var(--font-mono, monospace); border-radius:2px;">
          <div class="admin-item-head" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>deck:</strong> <code>${escapeHtml(item.deckKey)}</code> · 
              <strong>id:</strong> <code>${escapeHtml(item.questionId)}</code>
            </div>
            <span class="admin-status-pill ${status}" style="font-family:var(--font-mono); font-weight:700;">${statusLabel}</span>
          </div>
          <div style="font-size:11.5px; color:var(--fg-muted); margin-top:4px;">
            <strong>kategorie:</strong> ${escapeHtml(item.categoryLabel || item.category)}
          </div>
          ${item.questionText ? `<div style="font-size:11.5px; font-style:italic; color:var(--fg-subtle); background:var(--editor); padding:6px 10px; border-radius:2px; margin-top:4px;">"${escapeHtml(item.questionText)}"...</div>` : ""}
          ${item.userNote ? `<div style="font-size:12px; color:var(--fg); margin-top:4px;"><strong>poznámka:</strong> ${escapeHtml(item.userNote)}</div>` : ""}
          <div style="font-size:10.5px; color:var(--fg-subtle); margin-top:4px;">${new Date(item.timestamp).toLocaleString("cs-CZ")}</div>
          <div class="admin-item-actions" style="margin-top:8px;">
            ${status !== "resolved" ? `<button type="button" class="admin-btn-sm success btn-act-resolve" data-id="${item.id}"><span class="prompt">$</span>resolve</button>` : ""}
            ${status !== "dismissed" ? `<button type="button" class="admin-btn-sm btn-act-dismiss" data-id="${item.id}"><span class="prompt">$</span>dismiss</button>` : ""}
            ${status !== "open" ? `<button type="button" class="admin-btn-sm btn-act-reopen" data-id="${item.id}"><span class="prompt">$</span>reopen</button>` : ""}
            <button type="button" class="admin-btn-sm danger btn-act-delete" data-id="${item.id}"><span class="prompt">$</span>delete</button>
          </div>
        </div>
      `;
    }).join("");

    // Wire actions
    container.querySelectorAll(".btn-act-resolve").forEach((b) => {
      b.addEventListener("click", async () => {
        await updateQuestionImprovementStatus(b.getAttribute("data-id"), "resolved");
        renderImprovementsTab();
      });
    });
    container.querySelectorAll(".btn-act-dismiss").forEach((b) => {
      b.addEventListener("click", async () => {
        await updateQuestionImprovementStatus(b.getAttribute("data-id"), "dismissed");
        renderImprovementsTab();
      });
    });
    container.querySelectorAll(".btn-act-reopen").forEach((b) => {
      b.addEventListener("click", async () => {
        await updateQuestionImprovementStatus(b.getAttribute("data-id"), "open");
        renderImprovementsTab();
      });
    });
    container.querySelectorAll(".btn-act-delete").forEach((b) => {
      b.addEventListener("click", async () => {
        if (confirm("Opravdu smazat tuto připomínku k otázce?")) {
          await deleteQuestionImprovement(b.getAttribute("data-id"));
          renderImprovementsTab();
        }
      });
    });
  }

  searchInput?.addEventListener("input", updateList);
  statusSelect?.addEventListener("change", updateList);
  updateList();
}

function renderUsersTab() {
  const container = adminModalEl?.querySelector("#admUsersList");
  const searchInput = adminModalEl?.querySelector("#admSearchUsers");
  const createBtn = adminModalEl?.querySelector("#btnAdmCreateAdmin");
  const msgEl = adminModalEl?.querySelector("#admUserCreateMsg");

  if (createBtn) {
    createBtn.onclick = async () => {
      const uInput = adminModalEl.querySelector("#admNewAdminUsername");
      const pInput = adminModalEl.querySelector("#admNewAdminPass");
      const username = uInput?.value.trim();
      const password = pInput?.value.trim();
      if (!username || !password) {
        if (msgEl) msgEl.textContent = "Zadejte e-mail a heslo pro admina.";
        return;
      }

      try {
        const cleanEmail = username.includes("@") ? username : `${username}@vscht.cz`;
        await registerUser({ email: cleanEmail, password });
        addAdminUser(cleanEmail);
        if (uInput) uInput.value = "";
        if (pInput) pInput.value = "";
        if (msgEl) msgEl.textContent = `✓ Admin účet "${cleanEmail}" byl úspěšně vytvořen.`;
        renderUsersTab();
      } catch (err) {
        addAdminUser(username);
        await resetUserPassword(username, password);
        if (msgEl) msgEl.textContent = `✓ Účet "${username}" byl povýšen na Admina s novým heslem.`;
        renderUsersTab();
      }
    };
  }

  function updateList() {
    if (!container) return;
    const q = (searchInput?.value || "").toLowerCase();
    const usersDb = getUsersDb();
    const adminsList = getAdminsList();

    // Ensure all admins are represented in list
    adminsList.forEach((adm) => {
      if (!usersDb[adm]) {
        usersDb[adm] = {
          username: adm,
          email: adm.includes("@") ? adm : `${adm}@vscht.cz`,
          faculty: adm === "kolard" || adm === "kolard@vscht.cz" ? "FCHI · VSČHT Praha" : "VSČHT Praha",
          studentId: "000000",
          role: "admin",
        };
      }
    });

    const userKeys = Object.keys(usersDb).filter((u) => {
      if (!q) return true;
      const rec = usersDb[u];
      return u.includes(q) || (rec.email || "").toLowerCase().includes(q);
    });

    if (!userKeys.length) {
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--fg-muted); font-family:var(--font-mono); font-size:12px;">// Žádní uživatelé nenalezeni.</div>`;
      return;
    }

    container.innerHTML = userKeys.map((u) => {
      const rec = usersDb[u];
      const isAdmin = isAdminUser({ username: u, role: rec.role });

      return `
        <div class="admin-item-card" style="font-family:var(--font-mono, monospace); border-radius:2px;">
          <div class="admin-item-head" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:13.5px; color:var(--fg);">${escapeHtml(rec.username)}</strong> 
              <span style="color:var(--fg-muted); font-size:11.5px;">(${escapeHtml(rec.email || u)})</span>
            </div>
            <span class="admin-status-pill ${isAdmin ? "resolved" : "dismissed"}">${isAdmin ? "[ADMIN]" : "[STUDENT]"}</span>
          </div>
          <div style="font-size:11.5px; color:var(--fg-muted); margin-top:2px;">
            fakulta: ${escapeHtml(rec.faculty || "VSČHT")} · id: ${escapeHtml(rec.studentId || "—")}
          </div>
          <div class="admin-item-actions" style="align-items:center; margin-top:8px;">
            <input type="password" class="admin-search-input adm-pass-input" placeholder="Nové heslo..." style="min-width:140px; font-size:11.5px; font-family:var(--font-mono);" data-user="${escapeHtml(u)}" />
            <button type="button" class="admin-btn-sm success btn-act-reset-pass" data-user="${escapeHtml(u)}"><span class="prompt">$</span>reset-pass</button>
            ${u !== "kolard" && u !== "kolard@vscht.cz" ? (
              isAdmin
                ? `<button type="button" class="admin-btn-sm btn-act-revoke-admin" data-user="${escapeHtml(u)}"><span class="prompt">$</span>revoke-admin</button>`
                : `<button type="button" class="admin-btn-sm btn-act-grant-admin" data-user="${escapeHtml(u)}"><span class="prompt">$</span>grant-admin</button>`
            ) : `<span style="font-size:10.5px; color:var(--accent); font-weight:bold;">[SUPERADMIN]</span>`}
          </div>
        </div>
      `;
    }).join("");

    // Wire user management actions
    container.querySelectorAll(".btn-act-reset-pass").forEach((b) => {
      b.addEventListener("click", async () => {
        const u = b.getAttribute("data-user");
        const card = b.closest(".admin-item-card");
        const passInput = card?.querySelector(".adm-pass-input");
        const newPass = passInput?.value.trim();
        if (!newPass) {
          alert("Zadejte nové heslo do políčka.");
          return;
        }
        try {
          await resetUserPassword(u, newPass);
          if (passInput) passInput.value = "";
          alert(`Heslo pro uživatele "${u}" bylo úspěšně změněno.`);
        } catch (err) {
          alert(`Chyba při změně hesla: ${err.message}`);
        }
      });
    });

    container.querySelectorAll(".btn-act-grant-admin").forEach((b) => {
      b.addEventListener("click", () => {
        const u = b.getAttribute("data-user");
        addAdminUser(u);
        renderUsersTab();
      });
    });

    container.querySelectorAll(".btn-act-revoke-admin").forEach((b) => {
      b.addEventListener("click", () => {
        const u = b.getAttribute("data-user");
        removeAdminUser(u);
        renderUsersTab();
      });
    });
  }

  searchInput?.addEventListener("input", updateList);
  updateList();
}

function renderRelevanceTab() {
  const container = adminModalEl?.querySelector("#admRelList");
  const searchInput = adminModalEl?.querySelector("#admSearchRel");
  if (!container) return;

  function updateList() {
    const q = (searchInput?.value || "").toLowerCase();
    const items = (state.items || []).filter((it) => {
      if (!q) return true;
      return (
        (it.title || "").toLowerCase().includes(q) ||
        (it.slug || "").toLowerCase().includes(q) ||
        (it.id || "").toLowerCase().includes(q)
      );
    });

    if (!items.length) {
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--fg-muted); font-family:var(--font-mono); font-size:12px;">// Žádná témata nenalezena.</div>`;
      return;
    }

    container.innerHTML = items.map((it) => {
      const key = it.slug || it.id || it.path;
      const relAI = it.relevanceAI || it.relevance || 5;
      const relTeacher = it.relevanceTeacher !== undefined ? it.relevanceTeacher : "";

      return `
        <div class="admin-rel-row" style="font-family:var(--font-mono, monospace);">
          <div style="flex:1; min-width:0;">
            <strong style="font-size:13px; color:var(--fg);">${escapeHtml(it.title)}</strong>
            <div style="font-size:11px; color:var(--fg-muted);">w${it.weekNum || 1} · <code>${escapeHtml(key)}</code> · <span style="color:#6a9955;">AI: ${relAI}/10</span></div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="rel-bar-preview">${starsHtml(it, 10, "bar")}</span>
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:11px; color:#ffffff; font-weight:700;">T:</span>
              <input type="number" min="1" max="10" value="${relTeacher}" placeholder="T..." class="admin-rel-input rel-num-input" data-key="${escapeHtml(key)}" style="font-family:var(--font-mono); font-size:12px; width:55px;" />
            </div>
            <button type="button" class="admin-btn-sm success btn-save-rel" data-key="${escapeHtml(key)}"><span class="prompt">$</span>save</button>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".rel-num-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const val = inp.value !== "" ? Number(inp.value) : null;
        const key = inp.getAttribute("data-key");
        const item = items.find((i) => (i.slug || i.id || i.path) === key);
        if (item) item.relevanceTeacher = val;
        const row = inp.closest(".admin-rel-row");
        const barEl = row?.querySelector(".rel-bar-preview");
        if (barEl && item) barEl.innerHTML = starsHtml(item, 10, "bar");
      });
    });

    container.querySelectorAll(".btn-save-rel").forEach((b) => {
      b.addEventListener("click", () => {
        const key = b.getAttribute("data-key");
        const row = b.closest(".admin-rel-row");
        const inp = row?.querySelector(".rel-num-input");
        const val = inp?.value !== "" ? Number(inp?.value) : null;
        saveRelevanceOverride(key, val);
        b.textContent = "Uloženo ✓";
        setTimeout(() => { b.innerHTML = `<span class="prompt">$</span>save`; }, 1200);
      });
    });
  }

  searchInput?.addEventListener("input", updateList);
  updateList();
}

function renderDiagnosticsTab() {
  const forceSyncBtn = adminModalEl?.querySelector("#btnAdmForceSync");
  const clearErrorsBtn = adminModalEl?.querySelector("#btnAdmClearErrors");
  const msgEl = adminModalEl?.querySelector("#admDiagMsg");

  if (forceSyncBtn) {
    forceSyncBtn.onclick = async () => {
      forceSyncBtn.disabled = true;
      forceSyncBtn.textContent = "Synchronizuji…";
      await loadQuestionImprovements();
      forceSyncBtn.disabled = false;
      forceSyncBtn.innerHTML = `<span class="prompt">$</span>sync --force`;
      if (msgEl) msgEl.textContent = "Cloud DB plně synchronizována.";
    };
  }

  if (clearErrorsBtn) {
    clearErrorsBtn.onclick = () => {
      clearLinkErrorLog();
      if (msgEl) msgEl.textContent = "Logy chyb v odkazech byly vymazány.";
      renderDiagnosticsTab();
    };
  }
}
