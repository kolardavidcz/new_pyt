<!-- lecture: title="Virtuální prostředí v Pythonu" slug="materialy--python--packages--virtual_overview" week=0 -->

<!-- slide: id=id1 title="Úvod" tags="Core" diff="basics" -->
## Úvod

Nestačí-li vám k vývoji programu vestavěné knihovny standardní distribuce, budete si muset doinstalovat externí balíčky (např. *requests*, *numpy*, *pillow*).

Python umožňuje doinstalovávané knihovny systémově umístit na dvě výchozí místa:
- **Do systémové instalace Pythonu** (sdílené globálně v celém operačním systému)
- **Do uživatelského adresáře** (`~/.local/lib/pythonX.Y/site-packages`)

Adresáře systémové instalace však v moderních distribucích (Ubuntu 23+, Debian 12+) z bezpečnostních důvodů **nejsou přímo zapisovatelné** (tzv. *PEP 668 – externally-managed environment*). Navíc ani uživatelský adresář nestačí v situaci, kdy na jednom počítači vyvíjíte dva různé projekty vyžadující nekompatibilní verze téže knihovny.

A právě v tu chvíli nastupují **virtuální prostředí**.

---

<!-- slide: id=id2 title="Definice" tags="Core" diff="basics" -->
## Definice

**Virtuální prostředí** (*virtual environment*) je zcela samostatná, „čistá“ instalace příslušné verze Pythonu izolovaná od systémových balíčků.

Do virtuálního prostředí můžete doinstalovávat knihovny a nástroje naprosto nezávisle na systémovém Pythonu i na všech ostatních projektech.

> [!NOTE]
> Oficiální specifikace virtuálních prostředí je zakotvena v [PEP 405 – Python Virtual Environments](https://peps.python.org/pep-0405/).

---

<!-- slide: id=id3 title="Realizace" tags="Core" diff="newconcept" -->
## Realizace

Virtuální prostředí v Pythonu fungují pomocí úpravy algoritmu pro dohledávání knihoven (interní proměnná `sys.prefix` a vestavěný modul `site`).

Při spuštění binárky se Python podívá do svého bezprostředního okolí po konfiguračním souboru **`pyvenv.cfg`**:
- Pokud soubor najde, nastaví `sys.prefix` na složku virtuálního prostředí.
- Dohledávání knihoven v `site-packages` tím přesměruje do virtuálního prostředí.

> [!NOTE]
> **Struktura minimálního virtuálního prostředí:**
> - **`pyvenv.cfg`**: konfigurační soubor s cestou k mateřskému interpretu (`home = ...`)
> - **`bin/`** (resp. **`Scripts/`** na Windows): symlinky na pythoní binárku a aktivační skripty
> - **`lib/pythonX.Y/site-packages/`** (resp. **`Lib/`** na Windows): izolované úložiště doinstalovaných balíčků

---

<!-- slide: id=id4 title="Význam" tags="Core" diff="basics" -->
## Význam

Hlavní přínosy virtuálních prostředí v profesionálním vývoji:
- **Dokonalá izolace projektů**: Každý projekt má vlastní nezávislé závislosti definované v `pyproject.toml` nebo `requirements.txt`.
- **Řešení konfliktů verzí**: Projekt A může běžet na `pydantic 1.x`, zatímco Projekt B používá `pydantic 2.x`.
- **Bezpečnost operačního systému**: Žádný `pip install` nepřepíše balíčky potřebné pro systémové nástroje OS.
- **Reprodukovatelnost prostředí**: Prostředí lze kdykoliv jednoduše smazat a znovu čistě vygenerovat ze závislostí.

---

<!-- slide: id=id5 title="Moderní nástroje: venv, uv a pipx" tags="Core" diff="basics" python="3.12+" -->
## Moderní nástroje: venv, uv a pipx

V moderním ekosystému Pythonu (3.10–3.13) se již historické nástroje jako `virtualenv` či imperativní `setup.py` nepoužívají. Standardem jsou 3 specializované nástroje:

### 1. `venv` (Vestavěný standard v Pythonu)
```bash
# Vytvoření virtuálního prostředí ve složce .venv v kořenu projektu
python3 -m venv .venv

# Aktivace na Linuxu a macOS:
source .venv/bin/activate

# Aktivace na Windows (PowerShell):
.venv\Scripts\Activate.ps1
```

### 2. `uv` (Extrémně rychlý moderní správce v Rustu)
```bash
# Vytvoření prostředí trvá méně než 10 ms:
uv venv

# Blesková instalace balíčků s exaktním lockováním:
uv pip install numpy requests
```

### 3. `pipx` (Pro globální CLI nástroje)
- Nástroje jako `ruff`, `black`, `mypy` nebo `pytest` neinstalujeme globálně přes `pip`, ale přes `pipx install <nástroj>`. Každý nástroj dostane své vlastní skryté izolované prostředí.

> [!TIP]
> **Zlaté pravidlo vývoje:**
> Virtuální prostředí vytvářejte vždy v kořenu projektu do složky **`.venv`** a ihned přidejte `.venv/` do svého **`.gitignore`**! Virtuální prostředí se do Gitu nikdy necommituje.
