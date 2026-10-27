<!-- lecture: week-07 title="⭐ Master Přednáška 7: Objektově Orientované Programování & Python Datový Model" estMinutes=90 -->

<!-- slide: id=id1 title="Úvod a osnova" tags="Core" diff="basics" -->
# Úvod a osnova

Vítejte v sedmé přednášce kurzu programování v jazyce Python. Dnešním tématem je **Objektově orientované programování (OOP)** a fascinující **Python Data Model**.

Většina programátorů přicházejících z jazyků C++ nebo Java se snaží psát objektový kód v Pythonu stejným způsobem: vytvářejí hluboké hierarchie dědičnosti, píší manuální gettery a settery a bojují s absencí klíčového slova `private`. Dnes si ukážeme, proč je objektový model Pythonu zásadně odlišný, elegantnější a jak plně ovládnout speciální metody objektů (tzv. **dunder metody**), správce kontextu a moderní nástroje `@dataclass` a **Pydantic v2**.

### Osnova dnešní 90minutové přednášky:
1. **C++/Java vs. Python objektový model**: Statické vtabulky a modifikátory přístupu vs. otevřený `PyTypeObject`.
2. **Definice třídy a konstruktor**: Třída `class`, explicitní parametr `self` a inicializátor `__init__()`.
3. **Atributy třídy vs. instance**: Kde v paměti leží data a past se sdíleným měnitelným stavem.
4. **Zapouzdření v Pythonu**: Filozofie *"consenting adults"*, konvence `_protected` a name-mangling `__private`.
5. **Paměťová optimalizace: `__dict__` vs. `__slots__`**: Jak zredukovat spotřebu paměti o 60 % a zrychlit přístup k atributům.
6. **Řízené atributy: `@property`**: Elegantní zapouzdření bez nutnosti psát gettery a settery.
7. **Dědičnost a `super()`**: Správné volání předka a kooperativní vícenásobná dědičnost.
8. **Algoritmus MRO (Method Resolution Order)**: Jak C3 linearizace řeší problém diamantové dědičnosti.
9. **Python Data Model (Dunder metody)**: Základní princip jednotného rozhraní Pythonu.
10. **Reprezentace objektu**: Zásadní rozdíl mezi `__repr__()` (pro vývojáře) a `__str__()` (pro uživatele).
11. **Rovnost a hešování**: Dunder metody `__eq__()` a `__hash__()` pro bezpečné použití v množinách a slovnících.
12. **Porovnávání a řazení**: Bohaté porovnávání (`__lt__`) a dekorátor `@functools.total_ordering`.
13. **Kolekční protokol**: `__len__()`, `__getitem__()`, `__setitem__()` a implementace slicingu.
14. **Aritmetické operátory**: Přetížení `+`, `-`, `*` a operátoru maticového násobení `@` (`__matmul__`).
15. **Správce kontextu (Context Managers)**: Protokol `with`, metody `__enter__()` a `__exit__()` a `@contextlib.contextmanager`.
16. **Moderní datové třídy (`@dataclass`)**: Automatizace boilerplate kódu, `frozen=True` a `slots=True`.
17. **Produkční most: Datová validace s Pydantic v2**: Runtime validace, Rust jádro a most k Milestone 2.

---

<!-- slide: id=id2 title="C++/Java vs. Python: Objektové paradigma" tags="Core" diff="paradigm" -->
# C++/Java vs. Python: Objektové paradigma

V C++ a Javě je třída neměnným kompilovaným předpisem. Velikost instance v bajtech je pevně daná při kompilaci a metody jsou volány přes statické vtabulky (virtual method tables):

```java
// Java: Pevná struktura, striktní zapouzdření a ukecanost
public class Bod {
    private final double x;
    private final double y;

    public Bod(double x, double y) {
        this.x = x;
        this.y = y;
    }
    public double getX() { return this.x; }
    public double getY() { return this.y; }
}
```

### Python: Třída je objekt a instance je dynamická jmenná schránka
V Pythonu je i samotná třída objektem na haldě (instance metatřídy `type`):
- Instance si standardně nese vlastní slovník atributů `__dict__`.
- Atributy lze za běhu libovolně přidávat nebo měnit (pokud nepoužijete `__slots__`).
- Neexistuje binární bariéra `private` — interpretr nic před programátorem nezamyká.

```python
class Bod:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

b = Bod(1.0, 2.0)
print(b.__dict__)  # {'x': 1.0, 'y': 2.0} -> Běžný slovník!
```

---

<!-- slide: id=id3 title="Definice třídy a konstruktor: Proč explicitní self?" tags="Core" diff="basics" -->
# Definice třídy a konstruktor: Proč explicitní self?

V C++ a Javě je ukazatel `this` implicitní — kompilátor ho dosazuje automaticky na pozadí. V Pythonu musí být instance předána jako **první explicitní argument** každé metody (konvenčně pojmenovaný `self`).

