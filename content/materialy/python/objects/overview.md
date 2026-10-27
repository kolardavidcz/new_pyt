<!-- slide: id=id1 title="Objekty v Pythonu" tags="Core" diff="paradigm" -->
## Objekty v Pythonu

V Pythonu je objektem všechno (*everything is an object*). V prvním přiblížení to znamená, že cokoliv v Pythonu „umí“ víc, než se na první pohled zdá. Příkladem budiž třeba „obyčejný“ řetězec:

```python
txt = "Ahoj, světe!"

print(txt.startswith('A'))  # -> True
print(txt.startswith('a'))  # -> False
print(txt.split())          # -> ['Ahoj,', 'světe!']
```

Prakticky všechno v Pythonu má bohatou vnitřní strukturu. Řetězec z příkladu výše není jen holá paměťová oblast držící znaky (jako `char*` v C), ale plnohodnotný objekt zapouzdřující desítky užitečných metod pro manipulaci s textem.

---
<!-- slide: id=id2 title="dir()" tags="Core" diff="pythonic" -->
## Introspekce objektů: `dir()`

Jak moc bohatá vnitřní struktura řetězce ve skutečnosti je, nám prozradí vestavěná funkce `dir()`. Ta umožňuje jednoduše zjistit, na jaké dotazy umí příslušný objekt reagovat (jaké atributy a metody objekt má):

```python
>>> dir(str)
['__add__', '__class__', '__contains__', '__delattr__', '__dir__', '__doc__',
 '__eq__', '__format__', '__ge__', '__getattribute__', '__getitem__',
 '__getnewargs__', '__gt__', '__hash__', '__init__', '__iter__', '__le__',
 '__len__', '__lt__', '__mod__', '__mul__', '__ne__', '__new__', '__reduce__',
 '__reduce_ex__', '__repr__', '__rmod__', '__rmul__', '__setattr__', '__sizeof__',
 '__str__', '__subclasshook__', 'capitalize', 'casefold', 'center', 'count',
 'encode', 'endswith', 'expandtabs', 'find', 'format', 'format_map', 'index',
 'isalnum', 'isalpha', 'isascii', 'isdecimal', 'isdigit', 'isidentifier', 'islower',
 'isnumeric', 'isprintable', 'isspace', 'istitle', 'isupper', 'join', 'ljust',
 'lower', 'lstrip', 'maketrans', 'partition', 'removeprefix', 'removesuffix',
 'replace', 'rfind', 'rindex', 'rjust', 'rpartition', 'rsplit', 'rstrip',
 'split', 'splitlines', 'startswith', 'strip', 'swapcase', 'title', 'translate',
 'upper', 'zfill']
```

Vidíme dunder metody (protokoly jako iterace, sčítání, indexace) i moderní metody jako `removeprefix` a `removesuffix`.

---
<!-- slide: id=id3 title="Objekty neformálně ^_~" tags="Skip" diff="basics" -->
## Objekty neformálně ^_~

Vágně řečeno jsou objekty jakési „černé skříňky“, kterých se můžeme přesně určeným způsobem na něco ptát („mačkat tlačítka na jejich povrchu“) a ony nám odpoví. Přičemž za odpověď se počítá i vyvolaná výjimka. Jak to uvnitř skříňka zařídí, není starost volajícího:

```python
>>> txt = "Ahoj, světe!"
>>> txt.zacina_na('A')
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'str' object has no attribute 'zacina_na'
```

Pokud stiskneme tlačítko, které objekt nemá, Python vyvolá výjimku `AttributeError`.

---
<!-- slide: id=id4 title="Cesta k objektům – moduly" tags="Core" diff="pythonic" -->
## Cesta k objektům: Moduly jako jmenné prostory

Kromě vestavěných objektů jsme se už setkali s podobnými strukturami: **moduly**:

```python
import sys

print(sys.path)
sys.exit(0)
```

Jakákoliv proměnná nebo funkce definovaná na úrovni modulu se po importu stane součástí jmenného prostoru tohoto modulu. Je přístupná přes tečkovou notaci a nekoliduje s lokálními proměnnými v aktuálním souboru.

> [!NOTE]
> Moduly v Pythonu představují přirozený vzor *Singleton*. Pokud potřebujete sdílet globální stav nebo konfiguraci napříč aplikací, často stačí dedikovaný modul (`config.py`) místo složité tvorby třídních instancí.

---
<!-- slide: id=id5 title="Cesta k objektům – funkce" tags="Core" diff="basics" -->
## Cesta k objektům: Funkce a uzávěry

Podobného zapouzdření můžeme dosáhnout i na úrovni funkcí. Každá funkce s sebou nese svůj vlastní lokální kontext – proměnné definované uvnitř funkce jsou lokální a chráněné před vnějším světem:

```python
def funkce(*args: str) -> dict[int, str]:
    d = {}
    for i, a in enumerate(args):
        d[i] = a
    return d

print(funkce('Haf!', 'Baf!'))  # -> {0: 'Haf!', 1: 'Baf!'}

# Proměnná d mimo funkci neexistuje:
# print(d) -> NameError: name 'd' is not defined
```

Pomocí uzávěrů (*closures*) a vnitřních funkcí lze dokonce zapouzdřit stav i bez definice jediné třídy.

---
<!-- slide: id=id6 title="Cesta k objektům – n-tice a namedtuple" tags="WOW" diff="pythonic" -->
## Cesta k objektům: N-tice a `namedtuple`

Dalším stupněm zapouzdření jsou datové struktury. Typickým příkladem je **n-tice** (`tuple`) – neměnná sekvence hodnot přístupných indexem:

```python
import math

def bod(x: float, y: float, z: float) -> tuple[float, float, float, float]:
    return (x, y, z, math.sqrt(x*x + y*y + z*z))

u = bod(2, 1, 3)
print(u)     # -> (2, 1, 3, 3.7416573867739413)
print(u[2])  # -> 3
```

Pokud chceme k prvkům přistupovat jménem, nabízí modul `collections` třídu **`namedtuple`**:

```python
from collections import namedtuple
import math

Bod3D = namedtuple('Bod3D', ['x', 'y', 'z', 'r'])

def vytvor_bod(x: float, y: float, z: float) -> Bod3D:
    return Bod3D(x, y, z, math.sqrt(x*x + y*y + z*z))

u = vytvor_bod(2, 1, 3)
print(u.z)  # -> 3
print(u.r)  # -> 3.7416573867739413
```

---
<!-- slide: id=id7 title="Cesta k objektům – datové třídy" tags="WOW" diff="pythonic" -->
## Cesta k objektům: Datové třídy (`@dataclass`)

V moderním Pythonu představují standard pro strukturovaná data **`@dataclass`**:

```python
from dataclasses import dataclass

@dataclass
class Bod:
    x: float
    y: float
    z: float

u = Bod(2, 1, 3)
print(u)    # -> Bod(x=2, y=1, z=3)
print(u.z)  # -> 3

# Atributy můžeme jednoduše měnit (nejsou immutable jako tuple):
u.z = 10
print(u.z)  # -> 10
```

Na rozdíl od `namedtuple`:
- Prvky objektu jsou plně typované a přístupné přes čitelná jména.
- Hodnoty lze v základu měnit (nebo uzamknout pomocí `@dataclass(frozen=True)`).
- Automaticky je vygenerován `__init__`, `__repr__` i porovnávání `__eq__`.

---
<!-- slide: id=id8 title="OOP: Paradigma zapouzdření" tags="Core" diff="paradigm" -->
## OOP: Paradigma zapouzdření

Viděli jsme několik možných způsobů zapouzdření hodnot a funkcí:
- **Moduly**: Chovají se jako velké černé skříňky se stavem sdíleným na úrovni souboru.
- **Funkce a uzávěry**: Uchovávají lokální stav a izolují algoritmus.
- **Pojmenované n-tice a dataclasses**: Zapouzdřují související atributy do strukturovaných záznamů.
- **Třídy**: Představují vrchol snah o zapouzdření dat a metod do jednoho společného typu.

Smyslem tříd v nejjednodušším případě je sbalit související data a metody do společné struktury, která je odděluje od zbytku kódu. Třídy navíc umožňují produkovat instance a hierarchie dědičnosti.

> [!NOTE]
> V Pythonu neexistuje povinnost psát vše do tříd (na rozdíl od Javy či C#). Třídy jsou nástroj, nikoli náboženství.

---
<!-- slide: id=id9 title="Klasický příklad na použití objektů" tags="Skip" diff="basics" -->
## Klasický příklad na použití objektů

Mějme za úkol evidovat studenty a učitele. V procedurálním stylu bychom začali s n-ticemi a slovníky:

```python
Školák = (jméno, datum_narození, krevní_skupina, třída, předměty)
předměty = {"matematika": 1, "fyzika": 2}
```

Když přidáme učitele:

```python
Učitel = (jméno, datum_narození, krevní_skupina, třída, vyučované_předměty, výplata)
```

Zde je vidět, že `Učitel` i `Školák` sdílejí společné vlastnosti: oba jsou `Člověk` (mají jméno, datum narození a krevní skupinu), ale liší se rolí ve škole (známky vs. výplata). To je učebnicový případ pro společnou bázovou třídu `Člověk` a odvozené podtřídy `Školák` a `Učitel`.

---
<!-- slide: id=id10 title="Kritika OOP" tags="Skip" diff="paradigm" -->
## Kritika OOP: Pohled z praxe

Objektově orientované programování má i své hlasité a uznávané kritiky:

- **Joe Armstrong (autor Erlangu):**
  > *„The problem with object-oriented languages is they've got all this implicit environment that they carry around with them. You wanted a banana but what you got was a gorilla holding the banana and the entire jungle.“*

- **Richard Mansfield (Compute! magazine):**
  > *„Entire generations of indoctrinated programmers continue to march out of the academy, committed to OOP and nothing but OOP for the rest of their lives. OOP is to writing a program, what going through airport security is to flying.“*

- **Paul Graham (Lisp hacker & zakladatel Y Combinator):**
  > *„The purpose of OOP is to act as a herding mechanism that keeps mediocre programmers in mediocre organizations from doing too much damage.“*

---
<!-- slide: id=id11 title="Kdy použít třídy v Pythonu?" tags="Tricky" diff="paradigm" -->
## Kdy použít třídy v Pythonu?

Ačkoliv v Pythonu je všechno objektem, Python vás k OOP nenutí. Kdy se vyplatí třídu vytvořit?

1. **Definice vlastního typu s protokoly**: Potřebujete podporovat operátory (`+`, `[]`, `len()`, kontextový manažer `with`) pomocí magických dunder metod (`__getitem__`, `__enter__`).
2. **Rozšíření vestavěného typu**: Potřebujete upravit chování `dict`, `list` nebo implementovat abstraktní rozhraní (`collections.abc.Mapping`).
3. **Zapouzdření komplexního měnitelného stavu a chování**: Když stav vyžaduje společnou validaci a metody pracující nad tímtéž stavem.
4. **Hierarchie a polymorfismus**: Když různé objekty reagují na stejné zprávy jiným způsobem.

> [!TIP]
> Pokud máte třídu pouze se dvěma metodami, z nichž jedna je `__init__`, pravděpodobně vám stačí **obyčejná funkce**!
