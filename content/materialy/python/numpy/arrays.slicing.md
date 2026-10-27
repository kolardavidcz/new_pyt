<!-- slide: id1, Úvod, Core, basics -->
## Výřezy v NumPy: Pohledy na data (*Views*) vs. Kopie (*Copies*)

Výřezy a indexování vícerozměrných polí `ndarray` patří k nejdůležitějším mechanismům v NumPy. Správné porozumění tomu, **kdy NumPy sdílí paměť (pohled)** a **kdy data kopíruje**, je zásadní pro:
- Dosažení maximální rychlosti a nulové paměťové režie ($O(1)$ čas i paměť).
- Zabránění skrytým chybám, kdy nechtěně modifikujete původní pole.
- Přípravu tvarů pro vektorizaci a broadcasting.

```python
import numpy as np
```

---
<!-- slide: id2, Klasické výřezy [:] = jiné pohledy na data, Tricky, paradigm -->
## Základní výřezy `[:]`: Vždy vytvářejí pohledy (*Views*)

> [!IMPORTANT]
> **Kritický rozdíl oproti čistému Pythonu**:
> V čistém Pythonu vytvoří řez seznamem `seznam[:]` novou mělkou kopii.
> V NumPy vytvoří řez `arr[:]` **pouze nový pohled (view)** ukazující do stejného paměťového bloku!
> Změna prvku ve výřezu okamžitě **změní původní pole** a naopak!

```python
import numpy as np

# Původní matice:
a = np.array([[1, 2, 3], [4, 5, 6]])

# Výřez prvního řádku:
podpole = a[0, :]
print(podpole)  # [1 2 3]

# Modifikace výřezu:
podpole[0] = 999

# Změna se projevila i v originálu 'a'!
print(a)
# [[999   2   3]
#  [  4   5   6]]
```

---
<!-- slide: id3, Získání výřezu, Core, resyntax -->
## Vícerozměrná indexace čárkou: `[řádky, sloupce]`

V C a Javě indexujeme 2D pole jako `a[i][j]` (což v Pythonu vytvoří mezilehlý objekt pro celý řádek).
V NumPy indexujeme dimenze oddělené čárkou přímo v jedněch hranatých závorkách: **`a[řádek, sloupec]`**:

```python
import numpy as np

a = np.arange(1, 21).reshape(5, 4)
# [[ 1  2  3  4]
#  [ 5  6  7  8]
#  [ 9 10 11 12]
#  [13 14 15 16]
#  [17 18 19 20]]

# Druhý řádek (index 1):
print(a[1])         # [5 6 7 8]

# Prvek na 2. řádku a 3. sloupci:
print(a[1, 2])      # 7

# Podmatice: od 2. řádku dále, sloupce od indexu 2 dále:
print(a[1:, 2:])
# [[ 7  8]
#  [11 12]
#  [15 16]
#  [19 20]]
```

---
<!-- slide: id4, Přiřazení do výřezu, Core, pythonic -->
## Hromadné přiřazení do výřezů (*In-Place Mutation*)

Do výřezů můžeme přiřazovat skaláry i jiná pole kompatibilního tvaru:

```python
import numpy as np

a = np.zeros((3, 4), dtype=int)

# 1. Nastavení celého druhého řádku na hodnotu 1:
a[1] = 1

# 2. Nastavení bloku 2x2 v pravém dolním rohu na 2:
a[1:, 2:] = 2

# 3. Nastavení konkrétního prvku:
a[0, 1] = 9

print(a)
# [[0 9 0 0]
#  [1 1 2 2]
#  [0 0 2 2]]
```

---
<!-- slide: id5, Přiřazení pomocí [...], WOW, pythonic -->
## Výpustková notace (`...` neboli `Ellipsis`)

Operátor **`...`** (Python objekt `Ellipsis`) zastupuje libovolný počet neuvedených dimenzí:

```python
import numpy as np

# 1. Hromadné přepsání všech prvků pole při zachování instance a typu:
a = np.full((3, 4), 7)
a[...] = 0  # Modifikuje paměť na místě (in-place)
print(a)

# 2. Použití ve vícerozměrných tenzorech (např. 4D pole: batch, kanály, výška, šířka):
tenzor = np.zeros((10, 3, 64, 64))

# Výběr prvního kanálu pro všechny dávky, výšky a šířky:
# Zápis tenzor[:, 0, :, :] lze zapsat kompaktně jako:
kanal_0 = tenzor[:, 0, ...]
print(kanal_0.shape)  # (10, 64, 64)
```

---
<!-- slide: id6, Komentář, Tricky, paradigm -->
## Jak funguje pohled pod kapotou: `base` a `strides`

Pohled nevlastní žádná data. Obsahuje pouze nový objekt `ndarray`, který má:
- **`shape`**: nový tvar podmatice.
- **`strides`**: nové paměťové kroky.
- **`offset`**: posun od počátku paměti originálu.
- **`base`**: odkaz na původní pole, které data fyzicky vlastní.

```python
import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.int64)

# Transpozice:
b = a.T

# Řez druhého a třetího sloupce:
c = a[:, 1:]

print(a.base)        # None (a je původní vlastník paměti)
print(b.base is a)   # True (b je pohled na a)
print(c.base is a)   # True (c je pohled na a)

print(a.strides)     # (24, 8) -> 3 prvky po 8 bajtech = 24 bajtů na řádek
print(b.strides)     # (8, 24) -> prohozené kroky bez pohybu dat!
```

---
<!-- slide: id7, „Fancy indexing“ = kopie dat, Tricky, paradigm -->
## Pokročilé indexování (*Fancy Indexing*): Vždy vytváří kopii!

Pokud namísto řezu `start:stop:step` použijeme k indexování **celočíselné pole nebo seznam indexů**, NumPy **vždy vytvoří novou nezávislou kopii v paměti**:

```python
import numpy as np

a = np.array([10, 20, 30, 40, 50, 60])

# 1. Základní řez (view):
v = a[::2]
print(v.base is a)  # True (pohled)

# 2. Fancy indexing polem indexů (copy):
idx = np.array([0, 2, 4])
k1 = a[idx]
print(k1.base is a)  # False -> Vytvořila se nová kopie!

# 3. Fancy indexing booleovskou maskou (copy):
mask = a > 25
k2 = a[mask]
print(k2.base is a)  # False -> Kopie!

# Modifikace k1 neovlivní 'a':
k1[0] = 999
print(a[0])  # 10 (původní pole zůstalo nezměněno)
```

| Způsob výběru | Příklad | Výsledek | Rychlost |
| :--- | :--- | :--- | :--- |
| **Basic slicing** | `a[1:5:2]`, `a[:, 2]` | **Pohled (View)** | $O(1)$ okamžité, žádná alokace |
| **Fancy indexing** | `a[[0, 2, 4]]`, `a[a > 3]` | **Kopie (Copy)** | $O(N)$ alokuje novou paměť |

---
<!-- slide: id8, „take()“ – výběr pomocí seznamu indexů, Skip, pythonic -->
## Výběr prvků pomocí `take()`

Metoda **`arr.take(indices, axis)`** je funkcionální alternativou k fancy indexingu podél jedné vybrané osy:

```python
import numpy as np

a = np.array([
    [10, 20, 30],
    [40, 50, 60],
    [70, 80, 90]
])

# Výběr prvního a třetího řádku (indexy 0 a 2):
vyber = a.take([0, 2], axis=0)
print(vyber)
# [[10 20 30]
#  [70 80 90]]

# Ekvivalentní fancy indexing zápis:
print(a[[0, 2], :])
```

---
<!-- slide: id9, „compress()“ – výběr pomocí pravdivostní masky, Skip, pythonic -->
## Výběr pomocí masky: `compress()`

Metoda **`arr.compress(condition, axis)`** filtruje prvky podél zadané osy podle 1D booleovské podmínky:

```python
import numpy as np

a = np.array([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
])

# Maska pro sloupce (vybereme 1. a 3. sloupec):
maska_sloupcu = [True, False, True]

vyber = a.compress(maska_sloupcu, axis=1)
print(vyber)
# [[1 3]
#  [4 6]
#  [7 9]]
```