```python
class Uzivatel:
    def __init__(self, jmeno: str, email: str) -> None:
        """Inicializátor instance (není to konstruktor v C++ smyslu)."""
        self.jmeno: str = jmeno
        self.email: str = email

    def pozdrav(self) -> str:
        return f"Ahoj, já jsem {self.jmeno}!"

u = Uzivatel("Karel", "karel@vscht.cz")
```

### Co se reálně stane při volání metody?
Zápis `u.pozdrav()` je pouze syntaktickým cukrem pro volání přes třídu:

```python
# Tyto dva zápisy jsou v CPythonu 100% identické:
print(u.pozdrav())              # Metoda volaná na instanci
print(Uzivatel.pozdrav(u))      # Funkce třídy s explicitním předáním instance u
```

> [!NOTE]
> Metoda `__init__` nevytváří instanci (k tomu slouží nízkoúrovňová metoda `__new__`), ale pouze ji inicializuje poté, co byla alokována na haldě. Proto `__init__` nesmí nikdy vracet hodnotu (`return None`).

---

<!-- slide: id=id4 title="Atributy třídy vs. Atributy instance" tags="Core" diff="tricky" -->
# Atributy třídy vs. Atributy instance

Kde přesně leží proměnná, kterou nadefinujete?

- **Atribut třídy (Class Attribute)**: Definovaný přímo v těle třídy. Existuje v jediné kopii sdílené všemi instancemi (obdoba `static` v C++/Javě).
- **Atribut instance (Instance Attribute)**: Přiřazený k `self` (obvykle v `__init__`). Každá instance má vlastní nezávislou kopii.

```python
class DatabazoveSpojeni:
    # Atribut třídy: Sdílený všemi instancemi
    vychozi_port: int = 5432
    aktivni_spojeni: list[str] = []  # POZOR: Mutabilní stav!

    def __init__(self, hostitel: str) -> None:
        # Atribut instance: Unikátní pro tuto instanci
        self.hostitel: str = hostitel

s1 = DatabazoveSpojeni("db1.vscht.cz")
s2 = DatabazoveSpojeni("db2.vscht.cz")

print(s1.vychozi_port, s2.vychozi_port)  # 5432 5432
```

> [!CAUTION]
> **Past s mutabilním atributem třídy:**
> Pokud do `s1.aktivni_spojeni.append("conn1")` přidáte prvek, změníte tentýž seznam pro všechny instance `s2`, `s3` i samotnou třídu!

---

<!-- slide: id=id5 title="Zapouzdření v Pythonu: Consenting Adults a Name Mangling" tags="Core" diff="paradigm" -->
# Zapouzdření v Pythonu: Consenting Adults a Name Mangling

V C++ nebo Javě je klíčové slovo `private` vynucováno kompilátorem. V Pythonu platí slavná zásada Guida van Rossuma:
> *"We are all consenting adults here."* (Všichni jsme zde dospělí a svéprávní lidé.)

Interpretr vám nezabrání sáhnout na jakýkoliv atribut, pokud to opravdu chcete. Existují však striktní konvence:

### 1. Jednoduché podtržítko `_protected`:
Signál pro programátory a IDE: *"Tento atribut je interní implementační detail, nesahej na něj zvenčí."* (Žádné syntaktické omezení).

### 2. Dvojité podtržítko `__private` (Name Mangling):
Pokud název atributu začíná alespoň dvěma podtržítky a končí nanejvýš jedním, CPython jeho název interně přepíše na `_NazevTridy__atribut`:

```python
class BankovniUcet:
    def __init__(self, zustatek: float) -> None:
        self.__zustatek = zustatek  # Bude přejmenováno na _BankovniUcet__zustatek

ucet = BankovniUcet(1000.0)

# ucet.__zustatek  # AttributeError: 'BankovniUcet' object has no attribute '__zustatek'

# Ale stále je přístupný přes zkomolený název:
print(ucet._BankovniUcet__zustatek)  # 1000.0
```

> [!IMPORTANT]
> Účelem **Name Manglingu** není bezpečnost ani šifrování dat, ale **ochrana před nechtěným přepsáním atributu v odvozených podtřídách** při vícenásobné dědičnosti!

---

<!-- slide: id=id6 title="Paměťový model: __dict__ vs. optimalizace __slots__" tags="Core" diff="newconcept" -->
# Paměťový model: __dict__ vs. optimalizace __slots__

Standardně si každá instance nese slovník `__dict__`. Slovník je hešovací tabulka — je extrémně flexibilní, ale má nezanedbatelnou paměťovou režii (cca 150–200 bajtů na prázdnou instanci).

Pokud vytváříte miliony instancí (např. částice v simulaci, body v 3D grafice nebo bioinformatické záznamy), použijte **`__slots__`**:

```python
class BodStandard:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

class BodSlots:
    # Explicitní výčet povolených atributů: CPython vytvoří C pole ukazatelů!
    __slots__ = ("x", "y")
    
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y
```

### Výhody a důsledky `__slots__`:
1. **Masivní úspora paměti**: Snížení spotřeby RAM o **60 % až 75 %** (žádný `__dict__` ani `__weakref__`).
2. **Vyšší rychlost**: Přístup k atributům je přímý offset v C struktuře (rychlejší než vyhledávání v hešovací tabulce).
3. **Pevná struktura**: Pokus o přiřazení nedeklarovaného atributu `b.z = 10` vyvolá okamžitý `AttributeError`.

