<!-- lecture: title="Git – pokročilejší koncepty (větvení, rebase, merge)" slug="materialy--dvcs--git.advanced" week=0 -->

<!-- slide: id=id1 title="Úvod" tags="Skip" diff="basics" -->
## Úvod

Základní workflow s Gitem (`add`, `commit`, `push`, `pull`) stačí pro jednoduchou práci jednotlivce. Skutečná síla distribuovaného verzování se však projeví v týmovém vývoji:

- **Izolované větve prvků (*Feature Branches*):** Každá nová funkce, oprava či experiment vzniká ve vlastní nezávislé větvi.
- **Strategie začleňování (*Merge vs Rebase*):** Slévání větví vs udržování čisté lineární historie.
- **Správa vzdálených repozitářů (*Remotes*):** Spolupráce přes GitHub/GitLab, pull requesty a code review.
- **Verzování verzí a vydání (*Tags*):** Označování stabilních milníků (např. `v1.0.0`).
- **Odkládání rozpracované práce (*Stash*):** Rychlé přepínání kontextu bez nechtěných commitů.

---

<!-- slide: id=id2 title="I. Paralelní vývojové větve" tags="Core" diff="newconcept" -->
## I. Paralelní vývojové větve

V Gitu je commit neměnným snímkem (*snapshotem*) celého stavu projektu.

**Větev (*branch*)** v Gitu není žádná těžká kopie souborů, ale pouhý **lehký ukazatel na konkrétní commit** (41bajtový textový soubor obsahující SHA-1 heš).

- Vytvoření větve trvá zlomek milisekundy a nezabírá téměř žádné místo na disku.
- Speciální ukazatel **`HEAD`** označuje větev (nebo commit), na které se právě nacházíte.
- Při každém novém commitu se ukazatel aktuální větve automaticky posune dopředu.

---

<!-- slide: id=id3 title="„branch [VĚTEV]“" tags="Core" diff="basics" -->
## „branch [VĚTEV]“

Příkaz **`git branch`** bez argumentů vypíše všechny lokální větve:
```bash
git branch
# * main
```
Hvězdička `*` označuje větev, na kterou právě ukazuje `HEAD`.

### Vytvoření nové větve:
```bash
git branch feature-login
```
Vytvoří novou větev ukazující na aktuální commit, ale **nepřepne na ni**. `HEAD` stále zůstává na větvi `main`.

---

<!-- slide: id=id4 title="„checkout|switch VĚTEV“" tags="Core" diff="basics" -->
## Přepínání větví: moderní `git switch`

V moderním Gitu (2.23+) byl přetížený příkaz `checkout` rozdělen na dva jednoúčelové příkazy:
- **`git switch`**: Přepínání a vytváření větví.
- **`git restore`**: Obnova a zahození změn v souborech.

```bash
# Přepnutí na existující větev:
git switch feature-login

# Vytvoření nové větve a okamžité přepnutí na ni:
git switch -c feature-login
```

> [!NOTE]
> Historický příkaz `git checkout -b feature-login` funguje identicky, ale moderní `git switch -c` je přehlednější a bezpečnější.

---

<!-- slide: id=id5 title="„merge VĚTEV“" tags="Core" diff="basics" -->
## Slévání větví: `git merge`

Když je práce ve feature větvi hotová a otestovaná, začleníme ji do hlavní větve `main`.

Pravidlo: **Merge vždy začleňuje zadanou větev do té větve, na které se právě nacházíte!**

```bash
# 1. Přepneme se do cílové větve:
git switch main

# 2. Začleníme změny z feature větve:
git merge feature-login
```

Typy merge:
- **Fast-forward (FF):** Pokud hlavní větev od rozvětvení neměla žádné nové commity, Git pouze posune ukazatel `main` dopředu.
- **3-way merge (rekurzivní / ort):** Pokud obě větve obsahují nezávislé commity, Git vytvoří nový speciální **merge commit** se dvěma rodiči.

