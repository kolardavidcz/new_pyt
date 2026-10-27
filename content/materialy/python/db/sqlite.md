<!-- slide: id1, SQLite v Python'u, Tricky, newconcept -->
## Relační databáze SQLite v Pythonu (`sqlite3`)

Python má ve své standardní knihovně zabudovanou plnohodnotnou transakční SQL databázi **SQLite** prostřednictvím modulu **`sqlite3`** (implementující standard Python DB-API 2.0 / PEP 249).

Klíčové výhody SQLite:
- **Serverless**: Běží přímo v procesu vaší aplikace, nepotřebuje žádný démon, server ani konfigurační porty.
- **Single-file**: Celá databáze (tabulky, indexy, triggery) je uložena v jediném souboru na disku (nebo přímo v paměti RAM jako `":memory:"`).
- **Transakční (ACID)**: Podporuje atomické transakce s automatickým `commit` / `rollback`.

```python
import sqlite3
from pathlib import Path

db_cesta = Path("struktury.db")

# 1. Připojení k databázi (pokud soubor neexistuje, automaticky se vytvoří):
with sqlite3.connect(db_cesta) as spojeni:
    cursor = spojeni.cursor()
    # Všechny příkazy uvnitř bloku with jsou součástí atomické transakce!
    cursor.execute("CREATE TABLE IF NOT EXISTS mereni (id INTEGER PRIMARY KEY, hodnota REAL)")
```

> [!IMPORTANT]
> **Správa transakcí v kontextu `with connection:`**:
> Pokud blok proběhne úspěšně, provede se automaticky `connection.commit()`.
> Pokud dojde k jakékoliv výjimce, provede se automaticky `connection.rollback()`.

---
<!-- slide: id2, Příklad – vyhledávání, Core, pythonic -->
## Vyhledávání a SQL Injection: Bezpečnost na prvním místě

Dotazy provádíme metodou **`cursor.execute()`**. Výsledný kurzor funguje jako líný iterátor:

```python
import sqlite3

with sqlite3.connect("struktury.db") as conn:
    cursor = conn.cursor()
    
    # 1. SQL dotaz na vyhledání sloučenin:
    hledany_text = "%benzene%"
    
    # BEZPEČNĚ: Parametrizovaný dotaz pomocí znaku '?'
    cursor.execute("SELECT id, name FROM structures WHERE name LIKE ?", (hledany_text,))
    
    for row_id, name in cursor:
        print(f"{row_id:4d} | {name}")
```

> [!CAUTION]
> **Nikdy neslepujte SQL dotazy pomocí f-stringů nebo operátoru `%`!**
> ```python
> # FATÁLNÍ BEZPEČNOSTNÍ DÍRA (SQL Injection):
> cursor.execute(f"SELECT * FROM users WHERE name = '{vstup_od_uzivatele}'")
> ```
> Útočník může zadat `' OR '1'='1` a získat přístup ke všem datům.
> Vždy používejte parametry předávané v n-tici: `cursor.execute("SELECT * FROM users WHERE name = ?", (vstup,))`.

---
<!-- slide: id3, Vytvoření databáze, Core, resyntax -->
## Vytvoření schématu a naplnění daty

Ukázka inicializace tabulky a načtení dat z textového souboru:

```python
from pathlib import Path
import sqlite3

db_path = Path("chemie.db")

with sqlite3.connect(db_path) as conn:
    cursor = conn.cursor()
    
    # Vytvoření tabulky:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS latky (
            id INTEGER PRIMARY KEY,
            nazev TEXT NOT NULL,
            inchikey TEXT UNIQUE,
            smiles TEXT
        )
    """)
    
    # Vložení záznamu s pozičními parametry (?):
    cursor.execute(
        "INSERT OR IGNORE INTO latky (id, nazev, inchikey, smiles) VALUES (?, ?, ?, ?)",
        (7, "9-ethylpurin-6-amine", "MUIPLRMGAXZWSQ-FSHFIPFOCP", "CCN1C=NC2=C1N=CN=C2N")
    )
```

---
<!-- slide: id4, Parametry, WOW, pythonic -->
## Předávání parametrů: Poziční (`?`) vs. Pojmenované (`:klic`)

Modul `sqlite3` podporuje dva styly zástupných symbolů:

```python
import sqlite3

with sqlite3.connect(":memory:") as conn:
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE uzivatele (id INTEGER, jmeno TEXT, email TEXT)")

    # 1. Poziční parametry (předáváme n-tici tuple):
    cursor.execute(
        "INSERT INTO uzivatele VALUES (?, ?, ?)",
        (1, "David", "david@vscht.cz")
    )

    # 2. Pojmenované parametry (předáváme slovník dict):
    cursor.execute(
        "INSERT INTO uzivatele VALUES (:id, :jmeno, :email)",
        {"id": 2, "jmeno": "Jana", "email": "jana@vscht.cz"}
    )
```

> [!TIP]
> Pojmenované parametry (`:nazev`) jsou výrazně čitelnější u komplexních SQL příkazů s mnoha sloupci a brání chybám při prohození pořadí argumentů.

---
<!-- slide: id5, Parametry jako „iterátor“, WOW, pythonic -->
## Hromadný zápis: `executemany()`

Pokud potřebujete vložit stovky či tisíce záznamů, neprovádějte `execute()` v pomalé smyčce. Použijte **`cursor.executemany()`**:

```python
import sqlite3

zaznamy = [
    (101, "Aceton", "CC(=O)C"),
    (102, "Ethanol", "CCO"),
    (103, "Methanol", "CO"),
]

with sqlite3.connect(":memory:") as conn:
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE rozpoustedla (id INTEGER, nazev TEXT, smiles TEXT)")

    # Bleskové vložení všech řádků v jedné interní transakci:
    cursor.executemany(
        "INSERT INTO rozpoustedla VALUES (?, ?, ?)",
        zaznamy
    )
```

