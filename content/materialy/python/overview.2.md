<!-- slide: id=id1 title="Ukázka – QuickSort" tags="WOW" diff="pythonic" -->
## Expresivita jazyka: Algoritmus QuickSort

Jazyk Python se vyznačuje vysokou čitelností, elegancí a vyjadřovací silou. Následující implementace řadicího algoritmu **QuickSort** ukazuje sílu seznamových generátorů (*list comprehensions*):

```python
def qs(a: list[int]) -> list[int]:
    if not a:
        return []
    pivot = a[0]
    left = [x for x in a[1:] if x < pivot]
    right = [x for x in a[1:] if x >= pivot]
    return qs(left) + [pivot] + qs(right)

print(qs([5, 2, 9, 1, 7, 6, 3]))  # [1, 2, 3, 5, 6, 7, 9]
```

Celý řadicí algoritmus včetně rozdělení pole a rekurzivního sestavení je vyjádřen na pouhých 6 řádcích kódu.

---
<!-- slide: id=id2 title="PS: Spouštění Python'u" tags="Core" diff="basics" -->
## Spouštění Pythonu: Skripty vs. Interaktivní REPL

Python programy lze spouštět dvěma základními způsoby:

1. **Vykonání skriptu ze souboru**:
   ```bash
   python main.py
   # Na systémech Linux / macOS s více verzemi:
   python3 main.py
   ```
2. **Interaktivní režim (REPL – Read-Eval-Print-Loop)**:
   - Spustí se prostým zadáním `python` bez parametrů.
   - Poslední výraz je automaticky vyhodnocen a vypsán na obrazovku (není nutné psát `print()`).
   - Ukončení: příkaz `exit()`, `quit()`, nebo klávesová zkratka `Ctrl+D` (Linux/macOS) či `Ctrl+Z` + Enter (Windows).

---
<!-- slide: id=id3 title="Proměnné, operátory, typy" tags="Core" diff="basics" -->
## Proměnné, operátory a dynamický typový systém

V Pythonu jsou proměnné pouhými **pojmenovanými referencemi na objekty v paměti**:

- **Dynamické typování**: Proměnné se nedeklarují uvedením typu. Typ je svázán se samotnou hodnotou (objektem), nikoli s proměnnou.
- **Garbage Collector**: Jakmile na objekt v paměti přestane odkazovat jakákoliv proměnná, Python jej automaticky uvolní z paměti (*reference counting + cyklický GC*).
- **Priorita operátorů**: Python dodržuje standardní matematickou hierarchii operátorů (závorky mají nejvyšší prioritu, poté mocnění, násobení/dělení a sčítání/odčítání).

---
<!-- slide: id=id4 title="Čísla (interaktivně)" tags="Tricky" diff="resyntax" -->
## Celočíselné a reálné operace (REPL)

Práce s čísly v interaktivním interpretu:

```pycon
>>> a = 5
>>> b = 3
>>> a + b
8
>>> type(a)
<class 'int'>

>>> a += 4          # zkratka za a = a + 4
>>> a
9

>>> c = 1.5
>>> type(c + a)     # sčítání int a float vrací float
<class 'float'>

>>> 5 / 2           # reálné dělení (vždy vrací float)
2.5
>>> 5 // 2          # celočíselné dělení (oříznutí dolů)
2
>>> 5 % 2           # zbytek po dělení (modulo)
1
>>> 5 ** 2          # mocnění (5 na druhou)
25
```

---
<!-- slide: id=id5 title="Čísla (ve skriptu)" tags="Skip" diff="basics" -->
## Číselné operace v externím skriptu

Při spouštění ze skriptu musíme výstupy explicitně předat funkci `print()`:

```python
a = 5
b = 3
print("Součet:", a + b)

# Typy objektů
print("Typ celého čísla:", type(a))
print("Typ desetinného čísla:", type(1.5))

# Dělení
print("Reálné dělení 5 / 2 =", 5 / 2)
print("Celočíselné dělení 5 // 2 =", 5 // 2)
print("Modulo 5 % 2 =", 5 % 2)
print("Mocnina 5 ** 2 =", 5 ** 2)
```

