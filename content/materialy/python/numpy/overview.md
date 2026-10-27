<!-- slide: id1, Úvod, Skip, basics -->
## Úvod do knihovny NumPy (Numerický Python)

Python nebyl původně navržen jako vědecký výpočetní jazyk. Díky své čitelnosti a rozšiřitelnosti v C však v 90. letech přilákal vědce a inženýry, kteří potřebovali alternativu k drahým proprietárním systémům jako MATLAB nebo IDL.

V roce 2005 Travis Oliphant sjednotil projekty *Numeric* a *Numarray* a vytvořil **NumPy** (*Numerical Python*):
- De facto standard a základní kámen celého moderního ekosystému pro vědu o datech, strojové učení a AI (Pandas, SciPy, Scikit-learn, PyTorch, TensorFlow).
- Přináší efektivní $N$-dimenzionální homogenní pole **`ndarray`** uložené v souvislém bloku paměti.
- Přesouvá náročné smyčky do vysoce optimalizovaných kompilovaných C, C++ a Fortran rutin (BLAS, LAPACK).

---
<!-- slide: id2, Poznámka k NumPy obecně, Skip, basics -->
## Architektura a evoluce: NumPy 2.0

V průběhu dvou desetiletí nasbíral NumPy řadu historických kompromisů a duplicitních funkcí.

V roce 2024 vyšla přelomová verze **NumPy 2.0**:
- Provedla zásadní úklid zastaralých C API a starého balastu.
- Odstranila matoucí aliasy (jako `np.float_`, `np.int_`, `np.complex_`), které byly nahrazeny standardními typy.
- Definitivně zavrhla zastaralý typ `np.matrix` ve prospěch standardního `np.ndarray` s operátorem `@`.
- Zavedla novou generaci generátorů náhodných čísel (`np.random.default_rng()`).

---
<!-- slide: id3, Vícerozměrná pole, Core, basics -->
## N-dimenzionální pole: `ndarray`

Základním objektem NumPy je **`numpy.ndarray`** (N-dimensional array):
- **Homogenní**: Všechny prvky v poli mají přesně stejný datový typ (`dtype`).
- **Pevná velikost**: Alokováno jako souvislý paměťový blok (*contiguous buffer*).

```python
import numpy as np

# 1. Vytvoření 2D pole ze seznamu seznamů:
matice = np.array([
    [1, 2, 3],
    [4, 5, 6]
], dtype=np.int32)

print(matice)
# [[1 2 3]
#  [4 5 6]]

print(matice.shape)  # (2, 3) -> 2 řádky, 3 sloupce
print(matice.ndim)   # 2 dimenze
print(matice.dtype)  # int32
```

---
<!-- slide: id4, Unární a binární operace, Tricky, resyntax -->
## Prvkové operace (Element-wise)

Zatímco v čistém Pythonu operátor `+` seznamy spojí (`[1] + [2] -> [1, 2]`) a `*` seznam zreplikuje, v NumPy fungují **veškeré operátory po složkách (element-wise)**:

```python
import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]])

# 1. Operace se skalárem:
print(a * 3)
# [[ 3  6  9]
#  [12 15 18]]

# 2. Sčítání dvou polí stejného tvaru:
print(a + a)
# [[ 2  4  6]
#  [ 8 10 12]]

# 3. Násobení polí (Hadamardův součin po prvcích, nikoli maticové násobení!):
print(a * a)
# [[ 1  4  9]
#  [16 25 36]]
```

---
<!-- slide: id5, Speciální metody, Core, pythonic -->
## Univerzální funkce (ufunc) a lineární algebra

NumPy nabízí stovky optimalizovaných **univerzálních funkcí** (*ufunc*), které probíhají v C rychlosti:

```python
import numpy as np

x = np.array([1.0, 4.0, 9.0])
print(np.sqrt(x))  # array([1., 2., 3.])
print(np.log(x))   # array([0., 1.38629436, 2.19722458])

# Transpozice matice:
a = np.array([[1, 2, 3], [4, 5, 6]])
print(a.T)
# [[1 4]
#  [2 5]
#  [3 6]]

# Inverze matice přes submodul linalg:
ctverec = np.array([[1.0, 2.0], [3.0, 4.0]])
inverzni = np.linalg.inv(ctverec)
print(inverzni)
```

---
<!-- slide: id6, „Broadcasting“, Skip, newconcept -->
## Koncept Broadcasting (Vysílání)

Co když chceme sečíst matici o rozměrech $(3, 3)$ s vektorem o délce $3$?

V klasickém C bychom museli napsat vnořené for cykly. NumPy disponuje pravidly **broadcasting** (detailně v [samostatné přednášce](broadcasting.md)):
- Menší pole je virtuálně roztaženo podél chybějící dimenze bez duplikace dat v paměti RAM.
- Výpočet proběhne v jediném vektorizovaném kroku.

```python
matice = np.zeros((3, 3))
vektor = np.array([1, 2, 3])

# Vektor se automaticky přičte ke KAŽDÉMU řádku matice:
vysledek = matice + vektor
print(vysledek)
# [[1. 2. 3.]
#  [1. 2. 3.]
#  [1. 2. 3.]]
```

---
<!-- slide: id7, Poznámka – typové „konverze“, Core, pythonic -->
## Součinnost NumPy s nativními Python typy

NumPy operátory jsou obousměrně polymorfní: pokud zkombinujete `ndarray` s běžným Python číslem, seznamem nebo n-ticí, Python typ je automaticky zkonvertován:

```python
import numpy as np

a = np.arange(3)  # array([0, 1, 2])

# Sčítání s Python seznamem zleva i zprava:
print(a + [10, 20, 30])  # array([10, 21, 32])
print([10, 20, 30] + a)  # array([10, 21, 32])

# Sčítání s n-ticí:
print(a + (5, 5, 5))     # array([5, 6, 7])
```

---
<!-- slide: id8, PS: Dvourozměrná pole versus matice, Tricky, paradigm -->
## `ndarray` vs. Zastaralý typ `np.matrix`

Historicky existovala třída `np.matrix`, kde operátor `*` znamenal maticové násobení namísto prvkového.

```python
# ZASTARALÝ PŘÍSTUP (dnes striktně nedoporučovaný a v NumPy 2.0 zavržený):
# m = np.matrix([[1, 2], [3, 4]])

# MODERNÍ PŘÍSTUP: Standardní ndarray + operátor @ (PEP 465):
A = np.array([[1, 2], [3, 4]])
B = np.array([[2, 0], [1, 2]])

# 1. Prvkové násobení:
print(A * B)
# [[2 0]
#  [3 8]]

# 2. Skutečné maticové násobení (Algebra):
print(A @ B)
# [[ 4  4]
#  [10  8]]
```

Používejte výhradně standardní pole `np.ndarray` a operátor **`@`**.

---
<!-- slide: id9, Poznámka k použití pythoního modulu „array“, Tricky, resyntax -->
## NumPy vs. Standardní modul `array`

V přednášce o [homogenních polích v Pythonu](../types.plus/arrays.md) jsme viděli vestavěný modul `array.array`:

| Vlastnost | `array.array` (Built-in) | `numpy.ndarray` (NumPy) |
| :--- | :--- | :--- |
| **Dimenze** | Pouze 1D | $N$-dimenzionální ($1D, 2D, 3D, \dots$) |
| **Vektorizace** | Neumí matematické operace | Široká podpora ufuncs, lineární algebry |
| **Závislosti** | Nulové (součást Pythonu) | Vyžaduje instalaci balíčku `numpy` |
| **Využití** | Jednoduchá binární serializace 1D dat | Vědecké výpočty, AI, analýza dat |

Pro jakékoliv netriviální numerické nebo vícerozměrné výpočty je NumPy jasnou a jedinou volbou.
