<!-- slide: id1, Úvod do dynamických seznamů (list), Skip, basics -->
## Dynamické seznamy (`list`) v Pythonu

Seznam (**`list`**) je nejpopulárnější měnitelná datová struktura v Pythonu.

Představuje **dynamické pole odkazů na objekty**:
- **Heterogenní**: Může v jedné kolekci současně uchovávat celá čísla, řetězce, n-tice i další seznamy.
- **Měnitelné (*mutable*)**: Prvky lze na místě přidávat, odebírat, nahrazovat a řadit bez alokace nového kontejneru.
- **Dynamicky rostoucí**: Velikost pole se automaticky přizpůsobuje počtu prvků.

> [!NOTE] Srovnání s C++ a Javou
> V C++ odpovídá `std::vector<PyObject*>` a v Javě `ArrayList<Object>`.
> V Pythonu však není nutné deklarovat typ ani kapacitu předem.

---
<!-- slide: id2, Zavedení seznamu – literál [] a konstruktor list(), Core, basics -->
## Vytvoření seznamu: literál `[]` a `list()`

Seznam nejčastěji vytváříme literálem v hranatých závorkách `[...]`:

```python
# Různorodé datové typy v jednom seznamu:
prvky = ["Ahoj", 42, 3.14, True, [1, 2]]
print(prvky)
print(type(prvky))  # <class 'list'>
```

Konstruktor `list(iterable)` vytvoří nový seznam mělkou kopií z libovolné iterovatelné kolekce:
```python
# Převod řetězce na seznam jednotlivých znaků:
znaky = list("Python")
print(znaky)  # ['P', 'y', 't', 'h', 'o', 'n']

# Převod n-tice nebo rozsahu:
cisla = list(range(5))
print(cisla)  # [0, 1, 2, 3, 4]
```

---
<!-- slide: id3, Prázdný seznam, Skip, basics -->
## Prázdný seznam

Prázdný seznam inicializujeme literálem `[]` nebo voláním `list()`:

```python
prazdny_1 = []
prazdny_2 = list()

print(len(prazdny_1))   # 0
print(bool(prazdny_1))  # False (prázdný seznam je v podmínkách falsy)
```

> [!TIP] Rychlost: `[]` vs. `list()`
> Literál `[]` se překládá přímo do dedikované instrukce CPython bajtkódu `BUILD_LIST 0`.
> Volání `list()` vyžaduje vyhledání funkce ve jmenném prostoru a režii volání funkce. Literál `[]` je zhruba 2–3× rychlejší.

---
<!-- slide: id4, Seznamy jako sekvence (Indexy a řezy), Core, pythonic -->
## Seznam jako sekvence

Jako plnohodnotná sekvence podporuje seznam všechny známé operace:

```python
xs = ["Ahoj", 123, 456, "svět", 789]

# Délka a náhodný přístup v čase O(1):
print(len(xs))    # 5
print(xs[0])      # 'Ahoj'
print(xs[-1])     # 789 (poslední prvek)

# Výřezy (slicing) – vrací nový mělký seznam:
print(xs[1:3])    # [123, 456]
print(xs[::2])    # ['Ahoj', 456, 789]

# Operátor in (lineární vyhledávání O(n)):
print(123 in xs)  # True

# Spojení (+) a násobení (*):
print([1, 2] * 3) # [1, 2, 1, 2, 1, 2]
```

---
<!-- slide: id5, Iterace přes seznam smyčkou for-in, WOW, pythonic -->
## Iterace přes seznam

Smyčka `for-in` prochází prvky seznamu v garantovaném pořadí:

```python
zvirata = ["pes", "kočka", "králík"]

# 1. Běžný průchod:
for zvíře in zvirata:
    print(zvíře)

# 2. Průchod s indexem (enumerate):
for idx, zvíře in enumerate(zvirata, start=1):
    print(f"{idx}. {zvíře}")

# 3. Průchod v obráceném pořadí:
for zvíře in reversed(zvirata):
    print(zvíře)
```

---
<!-- slide: id6, Mutabilita seznamu a modifikace výřezů, Tricky, pythonic -->
## Změna prvků na místě a přiřazení do výřezu

Seznam je **měnitelný** (*mutable*). Prvky lze přímo přepisovat na základě indexu:

```python
xs = [10, 20, 30, 40]
xs[1] = 99
print(xs)  # [10, 99, 30, 40]
```

### Pokročilé přiřazení do výřezu (*Slice Assignment*):
Do výřezu lze přiřadit jinou sekvenci, čímž můžeme seznam zkrátit, prodloužit nebo nahradit celou část:

