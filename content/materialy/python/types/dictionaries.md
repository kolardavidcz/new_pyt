<!-- slide: id1, Úvod do slovníků (dict) a hashování, Core, paradigm -->
## Slovníky (`dict`) v Pythonu

Slovník je nejdůležitějším a nejpoužívanějším zástupcem **mapovacích typů** (*mapping types*) v Pythonu. Reprezentuje asociativní pole párů **klíč $\rightarrow$ hodnota**:

```python
student = {
    "jmeno": "Jan",
    "prijmeni": "Novak",
    "rocnik": 2,
    "predmety": ["Python", "Algoritmy"],
}
```

### Principy a omezení:
- **Hodnota (`value`)**: Může být naprosto cokoliv (číslo, řetězec, seznam, funkce, jiný vnořený slovník).
- **Klíč (`key`)**: Musí být **hashovatelný** (*hashable*) a neměnný (*immutable*):
  - Typicky řetězec (`str`), celé číslo (`int`), n-tice složená z neměnných prvků (`tuple`) nebo `frozenset`.
  - Seznam (`list`) ani běžný slovník (`dict`) **nemohou** být klíčem (`TypeError: unhashable type: 'list'`).
  - Každý klíč je v rámci slovníku **jedinečný**.
- **Asymptotická složitost**: Vyhledání, vložení i smazání prvku probíhá v průměrném čase **$O(1)$** díky interní hashovací tabulce.

> [!NOTE] C/C++ a Java analogie
> Pythoní `dict` odpovídá `HashMap<K, V>` v Javě a `std::unordered_map<K, V>` v C++.
> Od verze **Python 3.7+** je součástí jazykového standardu garantováno **zachování pořadí vkládání prvků** (*insertion order*).

---
<!-- slide: id2, Zavedení – „{}“, „dict()“ a operátor sloučení, Core, basics -->
## Konstrukce slovníku a operátor sloučení `|`

Slovník lze vytvořit několika idiomatickými způsoby:

```python
# 1. Přímá literálová notace (nejčastější a nejrychlejší)
d1 = {"a": 1, "b": 2}

# 2. Pomocí konstruktoru s pojmenovanými argumenty
d2 = dict(a=1, b=2, c=3)

# 3. Z dvojic (klíč, hodnota) např. ze seznamu n-tic
d3 = dict([("a", 1), ("b", 2)])

# 4. Spojení dvou sekvencí pomocí zip()
klice = ["id", "nazev", "cena"]
hodnoty = [101, "Kniha", 350]
zbozi = dict(zip(klice, hodnoty))
```

### Sloučení slovníků: Operátor `|` (Python 3.9+, PEP 584)
V moderním Pythonu spojujeme dva slovníky elegantním operátorem `|` (případně `|=` pro in-place úpravu):

```python
vychozi_konfigurace = {"debug": False, "port": 8000, "timeout": 30}
uzivatelska_konfigurace = {"port": 5000, "timeout": 60}

# Spojení (hodnoty z pravého slovníku přepíší levý)
aktivni = vychozi_konfigurace | uzivatelska_konfigurace
print(aktivni)
# {'debug': False, 'port': 5000, 'timeout': 60}
```

---
<!-- slide: id3, Prázdný slovník a častá past, Skip, basics -->
## Vytvoření prázdného slovníku

Prázdný slovník vytvoříme složenými závorkami `{}` nebo konstruktorem `dict()`:

```python
prazdny_1 = {}
prazdny_2 = dict()

print(type(prazdny_1))  # <class 'dict'>
```

> [!WARNING] Pozor na prázdnou množinu (Set)!
> Závorky `{}` vždy vytvářejí **prázdný slovník**, nikoli množinu!
> Pokud potřebujete vytvořit **prázdnou množinu**, musíte explicitně použít:
> ```python
> s = set()      # Množina (set)
> d = {}         # Slovník (dict), nikoliv množina!
> ```

---
<!-- slide: id4, Zavedení – „fromkeys()“ a past na sdílené reference, Tricky, paradigm -->
## Metoda `dict.fromkeys()` a past na sdílené reference

Metoda `dict.fromkeys(iterable, default=None)` inicializuje slovník se zadanou množinou klíčů a shodnou výchozí hodnotou:

```python
stavy = dict.fromkeys(["server1", "server2", "server3"], "offline")
print(stavy)
# {'server1': 'offline', 'server2': 'offline', 'server3': 'offline'}
```

> [!CAUTION] Past na proměnlivé (mutable) výchozí hodnoty!
> Pokud jako výchozí hodnotu předáte měnitelný objekt (např. `[]` nebo `{}`), **všechny klíče budou sdílet tutéž instanci v paměti**:
> ```python
> spatne = dict.fromkeys(["a", "b", "c"], [])
> spatne["a"].append(42)
> print(spatne)
> # {'a': [42], 'b': [42], 'c': [42]}  <- Změnilo se u všech klíčů!
> ```
> 
> **Správné moderní řešení**: Použijte slovníkovou komprehenzi (*dict comprehension*), kde se pro každý klíč vytvoří nová instance:
> ```python
> spravne = {k: [] for k in ["a", "b", "c"]}
> spravne["a"].append(42)
> print(spravne)
> # {'a': [42], 'b': [], 'c': []}
> ```

---
<!-- slide: id5, Základní vlastnosti a operátor in, Core, pythonic -->
## Základní vlastnosti a operátor `in`

Operace se slovníkem jsou primárně zaměřeny na **klíče**:

```python
data = {"praha": 1300000, "brno": 380000, "ostrava": 280000}

# Počet záznamů O(1)
print(len(data))  # 3

# Test na přítomnost klíče O(1)
print("brno" in data)      # True
print("plzen" in data)     # False

# Přístup k hodnotě
print(data["praha"])       # 1300000
```

### Iterace přes slovník
Běžný cyklus `for x in slovnik:` prochází **výhradně klíče**:

```python
for mesto in data:
    print(f"Město: {mesto}, obyvatel: {data[mesto]}")
```

> [!TIP] Rychlost operátoru in
> U seznamu `list` trvá dotaz `x in lst` čas **$O(n)$** (sekvenční průchod).
> U slovníku `dict` trvá dotaz `key in d` pouze **$O(1)$** (okamžitý výpočet hashe). Pro rozsáhlé kolekce je slovník či množina řádově rychlejší!

---
<!-- slide: id6, Pohledy na slovník (Dictionary Views), Core, newconcept -->
## Pohledy na slovník (*Dictionary Views*)

Moderní Python 3 nabízí tři dynamické „pohledy“ na data slovníku:

1. **`d.keys()`**: Pohled na množinu klíčů (`dict_keys`).
2. **`d.values()`**: Pohled na kolekci hodnot (`dict_values`).
3. **`d.items()`**: Pohled na dvojice klíč-hodnota (`dict_items`).

```python
uzivatele = {"admin": 1, "kolar": 2, "host": 3}

k = uzivatele.keys()    # dict_keys(['admin', 'kolar', 'host'])
v = uzivatele.values()  # dict_values([1, 2, 3])
it = uzivatele.items()  # dict_items([('admin', 1), ('kolar', 2), ('host', 3)])
```

### Dynamické chování pohledů:
Pohledy nevytvářejí novou kopii dat v paměti; jsou živým oknem do slovníku. Pokud slovník změníte, pohled se okamžitě aktualizuje:

```python
uzivatele["nova_polozka"] = 4
print(k)  # dict_keys(['admin', 'kolar', 'host', 'nova_polozka'])
```

---
<!-- slide: id7, Přístup k prvkům – „keys()“ a množinové operace, Skip, basics -->
## Pohled přes klíče: `d.keys()` a množinové operace

Pohled `d.keys()` se chová jako množina a podporuje operace průniku a sjednocení:

```python
d1 = {"a": 1, "b": 2, "c": 3}
d2 = {"b": 20, "c": 30, "d": 40}

# Nalezení společných klíčů bez nutnosti konverze na set()
spolecne_klice = d1.keys() & d2.keys()
print(spolecne_klice)  # {'b', 'c'}

# Rozdíl klíčů
pouze_v_d1 = d1.keys() - d2.keys()
print(pouze_v_d1)      # {'a'}
```

> [!NOTE]
> Zápis `for k in d.keys():` je sice syntakticky platný, ale v Pythonu je považován za redundantní. Idiomatický kód píše přímo `for k in d:`.

---
<!-- slide: id8, Přístup k prvkům – „values()“, Skip, basics -->
## Pohled přes hodnoty: `d.values()`

