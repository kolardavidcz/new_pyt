<!-- slide: id1, Úvod, Core, paradigm -->
## Úvod do tvorby polí v NumPy

Vícerozměrné homogenní pole **`ndarray`** je základním stavebním kamenem knihovny *NumPy* a celého moderního vědecko-technického ekosystému Pythonu (SciPy, Pandas, Scikit-learn, PyTorch).

Všechny prvky v poli `ndarray` sdílejí stejný datový typ (**`dtype`**) a jsou uloženy v souvislém paměťovém bloku (*contiguous memory buffer*). To umožňuje:
- Rychlost srovnatelnou s čistým C/C++ nebo Fortranem.
- Vektorizované výpočty s minimálním paměťovým overheadem.
- Přímé mapování na optimalizované nízkoúrovňové lineárně-algebraické knihovny (BLAS, LAPACK).

V této přednášce si představíme způsoby vytváření polí, zkoumání jejich rozměrů a paměťových kroků (*strides*), generování speciálních matic i strukturované datové typy.

```python
import numpy as np

# Konvence: numpy importujeme vždy jako 'np'
```

---
<!-- slide: id2, I. Ruční výroba 1D-polí, Core, basics -->
## Ruční konstrukce 1D polí (`np.array`)

Základní konstruktor **`np.array()`** přijímá libovolný sekvenční či iterovatelný objekt (seznam, n-tici, generátor či `range`):

```python
import numpy as np

# 1. Ze standardního seznamu:
a = np.array([1, 3, 5, 7, 9])
print(a)  # [1 3 5 7 9]

# 2. Z n-tice:
b = np.array((1, 3, 5, 7, 9))

# 3. Z iterátoru range:
c = np.array(range(5))
print(c)  # [0 1 2 3 4]
```

> [!NOTE]
> V C/C++ odpovídá 1D `ndarray` souvislému poli `int arr[5]`. V Pythonu však běžný `list` drží pole ukazatelů na plnohodnotné objekty `PyObject*`. Konstruktor `np.array()` projde zadanou sekvenci a zkopíruje její surová čísla do kompaktního paměťového bloku.

---
<!-- slide: id3, Ruční výroba nD-polí, Core, resyntax -->
## Ruční tvorba vícerozměrných polí

Vícerozměrná pole vytváříme vnořením seznamů. Všechny vnitřní seznamy na dané úrovni musí mít **stejnou délku** (pole musí být pravoúhlé / kvádrové):

```python
import numpy as np

# 2D pole (matice 2 řádky × 3 sloupce):
mat = np.array([
    [1, 2, 3],
    [4, 5, 6]
])
print(mat)
# [[1 2 3]
#  [4 5 6]]

# 3D pole (tenzor tvaru 2 × 2 × 2):
tenzor = np.array([
    [[1, 2], [3, 4]],
    [[5, 6], [7, 8]]
])
print(tenzor.shape)  # (2, 2, 2)
```

> [!WARNING]
> Od NumPy 1.20+ je zakázáno vytvářet "zubatá" pole (ragged arrays s nestejně dlouhými vnitřními seznamy) bez explicitního nastavení `dtype=object`. Vždy dbejte na konzistentní geometrii dimenzí.

---
<!-- slide: id4, „tolist()“, Skip, basics -->
## Převod pole na Python seznam: `tolist()`

Pokud potřebujete data z `ndarray` vrátit zpět do standardního ekosystému Pythonu (např. pro serializaci do JSON přes modul `json`), použijte metodu **`.tolist()`**:

```python
import numpy as np

x = np.array([[1, 2, 3], [4, 5, 6]])

# Převod na vnořený Python list:
py_list = x.tolist()
print(py_list)
# [[1, 2, 3], [4, 5, 6]]
print(type(py_list))        # <class 'list'>
print(type(py_list[0][0]))  # <class 'int'> (nativní Python int, nikoliv np.int64)
```

> [!NOTE]
> Ačkoliv se `ndarray` při formátování textu tváří podobně jako seznam, `list(x)` by pouze rozbalil první dimenzi na pole `ndarray` řádků. Metoda `x.tolist()` rekurzivně převede celou strukturu včetně skalárních hodnot.

---
<!-- slide: id5, II. Vlastnosti pole – „shape“, „ndim“, „size“, Core, basics -->
## Vlastnosti pole: `shape`, `ndim`, `size`

Každý objekt `ndarray` má klíčové atributy popisující jeho geometrii a kapacitu:

- **`shape`**: n-tice celých čísel udávající počet prvků v každé dimenzi (např. `(řádky, sloupce)`).
- **`ndim`**: celkový počet dimenzí (tzv. *rank* nebo řád tenzoru, roven `len(shape)`).
- **`size`**: celkový počet prvků v celém poli (součin hodnot v `shape`).

