<!-- slide: id1, Úvod, Skip, basics -->
## Mechanismus Broadcasting v NumPy

Mechanismus **broadcasting** (vysílání / automatické roztažení rozměrů) je jednou z nejmocnějších a nejdůležitějších vlastností NumPy. Umožňuje provádět aritmetické a logické operace mezi poli **různých tvarů a dimenzí** bez nutnosti zdlouhavého a paměťově náročného kopírování dat.

V této přednášce si vysvětlíme:
- Jak se skaláry a vektory automaticky přizpůsobují tvaru matic.
- Jak funguje **pravidlo porovnávání rozměrů zprava doleva**.
- Jak NumPy realizuje broadcasting v paměti RAM pomocí nulových kroků (**stride = 0**).
- Vizuální schémata a praktické příklady (vnější součiny, škálování RGB kanálů, normalizace dat).

```python
import numpy as np
```

---
<!-- slide: id2, Příklad 1, Core, pythonic -->
## Příklad 1: Skalár a 1D pole

Nejjednodušším případem broadcastingu je operace mezi polem a skalárem:

```python
import numpy as np

arr = np.array([1, 2, 3])
vysledek = arr * 2
print(vysledek)  # [2 4 6]
```

Skalární hodnota `2` (tvar `()`) se automaticky rozprostře podél osy pole `arr` (tvar `(3,)`), jako by šlo o pole `[2, 2, 2]`:
```python
# Myšlenkový ekvivalent:
print(np.array([1, 2, 3]) * np.array([2, 2, 2]))  # [2 4 6]
```

> [!NOTE]
> V paměti počítače zůstává hodnota `2` uložena pouze jednou. Žádné 3-prvkové pole se fyzicky nealokuje!

---
<!-- slide: id_img1, Vizuální schéma: Skalár a 1D vektor, WOW, pythonic -->
## Vizuální schéma: Skalár a 1D vektor

Při operaci mezi 1D vektorem tvaru `(3,)` a skalárem `2.0` se skalár virtuálně roztáhne na všechny odpovídající prvky:

![Broadcasting skaláru a 1D pole](/app/images/broadcasting/broadcasting_scalar_matrix.gif)

> [!TIP]
> Skalár `b = 2.0` má nulový rozměr. NumPy virtuálně doplní chybějící osu a v C smyčce čte stále stejnou paměťovou buňku pro každý prvek pole `a`.

---
<!-- slide: id3, Příklad 2, Core, pythonic -->
## Příklad 2: 2D matice a 1D řádkový vektor

Uvažujme matici tvaru `(4, 3)` a 1D vektor tvaru `(3,)`:

```python
import numpy as np

# Matice 4 řádky × 3 sloupce:
a = np.array([
    [ 0,  0,  0],
    [10, 10, 10],
    [20, 20, 20],
    [30, 30, 30]
])

# 1D vektor o 3 prvcích:
b = np.array([0, 1, 2])

# Sčítání pole a + b:
c = a + b
print(c)
# [[ 0  1  2]
#  [10 11 12]
#  [20 21 22]
#  [30 31 32]]
```

Zde byl vektor `b` virtuálně roztažen do 4 řádků, aby vytvořil tvar `(4, 3)`. Vektor `b` se přičetl ke **každému řádku** matice `a`.

---
<!-- slide: id_img2, Vizuální schéma: 2D matice a 1D řádkový vektor, WOW, pythonic -->
## Vizuální schéma: 2D matice a 1D řádkový vektor

Při sčítání matice `(4, 3)` a vektoru `(3,)` se řádkový vektor replikuje vertikálně podél osy 0:

![Broadcasting 1D vektoru na 2D matici](/app/images/broadcasting/broadcasting_vector_matrix.gif)

> [!NOTE]
> Vektor `b = [0, 1, 2]` je v operační paměti alokován pouze jednou (3 čísla float = 24 bajtů). Nebyla alokována žádná matice $4 \times 3$!

---
<!-- slide: id4, Příklad 3, WOW, pythonic -->
## Příklad 3: Sloupcový vektor a řádkový vektor (Vnější operace)

Co se stane, když chceme sečíst dva vektory s délkami 4 a 3?

```python
import numpy as np

a = np.array([0, 10, 20, 30])  # tvar (4,)
b = np.array([0, 1, 2])         # tvar (3,)

# Přímé sčítání selže:
# a + b -> ValueError: operands could not be broadcast together with shapes (4,) (3,)
```

Povýšením vektoru `a` na 2D sloupcovou matici tvaru **`(4, 1)`** získáme kompatibilní tvary:

```python
# Vytvoření sloupce pomocí np.newaxis:
a_col = a[:, np.newaxis]  # tvar (4, 1)

# Nyní broadcasting roztáhne obě pole do tvaru (4, 3):
tabulka = a_col + b
print(tabulka)
# [[ 0  1  2]
#  [10 11 12]
#  [20 21 22]
#  [30 31 32]]
```

