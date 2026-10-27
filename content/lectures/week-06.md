<!-- lecture: week-06 title="⭐ Master Přednáška 6: Iterátory, Generátory, Proudové Zpracování & itertools" estMinutes=90 -->

<!-- slide: id=id1 title="Úvod a osnova" tags="Core" diff="basics" -->
# Úvod a osnova

Vítejte v šesté přednášce kurzu programování v jazyce Python. Dnes se zaměříme na jeden z nejmocnějších a nejtypičtějších konceptů moderního Pythonu — **líné vyhodnocování (lazy evaluation)**, iterační protokol, generátory a modul `itertools`.

V kompilovaných jazycích jako C++ nebo Java vyžaduje zpracování velkých datových souborů buď masivní alokaci paměti do polí, nebo ruční implementaci složitých stavových automatů. Python přináší přirozenou abstrakci, která umožňuje zpracovávat neomezené datové toky v konstantní paměti $O(1)$.

### Osnova dnešní 90minutové přednášky:
1. **Iterační paradigma C/Java vs. Python**: Ukazatelová aritmetika a `Iterator<E>` vs. protokol `__iter__` a `__next__`.
2. **Iterační protokol pod kapotou**: Jak CPython provádí cyklus `for`, role výjimky `StopIteration`.
3. **Vlastní iterátory**: Stavová třída implementující metody `__iter__()` a `__next__()`.
4. **Dvouargumentová funkce `iter()`**: Sentinelový vzor pro proudové čtení souborů a síťových socketů.
5. **Generátory a klíčové slovo `yield`**: Přerušení a obnovení běhu funkce, generátorový objekt.
6. **Paměťová analýza $O(1)$**: Zpracování mnohagigabajtových dat bez rizika `MemoryError`.
7. **Generátorové výrazy (Generator Expressions)**: Kompaktní líná alternativa k list comprehensions.
8. **Proudové pipeline (Data Pipelines)**: Řetězení generátorů analogicky k unixovým rourám `|`.
9. **Delegace generátorů `yield from`**: Transparentní kompozice a obousměrné předávání.
10. **Obousměrné generátory jako korutiny**: Metody `.send()`, `.throw()` a `.close()`.
11. **Modul `itertools`**: Nekonečné generátory (`count`, `cycle`, `repeat`), řezání přes `islice`.
12. **Kombinatorika a řetězení**: `chain`, `pairwise` (Python 3.10+), `product`, `permutations`, `combinations`.
13. **Metaprogramování funkcí: Dekorátory**: Anatomie dekorátoru, `@functools.wraps`, měření výkonu a memoizace (`@cache`).
14. **Most k praxi**: Reálné zpracování velkých sekvencí FASTA/FASTQ a most k objektovému modelu v Týdnu 7.

---

<!-- slide: id=id2 title="C/Java vs. Python: Iterační Paradigma" tags="Core" diff="paradigm" -->
# C/Java vs. Python: Iterační Paradigma

V jazyce C probíhá procházení pole přímým indexováním nebo posunem ukazatele:

```c
// C: Explicitní indexace a znalost přesné velikosti pole
int arr[] = {10, 20, 30, 40};
size_t len = sizeof(arr) / sizeof(arr[0]);
for (size_t i = 0; i < len; ++i) {
    printf("%d\n", arr[i]);
}
```

V Javě máme rozhraní `Iterable<T>` a `Iterator<T>` s metodami `hasNext()` a `next()`:

```java
// Java: Stavový objekt vyžadující dotazování hasNext()
List<String> list = List.of("A", "B", "C");
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String val = it.next();
    System.out.println(val);
}
```

### Python: Duck-typing a řízení výjimkou StopIteration
V Pythonu se cyklus `for` neptá dopředu *"Máš další prvek?"*. Místo toho rovnou žádá další hodnotu:

```python
cisla = [10, 20, 30, 40]
for x in cisla:
    print(x)
```

Proč? V dynamickém a paralelním světě je atomické vyzvednutí hodnoty bezpečnější než dvoufázové testování `hasNext()`, kde by se mezi testem a vyzvednutím mohl stav změnit.

---

<!-- slide: id=id3 title="Iterační protokol pod kapotou: Jak funguje for cyklus" tags="Core" diff="paradigm" -->
# Iterační protokol pod kapotou: Jak funguje for cyklus

Když napíšete cyklus `for item in sequence:`, interpretr CPython provede v bajtkódu (`GET_ITER`, `FOR_ITER`) následující přesnou sekvenci:

```python
# Co reálně vykoná for cyklus:
kolekce = [10, 20, 30]

# 1. Získání iterátoru zavoláním vestavěné funkce iter()
# Interně volá kolekce.__iter__()
iterator = iter(kolekce)

# 2. Nekonečná smyčka s voláním next()
while True:
    try:
        # Interně volá iterator.__next__()
        item = next(iterator)
    except StopIteration:
        # Konec sekvence! Výjimka je interně zachycena a cyklus čistě skončí
        break
    
    # Tělo for cyklu
    print(item)
```

> [!IMPORTANT]
> **StopIteration není chyba, ale řídicí signál!**
> V Pythonu je vyvolání výjimky `StopIteration` standardním způsobem oznámení, že sekvence byla vyčerpána. Je to ukázkový příklad filozofie **EAFP** (*Easier to Ask for Forgiveness than Permission*).

---

<!-- slide: id=id4 title="Objekt Iterable vs. Iterator" tags="Core" diff="basics" -->
# Objekt Iterable vs. Iterator

Je zásadní rozlišovat mezi dvěma pojmy:

| Vlastnost | `Iterable` (Iterovatelný objekt) | `Iterator` (Iterátor) |
| :--- | :--- | :--- |
| **Definice** | Objekt schopný vrátit iterátor | Samotný stavový ukazatel procházející data |
| **Metody** | `__iter__() -> Iterator` | `__next__() -> Hodnota` a `__iter__() -> self` |
| **Příklady** | `list`, `dict`, `str`, `set`, `tuple`, `range` | Výsledek `iter(list)`, generátor, souborový deskriptor |
| **Počet průchodů** | Lze procházet opakovaně | **Pouze jednou!** Po vyčerpání je prázdný |

```python
cisla = [1, 2, 3]  # Iterable

it1 = iter(cisla)  # Iterator
it2 = iter(cisla)  # Nezávislý druhý Iterator

print(next(it1))  # 1
print(next(it1))  # 2
print(next(it2))  # 1 (it2 má vlastní nezávislý stav!)

print(list(it1))  # [3] (zbývající prvek)
print(list(it1))  # []  (it1 je definitivně vyčerpán!)
```

> [!NOTE]
> Každý `Iterator` je zároveň `Iterable`, protože jeho metoda `__iter__()` vrací `self`. Díky tomu můžete předat samotný iterátor do cyklu `for`.

---

<!-- slide: id=id5 title="Implementace vlastního iterátoru třídou" tags="Core" diff="resyntax" -->
# Implementace vlastního iterátoru třídou

Vytvořme vlastní třídu `Odpocet`, která generuje sestupnou číselnou řadu bez alokace seznamu:

```python
class Odpocet:
    """Iterátor generující sestupnou řadu celých čísel od start do 1."""
    
    def __init__(self, start: int) -> None:
        self.aktualni: int = start

    def __iter__(self) -> "Odpocet":
        # Iterátor musí v metodě __iter__ vrátit sám sebe
        return self

    def __next__(self) -> int:
        if self.aktualni <= 0:
            # Signál pro ukončení iterace
            raise StopIteration
        
        hodnota = self.aktualni
        self.aktualni -= 1
        return hodnota

# Použití ve for cyklu:
odpocet = Odpocet(3)
for cislo in odpocet:
    print(cislo)
# Výstup: 3, 2, 1
```

Všimněte si: Třída si musí v instančních proměnných `self.aktualni` manuálně ukládat stav mezi jednotlivými voláními `__next__()`.

---

<!-- slide: id=id6 title="Dvouargumentová funkce iter() a Sentinel vzor" tags="Core" diff="pythonic" -->
# Dvouargumentová funkce iter() a Sentinel vzor

Málokdo ví, že vestavěná funkce `iter()` má dvě odlišné podoby:
1. `iter(iterable)`: Standardní získání iterátoru.
2. `iter(callable, sentinel)`: **Zázrak pro čtení datových proudů.**

CPython bude opakovaně volat funkci `callable()` bez parametrů, dokud vrácená hodnota není rovna hodnotě `sentinel`. Tehdy automaticky vyvolá `StopIteration`.

### Příklad: Čtení binárního souboru po 64KB blocích

```python
def cti_velky_soubor(cesta: str, velikost_bloku: int = 65536):
    with open(cesta, "rb") as f:
        # iter(f.read, b"") bude volat f.read(velikost_bloku)
        # a zastaví se, jakmile read vrátí prázdný bajtový řetězec b"" (EOF)
        cteni_bloku = iter(lambda: f.read(velikost_bloku), b"")
        for blok in cteni_bloku:
            zpracuj_blok(blok)
```

