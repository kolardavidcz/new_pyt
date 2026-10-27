<!-- slide: id=id1 title="Úvod a osnova" tags=Core diff=basics -->
# Úvod a osnova

Vítejte ve čtvrté přednášce kurzu programování v jazyce Python. Dnešním tématem jsou hešovací datové struktury — slovníky (`dict`) a množiny (`set`) — a moderní architektura ošetřování chyb založená na výjimkách.

### Osnova dnešní 90minutové přednášky:
1. **Hešování pod kapotou**: Princip hešovatelnosti (`hash()`, `__hash__`, `__eq__`) a proč měnitelné objekty nesmí být klíči.
2. **Kompaktní hešovací tabulka (PEP 468)**: Architektura CPythonu od verze 3.6/3.7, úspora paměti a garantované pořadí vkládání.
3. **Slovníky (`dict`)**: Bezpečný přístup přes `.get()`, dynamické pohledy (`keys`, `values`, `items`) a moderní operátory sjednocení `|` a `|=` (PEP 584).
4. **Množiny (`set` & `frozenset`)**: Deduplikace dat, testy příslušnosti v $O(1)$ a množinová algebra (`|`, `&`, `-`, `^`).
5. **Dict a Set Comprehensions**: Elegantní jednorázové transformace a filtrování kolekcí.
6. **Filozofie ošetřování chyb**: Kontrola předem (LBYL) vs. Pythonic odpuštění (EAFP: *Easier to Ask for Forgiveness than Permission*).
7. **Anatomie výjimek**: Úplný cyklus `try-except-else-finally`, hierarchie `Exception` a toxický antipattern `except: pass`.
8. **Pokročilé techniky**: Řetězení chyb `raise ... from err`, kontextové poznámky `add_note()` a skupiny výjimek `ExceptionGroup` s `except*` (PEP 654).
9. **Produkční most**: Pokročilé agregace s `collections.defaultdict` a frekvenční analýza s `collections.Counter`.
10. **Most k Milníku 1**: Návrh robustního frekvenčního analyzátoru textu.

---

<!-- slide: id=id2 title="Hešování pod kapotou: Co je hešovatelnost" tags=Core diff=paradigm -->
# Hešování pod kapotou: Co je hešovatelnost (Hashability)

Jak dokáže slovník vyhledat hodnotu mezi milionem položek v okamžitém čase **$O(1)$**?

Pod kapotou leží matematická **hešovací funkce**:

$$\text{klíč} \xrightarrow{\quad\text{hash()}\quad} \text{64bitové celé číslo} \xrightarrow{\quad \pmod{\text{kapacita}}\quad} \text{index slotu v tabulce}$$

```python
print(hash("Aspirin"))        # např. 7283648102938472910
print(hash((1, 2, 3)))        # např. 529344067295497451
print(hash(42))               # 42
```

### Podmínky hešovatelnosti objektu v Pythonu:
Objekt je hešovatelný (splňuje rozhraní `collections.abc.Hashable`), pokud:
1. Má definovanou metodu `__hash__()`, která vrací stejné celé číslo po celou dobu existence objektu.
2. Má definovanou metodu `__eq__()` pro test rovnosti.
3. **Platí axiom rovnosti**: Pokud se dva objekty rovnají (`a == b`), jejich heše **musí být identické** (`hash(a) == hash(b)`).

---

<!-- slide: id=id3 title="Proč měnitelné objekty nesmí být hešovatelné" tags=Core diff=tricky -->
# Proč měnitelné objekty nesmí být hešovatelné?

Co by se stalo, kdybychom jako klíč ve slovníku použili měnitelný seznam `list`?

```python
klic = [1, 2]
# muj_dict[klic] = "hodnota"  # TypeError: unhashable type: 'list'
```

### Katastrofický scénář, kterému Python zabraňuje:
1. Vložíte `klic = [1, 2]` do slovníku. Hešovací funkce spočítá heš a uloží prvek do slotu číslo 5.
2. Následně seznam na místě modifikujete: `klic.append(3)`.
3. Obsah seznamu se změnil, a tím se změnil i jeho hypotetický heš!
4. Když se později pokusíte zavolat `muj_dict[klic]`, Python spočítá nový heš, podívá se do slotu číslo 12 a nahlásí: **Klíč nenalezen!**
5. Původní položka ve slotu 5 by zůstala navždy uvězněna jako nedosažitelný "zombie" záznam v paměti!

> [!IMPORTANT]
> Všechny vestavěné **neměnné (immutable)** typy (`int`, `float`, `str`, `tuple`, `frozenset`, `bytes`) jsou hešovatelné. Všechny **měnitelné (mutable)** typy (`list`, `dict`, `set`) jsou striktně nehešovatelné.

---

