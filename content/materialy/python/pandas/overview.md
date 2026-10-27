<!-- slide: id1, Úvod, Core, paradigm -->
## Úvod do knihovny Pandas: `Series` a `DataFrame`

Knihovna **Pandas** je de facto standardem pro manipulaci, čištění a analýzu tabulkových dat v Pythonu (analogie k SQL tabulkám, Excelu nebo datovým rámcům v jazyce R).

Stojí na dvou základních datových strukturách:
- **`Series`**: Jednorozměrné homogenní pole dat s pojmenovaným indexem (odpovídá jednomu sloupci tabulky).
- **`DataFrame`**: Dvourozměrná tabulka tvořená uspořádaným slovníkem sloupců `Series`, které sdílejí společný řádkový index (`Index`).

```python
import pandas as pd
import numpy as np
```

> [!NOTE]
> Pod kapotou Pandas využívá paměťové bloky z **NumPy** (a od verze Pandas 2.0+ volitelně také Apache **Arrow**). Sloupce jsou uloženy po sloupcích (*columnar format*), což umožňuje bleskové vektorizované výpočty.

---
<!-- slide: id2, Poznámka – Pandas je moloch, Skip, basics -->
## Bohatost a flexibilita: `pd.read_csv`

Pandas disponuje mimořádně robustními I/O funkcemi pro import a export dat z nejrůznějších formátů (`read_csv`, `read_excel`, `read_sql`, `read_parquet`, `read_json`).

Například funkce `pd.read_csv()` nabízí přes 40 parametrů pro ošetření všech myslitelných anomálií v datech:
- `sep=';'` nebo `delimiter`: oddělovač hodnot.
- `decimal=','`: desetinná čárka (český formát čísel).
- `parse_dates=['datum']`: automatický převod textu na časové razítko `datetime64`.
- `na_values=['NA', 'chyba', '-']`: vlastní označení pro chybějící hodnoty.
- `dtype_backend='pyarrow'` (Pandas 2.0+): moderní Arrow backend s nižší spotřebou paměti a nulovým režijním nákladem pro stringy.

---
<!-- slide: id3, „DataFrame“ je slovník hodnot typu „Series“, Tricky, paradigm -->
## Mentální model: `DataFrame` je slovník sloupců

Zásadní architektonické pravidlo pro efektivní práci s Pandas:

> [!IMPORTANT]
> **`DataFrame` je vnitřně uspořádaný slovník sloupců (`dict[str, Series]`).**
> - Přidání nebo odebrání **sloupce** je blesková operace $O(1)$.
> - Přidání nebo procházení **řádek po řádku** je výpočetní antipattern!
>
> **Nikdy neiterujte přes řádky pomocí cyklu `for` nebo `iterrows()`!**
> Řádková iterace rozbíjí sloupcový layout paměti a je až $1000\times$ pomalejší než vektorizované operace.

---
<!-- slide: id4, Instalace a import modulu „pandas“, Skip, basics -->
## Instalace a konvence importu

Instalace v moderním prostředí přes `uv` nebo `pip`:

```bash
# Instalace přes uv (blesková rychlost):
uv add pandas pyarrow

# Standardní instalace přes pip:
pip install pandas
```

Konvence v komunitě datové vědy:
```python
import pandas as pd
```

---
<!-- slide: id5, Příklad – práce s tabulárními daty v CSV, Core, pythonic -->
## Načtení ukázkových dat z CSV

Uvažujme CSV soubor `filmy.csv` s informacemi o sérii Harry Potter:

```csv
poradi;nazev;rok;reziser;trzby
1;Philosopher's Stone;2001;Chris Columbus;$1,006,968,171
2;Chamber of Secrets;2002;Chris Columbus;$879,602,366
3;Prisoner of Azkaban;2004;Alfonso Cuarón;$797,361,618
4;Goblet of Fire;2005;Mike Newell;$896,678,241
5;Order of the Phoenix;2007;David Yates;$942,172,396
6;Half-Blood Prince;2009;David Yates;$934,454,096
7a;Deathly Hallows – Part 1;2010;David Yates;$977,043,483
7b;Deathly Hallows – Part 2;2011;David Yates;$1,342,321,665
```