Tento zápis kompletně eliminuje ošklivé konstrukce `while True: data = f.read(); if not data: break`.

---

<!-- slide: id=id7 title="Generátory a klíčové slovo yield" tags="Core" diff="newconcept" -->
# Generátory a klíčové slovo yield

Psaní tříd s metodami `__iter__` a `__next__` a ruční správou stavu je zdlouhavé. Python proto přichází s revolučním konceptem: **Generátory**.

> [!IMPORTANT]
> **Generátorová funkce** je jakákoliv funkce, v jejímž těle se vyskytuje klíčové slovo **`yield`**.

```python
def odpocet_generator(start: int):
    print("--> Start generátoru")
    aktualni = start
    while aktualni > 0:
        yield aktualni  # Pozastaví běh a vrátí hodnotu volajícímu
        aktualni -= 1
    print("--> Konec generátoru")

# Volání funkce NESPUSTÍ kód! Pouze vrátí generator object:
gen = odpocet_generator(3)
print(gen)  # <generator object odpocet_generator at 0x7f8...>

print(next(gen))  # Vypíše: '--> Start generátoru' a vrátí: 3
print(next(gen))  # Vrátí: 2
print(next(gen))  # Vrátí: 1
# next(gen)       # Vypíše: '--> Konec generátoru' a vyvolá StopIteration!
```

---

<!-- slide: id=id8 title="Stavový automat generátoru: Freeze Frame stacku" tags="Core" diff="paradigm" -->
# Stavový automat generátoru: Freeze Frame stacku

Co se děje uvnitř CPython interpretu při vykonání `yield`?

```text
Volající                       Generátor (PyGenObject)
   │                                      │
   ├─────── gen = odpocet(3) ────────────>│ Vytvoří frame na haldě (stav: GEN_CREATED)
   │                                      │ (Kód zatím neběží!)
   ├─────── next(gen) ───────────────────>│ Spustí běh až k prvnímu yield (GEN_RUNNING)
   │<────── yield 3 ──────────────────────┤ Zmrazí stack frame (GEN_SUSPENDED)
   │                                      │ (Uchová lokální proměnné, program counter)
   ├─────── next(gen) ───────────────────>│ Obnoví běh z místa za yieldem (GEN_RUNNING)
   │<────── yield 2 ──────────────────────┤ Opět zmrazí stack frame (GEN_SUSPENDED)
   │                                      │
   ├─────── next(gen) ───────────────────>│ Dokončí funkci / narazí na return
   │<────── StopIteration ────────────────┤ Stav: GEN_CLOSED (frame je dealokován)
```

Generátor se chová jako **lehká korutina**: Stack frame se nezruší po návratu hodnoty (jako u `return`), ale zůstává uložený na haldě v pozastaveném stavu!

---

<!-- slide: id=id9 title="Paměťová analýza O(1) vs. O(n)" tags="Core" diff="basics" -->
# Paměťová analýza O(1) vs. O(n)

Představte si, že máte logovací soubor serveru o velikosti **20 GB** a potřebujete najít všechny řádky obsahující `"ERROR 500"`.

### Špatně: Načtení celého souboru do paměti ($O(n)$)
```python
# readlines() nebo list(f) alokuje všechny řádky v RAM:
def spatne_hledani(cesta: str) -> list[str]:
    with open(cesta, "r", encoding="utf-8") as f:
        radky = f.readlines()  # CHYBA: 20 GB v paměti -> MemoryError / pád serveru!
    return [r for r in radky if "ERROR 500" in r]
```

### Správně: Proudové zpracování generátorem ($O(1)$)
```python
def streamuj_chyby(cesta: str):
    # Souborový objekt je sám o sobě generátor řádků!
    with open(cesta, "r", encoding="utf-8") as f:
        for radek in f:  # V paměti je v každý okamžik pouze JEDINÝ řádek (~1 KB)
            if "ERROR 500" in radek:
                yield radek.strip()

# Paměťová spotřeba: konstantních ~8 MB pro jakkoliv velký soubor!
for chyba in streamuj_chyby("server.log"):
    odesli_alert(chyba)
```

---

<!-- slide: id=id10 title="Generátorové výrazy (Generator Expressions)" tags="Core" diff="basics" -->
# Generátorové výrazy (Generator Expressions)

V přednášce 4 jsme se seznámili s list comprehensions `[x for x in data]`. Co se stane, když hranaté závorky nahradíte kulatými?

