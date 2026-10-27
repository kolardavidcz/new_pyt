<!-- slide: id1, Obory platnosti a pravidlo LEGB, Core, basics -->
## Obory platnosti proměnných a pravidlo LEGB

V Pythonu je viditelnost a vyhledávání proměnných řízeno striktním pravidlem **LEGB**:

```text
L -> E -> G -> B

[L] Local      - Proměnné definované uvnitř aktuální funkce
[E] Enclosing  - Proměnné v nadřazených obalujících funkcích (uzávěry)
[G] Global     - Globální proměnné na úrovni modulu/souboru
[B] Built-in   - Vestavěná jména Pythonu (len, range, print, Exception...)
```

### Zásadní rozdíl oproti C/C++ a Javě:
V Pythonu bloky podmínek `if`, cyklů `for`/`while` ani správců kontextu `with` **NEVYTVÁŘEJÍ nový scope**! Nový obor platnosti zakládá pouze **funkce (`def`)**, **třída (`class`)** nebo **generátor/komprehenze**.

```python
if True:
    zprava = "Ahoj z if bloku"

print(zprava)  # ✅ Funguje! Proměnná zprava existuje i mimo if blok.
```

---
<!-- slide: id2, Lokální proměnné a stínění (Shadowing), Core, basics -->
## Lokální proměnné a stínění (*Shadowing*)

Jakákoliv proměnná vytvořená přiřazením uvnitř funkce je automaticky **lokální**:

```python
x = "globální x"

def funkce():
    x = "lokální x uvnitř funkce"
    print("V těle:", x)

funkce()
print("Venku:", x)

# Výstup:
# V těle: lokální x uvnitř funkce
# Venku: globální x
```

Lokální proměnná `x` uvnitř funkce **zastínila** (*shadowed*) globální proměnnou stejného jména. Po skončení funkce lokální proměnná zanikne a globální zůstává nedotčena.

---
<!-- slide: id3, Zápis do globálních proměnných: Klíčové slovo global, Core, resyntax -->
## Čtení vs. zápis do globálních proměnných: `global`

Čtení globálních proměnných funguje uvnitř funkce zcela přirozeně (podle pravidla LEGB interpret nenajde lokální jméno a přejde k úrovni Global):

```python
pocet = 0

def precti():
    print(f"Čtu globální: {pocet}")  # Funguje bez problémů
```

Pokud se však pokusíte do globální proměnné **zapsat**, Python by ve výchozím stavu vytvořil novou lokální proměnnou. Chcete-li explicitně modifikovat globální jméno, musíte použít příkaz **`global`**:

```python
pocet = 0

def inkrementuj():
    global pocet
    pocet += 1

inkrementuj()
inkrementuj()
print(pocet)  # 2
```

> [!WARNING] Globální stav je v produkci antipattern
> Globální proměnné ztěžují testování, znemožňují paralelizaci v multiprocessingu a vedou k těžko dohledatelným vedlejším efektům. V moderním OOP a modulárním kódu předávejte stav jako argumenty funkcí nebo v atributech instancí tříd.

---
<!-- slide: id4, Vnořené funkce a Enclosing Scope, Core, newconcept -->
## Vnořené funkce a Enclosing Scope

V Pythonu lze funkce vnořovat do sebe. Vnitřní funkce má přístup k parametrům a lokálním proměnným vnější funkce (*Enclosing Scope*):

```python
def vnejsi(text: str):
    prefix = "[LOG]"

    def vnitrni():
        # Přístup k 'prefix' a 'text' z nadřazené funkce
        print(f"{prefix} {text}")

    vnitrni()

vnejsi("Server spuštěn.")  # [LOG] Server spuštěn.
```

Tento mechanismus je základním stavebním kamenem **uzávěrů** (*closures*) a **dekorátorů**.

---
<!-- slide: id5, Klíčové slovo nonlocal (PEP 3104), Core, newconcept -->
## Modifikace nadřazeného scope: `nonlocal` (PEP 3104)

Co když chceme z vnitřní funkce modifikovat proměnnou ve vnější funkci, aniž by byla globální? Příkaz `global` by hledal až na úrovni celého souboru.

