<!-- slide: id=id1 title="Úvod do modulu ctypes" tags="Core" diff="newconcept" -->
## Úvod do modulu `ctypes`

Modul **`ctypes`** je součástí standardní knihovny Pythonu a slouží k volání funkcí ze sdílených dynamických knihoven (`.so` na Linuxu, `.dll` na Windows, `.dylib` na macOS). Poskytuje nízkoúrovňové datové typy plně kompatibilní s jazykem C/C++ (C-ABI):

- Přímé volání funkcí z existujících knihoven (např. `libc`, `OpenSSL`, grafické knihovny) bez nutnosti psát C kompilované rozšíření.
- Tvorba čistých pythonních wrapperů nad proprietárními nebo systémovými knihovnami.
- Nulová závislost na externím C kompilátoru v cílovém prostředí.

> [!NOTE]
> `ctypes` se hodí pro snadné napojení na C ABI. Pro vysoce výkonné provázání s velkým množstvím C++ kódu se dnes často volí také moderní nástroje jako Cython, pybind11 nebo CFFI.

---
<!-- slide: id=id2 title="S Pythonem kompatibilní typy" tags="Core" diff="basics" -->
## Kompatibilita základních typů

Vzhledem k fundamentální rozdílnosti mezi dynamickými pythonními objekty a statickou pamětí C lze přímo předávat a vracet pouze čtyři základní pythonní typy:

- **`None`** $\rightarrow$ mapuje se na céčkovský nulový ukazatel (`NULL`).
- **Celá čísla (`int`)** $\rightarrow$ předávají se jako standardní C `int`.
- **Řetězce (`str`)** $\rightarrow$ předávají se jako ukazatel na Unicode řetězec (`wchar_t*`).
- **Bajtové řetězce (`bytes`)** $\rightarrow$ předávají se jako ukazatel na paměť zakončenou nulou (`char*`).

Jakékoliv jiné datové typy (desetinná čísla, pole, struktury, ukazatele) vyžadují explicitní obalení pomocí konstruktorů z modulu `ctypes`.

---
<!-- slide: id=id3 title="Přehled základních typů" tags="Core" diff="resyntax" -->
## Přehled ctypes typů a mapování na C / Python

| ctypes typ | Odpovídající C typ | Pythonní reprezentace |
|---|---|---|
| `c_bool` | `_Bool` | `bool` |
| `c_char` | `char` | 1-bajtový `bytes` (např. `b"x"`) |
| `c_wchar` | `wchar_t` | 1-znakový `str` (např. `"x"`) |
| `c_byte` / `c_ubyte` | `char` / `unsigned char` | `int` (8-bit) |
| `c_short` / `c_ushort` | `short` / `unsigned short` | `int` (16-bit) |
| `c_int` / `c_uint` | `int` / `unsigned int` | `int` (32-bit) |
| `c_long` / `c_ulong` | `long` / `unsigned long` | `int` (32 nebo 64-bit dle OS) |
| `c_longlong` / `c_ulonglong` | `long long` / `unsigned long long` | `int` (64-bit) |
| `c_size_t` / `c_ssize_t` | `size_t` / `ssize_t` | `int` |
| `c_float` | `float` | `float` (32-bit IEEE) |
| `c_double` | `double` | `float` (64-bit IEEE) |
| `c_char_p` | `char *` (NUL-terminated) | `bytes` nebo `None` |
| `c_wchar_p` | `wchar_t *` (NUL-terminated) | `str` nebo `None` |
| `c_void_p` | `void *` | `int` (adresa) nebo `None` |

---
<!-- slide: id=id4 title="Důležité poznámky o paměti a bufferu" tags="Tricky" diff="newconcept" -->
## Práce s pamětí a vyvolání Segmentation Fault

Při práci s `ctypes` přebíráte plnou odpovědnost za správu paměti v C:

1. **Mutabilní paměťové buffery**:
   Pythonní řetězce `bytes` i `str` jsou striktně neměnné (*immutable*). Pokud volaná C funkce očekává zapisovatelný buffer (např. `char *buf, int maxlen`), nesmíte předat běžný `bytes` literál. Musíte vytvořit zapisovatelné pole:
   - `ctypes.create_string_buffer(velikost)` pro `c_char`
   - `ctypes.create_unicode_buffer(velikost)` pro `c_wchar`

2. **Riziko pádu procesu (Segmentation Fault)**:
   Předání špatného ukazatele nebo neplatného typu nevede v C k zachytitelné pythonní výjimce, ale k okamžitému pádu celého procesu (`SIGSEGV` / Access Violation). Proto je kritické definovat `argtypes` a `restype`.

---
<!-- slide: id=id5 title="Volání funkcí – typy argumentů argtypes" tags="Core" diff="newconcept" -->
## Typová bezpečnost volání: `argtypes`

