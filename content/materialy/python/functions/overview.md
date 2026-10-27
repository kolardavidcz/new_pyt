<!-- slide: id1, Úvod do definice funkcí def, Core, basics -->
## Definice funkcí (`def`) v Pythonu

V Pythonu definujeme funkce pomocí klíčového slova **`def`**, za nímž následuje název funkce, kulaté závorky s parametry a dvojtečka. Tělo funkce je vymezeno odsazením:

```python
def pozdrav():
    print("Ahoj z funkce!")

pozdrav()  # Volání funkce
```

### Samostatné funkce (*First-Class Citizens*):
Na rozdíl od Javy (kde každá metoda musí patřit nějaké třídě) mohou funkce v Pythonu stát zcela samostatně na úrovni modulu (stejně jako v C/C++). Navíc jsou funkce v Pythonu plnohodnotnými objekty prvního řádu – lze je ukládat do proměnných, předávat jako argumenty jiným funkcím a vracet z nich.

```python
def celociselne_deleni_se_zbytkem(delenec: int, delitel: int) -> tuple[int, int]:
    """Vrátí podíl a zbytek po celočíselném dělení."""
    return delenec // delitel, delenec % delitel

vysledek = celociselne_deleni_se_zbytkem(13, 4)
print(vysledek)  # (3, 1)  <- N-tice (tuple)
```

---
<!-- slide: id2, Dokumentační řetězce (Docstrings), Core, pythonic -->
## Dokumentační řetězce (*Docstrings*, PEP 257)

Prvním příkazem v těle funkce by měl být **dokumentační řetězec** (*docstring*), uzavřený do trojitých uvozovek `"""..."""`:

```python
def spocitej_urok(jistina: float, sazba: float, roky: int) -> float:
    """Vypočítá složený úrok pro zadanou jistinu a sazbu.

    Args:
        jistina: Počáteční vklad v CZK.
        sazba: Roční úroková sazba (např. 0.05 pro 5 %).
        roky: Doba spoření v celých letech.

    Returns:
        Konečná naspořená částka.
    """
    return jistina * (1 + sazba) ** roky
```

### Programový přístup k dokumentaci:
Docstring je uložen v atributu funkce `__doc__` a automaticky jej zobrazuje vestavěná nápověda `help()` i našeptávače v moderních IDE:

```python
print(spocitej_urok.__doc__)
help(spocitej_urok)
```

---
<!-- slide: id3, Prázdné tělo funkce: pass vs. Ellipsis (...), Tricky, basics -->
## Prázdné tělo funkce: `pass` vs. `...` (Ellipsis)

Protože blok v Pythonu je definován odsazením, tělo funkce **nesmí zůstat prázdné**. Samotný komentář nestačí, protože jej interpret při tokenizaci odstraní:

```python
# ❌ CHYBA: Očekává se odsazený blok!
# def rozpracovana_funkce():
#     # Zde dopíšu kód později
# IndentationError: expected an indented block
```

### Dvě správná řešení:
1. **Příkaz `pass`**: Standardní prázdná operace (No-op).
2. **Literál `...` (`Ellipsis`)**: Běžný moderní idiom v typových rozhraních (*stubs* `.pyi`) a abstraktních metodách:

```python
def implementuj_pozdeji() -> None:
    pass

def abstraktni_rozhrani() -> None:
    ...
```

---
<!-- slide: id4, Návratová hodnota (return) a výchozí None, Core, basics -->
## Návratová hodnota (`return`)

Všechny funkce v Pythonu vždy vracejí nějakou hodnotu:
1. Pokud funkce neobsahuje žádný příkaz `return` (nebo skončí holým `return`), **automaticky vrací hodnotu `None`**:

```python
def tiskni_zpravu(text: str) -> None:
    print(text)

vysledek = tiskni_zpravu("Ahoj")
print(vysledek)  # None
```

### Vrácení více hodnot:
Pokud za `return` uvedeme více hodnot oddělených čárkou, Python je automaticky zabalí do **n-tice** (*tuple*):

```python
def ziskej_souradnice() -> tuple[float, float]:
    return 50.087, 14.421  # Zabaleo do n-tice

lat, lon = ziskej_souradnice()  # Okamžité rozbalení
```

---
<!-- slide: id5, Poziční parametry a předávání referencí, Core, basics -->
## Poziční parametry a předávání referencí

Parametry se do funkcí standardně předávají **pozičně** zleva doprava:

```python
def predstav_se(jmeno: str, vek: int) -> None:
    print(f"Jmenuji se {jmeno} a je mi {vek} let.")

predstav_se("Petr", 25)  # 1. parametr -> jmeno, 2. parametr -> vek
```

