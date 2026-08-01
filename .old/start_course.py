import os
import shutil
import socket
import sys
import webbrowser
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
import threading

def copy_cjs():
    """Copy cjs folder from root to vyuka_downloaded to keep local XML previews working."""
    src = os.path.join(".", "cjs")
    dst = os.path.join(".", "vyuka_downloaded", "cjs")
    
    if os.path.exists(src):
        if os.path.exists(dst):
            try:
                shutil.rmtree(dst)
            except Exception as e:
                print(f"Warning: Could not clean old vyuka_downloaded/cjs folder: {e}")
        print(f"Syncing styling assets from {src} to {dst}...")
        try:
            shutil.copytree(src, dst)
        except Exception as e:
            print(f"Error copying styling assets: {e}")
    else:
        print("Warning: root cjs folder not found.")


def find_free_port():
    """Find a free TCP port to run the server on."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    port = s.getsockname()[1]
    s.close()
    return port

class MyHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Aggressively disable all caching for local development.
        # This prevents stale pages even without incognito / clearing site data.
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server(port):
    handler = MyHandler
    # Bind to localhost only for security
    with TCPServer(("127.0.0.1", port), handler) as httpd:
        print(f"Local server started at http://127.0.0.1:{port}/")
        httpd.serve_forever()

def main():
    # Make sure we are in the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    copy_cjs()
    
    port = find_free_port()
    
    # Start server in a daemon thread so it exits when main exits
    server_thread = threading.Thread(target=run_server, args=(port,), daemon=True)
    server_thread.start()
    
    url = f"http://127.0.0.1:{port}/new_order.html"
    print(f"\nOpening dashboard in your web browser: {url}")
    print("Press Ctrl+C to stop the server.")
    
    # Open the browser
    webbrowser.open(url)
    
    # Keep the main thread alive to serve requests
    try:
        while True:
            server_thread.join(timeout=1.0)
    except KeyboardInterrupt:
        print("\nStopping local server. Goodbye!")
        sys.exit(0)

if __name__ == '__main__':
    main()
