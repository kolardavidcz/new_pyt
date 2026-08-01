
def rotate(x, y, fi_deg):
    """Otočí číslo [x,y] o úhel fí (zadaný ve stupních)."""
    
    import math
    
    # otáčený bod
    cislo_k_otoceni = complex(x, y)
    
    # přepočet úhlu na radiány
    fi_rad = uhel_v_radianech = math.radians(fi_deg)
    # zavedení rotoru
    rotor = complex( math.cos(fi_rad), math.sin(fi_rad) )
    
    # provedení otočení
    cislo_otocene = cislo_k_otoceni * rotor
    
    # převod zpět na souřadnice a zaokrouhlení na 3 desetinná místa
    zx = round(cislo_otocene.real, 3)
    zy = round(cislo_otocene.imag, 3)
    
    return zx, zy

# testy
print( rotate(0, 0,  11) )
print( rotate(1, 1,  45) )
print( rotate(0, 1, 180) )
