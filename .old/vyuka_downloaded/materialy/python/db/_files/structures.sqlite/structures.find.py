# encoding: utf-8

import sqlite3

# připojení k SQLite-databázi
# ~ pokud soubor neexistuje, bude v daném umístění vytvořen
connection = sqlite3.connect("structures.db")
# získání kurzoru („pracovního objektu nad databází“)
cursor = connection.cursor()

# dotaz do databáze
cursor.execute("""
    SELECT id, name FROM structures
        WHERE name LIKE '%benzene%';
    """)
# kurzor se chová jako iterátor přes množinu výsledků dotazu
for id, name in cursor:
  print(
    f'{name:<30} http://pubchem.ncbi.nlm.nih.gov/summary/summary.cgi?cid={id}'
  )

# uzavření kurzoru
cursor.close()
# uzavření připojení k databázi
connection.close()
