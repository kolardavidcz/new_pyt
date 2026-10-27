<!-- slide: id1, Úvod do iterací v Pythonu, Core, basics -->
## Iterační protokol v Pythonu

Iterace patří k absolutním základům jazyka Python. Smyčkou `for ... in ...` můžeme procházet takřka jakýkoliv objekt:

```python
for znak in "Python":
    pass  # Procházení řetězce

for prvek in [10, 20, 30]:
    pass  # Procházení seznamu

for klic in {"a": 1, "b": 2}:
    pass  # Procházení klíčů slovníku

for radek in open("data.txt", encoding="utf-8"):
    pass  # Proudové čtení souboru řádek po řádku
```

Na pozadí veškeré této elegance stojí **Python Iterační protokol** (*Iterator Protocol*).

---
<!-- slide: id2, Anatomie smyčky for-in, Skip, basics -->
## Anatomie smyčky `for-in`

Smyčka `for x in kolekce:` není vnitřně implementována jako indexové počítadlo `i = 0; i < N; i++` (jako v C či Javě). Místo toho interpret:

1. Vyžádá si od kolekce nový **iterátor** zavoláním `iter(kolekce)`.
2. V každém kroku si z iterátoru vyžádá další prvek voláním `next(it)`.
3. Když iterátor dojde na konec, vyhodí výjimku **`StopIteration`**.
4. Smyčka tuto výjimku zachytí a čistě skončí.

```python
# Ekvivalentní imperativní kód:
it = iter(kolekce)
while True:
    try:
        x = next(it)
    except StopIteration:
        break
    # Tělo cyklu s x
```

---
<!-- slide: id3, Dunder metody __iter__() a __next__(), Core, paradigm -->
## Metody `__iter__()`, `__next__()` a `StopIteration`

Iterační protokol je definován dvěma dunder metodami:

```python
text = "Ahoj"

# 1. Získání iterátoru (volá text.__iter__()):
it = iter(text)
print(it)  # <str_iterator object at 0x...>

# 2. Postupné čtení prvků (volá it.__next__()):
print(next(it))  # 'A'
print(next(it))  # 'h'
print(next(it))  # 'o'
print(next(it))  # 'j'

# 3. Vyčerpání iterátoru:
# next(it)  # Vyhodí StopIteration!
```

> [!TIP] Bezpečné čtení s výchozí hodnotou
> Funkce `next(it, default)` přijímá nepovinný druhý argument. Pokud je iterátor vyčerpán, vrátí zadanou výchozí hodnotu namísto vyhození výjimky:
> ```python
> prvek = next(it, None)  # Vrátí None, pokud je iterátor na konci
> ```

---
<!-- slide: id4, Zásadní rozdíl: Iterable vs. Iterator, Skip, basics -->
## Rozdíl: *Iterable* vs. *Iterator*

Mnoho programátorů tyto dva pojmy zaměňuje. V typovém systému Pythonu mají striktně odlišný význam:

```text
Iterable (Iterovatelný kontejner)
  └── Implementuje __iter__(), která vrací NOVÝ iterátor
  └── Příklady: list, tuple, str, dict, set
  └── Lze jím procházet OPAKOVANĚ (každý cyklus for vytvoří nový iterátor)

Iterator (Jednorázový stavový ukazatel)
  └── Implementuje __next__() a __iter__() (vrací self)
  └── Je STAVOVÝ a JEDNORÁZOVÝ
  └── Jakmile je jednou vyčerpán, zůstává prázdný navždy!
```

```python
xs = [1, 2, 3]  # Iterable
it = iter(xs)   # Iterator

print(list(it))  # [1, 2, 3]
print(list(it))  # []  <- Iterátor je vyčerpán a prázdný!
```

---
<!-- slide: id5, Nekonečný generátor (yield), WOW, pythonic -->
## Tvorba iterátoru 1: Funkce s `yield`

Nejjednodušší způsob, jak vytvořit iterátor, je napsat **generátorovou funkci** s klíčovým slovem **`yield`**:

```python
from collections.abc import Iterator

def suda_cisla() -> Iterator[int]:
    """Nekonečný generátor sudých čísel."""
    cislo = 0
    while True:
        cislo += 2
        yield cislo

gen = suda_cisla()
print(next(gen))  # 2
print(next(gen))  # 4
print(next(gen))  # 6
```

Interpret automaticky vygeneruje plnohodnotný stavový objekt s metodami `__iter__` a `__next__`.

---
<!-- slide: id6, Třídní implementace nekonečného iterátoru, WOW, paradigm -->
## Tvorba iterátoru 2: Vlastní třída s dunder metodami

Pokud potřebujeme plnou kontrolu nad objektem, implementujeme metody `__iter__` a `__next__` ve třídě:

```python
class SudaCisla:
    """Objektový iterátor sudých čísel."""
    def __init__(self) -> None:
        self.cislo = 0

    def __iter__(self) -> "SudaCisla":
        return self  # Každý iterátor musí vrátit sám sebe

    def __next__(self) -> int:
        self.cislo += 2
        return self.cislo

it = SudaCisla()
print(next(it))  # 2
print(next(it))  # 4
```

Zde vidíme, co všechno za nás generátor s `yield` dělá automaticky – stará se o uložení lokálních proměnných a stavu.

---
<!-- slide: id7, Konečný generátor a návrat hodnoty, Core, basics -->
## Konečný generátor a přirozené ukončení

Pokud generátorová funkce opustí své tělo (nebo narazí na `return`), CPython automaticky vyvolá výjimku `StopIteration`:

```python
def pozpatku[T](data: list[T]):
    """Generátor procházející seznam od konce."""
    for i in range(len(data) - 1, -1, -1):
        yield data[i]

for pismeno in pozpatku(["A", "B", "C"]):
    print(pismeno)
# Vypíše: C, B, A
```

---
<!-- slide: id8, Třídní implementace konečného iterátoru, Core, paradigm -->
## Třídní iterátor s explicitním `StopIteration`

Při tvorbě vlastního konečného iterátoru musíme v metodě `__next__` explicitně vyvolat `StopIteration`:

```python
class Pozpatku:
    def __init__(self, data: list[str]) -> None:
        self.data = data
        self.index = len(data)

    def __iter__(self) -> "Pozpatku":
        return self

    def __next__(self) -> str:
        if self.index == 0:
            raise StopIteration  # Konec iterace!
        self.index -= 1
        return self.data[self.index]

for val in Pozpatku(["A", "B", "C"]):
    print(val)  # C, B, A
```

---
<!-- slide: id9, Reverzibilní iterace a metoda __reversed__(), Tricky, pythonic -->
## Reverzibilní iterátory: `reversed()` a `__reversed__()`

Vestavěná funkce `reversed(obj)` umožňuje projít kolekci v opačném směru bez alokace kopie v paměti:

```python
cisla = [1, 2, 3, 4]
for x in reversed(cisla):
    print(x)  # 4, 3, 2, 1
```

### Jak podpořit `reversed()` ve vlastní třídě:
Objekt musí splňovat jednu ze dvou podmínek:
1. **Definovat metodu `__reversed__(self)`**, která vrátí iterátor pro zpětný průchod:
   ```python
   def __reversed__(self):
       return Pozpatku(self.data)
   ```
2. **Implementovat sekvenční protokol**: Definovat metody `__len__()` a `__getitem__()` pro celočíselné indexy od `0` do `N-1`.
