<!-- slide: id1, Úvod do třídění v Pythonu (Timsort), Core, paradigm -->
## Třídění v Pythonu a algoritmus Timsort

Řazení dat v Pythonu je postaveno na vysoce optimalizovaném hybridním algoritmu **Timsort** (vytvořeném Timem Petersem v roce 2002):

- **Hybrid Insertion Sort + Merge Sort**: Využívá již existující seřazené úseky (*runs*) v reálných datech.
- **Asymptotická složitost**: V nejhorším i průměrném případě $O(n \log n)$, v nejlepším případě (již seřazená data) bleskových **$O(n)$**.
- **Stabilita (*Stability*)**: Garantuje zachování vzájemného pořadí prvků se stejným klíčem.
- **Klíčové řazení (*Key-based sorting*)**: Namísto zastaralých dvouargumentových porovnávacích funkcí (`cmp(a, b)`) používá moderní Python transformační funkci `key=func`.

---
<!-- slide: id2, Globální funkce sorted(), Core, basics -->
## Globální funkce `sorted()`

Vestavěná funkce `sorted()` přijímá **jakýkoliv iterovatelný objekt** a vrátí **zbrusu nový seřazený seznam** `list`:

```python
sorted(iterable, key=None, reverse=False)
```

```python
# Řazení seznamu, n-tice i množiny:
print(sorted([5, 2, 8, 1]))       # [1, 2, 5, 8]
print(sorted((3, 1, 2)))          # [1, 2, 3] (výsledkem je vždy list!)
print(sorted({"pes", "kočka"}))   # ['kočka', 'pes']

# Řazení slovníku (řadí podle klíčů):
sklad = {"jablka": 50, "banány": 12, "citrony": 35}
print(sorted(sklad))              # ['banány', 'citrony', 'jablka']
```

Původní kolekce zůstává zcela nedotčena.

---
<!-- slide: id3, Řazení na místě: metoda list.sort(), Tricky, pythonic -->
## Řazení na místě: metoda `list.sort()`

Pokud pracujete se seznamem a nepotřebujete zachovat původní pořadí, použijte metodu `sort()` přímo na seznamu:

```python
cisla = [5, 2, 6, 4, 1, 3]

# Seřadí data přímo v paměti (in-place):
vysledek = cisla.sort()

print(cisla)     # [1, 2, 3, 4, 5, 6]
print(vysledek)  # None!
```

> [!IMPORTANT] Proč `sort()` vrací `None`?
> V Pythonu platí konvence: metody, které modifikují objekt na místě (*in-place mutation*), **vždy vrací `None`**.
> Tím zabraňují nechtěnému přepsání proměnné:
> ```python
> # ČASTÁ CHYBA:
> xs = [3, 1, 2].sort()  # xs bude None!
> ```

---
<!-- slide: id4, Parametr reverse=True, Skip, basics -->
## Sestupné řazení: parametr `reverse=True`

Obě funkce (`sorted()` i `list.sort()`) akceptují logický parametr `reverse`:

```python
cisla = [5, 2, 6, 4, 1, 3]

# Sestupné řazení od největšího k nejmenšímu:
sestupne = sorted(cisla, reverse=True)
print(sestupne)  # [6, 5, 4, 3, 2, 1]
```

---
<!-- slide: id5, Lexikografické třídění základních typů, Core, basics -->
## Lexikografické třídění

Výchozí řazení v Pythonu vychází z přirozeného uspořádání daného typu:

- **Čísla (`int`, `float`)**: podle matematické velikosti ($-\infty \to +\infty$).
- **Řetězce (`str`)**: lexikograficky podle ordinálních kódů znaků v tabulce Unicode (*code points*):

```python
# Čísla:
print(sorted([1, 10, 2, 20]))
# [1, 2, 10, 20]

# Textové řetězce (pozor na velká písmena a diakritiku!):
print(sorted(["1", "10", "2", "20"]))
# ['1', '10', '2', '20']  (lexikograficky '10' předchází '2')

print(sorted(["auto", "Banán", "citron"]))
# ['Banán', 'auto', 'citron']  (velká písmena ASCII 65-90 předchází malým 97-122)
```

