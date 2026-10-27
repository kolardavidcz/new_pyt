<!-- slide: id1, Úvod, Core, pythonic -->
## Perzistentní slovník na disku: Modul `shelve`

Modul **`shelve`** nabízí jednoduché řešení pro trvalé ukládání Python objektů na disk s rozhraním běžného slovníku (`dict`).

Funguje jako hybrid tří komponent:
1. **Slovníkové rozhraní (`dict`)**: K datům přistupujeme přes operátory `d[klic] = hodnota`, `del d[klic]`, `'klic' in d`.
2. **Serializace (`pickle`)**: Hodnotou může být téměř libovolný Python objekt (seznamy, vlastní třídy, n-tice).
3. **Databázový backend (`dbm`)**: Data jsou organizována na disku v indexované DBM databázi.

> [!NOTE]
> **Klíče v `shelve` musí být výhradně řetězce (`str`)**! Hodnotami mohou být libovolné piklovatelné Python objekty.

---
<!-- slide: id2, Databázový backend, Skip, basics -->
## Databázové backendy: Modul `dbm`

Pod kapotou deleguje `shelve` na systémový modul `dbm`. Podle operačního systému se volí nejvhodnější dostupný backend:
- Unix/Linux: `dbm.gnu` (GDBM) nebo `dbm.ndbm` (rychlé C knihovny).
- Univerzální multiplatformní záloha: `dbm.dumb` (čistý Python, vytváří soubory `.dat` a `.dir`).

Při volání `shelve.open("moje_data")` vytvoří knihovna soubor(y) s příslušnou příponou v závislosti na backendu.

---
<!-- slide: id3, Práce s objektem „shelve“, Core, pythonic -->
## Správa kontextu: `with shelve.open(...)`

V moderním Pythonu je `shelf` plnohodnotným správcem kontextu. Není třeba importovat `contextlib.closing`:

```python
import shelve
from pathlib import Path

db_cesta = "uzivatele_shelf"

# Moderní zápis přes kontextový manažer:
with shelve.open(db_cesta) as db:
    db["admin"] = {"jmeno": "Alice", "role": "Superuser", "aktivni": True}
    db["host"] = {"jmeno": "Bob", "role": "Guest", "aktivni": False}
# Zde se automaticky zavolá db.close() a data se bezpečně zapíší na disk!

# Opětovné načtení dat z disku:
with shelve.open(db_cesta) as db:
    print(db["admin"]["jmeno"])  # 'Alice'
```

---
<!-- slide: id4, Objekt „shelve“ jako slovník, Skip, resyntax -->
## Rozhraní `shelve` jako `MutableMapping`

Objekt `Shelf` dědí z abstraktní bázové třídy `collections.abc.MutableMapping` a podporuje téměř všechny metody běžného slovníku:

```python
import shelve

with shelve.open("pokus_shelf") as d:
    d["a"] = 10
    d["b"] = 20

    print("a" in d)        # True (operátor příslušnosti)
    print(len(d))          # 2
    print(list(d.keys()))  # ['a', 'b']
    print(d.get("c", 0))   # 0 (výchozí hodnota)
```

---
<!-- slide: id5, Metody objektu „shelve“, Skip, resyntax -->
## Přehled metod objektu `Shelf`

| Metoda | Chování |
| :--- | :--- |
| **`d[klic] = hodnota`** | Zeserializuje objekt pomocí `pickle` a zapíše do DBM |
| **`d[klic]`** | Načte bajty z disku a deserializuje objekt do paměti |
| **`d.get(klic, default)`** | Bezpečné vyzvednutí bez vyvolání `KeyError` |
| **`d.keys()`, `values()`** | Pohledy na klíče a hodnoty |
| **`d.sync()`** | Okamžitý zápis čekající paměťové mezipaměti na disk |
| **`d.close()`** | Synchronizace mezipaměti a korektní uzavření DBM souborů |

---
<!-- slide: id6, Ukázka, Core, pythonic -->
## Praktická ukázka práce se `shelve`

```python
import shelve

with shelve.open("inventar") as inv:
    # 1. Uložení komplexních struktur (seznamy, n-tice, slovníky):
    inv["lektvary"] = ["léčivý", "mana", "neviditelnost"]
    inv["zlato"] = 1500

    # 2. Mazání záznamu:
    if "docasne" in inv:
        del inv["docasne"]

    # 3. Iterace přes všechny záznamy:
    for klic, hodnota in inv.items():
        print(f"{klic}: {hodnota}")
```

---
<!-- slide: id7, Přístup ke slovníkové databázi, Core, pythonic -->
## Parametry funkce `shelve.open()`

Signatura funkce:

```python
shelve.open(filename, flag='c', protocol=None, writeback=False)
```

- **`flag`**:
  - `'r'`: pouze pro čtení (vyvolá chybu, pokud soubor neexistuje).
  - `'w'`: pro čtení i zápis.
  - `'c'`: (výchozí) otevře pro čtení i zápis, neexistující soubor vytvoří.
  - `'n'`: vždy vytvoří novou prázdnou databázi (případnou existující smaže).
- **`protocol`**: verze piklovacího protokolu (ve výchozím stavu nejnovější stabilní protokol Pythonu).
- **`writeback`**: řídí způsob zápisu modifikovaných mutabilních objektů.

---
<!-- slide: id8, Dva typy chování při zápisu, Tricky, newconcept -->
## Záludnost mutabilních objektů a parametr `writeback`

> [!WARNING]
> **Při výchozím `writeback=False` nefunguje in-place modifikace seznamů a slovníků!**
> ```python
> with shelve.open("db") as d:
>     d["seznam"] = [1, 2, 3]
>     d["seznam"].append(4)  # CHYBA! Na disku se změna NEULOŽÍ!
> ```
> **Proč?** Výraz `d["seznam"]` načte data z disku a vytvoří v paměti **nový dočasný objekt** `list`. Metoda `.append(4)` upraví tento dočasný objekt a vzápětí zanikne!

### Dvě možná řešení:
```python
# Řešení A: Explicitní znovupřiřazení (doporučeno pro úsporu paměti):
with shelve.open("db") as d:
    temp = d["seznam"]
    temp.append(4)
    d["seznam"] = temp  # Zpětné přiřazení vyvolá serializaci na disk!

# Řešení B: Zapnutí writeback=True (ukládá všechny načtené objekty do RAM cache):
with shelve.open("db", writeback=True) as d:
    d["seznam"].append(4)  # Nyní funguje, ale spotřebovává více paměti RAM!
```

---
<!-- slide: id9, Poznámky, Core, newconcept -->
## Bezpečnostní rizika a moderní alternativy

> [!CAUTION]
> **Bezpečnostní varování: Nikdy neotevírejte `.shelf` soubory z nedůvěryhodných zdrojů!**
> Modul `shelve` používá `pickle`. Útočník může do databáze vložit škodlivý objekt, který při načtení spustí libovolný kód na vašem počítači.

### Kdy `shelve` použít a kdy zvolit modernější alternativu:

| Požadavek | Modul `shelve` | Moderní doporučená alternativa |
| :--- | :--- | :--- |
| **Rychlý lokální scratch cache** | Vhodné pro rychlé skripty | Vhodné |
| **Strukturovaná relační data** | Nevhodné | **`sqlite3`** (integrované v Pythonu) |
| **Přenositelnost mezi jazyky** | Nemožné (pouze Python) | **JSON**, **MsgPack**, **Parquet** |
| **Konkurenční přístup z více procesů** | Nepodporuje (hrozí poškození souboru) | **SQLite** (s WAL módem) nebo **Redis** |
