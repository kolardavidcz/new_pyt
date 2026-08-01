import os
import re
import json
import shutil
import lxml.etree as ET
import lxml.html as html  # for robust per-slide content extraction

def extract_all_text_with_sources(elem, xml_path):
    text_parts = []
    if elem.text:
        text_parts.append(elem.text)
    
    # Check for src attribute (references to external files)
    src_attr = elem.attrib.get("src")
    if src_attr:
        code_path = os.path.join(os.path.dirname(xml_path), src_attr)
        if os.path.exists(code_path) and os.path.isfile(code_path):
            try:
                ext = os.path.splitext(code_path)[1].lower()
                if ext in ['.py', '.txt', '.csv', '.sql', '.xml', '.html', '.sh', '.json']:
                    with open(code_path, "r", encoding="utf-8", errors="ignore") as f:
                        text_parts.append(f.read())
            except Exception:
                pass
                
    for child in elem:
        text_parts.append(extract_all_text_with_sources(child, xml_path))
        if child.tail:
            text_parts.append(child.tail)
            
    return " ".join(text_parts)

def build_all():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Sync root cjs/ to vyuka_downloaded/cjs/ for local XML preview compatibility
    src_cjs = os.path.join(root_dir, "cjs")
    dst_cjs = os.path.join(root_dir, "vyuka_downloaded", "cjs")
    if os.path.exists(src_cjs):
        if os.path.exists(dst_cjs):
            try:
                shutil.rmtree(dst_cjs)
            except Exception as e:
                print(f"Warning: Could not clean old vyuka_downloaded/cjs folder: {e}")
        try:
            shutil.copytree(src_cjs, dst_cjs)
            print("Synced cjs/ assets to vyuka_downloaded/cjs/")
        except Exception as e:
            print(f"Error syncing styling assets: {e}")

    print("Starting HTML build and search indexing from XML slides...")
    
    # 1. Parse path-difficulty mappings from new_order.html
    diff_map = {}
    new_order_path = os.path.join(root_dir, "new_order.html")
    if os.path.exists(new_order_path):
        try:
            with open(new_order_path, "r", encoding="utf-8") as f:
                no_content = f.read()
            # Pattern 1: path followed by diff
            for m in re.finditer(r'path:\s*"([^"]+)"[^}]+?diff:\s*"([^"]+)"', no_content, re.DOTALL):
                path, diff = m.groups()
                diff_map[os.path.normpath(path).lower()] = diff
            # Pattern 2: diff followed by path
            for m in re.finditer(r'diff:\s*"([^"]+)"[^}]+?path:\s*"([^"]+)"', no_content, re.DOTALL):
                diff, path = m.groups()
                diff_map[os.path.normpath(path).lower()] = diff
            print(f"Loaded {len(diff_map)} path-difficulty mapping(s) from new_order.html")
        except Exception as e:
            print(f"Warning: Could not parse difficulties from new_order.html: {e}")
            
    # Target all course directories for compilation
    source_dirs = [
        os.path.join(root_dir, "vyuka_downloaded", "materialy"),
        os.path.join(root_dir, "vyuka_downloaded", "priklady")
    ]
    
    xsl_lecture = os.path.join(root_dir, "cjs", "screen.xsl")
    xsl_example = os.path.join(root_dir, "cjs", "examples.screen.xsl")
    
    search_index = []
    lecture_pages = {}   # rel_html_path -> [{"id": "id1", "title": "...", "content": "<div>...</div>"}]
    count = 0
    
    xml_files = []
    for source_dir in source_dirs:
        if os.path.exists(source_dir):
            for root, dirs, files in os.walk(source_dir):
                for file in files:
                    if file.endswith(".xml"):
                        xml_files.append((root, file))
 
    for root, file in xml_files:
        xml_path = os.path.join(root, file)
        html_path = xml_path[:-4] + ".html"
        # Check root tag to select correct XSLT
        try:
            tree = ET.parse(xml_path)
            root_el = tree.getroot()
            root_tag = root_el.tag
        except Exception as e:
            print(f"Skipping invalid XML {xml_path}: {e}")
            continue
        
        if root_tag not in ["lecture", "examples"]:
            continue
            
        xsl_path = xsl_example if root_tag == "examples" else xsl_lecture
        
        # Compile to HTML
        print(f"Compiling {os.path.relpath(xml_path, root_dir)} -> {os.path.relpath(html_path, root_dir)}")
        try:
            xslt = ET.parse(xsl_path)
            transform = ET.XSLT(xslt)
            result = transform(tree)
            
            html_str = ET.tostring(result, method="html", encoding="utf-8").decode("utf-8")
            
            # Inject default lecture difficulty meta tag if mapped
            rel_key = os.path.relpath(html_path, root_dir).replace("\\", "/")
            norm_key = os.path.normpath(rel_key).lower()
            diff = diff_map.get(norm_key)
            if diff:
                meta_tag = f'\n    <meta name="lecture-difficulty" content="{diff}">'
                html_str = re.sub(r'(<head\b[^>]*>)', r'\1' + meta_tag, html_str, count=1, flags=re.IGNORECASE)
                
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html_str)
            count += 1
        except Exception as e:
            print(f"Error compiling {file}: {e}")
            continue

        # Build Search Index for this file
        rel_html_path = os.path.relpath(html_path, root_dir).replace("\\", "/")
        
        # Get lecture/chapter title
        doc_title = ""
        if root_tag == "examples":
            doc_title = root_el.attrib.get("chapter", "Příklady k procvičení")
        else:
            meta_title = root_el.find(".//meta/title")
            doc_title = meta_title.text if meta_title is not None else "Přednáška"
        
        if root_tag == "examples":
            # Parse example tasks
            example_nodes = root_el.findall(".//example")
            for i, ex_node in enumerate(example_nodes):
                task_num = i + 1
                task_id = f"task-{task_num}"
                
                raw_text = extract_all_text_with_sources(ex_node, xml_path)
                clean_text = " ".join(raw_text.split())
                
                search_index.append({
                    "path": f"{rel_html_path}#{task_id}",
                    "docTitle": doc_title,
                    "slideTitle": f"Úkol {task_num} k procvičení",
                    "text": clean_text,
                    "type": "exercise"
                })
        else:
            # Parse lecture slides
            slide_nodes = root_el.findall(".//slide")
            for i, slide_node in enumerate(slide_nodes):
                slide_num = i + 1
                slide_id = f"id{slide_num}"
                slide_title = slide_node.attrib.get("title", f"Slajd {slide_num}")
                
                raw_text = extract_all_text_with_sources(slide_node, xml_path)
                clean_text = " ".join(raw_text.split())
                
                search_index.append({
                    "path": f"{rel_html_path}#{slide_id}",
                    "docTitle": doc_title,
                    "slideTitle": slide_title,
                    "text": clean_text,
                    "type": "lecture"
                })

            # === Robust "XML -> page content" for 3-layer tree (no source XML edits) ===
            # Extract from the rendered HTML so we get the final nice output (examples, notes, formatting).
            # This step is designed to be the sustainable foundation for future iteration.
            try:
                doc = html.fromstring(html_str)
                pages = []
                sections = doc.xpath('//section[contains(@class,"slide-section")]')
                for idx, sec in enumerate(sections, 1):
                    sid = f"id{idx}"
                    h2 = sec.find('.//h2')
                    ptitle = (h2.text.strip() if h2 is not None and h2.text else f"Slide {idx}")
                    bodies = sec.xpath('.//div[contains(@class,"section-body")]')
                    body = bodies[0] if bodies else None
                    content = html.tostring(body, encoding='unicode', method='html') if body is not None else ""
                    pages.append({"id": sid, "title": ptitle, "content": content})
                lecture_pages[rel_html_path] = pages
            except Exception as e:
                print(f"Warning: page content extraction failed for {rel_html_path}: {e}")
                        
    # Write minified search index to JSON file
    index_path = os.path.join(root_dir, "search_index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(search_index, f, ensure_ascii=False)
    print(f"Successfully compiled {count} files and generated search index containing {len(search_index)} items.")

    # Write robust per-lecture page contents (derived from rendered HTML, no XML edits needed).
    # This is the sustainable "XML -> page content" layer for the 3-layer tree, future micro-features, etc.
    data_dir = os.path.join(root_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    pages_path = os.path.join(data_dir, "lecture-pages.json")
    with open(pages_path, "w", encoding="utf-8") as f:
        json.dump(lecture_pages, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(lecture_pages)} lecture page contents to {pages_path}")

    # Generate course-manifest.json for clean data layer (3-layer tree support)
    manifest = {
        "num_lectures": len(lecture_pages),
        "total_pages": sum(len(v) for v in lecture_pages.values()),
        "generated_from": "XML via XSLT + extraction (no source edits)"
    }
    with open(os.path.join(data_dir, "course-manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"Wrote course-manifest.json")

    # 2. Update references in new_order.html
    new_order_path = os.path.join(root_dir, "new_order.html")
    if os.path.exists(new_order_path):
        print("Updating new_order.html references from .xml to .html...")
        with open(new_order_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        updated_content = re.sub(r'path:\s*"([^"]+)\.xml"', r'path: "\1.html"', content)
        
        with open(new_order_path, "w", encoding="utf-8") as f:
            f.write(updated_content)
        print("new_order.html updated.")

if __name__ == "__main__":
    build_all()
