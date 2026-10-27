<!-- slide: id=id1 title="Úvod" tags="Skip" diff="basics" -->
## Rekurzivní grafika a fraktální geometrie

Želví grafika poskytuje neobyčejně intuitivní prostředí pro pochopení a vizualizaci **rekurze**. 

Zatímco v kartézském souřadném systému vyžaduje vykreslení rozvětveného stromu výpočet goniometrických funkcí ($\sin, \cos$) a sledování globálních souřadnic každého uzlu, v želví grafice stačí definovat **lokální relativní pravidlo** a nechat interpret vybudovat fraktál přirozeně.

> [!NOTE]
> Klíčem k úspěšné rekurzivní grafice je koncept **stavového invariantu** (*state invariance*): každá rekurzivní funkce musí po dokončení své práce vrátit kreslicí kurzor do přesně stejného stavu (poloha i natočení), v jakém jej převzala.

---
<!-- slide: id=id2 title="Zadání příkladu" tags="Skip" diff="basics" -->
## Zadání: Fraktální binární strom

Naším cílem je naprogramovat vykreslení rozvětveného fraktálního stromu:

Každý kmen se na svém vrcholu dělí na dvě menší větve (levou a pravou), které jsou zmenšenými kopiemi původního kmene. Tento proces se opakuje do zadané hloubky zanoření nebo do dosažení minimální délky větvičky.

Na první pohled složitá struktura se skládá z jediného opakujícího se geometrického motivu.

---
<!-- slide: id=id3 title="Rozbor zadání I" tags="Skip" diff="basics" -->
## Dekompozice algoritmu

Představme si kroky, které musí želva vykonat:

1. Z výchozího bodu nakreslit kmen dané délky $L$.
2. Na konci kmene se otočit doleva o úhel $\alpha$ a nakreslit celou levou korunu (zmenšený strom o délce $L \cdot 0{,}7$).
3. Vrátit se zpět do rozvětvení.
4. Otočit se doprava o úhel $\beta$ a nakreslit celou pravou korunu (zmenšený strom o délce $L \cdot 0{,}7$).
5. Vrátit se zpět na patu kmene do výchozího bodu a natočení.

---
<!-- slide: id=id4 title="Rozbor zadání II – invariantní funkce" tags="Core" diff="newconcept" -->
## Klíčový princip: Stavový invariant (State Invariance)

Aby rekurze správně fungovala, musí být kreslicí funkce **stavovým invariantem**:

> [!IMPORTANT]
> **Definice stavového invariantu v grafice**:
> Pokud funkce začíná na souřadnicích $[x, y]$ s úhlem natočení $\theta$, musí při svém návratu zanechat želvu opět přesně na souřadnicích $[x, y]$ s úhlem natočení $\theta$.

Pokud by se želva po vykreslení levé větve nevrátila na vrchol kmene, pravou větev by začala kreslit kdesi na konci levé větvičky, což by geometrii stromu okamžitě zničilo.

---
<!-- slide: id=id5 title="Náčrt bez rekurze" tags="Skip" diff="basics" -->
## Lineární náčrt pro 1 úroveň větvení

Před zavedením rekurze si ukažme imperativní kód pro kmen a dvě primární větve:

```python
import turtle

turtle.left(90)  # Želva směřuje vzhůru na sever

# 1. Kmen
turtle.forward(100)
turtle.left(45)

# 2. Levá větev
turtle.forward(70)
turtle.backward(70)  # Návrat do rozcestí (invariance pozice)

# 3. Pravá větev
turtle.right(90)
turtle.forward(70)
turtle.backward(70)  # Návrat do rozcestí (invariance pozice)

# 4. Návrat na patu kmene
turtle.left(45)       # Obnovení svislého směru
turtle.backward(100)  # Návrat do výchozího bodu (úplná invariance!)

turtle.done()
```

---
<!-- slide: id=id6 title="A nyní s rekurzí" tags="Tricky" diff="basics" -->
## Zobecnění do rekurzivní funkce

Nahrazením posunu větve dalším voláním téže funkce vznikne čistý rekurzivní zápis:

```python
import turtle

turtle.left(90)

def strom(delka: float) -> None:
    turtle.forward(delka)
    turtle.left(45)

    strom(delka * 0.7)  # Rekurzivní levá větev

    turtle.right(90)

    strom(delka * 0.7)  # Rekurzivní pravá větev

    # Obnovení stavového invariantu:
    turtle.left(45)
    turtle.backward(delka)
```