> [!IMPORTANT]
> Pokud obě větve upravily stejné řádky v tomtéž souboru, vznikne **konflikt**. Git označí konfliktní místa značkami `<<<<<<<`, `=======`, `>>>>>>>` a vyžaduje jejich ruční vyřešení.

---

<!-- slide: id=id6 title="„branch --merged“ & „--no-merged“" tags="Skip" diff="basics" -->
## „branch --merged“ & „--no-merged“

Při větším množství větví potřebujete snadno zjistit, které větve jsou již bezpečně začleněny a které naopak ještě obsahují nezačleněnou práci:

```bash
# Větve, které jsou již plně začleněny do aktuální větve (lze je bezpečně smazat):
git branch --merged

# Větve, které stále obsahují nezačleněné commity:
git branch --no-merged
```

---

<!-- slide: id=id7 title="II. Vzdálené větve" tags="Core" diff="newconcept" -->
## II. Vzdálené větve

Při týmové práci na GitHubu/GitLabu máte v repozitáři dva druhy větví:
1. **Lokální větve:** Např. `main`, `feature-login` – vaše pracovní kopie.
2. **Vzdáleně sledované větve (*Remote-tracking branches*):** Např. `origin/main`, `origin/feature-login` – lokální read-only snímky toho, kde se nachází větve na serveru v okamžiku posledního síťového volání.

Aktualizace těchto vzdálených ukazatelů bez ovlivnění vašeho pracovního adresáře provede:
```bash
git fetch origin
```

---

<!-- slide: id=id8 title="„branch --remote“ & „--all“" tags="Skip" diff="basics" -->
## „branch --remote“ & „--all“

Inspekce větví na vzdáleném serveru:

```bash
# Pouze vzdálené větve:
git branch -r
# origin/main
# origin/feature-api

# Kompletní přehled všech lokálních i vzdálených větví:
git branch -a
```

---

<!-- slide: id=id9 title="Přepnutí na vzdálenou větev" tags="Core" diff="basics" -->
## Přepnutí na vzdálenou větev

Pokud kolega pushnul na server novou větev `feature-platby`, stačí napsat:

```bash
git fetch
git switch feature-platby
```

Moderní Git automaticky pozná, že na serveru existuje `origin/feature-platby`, vytvoří lokální větev stejného jména a automaticky nastaví sledování (*tracking*).

---

<!-- slide: id=id10 title="„push --set-upstream“" tags="Core" diff="basics" -->
## Publikace nové lokální větve: `git push -u`

Když vytvoříte novou větev lokálně a chcete ji poprvé odeslat na GitHub:

```bash
git switch -c feature-novinka
# ... provedeme commity ...

# První push s nastavením sledování (upstream):
git push -u origin feature-novinka
```

Přepínač **`-u`** (`--set-upstream`) propojí lokální větev s větví `origin/feature-novinka`. Při každém dalším odesílání změn už stačí volat pouze holé:
```bash
git push
git pull
```

---

<!-- slide: id=id11 title="Mazání větví lokálně i na serveru" tags="Core" diff="basics" -->
## Mazání větví lokálně i na serveru

Jakmile je větev úspěšně začleněna do `main` (např. přes GitHub Pull Request), je dobrým zvykem ji smazat, aby nezůstával v repozitáři nepořádek:

```bash
# 1. Bezpečné smazání lokální větve (selže, pokud větev není plně sloučena):
git branch -d feature-novinka

# Vynucené smazání rozpracované větve:
git branch -D feature-novinka

# 2. Smazání větve na vzdáleném serveru:
git push origin --delete feature-novinka
```

---

<!-- slide: id=id12 title="III. Sledovací větve a synchronizace" tags="Core" diff="newconcept" -->
## III. Sledovací větve a synchronizace

Jak funguje synchronizace s týmem:

```text
         origin/main (stav na GitHubu)
              ↓
A — B — C — D — E — F  (commity od kolegů)
         \
          g — h        (vaše lokální commity v main)
              ↑
             main
```

Když zavoláte `git fetch origin`, Git stáhne commity `E` a `F` a posune ukazatel `origin/main`. Váš lokální `main` je na commitu `h`.

