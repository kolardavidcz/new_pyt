<!-- slide: id1, Citát, Skip, basics -->
## Funkcionální programování v Pythonu

> *„Nikdy bych Python neoznačil za funkcionální jazyk, ale kdykoliv v něm programuji, kód nevyhnutelně skončí jako téměř čistě funkcionální. (Po pravdě je to dáno především neuvěřitelně elegantní generátorovou notací seznamů.)“*  
> — **Konrad Rudolph**

Python je multi-paradigmatický jazyk: kombinuje objektové pojetí, přirozenou imperativní čitelnost a silné prvky funkcionálního programování (FP).

---
<!-- slide: id2, Úvod, Core, paradigm -->
## Příkazy (Statements) vs. Výrazy (Expressions)

Zatímco klasické imperativní programování staví na **příkazech** (*statements*), které postupně mění globální nebo lokální stav programu (vedlejší efekty), funkcionální programování staví výhradně na **výrazech** (*expressions*):
- Každý výraz má konkrétní návratovou hodnotu.
- Funkce jsou matematickými zobrazeními: pro stejné vstupy vracejí vždy stejné výstupy (**referenční transparentnost**).

V Pythonu můžeme díky vracení operandů pravdivostními operátory `and` / `or` a výrazům `lambda` zkonstruovat i pokročilou řídicí logiku čistě jako výrazy.

> [!NOTE] Python není čistě funkcionální
> Guido van Rossum záměrně odmítl udělat z Pythonu čistý funkcionální jazyk (odmítl tail-call optimalizaci a zachoval striktní oddělení příkazů a výrazů). Přesto funkcionální myšlení vede k čistšímu, snáze testovatelnému kódu.

---
<!-- slide: id3, „if-elif-else“ I, WOW, pythonic -->
## Nahrazení větvení výrazem `and` / `or`

Klasickou řídicí konstrukci `if-elif-else` lze zapsat jako jediný zřetězený pravdivostní výraz:

### Imperativní příkaz:
```python
if podminka_1:
    vysledek = funkce_1()
elif podminka_2:
    vysledek = funkce_2()
else:
    vysledek = funkce_3()
```

### Funkcionální ekvivalent (čistý výraz):
```python
vysledek = (podminka_1 and funkce_1()) or (podminka_2 and funkce_2()) or funkce_3()
```

---
<!-- slide: id4, „if-elif-else“ II, Tricky, pythonic -->
## Jak funguje zkrácené vyhodnocení (Short-circuiting)?

Tento mechanismus těží z vlastnosti Pythonu, kdy operátory `and` a `or` nevracejí prostý boolean `True`/`False`, ale **přímo hodnotu vyhodnocovaného operandu**:

```python
(podminka_1 and funkce_1()) or \
(podminka_2 and funkce_2()) or \
funkce_3()
```

1. Pokud je `podminka_1` pravdivá, operátor `and` přejde k vyhodnocení `funkce_1()`.
2. Pokud `funkce_1()` vrátí pravdivou hodnotu (*truthy*), vnější operátor `or` má splněno a zbytek celého řádku **vůbec nevyhodnotí**!
3. Pokud `podminka_1` selže, `and` vrátí nepravdivou hodnotu a `or` pokračuje na druhý řádek.
4. Pokud selže i `podminka_2`, bezpodmínečně se zavolá `funkce_3()`.

---
<!-- slide: id5, „if-elif-else“ III, Core, paradigm -->
## Příkaz vs. Výraz v praxi

Zásadní rozdíl:
- **Příkaz `if`**: Nemá návratovou hodnotu. Nelze jej přiřadit do proměnné ani předat jako argument jiné funkci.
- **Výraz**: Vždy vrací konkrétní objekt, který lze okamžitě předat dál.

Moderní Python nabízí nativní **ternární operátor** (PEP 308):
```python
vysledek = f1() if p1 else (f2() if p2 else f3())
```

A od Pythonu 3.10 také strukturální pattern matching (`match/case`), který v kombinaci s pure funkcemi nabízí elegantní funkcionální větvení.

---
<!-- slide: id6, „if-elif-else“ jako funkce, Core, pythonic -->
## Podmínka zapouzdřená do `lambda` výrazu

Protože pravdivostní řetězec je jediným výrazem, můžeme z něj vytvořit čistou anonymní funkci:

