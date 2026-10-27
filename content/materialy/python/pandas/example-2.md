<!-- slide: id=id1 title="Zadání příkladu" tags="Core" diff="basics" -->
## Případová studie: Analýza ornitologických pozorování v Pandas

V této praktické případové studii zpracujeme reálná data pozorování vodního ptactva na jihočeských rybnících.

### Struktura zdrojového Excelu (`birds.xlsx`):
```text
RYBNÍK    DRUH_CZ              SAMCI    SAMICE    DOSPĚLCI    MLÁĎATA
3133      kachna divoká        8        5         13          NaN
3133      polák chocholačka    6        5         11          NaN
3132      labuť velká          NaN      NaN       3           2
3132      kachna divoká        14       5         19          NaN
```

### Vlastnosti dat a cíl úlohy:
1. Pro každý rybník (číselný kód) jsou zapsány počty dospělců a mláďat. Pokud šlo rozlišit pohlaví, jsou uvedeni i samci a samice.
2. Pokud pohlaví rozlišit nešlo, jsou buňky `SAMCI` a `SAMICE` prázdné (`NaN`).
3. Některé druhy byly na témže rybníce pozorovány vícekrát (na různých zátokách či stanovištích).
4. **Cíl**: Vytvořit souhrnnou tabulku pro jednotlivé druhy s **celkovým počtem dospělých jedinců** a **počtem unikátních rybníků**, na kterých byl daný druh spatřen, seřazenou podle české abecedy a uloženou do nového Excelu.

---
<!-- slide: id=id2 title="Chybějící data I" tags="Tricky" diff="newconcept" -->
## Chybějící hodnoty v Pandas: `NaN` a přetypování sloupců

Při načtení excelovského sešitu pomocí `pd.read_excel()` narazíme na klasické úskalí práce s celočíselnými sloupci:

```python
import pandas as pd

df = pd.read_excel("birds.xlsx", sheet_name="birds")
print(df.head())
df.info()
```

Výstup metody `df.info()`:
```plain
#   Column    Non-Null Count  Dtype
---  ------    --------------  -----
0   RYBNÍK    164 non-null    int64
1   DRUH_CZ   164 non-null    object
2   SAMCI     75 non-null     float64
3   SAMICE    60 non-null     float64
4   DOSPĚLCI  164 non-null    int64
5   MLÁĎATA   9 non-null      float64
```

### Proč se celá čísla změnila na `float64`?
V klasickém NumPy/Pandas reprezentuje chybějící číselnou hodnotu IEEE 754 konstanta s plovoucí řadovou čárkou **`np.nan`** (*Not a Number*). Protože standardní celočíselný typ `int64` neumí reprezentovat chybějící hodnotu, Pandas automaticky celý sloupec přetypuje na `float64`!

---
<!-- slide: id=id3 title="Chybějící data II" tags="WOW" diff="newconcept" -->
## Moderní řešení: Nullable celočíselné typy (`Int64`)

Pandas nabízí rozšiřující datové typy podporující chybějící hodnoty (**`pd.NA`**):

```python
import pandas as pd

# Předepsání nulovatelných celých čísel s velkým 'I':
df = pd.read_excel(
    "birds.xlsx",
    sheet_name="birds",
    dtype={"SAMCI": "Int64", "SAMICE": "Int64", "MLÁĎATA": "Int64"}
)

print(df.head())
df.info()
```

Výstup s typem `Int64`:
```plain
   RYBNÍK        DRUH_CZ  SAMCI  SAMICE  DOSPĚLCI  MLÁĎATA
0    3133   potápka malá   <NA>    <NA>         1     <NA>
1    3133    lyska černá   <NA>    <NA>         5     <NA>
4    3133  kachna divoká      8       5        13     <NA>

Data columns:
2  SAMCI     75 non-null     Int64
3  SAMICE    60 non-null     Int64
5  MLÁĎATA   9 non-null      Int64
```

Hodnoty se zobrazují jako čistá celá čísla a chybějící buňky jako `<NA>`, aniž by docházelo k nechtěnému převodu na desetinná čísla (`8.0`).

---
<!-- slide: id=id4 title="Chybějící data – „fillna()“" tags="Core" diff="pythonic" -->
## Ověření konzistence dat: `fillna(0)` a masky

Chceme ověřit, zda součet samců a samic přesně odpovídá sloupci `DOSPĚLCI`:

```python
import pandas as pd

df = pd.read_excel(
    "birds.xlsx",
    sheet_name="birds",
    dtype={"SAMCI": "Int64", "SAMICE": "Int64"}
)

# 1. Filtrování řádků, kde je vyplněno alespoň jedno pohlaví
maska = df["SAMCI"].notna() | df["SAMICE"].notna()
k_overeni = df[maska].copy()

# 2. Nahrazení chybějících pohlaví nulou (např. 1 samec a <NA> samic -> 1 + 0 = 1)
k_overeni_nuly = k_overeni.fillna(0)

# 3. Kontrola součtu přes celou sérii
soucet_pohlavi = k_overeni_nuly["SAMCI"] + k_overeni_nuly["SAMICE"]
vysledek = (soucet_pohlavi == k_overeni_nuly["DOSPĚLCI"]).all()

print("Odpovídají součty samců a samic dospělcům?", vysledek)  # True
```

