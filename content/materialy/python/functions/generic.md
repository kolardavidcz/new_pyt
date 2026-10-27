<!-- slide: id1, Úvod, Core, paradigm -->
## Generické funkce: Přetěžování na základě typů v Pythonu

V dynamickém jazyce často potřebujeme, aby se funkce chovala odlišně podle typu předaného argumentu (např. serializátor formátuje čísla, datumy a seznamy zcela jinak).

Tradiční (nečistý) přístup vyžadoval zdlouhavé větvení pomocí `isinstance`:
```python
def zpracuj(arg):
    if isinstance(arg, int):
        ...
    elif isinstance(arg, list):
        ...
```
Takový kód porušuje princip Open/Closed (nelze přidat podporu pro nový typ bez úpravy původní funkce).

> [!NOTE]
> **Generická funkce** (*Generic Function*) se skládá z rodiny samostatných specializovaných funkcí. Při jejím zavolání vybere **výběrový algoritmus (*dispatch algorithm*)** nejvhodnější implementaci podle typu argumentu.

---
<!-- slide: id2, „Single dispatch“ funkce, Core, newconcept -->
## Dekorátor `@functools.singledispatch`

Python nabízí podporu pro generické funkce prostřednictvím dekorátoru **`@singledispatch`** z modulu `functools` (tzv. *single-dispatch* = výběr implementace na základě typu **prvního argumentu**):

```python
from functools import singledispatch

# Základní funkce rodiny (fallback pro neznámé typy):
@singledispatch
def formatuj(arg):
    """Výchozí implementace pro obecný typ object."""
    return f"[Obecný objekt]: {repr(arg)}"
```

Odekorovaná funkce získá atribut **`register`**, který slouží jako dekorátor pro registraci specializovaných variant.

---
<!-- slide: id3, Příklad, WOW, pythonic -->
## Registrace přes typové anotace (Python 3.11+)

Moderní Python umožňuje registrovat implementace čistě pomocí typových anotací bez opakování názvu funkce (používá se dummy název `_`):

```python
from functools import singledispatch
from datetime import date

@singledispatch
def formatuj(arg):
    return str(arg)

# Registrace pro celá a reálná čísla přes sjednocení typů (PEP 604, Python 3.11+):
@formatuj.register
def _(arg: int | float) -> str:
    return f"Číslo: {arg:0.2f}"

# Registrace pro datum:
@formatuj.register
def _(arg: date) -> str:
    return arg.strftime("%d. %m. %Y")

# Test volání:
print(formatuj(42))           # Číslo: 42.00
print(formatuj(date.today())) # 27. 10. 2026
print(formatuj("ahoj"))       # ahoj (spadne do výchozí implementace)
```

---
<!-- slide: id4, Poznámky k atributu „register“, Core, pythonic -->
## Možnosti metody `register`

Atribut `register` lze používat jak deklarativně (jako dekorátor), tak procedurálně:

```python
# 1. Procedurální registrace existující funkce:
# formatuj.register(Typ, existujici_funkce)
formatuj.register(type(None), lambda _: "Žádná hodnota (None)")

# 2. Řetězení dekorátorů pro více různých typů:
@formatuj.register(list)
@formatuj.register(tuple)
def _(arg):
    return f"Kolekce o délce {len(arg)}"
```

Protože `register` vrací původní neupravenou funkci, můžete na ni vrstvit více dekorátorů pro různé typy.

---
<!-- slide: id5, Přehled implementací – „registry“, Tricky, newconcept -->
## Inspekce zaregistrovaných typů: `f.registry`

Registrované implementace jsou uloženy v mapovacím proxy objektu v atributu **`f.registry`**:

```python
from functools import singledispatch
from pprint import pprint

@singledispatch
def akce(x):
    pass

@akce.register(int)
def _(x: int):
    pass

pprint(akce.registry)
# mappingproxy({
#     <class 'object'>: <function akce at 0x...>,
#     <class 'int'>: <function _ at 0x...>
# })
```

Klíč `<class 'object'>` vždy odpovídá základní fallback funkci.

---
<!-- slide: id6, Přehled implementací – „dispatch()“, Core, newconcept -->
## Která funkce se zavolá? Metoda `dispatch()`

Pokud chcete programově zjistit, jaká konkrétní funkce by byla vybrána pro zadaný typ bez jejího spuštění, použijte metodu **`dispatch(cls)`**:

```python
# Vrátí funkci zaregistrovanou přímo pro int:
print(akce.dispatch(int))
# <function _ at 0x...>

# Pro neregistrovaný typ (např. dict) vrátí výchozí fallback (object):
print(akce.dispatch(dict))
# <function akce at 0x...>
```

Algoritmus respektuje dědičnost (MRO): pokud zaregistrujete obsluhu pro `collections.abc.Sequence`, uplatní se i pro potomky, pokud nemají specifičtější registraci.

---
<!-- slide: id7, Generické metody, WOW, pythonic -->
## Generické metody v OOP: `@singledispatchmethod`

Pro metody tříd (kde je prvním argumentem `self` nebo `cls`) slouží specializovaný dekorátor **`@singledispatchmethod`**:

Výběrový algoritmus automaticky přeskakuje první argument (`self` / `cls`) a vybírá podle **prvního skutečného datového parametru**:

```python
from functools import singledispatchmethod

class Prevodnik:
    @singledispatchmethod
    def transformuj(self, data):
        raise NotImplementedError(f"Nepodporovaný typ: {type(data)}")

    @transformuj.register
    def _(self, data: str) -> str:
        return data.strip().upper()

    @transformuj.register
    def _(self, data: list) -> list:
        return [self.transformuj(item) for item in data]

p = Prevodnik()
print(p.transformuj("  ahoj  "))        # AHOJ
print(p.transformuj(["  pes  ", "les"])) # ['PES', 'LES']
```