> [!IMPORTANT] Předávání argumentů: Pass-by-Object-Sharing
> V Pythonu se parametry nepředávají ani čistě hodnotou (jako v C), ani čistě odkazem na proměnnou (jako `&ref` v C++). Předává se **kopie reference na objekt na haldě**:
> - Pokud uvnitř funkce modifikujete **měnitelný objekt** (např. `list.append()`), změna se projeví i vně funkce.
> - Pokud přiřadíte novou hodnotu (`x = 10`), pouze přesměrujete lokální jméno na jiný objekt.

---
<!-- slide: id6, Pojmenované argumenty (Keyword Arguments), Core, resyntax -->
## Pojmenované argumenty (*Keyword Arguments*)

Při volání funkce můžeme argumenty explicitně pojmenovat ve tvaru `jmeno=hodnota`:

```python
def vytvor_uzivatele(jmeno: str, email: str, je_aktivni: bool) -> None:
    print(f"Vytvořen: {jmeno} <{email}>, aktivní: {je_aktivni}")

# Volání se zadáním názvů (pořadí nehraje roli):
vytvor_uzivatele(
    email="jan@novak.cz",
    jmeno="Jan Novák",
    je_aktivni=True,
)
```

> [!TIP] Ochrana před „Boolean Trap“
> Volání `nastav_server("prod", True, False, True)` je nečitelné a náchylné k chybám.
> Zápis `nastav_server("prod", ssl=True, debug=False, zalohovat=True)` je samovysvětlující.

---
<!-- slide: id7, Výchozí hodnoty parametrů (Default Arguments), Core, pythonic -->
## Výchozí hodnoty parametrů (*Default Arguments*)

Parametrům můžeme v hlavičce funkce přiřadit výchozí hodnotu. Při volání pak není nutné tyto argumenty uvádět:

```python
def mocneni(cislo: float, exponent: int = 2) -> float:
    """Umocní číslo. Výchozí exponent je 2 (druhá mocnina)."""
    return cislo ** exponent

print(mocneni(5))               # 25.0 (použije se exponent=2)
print(mocneni(5, 3))            # 125.0 (poziční přepsání)
print(mocneni(5, exponent=4))   # 625.0 (přepsání jménem)
```

---
<!-- slide: id8, Syntaktické pravidlo pro pořadí argumentů, Tricky, resyntax -->
## Pravidlo pro pořadí argumentů

Při definici i volání funkce platí striktní pravidlo: **Poziční argumenty musí vždy předcházet argumentům s výchozí hodnotou či pojmenovaným argumentům**:

```python
# ❌ CHYBA PŘI DEFINICI: Poziční parametr za parametrem s výchozí hodnotou!
# def spatna_funkce(a=1, b):
#     pass
# SyntaxError: non-default argument follows default argument

# ❌ CHYBA PŘI VOLÁNÍ: Poziční hodnota za pojmenovanou!
def spravna(a, b, c=10):
    return a + b + c

# spravna(a=1, 2, c=3)
# SyntaxError: positional argument follows keyword argument
```

---
<!-- slide: id9, Vyhodnocování výchozích hodnot v čase definice, Tricky, newconcept -->
## Vyhodnocování výchozích hodnot: Zásadní past!

Výchozí hodnoty parametrů jsou v Pythonu vyhodnoceny **pouze jednou – v okamžiku definice funkce** (kdy interpret narazí na `def`), nikoliv při každém volání!

```python
# ❌ NEBEZPEČNÁ PAST: Měnitelný výchozí parametr!
def pridej_prvek(polozka: int, seznam: list[int] = []) -> list[int]:
    seznam.append(polozka)
    return seznam

print(pridej_prvek(1))  # [1]
print(pridej_prvek(2))  # [1, 2] <- Seznam se sdílí mezi všemi voláními!
```

### ✅ Idiomatické řešení pomocí `None`:
```python
def pridej_prvek_spravne(polozka: int, seznam: list[int] | None = None) -> list[int]:
    if seznam is None:
        seznam = []
    seznam.append(polozka)
    return seznam
```

---
<!-- slide: id10, Co nás čeká dál ve funkcích?, Skip, basics -->
## Přehled: Co všechno funkce v Pythonu umí

Tato přednáška pokryla základy definice a volání. V navazujících kapitolách se podíváme na pokročilé nástroje:

- **Variabilní počet argumentů**: `*args` (libovolný počet pozičních parametrů) a `**kwargs` (libovolné pojmenované parametry).
- **Vynucení stylu volání**:
  - `*` (Keyword-Only parametry – parametry, které lze předat pouze jménem).
  - `/` (Positional-Only parametry, PEP 570 – parametry, které nelze předat jménem).
- **Obor platnosti proměnných**: Pravidlo **LEGB** (*Local, Enclosing, Global, Built-in*) a klíčová slova `global` a `nonlocal`.
- **Funkce jako objekty**: Uzávěry (*closures*), anonymní funkce `lambda` a **dekorátory** (`@decorator`).