```python
cisla = [1, 2, 3, 4, 5]

# Nahrazení indexů 1 až 3 novým seznamem (i různé délky!):
cisla[1:4] = [20, 30]
print(cisla)  # [1, 20, 30, 5]

# Smazání části seznamu přes prázdný výřez:
cisla[1:3] = []
print(cisla)  # [1, 5]

# Vložení prvků bez přepsání (nulový výřez):
cisla[1:1] = [2, 3, 4]
print(cisla)  # [1, 2, 3, 4, 5]
```

---
<!-- slide: id7, Vyhledávání prvků: in, index(), count(), Core, basics -->
## Vyhledávání prvků: `index()` a `count()`

Metody pro inspekci obsahu seznamu:

```python
barvy = ["červená", "zelená", "modrá", "červená"]

# Počet výskytů hodnoty:
print(barvy.count("červená"))  # 2
print(barvy.count("žlutá"))    # 0

# Pozice prvního výskytu:
print(barvy.index("zelená"))   # 1
```

> [!CAUTION] Výjimka ValueError u `index()`
> Pokud prvek v seznamu neexistuje, `index()` vyvolá `ValueError`:
> ```python
> if "žlutá" in barvy:
>     pos = barvy.index("žlutá")
> ```

---
<!-- slide: id8, Přidávání prvků: append(), insert(), extend(), +=, Core, pythonic -->
## Přidávání prvků do seznamu

Pro vkládání dat nabízí `list` čtyři přístupy:

```python
xs = [1, 2]

# 1. append(prvek) – přidá JEDEN objekt na konec v čase O(1) amortizovaně:
xs.append(3)
print(xs)  # [1, 2, 3]

# 2. insert(index, prvek) – vloží prvek na konkrétní pozici (složitost O(n)):
xs.insert(0, "začátek")
print(xs)  # ['začátek', 1, 2, 3]

# 3. extend(iterable) – rozbalí a připojí všechny prvky na konec v čase O(k):
xs.extend([4, 5])
print(xs)  # ['začátek', 1, 2, 3, 4, 5]

# 4. Operátor += (in-place ekvivalent k extend):
xs += [6, 7]
print(xs)  # ['začátek', 1, 2, 3, 4, 5, 6, 7]
```

---
<!-- slide: id9, append() versus extend(), Tricky, resyntax -->
## Klíčový rozdíl: `append()` vs. `extend()`

Častá chyba začátečníků spočívá v záměně metod `append()` a `extend()` při předávání seznamu:

```python
# A) append() přidá CELÝ OBJEKT jako jeden jediný prvek:
xs = [1, 2, 3]
xs.append([4, 5])
print(xs)       # [1, 2, 3, [4, 5]]  <- Vnořený podseznam!
print(len(xs))  # 4

# B) extend() kolekci PROITERUJE a prvky přidá jednotlivě:
ys = [1, 2, 3]
ys.extend([4, 5])
print(ys)       # [1, 2, 3, 4, 5]    <- Plochý seznam!
print(len(ys))  # 5
```

---
<!-- slide: id10, Odebírání prvků: del, pop(), remove(), Core, pythonic -->
## Odebírání prvků: `del`, `pop()`, `remove()`

Python nabízí 3 způsoby mazání prvků podle různých kritérií:

```python
xs = ["a", "b", "c", "d", "b"]

# 1. pop([index]) – odebere prvek na indexu a VRÁTÍ JEHO HODNOTU:
posledni = xs.pop()     # Bez argumentu odebere poslední prvek v čase O(1)
print(posledni, xs)     # 'b', ['a', 'b', 'c', 'd']

prvni = xs.pop(0)       # Odebere nultý prvek (složitost O(n) posunem v paměti)
print(prvni, xs)        # 'a', ['b', 'c', 'd']

# 2. remove(hodnota) – smaže PRVNÍ výskyt podle HODNOTY (vrací None):
xs.remove("c")
print(xs)               # ['b', 'd']

# 3. del xs[index] – příkaz pro smazání podle indexu nebo výřezu:
del xs[0]
print(xs)               # ['d']
```

---
<!-- slide: id11, Obrácení seznamu: reverse() vs. reversed(), Core, basics -->
## Obrácení pořadí: `reverse()` vs. `reversed()`

- **`xs.reverse()`**: Obrátí pořadí prvků **na místě** (*in-place*). Původní seznam je změněn, metoda vrací `None`.
- **`reversed(xs)`**: Vrátí **líný iterátor** přes prvky v opačném směru bez modifikace původního seznamu.
- **`xs[::-1]`**: Vrátí **novou mělkou kopii** seznamu s obrácenými prvky.

