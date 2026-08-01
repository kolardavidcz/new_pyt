import pandas as pd

df = pd.read_excel("birds.xlsx", sheet_name="birds",
    dtype={'SAMCI': 'Int64', 'SAMICE': 'Int64', 'MLÁĎATA': 'Int64'}
)

# výběr řádek, kde je číslo alespoň v jednom ze sloupců SAMCI, SAMICE
k_ověření = df[df['SAMCI'].notna() | df['SAMICE'].notna()]
print(k_ověření)
k_ověření = k_ověření.fillna(0)
print(k_ověření)

# ověření správnosti součtů dospělců
dospělci = k_ověření['SAMCI'] + k_ověření['SAMICE']
print(dospělci == k_ověření['DOSPĚLCI'])
print('\nVýsledek:', all(dospělci == k_ověření['DOSPĚLCI']))