---
<!-- slide: id6, Lexikografické porovnání složených objektů, Core, pythonic -->
## Řazení n-tic a složených struktur

Sekvence (`tuple`, `list`) se porovnávají **postupně prvek po prvku zleva doprava**:

1. Nejprve se porovnají první prvky.
2. Pokud se rovnají, porovnají se druhé prvky, atd.
3. Pokud se všechny prvky kratší sekvence shodují, rozhodne délka (kratší je menší).

```python
zaznamy = [
    ("Novák", "Petr", 30),
    ("Dvořák", "Jan", 25),
    ("Novák", "Adam", 40),
    ("Novák", "Petr", 20),
]

for radek in sorted(zaznamy):
    print(radek)
```

### Výstup (seřazeno podle příjmení, pak jména, pak věku):
```text
('Dvořák', 'Jan', 25)
('Novák', 'Adam', 40)
('Novák', 'Petr', 20)
('Novák', 'Petr', 30)
```

---
<!-- slide: id7, Pravidla porovnávání složek sekvencí, Tricky, pythonic -->
## Hloubkové porovnání sekvencí

O výsledku rozhodne **první neshodný prvek**, bez ohledu na hloubku zanoření nebo celkovou délku:

```python
# Kratší sekvence je menší než její delší prefix:
print([1, 2] < [1, 2, 3])              # True

# Druhý prvek rozhodne bez ohledu na délku:
print([1, 5] < [1, 2, 999, 999])       # False (protože 5 > 2)

# Vnořené podseznamy:
print([1, ["a", "z"]] < [1, ["b", "a"]]) # True (protože 'a' < 'b')
```

---
<!-- slide: id8, Typová striktnost v Pythonu 3, Tricky, resyntax -->
## Typová striktnost: Zákaz řazení nesourodých typů

V Pythonu 2 bylo možné porovnávat cokoliv (čísla s řetězci byla řazena podle jména jejich typu).

V moderním **Pythonu 3** je řazení typově bezpečné. Porovnání neporovnatelných typů okamžitě vyvolá výjimku **`TypeError`**:

```python
# Vzájemně porovnatelné číselné typy fungují:
print(sorted([1, 2.5, 0]))  # [0, 1, 2.5]

# Řetězec s číslem nelze porovnat:
# sorted(["a", 1, "b", 2])
# TypeError: '<' not supported between instances of 'int' and 'str'
```

Pokud chcete řadit heterogenní kolekci, musíte explicitně definovat transformační klíč `key=str`.

---
<!-- slide: id9, Další příklady lexikografického porovnání, Skip, basics -->
## Příklady porovnávání n-tic

Pravidla pro porovnávání sekvencí:

```python
# 1. Porovnání skončí na indexu 2 (3 < 4):
print((1, 2, 3, 99) < (1, 2, 4, 0))  # True

# 2. Stejný prefix, kratší vyhrává:
print((1, 2) < (1, 2, 0))            # True

# 3. Řetězce vs čísla uvnitř n-tice:
print(("A", 10) < ("A", 20))         # True
# print(("A", 10) < ("B", "text"))   # True! (skončí už na 'A' < 'B', k porovnání 10 < 'text' vůbec nedojde!)
```

---
<!-- slide: id10, Transformační parametr key=, Core, pythonic -->
## Transformační parametr `key=`

Parametr `key=` očekává **jednoargumentovou funkci**. Tato funkce se zavolá přesně jednou pro každý prvek kolekce a její návratová hodnota se použije jako porovnávací kritérium:

$$\text{prvek} \xrightarrow{\text{key(prvek)}} \text{hodnota\_pro\_třídění}$$

```python
jmena = ["John", "Wendy", "Pete", "Jane", "David", "Amanda", "Ix"]

# Řazení podle délky řetězce (vestavěná funkce len):
print(sorted(jmena, key=len))
# ['Ix', 'John', 'Pete', 'Jane', 'Wendy', 'David', 'Amanda']

# Řazení bez ohledu na velikost písmen:
slova = ["banán", "Auto", "citron"]
print(sorted(slova, key=str.casefold))
# ['Auto', 'banán', 'citron']
```

