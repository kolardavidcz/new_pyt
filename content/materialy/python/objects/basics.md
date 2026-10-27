<!-- slide: id=id1 title="Zavedení třídy" tags="Core" diff="resyntax" -->
## Zavedení třídy

Zcela v duchu úvodu můžeme nejjednodušší třídu vyrobit jako zobecnění *pojmenované n-tice*. Na rozdíl od `tuple` však u třídy můžeme měnit hodnoty jejích prvků:

```python
>>> class MyClass:
...     a, b, c = 1, 2, 3
...
>>> MyClass
<class '__main__.MyClass'>

>>> MyClass.a
1
>>> MyClass.a = 'ahoj'
>>> MyClass.a
'ahoj'
```

Tím jsme získali *jeden* pojmenovaný objekt, který umožňuje přístup ke svým prvkům pomocí tečkové notace (nebo jinými slovy – zavedli jsme nový jmenný prostor). To jsme si zase tak moc nepomohli...

---
<!-- slide: id=id2 title="Alias na třídu" tags="Core" diff="pythonic" -->
## Alias na třídu

...a přiřazení jiného jména třídě to samozřejmě nijak nevylepší:

```python
>>> mc = MyClass
>>> mc
<class '__main__.MyClass'>

>>> MyClass.a
1
>>> mc.a
1

# Tam..
>>> MyClass.a = 'ahoj'
>>> MyClass.a
'ahoj'
>>> mc.a
'ahoj'

# ..i zpět to samozřejmě funguje stejně.
>>> mc.b
2
>>> MyClass.b
2
>>> mc.b = 'svete'
>>> mc.b
'svete'
>>> MyClass.b
'svete'
```

> [!NOTE]
> Provedením `mc = MyClass` jsme pouze objektu v paměti „přilepili“ další identifikátor (novou referenci).

Tímto způsobem jsme vlastně zavedli *alias* na základní třídu, což nám bude v budoucnu k užitku.

---
<!-- slide: id=id3 title="Instance třídy I" tags="Core" diff="newconcept" -->
## Instance třídy I

Operování přímo s konkrétními třídami jako na předchozím slajdu je sice možné, ale dost by omezovalo jejich použití. Mnohem užitečnější je, pokud uvedenou třídu použijeme jako *konstruktor* pro jednotlivé její *instance*:

```python
>>> class MyClass:
...     a, b, c = 1, 2, 3
...
>>> MyClass
<class '__main__.MyClass'>
>>> dir(MyClass)
['__class__', '__delattr__', '__dict__', '__doc__', '__eq__', '__format__',
 '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__le__',
 '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__',
 '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__',
 '__weakref__', 'a', 'b', 'c']

# A) Instance 'mc1' třídy 'MyClass' podědí vlastnosti svého rodiče:
>>> mc1 = MyClass()
>>> mc1
<__main__.MyClass object at 0x7f9a8b1c2d00>
>>> MyClass.a
1
>>> mc1.a
1

# B) Pokud na potomkovi ale něco změníme, rodič se to nedozví:
>>> mc1.a = 'ahoj'
>>> mc1.a
'ahoj'
>>> MyClass.a
1

# C) Podobně pokud nyní změníme něco na rodiči,
#    potomek bude taktéž zanechán v blahé nevědomosti:
>>> MyClass.a = 'svete'
>>> MyClass.a
'svete'
>>> mc1.a
'ahoj'

# D) Nový potomek 'mc2' ale nyní podědí i nový stav rodiče:
>>> mc2 = MyClass()
>>> mc2
<__main__.MyClass object at 0x7f9a8b1c2e40>
>>> mc2.a
'svete'
```

Všimněte si, že při použití třídy jako *konstruktoru* ji **voláme**, tedy se závorkami – `MyClass()`.

---
<!-- slide: id=id4 title="Instance třídy II" tags="Tricky" diff="paradigm" -->
## Instance třídy II