---

<!-- slide: id=id7 title="Řízený přístup k atributům: Dekorátor @property" tags="Core" diff="pythonic" -->
# Řízený přístup k atributům: Dekorátor @property

V Javě se učí: *"Nikdy nevystavujte veřejné atributy! Vždy pište getX() a setX() pro případ, že v budoucnu budete potřebovat validaci."*

V Pythonu je to antipattern! Začněte s běžným veřejným atributem `self.teplota`. Pokud později potřebujete validaci, převeďte ho na **`@property`** bez rozbití veřejného API:

```python
class Teplomer:
    def __init__(self, stupne_celsius: float = 0.0) -> None:
        self.teplota = stupne_celsius  # Volá setter níže!

    @property
    def teplota(self) -> float:
        """Getter: Čtení atributu."""
        return self._teplota

    @teplota.setter
    def teplota(self, hodnota: float) -> None:
        """Setter: Validace při zápisu."""
        if hodnota < -273.15:
            raise ValueError(f"Teplota {hodnota} °C je pod absolutní nulou!")
        self._teplota = hodnota

    @property
    def stupne_fahrenheit(self) -> float:
        """Počítaná vlastnost (Read-only property bez setteru)."""
        return self._teplota * 9 / 5 + 32

t = Teplomer(25.0)
print(t.teplota)            # 25.0 (volá getter)
print(t.stupne_fahrenheit)  # 77.0
t.teplota = 100.0           # Nastaví hodnotu přes setter
# t.teplota = -300.0        # Vyvolá ValueError: Teplota -300.0 °C je pod absolutní nulou!
```

Kód volajícího zůstává čistý: `t.teplota = 100` místo `t.setTeplota(100)`.

---

<!-- slide: id=id8 title="Dědičnost a volání předka: super()" tags="Core" diff="basics" -->
# Dědičnost a volání předka: super()

Dědičnost v Pythonu zapisujeme předáním rodičovské třídy v závorce: `class Potomek(Predek):`.

Pro volání metod předka používáme vestavěnou funkci **`super()`**:

```python
class Zamestnanec:
    def __init__(self, jmeno: str, plat: float) -> None:
        self.jmeno: str = jmeno
        self.plat: float = plat

    def popis(self) -> str:
        return f"{self.jmeno} (plat: {self.plat:.0f} Kč)"

class Manazer(Zamestnanec):
    def __init__(self, jmeno: str, plat: float, bonus: float) -> None:
        # Volání inicializátoru předka:
        super().__init__(jmeno, plat)
        self.bonus: float = bonus

    def popis(self) -> str:
        # Rozšíření metody předka:
        zaklad = super().popis()
        return f"{zaklad} + bonus: {self.bonus:.0f} Kč"

m = Manazer("Alice", 80_000, 20_000)
print(m.popis())  # Alice (plat: 80000 Kč) + bonus: 20000 Kč
print(isinstance(m, Zamestnanec))  # True
print(issubclass(Manazer, Zamestnanec))  # True
```

> [!NOTE]
> V Pythonu 3 píšeme čistě `super().__init__(...)` bez parametrů. Starý zápis z Pythonu 2 `super(Manazer, self).__init__(...)` je zastaralý.

---

<!-- slide: id=id9 title="Vícenásobná dědičnost a MRO: C3 Linearizace" tags="Core" diff="tricky" -->
# Vícenásobná dědičnost a MRO: C3 Linearizace

Java zakazuje vícenásobnou dědičnost tříd kvůli **problému diamantu** (*Diamond Problem*). C++ ji povoluje, ale přináší komplikace s duplikací bázových stavů.

Python vícenásobnou dědičnost plně podporuje a řeší ji deterministickým algoritmem **C3 Linearization** zvaným **MRO (Method Resolution Order)**.

```text
       ┌───────┐
       │   A   │
       └───┬───┘
         ▲   ▲
    ┌────┴┐ ┌┴────┐
    │  B  │ │  C  │
    └────┬┘ └┬────┘
         ▲   ▲
       ┌─┴───┴─┐
       │   D   │
       └───────┘
```

```python
class A:
    def akce(self): print("A")

class B(A):
    def akce(self): print("B"); super().akce()

class C(A):
    def akce(self): print("C"); super().akce()

class D(B, C):
    def akce(self): print("D"); super().akce()

d = D()
d.akce()
# Výstup: D -> B -> C -> A (každá metoda proběhne přesně jednou!)
```

Pořadí prohledávání metod můžete kdykoliv zkontrolovat atributem `D.__mro__` nebo metodou `D.mro()`:

```python
print([cls.__name__ for cls in D.mro()])
# ['D', 'B', 'C', 'A', 'object']
```

---

<!-- slide: id=id10 title="Python Data Model: Filozofie Dunder metod" tags="Core" diff="paradigm" -->
# Python Data Model: Filozofie Dunder metod

