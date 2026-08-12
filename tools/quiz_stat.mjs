import fs from "fs";
import path from "path";

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0;
}

function getShuffledAnswerIndex(q) {
  if (!q || !Array.isArray(q.options) || q.options.length <= 1) return q.answer || 0;

  const cleanFirst = String(q.options[0] || "").replace(/^[A-D]\)\s*/, "").trim().toLowerCase();
  if (q.type === "true_false_tricky" || (q.options.length === 2 && (cleanFirst === "pravda" || cleanFirst === "ano" || cleanFirst === "true"))) {
    return q.answer || 0;
  }

  let originalCorrectText = "";
  if (typeof q.answer === "number" && q.options[q.answer] !== undefined) {
    originalCorrectText = q.options[q.answer];
  } else if (typeof q.answer === "string" && q.answer) {
    originalCorrectText = q.answer;
  } else {
    originalCorrectText = q.options[0];
  }

  const cleanOriginalCorrect = String(originalCorrectText).replace(/^[A-D]\)\s*/, "").trim();
  const cleanOpts = q.options.map(opt => String(opt).replace(/^[A-D]\)\s*/, "").trim());

  const seedKey = String(q.id || q.question || cleanOpts.join("|"));
  let seed = hashString(seedKey);

  function lcg() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  const indexed = cleanOpts.map((opt, i) => ({ opt, origIdx: i }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    const temp = indexed[i];
    indexed[i] = indexed[j];
    indexed[j] = temp;
  }

  const newOpts = indexed.map(item => item.opt);
  const newCorrectIdx = newOpts.findIndex(opt => opt === cleanOriginalCorrect);
  if (newCorrectIdx !== -1) return newCorrectIdx;

  const origTargetIndex = typeof q.answer === "number" ? q.answer : 0;
  const fallbackIdx = indexed.findIndex(item => item.origIdx === origTargetIndex);
  return fallbackIdx !== -1 ? fallbackIdx : 0;
}

function analyzeQuizzes() {
  const dir = "public/data/quizzes";
  let files = [];
  try {
    files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
  } catch (err) {
    console.error("Could not read directory public/data/quizzes", err);
    return;
  }

  let totalQuestions = 0;
  let rawDist = { A: 0, B: 0, C: 0, D: 0, Other: 0 };
  let shuffledDist = { A: 0, B: 0, C: 0, D: 0, Other: 0 };

  const labels = ["A", "B", "C", "D"];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    for (const deckKey in content) {
      const qList = content[deckKey];
      if (!Array.isArray(qList)) continue;

      for (const q of qList) {
        if (!q.options || q.options.length < 2) continue;
        totalQuestions++;

        let rawIdx = 0;
        if (typeof q.answer === "number") rawIdx = q.answer;
        else if (typeof q.answer === "string") {
          const idx = q.options.findIndex(opt => opt.trim().toLowerCase() === q.answer.trim().toLowerCase());
          rawIdx = idx !== -1 ? idx : 0;
        }

        const rawLabel = labels[rawIdx] || "Other";
        rawDist[rawLabel] = (rawDist[rawLabel] || 0) + 1;

        const shuffledIdx = getShuffledAnswerIndex(JSON.parse(JSON.stringify(q)));
        const shuffledLabel = labels[shuffledIdx] || "Other";
        shuffledDist[shuffledLabel] = (shuffledDist[shuffledLabel] || 0) + 1;
      }
    }
  }

  console.log("=== QUIZ ANSWER POSITION STATISTICS ===");
  console.log(`Total Multiple-Choice Questions Analyzed: ${totalQuestions}\n`);

  console.log("BEFORE SHUFFLE (RAW DATA):");
  for (const k of ["A", "B", "C", "D"]) {
    const count = rawDist[k] || 0;
    const pct = ((count / totalQuestions) * 100).toFixed(1);
    console.log(`  Option ${k}: ${count} questions (${pct}%)`);
  }

  console.log("\nAFTER DETERMINISTIC SHUFFLE (NOW):");
  for (const k of ["A", "B", "C", "D"]) {
    const count = shuffledDist[k] || 0;
    const pct = ((count / totalQuestions) * 100).toFixed(1);
    console.log(`  Option ${k}: ${count} questions (${pct}%)`);
  }
}

analyzeQuizzes();
