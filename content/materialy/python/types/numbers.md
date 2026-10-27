<!-- slide: id1, int, float, complex I, Core, basics -->
## Číselné typy v Pythonu: `int`, `float`, `complex`

Přímo v jádře jazyka bez importování externích knihoven má Python k dispozici 3 číselné typy:

- **`int`**: Celá čísla s **neomezenou přesností** (*arbitrary-precision / bignum*). CPython dynamicky alokuje tolik paměti, kolik je potřeba – nedochází k přetečení na 32bit nebo 64bit hranici jako v C/C++ nebo Javě.
- **`float`**: Reálná čísla v plovoucí řádové čárce dle standardu **IEEE 754** s dvojnásobnou přesností (*double precision*, 64 bitů, cca 15–17 platných desítkových cifer).
- **`complex`**: Komplexní čísla reprezentovaná jako dvojice 64bitových `float` hodnot (reálná a imaginární složka, např. `1.5 + 2.0j`).

> [!NOTE] Logický typ `bool` je podtřídou `int`
> V Pythonu platí `issubclass(bool, int) == True`. Hodnoty `True` a `False` se chovají jako celá čísla `1` a `0`:
> ```python
> >>> True + True
> 2
> >>> isinstance(True, int)
> True
> ```

---
<!-- slide: id2, int, float, complex II, Skip, basics -->
## Základní aritmetické operace

Aritmetické operátory fungují přirozeně a automaticky povyšují celá čísla na `float` nebo `complex`, pokud je jeden z operandů tohoto typu:

```python
>>> 3 + 5
8
>>> 3.1 + 5       # int je povýšen na float
8.1

>>> 8 / 2         # Dělení VŽDY vrací float!
4.0
>>> 8 / 2 + 3
7.0

>>> (1 + 1j) * (2 + 1j)
(1+3j)
```

Priorita operátorů odpovídá standardním matematickým pravidlům (závorky `()`, mocnění `**`, násobení/dělení `*`, `/`, `//`, `%`, sčítání/odčítání `+`, `-`).

---
<!-- slide: id3, int, float, complex III (Dělení a přesnost), Tricky, resyntax -->
## Dělení reálné, celočíselné a modulo

Python striktně rozlišuje dva druhy dělení:

- **Běžné reálné dělení `/`**: **Vždy** vrací `float`, i když je dělení beze zbytku (`4 / 2 -> 2.0`).
- **Celočíselné dělení `//`**: Ořezává výsledek směrem k minus nekonečnu (*floored division*).
- **Modulo `%`**: Vrací zbytek po celočíselném dělení.

```python
>>> 4 / 2
2.0
>>> 4 // 2
2
>>> 4.2 // 2
2.0   # Výsledek je float se zaokrouhlenou celočíselnou hodnotou

>>> 4.2 % 2
0.20000000000000018
```

> [!WARNING] Záludnost reprezentace plovoucí řádové čárky
> Číslo `0.2` nelze ve dvojkové soustavě reprezentovat konečným počtem bitů ($0.2_{10} = 0.00110011\dots_2$).
> Drobné nepřesnosti jako `0.20000000000000018` nejsou chybou Pythonu, nýbrž inherentní vlastností hardwarového IEEE 754 standardu.

---
<!-- slide: id4, PS: Podtržítka v zápisech čísel, WOW, pythonic -->
## Podtržítka v číselných literálech (PEP 515)

Pro zvýšení čitelnosti velkých čísel a bajtových masek lze do číselných literálů vkládat podtržítka `_`. Interpret je při běhu zcela ignoruje:

```python
# Velká celá čísla:
pocet_bodu = 1_000_000_000

# Reálná čísla:
koeficient = 1_000_000.000_003

# Hexadecimální a binární masky:
barva_rgba = 0xFF_AA_00_FF
priznaky   = 0b1111_0000_1010_0101
```

