<!-- slide: id=id1 title="Úvod a osnova" tags="Core" diff="basics" -->
## Master Přednáška 1: Paměťový model, Řízení běhu a Strukturální Pattern Matching

Vítejte v první plnohodnotné přednášce kurzu programování v jazyce Python. Dnešním cílem je pochopit, jak CPython reprezentuje data v operační paměti a jak se v Pythonu idiomaticky řídí tok programu.

### Osnova dnešní 90minutové přednášky:
1. **Architektura paměti**: C/Java paměťový model (stack vs. heap) vs. CPython `PyObject`.
2. **Životní cyklus paměti**: Reference counting (`ob_refcnt`) a cyklický Garbage Collector.
3. **Proměnná jako reference**: Rozdíl mezi typem proměnné a typem hodnoty, small integer caching.
4. **Identita vs. rovnost**: Rozdíl mezi operátory `is` a `==`.
5. **Číselné typy**: `int` s libovolnou přesností (*arbitrary precision*) a `float` v normě IEEE 754.
6. **Řízení toku**: Podmínky `if-elif-else`, ternární výraz a cyklus `while` s walrus operátorem `:=`.
7. **Iterace a cykly**: Filozofie `for-in`, generátor `range()`, idiomatické `enumerate()` a `zip()`.
8. **Netradiční konstrukce**: Větve `for-else` a `while-else` pro vyhledávací algoritmy.
9. **Strukturální Pattern Matching**: Deklarativní `match-case` (PEP 634), sequence patterns a pattern guards.
10. **Produkční most**: Statické typové anotace (*Type Hints*) a ověřování pomocí `mypy` / `pyright`.

---
<!-- slide: id=id2 title="C/Java vs. CPython: Paměťový model" tags="Core" diff="paradigm" -->
## Architektura paměti: Zásobník vs. CPython halda

V jazycích C/C++ a částečně v Javě existuje striktní rozdělení mezi **zásobníkem (stack)** a **haldou (heap)**:

```text
[ C / C++ ]
  int x = 42;          ──> 4 bajty přímo na zásobníku (rychlé, bez režie, fixní adresa)
  int* p = malloc(...); ──> Ukazatel na zásobníku, surová data na haldě

[ Java ]
  int x = 42;          ──> Primitivní typ alokovaný přímo na zásobníku
  Integer obj = 42;    ──> Reference na zásobníku, objekt s hlavičkou na haldě JVM

[ CPython ]
  x = 42               ──> Pouze pojmenovaný ukazatel v tabulce symbolů.
                           Všechna data žijí jako PyObject na haldě!
```

### Struktura hlavičky `PyObject` v C kódu CPythonu:
Každý objekt v CPythonu začíná společnou hlavičkou definovanou v hlavičkovém souboru `object.h`:
```c
struct _object {
    _PyObject_HEAD_EXTRA // zřetězení pro debugovací účely
    Py_ssize_t ob_refcnt; // čítač referencí (8 bajtů na 64-bit OS)
    PyTypeObject *ob_type; // ukazatel na deskriptor typu (8 bajtů)
};
```

> [!IMPORTANT]
> V Pythonu **neexistují primitivní hodnoty** na zásobníku. I obyčejné celé číslo `0` je plnohodnotným objektem na haldě a zabírá v 64bitovém CPythonu **28 bajtů** (`sys.getsizeof(0)`).

---
<!-- slide: id=id3 title="Reference Counting a Cyklický GC" tags="Core" diff="paradigm" -->
## Životní cyklus paměti: Reference Counting a Cyklický GC

CPython kombinuje dva mechanismy pro správu paměti:

### 1. Počítání referencí (*Reference Counting* — primární a okamžité)
Při každém přiřazení nebo uložení do kolekce se čítač referencí `ob_refcnt` inkrementuje. Při zániku proměnné se dekrementuje:
```python
import sys

a = [1, 2, 3]
print(sys.getrefcount(a))  # Vypíše 2 (proměnná 'a' + dočasná reference v argumentu getrefcount)
b = a
print(sys.getrefcount(a))  # Vypíše 3 (přibyla reference z 'b')
del b
print(sys.getrefcount(a))  # Klesne zpět na 2
```
Jakmile `ob_refcnt == 0`, CPython paměť **ihned deterministicky vrátí alokátoru**.

