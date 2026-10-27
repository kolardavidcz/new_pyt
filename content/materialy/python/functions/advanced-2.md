<!-- slide: id1, Funkce jako First-Class Citizens, Core, paradigm -->
## Funkce jako objekty prvního řádu (*First-Class Citizens*)

V Pythonu jsou funkce plnohodnotnými **objekty prvního řádu** (*first-class citizens*). To znamená, že s funkcí lze zacházet jako s jakoukoliv jinou hodnotou (např. číslem nebo řetězcem):

1. Může být uložena do proměnné nebo datové struktury (`list`, `dict`).
2. Může být předána jako argument jiné funkci.
3. Může být vrácena z jiné funkce jako její návratová hodnota.
4. Může mít své vlastní atributy a dynamická metadata.

> [!NOTE] C/C++ a Java analogie
> V C/C++ odpovídá funkčním ukazatelům (`void (*f)()`) nebo `std::function`.
> V Javě se před zavedením lambd musely používat anonymní vnitřní třídy nebo funkcionální rozhraní (`java.util.function.Function`).
> V Pythonu je každá funkce přímo instancí třídy `types.FunctionType` (dědí z `object`).

---
<!-- slide: id2, Funkce jako objekty a aliasy, Core, resyntax -->
## Proměnná jako odkaz na funkci

Když definujeme funkci pomocí `def nazev():`, Python vytvoří objekt funkce na haldě a k němu přiřadí jméno `nazev`. Toto jméno můžeme přiřadit do jiné proměnné:

```python
def celociselne_deleni(a: int, b: int) -> tuple[int, int]:
    """Vrátí podíl a zbytek."""
    return a // b, a % b

# 'deleni' je nyní alias ukazující na tentýž objekt funkce v paměti:
deleni = celociselne_deleni

print(deleni(14, 3))       # (4, 2)
print(deleni.__name__)     # 'celociselne_deleni'
print(deleni is celociselne_deleni)  # True (identická adresa v paměti)
```

Závorky `()` funkci **spouštějí**. Bez závorek pracujeme se samotným **objektem funkce**.

---
<!-- slide: id3, Funkce v datových strukturách (Dispatch Tables), WOW, pythonic -->
## Funkce v datových strukturách: *Dispatch Table*

Ukládání funkcí do slovníku umožňuje nahradit dlouhé řetězce `if-elif-else` elegantní **dispečerskou tabulkou** (*dispatch table*):

```python
from collections.abc import Callable

def operace_scitani(a: float, b: float) -> float:
    return a + b

def operace_nasobeni(a: float, b: float) -> float:
    return a * b

# Slovník jako mapování textových příkazů na obslužné funkce
operace: dict[str, Callable[[float, float], float]] = {
    "+": operace_scitani,
    "*": operace_nasobeni,
    "abs_rozdil": lambda a, b: abs(a - b),
}

op = "+"
vysledek = operace[op](10, 5)  # Zavolá operace_scitani(10, 5)
print(vysledek)  # 15.0
```

---
<!-- slide: id4, Funkce vracející funkci: Továrny a uzávěry (Closures), WOW, newconcept -->
## Funkční továrny a uzávěry (*Closures*)

Funkce může vytvářet a vracet zbrusu nové funkce specializované na konkrétní úlohu:

```python
from collections.abc import Callable

def vytvor_extraktor_slova(index: int) -> Callable[[str], str]:
    """Funkční továrna: vrátí funkci, která z textu vytáhne slovo na pozici index."""
    def extraktor(text: str) -> str:
        slova = text.split()
        return slova[index] if index < len(slova) else ""
    return extraktor

# Vyrobíme specializované funkce:
prvni_slovo = vytvor_extraktor_slova(0)
treti_slovo = vytvor_extraktor_slova(2)

veta = "Python je uzasny programovaci jazyk"
print(prvni_slovo(veta))  # 'Python'
print(treti_slovo(veta))  # 'uzasny'
```

