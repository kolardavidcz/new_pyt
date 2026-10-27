<!-- slide: id=id1 title="Úvod" tags="Core" diff="newconcept" -->
## Úvod do L-systémů (Lindenmayerovy systémy)

**L-systémy** (*Lindenmayer systems*) jsou matematický formalismus pro modelování růstu a morfogeneze biologických organismů, který v roce 1968 představil maďarský teoretický biolog **Aristid Lindenmayer**.

### Význam a evoluce:
- Původně vznikly pro formální popis vývoje jednoduchých mnohobuněčných organismů (zejména vláknitých sinic a řas rodu *Anabaena*).
- V 80. letech propojil **Przemysław Prusinkiewicz** L-systémy se **želví grafikou**, čímž umožnil generovat dechberoucí fotorealistické vizualizace rostlin, stromů, listů a fraktálů (klasická monografie *The Algorithmic Beauty of Plants*, 1990).
- Dnes se využívají v procedurálním generování herních světů, architektuře, modelování vaskulárních sítí a algoritmické hudbě.

> [!NOTE]
> Zásadní rozdíl oproti klasickým Chomského gramatikám spočívá v **paralelním přepisování**: v každém kroku se aplikují pravidla na **všechny symboly řetězce současně**, což přesně odpovídá biologickému buněčnému dělení.

---
<!-- slide: id=id2 title="Příklad – zadání a provedení" tags="Core" diff="newconcept" -->
## Princip přepisování a želví interpretace

L-systém se skládá z abecedy symbolů, počátečního řetězce (**axiom**) a množiny **přepisovacích pravidel**:

### Typická geometrická interpretace symbolů v želví grafice:
| Symbol | Akce želvy |
| :---: | :--- |
| **`F`** | Posun vpřed s kreslením o délku $d$ (`forward(d)`) |
| **`f`** | Posun vpřed bez kreslení (`penup(); forward(d); pendown()`) |
| **`+`** | Otočení doleva o úhel $\delta$ (`left(delta)`) |
| **`-`** | Otočení doprava o úhel $\delta$ (`right(delta)`) |
| **`[`** | Uložení aktuální polohy a natočení na zásobník (*push state*) |
| **`]`** | Obnovení polohy a natočení ze zásobníku (*pop state*) |

### Příklad gramatiky pro binární větvení:
- **Axiom**: `A`
- **Pravidla**:
  1. $A \to F[+A]-A$
  2. $F \to FF$

### Postupný paralelní růst generací:
- **0. generace**: `A`
- **1. generace**: `F[+A]-A`
- **2. generace**: `FF[+F[+A]-A]-F[+A]-A`
- **3. generace**: `FFFF[+FF[+F[+A]-A]-F[+A]-A]-FF[+F[+A]-A]-F[+A]-A`

---
<!-- slide: id=id3 title="Příklad – interpretace želví grafikou" tags="Core" diff="basics" -->
## Grafické rozvinutí fraktálního stromu

Když výsledný řetězec 3. generace předáme interpretu želví grafiky s úhlem $\delta = 45^\circ$, získáme rozvětvenou korunu stromu:

```plain
0. generace (kmen):   F[+A]-A
1. generace (větve):  FF[+F[+A]-A]-F[+A]-A
2. generace (koruna): FFFF[+FF[+F[+A]-A]-F[+A]-A]-FF[+F[+A]-A]-F[+A]-A
```

Zásobníkové operace `[` a `]` umožňují želvě po dokončení levé větve okamžitě „skočit“ zpět do uzlu větvení a pokračovat pravou větví, aniž by musela složitě couvat po nakreslených čarách.

---
<!-- slide: id=id4 title="Poznámky" tags="Skip" diff="basics" -->
## Pozorování a dynamika růstu

1. **Exponenciální nárůst délky**: Z jednoduchého axiomu o 1 znaku vzniká během několika iterací řetězec o desítkách tisíc symbolů.
2. **Řídicí (neterminální) symboly**: Symbol `A` slouží pouze jako „růstový pupen“ (*bud*). Při kreslení se ignoruje (želva pro něj nic nevykoná), ale v dalším kroku z něj vyraší nová větev.
3. **Kompaktní zápis složitosti**: Celá geometrie stromu je bezezbytku zakódována v pouhých dvou řádcích transformačních pravidel.

