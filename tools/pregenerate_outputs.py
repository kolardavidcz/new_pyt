#!/usr/bin/env python3
"""
Pre-generates .out files for all .py example scripts in _files/ directories
across the course materials.
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    root_dirs = [
        Path(".old/vyuka_downloaded"),
        Path("public/vyuka_downloaded"),
    ]

    py_files = []
    for rd in root_dirs:
        if rd.exists():
            py_files.extend(list(rd.glob("**/_files/*.py")))

    print(f"Found {len(py_files)} Python example files in _files/ directories.")

    generated = 0
    errors = 0

    for py_path in py_files:
        out_path = py_path.with_suffix(".out")
        
        # Run python script in its directory
        try:
            res = subprocess.run(
                [sys.executable, py_path.name],
                cwd=py_path.parent,
                capture_output=True,
                text=True,
                timeout=5
            )
            stdout = res.stdout
            if res.stderr and not stdout:
                stdout = f"# Runtime Error:\n{res.stderr}"

            # Ensure unix LF line endings
            clean_output = stdout.replace("\r\n", "\n")
            out_path.write_text(clean_output, encoding="utf-8")
            generated += 1
        except subprocess.TimeoutExpired:
            print(f"  [TIMEOUT] {py_path}")
            errors += 1
        except Exception as e:
            print(f"  [ERROR] {py_path}: {e}")
            errors += 1

    print(f"\nDone! Pre-generated {generated} .out files ({errors} errors/timeouts).")

if __name__ == "__main__":
    main()