```python
import numpy as np

x = np.array([
    [10, 20, 30],
    [40, 50, 60]
])

print(f"{x.shape=}")  # x.shape=(2, 3)
print(f"{x.ndim=}")   # x.ndim=2
print(f"{x.size=}")   # x.size=6
```

---
<!-- slide: id6, Příklady, Skip, basics -->
## Příklady rozměrů v 1D a 2D

Rozdíl mezi 1D vektorem a 2D maticí o jednom řádku:

```python
import numpy as np

# 1D vektor (má pouze jednu osu):
vec = np.array([1, 2, 3])
print(vec.shape)  # (3,)  <- všimněte si jednoprvkové n-tice!
print(vec.ndim)   # 1
print(vec.size)   # 3

# 2D řádkový vektor (matice 1 × 3):
row = np.array([[1, 2, 3]])
print(row.shape)  # (1, 3)
print(row.ndim)   # 2

# 2D sloupcový vektor (matice 3 × 1):
col = np.array([[1], [2], [3]])
print(col.shape)  # (3, 1)
print(col.ndim)   # 2
```

> [!TIP]
> Pro lineární algebru a broadcasting je rozdíl mezi `(3,)` a `(1, 3)` či `(3, 1)` zásadní. 1D pole `(3,)` nemá orientaci řádek/sloupec.

---
<!-- slide: id7, Interní velikost prvku – „itemsize“, Core, basics -->
## Datové typy a paměťová velikost: `itemsize`

Atribut **`itemsize`** udává velikost **jednoho prvku v bajtech**:

```python
import numpy as np

# Moderní standardy typů (NumPy 2.0+):
a = np.array([1, 2, 3], dtype=np.int32)
print(a.itemsize)  # 4 bajty (32 bitů)

b = np.array([1.0, 2.0, 3.0], dtype=np.float64)
print(b.itemsize)  # 8 bajtů (64 bitů)

c = np.array([1+2j, 3+4j], dtype=np.complex128)
print(c.itemsize)  # 16 bajtů (2 × 64bit float)
```

> [!WARNING]
> **Změna v NumPy 2.0**: Staré aliasy `np.float`, `np.int`, `np.complex` byly definitivně odstraněny. Používejte buď vestavěné typy Pythonu (`float`, `int`, `complex`), nebo explicitní velikosti z NumPy (`np.float32`, `np.float64`, `np.int32`, `np.int64`).

---
<!-- slide: id8, III. Iterace po skupinách – „for-in“, Core, basics -->
## Iterace přes pole pomocí `for-in`

Při standardní iteraci `for item in array:` prochází smyčka vždy podél **první osy** (`axis=0`):

```python
import numpy as np

# 2D pole: iterace probíhá po řádcích
m = np.array([
    [1, 2, 3],
    [4, 5, 6]
])

for row in m:
    print(row)
# [1 2 3]
# [4 5 6]

# 3D pole: iterace vrací 2D řezy (matice)
t = np.arange(8).reshape(2, 2, 2)
for matrix in t:
    print("--- 2D řez ---")
    print(matrix)
```

> [!IMPORTANT]
> Iterovat přes prvky `ndarray` v Python cyklu `for` je **antipattern**! Pokud chcete provést matematickou operaci, použijte vektorizované operace nebo ufunc. Python smyčky eliminují rychlostní výhodu C knihoven.

---
<!-- slide: id9, „for-in“ a rozbalování do n-tic, Skip, pythonic -->
## Rozbalování n-tic při iteraci

Podobně jako u běžných seznamů lze řádky pole při iteraci rozbalovat přímo do proměnných (*unpacking*):

```python
import numpy as np

x = np.array([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
])

# Rozbalení trojic hodnot v každém řádku:
for a, b, c in x:
    print(f"{a} | {b} | {c}")
# 1 | 2 | 3
# 4 | 5 | 6
# 7 | 8 | 9
```

> [!NOTE]
> Rozbalování funguje spolehlivě, pokud počet proměnných odpovídá počtu sloupců (`x.shape[1]`). Při nesouladu Python vyvolá `ValueError: too many values to unpack`.

---
<!-- slide: id10, Iterace přes prvky – „flat“, „flatten()“, „ravel()“, Tricky, pythonic -->
## Zploštění pole: `flat`, `flatten()` a `ravel()`

Pokud přesto potřebujete pole projít po jednotlivých prvcích jako 1D sekvenci, existují tři přístupy:

```python
import numpy as np

x = np.array([[1, 2, 3], [4, 5, 6]])

# 1. x.flat -> 1D iterátor bez alokace paměti:
for val in x.flat:
    print(val, end=" ")
# 1 2 3 4 5 6
print()

# 2. x.flatten() -> VŽDY vytvoří novou samostatnou kopii (copy) v paměti:
y_copy = x.flatten()

# 3. x.ravel() -> Vytvoří 1D pohled (view), kopíruje POUZE v případě nutnosti:
y_view = x.ravel()
```

| Metoda | Vrací | Vytváří kopii? | Doporučení |
| :--- | :--- | :--- | :--- |
| `x.flat` | `flatiter` | Ne | Pro úspornou iteraci prvek po prvku |
| `x.flatten()` | `ndarray` (1D) | **Vždy ano** | Když potřebujete nezávislá data |
| `x.ravel()` | `ndarray` (1D) | **Jen pokud je paměť nespojitá** | **Doporučeno** pro maximální rychlost |

---
<!-- slide: id11, Komentář k uložení dat, Tricky, newconcept -->
## Pohled vs. Kopie v paměti (`base`)

Zda pole sdílí paměť s originálem, můžeme ověřit pomocí atributu **`.base`**:

```python
import numpy as np

x = np.array([[1, 2, 3], [4, 5, 6]])

y_flatten = x.flatten()  # Nová kopie
y_ravel = x.ravel()      # Pohled (view)

print(y_flatten.base is None)  # True -> vlastní paměť, je nezávislý
print(y_ravel.base is x)        # True -> ukazuje přímo do paměti 'x'!

# Změna v pohledu ovlivní původní pole:
y_ravel[0] = 999
print(x[0, 0])  # 999! (modifikace se projevila v originálu)
```

> [!CAUTION]
> Na rozdíl od běžných řezů v Python seznamech (`a[:]`), které vytvářejí mělkou kopii, řezy a `ravel()` v NumPy vytvářejí **pohledy (views)**. Úprava dat v pohledu mění původní pole!

---
<!-- slide: id12, „tobytes()“ versus „save()“ a „load()“, Core, pythonic -->
## Binární reprezentace a ukládání: `tobytes()`, `save()` a `load()`

Pole můžeme převést na surový řetězec bajtů metodou **`.tobytes()`** (dříve `tostring()`):

```python
import numpy as np

x = np.array([[1, 2], [3, 4]], dtype=np.int32)

# Surová binární reprezentace v paměti (C-order: po řádcích):
raw_bytes = x.tobytes()
print(len(raw_bytes))  # 4 prvky × 4 bajty = 16 bajtů
```

Pro trvalé a přenositelné ukládání na disk slouží nativní formát **`.npy`** (či komprimovaný archív **`.npz`**):

```python
from pathlib import Path
import numpy as np

soubor = Path("data.npy")

# Uložení pole včetně metadat (shape, dtype, order):
np.save(soubor, x)

# Načtení pole zpět:
nacteno = np.load(soubor)
print(nacteno)
# [[1 2]
#  [3 4]]

soubor.unlink(missing_ok=True)  # Úklid
```

---
<!-- slide: id13, IV. Další atributy polí, Skip, newconcept -->
## Pokročilé atributy: `T` a `flags`

Objekt `ndarray` nabízí nízkoúrovňové atributy pro kontrolu paměťového rozvržení:

```python
import numpy as np

x = np.array([[1, 2, 3], [4, 5, 6]])

# 1. Transpozice pole (prohození os):
print(x.T)
# [[1 4]
#  [2 5]
#  [3 6]]

# 2. Informace o paměťových příznacích:
print(x.flags)
# C_CONTIGUOUS : True   (uloženo po řádcích jako v C)
# F_CONTIGUOUS : False  (uloženo po sloupcích jako ve Fortranu)
# OWNDATA : True        (pole vlastní svůj paměťový blok)
# WRITEABLE : True      (data lze modifikovat)
```

> [!NOTE]
> `x.T` nevytváří žádnou kopii dat. Pouze prohodí položky v n-tici `shape` a `strides`. Transpozice je operace s časovou složitostí $O(1)$.

---
<!-- slide: id14, V. Pole z externích dat, Skip, basics -->
## Načítání polí z externích datových zdrojů

V praxi pole nevytváříme ručně, ale načítáme z externích zdrojů:
- Textové soubory (CSV, TSV, formátované sloupce čísel).
- Binární vědecké formáty (HDF5, NetCDF, FITS, TIFF).
- Relační databáze a datové toky (REST API, senzory).

NumPy nabízí funkce pro rychlé parsování textových tabulek (`np.loadtxt`, `np.genfromtxt`), které interně alokují C pole a přímo do něj parsují hodnoty.

