<!-- slide: id1, Úvod, Core, basics -->
## Úvod do proudů (Streams) a rozhraní `io`

V Pythonu jsou textové i binární soubory pouze dvěma konkrétními implementacemi obecnějšího konceptu: **datových proudů (*streams*)**.

Proud je jakýkoliv objekt, který poskytuje standardizované I/O rozhraní pro čtení (`read()`) nebo zápis (`write()`):
- Nemusí jít o fyzický soubor na pevném disku.
- Může jít o **paměťový buffer** (`io.StringIO`, `io.BytesIO`).
- Může jít o **síťový socket** (`socket.makefile()`), rouru procesu (`subprocess.PIPE`), nebo komprimovaný archiv (`gzip`, `zipfile`).

Díky polymorfismu (tzv. *duck typing*) může jakákoliv funkce očekávající "soubor" pracovat s libovolným proudem bez ohledu na to, kde se data fyzicky nacházejí.

---
<!-- slide: id2, „IOBase“ aneb Jedna třída jim všem vládne, Core, paradigm -->
## Základní abstraktní třída `io.IOBase`

Na vrcholu hierarchie všech proudů v modulu `io` stojí abstraktní bázová třída **`io.IOBase`**.

Definuje jednotné rozhraní:
- **Životní cyklus**: `close()`, `closed`, `flush()`
- **Schopnosti proudu**: `readable()`, `writable()`, `seekable()`, `isatty()`
- **Navigace a pozice**: `seek(offset, whence=0)`, `tell()`, `truncate(size=None)`
- **Správce kontextu**: Implementuje dunder metody `__enter__()` a `__exit__()` pro použití v bloku `with`.
- **Iterace po řádcích**: Implementuje `__iter__()` a `__next__()`, což umožňuje přímý průchod `for line in stream:`.

---
<!-- slide: id3, Hierarchie ABC-tříd, Core, newconcept -->
## Tříúrovňová architektura modulu `io` (PEP 3116)

Z `io.IOBase` dědí tři specializované abstraktní třídy:

```mermaid
classDiagram
    direction TB
    class IOBase {
        <<abstract>>
        +close()
        +flush()
        +seek()
        +tell()
    }
    class RawIOBase {
        <<abstract>>
        +read()
        +write()
    }
    class BufferedIOBase {
        <<abstract>>
        +read()
        +write()
        +read1()
    }
    class TextIOBase {
        <<abstract>>
        +read()
        +readline()
        +write()
        +encoding
        +errors
    }
    IOBase <|-- RawIOBase
    IOBase <|-- BufferedIOBase
    IOBase <|-- TextIOBase
```

| ABC Třída | Zpracovávaná data | Popis |
|:---|:---|:---|
| **`RawIOBase`** | Bajty (nízkoúrovňové) | Přímé systémové volání jádra OS (`read(2)`, `write(2)`) bez mezibafru. |
| **`BufferedIOBase`** | Bajty (s vyrovnávací pamětí) | Optimalizovaný binární přístup pracující s bloky paměti v RAM (4–8 KB). |
| **`TextIOBase`** | Znaky `str` (Unicode) | Kódování/dekódování bajtů podle charsetu a unifikace konců řádků. |

---
<!-- slide: id4, Třídy „užitkové“, Skip, basics -->
## Konkrétní užitkové třídy modulu `io`

Zatímco ABC třídy definují rozhraní, v programech pracujeme s jejich konkrétními instancemi:

1. **Souborové proudy (na disku)**:
   - `io.FileIO`: Nízkoúrovňový nebufferovaný binární soubor (dědí z `RawIOBase`).
   - `io.BufferedReader`, `io.BufferedWriter`: Binární proudy s paměťovým bufferem.
   - `io.TextIOWrapper`: Textový proud s kódováním obalující binární buffer.
2. **Paměťové proudy (in-memory)**:
   - `io.StringIO`: Fiktivní textový soubor v paměti RAM.
   - `io.BytesIO`: Fiktivní binární soubor v paměti RAM.

---
<!-- slide: id5, Skutečné „fyzické“ proudy, Core, resyntax -->
## Co ve skutečnosti vrací vestavěná funkce `open()`?

Funkce `open()` funguje jako továrna (*factory function*), která podle zadaného módu sestaví příslušnou vrstvu objektů:

```python
# 1. Textový mód (výchozí):
f_txt = open('data.txt', mode='r', encoding='utf-8')
print(type(f_txt))
# <class '_io.TextIOWrapper'>

# 2. Binární bufferovaný mód:
f_bin = open('data.bin', mode='rb')
print(type(f_bin))
# <class '_io.BufferedReader'>

# 3. Nízkourovňový raw mód bez vyrovnávací paměti (buffering=0):
f_raw = open('data.bin', mode='rb', buffering=0)
print(type(f_raw))
# <class '_io.FileIO'>
```

