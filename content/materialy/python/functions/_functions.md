<!-- slide: id1, Úvod, Skip, basics -->
## Funkce čtené podruhé: Pokročilá anatomie funkcí

Funkce v Pythonu jsou objekty první kategorie (*first-class citizens*):
- Mohou být přiřazeny do proměnné.
- Mohou být uloženy v datových strukturách (`list`, `dict`).
- Mohou být předány jiné funkci jako parametr.
- Mohou být vytvořeny uvnitř jiné funkce a vráceny jako její výsledek.

Ačkoli základní syntaxi `def fn():` zná každý, pokročilá pravidla vyhodnocování argumentů, výchozích hodnot a uzávěrů skrývají nečekané nástrahy i mocné techniky.

---
<!-- slide: id2, Zavedení funkce, Core, basics -->
## Definice funkce: Klíčové slovo `def`

Funkce se definuje klíčovým slovem `def` následovaným názvem, závorkami s parametry a odsazeným tělem:

```python
def pozdrav():
    pass
```

Příkaz `def` je v Pythonu **vykonatelným příkazem** za běhu programu (*runtime executable statement*). Funkce neexistuje, dokud interpret nenarazí na řádek s jejím `def`.

---
<!-- slide: id3, Návratová hodnota, WOW, pythonic -->
## Návratová hodnota: Implicitní `None` a rozbalování n-tic

1. **Implicitní návrat**: Pokud funkce neobsahuje příkaz `return` (nebo použije holý `return` bez hodnoty), automaticky vrátí singleton **`None`**:
   ```python
   def nic():
       pass

   res = nic()
   print(res)  # None
   ```

2. **Vícenásobné návratové hodnoty**: Funkce v Pythonu může zdánlivě vracet více hodnot oddělených čárkou. Ve skutečnosti vrací **jedinou n-tici (`tuple`)**:
   ```python
   def statistika(cisla):
       return min(cisla), max(cisla), sum(cisla) / len(cisla)

   minimum, maximum, prumer = statistika([10, 20, 30])
   ```

---
<!-- slide: id4, Parametry poziční, Core, basics -->
## Standardní poziční parametry

Pořadí argumentů při volání určuje, kterému parametru bude hodnota přiřazena:

```python
def mocnina(zaklad, exponent):
    return zaklad ** exponent

print(mocnina(2, 8))
# 256
```

---
<!-- slide: id5, Volný počet pozičních parametrů, WOW, pythonic -->
## Variadické poziční parametry: `*args`

Operátor `*` před parametrem sbalí libovolný počet předaných pozičních argumentů do jediné **n-tice (`tuple`)**:

```python
def soucet(*args):
    print(f"Typ args: {type(args).__name__}, obsah: {args}")
    return sum(args)

print(soucet(1, 2, 3, 4))
# Typ args: tuple, obsah: (1, 2, 3, 4)
# 10
```

---
<!-- slide: id6, Parametry pojmenované, Core, resyntax -->
## Pojmenované parametry a výchozí hodnoty

Parametry mohou mít definovanou výchozí hodnotu. Při volání je lze předat pozičně i jménem:

```python
def pripoj(host="localhost", port=8080):
    return f"http://{host}:{port}"

print(pripoj())              # http://localhost:8080
print(pripoj("api.cz"))       # http://api.cz:8080
print(pripoj(port=443))       # http://localhost:443
```

---
<!-- slide: id7, Volný počet pojmenovaných parametrů, WOW, pythonic -->
## Variadické pojmenované parametry: `**kwargs`

Operátor `**` sbalí všechny nepřiřazené pojmenované argumenty do **slovníku (`dict`)**:

```python
def konfigurace(**kwargs):
    for klic, hodnota in kwargs.items():
        print(f"{klic} = {hodnota}")

konfigurace(debug=True, cache_size=1024, db="postgres")
```

---
<!-- slide: id8, Mix parametrů, Core, resyntax -->
## Pravidla kombinování parametrů v definici i volání

Poziční argumenty musí při volání **vždy předcházet** pojmenovaným argumentům:

```python
def f(a, b=10):
    return a + b

f(5, b=20)  # Platné
f(a=5, 20)  # SyntaxError: positional argument follows keyword argument
```

---
<!-- slide: id9, Vynucení použití jména parametru, WOW, pythonic -->
## Vynucení pojmenovaných parametrů: Samostatná hvězdička `*`

Všechny parametry uvedené za samostatnou hvězdičkou `*` v signatuře lze předat **pouze a výhradně jménem** (*keyword-only arguments*):