---
<!-- slide: id5, Definice, Tricky, newconcept -->
## Formální pravidla Broadcastingu

> [!IMPORTANT]
> **Pravidlo broadcastingu v NumPy**:
> Dvě pole jsou kompatibilní pro broadcasting, pokud pro každou dimenzi **porovnávanou odzadu (zprava doleva)** platí:
> 1. Obě dimenze mají **přesně stejnou velikost**, NEBO
> 2. Jedna z dimenzí má **velikost přesně 1** (nebo v menším poli chybí).

Pokud pole nemají stejný počet dimenzí, menší pole se zleva virtuálně doplní jedničkami, dokud nemají stejný počet os:

$$\begin{aligned}
\text{Pole A: } & (4, 1) \\
\text{Pole B: } & (\phantom{4, } 3) \implies (1, 3) \\
\hline
\text{Výsledek: } & (4, 3)
\end{aligned}$$

---
<!-- slide: id6, Definice – příklady, WOW, newconcept -->
## Praktické příklady kompatibility dimenzí

### Příklad A: Škálování RGB obrazu
Máme barevný obrázek o rozlišení $256 \times 256$ pixelů se 3 barevnými kanály a chceme jednotlivé kanály přenásobit různými vahami:

$$\begin{aligned}
\text{Obraz: } & 256 \times 256 \times 3 \\
\text{Váhy: } & \phantom{256 \times 256 \times } 3 \\
\hline
\text{Výsledek: } & 256 \times 256 \times 3 \quad \checkmark \text{ Platné}
\end{aligned}$$

### Příklad B: Složitější vícerozměrné pole
$$\begin{aligned}
\text{Pole A: } & 8 \times 1 \times 6 \times 1 \\
\text{Pole B: } & \phantom{8 \times } 7 \times 1 \times 5 \\
\hline
\text{Výsledek: } & 8 \times 7 \times 6 \times 5 \quad \checkmark \text{ Platné}
\end{aligned}$$

Zde došlo k roztažení 2. a 4. dimenze v poli A a 1. a 3. dimenze v poli B současně!

---
<!-- slide: id_img6, Vizuální schéma: 2D sloupcový a 2D řádkový vektor, WOW, pythonic -->
## Vizuální schéma: 2D sloupcový a 2D řádkový vektor

Kombinace sloupce `(4, 1)` a řádku `(1, 3)` roztáhne obě dimenze současně a vytvoří výslednou matici tvaru `(4, 3)`:

![Broadcasting sloupcového a řádkového vektoru](/app/images/broadcasting/broadcasting_outer_vector.gif)

> [!TIP]
> Tímto způsobem můžeme bleskově počítat vzdálenostní matice, kartézské součiny, nebo tabulky násobilky bez jediné vnořené smyčky.

---
<!-- slide: id7, Poznámky, Core, paradigm -->
## Jak to funguje v paměti: Nulové kroky (`stride = 0`)

Jak je možné, že broadcasting nevyžaduje žádnou paměť navíc?
Trik spočívá v nastavení **kroků (`strides`)**:

Když má pole v dané ose rozměr 1, NumPy nastaví příslušný **krokový posun v bajtech na 0 (`stride = 0`)**:

```python
import numpy as np

x = np.array([[10], [20], [30]])  # tvar (3, 1)
print(x.strides)  # (8, 8)

# Broadcasting do tvaru (3, 4):
broadcasted = np.broadcast_to(x, (3, 4))
print(broadcasted.shape)    # (3, 4)
print(broadcasted.strides)  # (8, 0)  <- Stride 0 ve sloupci!
```

> [!NOTE]
> Stride 0 znamená: při posunu na další sloupec přičti k paměťové adrese **0 bajtů**. Procesor čte stále stejnou buňku paměti v L1 cache procesoru.
> Tím je zajištěna stoprocentní hardwarová efektivita.

---
<!-- slide: id8, Ilustrace principu, Core, basics -->
## Shrnutí a zlatá pravidla Broadcastingu

1. **Porovnávejte vždy od konce (zprava doleva)**: Poslední dimenze s poslední, předposlední s předposlední.
2. **Podmínka shody**: Pro každou dvojici dimenzí musí platit $d_1 == d_2$, nebo alespoň jedno z čísel musí být rovno $1$.
3. **Chybějící dimenze**: Chybějící dimenze u pole s nižším počtem os se automaticky zleva doplní jako $1$.
4. **Paměťová efektivita**: Operace běží v kompilovaných C smyčkách s nulovým kopírováním dat díky triku s nulovým krokem (`stride = 0`).
5. **Použití `np.newaxis` / `None`**: Pokud pole nejsou kompatibilní, vložte osu o velikosti 1 ručně pomocí `arr[:, np.newaxis]`.
