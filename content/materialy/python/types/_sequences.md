<!-- slide: id1, Úvod do sekvenčních typů, Core, basics -->
## Sekvenční protokol v Pythonu

**Sekvence** tvoří základní pilíř práce s daty v Pythonu. Mezi vestavěné sekvenční typy patří:
- **Neměnné (*immutable*)**: `str`, `tuple`, `bytes`, `range`
- **Měnitelné (*mutable*)**: `list`, `bytearray`

Všechny sekvence implementují jednotný **sekvenční protokol** (*Sequence Protocol*):
1. **Garantované uspořádání**: Prvky mají pevné pořadí určené indexem.
2. **Výřezová notace** `seq[start:stop:step]`: Extrakce podsekvencí.
3. **Zjištění délky** `len(seq)`: Okamžité vrácení počtu prvků v čase $O(1)$.
4. **Test přítomnosti** `x in seq`: Dotaz na existenci prvku v čase $O(n)$.
5. **Iterovatelnost**: Přirozený průchod prvků smyčkou `for-in`.

---
<!-- slide: id2, Testovací sekvence v příkladech, Skip, basics -->
## Reprezentace sekvencí: Od textu k seznamu

Pro ukázky jednotného chování sekvencí použijeme řetězec i jeho seznamový ekvivalent:

```python
# Textový řetězec (neměnná sekvence znaků):
text = "Ahoj, světe! Jak se máš?"

# Seznam znaků (měnitelná sekvence):
znaky = list(text)
print(znaky[:5])
# ['A', 'h', 'o', 'j', ',']
```

Všechny operace indexování, řezů a dotazů `in` fungují na obou strukturách naprosto identicky.

---
<!-- slide: id3, Operátor přítomnosti prvku: „in“ a „not in“, Core, pythonic -->
## Operátor „in“ a „not in“

Operátor `in` testuje přítomnost prvku v sekvenci. Vrací pravdivostní hodnotu `bool`:

```python
sekvence = "Ahoj, světe! Jak se máš?"

# Test jednotlivého prvku:
print('A' in sekvence)        # True
print('z' in sekvence)        # False

# Záporný test not in:
print('A' not in sekvence)    # False
print('z' not in sekvence)    # True
```

> [!NOTE] Časová složitost u sekvencí vs. hešovacích tabulek
> U sekvencí (`list`, `tuple`, `str`) operátor `in` provádí **lineární průchod** s časovou složitostí **$O(n)$**.
> Pokud potřebujete provádět miliony vyhledávání, převeďte data na množinu `set` nebo slovník `dict`, kde `in` pracuje v průměrném čase **$O(1)$**.

---
<!-- slide: id4, Zjištění délky: funkce len(), Core, basics -->
## Zjištění délky sekvence: funkce `len()`

Vestavěná funkce `len(seq)` vrací počet prvků v sekvenci:

```python
text = "Ahoj, světe!"
print(len(text))    # 12

seznam = [10, 20, 30, 40]
print(len(seznam))  # 4

# Prázdné sekvence mají délku 0:
print(len(""))      # 0
print(len([]))      # 0
print(len(()))      # 0
```

> [!TIP] Interní fungování `len()` v CPythonu
> `len()` nepočítá prvky průchodem! Všechny vestavěné objekty mají délku uloženou přímo ve své C struktuře (atribut `ob_size`). Volání `len()` je proto extrémně rychlé čtení paměti v čase **$O(1)$**.
> U vlastních tříd definuje chování magická metoda `__len__(self) -> int`.

---
<!-- slide: id5, Indexování prvků (zleva i od konce), Core, pythonic -->
## Indexování prvků: Kladné a záporné indexy

K prvkům sekvence přistupujeme hranatými závorkami `seq[i]`:

```python
s = "Python"
# Kladné indexy (zleva):    0   1   2   3   4   5
# Znaky:                    P   y   t   h   o   n
# Záporné indexy (zprava): -6  -5  -4  -3  -2  -1
```

```python
print(s[0])   # 'P' (první prvek)
print(s[5])   # 'n' (poslední prvek při délce 6)

# Záporné indexy počítané od konce:
print(s[-1])  # 'n' (poslední prvek bez nutnosti volat len(s)-1)
print(s[-2])  # 'o' (předposlední prvek)
```

> [!CAUTION] IndexError
> Přístup na neexistující index vyvolá výjimku:
> ```python
> s[10]  # IndexError: string index out of range
> ```

