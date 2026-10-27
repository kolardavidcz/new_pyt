<!-- lecture: title="Verzovací systém Git – základy" slug="materialy--dvcs--git" week=0 -->

<!-- slide: id=id1 title="Identifikace" tags="Core" diff="basics" -->
## Identifikace

První věc, kterou musíte po instalaci Gitu provést, je nastavení vaší identity. Každý commit v Gitu je kryptograficky svázán se jménem a e-mailem autora:

```bash
git config --global user.name "David Kolar"
git config --global user.email "david.kolar@example.com"
```

Identita se uloží do vašeho globálního konfiguračního souboru `.gitconfig`:
- **Linux / macOS:** `~/.gitconfig`
- **Windows:** `C:\Users\<Uzivatel>\.gitconfig`

> [!NOTE]
> E-mailová adresa by měla odpovídat adrese, kterou máte registrovanou na GitHubu, GitLabu či školním GitLab serveru, aby se vaše commity správně párovaly s vaším profilem.

---

<!-- slide: id=id2 title="„.gitconfig“" tags="Skip" diff="basics" -->
## „.gitconfig“

Soubor `~/.gitconfig` obsahuje globální uživatelské předvolby. Můžete v něm nastavit výchozí editor, chování větví i užitečné klávesové zkratky (*aliasy*):

```ini
[user]
    name = David Kolar
    email = david.kolar@example.com
[init]
    defaultBranch = main
[core]
    editor = code --wait
[alias]
    s = status -s
    lg = log --oneline --graph --decorate --all
    unstage = restore --staged
```

Hlavní sekce:
- **`[init]`**: Nastaví název výchozí větve na moderní standard `main` (místo historického `master`).
- **`[core]`**: Výchozí editor (např. VS Code s parametrem `--wait`, nano nebo vim).
- **`[alias]`**: Vlastní zkrácené příkazy šetřící čas v terminálu.

---

<!-- slide: id=id3 title="Adresář „.git“" tags="Core" diff="newconcept" -->
## Adresář „.git“

Veškerá data, konfigurace a historie verzovaného projektu jsou uloženy ve skrytém podadresáři **`.git`** v kořenu projektu.

Adresář `.git` funguje jako vysoce optimalizovaná objektová databáze:
- **Objekty (Blobs, Trees, Commits):** Ukládány pod SHA-1 (nebo SHA-256) hešem.
- **Historie formou snímků (*Snapshots*):** Git neukládá rozdíly (tzv. *delta* přístup), ale celkový stav stromu projektu v daném čase.
- **Větve jako lehké ukazatele:** Větev v Gitu je pouze 41bajtový textový soubor obsahující heš posledního commitu.

> [!WARNING]
> Do složky `.git` nikdy nezasahujte ručně. Pokud tuto složku smažete, přijdete o celou historii projektu a z repozitáře se stane obyčejný nestřežený adresář.

---

<!-- slide: id=id4 title="Globální versus lokální nastavení" tags="Skip" diff="basics" -->
## Globální versus lokální nastavení

Git nabízí víceúrovňovou konfiguraci:

1. **Globální konfigurace (`--global`):** Uložena v `~/.gitconfig`, platí pro všechny repozitáře na daném počítači.
2. **Lokální konfigurace (výchozí bez přepínače):** Uložena v `.git/config` konkrétního projektu a má přednost před globálním nastavením.

Příklad nastavení jiné pracovní identity pro konkrétní školní nebo firemní projekt:
```bash
# V kořenu daného repozitáře:
git config user.name "Ing. David Kolar"
git config user.email "kolar@vscht.cz"
```

Ověření aktivního nastavení s původem hodnot:
```bash
git config --list --show-origin
```

---

<!-- slide: id=id5 title="Ignorované soubory" tags="Core" diff="basics" -->
## Ignorované soubory

