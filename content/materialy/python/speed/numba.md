<!-- slide: id1, Úvod, Core, newconcept -->
## Úvod do knihovny Numba: JIT kompilace do strojového kódu

[**Numba**](https://numba.pydata.org) je open-source JIT (*Just-In-Time*) kompilátor pro Python, který překládá podmnožinu jazyka Python a operace nad poli **NumPy** přímo do optimalizovaného **strojového kódu** procesoru (nebo GPU) za běhu.

Využívá k tomu průmyslový kompilátor **LLVM** (stejný backend jako pro Clang, Rust a Swift).

Klíčové vlastnosti:
- **Rychlost srovnatelná s C/C++ a Fortranem**: Čisté numerické smyčky a maticové operace běží na plné rychlosti hardwaru.
- **Nulový přepis do jiného jazyka**: Kód zůstává 100% čistým Pythonem – stačí přidat dekorátor `@njit`.
- **Automatická paralelizace**: Podpora více vláken CPU přes `prange` i akcelerace na grafických kartách NVIDIA přes CUDA.

```python
from numba import njit
import numpy as np
```

---
<!-- slide: id2, Poznámka k instalaci, Skip, basics -->
## Instalace knihovny Numba

Numba vyžaduje přesně slícovanou verzi mezivrstvy `llvmlite` a kompilátoru LLVM. V moderních prostředích jsou k dispozici předkompilované binární balíčky (*wheels*):

```bash
# Instalace přes uv (doporučeno):
uv add numba

# Nebo přes pip:
pip install numba

# V prostředí Anaconda / Miniconda:
conda install numba
```

> [!NOTE]
> Pro akceleraci na GPU stačí nainstalovat CUDA toolkit (`conda install cuda-toolkit -c nvidia` nebo ovladače od výrobce grafické karty).

---
<!-- slide: id3, „@jit“, Core, newconcept -->
## Základní dekorátor `@jit`: Líná kompilace (*Lazy Compilation*)

Nejjednodušší použití spočívá v odekorování čistě numerické funkce:

```python
from numba import jit
import time

@jit
def monte_carlo_pi(nsamples):
    acc = 0
    for i in range(nsamples):
        x = np.random.random()
        y = np.random.random()
        if (x**2 + y**2) < 1.0:
            acc += 1
    return 4.0 * acc / nsamples

# První volání: Numba zjistí typy argumentů a zkompiluje funkci přes LLVM
pi_val = monte_carlo_pi(10_000_000)

# Druhé a další volání: Běží již přímo v nativním strojovém kódu!
```

Při prvním spuštění dojde ke krátké prodlevě způsobené kompilací (*compilation overhead*). Všechna následující volání jsou však $50\times$ až $200\times$ rychlejší než standardní interpret CPythonu.

---
<!-- slide: id4, „@jit“ s typovou anotací, Tricky, resyntax -->
## Eager kompilace s explicitní signaturou

Nechcete-li kompilaci odkládat na okamžik prvního zavolání, můžete typy parametrů a návratové hodnoty předepsat explicitně do dekorátoru:

```python
from numba import jit, int32, float64

# Signatura: návratový_typ(typ_arg1, typ_arg2)
@jit(float64(float64, int32))
def power_sum(base, exponent):
    total = 0.0
    for i in range(exponent):
        total += base ** i
    return total
```

> [!WARNING]
> Při explicitním předepsání celočíselných typů (např. `int16`) se funkce chová jako v C – čísla mohou přetéct bez vyvolání výjimky:
> ```python
> @jit(int16(int16, int16))
> def add(a, b):
>     return a + b
>
> print(add(32767, 1))
> # -32768 (přetečení 16-bitového čísla!)
> ```

---
<!-- slide: id5, „@jit(nopython=True)“, WOW, paradigm -->
## `nopython` režim vs. `object` režim: Proč vždy používat `@njit`

Numba může kód kompilovat ve dvou různých režimech:
1. **`nopython mode`**: Generuje čistý strojový kód bez jakékoliv závislosti na CPython runtime a bez alokace pythonních objektů. Dosahuje maximálního možného zrychlení.
2. **`object mode`**: Pokud kód obsahuje nepodporované Python objekty (např. obecné slovníky, cizí třídy, nepodporované knihovny), Numba spadne do pomalého kompatibilního režimu, který v podstatě nepřináší žádné zrychlení.

> [!IMPORTANT]
> **Moderní standard: Používejte `@njit`!**
> Dekorátor `@njit` je alias pro `@jit(nopython=True)`. Pokud kód nelze zkompilovat do nativního kódu bez CPythonu, Numba okamžitě vyhodí výjimku, místo aby tiše spadla do pomalého `object mode`.

```python
from numba import njit

@njit
def fast_filter(arr, threshold):
    result = []
    for x in arr:
        if x > threshold:
            result.append(x)
    return np.array(result)
```

---
<!-- slide: id6, „@jit“ – souhrn, WOW, newconcept -->
## Parametry dekorátoru `@njit`

Plná syntaxe dekorátoru nabízí pokročilé přepínače:

```python
from numba import njit

@njit(
    nogil=True,         # Uvolní GIL: funkce může běžet souběžně v jiném vlákně
    cache=True,         # Uloží zkompilovanou binárku do __pycache__ (přežije restart skriptu)
    fastmath=True,      # Povolí agresivní IEEE 754 floating-point optimalizace
    parallel=True       # Povolí automatickou paralelizaci a podporu prange
)
def compute(data):
    ...
```

Vysvětlení klíčových parametrů:
- `nogil=True`: Během výpočtu uvolní Global Interpreter Lock. Jiná Python vlákna mohou paralelně zpracovávat I/O nebo GUI.
- `fastmath=True`: Povolí kompilátoru transformace plovoucí řádové čárky (např. asociativní přerovnání sčítání, vektorové instrukce AVX2/AVX-512), což výrazně zrychluje matematické vzorce.
- `cache=True`: Uloží zkompilovaný binární kód na disk, takže při dalším startu programu nedochází k žádné úvodní latenci.

---
<!-- slide: id7, „@vectorize“, WOW, newconcept -->
## Tvorba NumPy Universal Functions: `@vectorize`

V kapitole o NumPy jsme se seznámili s ufuncs (`np.sin`, `np.add`), které automaticky aplikují skalární operaci na pole libovolné dimenze s podporou broadcastingu.

Dekorátor **`@vectorize`** z Numby dokáže z obyčejné skalární funkce vytvořit plnohodnotný, bleskově rychlý C-level **`ufunc`**:

```python
from numba import vectorize, float64
import numpy as np

# Definujeme skalární matematickou funkci pro 2 čísla
@vectorize([float64(float64, float64)], target='cpu')
def relu_diff(x, y):
    diff = x - y
    return diff if diff > 0 else 0.0

# Použití přímo nad vícerozměrnými poli NumPy:
a = np.array([1.5, 3.0, 5.0, 7.0])
b = np.array([2.0, 2.0, 4.0, 9.0])

print(relu_diff(a, b))
# [0.  1.  1.  0.]

# Automatický broadcasting skaláru a 2D pole:
matrix = np.ones((1000, 1000)) * 5.0
print(relu_diff(matrix, 3.0).shape)
# (1000, 1000)
```

Target může být dokonce `'parallel'` (vícejádrový CPU) nebo `'cuda'` (spuštění přímo na jádrech grafické karty!).

---
<!-- slide: id8, „@guvectorize“, WOW, newconcept -->
## Generalized Universal Functions: `@guvectorize`

Zatímco `@vectorize` pracuje se skaláry ($1 \to 1$), dekorátor **`@guvectorize`** umožňuje psát operace, které transformují celá podpole (např. řádky matice, klouzavé filtry, polynomiální regrese).

Vyžaduje zápis signatury ve formátu dimenzí (např. `(n)->()` nebo `(n),(n)->(n)`):

```python
from numba import guvectorize, int64
import numpy as np

# Signatura: bere 1D pole délky n, vrací skalární sumu do výstupního parametru res
@guvectorize([(int64[:], int64[:])], '(n)->()')
def row_sum(arr, res):
    total = 0
    for i in range(arr.shape[0]):
        total += arr[i]
    res[0] = total

matrix = np.arange(12, dtype=np.int64).reshape(3, 4)
# [[ 0,  1,  2,  3],
#  [ 4,  5,  6,  7],
#  [ 8,  9, 10, 11]]

print(row_sum(matrix))
# [ 6 22 38]
```

---
<!-- slide: id9, Paralelizace a Numba v praxi, WOW, newconcept -->
## Vícevláknová paralelizace s `prange`

Pro náročné smyčky na vícejádrových procesorech nabízí Numba ekvivalent OpenMP prostřednictvím funkce **`prange`** (parallel range) a parametru `parallel=True`:

```python
from numba import njit, prange
import numpy as np

@njit(parallel=True, fastmath=True)
def parallel_distance_matrix(points):
    n = points.shape[0]
    dist_matrix = np.zeros((n, n), dtype=np.float64)
    
    # prange automaticky rozdělí iterace mezi všechna dostupná CPU jádra
    for i in prange(n):
        for j in range(n):
            dx = points[i, 0] - points[j, 0]
            dy = points[i, 1] - points[j, 1]
            dist_matrix[i, j] = (dx*dx + dy*dy) ** 0.5
            
    return dist_matrix

pts = np.random.rand(5000, 2)
# Spustí se paralelně na všech dostupných jádrech procesoru bez režie GILu!
distances = parallel_distance_matrix(pts)
```

### Kdy zvolit Numbu?
- Máte numerické smyčky v Pythonu, které nelze snadno vektorizovat v NumPy bez gigantických dočasných matic.
- Potřebujete obrovské zrychlení bez nutnosti kompilovat externí C/C++ knihovny nebo psát Cython kód.
- Chcete snadno paralelizovat výpočty na všechna jádra procesoru pomocí `parallel=True`.
