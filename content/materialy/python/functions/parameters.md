<!-- slide: id1, Prerekvizity a rekapitulace, Skip, basics -->
## Rekapitulace: Poziční a pojmenované argumenty

Před zkoumáním pokročilých parametrů si připomeňme základní mechanismus volání:
- **Poziční argumenty**: Hodnoty se mapují na parametry podle jejich pořadí zleva doprava (`f(10, 20)`).
- **Pojmenované argumenty**: Předávají se ve formátu `klic=hodnota` (`f(sirka=10, vyska=20)`).

V této kapitole prozkoumáme variabilní parametry (`*args`, `**kwargs`), striktní oddělovače (`*` a `/`) a fundamentální paměťový model předávání objektů.

---
<!-- slide: id2, Variabilní počet pozičních argumentů (*args), Core, pythonic -->
## Variabilní počet pozičních argumentů: `*args`

Pokud do definice funkce předřadíme před název parametru hvězdičku `*`, všechny přebytečné poziční argumenty interpret automaticky zabalí do **n-tice** (*tuple*):

```python
def secti(*cisla: float) -> float:
    """Sečte libovolný počet předaných čísel."""
    print(f"Typ args: {type(cisla)}, obsah: {cisla}")
    return sum(cisla)

print(secti())           # Typ: <class 'tuple'>, obsah: () -> 0
print(secti(1, 2))       # obsah: (1, 2) -> 3
print(secti(10, 20, 30)) # obsah: (10, 20, 30) -> 60
```

> [!NOTE] Typové anotace u *args
> V typových anotacích (PEP 484) anotujeme typ **jednoho prvku**, nikoli n-tice:
> `*cisla: float` znamená, že každý prvek v `args` je typu `float`.

---
<!-- slide: id3, Variabilní počet pojmenovaných argumentů (**kwargs), Core, pythonic -->
## Variabilní počet pojmenovaných argumentů: `**kwargs`

Dvě hvězdičky `**` v definici funkce zachytí všechny neznámé pojmenované argumenty a zabalí je do **slovníku** (*dictionary*):

```python
def konfigurace_serveru(host: str, port: int, **volby: Any) -> None:
    print(f"Server: {host}:{port}")
    for klic, hodnota in volby.items():
        print(f" - Nastavení {klic}: {hodnota}")

konfigurace_serveru(
    "localhost",
    8080,
    debug=True,
    ssl_cert="cert.pem",
    timeout=60,
)
```

Název `kwargs` je konvencí pro *keyword arguments*.

---
<!-- slide: id4, Rozbalování kolekcí při volání (* a **), WOW, pythonic -->
## Rozbalování kolekcí při volání: Operátory `*` a `**`

Hvězdičky fungují nejen při definici funkce, ale i při jejím **volání**:
- `*iterable`: Rozbalí sekvenci na jednotlivé **poziční** argumenty.
- `**dict`: Rozbalí slovník na jednotlivé **pojmenované** argumenty.

```python
def nakresli_bod(x: float, y: float, z: float, barva: str = "cerna") -> None:
    print(f"Bod [{x}, {y}, {z}], barva: {barva}")

souradnice = [10.5, 20.0, -5.2]
nastaveni = {"barva": "modra"}

# Rozbalení seznamu a slovníku přímo do volání:
nakresli_bod(*souradnice, **nastaveni)
# Bod [10.5, 20.0, -5.2], barva: modra
```

---
<!-- slide: id5, Parametry za *args vyžadují pojmenování (Keyword-Only), Tricky, pythonic -->
## Parametry za `*args` jsou povinně pojmenované

Jakýkoliv parametr uvedený v definici funkce **za** `*args` již nelze předat pozičně, protože `*args` spotřebuje všechny zbývající poziční hodnoty:

```python
def zapis_log(soubor: str, *zpravy: str, formatovany: bool = False) -> None:
    print(f"Zápis do {soubor} (formát: {formatovany}): {zpravy}")

# ❌ CHYBA: Poslední hodnota True spadne do *zpravy!
# zapis_log("app.log", "Chyba 1", "Chyba 2", True)
# Výsledek by byl: zpravy=('Chyba 1', 'Chyba 2', True), formatovany=False!

# ✅ SPRÁVNĚ: Parametr za *args musíme explicitně pojmenovat:
zapis_log("app.log", "Chyba 1", "Chyba 2", formatovany=True)
```