<!-- slide: id=id4 title="C/Java vs. CPython: Kompaktní hešovací tabulka" tags=Core diff=paradigm -->
# C/Java vs. CPython: Kompaktní hešovací tabulka

V C++ (`std::unordered_map`) a starém Pythonu (před verzí 3.6) se hešovací tabulka skládala z jednoho velkého řídkého pole, kde většina slotů zela prázdnotou:

```plain
[ Tradiční řídká hešovací tabulka (Java HashMap, starý Python) ]
Slot 0:  EMPTY
Slot 1:  [ hash, key_ptr, value_ptr ]  (24 bajtů)
Slot 2:  EMPTY
Slot 3:  EMPTY
Slot 4:  [ hash, key_ptr, value_ptr ]  (24 bajtů)
--> Obrovské plýtvání pamětí: 66 % slotů musí zůstat prázdných kvůli kolizím!
--> Pořadí prvků bylo pseudonáhodné a záviselo na heších!
```

### Revoluce: Kompaktní slovník CPythonu (Raymond Hettinger, PEP 468):
Od Pythonu 3.6/3.7 CPython oddělil indexy od samotných dat do dvou polí:

```plain
Indices (řídké pole malých čísel, 1 B per slot):
  [ -1,  0, -1, -1,  1, -1, -1, -1 ]

Entries (husté pole záznamů, přesně tolik slotů, kolik je prvků):
  Index 0: [ hash1, "klic_A", 100 ]
  Index 1: [ hash2, "klic_B", 200 ]
```

> [!NOTE]
> **Dva revoluční důsledky**:
> 1. Úspora paměti o **20 až 25 %** oproti tradičním hešovacím tabulkám.
> 2. Slovníky si **striktně pamatují pořadí vkládání prvků (Insertion Order)** jako oficiální součást jazykového standardu!

---

<!-- slide: id=id5 title="Základní manipulace: Indexace vs. .get()" tags=Core diff=basics -->
# Práce se slovníkem: Indexace vs. .get()

Slovník je asociativní pole mapující unikátní klíče na libovolné hodnoty:

```python
ceny = {"jablko": 25, "banan": 38, "pomeranc": 42}

# 1. Čtení pomocí hranatých závorek []:
print(ceny["banan"])     # 38
# print(ceny["meloun"])  # KeyError: 'meloun' ! Zastaví celý program!

# 2. Bezpečné čtení metodou .get(key, default=None):
print(ceny.get("meloun"))         # None (žádná výjimka nevznikne)
print(ceny.get("meloun", 0))      # 0 (uživatelská výchozí hodnota)

# 3. Test existence klíče operátorem in:
if "jablko" in ceny:              # O(1) blesková hešovací kontrola!
    print("Máme jablka na skladě.")

# 4. Zápis a přepsání:
ceny["kiwi"] = 55       # Vloží nový klíč
ceny["jablko"] = 28     # Přepíše stávající hodnotu
```

---

<!-- slide: id=id6 title="Dynamické pohledy na slovník (Dictionary Views)" tags=Core diff=basics -->
# Dynamické pohledy na slovník (Dictionary Views)

V Pythonu 2 vracely metody `keys()` a `values()` statické zkopírované seznamy. V moderním Pythonu 3 vrací **dynamické pohledy (Views)**:

```python
sklad = {"triko": 15, "kalhoty": 8, "bunda": 3}

k = sklad.keys()
v = sklad.values()
it = sklad.items()

print(it)  # dict_items([('triko', 15), ('kalhoty', 8), ('bunda', 3)])

# Změníme slovník:
sklad["cepice"] = 20

# Pohled k okamžitě a bez alokace reflektuje změnu!
print(k)   # dict_keys(['triko', 'kalhoty', 'bunda', 'cepice'])
```

### Procházení slovníku ve smyčce:
```python
# Idiomatické procházení klíčů i hodnot současně pomocí rozbalení n-tice:
for polozka, pocet in sklad.items():
    print(f"{polozka:10s} : {pocet:3d} ks")
```

> [!TIP]
> Pohledy `keys()` a `items()` se chovají jako **množiny**! Můžete nad nimi provádět množinové operace: `dict_a.keys() & dict_b.keys()` okamžitě vrátí společné klíče.

---

<!-- slide: id=id7 title="Modifikace a slučování slovníků: Operátory | a |=" tags=Core diff=newconcept -->
# Modifikace a slučování: Operátory | a |= (PEP 584)

Od Pythonu 3.9 můžete slovníky elegantně slučovat pomocí operátoru roury `|`:

```python
vychozi_konfigurace = {"host": "localhost", "port": 8080, "debug": True}
uzivatelska_volba   = {"port": 5000, "debug": False, "timeout": 30}

# 1. Nový sloučený slovník (hodnoty vpravo přepisují hodnoty vlevo):
aktivni_konfig = vychozi_konfigurace | uzivatelska_volba
print(aktivni_konfig)
# {'host': 'localhost', 'port': 5000, 'debug': False, 'timeout': 30}

# 2. In-place modifikace stávajícího slovníku pomocí |= :
vychozi_konfigurace |= {"timeout": 60}

# 3. Metoda .setdefault(key, default):
# Vrátí hodnotu klíče, a pokud klíč neexistuje, nejprve jej do slovníku vloží!
skupiny = {}
skupiny.setdefault("A", []).append("Alice")
skupiny.setdefault("A", []).append("Adam")
print(skupiny)  # {'A': ['Alice', 'Adam']}
```

---

<!-- slide: id=id8 title="Množiny (set): Rychlá deduplikace a O(1) hledání" tags=Core diff=basics -->
# Množiny (set): Rychlá deduplikace a O(1) hledání

Množina `set` je neuspořádaná kolekce **unikátních hešovatelných prvků**.

Pod kapotou funguje stejně jako `dict`, ale ukládá pouze heš a klíč (hodnota je prázdná).

```python
# 1. Vytvoření množiny:
cisla = {1, 2, 3, 2, 1, 4}
print(cisla)  # {1, 2, 3, 4} (duplicity byly automaticky zahozeny!)

# 2. POZOR na vytvoření prázdné množiny:
prazdna = set()  # Jediný správný způsob!
# prazdna = {}   # CHYBA! To vytvoří prázdný slovník dict, nikoliv set!

# 3. Blesková deduplikace velkého seznamu v čase O(n):
id_pacientu = [102, 105, 102, 108, 105, 109, 102]
unikatni = list(set(id_pacientu))
print(unikatni)  # [102, 105, 108, 109]
```

### Vyhledávání prvku: list vs. set:
* V seznamu `list` vyžaduje operátor `x in seznam` **lineární průchod $O(n)$**.
* V množině `set` vyžaduje operátor `x in mnozina` **hešovací skok $O(1)$**!
* Pro kolekci o $100\,000$ prvcích je `set` typicky **$5\,000\times$ až $10\,000\times$ rychlejší**!

---

<!-- slide: id=id9 title="Množinová algebra: Průnik, sjednocení a rozdíl" tags=Core diff=basics -->
# Množinová algebra v Pythonu

Python nabízí plnou matematickou množinovou algebru přímo v operátorech:

```python
skupina_A = {"Alice", "Bob", "Cyril", "David"}
skupina_B = {"Cyril", "David", "Eva", "Filip"}

# 1. Sjednocení (Union) -- v A nebo v B:
print(skupina_A | skupina_B)
# {'Alice', 'Bob', 'Cyril', 'David', 'Eva', 'Filip'}

# 2. Průnik (Intersection) -- v A a zároveň v B:
print(skupina_A & skupina_B)
# {'Cyril', 'David'}

# 3. Rozdíl (Difference) -- v A, ale ne v B:
print(skupina_A - skupina_B)
# {'Alice', 'Bob'}

# 4. Symetrický rozdíl (Symmetric Difference) -- v A nebo v B, ale ne v obou:
print(skupina_A ^ skupina_B)
# {'Alice', 'Bob', 'Eva', 'Filip'}

# 5. Podmnožina a nadmnožina:
print({"Cyril", "David"} <= skupina_A)  # True (podmnožina)
```

---

<!-- slide: id=id10 title="Zmrazené množiny (frozenset): Hešovatelné množiny" tags=Core diff=basics -->
# Zmrazené množiny: Typ frozenset

Běžná množina `set` je měnitelná (lze volat `.add()`, `.discard()`), a proto **není hešovatelná**:

```python
# Nelze vytvořit množinu množin:
# mnoziny = {{1, 2}, {3, 4}}  # TypeError: unhashable type: 'set'
```

### Řešení: Neměnná zmrazená množina frozenset:
`frozenset` je immutable obdoba typu `set`. Jakmile je vytvořen, nelze jej měnit, má stálý heš a je plně hešovatelný:

```python
mnozina_1 = frozenset([1, 2])
mnozina_2 = frozenset([3, 4])

# 1. Frozenset jako prvek v jiné množině:
komplexni_mnozina = {mnozina_1, mnozina_2}
print(len(komplexni_mnozina))  # 2

# 2. Frozenset jako klíč ve slovníku:
# (Ideální pro grafové hrany mezi neorientovanými uzly!)
vzdalenosti = {
    frozenset({"Praha", "Brno"}): 205,
    frozenset({"Praha", "Plzen"}): 95,
}

print(vzdalenosti[frozenset({"Brno", "Praha"})])  # 205 (pořadí nehraje roli!)
```

