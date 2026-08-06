# encoding: utf-8

import sqlite3

# připojení k SQLite-databázi
# ~ pokud soubor neexistuje, bude v daném umístění vytvořen
connection = sqlite3.connect("structures.db")

# získání kurzoru
cursor = connection.cursor()

# odstranění případné již existující tabulky daného jména
cursor.execute("""
    DROP TABLE IF EXISTS structures;
    """)
# vytvoření tabulky
cursor.execute("""
    CREATE TABLE structures (
        id INTEGER PRIMARY KEY,
        name TEXT,
        inchikey TEXT,
        smiles TEXT);
    """)
# nucené vyvolání čekajících operací
# (to abychom nezačali s databází pracovat a ona ještě neexistovala)
connection.commit()

# naplnění databáze/tabulky údaji ze souboru
with open("structures.txt", encoding="ascii") as f:
   for line in f:
      id, inchikey, smiles, name = line.strip().split("\t")
      cursor.execute(
         "INSERT INTO structures (id,name,inchikey,smiles) VALUES (?,?,?,?);",
         (id, name, inchikey, smiles)
      )
# „commit“ není třeba provádět po každém „execute“
# (prostě se INSERTů zavolá a vykoná více najednou)
connection.commit()

# uzavření kurzoru
cursor.close()
# uzavření připojení k databázi
connection.close()
