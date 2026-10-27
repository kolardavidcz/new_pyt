<!-- slide: id1, Úvod do typových anotací funkcí, Core, basics -->
## Typové anotace funkcí v moderním Pythonu

Python je **dynamicky typovaný jazyk** – datový typ je vázán na konkrétní hodnotu/objekt na haldě, nikoliv na název proměnné. Od verze Python 3.5 (PEP 484) však Python disponuje plnohodnotným systémem **typových anotací** (*Type Hints*), který se v moderních verzích (Python 3.9–3.12+) stal naprostým standardem v produkčním vývoji:

```python
def spocitej_cenu(cena_bez_dph: float, sazba: float = 0.21) -> float:
    """Funkce s plnými typovými anotacemi parametrů a návratové hodnoty."""
    return cena_bez_dph * (1 + sazba)
```

### Proč psát typové anotace?
1. **Okamžitá nápověda a autocompletion** v moderních IDE (VS Code, PyCharm).
2. **Statická analýza před spuštěním**: Nástroje jako **Mypy**, **Pyright** a **Ruff** odhalí překlepy, předání `None` a nekompatibilní typy dříve, než kód spatří produkci.
3. **Samodokumentující kód**: Členové týmu okamžitě vidí očekávané datové struktury bez nutnosti číst tělo funkce.

---
<!-- slide: id2, Syntaxe anotací parametrů a návratových hodnot, Core, resyntax -->
## Syntaxe typových anotací u funkcí

Anotace se zapisují přímo do hlavičky funkce:
- **U parametrů**: Za název parametru se napíše dvojtečka `:` a typový výraz (`param: Typ`). Případná výchozí hodnota následuje až za typem (`param: Typ = hodnota`).
- **U návratové hodnoty**: Za kulatými závorkami následuje šipka `->` a typ výsledku (`-> Typ:`).

```python
def filtruj_cisla(
    data: list[int],
    prah: int = 0,
    prefix: str = "ID-",
) -> list[str]:
    """Moderní zápis s vestavěnými generiky (PEP 585, Python 3.9+)."""
    return [f"{prefix}{x}" for x in data if x > prah]
```

> [!NOTE] Funkce bez návratové hodnoty
> Funkce, které slouží k vyvolání vedlejšího efektu a explicitně nic nevrací, se anotují návratovým typem **`-> None:`**.

---
<!-- slide: id3, Atribut __annotations__ a inspect.get_annotations(), Core, pythonic -->
## Kde jsou anotace uloženy: `inspect.get_annotations()`

Interpret Pythonu za běhu uloží anotace do speciálního slovníku v atributu funkce **`__annotations__`**:

```python
def pozdrav(jmeno: str, pocet: int = 1) -> str:
    return f"Ahoj {jmeno}! " * pocet

print(pozdrav.__annotations__)
# {'jmeno': <class 'str'>, 'pocet': <class 'int'>, 'return': <class 'str'>}
```

Návratový typ je uložen pod speciálním vyhrazeným klíčem `'return'`.

### Doporučený moderní přístup (Python 3.10+):
Místo přímého čtení dunder atributu doporučuje oficiální dokumentace funkci **`inspect.get_annotations()`**, která bezpečně vyhodnotí stringifikované anotace:

```python
import inspect

anotace = inspect.get_annotations(pozdrav)
print(anotace["return"])  # <class 'str'>
```

---
<!-- slide: id4, Běh interpretu vs. statická typová kontrola (Mypy), Tricky, paradigm -->
## Zásadní fakt: Interpret anotace za běhu NEVYNUCOJE!

Mnoho programátorů přicházejících z C++ nebo Javy se mylně domnívá, že Python při porušení anotace vyhodí chybu. **To je omyl!**

```python
def secti(a: int, b: int) -> int:
    return a + b

# CPython toto volání bez řečí provede!
vysledek = secti("Ahoj ", "světe")
print(vysledek)  # 'Ahoj světe'  <- Žádný TypeError!
```

> [!IMPORTANT] Statická kontrola v CI pipeline
> Typovou čistotu v Pythonu nevynucuje interpret za běhu, ale **statický typový kontrolor** (*static type checker*) spouštěný během vývoje nebo v CI/CD pipeline:
> ```bash
> mypy app/
> # Success: no issues found in 42 source files
> ```

---
<!-- slide: id5, Moderní sjednocení typů: Operátor | (PEP 604), Skip, pythonic -->
## Sjednocení typů operátorem `|` (Python 3.10+, PEP 604)