```python
def otevri(cesta, *, encoding="utf-8", timeout=30):
    print(f"Otevírám {cesta} s {encoding} (timeout: {timeout} s)")

otevri("soubor.txt", encoding="ascii")  # OK
otevri("soubor.txt", "ascii")           # TypeError: takes 1 positional argument but 2 were given
```

> [!TIP]
> Zabraňuje záměně booleovských flagů v rozsáhlých API: `nastav(aktivni=True)` je mnohem bezpečnější a čitelnější než nicneříkající `nastav(True)`.

---
<!-- slide: id10, Parametry zadávané pouze pozičně, WOW, pythonic -->
## Vynucení pozičních parametrů: Lomítko `/` (Python 3.8+)

Parametry před lomítkem `/` lze předat **pouze pozičně**, nikoliv jménem (*positional-only arguments*):

```python
def odmocnina(x, /, presnost=2):
    return round(x ** 0.5, presnost)

print(odmocnina(9))        # OK
print(odmocnina(x=9))      # TypeError: odmocnina() got some positional-only arguments passed as keyword arguments: 'x'
```

Výhody:
- Můžete v budoucnu libovolně přejmenovat parametr v implementaci, aniž byste rozbili kód volajícího.
- Přirozené pro matematické funkce jako `len(obj)` nebo `abs(x)`.

---
<!-- slide: id11, Výchozí hodnota parametru I, Tricky, paradigm -->
## Kdy se vyhodnocuje výchozí hodnota? (*Early Binding*)

> [!WARNING]
> **Výchozí hodnoty parametrů se vyhodnocují pouze JEDNOU, a to v okamžiku definice funkce (`def`), nikoliv při jejím volání!**

```python
x = 10

def ukaz(val=x):
    print(val)

x = 20
ukaz()  # Vypíše 10, nikoliv 20!
```

---
<!-- slide: id12, Výchozí hodnota parametru II, Tricky, paradigm -->
## Záludnost měnitelných výchozích argumentů: `def f(xs=[])`

Pokud je výchozí hodnotou měnitelný objekt (`list`, `dict`, `set`), **všechna volání funkce sdílejí stejnou instanci v paměti**:

```python
def pridej(polozka, cil=[]):  # ANTIPATTERN!
    cil.append(polozka)
    return cil

print(pridej(1))  # [1]
print(pridej(2))  # [1, 2] -- Původní seznam přetrvává!
```

### Správné řešení: Použijte `None` jako sentinel
```python
def pridej(polozka, cil=None):
    if cil is None:
        cil = []
    cil.append(polozka)
    return cil
```

---
<!-- slide: id13, Funkce jako parametry, Core, newconcept -->
## Funkce vyššího řádu: Funkce jako argument

Protože funkce jsou objekty, můžeme je předávat jako parametry do jiných funkcí:

```python
def transformuj(data, transform_fn):
    return [transform_fn(x) for x in data]

print(transformuj(["1", "2", "3"], int))
# [1, 2, 3]

print(transformuj(["pes", "kočka"], len))
# [3, 5]
```

---
<!-- slide: id14, Funkce jako návratové hodnoty, Core, newconcept -->
## Funkce vracející funkci: Továrny na funkce

Funkce může definovat a vrátit novou funkci:

```python
def vytvor_nasobic(faktor):
    def nasob(x):
        return x * faktor
    return nasob

trojnasobek = vytvor_nasobic(3)
print(trojnasobek(10))
# 30
```

---
<!-- slide: id15, Funkce jako návratové hodnoty – uzávěry, Core, newconcept -->
## Lexikální uzávěry (*Closures*)

Vnitřní funkce si pamatuje proměnné ze svého vnějšího lexikálního rozsahu, i když vnější funkce již dávno skončila:

```python
def citac(pocatek=0):
    pocet = pocatek
    def dalsi():
        nonlocal pocet
        pocet += 1
        return pocet
    return dalsi

c = citac(10)
print(c())  # 11
print(c())  # 12
```

Klíčové slovo `nonlocal` umožňuje vnitřní funkci modifikovat proměnnou z nadřazeného rozsahu bez vytvoření lokálního stínu.

---
<!-- slide: id16, Místo závěru, Skip, paradigm -->
## Shrnutí: Síla a reflexe funkcí

Objekt funkce v sobě nese bohatá metadata přístupná přes introspekci:
- `fn.__name__`: Název funkce.
- `fn.__doc__`: Dokumentační řetězec.
- `fn.__annotations__`: Slovník typových anotací.
- `fn.__code__`: Objekt zkompilovaného bajtkódu.
- `fn.__closure__`: Buňky uzávěru zachycených proměnných.
- `fn.__call__()`: Dunder metoda, která dělá objekt volatelným.
