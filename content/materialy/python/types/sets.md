<!-- slide: id1, Úvod do množin (set), Core, basics -->
## Množiny (`set`) v Pythonu

Množina je **neuspořádaná kolekce jedinečných a hashovatelných hodnot**. Zjednodušeně si ji lze představit jako „slovník složený pouze z klíčů bez hodnot“:

```python
cisla = {1, 2, 3, 4, 5}
barvy = {"cervena", "zelena", "modra"}
```

### Hlavní charakteristiky množiny:
- **Jedinečnost prvků**: Duplicity jsou automaticky a tiše zahozeny.
- **Hashovatelnost**: Prvky musí být neměnné (*immutable*) a hashovatelné (`int`, `float`, `str`, `tuple`, `frozenset`). Seznam `list` ani slovník `dict` do množiny vložit nelze (`TypeError: unhashable type: 'list'`).
- **Asymptotická složitost**: Test na přítomnost prvku (`x in s`) i přidání (`s.add(x)`) probíhají v průměrném čase **$O(1)$**!
- **Matematické operace**: Nativní podpora pro sjednocení ($\cup$), průnik ($\cap$), rozdíl ($\setminus$) a symetrický rozdíl ($\Delta$).

> [!NOTE] C/C++ a Java analogie
> V Javě odpovídá `HashSet<E>`, v C++ `std::unordered_set<T>`.

---
<!-- slide: id2, Vytvoření množiny a deduplikace, Core, pythonic -->
## Vytvoření množiny a okamžitá deduplikace

Množinu vytvoříme literálem se složenými závorkami `{...}` nebo předáním libovolného iterovatelného objektu konstruktoru `set()`:

```python
# 1. Literálová notace
s1 = {10, 20, 30}

# 2. Blesková deduplikace prvků seznamu (běžný idiom!)
duplicity = [1, 2, 2, 3, 4, 4, 4, 5]
unikatni = set(duplicity)
print(unikatni)  # {1, 2, 3, 4, 5}

# 3. Získání jedinečných znaků z textu
znaky = set("abrakadabra")
print(znaky)  # {'a', 'b', 'r', 'k', 'd'}
```

> [!IMPORTANT]
> Pořadí prvků v množině není garantováno a může se měnit mezi běhy interpretu (kvůli náhodné inicializaci hashovacího seedu pro bezpečnost proti DoS útokům).

---
<!-- slide: id3, Prázdná množina (Pozor na past!), Tricky, pythonic -->
## Prázdná množina: Zásadní syntaktická past

Pokud se pokusíte vytvořit prázdnou množinu zápisem `{}`, **vytvoříte prázdný slovník**, nikoliv množinu!

```python
# ❌ CHYBA: Závorky {} vytvoří prázdný slovník (dict)!
prazdny = {}
print(type(prazdny))  # <class 'dict'>

# ✅ SPRÁVNĚ: Prázdná množina se MUSÍ zapsat voláním set()
prazdna_mnozina = set()
print(type(prazdna_mnozina))  # <class 'set'>
print(len(prazdna_mnozina))   # 0
```

> [!WARNING] Proč tomu tak je?
> Slovníky byly v Pythonu od verze 1.0 (cca 1991), zatímco množiny přibyly až v Pythonu 2.3/2.4. Zpětná kompatibilita nedovolila změnit význam literálu `{}`.

---
<!-- slide: id4, Základní vlastnosti a rychlost vyhledávání, Core, basics -->
## Rychlost vyhledávání: $O(1)$ vs. $O(n)$

Množiny jsou optimalizovány pro bleskové dotazování na přítomnost prvku:

```python
blacklist = {"spamer@evil.com", "bot@attack.org", "phish@fake.net"}

# Test přítomnosti v O(1)
if "spamer@evil.com" in blacklist:
    print("Email zablokován!")

# Počet prvků O(1)
print(len(blacklist))  # 3

# Průchod cyklem for (v neurčeném pořadí)
for email in blacklist:
    print(f"Blokováno: {email}")
```

### Porovnání výkonu s `list`:
Pokud máte seznam s 1 000 000 prvky:
- `x in list`: Musí projít v průměru 500 000 prvků ($\approx 5$ milisekund).
- `x in set`: Spočítá hash a podívá se do paměťového slotu ($\approx 50$ nanosekund, **100 000× rychlejší**!).

---
<!-- slide: id5, Přidávání prvků – add() a update(), Core, basics -->
## Přidávání prvků do množiny

Pro modifikaci množiny slouží metody `add()` a `update()`:

```python
jazyky = {"Python", "C++"}

# 1. Přidání jednoho prvku metodou add() O(1)
jazyky.add("Rust")
jazyky.add("Python")  # Duplicita se tiše ignoruje
print(jazyky)  # {'Python', 'C++', 'Rust'}

# 2. Hromadné přidání prvků metodou update()
jazyky.update(["Go", "Java", "C++"])
print(jazyky)  # {'Python', 'C++', 'Rust', 'Go', 'Java'}

# 3. Pomocí operátoru |= (in-place sjednocení)
jazyky |= {"TypeScript", "Zig"}
```

---
<!-- slide: id6, Odebírání prvků: discard() vs. remove(), Tricky, pythonic -->
## Odebírání prvků: `discard()` vs. `remove()`

Rozdíl mezi metodami je v ošetření neexistujícího prvku:

```python
s = {"jablko", "hruska", "banan"}

# 1. discard(x) - bezpečné odebrání: pokud prvek chybí, nic se nestane
s.discard("jablko")
s.discard("meloun")   # Žádná chyba!

# 2. remove(x) - striktní odebrání: pokud prvek chybí, vyhodí KeyError
s.remove("hruska")
# s.remove("meloun")  # KeyError: 'meloun'

# 3. pop() - odebere a vrátí NÁHODNÝ prvek (vyhodí KeyError, pokud je množina prázdná)
nahodny = s.pop()
print(f"Odebrán: {nahodny}")

# 4. clear() - smaže všechny prvky
s.clear()
print(s)  # set()
```

