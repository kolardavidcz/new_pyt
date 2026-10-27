<!-- slide: id1, Úvod, Core, basics -->
## Úvod do generátorové notace (Comprehensions)

Jednou z nejvýraznějších a nejoblíbenějších syntaktických konstrukcí v Pythonu je **generátorová notace** (*Comprehensions*):
- Umožňuje deklarativně a na jediném řádku vytvořit novou kolekci z existujícího iterovatelného objektu.
- Nahrazuje imperativní vytváření prázdného kontejneru a postupné plnění pomocí smyček a `.append()`.
- Je výrazně rychlejší než manuální smyčka `for`, protože vnitřní iterace a alokace probíhají přímo v optimalizovaném C jádře interpretu (pomocí specializované bytecode instrukce `LIST_APPEND`).

Python podporuje čtyři formy této notace:
1. **List comprehension**: `[výraz for x in iter]` $\rightarrow$ vytvoří nový `list`.
2. **Set comprehension**: `{výraz for x in iter}` $\rightarrow$ vytvoří novou množinu `set`.
3. **Dict comprehension**: `{klíč: hodnota for x in iter}` $\rightarrow$ vytvoří nový slovník `dict`.
4. **Generator expression**: `(výraz for x in iter)` $\rightarrow$ vytvoří líný generátor `generator`.

---
<!-- slide: id2, Souvislost s cyklem, Core, pythonic -->
## Souvislost s imperativní smyčkou

Generátorová notace je přímým deklarativním přepisem klasické smyčky `for`:

### Imperativní přístup (C / Java styl):
```python
vysledek = []
for prvek in sekvence:
    if podminka(prvek):
        vysledek.append(transformace(prvek))
```

### Pythonic deklarativní ekvivalent:
```python
vysledek = [transformace(prvek) for prvek in sekvence if podminka(prvek)]
```

> [!NOTE] Čitelnost a struktura
> Notace se čte téměř jako přirozený jazyk: *„Vezmi transformaci prvku pro každý prvek v sekvenci, pokud prvek splňuje podmínku.“*

---
<!-- slide: id3, Generátor seznamu, Core, pythonic -->
## Generátor seznamu (List Comprehension)

Mějme základní vstupní sekvenci čísel:
```python
cisla = list(range(10))  # [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

Pomocí list comprehension můžeme aplikovat transformaci na každý prvek:

```python
# 1. Mělká kopie prvků (identita):
kopie = [x for x in cisla]

# 2. Posun všech hodnot o 3:
posunuto = [x + 3 for x in cisla]
# [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

# 3. Druhé mocniny:
ctverce = [x ** 2 for x in cisla]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

Vstupem může být jakýkoliv `Iterable` (seznam, n-tice, řetězec, množina, soubor, generátor) a výstupem je vždy nový `list`.

---
<!-- slide: id4, Generátor seznamu – podmínka, Core, pythonic -->
## Filtrování prvků pomocí podmínky `if`

Do generátorové notace můžeme přidat filtrační klauzuli `if`:

```python
cisla = list(range(10))

# Pouze sudá čísla:
suda = [x for x in cisla if x % 2 == 0]
# [0, 2, 4, 6, 8]

# Čísla dávající po dělení 4 zbytek 1:
mod4 = [x for x in cisla if x % 4 == 1]
# [1, 5, 9]

# Normalizace a filtrace textů:
slova = ["Python", "  ", "Typing", "", "Modern", "AI"]
platna = [s.strip().lower() for s in slova if s.strip()]
# ['python', 'typing', 'modern', 'ai']
```

> [!IMPORTANT] Pozor na rozdíl mezi `if` na konci a ternárním operátorem `if-else` na začátku!
> - Filtrační podmínka na konci: `[x for x in xs if x > 0]` (vybírá podmnožinu).
> - Ternární transformace na začátku: `[x if x > 0 else 0 for x in xs]` (nemění počet prvků, mění jejich hodnotu).

