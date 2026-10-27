<!-- slide: id1, Úvod, Already Studied, basics -->
## Úvod do textových souborů: Správce kontextu `with open()`

Pro bezpečnou práci se soubory v Pythonu vždy používáme kontextový manažer **`with open()`**:

```python
with open('cesta/k/souboru.txt', mode='r', encoding='utf-8') as soubor:
    obsah = soubor.read()
# Zde je soubor již spolehlivě a automaticky uzavřen
```

Klíčové zásady:
- **Automatické uzavření**: Blok `with` zaručuje uzavření souborového deskriptoru i v případě, že uvnitř bloku dojde k vyvolání neošetřené výjimky.
- **Vždy specifikujte `encoding='utf-8'`**: V Pythonu před verzí 3.15 závisí výchozí kódování na operačním systému (Windows historicky používal CP1250). Bez explicitního `encoding='utf-8'` je kód nepřenosný.

---
<!-- slide: id2, Módy otevření souboru, Core, resyntax -->
## Režimy otevření souboru (*Open Modes*)

Režim určuje způsob přístupu k souboru (písmeno `t` pro textový režim je výchozí):

| Mód | Význam | Chování při existenci souboru | Chování při neexistenci |
|:---:|:---|:---|:---|
| `'r'` | **Read**: Pouze pro čtení (výchozí) | Čte od začátku | `FileNotFoundError` |
| `'w'` | **Write**: Pouze pro zápis | **Okamžitě soubor smaže (přepíše)** | Vytvoří nový soubor |
| `'x'` | **Exclusive**: Exkluzivní vytvoření | **Vyvolá `FileExistsError`** | Vytvoří nový soubor |
| `'a'` | **Append**: Zápis na konec souboru | Připojuje data na konec | Vytvoří nový soubor |
| `'r+'`| Čtení i zápis bez smazání | Čte a přepisuje od začátku | `FileNotFoundError` |
| `'w+'`| Čtení i zápis se smazáním | **Okamžitě soubor smaže** | Vytvoří nový soubor |

---
<!-- slide: id3, Průchod po řádcích souboru – „for-in“, Core, pythonic -->
## Líné čtení po řádcích: Smyčka `for line in file`

Otevřený textový soubor je v Pythonu **iterátor řádků**. Smyčka `for` čte soubor líně po jednotlivých řádcích do vyrovnávací paměti:

```python
with open('data.txt', mode='r', encoding='utf-8') as f:
    for line_num, line in enumerate(f, start=1):
        # line obsahuje koncový znak nového řádku '\n'
        clean_line = line.rstrip('\r\n')
        print(f"{line_num:4d}: {clean_line}")
```

> [!IMPORTANT]
> **Proč nikdy nečíst velké soubory pomocí `read()` nebo `readlines()`?**
> Přímá iterace `for line in f` spotřebuje pouze paměť potřebnou pro jeden jediný řádek ($O(1)$ paměť). Tímto způsobem můžete snadno zpracovat i stogigabajtový logovací soubor na počítači s minimem RAM.

---
<!-- slide: id4, Načtení souboru do řetězcové proměnné – „read()“, Core, basics -->
## Jednorázové načtení celého souboru: `read()`

Pokud je soubor malý (např. konfigurační soubor nebo šablona) a potřebujete jej celý v paměti:

```python
with open('config.json', mode='r', encoding='utf-8') as f:
    content = f.read()

# Nebo moderní ekvivalent přes pathlib.Path:
from pathlib import Path
content = Path('config.json').read_text(encoding='utf-8')
```

Metoda `read(size)` s číselným parametrem načte maximálně daný počet **znaků** (v textovém módu) nebo bajtů (v binárním módu).

---
<!-- slide: id5, „readlines()“ a „readline()“, Tricky, basics -->
## Metody `readline()` a `readlines()`

- **`readline()`**: Načte právě jeden následující řádek (včetně `\n`). Po dosažení konce souboru vrací prázdný řetězec `""`.
- **`readlines()`**: Načte všechny zbývající řádky souboru naráz a vrátí je jako seznam `list[str]`.

```python
with open('data.txt', mode='r', encoding='utf-8') as f:
    # Čtení prvního řádku (např. hlavička CSV):
    header = f.readline().strip()
    
    # Načtení zbytku do seznamu:
    remaining_lines = f.readlines()

    # Návrat na začátek souboru:
    f.seek(0)
```

---
<!-- slide: id6, Zápis do souboru – „write()“, Already Studied, basics -->
## Zápis textu: `f.write()`

Metoda **`write(string)`** zapíše předaný textový řetězec do souboru:

```python
with open('vystup.txt', mode='w', encoding='utf-8') as f:
    f.write("První řádek textu.\n")
    f.write("Druhý řádek textu.\n")
```

> [!WARNING]
> Na rozdíl od funkce `print()` metoda `write()` **automaticky nepřidává znak konce řádku `\n`**! Pokud jej v řetězci neuvedete, data se zapíšou na stejný řádek těsně za sebe.