> [!NOTE]
> `TextIOWrapper` sedí jako adaptér nad `BufferedReader`. Když čtete znaky, wrapper si vyžádá blok bajtů z bafru a dekóduje je. Přístup k podkladovému binárnímu proudu získáte přes atribut `f_txt.buffer`.

---
<!-- slide: id6, Proudy v paměti, WOW, pythonic -->
## Paměťové proudy: `io.StringIO` a `io.BytesIO`

Potřebujete otestovat funkci, která vyžaduje otevřený soubor, aniž byste vytvářeli dočasné soubory na disku? Použijte paměťové proudy:

```python
import io

# 1. io.StringIO: Simulace textového souboru
mem_text = io.StringIO("První řádek\nDruhý řádek\n")
print(mem_text.readline().strip())
# První řádek

mem_text.write("Připsaný text\n")
# Získání celého obsahu paměti jako str:
print(mem_text.getvalue())

# 2. io.BytesIO: Simulace binárního souboru
mem_bin = io.BytesIO(b'\x00\x01\x02\x03\xff')
b = mem_bin.read(2)
print(b)
# b'\x00\x01'
```

Využití:
- Unit testy (mockování souborového I/O bez závislosti na disku).
- Generování PDF reportů nebo obrázků v paměti pro odeslání přes HTTP API.
- Parsování CSV dat přijatých ze síťového socketu.

---
<!-- slide: id7, Binární versus textové proudy, Skip, basics -->
## Rekapitulace: Binární vs. textové proudy

| Vlastnost | `TextIOBase` (`str`) | `BufferedIOBase` (`bytes`) |
|:---|:---|:---|
| **Jednotka dat** | Unicode znaky (`str`) | Surové 8bitové bajty (`bytes`) |
| **Kódování** | Vyžaduje `encoding` (převod bajtů na znaky) | Bez kódování (čistá data) |
| **Konce řádků** | Automatická obousměrná konverze `\r\n` $\to$ `\n` | Žádná konverze |
| **Posun v proudu** | `tell()` vrací neprůhledný cookie, `seek()` omezen | `tell()` i `seek()` pracují s přesnými bajty |
| **In-memory typ** | `io.StringIO` | `io.BytesIO` |

---
<!-- slide: id8, Funkce „open()“ – parametry, Tricky, newconcept -->
## Pokročilé parametry funkce `open()`

Plná signatura funkce `open()`:

```python
open(
    file,
    mode='r',
    buffering=-1,
    encoding=None,
    errors=None,
    newline=None,
    closefd=True,
    opener=None
)
```

Význam pokročilých parametrů:
- `buffering`: `-1` (výchozí velikost systému), `0` (vypnutý buffer, pouze pro binární mód), `1` (řádkový buffer pro text), `> 1` (velikost v bajtech).
- `closefd=False`: Pokud předáte existující celočíselný popisovač (`fileno`), uzavření streamu neuzavře podkladový systémový deskriptor.
- `opener`: Vlastní funkce pro otevření souboru (např. předání dodatečných OS flagů přes `os.open`).

---
<!-- slide: id9, Funkce „open()“ – módy, Core, resyntax -->
## Přehled režimů otevírání proudů

- `'r'`: Čtení (soubor musí existovat).
- `'w'`: Zápis (existující soubor bez varování vymaže).
- `'x'`: Exkluzivní vytvoření pro zápis (pokud existuje, vyvolá `FileExistsError`).
- `'a'`: Připojování na konec souboru (*append*).
- `'b'`: Binární režim (`bytes`).
- `'t'`: Textový režim (`str`, výchozí).
- `'+'`: Otevření pro čtení i zápis zároveň (`'r+'` nepřepisuje, `'w+'` nejprve smaže).

> [!NOTE]
> V případě selhání otevření (např. chybějící soubor nebo nedostatečná oprávnění) vyvolá `open()` potomka výjimky **`OSError`** (`FileNotFoundError`, `PermissionError`).

---
<!-- slide: id10, Další proudy, Skip, basics -->
## Další standardní proudy v Pythonu

Koncept proudů prostupuje celou standardní knihovnou:

- **Standardní proudy procesu**: `sys.stdin`, `sys.stdout`, `sys.stderr` jsou instance `TextIOWrapper`.
- **Komprimované soubory**: `gzip.GzipFile`, `bz2.BZ2File`, `lzma.LZMAFile` implementují rozhraní `BufferedIOBase`.
- **Síťové požadavky**: Odpověď `urllib.request.urlopen()` poskytuje binární proud s metodami `read()` a `readline()`.
- **ZIP archivy**: `ZipFile.open('soubor.txt')` vrací binární proud pro přímé čtení z komprimovaného archivu bez dekomprese na disk.
