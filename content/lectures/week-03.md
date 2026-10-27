<!-- slide: id=id1 title="Úvod a osnova" tags=Core diff=basics -->
# Úvod a osnova

Vítejte ve třetí přednášce kurzu programování v jazyce Python. Dnešním tématem jsou sekvenční datové struktury — základní stavební kameny pro organizaci, transformaci a zpracování kolekcí dat.

### Osnova dnešní 90minutové přednášky:
1. **Architektura sekvencí**: C/Java paměťový model (souvislá homogenní pole) vs. CPython heterogenní pole ukazatelů.
2. **Sekvenční protokol**: Společné operátory `in`, `+`, `*`, `len()`, `min()`, `max()` a indexace.
3. **N-tice (`tuple`)**: Neměnný sekvenční záznam, interní paměťové výhody a syntaktická past s čárkou `(1,)`.
4. **Rozbalování (Unpacking)**: Paralelní přiřazení a rozšířené rozbalení s hvězdičkou `*rest`.
5. **Řezy (Slicing) v plné šíři**: Syntax `[start:stop:step]`, inverzní procházení a mutace řezů (`s[1:4] = [...]`).
6. **Dynamické seznamy (`list`)**: Růstová strategie CPythonu (over-allocation) a amortizované $O(1)$ vkládání.
7. **Složitost operací**: Proč je `append()` $O(1)$, ale `insert(0)` a `remove()` $O(n)$.
8. **Reference a kopírování**: Past mělkých kopií, šachovnicová past `[[0]*3]*3` a modul `copy`.
9. **Algoritmus Timsort & Powersort**: Stabilní hybridní řazení, `list.sort()` vs. `sorted()`, klíče `key=` a modul `operator`.
10. **Produkční most**: Efektivní fronta `collections.deque` a typované neměnné záznamy `typing.NamedTuple`.

---

<!-- slide: id=id2 title="C/Java vs. Python: Paměťový model polí" tags=Core diff=paradigm -->
# C/Java vs. Python: Paměťový model polí

V kompilovaných jazycích představuje pole **souvislý blok paměti**, kde jsou prvky stejného primitivního typu uloženy těsně za sebou:

```plain
[ C / C++ int arr[4] ]
  Paměť: [ 10 ][ 20 ][ 30 ][ 40 ]  ──> Souvislý blok 4 × 4 B = 16 bajtů.
  arr[i] = BaseAddress + i * sizeof(int)  ──> Přímá adresace bleskovým výpočtem O(1).
  Omezení: Fixní velikost, striktně jediný datový typ.

[ Java ArrayList<Integer> ]
  Paměť: [ ptr ][ ptr ][ ptr ][ ptr ]  ──> Souvislé pole 64bitových referencí.
  Každý ptr ukazuje na samostatný heap objekt Integer (boxing overhead).

[ CPython list ]
  Paměť: PyListObject obsahuje pointer na pole PyObject*.
  Prvky jsou libovolné heterogenní objekty (číslo, string, jiný seznam, funkce)!
```

### Proč Python nepoužívá souvislá primitivní pole ve standardním seznamu?
* **Dynamické typování**: Python předem nezná velikost ukládaných prvků.
* **Univerzálnost**: Do jednoho seznamu můžete uložit int, float, text i vlastní objekt.
* **Cena za flexibilitu**: Přístup k datům vyžaduje dvojí dereferenci pointeru a alokaci hlaviček `PyObject`.

---

<!-- slide: id=id3 title="Heterogenní pole ukazatelů pod kapotou" tags=Core diff=paradigm -->
# Heterogenní pole ukazatelů pod kapotou

Prozkoumejme, jak vypadá `list` přímo ve zdrojovém kódu CPythonu (`Include/cpython/listobject.h`):

```c
typedef struct {
    PyObject_VAR_HEAD
    PyObject **ob_item;      /* Ukazatel na dynamické C pole ukazatelů */
    Py_ssize_t allocated;    /* Celková alokovaná kapacita slotů */
} PyListObject;
```

```python
polozky = [42, "bioinformatika", 3.14, True]
```

```plain
PyListObject
 ├── ob_refcnt = 1
 ├── ob_type = &PyList_Type
 ├── ob_size = 4             (aktuální počet prvků)
 ├── allocated = 4          (kapacita C pole)
 └── ob_item ──► [ ptr_0 ] ──► PyLongObject (42)
                 [ ptr_1 ] ──► PyUnicodeObject ("bioinformatika")
                 [ ptr_2 ] ──► PyFloatObject (3.14)
                 [ ptr_3 ] ──► PyBoolObject (True)
```