Výstup skriptu na konzoli:
```plain
Součet: 8
Typ celého čísla: <class 'int'>
Typ desetinného čísla: <class 'float'>
Reálné dělení 5 / 2 = 2.5
Celočíselné dělení 5 // 2 = 2
Modulo 5 % 2 = 1
Mocnina 5 ** 2 = 25
```

---
<!-- slide: id=id6 title="Příklady – aritmetika" tags="Skip" diff="basics" -->
## Procvičení: Aritmetické výpočty

1. **Součet čísel**:
   ```python
   print(3 + 4 + 5)  # 12
   ```
2. **Pythagorova věta ($3^2 + 4^2 = 5^2$)**:
   ```python
   print(3**2 + 4**2 == 5**2)  # True (9 + 16 == 25)
   ```
3. **Dělení 51 sedmi**:
   ```python
   print("Reálně:", 51 / 7)      # 7.2857...
   print("Celočíselně:", 51 // 7) # 7
   print("Zbytek:", 51 % 7)       # 2 (protože 7*7 + 2 = 51)
   ```

---
<!-- slide: id=id7 title="Řetězce (interaktivně)" tags="Core" diff="resyntax" -->
## Textové řetězce: Indexace a délka

Řetězec (`str`) je neměnná sekvence znaků v kódování Unicode:

```pycon
>>> s = "ahoj"
>>> type(s)
<class 'str'>

>>> s + " světe"     # spojování řetězců (konkatenace)
'ahoj světe'

>>> len(s)           # počet znaků
4

>>> s[0]             # indexování od nuly (první znak)
'a'
>>> s[-1]            # záporné indexování od konce (poslední znak)
'j'
>>> s[-2]            # předposlední znak
'o'
```

---
<!-- slide: id=id8 title="Řetězce (ve skriptu)" tags="Skip" diff="basics" -->
## Formátování řetězců ve skriptu

```python
pozdrav = "ahoj"
cil = "světe"

# Moderní f-string (doporučený standard od Pythonu 3.6+):
zprava = f"{pozdrav.capitalize()}, {cil}! Délka: {len(pozdrav)} znaků."
print(zprava)

# Indexace a ořezy:
print("První znak:", pozdrav[0])
print("Poslední znak:", pozdrav[-1])
print("Podřetězec [1:3]:", pozdrav[1:3])  # 'ho'
```

Výstup skriptu:
```plain
Ahoj, světe! Délka: 4 znaků.
První znak: a
Poslední znak: j
Podřetězec [1:3]: ho
```

---
<!-- slide: id=id9 title="Příklady – řetězce" tags="Skip" diff="basics" -->
## Procvičení: Manipulace s textem

Předpokládejme proměnnou se jménem `jmeno = "Antigravity"`:

1. **Počet znaků**: `len(jmeno)` -> `11`.
2. **První znak**: `jmeno[0]` -> `'A'`.
3. **Druhý znak**: `jmeno[1]` -> `'n'`.
4. **Poslední znak**: `jmeno[-1]` -> `'y'`.
5. **Předposlední znak**: `jmeno[-2]` -> `'t'`.
6. **Obrácení řetězce pozpátku**: `jmeno[::-1]` -> `'ytivargitnA'`.

---
<!-- slide: id=id10 title="Přiřazení, porovnávání" tags="Tricky" diff="paradigm" -->
## Pokročilá přiřazení a test identity `is` vs. rovnosti `==`

### Vícenásobné a paralelní přiřazení:
```python
a = b = 0            # obě proměnné ukazují na stejný int 0
x, y = 10, 20        # rozbalení n-tice (tuple unpacking)
x, y = y, x          # prohození hodnot proměnných bez pomocné proměnné!
```

### Rozdíl mezi hodnotou (`==`) a identitou (`is`):
- **`==`**: porovnává **hodnotu** (ekvivalenci obsahu).
- **`is`**: porovnává **identitu** v paměti RAM (`id(a) == id(b)`).

```python
# Seznamy jsou proměnné objekty (mutable):
seznam1 = [1, 2]
seznam2 = [1, 2]
print(seznam1 == seznam2)  # True (mají stejný obsah)
print(seznam1 is seznam2)  # False (jsou to dva různé seznamy v paměti)
```

---
<!-- slide: id=id11 title="Rozhodování if-else I" tags="Core" diff="resyntax" -->
## Větvení kódu: `if`, `elif`, `else`

