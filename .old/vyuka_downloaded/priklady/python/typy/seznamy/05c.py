# Martin Novák
# „Tohle je sice hodně céčkově napsané, ale narozdíl od ostatních ukázek řeší problém duplikátů na výstupu.“
# (za cenu rozhození pořadí, ale to už je cena za množiny)

def rovnoNasledovnikum(seznam):
    toReturn = []
    i = 0
    for prvek in seznam:
        if i < len (seznam)-1:
            if prvek == seznam[i+1]:
                toReturn.append(prvek)
            i=i+1
    return set(toReturn)

seznam = [0, 3, 3, 3, 4, 5, 6, 7, 4, 3, 2, 3, 4, 4, 3, 1, 1, 1]
print(rovnoNasledovnikum(seznam))

seznam = [0, 3, 3, 3, 4, 5, 6, 7, 4, 3, 3, 2, 3, 4, 4, 3, 1, 1, 1]
print(rovnoNasledovnikum(seznam))
