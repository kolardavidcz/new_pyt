<!-- slide: id1, Základní datové typy – konstruktory, Core, basics -->
## Základní datové typy – konstruktory

V Pythonu je **všechno objekt** (včetně čísel, funkcí a tříd). Základní vestavěné datové typy dělíme podle jejich měnitelnosti (*mutability*):

| Proměnné (*mutable*) | Neproměnné (*immutable*) | Kategorie | Příklad literálu |
| :--- | :--- | :--- | :--- |
| — | `int()` | Číselný | `42`, `1_000_000` |
| — | `float()` | Číselný | `3.14`, `1e-3` |
| — | `complex()` | Číselný | `1 + 2j` |
| — | `str()` | Sekvenční textový | `'ahoj'`, `"svět"`, `f"{x}"` |
| `bytearray()` | `bytes()` | Sekvenční binární | `b'data'`, `bytearray(b'abc')` |
| `list()` | `tuple()` | Sekvenční obecný | `[1, 2, 3]`, `(1, 2, 3)` |
| — | `range()` | Sekvenční generátor | `range(0, 10)` |
| `set()` | `frozenset()` | Množinový | `{1, 2, 3}`, `frozenset({1, 2})` |
| `dict()` | — | Mapovací | `{"klíč": "hodnota"}` |

> [!TIP] Výkon přímých literálů vs. konstruktorů
> Literálové zápisy (`[]`, `{}`, `()`, `""`) jsou výrazně rychlejší než volání funkcí `list()`, `dict()`, `tuple()`. Literál se překládá přímo do dedikované instrukce CPython bajtkódu (`BUILD_LIST`, `BUILD_MAP`), zatímco volání funkce vyžaduje vyhledání jména v `globals`/`builtins` a režii volání funkce (`CALL`).

---
<!-- slide: id2, Přiřazení (či spíše „pojmenovávání“), Tricky, paradigm -->
## Přiřazení (či spíše „pojmenovávání“)

V C, C++ nebo Javě si proměnnou představujeme jako paměťovou „krabičku“ určitého typu, do které se ukládá binární hodnota:
```c
int x = 42; // x je 4 bajty paměti na stacku
```

V Pythonu funguje přiřazení zásadně odlišně – **jména jsou pouze visačky (reference) nalepené na objekty v heap paměti**:

> [!IMPORTANT] Objektový model a Call-by-Sharing
> Python používá výhradně model **předávání odkazem na objekt** (*call-by-object-sharing*):
> 1. Operátor přiřazení `=` **nikdy nekopíruje objekt**. Pouze naváže jméno na existující objekt.
> 2. Pokud je objekt **neproměnný** (*immutable*, např. `int`, `str`, `tuple`), nelze jej na místě změnit. Jakákoliv „změna“ vyrobí nový objekt a visačku přepne.
> 3. Pokud je objekt **proměnný** (*mutable*, např. `list`, `dict`), změna stavu objektu se projeví skrze všechny visačky, které na něj ukazují.

---
<!-- slide: id3, Přiřazení – proměnné typy, Tricky, paradigm -->
## Přiřazení – proměnné typy

Podívejme se na chování proměnného typu (*mutable*), zde reprezentovaného seznamem `list`:

```python
# A) Zde 'xs' a 'ys' odkazují na DVA různé seznamy v paměti:
>>> xs = ['a', 'h', 'o', 'j']
>>> ys = ['a', 'h', 'o', 'j']
>>> xs is ys
False  # Různé adresy v paměti (id)

>>> xs.remove('o')
>>> xs
['a', 'h', 'j']
>>> ys
['a', 'h', 'o', 'j']  # 'ys' zůstalo netknuté

# B) Zde jsou 'xs' a 'ys' dvě visačky na TÝŽ objekt:
>>> xs = ['a', 'h', 'o', 'j']
>>> ys = xs
>>> xs is ys
True  # Ukazují na identický objekt v heapu

>>> xs.remove('o')
>>> xs
['a', 'h', 'j']
>>> ys
['a', 'h', 'j']  # Změna je vidět i přes 'ys'!
```