---
<!-- slide: id6, Kompletní anatomie pořadí parametrů v Pythonu, Skip, basics -->
## Kompletní pořadí parametrů v hlavičce funkce

Při definici složitějších signatur musí parametry následovat v tomto striktním pořadí:

```text
def funkce(
    pos_only_1, pos_only_2, /,      # 1. Pouze poziční (před lomítkem)
    stand_1, stand_2=val,           # 2. Běžné poziční nebo pojmenované
    *args,                          # 3. Přebytečné poziční
    kw_only_1, kw_only_2=val,       # 4. Pouze pojmenované (za hvězdičkou)
    **kwargs                        # 5. Přebytečné pojmenované
):
```

---
<!-- slide: id7, Samostatná hvězdička * (Keyword-Only parametry, PEP 3102), WOW, pythonic -->
## Vynucení pojmenování: Samostatná hvězdička `*` (PEP 3102)

Pokud nechceme přijímat variabilní `*args`, ale chceme si **vynutit, aby určité parametry byly zadány VÝHRADNĚ jménem**, umístíme do hlavičky **samostatnou hvězdičku `*`**:

```python
def odesli_platbu(castka: float, ucet: str, *, overeno: bool = False) -> None:
    print(f"Platba {castka} CZK na účet {ucet}, ověřeno: {overeno}")

# ✅ Povolené volání:
odesli_platbu(1500, "123456/0800", overeno=True)

# ❌ ZAKÁZÁNO: Poziční předání selže s TypeError:
# odesli_platbu(1500, "123456/0800", True)
# TypeError: odesli_platbu() takes 2 positional arguments but 3 were given
```

> [!TIP] Proč je to v produkci klíčové?
> Chrání kód před chybami z nepozornosti při volání funkcí s boolean příznaky či citlivými volbami.

---
<!-- slide: id8, Samostatné lomítko / (Positional-Only parametry, PEP 570), WOW, pythonic -->
## Vynucení pozice: Samostatné lomítko `/` (PEP 570)

V Pythonu 3.8 přibyl operátor lomítka `/`. Všechny parametry **před lomítkem jsou striktně poziční** a volající je **nesmí předat jménem**:

```python
def odmocnina(x: float, /, stupen: int = 2) -> float:
    return x ** (1 / stupen)

print(odmocnina(16))             # ✅ Správně
print(odmocnina(16, stupen=4))   # ✅ stupen je za lomítkem, může být pojmenován

# ❌ ZAKÁZÁNO: Parametr 'x' nelze pojmenovat!
# odmocnina(x=16)
# TypeError: odmocnina() got some positional-only arguments passed as keyword arguments: 'x'
```

### Proč lomítko vzniklo?
1. **Svoboda refaktoringu**: Autor knihovny může změnit název interního parametru (např. z `x` na `value`), aniž by rozbil kód uživatelů.
2. **Přirozená syntaxe**: Vestavěné C funkce jako `len(obj)` nebo `pow(x, y)` historicky také nepovolují `len(obj=seznam)`.

---
<!-- slide: id9, Paměťový model: Předávání argumentů v Pythonu, Core, paradigm -->
## Paměťový model předávání argumentů: *Pass-by-Assignment*

V Pythonu neexistuje předávání hodnotou (kopírováním) jako v C ani předávání odkazem na proměnnou (alias) jako v C++. Používá se model **Pass-by-Assignment** (*předání přiřazením reference*):

- Při volání funkce se jménu parametru přiřadí **odkaz na existující objekt na haldě**.
- Chování uvnitř funkce závisí na tom, zda pracujeme s **neměnným** (*immutable*), nebo **měnitelným** (*mutable*) objektem.

---
<!-- slide: id10, Předávání neměnných typů (int, str, tuple), Core, paradigm -->
## Předávání neměnných typů (`int`, `str`, `tuple`)

Neměnné objekty nelze na jejich paměťovém místě modifikovat. Jakékoliv přiřazení uvnitř funkce vytvoří nový lokální objekt:

```python
cislo = 10

def zmen(x: int) -> None:
    x = x * 2  # Vytvoří nové celé číslo 20 a přiřadí lokálnímu jménu x
    print(f"Uvnitř funkce: x = {x}")

zmen(cislo)
print(f"Vně funkce: cislo = {cislo}")

# Výstup:
# Uvnitř funkce: x = 20
# Vně funkce: cislo = 10  <- Původní proměnná se nezměnila!
```

