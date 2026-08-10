#!/usr/bin/env python3
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

# Check removed_batches.json
rem_path = ROOT / "data" / "labels" / "removed_batches.json"
if rem_path.exists():
    with open(rem_path, "r", encoding="utf-8") as f:
        rem_data = json.load(f)
        print(f"removed_batches.json contains {len(rem_data)} items.")
        if rem_data and isinstance(rem_data, list):
            sample = rem_data[0]
            print(f"Sample removed batch item: {sample.get('slug')} | slides count: {len(sample.get('slides', {}))}")

# Check slide_labels_audit.json
audit_path = ROOT / "data" / "slide_labels_audit.json"
if audit_path.exists():
    with open(audit_path, "r", encoding="utf-8") as f:
        audit_data = json.load(f)
        print(f"slide_labels_audit.json contains {len(audit_data)} entries.")

# Check source_reference
sr_path = ROOT / "data" / "source_reference"
if sr_path.exists():
    for p in sr_path.glob("*.json"):
        with open(p, "r", encoding="utf-8") as f:
            d = json.load(f)
            print(f"source_reference/{p.name} contains {len(d) if isinstance(d, (list, dict)) else 'N/A'} elements.")
