import pandas as pd

filmy = pd.read_csv('HP.csv', sep=';')

print('head():')
print(filmy.head())

print('\ntail():')
print(filmy.tail())
