<!-- slide: id=id1 title="Úvod a osnova" tags=Core diff=basics -->
# Úvod a osnova

Vítejte v páté přednášce kurzu programování v jazyce Python. Dnešním tématem jsou funkce — stavební kameny modularity a abstrakce v procedurálním i funkcionálním paradigmatu — a moderní statický typový systém jazyka Python.

### Osnova dnešní 90minutové přednášky:
1. **Funkce v C/Javě vs. Pythonu**: Funkce jako plnohodnotné objekty první kategorie (*first-class citizens*).
2. **Mechanismus předávání argumentů**: C/Java hodnota/reference vs. Python *Call by Object Reference* (sdílení reference).
3. **Typy parametrů**: Poziční vs. pojmenované argumenty (*keyword arguments*).
4. **Striktní oddělovače (PEP 570 & PEP 3102)**: Positional-only `/` a Keyword-only `*`.
5. **Variadické funkce**: Sběrné parametry `*args` (n-tice) a `**kwargs` (slovník).
6. **Rozbalování při volání**: Forwarding a kompozice argumentů přes `*` a `**`.
7. **Klasická past s výchozí hodnotou**: Proč `def f(x=[])` sdílí stav a jak funguje `__defaults__`.
8. **Rozsah platnosti (Scope) a pravidlo LEGB**: Local, Enclosing, Global a Built-in.
9. **Manipulace se scope**: Klíčová slova `global` a `nonlocal` a jejich rizika.
10. **Uzávěry (Closures)**: Jak funkce uzavírá lexikální prostředí a vnitřní struktura buňky (`cell`).
11. **Anonymní funkce (lambda)**: Jednořádkové lambda výrazy, limity a idiomatické použití.
12. **Funkcionální nástroje standardní knihovny**: `map()`, `filter()`, `zip()`, `enumerate()`, `any()` a `all()`.
13. **Modul functools**: Částečná aplikace argumentů pomocí `functools.partial`.
14. **Moduly a balíčky**: Jak CPython hledá kód (`sys.path`), importní mechanismus a `__name__ == '__main__'`.
15. **Evoluce typového systému**: Od čistého dynamického duck-typingu k PEP 484 a volitelnému statickému typování.
16. **Moderní typové anotace (Python 3.10+)**: Operátor sjednocení `int | str`, `list[T]`, `dict[K, V]`.
17. **Typování funkcí a uzávěrů**: `Callable[[int, str], bool]`.
18. **Revoluce v Pythonu 3.12 (PEP 695)**: Nová syntaxe typových aliasů klíčovým slovem `type`.
19. **Generické funkce (PEP 695)**: Přirozená generika `def prvni[T](seznam: list[T]) -> T`.
20. **Produkční most**: Statická kontrola typů pomocí nástrojů `mypy` a `pyright` v CI/CD pipeline.

---

<!-- slide: id=id2 title="C/Java vs. Python: Funkce jako objekty" tags=Core diff=paradigm -->
# C/Java vs. Python: Funkce jako First-Class Citizens

V kompilovaných jazycích jsou funkce a metody instrukční bloky v textovém segmentu binárky. V Javě navíc funkce nemůže existovat samostatně — musí být zabalena do třídy jako metoda:

```java
// Java: Funkce nemůže existovat bez třídy
public class MathUtils {
    public static int zdvojnasob(int x) { return x * 2; }
}
```

### Python: Funkce je standardní heap objekt (`PyFunctionObject`):
V Pythonu má funkce stejný status jako číslo, řetězec nebo seznam:
1. Můžete ji uložit do proměnné.
2. Můžete ji předat jako argument jiné funkci.
3. Můžete ji vrátit z jiné funkce.
4. Můžete ji uložit do seznamu nebo slovníku.

```python
def pozdrav(jmeno: str) -> str:
    return f"Ahoj, {jmeno}!"

# 1. Přiřazení funkce do proměnné:
moje_funkce = pozdrav
print(moje_funkce("Karlovi"))  # 'Ahoj, Karlovi!'

# 2. Inspekce objektu funkce:
print(type(pozdrav))      # <class 'function'>
print(pozdrav.__name__)   # 'pozdrav'
print(pozdrav.__code__)   # <code object pozdrav at 0x7f8...>
```

> [!NOTE]
> Závorky `()` znamenají **volání** funkce. Název funkce bez závorek reprezentuje **samotný objekt funkce**!

---

<!-- slide: id=id3 title="Mechanismus předávání: Call by Object Reference" tags=Core diff=paradigm -->
# Mechanismus předávání: Call by Object Reference

V C se parametry předávají hodnotou (kopírováním) nebo explicitním ukazatelem (`int*`). V Javě se primitiva předávají hodnotou a objekty hodnotou reference.

Jak funguje Python? Python používá **Call by Object Reference** (také nazýváno *Call by Sharing*):
* Do funkce se vždy předává **kopie reference** na objekt na haldě.
* Zda funkce může změnit stav volajícího, závisí **výhradně na mutabilitě předaného objektu**!