### 2. Cyklický Garbage Collector (sekundární a asynchronní)
Pokud dva objekty odkazují navzájem na sebe, jejich čítač referencí nikdy neklesne na nulu:
```python
x = []
y = [x]
x.append(y)  # Vznikl cyklus: x odkazuje na y a y na x
del x, y     # Objekty jsou z programu nedostupné, ale refcnt je stále 1!
```
Pro tyto případy spouští CPython periodicky generátorský cyklický GC, který hledá nepropojitelné ostrovy referencí a uvolňuje je.

---
<!-- slide: id=id4 title="Dynamické a silné typování" tags="Core" diff="basics" -->
## Dynamické a silné typování: Proměnná je jen štítek

V C/C++ má typ **samotná proměnná** (paměťový slot):
```c
int a = 5;
a = "ahoj"; // CHYBA PŘI KOMPILACI: incompatible types in assignment
```

V Pythonu platí základní pravidlo: **Proměnné nemají typ. Typ má pouze hodnota na haldě.**
Proměnná je pouze jméno (štítek či ukazatel), které ukazuje na určitý objekt.

```python
x = 42        # x ukazuje na instanci typu int
print(type(x))  # <class 'int'>

x = "ahoj"    # x nyní ukazuje na instanci typu str (původní int má refcnt snížen)
print(type(x))  # <class 'str'>
```

### Python je dynamický, ale SILNĚ typovaný!
Na rozdíl od jazyků se slabým typováním (jako JavaScript nebo historické PHP) Python **nikdy neprovádí tichou konverzi typů**:
```python
vysledek = "Počet: " + 10  # Vyvolá TypeError: can only concatenate str to str, not "int"
```
Konverzi musíte provést explicitně: `"Počet: " + str(10)` nebo pomocí f-stringu `f"Počet: {10}"`.

---
<!-- slide: id=id5 title="Identita vs. Rovnost: is vs. ==" tags="Core" diff="tricky" -->
## Identita vs. Rovnost: Operátor `is` vs. `==`

Pro programátory přicházející z Javy je toto zásadní změna mentálního modelu:

| Operátor | Co porovnává | Analogie v Javě | Volaná dunder metoda |
| :--- | :--- | :--- | :--- |
| **`==`** | **Hodnotu (ekvivalenci)** | `.equals()` | `__eq__()` |
| **`is`** | **Identitu (adresu v paměti)** | `==` | Porovnává `id(a) == id(b)` |

```python
a = [1, 2, 3]
b = [1, 2, 3]

print(a == b)  # True (mají shodný obsah)
print(a is b)  # False (jsou to dva různé objekty na různých adresách haldy)
```

### Past: CPython Small Integer Caching (-5 až 256)
CPython v rámci optimalizace předalokuje pole celých čísel v intervalu $[-5, 256]$ jako globální singletony:
```python
x = 250
y = 250
print(x is y)  # True (ukazují na tentýž předalokovaný singleton)

m = 1000
n = 1000
print(m is n)  # False v REPL (dva různé nově vytvořené objekty!)
```

> [!WARNING]
> Nikdy nepoužívejte `is` k porovnávání čísel nebo textových řetězců! Operátor `is` se v praxi používá **výhradně k porovnání se singletony**, zejména s `None` (`if x is None:`).

---
<!-- slide: id=id6 title="Celá čísla: Arbitrary Precision int" tags="Core" diff="newconcept" -->
## Celá čísla: `int` s libovolnou přesností vs. C Integer Overflow

V jazycích C/C++ a Javě mají celá čísla pevnou šířku v bitech (typicky 32bit nebo 64bit):
```c
int32_t a = 2147483647; // 2^31 - 1
a = a + 1;              // Přetečení (Integer Overflow): hodnota je nyní -2147483648!
```

V Pythonu 3 byl původní typ `long` sjednocen do typu `int`. Čísla typu `int` mají **neomezenou přesnost** (omezenou pouze dostupnou operační pamětí RAM počítače):

```python
obrovske_cislo = 2 ** 1000
print(obrovske_cislo)
# Vypíše přesné 302ciferné číslo bez jakéhokoliv přetečení nebo ztráty přesnosti!
```

### Jak to funguje pod kapotou:
CPython reprezentuje velká čísla interně jako pole číslic (tzv. *digits*) o základu $2^{30}$. Pokud výsledek operace přesáhne 30 bitů, CPython automaticky alokuje strukturu `PyVarObject` s potřebným počtem číslic a provede algoritmy dlouhého násobení a sčítání.

### Zápis velkých čísel (PEP 515):
Pro zvýšení čitelnosti lze v zápisu čísel používat podtržítka:
```python
pocet_bytu = 1_048_576
binarni_maska = 0b1111_0000
hex_adresa = 0xDEAD_BEEF
```

