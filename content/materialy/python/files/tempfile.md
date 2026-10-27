<!-- slide: id1, Úvod, Core, basics -->
## Úvod do modulu `tempfile`: Bezpečná práce s dočasnými daty

V programech často potřebujeme odložit mezivýsledky, vygenerovat dočasný skript pro externí nástroj nebo rozbalit archiv pro jednorázové zpracování.

Proč nevytvářet dočasné soubory ručně (`open('/tmp/temp.txt', 'w')`)?
- **Bezpečnostní rizika (Race Conditions / Symlink Attacks)**: Útočník může předem podstrčit symlink se stejným názvem a přepsat systémový soubor.
- **Kolize názvů**: Dva souběžně běžící procesy by si navzájem přepsaly data.
- **Úklid po pádu**: Pokud program havaruje, ručně vytvořený soubor zůstane na disku navždy.

Modul **`tempfile`** ze standardní knihovny řeší všechny tyto problémy: generuje náhodná, kryptograficky bezpečná jména souborů v systémovém adresáři a zajišťuje jejich **automatický úklid**.

```python
import tempfile
```

---
<!-- slide: id2, Práce s dočasnými objekty, Tricky, pythonic -->
## Správa životního cyklu přes správce kontextu `with`

Všechny konstruktory v modulu `tempfile` jsou navrženy pro použití jako **kontextové manažery** (`with`):

```python
import tempfile

with tempfile.TemporaryFile() as fp:
    fp.write(b"Pracovni data")
    fp.seek(0)
    print(fp.read())
# Zde je soubor automaticky uzavřen a z disku kompletně smazán!
```

> [!IMPORTANT]
> **Výchozí binární režim**:
> Z důvodu maximální platformní nezávislosti otevírají `TemporaryFile` i `NamedTemporaryFile` soubory ve výchozím nastavení v binárním režimu **`mode='w+b'`** (čtení i zápis bez kódování). Pokud chcete pracovat s textem, musíte explicitně uvést:
> `tempfile.TemporaryFile(mode='w+t', encoding='utf-8')`

---
<!-- slide: id3, Umístění dočasných souborů, Skip, basics -->
## Kde Python dočasné soubory vytváří?

Python vyhledává vhodné systémové úložiště v následujícím pořadí priorit:
1. Proměnná prostředí `TMPDIR`
2. Proměnná prostředí `TEMP`
3. Proměnná prostředí `TMP`
4. Platformně specifické cesty:
   - **Windows**: `C:\TEMP`, `C:\TMP`, `\TEMP`, `\TMP`
   - **Linux / macOS**: `/tmp`, `/var/tmp`, `/usr/tmp`
5. Aktuální pracovní adresář (jako nouzové řešení).

Aktuálně zvolený adresář můžete v kódu kdykoliv zjistit pomocí:
```python
print(tempfile.gettempdir())
# Např.: 'C:\\Users\\...\\AppData\\Local\\Temp' na Windows nebo '/tmp' na Linuxu
```

---
<!-- slide: id4, „TemporaryFile“, Core, pythonic -->
## Anonymní dočasný soubor: `tempfile.TemporaryFile`

`TemporaryFile()` vytvoří anonymní soubor bez viditelného jména v souborovém systému (na unixových systémech je soubor ihned po otevření unlinknut přes `O_TMPFILE`):

```python
import tempfile

with tempfile.TemporaryFile(mode='w+t', encoding='utf-8') as f:
    f.write("Citlivá data v paměti / skrytém souboru\n")
    f.seek(0)
    print(f.read())
# Soubor zmizí beze stopy, nikdo zvenčí k němu neměl přístup
```

Výhody:
- Maximální bezpečnost: Ani jiný proces běžící pod stejným uživatelem nemůže soubor otevřít podle cesty, protože soubor žádnou cestu v adresáři nemá.
- Okamžité uvolnění místa na disku při zavření.