```python
# 1. Neměnný objekt (int, str, tuple):
def zmen_cislo(n: int) -> None:
    n = n + 1  # Vytvoří nový objekt int a přepíše lokální referenci 'n'

x = 10
zmen_cislo(x)
print(x)  # 10 -- Původní proměnná x zůstala nezměněna!

# 2. Měnitelný objekt (list, dict, set):
def pridej_prvek(seznam: list[int]) -> None:
    seznam.append(99)  # Mutuje původní objekt na haldě!

cisla = [1, 2, 3]
pridej_prvek(cisla)
print(cisla)  # [1, 2, 3, 99] -- Změna se projevila i mimo funkci!
```

> [!IMPORTANT]
> Pokud uvnitř funkce přiřadíte `seznam = [99]`, přepíšete pouze lokální referenci a volající změnu neuvidí. Pokud však zavoláte mutační metodu (`append`, `extend`, `[0] = ...`), měníte tentýž objekt v paměti!

---

<!-- slide: id=id4 title="Poziční vs. Pojmenované argumenty" tags=Core diff=basics -->
# Poziční vs. Pojmenované argumenty

V C/C++ závisí význam argumentů striktně na jejich pořadí v záhlaví funkce. V Pythonu můžete parametry volat buď pozičně, nebo **explicitním pojmenováním**:

```python
def vytvor_profil(jmeno: str, vek: int, role: str = "user", aktivni: bool = True) -> dict:
    return {"jmeno": jmeno, "vek": vek, "role": role, "aktivni": aktivni}

# 1. Poziční volání (pořadí odpovídá definici):
p1 = vytvor_profil("Alice", 25)

# 2. Pojmenované volání (Keyword arguments) -- pořadí nehraje roli:
p2 = vytvor_profil(vek=30, jmeno="Bob", aktivni=False)

# 3. Kombinace: Poziční argumenty MUSÍ předcházet pojmenovaným!
p3 = vytvor_profil("Cyril", 28, role="admin")

# CHYBA: Poziční argument po pojmenovaném:
# p4 = vytvor_profil(jmeno="David", 22)
# SyntaxError: positional argument follows keyword argument
```

### Proč jsou pojmenované argumenty zásadní v praxi?
1. **Samodokumentující kód**: Volání `otevri_okno(sirka=800, vyska=600, modalni=True)` je okamžitě srozumitelné na rozdíl od kryptického `otevri_okno(800, 600, True)`.
2. **Odolnost vůči změnám API**: Přidání nových volitelných parametrů s výchozí hodnotou nerozbije stávající volání.

---

<!-- slide: id=id5 title="Striktní oddělovače: Positional-only a Keyword-only" tags=Core diff=newconcept -->
# Striktní oddělovače parametrů: / a * (PEP 570 & PEP 3102)

Často chceme jako autoři API vynutit, aby některé argumenty byly předávány **výhradně pozičně** (např. matematické funkce jako `sin(x)`), nebo naopak **výhradně pojmenovaně** (např. přepínače konfigurace).

Python nabízí dva syntaktické oddělovače:
* **`/` (lomítko)**: Všechny parametry **před ním** jsou **Positional-only**.
* **`*` (hvězdička)**: Všechny parametry **za ním** jsou **Keyword-only**.

```python
def konfigurovat(cesta, /, mod="r", *, kodovani="utf-8", timeout=30):
    pass
```

```plain
def konfigurovat(cesta, /, mod="r", *, kodovani="utf-8", timeout=30):
                 └────┬─┘  └───┬───┘    └──────────────┬─────────────┘
                Pouze pozičně  Obojí             Pouze pojmenovaně
```

```python
# Platná volání:
konfigurovat("/data/log.txt", "w", kodovani="ascii", timeout=10)
konfigurovat("/data/log.txt", mod="r", kodovani="utf-8")

# CHYBY:
# konfigurovat(cesta="/data/log.txt")
# TypeError: konfigurovat() got some positional-only arguments passed as keyword arguments: 'cesta'

# konfigurovat("/data/log.txt", "r", "utf-8")
# TypeError: konfigurovat() takes from 1 to 2 positional arguments but 3 were given
```

---

<!-- slide: id=id6 title="Variadické parametry: *args a **kwargs" tags=Core diff=basics -->
# Variadické parametry: *args a **kwargs

Jak definovat funkci, která přijímá libovolný počet argumentů (jako např. `print()` nebo `min()`)?

### 1. Parametr `*args` (Sběr přebytečných pozičních argumentů):
Všechny dodatečné poziční argumenty zabalí CPython do **neměnné n-tice (`tuple`)**:

```python
def aritmeticky_prumer(prvni: float, *dalsi: float) -> float:
    # 'prvni' je povinný parametr, 'dalsi' je tuple se zbylými argumenty
    vsechna_cisla = (prvni,) + dalsi
    return sum(vsechna_cisla) / len(vsechna_cisla)

print(aritmeticky_prumer(10))              # 10.0 (dalsi je ())
print(aritmeticky_prumer(10, 20, 30, 40))  # 25.0 (dalsi je (20, 30, 40))
```

