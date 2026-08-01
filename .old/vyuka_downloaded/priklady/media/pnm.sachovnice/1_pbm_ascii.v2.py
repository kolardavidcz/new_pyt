# Jiří Novotný

with open ("sachovnice.pnm", mode="w", encoding="utf-8") as sachovnice_pnm:
    
    sachovnice_pnm.write ("P1\n8 8\n")
    lichy_radek = "0 1 "
    sudy_radek = "1 0 "
    
    for x in range (4):
        sachovnice_pnm.write (4*lichy_radek + "\n")
        sachovnice_pnm.write (4*sudy_radek + "\n")