---
<!-- slide: id15, „loadtxt()“, Core, pythonic -->
## Načítání textových souborů: `np.loadtxt`

Funkce **`np.loadtxt()`** slouží k načítání jednoduchých textových souborů bez chybějících hodnot:

```python
from pathlib import Path
import numpy as np

data_path = Path("mereni.csv")
data_path.write_text("1.5, 2.3, 3.8\n4.1, 5.0, 6.2\n", encoding="utf-8")

# Načtení pole s určením oddělovače:
arr = np.loadtxt(data_path, delimiter=",")
print(arr)
# [[1.5 2.3 3.8]
#  [4.1 5.0 6.2]]
print(arr.shape)  # (2, 3)

data_path.unlink(missing_ok=True)
```

> [!TIP]
> Pro reálná tabularní data s chybějícími hodnotami (NaN), smíšenými typy nebo hlavičkami je v moderním Pythonu výrazně robustnější použít **`pandas.read_csv()`** či `polars.read_csv()`, a výsledek v případě potřeby převést na pole pomocí `.to_numpy()`.

---
<!-- slide: id16, VI. Speciální funkce pro tvorbu polí, Skip, basics -->
## Generátory speciálních polí

NumPy poskytuje bohatou sadu funkcí pro inicializaci polí bez nutnosti psát cykly:
- Nulová pole: **`np.zeros()`**
- Jednotková pole: **`np.ones()`**
- Pole s konstantní hodnotou: **`np.full()`**
- Jednotkové diagonální matice: **`np.eye()`**, **`np.identity()`**
- Číselné sekvence: **`np.arange()`**, **`np.linspace()`**, **`np.logspace()`**

Podívejme se na jejich přesné chování a parametry.

---
<!-- slide: id17, „zeros()“, Core, basics -->
## Nulová pole: `np.zeros()`

Vytvoří pole zadaného tvaru naplněné nulami (`0.0`):

```python
import numpy as np

# 1D vektor (3 prvky, výchozí float64):
v = np.zeros(3)
print(v)  # [0. 0. 0.]

# 2D matice 2 × 3:
m = np.zeros((2, 3))
print(m)
# [[0. 0. 0.]
#  [0. 0. 0.]]

# Celočíselné 3D pole:
t = np.zeros((2, 3, 2), dtype=int)
print(t.dtype)  # int64
```

> [!NOTE]
> Existuje také funkce `np.empty((2, 3))`, která alokuje paměť v operačním systému bez její inicializace. Je nepatrně rychlejší než `zeros()`, ale prvky obsahují náhodná zbytková data (*garbage memory*).

---
<!-- slide: id18, „ones()“ & „full()“, Core, basics -->
## Jednotková a konstantní pole: `np.ones()` a `np.full()`

```python
import numpy as np

# Pole samých jedniček:
jednotky = np.ones((2, 3), dtype=np.float32)
print(jednotky)
# [[1. 1. 1.]
#  [1. 1. 1.]]

# Pole naplněné libovolnou konstantou:
sedmicky = np.full((2, 3), 7)
print(sedmicky)
# [[7 7 7]
#  [7 7 7]]

# Inicializace pole nekonečny (np.inf):
nekon = np.full((2, 2), np.inf)
print(nekon)
# [[inf inf]
#  [inf inf]]
```

---
<!-- slide: id19, „identity()“ & eye()“ & tri()“, Core, basics -->
## Diagonální a trojúhelníkové matice: `identity`, `eye`, `tri`

Pro lineární algebru nabízí NumPy předpřipravené maticové šablony:

```python
import numpy as np

# 1. Čtvercová jednotková matice I (identita n × n):
I = np.identity(3)

# 2. Obecná matice s jedničkami na diagonále (může být i obdélníková):
# k=0 hlavní diagonála, k>0 posun nahoru, k<0 posun dolů
diag_up = np.eye(3, k=1)
print(diag_up)
# [[0. 1. 0.]
#  [0. 0. 1.]
#  [0. 0. 0.]]

# 3. Dolní trojúhelníková matice:
dolni = np.tri(3)
print(dolni)
# [[1. 0. 0.]
#  [1. 1. 0.]
#  [1. 1. 1.]]
```

---
<!-- slide: id20, „arange()“, Core, basics -->
## Číselné řady s krokem: `np.arange()`

Funguje jako vestavěný `range(start, stop, step)`, ale vrací přímo `ndarray` a **podporuje desetinná čísla**:

```python
import numpy as np

# arange(stop)
a = np.arange(5)
print(a)  # [0 1 2 3 4]

# arange(start, stop, step)
b = np.arange(2, 10, 2)
print(b)  # [2 4 6 8]

# S desetinným krokem:
c = np.arange(0.0, 1.0, 0.2)
print(c)  # [0.  0.2 0.4 0.6 0.8]
```

> [!WARNING]
> Kvůli zaokrouhlovacím chybám v plovoucí řádové čárce (*floating-point rounding*) může být u desetinného kroku počet prvků v `np.arange()` nepředvídatelný. Pro reálná čísla **vždy preferujte `np.linspace()`**!

---
<!-- slide: id21, „linspace()“ & „logspace()“, WOW, pythonic -->
## Ekvidištanční dělení: `np.linspace()` a `np.logspace()`

Zatímco `arange()` vyžaduje velikost kroku, **`np.linspace(start, stop, num)`** vyžaduje **počet bodů** a konec intervalu je ve výchozím stavu **včetně** (*inclusive*):

```python
import numpy as np

# 1. Lineárně rozložené body od 0 do 1 (přesně 5 bodů):
body = np.linspace(0.0, 1.0, num=5)
print(body)  # [0.   0.25 0.5  0.75 1.  ]

# 2. Logaritmicky rozložené body od 10^0 do 10^3 (4 body):
log_body = np.logspace(0, 3, num=4)
print(log_body)  # [   1.   10.  100. 1000.]

# Se základem 2 (od 2^1 do 2^4):
log2_body = np.logspace(1, 4, num=4, base=2)
print(log2_body)  # [ 2.  4.  8. 16.]
```

> [!TIP]
> `np.linspace` je nejpoužívanější funkce pro generování os $x$ při vykreslování matematických funkcí v Matplotlibu: `x = np.linspace(0, 2 * np.pi, 200)`.

---
<!-- slide: id22, „reshape()“, Core, pythonic -->
## Změna tvaru pole: `reshape()`

Metoda **`.reshape()`** změní tvar pole bez změny dat. Pokud to paměť dovolí, vrací nový pohled (*view*):

```python
import numpy as np

a = np.arange(8)  # [0, 1, 2, 3, 4, 5, 6, 7]

# Změna na matici 2 × 4:
b = a.reshape(2, 4)
print(b)
# [[0 1 2 3]
#  [4 5 6 7]]

# Automatický dopočet jedné dimenze pomocí -1:
c = a.reshape(4, -1)  # Celkem 8 prvků / 4 řádky -> automaticky 2 sloupce
print(c.shape)        # (4, 2)
```

> [!CAUTION]
> Celkový počet prvků (`size`) musí zůstat přesně stejný ($2 \times 4 = 8$). Pokud nesedí, NumPy vyvolá `ValueError: cannot reshape array of size 8 into shape (3, 3)`.

---
<!-- slide: id23, Poznámka – kroky aneb „strides“, Tricky, paradigm -->
## Paměťové rozložení a kroky (`strides`)

Všechna data v `ndarray` jsou v paměti RAM uložena **v 1D posloupnosti bajtů**.
Kroky (**`strides`**) udávají, o **kolik bajtů v paměti** se musí čtecí ukazatel posunout při přechodu na další prvek v dané dimenzi:

Pro 2D pole s prvky typu `uint16` (2 bajty na prvek):
```python
import numpy as np

arr = np.arange(8, dtype=np.uint16).reshape(2, 4)
print(arr.strides)  # (8, 2)
```

- Posun o 1 sloupec doprava (`j + 1`): posun o **2 bajty** v paměti.
- Posun o 1 řádek dolů (`i + 1`): posun o $4 \times 2 =$ **8 bajtů** v paměti.

> [!NOTE]
> Výpočet adresy prvku `arr[i, j]` v paměti CPythonu je prostý skalární součin:
> $$\text{offset} = i \cdot \text{strides}[0] + j \cdot \text{strides}[1]$$
> Díky tomu je transpozice `arr.T` jen prohození hodnot v n-tici `strides: (2, 8)` bez kopírování dat!

---
<!-- slide: id24, „random()“ a další, Core, basics -->
## Generování náhodných čísel: Moderní `default_rng()`

V moderním NumPy (1.17+ a 2.0+) se již **nepoužívají** staré funkce `np.random.random()` a `np.random.seed()`. Standardem je generátor **`np.random.default_rng()`**:

```python
import numpy as np

# 1. Vytvoření náhodného generátoru (s volitelným seedem pro reprodukovatelnost):
rng = np.random.default_rng(seed=42)

# Náhodná čísla z rovnoměrného rozdělení U(0, 1):
u = rng.random((2, 3))

# Celá náhodná čísla v intervalu [low, high):
cele = rng.integers(1, 10, size=(2, 3))
print(cele)
# [[1 8 5]
#  [4 8 8]]

# Náhodný výběr ze seznamu:
volba = rng.choice(["C", "C++", "Java", "Python"], size=2)
print(volba)
```