> [!WARNING]
> Tento kód zatím nelze spustit – chybí mu **ukončovací podmínka** (*bázový případ / kotva rekurze*), takže by vedl k nekonečnému zanoření a `RecursionError: maximum recursion depth exceeded`.

---
<!-- slide: id=id7 title="Ukončení rekurze" tags="Core" diff="pythonic" -->
## Funkční rekurzivní strom s bázovým případem

Přidáním prahové hodnoty minimální délky větve `MIN_DELKA` získáme hotový deterministický fraktál:

```python
import turtle

MIN_DELKA = 10  # Kotva rekurze: větve kratší než 10 px se nekreslí

def strom(delka: float) -> None:
    # 1. Bázový případ (ukončení rekurze)
    if delka < MIN_DELKA:
        return

    # 2. Vykreslení kmene
    turtle.forward(delka)

    # 3. Levá podvětev
    turtle.left(35)
    strom(delka * 0.7)

    # 4. Pravá podvětev
    turtle.right(70)
    strom(delka * 0.7)

    # 5. Návrat do původního stavu (invariant)
    turtle.left(35)
    turtle.backward(delka)

# Nastavení a spuštění
turtle.left(90)
turtle.speed(0)
strom(120)
turtle.done()
```

---
<!-- slide: id=id8 title="Reálněji vypadající strom I" tags="Skip" diff="basics" -->
## Asymetrické větvení a přirozený habitus

Skutečné stromy nemají větve vyrůstající z jednoho bodu. Větvení probíhá v různých výškách kmene:

```python
import turtle

MIN_DELKA = 8

def realny_strom(delka: float) -> None:
    if delka < MIN_DELKA:
        return

    # Spodní část kmene
    turtle.forward(delka / 3)
    turtle.left(30)
    realny_strom(delka * 0.65)
    turtle.right(30)

    # Střední část kmene
    turtle.forward(delka / 4)
    turtle.right(25)
    realny_strom(delka * 0.5)
    turtle.left(25)

    # Vrcholek stromu
    turtle.forward(delka * 5 / 12)
    turtle.left(15)
    realny_strom(delka * 0.4)
    turtle.right(15)

    # Návrat na patu stromu podél celé délky
    turtle.backward(delka)
```

Tato asymetrie eliminuje umělý geometrický vzhled a vytváří organickou korunu.

---
<!-- slide: id=id9 title="Reálněji vypadající strom II" tags="Skip" diff="basics" -->
## Diferenciace barev a tloušťky větví

Pro ještě vyšší realističnost odlišíme kmen a silné větve od jemného listoví.

Musíme však dodržet **invarianci barvy i tloušťky pera**:

```python
import turtle

def barevny_strom(delka: float) -> None:
    if delka < 8:
        return

    # Uložení původní barvy a tloušťky
    puvodni_barva = turtle.pencolor()
    puvodni_sirka = turtle.pensize()

    # Větve podle tloušťky: kmen hnědý, tenké větvičky zelené
    if delka < 20:
        turtle.pencolor("forestgreen")
        turtle.pensize(2)
    else:
        turtle.pencolor("sienna")
        turtle.pensize(max(1, int(delka / 12)))

    turtle.forward(delka)
    turtle.left(30)
    barevny_strom(delka * 0.7)
    turtle.right(60)
    barevny_strom(delka * 0.7)
    turtle.left(30)
    turtle.backward(delka)

    # Obnovení původního stavu pera (invariant)
    turtle.pencolor(puvodni_barva)
    turtle.pensize(puvodni_sirka)
```

---
<!-- slide: id=id10 title="L-systémy – simulace (nejen) růstu organismů" tags="Skip" diff="basics" -->
## Od rekurzivních funkcí k L-systémům

Přímé rekurzivní volání funkcí má svá omezení:
- Je svázáno se zásobníkem volání Pythonu (`sys.getrecursionlimit()`).
- Těžkopádně modeluje buněčnou komunikaci, zrání a časový vývoj.

Právě proto vyvinul Aristid Lindenmayer **L-systémy**, které rekurzi povyšují na **paralelní gramatiku přepisování řetězců**. Zásobníkové operace `[` a `]` v L-systémech dělají přesně to samé, co náš rekurzivní návrat: uchovávají a obnovují stavový invariant želvy.
