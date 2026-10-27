<!-- slide: id1, Úvod do modulu array, Core, resyntax -->
## Úvod: Kdy v Pythonu potřebujeme skutečné C pole?

Pokud začínáte s Pythonem, běžný datový typ **seznam** (`list`) vám nabízí maximální komfort a flexibilitu. Pythoní `list` je dynamické pole **ukazatelů** na objekty na haldě (`PyObject*`). To s sebou však nese dvě zásadní nevýhody při zpracování obřích objemů čísel:

1. **Vysoká paměťová režie (Boxing overhead)**:
   - Každé celé číslo `int` v Pythonu je samostatný objekt na haldě vážící **28 bajtů** (hlavička objektu, reference count, typový ukazatel, počet digitu).
   - Samotný `list` drží ukazatele (8 bajtů na ukazatel v 64bitové architektuře).
   - Milion celých čísel v `list[int]` zabere zhruba **~36 MB RAM**!
2. **Neefektivní cache lokalita**:
   - Čísla jsou rozeseta po celé haldě. Procesor nemůže efektivně využívat L1/L2 prefetching.

Pro situace, kdy potřebujete **úsporu paměti** a **rychlé binární I/O**, nabízí standardní knihovna Pythonu modul **`array`**:
- Ukládá primitivní C typy do **souvislého bloku paměti** (stejně jako v C/C++ `int[]`).
- Milion 32bitových celých čísel v `array('i')` zabere přesně **4 MB RAM** (9× méně paměti)!

---
<!-- slide: id2, „array“ versus „seznam“, Tricky, paradigm -->
## Paměťový model: `list` vs. `array.array`

Porovnání rozložení paměti v CPythonu:

```text
Standardní Python list (pole referencí na haldě):
list -> [ ptr_0 | ptr_1 | ptr_2 | ptr_3 ]   (8 B na slot)
           |       |       |       |
           v       v       v       v
        [PyLong] [PyLong] [PyLong] [PyLong] (každé číslo má 28 B hlavičku)

Kompaktní modul array (souvislý C-buffer):
array -> [ int32 | int32 | int32 | int32 ]  (přesně 4 B na položku, nulová režie)
```

> [!NOTE] Klíčové rozdíly
> - **Homogenita**: Všechny prvky v `array` musí být **stejného primitivního typu** (např. pouze celá čísla nebo pouze reálná čísla). Pokus o vložení jiného typu selže s chybou `TypeError`.
> - **Pevná šířka**: Každá položka zabírá fixní počet bajtů (1, 2, 4 nebo 8 bajtů).
> - **Dynamická velikost**: Na rozdíl od statického pole v C je pythoní `array` stále dynamické – můžete prvky přidávat (`append`) a odebírat (`pop`).

---
<!-- slide: id3, Zavedení – prázdné pole daného typu, Core, basics -->
## Vytvoření prázdného pole

Pole konstruujeme pomocí třídy `array` z modulu `array`. Prvním povinným argumentem je **typový kód** (`typecode`), který určuje reprezentaci v paměti:

```python
from array import array

# Vytvoření prázdného pole 32bitových celých čísel se znaménkem ('i')
ar = array("i")

print(len(ar))        # 0
print(ar.typecode)   # 'i'
print(ar.itemsize)   # 4 (bajtů na jeden prvek)
```

### Typové anotace (Python 3.9+)
Od verze Python 3.9 je třída `array` generickým typem podporujícím indexování pro statické typové kontroly:

```python
from array import array

def process_integers(data: array[int]) -> int:
    return sum(data)
```

---
<!-- slide: id4, Zavedení – neprázdné pole daného typu, Core, basics -->
## Inicializace hodnotami

Pole lze při vytvoření naplnit výchozími daty předáním seznamu, n-tice nebo libovolného iterovatelného objektu:

```python
import array

# Pole 32bitových reálných čísel (float 'f')
ar_float = array.array("f", [1.0, 2.5, 3.14])
print(ar_float)
# Výstup: array('f', [1.0, 2.5, 3.140000104904175])
print(ar_float.itemsize)  # 4 bajty

# Pole 64bitových reálných čísel (double 'd')
ar_double = array.array("d", [1.0, 2.5, 3.14])
print(ar_double.itemsize)  # 8 bajtů
```

> [!WARNING] Celočíselné přetečení vs. neomezený int
> Běžný pythoní `int` má libovolnou přesnost a nikdy nepřeteče.
> V poli `array('h')` (16bitový signed short, rozsah $-32768$ až $32767$) způsobí uložení většího čísla výjimku:
> ```python
> a = array.array("h")
> a.append(40000)
> # OverflowError: signed short integer is greater than maximum
> ```

---
<!-- slide: id5, Podrobnosti k inicializaci a I/O, Core, newconcept -->
## Rychlá inicializace a binární I/O

Modul `array` exceluje v přímé výměně dat se soubory a binárními proudy bez nutnosti pomalého parsování textu:

```python
from array import array

ar = array("i", [10, 20, 30, 40])

# 1. Převod na syrové bajty (Raw C bytes)
raw_bytes = ar.tobytes()
print(len(raw_bytes))  # 16 bajtů (4 prvky * 4 bajty)

# 2. Rekonstrukce pole z bajtů
restored = array("i")
restored.frombytes(raw_bytes)
print(restored)  # array('i', [10, 20, 30, 40])

# 3. Přímý zápis do binárního souboru
with open("data.bin", "wb") as f:
    ar.tofile(f)

# 4. Bleskové načtení ze souboru
loaded = array("i")
with open("data.bin", "rb") as f:
    loaded.fromfile(f, 4)  # načti přesně 4 prvky
```

> [!NOTE] Zastaralé metody
> Starší metody `fromstring()` a `tostring()` byly v Pythonu 3.9 definitivně odstraněny; používejte výhradně `frombytes()` a `tobytes()`. Metody `fromunicode()` a `tounicode()` jsou od Pythonu 3.3 zavržené a v Pythonu 3.13 odstraněny.

---
<!-- slide: id6, Dostupné typy a typové kódy, Skip, resyntax -->
## Přehled dostupných typových kódů

Seznam všech podporovaných kódů zjistíte atributem `array.typecodes`:

| Kód | Odpovídající C typ | Python typ | Min. velikost v bajtech |
| :---: | :--- | :---: | :---: |
| `'b'` | `signed char` | `int` | 1 |
| `'B'` | `unsigned char` | `int` | 1 |
| `'h'` | `signed short` | `int` | 2 |
| `'H'` | `unsigned short` | `int` | 2 |
| `'i'` | `signed int` | `int` | 2 (typicky 4) |
| `'I'` | `unsigned int` | `int` | 2 (typicky 4) |
| `'l'` | `signed long` | `int` | 4 |
| `'L'` | `unsigned long` | `int` | 4 |
| `'q'` | `signed long long` | `int` | 8 |
| `'Q'` | `unsigned long long` | `int` | 8 |
| `'f'` | `float` (jednoduchá přesnost) | `float` | 4 |
| `'d'` | `double` (dvojitá přesnost) | `float` | 8 |

> [!IMPORTANT]
> Pro práci s celými čísly na 64bitových architekturách se nejčastěji používá `'i'` (32bitový int) nebo `'q'` (64bitový int). Pro reálná čísla je standardem `'d'` (`double`), který odpovídá nativnímu pythonímu typu `float`.

---
<!-- slide: id7, Pole jako sekvence, Skip, basics -->
## `array` jako sekvenční typ

Objekt `array` plně implementuje **sekvenční protokol** (stejně jako `list` nebo `tuple`), takže podporuje indexaci, řezy i operátory:

```python
from array import array

ar = array("i", [1, 2, 3, 4, 5])

# Délka a indexování
print(len(ar))       # 5
print(ar[0])         # 1
print(ar[-1])        # 5

# Slicing vrací NOVÉ pole stejného typu
print(ar[1:4])       # array('i', [2, 3, 4])
print(ar[::-1])      # array('i', [5, 4, 3, 2, 1])

# Dotaz na členství O(n)
print(3 in ar)       # True
print(99 in ar)      # False

# Spojování a násobení sekvencí
print(ar + array("i", [6, 7]))  # array('i', [1, 2, 3, 4, 5, 6, 7])
print(array("i", [0]) * 5)      # array('i', [0, 0, 0, 0, 0])
```

---
<!-- slide: id8, Pole jako sekvence – smyčka „for-in“, Skip, basics -->
## Iterace přes prvky pole

Průchod polem je syntakticky totožný se seznamem:

```python
from array import array

ar = array("i", [10, 20, 30])

# Klasický for-in cyklus
for val in ar:
    print(val)

# S indexem pomocí enumerate
for idx, val in enumerate(ar, start=1):
    print(f"Pozice {idx}: {val}")

# V obráceném pořadí bez kopírování
for val in reversed(ar):
    print(val)

# Řazení (pozor: sorted() vrátí běžný list!)
sorted_list: list[int] = sorted(ar, reverse=True)
```

---
<!-- slide: id9, Pole jako měnitelné sekvence, Skip, basics -->
## Mutabilita a typová kontrola

Pole je měnitelná (*mutable*) datová struktura. Změna prvku na existujícím indexu probíhá v $O(1)$:

```python
from array import array

ar = array("i", [10, 20, 30])
ar[1] = 999
print(ar)  # array('i', [10, 999, 30])
```

### Přísná typová kontrola za běhu
Při pokusu o uložení nekompatibilního typu vyhodí Python výjimku:

```python
# Pokus o uložení řetězce nebo floatu do intového pole:
ar[0] = "text"
# TypeError: 'str' object cannot be interpreted as an integer

ar[0] = 3.14
# TypeError: 'float' object cannot be interpreted as an integer
```

