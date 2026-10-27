<!-- slide: id1, Úvod do modulů a balíčků, Core, basics -->
## Moduly a balíčky v Pythonu

Jakmile projekt přesáhne desítky řádků kódu, je nezbytné rozdělit jej do samostatných souborů a logických celků:

- **Modul (`Module`)**: Každý jednotlivý soubor s příponou `.py` je v Pythonu modulem. Představuje izolovaný jmenný prostor (*namespace*).
- **Balíček (`Package`)**: Adresář obsahující moduly a případně další podadresáře (podbalíčky). Umožňuje hierarchickou organizaci rozsáhlých knihoven.

```python
# Import standardních i vlastních modulů:
import math
from pathlib import Path
from collections.abc import Iterable
```

---
<!-- slide: id2, Životní cyklus importu a sys.modules, Core, newconcept -->
## Jak funguje import: Vykonání a mezipaměť `sys.modules`

Když poprvé zavoláte `import muj_modul`:
1. Interpret vyhledá soubor na disku (podle seznamu `sys.path`).
2. Zkompiluje jej do bajtkódu (vytvoří `.pyc` v `__pycache__`).
3. **Vykoná veškerý kód na nejvyšší úrovni modulu** (vytvoří se funkce, třídy a proměnné).
4. Uloží výsledný objekt modulu do mezipaměti **`sys.modules["muj_modul"]`**.

```python
import sys

# Při dalším volání se kód modulu NEOPAKUJE, pouze se vrátí z mezipaměti:
import math
print("math" in sys.modules)  # True
```

> [!TIP] Znovunačtení modulu za běhu
> Pokud potřebujete modul přenačíst bez restartu procesu (např. v REPL či testovacím serveru), slouží funkce `importlib.reload(modul)` z modulu `importlib`.

---
<!-- slide: id3, Formy příkazu import a doporučení PEP 8, Core, basics -->
## Čtyři formy příkazu `import`

Python nabízí čtyři způsoby importování objektů:

```python
# 1. Import celého modulu pod jeho názvem (nejbezpečnější, chrání jmenný prostor)
import math
print(math.sqrt(16))

# 2. Import s aliasem (běžné u populárních vědeckých knihoven)
import numpy as np
import pandas as pd

# 3. Přímý import konkrétních objektů do lokálního kontextu
from math import pi, sin
print(sin(pi / 2))

# 4. Přímý import s přejmenováním (řeší kolize názvů)
from math import sqrt as odmocnina
```

### Konvence PEP 8 pro organizaci importů:
Importy pište vždy na začátek souboru, rozdělené prázdným řádkem do 3 bloků:
1. **Standardní knihovna Pythonu** (`sys`, `os`, `math`, `pathlib`).
2. **Nainstalované balíčky 3. stran** (`requests`, `pydantic`, `fastapi`).
3. **Lokální moduly vašeho projektu** (`from .database import get_db`).

---
<!-- slide: id4, Hvězdičkový import (import *) a proměnná __all__, Tricky, pythonic -->
## Hvězdičkový import a veřejné API modulu: `__all__`

Zápis `from modul import *` naimportuje všechna jména z modulu přímo do vašeho aktuálního jmenného prostoru:

```python
# ❌ NEBEZPEČNÝ ANTIPATTERN v produkčním kódu:
from math import *
```

### Proč je `import *` škodlivý?
1. **Znečištění jmenného prostoru**: Ztratíte přehled o tom, odkud která funkce pochází.
2. **Skryté zastínění**: Pokud modul exportuje funkci `open`, zastíní vestavěnou funkci `open()`.

### Definice veřejného API pomocí `__all__`:
Autor modulu může explicitně určit, co se při hvězdičkovém importu exportuje, definicí seznamu řetězců **`__all__`**:

```python
# V souboru kalkulacka.py:
__all__ = ["secti", "vynasob"]  # Pouze tyto 2 funkce budou exportovány

def secti(a: int, b: int) -> int: return a + b
def vynasob(a: int, b: int) -> int: return a * b
def _interni_pomocnik(): pass   # Zůstane skryto
```

---
<!-- slide: id5, Pravidla pro pojmenování souborů a modulů, Skip, basics -->
## Pravidla pro pojmenování souborů modulů

Název souboru modulu musí být **validním identifikátorem v Pythonu**:
- Používejte malá písmena anglické abecedy, případně oddělená podtržítkem (`snake_case`): `muj_modul.py`, `databaze_klient.py`.
- **Vyvarujte se pomlček** (`muj-modul.py` nelze naimportovat, protože pomlčka je operátor minus!).
- **Nezačínejte číslem** (`1_pokus.py` nelze naimportovat příkazem `import`).