---

<!-- slide: id=id11 title="Dict a Set Comprehensions" tags=Core diff=newconcept -->
# Generátory slovníků a množin (Comprehensions)

Stejně jako u seznamů můžete slovníky a množiny tvořit deklarativně v jediné linii:

### 1. Set Comprehension:
```python
text = "Bioinformatika a chemie lékových struktur"
# Získat unikátní malá písmena, která nejsou mezery:
samohlasky = {znak.lower() for znak in text if znak.lower() in "aeiouy"}
print(samohlasky)  # {'a', 'e', 'i', 'o', 'u', 'y'}
```

### 2. Dict Comprehension:
```python
geny = ["TP53", "EGFR", "BRCA1", "MYC"]

# Vytvoření indexového slovníku: název -> délka řetězce
delky = {gen: len(gen) for gen in geny}
print(delky)  # {'TP53': 4, 'EGFR': 4, 'BRCA1': 5, 'MYC': 3}

# Invertování slovníku (prohození klíčů a hodnot):
puvodni = {"a": 1, "b": 2, "c": 3}
obraceny = {v: k for k, v in puvodni.items()}
print(obraceny)  # {1: 'a', 2: 'b', 3: 'c'}
```

---

<!-- slide: id=id12 title="Filozofie ošetřování chyb: LBYL vs. Pythonic EAFP" tags=Core diff=paradigm -->
# Filozofie ošetřování chyb: LBYL vs. EAFP

Jak přistupovat k situacím, kde může nastat chyba (soubor neexistuje, klíč chybí, dělení nulou)?

### 1. Tradiční C / Java přístup: LBYL (Look Before You Leap)
*Dvakrát měř, jednou řež.* Před každou operací nejprve složitě testujeme všechny podmínky:

```python
# Styl LBYL (Neoptimální a upovídaný v Pythonu):
if "uzivatel" in session:
    if "role" in session["uzivatel"]:
        role = session["uzivatel"]["role"]
    else:
        role = "guest"
```

### 2. Pythonic přístup: EAFP (Easier to Ask for Forgiveness than Permission)
*Raději požádej o odpuštění, než o svolení.* Předpokládejte, že operace proběhne v pořádku, a případnou chybu odchyťte výjimkou:

```python
# Styl EAFP (Idiomatický moderní Python):
try:
    role = session["uzivatel"]["role"]
except KeyError:
    role = "guest"
```

> [!TIP]
> **Proč je EAFP v Pythonu lepší?**
> 1. **Rychlost (Happy Path)**: Pokud chyba nenastane (což je 99 % případů), blok `try` nezpůsobuje žádné zpoždění.
> 2. **Prevence Race Conditions (TOCTOU)**: Mezi kontrolou `if os.path.exists(f)` a otevřením souboru `open(f)` mohl jiný proces soubor smazat! EAFP soubor rovnou otevře a zachytí `FileNotFoundError`.

---

<!-- slide: id=id13 title="Kostra ošetření chyb: try - except - else - finally" tags=Core diff=basics -->
# Kostra ošetření chyb: try - except - else - finally

Python nabízí čtyřdílnou konstrukci pro robustní správu běhových stavů:

```python
try:
    # 1. Zde provádíme kód, který MŮŽE vyvolat výjimku:
    f = open("vysledky.txt", "r", encoding="utf-8")
    data = f.read()
    hodnota = float(data.strip())
except FileNotFoundError:
    # 2. Spustí se POUZE, pokud soubor neexistuje:
    print("Soubor nebyl nalezen, použijeme výchozí hodnotu 0.0")
    hodnota = 0.0
except ValueError as e:
    # 3. Spustí se POUZE, pokud text nelze převést na float:
    print(f"Data v souboru jsou poškozená: {e}")
    hodnota = 0.0
else:
    # 4. Spustí se POUZE, pokud v bloku try NENASTALA ŽÁDNÁ CHYBA:
    print(f"Úspěšně načteno: {hodnota}")
finally:
    # 5. Spustí se VŽDY -- ať k chybě došlo, nebo nedošlo (úklid zdrojů):
    print("Ukončení operace (úklid hotov).")
```

---

<!-- slide: id=id14 title="Proč je větev else zásadní pro čistý kód" tags=Core diff=tricky -->
# Proč je větev else v bloku try zásadní?

Mnoho programátorů přehlíží větev `else` a všechen následující kód napíše přímo na konec bloku `try`:

```python
# ŠPATNÝ ZÁPIS:
try:
    zaznam = ziskej_zaznam_z_databaze(uzivatel_id)  # Může vyvolat KeyError
    zpracuj_a_odesli_email(zaznam)                   # Také může vyvolat KeyError!
except KeyError:
    print("Uživatel v databázi neexistuje!")
```

