<!-- slide: id1, Úvod do práce se soubory, Core, basics -->
## Práce se soubory v Pythonu

Základní dovedností každého programátora je čtení a zápis dat na disk. V Pythonu platí tři zlatá pravidla:

1. **Vždy explicitně uvádějte kódování (`encoding='utf-8'`)**:
   - Nespoléhejte na výchozí kódování operačního systému (ve Windows bývalo historicky CP1250, v Linuxu UTF-8).
2. **Vždy používejte správce kontextu (`with open(...) as f:`)**:
   - Konstrukce `with` automaticky garantuje uzavření souborového deskriptoru i v případě neočekávané výjimky či pádu uvnitř bloku.
3. **Zvolte správnou strategii načítání podle velikosti dat**:
   - **Po řádcích** (`for line in f:`): líná iterace pro soubory libovolné velikosti ($O(1)$ paměť).
   - **Celý soubor najednou** (`f.read()` nebo `Path.read_text()`): pro malé konfigurační soubory.

---
<!-- slide: id2, Správce kontextu „with open()“, WOW, pythonic -->
## Otevření souboru: Správce kontextu `with`

V C nebo Javě vyžaduje bezpečná práce se soubory blok `try-finally` a ruční volání `close()`:

```python
# ZASTARALÝ A NÁCHYLNÝ ZPŮSOB (nepoužívat):
soubor = open("data.txt", "r", encoding="utf-8")
try:
    obsah = soubor.read()
finally:
    soubor.close()
```

V moderním Pythonu používáme výhradně **správce kontextu** (*context manager*) pomocí klíčového slova `with`:

```python
# MODERNÍ A BEZPEČNÝ STANDARD:
with open("data.txt", "r", encoding="utf-8") as soubor:
    obsah = soubor.read()
# Zde je soubor již zaručeně a bezpečně uzavřen!
```

> [!IMPORTANT] Proč je `with` tak důležitý?
> Pokud soubor neuzavřete, operačnímu systému dojdou volné souborové deskriptory (*file descriptors leak*) a při zápisu mohou data zůstat viset ve vyrovnávací paměti bez uložení na disk.

---
<!-- slide: id3, Průchod souborem po řádcích (Líná iterace), WOW, pythonic -->
## Líné čtení po řádcích: cyklus `for-in`

Otevřený souborový objekt je sám o sobě **iterátorem**. Cyklus `for` čte řádky ze souboru postupně jeden po druhém (*stream processing*):

```python
with open("velky_katalog.csv", "r", encoding="utf-8") as f:
    for radek in f:
        # Odstranění koncového odřádkování (\n nebo \r\n):
        radek = radek.rstrip("\r\n")
        zpracuj_radek(radek)
```

### Číslování řádků pomocí `enumerate()`:
```python
with open("server.log", "r", encoding="utf-8") as f:
    for cislo_radku, radek in enumerate(f, start=1):
        if "ERROR" in radek:
            print(f"Chyba na řádku {cislo_radku}: {radek.strip()}")
```

Tento přístup bez potíží zpracuje i stogigabajtový log bez vyčerpání operační paměti RAM.

---
<!-- slide: id4, Načtení všech řádek do seznamu: readlines(), Core, basics -->
## Načtení všech řádek do paměti: `readlines()`

Pokud potřebujete mít všechny řádky dostupné náhodným indexem v seznamu:

```python
with open("konfigurace.ini", "r", encoding="utf-8") as f:
    vsechny_radky = f.readlines()
    # Ekvivalentně také: vsechny_radky = list(f)

print(f"Soubor má celkem {len(vsechny_radky)} řádek.")
print(f"První řádek: {vsechny_radky[0]}")
```

> [!WARNING] Pozor na velikost paměti!
> Metoda `readlines()` načte celý soubor najednou do operační paměti. U souborů větších než dostupná RAM dojde k chybě `MemoryError`.
> Řádky v seznamu si navíc zachovávají koncové znaky odřádkování `\n`. Pro čistá data použijte:
> ```python
> radky = [line.rstrip("\r\n") for line in f]
> ```

---
<!-- slide: id5, Načtení celého souboru: read() a pathlib, Core, basics -->
## Načtení celého obsahu: `read()` a moderní `pathlib`

Pro načtení kompletního obsahu do jednoho textového řetězce slouží metoda `.read()`:

```python
with open("sablona.html", "r", encoding="utf-8") as f:
    html_kod = f.read()
```

### Moderní alternativa: `pathlib.Path` (Python 3.4+)
V moderním Pythonu je standardem používat objektově orientovanou knihovnu `pathlib`. Pro rychlé načtení či zápis celého souboru není třeba ani psát blok `with`:

```python
from pathlib import Path

cesta = Path("sablona.html")

# Načtení celého textu na jediný řádek (automaticky otevře i zavře soubor):
html_kod = cesta.read_text(encoding="utf-8")

# Načtení binárních dat (např. obrázku):
bajtovy_obsah = Path("obrazek.png").read_bytes()
```

---
<!-- slide: id6, Módy otevření souboru a zápis dat, Core, basics -->
## Režimy otevření (*modes*) a zápis do souboru

Druhý argument funkce `open(cesta, mode=...)` určuje operaci a formát dat:

| Mód | Význam | Popis chování |
| :--- | :--- | :--- |
| `'r'` | Čtení textu (výchozí) | Soubor musí existovat, jinak vyvolá `FileNotFoundError`. |
| `'w'` | Zápis textu | Vytvoří nový soubor. Pokud soubor existuje, **bez varování jej smaže a přepíše!** |
| `'a'` | Připojení (*append*) | Píše data na konec existujícího souboru bez smazání původního obsahu. |
| `'x'` | Výhradní vytvoření | Vytvoří nový soubor pro zápis. Pokud soubor již existuje, selže s `FileExistsError`. |
| `'rb'`, `'wb'` | Binární režim | Čte nebo zapisuje objekty `bytes` namísto `str` (obrázky, ZIP archivy, PDF). |

### Zápis textu do souboru:
```python
data = "První řádek protokolu\n"

# Varianta A: metoda write()
with open("protokol.txt", "w", encoding="utf-8") as f:
    f.write(data)
    f.write("Druhý řádek\n")

# Varianta B: přesměrování funkce print()
with open("protokol.txt", "a", encoding="utf-8") as f:
    print("Třetí řádek automaticky odřádkovaný", file=f)

# Varianta C: pathlib na jeden řádek
Path("protokol.txt").write_text("Kompletní přepis obsahu", encoding="utf-8")
```
