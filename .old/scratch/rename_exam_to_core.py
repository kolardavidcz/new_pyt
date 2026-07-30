import os

# 1. Update new_order.html
new_order_path = "new_order.html"
with open(new_order_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace "Exam" tag in database
content = content.replace('"Exam"', '"Core"')
# Replace code patterns
content = content.replace("lower.includes('exam')", "lower.includes('core')")
content = content.replace("cls = 'exam'", "cls = 'core'")
content = content.replace("lower.includes('exam') cls = 'exam'", "lower.includes('core') cls = 'core'")

with open(new_order_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated new_order.html: replaced Exam with Core.")

# 2. Update dashboard.css
dashboard_css_path = "cjs/dashboard.css"
with open(dashboard_css_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("/* Exam tag: Blue-Teal — exam critical */", "/* Core tag: Blue-Teal — core programming concept */")
content = content.replace(".custom-tag.exam", ".custom-tag.core")

with open(dashboard_css_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated cjs/dashboard.css: replaced .custom-tag.exam with .custom-tag.core.")

# 3. Update screen.css (in case there are any references)
screen_css_path = "cjs/screen.css"
with open(screen_css_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(".custom-tag.exam", ".custom-tag.core")

with open(screen_css_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated cjs/screen.css.")

# 4. Update llm_annotation_prompt.md
prompt_path = ".gemini/antigravity/brain/2e161961-0ab4-45e7-9060-30b62dc715bc/llm_annotation_prompt.md"
if os.path.exists(prompt_path):
    with open(prompt_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = content.replace('"Exam" | "WOW"', '"Core" | "WOW"')
    content = content.replace('**`Exam`**: The concept is important for exams or classroom assignments.', '**`Core`**: Core programming concept essential for coding.')
    content = content.replace('"Exam"', '"Core"')
    content = content.replace('["Exam", "WOW"]', '["Core", "WOW"]')
    
    with open(prompt_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated llm_annotation_prompt.md.")
else:
    print(f"llm_annotation_prompt.md not found at {prompt_path}")