---
<!-- slide: id4, Přiřazení – neproměnné typy, Core, paradigm -->
## Přiřazení – neproměnné typy

U neproměnných typů (*immutable*, např. `str`, `int`, `float`, `tuple`) se vnitřní stav objektu po vytvoření již nikdy nemůže změnit:

```python
# Zavedeme řetězec 'xs'...
>>> xs = "jedna"
>>> ys = xs
>>> xs is ys
True  # Obě visačky míří na stejný řetězec v paměti

# Změníme hodnotu 'xs' – to ve skutečnosti vytvoří NOVÝ objekt:
>>> xs = "dva"

# Visačka 'xs' byla přepojena na nový řetězec "dva":
>>> xs
'dva'

# Visačka 'ys' stále visí na původním netknutém objektu "jedna":
>>> ys
'jedna'
```

> [!NOTE] C/C++ srovnání
> V Pythonu neexistuje `const` modifikátor pro proměnné. Neměnnost není vlastností proměnné (visačky), nýbrž **vlastností samotného typu objektu**, na který proměnná ukazuje.

---
<!-- slide: id5, Kopírování objektů I, Tricky, pythonic -->
## Kopírování objektů I (Mělká kopie)

Pokud chceme pracovat s nezávislým seznamem, nestačí pouhé přiřazení `ys = xs`. Často se používá **mělká kopie** (*shallow copy*):
- `ys = xs[:]` (výřezem)
- `ys = list(xs)` (konstruktorem)
- `ys = xs.copy()` (metodou)

Problém nastává u vnořených struktur:

```python
>>> xs = ['a', 'b', 'c']
>>> ys = [1, xs]
>>> zs = {1: xs}

# Vytvoříme mělkou kopii:
>>> ys2 = ys[:]
>>> zs2 = zs.copy()

# Mělká kopie vytvoří nový vnější kontejner, ale vnitřní prvky jen zkopíruje jako reference:
>>> ys2[1] is xs
True

# Změna vnitřního sdíleného objektu:
>>> xs.pop()
'c'

>>> ys
[1, ['a', 'b']]
>>> ys2
[1, ['a', 'b']]  # ys2 byl také ovlivněn!
```

---
<!-- slide: id6, Kopírování objektů II, Core, pythonic -->
## Kopírování objektů II (Hluboká kopie)

Potřebujeme-li zkopírovat kontejner včetně všech rekurzivně vnořených objektů, použijeme standardní modul `copy` a funkci `copy.deepcopy()`:

```python
import copy

xs = ['a', 'b', 'c']
ys = [1, xs]
zs = {1: xs}

# Vytvoření plně nezávislé hluboké kopie:
ys2 = copy.deepcopy(ys)
zs2 = copy.deepcopy(zs)

# Nyní ys2[1] ukazuje na zbrusu nový seznam se stejným obsahem:
print(ys2[1] is xs)  # False

# Modifikace původního vnořeného objektu:
xs.pop()  # odebere 'c'

print(ys)   # [1, ['a', 'b']]
print(ys2)  # [1, ['a', 'b', 'c']] -> nedotčeno!
print(zs)   # {1: ['a', 'b']}
print(zs2)  # {1: ['a', 'b', 'c']} -> nedotčeno!
```

> [!WARNING] Výkon `deepcopy`
> `copy.deepcopy()` rekurzivně prochází celý graf objektů a udržuje slovník navštívených instancí (aby předešel zacyklení). Pro rozsáhlé stromy či matice bývá výpočetně pomalý.

---
<!-- slide: id7, Životní cyklus a reference, Tricky, paradigm -->
## Životní cyklus a reference

Referencovaný objekt v Pythonu nezaniká, dokud na něj existuje alespoň jeden platný odkaz (tzv. *Reference Counting* + cyklický *Garbage Collector*):

```python
# Použijme v seznamu 'ys' odkaz na seznam 'xs':
>>> xs = ['a', 'b', 'c']
>>> ys = [1, xs, 3]
>>> ys
[1, ['a', 'b', 'c'], 3]

# Přejmenujme visačku 'xs' na jiný objekt (číslo 666):
>>> xs = 666

# Objekt seznamu ['a', 'b', 'c'] v paměti nezanikl, protože na něj stále odkazuje ys[1]:
>>> ys
[1, ['a', 'b', 'c'], 3]
```