> [!NOTE]
> Samotný `PyListObject` neobsahuje data, ale pouze **ukazatele na existující objekty v paměti**. Když přiřadíte prvek do seznamu, pouze se inkrementuje `ob_refcnt` daného objektu.

---

<!-- slide: id=id4 title="Jednotný sekvenční protokol" tags=Core diff=basics -->
# Jednotný sekvenční protokol (The Sequence Protocol)

Python definuje formální protokol, který sdílejí všechny sekvenční kontejnery: `str`, `tuple`, `list`, `range`, `bytes`.

```python
s = [10, 20, 30, 40, 50]

# 1. Dotaz na délku a výskyt:
print(len(s))       # 5  (volá s.__len__(), O(1) - hodnota je uložena v ob_size)
print(30 in s)      # True (volá s.__contains__(), sekvenční průchod O(n))
print(99 not in s)  # True

# 2. Zřetězení a násobení (vytváří VŽDY novou instanci):
spojeno = s + [60, 70]   # [10, 20, ..., 70]
opakovano = [0] * 4      # [0, 0, 0, 0]

# 3. Agregace a extrémy:
print(min(s))       # 10
print(max(s))       # 50
print(sum(s))       # 150

# 4. Hledání indexu a počítání výskytů:
print(s.index(30))  # 2  (ValueError pokud prvek neexistuje)
print(s.count(20))  # 1
```

---

<!-- slide: id=id5 title="N-tice (tuple): Neměnnost a paměťová optimalizace" tags=Core diff=basics -->
# N-tice (tuple): Neměnný sekvenční záznam

Objekt typu `tuple` je neměnná (immutable) sekvence hodnot.

```python
bod = (10, 20, 30)
# bod[0] = 99  # TypeError: 'tuple' object does not support item assignment
```

### Proč používat tuple místo listu?
1. **Sémantický význam**: `tuple` reprezentuje heterogenní **záznam** (např. souřadnice `(x, y, z)`, řádek databáze `(id, jmeno, email)`). `list` reprezentuje homogenní kolekci položek stejného druhu.
2. **Hešovatelnost**: Pokud `tuple` obsahuje pouze neměnné prvky, je hešovatelný a může sloužit jako klíč ve slovníku `dict` nebo prvek v množině `set`.
3. **Výkon a paměť**: CPython nepotřebuje u `tuple` alokovat rezervní kapacitu. `tuple` je paměťově menší a jeho vytvoření je rychlejší díky interní vyrovnávací paměti (free list).

```python
import sys
print(sys.getsizeof((1, 2, 3, 4)))   # 72 bajtů
print(sys.getsizeof([1, 2, 3, 4]))   # 120 bajtů (overhead pro dynamické přidávání)
```

---

<!-- slide: id=id6 title="Syntaktická past: Čárka tvoří tuple, nikoliv závorky" tags=Core diff=tricky -->
# Syntaktická past: Čárka tvoří tuple, nikoliv závorky!

Mnoho začátečníků se domnívá, že n-tici definují kulaté závorky `(...)`. Ve skutečnosti n-tici tvoří **čárka `,`**!

```python
# 1. Co je tohle?
a = (42)
print(type(a))  # <class 'int'> ! Pouhé uzávorkování výrazu!

# 2. Jak vytvořit jednoprvkový tuple?
b = (42,)
print(type(b))  # <class 'tuple'>
print(len(b))   # 1

# 3. Tuple bez závorek (Tuple Packing):
c = 1, 2, 3
print(type(c))  # <class 'tuple'>
print(c)        # (1, 2, 3)

# 4. Jediná výjimka, kde jsou závorky povinné:
prazdny = ()    # Prázdný tuple (nemá prvky, tedy ani čárku)
print(len(prazdny))  # 0
```

> [!WARNING]
> Zapomenutá čárka na konci řádku vytvoří z běžného čísla nebo řetězce n-tici: `x = 5,` způsobí, že `x` je `(5,)`, což vede k těžko odhalitelným chybám v matematických výpočtech!

---

<!-- slide: id=id7 title="Rozbalování sekvencí (Tuple Unpacking)" tags=Core diff=basics -->
# Rozbalování sekvencí (Tuple Unpacking)

Python umožňuje rozbalit libovolnou sekvenci do samostatných proměnných v jediném kroku:

```python
# Paralelní přiřazení:
souradnice = (50.087, 14.421)
lat, lon = souradnice
print(f"Zeměpisná šířka: {lat}, délka: {lon}")
```

### Prohození hodnot bez pomocné proměnné:
V C/C++ a Javě vyžaduje prohození dvou proměnných dočasnou proměnnou `tmp`:
```c
// C / Java:
int tmp = a;
a = b;
b = tmp;
```

