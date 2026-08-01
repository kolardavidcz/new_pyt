import pandas as pd

df = pd.read_excel("birds.xlsx", sheet_name="birds",
    dtype={'SAMCI': 'Int64', 'SAMICE': 'Int64', 'MLÁĎATA': 'Int64'}
)
print(df.head(), end='\n\n')
df.info()
