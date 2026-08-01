# dekorátor..
def info(funkce):
    """Informační dekorátor."""
    def wrapper(*args, **kwargs):
        # výpis vlastností funkce
        print(
            'Volána funkce "{}".'.format(funkce.__name__), 
            'Její poziční argumenty: {}'.format(args),
            'Její pojmenované argumenty: {}'.format(kwargs),
            sep='\n'
        )
        # obsluha měřiče času
        import time
        start = time.time()
        # zavolání původní funkce
        ret = funkce(*args, **kwargs)
        # výpis času potřebného pro její vykonání
        print(
            'Vykonání funkce trvalo {} sekundy.'.format( time.time() - start )
        )
        print()
        return ret
    return wrapper

# ..a jeho použití

@info
def fn1(a, b, zaokrouhlení=None):
    výsledek = a**b
    return výsledek

print(' fn1(3, 4) ')
fn1(3, 4)
print(' fn1(3, 4, zaokrouhlení="test") ')
fn1(3, 4, zaokrouhlení="test")

@info
def fn2(a, b, zaokrouhlení=None):
    import time
    time.sleep(3)
    výsledek = a**b
    return výsledek

print(' fn2(3, 4) ')
fn2(3, 4)
print(' fn2(3, 4, zaokrouhlení="testík") ')
fn2(3, 4, zaokrouhlení="testík")
