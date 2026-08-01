with open("vyuka_downloaded/priklady/python/funkce.html", encoding="utf-8") as f:
    content = f.read()

print("exercise-meta present:", "exercise-meta" in content)
print("data-diff present:", "data-diff" in content)

idx = content.find('id="task-1"')
if idx >= 0:
    print("\n--- Around task-1 ---")
    print(content[max(0,idx-20):idx+280])
else:
    print("No task-1 found directly")

idx2 = content.find("data-diff")
if idx2 >= 0:
    print("\n--- Sample data-diff ---")
    print(content[idx2:idx2+120])