---
<!-- slide: id=id5 title="Formální definice" tags="Core" diff="paradigm" -->
## Formální definice D0L-systému

Základní typ L-systému – **deterministický bezkontextový systém (D0L)** – je formálně definován jako uspořádaná trojice:

$$G = (\Sigma, \omega, P)$$

kde:
- $\Sigma$ je **abeceda** (konečná neprázdná množina symbolů). $\Sigma^*$ značí množinu všech řetězců nad $\Sigma$.
- $\omega \in \Sigma^+$ je **axiom** (výchozí neprázdný řetězec nulté generace).
- $P \subset \Sigma \times \Sigma^*$ je konečná množina **přepisovacích pravidel** (produkcí), zapisovaných jako $a \to \alpha$, kde $a \in \Sigma$ a $\alpha \in \Sigma^*$.

### Klíčové vlastnosti D0L:
- **Deterministický (D)**: Pro každý symbol $a \in \Sigma$ existuje právě jedno pravidlo s levou stranou $a$.
- **Bezkontextový (0L)**: Aplikace pravidla závisí pouze na samotném symbolu, nikoli na jeho sousedech.
- **Identita pro konstanty**: Pokud pro symbol $b$ není pravidlo explicitně definováno, uvažuje se triviální pravidlo $b \to b$ (symbol se beze změny zkopíruje).

---
<!-- slide: id=id6 title="Příklad – Fibonacciho posloupnost" tags="WOW" diff="paradigm" -->
## L-systém generující Fibonacciho čísla

L-systémy nemusí sloužit pouze pro kreslení. Uvažujme čistě kombinatorický systém:

- $\Sigma = \{A, B\}$
- $\omega = A$
- $P = \{A \to B, \; B \to BA\}$

### Generované řetězce a jejich délky:
| Generace | Řetězec | Délka $|w_n|$ |
| :---: | :--- | :---: |
| **0.** | `A` | **1** |
| **1.** | `B` | **1** |
| **2.** | `BA` | **2** |
| **3.** | `BAB` | **3** |
| **4.** | `BABBA` | **5** |
| **5.** | `BABBABAB` | **8** |
| **6.** | `BABBABABBABBA` | **13** |
| **7.** | `BABBABABBABBABABBABAB` | **21** |

Délka $n$-té generace odpovídá přesně $(n+1)$-tému Fibonacciho číslu $F_{n+1}$. Původní Lindenmayerův biologický model tímto způsobem popsal dělení buněk v heterocystách sinic.

---
<!-- slide: id=id7 title="Příklad – Kochova vločka" tags="Core" diff="basics" -->
## Klasický fraktál: Kochova křivka

Matematický fraktál Helge von Kocha (1904) vyjádřený pomocí D0L-systému:

- **Abeceda**: $\Sigma = \{F, +, -\}$
- **Axiom**: $\omega = F$
- **Pravidlo**: $F \to F+F--F+F$
- **Úhel**: $\delta = 60^\circ$

### Růst generací:
1. $n=0$: Přímá úsečka `F`.
2. $n=1$: `F+F--F+F` (úsečka nahrazena trojúhelníkovým zubem se 4 segmenty).
3. $n=2$: Každý ze 4 segmentů nahrazen dalším zubem (16 segmentů).
4. $n \to \infty$: Fraktální křivka s nekonečnou délkou ohraničující konečnou plochu s Hausdorffovou dimenzí $D = \frac{\ln 4}{\ln 3} \approx 1{,}2619$.

---
<!-- slide: id=id8 title="Stochastické L-systémy" tags="Core" diff="newconcept" -->
## Stochastické L-systémy (0L)

V deterministických D0L systémech vyroste z daného axiomu pokaždé naprosto identický strom. Pro generování realistické přírody (např. lesa v herním enginu) je však nutná přirozená variabilita.

### Dva principy vnášení náhody:
1. **Náhodná interpretace**:
   - Generovaný řetězec je deterministický, ale želva při kreslení náhodně kolísá délku kroku $d \pm \Delta d$ nebo úhel $\delta \pm \Delta \delta$.
2. **Stochastická přepisovací pravidla**:
   - Jeden symbol může mít více alternativních pravidel s přiřazenou pravděpodobností $p_i$, kde $\sum p_i = 1$:
   $$a \xrightarrow{p_1} \alpha_1, \quad a \xrightarrow{p_2} \alpha_2, \quad \dots$$

