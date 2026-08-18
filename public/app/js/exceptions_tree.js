/**
 * newpyt — Standard Python Exceptions Tree & Metadata
 * Full hierarchy with practical programmer categorization tags and concise Czech explanations.
 */

export const EXCEPTION_TAGS = {
  flow: { label: "⚙️ Řízení toku (Očekávané)", class: "pill-flow", desc: "Očekávané ukončení cyklu nebo iterátoru — není to chyba" },
  bug: { label: "🐛 Chyba v kódu (Opravit kód)", class: "pill-bug", desc: "Chybná logika, překlep nebo chybějící podmínka" },
  guard: { label: "🛡️ Potřeba robustnosti (Guard / Try-except)", class: "pill-guard", desc: "Závisí na vnějším vstupu, souboru či síti — nutno ošetřit" },
  sys: { label: "⚡ Vnější zásah / OS", class: "pill-sys", desc: "Zásah uživatele (Ctrl+C), ukončení procesu nebo systémová chyba" },
  warn: { label: "⚠️ Varování (Nekritické)", class: "pill-warn", desc: "Informativní varování, nezpůsobí pád programu" },
  base: { label: " Kořenová / Bázová třída", class: "pill-base", desc: "Společný předek pro hierarchické zachytávání" }
};

export const EXCEPTION_TREE_DATA = {
  name: "BaseException",
  tag: "sys",
  tagLabel: "⚡ Systémový kořen",
  meaning: "Nejvyšší kořenová třída všech výjimek v Pythonu.",
  children: [
    {
      name: "BaseExceptionGroup",
      tag: "sys",
      tagLabel: "⚡ Skupina výjimek (Python 3.11+)",
      meaning: "Skupina současně vzniklých výjimek dědících z BaseException (pro task groups v asyncio).",
      children: []
    },
    {
      name: "GeneratorExit",
      tag: "flow",
      tagLabel: "⚙️ Řízení toku (Očekávané)",
      meaning: "Vyvolána uvnitř generátoru při volání jeho metody close() pro uvolnění prostředků.",
      children: []
    },
    {
      name: "KeyboardInterrupt",
      tag: "sys",
      tagLabel: "⚡ Vnější zásah (Neopravitelné kódem)",
      meaning: "Vyvolána, když uživatel stiskne klávesovou zkratku přerušení programu (obvykle Ctrl+C).",
      children: []
    },
    {
      name: "SystemExit",
      tag: "sys",
      tagLabel: "⚡ Ukončení procesu (Očekávané)",
      meaning: "Vyvolána funkcí sys.exit() při požadavku na standardní ukončení procesu.",
      children: []
    },
    {
      name: "Exception",
      tag: "base",
      tagLabel: " Kořen běžných výjimek",
      meaning: "Bázová třída pro všechny nefatální chyby; doporučený předek pro vlastní výjimky i obecné try-except.",
      children: [
        {
          name: "ArithmeticError",
          tag: "base",
          tagLabel: " Aritmetika",
          meaning: "Společná nadtřída pro numerické a matematické chyby výpočtu.",
          children: [
            {
              name: "FloatingPointError",
              tag: "bug",
              tagLabel: "🐛 Chyba v kódu / HW",
              meaning: "Chyba operace v plovoucí řádové čárce (pokud je hardwarem/OS hlášena).",
              children: []
            },
            {
              name: "OverflowError",
              tag: "guard",
              tagLabel: "🛡️ Přetečení limitu",
              meaning: "Výsledek matematické operace překročil maximální rozsah číselné reprezentace (např. u float).",
              children: []
            },
            {
              name: "ZeroDivisionError",
              tag: "bug",
              tagLabel: "🐛 Dělení nulou (Chyba v kódu)",
              meaning: "Dělení nebo modulo nulou (1 / 0 nebo 10 % 0). Řešení: ošetřit vstupní jmenovatel.",
              children: []
            }
          ]
        },
        {
          name: "AssertionError",
          tag: "bug",
          tagLabel: "🐛 Neplatný předpoklad (Assert)",
          meaning: "Příkaz assert vyhodnotil podmínku jako False (neplatný vnitřní předpoklad programu).",
          children: []
        },
        {
          name: "AttributeError",
          tag: "bug",
          tagLabel: "🐛 Neexistující atribut / metoda",
          meaning: "Objekt nemá požadovaný atribut nebo metodu (např. 'str' object has no attribute 'append').",
          children: []
        },
        {
          name: "BufferError",
          tag: "sys",
          tagLabel: "⚡ Nízká úroveň / Paměť",
          meaning: "Nízkoúrovňová operace s vyrovnávací pamětí (buffer protocol) selhala.",
          children: []
        },
        {
          name: "EOFError",
          tag: "guard",
          tagLabel: "🛡️ Konec vstupu",
          meaning: "Funkce input() narazila na konec vstupního streamu (End-Of-File) bez přečtení dat.",
          children: []
        },
        {
          name: "ExceptionGroup",
          tag: "base",
          tagLabel: " Skupina výjimek (Python 3.11+)",
          meaning: "Skupina výjimek dědících z Exception; obsluhuje se pomocí syntaxe except*.",
          children: []
        },
        {
          name: "ImportError",
          tag: "bug",
          tagLabel: "🐛 Chyba při importu",
          meaning: "Příkaz import nebo from ... import selhal při načítání modulu nebo objektu.",
          children: [
            {
              name: "ModuleNotFoundError",
              tag: "bug",
              tagLabel: "🐛 Modul nenalezen (Chybí instalace)",
              meaning: "Hledaný modul nebyl nalezen v sys.path (např. chybí 'pip install <balíček>').",
              children: []
            }
          ]
        },
        {
          name: "LookupError",
          tag: "base",
          tagLabel: " Chyba vyhledání v kolekci",
          meaning: "Společný předek pro chyby při vyhledávání klíče či indexu v sekvenci nebo mapování.",
          children: [
            {
              name: "IndexError",
              tag: "bug",
              tagLabel: "🐛 Index mimo rozsah",
              meaning: "Index v sekvenci (list, tuple, str) je mimo platný rozsah (např. xs[10] pro 3prvkový seznam).",
              children: []
            },
            {
              name: "KeyError",
              tag: "guard",
              tagLabel: "🛡️ Neexistující klíč (Použít .get())",
              meaning: "Zadaný klíč nebyl ve slovníku nalezen. Řešení: použít d.get(key, default) nebo 'if key in d:'.",
              children: []
            }
          ]
        },
        {
          name: "MemoryError",
          tag: "sys",
          tagLabel: "⚡ Vyčerpána RAM (Neopravitelné)",
          meaning: "Operační paměť je vyčerpána a interpret Pythonu nemůže alokovat další objekt.",
          children: []
        },
        {
          name: "NameError",
          tag: "bug",
          tagLabel: "🐛 Neznámá proměnná / funkce",
          meaning: "Pokus o přístup k neexistující lokální nebo globální proměnné (překlep ve jménu, chybějící definice).",
          children: [
            {
              name: "UnboundLocalError",
              tag: "bug",
              tagLabel: "🐛 Proměnná před přiřazením",
              meaning: "Čtení lokální proměnné uvnitř funkce dříve, než do ní byla v této funkci přiřazena hodnota.",
              children: []
            }
          ]
        },
        {
          name: "OSError",
          tag: "guard",
          tagLabel: "🛡️ Systémová / Souborová chyba",
          meaning: "Společná nadtřída pro chyby operačního systému, souborů a síťové komunikace.",
          children: [
            {
              name: "BlockingIOError",
              tag: "guard",
              tagLabel: "🛡️ Neblokující I/O",
              meaning: "Operace na neblokujícím socketu nebo streamu by způsobila zablokování běhu.",
              children: []
            },
            {
              name: "ChildProcessError",
              tag: "sys",
              tagLabel: "⚡ Chyba podprocesu",
              meaning: "Operace s dceřiným podprocesem (child process) selhala.",
              children: []
            },
            {
              name: "ConnectionError",
              tag: "guard",
              tagLabel: "🛡️ Chyba síťového spojení",
              meaning: "Společná nadtřída pro výpadky a problémy síťového připojení.",
              children: [
                {
                  name: "BrokenPipeError",
                  tag: "guard",
                  tagLabel: "🛡️ Uzavřená roura / Socket",
                  meaning: "Zápis do síťového socketu nebo roury, jejíž protější konec byl už uzavřen.",
                  children: []
                },
                {
                  name: "ConnectionAbortedError",
                  tag: "guard",
                  tagLabel: "🛡️ Přerušené spojení",
                  meaning: "Navázané síťové spojení bylo přerušeno lokálním síťovým stackem.",
                  children: []
                },
                {
                  name: "ConnectionRefusedError",
                  tag: "guard",
                  tagLabel: "🛡️ Odmítnuté spojení (Server neběží)",
                  meaning: "Cílový server odmítl navázat spojení (na daném portu žádná služba neposlouchá).",
                  children: []
                },
                {
                  name: "ConnectionResetError",
                  tag: "guard",
                  tagLabel: "🛡️ Reset spojení protistranou",
                  meaning: "Existující spojení bylo vzdálenou protistranou násilně ukončeno (TCP RST).",
                  children: []
                }
              ]
            },
            {
              name: "FileExistsError",
              tag: "guard",
              tagLabel: "🛡️ Soubor již existuje",
              meaning: "Pokus o vytvoření souboru nebo adresáře s názvem, který již existuje (např. os.mkdir).",
              children: []
            },
            {
              name: "FileNotFoundError",
              tag: "guard",
              tagLabel: "🛡️ Soubor nenalezen",
              meaning: "Požadovaný soubor nebo složka nebyla nalezena. Doporučeno ověřit cestu před otevřením.",
              children: []
            },
            {
              name: "InterruptedError",
              tag: "sys",
              tagLabel: "⚡ Přerušeno signálem OS",
              meaning: "Systémové volání operačního systému bylo přerušeno příchozím signálem (EINTR).",
              children: []
            },
            {
              name: "IsADirectoryError",
              tag: "bug",
              tagLabel: "🐛 Záměna složky za soubor",
              meaning: "Byla požadována souborová operace (např. open() pro zápis) nad adresářem.",
              children: []
            },
            {
              name: "NotADirectoryError",
              tag: "bug",
              tagLabel: "🐛 Záměna souboru za složku",
              meaning: "Byla požadována adresářová operace (např. os.listdir) nad běžným souborem.",
              children: []
            },
            {
              name: "PermissionError",
              tag: "guard",
              tagLabel: "🛡️ Odepřen přístup (Práva OS)",
              meaning: "Nedostatečná přístupová oprávnění k souboru, složce nebo systémovému prostředku.",
              children: []
            },
            {
              name: "ProcessLookupError",
              tag: "guard",
              tagLabel: "🛡️ Proces podle PID nenalezen",
              meaning: "Požadovaný systémový proces podle zadaného PID neexistuje.",
              children: []
            },
            {
              name: "TimeoutError",
              tag: "guard",
              tagLabel: "🛡️ Vypršel časový limit (Timeout)",
              meaning: "Systémová či síťová operace překročila nastavený časový limit.",
              children: []
            }
          ]
        },
        {
          name: "ReferenceError",
          tag: "sys",
          tagLabel: "⚡ Slabá reference GC",
          meaning: "Pokus o přístup k objektu přes slabý odkaz (weakref), který již byl uklizen garbage collectorem.",
          children: []
        },
        {
          name: "RuntimeError",
          tag: "bug",
          tagLabel: "🐛 Běhová chyba",
          meaning: "Obecná běhová chyba, která nespadá do žádné konkrétnější kategorie výjimek.",
          children: [
            {
              name: "NotImplementedError",
              tag: "bug",
              tagLabel: "🐛 Neimplementováno (TODO)",
              meaning: "Abstraktní metoda nebo rozhraní nebylo v odvozené třídě doimplementováno.",
              children: []
            },
            {
              name: "PythonFinalizationError",
              tag: "sys",
              tagLabel: "⚡ Chyba při ukončování",
              meaning: "Chyba nastala během závěrečné fáze ukončování (shutdown) interpretu Pythonu.",
              children: []
            },
            {
              name: "RecursionError",
              tag: "bug",
              tagLabel: "🐛 Nekonečná rekurze",
              meaning: "Překročení maximální povolené hloubky rekurzivních volání (chybí bázová podmínka).",
              children: []
            }
          ]
        },
        {
          name: "StopAsyncIteration",
          tag: "flow",
          tagLabel: "⚙️ Řízení toku (Konec asynchronní smyčky)",
          meaning: "Signalizuje ukončení asynchronního iterátoru metodou __anext__().",
          children: []
        },
        {
          name: "StopIteration",
          tag: "flow",
          tagLabel: "⚙️ Řízení toku (Konec smyčky for)",
          meaning: "Signalizuje vyčerpání prvků v synchronním iterátoru voláním next(). Řídí běh cyklu for.",
          children: []
        },
        {
          name: "SyntaxError",
          tag: "bug",
          tagLabel: "🐛 Syntaktická chyba (Chyba v kódu)",
          meaning: "Chyba syntaxe zjištěná parserem ještě před samotným spuštěním kódu.",
          children: [
            {
              name: "IndentationError",
              tag: "bug",
              tagLabel: "🐛 Chyba v odsazení",
              meaning: "Chybné odsazení bloku kódu (např. po dvojtečce chybí 4 mezery).",
              children: [
                {
                  name: "TabError",
                  tag: "bug",
                  tagLabel: "🐛 Mix mezer a tabulátorů",
                  meaning: "Nekonzistentní míchání tabulátorů a mezer v odsazení řádků.",
                  children: []
                }
              ]
            }
          ]
        },
        {
          name: "SystemError",
          tag: "sys",
          tagLabel: "⚡ Interní chyba interpretu",
          meaning: "Vnitřní systémová chyba interpretu CPythonu nebo chyba v C-rozšíření.",
          children: []
        },
        {
          name: "TypeError",
          tag: "bug",
          tagLabel: "🐛 Nekompatibilní datový typ",
          meaning: "Operace nebo funkce byla zavolána s objektem nevhodného typu (např. 'a' + 5 nebo len(123)).",
          children: []
        },
        {
          name: "ValueError",
          tag: "guard",
          tagLabel: "🛡️ Neplatná hodnota argumentu",
          meaning: "Argument má správný datový typ, ale neplatnou hodnotu (např. int('necislo') nebo math.sqrt(-1)).",
          children: [
            {
              name: "UnicodeError",
              tag: "guard",
              tagLabel: "🛡️ Chyba kódování textu",
              meaning: "Bázová třída pro chyby při kódování nebo dekódování Unicode řetězců.",
              children: [
                {
                  name: "UnicodeDecodeError",
                  tag: "guard",
                  tagLabel: "🛡️ Chyba dekódování bajtů",
                  meaning: "Bajtovou sekvenci nelze dekódovat na text (např. čtení Windows-1250 souboru jako UTF-8).",
                  children: []
                },
                {
                  name: "UnicodeEncodeError",
                  tag: "guard",
                  tagLabel: "🛡️ Chyba kódování do bajtů",
                  meaning: "Znak nelze převést do cílového formátu bajtů (např. český znak v ASCII kódování).",
                  children: []
                },
                {
                  name: "UnicodeTranslateError",
                  tag: "guard",
                  tagLabel: "🛡️ Chyba překladu znaku",
                  meaning: "Znak nelze přeložit v tabulce znakových translací.",
                  children: []
                }
              ]
            }
          ]
        },
        {
          name: "Warning",
          tag: "warn",
          tagLabel: "⚠️ Varování",
          meaning: "Základní třída pro varovná hlášení (nekritická, standardně nezpůsobí pád programu).",
          children: [
            {
              name: "BytesWarning",
              tag: "warn",
              tagLabel: "⚠️ Varování: Bytes vs Str",
              meaning: "Varování při pochybném míchání binárních bajtů bytes a textových řetězců str.",
              children: []
            },
            {
              name: "DeprecationWarning",
              tag: "warn",
              tagLabel: "⚠️ Varování: Zastaralá funkce",
              meaning: "Varování před použitím zastaralé funkčnosti určené k budoucímu odstranění z Pythonu.",
              children: []
            },
            {
              name: "EncodingWarning",
              tag: "warn",
              tagLabel: "⚠️ Varování: Chybí encoding",
              meaning: "Varování před spoléháním se na implicitní kódování platformy (Python 3.10+).",
              children: []
            },
            {
              name: "FutureWarning",
              tag: "warn",
              tagLabel: "⚠️ Varování: Budoucí změna",
              meaning: "Varování pro koncové uživatele před plánovanou změnou chování funkce v budoucích verzích.",
              children: []
            },
            {
              name: "ImportWarning",
              tag: "warn",
              tagLabel: "⚠️ Varování: Import",
              meaning: "Varování při potenciálních potížích při vyhledávání nebo importování modulu.",
              children: []
            },
            {
              name: "PendingDeprecationWarning",
              tag: "warn",
              tagLabel: "⚠️ Varování: Budoucí zastarání",
              meaning: "Varování před konstrukcí, která bude v budoucích verzích prohlášena za deprecated.",
              children: []
            },
            {
              name: "ResourceWarning",
              tag: "warn",
              tagLabel: "⚠️ Varování: Neuvolněný prostředek",
              meaning: "Varování před neuzavřeným souborem, socketem nebo neuvolněným systémovým deskriptorem.",
              children: []
            },
            {
              name: "RuntimeWarning",
              tag: "warn",
              tagLabel: "⚠️ Varování: Běhové chování",
              meaning: "Varování před podezřelým chováním za běhu programu.",
              children: []
            },
            {
              name: "SyntaxWarning",
              tag: "warn",
              tagLabel: "⚠️ Varování: Podezřelá syntaxe",
              meaning: "Varování před podezřelou syntaktickou konstrukcí (např. použití 'is' s číselným literálem).",
              children: []
            },
            {
              name: "UnicodeWarning",
              tag: "warn",
              tagLabel: "⚠️ Varování: Unicode",
              meaning: "Varování týkající se manipulace s Unicode textem a kódováním.",
              children: []
            },
            {
              name: "UserWarning",
              tag: "warn",
              tagLabel: "⚠️ Uživatelské varování",
              meaning: "Obecné varování vyvolané uživatelským kódem pomocí modulu warnings.warn().",
              children: []
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Complete standard Python Exception Hierarchy formatted with color-coded category types and concise Czech meanings.
 */
export const EXCEPTION_ENTRIES = [
  { branch: "", name: "BaseException", typ: "Systém", cls: "typ-sys", desc: "Nejvyšší kořenová třída všech výjimek v Pythonu." },
  { branch: " +-- ", name: "BaseExceptionGroup", typ: "Systém", cls: "typ-sys", desc: "Skupina současně vzniklých výjimek (asyncio TaskGroup)." },
  { branch: " +-- ", name: "SystemExit", typ: "Ukončení", cls: "typ-sys", desc: "Standardní ukončení procesu funkcí sys.exit()." },
  { branch: " +-- ", name: "KeyboardInterrupt", typ: "Vnější zásah", cls: "typ-sys", desc: "Přerušení běhu uživatelem stiskem Ctrl+C." },
  { branch: " +-- ", name: "GeneratorExit", typ: "Řízení toku", cls: "typ-flow", desc: "Ukončení generátoru voláním generator.close()." },
  { branch: " +-- ", name: "Exception", typ: "Kořen chyb", cls: "typ-base", desc: "Bázová třída pro běžné chyby a obecný try-except." },
  { branch: "      +-- ", name: "StopIteration", typ: "Řízení toku", cls: "typ-flow", desc: "Konec synchronního iterátoru v next(); řídí cyklus for." },
  { branch: "      +-- ", name: "StopAsyncIteration", typ: "Řízení toku", cls: "typ-flow", desc: "Konec asynchronního iterátoru v async for." },
  { branch: "      +-- ", name: "ArithmeticError", typ: "Aritmetika", cls: "typ-base", desc: "Společná nadtřída pro numerické a matematické chyby." },
  { branch: "      |    +-- ", name: "FloatingPointError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Chyba operace v plovoucí řádové čárce." },
  { branch: "      |    +-- ", name: "OverflowError", typ: "Přetečení", cls: "typ-guard", desc: "Překročení maximálního rozsahu číselné reprezentace." },
  { branch: "      |    +-- ", name: "ZeroDivisionError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Dělení nebo modulo nulou (1 / 0 nebo 10 % 0)." },
  { branch: "      +-- ", name: "AssertionError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Příkaz assert vyhodnotil podmínku jako False." },
  { branch: "      +-- ", name: "AttributeError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Objekt nemá volaný atribut nebo metodu." },
  { branch: "      +-- ", name: "BufferError", typ: "Paměť", cls: "typ-sys", desc: "Nízkoúrovňová operace s vyrovnávací pamětí selhala." },
  { branch: "      +-- ", name: "EOFError", typ: "Vstup", cls: "typ-guard", desc: "input() narazil na konec vstupního streamu bez dat." },
  { branch: "      +-- ", name: "ExceptionGroup", typ: "Skupina chyb", cls: "typ-base", desc: "Skupina výjimek dědících z Exception (syntaxe except*)." },
  { branch: "      +-- ", name: "ImportError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Příkaz import selhal při načítání modulu nebo objektu." },
  { branch: "      |    +-- ", name: "ModuleNotFoundError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Modul nebyl nalezen v sys.path (chybí pip install)." },
  { branch: "      +-- ", name: "LookupError", typ: "Kolekce", cls: "typ-base", desc: "Společný předek pro chyby vyhledávání klíče či indexu." },
  { branch: "      |    +-- ", name: "IndexError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Index v sekvenci (list, tuple, str) je mimo meze." },
  { branch: "      |    +-- ", name: "KeyError", typ: "Robustnost", cls: "typ-guard", desc: "Klíč nebyl ve slovníku nalezen (použít .get() / try-except)." },
  { branch: "      +-- ", name: "MemoryError", typ: "Paměť", cls: "typ-sys", desc: "Vyčerpána paměť RAM; interpret nemůže alokovat objekt." },
  { branch: "      +-- ", name: "NameError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Přístup k nedefinované proměnné nebo funkci (překlep)." },
  { branch: "      |    +-- ", name: "UnboundLocalError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Čtení lokální proměnné před jejím přiřazením." },
  { branch: "      +-- ", name: "OSError", typ: "Systém", cls: "typ-guard", desc: "Společný předek pro chyby OS, souborů a síťové komunikace." },
  { branch: "      |    +-- ", name: "BlockingIOError", typ: "Robustnost", cls: "typ-guard", desc: "Operace na neblokujícím socketu by zablokovala běh." },
  { branch: "      |    +-- ", name: "ChildProcessError", typ: "Systém", cls: "typ-sys", desc: "Operace s dceřiným podprocesem selhala." },
  { branch: "      |    +-- ", name: "ConnectionError", typ: "Síť", cls: "typ-guard", desc: "Společná nadtřída pro výpadky a problémy síťového spojení." },
  { branch: "      |    |    +-- ", name: "BrokenPipeError", typ: "Síť", cls: "typ-guard", desc: "Zápis do socketu/roury s již uzavřeným protějším koncem." },
  { branch: "      |    |    +-- ", name: "ConnectionAbortedError", typ: "Síť", cls: "typ-guard", desc: "Spojení přerušeno lokálním síťovým stackem." },
  { branch: "      |    |    +-- ", name: "ConnectionRefusedError", typ: "Síť", cls: "typ-guard", desc: "Cílový server odmítl spojení na daném portu." },
  { branch: "      |    |    +-- ", name: "ConnectionResetError", typ: "Síť", cls: "typ-guard", desc: "Spojení protistranou násilně ukončeno (RST)." },
  { branch: "      |    +-- ", name: "FileExistsError", typ: "Soubory", cls: "typ-guard", desc: "Pokus o vytvoření souboru/složky, která již existuje." },
  { branch: "      |    +-- ", name: "FileNotFoundError", typ: "Soubory", cls: "typ-guard", desc: "Soubor či složka na zadané cestě neexistuje." },
  { branch: "      |    +-- ", name: "InterruptedError", typ: "Systém", cls: "typ-sys", desc: "Systémové volání OS bylo přerušeno signálem (EINTR)." },
  { branch: "      |    +-- ", name: "IsADirectoryError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Souborová operace požadována nad složkou." },
  { branch: "      |    +-- ", name: "NotADirectoryError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Adresářová operace požadována nad souborem." },
  { branch: "      |    +-- ", name: "PermissionError", typ: "Oprávnění", cls: "typ-guard", desc: "Odepřen přístup k souboru/složce kvůli právům OS." },
  { branch: "      |    +-- ", name: "ProcessLookupError", typ: "Systém", cls: "typ-guard", desc: "Proces podle zadaného PID neexistuje." },
  { branch: "      |    +-- ", name: "TimeoutError", typ: "Časový limit", cls: "typ-guard", desc: "Síťová či I/O operace překročila nastavený časový limit." },
  { branch: "      +-- ", name: "ReferenceError", typ: "Paměť", cls: "typ-sys", desc: "Přístup přes slabý odkaz (weakref) na již uklizený objekt." },
  { branch: "      +-- ", name: "RuntimeError", typ: "Běhová chyba", cls: "typ-bug", desc: "Obecná běhová chyba nespadající do konkrétnější kategorie." },
  { branch: "      |    +-- ", name: "NotImplementedError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Abstraktní metoda nebyla v odvozené třídě implementována." },
  { branch: "      |    +-- ", name: "PythonFinalizationError", typ: "Systém", cls: "typ-sys", desc: "Chyba nastala při ukončování interpretu Pythonu." },
  { branch: "      |    +-- ", name: "RecursionError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Překročena max. hloubka rekurze (chybí bázový případ)." },
  { branch: "      +-- ", name: "SyntaxError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Chyba syntaxe zjištěná parserem před spuštěním kódu." },
  { branch: "      |    +-- ", name: "IndentationError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Chybné odsazení bloku kódu (např. chybí 4 mezery)." },
  { branch: "      |         +-- ", name: "TabError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Nekonzistentní míchání tabulátorů a mezer v odsazení." },
  { branch: "      +-- ", name: "SystemError", typ: "Systém", cls: "typ-sys", desc: "Interní chyba v interpretu nebo C rozšíření Pythonu." },
  { branch: "      +-- ", name: "TypeError", typ: "Chyba v kódu", cls: "typ-bug", desc: "Operace aplikována na nevhodný datový typ (např. 'str' + 5)." },
  { branch: "      +-- ", name: "ValueError", typ: "Robustnost", cls: "typ-guard", desc: "Správný datový typ, ale neplatná hodnota (např. int('abc'))." },
  { branch: "      |    +-- ", name: "UnicodeError", typ: "Kódování", cls: "typ-guard", desc: "Společná nadtřída pro chyby kódování a dekódování textu." },
  { branch: "      |         +-- ", name: "UnicodeDecodeError", typ: "Kódování", cls: "typ-guard", desc: "Selhání převodu bajtů na text (nesprávný encoding)." },
  { branch: "      |         +-- ", name: "UnicodeEncodeError", typ: "Kódování", cls: "typ-guard", desc: "Znak nelze zakódovat do cílové znakové sady." },
  { branch: "      |         +-- ", name: "UnicodeTranslateError", typ: "Kódování", cls: "typ-guard", desc: "Selhání při překladu znaku metodou translate()." },
  { branch: "      +-- ", name: "Warning", typ: "Varování", cls: "typ-warn", desc: "Společná bázová třída pro všechna nefatální varování." },
  { branch: "           +-- ", name: "BytesWarning", typ: "Varování", cls: "typ-warn", desc: "Varování při podezřelém míchání typů bytes a str." },
  { branch: "           +-- ", name: "DeprecationWarning", typ: "Varování", cls: "typ-warn", desc: "Varování před použitím zastaralých funkcí či syntaxe." },
  { branch: "           +-- ", name: "EncodingWarning", typ: "Varování", cls: "typ-warn", desc: "Varování při neuvedení parametru encoding v open()." },
  { branch: "           +-- ", name: "FutureWarning", typ: "Varování", cls: "typ-warn", desc: "Varování před konstrukcí, která změní význam v budoucnu." },
  { branch: "           +-- ", name: "ImportWarning", typ: "Varování", cls: "typ-warn", desc: "Varování při podezřelých chybách během importování modulu." },
  { branch: "           +-- ", name: "PendingDeprecationWarning", typ: "Varování", cls: "typ-warn", desc: "Plánované budoucí zastarání funkce či API." },
  { branch: "           +-- ", name: "ResourceWarning", typ: "Varování", cls: "typ-warn", desc: "Varování před neuvolněným systémovým prostředkem." },
  { branch: "           +-- ", name: "RuntimeWarning", typ: "Varování", cls: "typ-warn", desc: "Varování před podezřelým chováním kódu za běhu." },
  { branch: "           +-- ", name: "SyntaxWarning", typ: "Varování", cls: "typ-warn", desc: "Varování před syntakticky pochybnou konstrukcí." },
  { branch: "           +-- ", name: "UnicodeWarning", typ: "Varování", cls: "typ-warn", desc: "Varování při podezřelé operaci nad Unicode řetězcem." },
  { branch: "           +-- ", name: "UserWarning", typ: "Varování", cls: "typ-warn", desc: "Běžná uživatelská a knihovní varování z kódu aplikace." }
];

/**
 * Generate compact ASCII + CZ exception tree HTML
 */
export function renderCompactAsciiExceptionTreeHtml() {
  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  const linesHtml = EXCEPTION_ENTRIES.map((e) => {
    const branchPart = e.branch ? `<span class="exc-branch">${escapeHtml(e.branch)}</span>` : "";
    return `<div class="exc-line">${branchPart}<span class="exc-lead"><span class="exc-name ${e.cls}">${escapeHtml(e.name)}</span> <span class="exc-typ ${e.cls}">[${escapeHtml(e.typ)}]</span></span><span class="exc-sep"> – </span><span class="exc-desc">${escapeHtml(e.desc)}</span></div>`;
  }).join("\n");

  return `<div class="exc-ascii-tree">${linesHtml}</div>`;
}
