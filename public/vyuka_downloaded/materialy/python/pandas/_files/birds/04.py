import pandas as pd

df = pd.read_excel("birds.xlsx", sheet_name="birds")

# jednotlivé druhy ptáků 
druhy = df['DRUH_CZ'].unique()
print(druhy)
print(type(druhy))
