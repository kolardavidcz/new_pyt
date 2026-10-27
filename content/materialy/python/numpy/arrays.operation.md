<!-- slide: id1, Úvod, Core, paradigm -->
## Operace s poli v NumPy a univerzální funkce (`ufunc`)

Operace s poli `ndarray` jsou srdcem výkonu v NumPy. Namísto psaní pomalých vnořených smyček `for` v Pythonu přesouvá NumPy veškerou matematiku do optimalizovaných C rutin (SIMD vektorizace na úrovni procesoru, BLAS a LAPACK).

V této přednášce se podíváme na:
- **Aritmetické operace po prvcích** (*element-wise*) vs. **maticové násobení** (`@`).
- **Logické operátory** a redukce pravdivosti (`all`, `any`).
- **Univerzální funkce (`ufunc`)** a jejich vlastnosti.
- **Redukce podél os** (`sum`, `mean`, `min`, `max`, `axis`, `keepdims`).
- **Řazení a nepřímé indexování** (`sort`, `argsort`).

```python
import numpy as np
```

---
<!-- slide: id2, I. Binární (a unární) operace mezi poli, Core, paradigm -->
## Prvkové operace vs. Maticový součin (`@`)

Veškeré standardní unární a binární operátory (`+`, `-`, `*`, `/`, `**`, `//`, `%`) se v NumPy provádějí **po složkách** (*element-wise*):

```python
import numpy as np

a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6], [7, 8]])

# 1. Unární mínus a násobení skalárem:
print(-a)      # [[-1 -2], [-3 -4]]
print(3 * a)   # [[ 3  6], [ 9 12]]

# 2. Prvkový součin (Hadamardův součin):
print(a * b)
# [[ 5 12]     <- 1*5=5, 2*6=12
#  [21 32]]    <- 3*7=21, 4*8=32

# 3. Skutečné algebraické maticové násobení (operátor @):
print(a @ b)
# [[19 22]     <- 1*5 + 2*7 = 19, 1*6 + 2*8 = 22
#  [43 50]]    <- 3*5 + 4*7 = 43, 3*6 + 4*8 = 50
```

> [!IMPORTANT]
> Pro algebraické násobení matic ($C = A \cdot B$) používejte vždy moderní operátor **`@`** (zavedený v PEP 465). Stará třída `np.matrix` byla v NumPy 2.0 definitivně zavržena.

---
<!-- slide: id3, Další příklady se skaláry, WOW, pythonic -->
## Aritmetické výrazy se skaláry

Díky mechanismu *broadcasting* se jakýkoliv skalár automaticky roztáhne na tvar celého pole:

```python
import numpy as np

a = np.arange(6).reshape(2, 3)
# [[0 1 2]
#  [3 4 5]]

# Přičtení skaláru ke každému prvku:
print(a + 1)
# [[1 2 3]
#  [4 5 6]]

# Umocňování: 2^a
print(2 ** a)
# [[ 1  2  4]
#  [ 8 16 32]]

# Kombinované výrazy (zpracováno v C bez mezilehlých Python objektů):
vysledek = 2 ** (a + 1) - 1
print(vysledek)
# [[ 1  3  7]
#  [15 31 63]]
```

---
<!-- slide: id4, Složitější typy, Core, pythonic -->
## Operace mezi poli a standardními sekvencemi

NumPy dokáže operovat i mezi `ndarray` a obyčejným Python seznamem nebo n-ticí. Sekvenci automaticky zkonvertuje na odpovídající pole:

```python
import numpy as np

a = np.arange(6).reshape(2, 3)
# [[0 1 2]
#  [3 4 5]]

# Přičtení 3-prvkového seznamu k matici (přičte se ke každému řádku):
print(a + [10, 20, 30])
# [[10 21 32]
#  [13 24 35]]

# Násobení:
print(a * [1, 0, -1])
# [[ 0  0 -2]
#  [ 3  0 -5]]
```

> [!NOTE]
> Rozměr sekvence musí odpovídat dimenzím pole podle pravidel *broadcasting* (zde má `a` 3 sloupce, takže 3-prvkový seznam se bez problémů napojí podél osy sloupců).

---
<!-- slide: id5, II. Logické operace, Core, paradigm -->
## Logické operace v NumPy

