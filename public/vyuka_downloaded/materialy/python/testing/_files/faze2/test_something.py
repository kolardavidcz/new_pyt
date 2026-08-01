import something as sth
import unittest



class KnownOutputs(unittest.TestCase):

    # Vrací sth.to_list() svůj řetězcový argument předělaný na seznam?
    def test_list_1(self):
        """Funkce something.to_list() by měla vracet svůj řetězcový argument předělaný na seznam."""
        out = sth.to_list("ahoj")
        self.assertEqual(out, ['a', 'h', 'o', 'j'])

    # Vrací sth.to_bool() pro příslušný argument True, resp. False?
    def test_bool_1(self):
        """Funkce something.to_bool() by měla vrátit pravdivostní hodnotu svého argumentu."""
        out = sth.to_bool('ahoj')
        self.assertTrue(out)

    def test_bool_2(self):
        """Funkce something.to_bool() by měla vrátit pravdivostní hodnotu svého argumentu."""
        self.assertFalse( sth.to_bool('') )



if __name__ == '__main__':
    unittest.main()
