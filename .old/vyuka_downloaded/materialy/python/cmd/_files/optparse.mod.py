#!/usr/bin/env python


# import modulu pro práci s argumenty příkazové řádky
from optparse import OptionParser

# zavedení parseru vstupu
# ~ usage: nápověda pro volání skriptu
# ~ version: verze skriptu
parser = OptionParser(usage="usage: %prog [options] filename",
                      version="%prog 1.0")
# přidání přepínačů
# ~ jméno přepínače krátké a dlouhé
# ~ action: co provést v přítomnosti přepínače
# ~ dest: jméno klíče pro uložení hodnoty přepínače
# ~ default: výchozí hodnota pro přepínač
# ~ help: nápověda k přepínači
parser.add_option("-x", "--xhtml",
                  action="store_true",   # tj. nastav "dest" na "True", je-li tento přepínač uveden
                  dest="xhtml_flag",
                  default=False,
                  help="create a XHTML template instead of HTML")
parser.add_option("-c", "--cssfile",
                  action="store",   # nepovinné, protože uložení zadané hodnoty ("store") je výchozí chování
                  dest="cssfile",
                  default="style.css",
                  help="CSS file to link",)
# zparsování vstupu
# ~ options: bude obsahovat „slovník“ přepínačů a jejich hodnot { 'klíč': hodnota, ... }
# ~ args: bude obsahovat seznam argumentů [ arg1, ... ]
(options, args) = parser.parse_args()


# na vstupu čekáme právě jeden argument (a to filename)
if len(args) != 1:
    parser.error("wrong number of arguments")


# tisk získaných vstupů
print( options )
print( args )
