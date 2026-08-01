#!/usr/bin/env python3

# original idea
#   https://wiki.python.org/moin/PythonDecoratorLibrary#Creating_Well-Behaved_Decorators_.2F_.22Decorator_decorator.22
def simple_decorator(decorator):
    def new_decorator(f):
        g = decorator(f)
        g.__name__ = f.__name__
        g.__doc__ = f.__doc__
        g.__dict__.update(f.__dict__)
        g.__annotations__ = f.__annotations__
        return g
    new_decorator.__name__ = decorator.__name__
    new_decorator.__doc__ = decorator.__doc__
    new_decorator.__dict__.update(decorator.__dict__)
    new_decorator.__annotations__ = decorator.__annotations__
    return new_decorator

# original idea Roddy MacSweeny
#   https://stackoverflow.com/a/19684962
@simple_decorator
def checkargs(function):
    from inspect import signature, Parameter
    def _f(*arguments):
        # helpers
        def check_type_error(value, value_type):
            if not isinstance(value, value_type):
                raise TypeError(f"{value} is not of type {value_type}")
        function_signature = signature(function)
        # check parameters (iff they have annotations)
        for index, parameter in enumerate(function_signature.parameters.values()):
            if (annotation := parameter.annotation) is not Parameter.empty:
                check_type_error(arguments[index], annotation)
        # call original function
        return_value = function(*arguments)
        # check return value (iff it has annotation)
        if (return_annotation := function_signature.return_annotation) is not Parameter.empty:
            check_type_error(return_value, return_annotation)
        # return (correct) value
        return return_value
    return _f

@simple_decorator
def coerceargs(function):
    from inspect import signature, Parameter
    def _f(*arguments):
        # helpers
        function_signature = signature(function)
        # coerce parameters
        new_arguments = []
        for index, parameter in enumerate(function_signature.parameters.values()):
            if (annotation := parameter.annotation) is not Parameter.empty:
                new_arguments.append( annotation(arguments[index]) )
            else:
                new_arguments.append( arguments[index] )
        # call original function
        return_value = function(*new_arguments)
        # coerce return value
        if (return_annotation := function_signature.return_annotation) is not Parameter.empty:
            return_value = return_annotation(return_value)
        # return (correct) value
        return return_value
    return _f

# tests
if __name__ == '__main__':

    # A)
    @checkargs
    def fn(xs: list, y=None) -> list:
        return [x**2 for x in xs]

    print('Testing fn([1, 2, 3])...')
    fn([1, 2, 3])
    
    print('Testing fn({1, 2, 3})...')
    try:
        fn({1, 2, 3})
    except TypeError as exc:
        print(exc)

    # B)
    @checkargs
    def fn(xs: list, y=None) -> list:
        return [x**2 for x in xs]

    print('Testing fn([1, 2, 3])...')
    fn([1, 2, 3])
    
    print('Testing fn({1, 2, 3})...')
    try:
        fn({1, 2, 3})
    except TypeError as exc:
        print(exc)

    # C)
    @checkargs
    def fn(a: int, b):
        return a + b

    print('Testing fn(3, 5)...')
    fn(3, 5)

    print('Testing fn(3, 5.2)...')
    fn(3, 5.2)

    print('Testing fn(3.1, 5)...')
    try:
        fn(3.1, 5)
    except TypeError as exc:
        print(exc)

    # D)
    @coerceargs
    def fn(a: float, b: float) -> float:
        return a + b

    print('Testing fn(3, 5)...')
    print( fn(3, 5) )

    print('Testing fn(3, 5.2)...')
    print( fn(3, 5.2) )

    # E)
    @coerceargs
    def fn(a: float, b) -> float:
        return a + b

    print('Testing fn(3, 5)...')
    print( fn(3, 5) )

    print('Testing fn(3, 5.2)...')
    print( fn(3, 5.2) )

    print('Testing fn(3.1, 5)...')
    print( fn(3.1, 5) )
