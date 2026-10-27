<!-- slide: id1, Úvod, Core, paradigm -->
## Introspekce a reflexe v Pythonu

V dynamických jazycích označuje **introspekce** (*introspection*) schopnost programu zkoumat typ, vlastnosti, atributy a metadata objektů za běhu (*runtime*).

Python posouvá introspekci na nejvyšší úroveň – protože je všechno objektem, program může kdykoliv položit otázky:
- *Kdo jsi a jaká je tvá identita?* (`id()`, `type()`, `isinstance()`)
- *Jaké atributy a metody nabízíš?* (`dir()`, `hasattr()`, `getattr()`)
- *Jaká je tvá signatura a dokumentace?* (`callable()`, `__doc__`, `inspect.signature()`)
- *Kdo jsou tví předci v hierarchii dědičnosti?* (`__class__`, `__mro__`, `issubclass()`)

---
<!-- slide: id2, Testovací struktura, Core, basics -->
## Ukázková hierarchie pro zkoumání

Prozkoumejme introspekční nástroje na hierarchii školních tříd:

```python
class Clovek:
    """Bázová reprezentace člověka."""
    def __init__(self, jmeno: str, krevni_skupina: str) -> None:
        self.jmeno = jmeno
        self.krevni_skupina = krevni_skupina

class Skolak(Clovek):
    """Reprezentace žáka ve škole."""
    pocet_zaku: int = 0

    def __init__(self, jmeno: str, krevni_skupina: str, trida: str) -> None:
        super().__init__(jmeno, krevni_skupina)
        self.trida = trida
        Skolak.pocet_zaku += 1

    def studuj(self) -> str:
        """Metoda reprezentující studium."""
        return f"{self.jmeno} se učí."

alisa = Skolak("Alisa Selezneva", "0", "3. A")
```

---
<!-- slide: id3, [I] print() & __str__(), Core, basics -->
## Textová reprezentace pro uživatele: `__str__()`

Když zavoláme `print(obj)` nebo `str(obj)`, Python pod kapotou vyhledá dunder metodu **`__str__()`**:
- Je určena pro **koncové uživatele**.
- Měla by být přirozeně čitelná, přehledná a formátovaná.
- Pokud třída `__str__` nedefinuje, Python automaticky použije fallback na `__repr__`.

```python
# Bez vlastní implementace __str__ vrátí Python výchozí identifikaci:
print(alisa)
# <__main__.Skolak object at 0x7f8b90123450>
```

---
<!-- slide: id4, [I] __repr__(), Core, pythonic -->
## Ladicí reprezentace pro vývojáře: `__repr__()`

Metoda **`__repr__()`** (volaná funkcí `repr(obj)` nebo při vyhodnocení v interaktivním shellu):
- Je určena pro **programátory a ladění**.
- Měla by být jednoznačná a pokud možno odpovídat **platnému Python kódu**, kterým lze objekt znovu vytvořit:

```python
class Bod:
    def __init__(self, x: int, y: int) -> None:
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        return f"Bod(x={self.x}, y={self.y})"

    def __str__(self) -> str:
        return f"[{self.x}, {self.y}]"

b = Bod(10, 20)
print(str(b))   # [10, 20]     (pro uživatele)
print(repr(b))  # Bod(x=10, y=20) (pro vývojáře)
```

---
<!-- slide: id5, [I] help(), Core, basics -->
## Interaktivní nápověda: `help()` a atribut `__doc__`

Funkce `help(obj)` sestavuje nápovědu z docstringů uložených v magickém atributu **`__doc__`**:

```python
print(alisa.__doc__)
# 'Reprezentace žáka ve škole.'

print(alisa.studuj.__doc__)
# 'Metoda reprezentující studium.'
```

Dokumentační řetězce nejsou v Pythonu pouhými komentáři – interpret je při kompilaci uchovává v bytecode jako data objektu přístupná za běhu.

---
<!-- slide: id6, [I] id(), Tricky, newconcept -->
## Identita objektu v paměti: `id()`

