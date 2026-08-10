/**
 * Quiz & Takeaways Test Master Module
 * Handles quiz rendering, options evaluation, code fill inputs, explanation popups & improvements.
 */

import { state, saveQuizScore, resetDeckQuizScores, saveQuestionImprovement, getQuizFor } from "./state.js";
import { clear, el, escapeHtml } from "./ui.js";
import { highlightCode, dedentCode } from "./highlight.js";
import { formatInlineCode, isFlexibleCodeFillCorrect, parseQuestionContent } from "./format.js";

export function updatePrintQuizButtons() {
  const on = state.printWithQuizzes;
  document.querySelectorAll(".btn-quiz-toggle").forEach((b) => {
    b.classList.toggle("is-active", on);
    b.innerHTML = on ? "🖨 Kvíz v tisku ✓" : "🖨 Kvíz v tisku ☐";
    b.title = on ? "Tisk obsahuje kvízy na konci (Kliknutím vypnete)" : "Tisk bez kvízů (Kliknutím zapnete kvízy v tisku)";
  });
}

export function openImprovementModal(deckKey, q, qIdx) {
  let modal = document.getElementById("questionImproveModal");
  if (!modal) {
    modal = el("div", { className: "modal-overlay hidden", id: "questionImproveModal" });
    document.body.appendChild(modal);
  }

  const qId = q.id || `q-${qIdx + 1}`;
  const stemClean = (q.question || "").replace(/```[\s\S]*?```/g, "").trim();

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Vylepšit otázku</h3>
        <button type="button" class="btn-close-modal" aria-label="Zavřít">✕</button>
      </div>
      <div class="modal-body">
        <div class="q-summary-box">
          <div class="q-sum-row"><strong>Prezentace:</strong> <code>${escapeHtml(deckKey)}</code></div>
          <div class="q-sum-row"><strong>ID Otázky:</strong> <code>${escapeHtml(qId)}</code></div>
          <div class="q-stem-preview">${escapeHtml(stemClean.slice(0, 150))}${stemClean.length > 150 ? "…" : ""}</div>
        </div>

        <label class="improve-form-label">Důvod vylepšení / typ chyby:</label>
        <div class="radio-group">
          <label class="radio-opt">
            <input type="radio" name="improveReason" value="q_a_makes_no_sense" checked />
            <div class="radio-txt">
              <strong>1. Otázka nebo odpověď nedává smysl</strong>
              <small>Chybí klíčová informace, nepřesné zadání nebo nesouhlasí kód</small>
            </div>
          </label>
          <label class="radio-opt">
            <input type="radio" name="improveReason" value="low_quality_not_in_text" />
            <div class="radio-txt">
              <strong>2. Nekvalitní otázka / mimo prezentaci</strong>
              <small>Otázka není v prezentaci nebo navrhujete vytvořit novou</small>
            </div>
          </label>
          <label class="radio-opt">
            <input type="radio" name="improveReason" value="style_rewrite_improve" />
            <div class="radio-txt">
              <strong>3. Zlepšit styl, kód nebo formulaci</strong>
              <small>Přeformulovat text, zlepšit kódový příklad / styl zadání</small>
            </div>
          </label>
          <label class="radio-opt">
            <input type="radio" name="improveReason" value="other" />
            <div class="radio-txt">
              <strong>4. Jiný nápad nebo námitka</strong>
            </div>
          </label>
        </div>

        <label class="improve-form-label" style="margin-top:14px;">Poznámka k úpravě (co přesně vylepšit):</label>
        <textarea class="improve-notes-input" placeholder="Popište, co konkrétně vylepšit nebo co chybí..." rows="3"></textarea>
        <div class="modal-feedback-msg hidden" style="margin-top:10px; font-size:12px; color:#89d185; font-weight:600;"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-cancel-modal">Zrušit</button>
        <button type="button" class="btn primary btn-submit-improve">Uložit do DB vylepšení</button>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");

  const closeModal = () => modal.classList.add("hidden");
  modal.querySelector(".btn-close-modal")?.addEventListener("click", closeModal);
  modal.querySelector(".btn-cancel-modal")?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  const submitBtn = modal.querySelector(".btn-submit-improve");
  const notesInput = modal.querySelector(".improve-notes-input");
  const feedbackMsg = modal.querySelector(".modal-feedback-msg");

  submitBtn?.addEventListener("click", async () => {
    const selectedRadio = modal.querySelector('input[name="improveReason"]:checked');
    const category = selectedRadio ? selectedRadio.value : "q_a_makes_no_sense";
    
    let categoryLabel = "Otázka/odpověď nedává smysl";
    if (category === "low_quality_not_in_text") categoryLabel = "Nekvalitní otázka / vytvořit novou";
    else if (category === "style_rewrite_improve") categoryLabel = "Zlepšit styl a formulaci";
    else if (category === "other") categoryLabel = "Jiný nápad";

    const userNote = notesInput ? notesInput.value.trim() : "";

    submitBtn.disabled = true;
    submitBtn.textContent = "Ukládám…";

    await saveQuestionImprovement({
      deckKey,
      questionId: qId,
      questionText: stemClean,
      questionType: q.type,
      category,
      categoryLabel,
      userNote,
    });

    feedbackMsg.textContent = `✓ Připomínka k otázce ${qId} byla uložena do DB!`;
    feedbackMsg.classList.remove("hidden");
    submitBtn.textContent = "Uloženo ✓";
    submitBtn.style.background = "#16a34a";

    setTimeout(() => {
      closeModal();
    }, 1400);
  });
}

