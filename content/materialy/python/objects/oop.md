<!-- slide: id1, Úvod, Core, paradigm -->
## Objektově orientované programování (OOP) v Pythonu

V Pythonu je **všechno objektem** (*Everything is an object*) – čísla, řetězce, seznamy, funkce, moduly i samotné třídy.

Filozofie OOP v Pythonu se však zásadně liší od rigidních jazyků jako Java nebo C++:
- **Žádné vynucené modifikátory přístupu**: V Pythonu neexistují striktní klíčová slova `private`, `protected` nebo `public`.
- **Zásada konsensu**: Řídíme se pravidlem komunity: *„We are all consenting adults here“* (všichni jsme svéprávní dospělí lidé) – spoléháme na konvence a dokumentaci.
- **Duck typing**: Místo formálních rozhraní (interfaces) nás zajímá, zda objekt podporuje požadované chování: *„Pokud to kváká jako kachna a chodí jako kachna, je to pro nás kachna.“*

---
<!-- slide: id2, Ukázková struktura, Core, resyntax -->
## Ukázková hierarchie tříd

Probereme si objektový model na školní hierarchii:

```python
class Clovek:
    """Základní bázová třída reprezentující osobu."""

    def __init__(self, jmeno: str, datum_narozeni: str) -> None:
        self.jmeno = jmeno
        self.datum_narozeni = datum_narozeni

class Skolak(Clovek):
    """Školák dědící z třídy Clovek s evidencí třídního počitadla."""

    pocet_skolaku: int = 0  # Třídní atribut (sdílený)

    def __init__(self, jmeno: str, datum_narozeni: str, trida: str, znamky: dict[str, int]) -> None:
        super().__init__(jmeno, datum_narozeni)
        self.trida = trida
        self.znamky = znamky
        Skolak.pocet_skolaku += 1

    def prumerna_znamka(self) -> float:
        """Instanční metoda počítající studijní průměr."""
        if not self.znamky:
            return 0.0
        return sum(self.znamky.values()) / len(self.znamky)
```

---
<!-- slide: id3, Instance třídy, Core, resyntax -->
## Vytvoření instance třídy

Objekt vytváříme zavoláním jména třídy jako funkce (konstruktor):

```python
alisa = Skolak(
    jmeno="Alisa Selezneva",
    datum_narozeni="2065-11-17",
    trida="3. A",
    znamky={"matematika": 1, "zemepis": 1}
)

print(alisa.jmeno)               # 'Alisa Selezneva'
print(alisa.prumerna_znamka())    # 1.0
```

> [!NOTE] Kde se vzal parametr `self`?
> Všimněte si, že v definici `def __init__(self, jmeno, ...)` je prvním parametrem `self`, ale při volání `Skolak("Alisa", ...)` jej nepředáváme! Python referenci na nově vytvořenou instanci předá do `self` automaticky za nás.

---
<!-- slide: id4, Argument „self“, Core, newconcept -->
## Explicitní parametr `self`

V Javě a C++ je ukazatel na aktuální instanci (`this`) skrytý a implicitní. V Pythonu je **explicitní**:
- Každá instanční metoda musí mít instanci jako svůj **první formální parametr**.
- Zvykem je pojmenovat jej **`self`**.

### Jak se metoda překládá za běhu:
```python
# Objektové volání metody:
alisa.prumerna_znamka()

# Je přesným ekvivalentem volání funkce na třídě s předáním instance:
Skolak.prumerna_znamka(alisa)
```

Tento mechanismus se nazývá **vázaná metoda** (*bound method*): metoda třídy je svázána s konkrétní instancí `alisa`.

---
<!-- slide: id5, Konstruktor „__init__()“ I, Core, resyntax -->
## Inicializace instance: Dunder metoda `__init__()`

Metoda `__init__()` slouží k inicializaci stavu nově vytvořeného objektu:

```python
class Skolak(Clovek):
    def __init__(self, jmeno: str, datum_narozeni: str, trida: str) -> None:
        # 1. Zavolání konstruktoru rodičovské třídy:
        super().__init__(jmeno, datum_narozeni)
        
        # 2. Inicializace vlastních instančních atributů:
        self.trida = trida
```

> [!IMPORTANT] `__new__` vs. `__init__`
> Skutečným konstruktorem, který objekt v paměti alokuje a vytvoří, je metoda **`__new__(cls)`**. Metoda **`__init__(self)`** je pouze inicializátorem, který do již existujícího objektu nastaví počáteční data. V 99 % případů implementujeme pouze `__init__`.

---
<!-- slide: id6, Konstruktor „__init__()“ II, Core, resyntax -->
## Dědičnost konstruktoru

Pokud potomek nedefinuje vlastní metodu `__init__()`, automaticky se zdědí a zavolá `__init__` rodiče:

```python
class Rodic:
    def __init__(self, hodnota: int) -> None:
        self.hodnota = hodnota

class Potomek(Rodic):
    pass  # Nemá vlastní __init__

p = Potomek(42)
print(p.hodnota)  # 42
```

Pokud však potomek definuje vlastní `__init__()`, rodičovský konstruktor je **přepsán** (*overridden*). Chceme-li spustit kód rodiče, musíme jej explicitně zavolat pomocí **`super().__init__(...)`**.

---
<!-- slide: id7, Poznámka – „datové“ třídy I, WOW, pythonic -->
## Moderní Python: Datové třídy (`@dataclass`)

Psaní opakujícího se inicializačního kódu v `__init__` pro objekty, které slouží hlavně k uchovávání dat, je zdlouhavé. Python 3.7+ přinesl dekorátor **`@dataclass`** (PEP 557):

### Místo manuálního `__init__`:
```python
from dataclasses import dataclass

@dataclass
class Bod:
    x: float
    y: float
    popis: str = "Výchozí bod"

# Automaticky vygeneruje __init__, __repr__ a __eq__:
b = Bod(1.5, 2.5)
print(b)              # Bod(x=1.5, y=2.5, popis='Výchozí bod')
print(b == Bod(1.5, 2.5))  # True!
```

---
<!-- slide: id8, Poznámka – „datové“ třídy II, Tricky, pythonic -->
## Pokročilé možnosti `@dataclass`

Modul `dataclasses` nabízí bohaté možnosti konfigurace:

```python
from dataclasses import dataclass, field

@dataclass(frozen=True, order=True)
class Student:
    rocnik: int
    jmeno: str
    predmety: list[str] = field(default_factory=list, compare=False)

    def __post_init__(self) -> None:
        # Spustí se po automatickém __init__:
        if self.rocnik < 1:
            raise ValueError("Ročník musí být kladný!")
```

- **`frozen=True`**: Vytvoří neměnný (immutable) objekt – po vytvoření nelze atributy přepsat, instance je hashovatelná!
- **`order=True`**: Automaticky vygeneruje srovnávací metody (`<`, `<=`, `>`, `>=`).
- **`field(default_factory=list)`**: Zabraňuje nebezpečnému sdílení mutabilních výchozích kolekcí.

---
<!-- slide: id9, Vícenásobná dědičnost, Core, paradigm -->
## Vícenásobná dědičnost (Multiple Inheritance)

Na rozdíl od Javy umožňuje Python dědit z **více rodičovských tříd současně**:

```python
class Potomek(RodicA, RodicB):
    pass
```

### Problém diamantu (Diamond Problem)
V jazycích jako C++ může při vícenásobné dědičnosti dojít k nejednoznačnosti, pokud dvě bázové třídy dědí ze společného předka.

Python tento problém řeší deterministickým algoritmem **C3 Linearization**, který sestavuje jednoznačný seznam pořadí vyhodnocování metod – **MRO** (*Method Resolution Order*).