---
<!-- slide: id=id7 title="Reálná čísla float a IEEE 754" tags="Core" diff="basics" -->
## Reálná čísla: `float` a přesnost plovoucí řádové čárky

Typ `float` v CPythonu odpovídá 64bitovému číslu s dvojitou přesností (`double` v C a Javě) dle mezinárodní normy **IEEE 754**:
- 1 bit pro znaménko.
- 11 bitů pro exponent.
- 52 bitů pro mantisu (cca 15–17 platných desetinných číslic).

### Základní past binární reprezentace zlomků:
Číslo $0.1$ nelze v binární soustavě reprezentovat konečným rozvojem (je to periodické číslo, podobně jako $1/3$ v desítkové soustavě):

```python
print(0.1 + 0.2)
# 0.30000000000000004

print(0.1 + 0.2 == 0.3)
# False!
```

### Správné řešení v praxi:
Pro porovnávání reálných čísel nikdy nepoužívejte `==`. Použijte funkci `math.isclose()`:
```python
import math

print(math.isclose(0.1 + 0.2, 0.3, rel_tol=1e-9))  # True
```

> [!TIP]
> Pro finanční transakce nebo úlohy vyžadující absolutní desítkovou přesnost použijte standardní modul `decimal.Decimal` nebo modul pro zlomky `fractions.Fraction`.

---
<!-- slide: id=id8 title="Logický typ bool a koncept Truthy/Falsy" tags="Core" diff="basics" -->
## Logický typ `bool` a koncept *Truthy / Falsy*

V Pythonu je typ `bool` přímou podtřídou celočíselného typu `int`:
```python
print(issubclass(bool, int))  # True
print(True == 1)              # True
print(False == 0)             # True
print(True + True)            # 2 (aritmetika nad booly funguje, ačkoliv není doporučena)
```

### Pravdivostní vyhodnocení libovolného objektu:
Každý objekt v Pythonu lze vyhodnotit v logickém kontextu (např. v podmínce `if`). Objekt je buď **falsy** (vyhodnotí se jako nepravda), nebo **truthy** (vyhodnotí se jako pravda).

| Falsy hodnoty (vše ostatní je Truthy) | Příklad |
| :--- | :--- |
| Konstanta `None` a logické `False` | `None`, `False` |
| Číselná nula libovolného typu | `0`, `0.0`, `0j` |
| Prázdné textové řetězce | `""`, `''` |
| Prázdné vestavěné kolekce | `[]`, `()`, `{}`, `set()` |
| Objekty definující `__bool__()` vracející False | Vlastní třídy |

### Idiomatický Python:
```python
polozky = []

# ŠPATNĚ (C/Java styl):
if len(polozky) == 0:
    pass

# SPRÁVNĚ (Pythonic styl využívající falsy prázdného seznamu):
if not polozky:
    print("Seznam je prázdný!")
```

---
<!-- slide: id=id9 title="Zkrácené vyhodnocování and a or" tags="Core" diff="tricky" -->
## Zkrácené vyhodnocování operátorů `and` a `or`

Operátory `and` a `or` v Pythonu fungují na principu zkráceného vyhodnocování (*short-circuit evaluation*), ale mají jednu unikátní vlastnost:
**Nevracejí hodnoty typu `bool`, ale vrací přímo hodnotu naposledy vyhodnoceného operandu!**

### Pravidla:
- `a or b`: Pokud je `a` truthy, vrátí `a`. Jinak vyhodnotí a vrátí `b`.
- `a and b`: Pokud je `a` falsy, vrátí `a`. Jinak vyhodnotí a vrátí `b`.

```python
# Využití or pro definici výchozí hodnoty:
jmeno = uzivatelsky_vstup or "Anonym"

print(42 or "náhradní")       # Vypíše 42
print("" or "náhradní")       # Vypíše 'náhradní'
print("ahoj" and [1, 2, 3])   # Vypíše [1, 2, 3]
print([] and "ahoj")          # Vypíše []
```

> [!NOTE]
> Nezaměňujte logické operátory `and`, `or`, `not` s bitovými operátory `&`, `|`, `~`, `^`. Bitové operátory počítají s jednotlivými bity celých čísel nebo provádějí množinové operace nad `set`.

---
<!-- slide: id=id10 title="Podmíněný běh: if-elif-else" tags="Core" diff="basics" -->
## Podmíněné větvení: `if`, `elif`, `else`

V jazycích C a Java se podmínky uzavírají do kulatých závorek a bloky do složených závorek `{}`. V Pythonu jsou závorky zbytečné a bloky jsou vymezeny **striktním odsazením**:

```python
skore = 85

if skore >= 90:
    znamka = "A"
elif skore >= 80:
    znamka = "B"
elif skore >= 70:
    znamka = "C"
else:
    znamka = "F"
```

### Zásady čistého kódu (PEP 8):
1. **Odsazení**: Vždy používejte přesně **4 mezery** na jednu úroveň odsazení. Nikdy nemíchejte tabulátory a mezery!
2. **Kulaté závorky**: Okolo podmínek nepíšeme `if (x > 5):`, píšeme čisté `if x > 5:`. Závorky používáme pouze pro zalomení dlouhých složených podmínek na více řádků.
3. **Prázdné bloky**: Pokud potřebujete syntakticky platný prázdný blok (např. při návrhu kostry kódu), použijte klíčové slovo `pass` nebo elipsu `...`:
   ```python
   if debug_mod:
       pass  # TODO: Implementovat detailní logování
   ```

---
<!-- slide: id=id11 title="Ternární podmíněný výraz" tags="Core" diff="basics" -->
## Ternární výraz: Podmíněné přiřazení v jednom řádku

V jazycích C/C++ a Java slouží pro podmíněné přiřazení operátor `? :`:
```c
int max = (a > b) ? a : b;
```

V Pythonu má ternární operátor přirozenou anglickou syntaxi:
```python
max_hodnota = a if a > b else b
```

### Klíčové vlastnosti:
- **Je to výraz (*expression*), nikoliv příkaz (*statement*)**: Vrací hodnotu a lze jej použít kdekoliv, kde je očekávána hodnota (např. uvnitř volání funkce nebo v list comprehension).
- **Líné vyhodnocování**: Větev `b` se vůbec nevyhodnotí, pokud podmínka `a > b` platí.

```python
stav = "Plnoletý" if vek >= 18 else "Mladistvý"

# Použití přímo v argumentu funkce:
print(f"Server běží v režimu: {'PRODUKCE' if je_produkce else 'LOKÁLNÍ VÝVOJ'}")
```

> [!CAUTION]
> Vyhněte se vnořování více ternárních výrazů do sebe (`a if c1 else b if c2 else c`). Takový kód je extrémně nečitelný a porušuje zásadu *Zen of Python*: "Readability counts."

---
<!-- slide: id=id12 title="Smyčka while a Walrus operátor" tags="Core" diff="newconcept" -->
## Smyčka `while` a Walrus operátor `:=` (PEP 572)

Cyklus `while` opakuje blok kódu, dokud je podmínka pravdivá:
```python
pocitadlo = 0
while pocitadlo < 5:
    print(pocitadlo)
    pocitadlo += 1
```

### Zjednodušení kódu: Walrus operátor `:=` (Python 3.8+)
Častým scénářem je načítání dat v cyklu, kde potřebujeme načíst hodnotu, otestovat ji a následně zpracovat.

**Historický zápis (duplikace kódu):**
```python
radek = soubor.readline()
while radek != "":
    zpracuj(radek)
    radek = soubor.readline()
```

**Moderní zápis s operátorem přiřazení `:=`:**
```python
while (radek := soubor.readline()):
    zpracuj(radek)
```

> [!NOTE]
> Walrus operátor `:=` přiřadí hodnotu do proměnné `radek` a zároveň tuto hodnotu vrátí jako výsledek výrazu, který je ihned otestován na truthiness smyčkou `while`.

---
<!-- slide: id=id13 title="Filozofie cyklu for-in" tags="Core" diff="paradigm" -->
## Filozofie cyklu `for-in`: Vždy čistý for-each iterátor

Zásadní kontrast pro programátory z C: **V Pythonu neexistuje tříprvkový cyklus `for (int i = 0; i < n; i++)`!**

Každý cyklus `for` v Pythonu je **for-each iterátorem**. Prochází prvky jakéhokoliv objektu, který implementuje protokol iterátoru:
```python
# Iterace přes seznam:
for jmeno in ["Alice", "Bob", "Charlie"]:
    print(jmeno)

# Iterace přes znaky řetězce:
for znak in "Python":
    print(znak)

# Iterace přes klíče slovníku:
studenti = {"Alice": 1, "Bob": 2}
for klic in studenti:
    print(klic, "->", studenti[klic])
```

### Proč je tento přístup nadřazený C-stylu:
- **Žádné chyby o jedničku (*Off-by-one errors*)**: Nemůžete omylem přetéct index pole (`i <= len(arr)`).
- **Nezávislost na indexaci**: Můžete stejným způsobem procházet datové struktury bez přímého indexového přístupu (množiny, souborové proudy, síťové sockety, databázové kurzory).

