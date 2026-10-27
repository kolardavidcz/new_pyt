<!-- slide: id1, Úvod do modulu random a bezpečnostní varování, Core, basics -->
## Generování náhodných čísel (modul `random`)

Modul `random` ve standardní knihovně Pythonu poskytuje generátor **pseudonáhodných čísel** založený na osvědčeném algoritmu **Mersenne Twister** (s obrovskou periodou $2^{19937} - 1$).

```python
import random

print(random.randint(1, 10))  # Náhodné celé číslo mezi 1 a 10
```

> [!CAUTION] ZÁKAZ POUŽITÍ V KRYPTOGRAFII!
> Modul `random` je **zcela deterministický**. Jakmile útočník odpozoruje 624 vygenerovaných 32bitových čísel, dokáže zrekonstruovat vnitřní stav generátoru a předpovědět všechna budoucí čísla!
> - Pro hesla, bezpečnostní tokeny, session ID a kryptografii **VŽDY používejte standardní modul `secrets`** (PEP 506):
>   ```python
>   import secrets
>   token = secrets.token_hex(16)
>   tajne_cislo = secrets.randbelow(100)
>   ```

---
<!-- slide: id2, Kdy modul random použít a základní funkce random(), Skip, basics -->
## Kdy je modul `random` ideální?

Modul `random` je určen pro:
- **Simulace a statistické modelování** (metoda Monte Carlo).
- **Počítačové hry a procedurální generování**.
- **Testování a generování mockovacích dat**.

### Základní funkce: `random.random()`
Všechny ostatní funkce modulu jsou odvozeny od základní funkce `random.random()`, která vrací rovnoměrně rozložené číslo typu `float` v polouzavřeném intervalu $[0.0, 1.0)$:

```python
import random

print(random.random())  # Např. 0.7248192305842841
```

---
<!-- slide: id3, Náhodná celá čísla: randrange(), Core, pythonic -->
## Náhodná celá čísla: `random.randrange()`

Funkce `randrange()` kopíruje chování vestavěné funkce `range()`. Generuje celá čísla v polouzavřeném intervalu $[start, stop)$:

```python
import random

# V rozsahu 0 až 9 (stop je 10, není součástí):
print(random.randrange(10))

# V rozsahu 5 až 19:
print(random.randrange(5, 20))

# S krokem: pouze lichá čísla od 1 do 9:
print(random.randrange(1, 10, 2))
```

---
<!-- slide: id4, Náhodná celá čísla: randint(), Tricky, resyntax -->
## Náhodná celá čísla: `random.randint()`

Nejpopulárnější zkratkou je funkce `random.randint(a, b)`:

```python
import random

# Hod šestistěnnou kostkou (čísla 1 až 6):
kostka = random.randint(1, 6)
print(f"Padlo: {kostka}")
```

> [!WARNING] Zásadní rozdíl: Uzavřený interval!
> Na rozdíl od `range()` a `randrange()` je u `randint(a, b)` **horní mez `b` ZAHRNUTA do výsledku**!
> Platí ekvivalence: `random.randint(a, b) == random.randrange(a, b + 1)`.

---
<!-- slide: id5, Výběr ze sekvencí: choice() a vážený výběr choices(), Core, pythonic -->
## Výběr prvku ze sekvence: `choice()` a `choices()`

Pro výběr prvků ze seznamu či n-tice:

```python
import random

barvy = ["cervena", "zelena", "modra", "zluta"]

# 1. Výběr jednoho náhodného prvku
vybrana = random.choice(barvy)
print(f"Vybrána: {vybrana}")
```

### Vážený výběr s opakováním: `random.choices()`
Umožňuje vybrat $k$ prvků (s možností opakování) a přiřadit jim váhy pravděpodobnosti:

```python
# 80 % šance na běžnou odměnu, 15 % na vzácnou, 5 % na legendární:
odmeny = ["Common", "Rare", "Legendary"]
vahy = [80, 15, 5]

los = random.choices(odmeny, weights=vahy, k=5)
print(los)  # Např. ['Common', 'Common', 'Rare', 'Common', 'Common']
```

---
<!-- slide: id6, Náhodné promíchání na místě: shuffle(), Tricky, pythonic -->
## Náhodné promíchání: `random.shuffle()`

Funkce `random.shuffle(lst)` náhodně přeuspořádá prvky v seznamu **přímo na místě** (*in-place*) v čase $O(n)$ (pomocí Fisherova-Yatesova algoritmu). Vrací `None`:

```python
import random

balicek = [f"{hodnota}{barva}" for barva in "♠♥♦♣" for hodnota in range(7, 11)]

# Promíchá seznam in-place:
random.shuffle(balicek)
print(balicek)
```

