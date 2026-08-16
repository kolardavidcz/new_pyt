/**
 * Admin Control Center Master Module
 * Clean, modern administrative interface for course management, user roles, diagnostics, and issue tracking.
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
  updateQuestionImprovement,
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

  renderAdminModalContent("improvements");
  adminModalEl.classList.remove("hidden");

  // Automatic background refresh from cloud
  loadQuestionImprovements().then(() => {
    if (adminModalEl && !adminModalEl.classList.contains("hidden")) {
      const activeTabBtn = adminModalEl.querySelector(".admin-tab-btn.active");
      const activeTab = activeTabBtn?.getAttribute("data-tab") || "improvements";
      if (activeTab === "improvements") {
        renderImprovementsTab();
        const openCount = (state.questionImprovements || []).filter((i) => (i.status || "open") === "open").length;
        const tabBtn = adminModalEl.querySelector('.admin-tab-btn[data-tab="improvements"]');
        if (tabBtn) {
          tabBtn.innerHTML = `Připomínky a diagnostika ${openCount > 0 ? `<span class="admin-badge-count">${openCount}</span>` : ""}`;
        }
      }
    }
  });
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
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:15px; margin:0; display:flex; align-items:center; gap:8px; color:var(--fg); font-weight:600;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Správa kurzu
        </h3>
        <button type="button" class="btn-close-modal" id="btnCloseAdminModal" aria-label="Zavřít">✕</button>
      </div>

      <div class="admin-nav-tabs">
        <button type="button" class="admin-tab-btn ${activeTab === "improvements" ? "active" : ""}" data-tab="improvements">
          Připomínky a diagnostika ${openCount > 0 ? `<span class="admin-badge-count">${openCount}</span>` : ""}
        </button>
        <button type="button" class="admin-tab-btn ${activeTab === "users" ? "active" : ""}" data-tab="users">
          Správa uživatelů
        </button>
        <button type="button" class="admin-tab-btn ${activeTab === "relevance" ? "active" : ""}" data-tab="relevance">
          Relevance témat
        </button>
      </div>

      <div class="modal-body" style="padding:16px 20px;">
        <!-- TAB 1: QUESTION IMPROVEMENTS & DIAGNOSTICS -->
        <div class="admin-tab-content ${activeTab === "improvements" ? "active" : ""}" id="tab-improvements">
          <!-- Diagnostics Summary Strip -->
          <div class="v2-status-line" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:10px 14px; background:var(--editor, #1e1e1e); border:1px solid var(--border-subtle, #333); border-radius:2px;">
            <div style="display:flex; gap:16px; flex-wrap:wrap; font-size:12px;">
              <div>Témat v kurzu: <strong class="num">${state.items ? state.items.length : 0}</strong></div>
              <div>Otevřených připomínek: <strong class="num" style="color:#f59e0b;">${openCount}</strong></div>
              <div>Celkem hlášení: <strong class="num">${improvements.length}</strong></div>
              <div>Chyby v odkazech: <strong class="num" style="color:${(state.errorLinkLog && state.errorLinkLog.length > 0) ? '#ef4444' : '#10b981'};">${state.errorLinkLog ? state.errorLinkLog.length : 0}</strong></div>
            </div>
            ${state.errorLinkLog && state.errorLinkLog.length > 0 ? `
              <button type="button" class="admin-btn-sm btn-clear-link-errors" style="font-size:11px;">Vyčistit chyby odkazů</button>
            ` : ""}
          </div>

          <div class="admin-toolbar" style="display:flex; gap:10px; margin-bottom:12px; align-items:center;">
            <input type="text" class="admin-search-input" id="admSearchImp" name="search_admin_improvements_filter" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" data-form-type="other" data-1p-ignore placeholder="Hledat podle otázky, tématu nebo poznámky..." style="flex:1;" />
            <select class="admin-search-input" id="admFilterStatus" style="min-width:150px;">
              <option value="all">Všechny stavy</option>
              <option value="open" selected>Pouze otevřené (${openCount})</option>
              <option value="resolved">Vyřešené</option>
              <option value="dismissed">Zamítnuté</option>
            </select>
          </div>
          <div class="admin-card-list" id="admImpList"></div>
        </div>

        <!-- TAB 2: USER & ADMIN MANAGEMENT -->
        <div class="admin-tab-content ${activeTab === "users" ? "active" : ""}" id="tab-users">
          <div style="background:var(--editor, #1e1e1e); border:1px solid var(--border-subtle, #333); border-radius:2px; padding:12px 14px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:14px;">
            <input type="text" id="admNewAdminUsername" class="admin-search-input" placeholder="E-mail správce (@vscht.cz)" style="flex:1;" />
            <input type="password" id="admNewAdminPass" class="admin-search-input" placeholder="Heslo" style="flex:1;" />
            <button type="button" class="btn primary sm v2-submit" id="btnAdmCreateAdmin" style="width:auto;">Udělit práva správce</button>
            <div id="admUserCreateMsg" style="font-size:11.5px; color:#89d185; width:100%;"></div>
          </div>

          <div class="admin-toolbar" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; color:var(--text-muted);">Registrovaní uživatelé a správci</span>
            <input type="text" class="admin-search-input" id="admSearchUsers" placeholder="Filtrovat uživatele..." style="min-width:200px;" />
          </div>
          <div class="admin-card-list" id="admUsersList" style="margin-top:10px;"></div>
        </div>

        <!-- TAB 3: PRESENTATION RELEVANCE MANAGER -->
        <div class="admin-tab-content ${activeTab === "relevance" ? "active" : ""}" id="tab-relevance">
          <div class="admin-toolbar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-size:12px; color:var(--text-muted);">Hodnocení relevance (1–10) pro studenty a vyučující</span>
            <input type="text" class="admin-search-input" id="admSearchRel" placeholder="Hledat téma podle názvu nebo klíče..." style="min-width:260px;" />
          </div>
          <div class="admin-card-list" id="admRelList"></div>
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

  // Clear link errors handler
  adminModalEl.querySelector(".btn-clear-link-errors")?.addEventListener("click", () => {
    clearLinkErrorLog();
    renderAdminModalContent("improvements");
  });

  // Bind active tab sub-renders
  if (activeTab === "improvements") renderImprovementsTab();
  else if (activeTab === "users") renderUsersTab();
  else if (activeTab === "relevance") renderRelevanceTab();
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
        (item.questionText || "").toLowerCase().includes(q) ||
        (item.categoryLabel || "").toLowerCase().includes(q)
      );
    });

    if (!list.length) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--fg-muted); font-size:12px;">Žádné připomínky neodpovídají zadanému filtru.</div>`;
      return;
    }

    container.innerHTML = list.map((item) => {
      const status = item.status || "open";
      let statusLabel = "Otevřeno";
      if (status === "resolved") statusLabel = "Vyřešeno";
      else if (status === "dismissed") statusLabel = "Zamítnuto";

      const isSlide = item.questionType === "presentation" || item.questionId === "presentation-content";
      const isFactual = item.category === "factual_or_unclear" || (item.categoryLabel && item.categoryLabel.toLowerCase().includes("faktick"));
      const hasZnamenacek = isSlide && isFactual;

      return `
        <div class="admin-item-card" data-id="${item.id}" style="border-radius:2px;">
          <div class="admin-item-head" style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span style="font-size:11px; font-weight:600; padding:2px 6px; border-radius:2px; background:${isSlide ? "rgba(56,189,248,0.15)" : "rgba(168,85,247,0.15)"}; color:${isSlide ? "#38bdf8" : "#c084fc"};">
                ${isSlide ? "Prezentace" : "Kvíz"}
              </span>
              ${hasZnamenacek ? `
                <span class="admin-badge-znamenacek" style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:2px; background:rgba(234,179,8,0.2); color:#facc15; border:1px solid rgba(234,179,8,0.5); display:inline-flex; align-items:center; gap:4px;" title="Znamenáček: student nahlásil faktickou chybu v prezentaci">★ Znamenáček</span>
              ` : ""}
              <strong style="color:var(--fg); font-size:13px;">${escapeHtml(item.deckKey)}</strong>
              ${!isSlide ? `<span style="color:var(--fg-muted); font-size:12px;">· Otázka: <code>${escapeHtml(item.questionId)}</code></span>` : ""}
            </div>
            <span class="admin-status-pill ${status}" style="font-weight:600;">${statusLabel}</span>
          </div>
          <div style="font-size:12px; color:var(--fg-muted); margin-top:6px; display:flex; align-items:center; gap:6px;">
            <strong>Kategorie:</strong>
            <span style="color:#e2b714; font-weight:500;">${escapeHtml(item.categoryLabel || item.category)}</span>
          </div>
          ${item.questionText ? `<div style="font-size:11.5px; font-style:italic; color:var(--fg-subtle); background:var(--editor); padding:6px 10px; border-radius:2px; margin-top:6px;">"${escapeHtml(item.questionText)}"...</div>` : ""}
          ${item.userNote ? `<div style="font-size:12px; color:var(--fg); margin-top:6px;"><strong>Poznámka:</strong> ${escapeHtml(item.userNote)}</div>` : ""}
          ${item.fixSummary ? `<div style="font-size:12px; color:#89d185; margin-top:4px;"><strong>Úprava správce:</strong> ${escapeHtml(item.fixSummary)}</div>` : ""}
          <div style="font-size:10.5px; color:var(--fg-subtle); margin-top:6px;">${new Date(item.timestamp).toLocaleString("cs-CZ")}</div>
          
          <div class="admin-item-actions" style="margin-top:8px;">
            ${status !== "resolved" ? `<button type="button" class="admin-btn-sm success btn-act-resolve" data-id="${item.id}">Vyřešit</button>` : ""}
            ${status !== "dismissed" ? `<button type="button" class="admin-btn-sm btn-act-dismiss" data-id="${item.id}">Zamítnout</button>` : ""}
            ${status !== "open" ? `<button type="button" class="admin-btn-sm btn-act-reopen" data-id="${item.id}">Znovu otevřít</button>` : ""}
            <button type="button" class="admin-btn-sm btn-act-edit" data-id="${item.id}">Upravit</button>
            <button type="button" class="admin-btn-sm danger btn-act-delete" data-id="${item.id}">Smazat</button>
          </div>

          <!-- Inline Edit Drawer -->
          <div class="admin-edit-panel hidden" id="editPanel-${item.id}" style="margin-top:10px; padding:12px; background:var(--editor, #1e1e1e); border:1px solid var(--border-subtle, #444); border-radius:2px;">
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:8px;">
              <div style="flex:1; min-width:200px;">
                <label style="font-size:11px; color:var(--fg-muted); display:block; margin-bottom:4px;">Kategorie:</label>
                <select class="admin-search-input edit-category" style="width:100%;">
                  <option value="factual_or_unclear" ${item.category === "factual_or_unclear" ? "selected" : ""}>Faktická chyba / nejasná formulace</option>
                  <option value="style_or_typo" ${item.category === "style_or_typo" ? "selected" : ""}>Stylistická chyba / překlep / kód</option>
                  <option value="off_topic" ${item.category === "off_topic" ? "selected" : ""}>Mimo téma / chybí kontext</option>
                  <option value="suggestion_idea" ${item.category === "suggestion_idea" ? "selected" : ""}>Námět na zlepšení / doplnění</option>
                </select>
              </div>
              <div style="min-width:140px;">
                <label style="font-size:11px; color:var(--fg-muted); display:block; margin-bottom:4px;">Stav:</label>
                <select class="admin-search-input edit-status" style="width:100%;">
                  <option value="open" ${status === "open" ? "selected" : ""}>Otevřeno</option>
                  <option value="resolved" ${status === "resolved" ? "selected" : ""}>Vyřešeno</option>
                  <option value="dismissed" ${status === "dismissed" ? "selected" : ""}>Zamítnuto</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom:8px;">
              <label style="font-size:11px; color:var(--fg-muted); display:block; margin-bottom:4px;">Poznámka uživatele:</label>
              <textarea class="admin-search-input edit-user-note" rows="2" style="width:100%; font-family:inherit;">${escapeHtml(item.userNote || "")}</textarea>
            </div>
            <div style="margin-bottom:8px;">
              <label style="font-size:11px; color:var(--fg-muted); display:block; margin-bottom:4px;">Poznámka správce k vyřešení (fixSummary):</label>
              <input type="text" class="admin-search-input edit-fix-summary" placeholder="Např. Opraveno v prezentaci, upraveno zadání otázky..." value="${escapeHtml(item.fixSummary || "")}" style="width:100%; font-family:inherit;" />
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button type="button" class="admin-btn-sm btn-cancel-inline-edit" data-id="${item.id}">Zrušit</button>
              <button type="button" class="admin-btn-sm success btn-save-inline-edit" data-id="${item.id}">Uložit změny</button>
            </div>
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
        if (confirm("Opravdu smazat tuto připomínku?")) {
          await deleteQuestionImprovement(b.getAttribute("data-id"));
          renderImprovementsTab();
        }
      });
    });

    container.querySelectorAll(".btn-act-edit").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-id");
        const panel = container.querySelector(`#editPanel-${id}`);
        if (panel) {
          panel.classList.toggle("hidden");
        }
      });
    });

    container.querySelectorAll(".btn-cancel-inline-edit").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-id");
        const panel = container.querySelector(`#editPanel-${id}`);
        if (panel) panel.classList.add("hidden");
      });
    });

    container.querySelectorAll(".btn-save-inline-edit").forEach((b) => {
      b.addEventListener("click", async () => {
        const id = b.getAttribute("data-id");
        const card = b.closest(".admin-item-card");
        const catSelect = card?.querySelector(".edit-category");
        const statusSelect = card?.querySelector(".edit-status");
        const noteInput = card?.querySelector(".edit-user-note");
        const fixInput = card?.querySelector(".edit-fix-summary");

        const category = catSelect?.value || "factual_or_unclear";
        const newStatus = statusSelect?.value || "open";
        const userNote = noteInput?.value.trim() || "";
        const fixSummary = fixInput?.value.trim() || "";

        let categoryLabel = "Faktická chyba / nejasná formulace";
        if (category === "style_or_typo") categoryLabel = "Stylistická chyba / překlep / kód";
        else if (category === "off_topic") categoryLabel = "Mimo téma / chybí kontext";
        else if (category === "suggestion_idea") categoryLabel = "Námět na zlepšení / doplnění";

        b.disabled = true;
        b.textContent = "Ukládám…";

        await updateQuestionImprovement(id, {
          category,
          categoryLabel,
          status: newStatus,
          userNote,
          fixSummary,
        });

        renderImprovementsTab();
      });
    });
  }

  searchInput?.addEventListener("input", updateList);
  statusSelect?.addEventListener("change", updateList);
  updateList();

  // Automatic background refresh from cloud
  loadQuestionImprovements().then(() => {
    updateList();
    const openCount = (state.questionImprovements || []).filter((i) => (i.status || "open") === "open").length;
    const tabBtn = adminModalEl?.querySelector('.admin-tab-btn[data-tab="improvements"]');
    if (tabBtn) {
      tabBtn.innerHTML = `Připomínky a diagnostika ${openCount > 0 ? `<span class="admin-badge-count">${openCount}</span>` : ""}`;
    }
  });
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
        if (msgEl) msgEl.textContent = "Zadejte e-mail a heslo pro správce.";
        return;
      }

      try {
        const cleanEmail = username.includes("@") ? username : `${username}@vscht.cz`;
        await registerUser({ email: cleanEmail, password });
        addAdminUser(cleanEmail);
        if (uInput) uInput.value = "";
        if (pInput) pInput.value = "";
        if (msgEl) msgEl.textContent = `✓ Účet správce "${cleanEmail}" byl úspěšně vytvořen.`;
        renderUsersTab();
      } catch (err) {
        addAdminUser(username);
        await resetUserPassword(username, password);
        if (msgEl) msgEl.textContent = `✓ Účet "${username}" byl povýšen na správce s novým heslem.`;
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
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--fg-muted); font-size:12px;">Žádní uživatelé nebyli nalezeni.</div>`;
      return;
    }

    container.innerHTML = userKeys.map((u) => {
      const rec = usersDb[u];
      const isAdmin = isAdminUser({ username: u, role: rec.role });

      return `
        <div class="admin-item-card" style="border-radius:2px;">
          <div class="admin-item-head" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:13.5px; color:var(--fg);">${escapeHtml(rec.username)}</strong> 
              <span style="color:var(--fg-muted); font-size:11.5px;">(${escapeHtml(rec.email || u)})</span>
            </div>
            <span class="admin-status-pill ${isAdmin ? "resolved" : "dismissed"}">${isAdmin ? "Správce" : "Student"}</span>
          </div>
          <div style="font-size:11.5px; color:var(--fg-muted); margin-top:2px;">
            Fakulta: ${escapeHtml(rec.faculty || "VSČHT")} · Osobní číslo: ${escapeHtml(rec.studentId || "—")}
          </div>
          <div class="admin-item-actions" style="align-items:center; margin-top:8px;">
            <input type="password" class="admin-search-input adm-pass-input" placeholder="Nové heslo..." style="min-width:140px; font-size:11.5px;" data-user="${escapeHtml(u)}" />
            <button type="button" class="admin-btn-sm success btn-act-reset-pass" data-user="${escapeHtml(u)}">Změnit heslo</button>
            ${u !== "kolard" && u !== "kolard@vscht.cz" ? (
              isAdmin
                ? `<button type="button" class="admin-btn-sm btn-act-revoke-admin" data-user="${escapeHtml(u)}">Odebrat správce</button>`
                : `<button type="button" class="admin-btn-sm btn-act-grant-admin" data-user="${escapeHtml(u)}">Udělit správce</button>`
            ) : `<span style="font-size:11px; color:var(--accent); font-weight:600;">Hlavní administrátor</span>`}
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
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--fg-muted); font-size:12px;">Žádná témata nebyla nalezena.</div>`;
      return;
    }

    container.innerHTML = items.map((it) => {
      const key = it.slug || it.id || it.path;
      const relAI = it.relevanceAI || it.relevance || 5;
      const relTeacher = it.relevanceTeacher !== undefined ? it.relevanceTeacher : "";

      return `
        <div class="admin-rel-row">
          <div style="flex:1; min-width:0;">
            <strong style="font-size:13px; color:var(--fg);">${escapeHtml(it.title)}</strong>
            <div style="font-size:11px; color:var(--fg-muted);">Týden ${it.weekNum || 1} · <code>${escapeHtml(key)}</code> · <span style="color:#6a9955;">AI relevance: ${relAI}/10</span></div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="rel-bar-preview">${starsHtml(it, 10, "bar")}</span>
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:11.5px; color:var(--fg); font-weight:600;">Vyučující:</span>
              <input type="number" min="1" max="10" value="${relTeacher}" placeholder="1–10" class="admin-rel-input rel-num-input" data-key="${escapeHtml(key)}" style="font-size:12px; width:60px;" />
            </div>
            <button type="button" class="admin-btn-sm success btn-save-rel" data-key="${escapeHtml(key)}">Uložit</button>
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
        setTimeout(() => { b.textContent = "Uložit"; }, 1200);
      });
    });
  }

  searchInput?.addEventListener("input", updateList);
  updateList();
}