```python
# 1. List Comprehension: Vytvoří a naplní celý seznam v RAM okamžitě
seznam_kvadratu = [x**2 for x in range(1_000_000)]
print(type(seznam_kvadratu))  # <class 'list'>
# Paměť: cca 8.5 MB RAM

# 2. Generator Expression: Nevytvoří žádná data, pouze připraví generátor!
generator_kvadratu = (x**2 for x in range(1_000_000))
print(type(generator_kvadratu))  # <class 'generator'>
# Paměť: cca 120 bajtů RAM!
```

### Přímé předání do agregačních funkcí:
Pokud je generátorový výraz jediným argumentem funkce, nemusíte psát dvojité závorky:

```python
# Syntaktický cukr: sum((x**2 for x in cisla)) -> sum(x**2 for x in cisla)
celkovy_soucet = sum(x**2 for x in range(1_000_000))
print(celkovy_soucet)  # 333332833333500000

maximalni_delka = max(len(slovo) for slovo in ["jablko", "hruska", "mandarinka"])
```

---

<!-- slide: id=id11 title="Proudové Pipeline: Řetězení generátorů" tags="Core" diff="pythonic" -->
# Proudové Pipeline: Řetězení generátorů

Jednou z nejkrásnějších vlastností generátorů je možnost jejich skládání do **datových rour** (*Pipelines*). Každý krok zpracuje prvek a okamžitě ho předá dalšímu kroku:

```python
from typing import Iterator

def cti_radky(cesta: str) -> Iterator[str]:
    with open(cesta, "r", encoding="utf-8") as f:
        for radek in f:
            yield radek

def filtruj_komentare(radky: Iterator[str]) -> Iterator[str]:
    for r in radky:
        clean = r.strip()
        if clean and not clean.startswith("#"):
            yield clean

def parsuj_cisla(radky: Iterator[str]) -> Iterator[float]:
    for r in radky:
        yield float(r.split(",")[1])

# Sestavení pipeline (žádná data se zatím nezpracovala!):
raw = cti_radky("mereni.csv")
bez_komentaru = filtruj_komentare(raw)
cisla = parsuj_cisla(bez_komentaru)

# Teprve zde začne proudové protékání dat prvek po prvku:
prumer = sum(cisla)
```

---

<!-- slide: id=id12 title="Delegace generátorů: yield from" tags="Core" diff="newconcept" -->
# Delegace generátorů: yield from

Pokud generátor potřebuje delegovat generování hodnot na jiný iterátor nebo vnořený generátor, dříve se musela psát smyčka:

```python
# Zastaralý přístup:
def sloucit_stary(seznamy):
    for sublist in seznamy:
        for prvek in sublist:
            yield prvek
```

Od Pythonu 3.3 máme syntaxi **`yield from`**:

```python
# Moderní přístup s yield from:
def sloucit_moderni(seznamy):
    for sublist in seznamy:
        yield from sublist  # Deleguje iteraci přímo na sublist
```

### Rekurzivní procházení stromových struktur:
```python
def projdi_strom(uzel):
    yield uzel.hodnota
    for dite in uzel.deti:
        yield from projdi_strom(dite)
```

`yield from` navíc automaticky navazuje obousměrnou komunikaci pro metody `.send()` a `.throw()` mezi vnějším volajícím a vnitřním generátorem!

---

<!-- slide: id=id13 title="Obousměrné generátory: Metoda .send()" tags="Core" diff="tricky" -->
# Obousměrné generátory: Metoda .send()

Generátor nemusí data pouze produkovat, ale může je také **přijímat jako konzument**. Výraz `yield` může stát na pravé straně přiřazení:

```python
def klouzavy_prumer():
    """Generátor počítající kumulativní průměr zasílaných hodnot."""
    celkem = 0.0
    pocet = 0
    prumer = 0.0
    while True:
        # yield prumer odešle průměr ven a pozastaví se;
        # .send(hodnota) probudí generátor a dosadí hodnotu do proměnné nova_hodnota
        nova_hodnota = yield prumer
        if nova_hodnota is None:
            break
        celkem += nova_hodnota
        pocet += 1
        prumer = celkem / pocet

# Použití:
prumerovac = klouzavy_prumer()

# 1. Nastartování (Prime) generátoru k prvnímu yield:
next(prumerovac)  # nebo prumerovac.send(None) -> vrátí 0.0

# 2. Zasílání hodnot:
print(prumerovac.send(10))  # 10.0
print(prumerovac.send(20))  # 15.0
print(prumerovac.send(30))  # 20.0
```

> [!NOTE]
> Tento princip tvořil historický základ pro asynchronní korutiny v Pythonu před zavedením `async/await`.

