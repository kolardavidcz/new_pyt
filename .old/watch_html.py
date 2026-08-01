import os
import time
import subprocess

def get_file_states(root_dir):
    states = {}
    
    # Target all course directories
    watch_dirs = [
        os.path.join(root_dir, "vyuka_downloaded", "materialy"),
        os.path.join(root_dir, "vyuka_downloaded", "priklady"),
        os.path.join(root_dir, "cjs")
    ]
    
    for watch_dir in watch_dirs:
        if not os.path.exists(watch_dir):
            continue
        for root, dirs, files in os.walk(watch_dir):
            for file in files:
                if file.endswith(".xml") or file.endswith(".xsl") or file.endswith(".css") or file.endswith(".js"):
                    path = os.path.join(root, file)
                    try:
                        states[path] = os.path.getmtime(path)
                    except OSError:
                        pass
    
    return states

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Starting file watcher for XML, XSLT, and CSS changes...")
    print("Press Ctrl+C to stop.")
    
    last_states = get_file_states(root_dir)
    
    # Build once initially to make sure everything is in sync
    subprocess.run(["python", "build_html.py"], cwd=root_dir)
    
    while True:
        try:
            time.sleep(1.5)
            current_states = get_file_states(root_dir)
            
            changed = False
            for path, mtime in current_states.items():
                if path not in last_states or mtime > last_states[path]:
                    print(f"Detected change in: {os.path.relpath(path, root_dir)}")
                    changed = True
                    
            if changed:
                print("Rebuilding HTML files...")
                subprocess.run(["python", "build_html.py"], cwd=root_dir)
                last_states = current_states
        except KeyboardInterrupt:
            print("\nWatcher stopped.")
            break
        except Exception as e:
            print(f"Error in watcher: {e}")

if __name__ == "__main__":
    main()