Máte dvě možnosti, jak historii spojit:
1. **Merge:** Vytvoří nový merge commit spojující `F` a `h`.
2. **Rebase:** Převezme vaše commity `g` a `h` a přehraje je až za commit `F`.

---

<!-- slide: id=id13 title="„rebase“ – čistá lineární historie" tags="WOW" diff="newconcept" -->
## „rebase“ – čistá lineární historie

Příkaz **`git rebase`** vezme commity z vaší feature větve a **přeuloží je na špičku cílové větve**:

```bash
git switch feature-novinka
git rebase main
```

```text
PŘED REBASE:
main:    A — B — C
                  \
feature:           D — E

PO REBASE:
main:    A — B — C
                  \
feature:           C — D' — E'
```

Výsledkem je naprosto čistá, lineární historie bez zbytečných propletenců a prázdných merge commitů.

> [!CAUTION]
> **Zlaté pravidlo rebase:**
> **Nikdy nerebasujte commity, které jste již pushnuli do veřejné sdílené větve (např. `main`)!** Rebase mění heše commitů a způsobí kolize všem ostatním členům týmu. Rebasujte pouze své privátní lokální feature větve.

---

<!-- slide: id=id14 title="„pull --rebase“" tags="Tricky" diff="newconcept" -->
## „pull --rebase“

Běžný `git pull` provádí `git fetch` následovaný `git merge`. Pokud jste vy i kolega commitovali do téže větve, vznikne nevzhledný merge commit.

Příkaz `git pull --rebase` místo toho vaše lokální commity přehraje až za stažené commity ze serveru:

```bash
git pull --rebase origin main
```

Doporučené globální nastavení pro čistou historii:
```bash
git config --global pull.rebase true
```

---

<!-- slide: id=id15 title="IV. Více vzdálených repozitářů (Remotes)" tags="Skip" diff="basics" -->
## IV. Více vzdálených repozitářů (Remotes)

V open-source vývoji (GitHub Fork workflow) běžně pracujete se dvěma vzdálenými servery:
1. **`origin`**: Váš osobní fork repozitáře na GitHubu (kam máte právo zápisu `push`).
2. **`upstream`**: Původní oficiální repozitář projektu (odkud stahujete aktualizace `fetch`).

---

<!-- slide: id=id16 title="„remote [-v]“" tags="Core" diff="basics" -->
## „remote [-v]“

Výpis všech nakonfigurovaných vzdálených serverů a jejich URL:

```bash
git remote -v
# origin    git@github.com:muj-ucet/projekt.git (fetch)
# origin    git@github.com:muj-ucet/projekt.git (push)
```

---

<!-- slide: id=id17 title="„remote add“" tags="Core" diff="basics" -->
## Přidání upstream repozitáře: `remote add`

Připojení původního repozitáře k vašemu forku:

```bash
git remote add upstream git@github.com:hlavni-organizace/projekt.git

# Synchronizace vašeho forku s nejnovějším kódem upstreamu:
git fetch upstream
git switch main
git merge upstream/main
git push origin main
```

---

<!-- slide: id=id18 title="„remote show“" tags="Skip" diff="basics" -->
## „remote show“

Detailní inspekce stavu propojení větví s konkrétním serverem:

```bash
git remote show origin
```
Zobrazí URL adresy, výchozí větev `HEAD`, seznam sledovaných větví i informaci o tom, které lokální větve jsou napřed či pozadu vůči serveru.

---

<!-- slide: id=id19 title="„push REMOTE“ a syntaxe" tags="Core" diff="basics" -->
## „push REMOTE“ a syntaxe

```bash
# Push do výchozího serveru a větve:
git push

# Explicitní odeslání konkrétní větve na vybraný remote:
git push origin feature-login

# Vynucený push s ochranou (při rebase privátní větve):
git push --force-with-lease origin feature-login
```

> [!WARNING]
> Místo destruktivního `git push --force` vždy používejte bezpečnější **`--force-with-lease`**, který zabrání přepsání commitů, pokud kolega mezitím na server přidal své změny.

---

<!-- slide: id=id20 title="„pull REMOTE“" tags="Core" diff="basics" -->
## „pull REMOTE“

