import regex as re

matches = re.findall(r'abc\w{2}', 'abcabc12345', overlapped=True)
print(matches)