V Pythonu je to idiom na jediném řádku:
```python
a, b = b, a  # Na pravé straně se vytvoří tuple (b, a) a na levé straně se rozbalí!
```

Počet proměnných na levé straně musí přesně odpovídat délce sekvence:
```python
x, y = (1, 2, 3)  # ValueError: too many values to unpack (expected 2)
```

---

<!-- slide: id=id8 title="Hvězdičková syntaxe: Extended Unpacking (*rest)" tags=Core diff=newconcept -->
# Hvězdičková syntaxe: Extended Unpacking (*rest)

Od standardu PEP 3132 můžete použít operátor `*` pro zachycení libovolného zbývajícího počtu prvků do samostatného seznamu:

```python
hodnoty = [10, 20, 30, 40, 50, 60]

# 1. První prvek a zbytek:
prvni, *zbytek = hodnoty
print(prvni)   # 10
print(zbytek)  # [20, 30, 40, 50, 60] (vždy typu list!)

# 2. První, prostředek a poslední prvek:
start, *stred, konec = hodnoty
print(start)  # 10
print(stred)  # [20, 30, 40, 50]
print(konec)  # 60

# 3. Zahazování nepotřebných hodnot konvencí podtržítka _:
hlavicka, *_, paticka = hodnoty
```

> [!NOTE]
> V jednom přiřazení smí být nejvýše jeden výraz s hvězdičkou `*`. Konstrukce `*a, *b = hodnoty` je syntaktická chyba `SyntaxError: two starred expressions in assignment`.

---

<!-- slide: id=id9 title="Protokol řezů (Slicing): [start:stop:step]" tags=Core diff=basics -->
# Protokol řezů (Slicing): [start:stop:step]

Řez (slice) extrahuje vybranou podmnožinu prvků v polouzavřeném intervalu `[start, stop)`:

$$\text{indexy} = \{ \text{start} + k \cdot \text{step} \mid 0 \le k < \frac{\text{stop} - \text{start}}{\text{step}} \}$$

```python
data = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]

print(data[2:6])      # [20, 30, 40, 50] (od indexu 2 do 5)
print(data[:4])       # [0, 10, 20, 30]  (výchozí start = 0)
print(data[6:])       # [60, 70, 80, 90] (výchozí stop = len(data))
print(data[1:8:2])    # [10, 30, 50, 70] (každý druhý prvek)
```

```plain
Indexy:     0     1     2     3     4     5     6     7     8     9
Prvky:    [10]  [20]  [30]  [40]  [50]  [60]  [70]  [80]  [90] [100]
Záporné:  -10    -9    -8    -7    -6    -5    -4    -3    -2    -1
```

### Proč jsou intervaly polouzavřené `[start, stop)`?
* **Délka řezu**: Počet prvků je jednoduše $\text{stop} - \text{start}$ (např. `data[2:6]` má $6 - 2 = 4$ prvky).
* **Bezešvé rozdělení**: `data[:k]` a `data[k:]` rozdělí sekvenci na dvě části bez překryvu a bez mezery.

---

<!-- slide: id=id10 title="Pokročilé triky s řezy: Krok, obrácení a slice objekt" tags=Core diff=tricky -->
# Pokročilé triky s řezy: Krok, obrácení a slice objekt

### 1. Záporný krok a obrácení sekvence:
Když je `step` záporný, sekvence se prochází pozpátku:

```python
cisla = [1, 2, 3, 4, 5]
print(cisla[::-1])     # [5, 4, 3, 2, 1] (obrácený seznam!)
print(cisla[4:1:-1])   # [5, 4, 3] (od indexu 4 k indexu 2)
```

### 2. Klonování seznamu pomocí [:]:
```python
kopie = cisla[:]       # Vytvoří nový nezávislý mělký seznam
```

### 3. Samostatný objekt typu slice:
Věděli jste, že operátor `s[a:b:c]` je pouze syntaktický cukr pro `s[slice(a, b, c)]`?

```python
# Pojmenované řezy pro čtení pevných datových vět:
ZAZNAM = "ID120485Jan       Novak     25.40"

POLE_ID = slice(0, 8)
POLE_JMENO = slice(8, 26)
POLE_HODNOTA = slice(26, None)

print(ZAZNAM[POLE_ID])       # 'ID120485'
print(ZAZNAM[POLE_JMENO].strip())   # 'Jan       Novak'
print(float(ZAZNAM[POLE_HODNOTA]))  # 25.4
```

---

<!-- slide: id=id11 title="Zápis do řezu (Slice Assignment) a mazání" tags=Core diff=newconcept -->
# Zápis do řezu (Slice Assignment) a mazání prvků

