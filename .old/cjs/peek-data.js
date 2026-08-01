window.PEEK_DATA = {
  "global": {
    "type": "syntax",
    "title": "Klíčové slovo: global",
    "desc": "Říká Pythonu, že proměnná se má hledat a upravovat v globálním (modulovém) oboru viditelnosti, nikoli v lokálním.",
    "old_code": "// Java / C++\nint x = 10;\nvoid foo() {\n    x = 20; // Změna globální proměnné\n}",
    "new_code": "# Python\nx = 10\ndef foo():\n    global x\n    x = 20 # Změna globální proměnné"
  },
  "nonlocal": {
    "type": "concept",
    "title": "Klíčové slovo: nonlocal",
    "desc": "Umožňuje upravovat proměnné v nejbližším nadřazeném (uzavírajícím) oboru viditelnosti, který není globální (closure).",
    "reason": "V Pythonu každé přiřazení (např. x = 5) uvnitř funkce automaticky vytváří novou lokální proměnnou, čímž zastíní vnější proměnné pro zápis.",
    "workaround": "Deklarací 'nonlocal x' řekneme Pythonu, aby zapisoval do proměnné z vyššího lexikálního oboru."
  },
  "def": {
    "type": "paradigm",
    "title": "Klíčové slovo: def",
    "desc": "Klíčové slovo 'def' je imperativní příkaz, který definuje a sváže objekt funkce za běhu programového kódu.",
    "old_mental": "Metody a funkce jsou statické struktury zavedené kompilátorem před vlastním spuštěním programu (Java / C++).",
    "new_mental": "Funkce je dynamický objekt vytvořený za běhu. Příkaz 'def' se provádí za běhu a může být např. uvnitř podmínky."
  },
  "lambda": {
    "type": "syntax",
    "title": "Klíčové slovo: lambda",
    "desc": "Slouží k rychlému vytvoření anonymních jednořádkových funkcí, které mohou obsahovat pouze jediný výraz.",
    "old_code": "// Java lambda expression\nFunction<Integer, Integer> sq = x -> x * x;",
    "new_code": "# Python lambda\nsq = lambda x: x * x"
  },
  "import": {
    "type": "paradigm",
    "title": "Klíčové slovo: import",
    "desc": "Příkaz 'import' vyhledá, zkompiluje, spustí modul a sváže jej do jmenného prostoru.",
    "old_mental": "#include v C++ kopíruje text souboru, import v Javě je pouze alias, který usnadňuje psaní plných názvů tříd.",
    "new_mental": "Import je plnohodnotný spustitelný kód vykonávaný za běhu. Spustí se při prvním načtení a výsledný modul se cachuje."
  },
  "yield": {
    "type": "concept",
    "title": "Klíčové slovo: yield",
    "desc": "Přemění funkci na generátor — volání vrací iterátor, který produkuje hodnoty líně (lazy), jedna po druhé.",
    "reason": "V C++/Javě neexistuje přímý ekvivalent — nejbližší jsou coroutines (C++20) nebo StreamAPI. Výhodou yield je minimální spotřeba paměti.",
    "workaround": "Použijte 'yield hodnota' uvnitř funkce místo 'return'. Generátor si pamatuje stav mezi voláními, takže může vytvářet nekonečné sekvence."
  },
  "with": {
    "type": "syntax",
    "title": "Klíčové slovo: with",
    "desc": "Správce kontextu — garantuje volání __enter__ a __exit__ bez ohledu na výjimky (analogie RAII v C++).",
    "old_code": "// C++ RAII\n{\n    std::ifstream f(\"data.txt\");\n    // f se zavře automaticky\n} // destruktor",
    "new_code": "# Python\nwith open('data.txt') as f:\n    data = f.read()\n# soubor je zavřen automaticky"
  },
  "class": {
    "type": "syntax",
    "title": "Klíčové slovo: class",
    "desc": "Definuje třídu — šablonu pro objekty. Python třídy jsou dynamické; atributy lze přidávat za běhu.",
    "old_code": "// Java\npublic class Animal {\n    String name;\n    Animal(String n) { name = n; }\n    void speak() { System.out.println(name); }\n}",
    "new_code": "# Python\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        print(self.name)"
  },
  "self": {
    "type": "paradigm",
    "title": "Konvence: self",
    "desc": "'self' je explicitní odkaz na instanci — Python jej nepředává skrytě jako 'this' v Javě/C++.",
    "old_mental": "V Javě/C++ 'this' je implicitní ukazatel na instanci, nemusí se psát jako parametr metody.",
    "new_mental": "V Pythonu je 'self' první explicitní parametr každé metody. Je to konvence, nikoli vyhrazené slovo — lze použít libovolné jméno."
  },
  "None": {
    "type": "paradigm",
    "title": "Hodnota: None",
    "desc": "'None' je jediný objekt typu NoneType — analogie null v Javě nebo nullptr v C++, ale typově bezpečnější.",
    "old_mental": "null v Javě není objekt — volání metody na null vyvolá NullPointerException. nullptr v C++ je nulový ukazatel.",
    "new_mental": "None je plnohodnotný objekt, nikoli nulový ukazatel. Test 'x is None' je idiomatičtější než 'x == None'."
  },
  "is": {
    "type": "concept",
    "title": "Operátor: is",
    "desc": "'is' testuje identitu objektu (stejný objekt v paměti), ne rovnost hodnoty jako '=='.",
    "reason": "Záměna 'is' a '==' je časté chyba. 'is None' je správně, 'is 42' nebo 'is \"text\"' funguje jen náhodně díky interning.",
    "workaround": "Používejte 'is' pouze pro None, True, False a explicitně interned objekty. Pro porovnání hodnot vždy '=='."
  },
  "in": {
    "type": "syntax",
    "title": "Operátor: in",
    "desc": "'in' testuje členství v kolekci nebo slouží jako iterační operátor ve for-cyklu.",
    "old_code": "// Java\nfor (String s : list) { ... }\nlist.contains(\"x\");",
    "new_code": "# Python\nfor s in seznam:\n    ...\n'x' in seznam  # True/False"
  },
  "try": {
    "type": "syntax",
    "title": "Blok: try / except",
    "desc": "Python výjimky jsou řízeny bloky try/except/else/finally — bez checked exceptions jako v Javě.",
    "old_code": "// Java\ntry {\n    risky();\n} catch (IOException e) {\n    System.err.println(e);\n} finally {\n    cleanup();\n}",
    "new_code": "# Python\ntry:\n    risky()\nexcept OSError as e:\n    print(e)\nelse:\n    print('OK')  # jen pokud nebyla výjimka\nfinally:\n    cleanup()"
  },
  "except": {
    "type": "paradigm",
    "title": "Blok: except",
    "desc": "Python nemá checked exceptions — jakákoliv výjimka může být zachycena kdykoliv, bez deklarace v signatuře funkce.",
    "old_mental": "Java vyžaduje deklarovat checked výjimky v signatuře metody (throws IOException). Kompilátor to vynucuje.",
    "new_mental": "Python výjimky jsou vždy unchecked. Ignorování výjimky je tichá chyba — zachycujte co nejspecifičtěji."
  },
  "pass": {
    "type": "concept",
    "title": "Klíčové slovo: pass",
    "desc": "'pass' je prázdný příkaz — udržuje syntakticky vyžadovaný blok, aniž by cokoliv provedl.",
    "reason": "Python vyžaduje odsazený blok po 'if', 'for', 'def', 'class' atd. Prázdný blok je syntaktická chyba.",
    "workaround": "Napište 'pass' jako zástupný symbol při vývoji. Alternativa: použijte '...' (Ellipsis objekt) jako placeholder."
  },
  "venv": {
    "type": "syntax",
    "title": "Koncept: Virtuální prostředí (venv)",
    "desc": "Vytvoří izolované prostředí pro Python projekt, aby se závislosti nemíchaly globálně.",
    "old_code": "// Java (Maven) / C++ (vcpkg)\n// Závislosti se často řeší globálně nebo v rámci build toolu v kořeni projektu.\nmvn clean install",
    "new_code": "# Python\n# Vytvoří složku 'env' se zkopírovaným interpretem\npython -m venv env\n# Aktivace změní PATH pro aktuální shell\nsource env/bin/activate"
  },
  "pip": {
    "type": "syntax",
    "title": "Nástroj: pip",
    "desc": "Standardní správce balíčků, který instaluje závislosti z repozitáře PyPI.",
    "old_code": "// Java: Přidání do pom.xml\n<dependency>\n    <groupId>org.requests</groupId>\n    <artifactId>requests</artifactId>\n</dependency>",
    "new_code": "# Python: Instalace přímo z terminálu\npip install requests\n# Nebo ze souboru requirements.txt\npip install -r requirements.txt"
  },
  "conda": {
    "type": "syntax",
    "title": "Nástroj: Conda",
    "desc": "Komplexní správce prostředí i balíčků (často s binárními knihovnami), oblíbený ve vědeckých výpočtech.",
    "old_code": "// Conda je spíše jako systémový balíčkovač (apt, brew)\n// kombinovaný s virtuálním prostředím.",
    "new_code": "# Python (Conda)\nconda create --name env_name python=3.9\nconda activate env_name\nconda install numpy"
  },
  "LEGB": {
    "type": "syntax",
    "title": "Pravidlo: LEGB (Scope)",
    "desc": "Python prohledává jména v pořadí: Local, Enclosing, Global, Built-in. Bloky jako 'if' nebo 'for' nevytvářejí nový obor viditelnosti!",
    "old_code": "// Java / C++: Blokový scope\nif (true) {\n    int x = 10;\n}\nSystem.out.println(x); // CHYBA kompilace: x neexistuje",
    "new_code": "# Python: Funkční scope\nif True:\n    x = 10\nprint(x) # 10 (proměnná x stále existuje)"
  },
  "first-class": {
    "type": "syntax",
    "title": "Koncept: First-class functions",
    "desc": "Funkce lze v Pythonu přiřadit do proměnné, předat jako argument nebo vrátit z jiné funkce.",
    "old_code": "// Java (před verzí 8 a lambdami):\n// Musel se předávat objekt implementující interface\nCollections.sort(list, new Comparator<Integer>() {\n    public int compare(Integer a, Integer b) { return a - b; }\n});",
    "new_code": "# Python\ndef my_sort_key(x):\n    return x % 2\n\n# Funkce je objekt, stačí předat její jméno\nseznam.sort(key=my_sort_key)"
  },
  "typing": {
    "type": "syntax",
    "title": "Modul: typing (Type hints)",
    "desc": "Nepovinné anotace typů, které slouží jen pro vývojáře a linter (např. mypy), ale interpret je za běhu ignoruje.",
    "old_code": "// Java / C++ (Statické typování vynucené kompilátorem)\nint add(int a, int b) {\n    return a + b;\n}",
    "new_code": "# Python (Dynamické typování s volitelnými hinty)\ndef add(a: int, b: int) -> int:\n    return a + b\n\nadd(\"a\", \"b\") # Interpret to za běhu povolí!"
  }
};