---
<!-- slide: id5, Generátor seznamu – netriviální transformace, Core, pythonic -->
## Složitější transformační výrazy

Výraz na začátku generátoru nemusí být pouze prostá aritmetika, ale libovolný Python výraz (konstrukce objektu, volání funkce, n-tice):

```python
cisla = list(range(10))

# Dvojice (číslo, jeho textová reprezentace):
pary = [(x, str(x)) for x in cisla]
# [(0, '0'), (1, '1'), ..., (9, '9')]

# Kombinace netriviální transformace s filtrem:
licha_mapa = [(x, f"Liché #{x}") for x in cisla if x % 2 != 0]
# [(1, 'Liché #1'), (3, 'Liché #3'), (5, 'Liché #5'), (7, 'Liché #7'), (9, 'Liché #9')]
```

V moderním Pythonu (3.8+) můžeme uvnitř generátoru použít i Walrus operátor `:=`, pokud náročný výpočet potřebujeme jak ve filtru, tak ve výsledném výrazu:

```python
def drahy_vypocet(x: int) -> int:
    return (x * 37) % 13

# Spočítá drahy_vypocet(x) pouze jednou na prvek:
vysledky = [y for x in cisla if (y := drahy_vypocet(x)) > 5]
```

---
<!-- slide: id6, Formalizace, Skip, basics -->
## Syntaktický předpis generátorové notace

Základní anatomie generátoru seznamu:

$$\Large \mathbf{[} \underbrace{\text{výraz}}_{\text{transformace}} \;\; \mathbf{for} \;\; \underbrace{\text{proměnná}}_{\text{cíl}} \;\; \mathbf{in} \;\; \underbrace{\text{iterovatelný\_objekt}}_{\text{zdroj}} \;\; [\mathbf{if} \;\; \underbrace{\text{podmínka}}_{\text{filtr}}] \mathbf{]}$$

### Klíčová pravidla:
1. **Scope proměnné**: V Pythonu 3 má iterační proměnná v generátoru vlastní lokální scope. „Neprosakuje“ do okolního kódu ani nepřepisuje stejnojmenné vnější proměnné.
2. **Kdy NEPOUŽÍVAT**: Pokud tělo smyčky vyvolává vedlejší efekty (např. zápis do souboru, volání `print`), nepoužívejte comprehension! Použijte standardní smyčku `for`.
3. **Pravidlo tří řádků**: Pokud se comprehension nevejde na jeden řádek a je těžko čitelný, rozepište jej na více řádků nebo použijte klasický cyklus.

---
<!-- slide: id7, Poznámka, WOW, newconcept -->
## Generátorový výraz (Generator Expression)

Nahradíme-li hranaté závorky `[]` kulatými `()`, nevznikne n-tice (tuple), nýbrž **generátorový výraz** (*generator expression*):

```python
xs = "ahoj"

# List comprehension (eager - vytvoří celý list v RAM):
seznam = [ord(c) for c in xs]
print(type(seznam))  # <class 'list'>

# Generator expression (lazy - nepočítá nic předem):
gen = (ord(c) for c in xs)
print(type(gen))     # <class 'generator'>
```

### Proč je to zásadní koncept?
- **Paměťová úspora $O(1)$**: Milion prvků v list comprehension zabere desítky megabajtů RAM. Generátorový výraz spotřebuje jen několik bajtů pro svůj řídicí stav.
- **Předání do agregačních funkcí**: Kulaté závorky se nemusí zdvojovat při předání funkci:
  ```python
  # Zbytečné alokování dočasného listu:
  sum([x**2 for x in range(1_000_000)])  # spotřebuje ~80 MB RAM

  # Elegantní proudové sčítání bez alokace:
  sum(x**2 for x in range(1_000_000))    # spotřebuje ~100 B RAM!
  ```

---
<!-- slide: id8, Generátor množiny, Core, pythonic -->
## Generátor množiny (Set Comprehension)

Použitím složených závorek `{výraz for x in iter}` vytvoříme množinu `set`:
- Zajišťuje automatickou deduplikaci prvků.
- Rychlé vyhledávání prvků v čase $O(1)$.