Stažení a začlenění změn z konkrétního vzdáleného repozitáře a větve:

```bash
git pull origin main
git pull upstream main
```

Pamatujte, že `git pull` je zkratkou pro:
1. `git fetch <remote>`
2. `git merge <remote>/<branch>`

---

<!-- slide: id=id21 title="„remote rename“ & „remote remove“" tags="Skip" diff="basics" -->
## Přejmenování a odebrání remote

Správa seznamu vzdálených serverů:

```bash
# Přejmenování serveru:
git remote rename stary-nazev novy-nazev

# Odstranění nepotřebného serveru ze seznamu:
git remote remove zaloha
```

---

<!-- slide: id=id22 title="Repozitáře typu „bare“" tags="Tricky" diff="newconcept" -->
## Repozitáře typu „bare“

Běžný repozitář na vašem počítači má pracovní adresář se soubory a skrytou složku `.git`.

Naproti tomu centrální repozitáře na serverech (GitHub, GitLab, interní server) jsou **`bare` repozitáře**:
- Neobsahují žádný pracovní strom (*working tree*) ani soubory k editaci.
- Obsahují pouze samotnou databázi objektů a referencí.
- Do non-bare repozitáře nelze bezpečně pushovat, do bare repozitáře ano.

Vytvoření bare repozitáře na serveru:
```bash
git init --bare projekt.git
```

---

<!-- slide: id=id23 title="V. Značky („tags“)" tags="Skip" diff="basics" -->
## V. Značky („tags“)

Značky (*tagy*) slouží k trvalému označení důležitých milníků v historii projektu – nejčastěji vydání konkrétní verze softwaru (tzv. *Release*):

Rozlišujeme dva druhy značek:
1. **Lightweight tag:** Pouhé neměnné pojmenování (ukazatel na commit).
2. **Annotated tag:** Plnohodnotný gitový objekt obsahující jméno autora, e-mail, datum, popisnou zprávu a volitelně kryptografický GPG podpis.

> [!TIP]
> Pro vydání verzí software vždy používejte **annotated tags**.

---

<!-- slide: id=id24 title="„tag“ & „show“" tags="Core" diff="basics" -->
## Vytváření a správa tagů

```bash
# 1. Vytvoření anotovaného tagu s popisem:
git tag -a v1.0.0 -m "Release verze 1.0.0"

# 2. Vytvoření odlehčeného tagu:
git tag v1.0.0-rc1

# 3. Dodatečné označení historického commitu:
git tag -a v0.9.0 448c140 -m "Verze 0.9.0"

# 4. Výpis existujících značek:
git tag -l "v1.*"

# 5. Zobrazení detailů a metadat tagu:
git show v1.0.0

# 6. Smazání lokálního tagu:
git tag -d v1.0.0-rc1
```

---

<!-- slide: id=id25 title="Příklad: Vydání verze s tagem" tags="Skip" diff="basics" -->
## Příklad: Vydání verze s tagem

Typický postup při vydání verze:
```bash
# 1. Zkontrolujeme, že testy prochází:
pytest

# 2. Vytvoříme anotovaný tag s popisem změn:
git tag -a v2.1.0 -m "feat: pridana podpora pro Python 3.12 a FastAPI"

# 3. Odeslání tagu na GitHub:
git push origin v2.1.0
```
GitHub na základě tagu automaticky vytvoří sekci *Releases* a nabídne ke stažení archiv zdrojových kódů.

---

<!-- slide: id=id26 title="Odesílání tagů na server" tags="Core" diff="basics" -->
## Odesílání tagů na server

Běžný `git push` značky na server **neodesílá**. Značky je nutné odeslat explicitně:

```bash
# Odeslání jedné konkrétní značky:
git push origin v1.0.0

# Odeslání všech lokálních značek najednou:
git push origin --tags

# Smazání značky na vzdáleném serveru:
git push origin --delete v1.0.0
```

---

<!-- slide: id=id27 title="Stav „detached HEAD“" tags="Tricky" diff="newconcept" -->
## Stav „detached HEAD“

