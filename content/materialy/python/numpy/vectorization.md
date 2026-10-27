<!-- slide: id1, Úvod, Core, paradigm -->
## Vektorizace v NumPy: Proč jsou smyčky v Pythonu pomalé?

Jednou z největších výkonnostních slabin čistého Pythonu jsou interpretované smyčky `for`, obzvláště vnořené. Při každém průchodu smyčkou musí interpret CPythonu:
1. Dynamicky zkontrolovat datový typ operandů (*dynamic type dispatch*).
2. Rozbalit hodnotu z plnotučné céčkovské struktury `PyObject` v paměti RAM.
3. Provést operaci, zabalit výsledek do nového `PyObject` a aktualizovat čítače referencí (*reference counting*).

V NumPy nahrazujeme explicitní smyčky **vektorizovanými operacemi**:

```python
import numpy as np

# 1. Špatně: Pomalá Python smyčka nad polem (overhead interpretu):
v = np.array([1, 2, 3])
vysledek_smycka = sum(x * x for x in v)

# 2. Správně: Vektorizovaný skalární součin v C rychlosti (operátor @):
vysledek_vektor = v @ v  # 14
```

> [!NOTE]
> Vektorizace přesouvá smyčky z pomalého interpretu Pythonu do vysoce optimalizovaného strojového kódu v C/Fortranu (s využitím SIMD instrukcí CPU jako AVX2 / AVX-512).

---
<!-- slide: id2, Příklad – funkce „signum()“ I, Skip, basics -->
## Příklad: Funkce Signum ($\text{sgn}$)

Matematicky je funkce signum definována jako:

$$\text{sgn}(x) = \begin{cases} +1 & \text{pro } x > 0 \\ \phantom{-}0 & \text{pro } x = 0 \\ -1 & \text{pro } x < 0 \end{cases}$$

V knihovně NumPy existuje vestavěná univerzální funkce **`np.sign()`**, která tuto operaci provádí efektivně a přímo v jazyce C.

---
<!-- slide: id3, Příklad – funkce „signum()“ II, Core, pythonic -->
## Aplikace univerzální funkce na $N$-dimenzionální pole

Univerzálním funkcím (`ufunc`) v NumPy je zcela lhostejné, jakou dimenzi má vstupní pole. Operace se provede po složkách nad skalárem, 1D vektorem i 2D maticí:

```python
import numpy as np

# 1. Pro skalár (0D):
print(np.sign(-3))  # -1

# 2. Pro 1D vektor:
a = np.array([-3, 2, 0, -7, 4])
print(np.sign(a))
# [-1  1  0 -1  1]

# 3. Pro 2D matici:
b = np.array([
    [-3,  2, 0, -7,  4],
    [ 6, -9, 5,  0, -2]
])
print(np.sign(b))
# [[-1  1  0 -1  1]
#  [ 1 -1  1  0 -1]]
```

---
<!-- slide: id4, Co je to „vektorizace“?, Core, paradigm -->
## Co znamená „Vektorizace“ v praxi?

V NumPy rozlišujeme dva druhy vektorizace:

1. **Skutečná nativní vektorizace (True Vectorization)**:
   - Celý výpočet je vyjádřen pomocí hotových NumPy operátorů a `ufunc`.
   - Běží v kompilovaném C/SIMD kódu bez přepínání kontextu do Pythonu.
   - Příklad: `np.where(a >= 0, 1, -1)`.

2. **Syntaktická vektorizace (`@np.vectorize`)**:
   - Skalární Python funkce je obalena dekorátorem.
   - Poskytuje pohodlné rozhraní pro vícerozměrná pole a broadcasting, ale **uvnitř stále volá Python smyčku**.
   - Nevede k hardwarovému zrychlení, ale dramaticky zjednodušuje kód.

---
<!-- slide: id5, Dekorátor „@numpy.vectorize()“, WOW, newconcept -->
## Pohodlná syntaktická vektorizace: `@np.vectorize`

Pokud máme hotovou skalární funkci obsahující Python logiku (`if/elif/else`, manipulaci s řetězci apod.), můžeme ji převést na funkci přijímající pole pomocí dekorátoru **`@np.vectorize`**:

```python
import numpy as np

@np.vectorize
def skalarni_operace(x: float) -> float:
    # Komplexní skalární logika
    return x ** 2 if x > 0 else 0.0

data = np.array([-2.0, -1.0, 0.0, 1.0, 2.0])
print(skalarni_operace(data))
# [0. 0. 0. 1. 4.]
```

> [!NOTE]
> Dekorátor `@np.vectorize` funguje jako adaptér: zjišťuje typy, podporuje pravidla *broadcasting* a vrací nové pole `ndarray` vhodného typu.

---
<!-- slide: id6, Příklad – modifikovaná funkce „signum()“ I, Skip, basics -->
## Příklad: Modifikovaná funkce Signum pro neuronové sítě

V některých modelech (např. Hopfieldovy asociativní neuronové sítě nebo perceptron s bipolární aktivací) potřebujeme funkci signum s jiným chováním v nule:

$$\text{sgn}^*(x) = \begin{cases} +1 & \text{pro } x \ge 0 \\ -1 & \text{pro } x < 0 \end{cases}$$

Tato funkce nikdy nevrací nulu. Jak takovou funkci implementovat v NumPy?

---
<!-- slide: id7, Příklad – modifikovaná funkce „signum()“ II, Core, pythonic -->
## Implementace pomocí `@np.vectorize`

Nejjednodušší přístup spočívá v sepsání čistého Python kódu pro jedno číslo a jeho dekorování:

```python
import numpy as np

@np.vectorize
def my_sign(x: float) -> int:
    """Bipolární skoková funkce (signum s nezápornou nulou)."""
    if x >= 0:
        return 1
    return -1
```

Funkce je zapsána přirozeně jako pro běžné číslo `float`, ale díky dekorátoru ji můžeme volat nad libovolným polem:

---
<!-- slide: id8, Příklad – modifikovaná funkce „signum()“ III, Core, pythonic -->
## Použití dekorované funkce v praxi

```python
import numpy as np

# Volání pro skalár:
print(my_sign(-3))  # -1

# Volání pro 1D vektor:
a = np.array([-3, 2, 0, -7, 4])
print(my_sign(a))
# [-1  1  1 -1  1]  <- Všimněte si: pro 0 vrátilo +1!

# Volání pro 2D matici:
b = np.array([
    [-3,  2, 0, -7,  4],
    [ 6, -9, 5,  0, -2]
])
print(my_sign(b))
# [[-1  1  1 -1  1]
#  [ 1 -1  1  1 -1]]
```

---
<!-- slide: id9, Poznámka, Tricky, paradigm -->
## Srovnání výkonu: Čistý Python vs. `@vectorize` vs. Nativní NumPy vs. Numba

Jak velký je rozdíl v rychlosti pro pole o $1\,000\,000$ prvcích?

```python
import numpy as np

arr = np.random.default_rng(42).standard_normal(1_000_000)

# 1. Pure Python smyčka s list comprehension: ~150 ms (Pomalé)
# res1 = [1 if x >= 0 else -1 for x in arr]

# 2. @np.vectorize: ~85 ms (Pohodlné, ale stále volá Python funkci)
# res2 = my_sign(arr)

# 3. Nativní vektorizace v NumPy (np.where): ~3 ms (28× rychlejší!)
res3 = np.where(arr >= 0, 1, -1)

# 4. JIT kompilace v Numba (@jit(nopython=True)): ~1.2 ms (70× rychlejší!)
# from numba import jit
# @jit(nopython=True)
# def numba_sign(x): ...
```

| Metoda | Relativní čas | Kdy použít |
| :--- | :--- | :--- |
| **Python smyčka** | $100\times$ (nejpomalejší) | Nikdy pro rozsáhlá data |
| **`@np.vectorize`** | $50\times$ | Pro prototypování a netriviální větvení |
| **Nativní NumPy (`np.where`)** | $\mathbf{2\times}$ | **Standardní přístup v datové vědě** |
| **Numba JIT (`@njit`)** | $\mathbf{1\times}$ (C/C++ rychlost) | Výpočetně kritické algoritmy s cykly |