> [!TIP]
> `default_rng()` používá moderní 128bitový algoritmus **PCG64** namísto starého Mersenne Twisteru (MT19937). Je statisticky kvalitnější, bezpečnější pro paralelní vlákna a až $4\times$ rychlejší.

---
<!-- slide: id25, „diag()“, Skip, basics -->
## Práce s diagonálou: `np.diag()`

Funkce **`np.diag()`** plní dvojí roli podle toho, jaký vstup obdrží:

```python
import numpy as np

# 1. Ze zadaného 1D vektoru vytvoří diagonální matici:
v = np.array([10, 20, 30])
mat = np.diag(v)
print(mat)
# [[10  0  0]
#  [ 0 20  0]
#  [ 0  0 30]]

# 2. Z existující 2D matice extrahuje její hlavní diagonálu do 1D vektoru:
diagonala = np.diag(mat)
print(diagonala)  # [10 20 30]

# Posun diagonály nahoru (k=1):
print(np.diag(mat, k=1))  # [0 0]
```

---
<!-- slide: id26, VII. Skládání a rozkládání polí, Skip, basics -->
## Skládání a dělení polí

Kromě přímé tvorby můžeme nová pole vytvářet spojováním nebo dělením existujících:
- **`np.concatenate()`**: spojí sekvenci polí podél existující osy.
- **`np.stack()`**: spojí pole stejného tvaru podél **nové** dimenze.
- **`np.block()`**: sestaví blokovou matici z podmatic.
- **`np.split()`**: rozdělí pole na několik menších podpolí.

---
<!-- slide: id27, „concatenate()“, Core, pythonic -->
## Spojování polí: `np.concatenate()`

Spojuje pole podél zadané osy (`axis=0` je výchozí):

```python
import numpy as np

a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6]])

# 1. Spojení podél řádků (přidání nových řádků dolů, axis=0):
c0 = np.concatenate((a, b), axis=0)
print(c0)
# [[1 2]
#  [3 4]
#  [5 6]]

# 2. Spojení podél sloupců (přidání doprava, axis=1):
d = np.array([[10], [20]])
c1 = np.concatenate((a, d), axis=1)
print(c1)
# [[ 1  2 10]
#  [ 3  4 20]]
```

> [!NOTE]
> Všechna spojovaná pole musí mít shodné rozměry ve všech osách kromě té, podél které probíhá spojování.

---
<!-- slide: id28, „stack()“, Core, pythonic -->
## Skládání do nové dimenze: `np.stack()`

Na rozdíl od `concatenate()`, funkce **`np.stack()`** vytvoří **novou osu**:

```python
import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# Spojení dvou 1D vektorů do 2D matice (axis=0):
m = np.stack((a, b), axis=0)
print(m.shape)  # (2, 3)
print(m)
# [[1 2 3]
#  [4 5 6]]

# Skládání podél sloupců (axis=1):
m_col = np.stack((a, b), axis=1)
print(m_col.shape)  # (3, 2)
print(m_col)
# [[1 4]
#  [2 5]
#  [3 6]]
```

---
<!-- slide: id29, „block()“, WOW, pythonic -->
## Tvorba blokových matic: `np.block()`

Funkce **`np.block()`** umožňuje skládat matice z bloků ve stylu MATLABu:

```python
import numpy as np

A = np.eye(2) * 2          # 2×2 diagonála
B = np.zeros((2, 3))       # 2×3 nuly
C = np.ones((3, 2))        # 3×2 jedničky
D = np.eye(3) * 3          # 3×3 diagonála

# Sestavení velké blokové matice 5×5:
M = np.block([
    [A, B],
    [C, D]
])
print(M)
# [[2. 0. 0. 0. 0.]
#  [0. 2. 0. 0. 0.]
#  [1. 1. 3. 0. 0.]
#  [1. 1. 0. 3. 0.]
#  [1. 1. 0. 0. 3.]]
```

---
<!-- slide: id30, „split()“, Core, basics -->
## Dělení polí: `np.split()`

Funkce **`np.split()`** rozdělí pole na $N$ stejných částí nebo podle explicitních indexových záseků:

```python
import numpy as np

x = np.arange(9)

# 1. Rozdělení na 3 stejné části:
casti = np.split(x, 3)
for c in casti:
    print(c)
# [0 1 2]
# [3 4 5]
# [6 7 8]

# 2. Dělení podle zadaných indexových hranic [3, 6]:
# rozpadne se na [:3], [3:6] a [6:]
p1, p2, p3 = np.split(x, [3, 6])
```