```python
text = "abracadabra"

# Získání unikátních znaků kromě 'a', 'b', 'c':
unikatni = {c for c in text if c not in "abc"}
print(unikatni)
# {'r', 'd'}

# Množina délek slov v textu:
veta = "kocka leze dirou pes oknem a kralik dvermi"
delky = {len(slovo) for slovo in veta.split()}
print(delky)
# {1, 3, 5, 6}
```

---
<!-- slide: id9, Generátor slovníku, Core, pythonic -->
## Generátor slovníku (Dict Comprehension)

Notace `{klic: hodnota for x in iter}` umožňuje sestavovat asociativní mapy:

```python
# 1. Rychlé mapování indexu na prvek:
abeceda = "ABCDEF"
index_mapa = {i: pismeno for i, pismeno in enumerate(abeceda)}
# {0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F'}

# 2. Obrácení (inverze) slovníku {hodnota: klíč}:
puvodni = {"admin": 1, "editor": 2, "viewer": 3}
obraceny = {hodnota: klic for klic, hodnota in puvodni.items()}
# {1: 'admin', 2: 'editor', 3: 'viewer'}

# 3. Filtrace a transformace slovníku:
ceny_czk = {"notebook": 25000, "mys": 600, "monitor": 8000, "kabel": 150}
eur_kurz = 25.0

# Pouze položky nad 100 EUR, přepočtené na eura:
drahe_eur = {
    zbozi: round(cena / eur_kurz, 2)
    for zbozi, cena in ceny_czk.items()
    if cena / eur_kurz >= 100
}
# {'notebook': 1000.0, 'monitor': 320.0}
```

---
<!-- slide: id10, Vícenásobný generátor, Tricky, pythonic -->
## Vícenásobný generátor (Vnořené smyčky)

V generátorové notaci můžeme zapsat i více smyček `for`. **Pořadí odpovídá běžnému zanoření cyklů**:

```python
barvy = ["červená", "zelená"]
velikosti = ["S", "M", "L"]

# Kartézský součin (vnější for barva, vnitřní for velikost):
kombinace = [f"{b}-{v}" for b in barvy for v in velikosti]
# ['červená-S', 'červená-M', 'červená-L', 'zelená-S', 'zelená-M', 'zelená-L']
```

### Zploštění 2D matice (Flattening):
```python
matice = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# Čte se zleva doprava: pro každý řádek v matici, pro každý prvek v řádku:
jednorozmerne = [prvek for radek in matice for prvek in radek]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

> [!WARNING] Nebezpečí překombinování
> Více než dvě smyčky `for` v jednom generátoru vedou k nečitelnému kódu. V takovém případě vždy preferujte rozepsání do běžného bloku `for` nebo funkci `itertools.product()`.

---
<!-- slide: id11, Souvislost s funkcionálními konstrukty v Python'u, WOW, pythonic -->
## Comprehensions vs. `map()` a `filter()`

V jiných jazycích (JavaScript, Java Streams) se transformace a filtrace řeší metodami `map` a `filter`. V Pythonu je preferována generátorová notace:

| Funkcionální přístup | Pythonic generátorová notace |
| :--- | :--- |
| `list(map(f, xs))` | `[f(x) for x in xs]` |
| `list(filter(p, xs))` | `[x for x in xs if p(x)]` |
| `list(map(f, filter(p, xs)))` | `[f(x) for x in xs if p(x)]` |

### Proč Python komunita preferuje comprehensions?
1. **Přehlednější syntaxe**: Odpadá nutnost psát `lambda` výrazy a obalovat výsledek do `list(...)`.
2. **Výkon**: Jednoduché list comprehensions jsou v CPythonu často rychlejší než `map()` s anonymní `lambda` funkcí díky eliminaci režie volání Python funkcí v každém kroku.
3. **Konzistence**: Stejnou notací vytvoříte `list`, `set`, `dict` i líný `generator`.