> [!NOTE] Pouze pro měnitelné sekvence
> Funkci `shuffle()` lze aplikovat pouze na modifikovatelné kolekce (`list`). Nelze ji použít na `tuple` nebo `str`.

---
<!-- slide: id7, Výběr bez opakování: random.sample(), WOW, pythonic -->
## Výběr bez opakování: `random.sample()`

Funkce `random.sample(populace, k)` náhodně vybere $k$ unikátních prvků **bez opakování** (*without replacement*). Původní kolekci nemění:

```python
import random

# Tah sportky: 6 unikátních čísel ze 49
tah = random.sample(range(1, 50), 6)
print(f"Vylosovaná čísla: {sorted(tah)}")
```

> [!TIP] Úspora paměti s range
> `random.sample(range(1_000_000), 5)` okamžitě vybere 5 čísel, aniž by v paměti alokoval seznam s milionem prvků!

---
<!-- slide: id8, Náhodná reálná čísla: random(), Skip, basics -->
## Generování reálných čísel (`float`)

Funkce `random.random()` produkuje rovnoměrně rozložená čísla $x \in [0.0, 1.0)$:

```python
import random

hodnoty = [random.random() for _ in range(5)]
print(hodnoty)
```

Lze ji snadno transformovat na libovolný interval $[A, B)$:
```python
# Hodnota mezi 10.0 a 20.0:
val = 10.0 + (20.0 - 10.0) * random.random()
```

---
<!-- slide: id9, Náhodná čísla v intervalu: uniform(), Skip, basics -->
## Rovnoměrné rozložení v intervalu: `random.uniform()`

Namísto manuálního škálování použijte funkci `random.uniform(a, b)`:

```python
import random

# Teplota mezi -5.0 °C a +15.0 °C
teplota = random.uniform(-5.0, 15.0)
print(f"Naměřeno: {teplota:.2f} °C")
```

Funguje bez ohledu na to, zda je $a < b$ nebo $b < a$.

---
<!-- slide: id10, Statistické distribuce (Gauss, Expo, Lognorm), Skip, pythonic -->
## Statistická rozdělení pravděpodobnosti

Modul `random` obsahuje funkce pro pokročilá rozdělení:

- `random.gauss(mu, sigma)`: Normální (Gaussovo) rozdělení se střední hodnotou $\mu$ a směrodatnou odchylkou $\sigma$.
- `random.expovariate(lambd)`: Exponenciální rozdělení (modelování příchodu zákazníků, síťového provozu).
- `random.lognormvariate(mu, sigma)`: Lognormální rozdělení.

```python
import random

# Generování IQ s průměrem 100 a směrodatnou odchylkou 15:
iq = random.gauss(mu=100, sigma=15)
print(f"Generované IQ: {iq:.1f}")
```

> [!TIP] Přechod na NumPy pro Data Science
> Pro masivní maticové operace a generování milionů náhodných čísel do polí použijte **NumPy**: `np.random.default_rng().normal(...)`.

---
<!-- slide: id11, Reprodukovatelnost výpočtů: random.seed(), Core, basics -->
## Reprodukovatelnost a nastavení násady: `random.seed()`

Při vědeckých experimentech, machine learningu a psaní unit testů potřebujeme, aby náhodné jevy byly **pokaždé přesně reprodukovatelné**:

```python
import random

# Nastavení pevné násady (seed)
random.seed(42)

cisla_1 = [random.randint(1, 100) for _ in range(3)]
print(cisla_1)  # [82, 15, 4]

# Po novém nastavení stejného seedu obdržíme naprosto stejná čísla:
random.seed(42)
cisla_2 = [random.randint(1, 100) for _ in range(3)]
print(cisla_2)  # [82, 15, 4]
```

Bez zadání parametru inicializuje Python násadu ze systémového zdroje entropie OS.

---
<!-- slide: id12, Izolované generátory: třída random.Random, Skip, newconcept -->
## Izolované instance: Třída `random.Random`

Ve výchozím nastavení všechny funkce sdílejí jeden globální stav generátoru. Pokud chcete, aby vaše knihovna nebo simulace měla **vlastní nezávislý generátor**, vytvořte instanci třídy `Random`:

```python
import random

# Vytvoření nezávislého generátoru s vlastní násadou:
muj_rng = random.Random(12345)

print(muj_rng.randint(1, 6))
print(muj_rng.choice(["A", "B", "C"]))
```

Tím zabráníte tomu, aby jiná část aplikace nebo externí knihovna ovlivnila náhodnou posloupnost vaší simulace.
