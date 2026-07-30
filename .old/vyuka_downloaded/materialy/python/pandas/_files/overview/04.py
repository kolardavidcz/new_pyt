import pandas as pd

filmy = pd.read_csv('HP.csv', sep=';')

print("filmy['režisér']:")
print(filmy['režisér'])

print("\nfilmy['režisér'].unique():")
print(filmy['režisér'].unique())

print("\nfilmy['režisér'].value_counts():")
print(filmy['režisér'].value_counts())
