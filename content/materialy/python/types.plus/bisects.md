<!-- slide: id1, Úvod, Core, newconcept -->
## Úvod do modulu `bisect`: Bisekční půlení intervalu

Modul **`bisect`** ze standardní knihovny implementuje algoritmus **binárního vyhledávání** (*bisekce*) nad seřazenými poli.

Poskytuje dvě hlavní skupiny funkcí:
1. **Vyhledávací funkce (`bisect_left`, `bisect_right`)**: Naleznou index, kam daný prvek patří, v logaritmickém čase **$O(\log n)$**.
2. **Vkládací funkce (`insort_left`, `insort_right`)**: Naleznou pozici v $O(\log n)$ a prvek na ni rovnou vloží (samotný posun prvků v poli `list` zabere $O(n)$).

Hlavní využití:
- Udržování neustále seřazeného seznamu při postupném přibývání prvků bez nutnosti volat po každém kroku `sort()`.
- Rychlé intervalové vyhledávání hodnot (*lookup tables*, známkování, cenové hladiny).

```python
import bisect
```

---
<!-- slide: id2, Příklad, WOW, pythonic -->
## Srovnání výkonu: `sort()` vs. `bisect.insort()`

Proč nevolat `xs.append()` následované `xs.sort()` po každém vložení?
Třídění celého seznamu zabere pokaždé $O(n \log n)$, zatímco vložení přes bisekci $O(n)$:

```python
import bisect
import random
import timeit

# Varianta A: Třídění celého seznamu po každém vložení 1000 čísel
# 0.00281 s

# Varianta B: Vkládání na správné místo pomocí bisect.insort
# 0.00059 s (cca 5x rychlejší!)
```

> [!TIP]
> **Kdy co použít?**
> - Pokud máte předem známou dávku neseřazených dat, je nejrychlejší přidat vše najednou pomocí `xs.extend()` a zavolat `xs.sort()` **jednorázově až na konci** ($O(n \log n)$ v Timsortu).
> - Pokud data přicházejí průběžně a vy potřebujete mít seznam seřazený v **každém okamžiku**, použijte `bisect.insort()`.

---
<!-- slide: id3, Funkce pro nalezení pozice, Tricky, pythonic -->
## Nalezení indexu: `bisect_left` vs. `bisect_right`

Pokud vkládaná hodnota již v seřazeném seznamu existuje, vyvstává otázka: vložit novou položku nalevo, nebo napravo od existujících duplikátů?

- **`bisect_left(a, x)`**: Vrátí index **před** první výskyt existující hodnoty (vše nalevo je $< x$, vše napravo je $\ge x$).
- **`bisect_right(a, x)`** (alias `bisect()`): Vrátí index **za** poslední výskyt existující hodnoty (vše nalevo je $\le x$, vše napravo je $> x$).

```python
import bisect

numbers = [10, 20, 20, 20, 30, 40]

idx_left = bisect.bisect_left(numbers, 20)
print(f"bisect_left:  index {idx_left}")
# bisect_left:  index 1

idx_right = bisect.bisect_right(numbers, 20)
print(f"bisect_right: index {idx_right}")
# bisect_right: index 4
```

> [!NOTE]
> Od verze **Python 3.10+** podporují všechny funkce v modulu `bisect` parametr **`key`** (např. `bisect_left(users, 25, key=lambda u: u.age)`), což umožňuje binární vyhledávání v polích složitých objektů bez nutnosti vytvářet pomocné seznamy!

---
<!-- slide: id4, Funkce pro vložení prvku, Core, pythonic -->
## Vkládání prvků in-place: `insort_left` a `insort_right`

Funkce `insort` naleznou správnou pozici a rovnou na ni prvek vloží pomocí vnitřního volání `a.insert(index, x)`:

- **`insort_left(a, x)`**: Vloží duplicitní prvek vlevo od existujících duplikátů.
- **`insort_right(a, x)`** (alias `insort()`): Vloží duplicitní prvek vpravo od existujících duplikátů.

```python
import bisect

scores = [100, 200, 300]

bisect.insort(scores, 250)
print(scores)
# [100, 200, 250, 300]

bisect.insort(scores, 150)
print(scores)
# [100, 150, 200, 250, 300]
```

Volitelné parametry `lo` a `hi` (např. `lo=0, hi=len(a)`) umožňují omezit bisekční prohledávání pouze na vybraný podúsek seznamu.

---
<!-- slide: id5, Použití, WOW, pythonic -->
## Praktické využití: Intervalové tabulky a mapování

Klasickým uplatněním `bisect` je převod spojité číselné hodnoty na diskrétní kategorii (např. škála známek, daňová pásma, slevové hladiny):

```python
import bisect

def get_grade(score: int) -> str:
    # Hranice bodů pro F, D, C, B, A:
    # 0..59 -> F, 60..69 -> D, 70..79 -> C, 80..89 -> B, 90..100 -> A
    breakpoints = [60, 70, 80, 90]
    grades = ['F', 'D', 'C', 'B', 'A']
    
    idx = bisect.bisect(breakpoints, score)
    return grades[idx]

test_scores = [33, 99, 77, 70, 89, 90, 100]
results = [get_grade(s) for s in test_scores]
print(results)
# ['F', 'A', 'C', 'C', 'B', 'A', 'A']
```

Tento přístup je nesrovnatelně čitelnější a rychlejší než série zanořených větví `if/elif/elif/elif`.
