<!-- slide: id1, Booleovské operátory a zkrácené vyhodnocování, Tricky, pythonic -->
## Logické operátory a zkrácené vyhodnocování (*Short-Circuit*)

Python používá pro logické operace **anglická slova** namísto symbolů známých z C/Javy (`&&`, `||`, `!`):
- `not` (negace – nejvyšší priorita)
- `and` (konjunkce)
- `or` (disjunkce – nejnižší priorita)

### Zásadní princip: Operátory vrací samotné operandy!
V Pythonu operátory `and` a `or` **nevracejí nutně `True` nebo `False`**, ale přímo **hodnotu operandu, který rozhodl o výsledku**:

```python
# x or y: pokud je x pravdivé, vrať x, jinak vrať y
print("Jan" or "Anonym")   # 'Jan'
print("" or "Anonym")      # 'Anonym'

# x and y: pokud je x nepravdivé, vrať x, jinak vrať y
print([] and [1, 2])       # []
print([1, 2] and [3, 4])   # [3, 4]
```

> [!TIP] Běžný idiom pro výchozí hodnotu
> Díky zkrácenému vyhodnocování se `or` často používá pro nastavení fallback hodnoty:
> ```python
> jmeno = uzivatelsky_vstup or "Host"
> ```
> Druhý operand se vyhodnotí **pouze tehdy**, pokud byl první nepravdivý (*short-circuit* šetří volání drahých funkcí).

---
<!-- slide: id2, Pravdivostní hodnoty objektů (Truthy / Falsy), Core, pythonic -->
## Pravdivostní hodnota objektů (*Truthy* a *Falsy*)

V Pythonu lze libovolný objekt otestovat v podmínce `if` nebo cyklu `while`. Každý objekt je buď **Truthy** (vyhodnotí se jako pravda), nebo **Falsy** (vyhodnotí se jako nepravda).

### Objekty vyhodnocované jako `False` (*Falsy*):
1. **Konstanty**: `None`, `False`
2. **Nula v libovolném číselném typu**: `0`, `0.0`, `0j`, `Decimal(0)`, `Fraction(0, 1)`
3. **Prázdné sekvence a kolekce**: `""`, `()`, `[]`, `{}`, `set()`, `range(0)`
4. **Uživatelské objekty**, jejichž metoda `__bool__()` vrací `False` nebo metoda `__len__()` vrací `0`.

**Všechny ostatní objekty** se vyhodnocují jako **`True`** (*Truthy*)!

> [!CAUTION] Past na neprázdné kolekce s nulami
> N-tice obsahující nulu nebo False **není prázdná**, a proto je pravdivá!
> ```python
> bool([0])       # True (seznam s jedním prvkem není prázdný!)
> bool((False,))  # True (jednoprvková n-tice)
> ```

---
<!-- slide: id3, Konstruktor bool() a vztah k int, Core, basics -->
## Konstruktor `bool()` a dědičnost z `int`

Pro explicitní převod libovolné hodnoty na logickou hodnotu slouží vestavěný konstruktor **`bool()`**:

```python
print(bool(""))      # False
print(bool("text"))  # True
print(bool(0))       # False
print(bool(42))      # True
```

