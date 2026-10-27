<!-- slide: id1, Úvod, Core, newconcept -->
## Dekorátory tříd (Class Decorators)

Podobně jako můžeme pomocí syntaxe `@` dekorovat funkce, umožňuje Python (od verze 2.6, PEP 3129) **dekorovat i celé třídy**:

```python
@dekorator_tridy
class MojeTrida:
    pass
```

Tento zápis je přesným ekvivalentem:
```python
class MojeTrida:
    pass

MojeTrida = dekorator_tridy(MojeTrida)
```

Dekorátor třídy přijímá jako svůj jediný argument objekt třídy, libovolně jej modifikuje (přidá metody, upraví atributy, zaregistruje třídu v registru) a vrátí upravenou třídu (nebo její obal).

---
<!-- slide: id2, Příklad – řazení objektů, Core, pythonic -->
## Dekorátory tříd ve standardní knihovně

V moderním Pythonu jsou dekorátory tříd běžnou a vysoce ceněnou součástí standardní knihovny:

1. **`@dataclass`** (modul `dataclasses`):
   - Analyzuje typové anotace třídy a automaticky vygeneruje metody `__init__`, `__repr__`, `__eq__` a další.
2. **`@functools.total_ordering`**:
   - Z pouhých dvou metod (`__eq__` a jedné relační, např. `__lt__`) automaticky odvodí a do třídy doplní všechny zbývající operátory porovnání (`<=`, `>`, `>=`).

```python
from functools import total_ordering

@total_ordering
class Student:
    def __init__(self, jmeno: str, body: int) -> None:
        self.jmeno = jmeno
        self.body = body

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Student):
            return NotImplemented
        return self.body == other.body

    def __lt__(self, other: "Student") -> bool:
        return self.body < other.body

# Nyní můžeme studenty bezpečně třídit a srovnávat pomocí <=, >, >= !
```

---
<!-- slide: id3, Vlastní dekorátor třídy: Návrhový vzor Singleton, Core, pythonic -->
## Tvorba vlastního dekorátoru třídy: Singleton

Praktická ukázka dekorátoru třídy, který zajistí, že od dané třídy bude v celém programu existovat vždy **pouze jediná instance** (*Singleton*):

```python
from collections.abc import Callable

def singleton[T](cls: type[T]) -> Callable[..., T]:
    """Dekorátor třídy garantující existenci pouze jediné instance."""
    instance: dict[type[T], T] = {}

    def get_instance(*args, **kwargs) -> T:
        if cls not in instance:
            instance[cls] = cls(*args, **kwargs)
        return instance[cls]

    return get_instance

@singleton
class DatabazoveSpojeni:
    def __init__(self, url: str = "sqlite:///:memory:") -> None:
        self.url = url
        print(f"-> Otevírám jediné spojení k: {self.url}")

db1 = DatabazoveSpojeni()
db2 = DatabazoveSpojeni()

print(db1 is db2)  # True (obě proměnné ukazují na naprosto identický objekt!)
```