### 2. Parametr `**kwargs` (Sběr přebytečných pojmenovaných argumentů):
Všechny dodatečné pojmenované argumenty zabalí CPython do **slovníku (`dict`)**:

```python
def generuj_html_tag(nazev: str, text: str = "", **atributy: str) -> str:
    # atributy je běžný dict: klíč -> hodnota
    attrs_str = "".join(f' {k}="{v}"' for k, v in atributy.items())
    return f"<{nazev}{attrs_str}>{text}</{nazev}>"

print(generuj_html_tag("a", "Klikněte zde", href="https://cuni.cz", target="_blank"))
# <a href="https://cuni.cz" target="_blank">Klikněte zde</a>
```

---

<!-- slide: id=id7 title="Rozbalování argumentů při volání (Argument Unpacking)" tags=Core diff=newconcept -->
# Rozbalování argumentů při volání: * a **

Operátory `*` a `**` nefungují pouze v hlavičce definice funkce, ale také **při jejím volání**:

```python
def spocitej_objem(delka: float, sirka: float, vyska: float) -> float:
    return delka * sirka * vyska

# Máme data v seznamu:
rozmery_list = [10.5, 4.0, 2.5]
# Místo: spocitej_objem(rozmery_list[0], rozmery_list[1], rozmery_list[2])
objem = spocitej_objem(*rozmery_list)  # Rozbalí sekvenci na 3 poziční argumenty!
print(objem)  # 105.0

# Máme data ve slovníku:
rozmery_dict = {"delka": 10.5, "sirka": 4.0, "vyska": 2.5}
objem2 = spocitej_objem(**rozmery_dict)  # Rozbalí slovník na pojmenované argumenty!
print(objem2)  # 105.0
```

### Univerzální forwarding wrapper (Základ dekorátorů):
Tento vzor umožňuje předat libovolné argumenty dál beze změny:

```python
def mereni_casu(cilova_funkce, *args, **kwargs):
    print(f"Spouštím funkci {cilova_funkce.__name__}...")
    vysledek = cilova_funkce(*args, **kwargs)  # Perfektní přenesení všech parametrů!
    print("Dokončeno.")
    return vysledek
```

---

<!-- slide: id=id8 title="Největší past v Pythonu: Měnitelný výchozí argument" tags=Core diff=tricky -->
# Největší syntaktická past: def f(x=[])

Zkoumáte následující kód. Co vypíše?

```python
def pridej_polozku(polozka: str, kosik: list[str] = []) -> list[str]:
    kosik.append(polozka)
    return kosik

print(pridej_polozku("jablko"))  # ['jablko']
print(pridej_polozku("banan"))   # Co bude zde? ['banan'] ???
```

### Překvapivý výsledek:
```python
print(pridej_polozku("banan"))   # ['jablko', 'banan'] !
print(pridej_polozku("kiwi"))    # ['jablko', 'banan', 'kiwi'] !
```

### Proč se to děje? CPython Internal Mechanics:
V C/C++ a Javě se výchozí hodnoty vyhodnocují při každém volání funkce.
V Pythonu se příkaz `def` vyhodnocuje **pouze jednou — při načtení (definici) modulu**!

```plain
Krok 1 (Čas definice funkce):
  Interpret vytvoří objekt PyFunctionObject.
  Vyhodnotí výraz [] a vytvoří jedinou instanci listu na haldě.
  Uloží referenci na tento list do vnitřního atributu funkce: pridej_polozku.__defaults__.

Krok 2 (Čas volání funkce bez 2. parametru):
  Funkce nepoužije nový list, ale opakovaně sáhne do __defaults__[0]!
```

```python
print(pridej_polozku.__defaults__)  # (['jablko', 'banan', 'kiwi'],)
```

---

<!-- slide: id=id9 title="Správný idiom: Sentinel hodnota None" tags=Core diff=basics -->
# Správný idiom pro měnitelné výchozí argumenty

Jak správně implementovat výchozí prázdný seznam, slovník nebo množinu?

Použijte **neměnnou hodnotu `None` jako sentinel** a nový objekt vytvořte až **uvnitř těla funkce**:

```python
# SPRÁVNÝ A PROFESIONÁLNÍ ZÁPIS:
def pridej_polozku(polozka: str, kosik: list[str] | None = None) -> list[str]:
    """Pokud košík není předán, vytvoříme nový nezávislý seznam."""
    if kosik is None:
        kosik = []  # Tento řádek se spustí při KAŽDÉM volání znovu!
    kosik.append(polozka)
    return kosik

# Nyní má každé volání vlastní izolovaný seznam:
print(pridej_polozku("jablko"))  # ['jablko']
print(pridej_polozku("banan"))   # ['banan']  -- Funguje přesně podle očekávání!

# A pokud uživatel předá vlastní seznam, mutuje se jeho instance:
muj_nakup = ["chléb"]
pridej_polozku("máslo", muj_nakup)
print(muj_nakup)                 # ['chléb', 'máslo']
```

