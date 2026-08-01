,>,>                              # Ulož 2 čísla ze vstupu v buňkách (0) a (1)
++++++[-<--------<-------->>]     # a od každého z nich odečti 48
 
<<                                # Přesuň se zpátky na buňku (0)
[                                 # Hlavní smyčka; Opakuje se; dokud dělenec (dividend) v (0) je nenulový
    >                                 # Přesuň se na buňku (1)
    [->+>+<<]                         # Destruktivně zkopíruj dělitele (divisor) z (1) do (2) a (3); (1) bude vynulována
    >                                 # Přesuň se na buňku (2)
    [
        -<<-                              # Odečti dělitele (divisor) v (2) od dělence (dividend) v (0); Rozdíl je uložen v buňce (0) a buňka (2) je vynulována
         
        [>]>>>                            # Připrav test: Je-li dělenec (dividend) v (0) nulový; opusť smyčku
        [< [>>>-<<<[-]] >>]
        <<
    ]
    >>>+                              # Přidej jedničku k podílu (quotient) v buňce (5)
    <<[-<<+>>]                        # Destruktivně zkopíruj dělitele (divisor) z (3) do (1)
    <<<                               # Přesuň paměťový ukazatel na buňku (0) a
]                                 # vrať se na začátek hlavní smyčky
 
>[-]>>>>[-<<<<<+>>>>>]            # Destruktivně zkopíruj podíl (quotient) z (5) do (0) (není nutné; ale je to hezčí)
<<<<++++++[-<++++++++>]<.         # Přičti 48 a vypiš výsledek