### Problém: Maskování chyb (Exception Masking)!
Pokud nastane `KeyError` uvnitř funkce `zpracuj_a_odesli_email()` (např. kvůli chybějícímu klíči `"smtp_server"`), zachytí ji náš blok `except` a falešně ohlásí, že uživatel neexistuje v databázi!

### Správný idiom s větví else:
```python
# SPRÁVNÝ A PROFESIONÁLNÍ ZÁPIS:
try:
    zaznam = ziskej_zaznam_z_databaze(uzivatel_id)
except KeyError:
    print("Uživatel v databázi neexistuje!")
else:
    # Spustí se jen při úspěchu, ale je chráněn před falešným odchycením:
    zpracuj_a_odesli_email(zaznam)
```

> [!NOTE]
> V bloku `try` ponechte **výhradně řádek, který očekávanou výjimku vyvolává**. Následný kód přesuňte do větve `else`.

---

<!-- slide: id=id15 title="Hierarchie výjimek: BaseException vs. Exception" tags=Core diff=paradigm -->
# Hierarchie výjimek v Pythonu

Všechny výjimky v Pythonu jsou standardní třídy uspořádané do přísné dědičné hierarchie:

```plain
BaseException
 ├── SystemExit            (vyvoláno funkcí sys.exit())
 ├── KeyboardInterrupt     (uživatel stiskl Ctrl+C)
 ├── GeneratorExit         (uzavření generátoru)
 └── Exception             ◄─── BÁZOVÁ TŘÍDA PRO VŠECHNY BĚŽNÉ APLIKAČNÍ CHYBY!
      ├── ArithmeticError
      │    └── ZeroDivisionError
      ├── LookupError
      │    ├── IndexError   (index mimo pole)
      │    └── KeyError     (klíč nenalezen v dict)
      ├── ValueError        (správný typ, neplatná hodnota: int("abc"))
      ├── TypeError         (operace nad nekompatibilním typem: 5 + "a")
      └── OSError
           ├── FileNotFoundError
           └── PermissionError
```

> [!IMPORTANT]
> Pokud chcete zachytit jakoukoliv aplikační chybu, zachytávejte **výhradně `Exception`**, nikdy `BaseException`! Pokud byste zachytili `BaseException`, váš program by nešlo ukončit ani klávesovou zkratkou `Ctrl+C` (`KeyboardInterrupt`)!

---

<!-- slide: id=id16 title="Toxický antipattern: Slepé zachytávání except: pass" tags=Core diff=tricky -->
# Toxický antipattern: Slepé potlačování chyb

Nejnebezpečnější konstrukce, jakou můžete v Pythonu napsat:

```python
# ABSOLUTNÍ PROGRAMÁTORSKÝ HŘÍCH:
try:
    data = vypocitej_dulezite_vysledky()
    uloz_do_databaze(data)
except:
    pass  # Mlčky pokračujeme dál...
```

### Proč je tento kód katastrofální?
1. **Skryje překlepy v kódu**: Pokud v kódu uděláte chybu v názvu proměnné (`NameError`), Python ji spolkne a vy se nikdy nedozvíte, proč data chybí!
2. **Skryje výpadky paměti**: Zachytí a spolkne i `MemoryError` nebo `SystemExit`.
3. **Nemorální debugging**: Způsobí, že systém selže o 500 řádků dál na zcela nesouvisejícím místě s chybou `TypeError: 'NoneType' object is not subscriptable`.

### Pravidlo pro vývojáře:
Vždy specifikujte **konkrétní typ výjimky**, kterou očekáváte:
```python
try:
    data = parse_int(hodnota)
except ValueError as err:
    logger.warning(f"Chybný formát čísla: {err}")
```

---

<!-- slide: id=id17 title="Vyvolávání chyb a řetězení výjimek: raise ... from" tags=Core diff=newconcept -->
# Vyvolávání chyb a řetězení výjimek (raise ... from)

Chybu vyvoláváme klíčovým slovem **`raise`**:

```python
def nastav_vek(vek: int) -> None:
    if vek < 0 or vek > 150:
        raise ValueError(f"Neplatný věk: {vek}. Musí být v intervalu [0, 150].")
```

### Řetězení výjimek (Exception Chaining, PEP 3134):
Při překladu nízkoúrovňových chyb na doménové výjimky použijte syntaxi **`raise ... from err`**:

```python
def nacti_konfiguraci(cesta: str) -> dict[str, str]:
    try:
        with open(cesta, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError as err:
        # Zabalíme nízkoúrovňovou I/O chybu do konfigurační výjimky:
        raise ConfigurationError("Konfigurační soubor aplikace nebyl nalezen") from err
```