U logických operací musíme striktně rozlišovat dva cíle:
1. **Logické operace po prvcích**: výsledkem je nové booleovské pole stejného tvaru (`dtype=bool`).
2. **Globální logické vyhodnocení celého pole**: výsledkem je jediná skalární hodnota `True` / `False`.

> [!CAUTION]
> **Nikdy nepoužívejte Python operátory `and`, `or`, `not`** mezi poli `ndarray`! Tyto operátory se pokoušejí převést celé pole na jedinou pravdivostní hodnotu a vyvolají chybu:
> `ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()`

---
<!-- slide: id6, Po prvcích, Core, basics -->
## Logické operátory po prvcích: `&`, `|`, `~`, `^`

Pro logické operace po složkách používáme bitové operátory Pythonu přetížené pro `ndarray`:

```python
import numpy as np

a = np.array([True, True, False, False])
b = np.array([True, False, True, False])

# Logický AND po prvcích:
print(a & b)  # [ True False False False]

# Logický OR po prvcích:
print(a | b)  # [ True  True  True False]

# Logická negace NOT (operátor ~):
print(~a)     # [False False  True  True]

# Relační porovnání prvků:
x = np.array([1, 5, 10])
y = np.array([2, 5, 8])
print(x == y)  # [False  True False]
print(x < y)   # [ True False False]
```

---
<!-- slide: id7, Po polích, Core, pythonic -->
## Globální redukce pravdivosti: `all()` a `any()`

Pro zjištění, zda podmínku splňují **všechny** prvky nebo **alespoň jeden**, slouží metody:

```python
import numpy as np

a = np.array([1, 2, 3, 4])
b = np.array([1, 2, 3, 4])
c = np.array([1, 2, 0, 4])

# 1. Jsou dvě pole identická ve všech prvcích?
print(np.array_equal(a, b))  # True
print(np.array_equal(a, c))  # False

# 2. Splňují VŠECHNY prvky podmínku? (np.all)
print((a > 0).all())         # True
print((c > 0).all())         # False (kvůli nule)

# 3. Splňuje ALESPOŇ JEDEN prvek podmínku? (np.any)
print((c == 0).any())        # True
print((a < 0).any())         # False
```

---
<!-- slide: id8, Příklad, Tricky, pythonic -->
## Skládání složitých podmínek a priorita operátorů

Při kombinování více podmínek **musí být každé dílčí porovnání uzavřeno v závorkách `(...)`**, protože bitové operátory `&` a `|` mají v Pythonu vyšší prioritu než porovnávací operátory `<=`, `==`, `>`:

```python
import numpy as np

teploty = np.array([18.5, 22.0, 26.5, 14.0, 31.2])

# Správně: závorky kolem každé podmínky!
prijemne = (teploty >= 20.0) & (teploty <= 27.0)
print(prijemne)
# [False  True  True False False]

# Chybné bez závorek: teploty >= 20.0 & teploty <= 27.0
# Způsobí: TypeError: ufunc 'bitwise_and' not supported for input types...

# Ověření, zda jsou všechny naměřené teploty nad nulou:
vse_nad_nulou = (teploty > 0).all()
print(f"{vse_nad_nulou=}")  # vse_nad_nulou=True
```

---
<!-- slide: id9, III. Matematické funkce, Core, newconcept -->
## Univerzální funkce (`ufunc`)

Matematické funkce v NumPy jsou instancemi třídy **`numpy.ufunc`** (*universal function*):
- Jsou implementovány v čistém C a optimalizovány pro SIMD instrukce procesoru (AVX-512, NEON).
- Automaticky podporují *broadcasting*, přetypování a práci s chybovými stavy.
- Na rozdíl od modulu `math`, který zpracovává skaláry, `ufunc` fungují nad celými poli naráz.

```python
import numpy as np

# Matematické konstanty:
print(np.pi)  # 3.141592653589793
print(np.e)   # 2.718281828459045

# Trigonometrie a exponenciály:
uhely = np.array([0.0, np.pi / 2, np.pi])
print(np.sin(uhely))
# [0.0000000e+00 1.0000000e+00 1.2246468e-16]
```

---
<!-- slide: id10, Příklady, Core, basics -->
## Pokročilá matematika: Logaritmy, Polynomy a Algebra