---
<!-- slide: id6, Kde Python hledá moduly: sys.path, Core, basics -->
## Vyhledávání modulů a proměnná `sys.path`

Když zavoláte `import foo`, Python hledá soubor `foo.py` v adresářích vyjmenovaných v seznamu **`sys.path`**:

```python
import sys
for index, cesta in enumerate(sys.path):
    print(f"{index}: {cesta}")
```

`sys.path` je standardní pythoní seznam řetězců (cest), který lze za běhu číst i upravovat.

---
<!-- slide: id7, Pořadí prohledávání a nebezpečí zastínění knihoven, Tricky, newconcept -->
## Pořadí prohledávání v `sys.path` a past se stíněním

Adresáře v `sys.path` jsou prohledávány **shora dolů** v tomto pořadí:

1. **Adresář spouštěného skriptu** (nebo aktuální pracovní adresář `""` v REPL).
2. **Proměnná prostředí `PYTHONPATH`** (pokud je v systému nastavena).
3. **Standardní knihovna Pythonu** (např. `/usr/lib/python3.12`).
4. **Adresáře balíčků třetích stran** (`site-packages` ve vašem virtuálním prostředí `.venv`).

> [!CAUTION] Past na náhodné zastínění (Shadowing Trap)!
> Protože aktuální adresář je na **prvním místě**, pokud svůj cvičný soubor pojmenujete `math.py`, `random.py` nebo `email.py`:
> ```python
> # Pokud v adresáři existuje soubor random.py:
> import random  # ❌ Naimportuje váš lokální soubor místo standardní knihovny!
> random.randint(1, 6)  # AttributeError: module 'random' has no attribute 'randint'
> ```

---
<!-- slide: id8, Programové úpravy sys.path a moderní alternativa, Core, newconcept -->
## Úprava `sys.path` vs. instalace balíčku

Pokud potřebujete načíst modul z nadřazené či vedlejší složky:

```python
import sys
from pathlib import Path

# Přidání kořenového adresáře projektu do sys.path:
KOŘEN = Path(__file__).resolve().parent.parent
if str(KOŘEN) not in sys.path:
    sys.path.append(str(KOŘEN))
```

> [!TIP] Profesionální standard: Editable Install
> V produkčních projektech se manuální úpravy `sys.path` nepoužívají. Místo toho se projekt nakonfiguruje pomocí `pyproject.toml` a nainstaluje do virtuálního prostředí v editačním módu:
> ```bash
> pip install -e .
> ```
> Poté všechny importy fungují absolutně a čistě bez ohledu na to, odkud skript spouštíte.

---
<!-- slide: id9, Bajtkód a složka __pycache__ (.pyc), Skip, basics -->
## Bajtkód a mezipaměť `__pycache__`

Při importu modulu Python automaticky vytvoří zkompilovanou binární reprezentaci v podadresáři **`__pycache__`**:
`__pycache__/muj_modul.cpython-312.pyc`

- **K čemu slouží?** Urychluje start programu při dalším spuštění (odpadá nutnost znovu parsovat textový zdrojový kód).
- **Jak Python pozná změnu?** Porovnává časové razítko (*timestamp*) a velikost `.py` souboru s hlavičkou v `.pyc`. Pokud jste zdroják změnili, automaticky jej překompiluje.
- Složku `__pycache__/` a soubory `*.pyc` **vždy přidávejte do `.gitignore`**!

---
<!-- slide: id10, Rozlišení skriptu a modulu: proměnná __name__, Core, newconcept -->
## Proměnná `__name__`: Skript vs. importovaný modul

Každý modul má v Pythonu magickou proměnnou **`__name__`**, jejíž hodnota závisí na způsobu spuštění:

- Pokud je soubor spuštěn přímo z příkazové řádky (`python main.py`):
  `__name__ == "__main__"`
- Pokud je soubor naimportován jiným skriptem (`import muj_modul`):
  `__name__ == "muj_modul"` (název modulu v tečkové hierarchii).

---
<!-- slide: id11, Vstupní bod programu: Idiom if __name__ == '__main__':, WOW, pythonic -->
## Vstupní bod programu (*Main Idiom*)

Každý spustitelný pythoní skript by měl mít výkonný kód zapouzdřen do funkce a chráněn podmínkou `__name__ == "__main__"`:

```python
def spocitej_faktorial(n: int) -> int:
    """Tuto funkci lze bezpečně importovat do jiných skriptů."""
    return 1 if n <= 1 else n * spocitej_faktorial(n - 1)

def main() -> None:
    """Vstupní bod spuštěný pouze při přímém volání z terminálu."""
    import sys
    cislo = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    print(f"Faktoriál {cislo} = {spocitej_faktorial(cislo)}")

if __name__ == "__main__":
    main()
```

Díky tomu může soubor sloužit současně jako **knihovna k importu** i jako **spustitelný skript**.

---
<!-- slide: id12, Kruhový import (Circular Imports), Tricky, newconcept -->
## Kruhové závislosti (*Circular Imports*)

Pokud modul `A` importuje modul `B` a modul `B` importuje modul `A`, může dojít k havárii `ImportError: cannot import name ...`:

```text
a.py -> import b
b.py -> from a import moje_funkce (Selže, protože a.py se ještě nedočetl k definici moje_funkce!)
```

### Jak kruhové importy řešit:
1. **Oddělení společného kódu**: Společné datové modely a funkce přesuňte do třetího modulu `common.py` nebo `types.py`.
2. **Odložený import**: Importujte modul až uvnitř těla konkrétní funkce, která jej potřebuje.
3. **Typové importy pro analýzu**:
   ```python
   from typing import TYPE_CHECKING
   if TYPE_CHECKING:
       from modul_b import KomplexniTyp  # Vyhodnocuje pouze mypy, runtime to ignoruje!
   ```

---
<!-- slide: id13, Zásady pro čisté importy a PEP 8, Skip, basics -->
## Pravidla čistých importů

- **Nikdy neimportujte více modulů na jednom řádku**:
  - ❌ `import os, sys, math`
  - ✅ `import os\nimport sys\nimport math`
- **Při importu konkrétních položek je více názvů v pořádku**:
  - ✅ `from math import sin, cos, tan`
- **Vyvarujte se cyklů a obřích monolityckých `__init__.py`**.

---
<!-- slide: id14, Zjištění umístění modulu: proměnná __file__, Core, basics -->
## Zjištění umístění modulu na disku: `__file__`

Atribut `__file__` obsahuje absolutní nebo relativní cestu k načtenému souboru na disku:

```python
import json
from pathlib import Path

print(json.__file__)
# Např. /usr/lib/python3.12/json/__init__.py

# Získání adresáře aktuálního modulu pomocí moderního pathlib:
AKTUALNI_SLOZKA = Path(__file__).resolve().parent
```

> [!NOTE]
> C-rozšíření vestavěná přímo do binárky interpretu (jako `sys` nebo `builtins`) atribut `__file__` nemají.

---
<!-- slide: id15, Balíčky (Packages) a hierarchie složek, Core, basics -->
## Balíčky (*Packages*): Adresářová hierarchie

Balíček je adresář na disku, který sdružuje související moduly a podbalíčky do stromové hierarchie:

```text
muj_balik/
├── __init__.py           # Inicializace kořenového balíčku
├── jadro.py              # Modul muj_balik.jadro
├── sit/                  # Podbalíček muj_balik.sit
│   ├── __init__.py
│   ├── klient.py         # Modul muj_balik.sit.klient
│   └── protokol.py
└── nastroje/             # Podbalíček muj_balik.nastroje
    ├── __init__.py
    └── formatovani.py
```

---
<!-- slide: id16, Běžné balíčky vs. Namespace balíčky (PEP 420), Skip, basics -->
## Běžné balíčky vs. Namespace balíčky (PEP 420)

V Pythonu rozlišujeme dva druhy balíčků:

1. **Běžný balíček (*Regular Package*)**:
   - Obsahuje soubor **`__init__.py`**.
   - Všechny soubory balíčku leží v jediném konkrétním adresáři.
2. **Jmenný prostor (*Namespace Package*, PEP 420, Python 3.3+)**:
   - **Neobsahuje** soubor `__init__.py`.
   - Umožňuje rozdělit jeden logický balíček do více různých repozitářů a složek na disku (např. balíčky `azure-core`, `azure-storage` sdílejí společný jmenný prostor `azure.*`).

---
<!-- slide: id17, Příklad struktury multimediálního balíčku, Core, basics -->
## Příklad: Struktura balíčku `sound`

```text
sound/                          # Hlavní balíček
    __init__.py                 # Inicializace balíčku sound
    formats/                    # Podbalíček pro audio formáty
        __init__.py
        wavread.py
        wavwrite.py
    effects/                    # Podbalíček pro efekty
        __init__.py
        echo.py
        surround.py
    filters/                    # Podbalíček pro frekvenční filtry
        __init__.py
        equalizer.py
```

