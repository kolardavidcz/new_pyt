<!-- slide: id=id1 title="Úvod" tags="Skip" diff="basics" -->
## Galerie L-systémů a fraktální geometrie

L-systémy představují mimořádně elegantní nástroj pro generování fraktálních křivek i biologických struktur. V této přednášce si ukážeme bohatou galerii klasických obrazců a praktický kód jejich interpretace v Pythonu.

Příklady jsou rozděleny do tří hlavních kategorií:
1. **Deterministické fraktální křivky** (bez větvení a bez zásobníku).
2. **Deterministické větvené struktury a stromy** (se zásobníkovými operacemi `[` a `]`).
3. **Stochastické botanické simulace** (s náhodnými pravidly a organickými variacemi).

---
<!-- slide: id=id2 title="I. Fraktální obrazce" tags="Skip" diff="basics" -->
## I. Deterministické fraktální křivky

První skupinu tvoří **D0L-systémy** bez použití zásobníku. Celá křivka je tvořena jedním souvislým tahem pera.

Všechny tyto útvary vykazují:
- **Soběpodobnost** (*self-similarity*): detail křivky při libovolném zvětšení věrně kopíruje celek.
- **Neceločíselnou fraktální dimenzi**: křivka svou složitostí vyplňuje prostor mezi dimenzí 1 (čára) a dimenzí 2 (plocha).

---
<!-- slide: id=id3 title="Kochův ostrov" tags="Core" diff="basics" -->
## Kochův ostrov (Kvadratická Kochova křivka)

Uzavřená varianta Kochovy křivky vycházející ze čtvercového axiomu:

- **Abeceda**: $\Sigma = \{F, +, -\}$
- **Axiom**: $\omega = F-F-F-F$
- **Pravidlo**: $F \to F-F+F+FF-F-F+F$
- **Úhel**: $\delta = 90^\circ$

Každá rovná strana čtverce je nahrazena členitým výběžkem. Výsledkem je ostrov se složitě členěným pobřežím a kvadratickými zálivy.

---
<!-- slide: id=id4 title="Jiný Kochův ostrov" tags="Skip" diff="basics" -->
## Alternativní Kochův ostrov (Minkowského klobouk)

Varianta s asymetrickým pravoúhlým přepisovacím pravidlem:

- **Axiom**: $\omega = F-F-F-F$
- **Pravidlo**: $F \to F-FF--F-F$
- **Úhel**: $\delta = 90^\circ$

Při vyšších iteracích vytváří labyrintovou strukturu s pravoúhlými zářezy.

---
<!-- slide: id=id5 title="Kochovy čtverce" tags="Skip" diff="basics" -->
## Kvadratický fraktál: Kochovy čtverce

Pravidlo s větším poměrem zahuštění segmentů:

- **Axiom**: $\omega = F-F-F-F$
- **Pravidlo**: $F \to FF-F-F-F-F-F+F$
- **Úhel**: $\delta = 90^\circ$

Křivka vytváří symetrické křížové vzory připomínající půdorysy gotických katedrál nebo tištěné spoje integrovaných obvodů.

---
<!-- slide: id=id6 title="Kochův čtverec" tags="Skip" diff="basics" -->
## Vnitřní Kochův čtverec

- **Axiom**: $\omega = F+F+F+F$
- **Pravidlo**: $F \to FF+F-F+F+FF$
- **Úhel**: $\delta = 90^\circ$

Na rozdíl od vnějšího ostrova směřují nové výstupky dovnitř i vně původního čtverce, což vytváří pravidelnou mřížku.

---
<!-- slide: id=id7 title="Jiný Kochův čtverec" tags="Skip" diff="basics" -->
## Asymetrická kvadratická křivka

- **Axiom**: $\omega = F-F-F-F$
- **Pravidlo**: $F \to FF-F--F-F$
- **Úhel**: $\delta = 90^\circ$

Dvojité otočení `--` představuje obrat o $180^\circ$ a vytváří vnořené meandry.

---
<!-- slide: id=id8 title="Ostrovy a jezera" tags="Core" diff="newconcept" -->
## Fraktální topologie: Ostrovy a jezera

Systém využívající dva druhy posunu: **`F`** (posun s kreslením) a **`f`** (posun bez kreslení):