---
<!-- slide: id11, Klíč a anonymní lambda funkce I, WOW, pythonic -->
## Použití lambda funkcí v parametru `key=`

Pokud potřebujeme řadit podle vnitřní položky n-tice nebo slovníku, použijeme anonymní **lambda funkci**:

```python
studenti = [
    ("Petr", 3),
    ("Anna", 1),
    ("David", 2),
]

# Řazení podle druhého prvku (známky):
serazeno = sorted(studenti, key=lambda s: s[1])
print(serazeno)
# [('Anna', 1), ('David', 2), ('Petr', 3)]
```

Lambda funkce `lambda s: s[1]` vytáhne z každé n-tice pouze známku, podle které Timsort prvky uspořádá.

---
<!-- slide: id12, Vícekriteriální řazení pomocí n-tice v key=, WOW, pythonic -->
## Vícekriteriální řazení pomocí n-tice v `key=`

Často potřebujeme data seřadit podle primárního kritéria a při rovnosti podle sekundárního kritéria.

V Pythonu stačí, aby funkce v `key=` vrátila **n-tici hodnot**:

```python
jmena = ["John", "Wendy", "Pete", "Jane", "David", "Amanda", "Ix"]

# Primárně podle DÉLKY slova, sekundárně podle ABECEDY:
serazeno = sorted(jmena, key=lambda x: (len(x), x))
print(serazeno)
# ['Ix', 'Jane', 'John', 'Pete', 'David', 'Wendy', 'Amanda']
# Všimněte si: 4písmenná slova 'Jane', 'John', 'Pete' jsou nyní abecedně seřazena!
```

---
<!-- slide: id13, Princip DSU (Decorate-Sort-Undecorate), Skip, pythonic -->
## Princip DSU (*Decorate-Sort-Undecorate*)

Jak Timsort s parametrem `key=` pracuje uvnitř?
1. **Decorate**: Vytvoří interní pole dvojic `(key(item), item)`. Funkce `key` se pro každý prvek zavolá **pouze jednou** (nikoliv při každém porovnání!).
2. **Sort**: Seřadí pole podle vypočtených klíčů.
3. **Undecorate**: Vyextrahuje původní objekty zpět.

```python
# Důkaz, že se funkce volá pouze N-krát:
def zmer_vahu(x: str) -> int:
    print(f"Výpočet klíče pro {x}")
    return len(x)

data = ["kočka", "pes", "kůň"]
sorted(data, key=zmer_vahu)
# Vytiskne hlášku přesně 3x!
```

---
<!-- slide: id14, Rychlé extraktory z modulu operator, WOW, pythonic -->
## Zrychlení řazení: Modul `operator`

Namísto pomalejších lambda funkcí v Pythonu nabízí standardní modul `operator` rychlé C-funkce:

- **`operator.itemgetter(i)`**: Nahrazuje `lambda x: x[i]` (pro indexování sekvencí a slovníků).
- **`operator.attrgetter('attr')`**: Nahrazuje `lambda x: x.attr` (pro atributy tříd a objektů).

```python
from operator import itemgetter, attrgetter

zaznamy = [("Karel", 20), ("Anna", 35), ("David", 20)]

# Řazení podle věku (index 1), pak jména (index 0):
print(sorted(zaznamy, key=itemgetter(1, 0)))
# [('David', 20), ('Karel', 20), ('Anna', 35)]
```

`itemgetter` je implementován v C a bývá o 20–30 % rychlejší než ekvivalentní lambda.

---
<!-- slide: id15, Stabilita algoritmu Timsort I, Core, newconcept -->
## Stabilita algoritmu Timsort (*Stable Sort*)

Algoritmus řazení je **stabilní** (*stable*), pokud **zaručuje zachování původního relativního pořadí prvků, které mají shodný klíč**:

```python
# Mějme studenty s předem daným abecedním pořadím:
studenti = [
    ("Adam", "B"),
    ("Boris", "A"),
    ("Cyril", "B"),
    ("Daniel", "A"),
]

# Seřadíme pouze podle známky:
podle_znamky = sorted(studenti, key=lambda s: s[1])
for s in podle_znamky:
    print(s)
```

### Výstup:
```text
('Boris', 'A')
('Daniel', 'A')  <- Daniel zůstal za Borisem!
('Adam', 'B')
('Cyril', 'B')   <- Cyril zůstal za Adamem!
```

Nestabilní algoritmy (např. standardní Quicksort či Heapsort v jiných jazycích) by mohly vzájemné pořadí Adama a Cyrila náhodně prohodit.

---
<!-- slide: id16, Vícenásobné postupné řazení, Core, pythonic -->
## Vícenásobné postupné řazení díky stabilitě

Díky stabilitě Timsortu lze složité řazení provést i postupným voláním řazení od nejméně významného kritéria k nejvýznamnějšímu:

```python
# Chceme seřadit: primárně podle ZNÁMKY vzestupně, sekundárně podle VĚKU sestupně:
data = [("Petr", "B", 25), ("Jana", "A", 22), ("Karel", "A", 28)]

# 1. Nejprve seřadíme podle sekundárního kritéria (věk sestupně):
data.sort(key=lambda s: s[2], reverse=True)

# 2. Následně seřadíme podle primárního kritéria (známka vzestupně):
data.sort(key=lambda s: s[1])

print(data)
# [('Karel', 'A', 28), ('Jana', 'A', 22), ('Petr', 'B', 25)]
```

Karel a Jana mají oba známku 'A', ale Karel (28) je před Janou (22) díky stabilitě z prvního kroku.

---
<!-- slide: id17, Vlastní porovnávací logika ve třídách: magická metoda __lt__, Core, paradigm -->
## Vlastní porovnávání ve třídách: metoda `__lt__`

Aby se objekty vlastních tříd daly přirozeně řadit pomocí `sorted(seznam)`, stačí ve třídě implementovat magickou metodu **`__lt__(self, other)`** (*less than*, operátor `<`):

```python
from functools import total_ordering

@total_ordering  # Automaticky domyslí operátory <=, >, >= na základě __lt__ a __eq__
class Student:
    def __init__(self, jmeno: str, prumer: float) -> None:
        self.jmeno = jmeno
        self.prumer = prumer

    def __lt__(self, other: "Student") -> bool:
        return self.prumer < other.prumer

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Student):
            return NotImplemented
        return self.prumer == other.prumer

    def __repr__(self) -> str:
        return f"{self.jmeno} ({self.prumer})"

studenti = [Student("Petr", 1.8), Student("Anna", 1.2), Student("David", 1.5)]
print(sorted(studenti))
# [Anna (1.2), David (1.5), Petr (1.8)]
```

---
<!-- slide: id18, Národní specifika řazení a modul locale, Skip, basics -->
## Národní abecedy a české řazení

Standardní Unicode řazení řadí znaky s diakritikou až za celou anglickou abecedu (např. `'č'` má kód 269, zatímco `'z'` má kód 122). České písmeno `'Č'` by se tak bez úprav ocitlo až za písmenem `'Z'`.

Pro řazení dle českých jazykových pravidel (včetně spřežky `ch` a háčků):

```python
import locale

# Nastavení české lokalizace:
locale.setlocale(locale.LC_COLLATE, "cs_CZ.UTF-8")

slova = ["cukr", "čaj", "cibule"]

# Standardní řazení (chybné pro češtinu):
print(sorted(slova))
# ['cibule', 'cukr', 'čaj']  <- 'č' skončilo až na konci!

# Řazení s ohledem na českou normu ČSN 97 6030:
print(sorted(slova, key=locale.strxfrm))
# ['cibule', 'cukr', 'čaj']
```

V moderním produkčním prostředí se pro spolehlivou mezinárodní lokalizaci napříč OS doporučuje balíček `PyICU` (International Components for Unicode).