Co dělá Python tak konzistentním a intuitivním jazykem? Odpovědí je **Python Data Model** (Objektový datový model).

V jiných jazycích má každá třída vlastní vymyšlené metody:
- Java: `str.length()`, `list.size()`, `map.size()`, `array.length` (čtyři různé způsoby pro zjištění délky!).
- C++: `vec.size()`, `str.length()`.

V Pythonu existuje **jediné univerzální rozhraní**: funkce `len(obj)`.

```python
len("Ahoj")       # str
len([1, 2, 3])     # list
len({"a": 1})      # dict
len(moje_instance) # Vlastní třída implementující __len__
```

Interpretr CPython při zavolání `len(x)` přeloží volání na nízkoúrovňový slot `x.__len__()`.

> [!IMPORTANT]
> **Dunder metody** (z anglického *Double Underscore*, např. `__init__`, `__repr__`, `__getitem__`) jsou speciální háčky (*hooks*), kterými vaše třídy napojíte přímo na syntaktické konstrukce jazyka Python!

---

<!-- slide: id=id11 title="Reprezentace objektu: __repr__ vs. __str__" tags="Core" diff="basics" -->
# Reprezentace objektu: __repr__ vs. __str__

Každý objekt v Pythonu by měl mít jasnou textovou reprezentaci. K tomu slouží dvě metody, které se často pletou:

| Metoda | Kdy se volá? | Cílové publikum | Cíl |
| :--- | :--- | :--- | :--- |
| **`__repr__()`** | REPL, ladění, logy, vnoření v seznamech `[obj]` | **Vývojář** | Jednoznačný technický popis; ideálně platný Python kód pro znovuvytvoření objektu: `eval(repr(obj)) == obj` |
| **`__str__()`** | `print(obj)`, `str(obj)`, formátování f-stringy `{obj}` | **Běžný uživatel** | Čitelná a přehledná prezentace |

```python
class Vektor2D:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        # Formát: NázevTřídy(parametry...)
        return f"Vektor2D(x={self.x!r}, y={self.y!r})"

    def __str__(self) -> str:
        # Uživatelsky přívětivý formát
        return f"({self.x}, {self.y})"

v = Vektor2D(3.0, 4.5)
print(str(v))   # (3.0, 4.5)
print(repr(v))  # Vektor2D(x=3.0, y=4.5)

# V seznamu se VŽDY volá __repr__!
vektory = [v, Vektor2D(0.0, 1.0)]
print(vektory)  # [Vektor2D(x=3.0, y=4.5), Vektor2D(x=0.0, y=1.0)]
```

> [!TIP]
> **Zlaté pravidlo**: Pokud implementujete pouze jednu z nich, implementujte vždy `__repr__`! Pokud `__str__` chybí, Python automaticky použije `__repr__` jako náhradu.

---

<!-- slide: id=id12 title="Rovnost a hešování: __eq__ a __hash__" tags="Core" diff="tricky" -->
# Rovnost a hešování: __eq__ a __hash__

V přednášce 4 jsme zjistili, že klíče ve slovníku a prvky v množině musí být **hešovatelné**.

Standardně se objekty porovnávají podle identity (adresy na haldě `id(self)`):
```python
class Prvek:
    def __init__(self, id_: int) -> None:
        self.id_ = id_

p1 = Prvek(10)
p2 = Prvek(10)
print(p1 == p2)  # False! (jsou to dva různé objekty v paměti)
```

### Implementace logické rovnosti:
```python
class PrvekLogicky:
    def __init__(self, id_: int, nazev: str) -> None:
        self.id_ = id_
        self.nazev = nazev

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, PrvekLogicky):
            return NotImplemented
        return self.id_ == other.id_ and self.nazev == other.nazev

    def __hash__(self) -> int:
        # Heš MUSÍ být odvozen ze stejných neměnných polí jako rovnost!
        return hash((self.id_, self.nazev))
```

> [!CAUTION]
> **Bezpečnostní pravidlo CPythonu:**
> Jakmile ve své třídě implementujete metodu `__eq__`, Python **automaticky nastaví `__hash__ = None`**! Třída se stane nehešovatelnou, dokud explicitně nenapíšete i metodu `__hash__`. Tím Python brání vložení mutabilních objektů do množin!

---

<!-- slide: id=id13 title="Bohaté porovnávání: @functools.total_ordering" tags="Core" diff="pythonic" -->
# Bohaté porovnávání: @functools.total_ordering

Aby bylo možné objekty řadit funkcí `sorted()` nebo operátory `<`, `<=`, `>`, `>=`, musíte definovat metody porovnávání:
- `__lt__` ($<$), `__le__` ($\le$), `__gt__` ($>$), `__ge__` ($\ge$).

Implementovat všech 6 metod (včetně `__eq__` a `__ne__`) je pracné. Standardní knihovna nabízí dekorátor **`@functools.total_ordering`**:

Stačí implementovat pouze **`__eq__`** a **jednu z relačních metod** (nejlépe `__lt__`):