---
<!-- slide: id18, Absolutní vs. relativní importy uvnitř balíčku, Core, pythonic -->
## Absolutní vs. relativní importy v balíčku

Pokud se nacházíme uvnitř balíčku (např. v souboru `sound/effects/echo.py`), můžeme ostatní moduly načíst dvěma způsoby:

### 1. Absolutní import (doporučeno PEP 8 pro čitelnost):
```python
# Úplná cesta od kořene projektu:
from sound.formats import wavread
from sound.filters.equalizer import aplikuj_filtr
```

### 2. Explicitní relativní import (pomocí teček):
- Jedna tečka `.` značí **aktuální balíček** (`sound.effects`).
- Dvě tečky `..` značí **nadřazený balíček** (`sound`).

```python
from . import surround          # ze stejné složky sound/effects/
from ..formats import wavread   # z vedlejší složky sound/formats/
from ..filters import equalizer # z vedlejší složky sound/filters/
```

---
<!-- slide: id19, Úloha souboru __init__.py, Core, basics -->
## Úloha a význam souboru `__init__.py`

Soubor `__init__.py` se vykoná **při prvním importu balíčku**:

1. **Označení balíčku**: Pro CPython slouží jako jednoznačný signál, že daný adresář je regulérním Python balíčkem.
2. **Inicializace stavu**: Může nastavit sdílené konfigurace balíčku.
3. **Vystavení veřejného API (*Facade Pattern*)**: Uživatel nemusí pátrat v hlubokých podmodulech, ale naimportuje klíčové třídy přímo z kořene balíčku.

---
<!-- slide: id20, Export fasády z __init__.py, WOW, pythonic -->
## Zpříjemnění importů pomocí `__init__.py`

Bez fasády v `__init__.py` musí uživatel psát dlouhé cesty:
```python
from muj_balik.databaze.modely.uzivatel import Uzivatel  # ❌ Zdlouhavé
```

Pokud v souboru `muj_balik/__init__.py` provedeme re-export:
```python
# muj_balik/__init__.py:
from .databaze.modely.uzivatel import Uzivatel
from .jadro import Spustitel

__all__ = ["Uzivatel", "Spustitel"]
```

Uživatel vaší knihovny pak může psát čistý a profesionální kód:
```python
from muj_balik import Uzivatel, Spustitel  # ✅ Krátké a elegantní!
```

---
<!-- slide: id21, Spouštění modulů z balíčků: Přepínač python -m, Tricky, newconcept -->
## Spouštění modulů z terminálu: Přepínač `python -m` (PEP 338)

Pokud se pokusíte spustit soubor uvnitř balíčku přímo jeho cestou:
```bash
python sound/effects/echo.py
# ❌ ImportError: attempted relative import with no known parent package
```

### Proč přímé volání selže?
Při spuštění `python cesta/soubor.py` se do `sys.path[0]` vloží složka `sound/effects/`. Python netuší, že soubor patří do nějakého nadřazeného balíčku `sound`, a relativní importy zhavarují.

### ✅ Správné volání pomocí přepínače `-m` (*Module execution*):
Postavte se do kořenového adresáře projektu a spusťte modul v jeho plném kontextu:
```bash
python -m sound.effects.echo
```

---
<!-- slide: id22, Správa mezipaměti bajtkódu (PYTHONPYCACHEPREFIX), Skip, basics -->
## Přesměrování `__pycache__`

Pokud nechcete mít složky `__pycache__` rozeseté po celém zdrojovém stromu projektu, můžete nastavit systémovou proměnnou prostředí:

```bash
export PYTHONPYCACHEPREFIX="$HOME/.cache/cpython/"
```

CPython pak veškerý zkompilovaný bajtkód ukládá do centralizované systémové složky, což udržuje zdrojové repozitáře čisté.

---
<!-- slide: id23, Namespace balíčky (PEP 420) v enterprise architektuře, Skip, newconcept -->
## Namespace balíčky (PEP 420) v praxi

Namespace balíčky umožňují nezávislým vývojovým týmům publikovat samostatné pip balíčky pod stejným zastřešujícím jménem:

- Tým A vyvíjí repozitář: `acme-auth/acme/auth/`
- Tým B vyvíjí repozitář: `acme-billing/acme/billing/`

Ani jedna složka `acme/` neobsahuje `__init__.py`. Po instalaci obou balíčků přes pip může uživatel psát:
```python
import acme.auth
import acme.billing
```

---
<!-- slide: id24, Priorita balíčků při vyhledávání, Skip, newconcept -->
## Priorita: Běžný balíček vs. Namespace balíček