---
<!-- slide: id31, VIII. Výběr podpolí podmínkou, Skip, basics -->
## Podmíněný výběr prvků z polí

Při práci s daty často potřebujeme vybrat prvky splňující určitou podmínku (např. všechna měření s teplotou $> 25^\circ\text{C}$).

K tomu slouží:
1. **Maskování (Boolean Indexing)**: `arr[arr > 25]` (nejčitelnější a nejpoužívanější).
2. **`np.where()`**: ternární operátor pole nebo zjištění indexů.
3. **`np.nonzero()`**: nalezení indexů nenulových prvků.
4. **`np.choose()`**: výběr prvků ze seznamu polí podle indexů.

---
<!-- slide: id32, „where()“, Core, pythonic -->
## Podmíněný výběr: `np.where()`

Funkce **`np.where()`** má dvě zásadně odlišné formy volání:

1. **Jednoargumentová forma `np.where(podminka)`**: vrací n-tici indexových polí, kde je podmínka pravdivá (`True`).
2. **Tříargumentová forma `np.where(podminka, x, y)`**: funguje jako vektorizovaný ternární operátor `x if cond else y`.

---
<!-- slide: id33, „where(PODMÍNKA)“, Core, pythonic -->
## `np.where(podminka)` – Hledání indexů

Při volání pouze s podmínkou vrátí `np.where` n-tici indexů pro každou dimenzi:

```python
import numpy as np

a = np.array([
    [10, 20, 30],
    [40, 50, 60]
])

# Kde jsou prvky větší než 25?
mask = a > 25
print(mask)
# [[False False  True]
#  [ True  True  True]]

idx_radky, idx_sloupce = np.where(a > 25)
print(idx_radky)    # [0 1 1 1] (řádky odpovídajících prvků)
print(idx_sloupce)  # [2 0 1 2] (sloupce odpovídajících prvků)

# Přímý výběr hodnot přes boolean masku (fancy indexing):
hodnoty = a[a > 25]
print(hodnoty)  # [30 40 50 60]
```

> [!TIP]
> Pro získání souřadnic ve formátu dvojic `[[řádek, sloupec], ...]` použijte `np.argwhere(a > 25)`:
> ```python
> print(np.argwhere(a > 25))
> # [[0 2], [1 0], [1 1], [1 2]]
> ```

---
<!-- slide: id34, „where(PODMÍNKA, Pole1, Pole2)“, WOW, pythonic -->
## Vektorizovaný ternární operátor: `np.where(cond, x, y)`

Nahrazuje Python zápis `[x if c else y for c, x, y in zip(...)]` v $C$-rychlosti:

```python
import numpy as np

teploty = np.array([-5.0, 12.0, 0.0, -1.5, 23.0])

# Pokud teplota < 0, nahraď textem 'mrzne', jinak 'nemrzne':
stavy = np.where(teploty < 0, "mrzne", "nemrzne")
print(stavy)
# ['mrzne' 'nemrzne' 'nemrzne' 'mrzne' 'nemrzne']

# Ořezání záporných hodnot na 0.0 (tzv. ReLU funkce):
aktivace = np.where(teploty > 0, teploty, 0.0)
print(aktivace)  # [ 0. 12.  0.  0. 23.]
```

---
<!-- slide: id35, „nonzero()“, Core, pythonic -->
## Nenulové prvky: `np.nonzero()`

Metoda **`arr.nonzero()`** (či funkce `np.nonzero(arr)`) vrací indexy všech prvků, které nejsou rovny nule (resp. `False`):

```python
import numpy as np

m = np.array([
    [1, 0, 0],
    [0, 5, 0],
    [7, 0, 9]
])

radky, sloupce = m.nonzero()
print(radky)    # [0 1 2 2]
print(sloupce)  # [0 1 0 2]

# Extrakce nenulových hodnot:
nenulove = m[m.nonzero()]
print(nenulove)  # [1 5 7 9]

# Ekvivalentní boolean zápis přes fancy indexing:
print(m[m != 0]) # [1 5 7 9]
```

---
<!-- slide: id36, „choose()“, Skip, pythonic -->
## Výběr podle indexů: `np.choose()`

Funkce **`np.choose(index_pole, moznosti)`** skládá výstupní pole výběrem z několika předložených polí podle celočíselné indexové šablony:

```python
import numpy as np

# Tři varianty matic:
volba_0 = np.full((2, 2), 10)
volba_1 = np.full((2, 2), 20)
volba_2 = np.full((2, 2), 30)

# Matice indexů (říká, z jaké varianty vzít který prvek):
indexy = np.array([
    [0, 1],
    [2, 0]
])

vysledek = np.choose(indexy, [volba_0, volba_1, volba_2])
print(vysledek)
# [[10 20]
#  [30 10]]
```

