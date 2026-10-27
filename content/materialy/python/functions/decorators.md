<!-- slide: id1, Úvod, Core, newconcept -->
## Dekorátory v Pythonu (Syntaktický cukr `@`)

**Dekorátor** (*decorator*) je funkce vyššího řádu, která přijímá jinou funkci (nebo třídu) jako argument, rozšiřuje nebo modifikuje její chování a vrací upravenou (či obalenou) funkci:

Zápis s operátorem **`@`** (PEP 318) je přehledným **syntaktickým cukrem**:

```python
@muj_dekorator
def pozdrav(jmeno: str) -> str:
    return f"Ahoj, {jmeno}!"
```

Tento zápis je přesným ekvivalentem následujícího přiřazení:

```python
def pozdrav(jmeno: str) -> str:
    return f"Ahoj, {jmeno}!"

# Původní funkce je nahrazena výsledkem volání dekorátoru:
pozdrav = muj_dekorator(pozdrav)
```

Dekorátory představují v Pythonu elegantní realizaci návrhového vzoru *Decorator* i aspektově orientovaného programování (AOP).

---
<!-- slide: id2, Poznámka, Skip, newconcept -->
## Vstup a výstup dekorátoru

Základní kontrakt dekorátoru:
> **Vstupem dekorátoru je volatelný objekt (funkce) a výstupem je rovněž volatelný objekt.**

Dekorátor sám o sobě se vyhodnotí **v okamžiku definice funkce** (při importu modulu), nikoli až při jejím volání!

Pokud by dekorátor nevrátil funkci, ale například řetězec nebo `None`, jméno dekorované funkce by přestalo být volatelným objektem:
```python
def spatny_dekorator(fn):
    return "nejsem funkce"

@spatny_dekorator
def test():
    pass

test()  # TypeError: 'str' object is not callable
```

---
<!-- slide: id3, Konstrukce dekorátoru I, Core, newconcept -->
## Základní konstrukce: Vnitřní obalovací funkce (Wrapper)

Aby dekorátor přidal kód spouštěný *při každém volání*, definuje uvnitř sebe novou funkci (**wrapper**) a vrátí ji jako [uzávěr (closure)](advanced-1.md):

```python
from collections.abc import Callable

def trasuj(funkce: Callable[[], None]) -> Callable[[], None]:
    def wrapper() -> None:
        print("[START] Volání funkce")
        funkce()
        print("[KONEC] Funkce dokončena")
    return wrapper

@trasuj
def akce() -> None:
    print("  -> Provádím hlavní práci...")

akce()
# [START] Volání funkce
#   -> Provádím hlavní práci...
# [KONEC] Funkce dokončena
```

---
<!-- slide: id4, Poznámka, Tricky, paradigm -->
## Záměna identity původní funkce

Jakmile funkci odekorujeme, její původní objekt je nahrazen vnitřní funkcí `wrapper`:

```python
def dekorator(fn):
    def wrapper():
        return fn()
    return wrapper

@dekorator
def original():
    pass

print(original)
# <function dekorator.<locals>.wrapper at 0x...>

print(original.__name__)
# 'wrapper' (Původní jméno 'original' bylo přepsáno!)
```