---
<!-- slide: id10, Metody měnící tvar pole, Skip, basics -->
## Manipulace s tvarem polí (*Shape Manipulation*)

Při vědeckých výpočtech neustále měníme tvar polí:
- Narovnání do 1D: `ravel()` vs. `flatten()`.
- Změna rozměrů: `reshape()`.
- Přidání virtuální dimenze: `np.newaxis` (nebo `None`).
- Prohazování a rotace os: `transpose()`, `swapaxes()`, `moveaxis()`.

---
<!-- slide: id11, „ravel()“ – převod na vektor, Tricky, pythonic -->
## Zploštění: `ravel()` vs. `flatten()`

```python
import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]])

# 1. a.ravel() -> vrací pohled (view), pokud jsou data v C-pořadí souvislá:
r = a.ravel()
print(r.base is a)  # True

# 2. a.flatten() -> VŽDY vytvoří novou samostatnou kopii:
f = a.flatten()
print(f.base is a)  # False

# Pokud ale pole transponujeme, paměť už není souvislá v C-pořadí,
# a proto i ravel() musí vyrobit kopii:
r_trans = a.T.ravel()
print(r_trans.base is a)  # False
```

> [!TIP]
> Ve výkonnostně kritickém kódu vždy preferujte **`ravel()`** před `flatten()`.

---
<!-- slide: id12, „reshape()“ – změna tvaru, Core, pythonic -->
## `reshape()`: Podmínka pro zachování pohledu

`reshape()` vytvoří pohled pouze tehdy, pokud je pole v paměti **souvislé** (*contiguous*):

```python
import numpy as np

a = np.arange(12)  # [0, 1, ..., 11]

# Původní řetězec reshape vytváří pohled:
b = a.reshape(3, 4)
print(b.base is a)  # True

# Transpozice naruší C-kontinuitu:
c = b.T  # tvar (4, 3) se strides (8, 32)
print(c.flags.c_contiguous)  # False!

# Následný reshape nemůže být pohledem a musí alokovat nová data:
d = c.reshape(2, 6)
print(d.base is a)  # False
```

---
<!-- slide: id13, „numpy.newaxis“ – přidávání dimenzí I, WOW, pythonic -->
## Rozšiřování dimenzí: `np.newaxis` (alias `None`)

Objekt **`np.newaxis`** (který je přesným aliasem pro vestavěný Python literál **`None`**) vloží na zadanou pozici novou dimenzi o velikosti 1:

```python
import numpy as np

a = np.array([1, 2, 3])
print(a.shape)  # (3,) -> 1D vektor

# 1. Povýšení na 2D řádkovou matici 1 × 3:
radek = a[np.newaxis, :]  # nebo ekvivalentně: a[None, :]
print(radek.shape)        # (1, 3)
print(radek)              # [[1 2 3]]

# 2. Povýšení na 2D sloupcovou matici 3 × 1:
sloupec = a[:, np.newaxis]  # nebo: a[:, None]
print(sloupec.shape)        # (3, 1)
print(sloupec)
# [[1]
#  [2]
#  [3]]
```

---
<!-- slide: id14, „numpy.newaxis“ – přidávání dimenzí II, Skip, pythonic -->
## Vkládání nových os doprostřed tenzoru

Nové osy lze vkládat na libovolné místo ve vícerozměrném poli:

```python
import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]])
print(a.shape)  # (2, 3)

# Vložení nové dimenze doprostřed -> tvar (2, 1, 3):
b = a[:, np.newaxis, :]
print(b.shape)  # (2, 1, 3)
print(b)
# [[[1 2 3]]
#  [[4 5 6]]]
```

---
<!-- slide: id15, „numpy.newaxis“ – přidávání dimenzí III, WOW, paradigm -->
## Klíčové využití: Příprava pro Broadcasting

Nejčastější využití `np.newaxis` je sjednocení nekompatibilních tvarů pro automatické roztažení (*broadcasting*):

