<!-- slide: id1, Úvod, Core, pythonic -->
## Úvod do modulu `itertools`: Vysoce efektivní iterátorové nástroje

Modul **`itertools`** ze standardní knihovny poskytuje sadu rychlých, paměťově úsporných funkcí implementovaných v C, které pracují s proudy dat (*lazy streams*) a generují iterátory:

Hlavní kategorie:
1. **Nekonečné iterátory**: `count()`, `cycle()`, `repeat()`.
2. **Kombinatorické generátory**: `product()`, `permutations()`, `combinations()`, `combinations_with_replacement()`.
3. **Proudové transformace a filtrování**: `accumulate()`, `batched()`, `chain()`, `compress()`, `dropwhile()`, `takewhile()`, `filterfalse()`, `groupby()`, `islice()`, `pairwise()`, `starmap()`, `tee()`, `zip_longest()`.

```python
import itertools
```

> [!NOTE]
> Všechny funkce v `itertools` produkují líné iterátory (*lazy iterators*) s paměťovou náročností $O(1)$ bez ohledu na velikost vstupních dat.

---
<!-- slide: id2, „count(start=0, step=1)“, Core, pythonic -->
## Nekonečný čítač: `itertools.count()`

Funkce **`count(start=0, step=1)`** generuje nekonečnou posloupnost čísel s rovnoměrným krokem:

```python
from itertools import count

# Nekonečná řada začínající na 10 s krokem 5:
for n in count(start=10, step=5):
    if n > 25:
        break
    print(n, end=" ")
# 10 15 20 25
```

Funguje i s desetinnými čísly `float` nebo záporným krokem:
```python
# count s reálnými čísly:
for x in count(0.0, 0.25):
    if x > 1.0:
        break
    print(x, end=" ")
# 0.0 0.25 0.5 0.75 1.0
```

---
<!-- slide: id3, „cycle(I)“, Core, pythonic -->
## Nekonečné opakování sekvence: `itertools.cycle()`

Funkce **`cycle(iterable)`** prochází prvky zadané sekvence a po dosažení konce začne opět od začátku (donekonečna):

```python
from itertools import cycle

# Střídání barev při vykreslování tabulky:
colors = cycle(['bílá', 'šedá'])

for row_id in range(4):
    print(f"Řádek {row_id}: {next(colors)}")
# Řádek 0: bílá
# Řádek 1: šedá
# Řádek 2: bílá
# Řádek 3: šedá
```

> [!WARNING]
> `cycle()` si vnitřně ukládá kopii všech procházených prvků, aby je mohl opakovat. Při předání obrovského nebo nekonečného iterátoru může spotřebovat veškerou paměť RAM!

---
<!-- slide: id4, „repeat(elem, times=None)“, Skip, basics -->
## Konstantní proud: `itertools.repeat()`

Funkce **`repeat(object, [times])`** opakovaně vrací tentýž objekt:

```python
from itertools import repeat

# 1. Omezený počet opakování:
for msg in repeat("Pozor!", 3):
    print(msg)
# Pozor!
# Pozor!
# Pozor!

# 2. Využití s map() pro předání konstantního parametru:
# Výpočet mocnin x^2 pro čísla 0..4
powers = list(map(pow, range(5), repeat(2)))
print(powers)
# [0, 1, 4, 9, 16]
```

---
<!-- slide: id5, „product(*iterables, repeat=1)“, WOW, pythonic -->
## Kartézský součin: `itertools.product()`

Funkce **`product(*iterables, repeat=1)`** počítá kartézský součin vstupních množin (ekvivalent zanořených cyklů `for`):

```python
from itertools import product

# Kartézský součin dvou kolekcí:
suits = ['♠', '♥']
ranks = ['A', 'K']

cards = list(product(suits, ranks))
print(cards)
# [('♠', 'A'), ('♠', 'K'), ('♥', 'A'), ('♥', 'K')]

# Kartézská mocnina pomocí parametru repeat:
# Všechny možné 3bitové kombinace (0 a 1):
bits = list(product([0, 1], repeat=3))
print(bits)
# [(0, 0, 0), (0, 0, 1), (0, 1, 0), (0, 1, 1), (1, 0, 0), (1, 0, 1), (1, 1, 0), (1, 1, 1)]
```

> [!TIP]
> Zápis `product(A, B, C)` je mnohem čistší a plošší než psát tři zanořené smyčky `for a in A: for b in B: for c in C:`.

