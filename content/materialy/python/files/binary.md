<!-- slide: id1, Úvod, Core, basics -->
## Úvod do práce s binárními soubory

S **binárními soubory** se v Pythonu pracuje v zásadě stejně jako se soubory textovými, ale s klíčovými rozdíly:

```python
with open('obrazek.png', mode='rb') as f:
    data = f.read()
```

Klíčové rozdíly oproti textovým souborům:
1. **Žádné kódování**: Parametr `encoding` nemá pro binární soubory žádný smysl a jeho zadání skončí chybou `ValueError`.
2. **Datový typ `bytes`**: Čtení vrací objekt `bytes` (nikoli `str`), zápis vyžaduje objekt typu `bytes` nebo `bytearray`.
3. **Přesná pozice ukazatele**: Pozice v proudu vrácená metodou `tell()` vždy přesně odpovídá počtu bajtů od začátku souboru.

---
<!-- slide: id2, Módy otevření souboru, Core, resyntax -->
## Režimy otevření binárního souboru

Binární soubor je povinně identifikován příznakem **`b`** (*binary*):

| Režim | Význam | Pozice ukazatele | Chování při existenci |
|:---:|:---|:---|:---|
| `'rb'` | Čtení existujícího souboru | Začátek (0) | `FileNotFoundError` při neexistenci |
| `'wb'` | Zápis (nový soubor) | Začátek (0) | **Okamžitě existující soubor smaže!** |
| `'xb'` | Exkluzivní vytvoření pro zápis | Začátek (0) | **Vyvolá `FileExistsError`**, pokud soubor již existuje |
| `'ab'` | Přidávání na konec (*append*) | Konec souboru | Připojuje nová data na konec |
| `'rb+'` | Čtení i zápis bez smazání | Začátek (0) | Očekává existující soubor |
| `'wb+'` | Čtení i zápis se smazáním | Začátek (0) | **Okamžitě existující soubor smaže!** |

---
<!-- slide: id3, Bajty versus text, Tricky, paradigm -->
## Zásadní rozdíly: Bajty (`bytes`) vs. Znaky (`str`)

Při práci se soubory mějte na paměti dva základní principy:

1. **Jednotka zpracování**:
   - **Binární soubory** jsou zpracovávány striktně **po bajtech** (8bitová čísla $0 \dots 255$).
   - **Textové soubory** jsou zpracovávány **po znacích** Unicode (jeden znak může v UTF-8 zabírat 1 až 4 bajty).
2. **Konce řádků**:
   - V textových souborech probíhá automatická obousměrná konverze konců řádků (`\r\n` $\leftrightarrow$ `\n`).
   - V binárních souborech **k žádné konverzi nedochází** — bajty `0x0D` (`\r`) a `0x0A` (`\n`) jsou zachovány přesně tak, jak leží na disku.

---
<!-- slide: id4, Posun v proudu, Core, resyntax -->
## Posun v binárním proudu: `seek()` a `tell()`

U binárních souborů lze efektivně přeskakovat na libovolné místo v souboru bez nutnosti načítat mezilehlá data:

- **`tell()`**: Vrátí aktuální offset v bajtech od začátku souboru.
- **`seek(offset, whence=0)`**: Přesune ukazatel v proudu na požadovanou pozici.

Hodnoty parametru `whence` (z modulu `os`):
- `0` (`os.SEEK_SET`): Posun od **začátku** souboru (výchozí).
- `1` (`os.SEEK_CUR`): Relativní posun od **aktuální pozice**.
- `2` (`os.SEEK_END`): Relativní posun od **konce** souboru (záporný offset posouvá zpět).

```python
with open('data.bin', mode='rb') as f:
    f.seek(1024)        # Přeskočí první 1 KB dat
    header = f.read(16) # Přečte 16 bajtů
    
    f.seek(-8, 2)       # Skočí na posledních 8 bajtů souboru
    checksum = f.read(8)
```

---
<!-- slide: id5, Čtení dat, Tricky, pythonic -->
## Čtení binárních dat: `read()` vs. `peek()`

Z binárního proudu lze číst dvěma metodami:

- **`f.read([n])`**: Načte přesně $n$ bajtů (nebo celý soubor, pokud $n$ chybí) a **posune ukazatel** v proudu dopředu o počet přečtených bajtů.
- **`f.peek([n])`**: Nahlédne do vnitřního bafru a vrátí dostupné bajty **bez posunu ukazatele** (`tell()` zůstane nezměněn).

```python
with open('soubor.bin', mode='rb') as f:
    print("Počáteční pozice:", f.tell())  # 0
    
    # Nahlédneme na první 4 bajty (magická čísla formátu):
    preview = f.peek(4)[:4]
    print("Nahlédnuto:", preview)
    print("Pozice po peek():", f.tell())  # Stále 0!
    
    # Skutečné načtení posune ukazatel:
    data = f.read(4)
    print("Pozice po read():", f.tell())  # 4
```

---
<!-- slide: id6, Zápis dat, Core, resyntax -->
## Zápis binárních dat: `write()`

Metoda **`write(b)`** zapíše předaný objekt typu `bytes` nebo `bytearray` a vrátí celkový počet skutečně zapsaných bajtů:

```python
# Příklad: Zápis UTF-8 bajtů japonského znaku 狼 (3 bajty: \xe7\x8b\xbc)
surove_bajty = b'\xe7\x8b\xbc.cz'

with open('vystup.bin', mode='wb') as f:
    pocet = f.write(surove_bajty)
    print(f"Zapsáno celkem: {pocet} B")
    # Zapsáno celkem: 6 B
```

> [!NOTE]
> Pokud se pokusíte do binárního souboru zapsat textový řetězec `str` bez předchozího zakódování do `bytes` (`s.encode('utf-8')`), Python okamžitě vyvolá výjimku `TypeError: a bytes-like object is required, not 'str'`.

---
<!-- slide: id7, Zápis dat a mezipaměť, Already Studied, basics -->
## Vyrovnávací paměť při binárním zápisu

Stejně jako u textových souborů se binární data při zápisu neposílají na fyzický disk okamžitě, ale hromadí se v bafru operačního systému:

- **`f.flush()`**: Vynutí okamžité vyprázdnění mezipaměti a fyzický zápis na disk.
- **`f.close()`**: Uzavře soubor a automaticky uloží veškerá čekající data.

Použití správce kontextu `with open(...)` zaručuje, že data budou spolehlivě zapsána na disk i v případě neočekávané výjimky v programu.

---
<!-- slide: id8, Bajty vs znaky, Skip, basics -->
## Praktická ukázka: Čtení binárního proudu po bajtech

Pokud otevřeme textový soubor v binárním režimu (`mode='rb'`), vidíme jeho surové kódování:

```python
# Mějme soubor obsahující text "狼.cz" v kódování UTF-8
with open('japonstina.txt', mode='rb') as f:
    raw = f.read()
    print("Surové bajty:", raw)
    # Surové bajty: b'\xe7\x8b\xbc.cz'
    
    f.seek(0)
    prvni_bajt = f.read(1)
    print("První bajt:", prvni_bajt, "číselná hodnota:", prvni_bajt[0])
    # První bajt: b'\xe7' číselná hodnota: 231
```

V textovém režimu by `f.read(1)` vrátilo celý 1 znak `'狼'`, ačkoli na disku fyzicky zabírá 3 bajty (`0xE7 0x8B 0xBC`).
