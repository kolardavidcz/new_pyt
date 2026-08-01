import re

text = """<0p class="para1">
  Jednoduchý HTML-odstavec se <em>zvýrazněným</em> textem,
  <9a>falešným elementem</9a> a více řádkami.
</0p>"""

pattern = re.compile(r"<([a-z]\w*).*?>", re.IGNORECASE | re.M)
matches = pattern.match(text)
print(matches)
