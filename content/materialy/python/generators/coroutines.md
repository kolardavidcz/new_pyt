<!-- slide: id1, Úvod, Core, newconcept -->
## Úvod do korutin založených na generátorech

Klasické [generátory](generators.md) představují jednosměrný proud dat: kód běží, narazí na `yield`, vygeneruje hodnotu ven spotřebiteli a pozastaví se (*state suspension*).

Již v Pythonu 2.5 (PEP 342) byla tato architektura rozšířena o obousměrnou komunikaci:
- Generátor může nejen hodnoty produkovat, ale také **přijímat data zvenčí** přímo v bodě svého pozastavení.
- Takto zobecněný generátor nazýváme **korutina** (*coroutine*).

> [!NOTE] Historický kontext a moderní `async/await`
> Korutiny založené na generátorech (`yield` / `send()`) tvořily původní základ asynchronního programování a raného frameworku `asyncio` v Pythonu 3.4.
> 
> Od Pythonu 3.5 (PEP 492) byl tento koncept oddělen do **nativních korutin** (`async def` / `await`), princip pozastavování stavu a předávání řízení však zůstává identický!

---
<!-- slide: id2, Mnoho podob „yield“, Core, paradigm -->
## `yield` jako výraz (Expression)

Aby mohl generátor přijímat hodnoty, stal se z klíčového slova `yield` plnohodnotný **výraz** (*expression*):

```python
# 1. Klasický generátor (produkce dat ven):
yield hodnota

# 2. Korutina (příjem dat dovnitř ze send()):
prijato = (yield)

# 3. Obousměrný yield (odešle 'odpoved' a přijme 'vstup'):
vstup = (yield odpoved)
```

Závorky kolem `(yield)` jsou formálně doporučovány, aby nedocházelo k syntaktickým nejasnostem s prioritou operátorů.

---
<!-- slide: id3, „yield“ jako výraz, Skip, resyntax -->
## Syntaktická pravidla pro výraz `yield` (PEP 342)

Výraz `yield` má specifická pravidla v gramatice jazyka:
- Závorky lze vynechat pouze tehdy, pokud je `yield` na pravé straně jednoduchého přiřazení:
  ```python
  x = yield 42   # Platné
  x = yield      # Platné
  ```
- Ve všech složitějších výrazech jsou závorky **povinné**:
  ```python
  x = 10 + (yield 42)  # Platné
  # x = 10 + yield 42  # SyntaxError!

  f((yield))           # Platné
  # f(yield)           # SyntaxError!
  ```

---
<!-- slide: id4, Posílání hodnot do korutiny – „send()“, Tricky, newconcept -->
## Posílání hodnot metodou `.send()`

Pro předání hodnoty do pozastavené korutiny slouží metoda **`.send(hodnota)`**:

```python
def tiskova_korutina():
    print("-> Korutina nastartována, čeká na data...")
    while True:
        zprava = (yield)
        print(f"[PŘIJATO]: {zprava}")

k = tiskova_korutina()

# 1. KROK: Inicializace (Priming)
# Musíme korutinu posunout k prvnímu yield!
k.send(None)  # ekvivalent volání next(k)

# 2. KROK: Odesílání zpráv
k.send("První zpráva")   # [PŘIJATO]: První zpráva
k.send("Druhá zpráva")   # [PŘIJATO]: Druhá zpráva
k.send(42)               # [PŘIJATO]: 42
```

> [!IMPORTANT] Proč je nutný první `next(k)` nebo `send(None)`?
> Kód před prvním `yield` se musí vykonat, aby korutina došla do bodu pozastavení, kde může zprávu převzít. Pokus poslat neprázdnou hodnotu do nenastartované korutiny skončí chybou `TypeError: can't send non-None value to a just-started generator`.

---
<!-- slide: id5, „yield from“ – sem, WOW, pythonic -->
## Delegace toku dat: `yield from` ven

V přednášce o [generátorech](generators.md) jsme viděli operátor `yield from` pro delegování výstupu:

```python
def sub_generator():
    yield "A"
    yield "B"

def hlavni_generator():
    yield from sub_generator()
    yield "C"

print(list(hlavni_generator()))  # ['A', 'B', 'C']
```

Operátor `yield from` vytváří přímý obousměrný tunel mezi volajícím kódem a podřízeným subgenerátorem.

---
<!-- slide: id6, „yield from“ – tam, Tricky, newconcept -->
## Obousměrný tunel: `yield from` dovnitř

Zásadní vlastností `yield from` je, že transparentně přeposílá nejen hodnoty ven, ale i hodnoty zaslané přes `.send()` **dovnitř do subkorutiny**:

```python
def prijemce():
    while True:
        data = (yield)
        print(f"Subkorutina zpracovala: {data}")

def prostrednik(cil):
    # yield from automaticky přeposílá všechny send() hovory do cíle:
    yield from cil

p = prijemce()
p.send(None)  # nastartování cíle

tunel = prostrednik(p)
tunel.send(None)  # nastartování prostředníka

tunel.send("Ahoj přes tunel!")
# Subkorutina zpracovala: Ahoj přes tunel!
```

Bez `yield from` by prostředník musel obsahovat komplikovanou smyčku zachycující `StopIteration` a ručně volat `.send()`.