---
<!-- slide: id7, Zápis do souboru – „writelines()“, Core, pythonic -->
## Hromadný zápis řádků: `f.writelines()`

Metoda **`writelines(iterable)`** zapíše do souboru sekvenci řetězců (např. seznam, generátor nebo n-tici):

```python
lines = [
    "První záznam\n",
    "Druhý záznam\n",
    "Třetí záznam\n"
]

with open('vystup.txt', mode='w', encoding='utf-8') as f:
    f.writelines(lines)
```

> [!NOTE]
> Název `writelines` je mírně matoucí: metoda **nepřidává žádné oddělovače řádků**. Každý prvek v předávané sekvenci již musí obsahovat vlastní `\n`.

---
<!-- slide: id8, Použití „print()“, WOW, pythonic -->
## Zápis do souboru pomocí `print(..., file=f)`

Vestavěná funkce `print()` podporuje parametr **`file`**, který umožňuje přesměrovat výstup přímo do otevřeného souboru:

```python
with open('protokol.log', mode='a', encoding='utf-8') as log_file:
    print("Spuštění úlohy", file=log_file)
    print("Stav:", "OK", "Kód:", 200, sep=" | ", file=log_file)
```

Výhody `print()`:
- Automaticky volá `str()` na všechny předané argumenty.
- Automaticky vkládá oddělovač `sep=" "` a koncový znak `end="\n"`.
- Podporuje okamžité vyprázdnění mezipaměti pomocí `flush=True`.

---
<!-- slide: id9, Poznámky, Skip, basics -->
## Textové soubory a kódování znaků

Při práci s textovými soubory pamatujte na dva principy:
1. **Znaky vs. Bajty**: V textovém módu čtete znaky (`str`), nikoli surové bajty. V kódování UTF-8 může jeden znak (např. české písmeno `ř` nebo emoji `🐍`) zabírat 2 až 4 bajty. Metoda `f.tell()` vrací neprůhledný celočíselný offset (*cookie*), který nemusí odpovídat počtu přečtených znaků.
2. **Unifikace konců řádků**: Python transparentně překládá cizí konce řádků (`\r\n` z Windows, `\r` ze starého Macu) na jednotné `\n`.

---
<!-- slide: id10, Zápis dat a mezipaměť, Tricky, newconcept -->
## Vyrovnávací paměť: `flush()` a `close()`

Z důvodu optimalizace výkonu diskových operací Python nezapisuje data na disk okamžitě při každém volání `write()`, ale shromažďuje je v interním **bafru** (*buffer*):

```python
with open('debug.log', mode='w', encoding='utf-8') as f:
    f.write("Kritická chyba systému...")
    
    # Vynucení okamžitého zápisu z paměti na disk:
    f.flush()
```

K zápisu bafru na disk dojde:
- Při zaplnění kapacity bafru (typicky 4 KB nebo 8 KB).
- Při explicitním zavolání metody `f.flush()`.
- Při uzavření souboru metodou `f.close()` (nebo opuštěním bloku `with`).

---
<!-- slide: id11, Řešení chyb při dekódování, Tricky, newconcept -->
## Parametr `errors`: Zvládání neplatných znaků

Pokud soubor obsahuje poškozené bajty nebo neznámé kódování, parametr **`errors`** určuje chování interpretu:

```python
# 1. 'strict' (výchozí): Vyvolá UnicodeDecodeError při jakékoliv chybě
f = open('data.txt', encoding='utf-8', errors='strict')

# 2. 'ignore': Neplatné bajty tiše přeskočí a zahodí (riziko ztráty dat!)
f = open('data.txt', encoding='utf-8', errors='ignore')

# 3. 'replace': Vadné bajty nahradí symbolem '?' (U+FFFD )
f = open('data.txt', encoding='utf-8', errors='replace')

# 4. 'surrogateescape': Převede neplatné bajty na privátní kódové body Unicode.
# Umožňuje soubor přečíst, upravit a zapsat zpět bez poškození původních bajtů!
f = open('data.txt', encoding='utf-8', errors='surrogateescape')
```

---
<!-- slide: id12, Zpracování konců řádek, Tricky, newconcept -->
## Řízení konců řádků: Parametr `newline`

Parametr **`newline`** ve funkci `open()` řídí překlad konců řádků:

- **`newline=None` (výchozí)**: Univerzální režim. Při čtení převádí `\r\n`, `\r` i `\n` na standardní `\n`. Při zápisu převádí `\n` na systémový oddělovač (`\r\n` na Windows, `\n` na Linuxu/macOS).
- **`newline=''` (prázdný řetězec)**: Vypne jakoukoliv konverzi. Řádky jsou čteny i zapisovány přesně tak, jak leží na disku (klíčové pro CSV soubory a modul `csv`).
- **`newline='\n'` nebo `newline='\r\n'`**: Explicitní vynucení konkrétního formátu konců řádků nezávisle na operačním systému.

```python
# Zachování přesných Windows konců řádků i na Linuxu:
with open('windows.txt', mode='w', encoding='utf-8', newline='\r\n') as f:
    f.write("Line 1\nLine 2\n")
```