```python
import numpy as np

# 1. Plovoucí chování při chybách v doméně:
# NumPy nevyhodí výjimku, ale vrátí inf/-inf/nan a vygeneruje RuntimeWarning:
hodnoty = np.array([0.0, 1.0, np.e, 10.0])
with np.errstate(divide="ignore"):
    print(np.log(hodnoty))
# [-inf  0.  1.  2.30258509]

# 2. Inverze matice v lineární algebře (np.linalg):
A = np.array([[1.0, 2.0], [3.0, 4.0]])
A_inv = np.linalg.inv(A)
print(A @ A_inv)  # Jednotková matice I (s přesností na plovoucí čárku)

# 3. Moderní polynomická třída (numpy.polynomial):
from numpy.polynomial import Polynomial

# Vytvoření polynomu z kořenů: (x - 1)(x - 2)(x - 3)
p = Polynomial.fromroots([1, 2, 3])
print(p)  # -6.0 + 11.0·x - 6.0·x² + 1.0·x³
print(p(4))  # Vyhodnocení v bodě x = 4 -> 6.0
```

---
<!-- slide: id11, IV. Další operace, Skip, basics -->
## Redukční a agregační operace

Redukční funkce transformují pole (nebo vybranou osu pole) na menší počet hodnot:
- **`sum()`**, **`prod()`**: součet a součin prvků.
- **`cumsum()`**, **`cumprod()`**: kumulativní součet a součin.
- **`min()`**, **`max()`**: globální extrémy.
- **`argmin()`**, **`argmax()`**: indexy polohy minim a maxim.
- **`mean()`**, **`median()`**, **`std()`**, **`var()`**: statistické ukazatele.

Pochopení parametru **`axis`** je klíčem k efektivní práci s vícerozměrnými poli.

---
<!-- slide: id12, Sumace – „sum()“, Core, pythonic -->
## Sčítání podél os (`axis`) a `keepdims`

Parametr `axis` určuje osu, která **zanikne (bude zredukována)**:

```python
import numpy as np

x = np.array([
    [1, 2, 3],
    [4, 5, 6]
])

# 1. Bez určení osy -> součet VŠECH prvků pole do skaláru:
print(np.sum(x))  # 21

# 2. axis=0: redukuje řádky (sčítá sloupce dolů):
print(np.sum(x, axis=0))  # [5 7 9]  <- tvar (3,)

# 3. axis=1: redukuje sloupce (sčítá řádky doprava):
print(np.sum(x, axis=1))  # [6 15]   <- tvar (2,)

# 4. keepdims=True zachová redukovanou dimenzi o velikosti 1:
print(np.sum(x, axis=1, keepdims=True))
# [[ 6]
#  [15]]  <- tvar (2, 1) -> ideální pro následný broadcasting!
```

---
<!-- slide: id13, Sumace – „cumsum()“, Core, basics -->
## Kumulativní součty: `cumsum()`

Počítá postupné kumulativní mezisoučty (tzv. *prefix sums*):

```python
import numpy as np

x = np.array([
    [1, 2, 3],
    [4, 5, 6]
])

# 1. Zploštělý kumulativní součet celého pole:
print(x.cumsum())
# [ 1  3  6 10 15 21]

# 2. Kumulativní součet podél řádků (axis=1):
print(x.cumsum(axis=1))
# [[ 1  3  6]
#  [ 4  9 15]]

# 3. Kumulativní součet podél sloupců (axis=0):
print(x.cumsum(axis=0))
# [[1 2 3]
#  [5 7 9]]
```

---
<!-- slide: id14, Extrémy – „min()“, „max()“, Core, basics -->
## Extrémy a hledání polohy: `min`, `max`, `argmin`, `argmax`

```python
import numpy as np

x = np.array([
    [10, 50, 30],
    [40, 20, 60]
])

# Globální maximum a jeho poloha:
print(np.max(x))     # 60
print(np.argmax(x))  # 5 (index ve zploštělém poli)

# Převod zploštělého indexu z argmax na 2D souřadnice [řádek, sloupec]:
radek, sloupec = np.unravel_index(np.argmax(x), x.shape)
print(f"Maximum 60 je na pozici: [{radek}, {sloupec}]")  # [1, 2]

# Extrémy po sloupcích (axis=0):
print(np.max(x, axis=0))  # [40 50 60]

# Extrémy po řádcích (axis=1):
print(np.min(x, axis=1))  # [10 20]
```