Původní seznam existuje dál, dokud nezanikne samotný seznam `ys` nebo z něj není odkaz odstraněn.

---
<!-- slide: id8, Hešovatelnost I, Core, newconcept -->
## Hešovatelnost I (*Hashability*)

Datové typy v Pythonu dělíme na **hešovatelné** (*hashable*) a **nehešovatelné**.

Aby byl objekt hešovatelný, musí splňovat dvě podmínky:
1. Má definovanou metodu `__hash__()`, která vrací celé číslo (`int`), jež se **po celou dobu existence objektu nezmění**.
2. Má definovanou metodu `__eq__()` pro porovnání rovnosti, přičemž platí:
   $$\text{pokud } a == b \implies \operatorname{hash}(a) == \operatorname{hash}(b)$$

```python
>>> hash("ahoj")
3461298579047913388  # v Pythonu 3 je náhodně saltováno pro bezpečnost (SipHash)

>>> hash(42)
42
```

> [!IMPORTANT] Proč na hešovatelnosti záleží?
> Pouze hešovatelné objekty mohou být:
> - **prvky v množině** (`set`, `frozenset`),
> - **klíči ve slovníku** (`dict`).
>
> Důvodem je, že množiny a slovníky používají vyhledávací hešovací tabulky s průměrnou časovou složitostí $O(1)$. Pokud by se heš objektu mohl za běhu změnit, objekt by se v tabulce ztratil.

---
<!-- slide: id9, Hešovatelnost II, Tricky, newconcept -->
## Hešovatelnost II (Pravidla a detaily)

Vlastnosti a záludnosti hešování:

1. **Číselná rovnost napříč typy**: Různé typy se stejnou hodnotou musí mít stejný heš, aby fungovalo vyhledávání:
   ```python
   >>> x, y = 1, 1.0
   >>> type(x), type(y)
   (<class 'int'>, <class 'float'>)
   >>> x == y
   True
   >>> hash(x) == hash(y)
   True
   ```

2. **Identita `id()` vs. `hash()`**:
   - `id(obj)` vrací adresu objektu v paměti (v CPythonu celočíselný ukazatel).
   - `hash(obj)` vrací hodnotu vypočtenou z obsahu objektu.

3. **Uživatelské třídy**:
   - Instance vlastních tříd jsou ve výchozím stavu hešovatelné podle identity (`id`) – dva různé objekty se nerovnají, i kdyby měly stejné atributy.
   - Jakmile ve třídě implementujete vlastní `__eq__`, Python automaticky nastaví `__hash__ = None` (zneplatní hešování), dokud explicitně nedopíšete vlastní `__hash__`.

---
<!-- slide: id10, Náročnost operací (Asymptotická složitost), Core, basics -->
## Náročnost operací (Asymptotická složitost)

Vnitřní implementace CPythonu určuje časovou složitost operací:

| Operace | `list` / `tuple` / `str` | `set` / `frozenset` | `dict` (klíče) |
| :--- | :--- | :--- | :--- |
| Náhodný index / přístup ke klíči | $O(1)$ | — | $O(1)$ průměrně |
| Hledání prvku (`x in container`) | **$O(n)$** lineární scan | **$O(1)$** heš lookup | **$O(1)$** heš lookup |
| Přidání prvku na konec / vložení | $O(1)$ amortizovaně (`append`) | $O(1)$ (`add`) | $O(1)$ (`d[k] = v`) |
| Vložení / smazání na začátku/uprostřed | **$O(n)$** posun prvků v poli | $O(1)$ | $O(1)$ |

> [!NOTE] Pořadí prvků ve slovníku
> Od **Pythonu 3.7+** je garantováno, že `dict` zachovává pořadí vkládání prvků (*insertion order*) při zachování $O(1)$ přístupu díky kompaktní tabulce indexů.

---
<!-- slide: id11, Čísla v Pythonu, Core, basics -->
## Čísla v Pythonu

