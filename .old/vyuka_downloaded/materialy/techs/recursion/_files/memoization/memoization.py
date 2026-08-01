# výpočet bez zapamatování
def fibonacci_bez_memoizace(n):
    if n<= 1:
        return n
    else:
        return fibonacci_bez_memoizace(n-1) + fibonacci_bez_memoizace(n-2)


# slovník zapamatovaných hodnot
fib = {}
 
# upravená funkce pro výpočet n-tého členu Fibonacciho posloupnosti
def fibonacci_s_memoizaci(n):
    # Nepočítali jsme už žádanou hodnotu?
    try:
        return fib[n]
    # Ne, ještě ne:
    except KeyError:
        if n <= 1:
            return n
        else:
            # ..spočítejme ji
            val = fibonacci_s_memoizaci(n-1) + fibonacci_s_memoizaci(n-2)
            # ..a nyní už ji jako známou uložme a vraťme
            fib[n] = val
            return val