---
<!-- slide: id=id14 title="Generování číselných řad: range()" tags="Core" diff="basics" -->
## Generování číselných řad: Objekt `range`

Jak v Pythonu vyřešit situaci, kdy potřebujeme provést cyklus $N$-krát nebo generovat číselnou posloupnost?
K tomu slouží vestavěný typ `range`:

```python
# range(stop) -> 0 až stop-1
for i in range(5):
    print(i, end=" ")  # 0 1 2 3 4

# range(start, stop) -> interval [start, stop)
for i in range(2, 7):
    print(i, end=" ")  # 2 3 4 5 6

# range(start, stop, step) -> s krokem
for i in range(10, 0, -2):
    print(i, end=" ")  # 10 8 6 4 2
```

### Paměťová efektivita $O(1)$:
Objekt `range` v Pythonu 3 **nevytváří seznam čísel v paměti**! Je to líný generátor, který počítá prvky na požádání:
```python
import sys

velky_rozsah = range(1_000_000_000)
print(sys.getsizeof(velky_rozsah))  # Pouhých 48 bajtů paměti!
```
Bez ohledu na to, zda generujete 10 čísel nebo 10 miliard čísel, paměťová náročnost je konstantní.

---
<!-- slide: id=id15 title="Idiomatické procházení: enumerate a zip" tags="Core" diff="basics" -->
## Idiomatické procházení kolekcí: `enumerate()` a `zip()`

### Antipattern studentů z C/Javy:
```python
seznam = ["zlato", "stříbro", "bronz"]

# ŠPATNĚ: Indexování přes range(len(...))
for i in range(len(seznam)):
    print(f"{i + 1}. místo: {seznam[i]}")
```

### Idiom 1: Funkce `enumerate(iterable, start=0)`
Vrací přímo dvojice `(index, hodnota)`:
```python
# SPRÁVNĚ a čistě:
for poradi, kov in enumerate(seznam, start=1):
    print(f"{poradi}. místo: {kov}")
```

### Idiom 2: Funkce `zip(*iterables)` pro paralelní procházení
Prochází více sekvencí současně v paměťové složitosti $O(1)$:
```python
hraci = ["Alice", "Bob", "Charlie"]
body = [100, 85, 92]

for hrac, skore in zip(hraci, body):
    print(f"{hrac}: {skore} bodů")
```

> [!TIP]
> Od Pythonu 3.10 podporuje `zip` parametr `strict=True` (`zip(a, b, strict=True)`). Pokud mají sekvence různou délku, vyvolá `ValueError` místo tichého zahození přebývajících prvků!

---
<!-- slide: id=id16 title="Skákání v cyklech a Scope proměnné" tags="Core" diff="tricky" -->
## Řízení cyklů a Záludnost: Leak proměnné do scope

Příkazy pro změnu průběhu smyčky:
- `break`: Okamžitě ukončí vykonávání celé smyčky.
- `continue`: Okamžitě přeskočí zbytek těla smyčky a přejde na další iteraci.

```python
for cislo in range(10):
    if cislo % 2 == 0:
        continue  # Přeskoč sudá čísla
    if cislo > 7:
        break     # Ukonči smyčku při čísle větším než 7
    print(cislo, end=" ")  # Vypíše: 1 3 5 7
```

### Zásadní rozdíl oproti C/Javě: Scope proměnné cyklu!
V C a Javě je rozsah platnosti proměnné deklarované v hlavičce for-cyklu omezen pouze na tělo cyklu.
**V Pythonu proměnná cyklu prosakuje (leaks) do okolního scope!**

```python
for i in range(3):
    pass

print(i)  # Vypíše 2! Proměnná 'i' po skončení cyklu nezmizela.
```

> [!WARNING]
> Pokud použijete stejné jméno iterační proměnné jako v nadřazeném kódu, přepíšete si původní proměnnou.

---
<!-- slide: id=id17 title="Netradiční konstrukce: for-else a while-else" tags="Core" diff="newconcept" -->
## Unikátní konstrukce: Větve `for-else` a `while-else`

Většina začátečníků očekává, že větev `else` u cyklu se spustí, pokud podmínka cyklu od začátku neplatila.
Skutečné pravidlo CPythonu zní:
**Větev `else` se vykoná, pokud cyklus doběhl přirozeně do konce a NEBYL přerušen příkazem `break`!**