> [!TIP]
> Jako výchozí hodnoty parametrů používejte **výhradně neměnné typy**: `None`, `int`, `float`, `str`, `bool` nebo `tuple`. Nikdy nepoužívejte `[]`, `{}` ani `set()`.

---

<!-- slide: id=id10 title="Rozsah platnosti (Scope) a pravidlo LEGB" tags=Core diff=paradigm -->
# Rozsah platnosti (Scope) a pravidlo LEGB

Když se v kódu odkážete na proměnnou `x`, jakým způsobem ji CPython vyhledává?

CPython prohledává jmenné prostory v přísném pořadí **LEGB**:

```plain
   L  ──►  Local (lokální scope uvnitř aktuální funkce)
   E  ──►  Enclosing (scope vnějších obalujících funkcí / uzávěrů)
   G  ──►  Global (modulární scope -- proměnné na úrovni souboru)
   B  ──►  Built-in (vestavěná jména: len, range, print, ValueError)
```

```python
x = "GLOBAL"

def vnejsi():
    x = "ENCLOSING"
    
    def vnitrni():
        x = "LOCAL"
        print(x)  # Vypíše 'LOCAL' (nalezeno v L)
    
    vnitrni()

vnejsi()
```

### Důležitý rozdíl oproti C/C++ a Javě:
V C a Javě vytváří každý složený blok `{ ... }` (např. tělo `if` nebo cyklu `for`) nový samostatný scope.
V Pythonu bloky `if`, `for`, `while`, `try` **nezakládají nový scope**! Nový scope zakládají pouze **funkce**, **třídy** a **generátory/comprehensions**.

```python
if True:
    tajemstvi = 42
print(tajemstvi)  # 42 -- Zcela legální! Proměnná unikla z bloku if!
```

---

<!-- slide: id=id11 title="Klíčová slova global a nonlocal" tags=Core diff=tricky -->
# Klíčová slova global a nonlocal

Co se stane, když chceme uvnitř funkce **přiřadit hodnotu** do proměnné definované výše?

```python
pocitadlo = 0

def inkrementuj():
    # pocitadlo = pocitadlo + 1  # UnboundLocalError: cannot access local variable 'pocitadlo'
    pass
```

### Proč nastane UnboundLocalError?
CPython analyzuje kód funkce při kompilaci do bajtkódu. Pokud vidí přiřazení (`pocitadlo = ...`), označí symbol `pocitadlo` jako **striktně lokální proměnnou** pro celou funkci. Při čtení na pravé straně však lokální proměnná ještě nemá hodnotu!

### Řešení 1: Klíčové slovo `global` (úroveň modulu):
```python
pocitadlo = 0

def inkrementuj():
    global pocitadlo  # Explicitně oznamujeme: proměnná patří do globálního modulu!
    pocitadlo += 1
```

### Řešení 2: Klíčové slovo `nonlocal` (úroveň vnořené funkce, Python 3+):
```python
def vytvor_generator_id():
    aktualni_id = 0
    def dalsi_id():
        nonlocal aktualni_id  # Odkazuje na proměnnou v obalující funkci (Enclosing)!
        aktualni_id += 1
        return aktualni_id
    return dalsi_id
```

> [!WARNING]
> Klíčovému slovu `global` se v produkčním kódu vyhýbejte — globální mutabilní stav ničí testovatelnost a způsobuje skryté závislosti. Pro zachování stavu preferujte třídy nebo uzávěry (`nonlocal`).

---

<!-- slide: id=id12 title="Uzávěry (Closures) v CPythonu" tags=Core diff=newconcept -->
# Uzávěry (Closures) a buňky v paměti

**Uzávěr (Closure)** je funkce, která si pamatuje hodnoty proměnných ze svého lexikálního okolí (Enclosing scope), i když už vnější funkce dávno skončila a opustila zásobník!

```python
def mocnina_faktory(exponent: int):
    # 'exponent' je lokální proměnná funkce mocnina_faktory
    def umocni(zaklad: float) -> float:
        return zaklad ** exponent  # Používá 'exponent' z vnějšího scopu!
    return umocni

kvadrat = mocnina_faktory(2)
kubik = mocnina_faktory(3)

print(kvadrat(5))  # 25.0
print(kubik(5))    # 125.0
```

### Jak to CPython dělá, když rámec vnější funkce zanikl?
CPython vytvoří speciální objekt typu **`cell`**, který žije na haldě nezávisle na zásobníku volání. Vnitřní funkce si nese referenci na tuto buňku ve svém atributu `__closure__`:

```python
print(kvadrat.__closure__)
# (<cell at 0x7f...: int object at 0x9e...>,)

print(kvadrat.__closure__[0].cell_contents)  # 2
print(kubik.__closure__[0].cell_contents)    # 3
```

---

<!-- slide: id=id13 title="Anonymní funkce: Lambda výrazy" tags=Core diff=basics -->
# Anonymní funkce: Lambda výrazy

Lambda výraz je syntaktická zkratka pro vytvoření jednoduché bezejmenné funkce na jediném řádku:

$$\lambda \;\text{parametry} : \text{návratový\_výraz}$$

```python
# Ekvivalentní definice:
# def zdvojnasob(x): return x * 2
zdvojnasob = lambda x: x * 2

print(zdvojnasob(7))  # 14
```

### Omezení lambda výrazů v Pythonu:
1. Tělo smí obsahovat **pouze jediný výraz** (*expression*), nikoliv příkazy (*statements*).
2. Nelze použít `if-elif-else` (lze pouze ternární operátor `A if cond else B`).
3. Nelze použít `while`, `for`, `try-except` ani přiřazení proměnné `=`.
4. Nelze psát typové anotace přímo do signatury lambdy.

### Kde lambdu používat (Idiomatické nasazení):
Jako jednoúčelové klíče pro řazení (`key=`) nebo transformace:

```python
pacienti = [
    {"jmeno": "Alice", "vek": 34, "tlak": 120},
    {"jmeno": "Bob",   "vek": 62, "tlak": 145},
    {"jmeno": "Cyril", "vek": 28, "tlak": 115},
]

# Řazení podle věku:
pacienti.sort(key=lambda p: p["vek"])

# Hledání pacienta s nejvyšším tlakem:
nejrizikovejsi = max(pacienti, key=lambda p: p["tlak"])
print(nejrizikovejsi["jmeno"])  # 'Bob'
```

---

<!-- slide: id=id14 title="Funkcionální nástroje: map, filter, zip, enumerate" tags=Core diff=basics -->
# Funkcionální nástroje standardní knihovny

Python nabízí sadu vestavěných líně vyhodnocovaných funkcí pro efektivní zpracování kolekcí:

### 1. `enumerate(iterable, start=0)`:
Nahrazuje manuální čítače indexů v cyklech:
```python
barvy = ["červená", "zelená", "modrá"]
for i, barva in enumerate(barvy, start=1):
    print(f"{i}. barva je {barva}")
```

### 2. `zip(*iterables)`:
Paralelní procházení více sekvencí současně v čase $O(n)$:
```python
jmena = ["Alice", "Bob", "Cyril"]
body  = [95, 82, 91]

for jmeno, body_studenta in zip(jmena, body):
    print(f"{jmeno}: {body_studenta} b")

# Vytvoření slovníku z dvojice seznamů:
tabulka = dict(zip(jmena, body))
print(tabulka)  # {'Alice': 95, 'Bob': 82, 'Cyril': 91}
```

### 3. Predikátové agregace: `any()` a `all()`:
```python
vysledky = [True, True, False, True]
print(any(vysledky))  # True  (alespoň jeden je pravdivý)
print(all(vysledky))  # False (ne všechny jsou pravdivé)
```
---

<!-- slide: id=id15 title="Modul functools: Částečná aplikace s partial" tags=Core diff=newconcept -->
# Modul functools: Částečná aplikace s functools.partial

V funkcionálním programování je **částečná aplikace (Partial Application)** technika, kdy z existující funkce s $N$ parametry vytvoříme novou funkci s méně parametry tím, že některé argumenty "zafixujeme":

```python
from functools import partial

def vypocitej_cenu_s_dani(cena: float, sazba_dph: float, sleva: float = 0.0) -> float:
    zaklad = cena - sleva
    return zaklad * (1.0 + sazba_dph)

# Zafixujeme základní sazbu DPH 21 %:
cena_standard = partial(vypocitej_cenu_s_dani, sazba_dph=0.21)

# Zafixujeme sníženou sazbu DPH 12 %:
cena_snizena  = partial(vypocitej_cenu_s_dani, sazba_dph=0.12)

# Nyní voláme specializované funkce pouze s cenou:
print(cena_standard(100.0))  # 121.0
print(cena_snizena(100.0))   # 112.0
```

### Proč raději `partial` než `lambda`?
1. **Introspekce**: Objekt vrácený `partial` má atributy `.func`, `.args` a `.keywords`, takže jej lze debugovat a serializovat (např. v `pickle`).
2. **Přehlednost**: Signatura zůstává čistá a čitelná pro nástroje statické analýzy.

---

<!-- slide: id=id16 title="Moduly a balíčky: Jak CPython hledá kód" tags=Core diff=basics -->
# Moduly a balíčky: Jak CPython hledá kód

V Pythonu je **každý `.py` soubor modulem** a **každý adresář s kódem je balíčkem (package)**.

Jak interpret ví, odkud načíst `import muj_nastroj`? Prohledává seznam adresářů v **`sys.path`**:

```python
import sys
for cesta in sys.path:
    print(cesta)
```

```plain
Pořadí prohledávání v sys.path:
  1. Aktuální pracovní adresář (nebo adresář spouštěného skriptu).
  2. Adresáře definované v systémové proměnné PYTHONPATH.
  3. Standardní knihovna Pythonu (/usr/lib/python3.12).
  4. Adresář třetích stran (site-packages ve vašem virtuálním prostředí .venv).
```

