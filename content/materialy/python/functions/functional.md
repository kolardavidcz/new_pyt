<!-- slide: id1, Úvod do funkcionálního stylu v Pythonu, Core, basics -->
## Funkcionální programování v Pythonu

Python není čistě funkcionální jazyk jako Haskell či Clojure, ale **víceparadigmatický jazyk**, který funkcionální koncepty přirozeně integruje do svého objektového modelu:

### Klíčové principy funkcionálního stylu:
1. **Funkce jako First-Class Citizens**: Funkce lze předávat jako data, ukládat a vracet z jiných funkcí.
2. **Čisté funkce (*Pure Functions*)**: Funkce nemají vedlejší účinky (*side effects*) a pro stejné argumenty vždy vracejí identický výsledek.
3. **Neměnnost dat (*Immutability*)**: Využívání neměnných typů (`tuple`, `frozenset`, frozen dataclasses).
4. **Líné vyhodnocování (*Lazy Evaluation*)**: Zpracování prvků v paměti až v okamžiku, kdy jsou skutečně potřeba.

---
<!-- slide: id2, Komprehenze jako páteř funkcionálního Pythonu, Core, pythonic -->
## Komprehenze jako náhrada imperativních smyček

Základním funkcionálním nástrojem v Pythonu jsou **komprehenze** (seznamové, množinové a slovníkové). Umožňují deklarativně vyjádřit mapování a filtrování v jediném výrazu:

```python
cisla = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Deklarativní transformace a filtrace:
ctverce_sudych = [x ** 2 for x in cisla if x % 2 == 0]
print(ctverce_sudych)  # [4, 16, 36, 64, 100]
```

V komprehenzi popisujeme **CO** chceme získat, nikoli **JAK** krok za krokem alokovat prázdný seznam a přidávat prvky.

---
<!-- slide: id3, Líné vyhodnocování a zkrácené operace, Skip, basics -->
## Líné operace a zkrácené vyhodnocování

Při funkcionálním zpracování rozsáhlých datových proudů je klíčová efektivita – provádět pouze tolik výpočtů, kolik je nezbytně nutné pro určení výsledku:

- **Operátory `and` / `or`**: Okamžitě ukončí vyhodnocování, jakmile první operand rozhodne.
- **Predikátové funkce `any()` a `all()`**: Zastaví iteraci při prvním rozhodujícím prvku.

---
<!-- slide: id4, Predikátové funkce any() a all(), WOW, pythonic -->
## Predikátové agregace: `any()` a `all()`

Funkce `any()` a `all()` testují pravdivost kolekce se zkratkovým vyhodnocením (*short-circuit*):

- **`any(iterable)`**: Vrátí `True`, pokud je **alespoň jeden** prvek pravdivý. U prázdné sekvence vrací `False`.
- **`all(iterable)`**: Vrátí `True`, pokud jsou **všechny** prvky pravdivé. U prázdné sekvence vrací `True` (vakuová pravda).

```python
uzivatele = [
    {"jmeno": "Alice", "aktivni": True},
    {"jmeno": "Bob", "aktivni": False},
    {"jmeno": "Cyril", "aktivni": True},
]

# Máme v systému alespoň jednoho neaktivního uživatele?
ma_neaktivni = any(not u["aktivni"] for u in uzivatele)
print(f"Nalezen neaktivní: {ma_neaktivni}")  # True

# Jsou všichni plnoletí?
veky = [21, 19, 25, 30]
vsi_plnoleti = all(v >= 18 for v in veky)
print(f"Všichni 18+: {vsi_plnoleti}")        # True
```

> [!TIP] Šetří paměť s generátorovým výrazem
> Předáním generátorového výrazu `any(x > 100 for x in data)` se položky testují jedna po druhé bez nutnosti alokovat mezilehlý seznam v paměti.

---
<!-- slide: id5, Agregační funkce: min(), max(), sum(), Core, basics -->
## Agregační funkce: `min()`, `max()`, `sum()`

Standardní knihovna poskytuje optimalizované agregační redukce:

```python
teploty = [18.5, 22.0, 15.2, 26.8, 20.1]

print(min(teploty))        # 15.2
print(max(teploty))        # 26.8
print(sum(teploty))        # 102.6
print(sum(teploty) / len(teploty))  # Průměr: 20.52
```

### Síla transformačního parametru `key=`:
Funkce `min()` a `max()` přijímají jednoargumentovou funkci `key`:

```python
studenti = [("Jan", 75), ("Eva", 98), ("Petr", 82)]

# Nalezení nejlepšího studenta podle bodů (druhý prvek):
nejlepsi = max(studenti, key=lambda s: s[1])
print(f"Nejlepší: {nejlepsi[0]} s {nejlepsi[1]} body")  # Eva s 98 body
```

