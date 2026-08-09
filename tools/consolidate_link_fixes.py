import json
import re
from pathlib import Path

# Master legacy link re-mapping dictionary based on subagent audits
LEGACY_LINK_MAP = {
    # Text / Encoding
    "xML.encoding.xml": "text/encoding_xML.html",
    "encoding.xml": "text/encoding_xML.html",
    "/materialy/python/modules/html.entites.xml": "python/modules/_modules.html",
    "html.entites.xml": "python/modules/_modules.html",
    
    # Types
    "strings.xml": "python/types/_sequences.html",
    "dictionaries.xml": "python/types/dictionaries.html",
    "sets.xml": "python/types/sets.html",
    "tuples.xml": "python/types/tuples.html",
    "lists.xml": "python/types/lists.html",
    "frozensets.xml": "python/types/frozensets.html",
    
    # Cmd / Sys / Overview
    "print.xml": "python/cmd/overview.html",
    "functional.xml": "python/functions/functional.html",
    "generic.xml": "python/functions/generic.html",
    "advanced-3.xml": "python/functions/advanced-3.html",
    "scope.xml": "python/functions/scope.html",
    "decorators.xml": "python/functions/decorators.html",
    "parameters.xml": "python/functions/parameters.html",
    
    # Web & XML
    "xslt.xml": "web/xml/xslt.html",
    "dtd.xml": "web/xml/dtd.html",
    "relaxng.xml": "web/xml/relaxng.html",
    "xpath.xml": "web/xml/xpath.html",
    "xpath2.xml": "web/xml/xpath2.html",
    "xml.xml": "web/xml/xml.html",
    
    # System / Index
    "new_order.html": "#/",
    "/new_order.html": "#/",
}

print(f"Loaded master link map with {len(LEGACY_LINK_MAP)} explicit rule overrides.")

# Generate JS map object for content.js
js_map_entries = []
for k, v in LEGACY_LINK_MAP.items():
    js_map_entries.append(f'  "{k}": "{v}"')

js_map_code = "const LINK_REMAP_TABLE = {\n" + ",\n".join(js_map_entries) + "\n};"
print("\nGenerated JS snippet for content.js:")
print(js_map_code[:300] + "...")

out_json = Path("scratch/master_link_fixes.json")
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(LEGACY_LINK_MAP, f, indent=2, ensure_ascii=False)

print(f"Saved master link fixes to {out_json}")
