<!-- slide: id=id1 title="Úvod do modulu inspect" tags="Core" diff="newconcept" -->
## Úvod do modulu `inspect`

Modul **`inspect`** slouží k získávání podrobných informací o „živých“ objektech za běhu programu – modulech, třídách, instancích, funkcích, generátorech i rámcích zásobníku:

- **Zjišťování typů a členství**: Ověřování, zda je objekt třída, funkce, modul či korutina (`isclass`, `isfunction`, `isgeneratorfunction`).
- **Průzkum struktury objektů**: Získání všech atributů a metod splňujících predikát (`getmembers`).
- **Hierarchie dědičnosti**: Strom tříd (`getclasstree`) a pořadí vyhledávání metod (`getmro`).
- **Signatury a parametry**: Detailní inspekce parametrů, výchozích hodnot a typových anotací (`signature`, `getfullargspec`).
- **Zdrojový kód**: Načtení zdrojového kódu živé funkce přímo ze souboru na disku (`getsource`).

---
<!-- slide: id=id2 title="Testovací struktura" tags="Already Studied" diff="resyntax" -->
## Testovací struktura

Pro ukázky inspekce využijeme objektový model školy s dědičností:

```python
class Člověk:
    """Objektová reprezentace člověka."""

    def __init__(self, jméno: str, datum_narození: str, krevní_skupina: str):
        self.jméno = jméno
        self.datum_narození = datum_narození
        self.krevní_skupina = krevní_skupina

class Školák(Člověk):
    """Objektová reprezentace školáka."""

    školáků: int = 0

    def __init__(self, jméno: str, datum_narození: str, krevní_skupina: str, třída: str, předměty: dict[str, int]):
        super().__init__(jméno, datum_narození, krevní_skupina)
        self.třída = třída
        self.předměty = předměty
        self.přidej_školáka()

    @classmethod
    def přidej_školáka(cls) -> None:
        cls.školáků += 1

    def průměrná_známka(self) -> float:
        """Vrací průměr všech známek studenta."""
        return sum(self.předměty.values()) / len(self.předměty) if self.předměty else 0.0

class Učitel(Člověk):
    """Objektová reprezentace učitele."""

    def __init__(self, jméno: str, datum_narození: str, krevní_skupina: str, třída: str, předměty: list[str], výplata: int):
        super().__init__(jméno, datum_narození, krevní_skupina)
        self.třída = třída
        self.předměty = předměty
        self.výplata = výplata
```

---
<!-- slide: id=id3 title="Typy a členství – getmembers() I" tags="Core" diff="newconcept" -->
## Typy a členství: `inspect.getmembers()`

Základní funkcí pro získání všech členů objektu je **`inspect.getmembers(objekt, predicate=None)`**. Bez druhého parametru vrátí seznam dvojic `(název, hodnota)` pro všechny dostupné atributy:

```python
# Program: inspect_members.py
import inspect
from test_skola import Školák

alisa = Školák(
    'Алиса Селезneva',
    '2065-11-17',
    '0',
    '3. A',
    {'matematika': 1, 'zeměpis': 1},
)

for name, value in inspect.getmembers(alisa):
    print(f"{name:16} : {value}")
```

**Výstup:**
```text
__class__        : <class 'test_skola.Školák'>
__doc__          : Objektová reprezentace školáka.
__init__         : <bound method Školák.__init__ of <Školák object at 0x7f8a1c>>
datum_narození   : 2065-11-17
jméno            : Алиса Селезneva
krevní_skupina   : 0
průměrná_známka  : <bound method Školák.průměrná_známka of <Školák object at 0x7f8a1c>>
předměty         : {'matematika': 1, 'zeměpis': 1}
přidej_školáka   : <bound method Školák.přidej_školáka of <class 'test_skola.Školák'>>
třída            : 3. A
školáků          : 1
```

---
<!-- slide: id=id4 title="Typy a členství – getmembers() II" tags="WOW" diff="pythonic" -->
## Filtrování členů pomocí predikátů

Druhým parametrem `getmembers()` je omezující podmínka (predikát). Vráceny budou pouze ty položky, pro které funkce vrátí `True`:

```python
import inspect
from test_skola import Školák

alisa = Školák('Алиса', '2065-11-17', '0', '3. A', {'matematika': 1})

# Použití vestavěných predikátů inspect.is*
print("Metody instance:")
for name, value in inspect.getmembers(alisa, inspect.ismethod):
    print(f"  {name:16} : {value}")

# Vlastní predikát (např. pouze řetězcové atributy)
print("\nPouze string atributy:")
for name, value in inspect.getmembers(alisa, lambda v: isinstance(v, str)):
    print(f"  {name:16} : {value}")
```

**Výstup:**
```text
Metody instance:
  __init__         : <bound method Školák.__init__ of <Školák object at ...>>
  průměrná_známka  : <bound method Školák.průměrná_známka of <Školák object at ...>>
  přidej_školáka   : <bound method Školák.přidej_školáka of <class 'Školák'>>

Pouze string atributy:
  __doc__          : Objektová reprezentace školáka.
  __module__       : test_skola
  datum_narození   : 2065-11-17
  jméno            : Алиса
  krevní_skupina   : 0
  třída            : 3. A
```

---
<!-- slide: id=id5 title="Typy a členství – is-metody" tags="Core" diff="newconcept" -->
## Predikátové funkce: `inspect.is*`

