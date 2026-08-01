
text = "Jak jsi na tom, co dnes podniknem?"
print(text)
print( text[:text.find("m")] )

print()

# Pro neexistující výskyt sice vrátí rovnou použitelný index -1, takže kód nezhavaruje, ale výsledné chování je špatné:
print( text[:text.find("M")] )
# Takže stejně pořád potřebujeme rozlišit, jestli tam dané písmeno je nebo ne:
print( text[:text.find("M")] if text.find("M") != -1 else text )
# (což je tedy pěkně nehezké jednořádkové řešení)