Situace se „kapku“ změní, pokud **atribut je proměnného typu** (např. seznam `list`) a použijeme operace pro úpravu hodnot tohoto typu in-place:

```python
>>> class MyClass:
...     a, b = 1, [2, 3]

# A) Instance třídy podědí vlastnosti svého rodiče:
>>> mc1 = MyClass()
>>> mc1.a
1
>>> mc1.b
[2, 3]

# B) A pokud na potomkovi přesměrujeme odkaz na jiný typ, rodič se to nedozví:
>>> mc1.b = 'ahoj'
>>> mc1.b
'ahoj'
>>> MyClass.b
[2, 3]

# C1) Když se ale místo změny hodnoty začneme přehrabovat ve vnitřnostech
#     proměnného datového typu, začnou se dít věci:
>>> mc2 = MyClass()
>>> mc2.b
[2, 3]
>>> mc3 = MyClass()
>>> mc3.b
[2, 3]
>>> mc2.b.append(4)
>>> mc2.b
[2, 3, 4]
>>> mc3.b
[2, 3, 4]
>>> MyClass.b
[2, 3, 4]

# C2) A to samozřejmě nezávisle na místě způsobení změny:
>>> mc3.b.append(5)
>>> mc3.b
[2, 3, 4, 5]
>>> mc2.b
[2, 3, 4, 5]
>>> MyClass.b
[2, 3, 4, 5]

# C3) Nepřekvapivě na potomka, který zaměnil typ za jiný, to ale nemá vliv:
>>> mc1.b
'ahoj'
```

---
<!-- slide: id=id5 title="Funkce jako atributy tříd I" tags="Core" diff="basics" -->
## Funkce jako atributy tříd I

Kromě „obyčejných“ proměnných můžeme do tříd schovat samozřejmě i funkce. A dokud se ke třídě chováme jako ke jmennému prostoru, všechno funguje přesně tak, jak bychom čekali:

```python
>>> class T:
...     a = 'Ahoj!'
...     def fn(x):
...         return f'Zavoláno: fn({x})'

>>> T.a
'Ahoj!'
>>> T.fn
<function T.fn at 0x7f9a8b1c0d60>
>>> T.fn(666)
'Zavoláno: fn(666)'
>>> T.fn('Baf!')
'Zavoláno: fn(Baf!)'
```

---
<!-- slide: id=id6 title="Funkce jako atributy tříd II" tags="Tricky" diff="paradigm" -->
## Funkce jako atributy tříd II

Jakmile ale začneme třídy používat jako konstruktory instancí, vystrčí na nás nos podle mě kardinálně špatné rozhodnutí tvůrců Pythonu:

```python
>>> class T:
...     a = 'Ahoj!'
...     def fn(x):
...         return f'Zavoláno: fn({x})'

>>> t = T()
>>> t.fn
<bound method T.fn of <__main__.T object at 0x7f9a8b1c2830>>
>>> t.fn(666)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: T.fn() takes 1 positional argument but 2 were given
```

Dva poziční argumenty? Jenom proto, že jsem funkci zavolal na instanci? Co to má znamenat?

---
<!-- slide: id=id7 title="Funkce jako atributy tříd III" tags="Core" diff="paradigm" -->
## Funkce jako atributy tříd III

Dobře, zkusme se tomu přizpůsobit:

```python
>>> class T:
...     a = 'Ahoj!'
...     def fn(x, y):
...         return f'Zavoláno: fn({x}, {y})'

>>> t = T()
>>> t.fn(666)
'Zavoláno: fn(<__main__.T object at 0x7f9a8b18c920>, 666)'

>>> t
<__main__.T object at 0x7f9a8b18c920>
```

Aha, takže funkce na instanci (neboli tedy *metoda instance*) dostane jako první parametr referenci na tuto instanci. Nezvyklé, ale dává to smysl asi tak stejně dobře, jako automagické objevování se této reference v podobě klíčového slova `this` v jiných jazycích (C++, Java, JS).

