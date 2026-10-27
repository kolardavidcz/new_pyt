<!-- slide: id1, Úvod, Core, basics -->
## Případová studie akcelerace: 2D konvoluční filtrace obrazu

Pro praktické porovnání různých optimalizačních strategií v Pythonu si ukážeme reálnou úlohu z počítačového vidění: **aplikaci 2D konvolučního / korelačního filtru na RGB fotografii**.

Porovnáme 5 různých implementací téhož algoritmu:
1. **Naivní Python + NumPy smyčky** (interpretovaný kód).
2. **Numba JIT** (`@jit`).
3. **Numba AOT s mezipamětí** (`@njit(cache=True)`).
4. **Cython 3.0** (C-kompilace s Typed Memoryviews a rozkrytí úskalí nechtěných alokací).
5. **Čistá vektorizace v NumPy** (posunuté 2D maticové pohledy).

---
<!-- slide: id2, Zadání, Skip, basics -->
## Zadání úlohy: Zostřovací konvoluční filtr (*Sharpening*)

Konvoluční filtrace spočívá v přepočtu hodnoty každého pixelu matice $M[x, y]$ jako váženého součtu jeho okolí $3 \times 3$ pixelů daného konvolučním jádrem (*kernel*):

$$
K = \begin{pmatrix} -1 & -1 & -1 \\ -1 & 8 & -1 \\ -1 & -1 & -1 \end{pmatrix}
$$

Přičtením tohoto laplaceovského filtru k původnímu obrazu ($1 \times M + K$) získáme výslednou zostřovací masku:

$$
K_{\text{sharpen}} = \begin{pmatrix} -1 & -1 & -1 \\ -1 & 9 & -1 \\ -1 & -1 & -1 \end{pmatrix}
$$

Každý nový pixel je roven:
$P_{\text{out}}[x, y] = 9 \cdot P[x, y] - \sum_{\text{okolí}} P[x \pm 1, y \pm 1]$.

---
<!-- slide: id3, Komentáře, Skip, basics -->
## Technická specifika implementace

1. **RGB vrstvy**: Obraz o rozměrech $375 \times 500$ pixelů načtený z knihovny Pillow má v NumPy tvar matice `(375, 500, 3)`. Filtr aplikujeme nezávisle na každý ze 3 barevných kanálů (červený R, zelený G, modrý B).
2. **Okrajový rámeček (*Border handling*)**: Na samotných okrajích obrázku chybí sousední pixely. Abychom kód nekomplikovali paddingem, ořízneme krajní řádek a sloupec. Výsledný obrázek bude mít rozměr $373 \times 498 \times 3$.
3. **Přetečení rozsahu**: Po zostření omezíme hodnoty pixelů do povoleného intervalu $\langle 0, 255 \rangle$ funkcí `np.clip()` a převedeme na `np.uint8`.

---
<!-- slide: id4, Python + Numpy nevektorizovaně, Core, basics -->
## Varianta 1: Naivní Python + NumPy ve vnořených cyklech

Nejpřirozenější zápis začínajícího programátora: dvě vnořené smyčky `for` procházející každý pixel:

```python
#!/usr/bin/env python3
import numpy as np
from PIL import Image

# 1. Načtení obrázku a převod na plovoucí řádovou čárku:
img = Image.open("kvetina.jpg")
data = np.asarray(img, dtype=np.float64)  # shape: (375, 500, 3)

# 2. Zostřovací maska:
maska = np.array([
    [-1.0, -1.0, -1.0],
    [-1.0,  9.0, -1.0],
    [-1.0, -1.0, -1.0]
], dtype=np.float64)

def aplikuj_filtr_naivne(data_2d: np.ndarray, maska: np.ndarray, vystup: np.ndarray) -> None:
    vyska, sirka = data_2d.shape
    for y in range(1, vyska - 1):
        for x in range(1, sirka - 1):
            vyrez = data_2d[y-1:y+2, x-1:x+2]
            vystup[y-1, x-1] = (vyrez * maska).sum()

# 3. Příprava výstupního pole:
h, w, c = data.shape
vystup = np.zeros((h - 2, w - 2, c), dtype=np.float64)

for kanal in range(3):
    aplikuj_filtr_naivne(data[:, :, kanal], maska, vystup[:, :, kanal])

# 4. Uložení výsledku:
vysledek = Image.fromarray(np.clip(vystup, 0, 255).astype(np.uint8))
vysledek.save("zostreno_naivne.jpg")
```