---
<!-- slide: id6, „permutations(iterable, r=None)“, Core, pythonic -->
## Permutace: `itertools.permutations()`

Funkce **`permutations(iterable, r=None)`** generuje všechny možné uspořádané $r$-tice prvků bez opakování (záleží na pořadí):

Počet variací bez opakování je $V(n, r) = \frac{n!}{(n - r)!}$:

```python
from itertools import permutations

# Všechny permutace 3 prvků (3! = 6):
print(list(permutations('ABC')))
# [('A', 'B', 'C'), ('A', 'C', 'B'), ('B', 'A', 'C'),
#  ('B', 'C', 'A'), ('C', 'A', 'B'), ('C', 'B', 'A')]

# Uspořádané dvojice (r = 2):
print(list(permutations('ABC', 2)))
# [('A', 'B'), ('A', 'C'), ('B', 'A'), ('B', 'C'), ('C', 'A'), ('C', 'B')]
```

---
<!-- slide: id7, „combinations(I, r)“, Core, pythonic -->
## Kombinace bez opakování: `itertools.combinations()`

Funkce **`combinations(iterable, r)`** generuje všechny neuspořádané $r$-prvkové podmnožiny (na pořadí nezáleží):

Počet kombinací je dán kombinačním číslem $\binom{n}{r} = \frac{n!}{r!(n - r)!}$:

```python
from itertools import combinations

# Všechny dvojice ze 4 týmů:
teams = ['A', 'B', 'C', 'D']
matches = list(combinations(teams, 2))
print(matches)
# [('A', 'B'), ('A', 'C'), ('A', 'D'), ('B', 'C'), ('B', 'D'), ('C', 'D')]
```

> [!NOTE]
> Prvky jsou považovány za unikátní podle své **pozice** ve vstupu, nikoli podle hodnoty.

---
<!-- slide: id8, „combinations_with_replacement(I, r)“, Skip, pythonic -->
## Kombinace s opakováním: `itertools.combinations_with_replacement()`

Umožňuje, aby se jednotlivé prvky ve vybrané $r$-tici opakovaly:

Počet kombinací s opakováním je $\binom{n + r - 1}{r}$:

```python
from itertools import combinations_with_replacement

# Hod dvěma nerozlišitelnými mincemi ('H' = Hlava, 'O' = Orel):
coins = list(combinations_with_replacement(['H', 'O'], 2))
print(coins)
# [('H', 'H'), ('H', 'O'), ('O', 'O')]
```

---
<!-- slide: id9, „accumulate()“ (vs „functools.reduce()“), WOW, pythonic -->
## Průběžná akumulace: `itertools.accumulate()`

Zatímco `functools.reduce()` spočítá jediné finální číslo, **`accumulate()`** generuje **všechny postupné mezivýsledky**:

```python
from itertools import accumulate
import operator

numbers = [1, 2, 3, 4, 5]

# 1. Výchozí kumulativní součet (running total):
print(list(accumulate(numbers)))
# [1, 3, 6, 10, 15]

# 2. Kumulativní součin:
print(list(accumulate(numbers, operator.mul)))
# [1, 2, 6, 24, 120]

# 3. Průběžné maximum (running maximum):
data = [3, 1, 4, 1, 5, 9, 2, 6]
print(list(accumulate(data, max)))
# [3, 3, 4, 4, 5, 9, 9, 9]
```

Podporuje také počáteční hodnotu přes `initial=0`.

---
<!-- slide: id10, „batched(I, n)“, WOW, pythonic -->
## Dávkování dat: `itertools.batched()` (Python 3.12+)

Od verze **Python 3.12** nabízí standardní knihovna dlouho očekávanou funkci **`batched(iterable, n)`**, která rozděluje proud dat do n-tic dané velikosti:

```python
from itertools import batched

# Zpracování dat po dávkách o velikosti 3:
data = range(10)
for batch in batched(data, 3):
    print(batch)
# (0, 1, 2)
# (3, 4, 5)
# (6, 7, 8)
# (9,)  -- poslední neúplná dávka
```

Ideální pro:
- Dávkové dotazy do databáze (`BULK INSERT`).
- Volání externích REST API s limitem počtu položek v jednom požadavku.
- Dávkování trénovacích dat v machine learningu (*mini-batches*).

---
<!-- slide: id11, „chain()“, Core, pythonic -->
## Řetězení sekvencí: `itertools.chain()`

