# encoding: utf-8

import sqlite3

# připojení k SQLite-databázi
# ~ pokud soubor neexistuje, bude v daném umístění vytvořen
connection = sqlite3.connect("structures.3.db")

# získání kurzoru
cursor = connection.cursor()

# 1. odstranění případné již existující tabulky daného jména
# 2. vytvoření tabulky
cursor.executescript("""
    DROP TABLE IF EXISTS structures;
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
    # a) získání dat
    data = []
    for line in f:
        id, inchikey, smiles, name = line.strip().split("\t")
        data.append( (id, name, inchikey, smiles) )
    # b) naplnění databáze
    cursor.executemany(
        "INSERT INTO structures (id,name,inchikey,smiles) VALUES (?,?,?,?);",
        data
    )
# „commit“ není třeba provádět po každém „execute“
# (prostě se INSERTů zavolá a vykoná více najednou)
connection.commit()

# uzavření kurzoru
cursor.close()
# uzavření připojení k databázi
connection.close()