> [!IMPORTANT] Co je to uzávěr (Closure)?
> Funkce `extraktor` si v paměti nese vazbu na parametr `index` ze své obalující funkce i poté, co běh funkce `vytvor_extraktor_slova` dávno skončil. Tento mechanismus se nazývá **lexikální uzávěr** (*closure*).

---
<!-- slide: id5, Funkce vyššího řádu (Higher-Order Functions), Core, newconcept -->
## Funkce vyššího řádu (*Higher-Order Functions*)

Funkce, která přijímá jinou funkci jako parametr, se nazývá **funkce vyššího řádu** (*Higher-Order Function*):

```python
from collections.abc import Callable

def transformuj_seznam(
    transformace: Callable[[int], int],
    data: list[int],
) -> list[int]:
    """Aplikuje zadanou funkci na každý prvek seznamu."""
    return [transformace(x) for x in data]

cisla = [-3, -1, 0, 2, 5]

# Předání vestavěné funkce abs:
print(transformuj_seznam(abs, cisla))  # [3, 1, 0, 2, 5]

# Předání lambda funkce:
print(transformuj_seznam(lambda x: x ** 2, cisla))  # [9, 1, 0, 4, 25]
```

Standardní funkce jako `sorted(..., key=...)`, `min()`, `max()` a `map()` fungují přesně tímto způsobem.

---
<!-- slide: id6, Příklad generování funkcí a past na pozdní vazbu (Late Binding), Tricky, newconcept -->
## Hromadné generování funkcí a past na pozdní vazbu (*Late Binding*)

Podívejte se na pokus vygenerovat seznam umocňovacích funkcí v cyklu:

```python
# ❌ KATASTROFÁLNÍ CHYBA: Pozdní vazba (Late Binding)!
funkce = [lambda x: x ** i for i in range(4)]

# Všechny funkce vrátí výsledek pro i=3 (poslední hodnota cyklu)!
print([f(2) for f in funkce])
# [8, 8, 8, 8]  <- Očekávali jsme [1, 2, 4, 8]!
```

### Proč k tomu došlo?
Lambdy proměnnou `i` nekopírují v okamžiku definice, ale odkazují na tutéž proměnnou `i` v nadřazeném oboru. V době volání funkcí má `i` hodnotu `3`.

### Dvě správná moderní řešení:
```python
# 1. Zmrazení hodnoty pomocí výchozího parametru:
spravne_1 = [lambda x, exp=i: x ** exp for i in range(4)]
print([f(2) for f in spravne_1])  # [1, 2, 4, 8]

# 2. Pomocí tovární funkce (čistý closure):
def vyrob_mocnitel(exp: int):
    return lambda x: x ** exp

spravne_2 = [vyrob_mocnitel(i) for i in range(4)]
print([f(2) for f in spravne_2])  # [1, 2, 4, 8]
```

---
<!-- slide: id7, Atributy funkcí a magická metoda __call__, WOW, paradigm -->
## Atributy funkcí a magická metoda `__call__`

Protože funkce jsou objekty, můžete k nim za běhu dynamicky přidávat vlastní atributy (např. pro statistiky, počítadla či metadata):

```python
def web_handler():
    web_handler.pocet_volani += 1
    print(f"Obsloužen požadavek č. {web_handler.pocet_volani}")

# Přidání vlastního atributu k objektu funkce:
web_handler.pocet_volani = 0

web_handler()  # Obsloužen požadavek č. 1
web_handler()  # Obsloužen požadavek č. 2
```

### Callable objekty a metoda `__call__`:
Co vlastně dělá objekt „volatelným“? Přítomnost magické metody **`__call__()`**:

```python
class Nasobic:
    def __init__(self, koeficient: int) -> None:
        self.koeficient = koeficient

    def __call__(self, x: int) -> int:
        return x * self.koeficient

krat_tri = Nasobic(3)
print(callable(krat_tri))  # True
print(krat_tri(10))        # 30 (objekt se chová jako funkce!)
```