Řezy v seznamech neslouží pouze pro čtení — můžete do nich i **přiřazovat**:

```python
s = [10, 20, 30, 40, 50]

# 1. Nahrazení úseku (může změnit délku seznamu!):
s[1:4] = [99, 100]
print(s)  # [10, 99, 100, 50]

# 2. Vložení prvků bez mazání na konkrétní pozici:
s[2:2] = [777, 888]
print(s)  # [10, 99, 777, 888, 100, 50]

# 3. Vymazání úseku pomocí přiřazení prázdného seznamu:
s[1:3] = []
print(s)  # [10, 888, 100, 50]

# 4. Mazání každého druhého prvku operátorem del:
del s[::2]
print(s)  # [888, 50]
```

> [!WARNING]
> Pokud má řez krok různý od 1 (`step != 1`), musí přiřazovaná sekvence mít **přesně stejný počet prvků** jako cílový řez:
> `s[::2] = [1, 2, 3]` selže s `ValueError`, pokud délka neodpovídá!

---

<!-- slide: id=id12 title="Dynamický seznam (list): Paměťový růst v CPythonu" tags=Core diff=paradigm -->
# Dynamický seznam: Geometrický růst paměti

Když do seznamu přidáváte prvky metodou `.append()`, CPython nealokuje paměť pro každý prvek zvlášť. To by vedlo k extrémní fragmentaci paměti a složitosti $O(n^2)$.

CPython používá vzorec pro **geometrickou realokaci s rezervou (Over-allocation)**:

$$\text{nová\_kapacita} = \text{velikost} + (\text{velikost} \gg 3) + (\text{velikost} < 9 \mathrel{?} 3 : 6)$$

```python
import sys

seznam = []
minula_velikost = sys.getsizeof(seznam)

print(f"Počet | Velikost v bytech")
print("-" * 25)
for i in range(25):
    seznam.append(i)
    aktualni = sys.getsizeof(seznam)
    if aktualni != minula_velikost:
        print(f"Prvků: {len(seznam):2d} | RAM: {aktualni:3d} B (překročena kapacita!)")
        minula_velikost = aktualni
```

```plain
Růst kapacity slotů v CPythonu:
0 ──► 4 ──► 8 ──► 16 ──► 24 ──► 32 ──► 40 ──► 52 ──► 64 ──► 76 ...
```

Díky této strategii je amortizovaná složitost metody `append()` rovna **$O(1)$**!

---

<!-- slide: id=id13 title="Časová složitost operací na seznamu" tags=Core diff=basics -->
# Časová složitost operací: O(1) vs. O(n)

Porozumění vnitřní struktuře pole je zásadní pro psaní rychlého kódu:

| Operace | Příklad syntaxe | Časová složitost | Důvod / CPython chování |
|---|---|:---:|---|
| Indexace / Čtení | `s[i]` | **$O(1)$** | Přímý výpočet adresy ukazatele |
| Zápis na index | `s[i] = x` | **$O(1)$** | Přepsání pointeru v C poli |
| Přidání na konec | `s.append(x)` | **Amort. $O(1)$** | Využívá předem alokované sloty |
| Odebrání z konce | `s.pop()` | **$O(1)$** | Pouhé snížení čítače `ob_size` |
| Vložení na začátek | `s.insert(0, x)` | **$O(n)$** | **Katastrofa**: Posun všech $n$ pointerů doprava! |
| Odebrání ze začátku | `s.pop(0)` | **$O(n)$** | Posun všech $n-1$ pointerů doleva |
| Hledání hodnoty | `x in s`, `s.index(x)` | **$O(n)$** | Lineární průchod polem |
| Mazání prvku | `s.remove(x)` | **$O(n)$** | Hledání $O(n)$ + posun zbytku pole $O(n)$ |
| Řazení | `s.sort()` | **$O(n \log n)$** | Timsort / Powersort |

> [!CAUTION]
> Nikdy nepoužívejte `list` jako frontu FIFO s operacemi `insert(0, x)` nebo `pop(0)`! Pro $100\,000$ prvků zabere tato chyba desítky sekund místo zlomku milisekundy. Pro fronty použijte `collections.deque`!

---

<!-- slide: id=id14 title="Kritický antipattern: Modifikace seznamu během iterace" tags=Core diff=tricky -->
# Kritický antipattern: Mazání prvků během iterace

Klasická chyba, kterou udělal alespoň jednou každý programátor:

```python
cisla = [1, 2, 2, 3, 4, 2, 5]

# Cíl: Smazat všechna čísla 2
for x in cisla:
    if x == 2:
        cisla.remove(x)

print(cisla)  # Výsledek: [1, 3, 4, 2, 5] -- JEDNA DVOJKA ZŮSTALA!
```

### Proč k tomu došlo?
Interní iterátor si udržuje celočíselný index ukazující na aktuální prvek. Když zavoláte `cisla.remove(2)`, prvky vpravo se posunou o jedno místo doleva. Iterátor se však posune na další index a tím **přeskočí bezprostředně následující prvek**!

### Správná řešení:
```python
# Řešení 1: List comprehension (vytvoření nového čistého seznamu):
cisla = [x for x in cisla if x != 2]

# Řešení 2: Iterace přes kopii seznamu:
for x in cisla[:]:
    if x == 2:
        cisla.remove(x)

# Řešení 3: Procházení odzadu (mazání neovlivní předchozí indexy):
for i in range(len(cisla) - 1, -1, -1):
    if cisla[i] == 2:
        del cisla[i]
```

---

<!-- slide: id=id15 title="Reference, mutace a past se sdíleným stavem" tags=Core diff=tricky -->
# Reference, mutace a past se sdíleným stavem

Připomeňme si lekci o paměťovém modelu: proměnná v Pythonu je pouhou visačkou (referencí) na objekt v haldě:

```python
a = [1, 2, 3]
b = a          # b ukazuje na PŘESNĚ STEJNÝ objekt jako a!

b.append(4)
print(a)       # [1, 2, 3, 4] -- a bylo také modifikováno!
print(a is b)  # True (stejná paměťová identita)
```

```plain
Proměnná a ──┐
             ├──► [ PyListObject v paměti: 1, 2, 3, 4 ]
Proměnná b ──┘
```

Pokud chcete nezávislou kopii seznamu, musíte ji vytvořit explicitně:
```python
c = a.copy()    # nebo c = list(a) nebo c = a[:]
c.append(99)
print(a)        # [1, 2, 3, 4] (původní seznam zůstal nedotčen)
print(c)        # [1, 2, 3, 4, 99]
print(a is c)   # False
```

---

<!-- slide: id=id16 title="Šachovnicová past: 2D pole pomocí [[0] * n] * m" tags=Core diff=tricky -->
# Šachovnicová past: Inicializace 2D matic

Představte si, že chcete vytvořit matici nul o rozměrech $3 \times 3$:

```python
# ZDÁNLIVĚ ELEGANTNÍ ZÁPIS:
matice = [[0] * 3] * 3
print(matice)  # [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
```

Nyní změníme prvek v levém horním rohu:
```python
matice[0][0] = 99
print(matice)
# VÝSLEDEK: [[99, 0, 0], [99, 0, 0], [99, 0, 0]] !
# Změnily se všechny řádky naráz!
```

### Proč se to stalo?
Operátor násobení `[sublist] * 3` zkopíruje **referenci** na vnitřní seznam třikrát! Vznikla matice obsahující třikrát ten samý řádek v paměti:

```plain
matice ──► [ ref_1, ref_2, ref_3 ]
               │       │       │
               └───────┴───────┴──► [ 0, 0, 0 ]  (jediný seznam v RAM!)
```

### Správné řešení pomocí generátoru seznamu (Comprehension):
```python
# Pokaždé se vyhodnotí nová instance [0] * 3:
matice = [[0] * 3 for _ in range(3)]
matice[0][0] = 99
print(matice)  # [[99, 0, 0], [0, 0, 0], [0, 0, 0]] -- Funguje perfektně!
```

---

<!-- slide: id=id17 title="Mělká vs. Hluboká kopie: Modul copy" tags=Core diff=tricky -->
# Mělká (Shallow) vs. Hluboká (Deep) kopie

Co když seznam obsahuje vnořené měnitelné objekty (např. další seznamy, slovníky)?

```python
puvodni = [[1, 2], [3, 4]]
melka_kopie = puvodni.copy()  # nebo puvodni[:]

melka_kopie[0][0] = 999
print(puvodni)  # [[999, 2], [3, 4]] -- Původní vnořený seznam se změnil!
```

> [!NOTE]
> **Mělká kopie (Shallow Copy)** vytvoří nový vnější kontejner, ale reference na vnitřní vnořené objekty zkopíruje beze změny.

### Řešení: Hluboká kopie pomocí modulu copy:
```python
import copy

puvodni = [[1, 2], [3, 4]]
hluboka_kopie = copy.deepcopy(puvodni)

hluboka_kopie[0][0] = 999
print(puvodni)        # [[1, 2], [3, 4]] (původní data jsou 100% v bezpečí!)
print(hluboka_kopie)  # [[999, 2], [3, 4]]
```

