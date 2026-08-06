import pandas as pd

filmy = pd.read_csv('HP.csv', sep=';')

print('iloc[0]:')
print(filmy.iloc[0])

print('\niloc[-1]:')
print(filmy.iloc[-1])

print('\niloc[::2]:')
print(filmy.iloc[::2])
