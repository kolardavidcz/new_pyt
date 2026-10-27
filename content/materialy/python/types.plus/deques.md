<!-- slide: id1, Úvod, Tricky, pythonic -->
## Úvod do `collections.deque`: Oboustranná fronta

Ačkoli klasickou frontu (*FIFO — First In, First Out*) můžeme v Pythonu nasimulovat pomocí standardního seznamu `list`, seznam pro tento účel není vhodný:
- Přidání nebo odebrání prvku na **konci** seznamu (`xs.append(x)`, `xs.pop()`) je $O(1)$.
- Přidání nebo odebrání prvku na **začátku** seznamu (`xs.insert(0, x)`, `xs.pop(0)`) má asymptotickou složitost **$O(n)$**, protože vyžaduje posun všech zbývajících prvků v souvislém poli paměti!

Pokud potřebujete obousměrné vkládání i odebírání v garantovaném čase **$O(1)$**, standardní knihovna nabízí specializovanou datovou strukturu: **`collections.deque`** (*double-ended queue*).

```python
from collections import deque
```

---
<!-- slide: id2, Vlastnosti, Core, newconcept -->
## Architektura a vlastnosti `collections.deque`

Pod kapotou je `deque` implementována jako **obousměrný spojový seznam paměťových bloků** (*doubly-linked list of blocks*):

- **$O(1)$ operace na obou koncích**: `append`, `appendleft`, `pop`, `popleft`.
- **Rychlá rotace prvků**: Metoda `rotate(n)` rotuje prvky v konstantním nebo lineárním čase bez vytváření nového objektu.
- **Pevně omezená kapacita (`maxlen`)**: Možnost nastavit maximální velikost vyrovnávací paměti (kruhové buffery).
- **Vláknová bezpečnost (*Thread-Safety*)**: Operace `append()`, `appendleft()`, `pop()` a `popleft()` jsou atomické a thread-safe.

> [!WARNING]
> **Kompromis náhodného přístupu**:
> - V seznamu `list` je čtení i zápis libovolného prvku `xs[i]` bleskové $O(1)$.
> - U `deque` je přístup k prvkům **uprostřed fronty pomalý $O(n)$**, protože vyžaduje procházení ukazatelů od nejbližšího konce!
> `deque` není určena pro náhodný indexovaný přístup nebo sorting in-place.

---
<!-- slide: id3, Oboustranná fronta jako sekvence, Tricky, resyntax -->
## `deque` jako sekvence

Z pohledu rozhraní se `deque` chová jako sekvence s několika drobnými odlišnostmi:

```python
from collections import deque

d = deque([1, 2, 3, 4, 3, 5])

# 1. Zjištění délky:
print(len(d))
# 6

# 2. Test přítomnosti prvku:
print(3 in d)
# True

# 3. Přístup přes index na koncích (rychlé O(1)):
print(d[0], d[-1])
# 1 5

# 4. Četnost výskytu:
print(d.count(3))
# 2

# 5. Obrácení pořadí in-place:
d.reverse()
print(d)
# deque([5, 3, 4, 3, 2, 1])
```

> [!NOTE]
> `deque` **nepodporuje přímé řezy syntaxí `d[1:4]`**! Pokud potřebujete výřez z `deque`, použijte `itertools.islice(d, 1, 4)` nebo ji převeďte na `list(d)[1:4]`.

---
<!-- slide: id4, Oboustranná fronta jako sekvence – smyčka „for-in“, Skip, basics -->
## Průchod frontou pomocí smyčky `for`

Průchod prvky fronty je přirozený a podporuje všechny standardní sekvenční idiomy:

```python
from collections import deque

d = deque([5, 2, 3, 1, 4])

# 1. Přímá iterace
for x in d:
    print(x, end=" ")
# 5 2 3 1 4

# 2. Iterace s indexem
for i, x in enumerate(d):
    pass

# 3. Iterace v obráceném pořadí (bez alokace nového seznamu)
for x in reversed(d):
    print(x, end=" ")
# 4 1 3 2 5

# 4. Řazení pomocí vestavěné funkce sorted() (vrací nový list)
sorted_items = sorted(d)
print(sorted_items)
# [1, 2, 3, 4, 5]
```

---
<!-- slide: id5, Oboustranná fronta jako sekvence III – odstraňování prvků, Skip, basics -->
## Odstraňování prvků: `del`, `remove()` a `clear()`

Kromě odebírání z konců podporuje `deque` také odstraňování prvků z libovolného místa:

```python
from collections import deque

d = deque([10, 20, 30, 40, 30, 50])

# 1. Smazání konkrétní pozice pomocí del (O(n) operace!):
del d[2]
print(d)
# deque([10, 20, 40, 30, 50])

# 2. Odstranění prvního výskytu hodnoty (vyvolá ValueError, pokud chybí):
d.remove(30)
print(d)
# deque([10, 20, 40, 50])

# 3. Vyprázdnění celé fronty:
d.clear()
print(d)
# deque([])
```