---
<!-- slide: id5, Poznámka k „//“ a „%“ (Floored vs Truncated), Tricky, resyntax -->
## Celočíselné dělení a modulo záporných čísel

V C/C++ a Javě se celočíselné dělení zaokrouhluje **k nule** (*truncated division*), takže `-22 / 10 == -2` a `-22 % 10 == -2`.

V Pythonu je dělení definováno jako **zaokrouhlení k $-\infty$** (*floored division*):

$$\lfloor -22 / 10 \rfloor = \lfloor -2.2 \rfloor = -3$$

```python
>>> -22 // 10
-3
>>> -22 % 10
8
```

Důvodem je zachování matematické identity pro jakákoliv $i, j$:
$$i = (i // j) \times j + (i \% j)$$
A také to, že zbytek `i % j` má vždy **stejné znaménko jako dělitel `j`** (nebo je roven nule).

> [!TIP] Praktický příklad s hodinami
> Pokud hodiny ukazují $10$ hodin a ptáme se, co ukazovaly před $200$ hodinami:
> V Pythonu `-190 % 12 == 2` (hodiny ukazovaly 2:00). V C by vyšlo `-10`, což nedává pro časový kruh přirozený smysl.

---
<!-- slide: id6, Více o konstruktoru „int()“, Core, basics -->
## Konstruktor `int()` a převody soustav

Konstruktor `int()` bez parametrů vrací `0`.

Dokáže však převádět textové řetězce v libovolné číselné soustavě od základu 2 do 36:

```python
# Parsování s explicitním základem soustavy:
>>> int('1010', base=2)    # Dvojková
10
>>> int('77', base=8)       # Osmičková
63
>>> int('1A', base=16)      # Šestnáctková
26
>>> int('z', base=36)       # Písmena a-z reprezentují cifry 10-35
35

# Automatická detekce základu podle prefixu (base=0):
>>> int('0b1010', base=0)
10
>>> int('0x1A', base=0)
26
```

---
<!-- slide: id7, „bin()“, „oct()“, „hex()“ – jiné číselné soustavy, Skip, basics -->
## Funkce `bin()`, `oct()`, `hex()` a formátování

Pro opačný směr – převod celého čísla na řetězec v dané soustavě:

```python
>>> bin(42)
'0b101010'
>>> oct(42)
'0o52'
>>> hex(42)
'0x2a'
```

### Formátování pomocí moderních f-stringů:
```python
x = 255

# Bez prefixu:
print(f"Hex: {x:x}, Bin: {x:b}, Oct: {x:o}")
# Výstup: Hex: ff, Bin: 11111111, Oct: 377

# S prefixem (#) a velkými písmeny (X):
print(f"Hex: {x:#X}, Bin: {x:#b}")
# Výstup: Hex: 0XFF, Bin: 0b11111111
```

---
<!-- slide: id8, „int.from_bytes()“ – převod sekvencí bajtů, WOW, newconcept -->
## Binární převody: `int.from_bytes()` a `int.to_bytes()`

Pro nízkoúrovňové síťové protokoly a binární soubory nabízí `int` přímou konverzi mezi celým číslem a polem bajtů se specifikací endianity:

```python
# Nejvýznamnější bajt první (Big-Endian, Network byte order):
>>> int.from_bytes(b'\x00\x10', byteorder='big')
16

# Nejméně významný bajt první (Little-Endian, x86/ARM architektura):
>>> int.from_bytes(b'\x00\x10', byteorder='little')
4096

# Znaménková reprezentace (doplněk dvou):
>>> int.from_bytes(b'\xff\xff', byteorder='big', signed=True)
-1
>>> int.from_bytes(b'\xff\xff', byteorder='big', signed=False)
65535

# Zpětný převod z čísla na bajty:
>>> (1024).to_bytes(length=2, byteorder='big')
b'\x04\x00'
```

---
<!-- slide: id9, „float.as_integer_ratio()“ a další, WOW, pythonic -->
## Metody třídy `float`

Třída `float` má několik užitečných metod pro práci s přesností a hexadecimální reprezentací:

```python
# 1. Test, zda float představuje celé číslo:
>>> (4.0).is_integer()
True
>>> (4.5).is_integer()
False

# 2. Přesný racionální zlomek reprezentující float v paměti:
>>> (0.5).as_integer_ratio()
(1, 2)
>>> (0.1).as_integer_ratio()
(3602879701896397, 36028797018963968)  # Důkaz IEEE 754 nepřesnosti!

# 3. Přesný hexadecimální zápis reálného čísla (bez zaokrouhlovací ztráty):
>>> (1.25).hex()
'0x1.4000000000000p+0'
>>> float.fromhex('0x1.4000000000000p+0')
1.25
```

---
<!-- slide: id10, „locale.atof()“ a „locale.atoi()“, Skip, basics -->
## Lokalizované parsování: modul `locale`

Pokud pracujete se vstupy z různých jazykových prostředí (např. čeština používá desetinnou čárku `1,25` místo tečky `1.25` a mezeru jako oddělovač tisíců `1 000`):

```python
import locale

# Nastavení lokality na výchozí prostředí systému uživatele:
locale.setlocale(locale.LC_ALL, '')

# Převod řetězce zohledňující národní specifika:
# Např. v českém prostředí zvládne čárku:
# locale.atof('3,14') -> 3.14
```

> [!NOTE] Produkční doporučení
> Modul `locale` mění nastavení globálně pro celý proces (není thread-safe). Pro mezinárodní webové aplikace a API je robustnější zpracovávat čísla přímo nebo použít specializované knihovny jako `babel`.

---
<!-- slide: id11, Modul „math“, Core, basics -->
## Matematické funkce: modul `math`

Standardní knihovna `math` poskytuje přístup k matematickým funkcím implementovaným přímo v C:

```python
import math

# Konstanty:
math.pi   # 3.141592653589793
math.e    # 2.718281828459045
math.tau  # 2 * pi = 6.283185307179586
math.inf  # Kladné nekonečno
math.nan  # Not-a-Number

# Porovnávání floatů s tolerancí (od Pythonu 3.5):
math.isclose(0.1 + 0.2, 0.3)  # True!

# Celočíselná matematika (Python 3.8+ / 3.9+):
math.gcd(48, 18)   # Největší společný dělitel -> 6
math.lcm(12, 18)   # Nejmenší společný násobek -> 36
math.isqrt(25)     # Celočíselná odmocnina -> 5
```

---
<!-- slide: id12, „cmath“ – komplexní funkce, Core, basics -->
## Komplexní matematika: modul `cmath`

Pro funkce nad komplexními čísly slouží modul `cmath` (funkce z `math` na záporných číslech selžou s `ValueError`):

```python
import math
import cmath

# math.sqrt(-1)  -> ValueError: math domain error
>>> cmath.sqrt(-1)
1j

# Převod mezi kartézským a polárním tvarem:
z = 1 + 1j

# polar(z) vrátí dvojici (modul r, fáze phi v radiánech):
r, phi = cmath.polar(z)
print(f"r = {r:.4f}, phi = {phi:.4f}")  # r = 1.4142, phi = 0.7854 (pi/4)

# Zpětný převod z polárních souřadnic na komplexní číslo:
z_zpet = cmath.rect(r, phi)
```

---
<!-- slide: id13, Zápis komplexních čísel a proměnné, Tricky, resyntax -->
## Zápis komplexních čísel a proměnné

V literálu píšeme imaginární jednotku `j` přímo za číslo bez mezery (`1 + 2j`).

Pozor při skládání komplexního čísla z proměnných:

```python
>>> a, b = 1, 2

# CHYBA – Python hledá proměnnou jménem 'bj':
>>> a + bj
NameError: name 'bj' is not defined

# SPRÁVNÁ ŘEŠENÍ:
>>> a + b * 1j
(1+2j)

>>> complex(a, b)   # Idiomatické a nejčistší řešení
(1+2j)
```

---
<!-- slide: id14, Bitové operace I, Tricky, resyntax -->
## Bitové operace I

Bitové operátory pracují na celých číslech (`int`) na úrovni jednotlivých bitů:

```python
x = 10  # Binárně: 0b1010
y = 3   # Binárně: 0b0011

# AND: 1 pouze kde jsou obě 1
x & y   # 0b0010 -> 2

# OR: 1 kde je alespoň jedna 1
x | y   # 0b1011 -> 11

# XOR: 1 kde se bity liší
x ^ y   # 0b1001 -> 9

# Bitový posun (Shift):
x >> 1  # Posun doprava o 1 bit (dělení 2) -> 5 (0b0101)
y << 2  # Posun doleva o 2 bity (násobení 4) -> 12 (0b1100)

# Bitová negace (~x odpovídá -(x + 1) v doplňku dvou):
~x      # -(10 + 1) -> -11
```

---
<!-- slide: id15, Bitové operace II a moderní metody, Skip, resyntax -->
## Bitové operace II a moderní metody `int`

Využití bitových masek pro flagy a testy:

```python
FLAG_READ  = 0b001
FLAG_WRITE = 0b010
FLAG_EXEC  = 0b100

perm = FLAG_READ | FLAG_WRITE  # 0b011

# Test, zda je nastaven příznak:
has_write = bool(perm & FLAG_WRITE)  # True
has_exec  = bool(perm & FLAG_EXEC)   # False
```

### Moderní metody pro práci s bity v Pythonu:
```python
x = 42  # 0b101010

# bit_length(): počet bitů nutných pro reprezentaci čísla bez znaménka
x.bit_length()  # 6

# bit_count() (Python 3.10+): počet jedničkových bitů (tzv. Hamming weight / popcount)
x.bit_count()   # 3
```

---
<!-- slide: id16, Přesná desítková aritmetika: modul „decimal“, WOW, newconcept -->
## Přesná desítková aritmetika: modul `decimal`

Pro finanční výpočty, účetnictví a měny je typ `float` nepřijatelný kvůli zaokrouhlovacím chybám. K tomu slouží standardní modul **`decimal`**:

```python
import decimal
from decimal import Decimal

# Zásadní rozdíl:
>>> 0.1 + 0.1 + 0.1 - 0.3
5.551115123125783e-17  # U floatu nenulový zbytek!

# U Decimal inicializovaného z ŘETĚZCE:
>>> Decimal('0.1') + Decimal('0.1') + Decimal('0.1') - Decimal('0.3')
Decimal('0.0')
```

> [!CAUTION] Vždy předávejte řetězec, nikoli float!
> `Decimal(0.1)` by převzal již nepřesnou float reprezentaci. Vždy pište `Decimal('0.1')`.

Nastavení přesnosti a zaokrouhlování:
```python
decimal.getcontext().prec = 4  # Nastaví globální přesnost na 4 platná místa
print(Decimal(1) / Decimal(7)) # Decimal('0.1429')
```

---
<!-- slide: id17, Racionální čísla: modul „fractions“, WOW, pythonic -->
## Přesná racionální čísla: modul `fractions`

Modul `fractions` umožňuje bezztrátové počítání se zlomky (podíl celých čísel):

```python
from fractions import Fraction

# Konstrukce z čitatele a jmenovatele:
z1 = Fraction(3, 4)
z2 = Fraction(1, 8)

# Přesné sčítání a automatické krácení:
vysledek = z1 + z2
print(vysledek)        # 7/8
print(float(vysledek)) # 0.875

# Konstrukce ze záporných hodnot nebo řetězců:
z3 = Fraction('-16/10')
print(z3)              # -8/5

# Bezztrátový převod z floatu:
f = 0.75
z_float = Fraction(f)
print(z_float)         # 3/4
```