---
<!-- slide: id6, Výřezová notace [start:stop:step], WOW, pythonic -->
## Výřezová notace (*Slicing*)

Syntaxe řezu umožňuje extrahovat libovolnou podsekvenci:

$$\mathbf{seq[start : stop : step]}$$

- **`start`** (výchozí `0`): Počáteční index (včetně).
- **`stop`** (výchozí `len(seq)`): Koncový index (**otevřený interval – tento prvek již ve výřezu není!**).
- **`step`** (výchozí `1`): Krok a směr procházení.

```python
s = "Ahoj, světe!"

# Základní výřez [start:stop]:
print(s[6:11])    # 'světe'

# Otevřené konce (od začátku / do konce):
print(s[:4])      # 'Ahoj'
print(s[6:])      # 'světe!'

# Krok a obrácení sekvence:
print(s[::2])     # 'Ao,svt!' (každý druhý znak)
print(s[::-1])    # '!etěvs ,johA' (obrácení pozpátku v čase O(n))
```

> [!NOTE] Řezy nikdy nevyvolají IndexError
> Pokud indexy v řezu překročí hranice sekvence, Python je automaticky zarovná na začátek či konec:
> `s[0:1000] -> 'Ahoj, světe!'`.

---
<!-- slide: id7, Průchod sekvencí smyčkou for-in a řazení, Core, basics -->
## Průchod sekvencí a funkce `sorted()`

Každá sekvence garantuje pořadí prvků při průchodu smyčkou `for-in`:

```python
jmena = ["Anna", "Petr", "David"]

for jmeno in jmena:
    print(jmeno)
```

### Řazení bez modifikace původní sekvence: `sorted()`
Vestavěná funkce `sorted(iterable)` vrátí nový seřazený seznam `list`:

```python
cisla = (42, 1, 15, 8)

# Vzestupně:
vzestupne = sorted(cisla)
print(vzestupne)  # [1, 8, 15, 42]

# Sestupně:
sestupne = sorted(cisla, reverse=True)
print(sestupne)   # [42, 15, 8, 1]

# Podle vlastního klíče (key function):
slova = ["pes", "chobotnice", "lev"]
print(sorted(slova, key=len))  # ['pes', 'lev', 'chobotnice']
```

---
<!-- slide: id8, Indexování při průchodu: funkce enumerate(), WOW, pythonic -->
## Indexování při průchodu: funkce `enumerate()`

V C/C++ nebo Javě se často používá indexovací smyčka `for (int i = 0; i < len; i++)`. V Pythonu je antipatternem psát `for i in range(len(seq)):`.

Idiomatickým řešením je vestavěná funkce **`enumerate()`**, která vrací dvojice `(index, prvek)`:

```python
fronta = ["Petr", "Jana", "Karel"]

# Standardní číslování od nuly:
for idx, clovek in enumerate(fronta):
    print(f"{idx}: {clovek}")

# Přirozené pořadové číslování od jedničky (start=1):
for poradi, clovek in enumerate(fronta, start=1):
    print(f"{poradi}. v pořadí: {clovek}")
# 1. v pořadí: Petr
# 2. v pořadí: Jana
# 3. v pořadí: Karel
```

---
<!-- slide: id9, Mazání prvků na místě: příkaz del, Core, pythonic -->
## Mazání prvků: univerzální příkaz `del`

U **měnitelných sekvencí** (`list`, `bytearray`) lze odstraňovat prvky a výřezy pomocí klíčového slova `del`:

```python
data = ["a", "b", "c", "d", "e", "f", "g"]

# 1. Smazání jednoho konkrétního prvku podle indexu:
del data[1]       # Odstraní 'b'
print(data)       # ['a', 'c', 'd', 'e', 'f', 'g']

# 2. Smazání celého souvislého výřezu:
del data[1:4]     # Odstraní 'c', 'd', 'e'
print(data)       # ['a', 'f', 'g']

# 3. Smazání každého druhého prvku (s krokem):
cisla = [0, 1, 2, 3, 4, 5, 6, 7]
del cisla[::2]    # Odstraní sudá čísla
print(cisla)      # [1, 3, 5, 7]
```

> [!WARNING] Zákaz u neměnných sekvencí
> Pokus o `del s[0]` na řetězci `str` nebo n-tici `tuple` vyvolá chybu `TypeError: 'str' object doesn't support item deletion`.
