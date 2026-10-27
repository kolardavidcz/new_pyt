<!-- slide: id1, Úvod, Core, pythonic -->
## Úvod do `collections.Counter`: Multimnožina a frekvenční analýza

Třída **`collections.Counter`** je specializovaný podtyp slovníku `dict`, určený k rychlému a paměťově efektivnímu počítání výskytů hešovatelných objektů:

```python
from collections import Counter

counts = Counter('abrakadabra')
print(counts)
# Counter({'a': 5, 'b': 2, 'r': 2, 'k': 1, 'd': 1})
```

Klíčové vlastnosti:
- Klíče reprezentují počítané položky (*elements*), hodnoty reprezentují jejich celočíselné četnosti (*counts*).
- Z matematického hlediska implementuje **multimnožinu** (*multiset* / *bag*).
- Dotaz na prvek, který v čítači není, **nevyvolá `KeyError`**, nýbrž přirozeně vrátí `0`.

---
<!-- slide: id2, Zavedení, Core, pythonic -->
## Způsoby inicializace čítače

`Counter` lze vytvořit z libovolného iterovatelného objektu, mapování i pojmenovaných argumentů:

```python
from collections import Counter

# 1. Prázdný čítač:
c1 = Counter()

# 2. Z iterovatelného objektu (řetězec, seznam, generátor):
c2 = Counter(['jablko', 'hruška', 'jablko', 'banán', 'jablko'])
# Counter({'jablko': 3, 'hruška': 1, 'banán': 1})

# 3. Z existujícího slovníku:
c3 = Counter({'červená': 4, 'modrá': 2})

# 4. Z pojmenovaných argumentů (kwargs):
c4 = Counter(psi=5, kocky=2, kone=1)
```

---
<!-- slide: id3, „elements()“, WOW, pythonic -->
## Metoda `elements()`: Zpětná rekonstrukce sekvence

Metoda **`elements()`** vrací iterátor, který produkuje jednotlivé klíče tolikrát, kolik činí jejich hodnota (opak počítání):

```python
from collections import Counter

c = Counter(a=3, b=2, c=1, d=0, e=-2)

# Prvky jsou produkovány tolikrát, kolik je jejich počet:
print(list(c.elements()))
# ['a', 'a', 'a', 'b', 'b', 'c']
```

> [!NOTE]
> Klíče s **nulovým (`0`) nebo záporným počtem** jsou metodou `elements()` automaticky ignorovány.
> Pořadí odpovídá pořadí prvního vložení prvku do čítače.

---
<!-- slide: id4, „most_common([n])“, WOW, pythonic -->
## Nejčastější prvky: `most_common([n])`

Metoda **`most_common(n)`** vrací $n$ nejfrekventovanějších prvků seřazených sestupně podle počtu výskytů:

```python
from collections import Counter

text = "tři sta třicet tři stříbrných stříkaček stříkalo přes tři sta třicet tři stříbrných střech"
words = text.split()
counter = Counter(words)

# 3 nejčastější slova:
print(counter.most_common(3))
# [('tři', 4), ('třicet', 2), ('sta', 2)]

# Bez parametru n vrátí kompletní seřazený seznam všech dvojic (prvek, počet):
all_ranked = counter.most_common()
```

> [!TIP]
> Metoda `most_common(n)` interně využívá modul `heapq.nlargest()`, takže pro malé $n$ běží v čase $O(k + n \log k)$, aniž by musela řadit celý slovník.

---
<!-- slide: id5, Skládání počtů – metodami, Core, pythonic -->
## Skládání a aktualizace čítačů metodami

Ke skládání a odčítání četností slouží metody `update()` a `subtract()`:

```python
from collections import Counter

c = Counter('abrakadabra')
# Counter({'a': 5, 'b': 2, 'r': 2, 'k': 1, 'd': 1})

# 1. update(): Přičte počty z nového iterovatelného objektu in-place
c.update('ananas')
print(c['a'])
# 8 (původních 5 + 3 z 'ananas')

# 2. subtract(): Odečte počty z iterovatelného objektu in-place
c.subtract('ananas')
print(c['a'])
# 5 (hodnoty mohou klesnout i pod nulu!)
```