```python
import numpy as np

# Chceme spočítat tabulku sčítání pro dva vektory:
x = np.array([0, 10, 20, 30])  # tvar (4,)
y = np.array([1, 2, 3])         # tvar (3,)

# Přímý součet 'x + y' selže: ValueError (operands could not be broadcast)

# Řešení: převedeme 'x' na sloupec tvaru (4, 1):
x_col = x[:, np.newaxis]
print(x_col.shape)  # (4, 1)

# Nyní broadcasting roztáhne (4, 1) a (3,) na výslednou matici (4, 3):
tabulka = x_col + y
print(tabulka)
# [[ 1  2  3]
#  [11 12 13]
#  [21 22 23]
#  [31 32 33]]
```

---
<!-- slide: id16, „transpose()“ & „T“ I, Core, basics -->
## Transpozice: Atribut `.T` vs. metoda `transpose()`

Pro 2D matice jsou zápisy `a.T` a `np.transpose(a)` ekvivalentní:

```python
import numpy as np

a = np.arange(1, 7).reshape(2, 3)
# [[1 2 3]
#  [4 5 6]]

print(a.T)
# [[1 4]
#  [2 5]
#  [3 6]]

# Transpozice 2D pole je vždy bleskový pohled (view):
print(a.T.base is a)  # True
```

> [!NOTE]
> Pro 1D vektor nemá `.T` žádný efekt (`(N,).T == (N,)`), protože 1D pole nemá druhou osu k prohození. Pokud potřebujete transponovat vektor na sloupec, použijte `v[:, np.newaxis]`.

---
<!-- slide: id17, „transpose()“ & „T“ II, Core, newconcept -->
## Permutace os u $N$-dimenzionálních tenzorů

U tenzorů o 3 a více dimenzích umožňuje **`np.transpose(a, axes=...)`** libovolně přeuspořádat pořadí os:

```python
import numpy as np

# Tenzor tvaru (dávka=2, kanály=3, výška=4):
foto = np.zeros((2, 3, 4))
print(foto.shape)  # (2, 3, 4)

# Změna pořadí os na (výška=4, dávka=2, kanály=3):
# Původní osy měly indexy: 0, 1, 2. Nové pořadí je: 2, 0, 1
foto_perm = np.transpose(foto, axes=(2, 0, 1))
print(foto_perm.shape)  # (4, 2, 3)
```

---
<!-- slide: id18, „swapaxes()“ & „moveaxes()“, Skip, newconcept -->
## Výměna a přesun os: `swapaxes()` a `moveaxis()`

```python
import numpy as np

t = np.zeros((2, 5, 8))

# 1. swapaxes: Prohodí právě dvě zvolené osy:
# Prohození 0. a 1. osy -> tvar (5, 2, 8):
t_swap = t.swapaxes(0, 1)
print(t_swap.shape)  # (5, 2, 8)

# 2. moveaxis: Přesune osu z původní pozice na cílovou:
# Přesun osy kanálů z indexu 1 na poslední pozici -1:
t_move = np.moveaxis(t, source=1, destination=-1)
print(t_move.shape)  # (2, 8, 5)
```

---
<!-- slide: id19, „resize()“ – změna tvaru a velikosti, Tricky, resyntax -->
## Změna velikosti pole: Metoda `.resize()` vs. `np.resize()`

Pozor na zásadní rozdíl mezi metodou pole a funkcí z balíčku `np`:

```python
import numpy as np

a = np.array([[1, 2], [3, 4]])

# 1. Funkce np.resize(a, new_shape) -> Vrací NOVÉ pole.
# Při zvětšení doplňuje data opakováním původních prvků!
doplnene = np.resize(a, (2, 3))
print(doplnene)
# [[1 2 3]
#  [4 1 2]]  <- chybějící prvky se zacyklily!

# 2. Metoda a.resize(new_shape) -> Pokusí se změnit velikost V MÍSTĚ.
# Nová místa vyplní nulami. Selže, pokud na pole existuje jakýkoliv jiný pohled!
```

> [!CAUTION]
> In-place metodu `a.resize()` v moderním Pythonu raději **nepoužívejte**. Pokud na pole existuje jakýkoliv aktivní pohled, vyvolá `ValueError: cannot resize an array that references or is referenced by another array`. Bezpečnější je vytvořit nové pole (`np.pad` nebo `np.zeros`).
