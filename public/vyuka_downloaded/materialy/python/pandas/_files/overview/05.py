import pandas as pd

filmy = pd.read_csv('HP.csv', sep=';')

print("filmy['režisér'] == 'David Yates':")
print(filmy['režisér'] == 'David Yates')

print("\nNumpy fancy indexing:")
print(filmy[
    filmy['režisér'] == 'David Yates'
])