**Doba běhu: ~1.80 s** (interpretovaný overhead $375 \times 500 \times 3 \approx 560\,000$ iterací v Python smyčce).

---
<!-- slide: id5, Numba základní, WOW, newconcept -->
## Varianta 2: Akcelerace pomocí Numba `@jit`

Pouhé přidání dekorátoru `@jit` z knihovny Numba nad funkci `aplikuj_filtr`:

```python
from numba import jit

@jit
def aplikuj_filtr_numba(data_2d: np.ndarray, maska: np.ndarray, vystup: np.ndarray) -> None:
    vyska, sirka = data_2d.shape
    for y in range(1, vyska - 1):
        for x in range(1, sirka - 1):
            vyrez = data_2d[y-1:y+2, x-1:x+2]
            vystup[y-1, x-1] = (vyrez * maska).sum()
```

### Výsledek:
- **Doba běhu: ~0.54 s** (včetně času potřebného pro JIT kompilaci LLVM za běhu).
- Zrychlení **3.3×** bez jakékoliv změny v těle algoritmu!

---
<!-- slide: id6, Numba s mezipamětí, Core, newconcept -->
## Varianta 3: Numba `@njit(cache=True)`

Při opakovaném spouštění skriptu můžeme kompilaci uložit na disk pomocí `cache=True` a vynutit přísný režim bez CPythonu (`nopython=True`):

```python
from numba import njit

@njit(fastmath=True, cache=True)
def aplikuj_filtr_numba_cached(data_2d: np.ndarray, maska: np.ndarray, vystup: np.ndarray) -> None:
    vyska, sirka = data_2d.shape
    for y in range(1, vyska - 1):
        for x in range(1, sirka - 1):
            vyrez = data_2d[y-1:y+2, x-1:x+2]
            vystup[y-1, x-1] = (vyrez * maska).sum()
```

### Výsledek při 2. a dalším běhu:
- Kompilátor přeskočí LLVM překlad a načte hotové instrukce z cache.
- **Doba běhu: ~0.35 s** (čistý výpočet zabírá jen zlomek sekundy, zbytek tvoří I/O načtení JPEG).

---
<!-- slide: id7, Cython I, Tricky, paradigm -->
## Varianta 4: Pokus o Cythonizaci a první překážka

Při pokusu o přepis do Cythonu (`filters.pyx`) definujeme C-typy proměnných a paměťové pohledy (*memoryviews*):

```cython
# filters.pyx
# cython: language_level=3
import numpy as np

def apply_filter(double[:, :] data, double[:, :] maska, double[:, :] output):
    cdef int x, y
    cdef int data_h = data.shape[0]
    cdef int data_w = data.shape[1]
    cdef double[:, :] vyrez

    for y in range(1, data_h - 1):
        for x in range(1, data_w - 1):
            vyrez = data[y-1:y+2, x-1:x+2]
            output[y-1, x-1] = (vyrez * maska).sum()
```

### Chyba kompilátoru:
`filters.pyx: Invalid operand types for '*' (double[:, :]; double[:, :])`

Cython neumožňuje operátor `*` pro přímé násobení dvou `MemoryView` objektů, protože paměťový výřez není souvislý blok paměti (*contiguous C-array*)!

---
<!-- slide: id8, Cython II, Tricky, paradigm -->
## Záludnost Cythonu: Proč selhává naivní oprava?

Pokusíme-li se chybu obejít obalením výřezu do `np.asarray()`:

```cython
output[y-1, x-1] = (np.asarray(vyrez) * np.asarray(maska)).sum()
```

