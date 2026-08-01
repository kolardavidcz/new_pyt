import pandas as pd

filmy = pd.read_csv('HP.csv', sep=';')

print("logické &:")
výběr = (
    (filmy['režisér'] == 'David Yates')
    &
    (filmy['tržby'].str.startswith('$1'))
)
print(výběr)

print("\nodpovídající výběr:")
print(filmy[výběr])