Pokud se příkazem `checkout` nebo `switch` přepnete přímo na konkrétní tag nebo heš commitu:
```bash
git checkout v1.0.0
```

Git vás upozorní, že jste ve stavu **`detached HEAD`**. Ukazatel `HEAD` neukazuje na žádnou pojmenovanou větev, ale přímo na historický commit.

Pokud v tomto stavu vytvoříte nové commity a pak se přepnete na `main`, tyto commity zůstanou „viset ve vzduchu“ (*osiřelé commity*) a po čase je smaže garbage collector.

### Správné řešení:
Pokud chcete na historickém stavu provádět úpravy, založte rovnou novou větev:
```bash
git switch -c oprava-stare-verze v1.0.0
```

---

<!-- slide: id=id28 title="VI. Dočasné odložení práce: `git stash`" tags="WOW" diff="newconcept" -->
## VI. Dočasné odložení práce: `git stash`

Představte si situaci: Máte rozpracovanou novou funkci (kód ani neprojde testy) a musíte okamžitě přejít opravit kritický bug na větvi `main`.

Příkaz **`git stash`** uloží všechny neuložené úpravy na zásobník a vrátí pracovní adresář do čistého stavu:

```bash
# 1. Uložení rozpracované práce s popisem:
git stash push -m "wip: rozpracovana autentizace"

# 2. Nyní máte čistý strom, můžete se přepnout a opravit chybu:
git switch main
# ... provedeme hotfix, otestujeme, commitneme, pushneme ...

# 3. Vrátíme se zpět a obnovíme odloženou práci:
git switch feature-vetev
git stash pop
```

Další užitečné příkazy:
- **`git stash list`**: Přehled všech odložených stavů na zásobníku.
- **`git stash drop`**: Smazání položky ze zásobníku.

---

<!-- slide: id=id29 title="VII. Submoduly v Gitu" tags="Skip" diff="newconcept" -->
## VII. Submoduly v Gitu

Git submodul umožňuje začlenit jiný Git repozitář jako podadresář vašeho projektu při zachování nezávislé historie:

```bash
# Přidání submodulu do projektu:
git submodule add https://github.com/knihovna/core.git libs/core

# Klonování projektu, který obsahuje submoduly:
git clone --recurse-submodules https://github.com/autor/projekt.git
```

Informace o submodulech jsou uloženy v souboru `.gitmodules`.

---

<!-- slide: id=id30 title="VIII. Git Hooks a framework `pre-commit`" tags="WOW" diff="newconcept" python="3.12+" -->
## VIII. Git Hooks a framework `pre-commit`

Git podporuje spouštění skriptů před a po klíčových akcích (např. `pre-commit`, `commit-msg`, `pre-push`) uložených v `.git/hooks/`.

V moderním Pythonu je de facto standardem nástroj **`pre-commit`**:

Soubor `.pre-commit-config.yaml` v kořenu projektu:
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
```

Aktivace v repozitáři:
```bash
pipx install pre-commit
pre-commit install
```
Při každém volání `git commit` nástroj automaticky zkontroluje a zformátuje kód pomocí bleskového linteru **Ruff** a zabrání commitu chybného kódu.

---

<!-- slide: id=id31 title="Best Practices týmového vývoje v Gitu" tags="Skip" diff="basics" -->
## Best Practices týmového vývoje v Gitu

1. **Chraňte hlavní větev (`main`):** Přímé commity do `main` by měly být zakázány. Všechny změny musí procházet přes feature větve a Pull Request s review.
2. **Malé a atomické commity:** Každý commit by měl řešit jednu ucelenou logickou změnu a zanechat projekt v přeložitelném a otestovaném stavu.
3. **Výstižné commit messages (Conventional Commits):**
   - `feat: pridej export do CSV`
   - `fix: osetri deleni nulou pri vypoctu prumeru`
   - `docs: aktualizuj instalacni pokyny v README`
4. **Pravidelně synchronizujte:** Stahujte změny kolegů často (`git pull --rebase`), abyste předešli velkým a bolestivým merge konfliktům.