---
<!-- slide: id7, Korutiny = „obrácené funkce“?, Skip, paradigm -->
## Srovnání: Producent vs. Konzument

V teorii systémů představují generátory a korutiny duální koncepty:

| Koncept | Primární směr dat | Řídicí metoda | Role |
| :--- | :--- | :--- | :--- |
| **Generátor** | Směrem ven z funkce | `next(g)` | **Producent** dat (Pull model) |
| **Korutina** | Směrem dovnitř do funkce | `k.send(val)` | **Konzument** / Filter (Push model) |

Pokus o vytvoření hybridu, který současně odebírá a generuje hodnoty v jediném `yield`, vede k nepřehlednému a obtížně laditelnému stavovému automatu.

---
<!-- slide: id8, Inicializace („priming“) korutiny dekorátorem, WOW, pythonic -->
## Automatický start korutiny: Dekorátor `@coroutine`

Abychom nemuseli po vytvoření každé korutiny ručně volat `next(k)` nebo `k.send(None)`, vytvoříme si inicializační dekorátor (*coroutine priming decorator*):

```python
from functools import wraps
from collections.abc import Callable

def coroutine(func: Callable):
    """Automaticky posune novou instanci korutiny k prvnímu yield."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        gen = func(*args, **kwargs)
        next(gen)  # Provede kód po první (yield)
        return gen
    return wrapper

@coroutine
def sumator():
    celkem = 0
    while True:
        prirustek = (yield)
        celkem += prirustek
        print(f"Průběžný součet: {celkem}")

s = sumator()  # Již připraveno k odběru!
s.send(10)     # Průběžný součet: 10
s.send(5)      # Průběžný součet: 15
```

---
<!-- slide: id9, Výjimky v korutinách, Tricky, newconcept -->
## Vstřikování výjimek: Metoda `.throw()`

Do pozastavené korutiny můžeme poslat nejen data, ale i výjimku pomocí metody **`k.throw(TypVyjimky[, hodnota])`**:

```python
class ResetPocitadla(Exception):
    pass

def pocitadlo():
    n = 0
    while True:
        try:
            krok = (yield n)
            n += krok if krok is not None else 1
        except ResetPocitadla:
            print("-> Počítadlo resetováno na 0!")
            n = 0

p = pocitadlo()
next(p)
print(p.send(5))   # 5
print(p.send(10))  # 15

# Vstříknutí výjimky:
p.throw(ResetPocitadla)  # Vypíše: -> Počítadlo resetováno na 0!
print(p.send(1))   # 1
```

Výjimka se vyvolá přímo v místě aktuálního pozastavení `(yield)`.

---
<!-- slide: id10, Zavření korutiny – „close()“, Core, newconcept -->
## Ukončení korutiny: Metoda `.close()`

Když už korutina nemá dále přijímat data, ukončíme ji voláním **`.close()`**:

```python
def zapisovac_logu():
    try:
        while True:
            radek = (yield)
            print(f"[LOG]: {radek}")
    finally:
        print("-> Bezpečné uzavření logovacího souboru.")

logger = zapisovac_logu()
next(logger)
logger.send("Uživatel přihlášen")

# Explicitní ukončení korutiny:
logger.close()
# Vytiskne: -> Bezpečné uzavření logovacího souboru.

# Další pokus o odeslání dat selže:
# logger.send("Další záznam")  # Vyhodí StopIteration!
```

Metoda `.close()` uvnitř korutiny vyvolá výjimku **`GeneratorExit`**, což zajistí spuštění všech bloků `finally` a kontextových manažerů.

---
<!-- slide: id11, K čemu jsou?, Core, paradigm -->
## Tři tváře `yield` podle Davida Beazleyho

Známý autor David Beazley (*A Curious Course on Coroutines and Concurrency*) formuloval pravidlo, že `yield` plní v Pythonu tři odlišné role, které **by se neměly míchat**:

1. **Iterace (Producent)**: Generuje data pro smyčky `for`.
2. **Konzument (Sink / Pipeline)**: Přijímá zprávy a proudově filtruje data (zpracování logů, síťové pakety).
3. **Kooperativní multitasking (Přerušení / Trap)**: Předává řízení plánovači událostí (*Event Loop*), než dorazí I/O odpověď ze sítě.

Právě třetí bod se stal základem moderního asynchronního světa v Pythonu.

---
<!-- slide: id12, Závěrečná poznámka – obousměrná komunikace, Skip, newconcept -->
## Evoluce k modernímu `async / await`

Historický vývoj korutin v Pythonu:

```mermaid
flowchart LR
    A["Python 2.5: yield / send() (PEP 342)"] --> B["Python 3.3: yield from (PEP 380)"]
    B --> C["Python 3.4: @asyncio.coroutine"]
    C --> D["Python 3.5+: async def / await (PEP 492)"]
    D --> E["Python 3.11+: asyncio.TaskGroup"]
```

### Proč přišlo `async` a `await`?
- Oddělilo klasické iterátory od asynchronních úloh.
- Zamezilo matoucím chybám při nechtěném volání `next()` na korutinu.
- Umožnilo vytvořit specializovaný typ `Coroutine`, asynchronní kontextové manažery (`async with`) i asynchronní iterátory (`async for`).

Dnes se pro asynchronní programování používá výhradně syntaxe **`async def`** a modul `asyncio`.
