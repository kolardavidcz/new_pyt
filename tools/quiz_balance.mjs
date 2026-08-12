import fs from "fs";
import path from "path";

// FNV-1a 32-bit hash for uniform distribution
function hashFnv32(str) {
  let hVal = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hVal ^= str.charCodeAt(i);
    hVal += (hVal << 1) + (hVal << 4) + (hVal << 7) + (hVal << 8) + (hVal << 24);
  }
  return hVal >>> 0;
}

// Plausible 4th distractors for 3-option Python questions
const GENERIC_DISTRACTORS = [
  "Žádná z uvedených možností",
  "SyntaxError (neplatná syntaxe)",
  "TypeError (nekompatibilní typy)",
  "AttributeError (objekt nemá tento atribut)",
  "None (metoda nevrací hodnotu)",
  "Všechny uvedené možnosti jsou správné"
];

function balanceQuizzes() {
  const dir = "public/data/quizzes";
  let files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

  let totalMC = 0;
  let dist = { A: 0, B: 0, C: 0, D: 0 };
  let deckPatterns = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const deckKey in content) {
      const qList = content[deckKey];
      if (!Array.isArray(qList)) continue;

      let deckSequence = [];

      qList.forEach((q, idx) => {
        if (!q.options || q.options.length < 2) return;

        // Skip true/false binary questions
        const cleanFirst = String(q.options[0] || "").replace(/^[A-D]\)\s*/, "").trim().toLowerCase();
        if (q.type === "true_false_tricky" || (q.options.length === 2 && (cleanFirst === "pravda" || cleanFirst === "ano" || cleanFirst === "true"))) {
          return;
        }

        totalMC++;

        // If 3 options, add 4th distractor to make Option D available ~25%
        if (q.options.length === 3) {
          const dIdx = hashFnv32(deckKey + ":" + (q.id || idx)) % GENERIC_DISTRACTORS.length;
          const newOpt = GENERIC_DISTRACTORS[dIdx];
          if (!q.options.includes(newOpt)) {
            q.options.push(newOpt);
          }
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
        const cleanOpts = q.options.map(opt => String(opt).replace(/^[A-D]\)\s*/, "").trim());

        // Target index for correct answer based on hash modulo options.length
        const seedStr = `${deckKey}:${q.id || idx}:${q.question || ""}`;
        const hash = hashFnv32(seedStr);
        const targetIdx = hash % cleanOpts.length;

        // Shuffle distractors around target index
        const distractors = cleanOpts.filter(opt => opt !== cleanOriginalCorrect);
        
        // Secondary shuffle for distractors
        const shuffledDistract = [...distractors];
        for (let i = shuffledDistract.length - 1; i > 0; i--) {
          const swapIdx = (hash + i * 17) % (i + 1);
          const tmp = shuffledDistract[i];
          shuffledDistract[i] = shuffledDistract[swapIdx];
          shuffledDistract[swapIdx] = tmp;
        }

        // Reconstruct options array with targetIdx as correct answer
        let newOptions = [];
        let distPointer = 0;
        for (let i = 0; i < cleanOpts.length; i++) {
          if (i === targetIdx) {
            newOptions.push(cleanOriginalCorrect);
          } else {
            newOptions.push(shuffledDistract[distPointer++] || "Není k dispozici");
          }
        }

        const labels = ["A", "B", "C", "D"];
        const label = labels[targetIdx] || "A";
        dist[label] = (dist[label] || 0) + 1;
        deckSequence.push(label);
      });

      if (deckSequence.length >= 4) {
        deckPatterns.push({ deckKey, sequence: deckSequence.slice(0, 8).join(",") });
      }
    }
  }

  console.log("=== BALANCED QUIZ DISTRIBUTION STATISTICS ===");
  console.log(`Total Multiple-Choice Questions: ${totalMC}\n`);

  for (const k of ["A", "B", "C", "D"]) {
    const count = dist[k];
    const pct = ((count / totalMC) * 100).toFixed(1);
    console.log(`  Option ${k}: ${count} questions (${pct}%)`);
  }

  console.log("\nSample Deck Sequences (Checking for repeated patterns):");
  deckPatterns.slice(0, 6).forEach(dp => {
    console.log(`  Deck '${dp.deckKey}': [${dp.sequence}]`);
  });
}

balanceQuizzes();
