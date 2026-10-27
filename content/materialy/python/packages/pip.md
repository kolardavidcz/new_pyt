<!-- lecture: title="Balíčkovací manažer pip & PyPI" slug="materialy--python--packages--pip" week=0 -->

<!-- slide: id=id1 title="Úvod" tags="Core" diff="basics" -->
## Úvod

Modul **`pip`** (*Pip Installs Packages*) je oficiální a standardní balíčkovací správce pro Python spravovaný organizací PyPA (*Python Packaging Authority*).

Slouží k instalaci, aktualizaci a správě externích knihoven z centrálního celosvětového registru **PyPI** (*Python Package Index*).

> [!TIP]
> **Doporučená moderní praxe volání:**
> Místo přímého příkazu `pip` volejte vždy:
> ```bash
> python -m pip <příkaz>
> ```
> Tím máte 100% jistotu, že voláte `pip` patřící přesně k tomu interpretu Pythonu, který zrovna používáte (zvláště ve virtuálním prostředí).

---

<!-- slide: id=id2 title="Nápověda" tags="Skip" diff="basics" -->
## Nápověda

Základní nápovědu a přehled všech dostupných podřízených příkazů získáte spuštěním:
```bash
python -m pip --help
```

Pro detailní nápovědu ke konkrétnímu příkazu (např. `install`, `list`, `cache`):
```bash
python -m pip install --help
```

> [!NOTE]
> Zkrácený přepínač `-h` funguje na všech úrovních identicky.

---

<!-- slide: id=id3 title="„list“ & „show“ – výpis balíčků" tags="Core" diff="basics" -->
## „list“ & „show“ – výpis balíčků

Výpis všech balíčků nainstalovaných v aktuálním prostředí získáte příkazem:
```bash
python -m pip list
```

Nejužitečnější parametry pro filtrování:
- **`--outdated`** (`-o`): Vypíše pouze ty balíčky, pro které existuje na PyPI novější verze.
- **`--uptodate`** (`-u`): Vypíše pouze aktuální balíčky.
- **`--format=json`** / **`--format=freeze`**: Strojově čitelný formát pro skripty.

Detailní informace o konkrétním balíčku (verze, licenční údaje, umístění v souborovém systému a seznam závislostí):
```bash
python -m pip show requests
```

---

<!-- slide: id=id4 title="„install“ – instalace balíčků I" tags="Core" diff="basics" -->
## „install“ – instalace balíčků I

Základní instalace nejnovější stabilní verze balíčku a všech jeho tranzitivních závislostí:
```bash
python -m pip install requests
```

### Specifikace verzí podle PEP 440:
V profesionálním vývoji často potřebujeme zafixovat nebo omezit kompatibilní verzi:
```bash
# Přesná verze:
python -m pip install "requests==2.31.0"

# Kompatibilní sémantická verze (~= znamená >= 2.31.0, ale < 3.0.0):
python -m pip install "requests~=2.31.0"

# Rozsah verzí:
python -m pip install "pydantic>=2.0,<3.0"
```

> [!NOTE]
> Uvozovky kolem názvu a verze zabraňují unixovému shellu interpretovat znaky `<` a `>` jako přesměrování I/O proudu.

---

<!-- slide: id=id5 title="„install“ – instalace balíčků II" tags="Skip" diff="basics" -->
## „install“ – instalace balíčků II

Příkaz `install` nabízí řadu pokročilých přepínačů pro různé vývojové scénáře:

- **`--upgrade`** (`-U`): Povýší zadaný balíček (a případně jeho závislosti) na nejnovější dostupnou verzi.
- **`--no-deps`**: Nainstaluje pouze požadovaný balíček bez automatického stahování jeho závislostí (užitečné při ladění).
- **`--dry-run`**: Simuluje instalaci a ukáže, co by se změnilo, aniž by cokoliv zapisoval na disk.
- **`-e .`** (*Editable install*, PEP 660): Nainstaluje váš lokální vyvíjený projekt v editačním módu. Změny v kódu se projeví okamžitě bez nutnosti reinstalace.

---

<!-- slide: id=id6 title="„freeze“ & „--requirement“ – záznam a rekonstrukce závislostí" tags="Core" diff="pythonic" -->
## „freeze“ & „--requirement“ – záznam a rekonstrukce závislostí

Když odladíte své virtuální prostředí, potřebujete přesný seznam použitých verzí předat kolegům nebo na CI server.

Příkaz `freeze` vygeneruje seznam všech balíčků v přesných verzích:
```bash
python -m pip freeze > requirements.txt
```

Obsah souboru `requirements.txt`:
```text
numpy==2.0.1
pandas==2.2.2
python-dateutil==2.9.0.post0
pytz==2024.1
six==1.16.0
tzdata==2024.1
```

Kdokoliv jiný pak identické prostředí zrekonstruuje jediným příkazem:
```bash
python -m pip install -r requirements.txt
```

> [!TIP]
> **Moderní trend (PEP 621):**
> V nových projektech se přímé závislosti projektu zapisují deklarativně do souboru **`pyproject.toml`** v sekci `[project.dependencies]`, zatímco exaktní lockfile generují moderní nástroje jako `pip-tools` či `uv`.

---

<!-- slide: id=id7 title="Kam instalovat?" tags="Core" diff="newconcept" -->
## Kam instalovat?

V moderním Pythonu (3.11+) existuje jediné správné místo pro instalaci knihoven projektu: **virtuální prostředí (`.venv`)**.