Řízení toku programu na základě logických podmínek:

```python
vek = 20

if vek < 12:
    kategorie = "Dítě"
elif vek < 18:
    kategorie = "Mladistvý"
elif vek < 65:
    kategorie = "Dospělý"
else:
    kategorie = "Senior"

print("Kategorie:", kategorie)
```

Odsazení kódu (standardně 4 mezery) určuje tělo bloku. Žádné složené závorky `{}` se nepoužívají.

---
<!-- slide: id=id12 title="Rozhodování if-else II" tags="WOW" diff="pythonic" -->
## Složené podmínky a zřetězené porovnávání

Logické operátory v Pythonu jsou anglická slova **`and`**, **`or`**, **`not`**:

```python
# 1. Zřetězené porovnání (Chained comparison):
n = 42
if 0 < n <= 100:
    print("Číslo je v intervalu (0, 100]")

# Ekvivalent tradičního upovídaného zápisu:
# if (0 < n) and (n <= 100):
```

### Priorita logických operátorů:
1. Relační operátory (`<`, `>`, `==`, `!=`, `in`, `is`)
2. `not`
3. `and`
4. `or`

Výraz `False and False or True` se vyhodnotí jako `(False and False) or True` -> `True`.

---
<!-- slide: id=id13 title="Příklady – podmínky" tags="Skip" diff="basics" -->
## Procvičení: Logické větvení

Nalezení maxima ze dvou čísel:
```python
a = 15
b = 25

# Standardní větvicí příkaz:
if a > b:
    maximum = a
else:
    maximum = b

# Pythonic ternární výraz (podmíněný výraz na jeden řádek):
maximum = a if a > b else b
print(f"Větší z čísel {a} a {b} je {maximum}.")
```

Operátor `in` pro vyhledávání:
```python
ovoce = "jablko"
if ovoce in ("jablko", "hruška", "švestka"):
    print("Tuzemské ovoce")
```

---
<!-- slide: id=id14 title="Cyklus while I" tags="Tricky" diff="paradigm" -->
## Podmíněný cyklus: `while`

Cyklus `while` opakuje blok příkazů, dokud je podmínka pravdivá:

```python
i = 0
while i < 5:
    print(i, end=" ")
    i += 1
print("\nPo skončení smyčky má i hodnotu:", i)
```

Výstup:
```plain
0 1 2 3 4 
Po skončení smyčky má i hodnotu: 5
```

Řídicí proměnná `i` zůstává po opuštění smyčky definována v lokálním jmenném prostoru s poslední dosaženou hodnotou.

---
<!-- slide: id=id15 title="Cyklus while II" tags="Core" diff="basics" -->
## Řízení běhu smyčky: `break` a `continue`

- **`break`**: okamžitě ukončí celou smyčku a předá řízení za její konec.
- **`continue`**: okamžitě přeskočí zbytek těla v aktuálním kole a skočí na vyhodnocení podmínky dalšího kola.

```python
i = 0
while i < 10:
    i += 1
    if i % 2 == 0:
        continue  # přeskočí sudá čísla
    if i > 7:
        break     # ukončí smyčku při překročení 7
    print(i, end=" ")
```

Výstup: `1 3 5 7`

---
<!-- slide: id=id16 title="Cyklus while III" tags="Already Studied" diff="pythonic" -->
## Větev `else` u cyklu `while`

Python podporuje větev **`else` přímo u cyklu**:

```python
cislo = 7
delitel = 2

while delitel < cislo:
    if cislo % delitel == 0:
        print(f"{cislo} je dělitelné číslem {delitel}")
        break
    delitel += 1
else:
    # Provede se POUZE tehdy, pokud smyčka doběhla přirozeně bez breaku!
    print(f"{cislo} je prvočíslo.")
```

Pokud cyklus vyskočí příkazem `break`, větev `else` se ignoruje.

---
<!-- slide: id=id17 title="Příklady – while" tags="Skip" diff="basics" -->
## Procvičení: Cyklus while

1. **Sestupná řada od 5 do 1**:
   ```python
   n = 5
   while n > 0:
       print(n, end=" ")
       n -= 1
   ```
2. **Průchod znaky řetězce pomocí indexu**:
   ```python
   text = "Python"
   idx = 0
   while idx < len(text):
       print(f"Pozice {idx}: {text[idx]}")
       idx += 1
   ```