Do repozitáře patří výhradně zdrojový kód, testy a konfigurační soubory. Dočasné soubory, kompiláty a privátní data se ignorují pomocí souboru **`.gitignore`** v kořenu projektu.

Typický `.gitignore` pro Python projekt:
```gitignore
# Virtuální prostředí (nikdy necommitovat!)
.venv/
env/

# Python mezipaměť a bajtkód
__pycache__/
*.py[cod]

# Lokální tajné proměnné
.env

# Výstupy testů a pokrytí
.pytest_cache/
htmlcov/
.coverage

# IDE nastavení specifická pro uživatele
.vscode/*
!.vscode/settings.json
.idea/
```

> [!IMPORTANT]
> Soubor `.gitignore` **musí být sám verzován** (přidán a commitnut), aby stejná pravidla dodržovali všichni spolupracovníci v týmu.

---

<!-- slide: id=id6 title="„clone“ & „init“" tags="Core" diff="basics" -->
## „clone“ & „init“

Repozitář můžete založit dvěma způsoby:

### 1. Naklonování existujícího vzdáleného projektu (`git clone`)
Stáhne kompletní historii a vytvoří lokální kopii:
```bash
git clone https://github.com/autor/projekt.git
# Nebo přes bezpečný SSH protokol:
git clone git@github.com:autor/projekt.git
```

### 2. Inicializace nového čistého projektu (`git init`)
Vytvoří nový prázdný repozitář v aktuální složce:
```bash
mkdir muj_projekt
cd muj_projekt
git init -b main
```

> [!NOTE]
> Přepínač `-b main` zajistí, že se hlavní větev od prvního okamžiku jmenuje `main`.

---

<!-- slide: id=id7 title="„add“, „commit“ a tzv. index" tags="Core" diff="newconcept" -->
## „add“, „commit“ a tzv. index

Git používá třístupňovou architekturu: **Pracovní adresář** $\rightarrow$ **Přípravná fáze (*Index / Staging Area*)** $\rightarrow$ **Historie repozitáře (*Commits*)**.

1. **`git add <soubor>`**: Přenese změny z pracovního adresáře do *indexu*.
2. **`git commit -m "Zpráva"`**: Vytvoří nový trvalý snímek historie ze všech souborů připravených v *indexu*.

```bash
# Přidání konkrétního souboru do indexu:
git add main.py

# Přidání všech změn a nových souborů v aktuálním stromu:
git add .

# Vytvoření commitu s výstižnou zprávou:
git commit -m "feat: implementuj načítání dat z API"
```

> [!TIP]
> **Proč máme Staging Area?**
> Umožňuje rozdělit celodenní práci do několika logických, samostatných a přehledných commitů, místo jednoho nepřehledného balíku.

---

<!-- slide: id=id8 title="„status“" tags="Tricky" diff="newconcept" -->
## „status“

Příkaz **`git status`** je nejdůležitější inspekční příkaz. Ukazuje přesný stav souborů:

```bash
git status
```

Rozlišuje 3 kategorie:
- **Changes to be committed (zeleně):** Soubory v *indexu* připravené pro nejbližší commit.
- **Changes not staged for commit (červeně):** Soubory verzované, které byly upraveny, ale změny ještě nebyly přidány přes `git add`.
- **Untracked files (červeně):** Nové soubory, o kterých Git zatím vůbec neví.

> [!IMPORTANT]
> **Pozor na změny po `git add`:**
> Pokud upravíte soubor *poté*, co jste ho přidali do indexu přes `git add`, v commitu skončí pouze verze z okamžiku `git add`. Pro zahrnutí nejnovějších úprav musíte `git add` zavolat znovu!

---

<!-- slide: id=id9 title="„rm“" tags="Core" diff="basics" -->
## „rm“

Pokud chcete smazat soubor a zároveň toto smazání rovnou zaznamenat do *indexu* pro příští commit:

```bash
git rm stary_soubor.py
```