CPython v tracebacku zobrazí obě chyby i kauzální souvislost:
```plain
The above exception was the direct cause of the following exception:
ConfigurationError: Konfigurační soubor aplikace nebyl nalezen
```

---

<!-- slide: id=id18 title="Tvorba vlastních doménových výjimek" tags=Core diff=basics -->
# Tvorba vlastních doménových výjimek

V profesionálních aplikacích a knihovnách nevystačíte pouze s generickými `ValueError` a `KeyError`. Chcete, aby uživatel vaší knihovny mohl odchytit vaše specifické chyby.

Vytvoření vlastní výjimky je v Pythonu otázkou **dědění ze třídy `Exception`**:

```python
# Bázová výjimka celého vašeho modulu/knihovny:
class BioDataError(Exception):
    """Základní výjimka pro všechny chyby zpracování biologických dat."""
    pass

# Konkrétní specializované podtřídy:
class InvalidSequenceError(BioDataError):
    """Vyvoláno, když DNA/RNA řetězec obsahuje neplatné nukleotidy."""
    def __init__(self, sequence: str, invalid_chars: set[str]) -> None:
        super().__init__(f"Sekvence obsahuje neplatné znaky: {invalid_chars} v '{sequence[:15]}...'")
        self.sequence = sequence
        self.invalid_chars = invalid_chars

def validuj_dna(sekvence: str) -> None:
    povolene = set("ACGT")
    nalezeno = set(sekvence.upper()) - povolene
    if nalezeno:
        raise InvalidSequenceError(sekvence, nalezeno)
```

---

<!-- slide: id=id19 title="Obohacování chyb: Metoda e.add_note() (Python 3.11+)" tags=Core diff=newconcept -->
# Obohacování chyb: Metoda e.add_note() (Python 3.11+, PEP 678)

Častý problém v produkci: funkce hluboko ve volacím zásobníku vyvolá výjimku `ValueError("Invalid ID")`. Když traceback doputuje na úroveň API handleru, chybí kontext: *Který konkrétní uživatel to byl? Který HTTP request? Který soubor?*

Před Pythonem 3.11 bylo nutné složitě vytvářet novou výjimku a řetězit ji přes `from err`.

Od Pythonu 3.11 má každá výjimka metodu **`add_note(text)`**:

```python
def zpracuj_soubor_pacienta(cesta_k_souboru: str) -> None:
    try:
        parsuj_mereni(cesta_k_souboru)
    except ValueError as err:
        # Přidáme kontextové informace bez narušení typu původní výjimky:
        err.add_note(f"Chyba nastala při zpracování souboru: {cesta_k_souboru}")
        err.add_note(f"Časový otisk zpracování: {datetime.now().isoformat()}")
        raise  # Znovu vyvoláme obohacenou výjimku!
```

Poznámky se v terminálu zobrazí přímo pod tracebackem:
```plain
ValueError: Invalid ID format
Chyba nastala při zpracování souboru: /data/pacient_042.dat
Časový otisk zpracování: 2026-10-27T14:30:00
```

---

<!-- slide: id=id20 title="ExceptionGroup a syntaxe except* (Python 3.11+)" tags=Core diff=newconcept -->
# Skupiny výjimek: ExceptionGroup a except* (PEP 654)

V asynchronním programování (`asyncio`) nebo paralelních vláknech může nastat **více nezávislých výjimek současně** (např. 3 úlohy ze 4 selhaly v téže milisekundě).

Python 3.11 zavedl typ **`ExceptionGroup`** a novou syntaxi **`except*`**:

```python
def soubezne_ulohy():
    # Vyvolání skupiny více chyb naráz:
    raise ExceptionGroup(
        "Selhaly 2 paralelní síťové dotazy",
        [
            FileNotFoundError("Konfigurační soubor chybí"),
            ConnectionRefusedError("Databázový server neodpovídá"),
            ValueError("Neplatná hodnota parametru timeout"),
        ]
    )

try:
    soubezne_ulohy()
except* FileNotFoundError as eg:
    # Zachytí POUZE chyby typu FileNotFoundError ze skupiny!
    print("Ošetřuji chybějící soubor:", eg.exceptions)
except* (ConnectionRefusedError, TimeoutError) as eg:
    # Zachytí síťové chyby ze skupiny:
    print("Ošetřuji síťový výpadek:", eg.exceptions)
```

> [!NOTE]
> Všimněte si hvězdičky u `except*`: tento blok může být vyhodnocen **vícekrát v jediném try-catch bloku**, pokud skupina obsahuje chyby odpovídající různým větvím!

---

<!-- slide: id=id21 title="Pravdivostní hodnoty (Truthiness) a Short-circuit logika" tags=Core diff=basics -->
# Pravdivostní hodnoty (Truthiness) a zkrácené vyhodnocování

