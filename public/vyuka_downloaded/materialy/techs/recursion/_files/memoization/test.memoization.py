import timeit

"""
t.timeit() – zopakuje volání miliónkrát a spočítá průměr
t.repeat() – jako předchozí, jen to celé třikrát zopakuje
  =>
My zavoláme kód pouze jednou, ale třítisíckrát ho zopakujeme.
"""

# A) 
print('Fibonacci bez zapamatování (5. a 15. a 20. člen):')
t = timeit.Timer(
        "m.fibonacci_bez_memoizace(5); m.fibonacci_bez_memoizace(15); m.fibonacci_bez_memoizace(20);",
        "import memoization as m"
    )
out = t.repeat(3000, 1)
print( min(out) )

# B) 
print('Fibonacci se zapamatováním (5. a 15. a 20. člen):')
t = timeit.Timer(
        "m.fibonacci_s_memoizaci(5); m.fibonacci_s_memoizaci(15); m.fibonacci_s_memoizaci(20);",
        "import memoization as m; fib = {}"
    )
out = t.repeat(3000, 1)
print( min(out) )
