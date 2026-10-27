<!-- lecture: title="Conda – správa vědeckých balíčků" slug="materialy--python--packages--conda_overview" week=0 -->

<!-- slide: id=id1 title="Úvod" tags="Core" diff="basics" -->
## Úvod

Proč vedle standardního `pip` a `venv` existuje ještě **Conda**?

Ve vědeckých a inženýrských výpočtech (chemie, bioinformatika, strojové učení) čistý Python nestačí. Výpočetně náročné knihovny jsou napsány v **C, C++, Fortranu, Rustu nebo využívají CUDA jádra grafických karet**. Tyto knihovny vyžadují specifické systémové binární knihovny (BLAS, LAPACK, OpenMP, CUDA runtime), které standardní `pip` na úrovni operačního systému nedokáže nainstalovat.

A právě pro tyto komplexní vícejazyčné vědecké ekosystémy vznikla **Conda**.

---

<!-- slide: id=id2 title="„Enter Conda!“" tags="Core" diff="newconcept" -->
## „Enter Conda!“

**Conda** je systémově i jazykově nezávislý balíčkovací správce a manažer virtuálních prostředí pro Linux, Windows i macOS.

Na rozdíl od `pip` (který spravuje pouze Python balíčky):
- Dokáže do izolovaného prostředí nainstalovat **kompletní runtime**: interpret Pythonu libovolné verze, kompilátory, C++ knihovny i CUDA toolkit.
- Zaručuje binární kompatibilitu všech nainstalovaných komponent pomocí pokročilého SAT řešiče závislostí.
- Zabraňuje konfliktům mezi systémovými knihovnami OS a potřebami vašeho výzkumu.

---

<!-- slide: id=id3 title="Ekosystém „Condy“: Miniforge vs Anaconda" tags="Skip" diff="basics" python="3.12+" -->
## Ekosystém „Condy“: Miniforge vs Anaconda

Distribuci Condy lze získat v několika variantách:

1. **`Miniforge` (Doporučený moderní standard):**
   - Minimální, čistá a zcela svobodná instalace postavená výhradně na komunitním kanálu **`conda-forge`**.
   - Obsahuje bleskového správce **Mamba** napsaného v C++.
   - Neobsahuje žádná licenční omezení pro komerční či univerzitní použití.
2. **`Miniconda`:**
   - Minimální instalace od společnosti Anaconda Inc. s výchozím kanálem `defaults`.
3. **`Anaconda Distribution`:**
   - Masivní instalace (více než 5 GB) obsahující stovky předinstalovaných balíků pro data science.

> [!TIP]
> Pro moderní vědeckou práci doporučujeme instalovat **Miniforge**.

---

<!-- slide: id=id4 title="Kanály a balíčky: conda-forge & RDKit" tags="WOW" diff="newconcept" -->
## Kanály a balíčky: conda-forge & RDKit

Balíčky v Condě jsou organizovány do repozitářů nazývaných **kanály** (*channels*):

- **`conda-forge`**: Největší komunitní kanál na světě, který je de facto standardem pro veškerý vědecký výzkum.
- **`bioconda`**: Specializovaný kanál pro bioinformatické a chemoinformatické nástroje.

```bash
# Vždy instalujte z kanálu conda-forge:
conda install -c conda-forge rdkit
```

> [!NOTE]
> **Chemoinformatika a RDKit:**
> Knihovny jako **RDKit** (klíčové pro cheminformatiku a návrh léčiv) historicky vyžadovaly složité kompilace s Boost knihovnami. Díky Condě a `conda-forge` je instalace otázkou jediného příkazu. (Navíc dnes existuje i `pip install rdkit` pro standardní kola).

---

<!-- slide: id=id5 title="Moderní zrychlení: Mamba, Micromamba a Pixi" tags="Skip" diff="basics" python="3.12+" -->
## Moderní zrychlení: Mamba, Micromamba a Pixi

Původní příkaz `conda` byl napsán v Pythonu a řešení složitých závislostí (*dependency resolution*) u velkých prostředí často trvalo minuty až desítky minut.

V moderním ekosystému se proto prosadily bleskové alternativy:
- **`mamba`**: Kompletní drop-in náhrada za `conda` napsaná v C++ s využitím SAT solveru `libsolv`. Příkazy jsou identické: `mamba install -c conda-forge numpy scipy`.
- **`micromamba`**: Samostatná jednosouborová binárka v C++, která nepotřebuje žádný předinstalovaný Python.
- **`pixi`**: Moderní správce projektů v Rustu postavený na conda-forge balíčcích s deterministickým `pixi.lock`.

---

<!-- slide: id=id6 title="Licence a politika repozitářů Anaconda" tags="Tricky" diff="basics" -->
## Licence a politika repozitářů Anaconda

Společnost Anaconda Inc. v posledních letech upravila licenční podmínky (*Terms of Service*) pro svůj výchozí kanál `repo.anaconda.com` (`defaults`):

> Komunikační kanál `defaults` vyžaduje placenou komerční licenci pro organizace a firmy s více než 200 zaměstnanci.

### Bezpečná cesta pro univerzity i průmysl:
Používejte komunitní kanál **`conda-forge`**, který je 100% open-source, zdarma pro jakékoliv použití a udržován mezinárodní komunitou vědců a vývojářů:

```bash
# Nastavení conda-forge jako výchozího prioritního kanálu:
conda config --add channels conda-forge
conda config --set channel_priority strict
```

---

<!-- slide: id=id7 title="Kdy zvolit Conda vs venv + uv" tags="Skip" diff="basics" python="3.12+" -->
## Kdy zvolit Conda vs venv + uv

Moderní rozhodovací matice pro volbu správce prostředí:

| Potřeba projektu | Doporučený nástroj |
|---|---|
| Běžné webové aplikace, API, CLI skripty | **`python -m venv`** nebo bleskový **`uv`** |
| Rychlé lockování a instalace pure-Python balíčků | **`uv`** (výrazně rychlejší než conda) |
| Chemoinformatika, RDKit, C/C++ knihovny, OpenMM | **`conda` / `mamba`** (`conda-forge`) |
| Hluboké učení s CUDA závislostmi na Linuxu | **`mamba`** nebo oficiální PyTorch kola |
| Multi-jazykový projekt (Python + R + C++) | **`conda` / `pixi`** |

> [!TIP]
> Pokud nepotřebujete exotické nemapované C/Fortran binárky, moderní **`venv` + `uv`** představuje nejrychlejší a nejlehčí workflow.