---
<!-- slide: id6, Základní operace I – „append(left)“ a „pop(left)“, Core, pythonic -->
## Základní operace: `append` vs. `appendleft`, `pop` vs. `popleft`

Symetrická manipulace s oběma konci v garantovaném čase $O(1)$:

```python
from collections import deque

d = deque([1, 2, 3])

# Přidání a odebrání na PRAVÉM konci (standardní zásobník LIFO):
d.append(4)
print(d)
# deque([1, 2, 3, 4])

val = d.pop()
print(val, d)
# 4 deque([1, 2, 3])

# Přidání a odebrání na LEVÉM konci (fronta FIFO bez zpoždění!):
d.appendleft(0)
print(d)
# deque([0, 1, 2, 3])

val_left = d.popleft()
print(val_left, d)
# 0 deque([1, 2, 3])
```

---
<!-- slide: id7, Základní operace II – „extend(left)“, Tricky, pythonic -->
## Hromadné vkládání: `extend()` vs. `extendleft()`

`deque` umožňuje připojit libovolný iterovatelný objekt:

```python
from collections import deque

d = deque([1, 2, 3])

# 1. extend(): Připojení na pravý konec v původním pořadí
d.extend(['a', 'b', 'c'])
print(d)
# deque([1, 2, 3, 'a', 'b', 'c'])

# 2. extendleft(): Připojení na levý konec (POZOR na pořadí!)
d2 = deque([1, 2, 3])
d2.extendleft(['a', 'b', 'c'])
print(d2)
# deque(['c', 'b', 'a', 1, 2, 3])
```

> [!WARNING]
> Metoda `extendleft()` iteruje přes vstup a postupně volá `appendleft()`. Proto dojde k **obrácení pořadí** vložených prvků! Pokud chcete zachovat pořadí prvků při vkládání vlevo, použijte `d2.extendleft(reversed(['a', 'b', 'c']))`.

---
<!-- slide: id8, Rotace prvků, WOW, pythonic -->
## Rotace prvků v kruhu: `rotate(n)`

Unikátní operací pro `deque` je metoda **`rotate(n)`**, která posune všechny prvky v cyklu:

```python
from collections import deque

d = deque([1, 2, 3, 4, 5])

# Kladné n: Rotace doprava (prvky zprava přecházejí doleva)
d.rotate(2)
print(d)
# deque([4, 5, 1, 2, 3])

# Záporné n: Rotace doleva (prvky zleva přecházejí doprava)
d.rotate(-1)
print(d)
# deque([5, 1, 2, 3, 4])
```

Využití:
- Kruhové plánovače procesů (*Round-Robin scheduler*).
- Posuvná okna a šifrovací algoritmy (Césarova šifra, Enigma).
- Herní inventáře a kolotoče položek v GUI.

---
<!-- slide: id9, Omezení délky fronty, WOW, pythonic -->
## Kruhové bafry pevné velikosti: parametr `maxlen`

Při vytvoření `deque` můžete zadat parametr **`maxlen`**, který nastaví pevnou kapacitu paměti:

```python
from collections import deque

# Fronta s maximální délkou 3 prvky
ring = deque(maxlen=3)

ring.append(1)
ring.append(2)
ring.append(3)
print(ring)
# deque([1, 2, 3], maxlen=3)

# Při překročení kapacity se automaticky a tiše zahodí prvek z protilehlého konce!
ring.append(4)
print(ring)
# deque([2, 3, 4], maxlen=3)

ring.appendleft(99)
print(ring)
# deque([99, 2, 3], maxlen=3)
```

> [!NOTE]
> Po vytvoření je atribut `d.maxlen` **read-only** (nelze jej za běhu měnit).

---
<!-- slide: id10, Pár příkladů, WOW, pythonic -->
## Praktické příklady: Linuxový `tail` a souběžnost

### 1. Implementace unixového nástroje `tail` s konstantní pamětí:

```python
from collections import deque
from pathlib import Path

def tail(filepath: str | Path, n: int = 10) -> deque[str]:
    """Vrátí posledních n řádků souboru bez nutnosti načítat celý soubor do paměti."""
    with open(filepath, "r", encoding="utf-8") as f:
        return deque(f, maxlen=n)
```

Díky `maxlen=n` si `deque` pamatuje vždy pouze posledních $n$ řádků, i když soubor má 50 GB.

### 2. Vláknová bezpečnost (*Thread-Safety*)

`collections.deque` poskytuje atomické operace `append()` a `popleft()`. Dvě vlákna mohou bezpečně přistupovat k opačným koncům bez nutnosti zamykat explicitní `threading.Lock`:

```python
import threading
from collections import deque

shared_queue = deque(maxlen=100)

def producer():
    for item in range(50):
        shared_queue.append(item)

def consumer():
    while True:
        try:
            val = shared_queue.popleft()
            # Zpracování položky...
        except IndexError:
            break
```
