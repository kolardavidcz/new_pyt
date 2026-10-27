<!-- slide: id1, Úvod, Core, basics -->
## Pokročilé třídění a porovnávání vlastních objektů

V přednášce o [základech třídění](../sorting/overview.md) jsme se seznámili s vestavěnou funkcí `sorted()` a metodou `.sort()`. Obě pracují bezchybně na číslech, řetězcích a n-ticích, kde existuje přirozené uspořádání.

Jakmile však vytvoříme **vlastní třídu**, Python standardně neví, podle jakého kritéria má její instance porovnávat.

Pro umožnění třídění a relačních operátorů máme v Pythonu dvě cesty:
1. **Ad-hoc třídění přes klíč**: Předání parametru `key=lambda x: ...` nebo `key=operator.attrgetter(...)`.
2. **Implementace Data Modelu**: Definice speciálních porovnávacích dunder metod v čele s **`__lt__()`** (*Rich Comparison Methods*).

---
<!-- slide: id2, __lt__(), Core, pythonic -->
## Srdce třídění: Dunder metoda `__lt__()`

Algoritmus **Timsort**, který v Pythonu pohání veškeré třídění, spoléhá na jediný relační operátor: **`<`** (*less than*):

```python
class Polozka:
    def __init__(self, cena: float) -> None:
        self.cena = cena

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Polozka):
            return NotImplemented
        return self.cena < other.cena
```

> [!TIP] Proč vracet `NotImplemented`?
> Pokud objekt na pravé straně není očekávaného typu, nikdy nevyhazujte `TypeError` přímo! Vrácením konstanty **`NotImplemented`** dáte interpretu šanci vyzkoušet obrácenou operaci na druhém operandu (`other.__gt__(self)`). Teprve pokud selžou obě strany, Python vyhodí `TypeError`.

---
<!-- slide: id3, Příklad I, Tricky, basics -->
## Netříditelné instance bez `__lt__`

Mějme jednoduchou třídu evidující studenty:

```python
class Student:
    def __init__(self, jmeno: str, znamka: str, vek: int) -> None:
        self.jmeno = jmeno
        self.znamka = znamka
        self.vek = vek

    def __repr__(self) -> str:
        return f"Student({self.jmeno!r}, vek={self.vek})"

studenti = [
    Student("John", "A", 15),
    Student("Jane", "B", 12),
    Student("Dave", "B", 10),
]
```

Pokusíme-li se seznam přímo setřídit, program skončí chybou:
```python
sorted(studenti)
# TypeError: '<' not supported between instances of 'Student' and 'Student'
```

---
<!-- slide: id4, Příklad II, Core, pythonic -->
## Implementace přirozeného uspořádání

Doplněním metody `__lt__` naučíme instanci, jak se má porovnávat (např. podle věku):

```python
class Student:
    def __init__(self, jmeno: str, znamka: str, vek: int) -> None:
        self.jmeno = jmeno
        self.znamka = znamka
        self.vek = vek

    def __repr__(self) -> str:
        return f"Student({self.jmeno!r}, {self.vek} let)"

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Student):
            return NotImplemented
        return self.vek < other.vek

studenti = [
    Student("John", "A", 15),
    Student("Jane", "B", 12),
    Student("Dave", "B", 10),
]

setrizeni = sorted(studenti)
print(setrizeni)
# [Student('Dave', 10 let), Student('Jane', 12 let), Student('John', 15 let)]
```

---
<!-- slide: id5, Porovnávání, Core, pythonic -->
## Operátor `<` a modul `operator`

Definice `__lt__` automaticky zprovozní operátor `<` i odpovídající funkci `operator.lt`:

```python
import operator

s1 = Student("Dave", "B", 10)
s2 = Student("Jane", "B", 12)

print(s1 < s2)               # True
print(operator.lt(s1, s2))   # True
```

Co se však stane, když zkusíme provést `s1 > s2`?
Python si uvědomí, že `__gt__` na `s1` není definována, a automaticky vyzkouší zrcadlovou operaci `s2 < s1` (`s2.__lt__(s1)`). Výsledkem je správně `False`!

---
<!-- slide: id6, Porovnávací metody, Core, pythonic -->
## Přehled šesti porovnávacích dunder metod

Pro kompletní relační logiku existuje 6 metod (*Rich Comparison Methods*):

| Operátor | Dunder metoda | Funkce v `operator` | Zrcadlový fallback |
| :---: | :--- | :--- | :---: |
| `<` | `__lt__(self, other)` | `operator.lt(a, b)` | `>` na druhém prvku |
| `<=` | `__le__(self, other)` | `operator.le(a, b)` | `>=` na druhém prvku |
| `==` | `__eq__(self, other)` | `operator.eq(a, b)` | `==` na druhém prvku |
| `!=` | `__ne__(self, other)` | `operator.ne(a, b)` | `!=` na druhém prvku |
| `>` | `__gt__(self, other)` | `operator.gt(a, b)` | `<` na druhém prvku |
| `>=` | `__ge__(self, other)` | `operator.ge(a, b)` | `<=` na druhém prvku |

> [!NOTE] Rovnost `==`
> Pokud třída nedefinuje `__eq__`, Python porovnává identitu instancí v paměti (`a is b`). Jakmile `__eq__` definujete, instance ztratí automatickou hashovatelnost a pro použití v `set` nebo klíčích `dict` musíte naimplementovat i metodu `__hash__()`.

---
<!-- slide: id7, Dekorátor „@functools.total_ordering“, WOW, pythonic -->
## Úspora kódu: `@functools.total_ordering`

Manuální implementace všech šesti metod je zdlouhavá a náchylná k logickým rozporům. Dekorátor **`@total_ordering`** vyžaduje pouze:
1. Metodu **`__eq__`**
2. **Jednu** ze čtyř relačních metod: `__lt__`, `__le__`, `__gt__` nebo `__ge__`

Všechny zbývající operátory dekorátor automaticky odvodí a doplní do třídy!

---
<!-- slide: id8, Příklad, Core, pythonic -->
## Kompletní příklad s `@total_ordering`

```python
from functools import total_ordering

@total_ordering
class Student:
    def __init__(self, jmeno: str, znamka: str, vek: int) -> None:
        self.jmeno = jmeno
        self.znamka = znamka
        self.vek = vek

    def __repr__(self) -> str:
        return f"Student({self.jmeno!r}, {self.vek})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Student):
            return NotImplemented
        return (self.vek, self.jmeno) == (other.vek, other.jmeno)

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, Student):
            return NotImplemented
        return (self.vek, self.jmeno) < (other.vek, other.jmeno)

s1 = Student("Dave", "B", 10)
s2 = Student("Jane", "B", 12)

print(s1 <= s2)  # True
print(s1 >= s2)  # False
print(s1 != s2)  # True
```
