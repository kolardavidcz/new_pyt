import json
from pathlib import Path

root = Path(".")
course_path = root / "data" / "course.json"
slides_path = root / "data" / "slides.json"

with open(course_path, encoding="utf-8") as f:
    course = json.load(f)

with open(slides_path, encoding="utf-8") as f:
    slides_data = json.load(f)

w99 = next(w for w in course["weeks"] if w["week"] == 99)

print(f"Recalculating lecture relevance scores for {len(w99['lectures'])} Week 99 presentations...\n")

# Custom expert pedagogical relevance mapping based on topic importance & slide averages
pedagogical_relevance_overrides = {
    "vyuka_downloaded/materialy/python/functions/advanced-3.html": 7,   # Higher-order functions & functools
    "vyuka_downloaded/materialy/python/functions/generic.html": 6,      # Single-dispatch function overloading
    "vyuka_downloaded/materialy/dvcs/git.advanced.html": 6,              # Advanced Git (rebase, hooks, submodules)
    "vyuka_downloaded/materialy/python/numpy/arrays.creation.html": 6,  # NumPy array creation & shapes
    "vyuka_downloaded/materialy/python/numpy/arrays.operation.html": 6, # NumPy array math operations
    "vyuka_downloaded/materialy/python/numpy/arrays.slicing.html": 6,   # NumPy 2D slicing & memory layout
    "vyuka_downloaded/materialy/dvcs/git.html": 5,                      # Git basic tutorial
    "vyuka_downloaded/materialy/python/serialization/shelve.html": 5,   # Shelve object persistence
    "vyuka_downloaded/materialy/python/serialization/pickle.html": 5,   # Pickle & pickletools
    "vyuka_downloaded/materialy/techs/recursion/overview.html": 5,     # Recursion theory & complexity
    "vyuka_downloaded/materialy/python/objects/basics.html": 5,         # Class basics for non-OOP
    "vyuka_downloaded/materialy/python/fp.html": 5,                     # Functional Python hacks
    "vyuka_downloaded/materialy/python/speed/overview.html": 5,         # PyPy / Numba speed overview
    "vyuka_downloaded/materialy/python/gui/tkinter/index.html": 4,     # Tkinter GUI overview
    "vyuka_downloaded/materialy/python/gui/tkinter/PhotoImage.html": 4,# Tkinter PhotoImage
    "vyuka_downloaded/materialy/python/modules/textwrap.html": 4,       # Textwrap utility
    "vyuka_downloaded/materialy/python/pandas/example-2.html": 4,       # Pandas bird watching example
    "vyuka_downloaded/materialy/python/speed/example-1.html": 4,        # Image convolution benchmark
    "vyuka_downloaded/materialy/python/net/wsgi.html": 4,               # WSGI web gateway spec
    "vyuka_downloaded/materialy/python/3vs2.html": 3,                   # Py2 vs Py3 legacy history
    "vyuka_downloaded/materialy/dvcs/hg.html": 3,                       # Mercurial DVCS
    "vyuka_downloaded/materialy/dvcs/overview.html": 3,                 # DVCS historical overview
    "vyuka_downloaded/materialy/media/pnm.html": 3,                    # PNM binary format spec
    "vyuka_downloaded/materialy/media/png.html": 3,                    # PNG binary format spec
    "vyuka_downloaded/materialy/python/pypi/MatPlotLib_animace.html": 3,# Matplotlib animation
    "vyuka_downloaded/materialy/web/html/forms.html": 2,                # HTML forms introduction
    "vyuka_downloaded/materialy/web/html/forms-input.html": 2           # HTML <input> elements
}

for l in w99["lectures"]:
    path = l["path"]
    slug = l["slug"]
    
    # Collect all slide relevance scores for this lecture from slides.json
    slide_rel_scores = []
    for key, val in slides_data.items():
        if key.startswith(f"{slug}#") and "relevance" in val:
            slide_rel_scores.append(val["relevance"])
    
    # Determine new relevance score
    if path in pedagogical_relevance_overrides:
        new_rel = pedagogical_relevance_overrides[path]
    elif slide_rel_scores:
        new_rel = round(sum(slide_rel_scores) / len(slide_rel_scores))
    else:
        new_rel = 4
    
    old_rel = l.get("relevance", 4)
    l["relevance"] = new_rel
    print(f"  • {l['title']:<45} Relevance: {old_rel} → {new_rel}")

# Save updated course.json
with open(course_path, "w", encoding="utf-8") as f:
    json.dump(course, f, indent=2, ensure_ascii=False)

print("\n✅ Successfully updated Week 99 lecture relevance scores in course.json!")