Užitečné varianty:
- **`git rm --cached <soubor>`**: Odstraní soubor ze sledování Gitem (z indexu i budoucích commitů), ale **ponechá soubor na disku**. Typické, pokud jste omylem commitli soubor `.env` a chcete ho přidat do `.gitignore`.
- **`git rm -r <adresar>`**: Rekurzivní smazání celé složky.
- **`git rm -f <soubor>`**: Vynucené smazání i tehdy, pokud je soubor lokálně modifikován.

---

<!-- slide: id=id10 title="„mv“" tags="Skip" diff="basics" -->
## „mv“

Přejmenování nebo přesun souboru v repozitáři:

```bash
git mv puvodni_nazev.py novy_nazev.py
```

Tento příkaz provede přejmenování na disku a rovnou připraví změnu do *indexu* (odpovídá `mv` + `git add`).

> [!NOTE]
> I když soubor přejmenujete v běžném souborovém manažeru nebo IDE, moderní Git změnu heuristicky rozpozná podle shodného obsahu a označí ji jako *renamed* (pokud je shoda obsahu $>50\%$).

---

<!-- slide: id=id11 title="Náprava běžných chyb" tags="Tricky" diff="basics" -->
## Náprava běžných chyb

Každý někdy udělá chybu v přípravě commitu. V moderním Gitu (2.23+) existují přehledné a bezpečné nástroje:

### 1. Odebrání souboru ze staging area (*unstage*)
Pokud jste omylem přidali soubor do indexu přes `git add`:
```bash
git restore --staged spatny_soubor.py
```

### 2. Zahození neuložených lokálních úprav v souboru
Vrátí soubor do stavu posledního commitu (pozor, nevratné!):
```bash
git restore zkazeny_soubor.py
```

### 3. Oprava posledního commitu (*amend*)
Pokud jste zapomněli přibalit drobný soubor nebo udělali překlep v commit message:
```bash
git add zapomenuty_soubor.py
git commit --amend -m "Opravená zpráva commitu"
```

---

<!-- slide: id=id12 title="Náprava (méně) běžných chyb" tags="Tricky" diff="newconcept" -->
## Náprava (méně) běžných chyb

Pokud potřebujete vrátit celou historii o jeden nebo více commitů zpět:

```text
    (pracovní strom)
A — B — C — D  [HEAD / main]
```

### 1. Bezpečný návrat (`git reset --soft HEAD~1`)
Vrátí větev na stav `C`. Změny z commitu `D` zůstanou zachované a připravené v *indexu*. Ideální pro rozdělení commitu na menší části.

### 2. Smíšený návrat (`git reset HEAD~1` / `--mixed`)
Vrátí větev na `C`. Změny z commitu `D` zůstanou na disku v souborech jako nestaged změny.

### 3. Tvrdý návrat (`git reset --hard HEAD~1`)
Vrátí větev na `C` a **kompletně smaže všechny úpravy z commitu D i z disku**.

> [!TIP]
> **Záchranná brzda `git reflog`:**
> I po neuváženém `git reset --hard` Git drží všechny commity v žurnálu `git reflog` po dobu cca 30 dnů. Pomocí `git reflog` a `git reset --hard HEAD@{1}` lze ztracený commit vrátit zpět!

---

<!-- slide: id=id13 title="gitk" tags="Skip" diff="basics" -->
## Grafické rozhraní a IDE integrace

Ačkoliv Git historicky obsahuje základní grafický prohlížeč stromu `gitk`, moderní vývojáři dnes využívají integrovaná prostředí:

- **VS Code Source Control (Ctrl+Shift+G):** Špičkový vizuální diff vedle sebe (*side-by-side*), inline staging jednotlivých řádek, řešení merge konfliktů jedním kliknutím.
- **Git Graph / GitLens rozšíření:** Vizuální interaktivní strom větví přímo v editoru.
- **Dedikovaní klienti:** GitHub Desktop, Fork, GitKraken.

