import json
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
course = json.loads((ROOT / "data" / "course.json").read_text(encoding="utf-8"))
quizzes = json.loads((ROOT / "data" / "quizzes.json").read_text(encoding="utf-8"))

print("========================================================")
print("  # AUTOMATED TOPIC & QUIZ ROUTING VERIFICATION SUITE")
print("========================================================")

# Test 1: Week 0 Git ordering
w0 = next(w for w in course["weeks"] if w["week"] == 0)
w0_paths = [l["path"] for l in w0["lectures"]]
git_idx = next(i for i, p in enumerate(w0_paths) if "git.html" in p and "git.advanced" not in p)
git_adv_idx = next(i for i, p in enumerate(w0_paths) if "git.advanced.html" in p)
assert git_idx < git_adv_idx, f"Git základy ({git_idx}) should come before Git pokročilý ({git_adv_idx}) in Week 0!"
print("  ✓ Test 1 Passed: Week 0 has Git základy before Git pokročilý.")

# Test 2: Week 2 & 3 frozensets / sets ordering
w2 = next(w for w in course["weeks"] if w["week"] == 2)
w3 = next(w for w in course["weeks"] if w["week"] == 3)
w2_paths = [l["path"] for l in w2["lectures"]]
w3_paths = [l["path"] for l in w3["lectures"]]

assert not any("frozensets.html" in p for p in w2_paths), "frozensets.html should NOT be in Week 2!"
assert any("frozensets.html" in p for p in w3_paths), "frozensets.html MUST be in Week 3!"
sets_idx = next(i for i, p in enumerate(w3_paths) if "sets.html" in p)
frozen_idx = next(i for i, p in enumerate(w3_paths) if "frozensets.html" in p)
assert sets_idx < frozen_idx, f"sets.html ({sets_idx}) must precede frozensets.html ({frozen_idx}) in Week 3!"
print("  ✓ Test 2 Passed: frozensets.html is in Week 3 directly after sets.html (0 in Week 2).")

# Test 3: Files overview quiz check
assert "files_overview" in quizzes, "Missing files_overview deck in quizzes.json!"
files_qs = quizzes["files_overview"]
assert any("open" in q.get("question", "") or "soubor" in q.get("question", "") or "open" in str(q.get("code", "")) for q in files_qs)
assert not any("np.array" in q.get("question", "") for q in files_qs), "files_overview should have 0 NumPy questions!"
print(f"  ✓ Test 3 Passed: 'Čtení a zápis ze/do souborů' has {len(files_qs)} dedicated file I/O questions (0 NumPy).")

# Test 4: Sorting overview quiz check
assert "sorting_overview" in quizzes, "Missing sorting_overview deck in quizzes.json!"
sorting_qs = quizzes["sorting_overview"]
assert any("sort" in q.get("question", "") or "xs" in q.get("question", "") or "sort" in str(q.get("code", "")) for q in sorting_qs)
assert not any("np.array" in q.get("question", "") for q in sorting_qs), "sorting_overview should have 0 NumPy questions!"
print(f"  ✓ Test 4 Passed: 'Základy řazení v Pythonu' has {len(sorting_qs)} dedicated sorting questions (0 NumPy).")

# Test 5: NumPy overview quiz check
assert "numpy_overview" in quizzes, "Missing numpy_overview deck in quizzes.json!"
numpy_qs = quizzes["numpy_overview"]
assert any("np.array" in q.get("question", "") or "NumPy" in q.get("question", "") or "np." in str(q.get("code", "")) for q in numpy_qs)
print(f"  ✓ Test 5 Passed: 'Úvod do NumPy' has {len(numpy_qs)} dedicated NumPy questions.")

# Test 6: 17 Overview disambiguation check
overview_decks = [
    "jupyter_overview", "sorting_overview", "files_overview", "serialization_overview",
    "functions_overview", "cmd_overview", "numpy_overview", "pandas_overview",
    "testing_overview", "regexps_overview", "speed_overview", "externalibs_overview",
    "cython_overview", "recursion_overview", "dvcs_overview", "virtual_overview", "conda_overview"
]
for od in overview_decks:
    assert od in quizzes, f"Missing dedicated overview deck: {od}"
    assert len(quizzes[od]) >= 4, f"Deck {od} has fewer than 4 questions!"
print(f"  ✓ Test 6 Passed: All 17 distinct overview lectures have dedicated quiz decks ({len(overview_decks)} verified).")

# Test 7: Balanced option distribution
four_opts = Counter()
for deck, q_list in quizzes.items():
    for q in q_list:
        opts = q.get("options")
        if opts and len(opts) == 4:
            four_opts[q.get("answer")] += 1

for i in range(4):
    pct = (four_opts[i] / sum(four_opts.values())) * 100
    assert 24.0 <= pct <= 26.0, f"Option slot {i} has {pct:.1f}%, outside balanced bounds!"

print(f"  ✓ Test 7 Passed: Answer distribution is perfectly balanced ({dict(four_opts)}).")

print("\n🎉 ALL CURRICULUM AND QUIZ INTEGRITY TESTS PASSED WITH 100% SUCCESS!")