> [!NOTE] Proč nelze použít del s[x]?
> Množina nemá žádné indexy ani klíče. Operátor `del` proto u množiny nelze aplikovat na konkrétní prvek (`TypeError: 'set' object does not support item deletion`).

---
<!-- slide: id7, Matematické množinové operátory, WOW, pythonic -->
## Matematické operátory nad množinami

Python nabízí elegantní binární operátory pro klasickou množinovou algebru:

```python
A = {1, 2, 3, 4}
B = {3, 4, 5, 6}

# 1. Průnik (Intersection) - prvky v obou množinách
print(A & B)   # {3, 4}

# 2. Sjednocení (Union) - všechny prvky bez duplicit
print(A | B)   # {1, 2, 3, 4, 5, 6}

# 3. Rozdíl (Difference) - prvky v A, které nejsou v B
print(A - B)   # {1, 2}
print(B - A)   # {5, 6}

# 4. Symetrický rozdíl (Symmetric Difference) - prvky právě v jedné z množin
print(A ^ B)   # {1, 2, 5, 6}
```

### Relace mezi množinami:
```python
male = {1, 2}
velke = {1, 2, 3, 4}

print(male <= velke)  # True (podmnožina)
print(male < velke)   # True (vlastní podmnožina)
print(velke >= male)  # True (nadmnožina)
```

---
<!-- slide: id8, Množinové metody a jejich výhoda, Core, pythonic -->
## Metody vs. Operátory: Zásadní rozdíl

Všechny operátory mají odpovídající pojmenované metody:

| Matematická operace | Operátor | Metoda |
| :--- | :---: | :--- |
| **Průnik** | `A & B` | `A.intersection(B)` |
| **Sjednocení** | `A \| B` | `A.union(B)` |
| **Rozdíl** | `A - B` | `A.difference(B)` |
| **Symetrický rozdíl** | `A ^ B` | `A.symmetric_difference(B)` |
| **Test podmnožiny** | `A <= B` | `A.issubset(B)` |
| **Test nadmnožiny** | `A >= B` | `A.issuperset(B)` |
| **Disjunktnost** | *(žádný)* | `A.isdisjoint(B)` |

> [!TIP] Výhoda metod: Akceptují jakýkoliv iterovatelný objekt!
> Operátory (`&`, `|`, `-`) vyžadují, aby oba operandy byly typu `set`.
> Metody (`intersection`, `union`) přijímají **libovolný seznam, n-tici či generátor**:
> ```python
> s = {1, 2, 3}
> # s & [2, 3, 4]             # TypeError: unsupported operand type
> print(s.intersection([2, 3, 4]))  # {2, 3}  <- Funguje přímo bez konverze!
> ```

---
<!-- slide: id9, Modifikace na místě (In-Place Updates), Skip, pythonic -->
## Úpravy na místě (*In-Place Updates*)

Pokud nechcete vytvářet novou množinu, ale modifikovat existující:

```python
A = {1, 2, 3, 4}
B = {3, 4, 5, 6}

# In-place průnik (ponechá v A pouze společné prvky)
A &= B                     # nebo A.intersection_update(B)
print(A)  # {3, 4}

# In-place rozdíl (odebere z A prvky obsažené v B)
A = {1, 2, 3, 4}
A -= {3, 4}                # nebo A.difference_update({3, 4})
print(A)  # {1, 2}

# In-place symetrický rozdíl
A = {1, 2, 3}
A ^= {2, 3, 4}             # nebo A.symmetric_difference_update({2, 3, 4})
print(A)  # {1, 4}
```

---
<!-- slide: id10, Kopírování množin: copy(), Skip, basics -->
## Kopírování množin

Pro vytvoření nezávislé kopie množiny slouží metoda `s.copy()` nebo konstruktor `set(s)`:

```python
puvodni = {1, 2, 3, 4}
kopie = puvodni.copy()

kopie.add(99)
print(puvodni)  # {1, 2, 3, 4}  <- Původní zůstává beze změny!
print(kopie)    # {1, 2, 3, 4, 99}
```

> [!NOTE] Proč není u množin problém s mělkou vs. hlubokou kopií?
> Protože prvky množiny **musí být z principu neměnné** (*immutable*), nehrozí, že by modifikace vnitřního prvku v kopii ovlivnila původní množinu.

---
<!-- slide: id11, Množinová komprehenze (Set Comprehension), WOW, pythonic -->
## Množinová komprehenze (*Set Comprehension*)

Stejně jako u seznamů a slovníků podporuje Python elegantní generování množin:

```python
{vyraz for prvek in iterovatelny_objekt if podminka}
```

### Praktické příklady:

```python
# 1. Unikátní délky slov v textu
slova = ["pes", "kocka", "slon", "lev", "zirafa", "pes"]
delky = {len(w) for w in slova}
print(delky)  # {3, 4, 5, 6}

# 2. Získání unikátních přípon souborů (normalizovaných na malá písmena)
soubory = ["data.CSV", "report.pdf", "image.PNG", "archive.csv", "scan.PDF"]
pripony = {f.split(".")[-1].lower() for f in soubory}
print(pripony)  # {'csv', 'pdf', 'png'}

# 3. Množina druhých mocnin lichých čísel
licha_ctverce = {x**2 for x in range(10) if x % 2 != 0}
print(licha_ctverce)  # {1, 9, 25, 49, 81}
```