`copy.deepcopy()` rekurzivně prochází celou stromovou strukturu objektů a udržuje si tabulku navštívených referencí (dokáže bezpečně zkopírovat i cyklické grafy).

---

<!-- slide: id=id18 title="Třídění v Pythonu: list.sort() vs. sorted()" tags=Core diff=basics -->
# Třídění v Pythonu: list.sort() vs. sorted()

Python nabízí dva různé způsoby řazení:

### 1. Metoda seznamu: list.sort()
* Modifikuje seznam **přímo na místě (in-place)**.
* Vrací hodnotu `None` (pro zamezení záměny s novým seznamem).
* Je paměťově efektivnější, protože nevytváří kopii pole.

```python
cisla = [5, 2, 9, 1, 7]
vysledek = cisla.sort()
print(vysledek)  # None !
print(cisla)     # [1, 2, 5, 7, 9] (původní seznam byl seřazen)
```

### 2. Vestavěná funkce: sorted(iterable)
* Původní kolekci ponechá beze změny.
* Vrací **zbrusu nový seřazený `list`**.
* Funguje nad **jakýmkoliv iterovatelným objektem** (n-tice, řetězec, množina, soubor).

```python
ntice = (5, 2, 9, 1, 7)
serazeno = sorted(ntice)
print(serazeno)  # [1, 2, 5, 7, 9] (nový list!)
print(ntice)     # (5, 2, 9, 1, 7) (původní n-tice zůstala nezměněna)
```

---

<!-- slide: id=id19 title="Jak funguje Timsort a Powersort" tags=Core diff=paradigm -->
# Jak funguje Timsort a moderní Powersort

Třídicí algoritmus v Pythonu vytvořil Tim Peters v roce 2002 (**Timsort**). Dnes jej převzaly i jazyky Java, Rust, Android i V8 Chrome engine. Od Pythonu 3.11 používá vylepšenou variantu **Powersort** (Munro & Wild, 2018).

### Klíčové vlastnosti algoritmu:
1. **Hybridní architektura**: Kombinuje *Merge Sort* (pro velké celky) a *Insertion Sort* (pro malé úseky pod 64 prvků).
2. **Využití reálných dat**: Reálná data málokdy bývají náhodná — často obsahují již seřazené úseky (tzv. *runs*). Timsort tyto vzestupné a sestupné běhy detekuje v lineárním čase $O(n)$!
3. **Striktní stabilita**: Prvky se shodným klíčem si **vždy zachovají své původní vzájemné pořadí**.

```plain
Časová složitost:
  Nejlepší případ (již seřazeno): O(n)
  Průměrný případ:                O(n log n)
  Nejhorší případ:                O(n log n)
  Paměťová složitost:             O(n)
```

---

<!-- slide: id=id20 title="Funkcionální třídění s klíčem: Parametr key=" tags=Core diff=basics -->
# Řazení s klíčem: Parametr key=

V C++ píšete přetížený operátor `<` nebo `std::less`. V Javě implementujete `Comparable` nebo předáváte `Comparator`.

V Pythonu je přístup mnohem přímočařejší: předáte funkci do parametru **`key=`**:

$$\text{prvek } x \implies \text{hodnota pro porovnání } f(x)$$

```python
slova = ["slon", "pes", "velryba", "kočka", "had"]

# 1. Řazení podle délky slova:
print(sorted(slova, key=len))
# ['had', 'pes', 'slon', 'kočka', 'velryba']

# 2. Řazení bez ohledu na velikost písmen:
jmena = ["alice", "Bob", "cyril", "David"]
print(sorted(jmena, key=str.lower))
# ['alice', 'Bob', 'cyril', 'David']

# 3. Řazení komplexních n-tic pomocí lambda funkce:
studenti = [("Alice", 1.2), ("Bob", 2.8), ("Cyril", 1.5)]
# Seřadit podle známky (druhý prvek):
studenti.sort(key=lambda s: s[1])
print(studenti)
# [('Alice', 1.2), ('Cyril', 1.5), ('Bob', 2.8)]
```

---

<!-- slide: id=id21 title="Stabilita třídění a vícekriteriální řazení" tags=Core diff=basics -->
# Stabilita třídění a vícekriteriální řazení

Díky tomu, že je Timsort striktně **stabilní**, můžeme objekty snadno řadit podle více kritérií najednou.

### 1. Řazení pomocí n-tice klíčů (Standardní Pythonic cesta):
N-tice v Pythonu se porovnávají prvek po prvku (lexikograficky): `(1, 2) < (1, 3)`.

