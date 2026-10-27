<!-- slide: id1, Úvod, Core, newconcept -->
## Abstraktní bázové třídy (ABC - Abstract Base Classes)

V dynamickém jazyce se spoléháme na *Duck Typing*. Někdy však potřebujeme definovat **striktní rozhraní (kontrakt)**, které musí potomci bezpodmínečně implementovat:
- V C++ k tomu slouží čistě virtuální metody (`virtual void f() = 0;`).
- V Javě a C# k tomu slouží klíčové slovo `interface` nebo `abstract class`.

V Pythonu (PEP 3119) tuto roli plní **Abstract Base Classes (ABCs)** z modulu `abc`:
1. **Nelze je přímo instanciovat**: Pokus o vytvoření instance abstraktní třídy skončí chybou `TypeError`.
2. **Vynucení kompletního API**: Potomek nelze instanciovat, dokud neimplementuje **všechny** dekorované `@abstractmethod`.
3. **Virtuální podtřídy**: Umožňuje označit třídu za potomka pomocí `register()` nebo `__subclasshook__()` bez nutnosti dědění.

---
<!-- slide: id2, Jak na to bez ABC I, Core, resyntax -->
## Problém naivního přístupu s `NotImplementedError`

Bez modulu `abc` se v raných verzích Pythonu psaly prázdné metody vyhazující výjimku:

```python
class NaivniRodic:
    def metoda_a(self) -> None:
        raise NotImplementedError("Nutno implementovat v potomkovi!")

    def metoda_b(self) -> None:
        raise NotImplementedError("Nutno implementovat v potomkovi!")

class NaivniPotomek(NaivniRodic):
    def metoda_a(self) -> None:
        print("Implementováno A")
    # Zapomněli jsme na metoda_b!
```

Instanci `p = NaivniPotomek()` bez problému vytvoříme! Na to, že v kódu chybí `metoda_b()`, narazíme až po hodinách běhu aplikace v produkci při pokusu o její zavolání.

---
<!-- slide: id3, Jak na to bez ABC II, Skip, basics -->
## Nechtěná instanciace nekompletního rodiče

Druhým neduhem naivního přístupu je, že programátor může omylem vytvořit instanci samotného rodiče:

```python
r = NaivniRodic()  # Projde bez jakéhokoliv varování!
r.metoda_a()       # Crash až za běhu: NotImplementedError
```

Rodičovská třída přitom slouží pouze jako šablona a rozhraní, nikoli jako funkční objekt.

---
<!-- slide: id4, Metatřída „ABCMeta“ a dekorátor „@abstractmethod“, Core, paradigm -->
## Řešení: Třída `ABC` a dekorátor `@abstractmethod`

V moderním Pythonu dědíme přímo ze zástupné bázové třídy **`abc.ABC`**:

```python
from abc import ABC, abstractmethod

class Zvire(ABC):
    @abstractmethod
    def vydej_zvuk(self) -> str:
        """Každé zvíře musí mít svůj specifický zvuk."""
        ...

# Pokus o instanciaci abstraktní třídy selže okamžitě:
# z = Zvire()
# TypeError: Can't instantiate abstract class Zvire without an implementation for abstract method 'vydej_zvuk'

class Pes(Zvire):
    def vydej_zvuk(self) -> str:
        return "Haf!"

# Korektní potomek lze bez potíží vytvořit:
pes = Pes()
print(pes.vydej_zvuk())  # Haf!
```

Kontrola probíhá **již v okamžiku vytváření instance** (`__new__`), nikoli až při volání chybějící metody!

---
<!-- slide: id5, Kombinace abstraktního a klasických dekorátorů I, Core, pythonic -->
## Kombinace s `@classmethod` a `@staticmethod`

Abstraktní metoda může být současně třídní nebo statická. **`@abstractmethod` musí být vždy vnitřním (nejníže položeným) dekorátorem**:

```python
from abc import ABC, abstractmethod

class Deserializer(ABC):
    @classmethod
    @abstractmethod
    def from_json(cls, data: str) -> "Deserializer":
        """Abstraktní alternativní konstruktor."""
        ...

    @staticmethod
    @abstractmethod
    def validate_schema(data: dict) -> bool:
        """Abstraktní pomocná validační funkce."""
        ...
```

---
<!-- slide: id6, Kombinace abstraktního a klasických dekorátorů II, Core, pythonic -->
## Abstraktní vlastnosti: `@property` a `@abstractmethod`

Abstraktní může být i vlastnost ([property](descriptors.md)):

```python
from abc import ABC, abstractmethod

class GeometrickyTvar(ABC):
    @property
    @abstractmethod
    def obsah(self) -> float:
        """Potomek musí garantovat existenci getteru pro obsah."""
        ...

class Kruh(GeometrickyTvar):
    def __init__(self, polomer: float) -> None:
        self.polomer = polomer

    @property
    def obsah(self) -> float:
        import math
        return math.pi * (self.polomer ** 2)

k = Kruh(5.0)
print(f"Obsah kruhu: {k.obsah:.2f}")  # 78.54
```

---
<!-- slide: id7, Poznámka – „register()“, WOW, paradigm -->
## Virtuální podtřídy: Metoda `register()`

Jedinečnou vlastností Python ABC je možnost registrace **virtuální podtřídy** bez nutnosti explicitního dědění:

```python
from abc import ABC, abstractmethod

class Exportable(ABC):
    @abstractmethod
    def export(self) -> str: ...

class ExterniReport:
    def export(self) -> str:
        return "<data>OK</data>"

# Zaregistrujeme externí třídu jako virtuálního potomka:
Exportable.register(ExterniReport)

r = ExterniReport()
print(isinstance(r, Exportable))  # True!
print(issubclass(ExterniReport, Exportable))  # True!
```

Tento mechanismus umožňuje začlenit do hierarchie i třídy z knihoven třetích stran nebo built-in typy napsané v C.

---
<!-- slide: id8, Užití ABC I, Skip, basics -->
## Kdy použít ABC v architektuře aplikace?

1. **Návrh frameworků a knihoven**:
   - Definuje přesné rozhraní pro pluginy (např. `StorageBackend`, `AuthProvider`, `MessageQueue`).
2. **Definice kontraktů ve velkých týmech**:
   - Vývojáři nemohou zapomenout na implementaci kritických metod.
3. **Dokumentace architektury**:
   - Abstraktní třída slouží jako přehledný kontrakt a specifikace systému.

---
<!-- slide: id9, Užití ABC II, Core, pythonic -->
## Standardní ABCs v `collections.abc` vs. `typing.Protocol`

Python standardní knihovna obsahuje modul **`collections.abc`**, který definuje formální rozhraní pro všechny kontejnery:
- `Iterable` (vyžaduje `__iter__`)
- `Iterator` (vyžaduje `__iter__` a `__next__`)
- `Sequence` (vyžaduje `__getitem__`, `__len__`, atd.)
- `Mapping` (vyžaduje `__getitem__`, `__iter__`, `__len__`, `keys`, `items`)

```python
from collections.abc import Sequence

def vypis_prvky(data: Sequence[str]) -> None:
    for item in data:
        print(item)
```

> [!TIP] ABC vs. `typing.Protocol` (PEP 544)
> - **ABC (Nominální subtřídění)**: Vynucuje kontrolu za běhu (`runtime check`) při instanciaci potomků.
> - **`Protocol` (Strukturální subtřídění / Static Duck Typing)**: Umožňuje statickou kontrolu typů (mypy, pyright) bez jakéhokoliv dědění za běhu!
