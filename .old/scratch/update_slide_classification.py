with open("cjs/slide-classification.js", "r", encoding="utf-8") as f:
    content = f.read()

# Replace strings
content = content.replace('"skippable"', '"basics"')
content = content.replace('"new-syntax"', '"resyntax"')
content = content.replace('"new-concept"', '"newconcept"')
content = content.replace('"new-way"', '"paradigm"')

with open("cjs/slide-classification.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated slide-classification.js keys to new taxonomy.")
