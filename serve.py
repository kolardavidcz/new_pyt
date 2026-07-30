#!/usr/bin/env python3
"""No-cache local dev server for the Python course shell.

Maps:
  /                 → app/index.html
  /app/*            → app/*
  /data/*           → data/*
  /cjs/*            → .old/cjs/*   (fonts, highlighters for content)
  /vyuka_downloaded/* → .old/vyuka_downloaded/*
  /archive/*        → .old/*

Usage:
  python serve.py [port]
"""

from __future__ import annotations

import mimetypes
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
OLD = ROOT / ".old"
DEFAULT_PORT = 8765

# Ensure common types
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/json", ".json")
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("image/svg+xml", ".svg")


def resolve_url_path(url_path: str) -> Path | None:
    """Map URL path to filesystem path, or None if not found / forbidden."""
    path = unquote(url_path.split("?", 1)[0])
    if path in ("", "/"):
        return ROOT / "app" / "index.html"

    # Normalize
    if ".." in path.split("/"):
        return None

    candidates: list[Path] = []

    if path.startswith("/app/"):
        candidates.append(ROOT / path.lstrip("/"))
    elif path.startswith("/data/"):
        candidates.append(ROOT / path.lstrip("/"))
    elif path.startswith("/cjs/"):
        candidates.append(OLD / "cjs" / path[len("/cjs/") :])
        # Also serve app fonts under familiar path if needed
        candidates.append(ROOT / "app" / path.lstrip("/"))
    elif path.startswith("/vyuka_downloaded/"):
        candidates.append(OLD / path.lstrip("/"))
    elif path.startswith("/archive/"):
        candidates.append(OLD / path[len("/archive/") :])
    elif path.startswith("/content/"):
        candidates.append(ROOT / path.lstrip("/"))
    else:
        # Direct app assets: /css/, /js/ from app/
        rel = path.lstrip("/")
        candidates.append(ROOT / "app" / rel)
        candidates.append(ROOT / rel)

    for c in candidates:
        try:
            resolved = c.resolve()
        except OSError:
            continue
        # Stay under ROOT or OLD
        try:
            resolved.relative_to(ROOT.resolve())
            if resolved.is_file():
                return resolved
        except ValueError:
            pass
        try:
            resolved.relative_to(OLD.resolve())
            if resolved.is_file():
                return resolved
        except ValueError:
            pass

    return None


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        # Allow iframe/content fetch within same origin
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        fs_path = resolve_url_path(parsed.path)

        if fs_path is None:
            self.send_error(404, f"Not found: {parsed.path}")
            return

        try:
            data = fs_path.read_bytes()
        except OSError as e:
            self.send_error(500, str(e))
            return

        ctype, _ = mimetypes.guess_type(str(fs_path))
        if ctype is None:
            ctype = "application/octet-stream"
        # Force UTF-8 for text
        if ctype.startswith("text/") or ctype in (
            "application/javascript",
            "application/json",
            "image/svg+xml",
        ):
            if "charset" not in ctype:
                ctype = f"{ctype}; charset=utf-8"

        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_HEAD(self):
        parsed = urlparse(self.path)
        fs_path = resolve_url_path(parsed.path)
        if fs_path is None:
            self.send_error(404, f"Not found: {parsed.path}")
            return
        try:
            size = fs_path.stat().st_size
        except OSError as e:
            self.send_error(500, str(e))
            return
        ctype, _ = mimetypes.guess_type(str(fs_path))
        if ctype is None:
            ctype = "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(size))
        self.end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main() -> int:
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        port = int(sys.argv[1])

    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Python Course Shell")
    print(f"  http://127.0.0.1:{port}/")
    print(f"  root: {ROOT}")
    print(f"  no-cache: on")
    print(f"  Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