### Struktura balíčků:
Od Pythonu 3.3 (PEP 420) již není soubor `__init__.py` striktně povinný (tzv. Namespace Packages), ale v produkčních balíčcích se **silně doporučuje jej uvádět**:
* `__init__.py` definuje veřejné rozhraní balíčku (`__all__`).
* Umožňuje zjednodušit importy: `from muj_balicek import analyzuj` místo dlouhého `from muj_balicek.podmodul.nastroj import analyzuj`.

---

<!-- slide: id=id17 title="Idiom if __name__ == '__main__':" tags=Core diff=basics -->
# Idiom if \_\_name\_\_ == '\_\_main\_\_':

Když spustíte soubor `python skript.py`, interpret mu automaticky přiřadí speciální interní proměnnou:

```python
__name__ = "__main__"
```

Pokud je tentýž soubor načten jako modul příkazem `import skript` v jiném programu, interpret nastaví:
```python
__name__ = "skript"
```

### Proč je tento idiom klíčový?
Odděluje **definici znovupoužitelného kódu** (funkce, třídy) od **jeho přímého spuštění** (CLI, testy):

```python
# modul matematika.py:
def secti(a: int, b: int) -> int:
    return a + b

def main() -> None:
    # Tento kód se spustí POUZE při přímém volání v terminálu:
    print("Test sčítání:", secti(10, 20))

if __name__ == "__main__":
    main()
```

> [!IMPORTANT]
> Pokud byste kód na úrovni modulu neuzavřeli do podmínky `if __name__ == '__main__':`, spustil by se při každém importu vašeho modulu do jiných skriptů nebo testů!

---

<!-- slide: id=id18 title="Dokumentační řetězce (Docstrings) a introspekce" tags=Core diff=basics -->
# Dokumentační řetězce (Docstrings) a PEP 257

V C++ a Javě se komentáře Doxygen/Javadoc odstraňují během kompilace.
V Pythonu jsou dokumentační řetězce **živými objekty uloženými v paměti v atributu `__doc__`**:

```python
def spocitej_bmi(hmotnost_kg: float, vyska_m: float) -> float:
    """Vypočítá index tělesné hmotnosti (BMI).

    Args:
        hmotnost_kg: Hmotnost člověka v kilogramech. Musí být > 0.
        vyska_m: Tělesná výška v metrech. Musí být v intervalu (0, 3].

    Returns:
        Hodnota BMI jako reálné číslo.

    Raises:
        ValueError: Pokud jsou rozměry neplatné nebo záporné.
    """
    if hmotnost_kg <= 0 or not (0 < vyska_m <= 3.0):
        raise ValueError("Neplatné tělesné míry")
    return hmotnost_kg / (vyska_m ** 2)
```

```python
# Interaktivní zkoumání v REPL nebo v IDE:
help(spocitej_bmi)
print(spocitej_bmi.__doc__)
```

---

<!-- slide: id=id19 title="Evoluce typování: Od Duck Typingu ke statické kontrole" tags=Core diff=paradigm -->
# Evoluce typování: Duck Typing vs. Type Hints

Python byl historicky čistě dynamicky typovaným jazykem řídícím se filozofií **Duck Typingu**:
> *"Pokud to chodí jako kachna a kváká jako kachna, je to pro mě kachna."*

```python
def delka_objektu(x):
    return len(x)  # interpret neřeší, zda x je str, list, dict nebo vlastní třída!
```

### Problém Duck Typingu ve větších projektech:
1. **Nulová asistence IDE**: Editor nemůže nabízet autocompletion, protože neví, co do funkce přijde.
2. **Pozdní odhalení chyb**: Překlep v typu nebo předání `None` vyvolá chybu až v hluboké produkci po 3 hodinách běhu.
3. **Absence explicitního kontraktu**: Vývojář musí číst tělo funkce, aby pochopil, co se od něj očekává.

### Řešení: Type Annotations (PEP 484 až Python 3.12):
* Typové anotace jsou **syntaktickou součástí jazyka**.
* Běhový interpret CPythonu je ignoruje (nepřináší žádné zpomalení).
* Externí statické analyzátory (`mypy`, `pyright`, VS Code) kód zkontrolují **před jeho spuštěním**!

---

<!-- slide: id=id20 title="Moderní typové anotace v Pythonu 3.10+" tags=Core diff=newconcept -->
# Moderní typové anotace v Pythonu 3.10+

Zapomeňte na zastaralé importy `from typing import List, Dict, Union, Optional`. Moderní Python 3.10+ integruje typování přímo do vestavěných typů:

### 1. Operátor sjednocení `|` (PEP 604):
Nahrazuje dřívější `Union[int, str]` a `Optional[str]`:

```python
# Dříve: Optional[str] -> Dnes: str | None
def najdi_uzivatele(id_uzivatele: int) -> str | None:
    if id_uzivatele == 1:
        return "Alice"
    return None

# Hodnota může být int nebo float:
cislo: int | float = 3.14
```

### 2. Generické vestavěné kontejnery (PEP 585):
Přímo používáme `list`, `dict`, `set`, `tuple`:

```python
def filtruj_aktivni(uzivatele: dict[str, bool]) -> list[str]:
    return [jmeno for jmeno, aktivni in uzivatele.items() if aktivni]

souradnice: tuple[float, float, float] = (50.0, 14.4, 250.0)
```

---

<!-- slide: id=id21 title="Typování funkcí vyšších řádů: Callable" tags=Core diff=newconcept -->
# Typování funkcí vyšších řádů: Typ Callable

Když funkce přijímá jinou funkci jako argument (např. callback nebo transformační funkci), jak ji přesně otypovat?

Použijeme typ **`collections.abc.Callable[[VstupniTypy, ...], NavratovyTyp]`**:

```python
from collections.abc import Callable

def transformuj_cisla(
    cisla: list[int], 
    transformator: Callable[[int], int]
) -> list[int]:
    """Aplikuje funkci transformator na každý prvek seznamu."""
    return [transformator(x) for x in cisla]

# Použití s běžnou funkcí:
def na_treti(n: int) -> int:
    return n ** 3

vysledek = transformuj_cisla([1, 2, 3, 4], na_treti)
print(vysledek)  # [1, 8, 27, 64]

# Použití s lambda výrazem:
vysledek2 = transformuj_cisla([1, 2, 3], lambda x: x * 10)
print(vysledek2)  # [10, 20, 30]
```

> [!NOTE]
> Pokud funkce přijímá libovolné parametry bez omezení, zapisuje se elipsa: `Callable[..., bool]`.

---

<!-- slide: id=id22 title="Revoluce v Pythonu 3.12: Příkaz type (PEP 695)" tags=Core diff=newconcept -->
# Revoluce v Pythonu 3.12: Příkaz type (PEP 695)

Před verzí Python 3.12 se typové aliasy definovaly běžným přiřazením, což mátlo analyzátory i lidi:
`Vector = list[float]` (Je to proměnná? Konstanta? Typ?).

Python 3.12 zavedl **oficiální klíčové slovo `type`** (PEP 695):

```python
# 1. Čistý a jednoznačný typový alias:
type Point = tuple[float, float]
type JSONValue = str | int | float | bool | None | list["JSONValue"] | dict[str, "JSONValue"]

def vzdalenost(a: Point, b: Point) -> float:
    return ((a[0] - b[0])**2 + (a[1] - b[1])**2) ** 0.5

start: Point = (0.0, 0.0)
cil: Point   = (3.0, 4.0)
print(vzdalenost(start, cil))  # 5.0
```

### Výhody nového příkazu `type`:
1. **Líné vyhodnocení (Lazy Evaluation)**: Typové aliasy mohou přirozeně odkazovat samy na sebe (rekurzivní typy jako `JSONValue` výše bez nutnosti uvozovek!).
2. **Čistá deklarace pro IDE**: Okamžitá identifikace, že jde o doménový typ.

---

<!-- slide: id=id23 title="Generické funkce v Pythonu 3.12 (PEP 695)" tags=Core diff=newconcept -->
# Generické funkce v Pythonu 3.12: Syntaxe [T]

V C++ píšeme šablony `template <typename T>`, v Javě generické metody `<T> T getFirst(List<T> list)`.

Ve starém Pythonu bylo nutné importovat a vytvářet těžkopádný `T = TypeVar("T")`.

Od Pythonu 3.12 píšeme generika **přirozeně v hranatých závorkách `[T]` přímo za název funkce**:

```python
# Moderní generická funkce v Pythonu 3.12+:
def vrat_prvni[T](seznam: list[T]) -> T:
    """Vrátí první prvek libovolného homogenního seznamu."""
    if not seznam:
        raise IndexError("Seznam je prázdný!")
    return seznam[0]

# IDE i mypy přesně ví, jaký typ dostanou zpět:
jmeno = vrat_prvni(["Alice", "Bob"])   # jmeno je automaticky typu str!
cislo = vrat_prvni([10, 20, 30])       # cislo je automaticky typu int!
```

### Generické slovníkové páry:
```python
def prohod_klic_a_hodnotu[K, V](slovnik: dict[K, V]) -> dict[V, K]:
    return {hodnota: klic for klic, hodnota in slovnik.items()}
```

---

<!-- slide: id=id24 title="Zúžení typů (Type Narrowing) a TypeGuard" tags=Core diff=newconcept -->
# Zúžení typů (Type Narrowing)

Když má proměnná sjednocený typ (např. `str | None` nebo `int | str`), jak interpret a typový inspektor pozná, o jaký typ jde uvnitř bloku?

Moderní typové kontrolery provádějí **automatické zúžení typů (Type Narrowing)**:

```python
def zpracuj_vstup(hodnota: int | str | None) -> str:
    # Zde je typ: int | str | None
    
    if hodnota is None:
        return "Žádná hodnota"
    
    # Nyní mypy ví, že hodnota je striktně: int | str
    if isinstance(hodnota, int):
        # Nyní mypy ví, že hodnota je striktně int:
        return f"Číslo: {hodnota * 10}"
    
    # Zde už hodnota MŮŽE být pouze str:
    return f"Text o délce {len(hodnota)}"
```

