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
 * Generate HTML for the complete interactive Exception Tree component
 */
export function renderExceptionTreeHtml() {
  function renderNode(node, depth = 0, isLast = true, prefix = "") {
    const tagInfo = EXCEPTION_TAGS[node.tag] || EXCEPTION_TAGS.base;
    const hasChildren = node.children && node.children.length > 0;
    const connector = depth === 0 ? "" : isLast ? "└── " : "├── ";
    
    let html = `
      <div class="exc-node depth-${depth} ${hasChildren ? 'has-children' : 'leaf'}" data-name="${node.name.toLowerCase()}" data-tag="${node.tag}" data-meaning="${escapeAttr(node.meaning.toLowerCase())}">
        <div class="exc-node-head">
          <span class="exc-tree-branch" aria-hidden="true">${escapeHtml(prefix + connector)}</span>
          ${hasChildren ? `<button type="button" class="exc-toggle-btn" title="Sbalit/Rozbalit větev" aria-expanded="true"><span class="exc-chevron">▾</span></button>` : `<span class="exc-leaf-dot">•</span>`}
          <code class="exc-name tok-type">${escapeHtml(node.name)}</code>
          <span class="exc-tag-badge ${tagInfo.class}" title="${escapeAttr(tagInfo.desc)}">${escapeHtml(node.tagLabel)}</span>
        </div>
        <div class="exc-meaning-line">
          <span class="exc-meaning-text">${escapeHtml(node.meaning)}</span>
        </div>`;

    if (hasChildren) {
      html += `<div class="exc-children">`;
      const childPrefix = depth === 0 ? "" : prefix + (isLast ? "    " : "│   ");
      node.children.forEach((child, idx) => {
        const childIsLast = idx === node.children.length - 1;
        html += renderNode(child, depth + 1, childIsLast, childPrefix);
      });
      html += `</div>`;
    }

    html += `</div>`;
    return html;
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function escapeAttr(str) {
    return String(str || "").replace(/"/g, "&quot;");
  }

  return renderNode(EXCEPTION_TREE_DATA, 0, true, "");
}
