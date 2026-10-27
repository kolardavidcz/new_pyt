<!-- slide: id1, Úvod, Core, basics -->
## Automatizované testování v Pythonu: Modul `unittest`

Úkolem jednotkových testů (**Unit Tests**) je izolovaně a deterministicky ověřit, že jednotlivé komponenty (funkce, třídy, metody) fungují přesně podle specifikace.

V dynamicky typovaném jazyce, jakým je Python, hrají unit testy roli kompilátorových garancí z C++ a Javy:
- Zabraňují regresím při refaktoringu.
- Slouží jako spustitelná specifikace a dokumentace chování.
- Umožňují metodiku **TDD** (*Test-Driven Development*): nejdříve napíšeme selhávající test (červená), poté minimální implementaci (zelená) a nakonec refaktorujeme.

Modul **`unittest`** (historicky zvaný *PyUnit*) je součástí standardní knihovny a vychází z klasické architektury **xUnit** (stejně jako JUnit v Javě nebo Catch2/GoogleTest v C++).

```bash
# Automatické vyhledání a spuštění všech testů v projektu (Test Discovery):
python -m unittest
```

---
<!-- slide: id2, Přehled, Core, resyntax -->
## Struktura testovacího případu (`TestCase`)

Testy píšeme jako metody třídy dědící z **`unittest.TestCase`**:

```python
import unittest

def secti(a: int, b: int) -> int:
    return a + b

class TestKalkulacka(unittest.TestCase):

    def test_kladna_cisla(self) -> None:
        """Test sčítání běžných kladných čísel."""
        self.assertEqual(secti(2, 3), 5)

    def test_zaporna_cisla(self) -> None:
        """Test sčítání se zápornými čísly."""
        self.assertEqual(secti(-1, 1), 0)

if __name__ == "__main__":
    unittest.main()
```

> [!NOTE]
> - Názvy testovacích metod **musí začínat slovem `test_`** (např. `test_login`, `test_validace`), jinak je test runner přeskočí.
> - Každý test je spouštěn v izolované instanci třídy, aby se zabránilo vzájemnému ovlivňování vedlejšími efekty.

---
<!-- slide: id3, Příklad 1, Core, resyntax -->
## Reálný příklad: Testování chování modulu `random`

```python
import random
import unittest

class TestRandomSequence(unittest.TestCase):

    def setUp(self) -> None:
        """Přípravek spuštěný před KAŽDÝM jednotlivým testem."""
        self.seq = list(range(10))

    def test_shuffle_zachova_prvky(self) -> None:
        random.shuffle(self.seq)
        self.seq.sort()
        self.assertEqual(self.seq, list(range(10)))

    def test_choice_vybira_ze_sekvence(self) -> None:
        prvek = random.choice(self.seq)
        self.assertIn(prvek, self.seq)

    def test_sample_chyba_pri_velkem_poctu(self) -> None:
        # Ověření vyvolání výjimky pomocí kontextového manažeru:
        with self.assertRaises(ValueError):
            random.sample(self.seq, 20)

if __name__ == "__main__":
    unittest.main()
```

Spuštění v terminálu:
```text
...
----------------------------------------------------------------------
Ran 3 tests in 0.001s

OK
```

---
<!-- slide: id4, Poznámky, Core, pythonic -->
## Proč používat metody `assertNĚCO()` namísto pouhého `assert`?

Zatímco vestavěný příkaz `assert a == b` při selhání vygeneruje strohou výjimku `AssertionError`, dedikované metody `TestCase` poskytují **bohatou diagnostiku chyb**:

```python
# 1. Obyčejný assert (málo informací):
# assert vysledek == ocekavano
# AssertionError

# 2. Metoda assertEqual (podrobný diff):
# self.assertEqual(vysledek, ocekavano)
# AssertionError: {'status': 200, 'items': [1, 2]} != {'status': 200, 'items': [1, 3]}
# - {'items': [1, 2], 'status': 200}
# ?               ^
# + {'items': [1, 3], 'status': 200}
# ?               ^
```

Navíc příkaz `assert` může být v produkčním běhu CPythonu zcela vypnut při spuštění s přepínačem `python -O` (*optimize*). Metody `unittest` zůstávají vždy aktivní.

---
<!-- slide: id5, assert I, Core, resyntax -->
## Základní ověřovací metody (Assertions I)

