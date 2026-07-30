/**
 * 4-Level Python Checklist Data & Footguns Cheatsheet Data
 */

export const CHECKLIST_ITEMS = [
  // ── LEVEL 1: ESSENTIAL CORE (Základní syntaxe & Řízení běhu) ─────────────────
  {
    id: "l1-01",
    level: 1,
    levelTitle: "Úroveň 1 — Základní syntaxe & Řízení běhu",
    category: "Syntax & Variables",
    title: "Proměnné, dynamické typování a reference",
    badges: ["[CORE]", "[PRACTICE]"],
    relevance: 98,
    difficulty: "T1 L1",
    codeSnippet: `x = 42
y = x
x = "hello"  # y zůstává 42 (přebindování x; int je imutabilní)

a = [1, 2]
b = a
a.append(3)  # b je nyní [1, 2, 3] (sdílená reference na mutabilní objekt)`,
    footguns: [
      "Záměna přebindování proměnné (x = ...) s mutací objektu v paměti (a.append(...)).",
      "Předpoklad, že proměnné mají pevný datový typ (v Pythonu je typ navázán na objekt, nikoli na název proměnné)."
    ],
    selfTestQuestions: [
      "Co se stane s proměnnou y po provedení kódu `x = [1]; y = x; x.append(2)`?",
      "Jaký je rozdíl mezi imutabilním objektem (int, str, tuple) a mutabilním (list, dict) při předávání do funkcí?"
    ]
  },
  {
    id: "l1-02",
    level: 1,
    levelTitle: "Úroveň 1 — Základní syntaxe & Řízení běhu",
    category: "Types & Casting",
    title: "Primitivní datové typy (`int`, `float`, `bool`, `str`, `bytes`)",
    badges: ["[CORE]"],
    relevance: 95,
    difficulty: "T1 L2",
    codeSnippet: `val = "3.14"
f_val = float(val)
i_val = int(f_val)  # int("3.14") vyhodí ValueError!

flag = bool("")     # False pro prázdné řetězce/kolekce, True pro ostatní`,
    footguns: [
      "Přímé volání int(\"3.14\") vyhodí ValueError (musí se nejprve převést na float).",
      "Nepřesnost desetinné aritmetiky v float (např. 0.1 + 0.2 != 0.3).",
      "bool(\"False\") se vyhodnotí jako True, protože neprázdný řetězec je pravdivý (truthy)."
    ],
    selfTestQuestions: [
      "Proč bool(\"False\") vrátí True a jak správně parsovat boolean z uživatelského vstupu?",
      "Jak převést řetězec desetinného čísla \"4.5\" na celé číslo bez vyvolání výjimky?"
    ]
  },
  {
    id: "l1-03",
    level: 1,
    levelTitle: "Úroveň 1 — Základní syntaxe & Řízení běhu",
    category: "Control Flow",
    title: "Podmíněné příkazy `if`/`elif`/`else` a koncept Truthiness",
    badges: ["[CORE]", "[PRACTICE]"],
    relevance: 96,
    difficulty: "T1 L1",
    codeSnippet: `items = []
if not items:
    print("Prázdný seznam!")  # Implicitní truthiness (prázdný list je False)

x = 10
status = "positive" if x > 0 else "non-positive"  # Ternární výraz`,
    footguns: [
      "Explicitní porovnávání `if items == True:` místo idiomativního `if items:` nebo `if not items:`.",
      "Záměna `=` za `==` v podmínkách (v Pythonu 3.8+ se pro přiřazení v podmínce používá walrus operátor `:=`)."
    ],
    selfTestQuestions: [
      "Které hodnoty se v Pythonu vyhodnotí jako False v podmínkách (truthiness)?",
      "Zapište zkrácený ternární výraz pro vrácení absolutní hodnoty čísla x."
    ]
  },
  {
    id: "l1-04",
    level: 1,
    levelTitle: "Úroveň 1 — Základní syntaxe & Řízení běhu",
    category: "Control Flow",
    title: "Cykly `for` & `while`, `range()`, `enumerate()`, `zip()`",
    badges: ["[CORE]", "[INSIGHT]"],
    relevance: 98,
    difficulty: "T2 L2",
    codeSnippet: `names = ["Alice", "Bob", "Charlie"]
scores = [90, 85, 92]

for i, (name, score) in enumerate(zip(names, scores), start=1):
    print(f"{i}. {name}: {score}")`,
    footguns: [
      "Scope leakage: řídicí proměnná cyklu (i, name) zůstává v lokálním rozsahu i po skončení cyklu!",
      "Modifikace seznamu během jeho procházení for cyklem (způsobí přeskočení prvků nebo nekonečnou smyčku)."
    ],
    selfTestQuestions: [
      "Co se stane s proměnnou cyklu po dokončení for smyčky?",
      "Jak bezpečně odfiltrovat prvky ze seznamu během iterace bez modifikace původního pole?"
    ]
  },
  {
    id: "l1-05",
    level: 1,
    levelTitle: "Úroveň 1 — Základní syntaxe & Řízení běhu",
    category: "Functions",
    title: "Funkce `def`, návratové hodnoty a argumenty",
    badges: ["[CORE]", "[INSIGHT]"],
    relevance: 99,
    difficulty: "T2 L3",
    codeSnippet: `def greet(name, msg="Hello", *, debug=False):
    if debug:
        print(f"[DEBUG] Greet {name}")
    return f"{msg}, {name}!"

# Řešení mutabilního výchozího argumentu:
def append_to(element, target=None):
    if target is None:
        target = []
    target.append(element)
    return target`,
    footguns: [
      "Mutabilní výchozí argumenty: `def f(a=[])` sdílí stejnou instanci seznamu napříč všemi voláními!",
      "Opomenutí příkazu return způsobí, že funkce implicitně vrátí hodnotu None."
    ],
    selfTestQuestions: [
      "Vysvětlete, proč je `def add_item(item, box=[])` závažná chyba a jak ji správně opravit.",
      "Co vrátí funkce v Pythonu, pokud neobsahuje žádný příkaz return?"
    ]
  },
  {
    id: "l1-06",
    level: 1,
    levelTitle: "Úroveň 1 — Základní syntaxe & Řízení běhu",
    category: "Syntax & Strings",
    title: "Formátování řetězců (f-strings, `.format()`, `%`)",
    badges: ["[CORE]", "[PRACTICE]"],
    relevance: 95,
    difficulty: "T1 L2",
    codeSnippet: `val = 12.3456
pct = 0.854
print(f"Val: {val:.2f}, Pct: {pct:.1%}")
print(f"Padded: {42:05d}")  # "00042"

# Debug formátovací specifikátor (Python 3.8+):
x = 10
print(f"{x=}")  # "x=10"`,
    footguns: [
      "Escapování složených závorek v f-stringu vyžaduje zdvojení {{ a }}.",
      "Používání starého % formátování nebo spojování řetězců pomocí + v cyklech."
    ],
    selfTestQuestions: [
      "Jak pomocí f-stringu vypsat proměnnou x = 42 zarovnanou doprava na 8 míst s vodícími nulami?",
      "Jak v f-stringu vytisknout znak složené závorky {} bez vyvolání chyby syntaxe?"
    ]
  },

  // ── LEVEL 2: DATA STRUCTURES & PYTHONIC IDIOMS ──────────────────────────────
  {
    id: "l2-01",
    level: 2,
    levelTitle: "Úroveň 2 — Datové struktury & Pythonic Idiomy",
    category: "Data Structures",
    title: "Sekvenční typy `list` a `tuple` (Slicing, Unpacking)",
    badges: ["[CORE]", "[PRACTICE]"],
    relevance: 97,
    difficulty: "T2 L2",
    codeSnippet: `lst = [10, 20, 30, 40, 50]
rev = lst[::-1]         # Obrácený výřez [50, 40, 30, 20, 10]
first, *mid, last = lst # Rozbalení: 10, [20, 30, 40], 50

tup = (1,)  # Jednoprvková n-tice MUSÍ mít čárku na konci!`,
    footguns: [
      "Zápis `tup = (1)` vytvoří int, nikoli tuple! Čárka `(1,)` je povinná.",
      "Výřez (slicing) v Pythonu vytváří plytkou kopii (shallow copy), nikoli pohled (view) jako v NumPy."
    ],
    selfTestQuestions: [
      "Proč `x = (5)` není n-tice (tuple), ale `x = (5,)` ano?",
      "Co udělá příkaz `a, b = b, a` a jak v něm funguje rozbalení (unpacking)?"
    ]
  },
  {
    id: "l2-02",
    level: 2,
    levelTitle: "Úroveň 2 — Datové struktury & Pythonic Idiomy",
    category: "Data Structures",
    title: "Množiny (`set`) a Slovníky (`dict`) — O(1) vyhledávání",
    badges: ["[CORE]", "[INSIGHT]"],
    relevance: 98,
    difficulty: "T2 L3",
    codeSnippet: `d = {"a": 1, "b": 2}
val = d.get("c", 0)  # Bezpečný přístup s výchozí hodnotou

s1 = {1, 2, 3}
s2 = {3, 4, 5}
inter = s1 & s2      # Průnik {3}
diff = s1 - s2       # Rozdíl {1, 2}`,
    footguns: [
      "Klíče slovníku a prvky množiny MUSÍ být hashovatelné (imutabilní: int, str, tuple s hashovatelnými prvky). list nebo dict nelze použít jako klíč!",
      "Zápis `s = {}` vytvoří prázdný slovník (dict), NIKOLI prázdnou množinu (set)! Pro množinu použijte `s = set()`."
    ],
    selfTestQuestions: [
      "Jak vytvořit prázdnou množinu v Pythonu a proč zápis `s = {}` nefunguje?",
      "Jaká je průměrná časová složitost vyhledávání prvku v listu vs v setu a proč?"
    ]
  },
  {
    id: "l2-03",
    level: 2,
    levelTitle: "Úroveň 2 — Datové struktury & Pythonic Idiomy",
    category: "Pythonic Idioms",
    title: "Generátorové přehledy (Comprehensions) pro `list`, `dict`, `set`",
    badges: ["[MEGA EPIC]", "[CORE]", "[PRACTICE]"],
    relevance: 96,
    difficulty: "T2 L3",
    codeSnippet: `evens = [x**2 for x in range(10) if x % 2 == 0]
square_dict = {x: x**2 for x in range(5)}
unique_lens = {len(w) for w in ["apple", "banana", "cat", "apple"]}`,
    footguns: [
      "Přílišné zanořování generátorových přehledů (více než 2 úrovně) značně zhoršuje čitelnost kódu.",
      "Vytváření obřích list comprehensions v paměti místo použití generátorového výrazu `(x for x in ...)` s paměťovou složitostí O(1)."
    ],
    selfTestQuestions: [
      "Jaký je paměťový rozdíl mezi `[x for x in range(10**7)]` a `(x for x in range(10**7))`?",
      "Přepište dvojitý cyklus for s podmínkou do jednořádkového list comprehension."
    ]
  },
  {
    id: "l2-04",
    level: 2,
    levelTitle: "Úroveň 2 — Datové struktury & Pythonic Idiomy",
    category: "Input / Output",
    title: "Práce se soubory (`with open`) a kódování UTF-8",
    badges: ["[CORE]", "[PRACTICE]"],
    relevance: 94,
    difficulty: "T2 L2",
    codeSnippet: `with open("data.txt", "r", encoding="utf-8") as f:
    for line in f:  # Paměťově efektivní iterace po řádcích
        process(line.strip())`,
    footguns: [
      "Vynechání `encoding=\"utf-8\"` vede k chybám závislým na operačním systému (CP1252 na Windows vs UTF-8 na Linuxu).",
      "Nepoužití příkazu `with` zanechá otevřené souborové desktiptory v případě výjimky."
    ],
    selfTestQuestions: [
      "Proč je nutné při otevírání textových souborů explicitně uvádět `encoding=\"utf-8\"` na Windows?",
      "Co přesně zajistí blok `with open(...)` v případě vyhození výjimky při čtení?"
    ]
  },
  {
    id: "l2-05",
    level: 2,
    levelTitle: "Úroveň 2 — Datové struktury & Pythonic Idiomy",
    category: "Error Handling",
    title: "Ošetření výjimek (`try`/`except`/`else`/`finally`)",
    badges: ["[CORE]", "[INSIGHT]"],
    relevance: 95,
    difficulty: "T3 L3",
    codeSnippet: `try:
    val = int(raw_input)
except ValueError as err:
    print(f"Neplatné číslo: {err}")
else:
    print(f"Úspěch! Čtverec: {val**2}")  # Spustí se JEN pokud try nehodil výjimku
finally:
    cleanup()  # Spustí se VŽDY`,
    footguns: [
      "Prázdný odchyt `except:` zachytí i `KeyboardInterrupt` a `SystemExit`, což znemožní přerušení skriptu pomocí Ctrl+C!",
      "Tiché potlačování výjimek pomocí `except Exception: pass` bez logování."
    ],
    selfTestQuestions: [
      "Kdy se spustí větev `else` u příkazu `try`-`except`?",
      "Proč je nebezpečné používat prázdný blok `except:` bez specifikace typu výjimky?"
    ]
  },
  {
    id: "l2-06",
    level: 2,
    levelTitle: "Úroveň 2 — Datové struktury & Pythonic Idiomy",
    category: "Systems & CLI",
    title: "Zpracování argumentů příkazové řádky (`sys.argv`)",
    badges: ["[CORE]", "[PRACTICE]"],
    relevance: 90,
    difficulty: "T2 L2",
    codeSnippet: `import sys

if len(sys.argv) < 2:
    print(f"Použití: python {sys.argv[0]} <soubor>")
    sys.exit(1)

filename = sys.argv[1]`,
    footguns: [
      "`sys.argv[0]` obsahuje vždy název spouštěného skriptu, samotné argumenty začínají až na indexu 1.",
      "Všechny položky v `sys.argv` jsou řetězce (str) — číselné hodnoty je nutné explicitně přetypovat pomocí `int()` nebo `float()`."
    ],
    selfTestQuestions: [
      "Co obsahuje `sys.argv[0]` při spuštění skriptu `python app.py foo bar`?",
      "Jak bezpečně ověřit dostatečný počet předaných argumentů v `sys.argv` před přístupem k nim?"
    ]
  },

  // ── LEVEL 3: ADVANCED MECHANICS & OOP ───────────────────────────────────────
  {
    id: "l3-01",
    level: 3,
    levelTitle: "Úroveň 3 — Pokročilé mechaniky & OOP",
    category: "OOP",
    title: "Třídy, objekty, `self`, `__init__` a atributy",
    badges: ["[CORE]", "[PRACTICE]"],
    relevance: 96,
    difficulty: "T3 L3",
    codeSnippet: `class BankAccount:
    def __init__(self, owner: str, balance: float = 0.0):
        self.owner = owner
        self.balance = balance  # Instanční atribut

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Částka musí být kladná")
        self.balance += amount`,
    footguns: [
      "Opomenutí `self` jako prvního parametru metod třídy.",
      "Definování mutabilních třídních atributů (`class Student: grades = []`), které jsou sdíleny napříč VŠEMI instancemi!"
    ],
    selfTestQuestions: [
      "Jaký je zásadní rozdíl mezi atributem definovaným jako `class X: items = []` a atributem `self.items = []` v `__init__`?",
      "Proč musí být `self` prvním parametrem metod třídy v Pythonu?"
    ]
  },
  {
    id: "l3-02",
    level: 3,
    levelTitle: "Úroveň 3 — Pokročilé mechaniky & OOP",
    category: "OOP & Protocols",
    title: "Magické metody (Dunder methods: `__str__`, `__repr__`, `__len__`, `__getitem__`)",
    badges: ["[MEGA EPIC]", "[INSIGHT]"],
    relevance: 94,
    difficulty: "T3 L4",
    codeSnippet: `class Deck:
    def __init__(self, cards):
        self._cards = list(cards)

    def __len__(self):
        return len(self._cards)

    def __getitem__(self, position):
        return self._cards[position]

    def __repr__(self):
        return f"Deck({self._cards!r})"`,
    footguns: [
      "`__str__` slouží pro uživatelsky čitelný výstup (`print(obj)`), zatímco `__repr__` pro jednoznačnou vývojářskou inspekci (`repr(obj)`). Pokud `__str__` chybí, použije se `__repr__`.",
      "Implementace `__getitem__` bez ošetření záporných indexů nebo výřezů (slicing) při obalování vlastních struktur."
    ],
    selfTestQuestions: [
      "Které magické metody umožní vlastní třídě fungovat s funkcí `len()` a zápisem `obj[i]`?",
      "Jaký je přesný rozdíl mezi `__str__` a `__repr__`?"
    ]
  },
  {
    id: "l3-03",
    level: 3,
    levelTitle: "Úroveň 3 — Pokročilé mechaniky & OOP",
    category: "Protocols & Iteration",
    title: "Protokol iterátorů a iterovatelných objektů (`__iter__`, `__next__`)",
    badges: ["[INSIGHT]", "[CHALLENGE]"],
    relevance: 91,
    difficulty: "T4 L4",
    codeSnippet: `class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        val = self.current
        self.current -= 1
        return val`,
    footguns: [
      "Iterátor se při průchodu vyčerpá! Jakmile vyhodí `StopIteration`, opakovaná iterace vrátí prázdný výsledek, pokud `__iter__` nevytváří novou instanci iterátoru.",
      "Zapomenutí vyhození `StopIteration` v metodě `__next__` způsobuje nekonečnou smyčku ve for cyklu."
    ],
    selfTestQuestions: [
      "Jaký je rozdíl mezi *iterable* (iterovatelným objektem) a *iterator* (iterátorem)?",
      "Co se stane, pokud zavoláte `next()` na iterátoru, který již vyčerpal všechny své prvky?"
    ]
  },
  {
    id: "l3-04",
    level: 3,
    levelTitle: "Úroveň 3 — Pokročilé mechaniky & OOP",
    category: "Advanced Mechanics",
    title: "Generátorové funkce a příkaz `yield`",
    badges: ["[MEGA EPIC]", "[INSIGHT]", "[PRACTICE]"],
    relevance: 96,
    difficulty: "T3 L4",
    codeSnippet: `def fibonacci(limit):
    a, b = 0, 1
    while a < limit:
        yield a
        a, b = b, a + b

gen = fibonacci(100)
for val in gen:
    print(val, end=" ")`,
    footguns: [
      "Zavolání generátorové funkce (`gen = fibonacci(100)`) spustí funkci až ve chvíli, kdy se z generátoru poprvé požádá hodnota přes `next()` nebo for cyklus!",
      "Generátor lze projít pouze jednou. Pokus o druhý for cyklus nad stejnou instancí generátoru nic nevyleje."
    ],
    selfTestQuestions: [
      "Proč generátor s `yield` spotřebuje nesrovnatelně méně paměti než vrácení kompletního seznamu (`return list`)?",
      "Co se stane, pokud se pokusíte projít stejný generátor dvakrát za sebou?"
    ]
  },
  {
    id: "l3-05",
    level: 3,
    levelTitle: "Úroveň 3 — Pokročilé mechaniky & OOP",
    category: "Meta-Programming",
    title: "Dekorátory `@functools.wraps` a obalování funkcí",
    badges: ["[MEGA EPIC]", "[INSIGHT]", "[CHALLENGE]"],
    relevance: 93,
    difficulty: "T4 L4",
    codeSnippet: `import functools
import time

def timer_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        res = func(*args, **kwargs)
        dt = time.perf_counter() - t0
        print(f"[TIMER] {func.__name__} trval {dt:.4f}s")
        return res
    return wrapper

@timer_decorator
def compute(n):
    return sum(i*i for i in range(n))`,
    footguns: [
      "Opomenutí `@functools.wraps(func)` uvnitř dekorátoru smaže původní `__name__`, `__doc__` a signaturu dekorované funkce!",
      "Dekorátory s vlastními argumenty vyžadují 3 úrovně zanořených funkcí (`def outer(arg): def decorator(func): def wrapper(...)`)."
    ],
    selfTestQuestions: [
      "Proč je při psaní dekorátoru nutné použít `@functools.wraps(func)`?",
      "Jak zkonstruovat dekorátor, který sám přijímá konfiguraci/argumenty (např. `@repeat(num_times=3)`)?"
    ]
  },
  {
    id: "l3-06",
    level: 3,
    levelTitle: "Úroveň 3 — Pokročilé mechaniky & OOP",
    category: "Advanced Mechanics",
    title: "Kontextové manažery (`__enter__`/`__exit__` & `contextlib`)",
    badges: ["[INSIGHT]", "[PRACTICE]"],
    relevance: 92,
    difficulty: "T3 L4",
    codeSnippet: `from contextlib import contextmanager

@contextmanager
def managed_resource(name):
    print(f"Získávám {name}")
    try:
        yield f"Resource({name})"
    finally:
        print(f"Uvolňuji {name}")

with managed_resource("DB_CONN") as res:
    print(f"Používám {res}")`,
    footguns: [
      "Vrácení `True` z metody `__exit__` potlačí jakoukoli výjimku vyhozenou uvnitř bloku `with`!",
      "U `@contextmanager` kód ve větví `finally:` MUSÍ ošetřit uvolnění zdrojů i při vyhození výjimky během `yield`."
    ],
    selfTestQuestions: [
      "Jak v metodě `__exit__(self, exc_type, exc_val, exc_tb)` potlačit výjimku a jak ji nechat propadnout dále?",
      "Přepište vlastní třídní kontextový manažer na funkci pomocí `@contextmanager`."
    ]
  },

  // ── LEVEL 4: SPECIALIZED SYSTEMS, ALGORITHMS & LIBRARIES ──────────────────────
  {
    id: "l4-01",
    level: 4,
    levelTitle: "Úroveň 4 — Specializované systémy, Algoritmy & Knihovny",
    category: "Scientific Computing",
    title: "NumPy — Broadcasting, vektorizace a slicing matic",
    badges: ["[MEGA EPIC]", "[CORE]", "[CHALLENGE]"],
    relevance: 95,
    difficulty: "T4 L4",
    codeSnippet: `import numpy as np

# Broadcasting: matice (3, 3) + řádkový vektor (3,)
arr = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
row_vec = np.array([10, 20, 30])
res = arr + row_vec  # Přičte row_vec ke každému řádku

# Slicing & Views vs Copies:
sub = arr[:2, 1:]    # Pohled (view) na původní pole!
sub[0, 0] = 999      # Změní i původní arr[0, 1]!`,
    footguns: [
      "Výřez v NumPy vytváří pohled (view) na sdílenou paměť, NIKOLI kopii! Změna ve výřezu změní původní matici. Pro nezávislou kopii použijte `.copy()`.",
      "Používání standardních Python for cyklů nad NumPy poli degraduje výkon na úroveň čistého Pythonu (vždy preferujte vektorované ufunc operace)."
    ],
    selfTestQuestions: [
      "Jaký je zásadní rozdíl mezi výřezem (slicing) standardního Python listu a NumPy ndarray?",
      "Jak fungují pravidla pro broadcasting u dvou polí s tvary (4, 1, 5) a (3, 5)?"
    ]
  },
  {
    id: "l4-02",
    level: 4,
    levelTitle: "Úroveň 4 — Specializované systémy, Algoritmy & Knihovny",
    category: "Image & Signal Processing",
    title: "Obrázky v Pillow — Pixel-level operace & Formáty PNM/PBM/PGM/PPM",
    badges: ["[INSIGHT]", "[PRACTICE]"],
    relevance: 88,
    difficulty: "T3 L4",
    codeSnippet: `from PIL import Image

# Vytvoření 100x100 RGB obrázku a přímá úprava pixelů
img = Image.new("RGB", (100, 100), color="white")
pixels = img.load()

for x in range(100):
    for y in range(100):
        if (x + y) % 2 == 0:
            pixels[x, y] = (0, 0, 0)  # Černý pixel

img.save("checkerboard.png")`,
    footguns: [
      "Souřadnice pixelů v Pillow jsou `(x, y)` kde `x` je sloupec (šířka) a `y` je řádek (výška), což je otočené oproti maticovému indexování `[row, col]`.",
      "Módy barevných kanálů: \"RGB\" n-tice `(R,G,B)` vs \"L\" stupně šedi single int `0-255` vs \"1\" binární `0/1`."
    ],
    selfTestQuestions: [
      "Jak se liší souřadnicový systém `pixels[x, y]` u Pillow od maticového indexování `arr[row, col]`?",
      "Jak převést RGB obrázek na stupně šedi (\"L\") a extrahovat pole bajtů?"
    ]
  },
  {
    id: "l4-03",
    level: 4,
    levelTitle: "Úroveň 4 — Specializované systémy, Algoritmy & Knihovny",
    category: "Security & Cryptography",
    title: "Kryptografie — Klasické šifry (Césarova & Vigenèrova šifra)",
    badges: ["[INSIGHT]", "[CHALLENGE]"],
    relevance: 85,
    difficulty: "T3 L3",
    codeSnippet: `def caesar_cipher(text: str, shift: int) -> str:
    result = []
    for char in text:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            shifted = (ord(char) - base + shift) % 26 + base
            result.append(chr(shifted))
        else:
            result.append(char)
    return "".join(result)`,
    footguns: [
      "Záporný posun v modulární aritmetice: operátor `%` v Pythonu správně vrací kladný zbytek i pro záporná čísla (např. `-3 % 26 == 23`), na rozdíl od C/C++!",
      "Zachování neabecedních znaků (mezery, interpunkce) a velikosti písmen při šifrování."
    ],
    selfTestQuestions: [
      "Jak se chová operátor `%` v Pythonu při záporném čitateli (např. `-5 % 26`) a jak v C++?",
      "Jak implementovat Vigenèrovu šifru pomocí generátoru pro opakování klíče (`itertools.cycle`)?"
    ]
  },
  {
    id: "l4-04",
    level: 4,
    levelTitle: "Úroveň 4 — Specializované systémy, Algoritmy & Knihovny",
    category: "Algorithms & Simulations",
    title: "Simulace — Monte Carlo, Brownův pohyb a Conwayova Hra života",
    badges: ["[MEGA EPIC]", "[INSIGHT]", "[CHALLENGE]"],
    relevance: 90,
    difficulty: "T4 L5",
    codeSnippet: `import random

def monte_carlo_pi(samples: int = 1_000_000) -> float:
    inside = 0
    for _ in range(samples):
        x = random.random()  # [0.0, 1.0)
        y = random.random()
        if x*x + y*y <= 1.0:
            inside += 1
    return 4.0 * inside / samples`,
    footguns: [
      "Používání modulu `random` pro kryptografické účely (použijte modul `secrets`).",
      "V Conwayově Hře života: úprava buněk matice přímo během výpočtu sousedů (musí se počítat na oddělené matici nebo kopii, aby nedošlo k poškození stavu generation!)."
    ],
    selfTestQuestions: [
      "Proč je při simulaci Conwayovy Hry života nutné vytvářet novou matici stavů místo úpravy téže matice za běhu?",
      "Jak odhadnout číslo Pi pomocí Monte Carlo simulace a jaká je přesnost v závislosti na počtu vzorků?"
    ]
  },
  {
    id: "l4-05",
    level: 4,
    levelTitle: "Úroveň 4 — Specializované systémy, Algoritmy & Knihovny",
    category: "Data Processing & Parsing",
    title: "Bioinformatika — Parser a generátor formátů FASTA & FASTQ",
    badges: ["[INSIGHT]", "[PRACTICE]"],
    relevance: 87,
    difficulty: "T3 L4",
    codeSnippet: `def parse_fasta(filepath):
    sequences = {}
    current_id = None
    current_seq = []

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith(">"):
                if current_id:
                    sequences[current_id] = "".join(current_seq)
                current_id = line[1:].split()[0]
                current_seq = []
            elif current_id:
                current_seq.append(line)
        if current_id:
            sequences[current_id] = "".join(current_seq)
    return sequences`,
    footguns: [
      "Sekvence ve FASTA mohou být rozděleny na více řádků! Spojování řetězců pomocí `+` v cyklu má časovou složitost O(N^2); ukládání řádků do `list` a následný `\"\".join()` má O(N).",
      "Zpracování formátu FASTQ vyžaduje přesné seskupování po 4 řádcích (Hlavička `@`, Sekvence, Separátor `+`, Skóre kvality)."
    ],
    selfTestQuestions: [
      "Proč je spojování řádků sekvence do seznamu a `\"\".join()` mnohem efektivnější než `seq += line`?",
      "Jaká je struktura jedné čtecí jednotky ve formátu FASTQ (4 řádky)?"
    ]
  }
];