Načtení do objektu `DataFrame`:

```python
from pathlib import Path
import pandas as pd

soubor = Path("filmy.csv")
df = pd.read_csv(soubor, sep=";")
print(df)
```

---
<!-- slide: id6, PS: Technické informace o datech – „info()“, Core, pythonic -->
## Diagnostika datové struktury: `df.info()`

Metoda **`df.info()`** poskytne okamžitý přehled o počtu řádků, sloupcích, počtu neprázdných hodnot (*Non-Null Count*) a datových typech:

```python
import pandas as pd

df = pd.read_csv("filmy.csv", sep=";")
df.info()
```

Výstup:
```text
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 8 entries, 0 to 7
Data columns (total 5 columns):
 #   Column   Non-Null Count  Dtype 
---  ------   --------------  ----- 
 0   poradi   8 non-null      object
 1   nazev    8 non-null      object
 2   rok      8 non-null      int64 
 3   reziser  8 non-null      object
 4   trzby    8 non-null      object
dtypes: int64(1), object(4)
memory usage: 452.0+ bytes
```

> [!NOTE]
> Typ `object` znamená v Pandas obecný textový řetězec nebo směs typů. Sloupec `rok` byl automaticky rozpoznán jako celé číslo `int64`.

---
<!-- slide: id7, Rychlý náhled na data – „head()“ a „tail()“, Core, basics -->
## Rychlý náhled na okraje dat: `head()` a `tail()`

Pro zobrazení prvních nebo posledních $N$ řádků (výchozí $N=5$) slouží metody:

```python
import pandas as pd

df = pd.read_csv("filmy.csv", sep=";")

# První 3 řádky:
print(df.head(3))

# Poslední 2 řádky:
print(df.tail(2))
```

---
<!-- slide: id8, Výpis vybraných sloupečků – „[[]]“, Core, pythonic -->
## Výběr sloupců: Skalární `Series` vs. vícerozměrný `DataFrame`

Rozlišujte syntaxi jednoduchých a dvojitých závorek:

```python
import pandas as pd

df = pd.read_csv("filmy.csv", sep=";")

# 1. Jednoduché závorky: výběr jednoho sloupce jako 1D Series:
s_reziser = df["reziser"]
print(type(s_reziser))  # <class 'pandas.core.series.Series'>

# 2. Dvojité závorky: výběr podmnožiny sloupců jako nového 2D DataFrame:
podtabulka = df[["reziser", "nazev"]]
print(type(podtabulka))  # <class 'pandas.core.frame.DataFrame'>
print(podtabulka.head(2))
#           reziser                nazev
# 0  Chris Columbus  Philosopher's Stone
# 1  Chris Columbus   Chamber of Secrets
```

---
<!-- slide: id9, Výběr hodnot – „[]“, „unique()“, „value_counts()“, WOW, pythonic -->
## Frekvenční analýza a unikátní hodnoty

Objekt `Series` nabízí silné analytické metody:

```python
import pandas as pd

df = pd.read_csv("filmy.csv", sep=";")

# 1. Pole unikátních hodnot (vrací NumPy ndarray):
reziseri = df["reziser"].unique()
print(reziseri)
# ['Chris Columbus' 'Alfonso Cuarón' 'Mike Newell' 'David Yates']

# 2. Počet unikátních hodnot:
print(df["reziser"].nunique())  # 4

# 3. Frekvenční tabulka (kolikrát se každá hodnota vyskytuje):
pocet_filmu = df["reziser"].value_counts()
print(pocet_filmu)
# reziser
# David Yates       4
# Chris Columbus    2
# Alfonso Cuarón    1
# Mike Newell       1
# Name: count, dtype: int64
```

---
<!-- slide: id10, Numpy „fancy indexing“, WOW, pythonic -->
## Filtrování řádků pomocí podmínky (*Boolean Indexing*)

Filtrování funguje na principu booleovské masky stejně jako v NumPy:

```python
import pandas as pd

df = pd.read_csv("filmy.csv", sep=";")

# 1. Vytvoření booleovské masky:
maska = df["reziser"] == "David Yates"

# 2. Aplikace masky na DataFrame (vybere pouze řádky s hodnotou True):
yates_filmy = df[maska]
print(yates_filmy[["nazev", "rok"]])
#                       nazev   rok
# 4      Order of the Phoenix  2007
# 5         Half-Blood Prince  2009
# 6  Deathly Hallows – Part 1  2010
# 7  Deathly Hallows – Part 2  2011
```

---
<!-- slide: id11, Logické skládání podmínek – „&“ (AND), „|“ (OR) a „~“ (NOT), Tricky, pythonic -->
## Složené podmínky a vektorizovaný textový accessor `.str`

Při skládání více podmínek platí stejná pravidla jako v NumPy:
- Používáme bitové operátory **`&`** (AND), **`|`** (OR), **`~`** (NOT).
- **Každou podmínku musíme uzavřít do závorek `(...)`**!

```python
import pandas as pd

df = pd.read_csv("filmy.csv", sep=";")

# Hledáme filmy po roce 2005, jejichž tržby začínají na '$1' (přes 1 miliardu USD):
# Accessor .str umožňuje volat řetězcové metody nad celým sloupcem naráz!
vyber = (df["rok"] > 2005) & (df["trzby"].str.startswith("$1"))

print(df[vyber][["nazev", "rok", "trzby"]])
#                       nazev   rok           trzby
# 7  Deathly Hallows – Part 2  2011  $1,342,321,665
```

> [!TIP]
> Accessor `.str` obsahuje metody jako `.str.lower()`, `.str.contains()`, `.str.replace()`, `.str.split()`.

---
<!-- slide: id12, Vektorizované operace přes sloupce, Core, pythonic -->
## Tvorba nových sloupců bez cyklů

Nové sloupce vytváříme přímo vektorizovaným výrazem:

```python
import pandas as pd

df = pd.read_csv("filmy.csv", sep=";")

# 1. Očištění tržeb a převod na číselný typ float (v milionech USD):
# Odstraníme znak '$' a čárky, pak převedeme na float:
ciste_trzby = df["trzby"].str.replace(r"[\$,]", "", regex=True).astype(float)
df["trzby_mil_usd"] = ciste_trzby / 1_000_000

# 2. Spojení textových sloupců do formátovaného popisku:
df["popisek"] = df["reziser"] + " (" + df["rok"].astype(str) + ")"

print(df[["nazev", "trzby_mil_usd", "popisek"]].head(3))
#                  nazev  trzby_mil_usd                 popisek
# 0  Philosopher's Stone       1006.97   Chris Columbus (2001)
# 1   Chamber of Secrets        879.60   Chris Columbus (2002)
# 2  Prisoner of Azkaban        797.36   Alfonso Cuarón (2004)
```

---
<!-- slide: id13, PS: Konkrétní řádka(y) – „iloc[]“, Tricky, pythonic -->
## Řezání podle pozice a návěstí: `iloc` vs. `loc`

Když potřebujeme vybrat konkrétní řádky a sloupce, nabízí Pandas dva indexery:

```python
import pandas as pd

df = pd.read_csv("filmy.csv", sep=";")

# 1. df.iloc[radky, sloupce] -> Čistě celočíselná pozice (0..N-1 jako v NumPy):
# První řádek:
print(df.iloc[0])

# První 3 řádky, sloupce od indexu 1 do 3:
print(df.iloc[:3, 1:4])

# 2. df.loc[radky, sloupce] -> Podle NÁVĚSTÍ (Label-based):
# Bezpečný zápis pro modifikaci buňky (zabrání SettingWithCopyWarning):
df.loc[df["rok"] == 2001, "reziser"] = "Christopher Columbus"
```

> [!CAUTION]
> Vyhněte se řetězenému indexování `df[podminka]["sloupec"] = hodnota`, které vyvolá varování `SettingWithCopyWarning`. Vždy používejte **`df.loc[podminka, "sloupec"] = hodnota`**.