- **Abeceda**: $\Sigma = \{F, f, +, -\}$
- **Axiom**: $\omega = F+F+F+F$
- **Pravidla**:
  - $F \to F+f-FF+F+FF+Ff+FF-f+FF-F-FF-Ff-FFF$
  - $f \to ffffff$
- **Úhel**: $\delta = 90^\circ$

Díky přepisování neviditelného kroku $f \to ffffff$ vznikají v ploše izolovaná uzavřená jezera a ostrovy, které nejsou propojeny žádnou čarou.

---
<!-- slide: id=id9 title="Sierpińského fraktál" tags="WOW" diff="paradigm" -->
## Sierpińského šipková křivka (Arrowhead curve)

Pravidelný trojúhelníkový fraktál generovaný pomocí dvou zrcadlových pravidel:

- **Abeceda**: $\Sigma = \{A, B, +, -\}$ (kde $A$ i $B$ znamenají posun vpřed s kreslením)
- **Axiom**: $\omega = A$
- **Pravidla**:
  - $A \to B-A-B$
  - $B \to A+B+A$
- **Úhel**: $\delta = 60^\circ$

V limitě konverguje k slavnému **Sierpińského trojúhelníku** s fraktální dimenzí $D = \frac{\ln 3}{\ln 2} \approx 1{,}585$.

---
<!-- slide: id=id10 title="Sierpińského trojúhelník" tags="Skip" diff="basics" -->
## Sierpińského trojúhelník (Třírohá varianta)

Alternativní zápis s úhlem $120^\circ$:

- **Axiom**: $\omega = F-G-G$
- **Pravidla**:
  - $F \to F-G+F+G-F$
  - $G \to GG$
- **Úhel**: $\delta = 120^\circ$

Krok $F$ kreslí vnitřní detaily, zatímco krok $G$ udržuje správné měřítko vnějších stran trojúhelníka.

---
<!-- slide: id=id11 title="Hilbertova křivka" tags="Core" diff="newconcept" -->
## Prostor vyplňující Hilbertova křivka

David Hilbert popsal v roce 1891 křivku, která v limitě prochází **každým bodem jednotkového čtverce** (prostor vyplňující křivka s dimenzí $D = 2$):

- **Abeceda**: $\Sigma = \{A, B, F, +, -\}$
  - $F$: krok vpřed s kreslením
  - $A, B$: neterminální řídicí symboly
- **Axiom**: $\omega = A$
- **Pravidla**:
  - $A \to +BF-AFA-FB+$
  - $B \to -AF+BFB+FA-$
- **Úhel**: $\delta = 90^\circ$

Hilbertova křivka zachovává lokální shlukování (*locality preserving*), a proto se dnes široce využívá v databázích (prostorové indexování R-stromy) a zpracování obrazu.

---
<!-- slide: id=id12 title="II. Simulace rostlin" tags="Skip" diff="basics" -->
## II. Deterministické modely rostlin se zásobníkem

Přidáním operací se zásobníkem (**`[`** a **`]`**) získává želva schopnost větvení:
- `[`: Uloží pozici a natočení želvy na vrchol zásobníku.
- `]`: Vyzvedne pozici a natočení z vrcholu zásobníku a přesune želvu zpět do větvení bez kreslení.

To umožňuje modelovat kmeny, postranní větve i jemné větvičky.

---
<!-- slide: id=id13 title="Rostlina 0" tags="Core" diff="newconcept" -->
## Jednoduchý keř: Rostlina 0

Klasický Lindenmayerův symetrický keř:

- **Axiom**: $\omega = F$
- **Pravidlo**: $F \to F[+F]F[-F]F$
- **Úhel**: $\delta = 25{,}7^\circ$

Při každém kroku vyrostou z hlavního stonku dvě symetrické postranní větvičky pod úhlem přibližně $26^\circ$.

---
<!-- slide: id=id14 title="Rostlina 1" tags="Skip" diff="basics" -->
## Přirozený keř: Rostlina 1

Asymetrický model s prodlužujícím se stonkem:

- **Axiom**: $\omega = A$
- **Pravidla**:
  - $A \to F-[[A]+A]+F[+FA]-A$
  - $F \to FF$
- **Úhel**: $\delta = 27^\circ$

Dvojité závorky `[[A]+A]` vytvářejí hustší shlukování větviček na levé straně.

---
<!-- slide: id=id15 title="Rostlina 2" tags="Skip" diff="basics" -->
## Přeslička: Rostlina 2

Model s přeslenitým větvením:

- **Axiom**: $\omega = F$
- **Pravidlo**: $F \to FF+[+F-FF]-[-F+F+F]$
- **Úhel**: $\delta = 25^\circ$

Vytváří segmentovaný kmen s protilehlými patry větví.

---
<!-- slide: id=id16 title="Rostlina 3" tags="Skip" diff="basics" -->
## Štíhlý strom: Rostlina 3

- **Axiom**: $\omega = A$
- **Pravidla**:
  - $A \to F[+A][-A]F[A]$
  - $F \to FF$
- **Úhel**: $\delta = 25^\circ$

Pravidlo `F[A]` na konci vytváří silný centrální kmen pokračující vzhůru (apikální dominance).

---
<!-- slide: id=id17 title="Rostlina 4" tags="Skip" diff="basics" -->
## Vlající koruna: Rostlina 4

- **Axiom**: $\omega = A$
- **Pravidla**:
  - $A \to F[+A]F[-A]+[A]$
  - $F \to FF$
- **Úhel**: $\delta = 20^\circ$

Asymetrické pootočení `+[A]` na konci dodává stromu dojem větru vanoucího jedním směrem.

---
<!-- slide: id=id18 title="III. Stochastické simulace rostlin" tags="Core" diff="newconcept" -->
## III. Stochastické botanické systémy

Pro realistické zobrazení přírody kombinujeme:
1. **Náhodný výběr pravidel** při přepisu symbolů.
2. **Kolísání délky kroku a úhlu**: $d \in \langle 8, 15 \rangle$, $\delta \in \langle 15^\circ, 25^\circ \rangle$.
3. **Generování květů a listů**: speciální terminální symboly (např. `K`) vyvolávají vykreslení barevných okvětních lístků na koncích větviček.

---
<!-- slide: id=id19 title="Rostlina 1 (Stochastická s květy)" tags="WOW" diff="pythonic" -->
## Kvetoucí keř s náhodným výběrem pravidel

- **Abeceda**: $\Sigma = \{K, F, +, -, [, ]\}$
- **Axiom**: $F$
- **Pravidla pro $F$ (volena náhodně)**:
  - $F \to FF[FF--F[+FFF-FK]]+F$
  - $F \to +F[-FFK]$
  - $F \to -F[+FF]$
  - $F \to -FF+FF-F$
- **Úhel**: náhodně z intervalu $\langle 15^\circ, 25^\circ \rangle$
- **Krok**: náhodně z intervalu $\langle 8, 15 \rangle$ px

### Implementace květu v Pythonu (`K`):
```python
import turtle
import random

KVET_BARVY = ["crimson", "orangered", "gold", "tomato", "darkmagenta"]

def draw_flower():
    turtle.pencolor(random.choice(KVET_BARVY))
    turtle.pensize(4)
    # Vykreslení pěti okvětních lístků:
    for _ in range(5):
        turtle.forward(6)
        turtle.backward(6)
        turtle.left(72)
    # Žlutý střed květu:
    turtle.dot(3, "yellow")
```

---
<!-- slide: id=id20 title="Kompletní interpret L-systémů v Pythonu" tags="Skip" diff="basics" -->
## Univerzální Python implementace L-systému

Kompletní třída pro paralelní generování a želví vykreslení libovolného D0L-systému:

```python
import turtle

class LSystem:
    def __init__(self, axiom: str, rules: dict[str, str], angle: float, step: float):
        self.axiom = axiom
        self.rules = rules
        self.angle = angle
        self.step = step

    def generate(self, iterations: int) -> str:
        current = self.axiom
        for _ in range(iterations):
            # Paralelní nahrazení všech symbolů najednou:
            current = "".join(self.rules.get(ch, ch) for ch in current)
        return current

    def draw(self, code: str) -> None:
        stack = []
        for ch in code:
            if ch in ("F", "A", "B"):
                turtle.forward(self.step)
            elif ch == "f":
                turtle.penup(); turtle.forward(self.step); turtle.pendown()
            elif ch == "+":
                turtle.left(self.angle)
            elif ch == "-":
                turtle.right(self.angle)
            elif ch == "[":
                stack.append((turtle.pos(), turtle.heading()))
            elif ch == "]":
                pos, head = stack.pop()
                turtle.teleport(*pos)
                turtle.setheading(head)
```

Tento kompaktní kód obslouží všechny představené fraktály, ostrovy i větvené stromy.