| Metoda | Kontrola | Ekvivalent v Pythonu |
| :--- | :--- | :--- |
| **`assertEqual(a, b)`** | Hodnotová rovnost | `a == b` |
| **`assertNotEqual(a, b)`** | Hodnotová nerovnost | `a != b` |
| **`assertTrue(x)`** | Pravdivostní kontext | `bool(x) is True` |
| **`assertFalse(x)`** | Nepravdivostní kontext | `bool(x) is False` |
| **`assertIs(a, b)`** | Identita objektu | `a is b` |
| **`assertIsNot(a, b)`** | Odlišná identita | `a is not b` |
| **`assertIsNone(x)`** | Kontrola na `None` | `x is None` |
| **`assertIsNotNone(x)`** | Různé od `None` | `x is not None` |
| **`assertIn(a, b)`** | Příslušnost v kolekci | `a in b` |
| **`assertNotIn(a, b)`** | Nepřítomnost v kolekci | `a not in b` |
| **`assertIsInstance(a, T)`** | Kontrola typu | `isinstance(a, T)` |

---
<!-- slide: id6, assert II, Tricky, pythonic -->
## Pokročilé ověřovací metody (Assertions II)

Pro reálná čísla, regulární výrazy a neuspořádané kolekce:

```python
# 1. Porovnání desetinných čísel s tolerancí (floating-point epsilon):
self.assertAlmostEqual(0.1 + 0.2, 0.3, places=7)

# 2. Porovnání relací velikosti:
self.assertGreater(skore, 50)
self.assertLessEqual(chyby, 0)

# 3. Shoda s regulárním výrazem:
self.assertRegex(email, r"^[\w\.-]+@[\w\.-]+\.\w+$")

# 4. Rovnost prvků bez ohledu na pořadí (multiset equality):
self.assertCountEqual([1, 2, 3], [3, 1, 2])  # Projde, i když pořadí nesedí!
```

---
<!-- slide: id7, assert III – výjimky a varování, Core, pythonic -->
## Testování výjimek a varování: `assertRaises`

Moderní a nejčitelnější způsob testování očekávaných chyb je **správce kontextu `with self.assertRaises(...)`**:

```python
import unittest

def deleni(a: float, b: float) -> float:
    if b == 0:
        raise ZeroDivisionError("Dělitel nesmí být nula!")
    return a / b

class TestChyby(unittest.TestCase):

    def test_deleni_nulou(self) -> None:
        # 1. Test vyvolání výjimky:
        with self.assertRaises(ZeroDivisionError):
            deleni(10, 0)

        # 2. Test vyvolání výjimky i s kontrolou textu chybové zprávy:
        with self.assertRaisesRegex(ZeroDivisionError, "Dělitel nesmí být nula"):
            deleni(10, 0)
```

---
<!-- slide: id8, „Fixtures“ – „setUp()“ a „tearDown()“, Core, resyntax -->
## Testovací přípravky: `setUp()` a `tearDown()`

Testovací přípravek (*fixture*) zajišťuje známý a čistý stav prostředí před a po spuštění testu:

- **`setUp()`**: Spustí se **před každou** testovací metodou.
- **`tearDown()`**: Spustí se **po každé** testovací metodou (i když test selže).
- **`setUpClass()` / `tearDownClass()`**: Metody třídy (`@classmethod`), spustí se pouze **jednou** pro celou testovací třídu (např. spuštění testovací databáze).

```python
class TestDatabaze(unittest.TestCase):

    @classmethod
    def setUpClass(cls) -> None:
        """Inicializace těžkých zdrojů jednou pro celou sadu."""
        cls.db_engine = "DB_INSTANCE"

    def setUp(self) -> None:
        """Příprava čisté tabulky před každým testem."""
        self.transakce = "START_TX"

    def tearDown(self) -> None:
        """Úklid po testu."""
        self.transakce = "ROLLBACK"
```

---
<!-- slide: id9, Použití „fixtures“, Core, newconcept -->
## Izolace a falešné objekty: `unittest.mock`

Při unit testování nesmí testy komunikovat s reálnou produkční databází, odesílat skutečné e-maily ani volat placená externí API.
K nahrazení závislostí slouží **`unittest.mock`**:

```python
from unittest.mock import Mock, patch
import unittest

def ziskej_teplotu_z_api(mesto: str) -> float:
    # Reálné volání REST API po síti...
    pass

class TestPredpoved(unittest.TestCase):

    @patch("modul.ziskej_teplotu_z_api")
    def test_vypocet_prumeru(self, mock_api: Mock) -> None:
        # Podvrhneme návratovou hodnotu namísto síťového volání:
        mock_api.return_value = 25.0

        vysledek = ziskej_teplotu_z_api("Praha")
        self.assertEqual(vysledek, 25.0)
        mock_api.assert_called_once_with("Praha")
```