---
<!-- slide: id=id8 title="Funkce jako atributy tříd IV" tags="Tricky" diff="paradigm" -->
## Funkce jako atributy tříd IV

Jenže to má ten důsledek, že *jedna a ta samá funkce* se v rámci instance volá s jiným počtem parametrů než v rámci jmenného prostoru třídy:

```python
>>> class T:
...     a = 'Ahoj!'
...     def fn(x, y):
...         return f'Zavoláno: fn({x}, {y})'

>>> T.fn(666)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: T.fn() missing 1 required positional argument: 'y'

>>> T.fn('Baf!', 666)
'Zavoláno: fn(Baf!, 666)'
```

---
<!-- slide: id=id9 title="Instanční metody – jak to mělo být" tags="Skip" diff="paradigm" -->
## Instanční metody – jak to mělo být

Kdyby bývaly byly tyto funkce, co se chovají jinak v rámci třídy a jinak v rámci instance, nějak označeny, například takovýmto dekorátorem:

```python
class T:
    a = 'Ahoj!'

    @instancemethod
    def fn(x, y):
        return f'Zavoláno: fn({x}, {y})'
```

...neřekl bych ani slovo – znalí dekorátorů by věděli, že daná funkce se nejspíš bude chovat úplně jinak, než je napsána, neznalí by díky tomu označení zase alespoň tušili, že to nebude jen tak nějaká obyčejná funkce.

Nejhorší na tom je, že to tak mohlo být (ostatně vizte dále *třídní metody*)! Ale tvůrci jazyka se rozhodli, že když už někdo používá třídy, chce je především kvůli instančním metodám, tak mu přece ušetříme psaní a nebudeme je nijak označovat. Výsledek je chmurný – `def` v bloku `class` se chová podle toho, kde a jak ji použijete.

---
<!-- slide: id=id10 title="Instanční metody – jak to bohužel je" tags="Core" diff="pythonic" -->
## Instanční metody – jak to bohužel je

Nakonec tedy bohužel: **funkce bez dekorátoru v bloku třídy jsou automaticky brány jako *instanční* a při svém volání na instanci automaticky dostanou navíc referenci na tuto instanci jako svůj první poziční parametr** (což je přesně práce deskriptorového protokolu a dekorátoru):

```python
class T:
    a = 'Ahoj!'

    def fn(self, y):
        return f'Zavoláno: fn({self}, {y})'
```

Nemusí se nám to líbit, ale prostě to tak v Pythonu je.

> [!NOTE]
> Název **`self`** se pro tento první parametr používá čistě dohodou (PEP 8), aby se zdůraznilo, že jde o referenci na instanci. Ve vlastním zájmu tuto dohodu neporušujte – je to jediná nápověda pro čtenáře i lintery, že se funkce váže k instanci.

---
<!-- slide: id=id11 title="Třídní metody I" tags="Core" diff="newconcept" -->
## Třídní metody I

Důvod, proč je stav instančních metod tak matoucí, je v tom, že existují i třídní metody – které operují nad atributy třídy, nikoli instance – a ty se samozřejmě pomocí dedikovaného dekorátoru zavádí:

```python
>>> class T:
...     a = 'Ahoj!'
...     @classmethod
...     def fn(x, y):
...         return f'Zavoláno: fn({x}, {y})'

>>> t = T()
>>> t.fn(666)
"Zavoláno: fn(<class '__main__.T'>, 666)"
>>> T
<class '__main__.T'>
```

**Třídní metody tedy při svém volání také automaticky dostávají navíc (první) poziční parametr, ale je jím reference na příslušnou třídu.** A nikoho toto chování nepřekvapí, protože před funkcí je v definici napsaný explicitní dekorátor `@classmethod`, který na to upozorňuje.

---
<!-- slide: id=id12 title="Třídní metody II" tags="Skip" diff="basics" -->
## Třídní metody II

