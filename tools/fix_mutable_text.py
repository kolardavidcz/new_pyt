#!/usr/bin/env python3
"""Fix misleading 'mutable pass by reference, immutable pass by value' text in course slides.

In Python, all variables and parameters are passed by object reference (pass-by-assignment).
This script updates lecture-pages.json and public copies with technically accurate,
pedagogically clear explanations of Python's object model and mutability.
"""

from __future__ import annotations
import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

SLIDE_1765_NEW = """<div class="section-body">
  
  <p>
    V Pythonu jsou <b>všechny proměnné a argumenty předávány odkazem na objekt</b> (<i>pass-by-object-reference</i> / <i>pass-by-assignment</i>). Rozdíl v chování závisí na <b>mutabilitě objektu</b>:
  </p>
  <ul>
    <li><b>Proměnné (<i>mutable</i>) typy</b> (seznam, slovník, množina) umožňují modifikaci objektu přímo v paměti — změna přes jedno jméno se projeví u všech odkazů na tentýž objekt.</li>
    <li><b>Neproměnné (<i>immutable</i>) typy</b> (číslo, řetězec, n-tice) nelze měnit na místě — přiřazení nového výrazu pouze sváže proměnnou s jiným objektem.</li>
  </ul>
  <pre class="brush: python; gutter: false; toolbar: false; ">
>>> xs = ['a', 'h', 'o', 'j']
>>> ys = xs   # ys odkazuje na stejný seznam v paměti
>>> ys
['a', 'h', 'o', 'j']

>>> xs.remove('o')   # modifikace objektu na místě
>>> xs
['a', 'h', 'j']
>>> ys   # modifikace se projevuje i přes ys!
['a', 'h', 'j']
  </pre>
  <div class="note-item"><span class="note-icon">📝</span><div class="note-content">
    Na začátku si na tom asi párkrát nabijete nos, ale časem na tuhle nakonec celkem logickou vlastnost (zvanou <em>předávání odkazem na objekt / objektovou vazbou</em>) zvyknete.
  </div></div>

</div>"""

SLIDE_4265_NEW = """<div class="section-body">

  <p>
    Předávání parametrů do funkcí v Pythonu funguje výhradně jako <b>předávání odkazem na objekt</b> (<i>pass-by-object-reference</i>).
  </p>
  <ul>
    <li>Pokud v těle funkce modifikujete vnitřní prvek <b>proměnného (<i>mutable</i>)</b> objektu (např. <code>y[0] = hodnota</code> nebo <code>y.append(...)</code>), měníte přímo původní objekt v paměti volajícího.</li>
    <li>Pokud do parametru přímo přiřadíte nový výraz (<code>y = nová_hodnota</code>), pouze přenasměrujete lokální jméno parametru <code>y</code> na nový objekt v paměti. Původní objekt volajícího zůstane zcela nedotčen.</li>
  </ul>
  <div class="note-item"><span class="note-icon">📝</span><div class="note-content">
    Přiřazovací příkaz (<code>y = ...</code>) v Pythonu nikdy nepřepisuje paměť původního objektu — pouze vytváří novou vazbu lokálního jména v dané funkci.
  </div></div>
  <p>
    Na dalších slajdech si tento mechanismus předávání objektem ukážeme na konkrétních ukázkách.
  </p>

</div>"""

SLIDE_9437_NEW = """<div class="section-body">

    <p>
        Naprosto základní věcí, se kterou se musí každý uživatel Pythonu sžít, je:
    </p>
    <blockquote style="border-left: 4px solid var(--accent); padding-left: 12px; margin: 12px 0;">
        V Pythonu se <b>všechny proměnné a argumenty předávají odkazem na objekt</b> (<i>pass-by-object-reference</i> / <i>pass-by-assignment</i>)!
    </blockquote>
    <p>
        Mylná představa, že <i>„neproměnné typy se předávají hodnotou a proměnné odkazem“</i>, pochází z jazyků C/Java. V Pythonu jsou i čísla a řetězce objekty předávané odkazem. Rozdíl je výhradně v <b>mutabilitě samotného objektu</b>:
    </p>
    <ul>
        <li>U <b>proměnných (<i>mutable</i>) typů</b> upravujeme sdílenou instanci přímo na místě.</li>
        <li>U <b>neproměnných (<i>immutable</i>) typů</b> nelze stav změnit — přiřazení (<code>x = nová_hodnota</code>) pouze přenasměruje odkaz proměnné na jiný objekt.</li>
    </ul>
    <p>
        Pro vysvětlení porovnejme kódy na následujících dvou slajdech.
    </p>

</div>"""


def update_lecture_pages(file_path: Path):
    if not file_path.is_file():
        return
    print(f"Processing {file_path.relative_to(ROOT)}...")
    data = json.loads(file_path.read_text(encoding="utf-8"))
    modified_count = 0

    for path, pages in data.items():
        for page in pages:
            if not isinstance(page, dict):
                continue
            content = page.get("content", "")
            title = page.get("title", "")

            # Match slide 1765 (Přiřazení – proměnné a neproměnné typy)
            if "Proměnné (<i>mutable</i>) typy jsou v Python'u předávány odkazem" in content or "Proměnné (<i>mutable</i>) typy jsou v Pythonu předávány odkazem" in content:
                if title == "Přiřazení – proměnné a neproměnné typy":
                    page["content"] = SLIDE_1765_NEW
                    modified_count += 1
                elif title == "Přiřazení (či spíše „pojmenovávání“)":
                    page["content"] = SLIDE_9437_NEW
                    modified_count += 1
                else:
                    page["content"] = SLIDE_1765_NEW
                    modified_count += 1

            # Match slide 4265 (Předávání parametrů do funkcí)
            elif "Předávání parametrů do funkcí není v Python'u tak jednoduché" in content or "Předávání parametrů do funkcí není v Pythonu tak jednoduché" in content:
                page["content"] = SLIDE_4265_NEW
                modified_count += 1

            # Clean up Python'u -> Pythonu in prose
            if "Python'u" in page.get("content", ""):
                page["content"] = page["content"].replace("Python'u", "Pythonu")
                modified_count += 1
            if "Python'u" in page.get("title", ""):
                page["title"] = page["title"].replace("Python'u", "Pythonu")

    file_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  -> Updated {modified_count} slide entries in {file_path.name}")


def main():
    lp1 = ROOT / "data" / "source_reference" / "lecture-pages.json"
    lp2 = ROOT / "public" / "data" / "source_reference" / "lecture-pages.json"

    update_lecture_pages(lp1)
    if lp2.exists():
        update_lecture_pages(lp2)

    print("Done updating slide texts.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