Funkce **`chain(*iterables)`** spojí více iterovatelných objektů do jediného sekvenčního proudu bez nutnosti alokovat nový seznam:

```python
from itertools import chain

list1 = [1, 2, 3]
list2 = ['a', 'b']
list3 = [99]

# Prvky jsou čteny líně z jednoho po druhém:
for item in chain(list1, list2, list3):
    print(item, end=" ")
# 1 2 3 a b 99
```

### Zploštění seznamu seznamů: `chain.from_iterable()`
```python
nested = [[1, 2], [3, 4], [5]]
flat = list(chain.from_iterable(nested))
print(flat)
# [1, 2, 3, 4, 5]
```

---
<!-- slide: id12, „compress()“, Core, pythonic -->
## Maskování dat: `itertools.compress()`

Funkce **`compress(data, selectors)`** filtruje prvky z `data` podle odpovídajících pravdivostních hodnot v `selectors`:

```python
from itertools import compress

letters = ['A', 'B', 'C', 'D', 'E', 'F']
mask =    [True, False, True, False, False, True]

print(list(compress(letters, mask)))
# ['A', 'C', 'F']
```

Ekvivalent booleanovského maskování známého z NumPy, ale fungující čistě nad línými Python iterátory.

---
<!-- slide: id13, „dropwhile()“ & „takewhile()“, Core, pythonic -->
## Podmíněné ořezávání: `takewhile()` a `dropwhile()`

- **`takewhile(predicate, iterable)`**: Vrací prvky, dokud predikát platí. Jakmile poprvé narazí na `False`, **okamžitě skončí**.
- **`dropwhile(predicate, iterable)`**: Zahazuje prvky, dokud predikát platí. Jakmile poprvé narazí na `False`, **vrátí tento i všechny zbývající prvky**.

```python
from itertools import takewhile, dropwhile

numbers = [1, 2, 3, 10, 4, 2]

# Bere prvky menší než 5:
print(list(takewhile(lambda x: x < 5, numbers)))
# [1, 2, 3]  (na čísle 10 skončí, 4 a 2 již nezpracuje!)

# Zahazuje prvky menší než 5:
print(list(dropwhile(lambda x: x < 5, numbers)))
# [10, 4, 2]
```

---
<!-- slide: id14, „filterfalse()“ (vs „filter()“), Skip, basics -->
## Inverzní filtr: `itertools.filterfalse()`

Zatímco vestavěná funkce `filter(pred, it)` propouští prvky, pro které predikát vrátí `True`, **`filterfalse()`** propouští pouze ty, kde je výsledek `False`:

```python
from itertools import filterfalse

numbers = range(10)

# Propustí pouze lichá čísla (kde x % 2 == 0 je False):
odds = list(filterfalse(lambda x: x % 2 == 0, numbers))
print(odds)
# [1, 3, 5, 7, 9]
```

---
<!-- slide: id15, „groupby()“, Tricky, pythonic -->
## Seskupování sousedících prvků: `itertools.groupby()`

Funkce **`groupby(iterable, key=None)`** shlukuje po sobě jdoucí prvky se stejným klíčem:

```python
from itertools import groupby

data = "AAAABBBCCDAA"
for key, group in groupby(data):
    print(key, list(group))
# A ['A', 'A', 'A', 'A']
# B ['B', 'B', 'B']
# C ['C', 'C']
# D ['D']
# A ['A', 'A']
```

> [!WARNING]
> **Pozor na řazení (klíčová záludnost!)**:
> `itertools.groupby()` funguje jako linuxový příkaz `uniq`. Seskupuje **pouze sousedící prvky**! Poslední dvě `'A'` vytvořila novou skupinu, protože nebyla vedle prvních `'A'`.
> Pokud chcete seskupit všechny identické hodnoty v celé kolekci, musíte data **nejprve seřadit** podle stejného klíče: `groupby(sorted(data, key=...), key=...)`.

---
<!-- slide: id16, „islice()“, Core, pythonic -->
## Řezy nad iterátory: `itertools.islice()`

Běžné iterátory a generátory nepodporují hranaté závorky `it[start:stop:step]`. Funkce **`islice()`** poskytuje tuto funkcionalitu líně:

```python
from itertools import islice, count

# Prvních 5 sudých čísel z nekonečného čítače:
evens = count(0, 2)
first_five = list(islice(evens, 5))
print(first_five)
# [0, 2, 4, 6, 8]

# islice se startem, stopem a krokem: islice(it, start, stop, step)
odd_slice = list(islice('ABCDEFGHIJKL', 1, 8, 2))
print(odd_slice)
# ['B', 'D', 'F', 'H']
```