---
<!-- slide: id10, Vícenásobná dědičnost – příklad, Core, pythonic -->
## Příklad vícenásobné dědičnosti a MRO

```python
class Zvire:
    def zvuk(self) -> str:
        return "..."

class Kocka(Zvire):
    def zvuk(self) -> str:
        return "mňau"

class Pes(Zvire):
    def zvuk(self) -> str:
        return "haf"

class Kockopes(Kocka, Pes):
    pass

class Psokocka(Pes, Kocka):
    pass

kp = Kockopes()
pk = Psokocka()

print(kp.zvuk())  # 'mňau' (Kocka je první v seznamu bází)
print(pk.zvuk())  # 'haf'   (Pes je první v seznamu bází)

# Inspekce pořadí MRO:
print([cls.__name__ for cls in Kockopes.__mro__])
# ['Kockopes', 'Kocka', 'Pes', 'Zvire', 'object']
```

---
<!-- slide: id11, Funkce „super()“, Core, newconcept -->
## Kooperativní vícenásobná dědičnost: `super()`

V moderním Pythonu voláme **`super()` bez argumentů**. Funkce `super()` nevolá bezprostředního rodiče napsaného v závorce třídy, ale **další třídu v pořadí MRO**:

```python
class A:
    def akce(self) -> None:
        print("A")
        super().akce()

class B:
    def akce(self) -> None:
        print("B")

class C(A, B):
    def akce(self) -> None:
        print("C")
        super().akce()

c = C()
c.akce()
# Vytiskne:
# C
# A
# B
```

Díky kooperativnímu řetězení proběhnou všechny implementace v hierarchii právě jednou.

---
<!-- slide: id12, Instanční atributy, Core, basics -->
## Instanční vs. Třídní atributy

- **Instanční atributy** (`self.x`): Jsou unikátní pro každou konkrétní instanci a jsou uloženy v jejím slovníku `instance.__dict__`.
- **Třídní atributy** (`Trida.x`): Jsou sdíleny všemi instancemi dané třídy a jsou uloženy v `Trida.__dict__`.

```python
class Zamestnanec:
    spolecnost = "Google"  # Třídní atribut

    def __init__(self, jmeno: str) -> None:
        self.jmeno = jmeno  # Instanční atribut

z1 = Zamestnanec("Alice")
z2 = Zamestnanec("Bob")

print(z1.spolecnost)  # 'Google'
print(z2.spolecnost)  # 'Google'

# Změna na úrovni třídy se projeví u všech instancí:
Zamestnanec.spolecnost = "Alphabet"
print(z1.spolecnost)  # 'Alphabet'
```

---
<!-- slide: id13, Třídní atributy, Core, resyntax -->
## Třídní metody: `@classmethod`

Třídní metoda přijímá jako první parametr samotnou třídu (`cls`) namísto instance:

```python
class Datum:
    def __init__(self, den: int, mesic: int, rok: int) -> None:
        self.den = den
        self.mesic = mesic
        self.rok = rok

    # Alternativní konstruktor (Factory Method):
    @classmethod
    def z_retezce(cls, text: str) -> "Datum":
        den, mesic, rok = map(int, text.split("-"))
        return cls(den, mesic, rok)

# Vytvoření instance z textu bez volání běžného __init__:
d = Datum.z_retezce("27-10-2026")
print(f"{d.den}. {d.mesic}. {d.rok}")
```

> [!TIP] Proč `cls(...)` a ne `Datum(...)`?
> Pokud z třídy `Datum` vytvoříme potomka (např. `SpecialniDatum`), volání `SpecialniDatum.z_retezce(...)` vrátí správně instanci `SpecialniDatum`!

---
<!-- slide: id14, Statické atributy, Core, resyntax -->
## Statické metody: `@staticmethod`

