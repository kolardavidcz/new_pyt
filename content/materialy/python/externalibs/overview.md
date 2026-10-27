<!-- slide: id1, Úvod, Core, newconcept -->
## C-Interoperabilita & FFI v Pythonu: Modul `ctypes`

Python je známý jako skvělý „lepicí jazyk“ (*glue language*). Umožňuje spojit rychlý a expresivní vývoj v Pythonu s nekompromisním výkonem nízkoúrovňových kompilovaných jazyků **C, C++, Fortran nebo Rust**.

Pro přímé volání funkcí ze zkompilovaných sdílených dynamických knihoven (`.so` na Linuxu, `.dll` na Windows, `.dylib` na macOS) bez nutnosti psát složitý propojovací C-kód nebo CPython C-API obsahuje standardní knihovna vestavěný modul **`ctypes`** (součást standardní knihovny od Pythonu 2.5).

```mermaid
flowchart LR
    A["Python kód"] --> B["ctypes FFI (Foreign Function Interface)"]
    B --> C["C ABI volací konvence (cdecl / stdcall)"]
    C --> D["libmoje.so / moje.dll (přímé spuštění v CPU)"]
```

### Hlavní důvody použití C-FFI:
1. **Dramatická akcelerace výpočetně náročných operací**: Přesun horkých matematických smyček do optimalizovaného C kódu (`gcc -O3`).
2. **Přístup k nízkoúrovňovým systémovým API**: Přímé volání funkcí Win32 API (`kernel32.dll`, `user32.dll`) nebo POSIX `libc.so.6`.
3. **Znovupoužitelnost stávajícího softwaru**: Využití existujících ověřených knihoven v podniku bez nutnosti jejich přepisu.

---
<!-- slide: id2, Knihovny (nejen) v jazyce C/C++, Core, newconcept -->
## Načítání knihoven a typový systém v `ctypes`

Modul `ctypes` poskytuje objekt **`CDLL`** pro načtení sdílené knihovny a kolekci primitivních datových typů mapovaných přímo na velikosti v jazyce C:

```python
import ctypes
from ctypes import CDLL, c_int, c_double, c_char_p

# Načtení knihovny (cesta k .so nebo .dll):
# libc = CDLL("libc.so.6")  # Na Linuxu
# msvcrt = CDLL("msvcrt.dll")  # Na Windows
```

### Mapování typů mezi Pythonem a C:

| Typ v `ctypes` | Odpovídající C typ | Python typ |
|---|---|---|
| `c_bool` | `_Bool` (1 byte) | `bool` |
| `c_int`, `c_long` | `int`, `long` (32/64 bit) | `int` |
| `c_float`, `c_double` | `float`, `double` (32/64 bit) | `float` |
| `c_char_p` | `char *` (ukazatel na NUL-terminovaný řetězec) | `bytes` |
| `c_void_p` | `void *` (obecný paměťový ukazatel) | `int` nebo `None` |

> [!IMPORTANT]
> **V Pythonu 3 je `c_char_p` mapován na `bytes`, nikoliv na `str`!** Textové řetězce musíte před předáním do C funkce zakódovat (např. `text.encode('utf-8')`).

---
<!-- slide: id3, Příklad, Core, resyntax -->
## Kompletní příklad: C-funkce a její volání z Pythonu

Představme si výpočetní C-kód se smyčkou v souboru `mylib.c`:

```c
/* mylib.c */
int secti_rada(int n) {
    int soucet = 0;
    for (int i = 0; i <= n; i++) {
        soucet += i;
    }
    return soucet;
}
```

### 1. Kompilace do sdílené knihovny:
```bash
# Na Linuxu / WSL:
gcc -O3 -shared -fPIC mylib.c -o libmylib.so

# Na Windows (MinGW / GCC):
gcc -O3 -shared mylib.c -o mylib.dll
```

### 2. Načtení a zavolání v Pythonu:
```python
import ctypes
from pathlib import Path

# Vždy používejte absolutní cestu k souboru knihovny!
cesta_ke_knihovne = Path(__file__).resolve().parent / "libmylib.so"
mylib = ctypes.CDLL(str(cesta_ke_knihovne))

# Nastavení signatury (kritické pro stabilitu paměti!):
mylib.secti_rada.argtypes = [ctypes.c_int]  # Očekává int
mylib.secti_rada.restype = ctypes.c_int     # Vrací int

# Přímé volání jako běžná Python funkce:
vysledek = mylib.secti_rada(1_000_000)
print(f"Výsledek výpočtu v C: {vysledek}")
```