```python
zamestnanci = [
    {"odd": "IT", "prijmeni": "Novák", "plat": 65000},
    {"odd": "HR", "prijmeni": "Svobodová", "plat": 55000},
    {"odd": "IT", "prijmeni": "Dvořák", "plat": 80000},
    {"odd": "HR", "prijmeni": "Černý", "plat": 55000},
]

# Chceme seřadit: primárně podle oddělení, sekundárně podle platu sestupně!
zamestnanci.sort(key=lambda z: (z["odd"], -z["plat"]))

for z in zamestnanci:
    print(f"{z['odd']} | {z['plat']} Kč | {z['prijmeni']}")
```

```plain
HR | 55000 Kč | Svobodová
HR | 55000 Kč | Černý
IT | 80000 Kč | Dvořák
IT | 65000 Kč | Novák
```

---

<!-- slide: id=id22 title="Modul operator: itemgetter a attrgetter pro vysoký výkon" tags=Core diff=newconcept -->
# Modul operator: itemgetter a attrgetter

Používání `lambda s: s[1]` v parametru `key=` je sice přehledné, ale pro statisíce prvků vyvolává zbytečný overhead volání interpretovaného Python rámu.

Standardní modul **`operator`** nabízí céčkové funkce optimalizované pro vytahování položek:

```python
from operator import itemgetter, attrgetter

katalog = [
    ("chemie", "Aspirin", 120),
    ("fyzika", "Laser", 9500),
    ("chemie", "Ethanol", 450),
    ("biologie", "Mikroskop", 18000),
]

# 1. Rychlé řazení podle indexu (itemgetter):
# Nahrazuje lambda x: x[2]
katalog.sort(key=itemgetter(2))  # Řadí podle ceny

# 2. Vícesložkový itemgetter:
# Nahrazuje lambda x: (x[0], x[1])
katalog.sort(key=itemgetter(0, 1))  # Primárně obor, sekundárně název

print(katalog)
```

> [!TIP]
> `itemgetter` a `attrgetter` běží přímo v nativním C kódu CPythonu a jsou typicky o 20 až 40 % rychlejší než ekvivalentní lambda výrazy.

---

<!-- slide: id=id23 title="Homogenní C pole: Modul array a šetření pamětí" tags=Core diff=basics -->
# Homogenní C pole: Modul array

Co když potřebujete v čistém Pythonu bez NumPy uložit 10 milionů 32bitových celých čísel?

* `list` 10M čísel v CPythonu zabere přes **80 MB** na samotné ukazatele + **280 MB** na hlavičky celých čísel = **~360 MB RAM**!
* Standardní modul **`array`** ukládá data jako souvislé primitivní C pole bez jakéhokoliv obalování do `PyObject`:

```python
import array
import sys

# 'i' reprezentuje podepsané 32bitové celé číslo (C signed int):
cisla_array = array.array('i', range(1_000_000))
cisla_list = list(range(1_000_000))

print(f"Velikost array.array: {sys.getsizeof(cisla_array) / 1024 / 1024:.2f} MB")
print(f"Velikost listu (pouze pointery): {sys.getsizeof(cisla_list) / 1024 / 1024:.2f} MB")
# array.array zabírá přesně ~4 MB (1M × 4 B)!
```

> [!NOTE]
> Modul `array` se používá především pro nízkoúrovňové binární soubory, síťové sockety a předávání dat do C knihoven. Pro vědecké výpočty s maticemi pak budeme používat specializovaný **NumPy** (přednáška 9).

---

<!-- slide: id=id24 title="Produkční most: collections.deque pro O(1) fronty" tags=Core diff=newconcept -->
# Produkční most: Obousměrná fronta collections.deque

Jak jsme si ukázali, `list.insert(0, x)` a `list.pop(0)` mají katastrofální složitost **$O(n)$**.

Kdykoliv potřebujete datovou strukturu typu **FIFO Fronta (Queue)** nebo **Obousměrný zásobník (Deque)**, použijte třídu **`collections.deque`** (Double-Ended Queue):

```plain
[ collections.deque paměťová struktura ]
  Obousměrně vázaný seznam bloků fixní velikosti (každý blok má 64 pointerů).
  Přidání / odebrání na obou koncích: O(1) bez nutnosti posouvat celé pole!
```

```python
from collections import deque

fronta = deque([10, 20, 30])

# 1. Operace na pravém konci (stejné jako list):
fronta.append(40)
prvek = fronta.pop()        # 40 (O(1))

# 2. Bleskové operace na LEVÉM konci:
fronta.appendleft(5)        # Přidá na začátek v O(1)!
prvni = fronta.popleft()    # Odebere ze začátku v O(1)!

print(fronta)  # deque([10, 20, 30])
```

