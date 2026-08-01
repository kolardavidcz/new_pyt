import pandas as pd

# načtení dat z XLSX-souboru
df = pd.read_excel("PKLM_pro_portal.xlsx", sheet_name="data")

# stručný náhled na data
print('df:')
print(df)

# programové info
print('\ndf.info():')
df.info()

# datové info
print('\ndf.describe():')
print(df.describe())