---

<!-- slide: id=id14 title="Ukončení a výjimky v generátoru: .close() a .throw()" tags="Core" diff="tricky" -->
# Ukončení a výjimky v generátoru: .close() a .throw()

Generátor má vlastní metody pro řízení životního cyklu:

### 1. `gen.close()`:
Vyvolá uvnitř pozastaveného generátoru speciální výjimku `GeneratorExit`. Generátor by měl uklidit zdroje (bloky `finally`) a skončit.

```python
def otevri_proud():
    try:
        while True:
            yield "data"
    finally:
        print("Proud byl bezpečně uzavřen a prostředky uvolněny!")

g = otevri_proud()
next(g)
g.close()  # Vypíše: 'Proud byl bezpečně uzavřen...'
```

### 2. `gen.throw(typ_vyjimky)`:
Vyvolá zadanou výjimku v místě, kde je generátor právě pozastaven. To umožňuje generátoru zareagovat na externí chybu (např. timeout sítě).

---

<!-- slide: id=id15 title="Standardní knihovna itertools: Úvod" tags="Core" diff="basics" -->
# Standardní knihovna itertools: Úvod

Modul **`itertools`** je klenotem standardní knihovny Pythonu. Poskytuje sadu rychlých, v C napsaných stavebních bloků pro efektivní iterování.

Filozofie modulu `itertools`:
1. Všechny funkce pracují **líně** (vrací iterátory).
2. Mají paměťovou náročnost $O(1)$.
3. Jsou optimalizované na úrovni CPython C-API a běží výrazně rychleji než čistě pythoní ekvivalenty.

Funkce v `itertools` dělíme do tří kategorií:
- **Nekonečné iterátory**: `count()`, `cycle()`, `repeat()`
- **Ukončovací a výběrové iterátory**: `islice()`, `takewhile()`, `dropwhile()`, `filterfalse()`
- **Kombinatorické generátory**: `product()`, `permutations()`, `combinations()`, `combinations_with_replacement()`

```python
import itertools
```

---

<!-- slide: id=id16 title="Nekonečné iterátory: count, cycle, repeat" tags="Core" diff="basics" -->
# Nekonečné iterátory: count, cycle, repeat

Někdy potřebujeme generovat posloupnost, jejíž konec předem neznáme:

### 1. `itertools.count(start=0, step=1)`
Nekonečné počítadlo (obdoba `range`, ale bez horního limitu):
```python
import itertools

for i in itertools.count(start=100, step=5):
    if i > 120:
        break
    print(i, end=" ")
# Výstup: 100 105 110 115 120
```

### 2. `itertools.cycle(iterable)`
Nekonečně cyklí zadanou sekvenci dokola:
```python
hraci = itertools.cycle(["Hráč 1", "Hráč 2", "Hráč 3"])
for kolo in range(5):
    print(f"Kolo {kolo + 1}: Na tahu je {next(hraci)}")
```

### 3. `itertools.repeat(obj, times=None)`
Vrací stále tentýž objekt (často se používá s `map()` nebo `zip()`):
```python
mocniny = list(map(pow, range(5), itertools.repeat(2)))
# [0**2, 1**2, 2**2, 3**2, 4**2] -> [0, 1, 4, 9, 16]
```

---

<!-- slide: id=id17 title="Výběr a řezání iterátorů: islice, takewhile, dropwhile" tags="Core" diff="pythonic" -->
# Výběr a řezání iterátorů: islice, takewhile, dropwhile

Běžný slicing `kolekce[start:stop:step]` funguje pouze na sekvencích (`list`, `str`), které podporují indexaci. Na generátorech selže s `TypeError`!

### `itertools.islice(iterable, [start], stop, [step])`:
Líný slice fungující nad jakýmkoliv iterátorem bez jeho převodu na seznam:

```python
import itertools

def velka_rada():
    for x in itertools.count(1):
        yield x**2

# Získáme prvky od indexu 10 do indexu 15:
vyber = itertools.islice(velka_rada(), 10, 15)
print(list(vyber))  # [121, 144, 169, 196, 225]
```

### `takewhile` a `dropwhile`:
- `takewhile(predikat, data)`: Bere prvky, dokud platí predikát; při prvním `False` okamžitě skončí.
- `dropwhile(predikat, data)`: Zahazuje prvky, dokud platí predikát; jakmile padne `False`, začne vracet všechny zbývající prvky.

```python
data = [1, 3, 5, 8, 9, 2, 4]
list(itertools.takewhile(lambda x: x < 7, data))  # [1, 3, 5] (zastaví se na 8)
list(itertools.dropwhile(lambda x: x < 7, data))  # [8, 9, 2, 4]
```