Modul `inspect` obsahuje desítky specializovaných funkcí pro ověření povahy objektu:

```python
import inspect

def gen():
    yield 1

async def async_fn():
    pass

print(inspect.ismodule(inspect))             # True
print(inspect.isclass(str))                  # True
print(inspect.isfunction(lambda x: x))       # True
print(inspect.isgeneratorfunction(gen))      # True
print(inspect.iscoroutinefunction(async_fn)) # True
print(inspect.isbuiltin(print))              # True
```

Tyto funkce jsou mnohem spolehlivější než pouhé srovnávání `type(obj) is FunctionType`, protože správně ošetřují céčkově implementované funkce, bound metody i speciální obaly.

---
<!-- slide: id=id6 title="Typy a členství – getmoduleinfo()" tags="Skip" diff="basics" -->
## Informace o modulech: `inspect.getmodule()`

Pro zjištění, ze kterého modulu konkrétní objekt pochází, slouží **`inspect.getmodule(objekt)`**:

```python
import inspect
from test_skola import Školák

mod = inspect.getmodule(Školák)
print(mod.__name__)  # -> test_skola
print(mod.__file__)  # -> /cesta/k/souboru/test_skola.py
```

> [!NOTE]
> Historická funkce `inspect.getmoduleinfo()` vracela tuple s konstantami z modulu `imp`. Modul `imp` byl v Pythonu 3.4 označen jako deprecated a v Pythonu 3.12 byl kompletně odstraněn. V moderním Pythonu se pro inspekci souborů modulů používá standardní **`importlib.util`** a `inspect.getmodule()`.

---
<!-- slide: id=id7 title="Třídy a funkce – getclasstree()" tags="Skip" diff="newconcept" -->
## Hierarchie tříd: `inspect.getclasstree()`

Metoda **`inspect.getclasstree(classes, unique=False)`** přebírá seznam tříd a uspořádá je do hierarchicky vnořených seznamů podle vztahu dědičnosti:

```python
import inspect
import pprint
from test_skola import Učitel, Školák, Člověk

tree = inspect.getclasstree([Učitel, Školák, Člověk])
pprint.pprint(tree)
```

**Výstup:**
```python
[(<class 'object'>, ()),
 [(<class 'test_skola.Člověk'>, (<class 'object'>,)),
  [(<class 'test_skola.Učitel'>, (<class 'test_skola.Člověk'>,)),
   (<class 'test_skola.Školák'>, (<class 'test_skola.Člověk'>,))]]]
```

Každý uzel je reprezentován jako n-tice `(Třída, (Rodiče,))` následovaná seznamem podtříd.

---
<!-- slide: id=id8 title="MRO algoritmus a inspect.getmro()" tags="Tricky" diff="paradigm" -->
## MRO algoritmus a `inspect.getmro()`

Metoda **`inspect.getmro(Třída)`** vrátí n-tici tříd v přesném pořadí, v jakém interpret prohledává metody a atributy (*Method Resolution Order*):

```python
import inspect
from test_skola import Školák

mro = inspect.getmro(Školák)
print(mro)
# (<class 'test_skola.Školák'>, <class 'test_skola.Člověk'>, <class 'object'>)
```

Python používá linearizační algoritmus **C3 Superclass Linearization**, který zaručuje:
1. Podtřída má vždy přednost před rodičem (*monotonicity*).
2. Pořadí rodičů uvedené v definici třídy je striktně zachováno.
3. Žádná třída se v řetězci neobjeví dvakrát.

Právě tento MRO řetězec prochází funkce **`super()`** při vícenásobné dědičnosti.

---
<!-- slide: id=id9 title="Moderní inspekce signatur: inspect.signature()" tags="WOW" diff="pythonic" -->
## Moderní inspekce signatur: `inspect.signature()`

Zatímco starší funkce `getfullargspec()` vracela surovou n-tici, od Pythonu 3.3 je standardem **`inspect.signature()`** (PEP 362):

```python
import inspect

def vypocet(a: int, b: float = 1.0, *args: int, rezim: str = "rychly", **kwargs: str) -> float:
    """Ukázková funkce s bohatou signaturou."""
    return a + b

sig = inspect.signature(vypocet)

print(f"Signatura: {sig}")
print(f"Návratový typ: {sig.return_annotation}")

for name, param in sig.parameters.items():
    print(f"  {name:8} : kind={param.kind.name:<18} default={param.default!r:<10} annotation={param.annotation}")
```

**Výstup:**
```text
Signatura: (a: int, b: float = 1.0, *args: int, rezim: str = 'rychly', **kwargs: str) -> float
Návratový typ: <class 'float'>
  a        : kind=POSITIONAL_OR_KEYWORD default=<class 'inspect._empty'> annotation=<class 'int'>
  b        : kind=POSITIONAL_OR_KEYWORD default=1.0        annotation=<class 'float'>
  args     : kind=VAR_POSITIONAL       default=<class 'inspect._empty'> annotation=<class 'int'>
  rezim    : kind=KEYWORD_ONLY         default='rychly'   annotation=<class 'str'>
  kwargs   : kind=VAR_KEYWORD          default=<class 'inspect._empty'> annotation=<class 'str'>
```

> [!TIP]
> Pomocí `sig.bind(*args, **kwargs)` můžete předem zkontrolovat, zda by volání funkce s danými argumenty proběhlo úspěšně, aniž byste funkci reálně spustili!