### Vyhledávací algoritmus bez pomocných příznaků (flags):

```python
# Hledání prvočísla
n = 13
for i in range(2, int(n ** 0.5) + 1):
    if n % i == 0:
        print(f"Číslo {n} je složené (dělitelné {i}).")
        break
else:
    # Tento blok se spustí POUZE tehdy, pokud se ani jednou nezavolal break!
    print(f"Číslo {n} je prvočíslo.")
```

### Proč je to elegantní:
V C/Javě byste museli deklarovat pomocnou proměnnou `bool nalezeno = false;` a po skončení cyklu testovat `if (!nalezeno)`. Konstrukce `for-else` tento boilerplate kód zcela eliminuje.

---
<!-- slide: id=id18 title="Strukturální Pattern Matching: Úvod" tags="Core" diff="newconcept" -->
## Strukturální Pattern Matching (PEP 634, Python 3.10+)

Mnoho programátorů vnímá `match-case` jako pouhou náhradu chybějícího `switch-case` z C/Javy.
To je však hrubé podcenění: **Pattern Matching v Pythonu je mocný deklarativní systém dekonstrukce a validace dat převzatý z funkcionálních jazyků (Haskell, Rust, Scala).**

### Klíčové rozdíly oproti C/Java `switch`:
1. **Žádné propadávání (*fall-through*)**: Po vykonání odpovídající větve `case` se z celé konstrukce vyskočí. Není potřeba psát otravné `break`.
2. **Shoda nad tvary dat (*Destructuring*)**: Dokáže rozbalit vnořené sekvence, slovníky a objekty v jediném kroku.
3. **Přiřazení do proměnných (*Variable Capture*)**: Hodnoty z vnořených struktur lze přímo navázat na nová jména.
4. **Podmíněné stráže (*Guards*)**: Možnost doplnit libovolnou booleovskou podmínku za vzor.

---
<!-- slide: id=id19 title="Match-Case: Literal patterns a Wildcard" tags="Core" diff="basics" -->
## Match-Case: Porovnání s literály a zástupný znak `_`

Nejjednodušší formou je porovnání s konkrétními konstantami (čísla, řetězce, `True`, `False`, `None`):

```python
def obsluz_http_kod(status: int) -> str:
    match status:
        case 200:
            return "OK: Požadavek byl úspěšně vyřízen."
        case 301 | 302:
            return "Přesměrování: Zdroj se nachází jinde."
        case 400:
            return "Chybný požadavek klienta."
        case 401 | 403:
            return "Chyba autorizace: Přístup odepřen."
        case 404:
            return "Nenalezeno: Požadovaný zdroj neexistuje."
        case 500 | 502 | 503:
            return "Chyba serveru."
        case _:
            # Wildcard vzor '_' odpovídá libovolné hodnotě (jako 'default:' v C)
            return f"Neznámý stavový kód: {status}"
```

### Operátor `|` (OR pattern):
Všimněte si zápisu `case 401 | 403:`. Umožňuje sdružit více možností do jediného případu bez duplikace obslužného kódu.

---
<!-- slide: id=id20 title="Match-Case: Sequence patterns" tags="Core" diff="newconcept" -->
## Match-Case: Dekonstrukce sekvencí (List a Tuple)

Pattern matching dokáže ověřit tvar seznamu nebo n-tice a současně extrahovat jednotlivé prvky do proměnných:

```python
def zpracuj_prikaz(prikaz: list[str]) -> None:
    match prikaz:
        case ["konec"]:
            print("Ukončuji aplikaci...")
        case ["otevri", soubor]:
            # Proměnná 'soubor' zachytí druhý prvek sekvence!
            print(f"Otevírám soubor: {soubor}")
        case ["presun", x, y]:
            print(f"Přesouvám kurzor na souřadnice [{x}, {y}]")
        case ["kresli", "bod", x, y]:
            print(f"Kreslím bod na [{x}, {y}]")
        case ["zprava", *slova]:
            # Hvězdičkový vzor zachytí zbytek sekvence libovolné délky
            text = " ".join(slova)
            print(f"Zpráva: {text}")
        case _:
            print(f"Neznámý formát příkazu: {prikaz}")
```

> [!NOTE]
> Zápis `case [x, y]:` ověřuje, zda má sekvence **přesně dva prvky**. Pokud má jiný počet prvků, vzor se neshoduje a interpret zkouší další větev.

---
<!-- slide: id=id21 title="Match-Case: Mapping patterns a Třídní vzory" tags="Core" diff="paradigm" -->
## Match-Case: Slovníky a Třídní vzory

