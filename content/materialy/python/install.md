<!-- lecture: title="Instalace potřebných programů" slug="materialy--python--install" week=0 -->

<!-- slide: id=id1 title="Úvod" tags="Skip" diff="basics" -->
## Úvod

Pro efektivní práci s Pythonem potřebujeme tři základní stavební kameny:
1. **Interpret jazyka Python (CPython):** Výkonné jádro, které čte a spouští váš kód.
2. **Příkazová řádka (Terminál / Shell):** Místo, kde kód spouštíme, testujeme a spravujeme balíčky.
3. **Programátorský editor nebo IDE:** Nástroj se zvýrazňováním syntaxe, automatickým doplňováním (LSP) a integrovaným debuggerem (např. **Visual Studio Code** nebo **PyCharm**).

> [!NOTE]
> Běžné kancelářské textové procesory (MS Word, LibreOffice Writer) nelze pro psaní programů použít – vkládají do textu formátovací metadata a mění rovné uvozovky na typografické.

---

<!-- slide: id=id2 title="Python I – skripty a interpret" tags="Core" diff="basics" -->
## Python I – skripty a interpret

Programy v Pythonu píšeme do obyčejných textových souborů s příponou **`.py`** uložených v kódování **UTF-8**.

- Kód není předem kompilován do strojového kódu CPU jako v C/C++, ale interpret Pythonu jej při spuštění přeloží do vnitřního bajtkódu (`.pyc`) v paměti a okamžitě vykoná.
- Soubor `main.py` můžete spustit z libovolného terminálu:
  ```bash
  python3 main.py
  ```

> [!IMPORTANT]
> Pokud pracujete ve Windows Průzkumníku, ujistěte se, že máte v nabídce *Zobrazit $\rightarrow$ Zobrazit $\rightarrow$ Přípony názvů souborů* zaškrtnuto. Jinak můžete omylem vytvořit `skript.py.txt`.

---

<!-- slide: id=id3 title="Python II – výběr distribuce (CPython)" tags="Core" diff="basics" python="3.12+" -->
## Python II – výběr distribuce (CPython)

