
x = 2
oldx = 1  # startovní hodnota
presnost = 0.000001

while abs(oldx-x) > presnost:
    oldx = x
    x = (1+x)**(1/3.0)  # iterace pro x
    print( "Kořen {0}   se liší od předchozího o {1}".format(x, abs(oldx-x)) )
