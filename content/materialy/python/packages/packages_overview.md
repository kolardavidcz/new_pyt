<!-- slide: id=id1 title="Co je to balíček (package) v Pythonu?" tags="Core" diff="basics" -->
## Co je to balíček (`package`) v Pythonu?

Zatímco **modul** je jediný soubor `.py`, **balíček (`package`)** je adresář obsahující více modulů (případně i vnořených podbalíčků), které tvoří logický celek se společným jmenným prostorem.

Tradičně se balíček pozná podle přítomnosti souboru **`__init__.py`**:

```text
grafika/
├── __init__.py       # Inicializační kód balíčku (může být prázdný)
├── formaty/
│   ├── __init__.py
│   ├── png.py
│   └── jpeg.py
└── filtry/
    ├── __init__.py
    └── rozostreni.py
```

Použití v kódu:
```python
import grafika.formaty.png
# nebo
from grafika.filtry import rozostreni
```

---
<!-- slide: id=id2 title="Relativní versus absolutní importy" tags="Core" diff="pythonic" -->
## Relativní versus absolutní importy uvnitř balíčku

Uvnitř balíčku můžete mezi jednotlivými moduly importovat dvěma způsoby:

1. **Absolutní import (preferováno dle PEP 8)**:
   Uvádí plnou cestu od kořene projektu:
   ```python
   from grafika.formaty.png import nacti_png
   ```

2. **Relativní import (tečková notace)**:
   - Jedna tečka `.` označuje aktuální balíček:
     ```python
     from .jpeg import nacti_jpeg
     ```
   - Dvě tečky `..` označují nadřazený balíček:
     ```python
     from ..formaty.png import nacti_png
     ```

> [!NOTE]
> Relativní importy fungují pouze uvnitř balíčku! Pokud soubor spustíte přímo jako hlavní skript (`python png.py`), relativní import selže s chybou `ImportError: attempted relative import with no known parent package`.

---
<!-- slide: id=id3 title="Spouštění balíčku jako skriptu: __main__.py" tags="WOW" diff="pythonic" -->
## Spouštění balíčku jako skriptu: `__main__.py`

Pokud do kořene balíčku přidáte soubor **`__main__.py`**, můžete celý balíček spustit z příkazové řádky pomocí přepínače **`-m`**:

```text
muj_nastroj/
├── __init__.py
├── __main__.py       # Vstupní bod pro CLI spuštění
└── core.py
```

Obsah `__main__.py`:
```python
# Program: __main__.py
from .core import spust_hlavni_logiku

if __name__ == "__main__":
    spust_hlavni_logiku()
```

Spuštění v terminálu:
```bash
python -m muj_nastroj
```

Tento mechanismus využívají nástroje jako `python -m pip`, `python -m venv` či `python -m unittest`.

---
<!-- slide: id=id4 title="Řízení exportu a proměnná __all__" tags="Core" diff="newconcept" -->
## Řízení exportu a proměnná `__all__`

Když uživatel použije zástupný import `from balicek import *`, Python naimportuje všechna jména, která nezačínají podtržítkem.

Abychom přesně vymezili veřejné rozhraní API balíčku, definujeme v `__init__.py` speciální seznam **`__all__`**:

```python
# Program: grafika/__init__.py
from .formaty.png import nacti_png
from .filtry.rozostreni import rozostri_obrazek

# Pouze tato jména budou exportována při 'from grafika import *'
__all__ = ["nacti_png", "rozostri_obrazek"]
```

Použití `__all__`:
- Čistí jmenný prostor uživatele.
- Skrývá interní importované pomocné moduly.
- Slouží jako dokumentace a nápověda pro statické analyzátory (Mypy, Pyright).

---
<!-- slide: id=id5 title="Namespace balíčky (PEP 420)" tags="Skip" diff="paradigm" -->
## Namespace balíčky (PEP 420) bez `__init__.py`

Od Pythonu 3.3 podporuje interpret tzv. **implicitní jmenné prostory (Implicit Namespace Packages)**:

- Složka balíčku **nemusí** obsahovat soubor `__init__.py`.
- Umožňuje rozdělit jeden společný balíček (např. `firma.autentizace` a `firma.databaze`) do dvou zcela nezávislých repozitářů / distribucí na disku!
- Python při importu spojí všechny složky se stejným názvem nalezené na `sys.path`.

> [!TIP]
> Pro běžné aplikace a knihovny se stále doporučuje soubor `__init__.py` ponechat – explicitně signalizuje balíček a zabraňuje nechtěnému zaměnění s obyčejnými složkami.

---
<!-- slide: id=id6 title="Moderní layout projektu: src-layout" tags="Skip" diff="basics" -->
## Doporučená moderní architektura: `src-layout`

V moderním Pythonu je standardem struktura **`src/` layout**:

```text
moje_knihovna/
├── pyproject.toml         # Konfigurace sestavení a metadata balíčku
├── README.md
├── tests/
│   └── test_core.py
└── src/
    └── moje_knihovna/     # Zdrojový kód balíčku
        ├── __init__.py
        ├── core.py
        └── py.typed       # Indikátor přítomnosti typových anotací (PEP 561)
```

Proč `src/` layout?
- Zabraňuje náhodnému importu nehotového zdrojového kódu místo nainstalovaného balíčku při spuštění testů z kořenové složky.
- Zajišťuje čistou a reprodukovatelnou instalaci přes `pip install -e .` (editable install).