Tuto ztrátu metadat řešíme standardním dekorátorem **`@functools.wraps`** (detailně na [slajdu 16](#id16)).

---
<!-- slide: id5, Konstrukce dekorátoru II, Skip, pythonic -->
## Zachování návratové hodnoty

Dekorovaná funkce často vrací výsledek. Vnitřní wrapper jej musí zachytit do dočasné proměnné, dokončit případnou úklidovou činnost a hodnotu korektně vrátit volajícímu:

```python
from collections.abc import Callable

def loguj_vysledek[R](funkce: Callable[[], R]) -> Callable[[], R]:
    def wrapper() -> R:
        print("Spouštím výpočet...")
        vysledek = funkce()  # Zachycení návratové hodnoty
        print(f"Výsledek získán: {vysledek}")
        return vysledek      # Vrácení původního výsledku
    return wrapper

@loguj_vysledek
def spocti_tajemstvi() -> int:
    return 42

odpoved = spocti_tajemstvi()
print(f"Přijato: {odpoved}")
```

---
<!-- slide: id6, Příklad, Core, pythonic -->
## Praktický příklad: Měření doby běhu (Benchmark)

Znovupoužitelný dekorátor pro měření času běhu libovolné bezparametrické funkce:

```python
from collections.abc import Callable
import time

def casomira[R](funkce: Callable[[], R]) -> Callable[[], R]:
    def wrapper() -> R:
        start = time.perf_counter()
        vysledek = funkce()
        trvani = time.perf_counter() - start
        print(f"Funkce '{funkce.__name__}' trvala {trvani * 1000:.3f} ms")
        return vysledek
    return wrapper

@casomira
def rychla_uloha() -> None:
    sum(range(100_000))

@casomira
def pomala_uloha() -> None:
    time.sleep(0.05)

rychla_uloha()
pomala_uloha()
```

Jeden dekorátor aplikujeme na libovolný počet funkcí bez duplikace kódu.

---
<!-- slide: id7, PS: Atributy funkcí, WOW, paradigm -->
## Funkce jako objekty: Vlastní atributy funkcí

Protože funkce jsou v Pythonu plnohodnotnými instancemi třídy `function`, můžeme k nim dynamicky přiřazovat vlastní atributy:

```python
def registruj(funkce):
    def wrapper(*args, **kwargs):
        wrapper.pocet_volani += 1
        return funkce(*args, **kwargs)
    
    wrapper.pocet_volani = 0  # Inicializace atributu na wrapperu
    return wrapper

@registruj
def ping():
    print("pong")

ping()
ping()
ping()
print(f"Počet volání funkce: {ping.pocet_volani}")  # 3
```

Tento mechanismus často využívají routovací tabulky (Flask `@app.route`), registrace pluginů nebo počítadla metrik.

---
<!-- slide: id8, Předávání parametrů funkci, Skip, pythonic -->
## Podpora pro argumenty funkce

Pokud dekorovaná funkce přijímá parametry, musí je vnitřní wrapper převzít a předat dál původní funkci:

```python
def trasuj(funkce):
    def wrapper(jmeno: str):
        print(f"Příprava pro uživatele: {jmeno}")
        return funkce(jmeno)
    return wrapper

@trasuj
def privitej(jmeno: str):
    print(f"Vítej, {jmeno}!")

privitej("David")
```

Tento zápis je však nepružný – funguje pouze pro funkce s přesně jedním argumentem `jmeno`.

---
<!-- slide: id9, Příklad, Core, pythonic -->
## Univerzální signatura: `*args` a `**kwargs`

Aby dekorátor fungoval pro **jakoukoliv** funkci s libovolným počtem pozičních i pojmenovaných argumentů, používáme sběrné parametry `*args` a `**kwargs`:

```python
from functools import wraps
from collections.abc import Callable

def audit_volani[**P, R](funkce: Callable[P, R]) -> Callable[P, R]:
    @wraps(funkce)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"Volána '{funkce.__name__}' s args={args}, kwargs={kwargs}")
        vysledek = funkce(*args, **kwargs)
        print(f"'{funkce.__name__}' dokončena.")
        return vysledek
    return wrapper

@audit_volani
def secti(a: int, b: int, debug: bool = False) -> int:
    return a + b

print(secti(10, 20, debug=True))
# Volána 'secti' s args=(10, 20), kwargs={'debug': True}
# 'secti' dokončena.
# 30
```

> [!TIP] Moderní typování dekorátorů (Python 3.10+)
> Pomocí `typing.ParamSpec` (`P`) a TypeVar (`R`) zajistíme, že dekorovaná funkce neztratí svou původní signaturu a IDE nabízí přesný autocomplete pro všechny argumenty!

---
<!-- slide: id10, Předávání parametrů dekorátoru I, Tricky, newconcept -->
## Konfigurovatelné dekorátory (Dekorátory s parametry)

Často chceme dekorátoru předat konfigurační hodnoty, např. `@opakuj(pokusu=3)` nebo `@omez(maximum=100)`.

V takovém případě zápis `@dekorator(parametr)` znamená:
1. Nejprve se zavolá funkce `dekorator(parametr)`.
2. Ta musí vrátit **samotný dekorátor** (funkci přijímající původní funkci).
3. A ten vrátí finální **wrapper**.

Jedná se o **tříúrovňový uzávěr**:

```python
def omez_maximum(max_hodnota: int):
    """1. úroveň: Přijímá konfiguraci dekorátoru."""
    def dekorator(funkce):
        """2. úroveň: Přijímá dekorovanou funkci."""
        def wrapper(cisla: list[int]) -> list[int]:
            """3. úroveň: Vlastní tělo nahrazující volání."""
            filtrovana = [x for x in cisla if x <= max_hodnota]
            return funkce(filtrovana)
        return wrapper
    return dekorator

@omez_maximum(10)
def druhe_mocniny(cisla: list[int]) -> list[int]:
    return [x**2 for x in cisla]

print(druhe_mocniny([2, 5, 12, 8, 20]))
# Spočítá mocniny pouze pro [2, 5, 8] -> [4, 25, 64]
```

---
<!-- slide: id11, Předávání parametrů dekorátoru II, Core, newconcept -->
## Anatomie tříúrovňového dekorátoru

Pro snadné zapamatování:

$$\underbrace{\text{@dekorator(volby)}}_{\text{Továrna na dekorátory}} \implies \underbrace{\text{dekorator(volby)}}_{\text{Vrací dekorátor}}(\underbrace{\text{funkce}}_{\text{Cílová funkce}}) \implies \underbrace{\text{wrapper}}_{\text{Nová funkce}}$$

```python
# Co se děje pod kapotou:
# 1. Zavolá se omez_maximum(10) -> vrátí funkci 'dekorator'
skutecny_dekorator = omez_maximum(10)

# 2. Zavolá se skutecny_dekorator(druhe_mocniny) -> vrátí 'wrapper'
druhe_mocniny = skutecny_dekorator(druhe_mocniny)
```

Tento vzor se v knihovnách používá neustále:
- `@pytest.mark.parametrize(...)`
- `@app.route("/api/users", methods=["GET"])`
- `@functools.lru_cache(maxsize=128)`

---
<!-- slide: id12, Řetězení dekorátorů I, Tricky, newconcept -->
## Řetězení dekorátorů (Stacking Decorators)

Nad jednu funkci můžeme umístit více dekorátorů za sebou:

```python
def zdurazni(fn):
    def wrapper(*args, **kwargs):
        return f"<b>{fn(*args, **kwargs)}</b>"
    return wrapper

def kurziva(fn):
    def wrapper(*args, **kwargs):
        return f"<i>{fn(*args, **kwargs)}</i>"
    return wrapper

@zdurazni
@kurziva
def pozdrav(jmeno: str) -> str:
    return f"Ahoj {jmeno}"

print(pozdrav("Alice"))
# <b><i>Ahoj Alice</i></b>
```

### Pořadí vyhodnocování:
Dekorátory se aplikují **odspodu nahoru** (směrem od funkce k vnějšímu obalu):
$$\text{pozdrav} = \text{zdurazni}(\text{kurziva}(\text{pozdrav}))$$

Při volání se kód wrapperu vykoná v opačném pořadí (shora dolů).

---
<!-- slide: id13, Řetězení dekorátorů II, Skip, newconcept -->
## Řetězení s konfiguračními parametry

Při kombinaci parametrů a řetězení zůstává pravidlo vyhodnocování stejné:

```python
@dekorator_a(volba=1)
@dekorator_b
def moje_funkce():
    pass

# Ekvivalentní imperativní zápis:
moje_funkce = dekorator_a(volba=1)(dekorator_b(moje_funkce))
```

Díky elegantní syntaxi `@` je složitá kompozice funkcí přehledná a deklarativní.

---
<!-- slide: id14, Použití, Core, basics -->
## Typické scénáře použití v praxi

Dekorátory jsou v moderním Pythonu jedním z nejpoužívanějších nástrojů:

1. **Webové frameworky a směrování** (FastAPI, Flask, Django):
   ```python
   @app.get("/users/{user_id}")
   async def get_user(user_id: int): ...
   ```
2. **Autentizace a autorizace**:
   ```python
   @login_required
   @has_permission("admin")
   def smazat_databazi(): ...
   ```
3. **Měření výkonu a telemetrie**:
   - Trasování logů, měření času běhu, odesílání metrik do Prometheus/Datadog.
4. **Ošetření výpadků (Resilience)**:
   - Opakování neúspěšných síťových volání (`@retry(retries=3, delay=1.0)`).
5. **Validace vstupních dat a typová kontrola za běhu**.

---
<!-- slide: id15, Knihovna dekorátorů, Skip, basics -->
## Standardní dekorátory v Pythonu

CPython přichází s bohatou sadou předpřipravených dekorátorů:

| Modul | Dekorátor | Účel |
| :--- | :--- | :--- |
| **builtins** | `@classmethod`, `@staticmethod` | Třídní a statické metody ve třídách |
| **builtins** | `@property` | Zapouzdření getterů / setterů v OOP |
| **functools** | `@wraps` | Zachování identity obalené funkce |
| **functools** | `@cache`, `@lru_cache` | Automatická memoizace |
| **functools** | `@total_ordering` | Generování porovnávacích operátorů |
| **dataclasses** | `@dataclass` | Automatické generování `__init__`, `__repr__` |
| **contextlib** | `@contextmanager` | Snadná tvorba bloků `with` z generátoru |

---
<!-- slide: id16, Poznámka k otisku funkce & „@functools.wraps“, WOW, pythonic -->
## Zachování metadat: `@functools.wraps`

Jak jsme viděli na [slajdu 4](#id4), wrapper standardně přepíše jméno i docstring funkce. To ničí dokumentaci, introspekci v IDE i chybové výpisy:

```python
from functools import wraps

def profesionalni_dekorator(fn):
    @wraps(fn)  # Zkopíruje __name__, __doc__, __module__, __annotations__
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper

@profesionalni_dekorator
def vypocet():
    """Tento docstring zůstane zachován."""
    pass

print(vypocet.__name__)  # 'vypocet'
print(vypocet.__doc__)   # 'Tento docstring zůstane zachován.'
```

> [!IMPORTANT] Zlaté pravidlo pro tvorbu dekorátorů
> **Vždy použijte `@functools.wraps(fn)` nad vnitřním wrapperem!** Vyhnete se záhadným chybám při ladění, generování dokumentace i testování.

---
<!-- slide: id17, Poznámka, Skip, pythonic -->
## Třídy jako dekorátory (`__call__`)

Dekorátor nemusí být pouze funkce. Může jím být i **třída**, která implementuje dunder metodu `__call__()`:

```python
class PocitadloVolani:
    def __init__(self, func):
        self.func = func
        self.pocet = 0

    def __call__(self, *args, **kwargs):
        self.pocet += 1
        print(f"Funkce '{self.func.__name__}' volána po {self.pocet}x")
        return self.func(*args, **kwargs)

@PocitadloVolani
def pozdrav():
    print("Ahoj!")

pozdrav()  # Funkce 'pozdrav' volána po 1x \n Ahoj!
pozdrav()  # Funkce 'pozdrav' volána po 2x \n Ahoj!
```

Tento přístup je vhodný, pokud dekorátor spravuje rozsáhlejší vnitřní stav nebo vyžaduje více pomocných metod.

---
<!-- slide: id18, Poznámka k dekorování generátorů, Skip, newconcept -->
## Dekorování generátorových funkcí

Chceme-li odekorovat funkci, která vrací generátor (obsahuje `yield`), obyčejný wrapper selže, protože generátor vrací hodnoty postupně:

```python
from functools import wraps
from collections.abc import Iterator

def loguj_stream(gen_func):
    @wraps(gen_func)
    def wrapper(*args, **kwargs) -> Iterator:
        print("[STREAM] Zahájení odběru dat")
        # yield from deleguje iteraci na původní generátor prvek po prvku:
        yield from gen_func(*args, **kwargs)
        print("[STREAM] Proud dat vyčerpán")
    return wrapper

@loguj_stream
def data():
    yield 1
    yield 2

for hodnota in data():
    print(f"Přijato: {hodnota}")
```

Použitím `yield from` ve wrapperu zůstává dekorovaná funkce plnohodnotným líným generátorem.