Z pochopitelných důvodů se tento první parametr pro změnu dohodou označuje jako **`cls`**:

```python
class T:
    a = 'Ahoj!'

    @classmethod
    def fn(cls, y):
        return f'Zavoláno: fn({cls}, {y})'
```

...a každý vidí, že má smysl se tím řídit – hned na první pohled je jasné, že jde o referenci na celou třídu (*class*).

---
<!-- slide: id=id13 title="Statické metody" tags="Core" diff="resyntax" -->
## Statické metody

Abychom kyselý koláč dojedli rovnou celý, existuje ještě jeden dekorátor pro metody tříd:

```python
class T:
    a = 'Ahoj!'

    @staticmethod
    def fn(x, y):
        return f'Zavoláno: fn({x}, {y})'
```

Ano, hádáte správně – takto označené funkce se chovají při volání ve jmenném prostoru třídy i na instanci zcela stejně, tj. očekávají přesně stejný počet parametrů, s jakým jsou zapsány (zde tedy dva). Nepřijímají ani `self`, ani `cls`.

---
<!-- slide: id=id14 title="Emulace typu „record“ z jazyka Pascal" tags="WOW" diff="pythonic" -->
## Emulace typu „record“ z jazyka Pascal

Nehledě na zápis, když už jsme se s tímto rozdílem mezi atributy *instančními* a *třídními* seznámili, můžeme tu vlastnost, že atributy instance existují nezávisle na atributech třídy, využít ještě o kus dál – na každé instanci si můžeme za běhu dodefinovat libovolné další atributy.

Prakticky úplnou obdobu pascalovského záznamu (*record* nebo C-struktury `struct`) tak získáme například takto:

```python
class Zaměstnanec:
    pass

jan = Zaměstnanec()   # vyrobení prázdného záznamu o zaměstnanci

# naplnění polí (atributů) záznamu
jan.jméno = 'Jan Novák'
jan.oddělení = 'počítačová laboratoř'
jan.plat = 15000
```

> [!NOTE]
> V moderním Pythonu 3.7+ pro tyto účely standardně používáme spíše `@dataclass` z modulu `dataclasses`, která automaticky vygeneruje konstruktor, reprezentaci `__repr__` i typové kontroly.

---
<!-- slide: id=id15 title="Metody I" tags="Core" diff="basics" -->
## Metody I

Většinou se třídy používají tak, že spolu s daty zapouzdřují i funkce, které umí s příslušnými daty správně pracovat. Těmto funkcím, které operují na datech dané instance (případně i třídy), se říká *metody*.

Vyrobme si ukázkovou třídu *Člověk* s jednou metodou *identifikace()*:

```python
# Program: alisa.py
class Člověk:
    def identifikace(self) -> str:
        return 'Dobrý den! Jmenuji se Алиса Селезнева.'

print(Člověk)
print(Člověk.identifikace)

print()

alisa = Člověk()
print(alisa)
print(alisa.identifikace)
print(alisa.identifikace())
```

**Výstup:**
```text
<class '__main__.Člověk'>
<function Člověk.identifikace at 0x7f9a8b1c0d60>

<__main__.Člověk object at 0x7f9a8b1c2e40>
<bound method Člověk.identifikace of <__main__.Člověk object at 0x7f9a8b1c2e40>>
Dobrý den! Jmenuji se Алиса Селезнева.
```

> [!NOTE]
> Zatímco v rámci třídy je `identifikace` „obyčejnou“ funkcí, v rámci instance se již jedná o svázanou metodu dané instance (*bound method*).

---
<!-- slide: id=id16 title="Metody – „self“" tags="WOW" diff="paradigm" -->
## Metody – „self“

Jak už víme, pokusíme-li se metodu `identifikace()` zavolat přímo na třídě bez parametrů, se zlou se potážeme:

```python
Člověk.identifikace()
# TypeError: Člověk.identifikace() missing 1 required positional argument: 'self'
```