V jádře Pythonu máme 3 vestavěné číselné typy:

- `int` – celá čísla s **libovolnou přesností** (*arbitrary-precision integers*). Nedochází k přetečení jako u 32bit či 64bit integerů v C/C++ či Javě.
- `float` – 64bitové číslo s plovoucí řádovou čárkou dle standardu **IEEE 754** (odpovídá `double` v C).
- `complex` – dvojice čísel `float` (reálná a imaginární část).

Konstruktory bez argumentu vrací nulovou hodnotu příslušného typu:
```python
>>> int()
0
>>> float()
0.0
>>> complex()
0j
```

Pro finanční a přesné výpočty poskytuje standardní knihovna specializované moduly:
- `decimal.Decimal` (přesná desítková aritmetika)
- `fractions.Fraction` (přesné racionální zlomky)

---
<!-- slide: id12, Čísla – zápis literálů, Core, resyntax -->
## Čísla – zápis literálů

Čísla můžeme v kódu zapisovat v různých číselných soustavách a formátech:

```python
# Reálná čísla (float):
>>> 3.14
3.14
>>> 3.14e2    # 3.14 * 10^2
314.0
>>> 3.14e-2   # 3.14 * 10^-2
0.0314

# Celá čísla (int) v různých soustavách:
>>> 26        # Desítkově
26
>>> 0b11010   # Binárně (prefix 0b)
26
>>> 0x1A      # Hexadecimálně (prefix 0x)
26
>>> 0o32      # Oktalově (prefix 0o)
26

# Komplexní čísla (přípona j nebo J):
>>> z = 2 + 3j
>>> z.real, z.imag
(2.0, 3.0)
```

> [!TIP] Oddělovače řádů (PEP 515)
> V dlouhých číslech lze pro přehlednost používat podtržítka: `1_000_000` nebo `0xFF_AA_00_11`.

---
<!-- slide: id13, Čísla – převody a základy, Skip, resyntax -->
## Čísla – převody a základy

Převody mezi číselnými typy a parsování z řetězců:

```python
>>> float(1)
1.0
>>> int(1.9)       # Ořízne desetinnou část k nule (truncation)
1

>>> float('1.23')
1.23
>>> int('23')
23
```

> [!WARNING] Chyba při parsování
> Funkce `int()` neumí přímo naparsovat řetězec s desetinnou tečkou:
> ```python
> >>> int('1.23')
> ValueError: invalid literal for int() with base 10: '1.23'
> >>> int(float('1.23'))  # Nutno nejprve převést na float
> 1
> ```

Funkce `int()` umožňuje určit základ číselné soustavy (`base=2` až `36`):
```python
>>> int("ff", base=16)
255
>>> int("1010", base=2)
10
>>> int("77", base=8)
63
```

---
<!-- slide: id14, Řetězce vs. bajtové objekty, Core, newconcept -->
## Řetězce vs. bajtové objekty (`str` vs. `bytes`)

V Pythonu 3 je striktně oddělen text v paměti a surová binární data:

1. **`str` (textový řetězec)**:
   - Sekvence abstraktních znaků v kódování **Unicode**.
   - Iterací procházíme jednotlivé jednoznakové řetězce:
   ```python
   >>> for char in 'kůň':
   ...     print(char)
   k
   ů
   ň
   ```

2. **`bytes` (binární řetězec)**:
   - Neměnná sekvence celočíselných bajtů (hodnoty $0 \le x \le 255$).
   - Iterací procházíme celá čísla:
   ```python
   >>> for b in b'ahoj':
   ...     print(b)
   97   # ASCII kód pro 'a'
   104  # 'h'
   111  # 'o'
   106  # 'j'
   ```

---
<!-- slide: id15, Řetězce vs. bajtové objekty – kódování, Core, newconcept -->
## Řetězce vs. bajtové objekty – vzájemné převody

Převod mezi abstraktním textem (`str`) a binárními bajty (`bytes`) vyžaduje explicitní kódování:

$$\text{str} \xrightarrow{\text{.encode('utf-8')}} \text{bytes} \xrightarrow{\text{.decode('utf-8')}} \text{str}$$

