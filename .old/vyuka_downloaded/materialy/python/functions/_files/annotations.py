#!/usr/bin/env python3

import inspect

def checkargs(function):
    def _f(*arguments):
        # helpers
        def check_type_error(index, argument):
            if not isinstance(index, argument):
                raise TypeError(f"{index} is not of type {argument}")
        argspec = inspect.getfullargspec(function).args
        annotations = function.__annotations__
        # check parameters
        for index, argument in enumerate(argspec):
            check_type_error(arguments[index], annotations[argument])
        # call original function
        return_value = function(*arguments)
        # check return value
        if 'return' in annotations:
            check_type_error(return_value, annotations['return'])
        # return (correct) value
        return return_value
    return _f

def coerceargs(function):
    def _f(*arguments):
        # helpers
        argspec = inspect.getfullargspec(function).args
        annotations = function.__annotations__
        # coerce parameters
        new_arguments = []
        for index, argument in enumerate(argspec):
            new_arguments.append(
                annotations[argument]( arguments[index] )
            )
        # call original function
        return_value = function(*new_arguments)
        # coerce return value
        if 'return' in annotations:
            return_value = annotations['return']( return_value )
        # return (correct) value
        return return_value
    return _f
