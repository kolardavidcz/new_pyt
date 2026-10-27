<!-- lecture: title="Úvod, instalace, spuštění" slug="materialy--jupyter--overview" week=0 -->

<!-- slide: id=id1 title="Úvod" tags="Skip" diff="basics" -->
## Úvod

Projekt **Jupyter** vznikl v roce 2014 oddělením od původního projektu *IPython*. Název je odvozen od tří hlavních vědeckých jazyků: **Julia, Python a R**.

Jupyter nabízí interaktivní webové prostředí (*computational notebook*), které v jednom dokumentu kombinuje:
- **Živý, spustitelný kód**
- **Formátovaný text (Markdown)** a matematické vzorce (KaTeX / LaTeX)
- **Bohaté interaktivní výstupy**: tabulky, grafy (Matplotlib, Plotly), obrázky a HTML widgety

Dokumenty se ukládají ve standardním formátu **`.ipynb`** (ve skutečnosti JSON).

---

<!-- slide: id=id2 title="Webové rozhraní: JupyterLab vs Notebook" tags="Core" diff="basics" -->
## Webové rozhraní: JupyterLab vs Notebook

Moderní ekosystém Jupyter nabízí dvě hlavní webová rozhraní:

1. **JupyterLab (Doporučeno):**
   - Plnohodnotné modulární vývojové prostředí běžící v prohlížeči.
   - Podporuje více záložek vedle sebe, terminál, textový editor, prohlížeč souborů i inspekci proměnných.
2. **Jupyter Notebook (Classic / v7):**
   - Jednodušší rozhraní zaměřené na jeden konkrétní dokument.
   - Od verze 7 je postaven na stejné moderní architektuře jako JupyterLab.

> [!TIP]
> Pro každodenní práci doporučujeme buď **JupyterLab**, nebo přímé spouštění notebooků uvnitř editoru **VS Code** přes oficiální rozšíření Jupyter.

---

<!-- slide: id=id3 title="Instalace Jupyteru" tags="Core" diff="basics" python="3.12+" -->
## Instalace Jupyteru

Doporučujeme instalovat Jupyter do dedikovaného virtuálního prostředí:

```bash
# 1. Pomocí standardního pip ve venv:
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install jupyterlab

# 2. Pomocí Condy / Mamby:
conda create -n jupyter -c conda-forge python=3.12 jupyterlab
conda activate jupyter

# 3. Bleskově pomocí uv:
uv pip install jupyterlab
```

---

<!-- slide: id=id4 title="Spuštění JupyterLabu" tags="Core" diff="basics" -->
## Spuštění JupyterLabu

Spuštění lokálního serveru z příkazové řádky:

```bash
jupyter lab
```

Co se stane:
1. V terminálu se nastartuje lokální HTTP server (výchozí port `8888`).
2. Automaticky se otevře výchozí webový prohlížeč na adrese `http://localhost:8888/lab?token=...`.
3. Server generuje bezpečnostní jednorázový bezpečnostní token chránící vaše prostředí.

Zastavení serveru v terminálu: stiskněte dvakrát `Ctrl+C`.

---

<!-- slide: id=id5 title="Užitečné přepínače příkazové řádky" tags="Skip" diff="basics" -->
## Užitečné přepínače příkazové řádky

Parametry pro pokročilé spouštění:

```bash
# Spuštění na jiném portu (pokud je 8888 obsazen):
jupyter lab --port 8900

# Spuštění bez automatického otevírání prohlížeče (např. na vzdáleném serveru):
jupyter lab --no-browser

# Nastavení konkrétní kořenové složky:
jupyter lab --notebook-dir=~/projekty/vyzkum

# Povolení přístupu ze sítě (např. v Dockeru nebo WSL):
jupyter lab --ip=0.0.0.0
```

---

<!-- slide: id=id6 title="Jupyter s více projekty: `ipykernel`" tags="Tricky" diff="newconcept" python="3.12+" -->
## Propojení různých prostředí: `ipykernel`

Pokud máte více různých projektů s různými knihovnami, nemusíte instalovat celý těžký Jupyter do každého z nich!

Stačí mít **jednu centrální instalaci JupyterLabu** a do jednotlivých projektových virtuálních prostředí doinstalovat pouze lehký balíček **`ipykernel`**:

```bash
# 1. Aktivujeme prostředí našeho výzkumného projektu:
source ~/projekty/chemo/.venv/bin/activate

# 2. Nainstalujeme pouze kernel:
pip install ipykernel

# 3. Zaregistrujeme toto prostředí do Jupyteru jako samostatný kernel:
python -m ipykernel install --user --name chemo-env --display-name "Python 3.12 (Chemo výzkum)"
```

V JupyterLabu pak v pravém horním rohu jednoduše přepínáte mezi jednotlivými kernely podle toho, na jakém projektu zrovna pracujete.

---

<!-- slide: id=id7 title="Příklad: Alternativní kernely (Julia, R, Node.js)" tags="Skip" diff="basics" -->
## Alternativní kernely (Julia, R, Node.js)

Jednou z největších předností Jupyteru je podpora pro desítky různých programovacích jazyků (*Kernels*):

- **R Kernel (`IRkernel`):** Umožňuje spouštět kód v jazyce R přímo v buňkách notebooku.
- **Julia (`IJulia`):** Pro vysoce výkonné vědecké výpočty.
- **JavaScript / TypeScript (`tslab`, `ijavascript`):** Pro moderní webový vývoj.
- **Bash kernel:** Pro interaktivní psaní shell skriptů.

Dokument s kódem v R i Pythonu lze sdílet a prohlížet naprosto identickým způsobem.