> [!WARNING]
> Pozor na rozdíl oproti `dict.update()`: Standardní slovník přepisuje hodnoty novými, zatímco `Counter.update()` **sčítá počty**!

---
<!-- slide: id6, Skládání počtů – operátorově, WOW, pythonic -->
## Množinové operace nad čítači

`Counter` podporuje bohatou sadu operátorů pro multimnožinovou aritmetiku. Zvláštností těchto operátorů je, že **ve výsledku automaticky zahazují nulové a záporné počty**:

```python
from collections import Counter

c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)

# 1. Sčítání (+): c1[x] + c2[x]
print(c1 + c2)
# Counter({'a': 4, 'b': 3})

# 2. Odčítání (-): c1[x] - c2[x] (pouze kladné výsledky)
print(c1 - c2)
# Counter({'a': 2})   # 'b' mělo 1 - 2 = -1, takže je vyřazeno

# 3. Průnik (&): min(c1[x], c2[x])
print(c1 & c2)
# Counter({'a': 1, 'b': 1})

# 4. Sjednocení (|): max(c1[x], c2[x])
print(c1 | c2)
# Counter({'a': 3, 'b': 2})

# 5. Unární plus (+c): Rychlé vyčištění všech nulových a záporných položek!
dirty = Counter(a=2, b=0, c=-5)
clean = +dirty
print(clean)
# Counter({'a': 2})
```

---
<!-- slide: id7, Souvislost (a rozdíly) se slovníkem, Tricky, pythonic -->
## Rozdíly mezi `Counter` a standardním `dict`

1. **Chybějící klíče neházejí `KeyError`**:
   ```python
   c = Counter({'jablko': 2})
   print(c['banán'])  # 0 (žádná výjimka!)
   ```
2. **Metoda `fromkeys()` není podporována**:
   `Counter.fromkeys()` záměrně vyvolá `NotImplementedError`, aby nedošlo k chybnému nastavení jednotné počáteční hodnoty.
3. **Mělká vs. hluboká kopie**:
   Metoda `c.copy()` vytvoří nový čítač s identickými položkami.
4. **Smazání klíče vs. nulový počet**:
   Nastavení `c['a'] = 0` **neodstraní** klíč ze slovníku! Klíč je stále přítomen (např. v `len(c)` nebo `for k in c`). Chcete-li klíč zcela vymazat, použijte `del c['a']`.

---
<!-- slide: id8, Klasické slovníkové metody (přehled), Skip, basics -->
## Standardní mapovací rozhraní

Jelikož `Counter` dědí z `dict`, nabízí všechny známé slovníkové metody a operace:

```python
from collections import Counter

c = Counter(a=10, b=20, c=30)

# 1. Počet unikátních klíčů:
print(len(c))  # 3

# 2. Test přítomnosti klíče:
print('b' in c)  # True

# 3. Procházení položek:
for k, v in c.items():
    print(f"{k} => {v}")

# 4. Pohledy na klíče a hodnoty:
keys = c.keys()
vals = c.values()

# 5. Vyprázdnění:
c.clear()
```

---
<!-- slide: id9, Příklady, Core, pythonic -->
## Praktické vzory a moderní metody

### 1. Celkový počet všech položek: `total()` (Python 3.10+)

Místo dřívějšího idiomu `sum(c.values())` má moderní Python specializovanou a optimalizovanou metodu:

```python
from collections import Counter

c = Counter('abrakadabra')

# Moderní metoda od Pythonu 3.10:
celkem = c.total()
print(f"Celkový počet znaků: {celkem}")
# Celkový počet znaků: 11
```

### 2. Hledání nejméně častých prvků:

```python
# n nejméně častých prvků pomocí reverzního řezu:
least_common_3 = c.most_common()[:-4:-1]
print(least_common_3)
# [('k', 1), ('d', 1), ('b', 2)]
```

### 3. Frekvence slov v souboru:

```python
from collections import Counter
from pathlib import Path

text = Path("log.txt").read_text(encoding="utf-8")
top10 = Counter(text.split()).most_common(10)
```
