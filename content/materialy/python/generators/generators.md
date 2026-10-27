<!-- slide: id1, Úvod, Core, newconcept -->
## Úvod do generátorů v Pythonu

Typickým prvkem funkcionálního a moderního datového programování je **líné vyhodnocování** (*lazy evaluation*):
- Vytváření (potenciálně i nekonečných) proudů dat.
- Z posloupnosti se počítá a vrací pouze ta hodnota, která je aktuálně vyžadována (*on demand*).
- Zbytek se v paměti nevytváří ani nepředpočítává.

V objektovém světě jsme si ukázali [vlastní iterátory](../iterators/iterators.md) s metodami `__iter__()` a `__next__()`. Ty však vyžadují psaní celé třídy a manuální správu vnitřního stavu.

**Generátory** (*generators*) představují elegantní funkcionální způsob, jak vytvořit iterátor:
- Vycházejí z běžné funkce, v jejímž těle se nachází klíčové slovo **`yield`**.
- Python takovou funkci automaticky zkompiluje jako továrnu na generátorové objekty.

---
<!-- slide: id2, Funkce „next()“ a výjimka „StopIteration“, Core, newconcept -->
## Funkce `next()` a výjimka `StopIteration`

Když zavoláme funkci obsahující `yield`, její kód se hned nespustí! Místo toho vrátí **objekt generátoru** (*generator object*), který implementuje iterační protokol.

Krokujeme jej vestavěnou funkcí `next()`:

```python
def generator():
    yield "první volání"
    yield "druhé volání"

g = generator()
print(type(g))  # <class 'generator'>

print(next(g))  # 'první volání'
print(next(g))  # 'druhé volání'
print(next(g))  # StopIteration!
```

> [!NOTE] Mechanismus pozastavení (State Suspension)
> Každý příkaz `yield` předá hodnotu volajícímu a **„zmrazí“** lokální stav funkce (všechny lokální proměnné, instrukční ukazatel a zásobník). Při dalším volání `next()` se vykonávání probudí přesně tam, kde naposledy skončilo.
>
> Pokud dojde na konec těla funkce, generátor automaticky vyhodí výjimku `StopIteration`.

---
<!-- slide: id3, PS: Hlášení konce „next()“ bez výjimky, WOW, pythonic -->
## Hlášení konce `next()` s výchozí hodnotou

Vyhození výjimky `StopIteration` při vyčerpání generátoru je standardní chování protokolu. Někdy však chceme generátor vyčerpávat manuálně (např. ve smyčce `while`) bez nutnosti psát blok `try-except`.

Funkce `next()` přijímá volitelný **druhý argument** – výchozí hodnotu (*default*), která se vrátí namísto vyhození výjimky:

```python
lines = ["první řádek", "druhý řádek", "třetí řádek"]
it = iter(lines)

# Elegantní čtení v Pythonu 3.8+ pomocí Walrus operátoru (:=):
while (radek := next(it, None)) is not None:
    print(f"Zpracováno: {radek}")
```

> [!TIP] Sentinel pattern
> Pokud může generátor legitimně vracet i `None`, jako výchozí hodnotu zvolte unikátní sentinel:
> ```python
> _SENTINEL = object()
> val = next(it, _SENTINEL)
> if val is _SENTINEL:
>     ...
> ```

---
<!-- slide: id4, Smyčka „for-in“, Core, basics -->
## Smyčka `for-in`

V naprosté většině případů nevoláme `next()` ručně. Smyčka `for ... in ...` si generátor automaticky inicializuje i ukončí:

```python
def odpočet(n: int):
    """Generátor odpočítávající od n k 1."""
    while n > 0:
        yield n
        n -= 1

for krok in odpočet(3):
    print(krok)
# 3
# 2
# 1
```

Smyčka `for`:
1. Získá iterátor (u generátoru vrátí sám sebe).
2. Volá `next()` pro každou iteraci.
3. Při zachycení `StopIteration` cyklus tiše a korektně opustí.

---
<!-- slide: id5, „next()“ a „for-in“ dohromady, Core, pythonic -->
## Kombinace `next()` a smyčky `for-in`

Generátor si svůj stav nese sebou. Pokud z něj část prvků spotřebujete pomocí `next()`, smyčka `for-in` bude pokračovat přesně od místa, kde generátor zůstal pozastaven:

```python
def stream_logu():
    yield "HEADER: v2.0"
    yield "METADATA: timestamp=12345"
    yield "DATA: 100"
    yield "DATA: 200"
    yield "DATA: 300"

log = stream_logu()

# Ručně načteme hlavičky:
hlavicka = next(log)
metadata = next(log)
print(f"Zpracovávám: {hlavicka} | {metadata}")

# Zbylé datové řádky zpracujeme ve smyčce:
for zaznam in log:
    print(f"-> {zaznam}")
```