Při každém přepisu se náhodně vylosuje jedno pravidlo, takže každý vygenerovaný jedinec je unikátní.

---
<!-- slide: id=id9 title="Příklad – rostliny" tags="Core" diff="basics" -->
## Příklad stochastické vegetace

Uvažujme stochastický systém s úhlem $30^\circ$:
- **Axiom**: `F`
- **Pravidla pro $F$**:
  - $F \xrightarrow{0.33} F[+F]F[-F]F$ (oboustranné větvení)
  - $F \xrightarrow{0.33} F[+F]F$ (pouze levá větev)
  - $F \xrightarrow{0.34} F[-F]F$ (pouze pravá větev)

Při stejném počtu iterací vygeneruje algoritmus celou populaci vzájemně odlišných keřů, které si však zachovávají stejný biologický taxon a charakteristický habitus.

---
<!-- slide: id=id10 title="Parametrické L-systémy" tags="Core" diff="newconcept" -->
## Parametrické L-systémy (PL-systémy)

V **parametrických L-systémech** nesou symboly číselné atributy: $F(x)$, $+(a)$, $A(len, age)$.

### Přínosy parametrů:
- **Plynulé tlumení a stárnutí**: Každá nová větev může být o koeficient $R = 0{,}7$ kratší než mateřská větev:
  $$F(x) \to F(x)[+F(x \cdot R)][-F(x \cdot R)]$$
- **Podmíněný růst (*Conditional rules*)**: Pravidlo se aplikuje pouze tehdy, splňuje-li parametr logickou podmínku:
  $$A(t) : t > 5 \to B(t)$$
  $$A(t) : t \le 5 \to A(t + 1)$$
  Umožňuje modelovat zrání pupenů a sezónní opadávání listů.

---
<!-- slide: id=id11 title="Příklad – H-strom" tags="WOW" diff="newconcept" -->
## Parametrický fraktál: H-strom

Parametrický systém generující fraktální strom se zkracujícími se větvemi:

- **Axiom**: $F(200)$
- **Pravidlo**: $F(p) \to H(p)[+F(p \cdot R)][-F(p \cdot R)]$
- **Parametr**: $R = 0{,}69$
- **Úhel**: $\delta = 85^\circ$

V každém kroku se délka nově vyrůstajících větví zmenší na $69\,\%$ předchozí délky, což zabraňuje překrývání větví a vytváří harmonický tvar koruny.

---
<!-- slide: id=id12 title="Kontextové L-systémy (1L a 2L)" tags="Tricky" diff="paradigm" -->
## Kontextové L-systémy (1L a 2L systémy)

V reálných rostlinách není růst buněk nezávislý na okolí – buňky si vyměňují živiny, fytohormony (auxin) a genetické signály.

V **kontextových L-systémech** závisí přepis symbolu na jeho bezprostředních sousedech:
$$lc < a > rc \to \alpha$$
kde $lc$ je levý kontext a $rc$ pravý kontext.

- **1L-systém**: Pravidlo vyžaduje kontext pouze z jedné strany (např. $A < a \to \alpha$).
- **2L-systém**: Pravidlo vyžaduje levý i pravý kontext současně ($b < a > c \to \alpha$).

---
<!-- slide: id=id13 title="Příklad – propagace signálu" tags="WOW" diff="paradigm" -->
## Modelování šíření signálu v 1L-systému

Demonstrace přenosu živného signálu podél buněčného vlákna zleva doprava:

- $\Sigma = \{a, A\}$ (kde `a` je neaktivní buňka, `A` je aktivovaná buňka se signálem)
- **Axiom**: `Aaaaaaaa`
- **Pravidla**:
  1. $A < a \to A$ (signál zleva aktivuje sousední buňku)
  2. $A \to a$ (původní buňka po předání signálu zhasne)

### Postup šíření signálu v čase:
```plain
0. krok: Aaaaaaaa
1. krok: aAaaaaaa
2. krok: aaAaaaaa
3. krok: aaaAaaaa
4. krok: aaaaAaaa
5. krok: aaaaaAaa
6. krok: aaaaaaAa
7. krok: aaaaaaaA
```

Signál putuje po vlákně konstantní rychlostí 1 buňka za generaci. Tento mechanismus tvoří základ simulací kvetení rostlin řízeného hormonálními vlnami.
