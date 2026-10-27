<!-- lecture: title="Conda – úvod do prostředí" slug="materialy--python--packages--conda" week=0 -->

<!-- slide: id=id1 title="Balíčkovací systémy" tags="Core" diff="basics" -->
## Balíčkovací systémy

Balíčkovací systémy slouží k automatizované instalaci knihoven a modulů z centrálních repozitářů, souhrnně nazývaných **balíčky** (*packages*).

Správce balíčků řeší klíčové úkoly:
1. **Dohledání v repozitáři**: Stažení přesné verze balíčku.
2. **Řešení závislostí (*dependency resolution*)**: Ověření, že všechny požadované knihovny jsou vzájemně kompatibilní a nevznikají verze v konfliktu.
3. **Instalace binárních komponent**: Umístění zkompilovaných C/C++ knihoven a nastavení dynamického linkování.

Ve vědeckém Pythonu se vedle standardního `pip` nejčastěji setkáte s nástrojem **Conda**.

---

<!-- slide: id=id2 title="Virtuální prostředí" tags="Core" diff="newconcept" -->
## Virtuální prostředí

V praxi se běžně dostanete do situace, kdy Projekt A vyžaduje `pydantic 1.x`, zatímco nový Projekt B vyžaduje `pydantic 2.x`. Pokud byste balíčky instalovali globálně do operačního systému, jeden projekt by druhý znefunkčnil.

Virtuální prostředí tento problém elegantně řeší:
- Vytvoří **izolovaný adresář** s vlastní instalací Pythonu a složkou `site-packages`.
- Při aktivaci prostředí se dočasně upraví systémová proměnná `PATH`.
- Veškeré spouštění příkazů (`python`, `pip`, `pytest`) i importy knihoven směřují výhradně do tohoto izolovaného adresáře.

---

<!-- slide: id=id3 title="(Ana)conda a Miniforge" tags="Core" diff="basics" python="3.12+" -->
## (Ana)conda a Miniforge

Nástroj **Conda** funguje jako balíčkovací správce a manažer virtuálních prostředí současně.

K dispozici jsou různé distribuce:
- **`Miniforge` (Doporučeno):** Čistá, lehká instalace s přednastaveným komunitním kanálem `conda-forge` a rychlým solverem `mamba`.
- **`Miniconda`:** Minimální instalace od Anaconda Inc.
- **`Anaconda`:** Plná distribuce obsahující gigabajty předinstalovaných balíků pro data science.

> [!NOTE]
> Instalace Condy nevyžaduje administrátorská oprávnění (root / admin) – instaluje se přímo do domovského adresáře uživatele (`~/.miniforge3` nebo `C:\Users\<Uzivatel>\miniforge3`).

---

<!-- slide: id=id4 title="Instalace Miniforge" tags="Skip" diff="basics" -->
## Instalace Miniforge

