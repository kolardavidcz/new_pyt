<!-- lecture: title="Více verzí Pythonu na jednom stroji" slug="materialy--python--more-versions" week=0 -->

<!-- slide: id=id1 title="Úvod" tags="Skip" diff="basics" -->
## Úvod

Při aktivním vývoji se běžně dostanete do situace, kdy na jednom počítači potřebujete testovat kód proti **více různým verzím Pythonu** (např. stabilní produkční Python 3.11, moderní standard Python 3.12 a nejnovější experimentální Python 3.13).

Problémy se objevují zejména:
- Která verze se spustí při zadání prostého příkazu `python`?
- Jak zajistit, aby skript automaticky použil správný interpret na Linuxu i na Windows?
- Jak moderně spravovat paralelní instalace bez rizika rozbití systémových nástrojů?

---

<!-- slide: id=id2 title="Linux & macOS: `python3` a `python3.X`" tags="Core" diff="basics" -->
## Linux & macOS: `python3` a `python3.X`

V moderních linuxových distribucích (Ubuntu 22+, Debian 12+, Fedora, Arch) a na macOS:
- Příkaz **`python3`** ukazuje na výchozí verzi dodanou distribucí.
- Pro konkrétní verze jsou k dispozici verze se specifickým číslem:
  ```bash
  python3.11 --version
  python3.12 --version
  python3.13 --version
  ```

> [!WARNING]
> Nikdy nepřepisujte systémový symlink `/usr/bin/python3` na jinou verzi! Systémové utility (např. správce balíčků `apt` nebo síťový stack) jsou pevně svázány s verzí Pythonu dodanou distribucí.

---

<!-- slide: id=id3 title="Spouštěcí hlavička: Shebang (`#!`)" tags="Core" diff="basics" -->
## Spouštěcí hlavička: Shebang (`#!`)

Pokud chcete, aby se soubor `.py` na Linuxu nebo macOS dal spustit přímo jako příkaz (`./skript.py`), musí mít nastaven spustitelný atribut (`chmod +x skript.py`) a na prvním řádku obsahovat tzv. **shebang**:

```python
#!/usr/bin/env python3
"""Univerzální standard pro moderní Python 3."""

print("Spuštěno přes python3 z aktivního prostředí!")
```

Proč použít `#!/usr/bin/env python3`:
- Vyhledá `python3` v systémové proměnné `PATH`.
- Pokud máte aktivované virtuální prostředí (`.venv`), shebang automaticky použije Python z tohoto virtuálního prostředí, nikoliv systémový.

---

<!-- slide: id=id4 title="Windows: Windows Python Launcher (`py.exe`)" tags="WOW" diff="pythonic" python="3.12+" -->
## Windows: Windows Python Launcher (`py.exe`)

Na Windows je oficiálním standardem spouštěč **`py.exe`** (zakotvený v [PEP 397](https://peps.python.org/pep-0397/)).

Spouštěč `py` automaticky rozpozná všechny nainstalované verze Pythonu na vašem PC:
```powershell
# Výpis všech detekovaných verzí Pythonu:
py --list
# nebo zkráceně:
py -0

# Spuštění konkrétní verze:
py -3.11 skript.py
py -3.12 skript.py
py -3.13 skript.py
```

> [!TIP]
> Spouštěč `py` na Windows plně rozumí i linuxovým hlavičkám shebang! Pokud skript začíná `#!/usr/bin/env python3.12`, příkaz `py skript.py` jej automaticky spustí v Pythonu 3.12.

---

<!-- slide: id=id5 title="Výchozí verze v `py.exe` a proměnná `PY_PYTHON`" tags="Tricky" diff="basics" -->
## Výchozí verze v `py.exe` a proměnná `PY_PYTHON`

Při zavolání prostého `py` se spustí nejnovější nainstalovaná verze Pythonu (např. 3.13).

Pokud chcete jako globální výchozí verzi pro `py` nastavit jinou konkrétní verzi (např. stabilní 3.12), můžete to provést dvěma způsoby:

1. **Proměnnou prostředí:**
   Nastavte proměnnou `PY_PYTHON=3.12`.
2. **Konfiguračním souborem `py.ini`:**
   V souboru `%LOCALAPPDATA%\py.ini`:
   ```ini
   [defaults]
   python = 3.12
   ```

---

<!-- slide: id=id6 title="Moderní správa verzí: `uv python` a `pyenv`" tags="Core" diff="basics" python="3.12+" -->
## Moderní správa verzí: `uv python` a `pyenv`

V moderním softwarovém inženýrství již není nutné stahovat instalátory ručně z python.org. Standardem jsou dva nástroje:

### 1. `uv python` (Bleskový moderní správce v Rustu):
```bash
# Bleskové stažení a instalace libovolných verzí Pythonu:
uv python install 3.11 3.12 3.13

# Spuštění skriptu v konkrétní verzi bez nutnosti cokoliv konfigurovat:
uv run --python 3.12 skript.py

# Vytvoření virtuálního prostředí s přesnou verzí:
uv venv --python 3.12 .venv
```

### 2. `pyenv` (Tradiční standard pro Linux a macOS):
```bash
pyenv install 3.12.4
pyenv local 3.12.4  # Nastaví verzi pro aktuální složku
```

---

<!-- slide: id=id7 title="Závěrečná doporučení pro multi-version vývoj" tags="Skip" diff="basics" python="3.12+" -->
## Závěrečná doporučení pro multi-version vývoj

1. **Nikdy se nespoléhejte na globální stav operačního systému.**
2. **Vždy vytvářejte projektové virtuální prostředí `.venv`:**
   ```bash
   uv venv --python 3.12 .venv
   # nebo:
   python3.12 -m venv .venv
   ```
3. **Pro automatizované testování více verzí použijte `tox` nebo `nox`:**
   Tyto nástroje automaticky spustí celou sadu testů paralelně v Pythonu 3.10, 3.11, 3.12 i 3.13.
4. **Na Windows volejte `py`:** Je to spolehlivější než spoléhat na proměnnou `PATH`.
