import re

with open('new_order.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all compare fields that have actual text
matches = re.findall(r'compare\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', content)
non_empty = [m for m in matches if m.strip()]

print(f"Total compare fields found: {len(matches)}")
print(f"Non-empty compare annotations: {len(non_empty)}")

if non_empty:
    print("\n--- Sample compares (first 3) ---")
    for m in non_empty[:3]:
        print("-", m[:110].replace('\n', ' ') + ('...' if len(m) > 110 else ''))
