<!-- slide: id1, Úvod, Core, basics -->
## Modul `os`: Interakce s operačním systémem

Modul **`os`** poskytuje nízkoúrovňové rozhraní pro komunikaci s operačním systémem (souborový systém, procesy, proměnné prostředí, popisovače souborů).

> [!NOTE]
> **Moderní doporučení (Python 3.12+)**:
> - Pro práci se **soubory a cestami** preferujte moderní objektový modul **`pathlib.Path`**.
> - Pro **spouštění externích procesů** používejte modul **`subprocess`** (namísto zastaralého `os.system()`).
> - Modul `os` zůstává klíčový pro čtení **proměnných prostředí** (`os.environ`), řízení pracovního adresáře (`os.chdir()`) a nízkoúrovňové systémové volání.

```python
import os
```

---
<!-- slide: id2, „os“ & „os.path“ – platformně nezávislé cesty, Skip, basics -->
## Řetězcové cesty: Podmodul `os.path`

V historickém kódu byly veškeré cesty reprezentovány jako běžné textové řetězce `str`. Protože Windows používá zpětná lomítka `\` a Unix/macOS dopředná lomítka `/`, poskytuje modul `os.path` funkce pro bezpečné lepení řetězců:

```python
import os

# Platformně závislý oddělovač:
print(os.sep)        # '/' na Linuxu, '\\' na Windows
print(os.pathsep)    # ':' na Linuxu (v PATH), ';' na Windows
print(os.linesep)    # '\n' na Linuxu, '\r\n' na Windows
```

---
<!-- slide: id3, „os.path“ – příprava cesty, Tricky, pythonic -->
## Skládání a dělení cest v `os.path`

```python
import os

# 1. Spojení částí cesty:
cesta = os.path.join("data", "vystupy", "mereni.csv")
print(cesta)  # 'data/vystupy/mereni.csv' (Linux) nebo 'data\\vystupy\\mereni.csv' (Win)

# 2. Rozdělení na adresář a soubor:
adresar, soubor = os.path.split(cesta)
print(adresar)  # 'data/vystupy'
print(soubor)   # 'mereni.csv'

# 3. Rozdělení jména souboru a přípony:
kmen, pripona = os.path.splitext(soubor)
print(kmen)     # 'mereni'
print(pripona)  # '.csv'

# 4. Absolutní a normalizovaná cesta:
print(os.path.abspath("."))
print(os.path.normpath("data/podslozka/../vystupy/./mereni.csv"))
```

> [!CAUTION]
> Pokud v `os.path.join("a", "/b")` začíná druhý argument lomítkem, je vyhodnocen jako kořenová absolutní cesta a první část `"a"` je tiše zahozena!

---
<!-- slide: id4, „os.path“ – informace o cestě, Core, basics -->
## Dotazy na existenci a typ cesty v `os.path`

```python
import os

cesta = "konfigurace.json"

print(os.path.exists(cesta))   # Existuje soubor či složka na disku?
print(os.path.isfile(cesta))   # Je to běžný soubor?
print(os.path.isdir(cesta))    # Je to adresář?
print(os.path.islink(cesta))   # Je to symbolický odkaz?
print(os.path.isabs(cesta))    # Je cesta absolutní?
print(os.path.getsize(cesta))  # Velikost souboru v bajtech (pokud existuje)
```

---
<!-- slide: id5, Aktuální cesta, Skip, basics -->
## Zjištění a změna pracovního adresáře: `getcwd()` a `chdir()`

Každý běžící proces má svůj **aktuální pracovní adresář** (*Current Working Directory*):

```python
import os

# 1. Zjištění aktuálního pracovního adresáře:
puvodni_cwd = os.getcwd()
print(f"Běžíme v: {puvodni_cwd}")

# 2. Změna pracovního adresáře:
os.chdir("..")
print(f"Nový pracovní adresář: {os.getcwd()}")

# Návrat zpět:
os.chdir(puvodni_cwd)
```

> [!WARNING]
> Měnit pracovní adresář pomocí `os.chdir()` v rozsáhlé aplikaci s více vlákny je rizikové, protože pracovní adresář je sdílený pro celý proces. Raději vždy pracujte s absolutními instancemi `Path`.

---
<!-- slide: id6, Adresáře a soubory – výpis, WOW, pythonic -->
## Procházení adresářů: `os.listdir()` vs. moderní `os.scandir()`

Pro vypsání obsahu složky existují dvě funkce:

```python
import os

# 1. Staré os.listdir() -> Vrací pouze seznam řetězců (jmen):
# Pro zjištění typu souboru se musí pro každý prvek volat dodatečný systémový syscall os.path.isdir()!
jmena = os.listdir(".")

# 2. Moderní os.scandir() (doporučeno):
# Vrací iterátor objektů DirEntry, které si nesou metadata přímo z čtení adresáře bez dalších systémových volání:
with os.scandir(".") as it:
    for entry in it:
        if entry.is_file():
            print(f"Soubor: {entry.name} ({entry.stat().st_size} B)")
        elif entry.is_dir():
            print(f"Adresář: {entry.name}/")
```

> [!TIP]
> `os.scandir()` je na velkých adresářích **2× až 10× rychlejší** než kombinace `os.listdir()` + `os.path.is_file()`.

---
<!-- slide: id7, Adresáře a soubory – výroba, Core, pythonic -->
## Tvorba adresářů: `os.mkdir()` vs. `os.makedirs()`

```python
import os

# 1. os.mkdir: Vytvoří POUZE jeden adresář (rodič musí existovat!):
if not os.path.exists("vystupy"):
    os.mkdir("vystupy")