```python
cisla = [1, 2, 3, 4]

# In-place obrácení:
cisla.reverse()
print(cisla)  # [4, 3, 2, 1]

# Nemodifikující průchod pozpátku:
for x in reversed([10, 20, 30]):
    print(x, end=" ")
# 30 20 10
```

---
<!-- slide: id12, Řazení seznamu: sort() vs. sorted(), WOW, pythonic -->
## Řazení seznamu: `sort()` vs. `sorted()`

Algoritmus řazení v CPythonu se nazývá **Timsort** (hybridní stabilní řadicí algoritmus s časovou složitostí $O(n \log n)$):

```python
jmena = ["Karel", "Anna", "Zdeněk", "Bára"]

# 1. Metoda list.sort() řadí NA MÍSTĚ (modifikuje původní seznam, vrací None):
jmena.sort()
print(jmena)  # ['Anna', 'Bára', 'Karel', 'Zdeněk']

# 2. Funkce sorted() vrací ZBRUSU NOVÝ seřazený seznam:
cisla = [5, 2, 8, 1]
nova_cisla = sorted(cisla, reverse=True)
print(nova_cisla)  # [8, 5, 2, 1]

# 3. Řazení podle transformační funkce (parametr key=):
slova = ["pes", "automobil", "les"]
slova.sort(key=len)
print(slova)  # ['pes', 'les', 'automobil']
```

---
<!-- slide: id13, Generátorová notace seznamu (List Comprehension I), WOW, pythonic -->
## Generátorová notace seznamu (*List Comprehension*)

Jedna z nejmocnějších a nejpopulárnějších syntaktických konstrukcí v Pythonu. Umožňuje vytvořit a transformovat seznam na jediném řádku:

$$\mathbf{[ \text{Výraz}(x) \;\mathbf{for}\; x \;\mathbf{in}\; \text{Kolekce} ]}$$
$$\mathbf{[ \text{Výraz}(x) \;\mathbf{for}\; x \;\mathbf{in}\; \text{Kolekce} \;\mathbf{if}\; \text{Podmínka}(x) ]}$$

```python
# Klasický imperativní způsob (3 řádky):
ctverce = []
for x in range(6):
    ctverce.append(x**2)

# Idiomatická deklarativní list comprehension:
ctverce = [x**2 for x in range(6)]
print(ctverce)  # [0, 1, 4, 9, 16, 25]
```

Kromě čitelnosti je list comprehension **výrazně rychlejší** než cyklus s `.append()`, protože smyčka probíhá v optimalizovaném C kódu interpretu.

---
<!-- slide: id14, Příklady a filtrování v List Comprehension, WOW, pythonic -->
## Transformace a filtrování dat

Kombinace výrazu a klauzule `if`:

```python
cisla = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Filtrování pouze sudých čísel:
suda = [x for x in cisla if x % 2 == 0]
print(suda)  # [2, 4, 6, 8, 10]

# Ořezání a vyčištění řetězců:
radky = ["  prvni \n", "  DRUHY  ", "treti\t"]
ciste = [r.strip().lower() for r in radky]
print(ciste)  # ['prvni', 'druhy', 'treti']

# Podmíněný výraz uvnitř list comprehension (if-else před for):
status = ["kladné" if x > 0 else "nekladné" for x in [-2, 5, 0, 7]]
print(status)  # ['nekladné', 'kladné', 'nekladné', 'kladné']
```

---
<!-- slide: id15, Pokročilé transformace kolekcí, Skip, pythonic -->
## Mapování přes slovníky v List Comprehension

V generátoru seznamu lze provádět libovolné mapování, lookupy do slovníků i volání externích funkcí:

```python
kurzy = {"EUR": 25.3, "USD": 23.5, "GBP": 30.1}
meny = ["EUR", "USD", "EUR", "GBP"]

# Přepočet na CZK pomocí slovníkového vyhledávání:
hodnoty = [kurzy[m] for m in meny]
print(hodnoty)  # [25.3, 23.5, 25.3, 30.1]
```

---
<!-- slide: id16, Vícenásobná a zplošťovací generátorová notace, Tricky, pythonic -->
## Vícenásobná generátorová notace a zploštění

Uvnitř list comprehension lze zapsat více cyklů `for`. Vyhodnocují se **zleva doprava**, přesně v pořadí, v jakém by byly vnořené v klasickém kódu:

```python
# Kartézský součin dvou vektorů:
barvy = ["červená", "modrá"]
velikosti = ["S", "M", "L"]

kombinace = [f"{b}-{v}" for b in barvy for v in velikosti]
print(kombinace)
# ['červená-S', 'červená-M', 'červená-L', 'modrá-S', 'modrá-M', 'modrá-L']

# Zploštění matice 2D na 1D seznam (flatten):
matice = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
plochy = [prvek for radek in matice for prvek in radek]
print(plochy)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

---
<!-- slide: id17, Seznamy v roli abstraktních datových struktur, Skip, basics -->
## Seznam jako abstraktní datový typ

Díky flexibilním metodám lze `list` snadno použít pro implementaci klasických datových struktur:
- **Zásobník (*Stack / LIFO*)**: Metody `append()` a `pop()`.
- **Fronta (*Queue / FIFO*)**: Metody `append()` a `pop(0)` (pozor na výkon!).

Specializované struktury ve standardní knihovně:
- `collections.deque`: Oboustranná fronta optimalizovaná pro $O(1)$ přidávání i odebírání z obou konců.
- `heapq`: Prioritní fronta nad obyčejným seznamem.
- `array.array`: Homogenní C pole pro úsporu paměti.

---
<!-- slide: id18, Implementace zásobníku (LIFO), Core, basics -->
## Seznam jako Zásobník (*Stack / LIFO*)

Zásobník pracuje na principu *Last-In, First-Out*. Poslední vložený prvek je odebrán jako první:

```python
stack = []

# Vkládání na vrchol zásobníku (Push):
stack.append("stránka_1")
stack.append("stránka_2")
stack.append("stránka_3")

# Odebírání z vrcholu zásobníku (Pop) v čase O(1):
aktualni = stack.pop()
print(aktualni)   # 'stránka_3'
print(stack)      # ['stránka_1', 'stránka_2']

# Nahlédnutí na vrchol bez odebrání (Peek):
vrchol = stack[-1]
print(vrchol)     # 'stránka_2'
```

Všechny operace na konci seznamu (`append`, `pop`, `[-1]`) mají časovou složitost **$O(1)$**.

---
<!-- slide: id19, Implementace fronty (FIFO) a collections.deque, Tricky, paradigm -->
## Seznam jako Fronta (*Queue / FIFO*) a `collections.deque`

Fronta funguje na principu *First-In, First-Out*. První příchozí je první obsloužen:

```python
# NAIVNÍ IMPLEMENTACE POMOCÍ LISTU:
fronta = ["Petr", "Jana"]
fronta.append("Karel")  # Příchozí na konec
obslouzen = fronta.pop(0)  # Odebrání ze začátku -> 'Petr'
```

> [!WARNING] Výkonnostní past: `list.pop(0)` je $O(n)$!
> Seznam v Pythonu je souvislé pole v paměti. Když zavoláte `pop(0)`, **všech zbývajících $n-1$ prvků se musí v paměti posunout o jednu pozici doleva**!
> 
> Pro reálné fronty vždy použijte **`collections.deque`** (obousměrně vázaný seznam), kde jsou operace na začátku i konci zaručeně **$O(1)$**:
> ```python
> from collections import deque
> 
> d = deque(["Petr", "Jana"])
> d.append("Karel")
> obslouzen = d.popleft()  # Bleskové O(1) odebrání ze začátku!
> ```

---
<!-- slide: id20, Vícerozměrné seznamy a záludnost mělkého násobení, Core, basics -->
## Vícerozměrné seznamy a nebezpečí `[[0]*n]*m`

Vícerozměrná pole (matice) reprezentujeme vnořenými seznamy:

```python
matice = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# matice[radek][sloupec]:
print(matice[1][2])  # 6 (druhý řádek, třetí sloupec)
```

> [!CAUTION] Klasická past začátečníků: `[[0] * 3] * 3`
> Operátor `*` vytváří **mělké kopie referencí**! Všechny 3 řádky ukazují na tentýž seznam v paměti:
> ```python
> # ŠPATNĚ:
> spatna_matice = [[0] * 3] * 3
> spatna_matice[0][0] = 99
> print(spatna_matice)
> # [[99, 0, 0], [99, 0, 0], [99, 0, 0]]  <- Přepsaly se všechny řádky najednou!
> 
> # SPRÁVNĚ (vytvoří nezávislý seznam pro každý řádek):
> spravna_matice = [[0] * 3 for _ in range(3)]
> spravna_matice[0][0] = 99
> print(spravna_matice)
> # [[99, 0, 0], [0, 0, 0], [0, 0, 0]]  <- Správné nezávislé řádky!
> ```