### 1. Mapping Patterns (kontrola slovníků):
Na rozdíl od sekvencí kontroluje mapping pattern pouze přítomnost zadaných klíčů; přebývající klíče nevadí:
```python
data = {"typ": "senzor_teploty", "id": 42, "teplota": 23.5, "baterie": 95}

match data:
    case {"typ": "senzor_teploty", "teplota": t, "baterie": b}:
        print(f"Teplota ze senzoru: {t} °C (Baterie: {b} %)")
```

### 2. Class Patterns (inspekce objektů bez `isinstance`):
Můžeme testovat instanci třídy a extrahovat její atributy:
```python
from dataclasses import dataclass

@dataclass
class Bod:
    x: float
    y: float

bod = Bod(0.0, 15.0)

match bod:
    case Bod(x=0.0, y=0.0):
        print("Počátek souřadnic")
    case Bod(x=0.0, y=y_val):
        print(f"Bod leží na ose Y v hodnotě {y_val}")
    case Bod(x=x_val, y=0.0):
        print(f"Bod leží na ose X v hodnotě {x_val}")
    case Bod(x=x, y=y):
        print(f"Bod v obecné poloze [{x}, {y}]")
```

---
<!-- slide: id=id22 title="Pattern Guards a As-patterns" tags="Core" diff="newconcept" -->
## Pokročilý Match: Pattern Guards a As-Patterns

### 1. Pattern Guards (`if` podmínka za vzorem):
Někdy samotný strukturní tvar nestačí a potřebujeme otestovat logické vztahy mezi extrahovanými proměnnými:

```python
match bod:
    case Bod(x=x, y=y) if x == y:
        print(f"Bod [{x}, {y}] leží na hlavní diagonále!")
    case Bod(x=x, y=y) if x > 0 and y > 0:
        print(f"Bod [{x}, {y}] leží v I. kvadrantu.")
```
Podmínka za `if` se vyhodnotí až ve chvíli, kdy byl vzor strukturálně úspěšně napasován.

### 2. As-patterns (`as` pro zachycení celku):
Chcete dekonstruovat vnitřek, ale zároveň si ponechat referenci na celý složený objekt:
```python
match bod:
    case Bod(x=x, y=y) as cely_objekt if x > 100 or y > 100:
        log_varovani(cely_objekt)
        print(f"Extrémní souřadnice: [{x}, {y}]")
```

---
<!-- slide: id=id23 title="Pod kapotou: Bajtkód řízení toku" tags="Core" diff="newconcept" -->
## Pod kapotou: Jak CPython překládá podmínky a cykly

Podívejme se, jak CPython překládá podmínku do instrukcí virtuálního stroje pomocí vestavěného modulu `dis`:

```python
import dis

def zkontroluj(x: int) -> str:
    if x > 10:
        return "Větší"
    return "Menší"

dis.dis(zkontroluj)
```

### Výpis instrukcí bajtkódu:
```text
  1           0 RESUME                   0

  2           2 LOAD_FAST                0 (x)
              4 LOAD_CONST               1 (10)
              6 COMPARE_OP              68 (>)
             12 POP_JUMP_FORWARD_IF_FALSE 4 (to 22)

  3          14 LOAD_CONST               2 ('Větší')
             16 RETURN_VALUE

  4     >>   22 LOAD_CONST               3 ('Menší')
             24 RETURN_VALUE
```

Instrukce `COMPARE_OP` vyhodnotí relaci a `POP_JUMP_FORWARD_IF_FALSE` provede podmíněný skok přesunutím ukazatele instrukcí (*instruction pointer*), analogicky k instrukci `jz` (jump if zero) v assembleru.

---
<!-- slide: id=id24 title="Nejčastější začátečnické pasti" tags="Core" diff="tricky" -->
## 4 nejčastější pasti řízení toku a typů v Pythonu

### 1. Modifikace kolekce během iterace přes ni
```python
cisla = [1, 2, 3, 4, 5, 6]
# ŠPATNĚ: Během iterace přesouváte indexy pod rukama interpretu!
for c in cisla:
    if c % 2 == 0:
        cisla.remove(c)  # Přeskočí liché prvky následující po smazaném prvku!

# SPRÁVNĚ: Vytvoření nového seznamu nebo iterace přes kopii:
cisla = [c for c in cisla if c % 2 != 0]
```

### 2. Záměna `is` a `==`
Porovnávání řetězců nebo větších čísel přes `is` může v závislosti na optimalizátoru kompilátoru náhodně selhávat.