---
<!-- slide: id15, Řazení – „sort()“, „argsort()“, WOW, pythonic -->
## Řazení: `sort()` vs. nepřímé indexování `argsort()`

NumPy nabízí dva způsoby řazení:
1. **`np.sort(a)`**: vrátí nové seřazené pole (nebo `a.sort()` seřadí pole *in-place*).
2. **`np.argsort(a)`**: vrátí **pole indexů**, které by prvky seřadily (nepřímé řazení).

```python
import numpy as np

skore = np.array([85, 92, 45, 78])
jmena = np.array(["Petr", "Jana", "Eva", "Karel"])

# Zjištění indexů, které seřadí skóre vzestupně:
poradi = np.argsort(skore)
print(poradi)  # [2 3 0 1] (nejhorší je index 2 -> Eva)

# Aplikace stejného pořadí na jména studentů:
print(jmena[poradi])  # ['Eva' 'Karel' 'Petr' 'Jana']

# Sestupné řazení (od nejlepšího):
print(jmena[poradi[::-1]])  # ['Jana' 'Petr' 'Karel' 'Eva']
```

> [!TIP]
> `argsort()` je mimořádně mocný nástroj pro synchronní řazení více různých polí podle jedné řídicí metriky.

---
<!-- slide: id16, Statistika, Core, basics -->
## Základní popisná statistika

```python
import numpy as np

data = np.array([12.0, 15.0, 18.0, 22.0, 100.0])  # s jedním odlehlým měřením

# 1. Aritmetický průměr (citlivý na extrémy):
print(f"Průměr: {np.mean(data):.2f}")  # 33.40

# 2. Medián (robustní vůči odlehlým hodnotám):
print(f"Medián: {np.median(data):.2f}")  # 18.00

# 3. Směrodatná odchylka (standard deviation) a rozptyl (variance):
# ddof=0 je populační rozptyl (dělení N, výchozí v NumPy)
# ddof=1 je výběrový rozptyl (dělení N-1, výchozí v Pandas a statistice)
print(f"Směrodatná odchylka (výběrová): {np.std(data, ddof=1):.2f}")  # 37.47

# 4. Kvantily a percentily:
q25, q75 = np.percentile(data, [25, 75])
print(f"Mezikvartilové rozpětí: {q75 - q25:.2f}")
```

---
<!-- slide: id17, V. Komplexnější příklad, WOW, paradigm -->
## Komplexní ukázka: Vektorizovaný fraktál Mandelbrot

Ukázka síly vektorizace v NumPy: výpočet Mandelbrotovy množiny $z_{n+1} = z_n^2 + c$ bez jediné vnořené smyčky přes pixely:

```python
import numpy as np
import matplotlib.pyplot as plt

def vypocti_mandelbrot(h: int, w: int, max_iter: int = 50) -> np.ndarray:
    """Vektorizovaný výpočet Mandelbrotovy množiny v komplexní rovině."""
    # Vytvoření 2D komplexní mřížky pomocí ogrid:
    y, x = np.ogrid[-1.4:1.4:h * 1j, -2.0:0.8:w * 1j]
    c = x + y * 1j
    z = c.copy()
    
    # Matice počtu iterací do divergence:
    div_time = np.full(z.shape, max_iter, dtype=np.int32)

    for i in range(max_iter):
        z = z ** 2 + c
        # Kde velikost |z|^2 překročila 4 (bod diverguje)?
        divergovalo = (z.real ** 2 + z.imag ** 2) > 4.0
        
        # Zaznamenáme iteraci těm, které právě teď divergují:
        prave_ted = divergovalo & (div_time == max_iter)
        div_time[prave_ted] = i
        
        # Zabráníme přetečení floatu u divergujících bodů:
        z[divergovalo] = 2.0

    return div_time

# Vykreslení:
# plt.figure(figsize=(8, 6), dpi=120)
# plt.imshow(vypocti_mandelbrot(600, 800), cmap="inferno", extent=[-2.0, 0.8, -1.4, 1.4])
# plt.colorbar(label="Počet iterací do divergence")
# plt.title("Mandelbrotova množina (vektorizováno v NumPy)")
# plt.show()
```

> [!NOTE]
> Výpočet pro celou mřížku $600 \times 800 = 480\,000$ bodů proběhne díky vektorizaci v NumPy za zlomek sekundy, zatímco v čistém Pythonu se smyčkami by trval desítky sekund.