```python
>>> s = '狼.cz'
>>> len(s)
4  # 4 znaky

# Různá kódování vytvoří různý počet bajtů:
>>> b_utf8 = s.encode('utf-8')
>>> b_utf8
b'\xe7\x8b\xbc.cz'
>>> len(b_utf8)
6  # Znak '狼' zabírá v UTF-8 přesně 3 bajty

# Zpětné dekódování na text:
>>> b_utf8.decode('utf-8')
'狼.cz'
```

> [!CAUTION] Vždy specifikujte kódování
> Nikdy se nespoléhejte na výchozí kódování operačního systému při práci se soubory. Vždy uvádějte `encoding="utf-8"`.

---
<!-- slide: id16, Řetězce vs. bajtové objekty – bajtová pole, WOW, pythonic -->
## Bajtová pole (`bytearray`)

Typy `str` i `bytes` jsou **neměnné** (*immutable*). Pro efektivní manipulaci s binárními daty bez nutnosti neustálého přealokování paměti slouží **`bytearray`**:

```python
# 'bytes' nelze modifikovat na místě:
>>> b = b'ahoj'
>>> b[1] = 72
TypeError: 'bytes' object does not support item assignment

# 'bytearray' je měnitelný (mutable) ekvivalent:
>>> ba = bytearray(b'ahoj')
>>> ba[1] = 72  # ASCII kód pro velké 'H'
>>> ba
bytearray(b'aHoj')
>>> ba.decode('ascii')
'aHoj'
```

Hešovatelnost:
- `bytes` je neměnný $\implies$ **je hešovatelný** (`hash(b'ahoj')`).
- `bytearray` je proměnný $\implies$ **není hešovatelný** (`TypeError: unhashable type: 'bytearray'`).

---
<!-- slide: id17, N-tice vs. seznamy (`tuple` vs. `list`), Tricky, resyntax -->
## N-tice vs. seznamy (`tuple` vs. `list`)

Ačkoliv se n-tice často popisují jen jako „neměnné seznamy“, v Pythonu mají odlišnou sémantiku:

| Vlastnost | `list` (seznam) | `tuple` (n-tice) |
| :--- | :--- | :--- |
| Mutabilita | Proměnný (*mutable*) | Neměnný (*immutable*) |
| Sémantika | Homogenní kolekce proměnné délky | Heterogenní záznam pevné struktury (např. bod `(x, y, z)`) |
| Výkon | Větší paměťová režie pro over-allocation | Kompaktní paměťová alokace, rychlejší vytvoření |

### Zápis jednoprvkové n-tice:
N-tici v Pythonu vytváří **čárka**, nikoli závorky:
```python
>>> t1 = (42)     # Pouhá závorka kolem čísla -> typ int!
>>> type(t1)
<class 'int'>

>>> t2 = (42,)    # Čárka vytváří tuple!
>>> type(t2)
<class 'tuple'>

>>> t3 = ()       # Prázdná n-tice je výjimka – píše se se závorkami
```

---
<!-- slide: id18, Hešovatelnost n-tic, Tricky, pythonic -->
## Hešovatelnost n-tic

Protože je `tuple` neměnný, může být hešovatelný a sloužit jako klíč ve slovníku či prvek v množině:

```python
>>> ts = (1, 2, 3)
>>> hash(ts)
529344067295497451
>>> d = {ts: "platný bod"}  # Bez problémů
```

> [!CAUTION] Pozor na vnořené proměnné objekty!
> `tuple` je hešovatelný **pouze tehdy, pokud jsou hešovatelné všechny jeho prvky**:
> ```python
> >>> xs = [1, 2, 3]
> >>> ts = (1, 2, xs)  # Tuple obsahuje mutable seznam
> >>> hash(ts)
> TypeError: unhashable type: 'list'
> ```
> Algoritmus výpočtu heše rekurzivně volá `hash()` na všechny prvky. Jakmile narazí na `list`, vyhodí výjimku.

---
<!-- slide: id19, N-tice jako argumenty funkcí, Skip, basics -->
## N-tice jako argumenty funkcí