---

<!-- slide: id=id18 title="Sdružování a řetězení: itertools.chain" tags="Core" diff="pythonic" -->
# Sdružování a řetězení: itertools.chain

Potřebujete projít několik různých kolekcí postupně za sebou?

### Špatně: Sčítání kolekcí operátorem +
```python
list1 = [1, 2, 3]
list2 = [4, 5, 6]
# Vytvoří TŘETÍ seznam v paměti a zkopíruje do něj všechny prvky:
vysledek = list1 + list2  # O(n + m) paměti navíc!
```

### Správně: itertools.chain
```python
import itertools

list1 = [1, 2, 3]
list2 = [4, 5, 6]
mnozina = {7, 8}

# Žádná alokace paměti! Prochází prvky sekvenčně:
for prvek in itertools.chain(list1, list2, mnozina):
    print(prvek, end=" ")
# Výstup: 1 2 3 4 5 6 7 8
```

### `itertools.chain.from_iterable()`:
Pokud máte seznam seznamů nebo generátor vracející kolekce:
```python
matice = [[1, 2], [3, 4], [5, 6]]
plochy_seznam = list(itertools.chain.from_iterable(matice))
# [1, 2, 3, 4, 5, 6]
```

---

<!-- slide: id=id19 title="Dvojice a sousedé: itertools.pairwise (Python 3.10+)" tags="Core" diff="newconcept" -->
# Dvojice a sousedé: itertools.pairwise (Python 3.10+)

Velmi častá programátorská úloha: Procházet sousední dvojice prvků $(x_i, x_{i+1})$, například pro výpočet rozdílů, rychlosti nebo vzdáleností.

### Starý těžkopádný způsob:
```python
body = [10, 15, 13, 22, 28]
# Ošklivé indexování s rizikem IndexError:
rozdily = [body[i+1] - body[i] for i in range(len(body) - 1)]
```

### Moderní Python 3.10+: `itertools.pairwise`
```python
import itertools

body = [10, 15, 13, 22, 28]

for predchozi, aktualni in itertools.pairwise(body):
    diference = aktualni - predchozi
    print(f"Změna z {predchozi} na {aktualni}: {diference:+d}")

# Výstup:
# Změna z 10 na 15: +5
# Změna z 15 na 13: -2
# Změna z 13 na 22: +9
# Změna z 22 na 28: +6
```

Funguje i na generátorech a proudech dat bez nutnosti znát délku nebo ukládat prvky do pole!

---

<!-- slide: id=id20 title="Kombinatorika: product, permutations, combinations" tags="Core" diff="pythonic" -->
# Kombinatorika: product, permutations, combinations

Psaní vnořených cyklů pro generování kombinací je náchylné k chybám. `itertools` nabízí optimalizovaná řešení:

### 1. Kartézský součin: `itertools.product(*iterables, repeat=1)`
Nahrazuje hluboko vnořené cykly:
```python
import itertools

barvy = ["červená", "modrá"]
velikosti = ["S", "M", "L"]

for b, v in itertools.product(barvy, velikosti):
    print(f"{b}-{v}", end=" | ")
# červená-S | červená-M | červená-L | modrá-S | modrá-M | modrá-L |
```

### 2. Permutace: `itertools.permutations(iterable, r=None)`
Záleží na pořadí prvků:
```python
list(itertools.permutations("ABC", 2))
# [('A', 'B'), ('A', 'C'), ('B', 'A'), ('B', 'C'), ('C', 'A'), ('C', 'B')]
```

### 3. Kombinace: `itertools.combinations(iterable, r)`
Nezáleží na pořadí (bez opakování):
```python
list(itertools.combinations("ABC", 2))
# [('A', 'B'), ('A', 'C'), ('B', 'C')]
```

---

<!-- slide: id=id21 title="Seskupování dat: itertools.groupby a past s řazením" tags="Core" diff="tricky" -->
# Seskupování dat: itertools.groupby a past s řazením

Funkce `itertools.groupby(iterable, key=None)` seskupuje po sobě jdoucí prvky se stejným klíčem.

> [!CAUTION]
> **Kritická past `itertools.groupby`:**
> Na rozdíl od SQL `GROUP BY` seskupuje `itertools.groupby` **pouze po sobě jdoucí prvky**! Pokud data nejsou předem seřazena podle klíče, vytvoří se více oddělených skupin pro stejnou hodnotu!