### Pokročilé zúžení pomocí `typing.assert_never`:
Ověření úplnosti větví (Exhaustiveness checking) při kompilaci:
```python
from typing import assert_never

def zpracuj_rezim(mod: "cteni | zapis") -> None:
    match mod:
        case "cteni": pass
        case "zapis": pass
        case _ as unreachable:
            assert_never(unreachable)  # mypy nahlásí chybu, pokud přidáme nový režim a neošetříme jej!
```

---

<!-- slide: id=id25 title="Produkční most: Statická kontrola mypy a pyright" tags=Core diff=newconcept -->
# Produkční most: mypy a pyright v CI/CD

Jak reálně zajistit, že nikdo v týmu neodevzdá kód s typovou chybou?

Zapojujeme statické analyzátory kódu do pre-commit háčků a CI/CD pipeline:

```bash
# Spuštění typového analyzátoru přes uv:
uv run mypy src/ --strict
```

### Ukázka, co dokáže mypy odhalit PŘED spuštěním kódu:
```python
def spocitej_prumer(cisla: list[float]) -> float:
    return sum(cisla) / len(cisla)

hodnoty = [10.5, 20.0, None]  # Překlep: do dat se vloudilo None!

# Běžný Python kód spustí a spadne až za běhu:
# TypeError: unsupported operand type(s) for +: 'float' and 'NoneType'

# Ale 'mypy' odhalí chybu okamžitě při psaní kódu:
# error: List item 2 has incompatible type "None"; expected "float"  [list-item]
```

> [!TIP]
> Zapněte si v VS Code rozšíření **Mypy Type Checker** nebo **Pyright (Pylance)**. Chyby uvidíte podtržené červeně přímo během psaní kódu stejně jako v Javě nebo C++!

---

<!-- slide: id=id26 title="Architektonický most: Typově bezpečný pipeline" tags=Core diff=newconcept -->
# Architektonický most k laboratornímu cvičení

Ukázka profesionální funkcionální architektury spojující dnešní témata: uzávěry, variadické funkce, `functools` a moderní typový systém PEP 695:

```python
from collections.abc import Callable
from typing import TypeVar

type Validator[T] = Callable[[T], bool]
type Transformer[T, R] = Callable[[T], R]

def vytvor_cistici_pipeline[T](
    validatory: list[Validator[T]],
    transformace: list[Transformer[T, T]],
) -> Callable[[list[T]], list[T]]:
    """Vyrobí uzávěr, který filtruje a transformuje datový proud."""
    
    def pipeline(data: list[T]) -> list[T]:
        vysledek: list[T] = []
        for polozka in data:
            # 1. Ověření všemi validátory:
            if not all(val(polozka) for val in validatory):
                continue
            # 2. Aplikace všech transformací:
            aktualni = polozka
            for trans in transformace:
                aktualni = trans(aktualni)
            vysledek.append(aktualni)
        return vysledek
    
    return pipeline
```

---

<!-- slide: id=id27 title="Shrnutí a přechod do cvičení" tags=Core diff=basics -->
# Shrnutí přednášky a příprava na cvičení

Dnes jsme probrali funkce a typový systém od základů až po standardy Pythonu 3.12:

### Hlavní body pro zapamatování:
1. **First-Class Citizens**: Funkce jsou objekty na haldě — lze je předávat, ukládat do struktur a vracet z jiných funkcí.
2. **Call by Object Reference**: Předává se odkaz na objekt; mutabilní argumenty (`list`, `dict`) lze uvnitř funkce modifikovat.
3. **Parametry**: Poziční vs. pojmenované; oddělovače `/` (positional-only) a `*` (keyword-only).
4. **Variadické funkce**: `*args` sbírá do n-tice, `**kwargs` sbírá do slovníku; `*` a `**` rozbalují argumenty při volání.
5. **Past s výchozí hodnotou**: Nikdy nepoužívejte `def f(x=[])`; výchozí hodnota se vyhodnotí jen jednou při načtení modulu. Použijte `x=None`.
6. **LEGB a Scope**: Hledání jmen Local $\rightarrow$ Enclosing $\rightarrow$ Global $\rightarrow$ Built-in. Uzávěry (`cell` objekty) vážou proměnné přes `nonlocal`.
7. **Moduly**: Import hledá v `sys.path`. Spouštěcí kód chraňte podmínkou `if __name__ == '__main__':`.
8. **Moderní typový systém**: Sjednocení `int | str`, generika v Pythonu 3.12 `def func[T](...)`, typové aliasy `type Point = tuple[...]`.
9. **Statická typová kontrola**: Používejte `mypy` / `pyright` pro eliminaci chyb dříve, než se kód dostane do produkce.

### Co vás čeká v následujícím 1,5hodinovém cvičení:
* Praktická implementace generických validačních a filtračních funkcí.
* Práce s variadickými argumenty a uzávěry.
* Typová kontrola vlastního kódu pomocí `mypy`.
