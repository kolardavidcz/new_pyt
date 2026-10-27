<!-- slide: id1, Úvod do n-tic (tuple), Core, paradigm -->
## N-tice (`tuple`): Odlehčené neměnné záznamy

N-tice (**`tuple`**) patří k nejfundamentálnějším datovým typům v Pythonu.

Ačkoliv je n-tice formálně sekvenčním typem (podobně jako `list`), v praxi mají zcela odlišný účel a sémantiku:

| Vlastnost | `list` (seznam) | `tuple` (n-tice) |
| :--- | :--- | :--- |
| **Mutabilita** | Měnitelný (*mutable*) | **Neměnný** (*immutable*) |
| **Sémantika** | Homogenní kolekce proměnné délky (např. seznam studentů) | **Heterogenní záznam** pevné struktury (např. souřadnice `(x, y, z)` nebo záznam `(id, jmeno, email)`) |
| **Výkon a paměť** | Větší paměťová režie pro budoucí růst | **Kompaktní paměť**, rychlejší alokace v CPythonu |
| **Hešovatelnost** | Nehešovatelný (nelze použít jako klíč) | **Hešovatelný** (pokud obsahuje neměnné prvky) |

---
<!-- slide: id2, Vytvoření n-tice – čárka vs. závorky, Core, basics -->
## Konstrukce n-tice: Čárka dělá tuple!

Zásadní pravidlo syntaxe Pythonu: **N-tici vytváří čárka `,`, nikoliv závorky `()`!**

Kulaté závorky slouží pouze pro zpřehlednění nebo vyřešení syntaktické priority:

```python
# Čárka bez závorek vytvoří n-tici:
t1 = 1, 2, "ahoj"
print(type(t1))  # <class 'tuple'>

# Závorky pro přehlednost:
t2 = (1, 2, "ahoj")

# JEDNOPRVKOVÁ n-tice VYŽADUJE ČÁRKU:
ne_tuple = (42)    # Pouhé číslo int v matematických závorkách!
je_tuple = (42,)   # N-tice o jednom prvku!
je_tuple2 = 42,    # Také n-tice o jednom prvku!
```

Konstruktor `tuple(iterable)` převede libovolný iterovatelný objekt na n-tici:
```python
>>> tuple("ABC")
('A', 'B', 'C')
```

---
<!-- slide: id3, Prázdná n-tice, Skip, basics -->
## Prázdná n-tice

Protože prázdnou n-tici nelze vyjádřit čárkou bez prvků, představuje jedinou syntaktickou výjimku, kde jsou kulaté závorky povinné:

```python
prazdna_1 = ()
prazdna_2 = tuple()

print(type(prazdna_1))  # <class 'tuple'>
print(len(prazdna_1))   # 0
print(bool(prazdna_1))  # False (falsy v logickém kontextu)
```

> [!NOTE] Optimalizace v CPythonu
> Protože je prázdná n-tice neměnná a bezestavová, CPython ji v paměti drží jako jediný globální singleton. Volání `tuple()` nebo `()` vždy vrátí tentýž objekt v paměti (`() is () == True`).

---
<!-- slide: id4, N-tice jako sekvence (Indexování a řezy), Already Studied, basics -->
## Sekvenční operace nad n-ticí

Jako každá sekvence podporuje `tuple` indexování, řezy, testování přítomnosti i násobení:

```python
zaznam = ("Karel", 25, "Praha", 45_000.0)

# 1. Indexování zleva i od konce:
jmeno = zaznam[0]       # 'Karel'
plat = zaznam[-1]       # 45000.0

# 2. Řezy (slicing) – vrátí novou n-tici:
podvyber = zaznam[1:3]  # (25, 'Praha')

# 3. Test přítomnosti:
print("Praha" in zaznam) # True

# 4. Spojení a násobení:
dvojice = (1, 2)
print(dvojice * 3)       # (1, 2, 1, 2, 1, 2)
```

---
<!-- slide: id5, Iterace přes n-tici smyčkou for-in, Already Studied, basics -->
## Iterace přes n-tici

Průchod prvky n-tice:

```python
bod = (10, 20, 30)

# Běžný průchod:
for souradnice in bod:
    print(souradnice)

# S indexem:
for idx, val in enumerate(bod):
    print(f"Osa {idx}: {val}")

# V opačném pořadí:
for val in reversed(bod):
    print(val)
```