```python
import itertools

studenti = [
    {"jmeno": "Alice", "rocnik": 2},
    {"jmeno": "Bob", "rocnik": 1},
    {"jmeno": "Cyril", "rocnik": 2},
]

# CHYBA: Neuspořádaná data vytvoří ročník 2 dvakrát!
# SPRÁVNĚ: Nejprve data seřadíme podle klíče:
studenti.sort(key=lambda s: s["rocnik"])

for rocnik, skupina in itertools.groupby(studenti, key=lambda s: s["rocnik"]):
    jmena = [s["jmeno"] for s in skupina]
    print(f"Ročník {rocnik}: {jmena}")

# Výstup:
# Ročník 1: ['Bob']
# Ročník 2: ['Alice', 'Cyril']
```

---

<!-- slide: id=id22 title="Funkcionální Metaprogramování: Anatomie dekorátoru" tags="Core" diff="newconcept" -->
# Funkcionální Metaprogramování: Anatomie dekorátoru

V předchozí přednášce jsme viděli, že funkce jsou objekty první kategorie. Dekorátor je syntaktický cukr, který tuto vlastnost využívá na maximum:

> [!NOTE]
> **Dekorátor** je funkce, která přijme jinou funkci jako argument, obalí ji dodatečnou logikou a vrátí novou (upravenou) funkci.

Zápis se zavináčem `@dekorator`:
```python
@muj_dekorator
def pozdrav(jmeno):
    return f"Ahoj {jmeno}"

# Je přesným ekvivalentem zápisu:
# pozdrav = muj_dekorator(pozdrav)
```

### Základní šablona dekorátoru s `functools.wraps`:
```python
import functools
from typing import Callable, Any

def muj_dekorator(func: Callable) -> Callable:
    # wraps zachová jméno, docstring a anotace původní funkce!
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print("[LOG] Před voláním funkce")
        vysledek = func(*args, **kwargs)
        print("[LOG] Po volání funkce")
        return vysledek
    return wrapper
```

---

<!-- slide: id=id23 title="Praktický dekorátor: Měření času běhu (@timer)" tags="Core" diff="pythonic" -->
# Praktický dekorátor: Měření času běhu (@timer)

Vytvořme produkční dekorátor pro přesné profilování libovolné funkce:

```python
import time
import functools
from typing import Callable, Any

def timer(func: Callable) -> Callable:
    """Měří čas běhu ozdobené funkce a vypíše výsledek v milisekundách."""
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start = time.perf_counter()
        vysledek = func(*args, **kwargs)
        konec = time.perf_counter()
        trvani_ms = (konec - start) * 1000
        print(f"⏱️ Funkce '{func.__name__}' trvala: {trvani_ms:.3f} ms")
        return vysledek
    return wrapper

@timer
def spocitej_faktorial(n: int) -> int:
    import math
    return math.factorial(n)

vysledek = spocitej_faktorial(50_000)
# Vypíše např.: ⏱️ Funkce 'spocitej_faktorial' trvala: 42.150 ms
```

Díky `*args` a `**kwargs` je dekorátor plně univerzální pro jakoukoliv signaturu funkce.

---

<!-- slide: id=id24 title="Parametrizované dekorátory: Tříúrovňové uzávěry" tags="Core" diff="tricky" -->
# Parametrizované dekorátory: Tříúrovňové uzávěry

Co když chceme dekorátoru předávat konfigurační argumenty, např. `@opakuj(pokusu=3, zpozdeni=0.5)`?

Dekorátor s parametry není samotný dekorátor, ale **továrna na dekorátory** (*decorator factory*). Vyžaduje tři úrovně vnoření funkcí:

```python
import time
import functools
from typing import Callable, Any

def opakuj(pokusu: int = 3, zpozdeni: float = 0.5):
    """Dekorátor, který při selhání zopakuje volání funkce zadaný počet krát."""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            posledni_chyba = None
            for pokus in range(1, pokusu + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    posledni_chyba = e
                    print(f"Pokus {pokus}/{pokusu} selhal: {e}. Čekám {zpozdeni} s...")
                    time.sleep(zpozdeni)
            raise RuntimeError(f"Všech {pokusu} pokusů selhalo!") from posledni_chyba
        return wrapper
    return decorator

@opakuj(pokusu=3, zpozdeni=1.0)
def stahni_data(url: str):
    # Simulace síťového volání
    ...
```

---

<!-- slide: id=id25 title="Automatická memoizace: functools.cache a lru_cache" tags="Core" diff="pythonic" -->
# Automatická memoizace: functools.cache a lru_cache

Výpočet Fibonacciho posloupnosti naivní rekurzí má exponenciální složitost $O(2^n)$:

```python
# Bez memoizace: fib(35) trvá několik sekund, fib(100) nedoběhne nikdy!
def fib_pomaly(n: int) -> int:
    if n < 2:
        return n
    return fib_pomaly(n - 1) + fib_pomaly(n - 2)
```

Standardní knihovna Pythonu nabízí hotový memoizační dekorátor:
- **`@functools.cache`** (Python 3.9+): Neomezená hešovací mezipaměť (rychlejší).
- **`@functools.lru_cache(maxsize=128)`**: Least-Recently-Used cache s omezenou velikostí.

```python
import functools

@functools.cache
def fib_bleskovy(n: int) -> int:
    if n < 2:
        return n
    return fib_bleskovy(n - 1) + fib_bleskovy(n - 2)

print(fib_bleskovy(100))  # 354224848179261915075 (okamžitý výsledek v O(n) čase!)
print(fib_bleskovy.cache_info())
# CacheInfo(hits=98, misses=101, maxsize=None, currsize=101)
```

> [!IMPORTANT]
> Argumenty cachované funkce **musí být hešovatelné** (`hash(arg)`), protože slouží jako klíče interního slovníku!

---

<!-- slide: id=id26 title="Případová studie: Proudové zpracování FASTA souborů" tags="Core" diff="pythonic" -->
# Případová studie: Proudové zpracování FASTA souborů

V bioinformatice a chemické informatice mají soubory se sekvencemi DNA/proteinů (formát FASTA) běžně desítky gigabajtů. Každý záznam začíná hlavičkou `>ID` následovanou řádky nukleotidů.

Napišme elegantní generátorový parser:

```python
from typing import Iterator

def parsuj_fasta(cesta: str) -> Iterator[tuple[str, str]]:
    """Proudový parser FASTA souborů s paměťovou složitostí O(1)."""
    aktualni_hlavicka = None
    buffer_sekvence = []
    
    with open(cesta, "r", encoding="utf-8") as f:
        for radek in f:
            radek = radek.strip()
            if not radek:
                continue
            if radek.startswith(">"):
                if aktualni_hlavicka is not None:
                    yield aktualni_hlavicka, "".join(buffer_sekvence)
                    buffer_sekvence.clear()
                aktualni_hlavicka = radek[1:]  # Odstranění '>'
            else:
                buffer_sekvence.append(radek)
        
        # Vrácení posledního záznamu po dosažení EOF
        if aktualni_hlavicka is not None:
            yield aktualni_hlavicka, "".join(buffer_sekvence)

# Použití ve spojení s itertools:
# for header, seq in itertools.islice(parsuj_fasta("velky_genom.fasta"), 10):
#     print(f"ID: {header[:20]} | Délka sekvence: {len(seq)} bp")
```

---

<!-- slide: id=id27 title="Shrnutí a most k Týdnu 7 (OOP a Datový Model)" tags="Core" diff="basics" -->
# Shrnutí a most k Týdnu 7 (OOP a Datový Model)

Dnes jsme ovládli jeden z nejdůležitějších pilířů idiomatického Pythonu:

### Klíčové poznatky dnešní přednášky:
1. **Iterační protokol**: `iter(obj)` volá `__iter__()`, `next(it)` volá `__next__()`, ukončení řídí `StopIteration`.
2. **Generátory s `yield`**: Zmrazují stack frame na haldě a umožňují psát stavové iterátory bez třídní režie.
3. **Paměťová složitost $O(1)$**: Zpracování neomezených datových proudů a souborů bez rizika vyčerpání paměti RAM.
4. **Modul `itertools`**: Standardní rychlé C-iterátory pro řezání (`islice`), dvojice (`pairwise`), kombinatoriku a řetězení.
5. **Dekorátory**: Obalování funkcí, zachování metadat přes `@functools.wraps` a memoizace pomocí `@functools.cache`.

```text
Evoluce abstrakcí v kurzu:
Týdny 1-4: Datové typy & Hešovací tabulky
Týden 5: Funkce, Closures & Moderní Typový systém (PEP 695)
Týden 6: Líné toky dat (Iterátory, Generátory & itertools) ──┐
                                                            ▼
Příští týden (Týden 7): Objektově Orientované Programování & Python Data Model
- Třídy a paměťový layout PyObject
- Instance slovník __dict__ vs. paměťová optimalizace __slots__
- Dunder metody (__repr__, __len__, __getitem__, __matmul__)
- Kontextové manažery (with protokol)
- Cesta k Milestone 2 (Maticový datový model)
```