Zatímco volání na instanci nečiní žádné potíže:

```python
alisa.identifikace()
# 'Dobrý den! Jmenuji se Алиса Селезнева.'
```

Celý „vtip“ je schován v tom, že parametr `self` metody `identifikace()` odkazuje na právě zavedenou instanci třídy, která je při volání příslušné metody předána Pythonem automaticky jako její první parametr:

> Při zavolání této metody ve tvaru `alisa.identifikace()` se ve skutečnosti volá `Člověk.identifikace(alisa)`.

---
<!-- slide: id=id17 title="Poznámka: Alias na atribut" tags="WOW" diff="pythonic" -->
## Poznámka: Alias na atribut

V Pythonu můžete atributy a metody třídy či instance volně aliasovat a volat pod těmito novými jmény:

```python
# Po zavedení aliasu na metodu..
fn = alisa.identifikace

# ..můžeme volat přímo bez reference na objekt:
fn()  # -> "Dobrý den! Jmenuji se Алиса Селезнева."
```

V principu jde o úplně stejnou techniku jako u aliasů tříd – prostě jen konkrétnímu objektu (zde svázané metodě *bound method*, která už v sobě drží referenci na `alisa`) přiřadíme další proměnnou, pod kterou ji můžeme volat či předávat jako callback.

---
<!-- slide: id=id18 title="Inicializace atributů" tags="Core" diff="resyntax" -->
## Inicializace atributů: `__init__()`

Většinou nebudeme chtít vyrobit instanci třídy pouze s prázdnými hodnotami. V takovém případě doplníme třídu o metodu `__init__()`. Ta zaručuje, že každá nově vytvořená instance bude obsahovat též hodnoty, které předáme při jejím vytvoření:

```python
class Člověk:
    """Objektová reprezentace člověka."""

    def __init__(self, jméno: str, datum_narození: str, krevní_skupina: str):
        self.jméno = jméno
        self.datum_narození = datum_narození
        self.krevní_skupina = krevní_skupina

# Pro konkrétní instanci:
alisa = Člověk(
    'Алиса Селезнева',
    '2065-11-17',
    '0',
)

print(alisa.jméno)           # -> Алиса Селезнева
print(alisa.krevní_skupina)  # -> 0
```

> [!NOTE]
> Výrazy typu `self.jméno = jméno` na dané instanci (`self`) zavedou nový atribut (`jméno`) a přiřadí mu příslušnou hodnotu. Že se atribut jmenuje stejně jako parametr konstruktoru, je obvyklá konvence pro maximální čitelnost.

`__init__()` je zase pouze obyčejná instanční metoda a jako taková dostává implicitní první parametr v podobě odkazu na právě vytvářenou instanci třídy.

---
<!-- slide: id=id19 title="Dědičnost I" tags="Core" diff="resyntax" -->
## Dědičnost I

Dědičnost v rámci Pythonu vyjádříme uvedením rodičovské třídy v závorce při definici. *Školáka* jako specializovaného *Člověka* vytvoříme například takto:

```python
class Školák(Člověk):
    """Objektová reprezentace školáka."""

    def __init__(self, jméno: str, datum_narození: str, krevní_skupina: str, třída: str, předměty: dict):
        super().__init__(jméno, datum_narození, krevní_skupina)
        self.třída = třída
        self.předměty = předměty
```

A podobně i pro *Učitele*:

```python
class Učitel(Člověk):
    """Objektová reprezentace učitele."""

    def __init__(self, jméno: str, datum_narození: str, krevní_skupina: str, třída: str, předměty: list, výplata: int):
        super().__init__(jméno, datum_narození, krevní_skupina)
        self.třída = třída
        self.předměty = předměty
        self.výplata = výplata
```

> [!IMPORTANT]
> `__init__()` nadřazené třídy s příslušnými parametry musíme v potomkovi zavolat sami pomocí **`super().__init__(...)`**, nikdo jiný to za nás neudělá! Pokud ho na potomkovi vůbec nezavedeme, volá se konstruktor rodiče automaticky.