K tomu slouží klíčové slovo **`nonlocal`**:
Říká interpretu, aby hledal proměnnou v **nejbližším nadřazeném obalujícím bloku**:

```python
def vytvor_citac():
    stav = 0

    def tik():
        nonlocal stav
        stav += 1
        return stav

    return tik

citac = vytvor_citac()
print(citac())  # 1
print(citac())  # 2
print(citac())  # 3
```

> [!NOTE] Rozdíl mezi global a nonlocal
> - `global`: Váže jméno na nejvyšší úroveň celého modulu.
> - `nonlocal`: Váže jméno na nejbližší vnější funkci. Nemůže vázat na globální úroveň modulu!

---
<!-- slide: id6, Souhrnný přehled: local vs. global vs. nonlocal, Skip, newconcept -->
## Přehled chování: `local` vs. `global` vs. `nonlocal`

| Deklarace | Do jakého scope zapisuje? | Hledá na globální úrovni? | Kdy použít? |
| :--- | :--- | :---: | :--- |
| *(žádná)* | **Local** (lokální proměnná) | ❌ Ne | Standardní lokální výpočty ve funkci |
| `nonlocal x` | **Enclosing** (nadřazená funkce) | ❌ Ne | Stavové uzávěry (*closures*), generátory, továrny |
| `global x` | **Global** (úroveň modulu) | ✅ **Ano** | Pouze ojedinělé systémové konfigurace modulu |

---
<!-- slide: id7, Vyhledávání jmen v hierarchii a stínění built-inů, Core, basics -->
## Procházení hierarchie a stínění Built-in funkcí

Vyhledávání v řetězci LEGB se zastaví na prvním výskytu jména:

```python
# Nebezpečné stínění vestavěného jména (Built-in Shadowing):
list = [10, 20, 30]  # Zastínili jsme vestavěný typ list!

# Pokus o konverzi nyní selže:
# nova_kolekce = list((1, 2, 3))
# TypeError: 'list' object is not callable
```

> [!CAUTION] Vyvarujte se kolizí s vestavěnými názvy!
> Nikdy nepojmenovávejte proměnné jako `list`, `dict`, `set`, `str`, `int`, `id`, `type`, `min`, `max` nebo `input`. Pokud potřebujete název pro proměnnou, použijte raději podtržítko na konci (např. `id_`, `type_`) dle doporučení PEP 8.

---
<!-- slide: id8, Klasická past: UnboundLocalError a kompilace scope, Tricky, newconcept -->
## Nejznámější past: `UnboundLocalError`

Podívejte se na následující zdánlivě nevinný kód:

```python
x = 100

def chyba():
    print(x)  # Tady chceme vypsat globální x = 100...
    x = 200   # ...a tady přiřazujeme

# chyba()
```

Při zavolání funkce však program okamžitě havaruje:
```text
UnboundLocalError: cannot access local variable 'x' where it is not associated with a value
```

### Proč k tomu dochází?
Python při kompilaci funkce projde její kód ještě před spuštěním. Protože v těle funkce vidí příkaz `x = 200`, **označí jméno `x` jako LOKÁLNÍ pro celou funkci**.

Když se pak interpret pokusí vykonat první řádek `print(x)`, hledá lokální proměnnou `x`, která však v tomto okamžiku ještě nedostala hodnotu!

---
<!-- slide: id9, Inspekce scope: locals(), globals() a free variables, Skip, newconcept -->
## Inspekce oborů platnosti: `locals()` a `globals()`

Python umožňuje prozkoumat aktuální jmenné prostory za běhu:

```python
def inspekce(a: int, b: str = "test"):
    c = 42
    # locals() vrátí slovník všech aktuálních lokálních proměnných
    print(locals())

inspekce(10)
# {'a': 10, 'b': 'test', 'c': 42}
```

### Atributy funkcí a uzávěry:
- `funkce.__code__.co_varnames`: N-tice lokálních proměnných.
- `funkce.__code__.co_freevars`: N-tice volných proměnných z enclosing scope.
- `funkce.__closure__`: Buňky s referencemi na zachycené proměnné v uzávěru.