Dekorátor `@staticmethod` označuje metodu, která nedostává do prvního parametru ani instanci (`self`), ani třídu (`cls`). Je to obyčejná funkce logicky zapouzdřená ve jmenném prostoru dané třídy:

```python
class Matematika:
    @staticmethod
    def je_sude(cislo: int) -> bool:
        return cislo % 2 == 0

print(Matematika.je_sude(10))  # True
print(Matematika.je_sude(7))   # False
```

Používejte střídmě: pokud metoda nepotřebuje stav třídy ani instance, často je lepší definovat samostatnou funkci na úrovni modulu.

---
<!-- slide: id15, „Privátní“ atributy, Tricky, paradigm -->
## Zapouzdření: Konvence `_` vs. Zkomolení jmen `__`

Python rozlišuje dva stupně zapouzdření:

### 1. Jednoduché podtržítko `_chraneny` (Konvence)
- Označuje interní implementační detail API.
- Interpret přístup nezakazuje, ale vývojář i linter vědí, že na atribut nemají zvenčí sahat.

### 2. Dvojité podtržítko `__soukromy` (Name Mangling)
- Zabraňuje nechtěnému přepsání atributu v potomcích (*accidental overriding*).
- Interpret interně přejmenuje atribut na `_Trida__soukromy`:

```python
class Ucet:
    def __init__(self, zustatek: float) -> None:
        self.__zustatek = zustatek

u = Ucet(1000)
# u.__zustatek  # AttributeError!

# Atribut je ale stále dostupný přes zkomolené jméno:
print(u._Ucet__zustatek)  # 1000
```

---
<!-- slide: id16, Deskriptory (aka „properties“), Core, pythonic -->
## Řízení přístupu: Dekorátor `@property`

Dekorátor `@property` umožňuje vystavit metodu jako obyčejný atribut bez změny veřejného rozhraní:

```python
class Teplomer:
    def __init__(self, celsia: float) -> None:
        self._celsia = celsia

    @property
    def celsia(self) -> float:
        """Getter pro teplotu v Celsiích."""
        return self._celsia

    @celsia.setter
    def celsia(self, hodnota: float) -> None:
        """Setter s validací fyzikálního minima."""
        if hodnota < -273.15:
            raise ValueError("Teplota nemůže být pod absolutní nulou!")
        self._celsia = hodnota

t = Teplomer(20.0)
t.celsia = 25.0       # Volá setter
print(t.celsia)       # Volá getter -> 25.0
# t.celsia = -300.0   # Vyhodí ValueError!
```

---
<!-- slide: id17, Kritika OOP, Skip, basics -->
## Pragmatická reflexe OOP

Přestože Python plně podporuje třídy, slepé uctívání OOP může vést k těžkopádnému kódu plnému zbytečných hierarchií a boilerplate tříd.

> *„Problém objektově orientovaných jazyků spočívá v tom, že si s sebou nesou celé své implicitní prostředí. Chtěli jste banán, ale dostali jste gorilu držící banán a celou džungli k tomu.“*  
> — **Joe Armstrong** (tvůrce Erlangu)

V Pythonu často postačí jednoduchý **modul s funkcemi**, neměnná n-tice nebo datová třída, namísto složitých dědičných stromů.

---
<!-- slide: id18, Užití OOP, Skip, basics -->
## Kdy je vhodné použít třídy?

1. **Stavové entity s chováním**:
   - Spojení dat a operací nad nimi (např. databázový model, síťové spojení, herní postava).
2. **Implementace Python Data Modelu**:
   - Třídy implementující dunder metody pro operátory (`+`, `*`), indexování `[]`, iterace či kontextové manažery `with`.
3. **Polymorfismus**:
   - Různé implementace téhož protokolu (např. různé exportéry: `JsonExporter`, `CsvExporter`).
4. **Zapouzdření složitého stavového automatu**.

Pokud funkce nepotřebuje uchovávat stav, napište obyčejnou funkci!