Při volání funkcí je syntaxe závorek zásadní:

```python
# Zápis čárek bez závorek definuje více argumentů:
funkce(prvek1, prvek2, prvek3)
# -> Volá funkci se TŘEMI samostatnými argumenty

# Zápis s vnitřními závorkami:
funkce((prvek1, prvek2, prvek3))
# -> Volá funkci s JEDNÍM argumentem (kterým je jedna n-tice o 3 prvcích)
```

Typický příklad v grafických či matematických knihovnách:
```python
# pygame.draw.circle vyžaduje střed jako n-tici (x, y):
pygame.draw.circle(screen, color, (100, 200), radius)
```

---
<!-- slide: id20, Množiny a slovníky (`set` a `dict`), Tricky, resyntax -->
## Množiny a slovníky (`set` a `dict`)

Množiny lze koncepčně chápat jako slovníky, které mají pouze unikátní klíče bez přiřazených hodnot. Obě struktury jsou implementovány hešovací tabulkou s průměrnou složitostí vyhledávání $O(1)$.

Syntaxe složených závorek `{}`:
- `{}` vytvoří **prázdný slovník** (`dict`), nikoli množinu (historický úzus z doby před Pythonem 2.4).
- `set()` je jediný způsob, jak vytvořit **prázdnou množinu**.

```python
>>> type({})
<class 'dict'>

>>> type(set())
<class 'set'>

# Neprázdné literály se liší přítomností dvojtečky:
>>> s = {1, 2, 3}       # set
>>> d = {1: 'a', 2: 'b'} # dict
```

---
<!-- slide: id21, Množiny a slovníky – hešovatelnost, WOW, pythonic -->
## Neměnné množiny (`frozenset`)

Stejně jako existuje dvojice `list` (proměnný) a `tuple` (neproměnný), existuje u množin dvojice:
- `set` – proměnný, nehešovatelný.
- `frozenset` – **neproměnný, hešovatelný**.

```python
# Obyčejná množina nemůže být prvkem jiné množiny ani klíčem slovníku:
>>> { {1, 2}, {3, 4} }
TypeError: unhashable type: 'set'

# Zmrazená množina (frozenset) hešovatelná je:
>>> fs1 = frozenset({1, 2})
>>> fs2 = frozenset({3, 4})
>>> mnozina_mnozin = {fs1, fs2}  # Zcela v pořádku!
>>> hash(fs1)
-189688320498064972
```

---
<!-- slide: id22, Mazání slovníků a množin, Tricky, pythonic -->
## Mazání slovníků a množin: `clear()` vs. `{}`

Mezi příkazy `d.clear()` a `d = {}` je zásadní rozdíl v zacházení s pamětí a referencemi:

```python
# Mějme dvě proměnné ukazující na stejný slovník:
>>> d1 = d2 = {'a': 1, 'b': 2}

# Varianta A: Použití d1 = {}
>>> d1 = {}
>>> d1
{}
>>> d2
{'a': 1, 'b': 2}  # d2 stále ukazuje na původní slovník v paměti!
```

```python
# Mějme opět dvě reference:
>>> d1 = d2 = {'a': 1, 'b': 2}

# Varianta B: Použití d1.clear()
>>> d1.clear()
>>> d1
{}
>>> d2
{}  # d2 ukazuje na TÝŽ objekt, který byl na místě vyprázdněn!
```

> [!TIP] Doporučení
> Používejte `d.clear()`, pokud chcete vyprázdnit existující instanci sdílenou napříč funkcemi či objekty bez alokace nového objektu.

---
<!-- slide: id23, Rozsahy (`range`), Skip, basics -->
## Rozsahy (`range`)

Objekt `range` představuje neměnnou aritmetickou posloupnost celých čísel.

V Pythonu 3 je `range` líně vyhodnocovaný (*lazy*), zabírá fixní malé množství paměti bez ohledu na velikost rozsahu ($O(1)$ paměťová složitost):

```python
>>> r = range(1_000_000_000)  # Nezabere gigabajty paměti, pouze uloží start, stop, step!
>>> r[500]
500
```