export const FOOTGUN_ITEMS = [
  {
    name: "1. Mutable Default Arguments",
    cppExpectation: `def add(item, lst=[]):`,
    pythonSolution: `def add(item, lst=None):
    if lst is None:
        lst = []`,
    explanation: "Default argument expressions are evaluated once when the function definition is executed, creating a single shared object across all invocations.",
    severity: "HIGH"
  },
  {
    name: "2. Modifying List while Iterating",
    cppExpectation: `for x in nums:
    if x < 0:
        nums.remove(x)`,
    pythonSolution: `nums = [x for x in nums if x >= 0]`,
    explanation: "Modifying a list during `for` iteration shifts array indices, causing elements to be silently skipped or bounds corrupted.",
    severity: "HIGH"
  },
  {
    name: "3. 'is' vs '==' Comparison",
    cppExpectation: `if name is "Alice":`,
    pythonSolution: `if name == "Alice":`,
    explanation: "`is` checks object identity (memory address id()), while `==` checks value equality. Python interning makes `is` randomly pass for small ints/strings but fail for dynamically created strings.",
    severity: "HIGH"
  },
  {
    name: "4. Scope Leakage in Loops",
    cppExpectation: `for i in range(5):
    pass
print(i)  # Prints 4!`,
    pythonSolution: `# Keep loop variables isolated
# or delete explicitly:
del i`,
    explanation: "Loop variables in Python `for` loops leak into the enclosing function or global scope and persist after loop termination.",
    severity: "MEDIUM"
  },
  {
    name: "5. NumPy Slice View Mutation",
    cppExpectation: `sub = arr[:2]
sub[0] = 999  # Mutates arr!`,
    pythonSolution: `sub = arr[:2].copy()
sub[0] = 999  # Safe independent copy`,
    explanation: "Slicing NumPy `ndarray` returns a memory view sharing data with the original array. Modifying `sub` mutates the original matrix!",
    severity: "HIGH"
  },
  {
    name: "6. Bare 'except:' Exception Catch",
    cppExpectation: `try:
    do_work()
except:
    pass`,
    pythonSolution: `try:
    do_work()
except Exception as e:
    logger.error(e)`,
    explanation: "Bare `except:` catches `BaseException`, including `KeyboardInterrupt` (Ctrl+C) and `SystemExit`, freezing or masking application termination.",
    severity: "CRITICAL"
  },
  {
    name: "7. String Concatenation in Loops",
    cppExpectation: `res = ""
for s in lines:
    res += s`,
    pythonSolution: `res = "".join(lines)`,
    explanation: "Immutable string concatenation with `+=` creates a new string object on every step (O(N^2) time complexity), whereas `join()` allocates memory once (O(N)).",
    severity: "MEDIUM"
  }
];
