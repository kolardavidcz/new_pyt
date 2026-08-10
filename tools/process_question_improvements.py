#!/usr/bin/env python3
"""Tool to list and inspect question improvements reported by users in data/question_improvements.json."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "question_improvements.json"

def main():
    if not DB_PATH.exists():
        print("No question improvements recorded yet (data/question_improvements.json is empty).")
        return

    try:
        items = json.loads(DB_PATH.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"Error reading DB: {e}")
        return

    if not items:
        print("Question improvements DB exists but contains 0 entries.")
        return

    print(f"=== Question Improvement DB ({len(items)} entries logged) ===\n")
    for idx, item in enumerate(items, 1):
        q_id = item.get("questionId", "unknown")
        deck = item.get("deckKey", "unknown")
        category = item.get("categoryLabel", item.get("category", "N/A"))
        note = item.get("userNote", "").strip()
        timestamp = item.get("timestamp", "")
        q_text = item.get("questionText", "").strip()

        print(f"[{idx}] Deck: {deck} | Q_ID: {q_id}")
        print(f"    Category: {category}")
        print(f"    Timestamp: {timestamp}")
        print(f"    Question Stem: {q_text[:90]}{'...' if len(q_text) > 90 else ''}")
        if note:
            print(f"    User Note: {note}")
        print("-" * 60)

if __name__ == "__main__":
    main()