# 2. os.makedirs: Vytvoří celou cestu včetně chybějících rodičů (ekvivalent mkdir -p):
# Parametr exist_ok=True zabrání vyhození FileExistsError, pokud složka již existuje!
os.makedirs("vystupy/2026/reporty", exist_ok=True)
```

---
<!-- slide: id8, Adresáře a soubory – mazání, Skip, basics -->
## Mazání souborů a adresářů

```python
import os

# 1. Smazání jednoho souboru:
if os.path.exists("docasny.tmp"):
    os.remove("docasny.tmp")  # alias: os.unlink()

# 2. Smazání PRÁZDNÉHO adresáře:
# Pokud adresář obsahuje soubory, selže s OSError: Directory not empty!
os.rmdir("prazdna_slozka")

# 3. Rekurzivní smazání prázdných nadřazených složek:
# os.removedirs("vystupy/2026/reporty")
```

---
<!-- slide: id9, Adresáře a soubory – přejmenování, Skip, basics -->
## Přejmenování a atomický přesun: `os.replace()`

```python
import os

# os.replace je atomická operace:
# Pokud cíl již existuje, bude bezpečně nahrazen:
os.replace("stary_nazev.txt", "novy_nazev.txt")
```

> [!NOTE]
> Starší `os.rename()` se na Windows chová odlišně (selže, pokud cíl existuje). V moderním Pythonu vždy preferujte **`os.replace()`**.

---
<!-- slide: id10, Adresáře a soubory – kopírování, Core, pythonic -->
## Kopírování a mazání celých stromů: Modul `shutil`

Modul `os` neobsahuje funkce pro kopírování. K tomu slouží **`shutil`** (*shell utilities*):

```python
import shutil

# 1. Zkopírování souboru včetně metadat a časových razítek:
shutil.copy2("zdroj.txt", "cil.txt")

# 2. Zkopírování celého stromu adresářů:
shutil.copytree("data", "data_zaloha", dirs_exist_ok=True)

# 3. Rekurzivní smazání adresáře i s celým jeho obsahem (POZOR!):
shutil.rmtree("data_zaloha")

# 4. Přesun souboru nebo složky na jiné zařízení:
shutil.move("vystup.csv", "archiv/vystup.csv")
```

---
<!-- slide: id11, „os.walk“ – generování adresářového stromu, WOW, pythonic -->
## Rekurzivní procházení stromu: `os.walk()`

Generátor **`os.walk(top)`** rekurzivně prochází adresářový strom od zadaného kořene dolů. V každém kroku vrací trojici `(root, dirs, files)`:

```python
import os

# Rekurzivní vyhledání a sečtení velikosti všech logů:
celkova_velikost = 0

for root, dirs, files in os.walk("."):
    for file in files:
        if file.endswith(".log"):
            plna_cesta = os.path.join(root, file)
            celkova_velikost += os.path.getsize(plna_cesta)

print(f"Celková velikost logů: {celkova_velikost / 1024:.2f} KB")
```

> [!TIP]
> V Pythonu 3.12+ přibyla metoda přímo na objektu `Path`: **`Path.walk()`**, která vrací objekty `Path` namísto řetězců!

---
<!-- slide: id12, „os.environ“ – proměnné prostředí, Tricky, resyntax -->
## Proměnné prostředí: `os.environ` a `os.getenv()`

Proměnné prostředí (*Environment Variables*) jsou klíčové pro předávání konfigurace, hesel, API klíčů a cest k databázím:

```python
import os

# 1. Čtení proměnné prostředí s výchozí hodnotou (doporučeno):
databaze_url = os.getenv("DATABASE_URL", "sqlite:///default.db")
debug_mode = os.getenv("DEBUG", "False").lower() == "true"

# 2. Čtení přes slovník os.environ:
# Pokud proměnná neexistuje, vyvolá KeyError!
try:
    api_klic = os.environ["GEMINI_API_KEY"]
except KeyError:
    print("Proměnná GEMINI_API_KEY není nastavena!")

# 3. Zápis proměnné prostředí (platí pouze pro aktuální proces a jeho potomky):
os.environ["MOJE_APLIKACE_ENV"] = "production"
```

---
<!-- slide: id13, Bezpečnostní poznámka, Tricky, paradigm -->
## Zásada EAFP vs. LBYL a souběhové chyby (TOCTOU)

V jazycích C/Java se často kontrolují práva před otevřením souboru (*Look Before You Leap* — LBYL):
```python
# ŠPATNĚ: Náchylné k souběhové chybě (Time-of-Check to Time-of-Use):
if os.path.exists("tajne.txt") and os.access("tajne.txt", os.R_OK):
    # Mezi kontrolou a otevřením může jiný proces soubor smazat nebo změnit práva!
    with open("tajne.txt") as f:
        data = f.read()
```

V Pythonu preferujeme filozofii **EAFP** (*Easier to Ask for Forgiveness than Permission*):

```python
# SPRÁVNĚ (Pythonic EAFP):
try:
    with open("tajne.txt", encoding="utf-8") as f:
        data = f.read()
except FileNotFoundError:
    print("Soubor neexistuje.")
except PermissionError:
    print("Chybí oprávnění k přístupu.")
```

---
<!-- slide: id14, Závěrečné poznámka, Skip, basics -->
## Shrnutí: Modul `os` v moderním vývoji

- **Pro cesty**: Používejte moderní objektový modul **`pathlib.Path`**.
- **Pro kopírování a stromové operace**: Používejte modul **`shutil`**.
- **Pro externí programy**: Používejte modul **`subprocess`** s `subprocess.run()`.
- **Pro konfiguraci a prostředí**: Používejte **`os.environ`** a **`os.getenv()`**.
- **Pro přístup k souborům**: Držte se idiomu **EAFP** a ošetřujte výjimky `OSError` (`FileNotFoundError`, `PermissionError`).