---
<!-- slide: id10, Dotazování na prvky, Core, basics -->
## Vyhledávání prvků: `index()` a `count()`

Stejně jako u seznamu `list` nabízí pole metody pro vyhledání a sčítání výskytů:

```python
from array import array

ar = array("i", [10, 20, 30, 20, 40])

# První výskyt prvku
print(ar.index(20))  # 1

# Počet výskytů hodnoty
print(ar.count(20))  # 2
print(ar.count(99))  # 0
```

> [!WARNING] Pozor na výjimku ValueError
> Pokud hledaný prvek v poli neexistuje, `ar.index(x)` vyhodí `ValueError`. Před vyhledáním vždy ověřte přítomnost pomocí `if x in ar:` nebo ošetřete blokem `try - except ValueError`.
> Časová složitost vyhledávání je **$O(n)$** (sekvenční průchod pamětí).

---
<!-- slide: id11, Přidávání prvků, Skip, basics -->
## Přidávání prvků do pole

K dispozici jsou známé metody pro vkládání prvků:

```python
from array import array

ar = array("i", [1, 2, 3])

# 1. Přidání na konec O(1) amortizovaně
ar.append(4)
print(ar)  # array('i', [1, 2, 3, 4])

# 2. Vložení na konkrétní index O(n) (vyžaduje posun paměti)
ar.insert(0, 99)
print(ar)  # array('i', [99, 1, 2, 3, 4])

# 3. Rozšíření o další prvky
ar.extend([100, 200])                 # z iterovatelného objektu
ar.extend(array("i", [300, 400]))     # z jiného pole
print(ar)
```

---
<!-- slide: id12, Odebírání prvků, Skip, basics -->
## Odebírání prvků z pole

Metody pro mazání prvků zrcadlí rozhraní `list`:

```python
from array import array

ar = array("i", [10, 20, 30, 40, 50, 60])

# 1. del pomocí indexu nebo řezu
del ar[0]          # smaže prvek na indexu 0
del ar[-2:]        # smaže poslední dva prvky
print(ar)          # array('i', [20, 30, 40])

# 2. pop() vyjme a vrátí prvek
last = ar.pop()    # vrátí 40, O(1)
first = ar.pop(0)  # vrátí 20, O(n) posun prvků

# 3. remove(val) smaže první výskyt zadané hodnoty
ar = array("i", [5, 10, 5, 20])
ar.remove(5)       # smaže první pětku
print(ar)          # array('i', [10, 5, 20])
```

---
<!-- slide: id13, Pokročilé metody a Zero-Copy memoryview, Core, newconcept -->
## Další metody a bezztrátový `memoryview`

Modul `array` obsahuje specializované systémové metody:

```python
from array import array

ar = array("i", [1, 2, 3])

# Obrácení pole in-place
ar.reverse()
print(ar)  # array('i', [3, 2, 1])

# Změna endianity (Little-Endian <-> Big-Endian)
# Převrátí bajty každého čísla (užitečné při síťovém přenosu či čtení binárních souborů)
ar.byteswap()
```

### Zero-Copy operace s `memoryview`
Protože `array` implementuje **Python Buffer Protocol** ([PEP 3118](https://peps.python.org/pep-3118/)), můžeme nad ním vytvořit `memoryview`. To umožňuje řezat data **bez alokace nové paměti a bez kopírování bajtů**:

```python
ar = array("i", [10, 20, 30, 40, 50])
view = memoryview(ar)

# Řez bez kopírování podkladových dat!
subview = view[1:4]
print(subview.tolist())  # [20, 30, 40]
```

---
<!-- slide: id14, Kdy použít array a kam dál (NumPy), Core, paradigm -->
## Shrnutí: `array` v moderním Pythonu a kam dál

Standardní modul `array` je vynikající, pokud potřebujete:
- **Nulové externí závislosti**: Součást standardní knihovny bez nutnosti instalovat gigabajtové balíčky.
- **Jednoduchou binární I/O**: Čtení a zápis do binárních souborů a socketů.
- **Kompaktní 1D sekvence čísel** s malým paměťovým otiskem.

### Limity `array` a cesta k NumPy
Modul `array` je však omezen na **jednorozměrná pole** a **nepodporuje vektorizovanou matematiku** (operace jako `ar * 2` nezdvojnásobí čísla, ale zduplikuje délku sekvence!).

```text
Kdy co zvolit:
- Běžná data, různé typy:           -> list, tuple
- Úspora paměti ve standardní lib:  -> array.array
- Vektorová matematika, matice, ML: -> NumPy (ndarray)
- Tabulková data, sloupce:          -> Polars, pandas, PyArrow
```

> [!TIP] Přechod na NumPy
> Pro seriózní vědecké a inženýrské výpočty, maticové transformace a multidimenzionální pole slouží knihovna **NumPy** (`import numpy as np`). Ta staví na stejném principu souvislých C-bufferů jako `array`, ale nabízí SIMD paralelizaci a stovky algebraických funkcí.