---
<!-- slide: id11, Předávání měnitelných typů (list, dict), Tricky, paradigm -->
## Předávání měnitelných typů (`list`, `dict`)

Pokud funkci předáme měnitelný objekt a zavoláme nad ním modifikační metodu (`append`, `pop`, `update`), **změna se projeví v původním objektu volajícího**:

```python
moje_data = [1, 2, 3]

def pridej(xs: list[int]) -> None:
    xs.append(999)  # Modifikuje objekt sdílený na haldě!

pridej(moje_data)
print(moje_data)  # [1, 2, 3, 999]  <- Změnilo se!
```

### Pozor na rozdíl mezi modifikací a přiřazením:
```python
def premapuj(xs: list[int]) -> None:
    xs = [100, 200]  # Pouze přesměruje lokální jméno 'xs' na jiný seznam!

premapuj(moje_data)
print(moje_data)  # [1, 2, 3, 999]  <- Původní seznam zůstal beze změny!
```

---
<!-- slide: id12, Past na měnitelné výchozí hodnoty (Mutable Default Trap), Tricky, pythonic -->
## Past na měnitelné výchozí hodnoty (*Mutable Default Trap*)

Výchozí argument funkce je vyhodnocen **pouze jednou při kompilaci definice funkce**:

```python
# ❌ KATASTROFICKÁ CHYBA: Seznam se vytvoří pouze jednou v paměti!
def pridej_polozku(prvek: int, seznam: list[int] = []) -> list[int]:
    seznam.append(prvek)
    return seznam

print(pridej_polozku(1))  # [1]
print(pridej_polozku(2))  # [1, 2]   <- Očekávali jsme [2]!
print(pridej_polozku(3))  # [1, 2, 3]
```

Objekt seznamu je trvale připojen k funkci v atributu `pridej_polozku.__defaults__`!

---
<!-- slide: id13, Správné řešení: Sentinel None, Core, pythonic -->
## Správné řešení: Sentinel `None`

Pokud parametr potřebuje jako výchozí hodnotu novou instanci měnitelného typu, použijte jako výchozí hodnotu **`None`**:

```python
def pridej_polozku_spravne(
    prvek: int,
    seznam: list[int] | None = None,
) -> list[int]:
    """Při každém volání bez argumentu vytvoří nový seznam."""
    if seznam is None:
        seznam = []
    seznam.append(prvek)
    return seznam

print(pridej_polozku_spravne(1))  # [1]
print(pridej_polozku_spravne(2))  # [2]  <- Každé volání má svůj nezávislý seznam!
```

---
<!-- slide: id14, Memoizace: Historický trik vs. @functools.cache, Tricky, pythonic -->
## Memoizace: Historický hack vs. `@functools.cache`

V historickém Pythonu někteří vývojáři zneužívali trvalost výchozího slovníku pro triviální mezipaměť (memoizaci):

```python
# 📜 Starý hack z Pythonu 2:
def mocnina_stary_hack(x: int, cache: dict[int, int] = {}) -> int:
    if x not in cache:
        cache[x] = x ** 3
    return cache[x]
```

### ✅ Moderní standard: `@functools.cache` (Python 3.9+)
V moderním Pythonu je tento hack zcela zapovězen. Používáme standardní vestavěný dekorátor `@functools.cache` (nebo `lru_cache`):

```python
from functools import cache

@cache
def drahy_vypocet(x: int) -> int:
    """Výsledek pro stejné 'x' je automaticky uložen v mezipaměti."""
    return x ** 3
```

---
<!-- slide: id15, Typování kwargs: Unpack a TypedDict (PEP 692, Python 3.12+), Skip, basics -->
## Moderní typování `**kwargs`: `Unpack[TypedDict]` (PEP 692)

Od verze **Python 3.12** můžeme přesně typovat klíče a hodnoty ve variabilním `**kwargs` pomocí `typing.TypedDict` a `Unpack`:

```python
from typing import TypedDict, Unpack

class UzivatelskeVolby(TypedDict, total=False):
    theme: str
    timeout: int
    debug: bool

def nastav_profil(uzivatel_id: int, **volby: Unpack[UzivatelskeVolby]) -> None:
    # IDE i Mypy nyní přesně znají povolené klíče a jejich typy!
    print(uzivatel_id, volby)

# ✅ Správně:
nastav_profil(42, theme="dark", timeout=30)

# ❌ Chyba při statické kontrole (překlep v klíči nebo špatný typ):
# nastav_profil(42, tema="dark")
```
