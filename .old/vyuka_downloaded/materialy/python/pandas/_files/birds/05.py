import pandas as pd

df = pd.read_excel("birds.xlsx", sheet_name="birds")

kontrolní_druh = df[df['DRUH_CZ'] == 'racek chechtavý']
print(kontrolní_druh)