Funkce **`id(obj)`** vrací unikátní celočíselný identifikátor objektu po dobu jeho existence:
- V CPythonu odpovídá přímo **adrese paměťového bloku** v paměti RAM.
- Operátor **`is`** porovnává identitu: `a is b` $\iff$ `id(a) == id(b)`.

```python
x = [1, 2, 3]
y = x
z = [1, 2, 3]

print(id(x) == id(y))  # True (stejný objekt v RAM)
print(id(x) == id(z))  # False (dvě nezávislé instance se stejným obsahem)
```

> [!WARNING] Recyklace paměťových adres
> Jakmile objekt zanikne (jeho reference count klesne na 0), paměťový alokátor může stejnou adresu přidělit nově vytvořenému objektu. Dva objekty existující v různém čase tak mohou mít stejné `id()`.

---
<!-- slide: id7, [II] dir() (a), Core, basics -->
## Seznam atributů: Funkce `dir()`

Funkce `dir(obj)` vrátí seřazený seznam názvů všech atributů a metod dostupných na daném objektu (včetně zděděných z předků):

```python
atributy = dir(alisa)
print([a for a in atributy if not a.startswith("__")])
# ['jmeno', 'krevni_skupina', 'pocet_zaku', 'studuj', 'trida']
```

Pod kapotou volá `dir(obj)` dunder metodu `obj.__dir__()`.

---
<!-- slide: id8, [II] dir() (b), Core, pythonic -->
## Jmenný prostor instance: `__dict__`

Atributy běžné instance jsou fyzicky uloženy ve standardním slovníku **`__dict__`**:

```python
print(alisa.__dict__)
# {'jmeno': 'Alisa Selezneva', 'krevni_skupina': '0', 'trida': '3. A'}
```

Všimněte si: metoda `studuj` a třídní proměnná `pocet_zaku` v instančním slovníku **nejsou** – ty žijí ve slovníku třídy `Skolak.__dict__`!

---
<!-- slide: id9, [II] callable(), Core, basics -->
## Ověření volatelnosti: `callable()`

Funkce `callable(obj)` ověří, zda lze za objekt připojit závorky `()` pro volání:

```python
print(callable(alisa.jmeno))    # False (datový řetězec)
print(callable(alisa.studuj))   # True  (metoda)
print(callable(Skolak))         # True  (třída je volatelná továrna na instance)
```

Objekt je volatelný právě tehdy, když jeho třída implementuje magickou metodu **`__call__()`**.

---
<!-- slide: id10, [II] getattr() & hasattr(), WOW, pythonic -->
## Dynamický přístup: `getattr()` a `hasattr()`

Pokud název atributu známe až za běhu (např. z konfiguračního souboru nebo uživatelského vstupu), použijeme funkce pro dynamický přístup:

```python
nazev = "trida"

# 1. Zjištění existence atributu:
if hasattr(alisa, nazev):
    # 2. Bezpečné získání hodnoty:
    hodnota = getattr(alisa, nazev)
    print(f"{nazev} = {hodnota}")  # trida = 3. A

# 3. Získání s výchozí hodnotou při neexistenci:
vek = getattr(alisa, "vek", 12)
print(f"Věk: {vek}")  # 12
```

---
<!-- slide: id11, [II] Poznámka – setattr(), Core, pythonic -->
## Dynamický zápis: `setattr()` a `delattr()`

Obdobně můžeme atributy za běhu dynamicky nastavovat nebo odstraňovat:

```python
# Nastavení atributu:
setattr(alisa, "stipendium", 1500)
print(alisa.stipendium)  # 1500

# Ekvivalent:
delattr(alisa, "stipendium")
# del alisa.stipendium
```

Tyto funkce tvoří základ dynamické deserializace (např. převod JSONu do objektových instancí).

---
<!-- slide: id12, [II] Poznámka – __dict__ & singletony, Tricky, paradigm -->
## Přímá manipulace s `__dict__`

V běžném kódu přistupujeme k atributům přes tečku. Přímý zásah do `__dict__` se používá v pokročilém metaprogramování pro obejití metody `__setattr__`:

```python
class ZamknutyObjekt:
    def __init__(self, x: int) -> None:
        # Přímý zápis do slovníku obejde naši metodu __setattr__:
        self.__dict__["x"] = x
        self.__dict__["_zamceno"] = True

    def __setattr__(self, name: str, value: object) -> None:
        if getattr(self, "_zamceno", False):
            raise AttributeError("Objekt je zamknutý pro zápis!")
        self.__dict__[name] = value

obj = ZamknutyObjekt(42)
print(obj.x)  # 42
# obj.x = 100 # AttributeError: Objekt je zamknutý pro zápis!
```

---
<!-- slide: id13, [II] Poznámka – __slots__, Tricky, newconcept -->
## Paměťová optimalizace: `__slots__`

Pokud aplikace vytváří miliony instancí jednoduché třídy, režie slovníku `__dict__` (~150 bajtů na instanci) spotřebuje stovky megabajtů RAM.

Deklarací **`__slots__`** nahradíme dynamický slovník fixním polem referencí v C struktuře:

```python
class BodSlots:
    __slots__ = ("x", "y")

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

b = BodSlots(1.0, 2.0)
print(hasattr(b, "__dict__"))  # False! Instance nemá žádný slovník!
# b.z = 3.0  # AttributeError: 'BodSlots' object has no attribute 'z'
```

Úspora paměti je až **60 %** a přístup k atributům je měřitelně rychlejší.

---
<!-- slide: id14, [III] type(), Core, basics -->
## Typová identita: `type()` vs. `__class__`

Funkce `type(obj)` vrací typový objekt třídy, z níž byla instance vytvořena:

```python
print(type(alisa))             # <class '__main__.Skolak'>
print(type(alisa) is Skolak)   # True
print(alisa.__class__.__name__) # 'Skolak'
```

> [!WARNING] Proč neověřovat typy přes `type(obj) is Trida`?
> Přímé porovnání `type(alisa) is Clovek` vrátí `False`, protože ignoruje dědičnost! Vždy používejte `isinstance()`.

---
<!-- slide: id15, [III] isinstance(), Core, resyntax -->
## Ověřování hierarchie: `isinstance()`

Funkce `isinstance(obj, typ)` bere v úvahu celou hierarchii dědičnosti:

```python
print(isinstance(alisa, Skolak))  # True
print(isinstance(alisa, Clovek))  # True (Skolak je potomkem Clovek)
print(isinstance(alisa, object))  # True (vše v Pythonu dědí z object)
```

### Moderní Python 3.10+ Union syntaxe:
Od Pythonu 3.10 můžeme druhý parametr zadat pomocí operátoru `|`:
```python
hodnota = 42
print(isinstance(hodnota, int | float | str))  # True
```

---
<!-- slide: id16, [III] issubclass(), Core, resyntax -->
## Vztahy mezi třídami: `issubclass()`

Funkce `issubclass(Podtrida, Nadtrida)` zkoumá vztah mezi dvěma třídami:

```python
print(issubclass(Skolak, Clovek))  # True
print(issubclass(Clovek, Skolak))  # False
print(issubclass(Skolak, Skolak))  # True (každá třída je podtřídou sebe sama)
```

---
<!-- slide: id17, Příklad, Core, pythonic -->
## Univerzální introspekční inspektor

Funkce demonstrující sílu introspekce v Pythonu:

```python
import inspect

def analyzuj_objekt(obj: object) -> None:
    print(f"Jméno třídy: {obj.__class__.__name__}")
    print(f"Modul:       {getattr(obj, '__module__', 'N/A')}")
    print(f"ID v RAM:    0x{id(obj):x}")
    print(f"Volatelný:   {callable(obj)}")
    
    doc = inspect.getdoc(obj)
    prvni_radek_doc = doc.splitlines()[0] if doc else "Bez dokumentace"
    print(f"Docstring:   {prvni_radek_doc}")
    
    verejne = [attr for attr in dir(obj) if not attr.startswith("_")]
    print(f"Veřejné API: {', '.join(verejne)}")

analyzuj_objekt(alisa)
```
