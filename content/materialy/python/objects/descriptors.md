<!-- slide: id1, Úvod, Core, paradigm -->
## Protokol deskriptorů a dekorátor `@property`

V mnoha jazycích (Java, C++) se doporučuje každý atribut zapouzdřit dvojicí metod `getX()` a `setX()`, aby bylo možné v budoucnu doplnit validaci nebo přepočet bez rozbití veřejného API.

V Pythonu je takový přístup považován za **antipattern**:
- Začínáme s obyčejným veřejným atributem `self.x = hodnota`.
- Pokud později potřebujeme validaci, líné načítání nebo přepočet, proměníme atribut v **property** pomocí dekorátoru **`@property`**.
- Veřejné rozhraní třídy zůstane **100% nezměněno** (`obj.x` funguje dál).

Na pozadí veškeré této magie stojí fundamentální mechanismus Python Data Modelu – **protokol deskriptorů** (*Descriptor Protocol*).

---
<!-- slide: id2, Příklad, Core, pythonic -->
## Tradiční zápis pomocí funkce `property()`

Historický přístup vytvářel property pomocí vestavěné funkce `property()`:

```python
class Plocha:
    def __init__(self, barva: str = "červená") -> None:
        self._barva = barva

    def _get_barva(self) -> str:
        print("[GET] Čtení barvy")
        return self._barva

    def _set_barva(self, nova_barva: str) -> None:
        print(f"[SET] Nastavení barvy na: {nova_barva}")
        self._barva = nova_barva

    # Vytvoření property propojením getteru a setteru:
    barva = property(_get_barva, _set_barva)

p = Plocha()
print(p.barva)     # [GET] Čtení barvy -> červená
p.barva = "modrá"  # [SET] Nastavení barvy na: modrá
```

---
<!-- slide: id3, Zavedení pomocí „property()“, Core, pythonic -->
## Anatomie vestavěné funkce `property()`

Funkce `property()` přijímá až čtyři argumenty:

$$\mathbf{property}(fget=\text{None}, fset=\text{None}, fdel=\text{None}, doc=\text{None})$$

- **`fget`**: Volatelný objekt pro čtení hodnoty (`obj.x`).
- **`fset`**: Volatelný objekt pro zápis hodnoty (`obj.x = val`).
- **`fdel`**: Volatelný objekt pro smazání atributu (`del obj.x`).
- **`doc`**: Dokumentační řetězec atributu (pokud chybí, převezme docstring z `fget`).

Nevýhodou tohoto přístupu bylo zbytečné znečištění jmenného prostoru pomocnými funkcemi `_get_barva` a `_set_barva`.

---
<!-- slide: id4, Zavedení pomocí dekorátorů, WOW, pythonic -->
## Moderní Pythonic zápis: Dekorátor `@property`

Dnes se v 100 % případů používá elegantní dekorátorová syntaxe:

```python
class Plocha:
    def __init__(self, barva: str = "červená") -> None:
        self._barva = barva

    @property
    def barva(self) -> str:
        """Veřejná vlastnost: barva plochy."""
        return self._barva

    @barva.setter
    def barva(self, nova_barva: str) -> None:
        if not nova_barva.strip():
            raise ValueError("Barva nesmí být prázdná!")
        self._barva = nova_barva

    @barva.deleter
    def barva(self) -> None:
        del self._barva

p = Plocha("zelená")
p.barva = "žlutá"
print(p.barva)  # 'žlutá'
```

Všechny metody se jmenují stejně (`barva`), jmenný prostor zůstává čistý a kód je dokonale samopopisný.

---
<!-- slide: id5, Funkce „property()“ versus dekorátory, Skip, basics -->
## Proč komunita zvolila dekorátory?

Porovnání obou stylů:

| Kritérium | `barva = property(...)` | `@property` + `@barva.setter` |
| :--- | :--- | :--- |
| **Čistota API** | Vystavuje pomocné metody | Vystavuje pouze jediný název atributu |
| **Čitelnost** | Odděluje definici metod a propojení | Getter a setter jsou vizuálně spojeny |
| **Podpora typování** | Komplikovanější pro mypy/pyright | Dokonalá podpora v IDE i statických analyzátorech |
| **Docstrings** | Nutno předat explicitně | Automaticky přebírá docstring getteru |

---
<!-- slide: id6, Teorie I, Core, newconcept -->
## Jak funguje vyhledávání atributů pod kapotou?

Když napíšeme `obj.x`, Python standardně nečte přímo paměť. Celý proces řídí dunder metody objektu:

```python
# 1. Čtení hodnoty:
obj.x       # přeloží se na: type(obj).__getattribute__(obj, 'x')

# 2. Zápis hodnoty:
obj.x = 42  # přeloží se na: type(obj).__setattr__(obj, 'x', 42)

# 3. Smazání atributu:
del obj.x   # přeloží se na: type(obj).__delattr__(obj, 'x')
```

Metoda `__getattribute__` nejprve zkontroluje, zda atribut ve třídě neimplementuje **protokol deskriptorů**!

---
<!-- slide: id7, Teorie II, Core, newconcept -->
## Protokol deskriptorů: Tři magické metody

**Deskriptor** je libovolný objekt definovaný na úrovni **třídy**, který implementuje alespoň jednu z následujících metod:

1. **`__get__(self, instance, owner=None)`**:
   - Zavolá se při čtení: `instance.attr` nebo `Class.attr`.
2. **`__set__(self, instance, value)`**:
   - Zavolá se při zápisu: `instance.attr = value`.
3. **`__delete__(self, instance)`**:
   - Zavolá se při smazání: `del instance.attr`.
4. **`__set_name__(self, owner, name)`** (Python 3.6+ PEP 487):
   - Automaticky se zavolá při vytvoření třídy a předá deskriptoru název atributu.

---
<!-- slide: id8, Teorie III, Tricky, newconcept -->
## Příklad: Vlastní validační deskriptor

Vytvořme univerzální validační deskriptor pro kladná čísla bez nutnosti psát dokola `@property`:

```python
class KladneCislo:
    def __set_name__(self, owner: type, name: str) -> None:
        # PEP 487: Automaticky uloží jméno privátního úložiště v instanci:
        self.private_name = f"_{name}"

    def __get__(self, instance: object, owner: type | None = None) -> float:
        if instance is None:
            return self  # type: ignore # Přístup přes třídu (KladneCislo)
        return getattr(instance, self.private_name, 0.0)

    def __set__(self, instance: object, value: float) -> None:
        if value <= 0:
            raise ValueError(f"Hodnota pro {self.private_name} musí být kladná!")
        setattr(instance, self.private_name, value)

class Obdelnik:
    # Deskriptory definujeme jako atributy třídy:
    sirka = KladneCislo()
    vyska = KladneCislo()

    def __init__(self, sirka: float, vyska: float) -> None:
        self.sirka = sirka
        self.vyska = vyska

o = Obdelnik(10, 20)
print(o.sirka, o.vyska)  # 10 20
# o.sirka = -5  # ValueError: Hodnota pro _sirka musí být kladná!
```

---
<!-- slide: id9, Teorie IV, Tricky, paradigm -->
## Datové vs. Nedatové deskriptory (Priorita vyhledávání)

Python rozlišuje dva druhy deskriptorů s rozdílnou prioritou:

| Druh deskriptoru | Implementované metody | Chování při konfliktu s `instance.__dict__` |
| :--- | :--- | :--- |
| **Datový (Data Descriptor)** | Implementuje `__set__` nebo `__delete__` | **Má absolutní přednost!** Přepisuje instanční slovník. |
| **Nedatový (Non-Data Descriptor)** | Implementuje pouze `__get__` | **Ustoupí instanci.** Pokud má instance atribut v `__dict__`, použije se hodnota z instance. |

### Důsledky v praxi:
- **`@property`** je datový deskriptor (i když má jen getter, definuje `__set__`, který vyhodí `AttributeError: can't set attribute`). Proto nelze property obejít přímým zápisem do instance.
- **Běžné metody třídy** jsou nedatové deskriptory (implementují jen `__get__`, který sváže metodu s instancí). Proto můžete instanční metodu na konkrétním objektu dynamicky přepsat jinou funkcí!

---
<!-- slide: id10, Poznámky, Core, paradigm -->
## Kde všude v Pythonu potkáte deskriptory?

Deskriptory jsou páteří celého objektového modelu Pythonu:

1. **Metody a funkce**:
   - Každá funkce v Pythonu je nedatový deskriptor. Při přístupu přes instanci (`obj.metoda`) její `__get__` vrátí objekt **`bound method`** s předvyplněným prvním parametrem `self`.
2. **Dekorátory metod**:
   - `@classmethod` a `@staticmethod` jsou deskriptory řídící předání `cls` nebo zrušení předávání argumentu.
3. **ORM knihovny (SQLAlchemy, Django, Tortoise)**:
   - Sloupce tabulek (`models.CharField`, `Column(Integer)`) jsou deskriptory, které automaticky mapují atributy třídy na SQL dotazy.
4. **Validace schémat (Pydantic)**:
   - Řízení typové konverze a validace hodnot za běhu.
