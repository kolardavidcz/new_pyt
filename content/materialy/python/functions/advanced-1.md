<!-- slide: id1, Uzávěry (closures) I, Core, newconcept -->
## Uzávěry (Closures) v Pythonu

Funkce definovaná uvnitř jiné funkce má jednu zásadní vlastnost: **pokud je z vnější funkce vrácena jako návratová hodnota, nese si s sebou lexikální kontext (proměnné) z doby svého vzniku**:

```python
from collections.abc import Callable

def vytvor_scitacku(kolik: int) -> Callable[[int], int]:
    """Vnější funkce fungující jako továrna na funkce (funkce vyššího řádu)."""
    
    # Vnitřní funkce vidí do uzavírajícího scope (Enclosing Scope):
    def scitacka(cislo: int) -> int:
        return cislo + kolik

    return scitacka

# Vyrobíme specializovanou funkci přičítající 5:
pricti_5 = vytvor_scitacku(5)
print(type(pricti_5))     # <class 'function'>
print(pricti_5(10))        # 15

# Jiná instance se zcela nezávislým uzávěrem:
pricti_100 = vytvor_scitacku(100)
print(pricti_100(10))      # 110
```

Tento mechanismus se nazývá **uzávěr** (*closure*) a je stavebním kamenem dekorátorů i funkcionálního programování.

---
<!-- slide: id2, Uzávěry (closures) II, Core, newconcept -->
## Jak uzávěr vnitřně funguje?

I když vnější funkce `vytvor_scitacku()` již dávno doběhla a její rámec zásobníku (*stack frame*) zanikl, vnitřní funkce `scitacka` si referenci na proměnnou `kolik` zachovala!

CPython ukládá zachycené proměnné do speciálního atributu **`__closure__`** jako pole tzv. buněk (*cell objects*):

```python
pricti_5 = vytvor_scitacku(5)

# Inspekce buněk uzávěru:
print(pricti_5.__closure__)
# (<cell at 0x...: int object at 0x...>,)

# Získání zachycené hodnoty:
print(pricti_5.__closure__[0].cell_contents)
# 5
```

Každé volání vnější tovární funkce vygeneruje novou funkci s vlastním nezávislým uzávěrem.

---
<!-- slide: id3, Poznámka, Skip, pythonic -->
## Zřetězené volání (Currying)

Jelikož volání tovární funkce vrací funkci, lze provést přímé zřetězené volání bez mezikroku ukládání do proměnné:

```python
vysledek = vytvor_scitacku(5)(3)
print(vysledek)  # 8
```

V matematické teorii a čistě funkcionálních jazycích (Haskell) se tento postup rozkladu funkce více argumentů na řetězec funkcí o jednom argumentu nazývá **currying**.

> [!NOTE] Čitelnost kódu
> Ačkoliv je syntaxe `f(x)(y)` syntakticky platná, v produkčním Pythonu ji používejte s rozvahou – přímé uložení do výstižně pojmenované proměnné zvyšuje čitelnost a usnadňuje ladění.

---
<!-- slide: id4, Co je to uzávěr?, WOW, paradigm -->
## Co je to uzávěr? (OOP vs. Funkcionální svět)

Programátoři zvyklí na objektově orientované programování (OOP) často tápou, k čemu uzávěry slouží, když mají třídy. Steve Majewski vytvořil slavný příměr:

> *„Objekt jsou data, ke kterým jsou připojeny funkce (metody).*  
> *Uzávěr je funkce, ke které jsou připojena data.“*

### Srovnání paradigmat:
- **Třída s metodou**: Uchovává stav v atributech instance `self.x` a vystavuje metody. Vhodné pro komplexní entity s více operacemi.
- **Uzávěr**: Lehká, čistá funkce zapouzdřující stav bez nutnosti definovat `class`, konstruktor `__init__` ani spravovat reference na `self`.

Uzávěry jsou základem pro tvorbu konfigurovatelných **dekorátorů**, generování callbacků a funkcionální transformace.

---
<!-- slide: id5, Lambda-funkce, Core, resyntax -->
## Anonymní funkce: Výraz `lambda`

V Pythonu můžeme vytvořit bezejmennou (anonymní) funkci pomocí klíčového slova **`lambda`**:

$$\mathbf{lambda} \;\; \text{argumenty}: \;\; \text{výraz}$$

```python
# Lambda přijímající x a vracející jeho druhou mocninu:
ctverec = lambda x: x ** 2
print(ctverec(5))  # 25

# Lambda se dvěma argumenty:
secti = lambda a, b: a + b
print(secti(10, 20))  # 30
```

### Vlastnosti lambda funkcí v Pythonu:
1. **Pouze jediný výraz**: Tělo lambdy nesmí obsahovat příkazy (`if-else` blok, `for`, `while`, `print` jako statement, `raise`).
2. **Implicitní return**: Hodnota spočítaného výrazu je automaticky vrácena.
3. **Žádné jméno**: V `__name__` má vždy hodnotu `'<lambda>'`, což ztěžuje čtení chybových výpisů (tracebacků).