---
<!-- slide: id6, Funkce map() a filter() vs. komprehenze, Core, pythonic -->
## `map()` a `filter()` vs. Komprehenze

Funkce `map` a `filter` vracejí líné iterátory:

```python
cisla = [1, 2, 3, 4, 5]

# map(fn, iter) -> transformace prvků
mocniny = list(map(lambda x: x ** 2, cisla))  # [1, 4, 9, 16, 25]

# filter(predikat, iter) -> výběr prvků
suda = list(filter(lambda x: x % 2 == 0, cisla))  # [2, 4]
```

### Proč Guido van Rossum preferuje komprehenze:
V idiomatickém Pythonu se `map` a `filter` používají minimálně, protože komprehenze je čitelnější a spojuje obě operace:

```python
# ❌ Složitý funkcionální zápis s vnořováním:
vysledek_map = list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, cisla)))

# ✅ Čistý, čitelný a rychlý pythonický zápis:
vysledek_comp = [x ** 2 for x in cisla if x % 2 == 0]
```

---
<!-- slide: id7, Spojování sekvencí: zip() a zip(strict=True), WOW, pythonic -->
## Sdružování sekvencí: `zip()` a novinka `strict=True`

Funkce `zip(*iterables)` paralelně prochází více sekvencí a sdružuje odpovídající prvky do n-tic:

```python
jmena = ["Jan", "Petr", "Eva"]
body = [85, 92, 78]

for jmeno, body_studente in zip(jmena, body):
    print(f"{jmeno}: {body_studente} b.")
```

### Novinka v Pythonu 3.10: `zip(..., strict=True)` (PEP 618)
Ve výchozím stavu se `zip()` tiše zastaví, jakmile dojde nejkratší sekvence, což často maskuje chyby v datech:

```python
# S přepínačem strict=True Python garantuje shodnou délku:
try:
    list(zip([1, 2, 3], ["a", "b"], strict=True))
except ValueError as err:
    print(f"Chyba délky: {err}")
    # ValueError: zip() argument 2 is shorter than argument 1
```

Pokud chcete naopak chybějící položky doplnit: `itertools.zip_longest(..., fillvalue=None)`.

---
<!-- slide: id8, Modul functools: partial, reduce a cache, Skip, basics -->
## Funkcionální arzenál: Modul `functools`

Modul `functools` nabízí pokročilé nástroje pro práci s funkcemi vyššího řádu:

### 1. Částečná aplikace argumentů (`partial`):
```python
from functools import partial

def nasob(a: int, b: int) -> int:
    return a * b

# Vytvoření specializované funkce 'zdvojnasob' fixací prvního argumentu:
zdvojnasob = partial(nasob, 2)
print(zdvojnasob(15))  # 30
```

### 2. Redukce sekvence (`reduce`):
```python
from functools import reduce

# Výpočet faktoriálu akumulací násobení:
faktorial_5 = reduce(lambda acc, x: acc * x, range(1, 6))
print(faktorial_5)  # 120
```

---
<!-- slide: id9, Anonymní funkce lambda a doporučení PEP 8, Core, resyntax -->
## Anonymní funkce `lambda` a pravidla PEP 8

Klíčové slovo `lambda` definuje jednořádkovou bezejmennou funkci složenou z **jediného výrazu**:

```python
lambda argumenty: vyraz
```

Typické a správné použití je předání krátkého jednoúčelového回调u:
```python
radky = ["10: Soubor", "2: Zpráva", "100: Konec"]
# Seřazení podle celočíselného ID před dvojtečkou:
serazeno = sorted(radky, key=lambda r: int(r.split(":")[0]))
print(serazeno)  # ['2: Zpráva', '10: Soubor', '100: Konec']
```

> [!WARNING] Pravidlo PEP 8 proti pojmenovávání lambd
> Nikdy nepřiřazujte lambdu do proměnné:
> - ❌ `secti = lambda a, b: a + b`
> - ✅ `def secti(a: int, b: int) -> int: return a + b`
> 
> Běžná funkce má správné `__name__` v tracebacku při ladění, zatímco lambda se v tracebacích zobrazuje pouze jako anonymní `<lambda>`.

---
<!-- slide: id10, Přemostění do Week 6: Líné toky a generátory (yield), Skip, basics -->
## Přemostění do Week 6: Generátory a líné toky

Nejvýznamnějším funkcionálním konceptem v Pythonu je **líné vyhodnocování sekvencí pomocí generátorů**.

Místo vytváření celých gigabajtových seznamů v paměti RAM:
- Generátorový výraz: `(x ** 2 for x in velky_proud)`
- Generátorové funkce s klíčovým slovem **`yield`**

Tyto techniky umožňují zpracovávat terabajtové logy a datové proudy v konstantní paměti **$O(1)$ RAM** a budeme se jim podrobně věnovat v navazujícím **Week 6**.
