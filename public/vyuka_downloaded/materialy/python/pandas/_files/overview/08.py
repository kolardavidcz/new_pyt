import pandas as pd

filmy = pd.read_csv('HP.csv', sep=';')

filmy['BAF'] = filmy['režisér'] + ' (' + filmy['rok'].astype('str') + ')'
print(filmy)