V dřívějších verzích Pythonu se musel importovat `Union` a `Optional` z modulu `typing`. V moderním Pythonu píšeme přirozený operátor svislítka `|`:

```python
# 📜 Zastaralý přístup (Python < 3.10):
# from typing import Union, Optional
# def najdi(id: int) -> Optional[str]: ...
# def parse(vstup: Union[int, str]) -> float: ...

# ✨ Moderní standard (Python 3.10+):
def najdi(id: int) -> str | None:
    """Vrátí nalezený řetězec, nebo None."""
    return "Nalezeno" if id > 0 else None

def parse(vstup: int | str | float) -> float:
    """Přijímá int, str nebo float."""
    return float(vstup)
```

---
<!-- slide: id6, Strukturální typování a duck typing: collections.abc, Skip, pythonic -->
## Zachování Duck Typingu: `collections.abc` vs. konkrétní typy

Pokud parametr funkce anotujete jako `list[int]`, zakážete tím volajícímu předat n-tici `tuple[int, ...]`, množinu `set[int]` nebo generátor.

Pro zachování flexibility (*duck typing*) anotujte parametry pomocí obecných rozhraní z modulu **`collections.abc`**:

```python
from collections.abc import Iterable, Sequence

# ❌ Příliš restriktivní: akceptuje POUZE list
def soucet_spatne(hodnoty: list[int]) -> int:
    return sum(hodnoty)

# ✅ Idiomatické a flexibilní: akceptuje list, tuple, range, generátor...
def soucet_dobre(hodnoty: Iterable[int]) -> int:
    return sum(hodnoty)

# ✅ Vyžaduje indexaci a délku (list, tuple, str):
def prvni_a_posledni[T](seq: Sequence[T]) -> tuple[T, T]:
    return seq[0], seq[-1]
```

---
<!-- slide: id7, Běhová validace dat: Pydantic (@validate_call), WOW, newconcept -->
## Běhová validace dat: Moderní ekosystém Pydantic

Pokud vyvíjíte webové API nebo zpracováváte data od uživatele a **vyžadujete striktní běhovou kontrolu a konverzi typů**, nespoléháme na manuální `isinstance()`, ale na knihovnu **Pydantic**:

```python
from pydantic import validate_call

@validate_call
def registrace(jmeno: str, vek: int, email: str) -> str:
    return f"Uživatel {jmeno} ({vek}) registrován."

# Automatická konverze platných typů:
print(registrace("Alice", "25", "alice@example.com"))  # vek převeden na int 25!

# Běhová výjimka při nevalidním vstupu:
# registrace("Bob", "neni_cislo", "chybny_email")
# pydantic_core._pydantic_core.ValidationError: 1 validation error for registrace...
```

---
<!-- slide: id8, Generické funkce v Pythonu 3.12+ (PEP 695), Tricky, paradigm -->
## Generické funkce v Pythonu 3.12+ (PEP 695)

Python 3.12 přinesl revoluci v zápisu generických funkcí. Již není nutné deklarovat proměnné `TypeVar("T")` – typový parametr se zapisuje přímo do hranatých závorek za název funkce:

```python
from collections.abc import Sequence

# ✨ Nová čistá syntaxe Pythonu 3.12+ (PEP 695):
def ziskej_stred[T](kolekce: Sequence[T]) -> T:
    """Generická funkce pracující s libovolným typem T."""
    index = len(kolekce) // 2
    return kolekce[index]

# Typový kontrolor automaticky odvodí návratový typ:
int_prvek: int = ziskej_stred([10, 20, 30])
str_prvek: str = ziskej_stred(["prvni", "druhy", "treti"])
```

Tato syntaxe je znatelně čistší a odpovídá generikám v jazycích jako TypeScript, Rust, C# či Java.

---
<!-- slide: id9, Dopředné reference a __future__.annotations, Skip, basics -->
## Dopředné reference a `from __future__ import annotations`

Pokud metoda třídy potřebuje vrátit instanci téže třídy, v době parsování metody samotná třída ještě není plně zkonstruována:

```python
from __future__ import annotations  # PEP 563: Odložené vyhodnocení anotací

class Bod:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    # Bez __future__ importu by 'Bod' v době definice nebyl znám!
    def posun(self, dx: float, dy: float) -> Bod:
        return Bod(self.x + dx, self.y + dy)
```

Direktiva `from __future__ import annotations` způsobí, že všechny typové anotace v souboru jsou interpretovány jako řetězce, což eliminuje problémy s cyklickými a dopřednými importy.