---
<!-- slide: id=id20 title="Příklad" tags="Already Studied" diff="resyntax" -->
## Příklad: Vytvoření instance potomka

Budeme-li pokračovat v příkladu, bude vytvoření objektu typu *Školák* vypadat takto:

```python
alisa = Školák(
    'Алиса Селезнева',
    '2065-11-17',
    '0',
    '3. A',
    {'matematika': 1, 'zeměpis': 1},
)

print(alisa.jméno)   # -> Алиса Селезнева
print(alisa.třída)   # -> 3. A
```

Díky volání `super().__init__()` získal školák atributy `jméno`, `datum_narození` i `krevní_skupina` z rodičovské třídy `Člověk`, plus své vlastní specifické atributy `třída` a `předměty`.

---
<!-- slide: id=id21 title="Dědičnost II" tags="Skip" diff="pythonic" -->
## Dědičnost II: Aliasy rodičovských tříd

I když použijeme `super()`, pořád se na rodičovskou třídu odkazujeme jejím jménem v hlavičce definice potomka. Při refaktorizaci kódu nebo výměně bázové třídy můžeme využít alias:

```python
class Člověk:
    ...

AliasČlověk = Člověk

class Školák(AliasČlověk):
    ...
```

> [!NOTE]
> Samozřejmě nezáleží na tom, jak svůj alias pojmenujete, je to běžná proměnná s odkazem na objekt třídy.

Něco podobného se týká i rodičovských tříd definovaných v jiných modulech. Chcete-li z takové třídy dědit, musíte ji nejdříve naimportovat (`from models import BasePerson as Person`).

---
<!-- slide: id=id22 title="Dědičnost III" tags="Core" diff="resyntax" -->
## Dědičnost III: Přepisování metod

Neupravuje-li potomek chování rodičovské inicializace, metodu `__init__()` na něm dokonce ani nemusíme definovat a Python zavolá rodičovskou automaticky. Pokud však jakoukoli rodičovskou metodu přepíšeme, původní originál musíme – vyžaduje-li to logika – explicitně zavolat přes `super()`:

```python
class Rodič:
    def fn(self, atr1):
        print(f"Rodič: {atr1}")

class Potomek(Rodič):
    # Upravená metoda 'fn()'
    def fn(self, atr1, atr2):
        # Zavolání rodičovské metody
        super().fn(atr1)
        # Následuje kód specifický pro potomka
        print(f"Potomek navíc: {atr2}")
```

> [!NOTE]
> Funkce `super()` automaticky vyřeší hierarchii dědičnosti dle MRO (*Method Resolution Order*).

---
<!-- slide: id=id23 title="Metody II" tags="Core" diff="basics" -->
## Metody II: Vlastní metody potomka

Potomek podědí z rodiče jeho atributy i metody. Obojí může přepsat vlastní definicí nebo doplnit. Stejně tak si samozřejmě může zavést metody zcela vlastní.

Doplňme naši ukázkovou třídu *Školák* o metodu pro výpočet průměrné známky ze všech předmětů:

```python
class Školák(Člověk):
    def __init__(self, jméno: str, datum_narození: str, krevní_skupina: str, třída: str, předměty: dict[str, int]):
        super().__init__(jméno, datum_narození, krevní_skupina)
        self.třída = třída
        self.předměty = předměty

    def průměrná_známka(self) -> float:
        """Vrací průměr všech známek studenta."""
        if not self.předměty:
            return 0.0
        return sum(self.předměty.values()) / len(self.předměty)
```

Nyní budou instance třídy `Školák` obsahovat oproti instancím třídy `Člověk` navíc i metodu `průměrná_známka()`:

```python
# Volání na instanci..
alisa.průměrná_známka()  # -> 1.0

# ..je ekvivalentní volání přes třídu:
Školák.průměrná_známka(alisa)
```