Ve výchozím stavu `ctypes` nezná signatury externích funkcí. Vždy nastavte seznam povolených typů atributem **`argtypes`**:

```python
from ctypes import CDLL, c_char_p, c_int, c_double
import sys

# Načtení standardní C knihovny dle platformy
libc_name = "msvcrt.dll" if sys.platform == "win32" else "libc.so.6"
libc = CDLL(libc_name)
printf = libc.printf

# Nastavení striktních typů argumentů
printf.argtypes = [c_char_p, c_char_p, c_int, c_double]

# Volání s automatickou konverzí a typovou kontrolou
printf(b"Text: %s, Int: %d, Float: %f\n", b"Ahoj", 42, 3.14)
```

Při pokusu předat nesprávný typ vyvolá Python ještě před voláním C kódu bezpečnou výjimku `ctypes.ArgumentError`:

```python
printf(b"%d %d %d", 1, 2, 3)
# ctypes.ArgumentError: argument 2: <class 'TypeError'>: wrong type
```

---
<!-- slide: id=id6 title="Argumenty funkcí – _as_parameter_" tags="WOW" diff="pythonic" -->
## Přizpůsobení vlastních objektů: `_as_parameter_`

Chcete-li do céčkovských funkcí předávat instance vlastních pythonních tříd, stačí na nich definovat atribut **`_as_parameter_`**:

```python
import ctypes
import sys

libc = ctypes.CDLL("msvcrt.dll" if sys.platform == "win32" else "libc.so.6")
printf = libc.printf

class BeerQuantity:
    def __init__(self, count: int):
        # Tento atribut ctypes automaticky předá jako C argument
        self._as_parameter_ = count

bottles = BeerQuantity(42)
printf(b"%d bottles of beer on the wall\n", bottles)
```

Atribut `_as_parameter_` musí vracet buď `int`, `bytes`, nebo instanci jiného ctypes typu.

---
<!-- slide: id=id7 title="Validace argumentů – from_param()" tags="WOW" diff="pythonic" -->
## Validace v argtypes: `from_param()`

Pokud chcete použít vlastní třídu přímo v seznamu `argtypes`, implementujte třídní metodu **`from_param(cls, obj)`**:

```python
import ctypes
import sys

libc = ctypes.CDLL("msvcrt.dll" if sys.platform == "win32" else "libc.so.6")
printf = libc.printf

class PositiveInt:
    def __init__(self, value: int):
        if value < 0:
            raise ValueError("Hodnota musí být kladná!")
        self.value = value

    @classmethod
    def from_param(cls, obj):
        if not isinstance(obj, PositiveInt):
            raise TypeError("Očekávána instance PositiveInt")
        return ctypes.c_int(obj.value)

printf.argtypes = [ctypes.c_char_p, PositiveInt]
printf(b"Validní kladná hodnota: %d\n", PositiveInt(100))
```

Metoda `from_param` zajišťuje přísnou validaci a adaptaci před přechodem do C kódu.

---
<!-- slide: id=id8 title="Volání funkcí – typ návratové hodnoty restype" tags="Tricky" diff="newconcept" -->
## Návratová hodnota: `restype`

Ve výchozím nastavení předpokládá `ctypes`, že externí C funkce vrací `int` (32-bit). Pokud funkce vrací ukazatel, float nebo jiný typ, musíte specifikovat **`restype`**:

```python
from ctypes import CDLL, c_char, c_char_p
import sys

libc = CDLL("msvcrt.dll" if sys.platform == "win32" else "libc.so.6")
strchr = libc.strchr

# char *strchr(const char *s, int c);
strchr.argtypes = [c_char_p, c_char]
strchr.restype = c_char_p

result = strchr(b"antigravity", b"g")
print(result)  # -> b'gravity'
```

Bez nastavení `restype = c_char_p` by funkce vrátila pouhé celé číslo (adresu v paměti) místo pythonního bajtového objektu!

---
<!-- slide: id=id9 title="Vlastní ošetření návratové hodnoty funkcí" tags="Skip" diff="pythonic" -->
## Zpracování návratového kódu přes callable `restype`

Jako `restype` lze nastavit i běžnou pythonní funkci. Ta obdrží surovou návratovou hodnotu z C a může provést konverzi nebo validaci:

```python
import ctypes
import sys

libc = ctypes.CDLL("msvcrt.dll" if sys.platform == "win32" else "libc.so.6")
printf = libc.printf

def check_printed_length(val: int) -> int:
    print(f"[Audit] printf vypsal celkem {val} znaků.")
    return val

printf.argtypes = [ctypes.c_char_p, ctypes.c_int]
printf.restype = check_printed_length

printf(b"Cislo: %d\n", 42)
```

---
<!-- slide: id=id10 title="Rozšířené ošetření chyby: errcheck" tags="WOW" diff="pythonic" -->
## Pokročilá validace chyb: `errcheck`