### 3. Zřetězená porovnání a jejich záludnosti
Python podporuje matematický zápis `1 < x < 10` (což je ekvivalentní `1 < x and x < 10`, přičemž `x` se vyhodnotí pouze jednou). Pozor na nechtěné zřetězení: `a == b == c` testuje, zda se všechny tři hodnoty navzájem rovnají.

### 4. Zapomenuté `break` v hledacím algoritmu s `for-else`
Pokud ve vyhledávacím cyklu zapomenete zavolat `break`, větev `else` se vykoná vždy.

---
<!-- slide: id=id25 title="Produkční most: Typové anotace" tags="Core" diff="newconcept" -->
## Produkční most: Typové anotace v Pythonu 3.12+ (PEP 484)

Ačkoliv Python zůstává za běhu dynamicky typovaným jazykem, v moderní softwarové praxi (2026) se veškerý produkční kód píše s **typovými anotacemi** (*Type Hints*):

```python
# Moderní syntaxe unie typů pomocí operátoru | (Python 3.10+)
def najdi_uzivatele(user_id: int) -> str | None:
    if user_id == 42:
        return "Alice"
    return None

def zpracuj_skore(hodnoty: list[int | float], koeficient: float = 1.0) -> list[float]:
    return [polozka * koeficient for polozka in hodnoty]
```

### Zásadní fakt: Nulová režie za běhu!
- CPython typové anotace za běhu **nijak nekontroluje ani nevynucuje**.
- Funkce `najdi_uzivatele("text")` bez problému proběhne a nehodí běhovou chybu, pokud tomu nezabrání váš kód.
- K čemu tedy slouží? Pro **statickou analýzu kódu v IDE**, automatické doplňování (*IntelliSense*) a kontrolu v CI/CD pipeline!

---
<!-- slide: id=id26 title="Produkční most: Kontrola kódu pomocí mypy a pyright" tags="Core" diff="basics" -->
## Produkční most: Statická typová kontrola (`mypy` a `pyright`)

V kompilovaných jazycích (C, Java) kontroluje typové chyby kompilátor před sestavením binárky.
V Pythonu dosahujeme stejné úrovně spolehlivosti pomocí **statických analyzátorů typů**:

```text
[ Vývojář píše kód ] ──> [ mypy / pyright ] ──> [ Nalezeny chyby před spuštěním! ]
```

### Typický scénář zachycené chyby:
```python
def pozdrav(jmeno: str | None) -> str:
    # mypy zde zahlásí chybu: Item "None" of "str | None" has no attribute "strip"
    return f"Ahoj {jmeno.strip()}!"
```
Statický checker vás donutí ošetřit možnost, že hodnota je `None`:
```python
def pozdrav(jmeno: str | None) -> str:
    if jmeno is None:
        return "Ahoj anonyme!"
    return f"Ahoj {jmeno.strip()}!"
```

### Spuštění typového analyzátoru:
```bash
# Rychlá kontrola celého projektu přes uv:
uv run mypy src/
```

---
<!-- slide: id=id27 title="Shrnutí a přechod do cvičení" tags="Core" diff="basics" -->
## Shrnutí přednášky a příprava na cvičení

Dnes jsme si osvojili fundamentální mentální model jazyka Python:

### Hlavní body pro zapamatování:
1. **Paměť**: Vše je `PyObject` na haldě; reference counting uvolňuje objekty ihned, cyklický GC řeší cykly.
2. **Proměnné**: Jsou to pouhé pojmenované reference; typ má hodnota na haldě, nikoliv proměnná.
3. **Porovnávání**: `==` porovnává hodnoty, `is` porovnává identitu (používejte pouze pro `None`).
4. **Čísla**: `int` má libovolnou přesnost bez přetečení; `float` je IEEE 754 a porovnává se přes `math.isclose`.
5. **Cykly**: `for-in` je vždy for-each iterátorem; pro indexy používáme `enumerate()`, pro paralelní průchod `zip()`.
6. **Pattern Matching**: `match-case` umožňuje dekonstruovat sekvence, slovníky a třídy s volitelnými guard podmínkami.
7. **Statické typování**: Typové anotace + `mypy` přinášejí bezpečnost kompilovaných jazyků do dynamického Pythonu.

### Co vás čeká v následujícím 1,5hodinovém cvičení:
- Experimenty s referencemi a zkoumání `sys.getrefcount()` v interaktivním REPLu.
- Praktické úlohy na práci s `match-case` a parsování strukturovaných zpráv.
- Nastavení a spuštění `mypy` na sadě vzorových skriptů.