Oficiální instalační skripty a instalátory pro všechny platformy jsou k dispozici na [github.com/conda-forge/miniforge](https://github.com/conda-forge/miniforge):

- **Linux (WSL / Ubuntu):** Shell skript spuštěný jedním příkazem:
  ```bash
  curl -L -O "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-x86_64.sh"
  bash Miniforge3-Linux-x86_64.sh
  ```
- **macOS:** Instalační skript pro Apple Silicon (M1/M2/M3) nebo Intel x64.
- **Windows:** Standardní grafický instalátor `.exe`.

---

<!-- slide: id=id5 title="První seznámení s condou" tags="Skip" diff="basics" -->
## První seznámení s condou

Ověření správné instalace v terminálu:
```bash
# Zobrazení verze Condy:
conda --version

# Souhrnné systémové informace a cesty k aktivním repozitářům:
conda info

# Nápověda k libovolnému podřízenému příkazu:
conda create --help
conda install --help
```

---

<!-- slide: id=id6 title="Vytvoření virtuálního prostředí I" tags="Core" diff="basics" -->
## Vytvoření virtuálního prostředí I

Virtuální prostředí se v Condě vytváří příkazem `conda create`:

```bash
conda create -n muj_vyzkum python=3.12
```

Seznam všech dostupných prostředí na vašem počítači zobrazíte příkazem:
```bash
conda env list
# nebo ekvivalentně:
conda info --envs
```

> [!NOTE]
> Základní výchozí prostředí se nazývá **`base`**. V něm je nainstalována samotná Conda. Pro své projekty **vždy vytvářejte samostatná pojmenovaná prostředí** a neinstalujte projektové balíčky do `base`!

---

<!-- slide: id=id7 title="Vytvoření virtuálního prostředí II" tags="Tricky" diff="newconcept" -->
## Vytvoření virtuálního prostředí II

Nejdůležitější parametry příkazu `conda create`:

- **`-n NÁZEV`** (`--name`): Pojmenování nového prostředí.
- **`-c KANÁL`** (`--channel`): Výběr repozitáře (typicky `-c conda-forge`).
- **`--clone STARÉ_VP`**: Vytvoří přesnou kopii existujícího prostředí (vhodné před rizikovým upgradem).
- **`--dry-run`**: Pouze simuluje vytvoření a vypíše seznam balíčků, aniž by cokoliv stahoval.

> [!IMPORTANT]
> Pokud za parametry neuvedete žádný balíček (např. `python=3.12`), Conda vytvoří zcela prázdné prostředí bez vlastního interpretu, které bude sahat na systémový Python! Vždy proto explicitně uveďte `python=<verze>`.

---

<!-- slide: id=id8 title="Vytvoření virtuálního prostředí – příklady" tags="Core" diff="basics" python="3.12+" -->
## Vytvoření virtuálního prostředí – příklady

```bash
# 1. Prostředí s moderním Pythonem 3.12:
conda create -n vyzkum python=3.12

# 2. Vytvoření prostředí rovnou s vědeckými knihovnami:
conda create -n chemoinformatika -c conda-forge python=3.12 numpy rdkit scipy

# 3. Zobrazení všech vytvořených prostředí a jejich umístění:
conda env list
```

---

<!-- slide: id=id9 title="Práce ve virtuálním prostředí" tags="Core" diff="basics" -->
## Práce ve virtuálním prostředí

Aktivace a deaktivace prostředí:

```bash
# Aktivace vytvořeného prostředí:
conda activate vyzkum

# Deaktivace zpět do základního prostředí base:
conda deactivate
```

Aktivní prostředí poznáte podle předpony v příkazové řádce:
```bash
(vyzkum) kolar@server:~$ which python
/home/kolar/miniforge3/envs/vyzkum/bin/python
```

Veškeré následné příkazy (`python`, `pip`, `jupyter`) nyní automaticky běží v rámci tohoto prostředí.

---

<!-- slide: id=id10 title="Odstranění virtuálního prostředí" tags="Core" diff="basics" -->
## Odstranění virtuálního prostředí

Pokud prostředí již nepotřebujete a chcete uvolnit místo na disku:

```bash
conda remove -n vyzkum --all
```

> [!WARNING]
> Přepínač **`--all`** je povinný – říká Condě, že má smazat nejen všechny balíčky v prostředí, ale i samotnou složku prostředí.

---

<!-- slide: id=id11 title="Instalace balíčků" tags="Core" diff="basics" -->
## Instalace balíčků

Instalace balíčků do aktuálně aktivního prostředí:
```bash
conda install numpy pandas matplotlib
```

Vždy doporučujeme specifikovat komunitní kanál **`conda-forge`**:
```bash
conda install -c conda-forge rdkit
```

Conda nejprve propočítá kompletní strom závislostí a ukáže plán instalace. Po potvrzení klávesou `y` balíčky stáhne a nainstaluje.

---

<!-- slide: id=id12 title="Instalace balíčků – příklady" tags="WOW" diff="pythonic" -->
## Instalace balíčků – příklady

```bash
# Instalace konkrétní verze:
conda install -c conda-forge "numpy>=2.0,<3.0"

# Instalace chemoinformatického balíku RDKit:
conda install -c conda-forge rdkit

# Kombinace Condy a Pipu:
# Pokud balíček není na conda-forge, můžete ve stejném aktivním prostředí zavolat pip:
pip install specialni-knihovna-z-pypi
```

> [!TIP]
> **Doporučená praxe pro pip uvnitř condy:**
> Nejprve nainstalujte všechny těžké C/C++ knihovny přes `conda install -c conda-forge`, a teprve poté doinstalujte čistě pythoní doplňky přes `pip install`.

---

<!-- slide: id=id13 title="Správa balíčků" tags="Core" diff="basics" -->
## Správa balíčků

Nejdůležitější inspekční příkazy v aktivním prostředí:

```bash
# Výpis všech nainstalovaných balíčků a jejich verzí:
conda list

# Povýšení konkrétních balíčků na nejnovější kompatibilní verzi:
conda update numpy pandas

# Povýšení všech balíčků v prostředí:
conda update --all

# Odstranění konkrétního balíčku:
conda remove pandas

# Vyhledání dostupných verzí na conda-forge:
conda search -c conda-forge rdkit
```

---

<!-- slide: id=id14 title="Správa balíčků – Python verze" tags="Tricky" diff="newconcept" -->
## Správa balíčků – Python verze

Příkaz `conda update --all` povyšuje balíčky pouze v rámci kompatibility stávající podverze Pythonu (např. v rámci 3.12.x).

Pokud chcete celé prostředí povýšit na novou hlavní verzi Pythonu (např. z 3.11 na 3.12):
```bash
conda install -c conda-forge python=3.12
```

Conda zkontroluje, zda pro Python 3.12 existují všechny ostatní dříve nainstalované balíčky v prostředí, a provede konzistentní upgrade.

---

<!-- slide: id=id15 title="Správa virtuálních prostředí – export a reprodukce" tags="WOW" diff="pythonic" -->
## Správa virtuálních prostředí – export a reprodukce

Pro zaručení reprodukovatelnosti vědeckých výsledků je nutné přesnou konfiguraci prostředí zaznamenat do souboru **`environment.yml`**:

```bash
# Export prostředí bez platforemně specifických build hashů:
conda env export --no-builds > environment.yml
```

Ukázka souboru `environment.yml`:
```yaml
name: chemo-vyzkum
channels:
  - conda-forge
dependencies:
  - python=3.12
  - numpy>=2.0
  - rdkit
  - pandas
  - pip:
      - pydantic-settings
```

Kolega na jiném počítači (či na Linuxovém clusteru) prostředí zrekonstruuje jediným příkazem:
```bash
conda env create -f environment.yml
```

---

<!-- slide: id=id16 title="Použití v moderních editorech (VS Code & PyCharm)" tags="Skip" diff="basics" -->
## Použití v moderních editorech (VS Code & PyCharm)

Moderní vývojová prostředí Conda prostředí detekují automaticky:

### Ve Visual Studio Code:
1. Otevřete Command Palette: `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`).
2. Napište: **`Python: Select Interpreter`**.
3. V nabídce uvidíte všechna svá Conda prostředí (označená jako `conda: vyzkum`).
4. VS Code automaticky aktivuje prostředí v každém novém terminálu.

### V PyCharmu:
- V nastavení projektu: *Settings $\rightarrow$ Project: ... $\rightarrow$ Python Interpreter $\rightarrow$ Add Interpreter $\rightarrow$ Conda Environment*.