```python
parita = lambda x: (x % 2 == 0 and "sudé") or "liché"

print(parita(4))  # 'sudé'
print(parita(7))  # 'liché'
```

V moderním zápisu s ternárním operátorem:
```python
parita = lambda x: "sudé" if x % 2 == 0 else "liché"
```

Tato funkce neobsahuje žádné lokální proměnné, žádné přepisování stavu a přesně jeden vstup mapuje na jeden výstup.

---
<!-- slide: id7, „if-elif-else“ – rozbor, Core, paradigm -->
## Výhody bezstavových výrazů

Porovnejme imperativní funkci s funkcionálním výrazem:

| Aspekt | Imperativní styl | Funkcionální výraz |
| :--- | :--- | :--- |
| **Přiřazení stavu** | Proměnné se přepisují během běhu | Žádné lokální proměnné nevznikají |
| **Návratové body** | Mnohočetné `return` na různých místech | Jediný deterministický výsledek |
| **Testovatelnost** | Nutno sledovat stav zásobníku | Snadné unit testování |
| **Vedlejší účinky** | Hrozí modifikace vnějších proměnných | Čistá transformace vstupu na výstup |

---
<!-- slide: id8, Intermezzo – omezení „vedlejších efektů“, Core, paradigm -->
## Referenční transparentnost a neměnnost (Immutability)

Dva základní pilíře funkcionálního paradigmatu:

1. **Neměnnost (Immutability)**:
   - Data se po vytvoření nikdy nemění. Místo modifikace kolekce se vytvoří kolekce nová s požadovanou změnou.
   - V Pythonu: `tuple`, `frozenset`, `bytes`, `str`, `@dataclass(frozen=True)`.

2. **Referenční transparentnost (Referential Transparency)**:
   - Volání `f(x)` lze v celém programu bezpečně nahradit jeho vypočtenou hodnotou, aniž by to změnilo chování aplikace.
   - Umožňuje bezpečné paralelizování výpočtů a triviální memoizaci (`@functools.cache`).

---
<!-- slide: id9, „for-in“, Core, pythonic -->
## Náhrada smyčky `for` transformací

V imperativním programování smyčka `for` postupně mutuje cílovou strukturu:

```python
# Imperativní:
vysledky = []
for x in data:
    vysledky.append(transformuj(x))
```

### Funkcionální náhrady:
1. **`map(funkce, data)`**: Vrátí líný iterátor aplikující funkci na prvky za běhu.
2. **List comprehension**: `[transformuj(x) for x in data]` (v CPythonu nejrychlejší a nejčitelnější).

---
<!-- slide: id10, „for-in“ – eliminace nepotřebných proměnných, Tricky, pythonic -->
## Izolace jmenného prostoru (Scope)

V klasickém cyklu `for x in kolekce:` proměnná `x` **přetrvává** v lokálním scope i po skončení smyčky:

```python
for x in "ahoj":
    pass

print(x)  # Vypíše 'j'! Proměnná znečistila lokální jmenný prostor.
```

Oproti tomu v generátorové notaci (Python 3+) má iterační proměnná vlastní izolovaný scope a do okolí neprosakuje:

```python
[c.upper() for c in "ahoj"]
# Proměnná 'c' mimo comprehension neexistuje!
```

---
<!-- slide: id11, „for-in“ – sekvence příkazů, Skip, pythonic -->
## Řetězení akcí bez imperativních bloků

Potřebujeme-li vykonat sekvenci operací nad společnými daty, funkcionální přístup využívá kompozici funkcí nebo aplikaci přes seznam handlerů:

```python
def pipeline(hodnota, *funkce):
    for fn in funkce:
        hodnota = fn(hodnota)
    return hodnota

ocisteno = pipeline(
    "  Python 3.13  ",
    str.strip,
    str.lower,
    lambda s: s.replace(" ", "_")
)
print(ocisteno)  # 'python_3.13'
```

---
<!-- slide: id12, „while“, Core, paradigm -->
## Náhrada smyčky `while` rekurzí

Smyčka `while` typicky vyžaduje počítadlo nebo proměnnou stavu, která se v každé iteraci přepisuje. Ve funkcionálních jazycích je `while` nahrazen rekurzí:

### Imperativní `while`:
```python
n = 1
while n < 5:
    n += 1
```

