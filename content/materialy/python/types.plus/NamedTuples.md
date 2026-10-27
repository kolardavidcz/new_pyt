<!-- slide: id1, Úvod do pojmenovaných n-tic (NamedTuples), Core, newconcept -->
## Pojmenované n-tice: `collections.namedtuple`

Mezi n-ticemi (`tuple`), slovníky (`dict`) a plnohodnotnými třídami (`class`) existuje přirozený prostor pro **odlehčené datové struktury**:

- **Jako n-tice**: jsou **neměnné** (*immutable*), sekvenční a paměťově kompaktní (žádný `__dict__` overhead).
- **Jako třídy**: k prvkům lze přistupovat čitelnou **tečkovou notací** (`bod.x`, `bod.y`) namísto magických číselných indexů (`bod[0]`).
- **Jako slovníky**: reprezentují pojmenované atributy, ale zachovávají garantované pořadí a hešovatelnost.

V C++ odpovídají `struct` s konstantními položkami, v Javě 14+ konceptu `record`.

---
<!-- slide: id2, Příklad vytvoření a použití, WOW, pythonic -->
## Příklad použití `namedtuple`

Tovární funkce `namedtuple` z modulu `collections` dynamicky vygeneruje novou podtřídu n-tice:

```python
from collections import namedtuple
import math

# Definice nového typu 'Bod3D' se čtyřmi atributy:
Bod3D = namedtuple('Bod3D', ['x', 'y', 'z', 'r'])

def vytvor_bod(x: float, y: float, z: float) -> Bod3D:
    r = math.sqrt(x**2 + y**2 + z**2)
    return Bod3D(x, y, z, r)

b = vytvor_bod(2.0, 1.0, 3.0)

print(b)          # Bod3D(x=2.0, y=1.0, z=3.0, r=3.7416573867739413)
print(b.x)        # 2.0 (přístup přes jméno)
print(b[0])       # 2.0 (stále funguje i index jako u tuple!)
print(b.r)        # 3.741657...
```

---
<!-- slide: id3, Pravidla pro jména atributů, Core, resyntax -->
## Pravidla pro jména atributů

K prvkům pojmenované n-tice se přistupuje přes tečkovou notaci jako k atributům objektu:

1. Každé jméno položky musí být **platný identifikátor Pythonu** (začíná písmenem nebo podtržítkem, obsahuje pouze alfanumerické znaky).
2. Jméno položky **nesmí začínat podtržítkem `_`** (podtržítka jsou vyhrazena pro interní metody `namedtuple`, např. `_fields`, `_replace`).
3. Jméno položky **nesmí být klíčovým slovem** jazyka (`class`, `def`, `for`, `in`, `return` apod.).
4. Všechna jména položek v rámci jedné n-tice musí být **unikátní**.

---
<!-- slide: id4, Inspekce polí: atribut _fields, Core, newconcept -->
## Inspekce polí: atribut `_fields`

Atribut `_fields` obsahuje n-tici řetězců se jmény všech definovaných položek:

```python
from collections import namedtuple

Kniha = namedtuple("Kniha", ["nazev", "autor", "rok", "isbn"])

# Dostupné přímo na třídě:
print(Kniha._fields)
# ('nazev', 'autor', 'rok', 'isbn')

# I na konkrétní instanci:
k = Kniha("R.U.R.", "Karel Čapek", 1920, "978-80-7483-000-0")
print(k._fields)
# ('nazev', 'autor', 'rok', 'isbn')
```

Atribut `_fields` umožňuje dynamickou reflexi, automatickou serializaci i skládání nových potomků.

---
<!-- slide: id5, Způsoby zápisu polí v konstruktoru, Skip, basics -->
## Způsoby zadání jmen polí

Funkce `namedtuple(typename, field_names)` akceptuje jména položek v několika rovnocenných formátech:

```python
from collections import namedtuple

# 1. Řetězec oddělený mezerami (nejčastější zkrácený zápis):
Bod = namedtuple('Bod', 'x y z')

# 2. Řetězec oddělený čárkami:
Bod = namedtuple('Bod', 'x, y, z')

# 3. Seznam nebo n-tice řetězců (doporučeno pro dynamické generování):
Bod = namedtuple('Bod', ['x', 'y', 'z'])
Bod = namedtuple('Bod', ('x', 'y', 'z'))
```

Všechny varianty vedou k naprosto identické vnitřní struktuře třídy.

---
<!-- slide: id6, Tři způsoby přístupu k prvkům, Core, basics -->
## Tři způsoby přístupu k prvkům

Jednou z největších předností `namedtuple` je univerzální interoperabilita:

```python
from collections import namedtuple

Barva = namedtuple('Barva', 'r g b')
cervena = Barva(r=255, g=0, b=0)

# 1. Přístup přes atribut (čisté a čitelné):
print(cervena.r)       # 255

# 2. Přístup přes index sekvence (zpětná kompatibilita s tuple):
print(cervena[0])      # 255
r, g, b = cervena      # Funguje i kompletní rozbalování (unpacking)!

# 3. Dynamický přístup funkcí getattr():
slozka = "r"
print(getattr(cervena, slozka))  # 255
```