---
<!-- slide: id5, „NamedTemporaryFile“, Core, pythonic -->
## Pojmenovaný dočasný soubor: `tempfile.NamedTemporaryFile`

Pokud potřebujete předat cestu k dočasnému souboru externímu programu (např. kompilátoru, přehrávači nebo nástroji přes CLI):

```python
import tempfile
from pathlib import Path

with tempfile.NamedTemporaryFile(suffix='.png', delete=True) as tmp:
    print(f"Cesta k souboru: {tmp.name}")
    # Např.: /tmp/tmp_a8b1c2.png
    tmp.write(b"\x89PNG\r\n\x1a\n...")
    tmp.flush()
    
    # Cestu tmp.name lze předat do jiného nástroje
```

> [!TIP]
> **Novinka v Pythonu 3.12 (`delete_on_close=False`)**:
> Na Windows nebylo dříve možné otevřít `NamedTemporaryFile` jiným procesem, dokud byl v Pythonu otevřený. V Pythonu 3.12 přibyl parametr `delete_on_close=False`, který umožní soubor v Pythonu zavřít, předat jiné aplikaci a smazat jej až při opuštění bloku `with`.

---
<!-- slide: id6, „SpooledTemporaryFile“, WOW, pythonic -->
## Dočasný soubor s přetečením do disku: `SpooledTemporaryFile`

`SpooledTemporaryFile(max_size=N)` drží data primárně v paměti RAM jako `io.BytesIO`. Na fyzický disk se zapíše pouze tehdy, pokud velikost překročí limit:

```python
import tempfile

# Soubor do 1 MB žije pouze v rychlé paměti RAM
with tempfile.SpooledTemporaryFile(max_size=1024 * 1024, mode='w+b') as sp:
    sp.write(b"Mala data...")
    print(sp._rolled)  # False (stále žije pouze v RAM)
    
    # Zápis velkého objemu dat:
    sp.write(b"X" * (2 * 1024 * 1024))
    print(sp._rolled)  # True (automaticky přetekl na disk!)
```

K přetečení z paměti na disk dojde také v případě, že zavoláte metodu `sp.fileno()` nebo vynutíte zápis přes `sp.rollover()`. Ideální pro zpracování uploadovaných souborů ve webových serverech.

---
<!-- slide: id7, „TemporaryDirectory“, Core, pythonic -->
## Dočasný adresář: `tempfile.TemporaryDirectory`

Pokud potřebujete vytvořit celou adresářovou strukturu s více soubory, použijte **`TemporaryDirectory`**:

```python
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory(prefix="my_project_") as tmp_dir:
    dir_path = Path(tmp_dir)
    print(f"Pracovní složka: {dir_path}")
    
    # Vytvoření souborů uvnitř dočasného adresáře:
    subfile = dir_path / "data.csv"
    subfile.write_text("a,b,c\n1,2,3", encoding="utf-8")
    
# Po opuštění bloku with je celý adresář včetně všech podsouborů rekurzivně smazán!
```

Dočasný adresář můžete smazat i předčasně voláním metody `tmp.cleanup()`.

---
<!-- slide: id8, Ukázka, Skip, pythonic -->
## Přehled typických idiomů s `tempfile`

```python
import tempfile
from pathlib import Path

# 1. Dočasný soubor jako scratchpad:
with tempfile.TemporaryFile(mode='w+t', encoding='utf-8') as f:
    f.write("Dočasný záznam")
    f.seek(0)
    content = f.read()

# 2. Dočasný pojmenovaný soubor pro externí proces:
with tempfile.NamedTemporaryFile(suffix=".json", mode="w+t", encoding="utf-8", delete=True) as tmp:
    tmp.write('{"status": "ok"}')
    tmp.flush()
    # subprocess.run(["tool", tmp.name])

# 3. Dočasná pracovní složka:
with tempfile.TemporaryDirectory() as tmpdir:
    workspace = Path(tmpdir)
    (workspace / "build").mkdir()
```
