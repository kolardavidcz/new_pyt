/* Auto-extracted course catalog — shared by dashboard and lecture pages */
window.courseData = [
        {
            week: 0,
            title: "Příprava prostředí & Rychlý start",
            description: "Nastavení interpretru Python 3, balíčkovacího manažeru pip, virtuálních prostředí venv, vědeckého balíku Conda a interaktivních poznámkových bloků Jupyter.",
            lectures: [
                {
                    title: "Instalační kuchařka",
                    path: "vyuka_downloaded/materialy/python/install.html",
                    diff: "basics",
                    relevance: 3,
                    tags: ["Skip"],
                    desc: "Přehled instalace standardního interpretru Python 3 pro různé platformy.",
                    compare: "Srovnatelné s instalací Java JDK nebo C++ toolchainu. V Pythonu se spustitelný soubor hned integruje do terminálu jako interaktivní REPL."
                },
                {
                    title: "Vícero verzí Pythonu v systému",
                    path: "vyuka_downloaded/materialy/python/more-versions.html",
                    diff: "resyntax",
                    relevance: 6,
                    tags: ["WOW"],
                    desc: "Jak řešit situace, kdy je v operačním systému přítomno více verzí Pythonu.",
                    compare: "Analogie k managementu Java JDK verzí (např. pomocí SDKMAN!). Zde se řeší aliasy interpretru py, python3, python atd."
                },
                {
                    title: "Virtuální prostředí - úvod",
                    path: "vyuka_downloaded/materialy/python/packages/virtual_overview.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Teoretické odůvodnění potřeby separace knihoven v jednotlivých Python projektech.",
                    compare: "Na rozdíl od Javy (Maven stahuje globálně do ~/.m2) nebo C++ (vcpkg), Python standardně cpe balíčky do jedné složky site-packages. Virtuální prostředí jsou kritická pro izolaci projektů."
                },
                {
                    title: "Modul venv",
                    path: "vyuka_downloaded/materialy/python/packages/venv.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Vytváření a aktivace lokálních virtuálních prostředí přímo pomocí standardní knihovny.",
                    compare: "Vytvoří kopii interpretru a izolovanou složku site-packages v kořeni projektu. Aktivace modifikuje PATH shellu."
                },
                {
                    title: "Správce balíčků pip & wheel",
                    path: "vyuka_downloaded/materialy/python/packages/pip.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Instalace, aktualizace a odstraňování externích balíčků z registru PyPI.",
                    compare: "Ekvivalent k Maven (Java) nebo NuGet / vcpkg (C++). Zde instaluješ balíčky napřímo: 'pip install <nazev>'."
                },
                {
                    title: "Conda - víc než Python?",
                    path: "vyuka_downloaded/materialy/python/packages/conda_overview.html",
                    diff: "newconcept",
                    relevance: 5,
                    tags: ["Skip"],
                    desc: "Představení systému Conda, který funguje jako správce balíčků i celých prostředí nezávisle na platformě.",
                    compare: "Conda spravuje jakékoliv binární balíčky, včetně C/C++ knihoven. Java Maven řeší pouze Java závislosti, C++ vcpkg pouze C++ zdrojáky."
                },
                {
                    title: "Conda - základy práce",
                    path: "vyuka_downloaded/materialy/python/packages/conda.html",
                    diff: "newconcept",
                    relevance: 5,
                    tags: ["Skip"],
                    desc: "Základní command-line příkazy pro práci s prostředími v Condě.",
                    compare: "Příkazy conda create, activate a install. Nahrazuje kombinaci venv + pip."
                },
                {
                    title: "Jupyter - úvod & instalace",
                    path: "vyuka_downloaded/materialy/jupyter/overview.html",
                    diff: "newconcept",
                    relevance: 7,
                    tags: ["WOW"],
                    desc: "Webové vývojové prostředí umožňující míchat formátovaný text (Markdown) a živý, spustitelný kód.",
                    compare: "V Javě/C++ píšeme kód do souborů, který pak celý překládáme. Jupyter umožňuje interaktivně spouštět kód v buňkách za zachování stavu paměti."
                },
                {
                    title: "Jupyter - základy práce",
                    path: "vyuka_downloaded/materialy/jupyter/usage.html",
                    diff: "newconcept",
                    relevance: 7,
                    tags: ["WOW"],
                    desc: "Jak psát a spouštět buňky, klávesové zkratky a práce se stavy interpretru.",
                    compare: "Užitečné pro průzkumnou analýzu dat a experimentování, kde se nechce pokaždé spouštět celý program."
                }
            ],
            exercises: [
            ]
        },
        {
            week: 1,
            title: "Základy syntaxe & Typový model",
            description: "Dynamic typing, odkazový paměťový model (reference-based), vestavěné základní datové typy (čísla, immutable řetězce), kódování Unicode a formátování výstupu.",
            lectures: [
                {
                    title: "Obecné poznámky k typům",
                    path: "vyuka_downloaded/materialy/python/types/_remarks.html",
                    diff: "paradigm",
                    relevance: 7,
                    tags: ["Core", "Tricky"],
                    desc: "Jak interpret reprezentuje proměnné v paměti a jak funguje dynamické typování.",
                    compare: "Na rozdíl od Javy a C++ nemá Python primitivní typy na zásobníku (jako int, float). Všechno v Pythonu je objekt na haldě, proměnné jsou jen ukazatele (jména) svázané s objekty."
                },
                {
                    title: "Základní řídicí konstrukce",
                    path: "vyuka_downloaded/materialy/python/basics.html",
                    diff: "basics",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Podmínky if-elif-else, smyčky for a while, syntaxe bloků pomocí odsazování.",
                    compare: "Bloky kódu se neohraničují {} jako v Javě/C++, ale odsazením. C-style smyčka 'for (int i=0; i<N; i++)' neexistuje, 'for' je v Pythonu vždy 'for-each' iterátorem."
                },
                {
                    title: "Čísla (int, float, complex)",
                    path: "vyuka_downloaded/materialy/python/types/numbers.html",
                    diff: "basics",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Reprezentace celých čísel s libovolnou přesností (int), reálných čísel (float) a nativní podpora komplexních čísel.",
                    compare: "Python int je 'nafukovací' a při překročení 32/64 bitů automaticky přejde na libovolnou přesnost (jako BigInteger v Javě). Python float je implementován jako C double (64-bit IEEE 754)."
                },
                {
                    title: "Řetězce (str)",
                    path: "vyuka_downloaded/materialy/python/types/strings.html",
                    diff: "resyntax",
                    relevance: 9,
                    tags: ["Core", "WOW"],
                    desc: "Reprezentace textu. Neměnnost (immutability), základní operace, indexování a řetězcové řezy (slicing).",
                    compare: "Podobně jako Java String je Python str immutable (neměnný). Python nabízí nativní syntaxi řezů 's[start:stop:krok]', což v C++/Javě vyžaduje metody substring."
                },
                {
                    title: "Kódování textů & Unicode",
                    path: "vyuka_downloaded/materialy/text/encoding.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Rozdíly mezi znakovými sadami, reprezentace Unicode v paměti a kódování do bajtových proudů.",
                    compare: "Python 3 striktně odděluje text ('str') od binárních bajtů ('bytes'). V Javě odpovídá rozdílu mezi String a byte[]."
                },
                {
                    title: "Hrátky s printem",
                    path: "vyuka_downloaded/materialy/python/cmd/print.html",
                    diff: "resyntax",
                    relevance: 7,
                    tags: ["WOW"],
                    desc: "Vše o vestavěné funkci print(), její parametry sep a end, a formátování pomocí f-stringů.",
                    compare: "Moderní Python f-stringy 'f\\\\"
                }
            ],
            exercises: [
                {
                    title: "Rozcvička se syntaxí",
                    path: "vyuka_downloaded/priklady/python/zaklady.html",
                    diff: "basics",
                    relevance: 5,
                    tags: ["Skip"],
                    desc: "Jednoduché příklady na seznámení s během interpretru.",
                    compare: "Základní vstupy a výstupy, jednoduché větvení."
                },
                {
                    title: "Číselné operace",
                    path: "vyuka_downloaded/priklady/python/typy.cisla.html",
                    diff: "basics",
                    relevance: 6,
                    tags: ["Skip"],
                    desc: "Procvičení aritmetiky, zaokrouhlování a komplexních čísel.",
                    compare: "Základy binárních a matematických operací."
                },
                {
                    title: "Práce s řetězci",
                    path: "vyuka_downloaded/priklady/python/typy.retezce.html",
                    diff: "resyntax",
                    relevance: 7,
                    tags: ["Core"],
                    desc: "Vyhledávání v textu, spojování a pokročilý slicing.",
                    compare: "Rozřezávání řetězců pozpátku, přeskakování znaků atd."
                },
                {
                    title: "Hrátky s printem (ANSI)",
                    path: "vyuka_downloaded/priklady/python/procvicovani.ansi-print.html",
                    diff: "resyntax",
                    relevance: 7,
                    tags: ["WOW"],
                    desc: "Tisk formátovaných tabulek a výstupů pomocí ANSI escape sekvencí pro barvy.",
                    compare: "V C++ i Javě by to vyžadovalo složité escapování streamů, v Pythonu to řešíme jednoduchým f-stringem."
                }
            ]
        },
        {
            week: 2,
            title: "Seznamy, N-tice & Základy řazení",
            description: "Sekvenční datové typy (mutable list vs immutable tuple), líná generátorová notace kolekcí (list comprehensions) a třídění pomocí klíčové transformace.",
            lectures: [
                {
                    title: "N-tice (Tuples) & NamedTuples",
                    path: "vyuka_downloaded/materialy/python/types/tuples.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core", "WOW"],
                    desc: "Neměnná sekvence (tuple) a její pojmenovaná varianta z modulu collections.",
                    compare: "V Javě/C++ pro vrácení více hodnot z funkce potřebujete vyrobit pomocnou třídu, strukturu, nebo std::pair/tuple. Python má vestavěnou podporu pro tuple unpacking: 'x, y = z'."
                },
                {
                    title: "Pojmenované n-tice (namedtuple)",
                    path: "vyuka_downloaded/materialy/python/types.plus/NamedTuples.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core", "WOW"],
                    desc: "Použití namedtuple pro čitelnější přístup k datům bez overheadu plnohodnotných tříd.",
                    compare: "Ekvivalent k Java record (Java 14+) nebo C++ read-only struct, ale plně kompatibilní se standardními sekvencemi."
                },
                {
                    title: "Boolean a priority operátorů",
                    path: "vyuka_downloaded/materialy/python/types/boolean.html",
                    diff: "basics",
                    relevance: 6,
                    tags: ["Skip"],
                    desc: "Typ bool jako podtřída int. Logické operátory and, or, not a short-circuit evaluation.",
                    compare: "V Pythonu se píší logické operátory slovy 'and', 'or', 'not' namísto '&&', '||', '!'. Hodnoty jako prázdný seznam, 0, None se vyhodnocují jako False."
                },
                {
                    title: "Seznamy (Lists) & array",
                    path: "vyuka_downloaded/materialy/python/types/lists.html",
                    diff: "resyntax",
                    relevance: 9,
                    tags: ["Core"],
                    desc: "Modifikovatelné dynamické pole (list). Metody modifikace, vkládání a mazání prvků.",
                    compare: "Ekvivalent k std::vector v C++ a ArrayList v Javě. Python list je však heterogenní - může v sobě mít objekty libovolných typů zároveň."
                },
                {
                    title: "Typovaná pole array",
                    path: "vyuka_downloaded/materialy/python/types.plus/arrays.html",
                    diff: "resyntax",
                    relevance: 5,
                    tags: ["WOW"],
                    desc: "Ukládání homogenních primitivních typů za účelem šetření paměti.",
                    compare: "Vhodné pro interoperabilitu s C kódem. Ekvivalent k std::vector s fixním C typem."
                },
                {
                    title: "Základy řazení v Pythonu",
                    path: "vyuka_downloaded/materialy/python/sorting/overview.html",
                    diff: "resyntax",
                    relevance: 9,
                    tags: ["Core", "Legendary"],
                    desc: "Jak funguje stabilní Timsort. Rozdíl mezi list.sort() (in-place) a sorted() (vrací nový seznam).",
                    compare: "V Javě/C++ implementujeme Comparator / operator<. Python používá parametr 'key=', kam předáme jednoargumentovou funkci, která z objektu vytáhne porovnávací hodnotu."
                },
                {
                    title: "Čtení a zápis ze/do souborů",
                    path: "vyuka_downloaded/materialy/python/files/overview.html",
                    diff: "basics",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Základy práce se souborovými proudy pomocí vestavěné funkce open().",
                    compare: "Výrazně méně ukecané než Java FileReader/BufferedReader nebo C++ fstream."
                }
            ],
            exercises: [
                {
                    title: "Cvičení na seznamy",
                    path: "vyuka_downloaded/priklady/python/typy.seznamy.html",
                    diff: "resyntax",
                    relevance: 7,
                    tags: ["Core"],
                    desc: "Jednoduché operace nad seznamy, řezání, odebírání a mutace prvků.",
                    compare: "Základní manipulace, indexy."
                },
                {
                    title: "Hra s čísly a indexy",
                    path: "vyuka_downloaded/priklady/python/procvicovani.3.html",
                    diff: "basics",
                    relevance: 6,
                    tags: ["Skip"],
                    desc: "Práce se sekvencemi a výpočet statistik.",
                    compare: "Jednoduché matematické zpracování prvků."
                },
                {
                    title: "Parsování textových souborů I",
                    path: "vyuka_downloaded/priklady/python/procvicovani.2.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Čtení řádků textového souboru, odstraňování bílých znaků a jednoduché parsování strukturovaných dat.",
                    compare: "Typická zkušební úloha. Kombinuje soubory, seznamy a metody řetězců."
                }
            ]
        },
        {
            week: 3,
            title: "Slovníky, Množiny & Výjimky",
            description: "Hashované asociační kontejnery (slovníky a množiny), zpracování chyb bez rozdělení na checked/unchecked výjimky a trvalé ukládání datových struktur.",
            lectures: [
                {
                    title: "Slovníky (Dictionaries) & defaultdict",
                    path: "vyuka_downloaded/materialy/python/types/dictionaries.html",
                    diff: "basics",
                    relevance: 9,
                    tags: ["Core", "Legendary"],
                    desc: "Rychlý klíč-hodnota kontejner. Metody get, setdefault a update.",
                    compare: "Ekvivalent k HashMap v Javě a std::unordered_map v C++. Od verze 3.7 si navíc pamatují pořadí, v jakém byly prvky vloženy."
                },
                {
                    title: "DefaultDict",
                    path: "vyuka_downloaded/materialy/python/types.plus/DefaultDicts.html",
                    diff: "resyntax",
                    relevance: 9,
                    tags: ["Core"],
                    desc: "Slovník z modulu collections, který automaticky vyrobí výchozí prvek při dotazu na neexistující klíč.",
                    compare: "V Javě k tomu slouží map.computeIfAbsent(), v Pythonu je to nativní součást typového systému pomocí defaultdict."
                },
                {
                    title: "Množiny (Sets & Frozensets)",
                    path: "vyuka_downloaded/materialy/python/types/sets.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Rychlé vyhledávání duplicit, matematické operace jako průnik, sjednocení a symetrický rozdíl.",
                    compare: "Ekvivalent k HashSet v Javě a std::unordered_set v C++. Frozenset je neměnná hashovatelná množina."
                },
                {
                    title: "Výjimky v Pythonu",
                    path: "vyuka_downloaded/materialy/python/exceptions/exceptions.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Zpracování chyb pomocí try-except-else-finally bloků a vyvolávání chyb pomocí raise.",
                    compare: "Python nemá Checked Exceptions (všechny výjimky jsou Unchecked jako RuntimeException v Javě). Blok 'else' po try se spustí, pokud k výjimce nedošlo."
                },
                {
                    title: "Serializace a modul pickle",
                    path: "vyuka_downloaded/materialy/python/serialization/overview.html",
                    diff: "newconcept",
                    relevance: 7,
                    tags: ["Legendary"],
                    desc: "Uložení libovolného objektového stromu do binárního souboru a jeho následné načtení.",
                    compare: "Podobné jako Java ObjectOutputStream. Pozor na bezpečnost - pickle.load() může spustit libovolný kód ukrytý v souboru!"
                }
            ],
            exercises: [
                {
                    title: "Cvičení na slovníky",
                    path: "vyuka_downloaded/priklady/python/typy.slovniky.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Konstrukce frekvenčních slovníků a asociační vyhledávání.",
                    compare: "Počítání výskytů prvků - klasické využití dictionary."
                },
                {
                    title: "Parsování textových souborů II",
                    path: "vyuka_downloaded/priklady/python/procvicovani.2.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Pokročilé parsování souborů a agregace výsledků do slovníků.",
                    compare: "Cvičení č. 6 z originálu - zpracování CSV dat a seskupování."
                },
                {
                    title: "Hustota obyvatelstva států",
                    path: "vyuka_downloaded/priklady/python/procvicovani.staty.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Tricky"],
                    desc: "Zpracování geografických dat ze souboru, výpočet hustoty zalidnění, uložení do slovníku a seřazení států.",
                    compare: "Komplexní příklad, který v Javě/C++ vyžaduje psaní třídy a komparátoru."
                }
            ]
        },
        {
            week: 4,
            title: "Funkce I: Parametry, Scope & Anotace",
            description: "Pokročilá práce s funkcemi, LEGB pravidlo oboru viditelnosti proměnných, flexibilní předávání argumentů (*args, **kwargs) a dobrovolné anotace typů.",
            lectures: [
                {
                    title: "Funkce - základy",
                    path: "vyuka_downloaded/materialy/python/functions/overview.html",
                    diff: "basics",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Definice funkcí klíčovým slovem def, předávání referencí na objekty a návratové hodnoty.",
                    compare: "Funkce mohou stát samostatně (jako v C++) a nemusí patřit žádné třídě (na rozdíl od Javy). Parametry se předávají hodnotou odkazu (pass-by-value-of-reference)."
                },
                {
                    title: "Argumenty a parametry",
                    path: "vyuka_downloaded/materialy/python/functions/parameters.html",
                    diff: "pythonic",
                    relevance: 9,
                    tags: ["Core", "Legendary"],
                    desc: "Defaultní parametry, poziční a pojmenované argumenty, a sběrné parametry *args a **kwargs.",
                    compare: "Python nepodporuje přetěžování metod (overloading) na základě signatury. Místo toho se píše jedna funkce s volitelnými / pojmenovanými argumenty a variabilním počtem parametrů."
                },
                {
                    title: "Scope (obor viditelnosti LEGB)",
                    path: "vyuka_downloaded/materialy/python/functions/scope.html",
                    diff: "paradigm",
                    relevance: 9,
                    tags: ["Core", "Tricky"],
                    desc: "Pravidlo LEGB (Local, Enclosing, Global, Built-in) a chování klíčových slov global a nonlocal.",
                    compare: "V Pythonu bloky jako if, for nezakládají nový scope. Změna globální proměnné uvnitř funkce vyžaduje explicitní klíčové slovo global, jinak se vytvoří nová lokální proměnná."
                },
                {
                    title: "Funkce jako First-Class Citizen",
                    path: "vyuka_downloaded/materialy/python/functions/advanced-2.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["WOW"],
                    desc: "Vysvětlení faktu, že funkce jsou plnohodnotné objekty, které lze ukládat a předávat jako argumenty.",
                    compare: "V C++ k tomu slouží funkční ukazatele nebo std::function, v Javě funkcionální rozhraní. V Pythonu je každá funkce rovnou objektem."
                },
                {
                    title: "Anotace funkcí & modul typing",
                    path: "vyuka_downloaded/materialy/python/functions/annotations.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Zápis typů (type hinting) do definic funkcí a proměnných pro kontrolu pomocí statického analyzátoru MyPy.",
                    compare: "Typové anotace jsou pouze informativní. Interpret je za běhu nijak nevynucuje. Slouží k tomu, aby Python získal výhody staticky typovaných jazyků jako Java/C++ během psaní kódu."
                }
            ],
            exercises: [
                {
                    title: "Zpracování velkých dat (profilace)",
                    path: "vyuka_downloaded/priklady/python/big.html",
                    diff: "newconcept",
                    relevance: 6,
                    tags: ["Skip"],
                    desc: "Zpracování obrovského textového souboru, filtrace a vyhledávání s měřením efektivity.",
                    compare: "Nutnost optimalizace paměti a rychlosti pomocích správných datových struktur."
                }
            ]
        },
        {
            week: 5,
            title: "Funkce II: Generátory & Dekorátory",
            description: "Metaprogramování a líné vyhodnocování. Tvorba generátorů pomocí yield, uzávěry (closures) a modifikace chování funkcí pomocí dekorátorů.",
            lectures: [
                {
                    title: "Generátory & generátorové výrazy",
                    path: "vyuka_downloaded/materialy/python/generators/generators.html",
                    diff: "pythonic",
                    relevance: 9,
                    tags: ["Legendary"],
                    desc: "Líné generování sekvencí pomocí yield bez nutnosti alokovat celou kolekci v paměti.",
                    compare: "V Javě/C++ vyžaduje líná generace psaní složitého stavového iterátoru. Python to řeší pouhým použitím klíčového slova yield uvnitř funkce."
                },
                {
                    title: "List & Generator Comprehensions",
                    path: "vyuka_downloaded/materialy/python/types/_comprehensions.html",
                    diff: "pythonic",
                    relevance: 9,
                    tags: ["Legendary"],
                    desc: "Generátorová notace seznamů, slovníků a množin pro elegantní transformace dat.",
                    compare: "Mnohem čitelnější náhrada za Java Streams API (.map().filter().collect()). Umožňuje zapsat mapování a filtraci na jeden řádek: '[x*2 for x in data if x > 0]'."
                },
                {
                    title: "Uzávěry (Closures) & Lambda",
                    path: "vyuka_downloaded/materialy/python/functions/advanced-1.html",
                    diff: "paradigm",
                    relevance: 9,
                    tags: ["Core", "Legendary"],
                    desc: "Definice vnořené funkce, která si zachovává vazbu na lokální proměnné své obalující funkce.",
                    compare: "V Javě lambdy mohou přistupovat pouze k (effectively) final proměnným. Python uzávěry umožňují i zápis pomocí klíčového slova nonlocal."
                },
                {
                    title: "Dekorátory funkcí",
                    path: "vyuka_downloaded/materialy/python/functions/decorators.html",
                    diff: "pythonic",
                    relevance: 10,
                    tags: ["Core", "Legendary"],
                    desc: "Obalování funkcí jiným kódem za účelem logování, měření času nebo řízení přístupu.",
                    compare: "V Javě se toto řeší pomocí AOP (Aspect-Oriented Programming) a Spring proxy objektů, což je extrémně složité. Python má pro to nativní syntaxi @dekorator."
                },
                {
                    title: "Memoizace a rekurze",
                    path: "vyuka_downloaded/materialy/techs/recursion/memoization.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Legendary"],
                    desc: "Automatické cachování mezivýsledků rekurzivních funkcí za účelem zrychlení výpočtu.",
                    compare: "Přidáním dekorátoru '@functools.lru_cache' nad rekurzivní funkci (např. Fibonacci) zredukujete časovou složitost z exponenciální na lineární."
                }
            ],
            exercises: [
                {
                    title: "Generátory pro bioinformatiku",
                    path: "vyuka_downloaded/priklady/python/iteratory.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Implementace vlastních generátorů pro čtení velkých souborů po blocích.",
                    compare: "Úlohy 1, 3 a 5 z originálního cvičení."
                },
                {
                    title: "Dekorátory v praxi",
                    path: "vyuka_downloaded/priklady/python/dekoratory.html",
                    diff: "paradigm",
                    relevance: 9,
                    tags: ["Core", "Legendary"],
                    desc: "Návrh dekorátorů s parametry pro logování argumentů a měření doby běhu.",
                    compare: "Praktická aplikace uzávěrů."
                },
                {
                    title: "Parsování FASTA a FASTQ",
                    path: "vyuka_downloaded/priklady/bioinfo/fastN.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Legendary"],
                    desc: "Zpracování genetických sekvencí z obřích textových souborů líným způsobem.",
                    compare: "Bioinformatický úkol ideální pro demonstraci síly generátorů v Pythonu."
                }
            ]
        },
        {
            week: 6,
            title: "Třídy, OOP & Protokoly",
            description: "Implementace objektově orientovaného programování v Pythonu. Explicitní parametr self, vícenásobná dědičnost, kontextový manažer with a dunder (magic) metody.",
            lectures: [
                {
                    title: "Třídy a konstruktory (OOP)",
                    path: "vyuka_downloaded/materialy/python/objects/oop.html",
                    diff: "basics",
                    relevance: 9,
                    tags: ["Core"],
                    desc: "Definice třídy, atributy instance, metody a explicitní předávání instance pomocí parametru self.",
                    compare: "Parametr self (ekvivalent Java/C++ 'this') musí být explicitně deklarován jako první argument každé metody třídy. Všechny atributy jsou standardně veřejné (public)."
                },
                {
                    title: "Vícenásobná dědičnost & super()",
                    path: "vyuka_downloaded/materialy/python/objects/super.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["WOW"],
                    desc: "Jak Python řeší dědičnost z více tříd najednou a jak algoritmus MRO (Method Resolution Order) vyhodnocuje pořadí volání metod.",
                    compare: "Java nepovoluje vícenásobnou dědičnost tříd. C++ ji povoluje, ale má problém s diamantovou dědičností. Python to řeší robustně pomocí MRO (C3 linearization) a voláním super()."
                },
                {
                    title: "Magické (dunder) metody",
                    path: "vyuka_downloaded/materialy/python/objects/magic.html",
                    diff: "pythonic",
                    relevance: 10,
                    tags: ["Core", "Legendary"],
                    desc: "Metody ohraničené dvěma podtržítky, které definují chování objektů při interakci s vestavěnými funkcemi a operátory.",
                    compare: "Ekvivalent přetěžování operátorů v C++ a přepisování standardních metod v Javě (equals, toString). V Pythonu můžete zařídit, aby se váš objekt choval jako číslo, seznam nebo funkce implementací metod __add__, __getitem__, __call__."
                },
                {
                    title: "Iterátory (Protokol)",
                    path: "vyuka_downloaded/materialy/python/iterators/iterators.html",
                    diff: "resyntax",
                    relevance: 9,
                    tags: ["Core"],
                    desc: "Jak z třídy udělat iterovatelný objekt implementací metod __iter__ a __next__.",
                    compare: "Ekvivalent k Java rozhraní Iterable a Iterator."
                },
                {
                    title: "Kontextový manažer (with)",
                    path: "vyuka_downloaded/materialy/python/files/with.html",
                    diff: "pythonic",
                    relevance: 9,
                    tags: ["Core", "WOW"],
                    desc: "Protokol kontextového manažeru pomocí dunder metod __enter__ a __exit__ pro bezpečné uvolňování zdrojů.",
                    compare: "Ekvivalent k Java try-with-resources (AutoCloseable) a C++ RAII vzorům. Zajišťuje uvolnění prostředků i v případě výskytu výjimky."
                },
                {
                    title: "Deskriptory a properties",
                    path: "vyuka_downloaded/materialy/python/objects/descriptors.html",
                    diff: "newconcept",
                    relevance: 6,
                    tags: ["Tricky"],
                    desc: "Pokročilé řízení přístupu k atributům pomocí metod __get__ a __set__.",
                    compare: "Používá se pod kapotou pro realizaci dekorátoru @property (gettery/settery) a v ORM systémech."
                }
            ],
            exercises: [
                {
                    title: "Vlastní iterátor",
                    path: "vyuka_downloaded/priklady/python/iteratory.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Napsání třídy reprezentující vlastní generátor číselných řad.",
                    compare: "Úlohy 2, 4 a 6 z originálního cvičení."
                },
                {
                    title: "Cyklický seznam (Magic)",
                    path: "vyuka_downloaded/priklady/python/magic.html",
                    diff: "pythonic",
                    relevance: 9,
                    tags: ["Tricky"],
                    desc: "Implementace datové struktury cyklického seznamu, která reaguje na standardní operátory a indexování.",
                    compare: "Komplexní cvičení na dunder metody (__getitem__, __len__, __iter__)."
                },
                {
                    title: "Šifrovací algoritmy",
                    path: "vyuka_downloaded/priklady/python/procvicovani.sifry.html",
                    diff: "resyntax",
                    relevance: 7,
                    tags: ["WOW"],
                    desc: "Využití OOP a dědičnosti pro reprezentaci různých druhů šifer (např. Caesarova, Vigenèrova).",
                    compare: "Typický příklad na polymorfismus a zapouzdření."
                }
            ]
        },
        {
            week: 7,
            title: "Moduly, Balíčky & Web",
            description: "Organizace kódu do větších celků. Vyhledávání modulů, cyklické závislosti, dokumentační testy doctest a základy webových formulářů v CherryPy.",
            lectures: [
                {
                    title: "Dokumentační testy (doctest)",
                    path: "vyuka_downloaded/materialy/python/testing/doctests.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Spouštění testovacích případů zapsaných přímo v dokumentačních řetězcích (docstrings) funkcí.",
                    compare: "Unikátní koncept Pythonu. Testy slouží zároveň jako živá dokumentace v kódu. Pokud se chování změní, dokumentace přestane procházet testy."
                },
                {
                    title: "Moduly a namespaces",
                    path: "vyuka_downloaded/materialy/python/modules/_basics.html",
                    diff: "basics",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Příkaz import, from-import, aliasy a struktura namespaces.",
                    compare: "Ekvivalent k Java import a C++ using namespace. V Pythonu je však každý importovaný soubor samostatným objektem typu module."
                },
                {
                    title: "Importy pod kapotou",
                    path: "vyuka_downloaded/materialy/python/modules/_modules.html",
                    diff: "resyntax",
                    relevance: 7,
                    tags: ["WOW"],
                    desc: "Cyklické importy a jak jim předcházet. Nastavení vyhledávací cesty sys.path.",
                    compare: "Na rozdíl od Javy, kde kompilátor cykly mezi třídami povolí, Python vyhodnocuje importy imperativně za běhu. Cyklický import tak způsobí chybu."
                },
                {
                    title: "CherryPy a webové formuláře",
                    path: "vyuka_downloaded/materialy/python/pypi/CherryPy.html",
                    diff: "newconcept",
                    relevance: 6,
                    tags: ["WOW"],
                    desc: "Objektově orientovaný webový micro-framework pro Python a parsování parametrů z dotazů GET/POST.",
                    compare: "Minimalistický webový server. Metody objektů jsou přímo vystaveny jako URL cesty."
                }
            ],
            exercises: [
            ]
        },
        {
            week: 8,
            title: "Soubory, Binární data & CLI",
            description: "Práce se souborovým systémem. Bajtové typy (bytes, bytearray) pro nízkoúrovňová data, pathlib pro moderní cesty, mmap pro obří soubory a tvorba rozhraní příkazové řádky (argparse).",
            lectures: [
                {
                    title: "Bajtové řetězce (bytes, bytearray)",
                    path: "vyuka_downloaded/materialy/python/types/bytes.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Reprezentace surových binárních dat. Rozdíly mezi neměnným bytes a měnitelným bytearray.",
                    compare: "Ekvivalent k byte[] v Javě. Zásadní pro síťovou komunikaci a zpracování souborových formátů."
                },
                {
                    title: "Práce se soubory (binární/textové)",
                    path: "vyuka_downloaded/materialy/python/files/basics.html",
                    diff: "basics",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Správné režimy otevírání ('r', 'w', 'rb', 'wb') a buffering.",
                    compare: "V textovém režimu Python automaticky překládá konce řádků (\\\\\\\\r\\\\\\\\n -> \\\\\\\\n). V binárním režimu čte surová data bez úprav."
                },
                {
                    title: "Modul pathlib (cesty)",
                    path: "vyuka_downloaded/materialy/python/files/pathlib.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Core", "WOW"],
                    desc: "Moderní objektová reprezentace cest v souborovém systému.",
                    compare: "Nahrazuje staré Céčkovské funkce z modulu os.path. Používá přetížený operátor '/' pro spojování cest: 'cesta / \\\\"
                },
                {
                    title: "Mapování souborů do paměti (mmap)",
                    path: "vyuka_downloaded/materialy/python/files/mmap.html",
                    diff: "newconcept",
                    relevance: 7,
                    tags: ["WOW"],
                    desc: "Nízkoúrovňové namapování souboru přímo do virtuální paměti procesu.",
                    compare: "Ekvivalent k MappedByteBuffer v Javě. Umožňuje manipulovat s gigabajtovými soubory s minimální režií a bez načítání celého obsahu do RAM."
                },
                {
                    title: "Příkazová řádka (argparse)",
                    path: "vyuka_downloaded/materialy/python/cmd/argparse.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Parsování parametrů a přepínačů předaných skriptu z terminálu.",
                    compare: "Standardní knihovna pro tvorbu profesionálních CLI utilit s automatickým generováním nápovědy --help."
                }
            ],
            exercises: [
                {
                    title: "Zpracování PNM obrázků",
                    path: "vyuka_downloaded/priklady/media/pnm.html",
                    diff: "resyntax",
                    relevance: 7,
                    tags: ["Tricky"],
                    desc: "Načítání a zápis grafických formátů PBM, PGM, PPM jako binárních souborů.",
                    compare: "Praktická zkouška práce s binárními daty (bytes) a převádění čísel."
                }
            ]
        },
        {
            week: 9,
            title: "NumPy & Vektorizace",
            description: "Vysoce výkonné vědecké výpočty. Vícerozměrná homogenní pole, mechanismus broadcasting, pokročilé řezy a JIT kompilátor Numba.",
            lectures: [
                {
                    title: "Úvod do NumPy",
                    path: "vyuka_downloaded/materialy/python/numpy/overview.html",
                    diff: "newconcept",
                    relevance: 9,
                    tags: ["Legendary"],
                    desc: "Tvorba a vlastnosti homogenních polí ndarray. Rychlostní srovnání s čistým Pythonem.",
                    compare: "Python smyčky jsou pomalé kvůli dynamickému typování. NumPy přesouvá cykly do kompilovaných C/Fortran knihoven pod kapotou."
                },
                {
                    title: "Broadcasting",
                    path: "vyuka_downloaded/materialy/python/numpy/broadcasting.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["WOW"],
                    desc: "Jak NumPy provádí matematické operace mezi poli s různými dimenzemi.",
                    compare: "Umožňuje přičíst jednorozměrný vektor ke každému řádku matice bez nutnosti psát cykly for."
                },
                {
                    title: "Vektorizace a řezy v NumPy",
                    path: "vyuka_downloaded/materialy/python/numpy/vectorization.html",
                    diff: "newconcept",
                    relevance: 9,
                    tags: ["Legendary"],
                    desc: "Nahrazování explicitních cyklů vektorovými zápisy a pokročilá práce s indexováním (řezy).",
                    compare: "Klíč k efektivnímu psaní v NumPy. Namísto procházení prvků matice v cyklech provedeme operaci nad celým objektem naráz."
                },
                {
                    title: "Optimalizace a Numba JIT",
                    path: "vyuka_downloaded/materialy/python/speed/numba.html",
                    diff: "newconcept",
                    relevance: 6,
                    tags: ["Tricky"],
                    desc: "Kompilace Python kódu do strojového kódu za běhu pomocí LLVM compileru.",
                    compare: "Dekorátor @jit z knihovny Numba zrychlí kritické matematické výpočty na úroveň čistého C++."
                }
            ],
            exercises: [
                {
                    title: "Maticová grafika",
                    path: "vyuka_downloaded/priklady/media/grafika.2.html",
                    diff: "newconcept",
                    relevance: 7,
                    tags: ["Legendary"],
                    desc: "Realizace grafických transformací (rotace, oříznutí, změna barev) pomocí NumPy polí.",
                    compare: "Operace na maticích reprezentujících obrázky."
                },
                {
                    title: "Steganografie (Skrytí dat)",
                    path: "vyuka_downloaded/priklady/media/steganografie.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Tricky"],
                    desc: "Zápis tajné textové zprávy do nejméně významných bitů (LSB) pixelů obrázku.",
                    compare: "Kombinuje práci s NumPy poli, Pillow knihovnou a bitovými operacemi."
                }
            ]
        },
        {
            week: 10,
            title: "Pandas — Analýza dat",
            description: "Zpracování tabulkových dat v paměti. Práce s DataFrame a Series, načítání strukturovaných souborů (CSV, Excel) a aggregace dat.",
            lectures: [
                {
                    title: "Pandas - úvod",
                    path: "vyuka_downloaded/materialy/python/pandas/overview.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Základní datové struktury Series (sloupec) a DataFrame (tabulka). Indexování a filtrace.",
                    compare: "Ekvivalent k relační SQL tabulce přímo v operační paměti. V Javě/C++ byste pro analýzu tabulkových dat museli psát obrovské množství kódu pro parsování a agregaci."
                },
                {
                    title: "Příklad - Klementinum",
                    path: "vyuka_downloaded/materialy/python/pandas/example-1.html",
                    diff: "newconcept",
                    relevance: 7,
                    tags: ["Legendary"],
                    desc: "Analýza historických teplotních měření v pražském Klementinu.",
                    compare: "Praktická ukázka agregací, průměrování a vyhledávání extrémů v datové sadě o tisících řádků."
                }
            ],
            exercises: [
            ]
        },
        {
            week: 11,
            title: "Testování, Ladění & SQL",
            description: "Psaní spolehlivého kódu. Testovací framework unittest, měření výkonnosti timeit, profilování cProfile, práce s SQLite a regulární výrazy.",
            lectures: [
                {
                    title: "Unit-testy (unittest)",
                    path: "vyuka_downloaded/materialy/python/testing/unittests.html",
                    diff: "resyntax",
                    relevance: 9,
                    tags: ["Core"],
                    desc: "Definice testovacích tříd, assert metod a testovacích přípravků (setUp, tearDown).",
                    compare: "Modul unittest je přímo inspirován Java frameworkem JUnit."
                },
                {
                    title: "Měření času (timeit) & cProfile",
                    path: "vyuka_downloaded/materialy/python/testing/timeit.html",
                    diff: "resyntax",
                    relevance: 8,
                    tags: ["WOW"],
                    desc: "Měření malých kousků kódu bez režie systému a kompletní profilování procesů.",
                    compare: "cProfile vytvoří statistiku volání funkcí a času v nich stráveného, což odhalí úzká hrdla programu."
                },
                {
                    title: "Vestavěná databáze SQLite",
                    path: "vyuka_downloaded/materialy/python/db/sqlite.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Práce s transakční SQL databází SQLite integrovanou přímo v standardní knihovně Pythonu.",
                    compare: "Ekvivalent k JDBC připojení k SQLite. V Pythonu nepotřebujete stahovat žádné externí JAR knihovny, stačí 'import sqlite3'."
                },
                {
                    title: "Regulární výrazy v Pythonu",
                    path: "vyuka_downloaded/materialy/python/regexps/overview.html",
                    diff: "basics",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Vyhledávání a nahrazování textových vzorů pomocí modulu re.",
                    compare: "Shodná syntaxe regulárních výrazů jako v Javě/C++, ale s mnohem čistším rozhraním (re.search, re.findall)."
                },
                {
                    title: "Matplotlib (Grafy)",
                    path: "vyuka_downloaded/materialy/python/pypi/MatPlotLib.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Legendary"],
                    desc: "Vykreslování vědeckých grafů, histogramů a vizualizací dat.",
                    compare: "Představuje standard pro vědecké publikace v Pythonu. Podobné jako kreslení grafů v Matlabu."
                }
            ],
            exercises: [
                {
                    title: "Náhoda a pravděpodobnost",
                    path: "vyuka_downloaded/priklady/python/procvicovani.pstnost.html",
                    diff: "basics",
                    relevance: 6,
                    tags: ["Skip"],
                    desc: "Jednoduché simulace náhodných jevů pomocí modulu random.",
                    compare: "Simulace hodů kostkou, generování náhodných distribucí."
                }
            ]
        },
        {
            week: 12,
            title: "Systémová interakce & FFI",
            description: "Spouštění externích programů z Pythonu a propojení s nativními knihovnami napsanými v C/C++.",
            lectures: [
                {
                    title: "Spouštění procesů (subprocess)",
                    path: "vyuka_downloaded/materialy/python/cmd/execution_subprocess.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Core"],
                    desc: "Náhrada za staré os.system(). Bezpečné spouštění příkazů, zachytávání stdout/stderr a roury.",
                    compare: "Ekvivalent k Java ProcessBuilder a C fork/exec. Modul subprocess.run() poskytuje velmi bezpečné a robustní rozhraní."
                },
                {
                    title: "FFI a modul ctypes",
                    path: "vyuka_downloaded/materialy/python/externalibs/overview.html",
                    diff: "newconcept",
                    relevance: 6,
                    tags: ["Tricky"],
                    desc: "Načítání sdílených C knihoven (.dll/.so) a volání jejich funkcí přímo z Pythonu.",
                    compare: "Mnohem jednodušší a méně ukecané rozhraní než Java JNI (Java Native Interface)."
                },
                {
                    title: "Cython - kompilace do C",
                    path: "vyuka_downloaded/materialy/python/cython/overview.html",
                    diff: "newconcept",
                    relevance: 6,
                    tags: ["Tricky"],
                    desc: "Psaní modulů v hybridním jazyce kombinujícím Python a C, které se kompilují přímo na nativní kód.",
                    compare: "Umožňuje psát rychlostí C++ za použití Python syntaxe. Využívá se pro tvorbu knihoven jako NumPy a Pandas."
                }
            ],
            exercises: [
            ]
        },
        {
            week: 13,
            title: "Bonus: Přednášky PLUS & Pokročilé",
            description: "Metatřídy, asynchronní programování, korutiny, funkcionální Python a odpočinkové L-systémy.",
            lectures: [
                {
                    title: "Abstract Base Classes (ABCs)",
                    path: "vyuka_downloaded/materialy/python/objects/ABCs.html",
                    diff: "resyntax",
                    relevance: 7,
                    tags: ["WOW"],
                    desc: "Definování abstraktních tříd a rozhraní pomocí modulu abc.",
                    compare: "Ekvivalent k Java interface nebo pure virtual třídám v C++."
                },
                {
                    title: "Metatřídy (Metaclasses)",
                    path: "vyuka_downloaded/materialy/python/objects/meta.html",
                    diff: "newconcept",
                    relevance: 5,
                    tags: ["Tricky"],
                    desc: "Představení konceptu, kdy třída sama je instancí metatřídy, a jak toho využít pro metaprogramování.",
                    compare: "Metatřídy umožňují měnit chování při vytváření tříd (např. automaticky registrovat pluginy). Java nic podobného nemá."
                },
                {
                    title: "Asynchronní Python & Korutiny",
                    path: "vyuka_downloaded/materialy/python/generators/coroutines.html",
                    diff: "newconcept",
                    relevance: 7,
                    tags: ["Legendary"],
                    desc: "Použití generátorů pro asynchronní předávání řízení, odesílání dat do korutin pomocí send().",
                    compare: "Základní nízkoúrovňový mechanismus pro event-loop a asynchronní programování (async/await)."
                },
                {
                    title: "Funkcionální Python (itertools)",
                    path: "vyuka_downloaded/materialy/python/fp.html",
                    diff: "resyntax",
                    relevance: 6,
                    tags: ["WOW"],
                    desc: "Práce s nekonečnými iterátory a funkcionálními konstrukcemi z modulů itertools a functools.",
                    compare: "Elegantní funkcionální doplňky. Itertools nabízí funkce jako chain, cycle, groupby, což zjednodušuje složité algoritmy."
                },
                {
                    title: "Záludnosti v Pythonu (Pitfalls)",
                    path: "vyuka_downloaded/materialy/python/pitfalls.html",
                    diff: "pythonic",
                    relevance: 9,
                    tags: ["Core", "Legendary"],
                    desc: "Pasti na začátečníky: mutable default arguments (výchozí hodnoty parametrů), zastiňování proměnných atd.",
                    compare: "Kritické vědět! Např. 'def foo(x=[])' vyhodnotí prázdný seznam pouze jednou při definici funkce, nikoliv při každém volání."
                }
            ],
            exercises: [
                {
                    title: "L-systémy a želví grafika",
                    path: "vyuka_downloaded/materialy/techs/L-systems/overview.html",
                    diff: "newconcept",
                    relevance: 7,
                    tags: ["Legendary"],
                    desc: "Generování fraktálů a rostlinných struktur pomocí paralelního přepisování a kreslení želvou.",
                    compare: "Velmi zajímavé vizuální cvičení kombinující gramatiky a grafiku."
                },
                {
                    title: "Brainfuck Interpreter",
                    path: "vyuka_downloaded/materialy/brainfuck/overview.html",
                    diff: "newconcept",
                    relevance: 8,
                    tags: ["Tricky"],
                    desc: "Implementace kompletního interpretru pro minimalistický ezoterní jazyk Brainfuck.",
                    compare: "Skvělé cvičení na pointery, pásku a řízení toku programu."
                }
            ]
        }
    ];