Pokud jsou prvky vzájemně porovnatelné, funkce `sorted(bod)` vrátí seřazený **seznam** `list`.

---
<!-- slide: id6, Neměnnost n-tice a její výjimky, Core, resyntax -->
## Neměnnost n-tice a měnitelné vnitřní prvky

Do n-tice nelze po vytvoření přidávat prvky, odebírat je ani měnit na pozici:

```python
t = (1, 2, 3)
t[0] = 99  # TypeError: 'tuple' object does not support item assignment
```

> [!CAUTION] Pozor na mutable objekty uvnitř tuple!
> Neměnnost n-tice znamená pouze to, že **vazby na referencované objekty jsou fixní**.
> Pokud je však prvkem n-tice měnitelný objekt (např. `list`), stav tohoto vnitřního objektu lze modifikovat:
> ```python
> xs = [1, 2]
> t = (10, xs)
> t[1].append(3)  # Zcela legální!
> print(t)        # (10, [1, 2, 3])
> ```
> Taková n-tice ovšem **ztrácí hešovatelnost** a nelze ji použít jako klíč do slovníku!

---
<!-- slide: id7, Metody n-tice: index() a count(), Already Studied, basics -->
## Metody n-tice: pouze `index()` a `count()`

Ve srovnání se seznamem má `tuple` minimální veřejné rozhraní – nabízí pouze dvě metody:

```python
data = ("a", "b", "c", "a", "d")

# 1. Počet výskytů prvku:
print(data.count("a"))  # 2
print(data.count("z"))  # 0

# 2. Index prvního výskytu:
print(data.index("b"))  # 1

# Pokud prvek neexistuje, vyvolá ValueError:
# data.index("z") -> ValueError: tuple.index(x): x not in tuple
```

Díky absenci desítek metod pro modifikaci (`append`, `extend`, `insert`, `pop`, `sort`, `reverse`) je n-tice extrémně lehkotonážní.

---
<!-- slide: id8, Úvod do rozbalování n-tic (Tuple Unpacking), Skip, basics -->
## Síla n-tic: Rozbalování (*Tuple Unpacking*)

Nejsilnější zbraní n-tic v Pythonu je schopnost **vícenásobného přiřazení a rozbalování**:

$$\mathbf{x, y, z = (10, 20, 30)}$$

V C/C++ nebo Javě musí funkce pro vrácení více hodnot definovat pomocnou třídu, strukturu, nebo použít výstupní ukazatele (`out int`).

V Pythonu je paralelní přiřazení a vícenásobný návrat z funkce nativní součástí jazyka od prvních verzí.

---
<!-- slide: id9, Paralelní přiřazení (Unpacking I), Core, pythonic -->
## Paralelní přiřazení proměnných

Máme-li na pravé straně n-tici (nebo jakoukoliv sekvenci) o $N$ prvcích, můžeme ji na levé straně rozbalit do přesně $N$ samostatných proměnných:

```python
bod = (100, 200, 300)

# Rozbalení na jednotlivé proměnné:
x, y, z = bod

print(f"X={x}, Y={y}, Z={z}")
# X=100, Y=200, Z=300
```

> [!WARNING] Nesoulad počtu prvků
> Počet proměnných na levé straně musí přesně odpovídat počtu prvků vpravo:
> ```python
> a, b = (1, 2, 3)
> # ValueError: too many values to unpack (expected 2)
> 
> a, b, c = (1, 2)
> # ValueError: not enough values to unpack (expected 3, got 2)
> ```

---
<!-- slide: id10, Vícenásobná návratová hodnota z funkcí, WOW, pythonic -->
## Vícenásobná návratová hodnota z funkce

Funkce v Pythonu formálně vrací vždy pouze **jeden jediný objekt**.

Když v příkazu `return` oddělíme hodnoty čárkou, Python je automaticky zabalí do n-tice:

```python
def statistika(cisla: list[float]) -> tuple[float, float, float]:
    """Vrátí minimum, průměr a maximum ze seznamu čísel."""
    return min(cisla), sum(cisla) / len(cisla), max(cisla)

# Volání a okamžité rozbalení:
nejmensi, prumer, nejvetsi = statistika([10.0, 25.0, 3.0, 42.0])
print(f"Min: {nejmensi}, Průměr: {prumer:.2f}, Max: {nejvetsi}")

# Nebo převzetí jako jednoho balíčku:
vysledek = statistika([10.0, 25.0, 3.0, 42.0])
print(vysledek)  # (3.0, 20.0, 42.0)
```

---
<!-- slide: id11, Rozbalení libovolných iterovatelných objektů, Core, pythonic -->
## Rozbalení libovolných kolekcí

Mechanismus rozbalování funguje pro **jakýkoliv iterovatelný objekt**, nejen pro n-tice:

```python
# Rozbalení seznamu:
prvni, druhy, treti = [1, 2, 3]

# Rozbalení rozsahu (range):
po, ut, st = range(3)

# Rozbalení jednotlivých znaků řetězce:
a, b, c = "ABC"
print(a, b, c)  # 'A', 'B', 'C'

# Rozbalení klíčů slovníku:
k1, k2 = {"jmeno": "Jan", "vek": 30}
print(k1, k2)  # 'jmeno', 'vek'
```

---
<!-- slide: id12, Rozbalení jednoprvkových kolekcí, Tricky, pythonic -->
## Rozbalení jednoprvkových kolekcí

Pokud funkce vrací jednoprvkový seznam a my chceme vytáhnout přímo jeho obsah bez psaní `vysledek[0]`:

```python
# Zápis s čárkou (rozbalení do jednoprvkové n-tice):
polozka, = ["jediny_prvek"]
print(polozka)  # 'jediny_prvek'

# Ekvivalentní zápis v hranatých závorkách:
[polozka] = ["jediny_prvek"]
print(polozka)  # 'jediny_prvek'
```

Tento trik se často objevuje v knihovnách jako `matplotlib` (např. `line, = ax.plot(x, y)`).

---
<!-- slide: id13, Prohození proměnných a operátor *, WOW, pythonic -->
## Prohození proměnných a hvězdičkové rozbalování (*PEP 3132*)

### 1. Elegantní prohození hodnot proměnných bez pomocné proměnné:
```python
# V C/Javě: int temp = a; a = b; b = temp;
# V Pythonu:
a, b = b, a
```
Python nejprve vyhodnotí pravou stranu (vytvoří dočasnou n-tici `(b, a)`) a pak ji rozbalí do proměnných na levé straně.

### 2. Hvězdičkové rozbalování (`*rest`):
Záchyt libovolného zbytku prvků do samostatného seznamu `list`:

```python
zaznam = ("CZ", 2026, 10, 27, "Praha", "Oblačno")

stat, *datum, mesto, pocasi = zaznam

print(stat)    # 'CZ'
print(datum)   # [2026, 10, 27]  <- Seznam středových hodnot!
print(mesto)   # 'Praha'
print(pocasi)  # 'Oblačno'
```

---
<!-- slide: id14, Hvězdičkové rozbalování – prázdný zbytek, Skip, pythonic -->
## Hvězdičkové rozbalování: Zbytková proměnná může být prázdná

Pokud přesně vystačí ostatní proměnné, hvězdičková proměnná zachytí **prázdný seznam** `[]`:

```python
data = (1, 2)

*zbytek, druhy, treti = data

print(zbytek)  # [] (žádný prvek nezbyl)
print(druhy)   # 1
print(treti)   # 2
```

Tento mechanismus nikdy nevyvolá `IndexError` ani `ValueError`.

---
<!-- slide: id15, Převod iterátoru na seznam pomocí *x, Skip, pythonic -->
## Rychlý převod na seznam pomocí `*x,`

Kombinace hvězdičky a čárky umožňuje elegantní rozbalení iterátoru na seznam prvků:

```python
# Rychlé rozložení řetězce na seznam znaků:
*znaky, = "Python"
print(znaky)
# ['P', 'y', 't', 'h', 'o', 'n']

# Ekvivalent k: znaky = list("Python")
```

---
<!-- slide: id16, Hvězdičkové rozbalení argumentů při volání funkcí, WOW, pythonic -->
## Rozbalení argumentů při volání funkce (`*args`)