> [!CAUTION] PEP 8 Doporučení
> Nikdy nepřiřazujte lambdu přímo do proměnné: `f = lambda x: x + 1`.  
> Pokud má mít funkce jméno, definujte ji standardně: `def f(x): return x + 1`.

---
<!-- slide: id6, Lambda-funkce v uzávěrech, Skip, pythonic -->
## Lambda výrazy v uzávěrech

Továrnu na sčítačky z úvodního slajdu lze zapsat pomocí `lambda` na jediný řádek:

```python
from collections.abc import Callable

def pricti(kolik: int) -> Callable[[int], int]:
    return lambda k_cemu: k_cemu + kolik

pricti_3 = pricti(3)
print(pricti_3(10))  # 13
```

> [!WARNING] Pozor na past pozdního vázání (Late Binding Trap)!
> Častá chyba při vytváření uzávěrů nebo lambd ve smyčce:
> ```python
> # CHYBA: Všechny funkce sdílejí tutéž referenci na proměnnou i!
> funkce = [lambda x: x + i for i in range(3)]
> print([f(10) for f in funkce])  # [12, 12, 12] !
>
> # SPRÁVNĚ: Zachycení aktuální hodnoty přes výchozí parametr:
> funkce = [lambda x, i=i: x + i for i in range(3)]
> print([f(10) for f in funkce])  # [10, 11, 12]
> ```

---
<!-- slide: id7, Použití, Skip, basics -->
## Kdy dává `lambda` smysl?

Vzhledem k syntaktickým omezením se lambda v moderním Pythonu používá téměř výhradně jako **krátký jednorázový callback**:
- Jako transformační klíč v řazení: `sorted(kolekce, key=lambda x: ...)`
- V argumentech min/max: `max(studenti, key=lambda s: s.body)`
- Jako lehká tovární funkce ve specializovaných strukturách (`defaultdict`)

Pokud logika přesáhne jeden krátký přehledný výraz, okamžitě definujte plnohodnotnou funkci pomocí `def`.

---
<!-- slide: id8, Příklady použití – řazení pomocí „sorted()“, Core, pythonic -->
## Praktické využití: Klíč řazení v `sorted()`

Při třídění kolekcí složitějších struktur určuje parametr `key` hodnotu, podle níž se má porovnávat:

```python
studenti = [
    {"jmeno": "Alice", "rocnik": 2, "prospech": 1.2},
    {"jmeno": "Bob", "rocnik": 1, "prospech": 2.1},
    {"jmeno": "Cyril", "rocnik": 3, "prospech": 1.0},
]

# Řazení podle známky (od nejlepší):
podle_znamek = sorted(studenti, key=lambda s: s["prospech"])
print([s["jmeno"] for s in podle_znamek])
# ['Cyril', 'Alice', 'Bob']
```

> [!TIP] Rychlejší a čistší alternativa: `operator.itemgetter`
> Pro prostý přístup k indexu nebo klíči slovníku nabízí standardní knihovna modul `operator`. Je implementován v C a je znatelně rychlejší než `lambda`:
> ```python
> from operator import itemgetter
> podle_znamek = sorted(studenti, key=itemgetter("prospech"))
> ```

---
<!-- slide: id9, Příklady použití – funkce jako parametr funkce, Skip, pythonic -->
## Funkce vyššího řádu s výchozím chováním

Lambda může posloužit jako výchozí hodnota parametru, který očekává transformační funkci:

```python
from collections.abc import Callable, Sequence

def zpracuj_polozky[T, R](
    polozky: Sequence[T],
    transformace: Callable[[T], R] = lambda x: x  # Výchozí je identita
) -> list[R]:
    return [transformace(p) for p in polozky]

slova = ["pes", "kocka", "kun"]

# 1. Výchozí identita:
print(zpracuj_polozky(slova))
# ['pes', 'kocka', 'kun']

# 2. Předání vestavěné funkce:
print(zpracuj_polozky(slova, len))
# [3, 5, 3]

# 3. Předání jednorázové lambdy:
print(zpracuj_polozky(slova, lambda s: s.upper()))
# ['PES', 'KOCKA', 'KUN']
```

---
<!-- slide: id10, Příklady použití – vytvořující funkce pro „defaultdict“, Core, pythonic -->
## Lambda jako továrna pro `defaultdict`

Třída `defaultdict` z modulu `collections` vyžaduje v konstruktoru volatelný objekt (*factory function*), který bez argumentů vrátí výchozí hodnotu při přístupu k neexistujícímu klíči:

```python
from collections import defaultdict

# 1. Výchozí konstanta nebo struktura:
pocitadlo_kategorii = defaultdict(lambda: {"pocet": 0, "status": "novy"})
pocitadlo_kategorii["knihy"]["pocet"] += 1
print(dict(pocitadlo_kategorii))
# {'knihy': {'pocet': 1, 'status': 'novy'}}

# 2. Vnořený stromový slovník (autovivification):
def strom():
    return defaultdict(strom)

uzly = strom()
uzly["root"]["vetev1"]["list"] = 42
print(uzly["root"]["vetev1"]["list"])  # 42
```