### Rekurzivní přístup:
```python
def inkrementuj_do_peti(n: int = 1) -> int:
    return n if n >= 5 else inkrementuj_do_peti(n + 1)

print(inkrementuj_do_peti())  # 5
```

---
<!-- slide: id13, Kontinuace I, Core, paradigm -->
## Styl předávání pokračování (CPS - Continuation Passing Style)

V klasickém volání funkce vrátí hodnotu volajícímu (`return`). V **Continuation Passing Style (CPS)** funkce nevrací nic; namísto toho přijímá jako další parametr funkci (*kontinuaci*), které předá svůj výsledek:

```python
# Klasické volání:
def secti(a: int, b: int) -> int:
    return a + b

print(secti(10, 20))

# CPS styl (výsledek je předán přímo do callbacku):
def secti_cps(a: int, b: int, pokracovani):
    pokracovani(a + b)

secti_cps(10, 20, lambda vysledek: print(f"Výsledek: {vysledek}"))
```

Tento vzor tvoří teoretický základ asynchronního zpracování událostí (callbacky v Node.js či event loopy).

---
<!-- slide: id14, Kontinuace II, Tricky, paradigm -->
## Limity rekurze a CPS v Pythonu

Proč se v Pythonu CPS a hluboká rekurze nepoužívají plošně?

1. **Chybějící Tail-Call Optimization (TCO)**:
   - Jazyky jako Haskell nebo Scheme optimalizují koncové rekurzivní volání na skok (*jump*), takže nezvětšují zásobník.
   - Python každé volání ukládá do nového rámce zásobníku (`frame`).
2. **Limit hloubky rekurze**:
   - CPython záměrně omezuje hloubku zásobníku (typicky 1 000 volání, viz `sys.getrecursionlimit()`), aby ochránil proces před pádem na přetečení paměti C zásobníku.

> [!WARNING] Závěr pro Python
> Rekurzi v Pythonu používejte pro větvené struktury (stromy, grafy, JSON) s malou hloubkou. Pro lineární sekvence vždy preferujte iterátory a generátory!

---
<!-- slide: id15, Implementace úplných uzávěrů (Xoltar-toolkit), Skip, newconcept -->
## Historické okénko: Cesta k plnohodnotným uzávěrům

V raných verzích Pythonu (před Pythonem 2.1) neměly vnitřní funkce přístup k proměnným vnější funkce (neexistoval *Enclosing Scope*). Vývojáři tehdy psali pomocné knihovny jako `Xoltar-toolkit`, které manipulovaly se zásobníkovými rámci přes `sys._getframe`.

Dnes je situace vyřešena na úrovni jazyka:
- **PEP 227**: Zavedení statického vnořeného scope (pravidlo LEGB).
- **Klíčové slovo `nonlocal`** (Python 3): Umožňuje zápis do zachycených proměnných v uzávěru.

---
<!-- slide: id16, Variace na monády, WOW, paradigm -->
## Monády a řízení vedlejších efektů

V čistě funkcionálním jazyce (Haskell) se vedlejší efekty (I/O operace, náhodnost, mutace) zapouzdřují do **monád** (např. `IO Monad`).

V Pythonu můžeme vytvořit jednoduchý funkcionální ekvivalent:

```python
def monadic_print(x):
    print(x)
    return x

# Smyčka realizovaná jako jediný rekurzivní lambda výraz:
echo = lambda: monadic_print(input("Zadej text ('q' pro konec): ")) == "q" or echo()

# echo()
```

Funkce `monadic_print` provede tisk a vrátí svou hodnotu, což umožní její další zřetězení v čistém výrazu.

---
<!-- slide: id17, Závěr, Core, paradigm -->
## Shrnutí: Pragmatický funkcionální Python

Funkcionální programování v Pythonu není dogmatem, ale **pragmatickým nástrojem**:

### Co si z funkcionálního přístupu odnést:
1. **Líné vyhodnocování**: Šetřete paměť pomocí generátorů a modulu `itertools`.
2. **Neměnnost dat**: Upřednostňujte neměnné struktury (`tuple`, `frozenset`, frozen dataclasses).
3. **Čisté funkce**: Oddělujte logiku výpočtů od I/O operací a mutací stavu.
4. **Dekorátory a vyšší funkce**: Znovupoužívejte společné aspekty (`functools`).

Python vám dává svobodu zvolit pro každý dílčí problém to nejvhodnější paradigma.