---
<!-- slide: id=id18 title="Cyklus for-in I" tags="Tricky" diff="paradigm" -->
## Iterační cyklus: `for ... in`

Na rozdíl od jazyků C/Java není `for` v Pythonu čítačovým cyklem, ale **univerzálním iterátorem přes sekvence a kolekce**:

```python
# 1. Iterace přes seznam řetězců:
for slovo in ["vítejte", "ve", "světě", "Pythonu"]:
    print(slovo, end=" ")
print()

# 2. Iterace přes jednotlivé znaky řetězce:
for znak in "Ahoj":
    print(znak)
```

Smyčka postupně vyzvedává jednotlivé prvky ze zadaného iterovatelného objektu.

---
<!-- slide: id=id19 title="Cyklus for-in II" tags="Core" diff="basics" -->
## Číselné rozsahy: `range()` ve for smyčce

Pokud potřebujeme provést smyčku $N$-krát, zkombinujeme `for` s generátorem `range()`:

```python
# Čísla 0 až 4:
for i in range(5):
    print(i, end=" ")
print()

# Součet čísel od 1 do 10:
soucet = 0
for i in range(1, 11):
    soucet += i
print("Součet 1..10 je:", soucet)  # 55
```

---
<!-- slide: id=id20 title="Cyklus for-in III" tags="Core" diff="basics" -->
## Přerušení a přeskočení ve for smyčce

Příkazy `break` a `continue` fungují ve `for` smyčce naprosto stejně jako ve `while`:

```python
for i in range(1, 10):
    if i % 2 == 0:
        continue  # přeskočí sudá čísla
    if i == 7:
        break     # zastaví smyčku při i == 7
    print(i, end=" ")
```

Výstup: `1 3 5`

---
<!-- slide: id=id21 title="Cyklus for-in IV" tags="Already Studied" diff="pythonic" -->
## Větev `else` u cyklu `for-in`

Větev `else` se provede pouze v případě, že sekvence byla celá vyčerpána bez předčasného přerušení pomocí `break`:

```python
hledany = 13
cisla = [2, 4, 6, 8, 10]

for x in cisla:
    if x == hledany:
        print("Nalezeno!")
        break
else:
    print(f"Číslo {hledany} se v seznamu nenachází.")
```

Tento vzor eliminuje potřebu pomocných boolean příznaků (`found = False`).

---
<!-- slide: id=id22 title="Příklady – for" tags="Skip" diff="basics" -->
## Procvičení: Smyčky for-in

Výpočet aritmetického průměru číselné řady:
```python
hodnoty = [12, 18, 24, 30]
soucet = 0

for h in hodnoty:
    soucet += h

prumer = soucet / len(hodnoty)
print("Průměr:", prumer)  # 21.0

# V idiomatickém Pythonu:
# prumer = sum(hodnoty) / len(hodnoty)
```

---
<!-- slide: id=id23 title="range()" tags="WOW" diff="pythonic" -->
## Detailní pohled na `range()`

Funkce `range()` přijímá až tři argumenty: `range([start], stop, [step])`:

```pycon
>>> list(range(5))          # start=0 (výchozí), stop=5
[0, 1, 2, 3, 4]

>>> list(range(3, 8))       # start=3, stop=8 (8 není zahrnuto)
[3, 4, 5, 6, 7]

>>> list(range(1, 10, 2))   # krok=2 (lichá čísla)
[1, 3, 5, 7, 9]

>>> list(range(10, 0, -2))  # záporný krok (sestupná řada)
[10, 8, 6, 4, 2]
```

`range` je neměnná sekvence s paměťovou náročností $O(1)$ bez ohledu na velikost rozsahu.

---
<!-- slide: id=id24 title="Příklady – range" tags="Skip" diff="basics" -->
## Procvičení: Generování řad pomocí `range`

1. **Čísla od 0 do 7**: `list(range(8))` -> `[0, 1, 2, 3, 4, 5, 6, 7]`
2. **Čísla od 3 do 9**: `list(range(3, 10))` -> `[3, 4, 5, 6, 7, 8, 9]`
3. **Lichá čísla od 11 do 19**: `list(range(11, 20, 2))`
4. **Sestupně od 10 do 1**: `list(range(10, 0, -1))`

