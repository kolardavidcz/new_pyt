<!-- slide: id=id1 title="Úvod do virtuálních prostředí" tags="Skip" diff="basics" -->
## Úvod do modulu `venv`

Modul **`venv`** je vestavěný standardní nástroj Pythonu (od verze 3.3) pro vytváření lehkých, izolovaných virtuálních prostředí.

Virtuální prostředí řeší zásadní problém správy závislostí:
- Každý projekt má svou vlastní složku se specifickými verzemi knihoven (`site-packages`).
- Instalace knihoven nevyžaduje administrátorská oprávnění (`sudo` / root).
- Projekty na jednom počítači si vzájemně nekolidují v různých verzích stejných balíčků.

---
<!-- slide: id=id2 title="Zavedení nového virtuálního prostředí" tags="Core" diff="newconcept" -->
## Vytvoření virtuálního prostředí: `python -m venv`

Virtuální prostředí se vytváří standardním příkazem:

```bash
python -m venv .venv
```

Tento příkaz vytvoří složku `.venv` a uvnitř ní připraví:
- **`pyvenv.cfg`**: Konfigurační soubor s klíčem `home` ukazujícím na systémovou instalaci Pythonu.
- **`bin/`** (na Linux/macOS) nebo **`Scripts/`** (na Windows): Odkazy na interpret `python`, balíčkovač `pip` a aktivační skripty.
- **`lib/python3.12/site-packages`** (či `Lib\site-packages` na Windows): Izolovaný adresář pro instalaci balíčků.
- **`include/`**: Hlavičkové soubory pro překlad C rozšíření.
- **`.gitignore`** (od Pythonu 3.13): Soubor automaticky vylučující složku prostředí z verzování v Gitu (`*`).

---
<!-- slide: id=id3 title="Přepínače a možnosti nastavení venv" tags="Skip" diff="basics" -->
## Přepínače a konfigurace při vytváření

Příkaz `venv` podporuje několik užitečných parametrů:

- **`--upgrade-deps`**: Okamžitě při vytvoření aktualizuje `pip` a `setuptools` na nejnovější verzi z PyPI.
- **`--system-site-packages`**: Zpřístupní globálně nainstalované knihovny operačního systému (lokální balíčky v `.venv` mají stále přednost).
- **`--without-pip`**: Vytvoří prostředí bez instalace balíčkovače `pip` (např. pokud používáte moderní nástroje jako `uv`).
- **`--prompt NAZEV`**: Nastaví vlastní textový prefix v příkazové řádce shellu (např. `(muj-projekt)`).
- **`--clear`**: Před vytvořením kompletně smaže existující obsah cílové složky.

```bash
python -m venv --upgrade-deps --prompt "vyuka" .venv
```

---
<!-- slide: id=id4 title="Práce s virtuálním prostředím a aktivace" tags="Tricky" diff="basics" -->
## Aktivace virtuálního prostředí

Prostředí můžete používat přímo voláním spustitelných souborů s plnou cestou (např. `./.venv/bin/python main.py` nebo `./.venv/bin/pip install requests`).

Pokud však chcete pracovat v terminálu interaktivně, prostředí **aktivujte**:

```bash
# Linux / macOS (bash / zsh)
source .venv/bin/activate

# Windows (Command Prompt cmd.exe)
.venv\Scripts\activate.bat

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
```

Aktivace provede jedinou věc: přidá složku `.venv/bin` (nebo `Scripts`) na úplný začátek proměnné prostředí **`$PATH`**. Když pak napíšete `python` nebo `pip`, spustí se binárka z virtuálního prostředí.

---
<!-- slide: id=id5 title="Preferovaný způsob práce: složka .venv" tags="Core" diff="pythonic" -->
## Standardní struktura projektu: `.venv`

Nejlepší praxí v moderním vývoji (podporovanou VS Code, PyCharmem i nástroji jako `uv` a `poetry`) je umístit virtuální prostředí přímo do kořene projektu pod názvem **`.venv`**:

```text
muj-projekt/
├── .venv/               # Izolované prostředí (IGNOROVÁNO V GITU!)
├── src/
│   └── main.py
├── pyproject.toml       # Moderní definice závislostí (PEP 621)
├── requirements.txt     # Případně tradiční export závislostí
└── .gitignore
```

> [!CAUTION]
> Virtuální prostředí **NIKDY** neukládejte do gitu! Zahrnuje stovky megabajtů platformně závislých binárek. Do gitu patří pouze soubor specifikující závislosti (`pyproject.toml` nebo `requirements.txt`).

---
<!-- slide: id=id6 title="Kontrola aktivního prostředí: sys.prefix" tags="WOW" diff="pythonic" -->
## Kontrola aktivního prostředí: `sys.prefix`

Pokud chcete v Python skriptu ověřit, zda běžíte uvnitř virtuálního prostředí, využijte modul `sys`:

```python
import sys

print("Základní systémový Python:", sys.base_prefix)
print("Aktuální prefix interpretu:", sys.prefix)

je_ve_venv = sys.prefix != sys.base_prefix
print(f"Běží ve virtuálním prostředí: {je_ve_venv}")
```

- **`sys.base_prefix`**: Cesta k původní hlavní instalaci Pythonu na disku.
- **`sys.prefix`**: Cesta k aktuálnímu virtuálnímu prostředí.
- Pokud `sys.prefix != sys.base_prefix`, skript bezpečně běží ve virtuálním prostředí.

---
<!-- slide: id=id7 title="Deaktivace a smazání virtuálního prostředí" tags="Core" diff="basics" -->
## Deaktivace a odstranění prostředí

- **Deaktivace v shellu**:
  V aktivovaném terminálu stačí zavolat příkaz:
  ```bash
  deactivate
  ```
  Příkaz vrátí původní hodnotu systémové proměnné `$PATH`. Deaktivace proběhne také automaticky pouhým zavřením okna terminálu.

- **Smazání virtuálního prostředí**:
  Virtuální prostředí nemá žádné skryté systémové registry. Odstraníte jej prostým smazáním složky:
  ```bash
  rm -rf .venv          # Linux / macOS
  Remove-Item -Recurse -Force .venv  # Windows PowerShell
  ```
  Kdykoliv jej můžete během sekund znovu vytvořit ze závislostí.
