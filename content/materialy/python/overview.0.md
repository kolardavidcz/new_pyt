<!-- slide: id=id1 title="Historie Pythonu" tags="Skip" diff="basics" -->
## Historie a evoluce jazyka Python

Python vytvořil **Guido van Rossum** na přelomu 80. a 90. let v institutu CWI (Centrum Wiskunde & Informatica) v Amsterdamu jako následovníka výukového jazyka ABC. Guido působil dlouhá léta jako *Benevolent Dictator For Life* (BDFL), než v roce 2018 předal řízení jazyka volené Řídící radě (*Steering Council*).

### Hlavní milníky vývoje:
- **16. 10. 2000 – Python 2.0**:
  - Komunitní vývoj pod záštitou Python Software Foundation (PSF).
  - Plnohodnotný cyklický Garbage Collector.
  - Seznamové generátory (*list comprehensions*) a prvotní podpora Unicode.
- **3. 12. 2008 – Python 3.0 (Python 3000 / Py3k)**:
  - Záměrně první zpětně nekompatibilní verze v historii jazyka.
  - Striktní oddělení lidského textu (`str`, Unicode) od binárních dat (`bytes`).
  - Sjednocení celočíselných typů (`int` má neomezenou přesnost, odstraněn `long`).
  - Nahrazení velkých seznamů línými iterátory (`range`, `map`, `filter`, `dict.keys`).
  - `print` povýšen z příkazu na funkci.
- **Moderní éra (Python 3.12 / 3.13+)**:
  - Projekt *Faster CPython*: adaptivní specializující interpret přinášející 20–60% zrychlení.
  - Zpřesněná diagnostika chyb s detailní lokalizací v tracebacku.
  - Experimentální volitelný běh bez GIL (*free-threaded Python*, PEP 703) a JIT kompilátor v Pythonu 3.13.

> [!NOTE]
> Řada Python 2 byla definitivně ukončena k 1. 1. 2020 (End-Of-Life). Veškerý moderní vývoj i výuka dnes staví výhradně na produkční verzi **Python 3.12+**.

---
<!-- slide: id=id2 title="Python 2.x versus Python 3.x" tags="Skip" diff="basics" -->
## Klíčové rozdíly: Python 2.x vs. Python 3.x

Přechod z Pythonu 2 na Python 3 vyřešil desítky let staré architektonické kompromisy a zpřehlednil syntaxi:

```python
# 1. Výstupní tisk: v Pythonu 2 příkaz, v Pythonu 3 funkce
print 'Ahoj, Karle!'   # Python 2.x (syntaktický příkaz)
print('Ahoj, Karle!')  # Python 3.x (vestavěná funkce)

# 2. Text vs. Bajty:
u"Ahoj, světe!"  # Python 2.x (Unicode byl volitelný typ u"...")
"Ahoj, světe!"   # Python 3.x (všechny řetězce jsou nativně Unicode UTF-8)
b"data"          # Python 3.x (bajtové sekvence jsou explicitní typ bytes)

# 3. Dělení čísel:
5 / 2   # Python 2.x vrátil 2 (celočíselné ořezání)
5 / 2   # Python 3.x vrací 2.5 (reálné dělení)
5 // 2  # Python 3.x celočíselné dělení operátorem //
```

### Hlavní systémové změny:
- **Iterátory na prvním místě**: Funkce `range()`, `zip()`, `map()`, `filter()` a metody slovníků `keys()`, `values()`, `items()` vracejí paměťově efektivní líné iterátory $O(1)$ namísto vytváření kopií celých seznamů.
- **Konsolidace standardní knihovny**: Přesun roztříštěných modulů do logických hierarchických balíčků (např. `urllib.request`, `http.client`).
- **Odstranění duplicit**: Vyřazena zastaralá syntaxe jako operátor nerovnosti `<>` (ponecháno pouze `!=`) či metody `dict.has_key()`.

---
<!-- slide: id=id3 title="Užitečné odkazy" tags="Skip" diff="basics" -->
## Užitečné zdroje a ekosystém Pythonu

Oficiální a komunitní zdroje pro studium a vývoj v moderním Pythonu:

- [python.org](https://www.python.org/) – oficiální domovská stránka jazyka Python.
- [docs.python.org](https://docs.python.org/3/) – kompletní oficiální dokumentace k aktuálním verzím Pythonu včetně tutoriálů a referenčních příruček.
- [pypi.org](https://pypi.org/) – *Python Package Index*, centrální repozitář desítek tisíc otevřených knihoven instalovatelných přes `pip` / `uv`.
- [peps.python.org](https://peps.python.org/) – *Python Enhancement Proposals*, oficiální specifikace jazyka (např. PEP 8 – Style Guide for Python Code).
- [realpython.com](https://realpython.com/) – praktické výukové materiály a články zaměřené na moderní Python idioms.

### Doporučená vývojová prostředí (IDE):
- **VS Code** s rozšířeními Python, Pylance a Ruff.
- **PyCharm** (Community / Professional).
- Interaktivní notebooky **JupyterLab** pro datovou analýzu a vědecké výpočty.
- Interaktivní konzole **IPython** s automatickým doplňováním a historií.

---
<!-- slide: id=id4 title="Charakter jazyka" tags="Core" diff="paradigm" -->
## Charakter a filozofie jazyka Python

Python je moderní vysokoúrovňový programovací jazyk postavený na následujících pilířích:

- **Interpretovaný a dynamicky typovaný**: Kód se překládá do bajtkódu (`.pyc`) a interpretuje virtuálním strojem CPython. Datový typ je svázán se samotným objektem v paměti, nikoli s proměnnou.
- **Víceparadigmatický**: Přirozeně kombinuje procedurální kód, plnohodnotné objektově orientované programování (OOP) i funkcionální přístupy (funkce vyšších řádů, uzávěry, generátory).
- **Prvotřídní objekty (*First-Class Citizens*)**: Vše v Pythonu je objekt – včetně čísel, řetězců, funkcí, modulů i samotných tříd. Funkci lze předat jako argument jiné funkci nebo ji vrátit jako návratovou hodnotu.
- **Proměnné jako reference**: Proměnné se nedeklarují uvedením typu, vznikají prvním přiřazením hodnoty:
  ```python
  s = "Ahoj, světe!"
  s.split()  # volání metody na objektu řetězce -> ['Ahoj,', 'světe!']
  ```
- **Přiřazovací výrazy (*Walrus operator* `:=`)**: Od Pythonu 3.8 lze přiřadit hodnotu uvnitř výrazu.

### Jmenné konvence (PEP 8):
- `snake_case` – funkce, metody, atributy, proměnné a moduly (`calculate_total`).
- `PascalCase` / `CapWords` – třídy a výjimky (`InvoiceProcessor`, `ValueError`).
- `UPPER_SNAKE_CASE` – konstanty na úrovni modulu (`MAX_CONNECTIONS = 100`).
- `_leading_underscore` – interní či privátní atributy a metody (`_helper()`).

---
<!-- slide: id=id5 title="Ukázka – „QuickSort“" tags="Already Studied" diff="pythonic" already_studied_in="lecture:materialy--python--overview.2#id1" -->
## Expresivita jazyka: Algoritmus QuickSort

Expresivitu a čitelnost Pythonu demonstruje elegantní implementace řazení **QuickSort** pomocí seznamových generátorů:

```python
def qs(a: list[int]) -> list[int]:
    """Rekurzivní funkcionální QuickSort pomocí list comprehensions."""
    if not a:
        return []
    pivot = a[0]
    left = [x for x in a[1:] if x < pivot]
    right = [x for x in a[1:] if x >= pivot]
    return qs(left) + [pivot] + qs(right)

numbers = [33, 10, 55, 71, 2, 45, 19]
print(qs(numbers))  # [2, 10, 19, 33, 45, 55, 71]
```

Celý řadicí algoritmus včetně rozdělení na podmnožiny menších a větších prvků a rekurzivního složení je zapsán na pouhých 6 řádcích kódu.

---
<!-- slide: id=id6 title="Ukázka – „dataclasses“" tags="Already Studied" diff="pythonic" already_studied_in="lecture:materialy/python/objects/oop.html#id7" -->
## Moderní datové struktury: „dataclasses“

Od Pythonu 3.7 nabízí standardní knihovna modul `dataclasses`, který odstraňuje nutnost psát repetitivní boilerplate kód (`__init__`, `__repr__`, `__eq__`):

```python
from dataclasses import dataclass, make_dataclass

# 1. Dekorační zápis s typovými anotacemi (standardní přístup)
@dataclass
class Point:
    x: float
    y: float
    z: float = 0.0

p = Point(1.5, 2.5)
print(p)  # Point(x=1.5, y=2.5, z=0.0)

# 2. Dynamická tvorba datové třídy
DynamicPoint = make_dataclass('DynamicPoint', ['x', 'y', 'z'])
dp = DynamicPoint(1.5, 2.5, 3.0)
print(dp)  # DynamicPoint(x=1.5, y=2.5, z=3.0)
```

> [!TIP]
> Datové třídy lze vytvořit jako neměnné (*immutable*) parametrem `@dataclass(frozen=True)`. Od Pythonu 3.10 lze přidat `slots=True`, což eliminuje vnitřní slovník instance `__dict__` a výrazně snižuje paměťovou režii.

---
<!-- slide: id=id7 title="Poznámka ke kódování" tags="Tricky" diff="paradigm" -->
## Kódování zdrojových souborů a textu

V moderním Pythonu 3 je práce se znakovými sadami striktně standardizována:

```python
# V Pythonu 3 je UTF-8 výchozím kódováním pro všechny .py skripty
# Zastaralé hlavičky již nejsou potřeba:
# # -*- coding: utf-8 -*-
```

### Text vs. Bajty:
- **`str`**: Plnohodnotný řetězec Unicode znaků. Znaky mohou být z libovolného světového jazyka i symboly (včetně českých diakritických znaků či emotikonů).
- **`bytes`**: Sekvence surových bajtů (`b'...'`), nezbytná pro síťový přenos a binární soubory.

```python
text = "Ahoj, světe! Příliš žluťoučký kůň"
raw_bytes = text.encode("utf-8")
print(type(raw_bytes))  # <class 'bytes'>
print(raw_bytes[:12])   # b'Ahoj, sv\xc4\x9bte'

restored_text = raw_bytes.decode("utf-8")
assert text == restored_text
```

> [!NOTE]
> V Pythonu 3 jsou i názvy proměnných a funkcí interně zpracovávány jako Unicode, takže syntakticky je povolen např. zápis `délka = 42`. V profesionálním kódu a mezinárodních týmech se však doporučuje držet anglických identifikátorů v ASCII.

---
<!-- slide: id=id8 title="Klíčová slova" tags="Skip" diff="basics" -->
## Přehled klíčových slov jazyka

Klíčová slova (*keywords*) jsou rezervované identifikátory, které definují základní syntaktické konstrukce jazyka a nelze je použít jako názvy proměnných či funkcí.

Aktuální seznam v Pythonu 3.12+ (35 klíčových slov):

```text
False      await      else       import     pass
None       break      except     in         raise
True       class      finally    is         return
and        continue   for        lambda     try
as         def        from       nonlocal   while
assert     del        global     not        with
async      elif       if         or         yield
```

### Zjištění klíčových slov za běhu programu:
```python
import keyword

print(f"Celkem klíčových slov: {len(keyword.kwlist)}")
print(keyword.iskeyword("async"))  # True
print(keyword.iskeyword("match"))  # False (tzv. soft keyword)
```

> [!NOTE]
> Slova jako `match`, `case`, `_` a od verze 3.12 také `type` jsou tzv. **soft keywords** – mají speciální syntaktický význam v odpovídajícím kontextu (např. *structural pattern matching*), ale mimo něj mohou sloužit jako názvy proměnných.

---
<!-- slide: id=id9 title="Vestavěné funkce" tags="Skip" diff="basics" -->
## Přehled vestavěných funkcí (Built-in Functions)

Python poskytuje bohatou sadu vestavěných funkcí, které jsou dostupné v jakémkoliv modulu bez nutnosti importu:

| Kategorie | Funkce |
| :--- | :--- |
| **Číselné operace** | `abs()`, `divmod()`, `float()`, `int()`, `complex()`, `max()`, `min()`, `pow()`, `round()`, `sum()` |
| **Iterace a sekvence** | `all()`, `any()`, `enumerate()`, `filter()`, `iter()`, `len()`, `map()`, `next()`, `range()`, `reversed()`, `slice()`, `sorted()`, `zip()` |
| **Kolekce a typy** | `bool()`, `bytearray()`, `bytes()`, `dict()`, `frozenset()`, `list()`, `memoryview()`, `object()`, `set()`, `str()`, `tuple()` |
| **Introspekce & Objekty** | `callable()`, `delattr()`, `dir()`, `getattr()`, `hasattr()`, `hash()`, `id()`, `isinstance()`, `issubclass()`, `setattr()`, `type()`, `vars()` |
| **I/O a běhové prostředí** | `breakpoint()`, `help()`, `input()`, `open()`, `print()`, `repr()`, `ascii()`, `format()` |
| **OOP a rozsah** | `classmethod()`, `globals()`, `locals()`, `property()`, `staticmethod()`, `super()` |

---
<!-- slide: id=id10 title="Standardní knihovna" tags="Skip" diff="basics" -->
## Standardní knihovna: Filozofie „Batteries Included“

Python je proslulý svou filozofií **„Batteries Included“** – po instalaci interpretru máte k dispozici robustní standardní knihovnu pokrývající většinu běžných softwarových úloh bez nutnosti instalovat externí balíčky:

- **Matematika a náhoda**: `math`, `cmath`, `random`, `statistics`, `decimal` (libovolná přesnost), `fractions`.
- **Datum, čas a zóny**: `datetime`, `time`, `zoneinfo` (databáze časových pásem IANA od Pythonu 3.9), `calendar`.
- **Moderní práce se soubory**: `pathlib` (objektově orientované cesty), `os`, `shutil`, `tempfile`, `glob`.
- **Serializace dat**: `json`, `csv`, `sqlite3` (zabudovaná relační databáze), `tomllib` (parsování TOML od 3.11), `pickle`.
- **Datové struktury**: `collections` (`deque`, `Counter`, `defaultdict`), `itertools`, `heapq`, `bisect`, `dataclasses`.
- **Sítě a internetové protokoly**: `urllib.request`, `http.server`, `socket`, `email`.
- **Souběžnost a asynchronie**: `asyncio`, `threading`, `multiprocessing`, `concurrent.futures`.
- **Testování a ladění**: `unittest`, `doctest`, `cProfile`, `timeit`, `pdb`.

---
<!-- slide: id=id11 title="„help()“ – nápověda" tags="Core" diff="basics" -->
## Vestavěný nápovědný systém: funkce „help()“

Python disponuje integrovaným interaktivním nápovědným systémem (založeným na modulu `pydoc`), který je neocenitelný zejména při práci v terminálu nebo na vzdáleném serveru:

### 1. Interaktivní režim nápovědy
Zavoláním `help()` bez argumentů přepnete konzoli do nápovědného módu s výzvou `help>`:

```pycon
>>> help()
Welcome to Python 3.12's help utility!

help> for
The "for" statement
*******************
...
help> quit
You are now leaving help and returning to the Python interpreter.
>>>
```

### 2. Dotaz na konkrétní objekt či modul
```pycon
>>> import math
>>> help(math.sqrt)
Help on built-in function sqrt in module math:

sqrt(x, /)
    Return the square root of x.
```

### 3. Textové vyhledání podle tématu či klíčového slova
```pycon
>>> help("keywords")  # vypíše seznam všech klíčových slov
>>> help("for")       # zobrazí specifikaci syntaxe cyklu for
```

---
<!-- slide: id=id12 title="Komentáře & dokumentační řetězce" tags="Core" diff="pythonic" -->
## Komentáře vs. Dokumentační řetězce (Docstrings)

V Pythonu existuje striktní rozdíl mezi poznámkami pro programátora a strojově zpracovatelnou dokumentací:

- **Komentáře (`#`)**: Slouží k vysvětlení *proč* je daný kód napsán určitým způsobem. Interpret je při překladu do bajtkódu zcela ignoruje.
- **Dokumentační řetězce (*docstrings*)**: Řetězce umístěné na prvním řádku těla modulu, třídy nebo funkce. Jsou plnohodnotnou součástí AST i bajtkódu a jsou runtime přístupné přes atribut `__doc__`.

```python
# Příklad definice s docstringem podle konvencí PEP 257
def spocitej_dph(cena: float, sazba: float = 0.21) -> float:
    """Vypočítá výši DPH z dané základní ceny.

    Args:
        cena: Základní cena v Kč bez daně.
        sazba: Sazba DPH jako desetinné číslo (výchozí 21 % = 0.21).

    Returns:
        Částka daně zaokrouhlená na haléře.
    """
    return round(cena * sazba, 2)

print(spocitej_dph.__doc__)
```

> [!NOTE]
> Právě z dokumentačních řetězců čerpá vestavěná funkce `help()` i automatické generátory dokumentace (Sphinx, MkDocs).

---
<!-- slide: id=id13 title="Dokumentační testy" tags="WOW" diff="newconcept" -->
## Testování dokumentace: modul „doctest“

Dokumentační řetězce umožňují vkládat ukázky z interaktivní konzole (`>>>`). Standardní modul `doctest` tyto ukázky dokáže automaticky vyhledat, spustit a ověřit, zda kód vrací očekávaný výstup:

```python
# Soubor: kalkulacka.py
def pridej(a: int, b: int) -> int:
    """Vrátí součet dvou čísel.

    >>> pridej(2, 3)
    5
    >>> pridej(-1, 1)
    0
    >>> pridej(10, 20)
    30
    """
    return a + b

if __name__ == "__main__":
    import doctest
    doctest.testmod(verbose=True)
```

### Spuštění testů z příkazové řádky:
```bash
python -m doctest kalkulacka.py
```

Pokud všechny testy projdou, modul nevypíše žádnou chybu. Pokud se výstup neshoduje, `doctest` zobrazí přehledný diff očekávané a obdržené hodnoty.

---
<!-- slide: id=id14 title="Příkaz „pass“" tags="Core" diff="resyntax" -->
## Syntaktický zástupný příkaz: „pass“

Python používá pro vymezení bloků odsazení. Klíčové slovo `pass` funguje jako instrukce **NOP** (*No Operation*) – je to platný příkaz, který nevykoná žádnou akci, ale splní syntaktickou povinnost neprázdného bloku:

```python
# 1. Minimální prázdná třída
class VlastniChyba(Exception):
    pass

# 2. Kostra budoucí funkce (stub)
def export_do_pdf(dokument: dict) -> None:
    pass  # TODO: implementovat pomocí ReportLab

# 3. Záměrné ignorování určité výjimky
try:
    with open("docasny.log") as f:
        data = f.read()
except FileNotFoundError:
    pass  # chybějící log soubor nevadí
```

---
<!-- slide: id=id15 title="Příkaz „...“" tags="WOW" diff="pythonic" -->
## Objekt výpustky: „...“ (Ellipsis)

Kromě příkazu `pass` nabízí Python ještě expresivnější alternativu: literál výpustky `...` (objekt typu `types.EllipsisType`):

```python
class Repository:
    def get_by_id(self, item_id: int) -> dict:
        ...  # Výstižně naznačuje: "zde kód teprve vznikne"
```

### Další využití Ellipsis v moderním Pythonu:
1. **Typové anotace (`typing`)**:
   ```python
   from collections.abc import Callable

   # Libovolný počet argumentů, návratový typ int
   Handler = Callable[..., int]
   
   # Homogenní n-tice libovolné délky
   IntTuple = tuple[int, ...]
   ```
2. **Vícerozměrné řezání polí v NumPy**:
   ```python
   # arr[..., 0] vybere první sloupec přes všechny předcházející dimenze
   ```

---
<!-- slide: id=id16 title="Datové typy" tags="Core" diff="paradigm" -->
## Přehled základních datových typů

Základní typy v Pythonu se dělí podle toho, zda lze jejich vnitřní stav po vytvoření modifikovat (*mutable*), nebo zda jsou neměnné (*immutable*):

| Kategorie | Měnitelné typy (*mutable*) | Neměnné typy (*immutable*) | Popis |
| :--- | :--- | :--- | :--- |
| **Čísla** | — | `int`, `float`, `complex`, `bool` | Celá a reálná čísla, komplexní čísla, pravdivostní hodnoty |
| **Text a binární data** | `bytearray` | `str`, `bytes` | Text v Unicode, neměnné a měnitelné bajtové sekvence |
| **Sekvence** | `list` (`[]`) | `tuple` (`()`), `range` | Uspořádané kolekce indexované celými čísly |
| **Množiny** | `set` (`{}`) | `frozenset` | Neuspořádané kolekce unikátních hodnot |
| **Mapování** | `dict` (`{k: v}`) | — | Asociativní pole klíč–hodnota s rychlým hešovacím přístupem |

> [!NOTE]
> Názvy typů slouží zároveň jako konstruktorové funkce, např. `int()`, `list()`, `dict()`, `set()`.

---
<!-- slide: id=id17 title="Datové typy – příklady" tags="Skip" diff="basics" -->
## Praktické literály datových typů

Ukázky zápisu literálů základních typů v kódu:

```python
# Pravdivostní hodnoty (Boolean)
je_aktivni = True
konec = False

# Číselné typy
pocet = 42                   # int (libovolná velikost)
pi = 3.14159                 # float (IEEE 754 double precision)
komplexni = 2 + 3j           # complex

# Textové a bajtové řetězce
zprava = "Ahoj, světe!"      # str (Unicode)
hlavicka_png = b"\x89PNG\r\n\x1a\n"  # bytes

# Sekvenční a množinové kolekce
seznam = [1, "auto", 3.14]   # list (mutable)
ntice = (1, "auto", 3.14)    # tuple (immutable)
mnozina = {1, 2, 3, 2, 1}     # set -> {1, 2, 3}

# Slovník (mapování)
uzivatel = {
    "jmeno": "Karel Novák",
    "vek": 28,
    "role": ["admin", "developer"],
}
```

---
<!-- slide: id=id18 title="Operátory" tags="Core" diff="resyntax" -->
## Operátory a jejich kategorie

Python nabízí ucelený systém operátorů pro práci s čísly, kolekcemi i logickými výrazy:

- **Aritmetické**: `+`, `-`, `*`, `/` (reálné dělení), `//` (celočíselné dělení), `%` (modulo), `**` (mocnina), `@` (maticové násobení).
- **Porovnávací**: `==` (rovnost hodnot), `!=` (nerovnost), `<`, `<=`, `>`, `>=`.
- **Logické**: `and`, `or`, `not` (používají zkrácené vyhodnocování *short-circuit*).
- **Identita a členství**:
  - `is`, `is not` (identita objektů v paměti).
  - `in`, `not in` (přítomnost prvku v sekvenci či množině).
- **Bitové**: `&` (AND), `|` (OR), `^` (XOR), `~` (NOT), `<<`, `>>`.
- **Kombinované přiřazení**: `+=`, `-=`, `*=`, `/=`, `//=`, `%=`, `**=`, `@=`.

> [!WARNING]
> Operátor `a += b` se u měnitelných typů (např. seznamů) chová in-place (volá `__iadd__`), zatímco u neměnných typů vytvoří nový objekt.

---
<!-- slide: id=id19 title="Příklady – čísla" tags="Core" diff="basics" -->
## Práce s čísly v interaktivním interpretu

Demonstrace číselných operací a dynamického typového chování v REPL:

```pycon
>>> a = 5
>>> b = 3
>>> a + b
8
>>> type(a)
<class 'int'>
>>> a += 4
>>> a
9

>>> c = 1.5
>>> type(c + a)
<class 'float'>
>>> 5 / 2    # reálné dělení
2.5
>>> 5 // 2   # celočíselné dělení
2
>>> 5 % 2    # zbytek po dělení
1
>>> 2 ** 10  # umocňování
1024
```

---
<!-- slide: id=id20 title="Příklady – řetězce" tags="Core" diff="resyntax" -->
## Základní operace s řetězci

Řetězce jsou neměnné sekvence Unicode znaků:

```pycon
>>> s = "ahoj"
>>> type(s)
<class 'str'>

>>> s + " světe"  # spojování řetězců
'ahoj světe'

>>> len(s)        # počet znaků
4

>>> s[0]          # první znak
'a'
>>> s[-1]         # poslední znak (záporný index)
'j'

>>> s * 3         # opakování řetězce
'ahojahojahoj'
```

---
<!-- slide: id=id21 title="Příklady – přiřazení" tags="Skip" diff="basics" -->
## Formy přiřazení do proměnných

Přiřazovací operátor `=` prováže jméno proměnné s objektem v paměti:

```pycon
# 1. Klasické přiřazení
>>> a = 'ahoj'
>>> a
'ahoj'

# 2. Vícenásobné přiřazení (všechny proměnné odkazují na tentýž objekt)
>>> x = y = z = 0
>>> x, y, z
(0, 0, 0)

# 3. Paralelní přiřazení rozbalením n-tice
>>> jmeno, vek = "Anna", 25
>>> jmeno
'Anna'
>>> vek
25
```

---
<!-- slide: id=id22 title="Příklady – porovnávání" tags="WOW" diff="pythonic" -->
## Porovnávání hodnot a řetězené podmínky

Výsledkem relačních operátorů je hodnota typu `bool` (`True` nebo `False`):

```pycon
>>> 3 == 5
False
>>> "bla" == 'bla'
True

>>> False and False or True
True
>>> not True
False
```

### Řetězené relační operátory (*Chained Comparisons*):
Python umožňuje psát složené podmínky stejně přirozeně jako v matematickém zápisu:

```pycon
>>> n = 33
>>> 1 < n < 100
True

# Ekvivalentní zápis s logickou spojkou and:
>>> (1 < n) and (n < 100)
True

>>> 1 < -10 < 100
False
```

> [!NOTE]
> V řetězeném výrazu `1 < f() < 100` je prostřední výraz `f()` vyhodnocen **pouze jednou**, což je efektivnější i bezpečnější než `1 < f() and f() < 100`.

---
<!-- slide: id=id23 title="Příklady – „is“ versus „is not“" tags="Tricky" diff="paradigm" -->
## Rozdíl mezi „==“ (hodnota) a „is“ (identita)

Jeden z nejčastějších zdrojů začátečnických chyb:

- **`==`**: Testuje **shodu hodnot** (volá metodu `__eq__`).
- **`is`**: Testuje **identitu v paměti** (`id(a) == id(b)` – zda jde o tentýž objekt).

```pycon
# A) Neměnné typy a optimalizace CPythonu (tzv. integer interning)
>>> a = 1
>>> b = 1
>>> a == b
True
>>> a is b
True

# B) Měnitelné typy – dva samostatné seznamy se stejným obsahem
>>> a = [1]
>>> b = [1]
>>> a == b       # hodnoty jsou shodné
True
>>> a is b       # ale jde o dvě různé instance v paměti!
False
>>> a is not b
True
```

> [!IMPORTANT]
> Pro porovnávání se singletony (`None`, `True`, `False`) vždy používejte operátor identity: `if x is None:`.

---
<!-- slide: id=id24 title="Sekvence" tags="Core" diff="pythonic" -->
## Společné rozhraní sekvencí

Sekvence jsou uspořádané skupiny prvků indexované celými čísly (`str`, `bytes`, `list`, `tuple`, `range`). Všechny sdílejí jednotné rozhraní:

- `len(xs)` – vrátí počet prvků sekvence.
- `xs[i]` – přístup k prvku na pozici `i` (záporné indexy počítají od konce, např. `xs[-1]`).
- `xs[start:stop:step]` – řez (*slice*) od indexu `start` po `stop - 1` s krokem `step`.
- `zs = xs + ys` – spojení dvou sekvencí téhož typu.
- `zs = xs * n` – $n$-násobné zopakování sekvence.
- `x in xs` / `x not in xs` – test přítomnosti prvku.
- `for x in xs:` – iterace přes všechny prvky sekvence.
- `xs.index(x, start=0)` – vrátí index prvního výskytu hodnoty `x`.
- `xs.count(x)` – spočítá celkový počet výskytů hodnoty `x`.

---
<!-- slide: id=id25 title="Sekvence – příklady" tags="Skip" diff="basics" -->
## Praktické ukázky indexování a řezání

Operace řezání demonstrované na textovém řetězci (stejně fungují pro seznamy i n-tice):

```pycon
>>> s = "Ahoj, světe!"
>>> len(s)
12
>>> s[0]       # první znak
'A'
>>> s[-2]      # předposlední znak
'e'
>>> s[2:5]     # podřetězec od indexu 2 do 4
'oj,'
>>> s[:5]      # od začátku do indexu 4
'Ahoj,'
>>> s[-4:]     # poslední 4 znaky
'ěte!'
>>> s[2:9:3]   # od indexu 2 do 8 s krokem 3
'o ě'
>>> s[::-1]    # otočení sekvence pozpátku
'!etěvs ,johA'

>>> 'A' in s
True
>>> 'a' in s
False
```

---
<!-- slide: id=id26 title="Řetězce" tags="WOW" diff="pythonic" -->
## Práce s řetězci a formátování

Řetězce (`str`) jsou v Pythonu 3 neměnné sekvence Unicode znaků:

### 1. Moderní formátování: f-strings (od Pythonu 3.6)
```python
jmeno = "Karel"
prumer = 1 / 3

# Elegantní vložený výraz se specifikátorem formátu
print(f"Prvek {jmeno} má průměr {prumer:.3f} cm.")
# Výstup: Prvek Karel má průměr 0.333 cm.
```

### 2. Klíčové metody řetězců:
- **Testování obsahu**: `s.isalpha()`, `s.isdigit()`, `s.isspace()`, `s.islower()`, `s.isupper()`.
- **Hledání**: `s.startswith("prefix")`, `s.endswith("suffix")`, `s.find("sub")`, `s.count("sub")`.
- **Úpravy velikosti**: `s.upper()`, `s.lower()`, `s.capitalize()`, `s.title()`.
- **Odstranění mezer**: `s.strip()`, `s.lstrip()`, `s.rstrip()`.
- **Záměna**: `s.replace("co", "čím", max_pocet)`.
- **Dělení a spojování**:
  ```python
  slova = "jablko,hruska,svestka".split(",")
  vysledek = " | ".join(slova)
  print(vysledek)  # jablko | hruska | svestka
  ```

---
<!-- slide: id=id27 title="Seznamy" tags="Tricky" diff="pythonic" -->
## Seznamy (Lists): Měnitelné sekvence

Seznam (`list`) je uspořádaná, měnitelná kolekce prvků libovolného typu:

```python
xs = [1, "ahoj", 3.14, [True, False]]
```

### Běžné metody modifikace seznamu:
- **Přidávání prvků**:
  - `xs.append(x)` – přidá prvek na konec seznamu.
  - `xs.insert(i, x)` – vloží prvek na index `i`.
  - `xs.extend(iterable)` – přidá všechny prvky z iterovatelného objektu.
- **Odebírání prvků**:
  - `xs.remove(x)` – odstraní první výskyt hodnoty `x` (vyvolá `ValueError`, pokud neexistuje).
  - `x = xs.pop([i])` – odebere a vrátí prvek na indexu `i` (výchozí je poslední).
  - `del xs[i]` – odstraní prvek nebo řez podle indexu.
  - `xs.clear()` – vymaže všechny prvky seznamu.
- **Řazení a obrácení (in-place)**:
  - `xs.sort(key=None, reverse=False)` – setřídí seznam na místě.
  - `xs.reverse()` – obrátí pořadí prvků na místě.

---
<!-- slide: id=id28 title="N-tice" tags="Tricky" diff="pythonic" -->
## N-tice (Tuples): Neměnné sekvence

N-tice (`tuple`) je neměnná sekvence hodnot. Konstruktorem n-tice je čárka `,`, závorky jsou povinné pouze v kontextech, kde by hrozila syntaktická nejednoznačnost:

```python
t = ("ahoj", 234, [1, 2])
a, b, c = t  # rozbalení (unpacking)
```

### Prohození hodnot dvou proměnných:
```python
a, b = b, a  # idiom využívající zabalení a rozbalení n-tice
```

> [!WARNING]
> Pozor na jednoprvkovou n-tici: výraz `(42)` je obyčejné celé číslo v závorkách. Pro vytvoření n-tice je nutné uvést čárku: `(42,)`.

---
<!-- slide: id=id29 title="Přiřazování za pomoci n-tic" tags="Already Studied" diff="pythonic" already_studied_in="lecture:materialy/python/types/tuples.html#id13" -->
## Pokročilé rozbalování n-tic a operátor „*“

Rozbalování n-tic přináší velkou flexibilitu při předávání a zpracování dat:

```pycon
# 1. Paralelní přiřazení více proměnným najednou
>>> v1, v2 = 1.3, "ahoj"
>>> v1, v2
(1.3, 'ahoj')

# 2. Rozšířené rozbalování s hvězdičkou (Extended Iterable Unpacking)
>>> prvni, *zbytek, posledni = [10, 20, 30, 40, 50]
>>> prvni
10
>>> zbytek
[20, 30, 40]
>>> posledni
50
```

Hvězdičková proměnná shromáždí všechny zbývající prvky do nového seznamu.

---
<!-- slide: id=id30 title="Slovníky" tags="Tricky" diff="newconcept" -->
## Slovníky (Dictionaries): Hešovací tabulky

Slovník (`dict`) je asociativní pole mapující unikátní hešovatelné klíče na libovolné hodnoty.

Od Pythonu 3.7 slovníky **oficiálně garantují zachování pořadí vkládání prvků**.

```python
katalog = {
    "kniha": 350,
    "pero": 45,
    "sesit": 25,
}

# Přístup a modifikace:
cena = katalog.get("kniha", 0)  # bezpečné čtení s výchozí hodnotou
katalog["pravitko"] = 30        # přidání nového klíče
del katalog["sesit"]            # odstranění záznamu
```

### Klíčové metody a operátory:
- `d.keys()`, `d.values()`, `d.items()` – dynamické pohledy na klíče, hodnoty a páry.
- `d1 | d2` – operátor sjednocení dvou slovníků (od Pythonu 3.9).
- Iterace přes slovník:
  ```python
  for klic, hodnota in katalog.items():
      print(f"{klic}: {hodnota} Kč")
  ```

---
<!-- slide: id=id31 title="Množiny" tags="Core" diff="resyntax" -->
## Množiny (Sets): Unikátní kolekce

Množina (`set`) je neuspořádaná kolekce unikátních hešovatelných prvků:

```pycon
>>> s = {1, 2, "ahoj", 2, 1}
>>> s
{1, 2, 'ahoj'}
```

### Matematické množinové operace:
- **Sjednocení (`|`)**: `a | b` nebo `a.union(b)`
- **Průnik (`&`)**: `a & b` nebo `a.intersection(b)`
- **Rozdíl (`-`)**: `a - b` nebo `a.difference(b)`
- **Symetrická diference (`^`)**: `a ^ b` nebo `a.symmetric_difference(b)`
- **Test podmnožiny**: `a <= b` nebo `a.issubset(b)`

> [!NOTE]
> Pro vytvoření prázdné množiny je nutné použít `set()`. Zápis `{}` vytvoří prázdný slovník! Pro neměnnou množinu slouží typ `frozenset`.

---
<!-- slide: id=id32 title="Přiřazení – proměnné a neproměnné typy" tags="Already Studied" diff="paradigm" already_studied_in="lecture:materialy/python/types/_remarks.html#id3" -->
## Reference na objekty: Měnitelnost v praxi

Všechny proměnné v Pythonu jsou referencemi na objekty v paměti:

```pycon
>>> xs = ['a', 'h', 'o', 'j']
>>> ys = xs         # ys odkazuje na tentýž objekt jako xs!
>>> xs.remove('o')
>>> xs
['a', 'h', 'j']
>>> ys              # změna se projeví i přes ys!
['a', 'h', 'j']
>>> xs is ys
True
```

### Jak vytvořit skutečnou kopii:
- **Mělká kopie (*shallow copy*)**: `ys = xs.copy()` nebo `ys = xs[:]`.
- **Hluboká kopie (*deep copy*)**: Pro vnořené struktury použijte `copy.deepcopy(xs)`.

---
<!-- slide: id=id33 title="Třídění" tags="Core" diff="pythonic" -->
## Řazení kolekcí: sorted() vs. list.sort()

Python používá vysoce optimalizovaný, stabilní řadicí algoritmus Timsort / Powersort:

- **`sorted(iterable, key=None, reverse=False)`**: Vrací **nový** seřazený seznam, původní kolekci nemění.
- **`list.sort(key=None, reverse=False)`**: Seřadí stávající seznam **in-place** a vrátí `None`.

```python
studenti = [("Láďa", 2), ("Jana", 1), ("Karel", 3), ("Jana", 2)]

# Standardní lexikografické řazení podle všech složek:
print(sorted(studenti))
# [('Jana', 1), ('Jana', 2), ('Karel', 3), ('Láďa', 2)]

# Řazení podle vlastního klíče (např. podle známky / druhé složky):
print(sorted(studenti, key=lambda s: s[1]))
# [('Jana', 1), ('Láďa', 2), ('Jana', 2), ('Karel', 3)]
```

---
<!-- slide: id=id34 title="Generátorová notace" tags="WOW" diff="pythonic" -->
## Generátorová notace (Comprehensions)

Generátorová notace nabízí elegantní způsob transformace a filtrování kolekcí:

```python
cisla = range(1, 9)

# 1. List comprehension (seznamový generátor)
ctverce = [x**2 for x in cisla if x % 2 == 0]
print(ctverce)  # [4, 16, 36, 64]

# 2. Dict comprehension (slovníkový generátor)
mocniny = {x: x**2 for x in range(1, 5)}
print(mocniny)  # {1: 1, 2: 4, 3: 9, 4: 16}

# 3. Set comprehension (množinový generátor)
zbytky = {x % 3 for x in range(10)}
print(zbytky)   # {0, 1, 2}

# 4. Generator expression (líně vyhodnocovaný generátor, šetří paměť)
lazy_gen = (x**2 for x in range(1_000_000))
print(next(lazy_gen))  # 0
```

---
<!-- slide: id=id35 title="Větvení „if“" tags="Already Studied" diff="resyntax" already_studied_in="lecture:materialy/python/basics.html#id2" -->
## Podmíněné větvení: „if-elif-else“

Základní konstrukce pro řízení toku programu:

```python
if PODMINKA_1:
    BLOK_1
elif PODMINKA_2:
    BLOK_2
else:
    BLOK_DEFAULT
```

- Větve `elif` a `else` jsou volitelné.
- Větví `elif` může být libovolné množství.
- Vyhodnocování probíhá shora dolů – první splněná větev kód vykoná a zbytek přeskočí.

> [!NOTE]
> Od Pythonu 3.10 je k dispozici také mocné strukturální porovnávání vzorů (*Structural Pattern Matching*) pomocí klíčových slov `match` a `case`.

---
<!-- slide: id=id36 title="Příklady – „if“" tags="Already Studied" diff="basics" already_studied_in="lecture:materialy--python--overview.2#id11" -->
## Ukázky podmíněného rozhodování

Praktické použití podmíněného větvení:

```python
vstup = "zelená"

if vstup in ["červená", "zelená", "modrá"]:
    print(f"{vstup} je základní barva.")
elif vstup in ["jedna", "dvě", "tři"]:
    print(f"{vstup} je číslovka.")
else:
    print(f"Neznámá hodnota: {vstup}")
```

Pravdivostní hodnota libovolného objektu v podmínce (`bool(x)`):
- Číslo `0`, prázdný řetězec `""`, prázdné kolekce `[]`, `{}`, `()` a singleton `None` jsou vyhodnoceny jako `False`.
- Všechny neprázdné hodnoty jsou `True`.

---
<!-- slide: id=id37 title="Podmíněný výraz („ternární operátor“)" tags="Already Studied" diff="pythonic" already_studied_in="lecture:materialy/python/basics.html#id3" -->
## Podmíněný výraz: Ternární operátor

Python nabízí jednořádkový podmíněný výraz (*ternary conditional operator*):

```python
vysledek = HODNOTA_KDYZ_TRUE if PODMINKA else HODNOTA_KDYZ_FALSE
```

### Příklad:
```python
vek = 20
status = "dospělý" if vek >= 18 else "nezletilý"
print(status)  # dospělý

# Využití při formátování:
pocet = 1
print(f"Nalezen{'' if pocet == 1 else 'o'} {pocet} soubor{'' if pocet == 1 else 'ů'}.")
```

---
<!-- slide: id=id38 title="Předčasné ukončení smyčky" tags="Core" diff="basics" -->
## Řízení smyček: „break“ a „continue“

Dva standardní příkazy pro změnu průchodu cykly:

- **`continue`**: Okamžitě ukončí zpracování aktuální iterace a přejde na další krok smyčky.
- **`break`**: Okamžitě přeruší a opustí celou smyčku.

```python
for n in range(1, 10):
    if n % 2 == 0:
        continue  # přeskočí sudá čísla
    if n > 7:
        break     # ukončí cyklus, jakmile n překročí 7
    print(n, end=" ")
# Výstup: 1 3 5 7
```

---
<!-- slide: id=id39 title="Cyklus „for“" tags="Already Studied" diff="pythonic" already_studied_in="lecture:materialy/python/basics.html#id8" -->
## Cyklus „for-in“ a netradiční větev „else“

V Pythonu cyklus `for` nepočítá indexy čítačem jako v C, nýbrž iteruje přes prvky libovolného iterovatelného objektu:

```python
for prvek in iterable:
    BLOK_1
else:
    BLOK_2
```

### Chování větve `else`:
- Kód ve větvi `else` se provede **pouze tehdy, pokud cyklus proběhl normálně až do konce**.
- Pokud byl cyklus předčasně přerušen příkazem `break`, větev `else` se **nevykoná**.

Tato konstrukce je ideální pro vyhledávací algoritmy ("hledali jsme prvek a nenašli").

---
<!-- slide: id=id40 title="Příklady – „for“" tags="Core" diff="pythonic" -->
## Praktické ukázky cyklu „for“ a funkce enumerate()

```python
slova = ["welcome", "to", "python"]

# 1. Přímá iterace přes hodnoty
for word in slova:
    print(word)

# 2. Iterace s indexem pomocí vestavěné funkce enumerate()
for i, word in enumerate(slova, start=1):
    print(f"{i}. {word}")
```

Výstup:
```text
1. welcome
2. to
3. python
```

---
<!-- slide: id=id41 title="Příklady – „range“" tags="Already Studied" diff="basics" already_studied_in="lecture:materialy--python--overview.2#id19" -->
## Generátor rozsahů: funkce „range()“

Objekt `range` představuje paměťově úspornou neměnnou číselnou řadu $O(1)$:

```pycon
>>> range(5)             # od 0 do 4
range(0, 5)
>>> list(range(5))
[0, 1, 2, 3, 4]

>>> list(range(4, 7))    # od 4 do 6
[4, 5, 6]

>>> list(range(1, 8, 2)) # od 1 do 7 s krokem 2
[1, 3, 5, 7]
```

### Použití ve smyčce:
```python
celkem = 0
for i in range(10):
    celkem += i
print(celkem)  # 45
```

---
<!-- slide: id=id42 title="Ukázka – prvočísla" tags="Already Studied" diff="pythonic" already_studied_in="lecture:materialy--python--overview.2#id21" -->
## Příklad: Vyhledávání prvočísel pomocí „for-else“

Ukázka elegance větve `else` u cyklu `for`:

```python
prvocisla = []

for n in range(2, 30):
    for d in range(2, int(n**0.5) + 1):
        if n % d == 0:
            break  # nalezen dělitel, n není prvočíslo
    else:
        # větev se provede pouze, pokud vnitřní cyklus neprovedl break
        prvocisla.append(n)

print("Prvočísla do 30:", prvocisla)
# [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
```

---
<!-- slide: id=id43 title="Cyklus „while“" tags="Already Studied" diff="resyntax" already_studied_in="lecture:materialy/python/basics.html#id10" -->
## Cyklus „while“ a větev „else“

Cyklus `while` opakuje blok kódu, dokud je řídicí podmínka pravdivá:

```python
while PODMINKA:
    BLOK_1
else:
    BLOK_2
```

Podobně jako u `for`, větev `else` se vykoná pouze při přirozeném skončení podmínky na `False`, nikoli při opuštění smyčky přes `break`.

### Použití s přiřazovacím operátorem (`:=` od Pythonu 3.8):
```python
with open("data.txt", "r", encoding="utf-8") as f:
    while (radek := f.readline()):
        print(radek.strip())
```

---
<!-- slide: id=id44 title="A co „repeat“?" tags="Already Studied" diff="resyntax" already_studied_in="lecture:materialy/python/basics.html#id11" -->
## Emulace konstrukce „repeat-until“

Python nemá samostatné klíčové slovo `repeat` ani `do-while`. Smyčku s testem podmínky na konci zapisujeme idiomem nekonečného cyklu `while True` s podmíněným `break`:

```python
while True:
    vstup = input("Zadejte kladné číslo: ")
    if vstup.isdigit() and int(vstup) > 0:
        cislo = int(vstup)
        break  # podmínka splněna, opouštíme cyklus
    print("Neplatný vstup, zkuste to znovu.")

print(f"Zadáno platné číslo: {cislo}")
```

---
<!-- slide: id=id45 title="Příklady – „while“" tags="Already Studied" diff="basics" already_studied_in="lecture:materialy--python--overview.2#id14" -->
## Ukázky použití cyklu „while“

Klasické čítání a zpracování hodnot:

```pycon
>>> i = 0
>>> while i < 5:
...     print(i, end=" ")
...     i += 1
...
0 1 2 3 4
```

Vyprázdnění zásobníku nebo fronty:
```python
fronta = ["první", "druhý", "třetí"]
while fronta:
    polozka = fronta.pop(0)
    print(f"Zpracováno: {polozka}")
```

---
<!-- slide: id=id46 title="Operátor „:=“ (aka „walrus“)" tags="WOW" diff="pythonic" -->
## Přiřazovací operátor „:=“ (Walrus Operator)

Přiřazovací výraz (*Assignment Expression*, PEP 572, od Pythonu 3.8) umožňuje přiřadit hodnotu do proměnné přímo v místě jejího testování:

```python
import re

text = "Dnes je 20% sleva na veškerý sortiment!"

# 1. Odstranění dvojího hledání v regulárním výrazu
if mo := re.search(r"(\d+)% sleva", text):
    sleva = int(mo.group(1))
    print(f"Detekována sleva: {sleva} %")

# 2. Využití v seznamovém generátoru pro drahé výpočty
import math
vysledky = [y for x in range(10) if (y := math.sin(x)) > 0.5]
print(vysledky)

# 3. Test délky bez opakovaného volání len()
data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
if (n := len(data)) > 10:
    print(f"Seznam je příliš dlouhý: {n} prvků (maximum je 10).")
```

---
<!-- slide: id=id47 title="Výjimky – „try-except“" tags="Already Studied" diff="resyntax" already_studied_in="lecture:materialy/python/exceptions/exceptions.html#id2" -->
## Ošetření chyb: blok „try-except“

Běhové chyby a mimořádné stavy se v Pythonu řeší mechanismem výjimek:

```python
try:
    hodnota = int(input("Zadej číslo: "))
    vysledek = 100 / hodnota
except ValueError:
    print("Chyba: Zadaný text nelze převést na číslo!")
except ZeroDivisionError:
    print("Chyba: Dělení nulou není povoleno!")
except Exception as err:
    print(f"Neočekávaná chyba: {err} ({type(err).__name__})")
```

### Definice vlastní výjimky:
```python
class KonfiguracniChyba(Exception):
    """Vlastní aplikační výjimka."""
    pass
```

---
<!-- slide: id=id48 title="Výjimky – „try-except-else-finally“" tags="Already Studied" diff="resyntax" already_studied_in="lecture:materialy/python/exceptions/exceptions.html#id2" -->
## Úplná syntaxe: „try-except-else-finally“

Plná podoba bloku pro ošetření výjimek:

```python
try:
    BLOK_KODU
except MojeChyba as ex:
    BLOK_OSOBNIHO_ZPRACOVANI
else:
    BLOK_PROVEDENY_JEN_PRI_USPECHU
finally:
    BLOK_PROVEDENY_VZDY
```

- **`else`**: Vykoná se pouze tehdy, pokud v bloku `try` **nedošlo k žádné výjimce**.
- **`finally`**: Vykoná se **vždy** – ať už výjimka nenastala, byla odchycena, nebo pokračuje dál. Ideální pro garantovaný úklid zdrojů.

---
<!-- slide: id=id49 title="Příklady – výjimky" tags="Already Studied" diff="pythonic" already_studied_in="lecture:materialy/python/exceptions/exceptions.html#id3" -->
## Komplexní ukázka ošetření výjimek

Příklad zachycení uživatelských přerušení a práce se všemi větvemi:

```python
try:
    text = input("Zadejte vstupní řetězec: ")
except EOFError:
    # Unix: Ctrl+D, Windows: Ctrl+Z + Enter
    print("\nDetekován konec souboru (EOF).")
except KeyboardInterrupt:
    # Ctrl+C
    print("\nOperace byla přerušena uživatelem.")
else:
    print(f'Úspěšně zadáno: "{text}"')
finally:
    print("Úklid dokončen, pokračujeme.")
```

---
<!-- slide: id=id50 title="Blok „with“" tags="Core" diff="newconcept" -->
## Správci kontextu: Blok „with“

Blok `with` (správce kontextu, *Context Manager*, PEP 343) elegantně zjednodušuje obsluhu prostředků a garantuje jejich uvolnění:

```python
with SPRAVCE_KONTEXTU as PROMENNA:
    BLOK_KODU
```

### Protokol správce kontextu:
Při vstupu do bloku se automaticky zavolá speciální metoda `__enter__()`. Při opuštění bloku (včetně vyvolání výjimky) je spolehlivě zavolána metoda `__exit__()`.

> [!NOTE]
> Správce kontextu nahrazuje dřívější šablonu `try ... finally` mnohem čitelnějším způsobem.

---
<!-- slide: id=id51 title="Příklady – „with“" tags="WOW" diff="pythonic" -->
## Blok „with“ v praxi: Soubory a zámky

Nejtypičtější využití správce kontextu představuje bezpečná práce se soubory:

```python
# Soubor je po opuštění bloku garantovaně uzavřen
with open("vystup.txt", mode="w", encoding="utf-8") as f:
    f.write("První řádek souboru\n")
    f.write("Druhý řádek souboru\n")

# Čtení po řádcích bezpečně a paměťově úsporně
with open("vystup.txt", mode="r", encoding="utf-8") as f:
    for cislo_radku, radek in enumerate(f, start=1):
        print(f"{cislo_radku}: {radek.strip()}")
```

Od Pythonu 3.10 lze správce kontextu seskupovat do závorek:
```python
with (
    open("vstup.txt", "r", encoding="utf-8") as zdroj,
    open("cil.txt", "w", encoding="utf-8") as cil,
):
    cil.write(zdroj.read())
```

---
<!-- slide: id=id52 title="Funkce „def“" tags="Already Studied" diff="pythonic" already_studied_in="lecture:materialy/python/basics.html#id20" -->
## Definice funkcí: klíčové slovo „def“

Funkce jsou v Pythonu základním stavebním kamenem a plnohodnotným objektem (*first-class object*):

```python
def pozdrav(jmeno: str, pozdrav: str = "Ahoj") -> str:
    """Vrátí formátovaný pozdrav."""
    return f"{pozdrav}, {jmeno}!"
```

### Moderní parametry funkcí:
- `*args` – proměnný počet pozičních argumentů (zabaleno do `tuple`).
- `**kwargs` – proměnný počet pojmenovaných argumentů (zabaleno do `dict`).
- `/` – *positional-only* parametry (lze předat pouze pozicí, od 3.8).
- `*` – *keyword-only* parametry (lze předat pouze se jménem).

```python
def konfigurovat(cesta: str, /, timeout: int = 30, *, debug: bool = False):
    print(f"Cesta: {cesta}, Timeout: {timeout}, Debug: {debug}")

konfigurovat("config.json", 60, debug=True)
```

---
<!-- slide: id=id53 title="„print()“" tags="Already Studied" diff="basics" already_studied_in="lecture:materialy/python/cmd/print.html#id1" -->
## Vestavěná výstupní funkce „print()“

Kompletní signatura nejpoužívanější funkce:

```python
print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)
```

### Parametry:
- `*objects`: Libovolný počet objektů k výpisu. Každý objekt je převeden na řetězec pomocí `str()`.
- `sep`: Oddělovač mezi jednotlivými objekty (výchozí mezera `' '`).
- `end`: Řetězec vložený za poslední objekt (výchozí odřádkování `'\n'`).
- `file`: Cílový proud (výchozí standardní výstup `sys.stdout`).
- `flush`: Pokud je `True`, vynutí okamžité vyprázdnění vyrovnávací paměti streamu.

```python
s1, s2, s3 = "ahoj", "světe", "jak se máš"
print(s1, s2, s3, sep=" | ", end="!\n")
# Výstup: ahoj | světe | jak se máš!
```

---
<!-- slide: id=id54 title="„input()“" tags="Already Studied" diff="basics" already_studied_in="lecture:materialy/python/cmd/overview.html#id2" -->
## Vestavěná vstupní funkce „input()“

Funkce `input([prompt])` načte řádek ze standardního vstupu a vrátí jej jako textový řetězec `str`:

```python
jmeno = input("Zadejte své jméno: ")
vek_str = input("Zadejte svůj věk: ")

# input() vrací VŽDY řetězec, pro číselné operace je nutná explicitní konverze:
try:
    vek = int(vek_str)
    print(f"Vítejte, {jmeno}! Za rok vám bude {vek + 1} let.")
except ValueError:
    print("Chyba: Zadaný věk není platné celé číslo!")
```

> [!NOTE]
> V Pythonu 2 existovala nebezpečná funkce `input()`, která zadaný text rovnou vyhodnocovala příkazem `eval()`. V Pythonu 3 se `input()` chová bezpečně jako dřívější `raw_input()`.

---
<!-- slide: id=id55 title="Funkce a moduly a třídy" tags="Core" diff="paradigm" -->
## Organizace kódu: Funkce, Moduly a Balíčky

Kód se v Pythonu organizuje do hierarchických celků:

1. **Funkce a metody**:
   - Samostatné funkce na úrovni modulu.
   - Metody svázané s instancí objektu či třídou.
2. **Moduly**:
   - Každý zdrojový soubor `.py` je automaticky modulem.
   - Importem modulu (`import re`, `from math import sqrt`) získáme přístup k jeho jmennému prostoru.
3. **Balíčky (*Packages*)**:
   - Adresář obsahující další moduly a soubor `__init__.py` (v moderním Pythonu fungují i *Namespace Packages* bez `__init__.py`).

### Pravidlo pro hledání proměnných (LEGB):
Python prohledává jmenné prostory v pořadí: **L**ocal $\rightarrow$ **E**nclosing $\rightarrow$ **G**lobal $\rightarrow$ **B**uilt-in.

---
<!-- slide: id=id56 title="„pprint()“" tags="Core" diff="pythonic" -->
## Čitelný výpis struktur: modul „pprint“

Modul `pprint` (*Pretty-Printer*) umožňuje přehledné formátování vnořených datových struktur:

```python
import pprint

data = [
    "krátký řetězec",
    ("n-tice", ("vnořená", ("hluboká", "hodnota"))),
    {"jméno": "Petr", "dovednosti": ["Python", "SQL", "Git", "Docker"]},
    [x**2 for x in range(8)],
]

# Krásný formátovaný výstup s omezením šířky
pprint.pprint(data, width=50, depth=4, indent=2)
```

Výstup je logicky odsazen a složité kolekce jsou zalomeny na samostatné řádky.

---
<!-- slide: id=id57 title="Ukázka – faktoriál" tags="Already Studied" diff="basics" already_studied_in="lecture:materialy--python--overview.2#id35" -->
## Algoritmické srovnání: Výpočet faktoriálu

Srovnání tří přístupů k výpočtu matematického faktoriálu:

```python
# 1. Rekurzivní implementace
def faktorial_rekurze(n: int) -> int:
    if n <= 1:
        return 1
    return n * faktorial_rekurze(n - 1)

# 2. Iterační cyklus (paměťově efektivnější, bez rizika RecursionError)
def faktorial_iterace(n: int) -> int:
    vysledek = 1
    for k in range(2, n + 1):
        vysledek *= k
    return vysledek

# 3. Standardní knihovna (nejrychlejší, optimalizováno v C)
import math

print(faktorial_rekurze(9))  # 362880
print(faktorial_iterace(9))   # 362880
print(math.factorial(9))      # 362880
```

---
<!-- slide: id=id58 title="Třídy „class“" tags="Core" diff="resyntax" -->
## Objektově orientované programování: Třídy

Třídy se definují klíčovým slovem `class`. Všechny třídy v Pythonu 3 implicitně dědí ze základní třídy `object`:

```python
class Zvire:
    def __init__(self, jmeno: str):
        self.jmeno = jmeno

    def vydej_zvuk(self) -> str:
        return "Neznámý zvuk"

# Dědičnost:
class Pes(Zvire):
    def vydej_zvuk(self) -> str:
        return f"{self.jmeno} štěká: Haf haf!"

pes = Pes("Borek")
print(pes.vydej_zvuk())  # Borek štěká: Haf haf!
print(isinstance(pes, Zvire))  # True
```

---
<!-- slide: id=id59 title="„Magické“ atributy tříd" tags="WOW" diff="paradigm" -->
## Speciální „dunder“ metody (Data Model)

Python umožňuje přizpůsobit chování objektů implementací speciálních metod začínajících a končících dvěma podtržítky (*double underscore* / *dunder*):

- **Konstrukce a reprezentace**:
  - `__init__(self, ...)` – inicializátor nové instance.
  - `__repr__(self)` – oficiální technická textová reprezentace.
  - `__str__(self)` – uživatelsky přívětivá textová podoba.
- **Operátory a porovnávání**:
  - `__eq__`, `__lt__`, `__le__` – relační operátory (`==`, `<`, `<=`).
  - `__add__`, `__sub__`, `__mul__` – aritmetické operátory (`+`, `-`, `*`).
- **Kolekce a kontexty**:
  - `__len__(self)` – podpora pro funkci `len()`.
  - `__getitem__(self, key)` – indexace `obj[key]`.
  - `__iter__(self)`, `__next__(self)` – protokol iterátoru pro cyklus `for`.
  - `__enter__(self)`, `__exit__(self, ...)` – protokol správce kontextu `with`.
  - `__call__(self, ...)` – instance se chová jako volatelná funkce.

> [!NOTE]
> Atributy začínající dvěma podtržítky (např. `__soukrome`) podléhají tzv. *Name Manglingu* (jsou přejmenovány na `_Trida__soukrome`), čímž se brání nechtěnému přepsání v podtřídách.

---
<!-- slide: id=id60 title="„dir()“" tags="Core" diff="pythonic" -->
## Introspekce objektů: funkce „dir()“

Vestavěná funkce `dir([object])` je jedním z nejmocnějších introspekčních nástrojů v Pythonu. Vrátí seřazený seznam všech platných atributů a metod daného objektu:

```pycon
>>> dir("ahoj")
['__add__', '__class__', '__contains__', '__doc__', '__eq__', ...,
 'capitalize', 'count', 'encode', 'endswith', 'find', 'format',
 'index', 'isalnum', 'isalpha', 'isdigit', 'islower', 'join',
 'lower', 'replace', 'split', 'startswith', 'strip', 'upper']
```

### Filtrování veřejného API objektu:
Snadný způsob, jak v interaktivní konzoli prozkoumat veřejné metody bez dunder atributů:

```python
verejne_metody = [m for m in dir(str) if not m.startswith("_")]
print(f"Řetězec má {len(verejne_metody)} veřejných metod:")
print(", ".join(verejne_metody[:10]), "...")
```

Tímto přehledem završujeme kompletní průřez syntaxí, datovým modelem a filozofickou elegancí jazyka Python!