```python
import functools

@functools.total_ordering
class Student:
    def __init__(self, jmeno: str, prumer: float) -> None:
        self.jmeno = jmeno
        self.prumer = prumer

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Student):
            return NotImplemented
        return self.prumer == other.prumer

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Student):
            return NotImplemented
        # Lepší průměr je menší číslo (1.0 je lepší než 2.0)
        return self.prumer < other.prumer

s1 = Student("Alice", 1.2)
s2 = Student("Bob", 1.8)

print(s1 < s2)   # True
print(s1 <= s2)  # True (automaticky dopočítáno dekorátorem!)
print(s1 > s2)   # False (automaticky dopočítáno dekorátorem!)
```

---

<!-- slide: id=id14 title="Kolekční protokol: __len__, __getitem__, __setitem__" tags="Core" diff="newconcept" -->
# Kolekční protokol: __len__, __getitem__, __setitem__

Chcete, aby se vaše vlastní třída chovala jako seznam nebo slovník a podporovala indexaci `obj[i]`, slicing `obj[1:5]` a cyklus `for`?

Stačí implementovat metody kolekčního protokolu:

```python
class Kniha:
    def __init__(self, nazev: str, stranky: list[str]) -> None:
        self.nazev = nazev
        self.stranky = stranky

    def __len__(self) -> int:
        return len(self.stranky)

    def __getitem__(self, index: int | slice) -> str | list[str]:
        # Pokud index je int nebo slice (např. 1:3), delegujeme na seznam stránek
        return self.stranky[index]

    def __setitem__(self, index: int, text: str) -> None:
        self.stranky[index] = text

kniha = Kniha("Python Manuál", ["Úvod", "Datové typy", "Funkce", "OOP"])

print(len(kniha))       # 4 (volá __len__)
print(kniha[1])         # 'Datové typy' (volá __getitem__)
print(kniha[1:3])       # ['Datové typy', 'Funkce'] (slicing!)

# Magie: Python automaticky umožní iteraci přes for cyklus i bez __iter__!
for kapitola in kniha:
    print("->", kapitola)
```

> [!NOTE]
> Pokud třída neimplementuje `__iter__`, ale implementuje `__getitem__`, Python automaticky zkusí iterovat voláním `obj[0]`, `obj[1]`, dokud nedostane `IndexError`!

---

<!-- slide: id=id15 title="Aritmetické operátory a maticové násobení @" tags="Core" diff="newconcept" -->
# Aritmetické operátory a maticové násobení @

V Pythonu můžete přetížit veškeré matematické operátory. Zde je přehled klíčových dunder metod:

| Operátor | Dunder metoda | Příklad použití |
| :---: | :--- | :--- |
| `+` | `__add__(self, other)` | `a + b` |
| `-` | `__sub__(self, other)` | `a - b` |
| `*` | `__mul__(self, other)` | `a * b` (skalární násobení) |
| `/` | `__truediv__(self, other)` | `a / b` (reálné dělení) |
| `//` | `__floordiv__(self, other)` | `a // b` (celočíselné dělení) |
| `@` | **`__matmul__(self, other)`** | `A @ B` (**Maticové násobení**, PEP 465) |

### Příklad implementace 2D vektoru:
```python
class Vektor:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    def __add__(self, other: "Vektor") -> "Vektor":
        if not isinstance(other, Vektor):
            return NotImplemented
        return Vektor(self.x + other.x, self.y + other.y)

    def __mul__(self, scalar: float) -> "Vektor":
        """Vynásobení vektoru číslem: v * 2.5"""
        if not isinstance(scalar, (int, float)):
            return NotImplemented
        return Vektor(self.x * scalar, self.y * scalar)

    def __matmul__(self, other: "Vektor") -> float:
        """Skalární součin dvou vektorů pomocí operátoru @: v1 @ v2"""
        if not isinstance(other, Vektor):
            return NotImplemented
        return self.x * other.x + self.y * other.y

v1 = Vektor(1.0, 2.0)
v2 = Vektor(3.0, 4.0)
v3 = v1 + v2       # Vektor(4.0, 6.0)
dot = v1 @ v2      # 1.0*3.0 + 2.0*4.0 = 11.0
```

---

<!-- slide: id=id16 title="Reverzní operátory a in-place úpravy" tags="Core" diff="tricky" -->
# Reverzní operátory a in-place úpravy

Co se stane, když napíšete `2.5 * v1` místo `v1 * 2.5`?

CPython se nejprve pokusí zavolat `(2.5).__mul__(v1)`. Protože vestavěný typ `float` nezná vaši třídu `Vektor`, vrátí speciální konstantu `NotImplemented`.

Interpretr v takovém případě otočí pořadí a zavolá **reverzní operátor** na pravém operandu: **`v1.__rmul__(2.5)`**!

```python
class Vektor:
    ...
    def __mul__(self, scalar: float) -> "Vektor":
        return Vektor(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar: float) -> "Vektor":
        # Komutativní operace: 2.5 * v je totéž jako v * 2.5
        return self.__mul__(scalar)

    def __iadd__(self, other: "Vektor") -> "Vektor":
        # In-place operátor += (modifikace stávajícího objektu bez nové alokace)
        self.x += other.x
        self.y += other.y
        return self
```

