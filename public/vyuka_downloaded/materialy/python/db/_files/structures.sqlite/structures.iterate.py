import sqlite3
 
# připojení k SQLite-databázi
# ~ pokud soubor neexistuje, bude v daném umístění vytvořen
connection = sqlite3.connect("structures.db")
# získání kurzoru
cursor = connection.cursor()

 
# práce s databází

# dotaz do databáze
cursor.execute("""
    SELECT id, name FROM structures
        WHERE name LIKE '%benzene%';
    """)
# kurzor se chová jako iterátor přes množinu výsledků dotazu
for ntice in cursor:
    print(ntice)

 
# uzavření kurzoru
cursor.close()
# uzavření připojení k databázi
connection.close()
