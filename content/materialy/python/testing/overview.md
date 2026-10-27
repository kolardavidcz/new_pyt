<!-- slide: id=id1 title="Užití testů" tags="Skip" diff="basics" -->
## Proč psát automatizované testy?

Souhrnně existují pro psaní automatizovaných testů dva hlavní důvody:

1. **Verifikace správnosti a redukce chybovosti**:
   Napsat program, o kterém můžete dopředu matematicky rozhodnout, že je správný, je s výjimkou triviálních algoritmů nemožné. Důkladné testy kódu tento nedostatek nahrazují – čím více částí programu a hraničních případů (*edge cases*) otestujete, tím větší je šance, že se software chová dle specifikace.

2. **Ochrana před regresí při refaktorizaci (Regression Safety)**:
   Programy se v čase neustále vyvíjejí. Při přidávání nových funkcí nebo optimalizacích téměř zákonitě hrozí nechtěné rozbití již existujícího chování. Pokud máte sadu automatických testů v CI/CD pipeline, okamžitě zjistíte, zda úprava nepoškodila jiné komponenty.

> [!NOTE]
> Na každou novou funkcionalitu je nutné připsat odpovídající testy. Existující testy vám však garantují, že novými zásahy nerozbijete to, co už v produkci spolehlivě fungovalo.

---
<!-- slide: id=id2 title="Testování v Pythonu" tags="Core" diff="newconcept" -->
## Testovací nástroje v ekosystému Pythonu

V Pythonu máme k dispozici testovací nástroje několika úrovní, a to jak přímo ve standardní knihovně, tak v moderním ekosystému:

- **`unittest` (součást standardní knihovny)**:
  Modul pro jednotkové testování inspirovaný architekturou *xUnit* (Java JUnit, C++ CppUnit). Využívá objektový přístup s třídami dědícími z `unittest.TestCase` a metodami `self.assertEqual()`, `self.assertRaises()`. Je dostupný v každé instalaci bez závislostí.

- **`doctest` (součást standardní knihovny)**:
  Unikátní pythonní modul, který extrahuje a spouští interaktivní REPL ukázky (`>>>`) přímo z dokumentačních řetězců (`docstrings`). Zajišťuje, že dokumentace a příklady v kódu nikdy nezastarají.

- **`pytest` (de-facto průmyslový standard)**:
  Dnes dominantní externí testovací framework. Umožňuje psát testy jako obyčejné funkce s nativním příkazem `assert` (díky AST transformaci poskytuje detailní výpisy rozdílů). Nabízí mocný systém fixtures (`@pytest.fixture`), parametrizaci (`@pytest.mark.parametrize`) a bohatý ekosystém pluginů (`pytest-cov`, `pytest-asyncio`, `pytest-mock`).

---
<!-- slide: id=id3 title="Testy jako specifikace a TDD" tags="Skip" diff="paradigm" -->
## Testy jako specifikace a Test-Driven Development (TDD)

Testy nejsou pouhým nástrojem pro hledání chyb – mění způsob, jakým o architektuře kódu přemýšlíte:

- **Vývoj řízený testy (TDD – Test-Driven Development)**:
  Cyklus *Red -> Green -> Refactor*:
  1. Nejprve napíšete selhávající test specifikující požadované rozhraní a chování.
  2. Implementujete minimální funkční kód, který testem projde.
  3. Kód zrefaktorujete s jistotou, že testy chrání funkčnost.
  Tento přístup vede k modulárnějšímu a volně vázanému kódu (*loose coupling*), protože kód, který se špatně testuje, mívá obvykle špatný návrh.

- **Živá dokumentace**:
  I když testy napíšete až k hotovému kódu, slouží jako stoprocentně pravdivá, spustitelná specifikace API pro nové kolegy v týmu.