> [!IMPORTANT]
> Pokud operace nepodporuje daný typ operandu, **nikdy nevyvolávejte TypeError ručně**! Vždy vraťte `return NotImplemented`. Tím dáte interpretu šanci vyzkoušet reverzní metodu druhého operandu.

---

<!-- slide: id=id17 title="Volatelné objekty: Dunder metoda __call__" tags="Core" diff="newconcept" -->
# Volatelné objekty: Dunder metoda __call__

Může se instance třídy chovat jako běžná funkce a nechat se zavolat pomocí kulatých závorek `instance()`?

Ano! Stačí implementovat metodu **`__call__()`**:

```python
class LinearniFunkce:
    """Reprezentuje lineární funkci y = k * x + q s vlastním stavovým nastavením."""
    
    def __init__(self, k: float, q: float) -> None:
        self.k = k
        self.q = q

    def __call__(self, x: float) -> float:
        # Zavolá se při f(x)
        return self.k * x + self.q

# Vytvoření instance (funktoru):
f = LinearniFunkce(k=2.0, q=5.0)

# Volání instance jako funkce:
print(f(10.0))  # 2.0 * 10.0 + 5.0 = 25.0
print(callable(f))  # True
```

### Kde se `__call__` používá v praxi?
1. **Stavové dekorátory**: Třída dekorátoru, která si pamatuje počet volání nebo konfiguraci.
2. **Strojové učení a neuronové sítě**: Všechny vrstvy v PyTorch (`nn.Module`) implementují `__call__` pro dopředný průchod `output = model(input_tensor)`.

---

<!-- slide: id=id18 title="Správce kontextu: Protokol with (__enter__, __exit__)" tags="Core" diff="basics" -->
# Správce kontextu: Protokol with (__enter__, __exit__)

Konstrukce `with vyraz as cil:` slouží k bezpečné správě systémových prostředků (soubory, databázové transakce, síťové zámky, dočasné soubory).

Ekvivalent k `try-with-resources` v Javě a RAII v C++.

Protokol správce kontextu vyžaduje dvě dunder metody:
- **`__enter__(self)`**: Provede inicializaci/zamčení a vrátí objekt, který se dosadí do proměnné za klíčovým slovem `as`.
- **`__exit__(self, exc_type, exc_val, exc_tb)`**: Provede úklid. Zavolá se **vždy**, i když uvnitř bloku `with` došlo k chybě!

```python
class Stopky:
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        self.konec = time.perf_counter()
        self.trvani = self.konec - self.start
        print(f"⏱️ Blok trval: {self.trvani * 1000:.2f} ms")
        # Vrácení True by spolklo případnou výjimku; None/False ji nechá probublat
        return False

with Stopky():
    suma = sum(x**2 for x in range(1_000_000))
# Automaticky vypíše: ⏱️ Blok trval: 58.30 ms
```

---

<!-- slide: id=id19 title="Modul contextlib: Tvorba správců přes generátory" tags="Core" diff="pythonic" -->
# Modul contextlib: Tvorba správců přes generátory

Psát celou třídu s metodami `__enter__` a `__exit__` pro jednoduché otevření a zavření je zbytečně dlouhé.

Standardní knihovna nabízí geniální dekorátor **`@contextlib.contextmanager`**:

```python
import contextlib
import os
from typing import Iterator

@contextlib.contextmanager
def docasny_adresar(cesta: str) -> Iterator[None]:
    """Bezpečně přepne pracovní adresář a po skončení bloku vrátí původní."""
    puvodni_dir = os.getcwd()
    try:
        os.chdir(cesta)
        yield  # Zde se spustí kód uvnitř bloku with!
    finally:
        # Tento kód se provede VŽDY při opuštění bloku
        os.chdir(puvodni_dir)

print("Před:", os.getcwd())
with docasny_adresar("/tmp"):
    print("Uvnitř:", os.getcwd())
print("Po:", os.getcwd())
```

Generátor se pozastaví na příkazu `yield` a po dokončení bloku `with` pokračuje kódem v bloku `finally`.

---

<!-- slide: id=id20 title="Složené kontexty v závorkách (Python 3.10+)" tags="Core" diff="newconcept" -->
# Složené kontexty v závorkách (Python 3.10+)

Často potřebujeme otevřít dva nebo více kontextů současně (např. čtení ze zdrojového souboru a zápis do cílového).

### Zastaralý těžkopádný způsob:
```python
# Vnořené with bloky:
with open("vstup.txt") as f_in:
    with open("vystup.txt", "w") as f_out:
        f_out.write(f_in.read())
```

### Moderní Python 3.10+ (PEP 617 PEG Parser):
Nyní můžete seskupit libovolné množství kontextových manažerů do přehledných **kulatých závorek**:

```python
with (
    open("velka_data.csv", "r", encoding="utf-8") as f_in,
    open("vysledky.csv", "w", encoding="utf-8") as f_out,
    Stopky() as mereni,
):
    for radek in f_in:
        f_out.write(radek.upper())
```