---
<!-- slide: id=id24 title="Třídní atributy" tags="Core" diff="newconcept" -->
## Třídní atributy

Někdy se nám může hodit operovat nikoli s atributy konkrétní instance, nýbrž s atributy společnými pro celou třídu:

```python
class Školák(Člověk):
    školáků: int = 0  # Třídní atribut sdílený všemi instancemi

    def __init__(self, jméno: str, datum_narození: str, krevní_skupina: str, třída: str, předměty: dict):
        super().__init__(jméno, datum_narození, krevní_skupina)
        self.třída = třída
        self.předměty = předměty
        Školák.školáků += 1
```

Síla **třídních atributů** tkví v tom, že jsou sdíleny všemi instancemi dané třídy navzájem. Jakákoli změna v nich je okamžitě viditelná ve všech instancích vytvořených z dané třídy.

---
<!-- slide: id=id25 title="Třídní metody" tags="Already Studied" diff="newconcept" -->
## Třídní metody: `@classmethod`

Na třídních atributech operují komplementární **třídní metody** označené dekorátorem `@classmethod`:

```python
class Školák(Člověk):
    školáků: int = 0

    def __init__(self, jméno: str, datum_narození: str, krevní_skupina: str, třída: str, předměty: dict):
        super().__init__(jméno, datum_narození, krevní_skupina)
        self.třída = třída
        self.předměty = předměty
        self.přidej_školáka()

    @classmethod
    def přidej_školáka(cls) -> None:
        cls.školáků += 1
```

Třídní metoda dostává jako první implicitní parametr referenci na celou příslušnou třídu (`cls`). Zavedení nové instance způsobí následující řetězec volání:

```text
alisa = Školák(…)
⇒ Školák.__init__(alisa, …)
⇒ alisa.přidej_školáka()
⇒ přidej_školáka(Školák)
⇒ Školák.školáků += 1
```

---
<!-- slide: id=id26 title="Poznámka k dekorátorům metod" tags="Skip" diff="paradigm" -->
## Poznámka k dekorátorům metod

V mnoha ohledech by dávalo větší smysl, kdyby se dekorátory metod zavedly explicitně pro všechny typy metod:

```python
class Třída:
    def statická_metoda(...):
        ...

    @classmethod
    def třídní_metoda(cls, ...):
        ...

    @instancemethod
    def instanční_metoda(self, ...):
        ...
```

Neoznačené metody by se volaly jako běžné funkce a u dekorovaných by každému bylo jasné, jaké parametry se předávají. V Pythonu však zvítězil přístup, že pro instanční metody se dekorátor nepíše, aby se ušetřil kód.

---
<!-- slide: id=id27 title="„Privátní“ atributy" tags="Already Studied" diff="resyntax" -->
## „Privátní“ atributy & Name Mangling

Python nemá koncepci skutečně striktních privátních atributů (jako `private` v C++ či Javě). Jakýkoliv atribut, jehož jméno začíná **dvěma podtržítky** a končí nejvýše jedním, prochází mechanismem zvaným **name mangling**:

```python
>>> class MyClass:
...     a = 1
...     __b = 2

# Na veřejný atribut 'a' se dostaneme normálně:
>>> MyClass.a
1

# S atributem '__b' už to pod původním jménem nejde:
>>> MyClass.__b
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: type object 'MyClass' has no attribute '__b'
```

> [!NOTE]
> Technicky dojde k přejmenování atributu `__b` na `_MyClass__b`. Třída tento atribut stále obsahuje a lze k němu přistoupit přes `MyClass._MyClass__b`, ale name mangling brání neúmyslnému přepsání v podtřídách.

Konvencí se pro neveřejné API používá **jedno podtržítko** (např. `_interni_stav`). Tyto atributy jsou normálně přístupné, ale dávají najevo, že nejsou určeny k externímu volání.