> [!TIP] Rychlost operátoru `in` u `range`
> Operátor `in` u objektu `range` v moderním Pythonu 3 **neprochází prvky jeden po druhém**!
> Spočítá výsledek v čase **$O(1)$** pomocí matematického vzorce:
> $$\text{start} \le x < \text{stop} \quad \text{a} \quad (x - \text{start}) \pmod{\text{step}} == 0$$
> ```python
> >>> 999_999_999 in range(1_000_000_000)  # Okamžitá odpověď v O(1)!
> True
> ```

---
<!-- slide: id24, Vzájemné konverze typů, Core, basics -->
## Vzájemné konverze typů

Většinu iterovatelných kolekcí lze snadno převádět předáním do konstruktoru cílového typu:

```python
>>> text = 'python'

# Řetězec na tuple nebo list:
>>> tuple(text)
('p', 'y', 't', 'h', 'o', 'n')
>>> list(text)
['p', 'y', 't', 'h', 'o', 'n']

# Získání unikátních znaků množinou:
>>> set("abracadabra")
{'a', 'b', 'c', 'd', 'r'}

# Seznam dvojic (klíč, hodnota) na slovník:
>>> pary = [('a', 1), ('b', 2)]
>>> dict(pary)
{'a': 1, 'b': 2}
```

---
<!-- slide: id25, Složené typy a vícerozměrné indexování I, Skip, basics -->
## Složené typy I (Vnořené struktury)

Kontejnery v Pythonu mohou obsahovat jakékoliv jiné objekty. Při vícenásobném indexování se operátory `[]` vyhodnocují zleva doprava:

```python
ds = {
    1: [10, 20, 30],
    2: [40, 50, 60],
}

# Výběr prvku:
>>> ds[1]
[10, 20, 30]

>>> ds[1][2]
30
```

Rozpad kroků pro začátečníky:
1. `krok1 = ds[1]` $\implies$ získáme vnitřní seznam `[10, 20, 30]`.
2. `vysledek = krok1[2]` $\implies$ získáme prvek na indexu 2 (číslo `30`).

---
<!-- slide: id26, Složené typy a vícerozměrné indexování II, Skip, basics -->
## Složené typy II (Hluboké řetězení)

Princip zřetězeného přístupu funguje pro libovolné kombinace seznamů, n-tic, slovníků i řetězců do libovolné hloubky:

```python
data = [
    (1, 'první'),
    (2, 'druhý'),
    (3, 'třetí'),
]

# 1. Indexujeme vnější seznam (index 1 -> druhý prvek):
>>> data[1]
(2, 'druhý')

# 2. Indexujeme n-tici (index 1 -> druhý prvek n-tice):
>>> data[1][1]
'druhý'

# 3. Indexujeme textový řetězec (index 1 -> druhý znak řetězce):
>>> data[1][1][1]
'r'
```

---
<!-- slide: id27, Pozor na modifikaci kolekce během iterace, Tricky, pythonic -->
## Pozor na modifikaci kolekce během iterace

Častou chybou začátečníků je odebírání nebo přidávání prvků do seznamu, přes který právě běží `for` cyklus:

```python
# CHYBNÝ KÓD:
text = list("-----AHOJTE")

for znak in text:
    if znak == '-':
        text.remove(znak)

print(text)
# Výstup: ['-', '-', 'A', 'H', 'O', 'J', 'T', 'E']  <- Pomlčky zůstaly!
```

### Proč se to stalo?
Iterátor si interně pamatuje pouze celočíselný index (0, 1, 2...). Když prvek na indexu 0 smažete, všechny následující prvky se posunou doleva. V dalším kroku iterátor skočí na index 1, čímž přeskočí prvek, který se právě posunul na uvolněný index 0!

> [!TIP] Správné idiomatické řešení
> Místo modifikace na místě použijte **filtrování pomocí list comprehension**:
> ```python
> text = [znak for znak in text if znak != '-']
> ```
> Případně pokud opravdu musíte iterovat a modifikovat původní seznam, iterujte přes jeho **kopii**:
> ```python
> for znak in text[:]:
>     if znak == '-':
>         text.remove(znak)
> ```