Zápis je čistý, nevyžaduje ošklivá zpětná lomítka `\` na konci řádků a garantuje správné uvolnění všech zdrojů v opačném pořadí jejich otevření.

---

<!-- slide: id=id21 title="Moderní datové třídy: @dataclass (PEP 557)" tags="Core" diff="pythonic" -->
# Moderní datové třídy: @dataclass (PEP 557)

Většina tříd v praxi slouží jako přepravky dat (*Data Transfer Objects*). Psaní konstruktoru `__init__`, metody `__repr__` a porovnávání `__eq__` je monotónní boilerplate kód.

Od Pythonu 3.7 máme vestavěný dekorátor **`@dataclass`**:

```python
from dataclasses import dataclass

@dataclass
class Ucastnik:
    jmeno: str
    email: str
    aktivni: bool = True
    body: int = 0

# Automaticky vygenerováno:
# 1. __init__(self, jmeno: str, email: str, aktivni: bool = True, body: int = 0)
# 2. __repr__(self) -> "Ucastnik(jmeno='Alice', email='a@vscht.cz', aktivni=True, body=0)"
# 3. __eq__(self, other) -> Porovná všechny atributy
u1 = Ucastnik("Alice", "alice@vscht.cz", body=100)
u2 = Ucastnik("Alice", "alice@vscht.cz", body=100)

print(u1)        # Ucastnik(jmeno='Alice', email='alice@vscht.cz', aktivni=True, body=100)
print(u1 == u2)  # True!
```

---

<!-- slide: id=id22 title="Pokročilé parametry @dataclass (Python 3.10+)" tags="Core" diff="newconcept" -->
# Pokročilé parametry @dataclass (Python 3.10+)

Dekorátor `@dataclass` nabízí mocné přepínače:

### 1. `frozen=True` (Neměnnost a hešovatelnost):
Instance se stane neměnnou (přiřazení do atributu vyvolá `FrozenInstanceError`) a automaticky se vygeneruje metoda `__hash__()`:
```python
@dataclass(frozen=True)
class Konfigurace:
    db_url: str
    timeout: int = 30

cfg = Konfigurace("postgres://localhost:5432/db")
# cfg.timeout = 60  # CHYBA: FrozenInstanceError!
mnozina_konfiguraci = {cfg}  # Platné! Lze použít v set i jako klíč dict.
```

### 2. `slots=True` (Python 3.10+):
Automaticky vygeneruje `__slots__` pro všechny definované typové anotace:
```python
@dataclass(slots=True)
class Bod3D:
    x: float
    y: float
    z: float
# Extrémní úspora paměti bez nutnosti manuálního psaní __slots__!
```

### 3. `kw_only=True` (Python 3.10+):
Vynutí, aby všechny parametry v konstruktoru byly předávány výhradně pojmenovaně (`kw-only`).

---

<!-- slide: id=id23 title="Pole datových tříd: field a __post_init__" tags="Core" diff="tricky" -->
# Pole datových tříd: field a __post_init__

Jak vyřešit výchozí hodnotu pro měnitelný seznam nebo slovník v dataclass?

> [!CAUTION]
> Přímý zápis `polozky: list[str] = []` v dataclass skončí chybou `ValueError: mutable default <class 'list'> is not allowed`!

### Správně: `field(default_factory=list)`
```python
from dataclasses import dataclass, field

@dataclass
class Kosik:
    zakaznik: str
    # default_factory zajistí vytvoření nového seznamu pro každou instanci:
    polozky: list[str] = field(default_factory=list)
    celkova_cena: float = field(init=False, default=0.0)

    def __post_init__(self) -> None:
        """Spustí se automaticky po dokončení vygenerovaného __init__."""
        if not self.zakaznik:
            raise ValueError("Košík musí mít přiřazeného zákazníka!")
        self.celkova_cena = len(self.polozky) * 100.0

k = Kosik("Petr")
k.polozky.append("Kniha")
print(k)  # Kosik(zakaznik='Petr', polozky=['Kniha'], celkova_cena=0.0)
```

---

<!-- slide: id=id24 title="Produkční most: Datová validace s Pydantic v2" tags="Core" diff="newconcept" -->
# Produkční most: Datová validace s Pydantic v2

Zatímco standardní `@dataclass` typové anotace pouze dokumentuje (ale za běhu **nevymáhá** — můžete předat řetězec do pole typu `int`), v reálných produkčních systémech (FastAPI, webové služby, mikroservisy) potřebujeme striktní **runtime validaci**.

Průmyslovým standardem moderního Pythonu je knihovna **Pydantic v2**:

```python
from pydantic import BaseModel, EmailStr, Field

class RegistraceUzivatele(BaseModel):
    uzivatelske_jmeno: str = Field(min_length=3, max_length=20)
    email: EmailStr
    vek: int = Field(ge=18, le=120)  # ge = greater or equal
    admin: bool = False