### Vztah mezi `bool` a `int`
V Pythonu je třída `bool` **přímou podtřídou celých čísel `int`** ([PEP 285](https://peps.python.org/pep-285/)):

```python
print(issubclass(bool, int))  # True
print(isinstance(True, int))  # True

# Hodnota True se interně chová jako 1, False jako 0:
print(True == 1)   # True
print(False == 0)  # True
print(True + True + False)  # 2
```

> [!NOTE] Sečítání splněných podmínek
> Díky tomu, že `True == 1`, můžeme počet splněných podmínek v seznamu spočítat funkcí `sum()`:
> ```python
> cisla = [12, -5, 8, -2, 15]
> pocet_kladnych = sum(x > 0 for x in cisla)  # 3
> ```

---
<!-- slide: id4, Porovnávání a zřetězené podmínky, WOW, pythonic -->
## Porovnávací operátory a zřetězení podmínek

Python disponuje standardní sadou porovnávacích operátorů:
`==`, `!=`, `<`, `<=`, `>`, `>=`

### Zřetězené porovnání (*Chained Comparisons*)
V C/C++ a Javě musíme psát `10 <= x && x <= 20`. V Pythonu můžeme podmínky zřetězit přesně tak, jak jsme zvyklí z matematiky:

```python
vek = 15

# Idiomatický Python:
if 10 <= vek < 18:
    print("Mladistvý")
```

Python tento výraz interně vyhodnotí jako `(10 <= vek) and (vek < 18)`, přičemž prostřední výraz `vek` **vyhodnotí pouze jednou**!

### Lexikografické porovnávání sekvencí:
Sekvence (`str`, `list`, `tuple`) se porovnávají prvek po prvku zleva doprava:
```python
print([1, 2, 3] < [1, 2, 4])  # True (protože 3 < 4)
print("jablko" < "jahoda")     # True ('b' < 'h' v Unicode)
```

---
<!-- slide: id5, Rovnost hodnot == vs. identita objektů is, Tricky, paradigm -->
## Rovnost hodnot (`==`) vs. identita v paměti (`is`)

Jeden z nejzásadnějších konceptů v paměťovém modelu Pythonu:

- **Operátor `==`** (*Value equality*): Testuje, zda mají dva objekty **stejný obsah/hodnotu** (volá metodu `__eq__`).
- **Operátor `is`** (*Reference identity*): Testuje, zda dvě proměnné ukazují na **naprosto stejné místo v paměti** (`id(a) == id(b)`).

```python
a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(a == b)  # True (mají stejný obsah)
print(a is b)  # False (jsou to dva nezávislé objekty na různých adresách)
print(a is c)  # True (c ukazuje na stejný objekt jako a)
```

> [!IMPORTANT] Zlaté pravidlo pro None
> Pro porovnání s `None` **vždy používejte operátor `is` nebo `is not`**, nikdy `==`:
> ```python
> if vysledek is None:       # ✅ SPRÁVNĚ (rychlé O(1) porovnání adres)
> if vysledek == None:       # ❌ ŠPATNĚ (volá metodu __eq__, kterou lze přetížit)
> ```

---
<!-- slide: id6, Operátory členství in a not in, Core, pythonic -->
## Operátory členství: `in` a `not in`

Operátory `in` a `not in` testují přítomnost prvku v libovolné sekvenci, množině či slovníku:

```python
povolene_formaty = {"json", "yaml", "xml"}

pripona = "json"
if pripona in povolene_formaty:
    print("Formát podporován.")

if "csv" not in povolene_formaty:
    print("CSV není podporováno.")
```

> [!TIP] Čistá syntaxe not in
> Vždy pište `if x not in kolekce:`. Zápis `if not x in kolekce:` je sice platný, ale méně čitelný a neidiomatický.

---
<!-- slide: id7, Přehled priorit operátorů, Skip, basics -->
## Priorita operátorů v Pythonu

Seřazeno od **nejvyšší priority** k **nejnižší**:

| Operátory | Popis |
| :--- | :--- |
| `()` `[]` `{}` | Závorky, indexace `x[i]`, řezy `x[i:j]`, volání `f(...)`, atributy `x.y` |
| `**` | Umocňování |
| `+x` `-x` `~x` | Unární plus, minus a bitová negace |
| `*` `/` `//` `%` | Násobení, reálné dělení, celočíselné dělení, modulo |
| `+` `-` | Sčítání a odčítání |
| `<<` `>>` | Bitové posuny |
| `&` | Bitové AND |
| `^` | Bitové XOR |
| `\|` | Bitové OR |
| `==` `!=` `<` `<=` `>` `>=` `is` `is not` `in` `not in` | Porovnávání, identita, členství |
| `not` | Logická negace |
| `and` | Logická konjunkce |
| `or` | Logická disjunkce |
| `if` – `else` | Ternární operátor (`x if cond else y`) |
| `:=` | Walrus operátor (přiřazovací výraz) |
| `lambda` | Anonymní funkce |

> [!NOTE]
> Pokud máte pochybnosti o prioritě, **vždy použijte kulaté závorky**. Kód bude srozumitelnější pro vás i pro ostatní vývojáře.