Pokud se na disku vyskytnou kolize jmen:
1. **Regulérní balíček s `__init__.py` má vždy přednost** před namespace balíčkem stejného jména.
2. Jakmile interpret narazí na složku s `__init__.py`, okamžitě zastaví další prohledávání cesty a načte ji.

---
<!-- slide: id25, Příklad rozložení Namespace balíčků, Skip, newconcept -->
## Schéma rozložení Namespace balíčku

```text
/opt/plugins/repo1/
    company/               (žádný __init__.py!)
        analytics.py
/opt/plugins/repo2/
    company/               (žádný __init__.py!)
        reporting.py
```

Pokud jsou obě cesty v `sys.path`, Python je virtuálně spojí do jediného balíčku `company`.

---
<!-- slide: id26, Spustitelný balíček: Soubor __main__.py, Core, pythonic -->
## Spustitelný balíček: Soubor `__main__.py`

Pokud do kořenového adresáře balíčku umístíte soubor s názvem **`__main__.py`**, celý balíček se stane spustitelným z příkazové řádky:

```bash
python -m muj_balik
```

Interpret automaticky vyhledá `muj_balik/__main__.py` a spustí jej. Tímto způsobem fungují populární nástroje jako `python -m pip`, `python -m venv`, `python -m http.server` či `python -m pytest`.

---
<!-- slide: id27, Příklad implementace __main__.py, WOW, pythonic -->
## Příklad implementace `__main__.py`

```text
kalkulacka/
├── __init__.py
├── __main__.py      # Vstupní bod pro CLI
└── operace.py
```

Obsah souboru `kalkulacka/__main__.py`:
```python
import sys
from .operace import secti

def cli_entrypoint() -> None:
    if len(sys.argv) < 3:
        print("Použití: python -m kalkulacka <cislo1> <cislo2>")
        sys.exit(1)
    a, b = int(sys.argv[1]), int(sys.argv[2])
    print(f"Výsledek: {secti(a, b)}")

if __name__ == "__main__":
    cli_entrypoint()
```

---
<!-- slide: id28, Balíčky zabalené do ZIPu: zipapp (.pyz, PEP 441), Skip, newconcept -->
## Balení do jediného souboru: `zipapp` (PEP 441)

Python umí přímo spouštět celé aplikace zabalené do jediného ZIP archivu se souborem `__main__.py`:

```bash
# Vytvoření spustitelného archivu celého projektu pomocí standardního modulu zipapp:
python -m zipapp kalkulacka -o kalkulacka.pyz -p "/usr/bin/env python3"

# Spuštění aplikace jako jednoho souboru:
python kalkulacka.pyz 10 20
# nebo přímo na Linuxu/macOS díky shebangu:
./kalkulacka.pyz 10 20
```

---
<!-- slide: id29, Profilování rychlosti importů (-X importtime), Skip, basics -->
## Diagnostika a profilování importů

Pokud aplikace startuje pomalu, často za tím stojí těžké importy modulů 3. stran.

Python nabízí vestavěný diagnostický přepínač:
```bash
python -X importtime moje_app.py
```

Interpret vypíše přesný strom načítaných modulů s časem v mikrosekundách, takže snadno odhalíte problematické závislosti.

---
<!-- slide: id30, Introspekce modulu: Funkce dir(), Core, basics -->
## Introspekce modulu: Funkce `dir()`

Vestavěná funkce `dir(modul)` vrátí seřazený seznam všech atributů, funkcí a tříd dostupných v daném modulu:

```python
import math

# Získání seznamu všech veřejných funkcí v modulu math:
verejne = [nazev for nazev in dir(math) if not nazev.startswith("_")]
print(verejne[:5])
# ['acos', 'acosh', 'asin', 'asinh', 'atan']
```

---
<!-- slide: id31, Dynamické načítání atributů modulu: getattr(), Core, pythonic -->
## Dynamický přístup k objektům modulu: `getattr()`

Pokud potřebujete zavolat funkci z modulu, jejíž název znáte až za běhu programu jako řetězec:

```python
import math

nazev_funkce = "sqrt"
argument = 25.0

# Dynamické vytažení funkce z modulu podle jejího textového názvu:
funkce = getattr(math, nazev_funkce)
vysledek = funkce(argument)
print(vysledek)  # 5.0
```

> [!TIP] Zabezpečení s výchozí hodnotou
> Pokud funkce v modulu nemusí existovat, předejte třetí argument:
> `getattr(math, "neznama", None)` vrátí `None` namísto vyhození výjimky `AttributeError`.