# 1. Automatické přetypování a striktní validace:
u = RegistraceUzivatele(
    uzivatelske_jmeno="karel",
    email="karel@vscht.cz",
    vek="25",  # Pydantic automaticky převede string "25" na int 25!
)
print(u.vek)  # 25 (typ int)
```

### Proč je Pydantic v2 tak revoluční?
Jádro Pydantic v2 je kompletně přepsáno v **jazyce Rust** (`pydantic-core`), díky čemuž je **5× až 50× rychlejší** než původní verze v1 a zpracovává miliony JSON záznamů za sekundu.

---

<!-- slide: id=id25 title="Pydantic v2: Vlastní validátory a serializace" tags="Core" diff="pythonic" -->
# Pydantic v2: Vlastní validátory a serializace

Pydantic umožňuje psát vlastní validační pravidla pomocí dekorátoru `@field_validator`:

```python
from pydantic import BaseModel, field_validator

class MereniTeploty(BaseModel):
    senzor_id: str
    hodnoty: list[float]

    @field_validator("senzor_id")
    @classmethod
    def over_format_senzoru(cls, v: str) -> str:
        if not v.startswith("SENSOR-"):
            raise ValueError("ID senzoru musí začínat předponou 'SENSOR-'")
        return v.upper()

m = MereniTeploty(senzor_id="sensor-01", hodnoty=[21.5, 22.1, 20.8])

# 2. Obousměrná serializace do formátu JSON:
json_string = m.model_dump_json(indent=2)
print(json_string)

# 3. Zpětné načtení ze surového JSONu:
m2 = MereniTeploty.model_validate_json(json_string)
```

Pydantic tvoří páteř moderního ekosystému Pythonu (zejména FastAPI, LangChain, SQLModel).

---

<!-- slide: id=id26 title="Případová studie a Milestone 2: Třída Matrix" tags="Core" diff="newconcept" -->
# Případová studie a Milestone 2: Třída Matrix

V Milestonu 2 máte za úkol implementovat samopopisnou maticovou třídu s perzistencí a transakcemi. Zde je architektonický vzor, jak propojit vše, co jsme se dnes naučili:

```python
class Matrix:
    """Samopopisná maticová třída implementující Python Data Model."""
    __slots__ = ("_rows", "_cols", "_data")

    def __init__(self, data: list[list[float]]) -> None:
        self._rows = len(data)
        self._cols = len(data[0]) if self._rows > 0 else 0
        self._data = [list(row) for row in data]

    @property
    def shape(self) -> tuple[int, int]:
        return (self._rows, self._cols)

    def __repr__(self) -> str:
        return f"Matrix({self._data!r})"

    def __getitem__(self, idx: tuple[int, int]) -> float:
        r, c = idx
        return self._data[r][c]

    def __matmul__(self, other: "Matrix") -> "Matrix":
        """Maticové násobení operátorem @."""
        if self._cols != other._rows:
            raise ValueError(f"Nekompatibilní tvary matic: {self.shape} @ {other.shape}")
        
        result = [
            [sum(self._data[r][k] * other._data[k][c] for k in range(self._cols))
             for c in range(other._cols)]
            for r in range(self._rows)
        ]
        return Matrix(result)
```

Tato třída podporuje `len()`, `@property`, `__getitem__` s indexací `m[r, c]`, `__repr__` a operátor `@`!

---

<!-- slide: id=id27 title="Shrnutí a most k Týdnu 8 (NumPy a Vektorizace)" tags="Core" diff="basics" -->
# Shrnutí a most k Týdnu 8 (NumPy a Vektorizace)

Dnes jsme odhalili skutečnou sílu objektového programování v jazyce Python:

### Klíčové poznatky dnešní přednášky:
1. **Objektový model**: Dynamický `PyObject` s `__dict__`, žádné falešné bariéry, explicitní `self`.
2. **Paměťová optimalizace**: Použití `__slots__` a `@dataclass(slots=True)` pro radikální úsporu RAM u milionů instancí.
3. **Zapouzdření**: Dekorátor `@property` pro čisté veřejné rozhraní bez nutnosti getterů a setterů.
4. **MRO a super()**: Deterministické řešení vícenásobné dědičnosti pomocí C3 linearizace.
5. **Python Data Model**: Dunder metody (`__repr__`, `__len__`, `__getitem__`, `__eq__`, `__matmul__`) jako most k vestavěné syntaxi.
6. **Moderní standard**: `@dataclass` pro interní doménové modely a **Pydantic v2** pro rychlou a striktní validaci vstupů.

```text
Evoluce abstrakcí v kurzu:
Týdny 1-4: Datové typy & Hešovací tabulky
Týdny 5-6: Funkce, Generátory & Proudové zpracování
Týden 7: Objektový model, Dunder metody & Dataclasses ──────┐
                                                           ▼
Příští týden (Týden 8): Vědecké Výpočty: Homogenní Pole NumPy & Vektorizace
- Paměťové rozložení ndarray v C-kontinuální paměti
- Strides a multi-dimenzionální výřezy bez kopírování dat
- Vektorizované operace (ufuncs) eliminující pomalé Python cykly
- Pravidla vysílání (Broadcasting)
- Příprava na velká vědecká a chemická data
```