Pohled `d.values()` poskytuje přístup k hodnotám slovníku:

```python
sklady = {"sklad_A": 150, "sklad_B": 320, "sklad_C": 80}

# Celkový součet položek na skladech
celkem = sum(sklady.values())
print(f"Celkem kusů: {celkem}")  # 550

# Maximální hodnota
print(max(sklady.values()))       # 320

# Test přítomnosti hodnoty (pozor: složitost O(n)!)
print(320 in sklady.values())     # True
```

> [!WARNING] Jednosměrnost hashovací tabulky
> Zatímco dotaz na přítomnost klíče (`k in d`) je bleskový v čase **$O(1)$**, dotaz na hodnotu (`val in d.values()`) vyžaduje lineární průchod v čase **$O(n)$**. Hashovací tabulka mapuje klíče na hodnoty, nikoliv naopak!

---
<!-- slide: id9, Přístup k prvkům – „items()“ a rozbalování, WOW, pythonic -->
## Procházení párů: `d.items()` a rozbalování n-tic

Nejčistší a nejvíce pythonický způsob, jak projít klíče i hodnoty současně, je rozbalení (*unpacking*) n-tice v cyklu `for key, val in d.items()`:

```python
kurzy_men = {
    "EUR": 25.30,
    "USD": 23.40,
    "GBP": 29.80,
}

for mena, kurz in kurzy_men.items():
    print(f"1 {mena} = {kurz:.2f} CZK")
```

### Odbourání neefektivního antipatternu:
```python
# ❌ Pomalý a neidiomatický zápis (dvojí vyhledávání v hash tabulce):
for k in kurzy_men:
    print(k, kurzy_men[k])

# ✅ Rychlý a čistý zápis:
for k, v in kurzy_men.items():
    print(k, v)
```

---
<!-- slide: id10, Bezpečné dotazování – get() a setdefault(), Core, pythonic -->
## Bezpečný přístup: `get()` a `setdefault()`

Při přístupu pomocí hranatých závorek vyhodí neexistující klíč výjimku `KeyError`:

```python
d = {"jmeno": "Alice"}
# print(d["vek"])  # KeyError: 'vek'
```

### 1. Metoda `d.get(key, default=None)`
Vrátí hodnotu, nebo zadanou výchozí hodnotu, pokud klíč neexistuje (nevyhazuje výjimku):

```python
vek = d.get("vek", 18)     # vrátí 18 (slovník zůstane nezměněn)
email = d.get("email")     # vrátí None
```

### 2. Metoda `d.setdefault(key, default=None)`
Vrátí existující hodnotu. Pokud klíč neexistuje, **vloží jej do slovníku** se zadanou výchozí hodnotou a vrátí ji:

```python
skupiny = {}

# Seskupení prvků bez KeyError
skupiny.setdefault("A", []).append("Honza")
skupiny.setdefault("A", []).append("Petr")
skupiny.setdefault("B", []).append("Eva")

print(skupiny)
# {'A': ['Honza', 'Petr'], 'B': ['Eva']}
```

---
<!-- slide: id11, Přidávání a modifikace prvků, Core, basics -->
## Přidávání a modifikace prvků

```python
konfigurace = {"verze": "1.0", "autostart": True}

# 1. Přiřazení jednoho prvku O(1)
konfigurace["jazyk"] = "cs"       # Vložení nového klíče
konfigurace["verze"] = "1.1"       # Přepsání existujícího klíče

# 2. Hromadná aktualizace metodou update()
konfigurace.update({"port": 8080, "timeout": 15})

# 3. Moderní in-place sloučení operátorem |= (Python 3.9+)
nove_volby = {"theme": "dark", "timeout": 30}
konfigurace |= nove_volby

print(konfigurace)
# {'verze': '1.1', 'autostart': True, 'jazyk': 'cs', 'port': 8080, 'timeout': 30, 'theme': 'dark'}
```

---
<!-- slide: id12, Odstraňování prvků – del, pop(), popitem(), Core, basics -->
## Odstraňování prvků ze slovníku

Python nabízí několik způsobů, jak prvky ze slovníku odstranit:

```python
data = {"a": 1, "b": 2, "c": 3, "d": 4}

# 1. Příkaz del (vyhodí KeyError, pokud klíč neexistuje)
del data["a"]

# 2. Metoda pop(key, default) – odebere prvek a vrátí jeho hodnotu
val = data.pop("b")            # vrátí 2
chybejici = data.pop("z", 0)   # vrátí 0 (žádná výjimka)

# 3. Metoda popitem() – odebere a vrátí POSLEDNÍ vložený pár (LIFO, O(1))
posledni_klic, posledni_val = data.popitem()
print(f"Odebráno: {posledni_klic} = {posledni_val}")

# 4. Metoda clear() – vyprázdní celý slovník
data.clear()
print(data)  # {}
```

---
<!-- slide: id13, Mělká a hluboká kopie slovníku, Tricky, paradigm -->
## Kopírování slovníku: `copy()` vs. `copy.deepcopy()`

Metoda `d.copy()` (nebo konstruktor `dict(d)`) vytváří **mělkou kopii** (*shallow copy*). Kopíruje samotný slovník, ale vnořené objekty zůstávají sdílené referencí:

```python
import copy

puvodni = {
    "uzivatel": "Karel",
    "opravneni": ["cteni", "zapis"],  # Měnitelný seznam uvnitř
}

# Mělká kopie
melka = puvodni.copy()
melka["opravneni"].append("admin")

# Pozor: změna se projevila i v původním slovníku!
print(puvodni["opravneni"])  # ['cteni', 'zapis', 'admin']

# Hluboká kopie (Deep copy) - rekurzivně zduplikuje celou strukturu
hluboka = copy.deepcopy(puvodni)
hluboka["opravneni"].append("superadmin")
print(puvodni["opravneni"])  # ['cteni', 'zapis', 'admin'] (zůstalo nedotčeno)
```

---
<!-- slide: id14, Řazení slovníků v Pythonu 3.7+, Core, pythonic -->
## Řazení a třídění slovníku

Od Pythonu 3.7 je zaručeno, že slovník uchovává prvky **v pořadí jejich vložení**. Pokud potřebujeme slovník seřadit:

```python
ceny = {"banan": 35, "jablko": 28, "pomeranc": 45, "avokado": 40}

# 1. Seřazení podle klíčů (abecedně)
serazeno_podle_klice = dict(sorted(ceny.items()))
print(serazeno_podle_klice)
# {'avokado': 40, 'banan': 35, 'jablko': 28, 'pomeranc': 45}

# 2. Seřazení podle hodnot (vzestupně od nejlevnějšího)
serazeno_podle_ceny = dict(sorted(ceny.items(), key=lambda item: item[1]))
print(serazeno_podle_ceny)
# {'jablko': 28, 'banan': 35, 'avokado': 40, 'pomeranc': 45}

# 3. Získání 2 nejlevnějších položek
nejlevnejsi_dva = dict(sorted(ceny.items(), key=lambda item: item[1])[:2])
print(nejlevnejsi_dva)
# {'jablko': 28, 'banan': 35}
```

---
<!-- slide: id15, Slovníková komprehenze (Dict Comprehension), WOW, pythonic -->
## Slovníková komprehenze (*Dict Comprehension*)

Slovníková komprehenze umožňuje deklarativně transformovat a filtrovat data do nového slovníku v jediném čitelném výrazu:

```python
{klic: hodnota for prvek in iterovatelny_objekt if podminka}
```

### Praktické příklady:

```python
# 1. Výpočet tabulky druhých mocnin sudých čísel
mocniny = {x: x**2 for x in range(10) if x % 2 == 0}
# {0: 0, 2: 4, 4: 16, 6: 36, 8: 64}

# 2. Převrácení slovníku (Invert dictionary: prohození klíče a hodnoty)
staty = {"CZ": "Cesko", "SK": "Slovensko", "PL": "Polsko"}
podle_nazvu = {nazev: kod for kod, nazev in staty.items()}
print(podle_nazvu)
# {'Cesko': 'CZ', 'Slovensko': 'SK', 'Polsko': 'PL'}

# 3. Filtrování položek podle hodnoty
ceny = {"chleb": 45, "maslo": 60, "rohlik": 3, "mleko": 25}
drahe_polozky = {k: v for k, v in ceny.items() if v >= 40}
print(drahe_polozky)
# {'chleb': 45, 'maslo': 60}
```