> [!NOTE]
> Druhým argumentem pro `executemany()` může být libovolný generátor nebo iterátor (např. čtení z velkého CSV souboru řádek po řádku), takže paměťová náročnost zůstává minimální.

---
<!-- slide: id6, Více SQL-příkazů, Core, resyntax -->
## Spouštění DDL skriptů: `executescript()`

Pro spuštění více SQL příkazů oddělených středníky najednou (např. inicializace celého databázového schématu) slouží metoda **`executescript()`**:

```python
import sqlite3

ddl_schema = """
DROP TABLE IF EXISTS studenti;
DROP TABLE IF EXISTS predmety;

CREATE TABLE studenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jmeno TEXT NOT NULL,
    rocnik INTEGER DEFAULT 1
);

CREATE TABLE predmety (
    kod TEXT PRIMARY KEY,
    nazev TEXT NOT NULL,
    kredity INTEGER
);
"""

with sqlite3.connect(":memory:") as conn:
    # Vykoná celý skript a automaticky potvrdí transakci (COMMIT):
    conn.executescript(ddl_schema)
```

---
<!-- slide: id7, Získávání výsledků I, Core, pythonic -->
## Přístup k výsledkům: `sqlite3.Row`

Ve výchozím nastavení vrací dotazy obyčejné n-tice hodnot `(val1, val2, ...)`.
Nastavením **`conn.row_factory = sqlite3.Row`** získáme objekty, které umožňují **přístup k hodnotám podle názvu sloupce i indexu**:

```python
import sqlite3

with sqlite3.connect(":memory:") as conn:
    # Aktivace moderního slovníkového mapování řádků:
    conn.row_factory = sqlite3.Row
    
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE prvky (proton_cislo INTEGER, znacka TEXT, nazev TEXT)")
    cursor.execute("INSERT INTO prvky VALUES (6, 'C', 'Uhlík')")

    cursor.execute("SELECT * FROM prvky WHERE znacka = 'C'")
    radek = cursor.fetchone()

    # Přístup podle názvu sloupce (case-insensitive):
    print(radek["nazev"])         # 'Uhlík'
    print(radek["proton_cislo"])  # 6
    
    # Přístup podle pořadí (jako tuple):
    print(radek[1])               # 'C'
    
    # Snadný převod na standardní slovník:
    print(dict(radek))            # {'proton_cislo': 6, 'znacka': 'C', 'nazev': 'Uhlík'}
```

---
<!-- slide: id8, Získávání výsledků II, Core, resyntax -->
## Metody pro vyzvednutí dat: `fetchone`, `fetchmany`, `fetchall`

Kurzor nabízí tři strategie pro vyzvedávání dat z výsledné sady:

```python
import sqlite3

with sqlite3.connect(":memory:") as conn:
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE t (x INT)")
    cursor.executemany("INSERT INTO t VALUES (?)", [(i,) for i in range(100)])
    
    cursor.execute("SELECT x FROM t ORDER BY x")

    # 1. fetchone(): Vrátí následující 1 řádek (nebo None na konci):
    prvni = cursor.fetchone()
    print(prvni)  # (0,)

    # 2. fetchmany(size): Vrátí dávku N řádků:
    davka = cursor.fetchmany(3)
    print(davka)  # [(1,), (2,), (3,)]

    # 3. fetchall(): Načte VŠECHNY zbývající řádky do seznamu v paměti:
    zbytek = cursor.fetchall()
    print(len(zbytek))  # 96 řádků
```

---
<!-- slide: id9, Mapování typů, Tricky, paradigm -->
## Typový systém SQLite (*Type Affinity*)

SQLite má na rozdíl od tradičních SQL databází dynamický typový systém. Typ je uložen u hodnoty, nikoliv u sloupce:

| Datový typ v Pythonu | Datový typ v SQLite | Popis |
| :--- | :--- | :--- |
| `None` | `NULL` | Chybějící hodnota |
| `int` | `INTEGER` | 1, 2, 3, 4, 6 nebo 8bajtové celé číslo |
| `float` | `REAL` | 8bajtové IEEE 754 plovoucí číslo |
| `str` | `TEXT` | Řetězec v kódování UTF-8 |
| `bytes` | `BLOB` | Surová binární data |

> [!NOTE]
> Booleovské hodnoty `True` / `False` ukládá SQLite jako celá čísla `1` a `0`.
> Datum a čas (`datetime`) se obvykle ukládá jako ISO-8601 textový řetězec (`"2026-10-27 17:00:00"`), který lze v SQL dotazech snadno řadit a filtrovat.

---
<!-- slide: id10, „Zkratky“, Core, pythonic -->
## Pohodlné zkratky na objektu `Connection`

Pro stručný kód není nutné explicitně vytvářet a zavírat objekt `cursor`. Metody `execute()` a `executemany()` lze volat přímo na objektu připojení:

```python
import sqlite3

with sqlite3.connect(":memory:") as conn:
    # 1. Přímé spuštění DDL a zápisu přes objekt spojení:
    conn.execute("CREATE TABLE nastaveni (klic TEXT, hodnota TEXT)")
    conn.execute("INSERT INTO nastaveni VALUES (?, ?)", ("jazyk", "cs"))

    # 2. Přímé čtení (conn.execute vrátí dočasný kurzor):
    for radek in conn.execute("SELECT * FROM nastaveni"):
        print(radek)
```

> [!TIP]
> V moderních datových analýzách lze SQLite přímo propojit s knihovnou **Pandas**:
> ```python
> import pandas as pd
> df = pd.read_sql_query("SELECT * FROM nastaveni", conn)
> ```
