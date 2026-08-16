#!/usr/bin/env python3
"""
Modernize legacy Python 2 / C-manpage BNF bracket signatures in slides to clean Python 3 syntax.
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

EXACT_REPLACEMENTS = [
    # sorted & sort
    ("sorted(iterable[, key][, reverse])", "sorted(iterable, key=None, reverse=False)"),
    ("sorted(iterable[, key[, reverse]])", "sorted(iterable, key=None, reverse=False)"),
    ("xs.sort([key[, reverse]])", "xs.sort(key=None, reverse=False)"),
    ("xs.sort([key][, reverse])", "xs.sort(key=None, reverse=False)"),
    ("sort([key[, reverse]])", "sort(key=None, reverse=False)"),
    ("sort([key][, reverse])", "sort(key=None, reverse=False)"),
    
    # string methods
    ("xs.index(x[, n])", "xs.index(x, start=0)"),
    ("index(x[, n])", "index(x, start=0)"),
    ("count(sub[, start[, end]]))", "count(sub, start=0, end=None)"),
    ("count(sub[, start[, end]])", "count(sub, start=0, end=None)"),
    ("str.startswith(prefix[, začátek[, konec]])", "str.startswith(prefix, start=0, end=None)"),
    ("str.endswith(suffix[, začátek[, konec]])", "str.endswith(suffix, start=0, end=None)"),
    ("startswith(prefix[, začátek[, konec]])", "startswith(prefix, start=0, end=None)"),
    ("endswith(suffix[, začátek[, konec]])", "endswith(suffix, start=0, end=None)"),
    ("xs.center(DELKA[,'ZNAK'])", "xs.center(delka, 'znak')"),
    ("xs.rjust(DELKA[,'ZNAK'])", "xs.rjust(delka, 'znak')"),
    ("xs.ljust(DELKA[,'ZNAK'])", "xs.ljust(delka, 'znak')"),
    ("xs.center(DELKA[, 'ZNAK'])", "xs.center(delka, 'znak')"),
    ("xs.rjust(DELKA[, 'ZNAK'])", "xs.rjust(delka, 'znak')"),
    ("xs.ljust(DELKA[, 'ZNAK'])", "xs.ljust(delka, 'znak')"),
    ("xs.replace('CO', 'ČÍM'[, 'KOLIKRÁT'])", "xs.replace('co', 'čím', max_pocet)"),
    ("replace('CO', 'ČÍM'[, 'KOLIKRÁT'])", "replace('co', 'čím', max_pocet)"),
    ("xs.replace(CO, ČÍM[, KOLIKRÁT])", "xs.replace(co, čím, max_pocet)"),
    ("replace(CO, ČÍM[, KOLIKRÁT])", "replace(co, čím, max_pocet)"),
    
    # math & numbers
    ("log(x[, base])", "log(x, base)"),
    
    # collections & dicts & sets
    ("collections.defaultdict([default_factory[, ITERABLE]])", "collections.defaultdict(default_factory=None, iterable=())"),
    ("defaultdict([default_factory[, ITERABLE]])", "defaultdict(default_factory=None, iterable=())"),
    ("get(KLÍČ[, výchozí_hodnota])", "get(klíč, výchozí=None)"),
    ("get(KLÍČ[, VýchozíHodnota])", "get(klíč, výchozí=None)"),
    ("setdefault(KLÍČ[, výchozí_hodnota])", "setdefault(klíč, výchozí=None)"),
    ("setdefault(KLÍČ[, VýchozíHodnota])", "setdefault(klíč, výchozí=None)"),
    ("pop(KLÍČ[, výchozí_hodnota])", "pop(klíč, výchozí=None)"),
    ("pop(KLÍČ[, VýchozíHodnota])", "pop(klíč, výchozí=None)"),
    ("get(key[, default])", "get(key, default=None)"),
    ("setdefault(key[, value])", "setdefault(key, default=None)"),
    ("pop(key[, default])", "pop(key, default=None)"),
    ("update(YS[, ZS, ...])", "update(*others)"),
    
    # itertools
    ("count([start=0[, step=1]])", "count(start=0, step=1)"),
    ("repeat(E[, n])", "repeat(elem, times=None)"),
    ("product(p, q, …[, repeat=1])", "product(*iterables, repeat=1)"),
    ("permutations(I[, r=None])", "permutations(iterable, r=None)"),
    
    # OOP & meta & exceptions
    ("__new__(cls[, …])", "__new__(cls, *args, **kwargs)"),
    ("__init__(self[, …])", "__init__(self, *args, **kwargs)"),
    ("assert VÝRAZ [, ARGUMENT]", "assert výraz, zpráva"),
    ("assert VÝRAZ [, ZPRÁVA]", "assert výraz, zpráva"),
    
    # os & inspect & files
    ("inspect.getmembers(OBJEKT[, podmínka])", "inspect.getmembers(objekt, predikat=None)"),
    ("os.path.join( path1[, path2[, ...]]) )", "os.path.join(path1, path2, ...)"),
    ("os.path.join(path1[, path2[, ...]])", "os.path.join(path1, path2, ...)"),
    ("seek(offset[, 0|1|2])", "seek(offset, whence=0)"),
    ("seek(offset[, whence])", "seek(offset, whence=0)"),
    ("madvise(option[, start[, length]])", "madvise(option, start=0, length=0)"),
    ("open(SOUBOR[, MÓD[, BUFFERING]])", "open(soubor, mode='r', buffering=-1, encoding=None)"),
    ("open(SOUBOR[, MÓD])", "open(soubor, mode='r')"),
    ("open(file[, mode='r']", "open(file, mode='r'"),
]

def clean_content(text):
    for old, new in EXACT_REPLACEMENTS:
        text = text.replace(old, new)
        
    # Fix print multiline parameter brackets in pre/code blocks
    text = re.sub(
        r'\[,\s*sep=[\'"][^\'"]*[\'"]\]\s*\[,\s*end=[\'"][^\'"]*[\'"]\]\s*\[,\s*file=[^\]]+\]\s*\[,\s*flush=[^\]]+\]',
        "sep=' ', end='\\n', file=sys.stdout, flush=False",
        text
    )
    text = re.sub(
        r'\[,\s*sep=[\'"][^\'"]*[\'"]\]\n\s*\[,\s*end=[\'"][^\'"]*[\'"]\]\n\s*\[,\s*file=[^\]]+\]\n\s*\[,\s*flush=[^\]]+\]',
        "  sep=' ',\n  end='\\n',\n  file=sys.stdout,\n  flush=False",
        text
    )

    # Fix open() multiline parameters
    text = re.sub(
        r'\[,\s*mode=[\'"][^\'"]*[\'"]\]\n\s*\[,\s*buffering=[^\]]+\]\n\s*\[,\s*encoding=[^\]]+\]\n\s*\[,\s*errors=[^\]]+\]\n\s*\[,\s*newline=[^\]]+\]\n\s*\[,\s*closefd=[^\]]+\]\n\s*\[,\s*opener=[^\]]+\]',
        "  mode='r',\n  buffering=-1,\n  encoding=None,\n  errors=None,\n  newline=None,\n  closefd=True,\n  opener=None",
        text
    )

    return text

def main():
    target_dirs = [
        ROOT / "public" / "vyuka_downloaded",
        ROOT / "vyuka_downloaded",
        ROOT / ".old" / "vyuka_downloaded",
    ]
    
    modified_files = 0
    
    for t_dir in target_dirs:
        if not t_dir.exists():
            continue
        for html_path in t_dir.rglob("*.html"):
            if "brainfuck" in str(html_path) or "L-systems" in str(html_path) or "xpath" in str(html_path):
                # Don't touch grammar files or brainfuck brackets
                continue
            orig = html_path.read_text(encoding="utf-8", errors="ignore")
            cleaned = clean_content(orig)
            if cleaned != orig:
                html_path.write_text(cleaned, encoding="utf-8")
                modified_files += 1
                print(f"  ✓ Cleaned signatures in: {html_path.name}")

    print(f"\n=== SIGNATURE MODERNIZATION COMPLETE ===")
    print(f"Total HTML files modified: {modified_files}")

if __name__ == "__main__":
    main()