Kompilátor kód přeloží, ale **doba běhu vyskočí na 3.5 sekundy — tedy 2× POMALEJI než v čistém Pythonu!**

### Proč došlo ke zpomalení?
Uvnitř smyčky, která proběhne $560\,000\times$, Cython v každé iteraci:
1. Zavolá Python C-API pro vytvoření nového NumPy objektu `np.asarray()`.
2. Alokuje paměť v haldě (heap) pro dočasné pole.
3. Provede maticový součin a dynamické volání `.sum()`.
4. Garbage collector musí zlikvidovat dočasné objekty.

> [!CAUTION]
> **Základní poučka Cythonu**: Pokud uvnitř těsné smyčky zavoláte jakoukoliv funkci CPython API nebo alokujete Python objekt, veškerá výhoda kompilace do C je ztracena!

---
<!-- slide: id9, Cython III, Tricky, paradigm -->
## Správná Cythonizace: Rozbalení konvoluce do C-smyček

Správné řešení v C/Cythonu vyžaduje eliminovat dynamické maticové operace a nahradit je explicitním skalárním součtem:

```cython
# filters_fast.pyx
# cython: language_level=3
# cython: boundscheck=False, wraparound=False

def apply_filter(double[:, :] data, double[:, :] maska, double[:, :] output):
    cdef int x, y, u, v
    cdef int data_h = data.shape[0]
    cdef int data_w = data.shape[1]
    cdef double soucet

    for y in range(1, data_h - 1):
        for x in range(1, data_w - 1):
            soucet = 0.0
            for u in range(3):
                for v in range(3):
                    soucet += data[y - 1 + u, x - 1 + v] * maska[u, v]
            output[y - 1, x - 1] = soucet
```

Kompilátor vygeneruje čistý C kód bez volání Python C-API (`cython -a` svítí bíle bez žlutého podbarvení).

---
<!-- slide: id10, Cython IV, WOW, newconcept -->
## Výkon správně zkompilovaného Cythonu

Po zkompilování přes `setup.py` / `setuptools`:
```bash
python setup.py build_ext --inplace
```

### Výsledek:
- **Doba běhu klesne na pouhých ~0.14 s!**
- Zrychlení **13×** oproti původnímu Pythonu.
- Kód běží maximální možnou rychlostí nativního procesoru.

Cena za toto zrychlení: nutnost napsat 4 vnořené smyčky a ztratit vysokoúrovňovou expresivitu maticového zápisu.

---
<!-- slide: id11, Cython V, Core, resyntax -->
## Porovnání profilu Cython kódu (`cython -a`)

Nástroj `cython -a soubor.pyx` vygeneruje interaktivní HTML report:
- **Bílé řádky**: Čisté C instrukce s nulovou režií.
- **Žluté řádky**: Místa, kde kód komunikuje s interpretem CPython a počítá reference `PyObject`.

```text
Cython HTML Report:
------------------------------------------------------------------------
Bílá:   for y in range(1, data_h - 1):
Bílá:       for x in range(1, data_w - 1):
Bílá:           soucet += data[y - 1 + u, x - 1 + v] * maska[u, v]
Bílá:           output[y - 1, x - 1] = soucet
------------------------------------------------------------------------
```
Cílem každého vývojáře v Cythonu je dosáhnout zcela bílých řádků uvnitř nejvnitřnějších výpočetních cyklů.

---
<!-- slide: id12, Vektorizace kódu, WOW, pythonic -->
## Varianta 5: Elegantní vektorizace pomocí 2D výřezů (Rougierův trik)

Lze dosáhnout stejné rychlosti jako v C bez kompilátoru a bez psaní Cython kódu? **ANO!**

Využijeme **vektorizaci v NumPy** posunutím 2D pohledů (*strided slicing*):
Místo iterace po jednotlivých pixelech vytvoříme 9 posunutých matic o rozměrech $(H-2) \times (W-2)$ a sečteme je jedním vektorizovaným výrazem:

```python
# Každý z 9 výřezů reprezentuje jeden relativní posun v masce 3x3:
# [-1, -1, -1]
# [-1,  9, -1]
# [-1, -1, -1]
vystup = (
    -data[0:-2, 0:-2] - data[0:-2, 1:-1] - data[0:-2, 2:]
    - data[1:-1, 0:-2] + 9 * data[1:-1, 1:-1] - data[1:-1, 2:]
    - data[2:,   0:-2] - data[2:,   1:-1] - data[2:,   2:]
)
```

Všechny výřezy mají identický rozměr $(373 \times 498)$. NumPy provede veškeré sčítání a násobení v optimalizované SIMD C-smyčce bez zásahu Python interpretu!

---
<!-- slide: id13, Python + Numpy vektorizovaně, WOW, pythonic -->
## Kompletní kód vektorizovaného řešení

```python
#!/usr/bin/env python3
import numpy as np
from PIL import Image

img = Image.open("kvetina.jpg")
data = np.asarray(img, dtype=np.float64)

def aplikuj_filtr_vektorove(d: np.ndarray) -> np.ndarray:
    """Vektorizovaná konvoluce 3x3 bez jediné Python smyčky."""
    return (
        - d[0:-2, 0:-2] - d[0:-2, 1:-1] - d[0:-2, 2:]
        - d[1:-1, 0:-2] + 9.0 * d[1:-1, 1:-1] - d[1:-1, 2:]
        - d[2:,   0:-2] - d[2:,   1:-1] - d[2:,   2:]
    )

# Aplikace na všechny 3 kanály:
h, w, c = data.shape
out = np.zeros((h - 2, w - 2, c), dtype=np.float64)
for i in range(3):
    out[:, :, i] = aplikuj_filtr_vektorove(data[:, :, i])

vysledek = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
vysledek.save("zostreno_vektorove.jpg")
```

**Doba běhu: ~0.16 s!** Rychlost je prakticky totožná s optimalizovaným Cythonem, ale zdrojový kód zůstává 100% čistým a přenosným Pythonem.

---
<!-- slide: id14, Srovnání, Core, paradigm -->
## Velké srovnání výsledků

| Implementace | Doba běhu | Relativní zrychlení | Nutnost C toolchainu? | Čitelnost kódu |
|---|---|---|---|---|
| **Python + NumPy (nevektorizovaně)** | 1.80 s | $1\times$ | Ne | Průměrná |
| **Numba `@jit` (první běh)** | 0.54 s | $3.3\times$ | Ne (LLVM v balíčku) | Vynikající |
| **Numba `@njit` (s cache)** | 0.35 s | $5.1\times$ | Ne | Vynikající |
| **Naivní Cython (objekty ve smyčce)** | 3.50 s | **$0.5\times$ (zpomalení!)** | Ano | Špatná |
| **Optimalizovaný Cython (C-smyčky)** | **0.14 s** | **$13\times$** | Ano | Nízká (C-styl) |
| **NumPy vektorizace (výřezy)** | **0.16 s** | **$11.3\times$** | **Ne** | **Kompaktní & Pythonic** |

---
<!-- slide: id15, Závěr, Core, paradigm -->
## Ponaučení pro praxi: Jak volit optimalizační strategii?

1. **Vektorizace je král**: Pokud lze úlohu vyjádřit pomocí maticových operací a výřezů v NumPy, získáte rychlost C bez nutnosti externích kompilátorů.
2. **Numba je nejlepší zkratka**: Pokud algoritmus nelze snadno vektorizovat (např. složité větvení, rekurze, grafy), dekorátor `@njit` nabízí obrovské zrychlení za minimální úsilí.
3. **Pozor na naivní Cythonizaci**: Pouhé přidání typových anotací do Python kódu často nepomůže — vyžaduje hluboké pochopení C-paměti a odstranění všech `PyObject` alokací z těla cyklu.
4. **Měřte vždy v kontextu celku**: Pokud program tráví 90 % času načítáním souborů z disku nebo síťovým přenosem, mikrosekundová optimalizace CPU jádra celkový uživatelský dojem nezmění.
