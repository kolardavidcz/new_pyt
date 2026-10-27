<!-- slide: id1, Úvod, Skip, basics -->
## Úvod do případové studie: Pozorování v Klementinu

Jak jsme si ukázali v [přednášce o Pandas](#id1), knihovna **Pandas** vyniká zejména při reálné práci s rozsáhlými tabulkami a časovými řadami.

Tato přednáška je praktickou případovou studií zaměřenou na zpracování [historických meteorologických pozorování z pražského Klementina](https://www.chmi.cz/historicka-data/pocasi/praha-klementinum).

Tato data jsou celosvětově unikátní:
- Průměrnou denní teplotu a extrémy vzduchu zaznamenávají nepřetržitě již od **roku 1775**.
- Od roku 1804 evidují také denní úhrn srážek.
- Jedná se o ucelenou řadu více než **90 000 po sobě jdoucích dnů**, což z ní činí fascinující podklad pro analýzu dlouhodobých klimatických změn a vlivu městského tepelného ostrova.

> [!NOTE]
> Datový soubor ČHMÚ pro tuto přednášku pokrývá období od 1. 1. 1775 do 31. 12. 2023.

---
<!-- slide: id2, Načtení dat z Excelu, WOW, pythonic -->
## Načtení dat: `pd.read_excel()` a prvotní inspekce

ČHMÚ poskytuje data ve formátu XLSX se čtyřmi listy. Klíčová tabulka leží na třetím listu s názvem `data`. K načtení slouží `pd.read_excel()` (vyžaduje balíček `openpyxl` nebo `calamine`):

```python
import pandas as pd

# Načtení konkrétního listu z excelovského souboru
df = pd.read_excel("PKLM_pro_portal.xlsx", sheet_name="data")

# 1. Rychlý náhled na data
print(df.head())
#     rok  měsíc  den  T-AVG   TMA   TMI  SRA Flag
# 0  1775      1    1   -7.0  -4.8 -10.1  NaN  NaN
# 1  1775      1    2   -2.2  -1.4  -5.8  NaN  NaN
# 2  1775      1    3   -1.0   0.6  -2.2  NaN  NaN

# 2. Technické informace o sloupcích a paměti
df.info()
# <class 'pandas.core.frame.DataFrame'>
# RangeIndex: 90945 entries, 0 to 90944
# Data columns (total 8 columns):
#  #   Column  Non-Null Count  Dtype  
# ---  ------  --------------  -----  
#  0   rok     90945 non-null  int64  
#  1   měsíc   90945 non-null  int64  
#  2   den     90945 non-null  int64  
#  3   T-AVG   90945 non-null  float64
#  4   TMA     90945 non-null  float64
#  5   TMI     90945 non-null  float64
#  6   SRA     80202 non-null  float64
#  7   Flag    6022 non-null   object 
# dtypes: float64(4), int64(3), object(1)
# memory usage: 5.6+ MB
```

Význam klíčových sloupců:
- `T-AVG`: Průměrná denní teplota (°C)
- `TMA`: Maximální naměřená denní teplota (°C)
- `TMI`: Minimální naměřená denní teplota (°C)
- `SRA`: Úhrn srážek v milimetrech (zaznamenáván od roku 1804, dřívější data jsou `NaN`)

---
<!-- slide: id3, Čištění dat a indexace časové řady, Core, pythonic -->
## Vytvoření časové řady: `pd.to_datetime` a `DatetimeIndex`

Sloupce `rok`, `měsíc` a `den` reprezentují časový údaj odděleně. Abychom mohli využívat časovou navigaci a resamplování, sloučíme je do plnohodnotného objektu `datetime64` a nastavíme jej jako index:

```python
# 1. Konstrukce datumu ze tří sloupců tabulky
df['datum'] = pd.to_datetime({
    'year': df['rok'],
    'month': df['měsíc'],
    'day': df['den']
})

# 2. Nastavení datumu jako primárního indexu DataFrame
df.set_index('datum', inplace=True)

# 3. Vyčištění nepotřebných sloupců
df.drop(columns=['rok', 'měsíc', 'den', 'Flag'], inplace=True)
df['SRA'] = df['SRA'].fillna(0.0)  # Před rokem 1804 nahradíme NaN nulou

print(df.head())
#              T-AVG   TMA   TMI  SRA
# datum                               
# 1775-01-01    -7.0  -4.8 -10.1  0.0
# 1775-01-02    -2.2  -1.4  -5.8  0.0
# 1775-01-03    -1.0   0.6  -2.2  0.0
```

> [!TIP]
> **Síla `DatetimeIndex`**: Nyní můžeme přímo vybírat časové úseky intuitivní textovou syntaxí:
> - `df.loc['1929-02']` — vybere celý únor legendární kruté zimy roku 1929.
> - `df.loc['2000':]` — vybere všechna měření od 1. ledna 2000 do současnosti.

---
<!-- slide: id4, Hledání teplotních extrémů a anomálií, Core, pythonic -->
## Teplotní extrémy: `idxmax`, `idxmin` a filtrace

Díky vektorizovaným funkcím snadno najdeme absolutní rekordy za celých téměř 250 let měření:

```python
# Hledání dne s absolutně nejvyšší naměřenou teplotou
hottest_day = df.loc[df['TMA'].idxmax()]
print(f"Historické maximum: {hottest_day['TMA']} °C dne {df['TMA'].idxmax().strftime('%d. %m. %Y')}")
# Historické maximum: 37.8 °C dne 27. 07. 1983

# Hledání dne s nejnižší naměřenou noční teplotou
coldest_day = df.loc[df['TMI'].idxmin()]
print(f"Historické minimum: {coldest_day['TMI']} °C dne {df['TMI'].idxmin().strftime('%d. %m. %Y')}")
# Historické minimum: -27.6 °C dne 01. 03. 1785 (únor/březen 1785 a 1929)
```

### Klimatologické kategorie pomocí masek

```python
# Mrazový den (TMI <= 0 °C):
frost_days = (df['TMI'] <= 0).sum()

# Ledový den (TMA < 0 °C): celodenní mráz
ice_days = (df['TMA'] < 0).sum()

# Letní den (TMA >= 25 °C):
summer_days = (df['TMA'] >= 25).sum()

# Tropický den (TMA >= 30 °C):
tropical_days = (df['TMA'] >= 30).sum()

# Tropická noc (TMI >= 20 °C):
tropical_nights = (df['TMI'] >= 20).sum()

print(f"Tropických nocí celkem: {tropical_nights}")
```

---
<!-- slide: id5, Agregace a seskupování, Core, pythonic -->
## Agregace časových dat: `resample()` a `groupby()`

V časových řadách Pandas nahrazuje metodu `groupby()` specializovaná metoda `resample()`. Ta umožňuje převzorkovat frekvenci časové řady (denní → měsíční → roční):

```python
# 1. Výpočet průměrné roční teploty (Moderní kód 'YE' = Year End, dříve 'Y')
annual_temp = df['T-AVG'].resample('YE').mean()

# 5 nejteplejších let v historii Klementina:
print("Nejteplejší roky:")
print(annual_temp.nlargest(5).round(2))
# datum
# 2018-12-31    12.80
# 2023-12-31    12.79
# 2019-12-31    12.63
# 2014-12-31    12.51
# 2015-12-31    12.48

# 5 nejchladnějších let v historii Klementina:
print("\nNejchladnější roky:")
print(annual_temp.nsmallest(5).round(2))
# 1829-12-31    7.18
# 1871-12-31    7.42
# 1838-12-31    7.54
```

### Měsíční klimatologický profil

Chceme-li zjistit typický průběh roku, seskupíme data podle kalendářního měsíce (`index.month`):

```python
# Seskupení podle měsíce (1 až 12)
monthly_climate = df.groupby(df.index.month)[['T-AVG', 'TMA', 'TMI', 'SRA']].mean()
print(monthly_climate.round(1))
```

---
<!-- slide: id6, Klouzavé průměry a klimatický trend, WOW, newconcept -->
## Analýza dlouhodobého trendu: `rolling()` a Matplotlib

Jednotlivé roky vykazují značnou meteorologickou variabilitu. Abychom odhalili skutečný sekulární trend, vyhladíme data pomocí **klouzavého průměru** (`rolling`):

```python
import matplotlib.pyplot as plt

# 1. Roční průměrné teploty
annual = df['T-AVG'].resample('YE').mean()

# 2. 10letý a 30letý klouzavý průměr (klimatický normál)
rolling_10 = annual.rolling(window=10, center=True).mean()
rolling_30 = annual.rolling(window=30, center=True).mean()

# 3. Vykreslení grafu
plt.figure(figsize=(12, 6))
plt.plot(annual.index.year, annual, color='lightgray', alpha=0.7, label='Roční průměr')
plt.plot(rolling_10.index.year, rolling_10, color='orange', linewidth=1.5, label='10letý klouzavý průměr')
plt.plot(rolling_30.index.year, rolling_30, color='crimson', linewidth=2.5, label='30letý trend (Klimatologický)')

plt.title('Teplotní vývoj v Praze Klementinu (1775–2023)', fontsize=14)
plt.xlabel('Rok', fontsize=12)
plt.ylabel('Průměrná roční teplota (°C)', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()
plt.tight_layout()
plt.show()
```

> [!NOTE]
> Z grafu 30letého klouzavého průměru je zřejmý výrazný vzestup průměrné teploty od poloviny 20. století z cca $9.5\text{ }^\circ\text{C}$ na současných více než $12.0\text{ }^\circ\text{C}$, způsobený kombinací globálního oteplování a rozrůstáním pražské zástavby.