---
<!-- slide: id7, Automatická oprava nepovolených jmen (rename=True), Skip, newconcept -->
## Automatická oprava jmen: `rename=True`

Pokud generujete n-tice dynamicky ze záhlaví cizích dat (např. CSV souborů či databází), mohou se v názvech sloupců objevit zakázaná klíčová slova (`class`, `def`) nebo duplicity.

Přepínač `rename=True` tato kolizní pole automaticky přejmenuje na poziční identifikátory `_1`, `_2` atd.:

```python
from collections import namedtuple

# Bez rename=True vyvolá ValueError:
# Student = namedtuple('Student', 'jmeno class vek jmeno')

# S rename=True:
Student = namedtuple('Student', 'jmeno class vek jmeno', rename=True)

print(Student._fields)
# ('jmeno', '_1', 'vek', '_3')
# 'class' (klíčové slovo) -> '_1'
# druhé 'jmeno' (duplicita) -> '_3'
```

---
<!-- slide: id8, Inicializace instance a rozbalování, WOW, pythonic -->
## Inicializace instance a rozbalování

Instanci `namedtuple` lze vytvořit pozičními i pojmenovanými argumenty, stejně jako rozbalením kolekcí:

```python
from collections import namedtuple

Pixel = namedtuple('Pixel', 'x y jas')

# Pozičně i pojmenovaně:
p1 = Pixel(10, 20, 255)
p2 = Pixel(x=10, y=20, jas=255)

# Rozbalením seznamu přes *args:
souradnice = [10, 20, 255]
p3 = Pixel(*souradnice)

# Rozbalením slovníku přes **kwargs:
slovnik = {'x': 10, 'y': 20, 'jas': 255}
p4 = Pixel(**slovnik)
```

---
<!-- slide: id9, Konstruktor _make() pro CSV a databáze, WOW, pythonic -->
## Konstrukce z iterovatelných dat: `_make()`

Metoda třídy `_make(iterable)` vytvoří novou instanci přímo ze sekvence hodnot. Je rychlejší než volání `ClassName(*iterable)`:

```python
from collections import namedtuple
import csv

Zamestnanec = namedtuple('Zamestnanec', 'id jmeno pozice plat')

# Hromadné načítání z CSV řádků:
radky_csv = [
    ["1", "Petr Novák", "Vývojář", "75000"],
    ["2", "Jana Černá", "Analytik", "82000"]
]

databaze = [Zamestnanec._make(radek) for radek in radky_csv]

for z in databaze:
    print(f"{z.jmeno} ({z.pozice}): {z.plat} Kč")
```

---
<!-- slide: id10, Funkcionální modifikace: metoda _replace(), Tricky, pythonic -->
## Funkcionální modifikace: metoda `_replace()`

Protože je `namedtuple` neměnný objekt, položky nelze přepsat (`p.x = 5` selže s chybou `AttributeError`).

Metoda `_replace(**kwargs)` vytvoří **zbrusu novou instanci**, kde jsou zadané položky nahrazeny novými hodnotami a ostatní zůstávají zachovány:

```python
from collections import namedtuple

Uzivatel = namedtuple('Uzivatel', 'id jmeno role aktivni')

u1 = Uzivatel(1, 'david', 'user', True)

# Vytvoření povýšeného uživatele:
u2 = u1._replace(role='admin')

print(u1)  # Uzivatel(id=1, jmeno='david', role='user', aktivni=True) -> netknuto!
print(u2)  # Uzivatel(id=1, jmeno='david', role='admin', aktivni=True) -> nový objekt!
print(u1 is u2)  # False (různé instance v paměti)
```

---
<!-- slide: id11, Moderní alternativa: typing.NamedTuple a dataclass, Core, pythonic -->
## Moderní Python 3.12+ standardy: `typing.NamedTuple`

V moderním typovaném Pythonu se namísto dynamického `collections.namedtuple` používá deklarativní třídní zápis **`typing.NamedTuple`**:

```python
from typing import NamedTuple

class Polozka(NamedTuple):
    nazev: str
    cena: float
    mnozstvi: int = 1  # Podpora výchozích hodnot!

    @property
    def celkem(self) -> float:
        """Vlastní metody jsou plně podporovány!"""
        return self.cena * self.mnozstvi

p = Polozka("Klávesnice", 1290.0, 2)
print(f"{p.nazev}: celkem {p.celkem:.2f} Kč")
# Klávesnice: celkem 2580.00 Kč
```

> [!TIP] `NamedTuple` vs. `@dataclass(frozen=True)`
> - **`NamedTuple`**: Stále se chová jako `tuple` (funguje indexování `p[0]`, rozbalování `a, b = p`, nízká paměť).
> - **`@dataclass(frozen=True)`**: Pokud nepotřebujete chování sekvence (indexování podle čísel), ale chcete čistou neměnnou třídu s typovými anotacemi.