---
<!-- slide: id10, Příklad 2, Skip, basics -->
## Praktický příklad: TDD v praxi

Představme si zadání: Chceme implementovat dvě funkce:
1. **`to_list(xs)`**: převede řetězcový argument na seznam jednotlivých znaků.
2. **`to_bool(x)`**: vrátí logickou hodnotu svého argumentu (`True`/`False`).

Ukážeme si vývoj krok za krokem podle filozofie **TDD** (*Test-Driven Development*).

---
<!-- slide: id11, Příklad 2/1, Skip, basics -->
## Fáze 1: Napsání testů (Červená fáze)

Modul `something.py` zatím neexistuje nebo je prázdný. Spuštění testu okamžitě hlásí chyby `AttributeError`:

```python
import unittest
# import something as sth

class TestKonverze(unittest.TestCase):

    def test_to_list_prevod(self) -> None:
        self.assertEqual(sth.to_list("ahoj"), ["a", "h", "o", "j"])

    def test_to_bool_pravda(self) -> None:
        self.assertTrue(sth.to_bool("text"))

    def test_to_bool_nepravda(self) -> None:
        self.assertFalse(sth.to_bool(""))
```

Výsledek: `FAILED (errors=3)` — testy správně detekují absenci kódu.

---
<!-- slide: id12, Příklad 2/2, Tricky, paradigm -->
## Fáze 2: Prázdné tělo funkcí a falešně procházející testy

Co se stane, když funkce definujeme jako prázdné (`pass`)?

```python
def to_list(xs): pass
def to_bool(x): pass
```

```text
F.F
======================================================================
FAIL: test_to_bool_pravda (None is not True)
FAIL: test_to_list_prevod (None != ['a', 'h', 'o', 'j'])
----------------------------------------------------------------------
Ran 3 tests in 0.001s
FAILED (failures=2)
```

> [!WARNING]
> Všimněte si: Dva testy selhaly, ale test `test_to_bool_nepravda` prošel!
> Proč? Prázdná funkce v Pythonu vrací `None`, což se v logickém kontextu vyhodnotí jako `False`.
> **Poučení**: Zelený test nezaručuje správnost, pokud nemáte testy pokrývající obě hraniční větve.

---
<!-- slide: id13, Příklad 2/3, Skip, basics -->
## Fáze 3: Minimální funkční kód (Zelená fáze)

Naimplementujeme funkce tak, aby testy prošly:

```python
def to_list(xs: str) -> list[str]:
    """Převede řetězec na seznam znaků."""
    return list(xs)

def to_bool(x: object) -> bool:
    """Vrátí logickou hodnotu argumentu."""
    return bool(x)
```

Výsledek: `Ran 3 tests: OK`.

---
<!-- slide: id14, Příklad 2/4, Core, paradigm -->
## Fáze 4: Hraniční případy a validace vstupů

Co když někdo zavolá `to_list(123)` s celým číslem?
Číslo `int` není iterovatelné a vyvolá `TypeError`.
Co když ale zavolá `to_list((1, 2, 3))` s n-ticí? `list((1, 2, 3))` projde a vrátí `[1, 2, 3]`, ačkoliv specifikace požadovala pouze textové řetězce!

Doplníme test na očekávané chování:
```python
def test_to_list_odmita_neretezce(self) -> None:
    with self.assertRaises(TypeError):
        sth.to_list(123)
    with self.assertRaises(TypeError):
        sth.to_list([1, 2, 3])
```

---
<!-- slide: id15, Příklad 2 – doplnění, Core, pythonic -->
## Správná validace typů v Pythonu: `isinstance` vs. `type ==`

V těle funkce doplníme ověření typu:

```python
# ŠPATNĚ: type(xs) == str nerozpozná podtřídy a je neidiomatické
# if type(xs) == str: ...

# SPRÁVNĚ: isinstance podporuje podtřídy i union typů
def to_list(xs: str) -> list[str]:
    """Převede řetězec na seznam znaků s validací typu."""
    if not isinstance(xs, str):
        raise TypeError(f"Očekáván typ str, obdržen {type(xs).__name__}")
    return list(xs)
```

> [!TIP]
> **Moderní standard: `unittest` vs. `pytest`**:
> - **`unittest`**: Vestavěný v Pythonu, nulové externí závislosti, objektový styl xUnit.
> - **`pytest`**: De facto průmyslový standard v produkčním Pythonu. Umožňuje psát testy jako obyčejné funkce s nativním příkazem `assert a == b`, nabízí parametrizované testy (`@pytest.mark.parametrize`) a mocný systém `fixtures`.