> [!NOTE]
> `islice()` nepodporuje záporné indexy, protože proudem dat nelze couvat.

---
<!-- slide: id17, „pairwise()“, WOW, pythonic -->
## Klouzavé dvojice: `itertools.pairwise()` (Python 3.10+)

Od verze **Python 3.10** poskytuje `pairwise(iterable)` překrývající se sousední dvojice:

```python
from itertools import pairwise

# Klouzavé dvojice z posloupnosti:
for a, b in pairwise(['A', 'B', 'C', 'D']):
    print(f"{a} -> {b}")
# A -> B
# B -> C
# C -> D

# Praktické využití: Test, zda je seznam seřazený
numbers = [1, 3, 7, 12, 10]
is_sorted = all(x <= y for x, y in pairwise(numbers))
print("Seřazeno?", is_sorted)
# Seřazeno? False
```

---
<!-- slide: id18, „starmap()“ (vs „map()“), Skip, pythonic -->
## Rozbalování argumentů: `itertools.starmap()`

Zatímco vestavěný `map(f, it1, it2)` očekává argumenty v oddělených sekvencích, **`starmap(f, iterable)`** očekává, že jednotlivé n-tice argumentů jsou již zabaleny ve vstupním iterátoru (ekvivalent volání `f(*args)`):

```python
from itertools import starmap

# Seznam dvojic (základ, exponent)
pairs = [(2, 5), (3, 2), (10, 3)]

# starmap předá dvojici jako dva samostatné argumenty: pow(2, 5), pow(3, 2), ...
results = list(starmap(pow, pairs))
print(results)
# [32, 9, 1000]
```

---
<!-- slide: id19, „tee(iterable)“, Core, newconcept -->
## Rozvětvení iterátoru: `itertools.tee()`

V Pythonu lze iterátor projít pouze jednou — po dočtení na konec je vyčerpán. Funkce **`tee(iterable, n=2)`** vytvoří $n$ nezávislých iterátorů nad stejným zdrojem:

```python
from itertools import tee

data = range(5)
it1, it2 = tee(data, 2)

print("it1:", list(it1))
# it1: [0, 1, 2, 3, 4]

print("it2:", list(it2))
# it2: [0, 1, 2, 3, 4]
```

> [!CAUTION]
> `tee()` interně ukládá prvky do pomocné mezipaměti, pokud jeden z iterátorů postupuje výrazně rychleji než druhý. Pokud jeden iterátor vyčerpáte celý a druhý necháte stát, paměťová výhoda se ztratí.

---
<!-- slide: id20, „tee(iterable, n=N)“, Tricky, newconcept -->
## Pokročilé techniky s `tee()`: Nahlížení dopředu (*Lookahead*)

`tee()` umožňuje vytvořit "nahlížecí" iterátor (*lookahead iterator*), aniž bychom konzumovali hlavní proud:

```python
from itertools import tee

def peekable(iterable):
    """Iterátor s možností nahlédnout na příští prvek."""
    main_it, look_it = tee(iterable)
    return main_it, look_it

stream, lookahead = peekable(range(10))

# Nahlédneme dopředu o 1 krok:
next(lookahead)
print("Příští prvek bude:", next(lookahead))
# Příští prvek bude: 1

# Hlavní stream je stále na začátku:
print("Skutečný odběr:", next(stream))
# Skutečný odběr: 0
```

---
<!-- slide: id21, „zip_longest()“ (vs „zip()“), Core, pythonic -->
## Zipování s výplní: `itertools.zip_longest()`

Standardní `zip()` se ukončí, jakmile se vyčerpá **nejkratší** vstup. Naproti tomu **`zip_longest()`** pokračuje až do vyčerpání **nejdelšího** vstupu a chybějící hodnoty doplňuje parametrem `fillvalue`:

```python
from itertools import zip_longest

names = ['Alice', 'Bob', 'Cyril', 'David']
scores = [100, 95]

# Standardní zip zahodí Cyrila i Davida:
print(list(zip(names, scores)))
# [('Alice', 100), ('Bob', 95)]

# zip_longest doplní None (nebo zadanou fillvalue):
print(list(zip_longest(names, scores, fillvalue='N/A')))
# [('Alice', 100), ('Bob', 95), ('Cyril', 'N/A'), ('David', 'N/A')]
```