> [!NOTE]
> Porozumění terminálovým příkazům Gitu je základem – GUI nástroje pouze volají stejné příkazy na pozadí.

---

<!-- slide: id=id14 title="„log“" tags="Core" diff="basics" -->
## „log“

Procházení historie commitů projektu:

```bash
# Standardní výpis historie:
git log

# Kompaktní jednořádkový graf větví:
git log --oneline --graph --decorate --all

# Historie změn konkrétního souboru:
git log -p main.py
```

Užitečné filtry:
- **`-n 5`**: Zobrazí pouze posledních 5 commitů.
- **`--since="2 weeks ago"`**: Commity za poslední 2 týdny.
- **`--author="Kolar"`**: Commity konkrétního autora.

---

<!-- slide: id=id15 title="„diff“ & „whatchanged“" tags="Core" diff="basics" -->
## „diff“

Příkaz **`git diff`** slouží k detailní kontrole řádkových změn v kódu před jejich potvrzením:

```bash
# 1. Změny v pracovním adresáři vůči indexu (co ještě není staged):
git diff

# 2. Změny v indexu vůči poslednímu commitu (co půjde do příštího commitu):
git diff --staged

# 3. Změny celého pracovního stromu vůči poslednímu commitu:
git diff HEAD

# 4. Porovnání dvou větví nebo commitů:
git diff main feature-vetev
```

> [!TIP]
> Zelené řádky se znaménkem `+` označují přidaný kód, červené se znaménkem `-` kód smazaný.

---

<!-- slide: id=id16 title="Práce se vzdáleným repozitářem" tags="Core" diff="basics" -->
## Práce se vzdáleným repozitářem

Distribuovaný vývoj spočívá ve sdílení commitů se vzdáleným serverem (*remote* – např. GitHub, GitLab):

### 1. Zobrazení připojených serverů:
```bash
git remote -v
# origin  git@github.com:uzivatel/repo.git (fetch)
# origin  git@github.com:uzivatel/repo.git (push)
```

### 2. Stažení změn od kolegů (`git pull`):
```bash
git pull origin main
```
Stáhne nové commity ze serveru a sloučí je do vaší lokální větve.

### 3. Odeslání vašich commitů na server (`git push`):
```bash
git push -u origin main
```
Přepínač `-u` (*upstream*) nastaví vazbu pro budoucí jednoduché volání pouhého `git push`.

---

<!-- slide: id=id17 title="PS: Řešení problémů se spojením přes SSH" tags="Skip" diff="basics" -->
## Spojení přes SSH & Klíče

Pro bezpečnou komunikaci s GitHubem/GitLabem bez nutnosti opakovaně zadávat heslo se dnes standardně používá kryptografický klíč **ED25519**:

```bash
# Vygenerování moderního SSH klíče:
ssh-keygen -t ed25519 -C "vas-email@example.com"

# Zkopírování veřejného klíče do schránky (Linux/macOS):
cat ~/.ssh/id_ed25519.pub
```
Veřejný klíč vložíte do nastavení svého profilu na GitHubu (*Settings $\rightarrow$ SSH and GPG keys*).

### Test a ladění spojení:
```bash
# Otestování autentizace:
ssh -T git@github.com

# Detailní diagnostika v případě selhání (verbose mód):
GIT_SSH_COMMAND="ssh -vvv" git fetch
```

---

<!-- slide: id=id18 title="„help“" tags="Skip" diff="basics" -->
## „help“

Kdykoliv potřebujete osvěžit parametry nebo příklady použití:

```bash
# Rychlá stručná nápověda přímo do terminálu:
git <prikaz> -h

# Kompletní manuál s detailním popisem algoritmů a parametrů:
git help <prikaz>
# např.: git help restore, git help merge
```

Oficiální referenční příručka a vynikající kniha **Pro Git** (kompletně v češtině) je zdarma k dispozici na [git-scm.com/book/cs/v2](https://git-scm.com/book/cs/v2).