---

<!-- slide: id=id25 title="collections.deque v praxi: Klouzavé okno s maxlen" tags=Core diff=basics -->
# Deque v praxi: Klouzavé okno s parametrem maxlen

Geniální vlastností `deque` je možnost definovat maximální délku **`maxlen`**:

```python
from collections import deque

# Kruhový buffer posledních 3 měření:
posledni_teploty = deque(maxlen=3)

namerene_hodnoty = [20.5, 21.0, 21.2, 22.5, 23.1, 22.8]

for t in namerene_hodnoty:
    posledni_teploty.append(t)
    print(f"Přidáno {t:4.1f} °C -> Historie: {list(posledni_teploty)}")
```

```plain
Přidáno 20.5 °C -> Historie: [20.5]
Přidáno 21.0 °C -> Historie: [20.5, 21.0]
Přidáno 21.2 °C -> Historie: [20.5, 21.0, 21.2]
Přidáno 22.5 °C -> Historie: [21.0, 21.2, 22.5]  <-- 20.5 automaticky vypadlo!
Přidáno 23.1 °C -> Historie: [21.2, 22.5, 23.1]
Přidáno 22.8 °C -> Historie: [22.5, 23.1, 22.8]
```

> [!TIP]
> Když je dosaženo `maxlen`, `deque` při přidání nového prvku na jednom konci automaticky a bez paměťových realokací zahodí prvek na opačném konci. Ideální pro rotující logy, klouzavé průměry a cache.

---

<!-- slide: id=id26 title="Produkční most: Typované záznamy typing.NamedTuple" tags=Core diff=newconcept -->
# Produkční most: Typované záznamy typing.NamedTuple

Obyčejný `tuple` je skvělý, ale přístup přes číselné indexy `bod[0]`, `bod[1]` je nepřehledný.

Moderní Python nabízí **`typing.NamedTuple`** (ekvivalent Java Records nebo C++ readonly structů):

```python
from typing import NamedTuple

class Mereni(NamedTuple):
    senzor_id: str
    teplota: float
    tlak: float = 1013.25  # Výchozí hodnota

m = Mereni("S-01", 24.8)

# 1. Čitelný přístup přes pojmenované atributy:
print(m.senzor_id)  # 'S-01'
print(m.teplota)    # 24.8
print(m.tlak)       # 1013.25

# 2. Stále je to plnohodnotný tuple:
id_s, t, p = m      # Plně podporuje unpacking!
print(m[0])         # 'S-01' (přístup přes index stále funguje)

# 3. Záznam je striktně neměnný:
# m.teplota = 25.0  # AttributeError: can't set attribute
```

> [!NOTE]
> `NamedTuple` má nulový paměťový overhead oproti běžnému `tuple` — nevytváří slovník instančních atributů `__dict__` a plně spolupracuje s nástrojem `mypy`.

---

<!-- slide: id=id27 title="Shrnutí a přechod do cvičení" tags=Core diff=basics -->
# Shrnutí přednášky a příprava na cvičení

Dnes jsme prozkoumali vnitřní architekturu sekvencí v jazyce Python:

### Hlavní body pro zapamatování:
1. **Paměťový model**: Python `list` je pole ukazatelů na `PyObject*`, nikoliv souvislá primitivní paměť.
2. **N-tice (`tuple`)**: Neměnný heterogenní záznam; čárka tvoří tuple: `(1,)`.
3. **Unpacking**: Paralelní přiřazení `a, b = b, a` a operátor `*rest` pro zachycení zbývajících prvků.
4. **Řezy (Slicing)**: Polouzavřené meze `[start:stop:step]`; podpora obrácení `[::-1]` a zápisu do řezů.
5. **Výkon seznamu**: `.append()` a `.pop()` jsou $O(1)$; `.insert(0, ...)` a `.pop(0)` jsou $O(n)$!
6. **Kopírování**: Mělká kopie nesleduje vnořené objekty; pro hluboké stromy použijte `copy.deepcopy()`. Pozor na past `[[0]*3]*3`!
7. **Řazení**: Timsort/Powersort je stabilní v $O(n \log n)$; preferujte parametr `key=itemgetter(...)`.
8. **Produkční kontejnery**: Pro fronty použijte `collections.deque`; pro typované záznamy `typing.NamedTuple`.

### Co vás čeká v následujícím 1,5hodinovém cvičení:
* Implementace řazení složitých vědeckých tabulek podle více kritérií.
* Detekce a oprava paměťových chyb u sdílených 2D matic.
* Zpracování časových řad a výpočet klouzavého průměru pomocí `collections.deque(maxlen=...)`.