Oficiální a nejrozšířenější referenční implementací jazyka je **CPython** (napsaný v C), dostupný zdarma na [python.org](https://python.org):

- **Aktuální moderní verze:** Python 3.12 (stabilní LTS) a Python 3.13 / 3.14.
- **Windows:** Oficiální 64bitový instalátor nebo instalace přes winget:
  ```powershell
  winget install Python.Python.3.12
  ```
- **macOS:** Oficiální instalátor z python.org nebo Homebrew (`brew install python@3.12`).
- **Linux (Ubuntu / Debian):** Python 3 je již předinstalován v systému.

---

<!-- slide: id=id4 title="PS: Kontrola instalačních souborů" tags="Skip" diff="basics" -->
## PS: Kontrola instalačních souborů

Při stahování instalátorů v produkčním prostředí je dobrým bezpečnostním zvykem ověřit integritu souboru:

1. **Kontrolní součet (SHA-256):**
   Na oficiální stránce python.org je pro každý instalační balíček uveden kontrolní součet:
   ```powershell
   # Ověření na Windows (PowerShell):
   Get-FileHash python-3.12.x-amd64.exe -Algorithm SHA256
   ```
2. **Digitální podpis:** Na Windows má oficiální instalátor platný digitální certifikát podepsaný *Python Software Foundation*.

---

<!-- slide: id=id5 title="Python III – instalace na Windows (1)" tags="Tricky" diff="basics" -->
## Python III – instalace na Windows (1)

Při spuštění oficiálního instalátoru na Windows věnujte pozornost úvodní obrazovce:

1. **Zaškrtněte volbu `Add python.exe to PATH`**:
   Tato volba zajistí, že příkazy `python`, `py` a `pip` budou okamžitě dostupné v jakémkoliv nově otevřeném okně terminálu (PowerShell / cmd).
2. **Doporučujeme zvolit `Customize installation`**, abyste měli plnou kontrolu nad instalovanými součástmi.

---

<!-- slide: id=id6 title="Python III – instalace na Windows (2)" tags="Skip" diff="basics" -->
## Python III – instalace na Windows (2)

V rozšířených možnostech instalace ponechte zaškrtnuté:
- **`Documentation`**: Vestavěná dokumentace.
- **`pip`**: Oficiální balíčkovací správce (nezbytný pro doinstalování knihoven).
- **`py launcher`**: Globální spouštěč Pythonu na Windows (velmi užitečný pro přepínání verzí).

---

<!-- slide: id=id7 title="Python III – instalace na Windows (3)" tags="Skip" diff="basics" -->
## Python III – instalace na Windows (3)

V posledním kroku instalátoru na Windows:
- Zvolte přehlednou instalační cestu (např. `C:\Users\<Uzivatel>\AppData\Local\Programs\Python\Python312` nebo `C:\Python312`).
- Na závěr klikněte na volbu **`Disable path length limit`**:
  Tato volba odstraní historické 260znakové omezení délky cest ve Windows, což je kritické pro složité vědecké balíčky a vnořená virtuální prostředí.

---

<!-- slide: id=id8 title="Python IV – jeden Python vs více prostředí" tags="Core" diff="basics" -->
## Python IV – jeden Python vs více prostředí

Nainstalovaný systémový interpret Pythonu slouží jako stabilní základní stavební kámen.

V profesionální praxi však nikdy neinstalujeme knihovny přímo do této hlavní instalace:
- Pro každý nový projekt zakládáme samostatné **virtuální prostředí (`.venv`)**.
- Pokud potřebujeme různé verze Pythonu současně, využíváme buď spouštěč **`py`** na Windows, nebo moderní správce **`uv`** / **`pyenv`**.

---

<!-- slide: id=id9 title="Python V – spouštění programů" tags="Core" diff="basics" -->
## Python V – spouštění programů

Způsoby spuštění pythoního kódu:

```bash
# 1. Spuštění skriptu předáním interpretu:
python3 muj_program.py

# 2. Spuštění modulu z aktivního balíčku:
python3 -m muj_balicek.podmodul

# 3. Na Windows pomocí univerzálního py launcheru:
py muj_program.py
```

Výstup programu a případná chybová hlášení (*Traceback*) se vypisují přímo do okna konzole.

---

<!-- slide: id=id10 title="Python interaktivně – REPL v Pythonu 3.13+" tags="Core" diff="basics" python="3.12+" -->
## Python interaktivně – REPL v Pythonu 3.13+

Když spustíte příkaz `python3` (nebo `py`) bez zadání souboru, vstoupíte do interaktivního režimu **REPL** (*Read-Eval-Print Loop*):

```text
Python 3.13.0 (main, Oct 2024) [Clang/GCC] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> 2 + 2
4
>>> [x**2 for x in range(5)]
[0, 1, 4, 9, 16]
```

### Revoluce v Pythonu 3.13 (PyREPL):
Od verze 3.13 obsahuje standardní CPython zbrusu nový interaktivní shell:
- **Plná víceřádková editace**: Šipkami nahoru a dolů se můžete volně pohybovat i uvnitř rozepsané funkce nebo smyčky.
- **Barevné zvýraznění**: Barevné odlišení chybových výpisů i syntaxe.
- **Podpora vkládání ze schránky (*Bracketed Paste*)**: Kód vložený ze schránky nerozhodí odsazení.
- **Interaktivní nápověda klávesou `F1`** a historie příkazů klávesou `F2`.

---

<!-- slide: id=id11 title="Interaktivní prostředí: IPython a Jupyter" tags="Skip" diff="basics" -->
## Interaktivní prostředí: IPython a Jupyter

Pro pokročilé interaktivní experimentování existují dva standardní nástroje:

1. **`IPython`**: Výrazně vylepšená příkazová řádka s automatickým doplňováním tabulátorem, měřením času (`%timeit`) a bohatou nápovědou.
   ```bash
   pip install ipython
   ipython
   ```
2. **VS Code Interactive Window**: Umožňuje spouštět libovolné bloky kódu (`Shift+Enter`) a sledovat hodnoty proměnných v reálném čase.

---

<!-- slide: id=id12 title="Moderní vývojové prostředí: VS Code" tags="Skip" diff="basics" -->
## Moderní vývojové prostředí: VS Code

**Visual Studio Code** je celosvětově nejpopulárnějším editorem pro vývoj v Pythonu:

- Zcela zdarma a open-source pro Windows, Linux i macOS.
- **Klíčová rozšíření pro Python:**
  - `ms-python.python`: Oficiální podpora jazyka, spouštění a ladění.
  - `charliermarsh.ruff`: Extrémně rychlý linter a formátovač kódu v reálném čase.
  - `ms-toolsai.jupyter`: Přímé spouštění Jupyter notebooků uvnitř editoru.

---

<!-- slide: id=id13 title="Proč se vyhnout starým nástrojům (IDLE, Dreampie)" tags="Skip" diff="basics" -->
## Proč se vyhnout zastaralým nástrojům

V historických kurzech a starších materiálech můžete narazit na doporučení nástrojů jako *IDLE*, *DreamPie* nebo *Notepad2*:

- **IDLE** je sice součástí základní instalace, ale postrádá moderní správu projektů, integraci Gitu, virtuálních prostředí a pokročilé lintery.
- **DreamPie** byl opuštěn v roce 2012, stavěl na nepodporovaném Pythonu 2 a v moderních verzích Pythonu (3.10+) je zcela nefunkční.
- V moderním vývoji používejte **VS Code**, **PyCharm** nebo **Neovim**.

---

<!-- slide: id=id14 title="Psaní větších programů a organizace kódu" tags="Core" diff="basics" -->
## Psaní větších programů a organizace kódu

Při psaní větších projektů je nutné dodržovat standardy pro formátování a čitelnost:

1. **Zobrazování bílých znaků:** Nastavte si v editoru viditelnost mezer a tabulátorů.
2. **Konce řádků (EOL):** Používejte moderní standard **LF** (`\n`), který je univerzální na Linuxu, macOS i v moderních nástrojích na Windows.
3. **Kódování UTF-8:** Vždy ukládejte soubory v čistém UTF-8 bez BOM.
4. **Formátovač kódu:** Automatické formátování podle standardu PEP 8 (nástrojem `ruff format` nebo `black`).

---

<!-- slide: id=id15 title="Doporučené textové editory a IDE" tags="Skip" diff="basics" -->
## Doporučené textové editory a IDE

Přehled prověřených moderních nástrojů:

| Nástroj | Typ | Vhodnost |
|---|---|---|
| **VS Code** | Editor / IDE | **Doporučeno pro všechny:** modulární, lehký, obrovský ekosystém |
| **PyCharm Community** | Plnotučné IDE | Skvělé pro velké projekty, silný integrovaný refaktoring |
| **Cursor / Zed** | Moderní editory | Moderní nová generace editorů s vysokým výkonem v Rustu |
| **Neovim** | Terminálový editor | Pro pokročilé uživatele milující čistou klávesnici |

---

<!-- slide: id=id16 title="Poznámka k použití „Jupyter Notebook“" tags="Tricky" diff="basics" -->
## Poznámka k použití „Jupyter Notebook“

**Jupyter Notebook** (`.ipynb`) je fantastický nástroj pro:
- Průzkumnou analýzu dat (*Exploratory Data Analysis – EDA*)
- Vykreslování interaktivních grafů (Matplotlib, Plotly)
- Výuku a vědecké prezentace kombinující formátovaný text s grafy a kódem

### Proč v něm nepsat velké aplikace:
- **Nelineární spouštění buněk:** Buňky lze spouštět v libovolném pořadí, což snadno vede ke skrytým chybám a stavům paměti, které nelze reprodukovat.
- **Špatná verzovatelnost v Gitu:** Soubor `.ipynb` je velký JSON obsahující výstupy a obrázky v Base64, což znemožňuje čitelné `git diff`.
- **Architektura:** Pro knihovny, API a produkční skripty vždy pište čisté soubory `.py`.

---

<!-- slide: id=id17 title="Závěrečné shrnutí" tags="Skip" diff="basics" -->
## Závěrečné shrnutí

1. **Nainstalujte si CPython 3.12 nebo 3.13** z python.org (nebo přes winget / package manager).
2. **Nainstalujte si VS Code** a doinstalujte oficiální rozšíření pro Python a Ruff.
3. **Naučte se pracovat v terminálu:** Běžný vývoj, testování i práce na vzdálených výpočetních serverech probíhá přes příkazovou řádku a SSH.
4. **Každý projekt začínejte vytvořením virtuálního prostředí `.venv`**.
