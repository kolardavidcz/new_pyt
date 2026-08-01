import pandas as pd
import locale

df = pd.read_excel("birds.xlsx", sheet_name="birds")

# jednotlivé druhy ptáků 
druhy = df['DRUH_CZ'].unique()

# zpracování abecedně
output = pd.DataFrame(columns=['DRUH', 'DOSPĚLCŮ', 'RYBNÍKŮ'])
locale.setlocale(locale.LC_ALL, ('czech', 'UTF-8'))
for druh in sorted(druhy, key=locale.strxfrm):
    # rybníky bez ptáků přeskočíme
    if druh == 'bez ptáků':
        continue
    # ostatní zpracujeme
    print(druh)
    podmínka = (df['DRUH_CZ'] == druh)
    výběr = df[podmínka]
    dospělců = výběr['DOSPĚLCI']
    rybníků = výběr['RYBNÍK']
    print(f'\tdospělci: {sum(dospělců)}\n\trybníky: {len(rybníků.unique())}')
    # přidání zjištěných údajů do výstupního DataFrame
    nová_řádka = {
        'DRUH': druh,
        'DOSPĚLCŮ': sum(dospělců),
        'RYBNÍKŮ': len(rybníků.unique()),
    }
    output.loc[len(output)] = nová_řádka

# zápis zjištěných údajů do externího souboru
print()
print(output) 
output.to_excel('_dospělci.xlsx', index=False)