> [!NOTE] Jednosměrnost generátoru
> Generátor je **jednorázový proud**. Jakmile prvek jednou vydá (nebo ho přeskočíte), nelze se v něm vrátit zpět ani jej restartovat. Pro nový průchod musíte vytvořit novou instanci zavoláním funkce generátoru znovu.

---
<!-- slide: id6, Automatická versus manuální iterace, Tricky, pythonic -->
## Automatická versus manuální iterace

Mezi voláním `next()` a smyčkou `for-in` existuje zásadní rozdíl:

| Vlastnost | `next(it)` | `for x in it:` |
| :--- | :--- | :--- |
| **Očekávaný vstup** | Instance iterátoru/generátoru | Jakýkoliv Iterable (nebo Iterator) |
| **Konec iterace** | Vyhodí `StopIteration` (pokud není default) | Tichý konec smyčky |
| **Časté použití** | Načtení hlavičky, sentinel smyčky | Kompletní zpracování prvků |

### Pozor na častou chybu nováčků:
```python
def gen():
    yield 1
    yield 2

# CHYBA: Volání konstruktoru v každém kroku!
print(next(gen()))  # 1
print(next(gen()))  # 1 (zcela nová instance!)

# SPRÁVNĚ: Uložit instanci do proměnné
g = gen()
print(next(g))      # 1
print(next(g))      # 2
```

---
<!-- slide: id7, Poznámka – metoda „__next__()“, Skip, resyntax -->
## Dunder metoda `__next__()`

Pod kapotou volá globální funkce `next(g)` dunder metodu `g.__next__()`. Generátorový objekt v Pythonu přímo implementuje **Iterator Protocol**:

```python
def muj_gen():
    yield 42

g = muj_gen()

# Generátor má obě dunder metody iterátoru:
print(hasattr(g, "__iter__"))  # True (vrací sám sebe)
print(hasattr(g, "__next__"))  # True

# Přímé volání dunder metody (v běžném kódu preferujeme next(g)):
print(g.__next__())  # 42
```

Generátor navíc disponuje specializovanými metodami jako `.close()`, `.send()` a `.throw()`, které umožňují obousměrnou komunikaci (podstata korutin).

---
<!-- slide: id8, Co všechno způsobí „next()“, Tricky, newconcept -->
## Kdy se kód generátoru skutečně vykoná?

Zásadní vlastnost: **Kód před prvním `yield` se nespustí při vytvoření generátoru, ale až při prvním volání `next()`!**

```python
def diagnostika():
    print(">>> 1. Start generátoru (inicializace)")
    yield "první bod"
    print(">>> 2. Běh mezi yieldy")
    yield "druhý bod"
    print(">>> 3. Doběh do konce funkce")

print("Vytvářím generátor:")
g = diagnostika()  # Zde se nevytiskne vůbec NIC!

print("\nVolám 1. next():")
v1 = next(g)       # Vytiskne: >>> 1. Start... a vrátí "první bod"

print("\nVolám 2. next():")
v2 = next(g)       # Vytiskne: >>> 2. Běh... a vrátí "druhý bod"

print("\nVolám 3. next():")
try:
    next(g)        # Vytiskne: >>> 3. Doběh... a vyhodí StopIteration
except StopIteration:
    print("Generátor korektně skončil.")
```

---
<!-- slide: id9, „Konstruktor“ generátoru a jeho parametry, Core, basics -->
## Parametry generátorové funkce

Protože je generátor definován běžným `def`, může přijímat libovolné parametry (včetně typových anotací, `*args`, `**kwargs` i `kw_only`):

```python
from collections.abc import Iterator

def licha_cisla(od: int = 1, krok: int = 2) -> Iterator[int]:
    """Generuje nekonečnou řadu lichých čísel s daným krokem."""
    aktualni = od
    while True:
        yield aktualni
        aktualni += krok

gen = licha_cisla(od=11)
print(next(gen))  # 11
print(next(gen))  # 13
print(next(gen))  # 15
```

> [!NOTE] Typová anotace generátorů
> Pro jednoduché generátory importujeme `from collections.abc import Iterator` a zapisujeme návratový typ jako `Iterator[T]`.
>
> Pro pokročilé generátory přijímající vstupy přes `.send()` slouží `Generator[YieldType, SendType, ReturnType]`.

---
<!-- slide: id10, Konečné generátory, Core, basics -->
## Konečné generátory

Mnoho generátorů má přirozený konec (např. iterace přes konečnou datovou strukturu nebo ohraničený výpočet). Jakmile funkce doběhne za svůj poslední řádek (nebo narazí na `return`), generátor je vyčerpán:

```python
from collections.abc import Sequence, Iterator

def zpetny_chod[T](data: Sequence[T]) -> Iterator[T]:
    """Generátor procházející sekvenci pozpátku bez kopírování paměti."""
    for i in range(len(data) - 1, -1, -1):
        yield data[i]

for pismeno in zpetny_chod("Ahoj!"):
    print(pismeno)
# !
# j
# o
# h
# A
```

> [!TIP] Paměťová efektivita
> Namísto vytvoření obráceného pole `data[::-1]` (což alokuje nový paměťový blok pro celou kopii) generátor pouze posouvá index. Paměťová složitost je $O(1)$.

---
<!-- slide: id11, Konečné generátory – „return“, Tricky, newconcept -->
## Návratová hodnota v generátoru (`return`)

V moderním Pythonu může generátor obsahovat také příkaz `return HODNOTA`:
- Vykonání `return` okamžitě ukončí generátor.
- Hodnota předaná do `return` se nestane dalším prvkem iterace, nýbrž je uložena do atributu `.value` vyvolané výjimky `StopIteration`!

```python
def pocitadlo():
    yield 1
    yield 2
    return "HOTOVO"
    yield 3  # Sem se řízení nikdy nedostane

g = pocitadlo()
print(next(g))  # 1
print(next(g))  # 2

try:
    next(g)
except StopIteration as err:
    print(f"Generátor vrátil: {err.value}")  # 'HOTOVO'
```

> [!NOTE] Význam pro `yield from`
> V běžné smyčce `for-in` je tato návratová hodnota ignorována. Její zásadní role se projevuje u delegování pomocí `yield from`, kde se stane výsledkem výrazu: `vysledek = yield from subgen()`.

---
<!-- slide: id12, Konečné generátory – „close()“, Core, newconcept -->
## Explicitní ukončení metodou `.close()`

Pokud spotřebitel generátoru už nechce odebírat další data (např. našel hledaný prvek nebo nastala chyba), může generátor explicitně ukončit voláním `.close()`:

```python
def stream_cisel():
    try:
        n = 0
        while True:
            yield n
            n += 1
    finally:
        print("-> Úklid prostředků v bloku finally")

g = stream_cisel()
print(next(g))  # 0
print(next(g))  # 1

# Předčasné ukončení generátoru:
g.close()
# Vytiskne: -> Úklid prostředků v bloku finally

# Další volání next() už okamžitě selže:
try:
    next(g)
except StopIteration:
    print("Generátor je již uzavřen.")
```

Metoda `.close()` vyvolá uvnitř pozastaveného generátoru výjimku `GeneratorExit`, což umožní proběhnout všem blokům `try ... finally` a kontextovým manažerům.

---
<!-- slide: id13, Nekonečné generátory, WOW, paradigm -->
## Nekonečné proudy dat

Díky línému vyhodnocování můžeme v generátorech bezpečně pracovat s **nekonečnými posloupnostmi**:
- Paměťová náročnost je konstantní $O(1)$ bez ohledu na počet vygenerovaných hodnot.
- Nikdy nedojde k `MemoryError`.

```python
from collections.abc import Iterator
import itertools

def fibonacci() -> Iterator[int]:
    """Generuje nekonečnou posloupnost Fibonacciho čísel."""
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

# Odběr prvních 8 čísel pomocí itertools.islice:
fib = fibonacci()
prvnich_osm = list(itertools.islice(fib, 8))
print(prvnich_osm)  # [0, 1, 1, 2, 3, 5, 8, 13]
```

> [!WARNING] Pozor na nekonečný cyklus!
> Nikdy nevolejte `list(fibonacci())` nebo neprocházejte nekonečný generátor smyčkou `for x in fibonacci:` bez ukončující podmínky (`break`), jinak dojde k zacyklení programu.

---
<!-- slide: id14, Poznámka – „yield from“, Core, newconcept -->
## Delegování generátorů: `yield from`

Od Pythonu 3.3 máme k dispozici operátor **`yield from`** (PEP 380), který řeší delegování na podřízený iterátor či generátor:

### Místo manuálního přeposílání ve smyčce:
```python
# Zastaralý přístup:
def sloucit_stary(iter1, iter2):
    for x in iter1:
        yield x
    for y in iter2:
        yield y
```

### Moderní Pythonic zápis s `yield from`:
```python
def sloucit_moderni(iter1, iter2):
    yield from iter1
    yield from iter2

seznam = list(sloucit_moderni(["A", "B"], ["C", "D"]))
print(seznam)  # ['A', 'B', 'C', 'D']
```

`yield from` navíc transparentně propojuje obousměrné kanály pro `.send()`, `.throw()` a přebírá návratovou hodnotu (`return`) subgenerátoru.