V Pythonu má každý objekt přirozenou pravdivostní hodnotu v logickém kontextu:

### Hodnoty vyhodnocované jako False (Falsy):
* Konstanty: `None`, `False`
* Celočíselné nuly: `0`, `0.0`, `0j`
* Prázdné sekvence a kolekce: `""` (prázdný str), `[]`, `()`, `{}`, `set()`

Všechny ostatní hodnoty (včetně libovolného neprázdného seznamu či řetězce `"False"`) jsou **Truthy**!

```python
polozky = []
if not polozky:  # Idiomatický způsob, jak ověřit prázdnost! (Ne: if len(polozky) == 0)
    print("Seznam je prázdný!")
```

### Operátory and a or vracejí hodnotu operandu:
Pythoní `and` a `or` nevrací pouhé `True`/`False`, ale **hodnotu operandu, na kterém se vyhodnocování zastavilo (Short-circuit)**:

```python
# or vrátí první pravdivou hodnotu, nebo poslední hodnotu:
uzivatelske_jmeno = "" or "Anonym"
print(uzivatelske_jmeno)  # 'Anonym'

# and vrátí první nepravdivou hodnotu, nebo poslední hodnotu:
konfigurace = {"db": "postgres"}
vysledek = konfigurace and konfigurace.get("db")
print(vysledek)  # 'postgres'
```

---

<!-- slide: id=id22 title="Produkční most: collections.defaultdict pro agregaci" tags=Core diff=newconcept -->
# Produkční most: collections.defaultdict

Při seskupování dat do seznamů podle klíčů narážíme na nutnost kontrolovat, zda klíč existuje:

```python
# ZASTARALÝ A ZBYTEČNĚ SLOŽITÝ KÓD:
katalog = {}
for oddeleni, jmeno in zaznamy:
    if oddeleni not in katalog:
        katalog[oddeleni] = []
    katalog[oddeleni].append(jmeno)
```

### Řešení: collections.defaultdict
`defaultdict` přijímá jako argument tzv. **default factory** — bezargumentovou funkci (nebo typ), která vyrobí výchozí hodnotu, jakmile se interpret dotáže na neexistující klíč:

```python
from collections import defaultdict

# factory = list -> při prvním dotazu na neexistující klíč se automaticky zavolá list():
studenti_dle_oboru = defaultdict(list)

studenti_dle_oboru["Informatika"].append("Alice")
studenti_dle_oboru["Informatika"].append("Bob")
studenti_dle_oboru["Chemie"].append("Cyril")

print(dict(studenti_dle_oboru))
# {'Informatika': ['Alice', 'Bob'], 'Chemie': ['Cyril']}
```

---

<!-- slide: id=id23 title="defaultdict v praxi: Počítadla a stromové struktury" tags=Core diff=basics -->
# defaultdict v praxi: Počítadla a vnořené struktury

### 1. Počítadlo výskytů s int (výchozí hodnota int() je 0):
```python
from collections import defaultdict

frekvence_slov = defaultdict(int)

slova = ["pes", "kočka", "pes", "kůň", "pes", "kočka"]
for s in slova:
    frekvence_slov[s] += 1  # Žádná KeyError! Pokud slovo chybí, začne na 0 a přičte 1!

print(dict(frekvence_slov))  # {'pes': 3, 'kočka': 2, 'kůň': 1}
```

### 2. Autovytváření stromů (Autovivification ve stylu Perlu):
Rekurzivní `defaultdict`, který se sám generuje do nekonečné hloubky:

```python
def strom():
    return defaultdict(strom)

adresar = strom()
adresar["domov"]["kolar"]["dokumenty"]["diplomka.pdf"] = "1.4 MB"

print(adresar["domov"]["kolar"]["dokumenty"]["diplomka.pdf"])  # '1.4 MB'
```

---

<!-- slide: id=id24 title="Produkční most: collections.Counter pro frekvenční analýzu" tags=Core diff=newconcept -->
# Produkční most: collections.Counter

Potřebujete zjistit nejčastější nukleotidy v DNA, nejfrekventovanější slova v článku nebo nejčastější HTTP chybové kódy v logu?

Třída **`collections.Counter`** je specializovaný podtyp slovníku optimalizovaný pro počítání prvků:

```python
from collections import Counter

dna = "ACGTGGTCAAGCTAATCGGATCGATCGATC"
pocitadlo = Counter(dna)

print(pocitadlo)
# Counter({'A': 8, 'C': 8, 'G': 8, 'T': 7})

# 1. Čtení chybějícího klíče nevrací chybu, ale 0:
print(pocitadlo["U"])  # 0 (Uracil se v DNA nevyskytuje)

# 2. Metoda .most_common(n): Vrátí n nejčastějších prvků a jejich počty:
nejcastejsi = pocitadlo.most_common(2)
print(nejcastejsi)  # [('A', 8), ('C', 8)]
```

