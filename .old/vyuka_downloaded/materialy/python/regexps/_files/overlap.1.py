import re

matches = re.findall(r'abc\w{2}', 'abcabc12345')
print(matches)
