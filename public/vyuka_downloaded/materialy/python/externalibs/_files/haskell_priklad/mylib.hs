module Mylib where

import Foreign.C.Types
import Foreign.C.String

adder :: Int -> Int -> IO Int
adder x y = return (x+y)

subtractor :: Float -> Float -> IO Float
subtractor x  y = return (x - y)

fact :: Int -> Int
fact n = 
    if n == 1 then 1 else (n * fact (n-1))

factorial :: Int -> IO Int
factorial n = return (fact n)


hello :: CString -> IO CString
hello w 
 = do
   s <- peekCString w       
   newCString (s ++ "World!")

mystring :: IO CString
mystring = newCString "hello world!"

foreign export ccall adder :: Int -> Int -> IO Int
foreign export ccall subtractor :: Float -> Float -> IO Float
foreign export ccall factorial :: Int -> IO Int
foreign export ccall hello :: CString -> IO CString
foreign export ccall mystring :: IO CString