Pro robustní ošetření chybových kódů a převod na pythonní výjimky slouží atribut **`errcheck`**:

```python
import ctypes
import sys

libc = ctypes.CDLL("msvcrt.dll" if sys.platform == "win32" else "libc.so.6")
printf = libc.printf

def on_c_call(result, func, arguments):
    if result < 0:
        raise OSError("Volání C funkce selhalo s chybovým kódem!")
    print(f"-> Úspěšně zavoláno: {func.__name__} s argumenty {arguments}, vráceno {result}")
    return result

printf.argtypes = [ctypes.c_char_p, ctypes.c_int]
printf.errcheck = on_c_call

printf(b"Test: %d\n", 123)
```

Atribut `errcheck` obdrží trojici `(návratová_hodnota, reference_na_c_funkci, n-tice_argumentů)`.

---
<!-- slide: id=id11 title="Předávání ukazatelů: byref() vs pointer()" tags="Tricky" diff="paradigm" -->
## Předávání ukazatelů: `byref()` versus `pointer()`

Pokud C funkce očekává argument předaný odkazem (ukazatel na hodnotu, např. `int *out`):

- **`ctypes.byref(obj)`**:
  - Lehký a vysoce efektivní adaptér.
  - Vytváří rychlý ukazatel v paměti určený výhradně pro předání do C funkce.
  - Vhodné pro výstupní parametry volané funkce.

- **`ctypes.pointer(obj)`**:
  - Vytváří plnohodnotný pythonní objekt typu `LP_c_int` (ukazatel), se kterým lze dále pracovat v Pythonu (číst `ptr.contents`).
  - Náročnější na alokaci a paměť.

```python
from ctypes import c_int, byref, pointer

val = c_int(10)

# Rychlé předání do C:
# c_func(byref(val))

# Plnohodnotný ukazatel v Pythonu:
ptr = pointer(val)
print(ptr.contents.value)  # -> 10
ptr.contents.value = 20
print(val.value)           # -> 20
```

---
<!-- slide: id=id12 title="Předávání C struktur a unií" tags="WOW" diff="paradigm" -->
## Definice C struktur: `ctypes.Structure`

Céčkovské struktury (`struct`) se definují děděním z `ctypes.Structure` a specifikací seznamu **`_fields_`**:

```python
from ctypes import Structure, c_int

class Point(Structure):
    _fields_ = [
        ("x", c_int),
        ("y", c_int),
    ]

class Rect(Structure):
    _fields_ = [
        ("upper_left", Point),
        ("lower_right", Point),
    ]

r = Rect(Point(0, 0), Point(1920, 1080))

print(r.upper_left.x, r.upper_left.y)   # -> 0 0
print(r.lower_right.x, r.lower_right.y) # -> 1920 1080
```

> [!NOTE]
> Zarovnání položek v paměti (*memory alignment & padding*) přesně odpovídá pravidlům nativního C kompilátoru na dané platformě.

---
<!-- slide: id=id13 title="Předávání C polí" tags="WOW" diff="resyntax" -->
## Nativní C pole v ctypes

Pole s pevnou velikostí se v `ctypes` vytváří násobením datového typu počtem prvků:

```python
from ctypes import c_int, Structure

# A) Samostatné jednorozměrné pole 5 integerů:
IntArray5 = c_int * 5
arr = IntArray5(10, 20, 30, 40, 50)

print(len(arr))  # -> 5
print(arr[2])    # -> 30

for x in arr:
    print(x, end=" ")
print()

# B) Vnořené pole struktur:
class Polygon(Structure):
    _fields_ = [
        ("num_points", c_int),
        ("vertices", Point * 10),  # pole 10 struktur Point
    ]
```

Ctypes pole podporují standardní pythonní indexaci, slicing a iteraci smyčkou `for`.

---
<!-- slide: id=id14 title="Shrnutí a osvědčené postupy ctypes" tags="Skip" diff="basics" -->
## Shrnutí a doporučené postupy

Při práci s `ctypes` dodržujte tyto zásady:

1. **Vždy explicitně deklarujte `argtypes` a `restype`**: Ochráníte se před pádem interpretu a nechtěným přetečením typů.
2. **Pozor na životní cyklus paměti (Garbage Collection)**: Pokud předáváte do C knihovny ukazatel na pythonní buffer, zajistěte, aby Python objekt nezrušil dříve, než s ním C knihovna přestane pracovat.
3. **Přednost dávejte `byref()` před `pointer()`**: Je výrazně rychlejší a nevytváří zbytečné obalové objekty.
4. **Pro rozsáhlé C/C++ knihovny zvažte `cffi` nebo `pybind11`**: Nabízejí automatické parsování C hlavičkových souborů `.h` a snazší správu složitých struktur.
