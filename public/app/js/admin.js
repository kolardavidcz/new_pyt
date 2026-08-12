/**
 * Admin Panel Master Module
 * Scalable multi-admin dashboard for newpyt course environment.
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
    <div class="modal-card admin-modal-card">
      <div class="modal-header">
        <h3>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Admin Panel — Správa kurzu newpyt
        </h3>
        <button type="button" class="btn-close-modal" id="btnCloseAdminModal" aria-label="Zavřít">✕</button>
      </div>

      <div class="admin-nav-tabs">
        <button type="button" class="admin-tab-btn ${activeTab === "improvements" ? "active" : ""}" data-tab="improvements">
          Vylepšení otázek ${openCount > 0 ? `<span class="admin-badge-count">${openCount}</span>` : ""}
        </button>
        <button type="button" class="admin-tab-btn ${activeTab === "users" ? "active" : ""}" data-tab="users">
          Uživatelé a Admini
        </button>
        <button type="button" class="admin-tab-btn ${activeTab === "relevance" ? "active" : ""}" data-tab="relevance">
          Relevance prezentací
        </button>
        <button type="button" class="admin-tab-btn ${activeTab === "diagnostics" ? "active" : ""}" data-tab="diagnostics">
          Diagnostika a Logy
        </button>
      </div>

      <div class="modal-body" style="padding:16px 20px;">
        <!-- TAB 1: QUESTION IMPROVEMENTS OVERVIEW -->
        <div class="admin-tab-content ${activeTab === "improvements" ? "active" : ""}" id="tab-improvements">
          <div class="admin-toolbar">
            <input type="text" class="admin-search-input" id="admSearchImp" placeholder="Hledat v připomínkách (otázka, příčina, ID)..." />
            <div style="display:flex; gap:8px; align-items:center;">
              <select class="admin-search-input" id="admFilterStatus" style="min-width:130px;">
                <option value="all">Všechny stavy</option>
                <option value="open" selected>Pouze Otevřené (${openCount})</option>
                <option value="resolved">Vyřešené</option>
                <option value="dismissed">Zamítnuté</option>
              </select>
            </div>
          </div>
          <div class="admin-card-list" id="admImpList"></div>
        </div>

        <!-- TAB 2: USER & ADMIN MANAGEMENT -->
        <div class="admin-tab-content ${activeTab === "users" ? "active" : ""}" id="tab-users">
          <div class="admin-toolbar">
            <h4 style="margin:0; font-size:14px; color:var(--fg);">Registrovat nového Administrátora</h4>
          </div>
          <div style="background:var(--bg-elevated, #252526); border:1px solid var(--border-subtle, #333); border-radius:8px; padding:14px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <input type="text" id="admNewAdminUsername" class="admin-search-input" placeholder="Uživatelské jméno (např. petrd)" />
            <input type="password" id="admNewAdminPass" class="admin-search-input" placeholder="Heslo pro admina" />
            <button type="button" class="btn primary sm" id="btnAdmCreateAdmin">Přidat Admina</button>
            <div id="admUserCreateMsg" style="font-size:12px; color:#89d185; width:100%;"></div>
          </div>

          <div class="admin-toolbar" style="margin-top:16px;">
            <h4 style="margin:0; font-size:14px; color:var(--fg);">Seznam uživatelů a oprávnění</h4>
            <input type="text" class="admin-search-input" id="admSearchUsers" placeholder="Filtrovat uživatele..." />
          </div>
          <div class="admin-card-list" id="admUsersList"></div>
        </div>

        <!-- TAB 3: PRESENTATION RELEVANCE MANAGER -->
        <div class="admin-tab-content ${activeTab === "relevance" ? "active" : ""}" id="tab-relevance">
          <div class="admin-toolbar">
            <h4 style="margin:0; font-size:14px; color:var(--fg);">Nastavení relevancí prezentací (1 - 10)</h4>
            <input type="text" class="admin-search-input" id="admSearchRel" placeholder="Hledat prezentaci podle názvu..." />
          </div>
          <div class="admin-card-list" id="admRelList"></div>
        </div>

        <!-- TAB 4: DIAGNOSTICS & SYSTEM -->
        <div class="admin-tab-content ${activeTab === "diagnostics" ? "active" : ""}" id="tab-diagnostics">
          <div class="profile-stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom:16px;">
            <div class="pstat-box">
              <span class="pstat-val">${state.items ? state.items.length : 0}</span>
              <span class="pstat-lbl">Celkem témat</span>
            </div>
            <div class="pstat-box">
              <span class="pstat-val">${improvements.length}</span>
              <span class="pstat-lbl">Připomínek otázek</span>
            </div>
            <div class="pstat-box">
              <span class="pstat-val">${state.errorLinkLog ? state.errorLinkLog.length : 0}</span>
              <span class="pstat-lbl">Zaznamenaných chyb</span>
            </div>
          </div>

          <div style="background:var(--bg-elevated, #252526); border:1px solid var(--border-subtle, #333); border-radius:8px; padding:16px; display:flex; flex-direction:column; gap:12px;">
            <h4 style="margin:0; font-size:14px; color:var(--fg);">Systémové akce a mezipaměť</h4>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button type="button" class="btn secondary sm" id="btnAdmForceSync">Vynutit Cloud Sync</button>
              <button type="button" class="btn secondary sm" id="btnAdmClearErrors">Vymazat Logy Chyb</button>
            </div>
            <div id="admDiagMsg" style="font-size:12px; color:#89d185;"></div>
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
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--fg-muted);">Žádné připomínky k otázkám neodpovídají zadání.</div>`;
      return;
    }

    container.innerHTML = list.map((item) => {
      const status = item.status || "open";
      let statusLabel = "Otevřeno";
      if (status === "resolved") statusLabel = "Vyřešeno";
      else if (status === "dismissed") statusLabel = "Zamítnuto";

      return `
        <div class="admin-item-card" data-id="${item.id}">
          <div class="admin-item-head">
            <div>
              <strong>Prezentace:</strong> <code>${escapeHtml(item.deckKey)}</code> · 
              <strong>Otázka:</strong> <code>${escapeHtml(item.questionId)}</code>
            </div>
            <span class="admin-status-pill ${status}">${statusLabel}</span>
          </div>
          <div style="font-size:12.5px; color:var(--fg-muted);">
            <strong>Kategorie:</strong> ${escapeHtml(item.categoryLabel || item.category)}
          </div>
          ${item.questionText ? `<div style="font-size:12px; font-style:italic; color:var(--fg-subtle); background:var(--editor); padding:6px 10px; border-radius:4px;">"${escapeHtml(item.questionText)}"...</div>` : ""}
          ${item.userNote ? `<div style="font-size:13px; font-weight:500; color:var(--fg); margin-top:2px;"><strong>Poznámka od uživatele:</strong> ${escapeHtml(item.userNote)}</div>` : ""}
          <div style="font-size:11px; color:var(--fg-subtle);">${new Date(item.timestamp).toLocaleString("cs-CZ")}</div>
          <div class="admin-item-actions">
            ${status !== "resolved" ? `<button type="button" class="admin-btn-sm success btn-act-resolve" data-id="${item.id}">Označit za vyřešené</button>` : ""}
            ${status !== "dismissed" ? `<button type="button" class="admin-btn-sm btn-act-dismiss" data-id="${item.id}">Zamítnout</button>` : ""}
            ${status !== "open" ? `<button type="button" class="admin-btn-sm btn-act-reopen" data-id="${item.id}">Znovu otevřít</button>` : ""}
            <button type="button" class="admin-btn-sm danger btn-act-delete" data-id="${item.id}">Smazat</button>
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
        if (msgEl) msgEl.textContent = "Zadejte uživatelské jméno a heslo pro admina.";
        return;
      }

      try {
        await registerUser({ email: `${username}@vscht.cz`, password });
        addAdminUser(username);
        if (uInput) uInput.value = "";
        if (pInput) pInput.value = "";
        if (msgEl) msgEl.textContent = `Admin účet "${username}" byl úspěšně vytvořen.`;
        renderUsersTab();
      } catch (err) {
        // If account exists, just promote to admin & reset password
        addAdminUser(username);
        await resetUserPassword(username, password);
        if (msgEl) msgEl.textContent = `Účet "${username}" byl povýšen na Admina s novým heslem.`;
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
          email: `${adm}@vscht.cz`,
          faculty: adm === "kolard" ? "FCHI · VSČHT Praha" : "VSČHT Praha",
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
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--fg-muted);">Žádní uživatelé nenalezeni.</div>`;
      return;
    }

    container.innerHTML = userKeys.map((u) => {
      const rec = usersDb[u];
      const isAdmin = isAdminUser({ username: u, role: rec.role });

      return `
        <div class="admin-item-card">
          <div class="admin-item-head">
            <div>
              <strong style="font-size:14px; color:var(--fg);">${escapeHtml(rec.username)}</strong> 
              <span style="color:var(--fg-muted); font-size:12px;">(${escapeHtml(rec.email || u)})</span>
            </div>
            <span class="admin-status-pill ${isAdmin ? "resolved" : "dismissed"}">${isAdmin ? "ADMIN" : "STUDENT"}</span>
          </div>
          <div style="font-size:12px; color:var(--fg-muted);">
            Fakulta: ${escapeHtml(rec.faculty || "VSČHT")} · ID: ${escapeHtml(rec.studentId || "—")}
          </div>
          <div class="admin-item-actions" style="align-items:center;">
            <input type="password" class="admin-search-input adm-pass-input" placeholder="Nové heslo..." style="min-width:140px; font-size:12px;" data-user="${escapeHtml(u)}" />
            <button type="button" class="admin-btn-sm success btn-act-reset-pass" data-user="${escapeHtml(u)}">Resetovat heslo</button>
            ${u !== "kolard" ? (
              isAdmin
                ? `<button type="button" class="admin-btn-sm btn-act-revoke-admin" data-user="${escapeHtml(u)}">Odebrat Admina</button>`
                : `<button type="button" class="admin-btn-sm btn-act-grant-admin" data-user="${escapeHtml(u)}">Povýšit na Admina</button>`
            ) : `<span style="font-size:11px; color:var(--accent); font-weight:bold;">Superadmin (kolard)</span>`}
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
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--fg-muted);">Žádná témata nenalezena.</div>`;
      return;
    }

    container.innerHTML = items.map((it) => {
      const key = it.slug || it.id || it.path;
      const rel = it.relevance || 5;

      return `
        <div class="admin-rel-row">
          <div style="flex:1; min-width:0;">
            <strong style="font-size:13.5px; color:var(--fg);">${escapeHtml(it.title)}</strong>
            <div style="font-size:11.5px; color:var(--fg-muted);">Týden ${it.weekNum || 1} · <code>${escapeHtml(key)}</code></div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="rel-bar-preview">${starsHtml(rel, 10, "bar")}</span>
            <input type="number" min="1" max="10" value="${rel}" class="admin-rel-input rel-num-input" data-key="${escapeHtml(key)}" />
            <button type="button" class="admin-btn-sm success btn-save-rel" data-key="${escapeHtml(key)}">Uložit</button>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".rel-num-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const val = Number(inp.value);
        const row = inp.closest(".admin-rel-row");
        const barEl = row?.querySelector(".rel-bar-preview");
        if (barEl) barEl.innerHTML = starsHtml(val, 10, "bar");
      });
    });

    container.querySelectorAll(".btn-save-rel").forEach((b) => {
      b.addEventListener("click", () => {
        const key = b.getAttribute("data-key");
        const row = b.closest(".admin-rel-row");
        const inp = row?.querySelector(".rel-num-input");
        const val = Number(inp?.value || 5);
        saveRelevanceOverride(key, val);
        b.textContent = "Uloženo";
        setTimeout(() => { b.textContent = "Uložit"; }, 1200);
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
      forceSyncBtn.textContent = "Vynutit Cloud Sync";
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