### Proč se dnes vyhnout historickému `--user` a globální instalaci:
1. **PEP 668 (Externally-managed environment):** V moderních distribucích (Ubuntu 23+, Debian 12+, Arch, macOS Homebrew) vás systém při pokusu o `pip install` bez aktivního venvu zastaví chybovou hláškou:
   `error: externally-managed-environment`
2. **Ochrana stability OS:** Globální Python v systému využívají systémové utility. Neuvážený upgrade může znefunkčnit správce sítě či balíčků.
3. **Konflikty mezi projekty:** Různé projekty vyžadují nekompatibilní verze (např. Django 4 vs Django 5).

> [!IMPORTANT]
> Zlaté pravidlo: **1 projekt = 1 virtuální prostředí `.venv`**.

---

<!-- slide: id=id8 title="„uninstall“ – odinstalace balíčků" tags="Core" diff="basics" -->
## „uninstall“ – odinstalace balíčků

Odstranění nainstalovaného balíčku je přímočaré:
```bash
python -m pip uninstall requests
```

Přepínač `-y` (`--yes`) přeskočí potvrzovací dotaz:
```bash
python -m pip uninstall -y requests
```

> [!WARNING]
> `pip uninstall` maže **pouze zadaný balíček**, nikoliv jeho tranzitivní závislosti, které si dříve dotáhl.
> Pokud chcete prostředí dokonale vyčistit, nejsnazší cestou je smazat složku `.venv` a znovu ji čistě vytvořit:
> ```bash
> rm -rf .venv && python3 -m venv .venv && source .venv/bin/activate
> ```

---

<!-- slide: id=id9 title="„search“ – vyhledávání na PyPI" tags="Skip" diff="basics" -->
## „search“ – vyhledávání na PyPI

Příkaz `pip search` byl v prosinci 2020 **trvale odstaven** na straně PyPI serverů kvůli masivním DDoS útokům na staré XML-RPC rozhraní.

Při pokusu o `pip search` dostanete chybu:
```text
ERROR: XMLRPC request failed [code: 410]
Gone (The PyPI XML-RPC search endpoint has been disabled)
```

### Jak hledat balíčky dnes:
1. Přímo ve webovém rozhraní na [pypi.org](https://pypi.org) s bohatými filtry a statistikami stažení.
2. Pomocí moderních komunitních CLI nástrojů (např. `pip-search`).
3. Prostřednictvím GitHubu nebo odborných přehledů v dokumentaci.

---

<!-- slide: id=id10 title="Balíčky s binárními komponentami" tags="Tricky" diff="newconcept" -->
## Balíčky s binárními komponentami

Mnoho stěžejních vědeckých a systémových balíčků (např. *NumPy*, *Pandas*, *Pillow*, *Cryptography*) obsahuje kritické části napsané v C, C++ nebo Rustu pro maximální výkon.

V dávných dobách Pythonu se tyto balíčky distribuovaly pouze jako zdrojový kód (`sdist`) a uživatel musel mít nainstalovaný C kompilátor (GCC, MSVC, MinGW).

V moderním Pythonu (3.12+) byl historický modul `distutils` definitivně odstraněn (**PEP 632**). Dnešní standard staví na **PEP 517/518** a automatizovaných CI buildech.

> [!NOTE]
> Běžný uživatel dnes již téměř **nikdy nemusí kompilovat knihovny ze zdrojových kódů ručně**. Vše řeší předkompilovaný formát **Wheel**.

---

<!-- slide: id=id11 title="„wheel“ – univerzální binární balíčky" tags="WOW" diff="pythonic" python="3.12+" -->
## „wheel“ – univerzální binární balíčky

Standard **Wheel** ([PEP 427](https://peps.python.org/pep-0427/)) je binární distribuční balíček s příponou `.whl`.

Jedná se o standardní ZIP archiv s přesnou vnitřní strukturou obsahující předkompilovaný kód pro danou platformu a architekturu.

```bash
# Pip automaticky preferuje hotový .whl pro váš OS:
python -m pip install numpy
# Stahuje např.: numpy-2.0.1-cp312-cp312-win_amd64.whl
# Instalace proběhne za zlomek sekundy pouhým rozbalením!
```

Moderní výhody:
- **Blesková instalace**: Žádná kompilace na stroji uživatele, jen čisté rozbalení do `site-packages`.
- **Podpora všech platforem**: Oficiální kola pro Windows (x64, ARM64), macOS (Apple Silicon, Intel) i Linux (`manylinux` standard).

---

<!-- slide: id=id12 title="Závěrečná doporučení & Best Practices" tags="Tricky" diff="basics" python="3.12+" -->
## Závěrečná doporučení & Best Practices

Při práci s balíčky v moderním Pythonu dodržujte tyto 4 zásady:

1. **Vždy aktivujte `.venv`**: Nikdy neinstalujte balíčky globálně do operačního systému.
2. **Spouštějte `python -m pip`**: Vyhnete se nechtěnému volání pipu z jiné instalace Pythonu.
3. **Pro samostatné nástroje použijte `pipx`**: Nástroje jako `ruff`, `black`, `mypy` nebo `pytest` instalujte izolovaně přes `pipx install <nástroj>`.
4. **Prozkoumejte `uv`**: Pokud pracujete s rozsáhlými vědeckými balíčky, moderní správce `uv` (`uv pip install ...`) dokáže stejnou instalaci provést 10× až 100× rychleji díky implementaci v Rustu.
