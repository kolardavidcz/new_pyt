#!/usr/bin/env python


# import modulu pro práci s argumenty příkazové řádky
from argparse import ArgumentParser

# zavedení parseru vstupu
parser = ArgumentParser()
# verze skriptu
parser.add_argument('--version', action='version', version='1.0')
# A) přidání přepínačů
# ~ jméno přepínače krátké a dlouhé
# ~ action: co provést v přítomnosti přepínače
# ~ default: výchozí hodnota pro přepínač
# ~ help: nápověda k přepínači
parser.add_argument("-x", "--xhtml",
                    action="store_true",
                    default=False,
                    help="create a XHTML template instead of HTML")
parser.add_argument("-c", "--cssfile",
                    default="style.css",
                    help="CSS file to link",)
# B) přidání argumentů
# ~ od přepínačů se liší nepřítomností znaku - na začátku
parser.add_argument("file",
                    help="main HTML file to work with")
# zparsování vstupu
# ~ args: objekt Namespace zadaných argumentů
args = parser.parse_args()


# tisk získaných vstupů
print( args )
