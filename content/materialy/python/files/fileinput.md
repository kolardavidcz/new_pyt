<!-- slide: id1, Úvod, Core, pythonic -->
## Zpracování vícenásobných vstupů: Modul `fileinput`

Zatímco funkce `open()` otevírá právě jeden soubor, modul **`fileinput`** je navržen pro snadné psaní unixových filtrů a CLI nástrojů (podobně jako `sed`, `awk` nebo `grep`), které zpracovávají:
- **Sekvenci více souborů** předaných na příkazové řádce (`sys.argv[1:]`).
- **Standardní vstup (`sys.stdin`)**, pokud žádné soubory na příkazové řádce zadány nejsou (při předání rourou přes *pipe*).
- Čtení komprimovaných souborů (`.gz`, `.bz2`).
- **In-place editaci souborů** na disku (se zálohou nebo bez).

```python
import fileinput

# Jediná smyčka projde všechny soubory z příkazové řádky (nebo stdin):
with fileinput.input(encoding="utf-8") as f:
    for line in f:
        print(line, end="")
```

---
<!-- slide: id2, Základní použití, Core, pythonic -->
## Základní použití v CLI skriptech

Typický unixový filtr v Pythonu:

```python
import fileinput

# Použití jako správce kontextu (context manager):
with fileinput.input(encoding="utf-8") as f:
    for line in f:
        # Zjištění kontextových informací o aktuálním řádku:
        if f.isfirstline():
            print(f"\n--- Začátek souboru: {f.filename()} ---")
        
        # line obsahuje i koncový znak \n
        print(f"[{f.filelineno()}] {line.strip()}")
```

Spuštění v terminálu:
```bash
# 1. Čtení z více souborů za sebou:
python skript.py data1.txt data2.txt

# 2. Čtení z roury (standardní vstup sys.stdin):
cat data1.txt | python skript.py
```

---
<!-- slide: id3, Plný konstruktor, Tricky, pythonic -->
## Parametry funkce `fileinput.input()`

Plná signatura v moderním Pythonu (3.10+):

```python
fileinput.input(
    files=None,
    inplace=False,
    backup="",
    mode="r",
    openhook=None,
    encoding="utf-8",
    errors=None
)
```

- **`files`**: seznam nebo n-tice souborů k otevření (výchozí `None` vezme `sys.argv[1:]`).
- **`inplace=True`**: **přesměruje `sys.stdout` do právě otevřeného souboru**! Každé volání `print()` tak přepisuje aktuální soubor.
- **`backup=".bak"`**: přípona pro záložní kopii původního souboru při `inplace=True`.
- **`encoding="utf-8"`** (od Pythonu 3.10): explicitní specifikace kódování textu.

### Příklad in-place náhrady textu v souborech:
```python
import fileinput

# Přepíše 'localhost' na '127.0.0.1' přímo v souborech a vytvoří zálohy .bak:
with fileinput.input(files=["config.cfg"], inplace=True, backup=".bak", encoding="utf-8") as f:
    for line in f:
        print(line.replace("localhost", "127.0.0.1"), end="")
```

---
<!-- slide: id4, Parametr „openhook“, Skip, newconcept -->
## Podpora komprese: `hook_compressed`

Parametr `openhook` umožňuje vložit funkci pro otevření netradičních souborů:

```python
import fileinput

# Automatická dekomprese souborů .gz a .bz2 za běhu:
with fileinput.input(
    files=["archiv1.log.gz", "archiv2.log.bz2"],
    openhook=fileinput.hook_compressed,
    encoding="utf-8"
) as f:
    for line in f:
        if "CRITICAL" in line:
            print(f"{f.filename()}:{f.filelineno()} {line.strip()}")
```

> [!NOTE]
> Vlastní `openhook` je libovolná funkce se signaturou `hook(filename, mode, encoding=None, errors=None)`, která vrátí otevřený souborový proud.

---
<!-- slide: id5, Funkce kontextu, Skip, basics -->
## Metody a stavové funkce objektu `fileinput`

Při iteraci přes soubory máme k dispozici přehled o aktuálním stavu:

| Funkce | Návratová hodnota |
| :--- | :--- |
| **`f.filename()`** | Název aktuálně otevřeného souboru (nebo `'<stdin>'`) |
| **`f.fileno()`** | Celočíselný deskriptor aktuálního souboru v OS |
| **`f.filelineno()`** | Číslo řádku v **rámci aktuálního souboru** (resetuje se na 1 pro každý nový soubor) |
| **`f.lineno()`** | Kumulativní číslo řádku **přes všechny soubory** dohromady |
| **`f.isfirstline()`** | `True`, pokud je načtený řádek prvním řádkem nového souboru |
| **`f.isstdin()`** | `True`, pokud čteme ze standardního vstupu `sys.stdin` |
| **`f.nextfile()`** | Předčasně uzavře aktuální soubor a skočí na další v pořadí |