---
<!-- slide: id=id5 title="Jedinečné hodnoty – „unique()“" tags="Core" diff="basics" -->
## Získání unikátních druhů: `unique()`

Pro zjištění všech sledovaných ptačích druhů použijeme metodu `unique()`:

```python
import pandas as pd

df = pd.read_excel("birds.xlsx", sheet_name="birds")

druhy = df["DRUH_CZ"].unique()
print(f"Nalezeno {len(druhy)} různých záznamů:")
print(druhy)
```

```plain
['potápka malá' 'lyska černá' 'potápka roháč' 'labuť velká'
 'kachna divoká' 'racek chechtavý' 'volavka popelavá' 'polák chocholačka'
 ... 'bez ptáků']
```

> [!NOTE]
> V datech se vyskytuje kontrolní záznam `'bez ptáků'` (záznam o prázdném rybníce), který musíme z biologické statistiky ptactva odfiltrovat.

---
<!-- slide: id=id6 title="Kontrola pro jeden druh" tags="Skip" diff="basics" -->
## Problém vícenásobných pozorování: Proč nestačí `count()`

Podívejme se na záznamy pro *racka chechtavého*:

```python
racek = df[df["DRUH_CZ"] == "racek chechtavý"]
print(racek[["RYBNÍK", "DOSPĚLCI"]])
```

```plain
     RYBNÍK  DOSPĚLCI
5      3133         1
42     2923         6
54     2923         4
73     2920         1
115    3114         2
```

Všimněte si, že rybník **`2923`** je v datech uveden dvakrát (pozorování dvou různých hejn).
- Prostý počet řádků (`count()`) by vrátil **5 pozorování**.
- Skutečný počet osídlených rybníků je však **4 unikátní rybníky**!
- Celkový počet dospělých racků je $1 + 6 + 4 + 1 + 2 = 14$ jedinců.

Pro správný výpočet počtu rybníků je nutné použít **`nunique()`** (*number of unique values*).

---
<!-- slide: id=id7 title="Agregace dat: Procedurální vs. Idiomatický přístup" tags="Core" diff="pythonic" -->
## Agregace dat: Postupné plnění vs. `groupby().agg()`

### A. Výukový procedurální přístup (slovník a řazení podle locale):

```python
import locale

locale.setlocale(locale.LC_ALL, ("cs_CZ.UTF-8", "UTF-8"))
output = pd.DataFrame(columns=["DRUH", "DOSPĚLCŮ", "RYBNÍKŮ"])

for druh in sorted(druhy, key=locale.strxfrm):
    if druh == "bez ptáků":
        continue
    vyber = df[df["DRUH_CZ"] == druh]
    output.loc[len(output)] = {
        "DRUH": druh,
        "DOSPĚLCŮ": vyber["DOSPĚLCI"].sum(),
        "RYBNÍKŮ": vyber["RYBNÍK"].nunique(),
    }
```

### B. Moderní a vysoce efektivní přístup v Pandas (`groupby`):

```python
# V idiomatickém Pandas se celá agregace zapíše na jediný řádek:
vysledek = (
    df[df["DRUH_CZ"] != "bez ptáků"]
    .groupby("DRUH_CZ", as_index=False)
    .agg(
        DOSPĚLCŮ=("DOSPĚLCI", "sum"),
        RYBNÍKŮ=("RYBNÍK", "nunique")
    )
    .rename(columns={"DRUH_CZ": "DRUH"})
    .sort_values(by="DOSPĚLCŮ", ascending=False)
)

# Export do Excelu bez číslování indexu:
vysledek.to_excel("_dospelci.xlsx", index=False)
```

Tento přístup je řádově rychlejší a využívá vektorizované interní C rutiny.

---
<!-- slide: id=id8 title="Výsledek" tags="Skip" diff="basics" -->
## Finální agregovaný výstup

Výsledná tabulka po seřazení a exportu do Excelu:

```plain
                   DRUH  DOSPĚLCŮ  RYBNÍKŮ
0         kachna divoká       293       26
1           polák velký        86        9
2     polák chocholačka        81       11
3           labuť velká        52       16
4       kopřivka obecná        52       11
5         potápka roháč        51       12
6            husa velká        34       10
7           lyska černá        34       10
8   zrzohlávka rudozobá        18        9
9      volavka popelavá        18       12
10      racek chechtavý        14        4
11         volavka bílá        14        5
...
```

Exportovaný soubor `_dospelci.xlsx` obsahuje přehlednou manažerskou zprávu připravenou pro ornitologický reporting a další vizualizace v grafech.