export async function renderQuizSection(item) {
  const questions = await getQuizFor(item);
  if (!questions || !questions.length) return null;

  const deckKey = item.slug || item.id || item.path;
  const card = el("section", { className: "quiz-section-card", id: "quizSection" });

  const scoreMap = state.quizScores[deckKey] || {};
  const answeredCount = Object.keys(scoreMap).length;
  const correctCount = Object.values(scoreMap).filter((s) => s.isCorrect).length;

  const header = el("header", { className: "quiz-card-header" });
  header.innerHTML = `
    <div class="quiz-header-row" style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <span class="quiz-badge">Kvíz k prezentaci · Takeaways Test</span>
        <h3 class="quiz-title">Test porozumění &amp; zopakování klíčových konceptů</h3>
        <p class="quiz-subtitle">Otestujte si své znalosti z přednášky. Odpovědi se automaticky vyhodnocují a ukládají.</p>
      </div>
      <div class="quiz-stats-box" style="text-align:right;">
        <div class="quiz-score-pill" style="font-size:14px; font-weight:700; color:var(--syntax-string, #ce9178);">
          Skóre: <span class="score-val">${correctCount} / ${questions.length}</span>
        </div>
        ${answeredCount > 0 ? `<button type="button" class="btn-reset-quiz" style="background:transparent; border:none; color:var(--text-muted, #888); font-size:11px; cursor:pointer; text-decoration:underline; margin-top:4px;">Resetovat test</button>` : ""}
      </div>
    </div>
  `;

  header.querySelector(".btn-reset-quiz")?.addEventListener("click", async () => {
    await resetDeckQuizScores(deckKey);
    const main = document.getElementById("main");
    if (main) {
      const refreshed = await renderQuizSection(item);
      const oldSec = document.getElementById("quizSection");
      if (refreshed && oldSec) {
        oldSec.replaceWith(refreshed);
      }
    }
  });

  card.appendChild(header);

  const list = el("div", { className: "quiz-questions-list" });

  function updateHeaderStats() {
    const curScores = state.quizScores[deckKey] || {};
    const curAnswered = Object.keys(curScores).length;
    const curCorrect = Object.values(curScores).filter((s) => s.isCorrect).length;
    const scoreVal = card.querySelector(".score-val");
    if (scoreVal) scoreVal.textContent = `${curCorrect} / ${questions.length}`;
  }

  questions.forEach((q, idx) => {
    const qCard = el("article", { className: `quiz-q-card qtype-${q.type}`, id: `qcard-${q.id || idx}` });
    
    let typeLabel = "Otázka";
    if (q.type === "multiple_choice") typeLabel = "Výběr ABCD";
    else if (q.type === "code_fill" || q.type === "fill_blank_choice") typeLabel = "Doplňování kódu (________)";
    else if (q.type === "predict_output") typeLabel = "Předpověď výstupu programu";
    else if (q.type === "true_false_tricky") typeLabel = "Pravda / Nepravda (Chyták)";

    const qNum = el("div", { className: "quiz-q-num" });
    qNum.innerHTML = `
      <span>Otázka ${idx + 1} z ${questions.length} <span class="quiz-type-tag">${typeLabel}</span></span>
      <button type="button" class="btn-improve-q" title="Nahlásit chybu nebo navrhnout vylepšení otázky">Vylepšit otázku</button>
    `;
    qNum.querySelector(".btn-improve-q")?.addEventListener("click", () => {
      openImprovementModal(deckKey, q, idx);
    });
    qCard.appendChild(qNum);

    const { stemHtml, codeSnippetHtml } = parseQuestionContent(q.question || "", q.code || "");
    const qText = el("div", { className: "quiz-q-text" });
    qText.innerHTML = stemHtml;
    qCard.appendChild(qText);

    let codeWrapEl = null;
    if (codeSnippetHtml) {
      codeWrapEl = el("div", { className: "quiz-code-wrap" });
      codeWrapEl.innerHTML = codeSnippetHtml;
      qCard.appendChild(codeWrapEl);
    }

    const savedState = scoreMap[q.id];
    const explanationEl = el("div", { className: "quiz-explanation hidden" });

    function showExplanation(isCorrect, expectedText, onRetry) {
      explanationEl.className = `quiz-explanation ${isCorrect ? "correct" : "incorrect"}`;
      explanationEl.innerHTML = `
        <div class="exp-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div class="exp-title">${isCorrect ? "Správně!" : "Pořádně se naučit Python se ti bude vždycky hodit"}</div>
          ${onRetry ? `<button type="button" class="btn-retry-fill" style="background:#1e293b; border:1px solid #334155; color:#38bdf8; border-radius:4px; padding:3px 10px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s ease;">Zkusit znovu</button>` : ""}
        </div>
        ${(!isCorrect && expectedText) ? `<div class="exp-expected" style="margin-bottom:6px; font-weight:600; color:var(--syntax-string, #ce9178);">Očekávaný výraz: <code>${escapeHtml(expectedText)}</code></div>` : ""}
        <div class="exp-body">${formatInlineCode(q.explanation || "")}</div>
      `;

      if (onRetry) {
        const retryBtn = explanationEl.querySelector(".btn-retry-fill");
        if (retryBtn) {
          retryBtn.addEventListener("click", onRetry);
        }
      }
      explanationEl.classList.remove("hidden");
    }

    function updateLiveFill(val, isCorrect) {
      const cleanVal = val.replace(/^[A-D]\)\s*/, "").trim();
      const targetNode = codeWrapEl ? codeWrapEl.querySelector("code") : qText;
      if (targetNode) {
        if (!targetNode.dataset.originalCode) {
          targetNode.dataset.originalCode = targetNode.innerHTML;
        }
        const orig = targetNode.dataset.originalCode;
        const fillHtml = `<span class="filled-blank ${isCorrect ? "correct" : "incorrect"}">${escapeHtml(cleanVal)}</span>`;
        targetNode.innerHTML = orig.replace(/________|___/g, fillHtml);
      }
    }

    if (q.type === "code_fill" || q.type === "fill_blank_choice") {
      let ansIdx = 0;
      let rawCorrect = "";

      if (q.expected) {
        rawCorrect = String(q.expected);
      } else if (typeof q.answer === "number") {
        ansIdx = q.answer;
        rawCorrect = (q.options && q.options[ansIdx]) ? q.options[ansIdx] : String(q.answer);
      } else if (typeof q.answer === "string" && q.answer) {
        rawCorrect = q.answer;
        if (Array.isArray(q.options)) {
          const normAns = q.answer.trim().toLowerCase();
          const idx = q.options.findIndex(opt => opt.replace(/^[A-D]\)\s*/, "").trim().toLowerCase() === normAns);
          if (idx !== -1) ansIdx = idx;
        }
      } else if (q.options && q.options.length) {
        rawCorrect = q.options[0];
      }

      const expectedClean = rawCorrect.replace(/^[A-D]\)\s*/, "").trim();

      if (codeWrapEl) {
        codeWrapEl.dataset.hl = "1";
        const cn = codeWrapEl.querySelector("code");
        if (cn) cn.dataset.hl = "1";
      }

      const inlineInputHtml = `<input type="text" class="inline-code-fill-input" size="${Math.max(6, expectedClean.length + 1)}" autocomplete="off" spellcheck="false" placeholder="doplňte kód..." aria-label="Napište chybějící kód" />`;
      let inserted = false;
      if (codeWrapEl) {
        const codeNode = codeWrapEl.querySelector("code");
        if (codeNode && (codeNode.innerHTML.includes("________") || codeNode.innerHTML.includes("___") || codeNode.innerHTML.includes("___BLANK___"))) {
          codeNode.innerHTML = codeNode.innerHTML.replace(/________|___|___BLANK___/g, inlineInputHtml);
          inserted = true;
        }
      }
      if (!inserted && (qText.innerHTML.includes("________") || qText.innerHTML.includes("___") || qText.innerHTML.includes("___BLANK___"))) {
        qText.innerHTML = qText.innerHTML.replace(/________|___|___BLANK___/g, inlineInputHtml);
        inserted = true;
      }
      if (!inserted) {
        const standaloneWrap = el("div", { className: "standalone-fill-wrap", style: "margin: 10px 0 14px;" });
        standaloneWrap.innerHTML = `<span style="font-family:var(--font-mono, monospace); font-size:13px; margin-right:8px; color:var(--text-muted)">Doplňte kód:</span> ${inlineInputHtml}`;
        qCard.appendChild(standaloneWrap);
      }

      const fillActionBar = el("div", { className: "fill-action-bar", style: "display:flex; align-items:center; gap:8px; margin:10px 0 12px;" });
      const verifyBtn = el("button", {
        type: "button",
        className: "btn-verify-fill",
        style: "height:32px; padding:0 18px; font-size:13px; font-weight:600; background:var(--accent-blue, #0284c7); color:#ffffff; border:none; border-radius:6px; cursor:pointer; transition:all 0.15s ease; box-shadow:0 2px 6px rgba(2, 132, 199, 0.3);",
      }, "Zkontrolovat");
      fillActionBar.appendChild(verifyBtn);
      qCard.appendChild(fillActionBar);

      const inlineInput = qCard.querySelector(".inline-code-fill-input");

      const handleEvaluate = (val) => {
        if (!val) return;
        const cleanVal = val.replace(/^[A-D]\)\s*/, "").trim();
        const isCorrect = isFlexibleCodeFillCorrect(cleanVal, expectedClean, q.options, ansIdx);

        if (inlineInput) {
          inlineInput.value = cleanVal;
          inlineInput.size = Math.max(6, cleanVal.length + 1);
          inlineInput.classList.remove("correct", "incorrect");
          inlineInput.classList.add(isCorrect ? "correct" : "incorrect");
        }

        saveQuizScore(deckKey, q.id, {
          selected: cleanVal,
          isCorrect: isCorrect,
        });

        showExplanation(isCorrect, expectedClean, null);
        updateHeaderStats();
      };

      const handleReset = () => {
        explanationEl.classList.add("hidden");
        if (inlineInput) {
          inlineInput.disabled = false;
          inlineInput.value = "";
          inlineInput.size = 6;
          inlineInput.classList.remove("correct", "incorrect");
          inlineInput.focus();
        }
      };

      verifyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const val = inlineInput ? inlineInput.value.trim() : "";
        if (val) handleEvaluate(val);
      });

      if (inlineInput) {
        inlineInput.addEventListener("input", () => {
          inlineInput.size = Math.max(6, inlineInput.value.length + 1);
          inlineInput.classList.remove("correct", "incorrect");
        });

        inlineInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            const val = inlineInput.value.trim();
            if (val) handleEvaluate(val);
          }
        });

        inlineInput.addEventListener("dragover", (e) => {
          e.preventDefault();
          inlineInput.classList.add("drag-over");
        });
        inlineInput.addEventListener("dragleave", () => {
          inlineInput.classList.remove("drag-over");
        });
        inlineInput.addEventListener("drop", (e) => {
          e.preventDefault();
          inlineInput.classList.remove("drag-over");
          const droppedText = e.dataTransfer ? e.dataTransfer.getData("text/plain") : "";
          if (droppedText) {
            inlineInput.value = droppedText.trim();
            inlineInput.size = Math.max(6, inlineInput.value.length + 1);
            handleEvaluate(droppedText.trim());
          }
        });
      }

      if (q.options && q.options.length) {
        const hintDetails = el("details", { className: "quiz-fill-hints-details" });
        const pillsHtml = q.options.map((opt) => {
          const cleanOpt = opt.replace(/^[A-D]\)\s*/, "").trim();
          const rawCodeVal = cleanOpt.replace(/^[`'"]+|[`'"]+$/g, "");
          const formattedPillContent = formatInlineCode(cleanOpt.startsWith("`") ? cleanOpt : `\`${cleanOpt}\``);
          return `<button type="button" class="fill-hint-pill draggable-chip" draggable="true" data-code="${escapeHtml(rawCodeVal)}">${formattedPillContent}</button>`;
        }).join(" ");
        hintDetails.innerHTML = `
          <summary class="fill-options-summary">Zobrazit nápovědu / možnosti ke vložení</summary>
          <div class="fill-options-body">
            <div class="fill-options-label">Možnosti ke vložení (klikněte nebo přetáhněte do políčka):</div>
            <div class="fill-pills-row">${pillsHtml}</div>
          </div>
        `;
        
        hintDetails.querySelectorAll(".draggable-chip").forEach((chipEl) => {
          const codeVal = chipEl.dataset.code || chipEl.textContent.trim();

          chipEl.addEventListener("dragstart", (e) => {
            if (e.dataTransfer) {
              e.dataTransfer.setData("text/plain", codeVal);
            }
          });

          chipEl.addEventListener("click", () => {
            if (inlineInput) {
              inlineInput.value = codeVal;
              inlineInput.size = Math.max(6, codeVal.length + 1);
              handleEvaluate(codeVal);
            }
          });
        });

        qCard.appendChild(hintDetails);
      }

      if (savedState && inlineInput) {
        const userVal = typeof savedState.selected === "number" && q.options ? q.options[savedState.selected] : String(savedState.selected || "");
        const cleanUserVal = userVal.replace(/^[A-D]\)\s*/, "");
        inlineInput.value = cleanUserVal;
        inlineInput.size = Math.max(6, cleanUserVal.length + 1);
        inlineInput.classList.add(savedState.isCorrect ? "correct" : "incorrect");
        updateLiveFill(userVal, savedState.isCorrect);
        showExplanation(savedState.isCorrect, expectedClean);
      }

    } else if (q.options && q.options.length) {
      const isTF = q.type === "true_false_tricky" || q.options.length === 2;
      const isPredict = q.type === "predict_output";
      const optsWrap = el("div", { className: isTF ? "quiz-options-list tf-options" : (isPredict ? "quiz-options-list term-options" : "quiz-options-list") });
      
      q.options.forEach((optText, optIdx) => {
        const isCorrectOpt = optIdx === q.answer;
        const btn = el("button", {
          type: "button",
          className: "quiz-opt-btn" + (isTF ? " tf-btn" : "") + (isPredict ? " term-opt-btn" : ""),
          onClick: () => {
            optsWrap.querySelectorAll(".quiz-opt-btn").forEach((b, i) => {
              b.disabled = true;
              if (i === q.answer) b.classList.add("correct");
              else if (i === optIdx && !isCorrectOpt) b.classList.add("incorrect");
            });

            updateLiveFill(optText, isCorrectOpt);

            saveQuizScore(deckKey, q.id, {
              selected: optIdx,
              isCorrect: isCorrectOpt,
            });

            showExplanation(isCorrectOpt);
            updateHeaderStats();
          },
        });

        const cleanOptText = optText.replace(/^[A-D]\)\s*/, "");
        if (isPredict) {
          const formattedContent = formatInlineCode(cleanOptText);
          btn.innerHTML = `<code class="term-opt-code"><span class="term-prompt">&gt;&gt;&gt;</span> ${formattedContent}</code>`;
        } else {
          btn.innerHTML = formatInlineCode(cleanOptText);
        }

        if (savedState) {
          btn.disabled = true;
          if (optIdx === q.answer) btn.classList.add("correct");
          if (optIdx === savedState.selected && !savedState.isCorrect) btn.classList.add("incorrect");
          if (optIdx === savedState.selected) {
            updateLiveFill(optText, savedState.isCorrect);
          }
        }

        optsWrap.appendChild(btn);
      });
      qCard.appendChild(optsWrap);
    }

    if (savedState) {
      showExplanation(savedState.isCorrect);
    }

    qCard.appendChild(explanationEl);
    list.appendChild(qCard);
  });

  card.appendChild(list);

  const answerKeyEl = el("div", { className: "quiz-answer-key-upsidedown" });
  let answerKeyItems = questions.map((q, i) => {
    let ansStr = "";
    if (typeof q.answer === "number" && q.options && q.options[q.answer]) {
      ansStr = q.options[q.answer];
    } else {
      ansStr = String(q.answer || "");
    }
    return `<li><strong>Otázka ${i + 1}:</strong> ${formatInlineCode(ansStr)}</li>`;
  }).join("");

  answerKeyEl.innerHTML = `
    <div class="answer-key-title">🔄 Klíč správných odpovědí (pro kontrolu otočte stránku o 180°)</div>
    <ol class="answer-key-list">${answerKeyItems}</ol>
  `;
  card.appendChild(answerKeyEl);

  return card;
}