---
<!-- slide: id4, Poznámky, Tricky, paradigm -->
## Zásadní pravidla a úskalí při práci s `ctypes`

1. **Vždy explicitně nastavujte `argtypes` a `restype`**:
   Ve výchozím stavu `ctypes` předpokládá, že funkce vrací C `int`. Pokud volaná funkce vrací 64-bitový ukazatel `char *` nebo `double`, Python přečte pouze 32 bitů, což vede k okamžitému pádu na **Segmentation Fault**!
2. **Rozdíly v cestách mezi OS**:
   - Na Windowshledá systém dynamické knihovny v aktuálním adresáři a systémových cestách `PATH`.
   - Na Linuxu vyžaduje `dlopen()` buď absolutní cestu, nebo umístění v systémových složkách `/usr/lib` či v proměnné prostředí `LD_LIBRARY_PATH`.
3. **Výjimky nepřechází přes hranici ABI**:
   Pokud v C kódu nastane neplatný přístup do paměti (*Segfault / Access Violation*), Python nemůže vyvolat standardní výjimku — proces okamžitě spadne!
4. **C++ Name Mangling**:
   Pokud kompilujete knihovnu v C++, funkce musí být uvozeny blokem `extern "C"`, aby si zachovaly čitelná C jména bez manglování argumentů.

---
<!-- slide: id5, Srovnání rychlosti, WOW, paradigm -->
## Výkonnostní benchmark: Python vs. C (`-O3`)

Změřme výkonnostní rozdíl při spuštění smyčky o $1\,000\,000$ iteracích:

```python
import timeit
import ctypes

# 1. Čistý Python:
def smycka_py(n: int) -> int:
    soucet = 0
    for i in range(n + 1):
        soucet += i
    return soucet

cas_py = min(timeit.repeat(lambda: smycka_py(1_000_000), number=10, repeat=3)) / 10

# 2. C funkce zkompilovaná s -O3:
mylib = ctypes.CDLL("./libmylib.so")
mylib.secti_rada.argtypes = [ctypes.c_int]
mylib.secti_rada.restype = ctypes.c_int

cas_c = min(timeit.repeat(lambda: mylib.secti_rada(1_000_000), number=10, repeat=3)) / 10

print(f"Python čas: {cas_py * 1e3:.2f} ms")
print(f"C (-O3) čas: {cas_c * 1e6:.2f} µs")
print(f"Zrychlení:   {cas_py / cas_c:.0f}×")
```

### Výsledky měření:
- Čistý Python: **~35 ms** na průchod.
- C optimalizované s `-O3`: **~0.03 µs** na průchod (kompilátor GCC použil vektorové instrukce a vzorec pro součet aritmetické řady).
- **Zrychlení překračuje 1 000×**!

---
<!-- slide: id6, Knihovny v jiných jazycích, Skip, newconcept -->
## C-ABI jako univerzální komunikační most

Zásluhou standardu **C Application Binary Interface (C ABI)** můžete z Pythonu přes `ctypes` nebo `cffi` volat knihovny vytvořené v téměř libovolném moderním jazyce, pokud exportují céčkovské funkce:

- **Rust (`extern "C" fn`)**:
  V moderním vývoji nejpopulárnější alternativa k C/C++. Rust garantuje paměťovou bezpečnost bez garbage collectoru a nástroj **PyO3** umožňuje vytvářet nativní CPython moduly s minimální režií.
- **C++ (nanobind / pybind11)**:
  Moderní generátory vazeb pro C++17/C++20, které mapují třídy, STL kontejnery (`std::vector`, `std::map`) a šablony přímo na Python objekty.
- **Fortran (`iso_c_binding` / `f2py`)**:
  Klíčový nástroj ve vědecké sféře pro integraci numerických a fyzikálních simulačních balíků (základ knihoven SciPy).

> [!TIP]
> Pro složitější C/C++ knihovny s mnoha strukturami zvažte použití knihovny **`cffi`** (*C Foreign Function Interface*), která dokáže přímo parsovat hlavičkové soubory `.h` a eliminuje nutnost ručního definování `argtypes`.