---
<!-- slide: id37, IX. Nečíselná pole, Core, basics -->
## Nečíselná pole: Booleany a řetězce

Ačkoliv je NumPy primárně matematická knihovna, podporuje i nečíselné typy:

```python
import numpy as np

# 1. Booleovská pole (1 bajt na prvek):
b = np.array([[True, False], [False, True]])
print(b.dtype)  # bool

# 2. Řetězcová pole pevné délky:
s = np.array(["Python", "Rust", "Julia", "Go"])
print(s.dtype)  # <U6 (Unicode řetězec o maximální délce 6 znaků)

# Pokud vložíte delší řetězec, bude nemilosrdně oříznut!
s[0] = "Supercalifragilistic"
print(s[0])  # Superc (oříznuto na 6 znaků!)
```

> [!WARNING]
> Pro práci s textem v paměti není `ndarray` ideální kvůli pevné délce prvků (`<Un`). Pro textová data používejte standardní Python seznamy, **Pandas** s moderním `StringDtype`, nebo NumPy modul `np.char`.

---
<!-- slide: id38, Vlastní „dtype“ I, WOW, paradigm -->
## Strukturovaná pole (*Structured Arrays*)

NumPy umožňuje nadefinovat heterogenní složený typ podobně jako **`struct` v jazyce C**:

```python
import numpy as np

# Definice struktury: pozice (x, y) a barva (RGB)
moje_struktura = np.dtype([
    ("id", np.int32),
    ("pozice", [("x", np.float64), ("y", np.float64)]),
    ("aktivni", np.bool_)
])

# Alokace pole 3 prvků podle naší struktury:
data = np.zeros(3, dtype=moje_struktura)

data[0] = (101, (1.5, 2.5), True)
print(data["id"])             # [101   0   0]
print(data["pozice"]["x"])    # [1.5 0.  0. ]
print(data[0]["pozice"]["y"]) # 2.5
```

> [!NOTE]
> V C ekvivalentu:
> ```c
> struct Zaznam {
>     int32_t id;
>     struct { double x, y; } pozice;
>     bool aktivni;
> };
> ```
> Data leží v souvislém binárním bloku s nulovým režijním nákladem objektů Pythonu.

---
<!-- slide: id39, Vlastní „dtype“ II, Skip, paradigm -->
## Paměťový layout a bajtové offsety

U strukturovaných polí lze přesně řídit bajtový posun (*offset*) jednotlivých položek, což je klíčové pro parsování binárních hlaviček nebo 3D grafické buffery:

```python
import numpy as np

# Definice RGB pixelu s 1 bajtem na kanál (u1 = unsigned 8-bit integer):
pixel_dtype = np.dtype([
    ("R", np.uint8),
    ("G", np.uint8),
    ("B", np.uint8)
])

surova_data = b"\xff\x80\x00\x00\xff\x00"  # 2 pixely (oranžový, zelený)
pixely = np.frombuffer(surova_data, dtype=pixel_dtype)

print(pixely[0])        # (255, 128, 0)
print(pixely["R"])      # [255, 0]
print(pixely.itemsize)  # 3 bajty
```

---
<!-- slide: id40, Poznámka, Core, paradigm -->
## Shrnutí: Kdy použít Structured Arrays vs. Pandas

Strukturovaná pole v NumPy umožňují pojmenovávat **sloupce**, ale **neumožňují indexovat řádky podle návěstí**:

| Vlastnost | NumPy Structured Arrays | Pandas DataFrame |
| :--- | :--- | :--- |
| **Primární určení** | Binární C-struktury, síťové protokoly, GPU buffery | Analýza dat, tabulky, statistika, čištění |
| **Typování** | Pevné céčkovské typy v paměťovém bloku | Sloupce tvořené `pd.Series` (NumPy / Arrow backend) |
| **Index řádků** | Pouze celočíselný `0..N-1` | Bohatý `Index` (datum, text, hierarchický) |
| **Chybějící data** | Žádná automatická podpora | Vestavěné `NaN`, `<NA>`, `None` |
| **Připojování dat** | Drahé přealokování paměti | Rychlé `.merge()`, `.join()`, `.concat()` |

> [!TIP]
> Pro vědecké a tabulkové analýzy v moderním Pythonu sáhněte po **Pandas** nebo **Polars**. Po strukturovaných polích v NumPy sáhněte tehdy, když potřebujete binární kompatibilitu s C knihovnami nebo minimální paměťovou režii.