---
<!-- slide: id=id25 title="O funkcích I" tags="Skip" diff="basics" -->
## Funkce: Základní stavební kámen abstrakce

Funkce umožňují strukturovat kód, zabránit duplicitám (princip DRY – *Don't Repeat Yourself*) a skrýt složité detaily za čisté rozhraní.

### Kategorie funkcí v Pythonu:
1. **Vestavěné funkce (*Built-in*)**: dostupné okamžitě bez importu (`print()`, `len()`, `range()`, `type()`).
2. **Knihovní funkce (*Standard Library*)**: dostupné po načtení modulu (`math.sqrt()`, `json.loads()`).
3. **Uživatelské funkce**: vytvořené programátorem pomocí klíčového slova `def`.

---
<!-- slide: id=id26 title="O funkcích II" tags="Core" diff="basics" -->
## Anatomie a chování funkcí

Funkce v Pythonu:
- Mohou přijímat libovolný počet parametrů.
- Mohou provádět vedlejší účinky (*side effects*, např. zápis do souboru, výpis do konzole).
- **Vždy vracejí hodnotu**: pokud funkce neobsahuje explicitní `return`, automaticky vrátí hodnotu **`None`**.

---
<!-- slide: id=id27 title="Funkce vestavěné" tags="Skip" diff="basics" -->
## Bohatost vestavěných funkcí CPythonu

Python obsahuje přes 70 vestavěných funkcí přímo v globálním jmenném prostoru:
- Matematické: `abs()`, `round()`, `min()`, `max()`, `sum()`, `pow()`.
- Typové konverze: `int()`, `float()`, `str()`, `bool()`, `list()`, `dict()`, `set()`, `tuple()`.
- Iterátory: `enumerate()`, `zip()`, `reversed()`, `sorted()`, `filter()`, `map()`.
- Introspekce: `dir()`, `help()`, `id()`, `isinstance()`, `issubclass()`, `callable()`.

---
<!-- slide: id=id28 title="Funkce vestavěné – nulový jmenný prostor" tags="Tricky" diff="paradigm" -->
## Funkce jako objekty první kategorie (First-Class Citizens)

V Pythonu je **funkce plnohodnotným objektem**:

```python
# Zavolání funkce (kulaté závorky):
delka = len("Ahoj")

# Reference na objekt funkce (BEZ závorek):
f = len
print(type(f))      # <class 'builtin_function_or_method'>
print(f("Svět"))    # 4 (volání funkce přes novou proměnnou)
```

Funkce lze předávat jako argumenty do jiných funkcí, vracet je jako návratové hodnoty (dekorátory) i ukládat do datových struktur.

---
<!-- slide: id=id29 title="Funkce vestavěné – v modulech" tags="Core" diff="resyntax" -->
## Moduly a jmenné prostory: `import`

Pro organizaci funkcí do logických celků slouží **moduly**:

```python
import math

print(math.pi)              # 3.141592653589793
print(math.sqrt(16))        # 4.0
print(math.sin(math.pi / 2)) # 1.0
```

Použití tečkové notace `modul.funkce()` zabraňuje kolizím názvů v globálním prostoru.

---
<!-- slide: id=id30 title="Funkce I" tags="Core" diff="resyntax" -->
## Definice vlastní funkce: `def`

Uživatelská funkce se uvozuje klíčovým slovem **`def`**:

```python
def pozdrav():
    print("Ahoj z vlastní funkce!")

# Volání funkce:
pozdrav()
```

Kód v těle funkce se zkompiluje při načtení souboru, ale vykoná se až při jejím explicitním zavolání.

---
<!-- slide: id=id31 title="Funkce II" tags="Core" diff="basics" -->
## Implicitní návratová hodnota `None`

Pokud funkce neobsahuje příkaz `return`, vrátí speciální singleton `None`:

```python
def tiskni_zpravu(text: str):
    print("Zpráva:", text)

vysledek = tiskni_zpravu("Test")
print("Návratová hodnota:", vysledek)  # None
```

---
<!-- slide: id=id32 title="Funkce III" tags="Core" diff="basics" -->
## Explicitní návratová hodnota: `return`

Klíčové slovo `return` okamžitě ukončí vykonávání funkce a předá výsledek volajícímu:

```python
def secti(a: int, b: int) -> int:
    return a + b

vysledek = secti(10, 20)
print("Součet:", vysledek)  # 30
```

---
<!-- slide: id=id33 title="Funkce IV" tags="Core" diff="basics" -->
## Parametry funkcí a lokální scope

Proměnné vytvořené uvnitř funkce mají **lokální platnost** (*local scope*) a neovlivňují proměnné se stejným názvem ve vnějším kódu:

```python
x = 100  # Globální proměnná

def mocnina(x: int) -> int:
    # Lokální x stíní globální x
    return x ** 2

print(mocnina(5))  # 25
print(x)           # 100 (globální hodnota zůstala nedotčena!)
```

---
<!-- slide: id=id34 title="Funkce V" tags="Already Studied" diff="pythonic" -->
## Vracení více hodnot (Rozbalování n-tic)

Funkce v Pythonu může zdánlivě vracet více hodnot – interně je zabalí do jedné n-tice (`tuple`):

```python
def statistika(cisla: list[int]) -> tuple[int, int, float]:
    minimum = min(cisla)
    maximum = max(cisla)
    prumer = sum(cisla) / len(cisla)
    return minimum, maximum, prumer

# Rozbalení přímo do proměnných:
nejmensi, nejvetsi, avg = statistika([10, 20, 30])
print(f"Min: {nejmensi}, Max: {nejvetsi}, Průměr: {avg}")
```

---
<!-- slide: id=id35 title="Ukázka – faktoriál" tags="Core" diff="pythonic" -->
## Případová studie: Tři přístupy k faktoriálu

### 1. Rekurzivní řešení:
```python
def faktorial_rekurze(n: int) -> int:
    if n <= 1:
        return 1
    return n * faktorial_rekurze(n - 1)
```

### 2. Iterační řešení (while):
```python
def faktorial_iterace(n: int) -> int:
    vysledek = 1
    while n > 1:
        vysledek *= n
        n -= 1
    return vysledek
```

### 3. Knihovní optimalizované C řešení (`math`):
```python
import math
print(math.factorial(9))  # 362880
```

Knihovní funkce `math.factorial()` je implementována přímo v C a automaticky validuje neplatné vstupy (záporná a necelá čísla).

---
<!-- slide: id=id36 title="print()" tags="Already Studied" diff="basics" -->
## Funkce `print()` a její parametry

Kompletní signatura funkce `print`:
```python
print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)
```

```python
import sys

# Vlastní oddělovač a zakončení bez nového řádku:
print("2026", "10", "27", sep="-", end=" ")
print("18:30:00")  # Výstup: 2026-10-27 18:30:00

# Chybový výpis do stderr:
print("Varování: Nízká paměť!", file=sys.stderr)
```

---
<!-- slide: id=id37 title="input()" tags="Already Studied" diff="basics" -->
## Uživatelský vstup: `input()`

Funkce `input(prompt)` pozastaví vykonávání programu a načte řádek textu zadaný uživatelem:

```python
jmeno = input("Jak se jmenuješ? ")
print(f"Ahoj, {jmeno}!")

# Převod na číslo:
vek_str = input("Zadej věk: ")
vek = int(vek_str)
print(f"Za rok ti bude {vek + 1} let.")
```

> [!CAUTION]
> Návratovou hodnotou je **vždy řetězec** (`str`). Pokud očekáváte číslo, musíte provést explicitní přetypování `int()` nebo `float()` s ošetřením výjimky `ValueError`.

---
<!-- slide: id=id38 title="Příklady – funkce" tags="Skip" diff="basics" -->
## Procvičení: Funkce s parametry

Výpočet třetí mocniny:
```python
def treti_mocnina(x: float) -> float:
    return x ** 3

vstup = float(input("Zadejte číslo: "))
print(f"Třetí mocnina je {treti_mocnina(vstup)}")
```

---
<!-- slide: id=id39 title="help() – nápověda" tags="Already Studied" diff="basics" -->
## Interaktivní nápověda: `help()`

Vestavěná funkce `help()` poskytuje okamžitou dokumentaci:

1. **V interaktivním REPL**: `help()` spustí interaktivního průvodce.
2. **Dokumentace modulu nebo třídy**:
   ```python
   import math
   help(math.sqrt)  # Zobrazí docstring a signaturu sqrt(x, /)
   ```
3. **Dokumentace klíčového slova**: `help("for")`, `help("if")`.

---
<!-- slide: id=id40 title="dir()" tags="Core" diff="pythonic" -->
## Introspekce objektů: `dir()`

Funkce **`dir(objekt)`** vrátí abecedně seřazený seznam všech atributů a metod daného objektu:

```python
import math
atributy = dir(math)
print("Počet atributů v modulu math:", len(atributy))
print("Ukázka funkcí:", [a for a in atributy if not a.startswith("__")][:6])
# ['acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2']
```

Spolu s `type()` a `help()` tvoří `dir()` svatou trojici interaktivního objevování možností Pythonu.

---
<!-- slide: id=id41 title="„pass“ & dokumentační řetězce" tags="Core" diff="pythonic" -->
## Prázdné bloky a dokumentační řetězce (Docstrings)

### Příkaz `pass`:
Syntaktická výplň označující prázdný blok:
```python
class Neimplementovano:
    pass

def budoucí_funkce():
    pass  # Doplníme později
```

### Dokumentační řetězec (*Docstring*):
První literál v těle modulu, třídy nebo funkce je uložen do atributu **`__doc__`**:
```python
def secti(a: int, b: int) -> int:
    """Vrátí aritmetický součet dvou celých čísel."""
    return a + b

print(secti.__doc__)  # 'Vrátí aritmetický součet dvou celých čísel.'
```

---
<!-- slide: id=id42 title="type()" tags="Core" diff="basics" -->
## Zjišťování typu za běhu: `type()` a `isinstance()`

```python
# Zjištění přesné třídy:
print(type(42))          # <class 'int'>
print(type("ahoj"))      # <class 'str'>

# Doporučený test s podporou dědičnosti (isinstance):
hodnota = 42
if isinstance(hodnota, (int, float)):
    print("Jedná se o číslo")
```

---
<!-- slide: id=id43 title="Charakter jazyka" tags="Skip" diff="paradigm" -->
## Charakteristika a filozofie Pythonu

1. **Interpretovaný a vysokoúrovňový**: Automatická správa paměti, dynamická typová kontrola.
2. **Víceparadigmatický**: Plná podpora objektového, procedurálního i funkcionálního stylu.
3. **Konvence pojmenování (PEP 8)**:
   - `snake_case`: funkce, metody, proměnné, moduly (`spocti_vysledek`).
   - `PascalCase` / `CapWords`: třídy (`DataProcessor`).
   - `UPPER_CASE`: konstanty (`MAX_SIZE = 1024`).
4. **Všechno je objekt**: Dokonce i čísla, funkce, třídy a moduly jsou instancemi typu `object`.

---
<!-- slide: id=id44 title="PS: Historie Pythonu" tags="Skip" diff="basics" -->
## Klíčové milníky historie Pythonu

- **1989–1991**: Guido van Rossum vytváří Python v CWI v Amsterdamu jako nástupce jazyka ABC.
- **2000 (Python 2.0)**: Komunitní vývoj, cyklický Garbage Collector, podpora Unicode.
- **2008 (Python 3.0)**: Řízený rozchod se zpětnou kompatibilitou, nativní Unicode `str`, líné iterátory.
- **2020**: Oficiální ukončení životnosti (EOL) Pythonu 2.
- **2023–2026 (Python 3.12 / 3.13+)**: Specializing Adaptive Interpreter (PEP 659), strukturální pattern matching, izolované subinterpretry, svobodný threading (Free-threaded CPython PEP 703 bez GILu) a JIT kompilátor.

---
<!-- slide: id=id45 title="Užitečné odkazy" tags="Skip" diff="basics" -->
## Doporučené studijní zdroje

- **[Oficiální dokumentace Pythonu](https://docs.python.org/3/)**: Nejúplnější referenční příručka a tutoriál.
- **[Python Enhancement Proposals (PEPs)](https://peps.python.org/)**: Architektonické specifikace nových vlastností jazyka.
- **[Real Python](https://realpython.com/)**: Praktické tutoriály a osvědčené postupy moderního vývoje.
- **[PyPI (Python Package Index)](https://pypi.org/)**: Repozitář více než 500 000 open-source knihoven pro Python.
