import pandas as pd

df = pd.read_excel("birds.xlsx", sheet_name="birds")
print(df.head(), end='\n\n')
df.info()