---

<!-- slide: id=id25 title="Counter v praxi: Multimnožinová algebra" tags=Core diff=basics -->
# Counter v praxi: Multimnožinová algebra

`Counter` reprezentuje matematickou **multimnožinu (Bag)**, kde každý prvek může existovat vícekrát:

```python
from collections import Counter

kosik_1 = Counter(jablka=4, banany=2, pomerance=1)
kosik_2 = Counter(jablka=2, banany=5, melouny=1)

# 1. Sčítání zásob:
celkem = kosik_1 + kosik_2
print(celkem)
# Counter({'banany': 7, 'jablka': 6, 'pomerance': 1, 'melouny': 1})

# 2. Odečítání (ponechá pouze kladné počty):
rozdil = kosik_1 - kosik_2
print(rozdil)
# Counter({'jablka': 2, 'pomerance': 1})

# 3. Průnik (minimum z obou) a sjednocení (maximum z obou):
print(kosik_1 & kosik_2)  # Counter({'jablka': 2, 'banany': 2})
print(kosik_1 | kosik_2)  # Counter({'banany': 5, 'jablka': 4, 'pomerance': 1, 'melouny': 1})
```

---

<!-- slide: id=id26 title="Architektonický most k Milníku 1: Frekvenční analyzátor" tags=Core diff=newconcept -->
# Architektonický most k Milníku 1: Frekvenční analyzátor

Na konci tohoto týdne odevzdáváte **Milník 1: CLI Tokenizér & Frekvenční analyzátor textu**.

Ukázka profesionální architektury propojující vše z 0. až 4. týdne:

```python
import re
import sys
from collections import Counter
from pathlib import Path

def frekvencni_analyza_souboru(cesta: Path, stop_slova: set[str], top_n: int = 5) -> list[tuple[str, int]]:
    """Načte soubor v streamovaném O(1) režimu a vrátí top N nejčastějších tokenů."""
    pocitadlo: Counter[str] = Counter()
    vzor_slova = re.compile(r"\b[a-zA-Zá-žÁ-Ž]{3,}\b")

    try:
        with open(cesta, "r", encoding="utf-8") as f:
            for radek in f:
                slova = [s.lower() for s in vzor_slova.findall(radek)]
                # Filtrujeme stop-slova v O(1) čase pomocí množiny:
                cista_slova = [s for s in slova if s not in stop_slova]
                pocitadlo.update(cista_slova)
    except FileNotFoundError as err:
        err.add_note(f"Zkontrolujte cestu k datům: {cesta.resolve()}")
        raise
    except UnicodeDecodeError as err:
        raise ValueError(f"Soubor {cesta} není validní UTF-8 text!") from err

    return pocitadlo.most_common(top_n)
```

---

<!-- slide: id=id27 title="Shrnutí a přechod do cvičení" tags=Core diff=basics -->
# Shrnutí přednášky a příprava na cvičení

Dnes jsme zvládli hešovací struktury a moderní správu chyb:

### Hlavní body pro zapamatování:
1. **Hešovatelnost**: Klíče v `dict` a prvky v `set` musí být striktně neměnné; měnitelné objekty jako `list` nelze hešovat.
2. **Kompaktní dict (PEP 468)**: CPython garantuje zachování pořadí vkládání a šetří 25 % paměti.
3. **Bezpečný dict**: Pro čtení používejte `.get(key, default)`; pro sloučení operátor `|` (PEP 584).
4. **Množiny (`set` & `frozenset`)**: Bleskové testy `in` v $O(1)$; plná podpora množinové algebry (`|`, `&`, `-`, `^`).
5. **EAFP vs. LBYL**: Preferujte `try-except` před kaskádami `if`; větev `else` použijte pro kód závislý na úspěchu.
6. **Hierarchie výjimek**: Zachytávejte konkrétní chyby nebo `Exception`; nikdy nepoužívejte slepé `except: pass` ani neodchytávejte `BaseException`.
7. **Pokročilé chyby**: Řetězte přes `raise ... from`, obohacujte kontextem `err.add_note()` a pro souběžnost využijte `except*`.
8. **Produkční kontejnery**: Pro agregaci seskupujte přes `collections.defaultdict`; pro frekvence použijte `collections.Counter`.

### Co vás čeká v následujícím 1,5hodinovém cvičení:
* Praktická implementace frekvenční analýzy reálného datasetu států a jejich hustoty zalidnění.
* Ošetření I/O výjimek a poškozených záznamů pomocí doménových výjimek.
* Dokončení a odevzdání **Milníku 1**.