Pokud máme data shromážděná v n-tici nebo seznamu a funkce očekává samostatné poziční argumenty:

```python
souradnice = (10, 25, 50)

# Namísto manuálního předávání bod(souradnice[0], souradnice[1], souradnice[2]):
def nastav_bod(x: int, y: int, z: int) -> None:
    print(f"Bod nastaven na [{x}, {y}, {z}]")

# Rozbalení pomocí hvězdičky:
nastav_bod(*souradnice)
```

Typické použití s `print()`:
```python
polozky = ["chyba", "soubor.txt", "řádek 42"]
print(*polozky, sep=" -> ")
# chyba -> soubor.txt -> řádek 42
```

---
<!-- slide: id17, Ignorování hodnot podtržítkem _, WOW, pythonic -->
## Ignorování nechtěných hodnot podtržítkem `_`

V Pythonu je konvencí označovat proměnné, jejichž hodnotu nepotřebujeme, jménem **`_`** (*underscore*):

```python
# Zajímají nás pouze první a poslední hodnota:
prvni, *_, posledni = [10, 20, 30, 40, 50]
print(prvni, posledni)  # 10 50

# Iterace s ignorováním jednoho prvku dvojice:
statistika = [("Praha", 1_300_000), ("Brno", 380_000)]
for mesto, _ in statistika:
    print(mesto)
```

Podtržítko je plnohodnotný identifikátor, ale pro vývojáře i linery (Ruff, Flake8) jasně signalizuje: *„tuto hodnotu záměrně zahazuji“*.

---
<!-- slide: id18, Skládání n-tic a zanořování, Tricky, pythonic -->
## Skládání a zřetězení n-tic

Při tvorbě nových n-tic z existujících je třeba dbát na operátory:

```python
t1 = (1, 2)
t2 = ('a', 'b')

# 1. Zřetězení prvků operátorem +:
spojene = t1 + t2
print(spojene)  # (1, 2, 'a', 'b')

# 2. Vnořená n-tice:
vnorene = (t1, t2)
print(vnorene)  # ((1, 2), ('a', 'b'))

# 3. Moderní rozbalení v literálu (Python 3.5+):
kombinace = (*t1, "střed", *t2)
print(kombinace) # (1, 2, 'střed', 'a', 'b')
```

---
<!-- slide: id19, Proč n-tice existují (Výkon a efektivita), Core, paradigm -->
## Proč používat n-tice místo seznamů?

N-tice nejsou jen „ochuzené seznamy“. V CPythonu mají zásadní technické výhody:

1. **Rychlejší vytvoření a nižší paměťová režie**:
   - `tuple` má pevně danou velikost. CPython alokuje přesně tolik paměti, kolik je potřeba.
   - `list` musí alokovat dodatečnou vyrovnávací paměť (*over-allocation*), aby operace `append()` probíhala v amortizovaném čase $O(1)$.
   ```python
   import sys
   print(sys.getsizeof((1, 2, 3)))  # 64 bajtů
   print(sys.getsizeof([1, 2, 3]))  # 88 bajtů
   ```

2. **Obrana proti nezáměrným modifikacím (*Defensive Programming*)**:
   - Předáte-li do jiné komponenty `tuple`, máte jistotu, že cizí kód obsah vašeho záznamu nezmění ani nepoškodí.

---
<!-- slide: id20, Hešovatelnost a n-tice jako klíče slovníků, Tricky, paradigm -->
## N-tice jako složené klíče ve slovnících

Protože je `tuple` neměnný, může být **hešovatelný** a sloužit jako klíč v hešovací tabulce slovníku `dict` nebo prvek v množině `set`:

```python
# Šachovnice nebo mřížka grafu: souřadnice (řádek, sloupec) jako klíč
hraci_pole: dict[tuple[int, int], str] = {}

hraci_pole[(0, 0)] = "Věž"
hraci_pole[(0, 1)] = "Jezdec"
hraci_pole[(7, 4)] = "Král"

print(hraci_pole[(0, 0)])  # 'Věž'
```

> [!IMPORTANT] Shrnutí JPZ
> *„Python bez n-tic by nebyl Python.“*
> N-tice jsou fundamentálním lepidlem pro předávání dat mezi funkcemi, paralelní rozbalování a složené hešovatelné identifikátory.
