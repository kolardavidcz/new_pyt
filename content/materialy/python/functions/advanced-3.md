<!-- slide: id1, Úvod, Core, basics -->
## Modul `functools`: Funkce vyššího řádu

V Pythonu jsou funkce prvotřídními objekty (*first-class citizens*). Standardní modul **`functools`** poskytuje arzenál nástrojů pro práci s **funkcemi vyššího řádu** (*higher-order functions*) – tedy funkcemi, které přijímají jiné funkce jako argumenty nebo je vracejí.

Mezi klíčové nástroje `functools` patří:
- **`@wraps`**: Zachování metadat dekorované funkce.
- **`@cache` / `@lru_cache`**: Vysoce efektivní memoizace a mezipaměť volání.
- **`partial()`**: Fixování vybraných argumentů funkce (částečná aplikace).
- **`reduce()`**: Agregace sekvence na jedinou hodnotu pomocí binárního operátoru.
- **`@singledispatch`**: Přetěžování funkcí podle typu prvního argumentu.
- **`@total_ordering`**: Automatické doplnění srovnávacích operátorů třídy.
- **`@cached_property`**: Líně počítaná a cachovaná vlastnost třídy.

---
<!-- slide: id2, „wraps()“ – kopie otisku funkce, Core, pythonic -->
## Zachování metadat funkce: `@functools.wraps`

Při tvorbě vlastních dekorátorů dochází k obalení původní funkce vnitřním wrapperem. Bez použití `@wraps` však původní funkce ztratí své jméno, nápovědu (`__doc__`) i typové anotace:

```python
from functools import wraps
from collections.abc import Callable
import time

def zmer_cas[**P, R](func: Callable[P, R]) -> Callable[P, R]:
    @wraps(func)  # Zkopíruje __name__, __doc__, __annotations__ a __wrapped__
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        start = time.perf_counter()
        vysledek = func(*args, **kwargs)
        trvani = time.perf_counter() - start
        print(f"[{func.__name__}] trval {trvani:.4f} s")
        return vysledek
    return wrapper

@zmer_cas
def vypocet(n: int) -> int:
    """Spočítá sumu čísel."""
    return sum(range(n))

print(vypocet.__name__)  # 'vypocet' (nikoli 'wrapper'!)
print(vypocet.__doc__)   # 'Spočítá sumu čísel.'
```

> [!TIP] Atribut `__wrapped__`
> Díky `@wraps` můžete k původní neodekorované funkci kdykoli přistoupit přes `vypocet.__wrapped__` (užitečné např. při psaní unit testů).

---
<!-- slide: id3, „partial()“ – částečné vyhodnocení některých argumentů, WOW, pythonic -->
## Fixování argumentů: `functools.partial()`

Funkce `partial()` vytvoří novou volatelnou entitu s některými předem předvyplněnými (zafixovanými) argumenty:

```python
from functools import partial

# 1. Zafixování pojmenovaného argumentu:
tisk_chyby = partial(print, "[CHYBA]", sep=" ")
tisk_chyby("Soubor nenalezen!")  # [CHYBA] Soubor nenalezen!

# 2. Nastavení kódování pro open:
otevri_utf8 = partial(open, encoding="utf-8")

# 3. Zafixování číselné báze:
baze2 = partial(int, base=2)
print(baze2("10110"))  # 22
```

Pro metody uvnitř tříd slouží příbuzný dekorátor `functools.partialmethod`.

---
<!-- slide: id4, „reduce()“ – redukce iterátorů na jednu hodnotu, Core, pythonic -->
## Akumulace hodnot: `functools.reduce()`

Funkce `reduce(funkce, sekvence[, inicializátor])` postupně aplikuje binární funkci na prvky zleva doprava a redukuje celou sekvenci na jedinou hodnotu:

$$\text{reduce}(f, [a, b, c, d]) \iff f(f(f(a, b), c), d)$$

```python
from functools import reduce
import operator

cisla = [1, 2, 3, 4, 5]

# Výpočet faktoriálu (součin všech prvků):
faktorial = reduce(operator.mul, cisla)
print(faktorial)  # 120

# Sloučení množin z více zdrojů:
mnoziny = [{1, 2}, {2, 3}, {3, 4}]
sjednoceni = reduce(operator.or_, mnoziny, set())
print(sjednoceni)  # {1, 2, 3, 4}
```

> [!NOTE] Kdy použít `reduce()`?
> Pokud v Pythonu existuje vestavěná funkce (např. `sum()`, `math.prod()`, `any()`, `all()`), vždy ji preferujte před `reduce()`. `reduce()` použijte tehdy, když potřebujete netriviální akumulační logiku.

---
<!-- slide: id5, „singledispatch()“ – přetěžování v prvním argumentu, Skip, basics -->
## Generické funkce: `@functools.singledispatch`

Python nativně nepodporuje přetěžování funkcí (*function overloading*) podle typů argumentů. Modul `functools` však nabízí dekorátor `@singledispatch`, který umožňuje zvolit implementaci podle typu **prvního argumentu**:

```python
from functools import singledispatch

@singledispatch
def formatuj(val: object) -> str:
    """Výchozí implementace pro neznámé typy."""
    return f"Objekt: {val!r}"

@formatuj.register
def _(val: int) -> str:
    return f"Celé číslo: {val:,}"

@formatuj.register
def _(val: list) -> str:
    return f"Seznam o {len(val)} prvcích: {val}"

print(formatuj(1000000))       # Celé číslo: 1,000,000
print(formatuj(["a", "b"]))     # Seznam o 2 prvcích: ['a', 'b']
print(formatuj(3.14))          # Objekt: 3.14
```

Pro metody ve třídách slouží `@functools.singledispatchmethod`.

---
<!-- slide: id6, „lru_cache()“ – podpora pro memoizaci, WOW, pythonic -->
## Memoizace s omezenou pamětí: `@functools.lru_cache`

Dekorátor `@lru_cache` ukládá do mezipaměti výsledky volání funkce na základě jejích argumentů:
- **LRU (Least Recently Used)**: Při zaplnění kapacity vyřadí z mezipaměti nejdéle nepoužité položky.
- Standardní kapacita je `maxsize=128`.
- Je plně bezpečný pro více vláken (*thread-safe*).

```python
from functools import lru_cache

@lru_cache(maxsize=256)
def nacti_kurz(mena: str, datum: str) -> float:
    # Simulace náročného síťového volání API:
    print(f"Stahuji kurz pro {mena} dne {datum}...")
    return 25.42

print(nacti_kurz("EUR", "2026-10-27"))  # Stahuje ze sítě
print(nacti_kurz("EUR", "2026-10-27"))  # Vrátí ihned z cache!

# Statistiky využití:
print(nacti_kurz.cache_info())
# CacheInfo(hits=1, misses=1, maxsize=256, currsize=1)
```

> [!IMPORTANT] Požadavky na memoizaci
> 1. Všechny argumenty funkce musí být **hashovatelné** (čísla, řetězce, neměnné n-tice – nikoli `list` nebo `dict`).
> 2. Funkce musí být **čistá** (*pure function*): pro stejné vstupy musí vždy vrátit stejný výstup bez vedlejších efektů.

---
<!-- slide: id7, „cache()“ ==  „lru_cache(maxsize=None)“, WOW, pythonic -->
## Neomezená mezipaměť: `@functools.cache`

V Pythonu 3.9 přibyl dekorátor **`@cache`**, který je přímou a optimalizovanou zkratkou pro `@lru_cache(maxsize=None)`:
- Nemá žádný limit velikosti mezipaměti.
- Díky absenci logiky vyskladňování prvků (LRU eviction) je o poznání **rychlejší** než `lru_cache`.

```python
from functools import cache

@cache
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Bez cache by výpočet pro n=100 trval tisíce let (O(2^n)).
# S @cache proběhne v čase O(n) za zlomek milisekundy:
print(fibonacci(100))  # 354224848179261915075

# Vyčištění mezipaměti v případě potřeby:
fibonacci.cache_clear()
```

---
<!-- slide: id8, „totalordering()“ – porovnávání instancí tříd, WOW, pythonic -->
## Automatické operátory porovnání: `@functools.total_ordering`

Chceme-li, aby instance naší třídy šlo porovnávat pomocí `<`, `<=`, `>`, `>=`, museli bychom implementovat všech 6 dunder metod (`__lt__`, `__le__`, `__gt__`, `__ge__`, `__eq__`, `__ne__`).

Dekorátor třídy **`@total_ordering`** vyžaduje implementovat pouze:
1. Metodu **`__eq__`**
2. **Jednu** ze srovnávacích metod: `__lt__`, `__le__`, `__gt__` nebo `__ge__`

Všechny zbývající operátory dekorátor automaticky a matematicky konzistentně domyslí!

```python
from functools import total_ordering

@total_ordering
class Student:
    def __init__(self, jmeno: str, kredit: int) -> None:
        self.jmeno = jmeno
        self.kredit = kredit

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Student):
            return NotImplemented
        return self.kredit == other.kredit

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Student):
            return NotImplemented
        return self.kredit < other.kredit

s1 = Student("Alice", 120)
s2 = Student("Bob", 90)

print(s1 > s2)   # True (automaticky odvozeno z __lt__)
print(s1 <= s2)  # False (automaticky odvozeno)
```

---
<!-- slide: id9, PS: Varianty pro metody tříd, Skip, newconcept -->
## Další praktické dekorátory: `@cached_property`

Od Pythonu 3.8 nabízí `functools` také dekorátor **`@cached_property`**:
- Funguje jako `@property`, ale výsledek se spočítá pouze **jednou** při prvním přístupu.
- Následně se uloží přímo do `__dict__` instance daného objektu jako obyčejný atribut.
- Každý další přístup je okamžitý a nevyvolává žádný kód.

```python
from functools import cached_property
import statistics

class DatovaSada:
    def __init__(self, hodnoty: list[float]) -> None:
        self.hodnoty = hodnoty

    @cached_property
    def smerodatna_odchylka(self) -> float:
        print("Počítám náročnou směrodatnou odchylku...")
        return statistics.stdev(self.hodnoty)

ds = DatovaSada([1.2, 3.4, 2.8, 5.1, 4.3])
print(ds.smerodatna_odchylka)  # Počítá a vypíše výsledek
print(ds.smerodatna_odchylka)  # Okamžitá hodnota bez přepočtu!
```
