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

import json
import mimetypes
import os
import sys
import urllib
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent
OLD = ROOT / ".old"
DEFAULT_PORT = 34060

# Ensure common types
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/json", ".json")
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("image/svg+xml", ".svg")


def load_local_env() -> dict[str, str]:
    """Safely parse local .env.local file if present.

    Returns:
        dict[str, str]: Dictionary of key-value pairs loaded from .env.local.
    """
    env_file: Path = ROOT / ".env.local"
    env_vars: dict[str, str] = {}
    if env_file.exists():
        try:
            for line in env_file.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env_vars[k.strip()] = v.strip().strip('"').strip("'")
        except Exception:
            pass
    return env_vars


LOCAL_ENV: dict[str, str] = load_local_env()


def get_kv_config() -> tuple[str, str]:
    """Retrieve Upstash Redis REST URL and Bearer Token from environment or local env.

    Returns:
        tuple[str, str]: (kv_url, kv_token) tuple for REST API authentication.
    """
    url: str = (
        os.environ.get("UPSTASH_REDIS_REST_URL")
        or os.environ.get("KV_REST_API_URL")
        or LOCAL_ENV.get("UPSTASH_REDIS_REST_URL")
        or LOCAL_ENV.get("KV_REST_API_URL")
        or ""
    )
    token: str = (
        os.environ.get("UPSTASH_REDIS_REST_TOKEN")
        or os.environ.get("KV_REST_API_TOKEN")
        or LOCAL_ENV.get("UPSTASH_REDIS_REST_TOKEN")
        or LOCAL_ENV.get("KV_REST_API_TOKEN")
        or ""
    )
    return url, token


def save_question_improvement(entry: dict) -> list:
    """Merge and persist question improvements locally and in cloud KV.

    Args:
        entry (dict): Feedback or improvement payload to upsert/update/delete.

    Returns:
        list: The updated and sorted list of improvement items.
    """
    db_path: Path = ROOT / "data" / "question_improvements.json"
    pub_path: Path = ROOT / "public" / "data" / "question_improvements.json"

    # 1. Read local file items
    local_items: list = []
    if db_path.exists():
        try:
            local_items = json.loads(db_path.read_text(encoding="utf-8"))
        except Exception:
            local_items = []

    # 2. Read from Upstash Redis Cloud DB
    remote_items: list = []
    kv_url, kv_token = get_kv_config()

    if kv_token:
        try:
            req = urllib.request.Request(
                f"{kv_url}/get/pyt:global:question_improvements",
                headers={"Authorization": f"Bearer {kv_token}"}
            )
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data and data.get("result"):
                    res_val = data["result"]
                    while isinstance(res_val, str):
                        try:
                            res_val = json.loads(res_val)
                        except Exception:
                            break
                    remote_items = res_val if isinstance(res_val, list) else []
        except Exception as e:
            sys.stderr.write(f"[Upstash KV Fetch Error] {e}\n")

    # 3. Non-destructive union merge by ID (Zero Data Loss)
    by_id: dict = {}
    for item in (remote_items or []) + (local_items or []):
        if isinstance(item, dict) and item.get("id"):
            by_id[item["id"]] = item

    if isinstance(entry, dict) and entry.get("action") == "delete" and entry.get("id"):
        by_id.pop(entry["id"], None)
    elif isinstance(entry, dict) and entry.get("action") == "update" and entry.get("id"):
        item_id = entry["id"]
        if item_id in by_id:
            updates = {k: v for k, v in entry.items() if k != "action"}
            if updates.get("status") == "resolved" and not updates.get("resolvedAt"):
                from datetime import datetime, timezone
                updates["resolvedAt"] = datetime.now(timezone.utc).isoformat()
            by_id[item_id] = {**by_id[item_id], **updates}
    elif isinstance(entry, dict) and entry.get("id"):
        existing = by_id.get(entry["id"], {})
        by_id[entry["id"]] = {**existing, **entry}

    merged_list = sorted(
        list(by_id.values()),
        key=lambda x: x.get("timestamp", ""),
        reverse=True
    )

    # 4. Save merged list to local disk
    data_str = json.dumps(merged_list, indent=2, ensure_ascii=False)
    db_path.write_text(data_str, encoding="utf-8")
    if pub_path.parent.exists():
        pub_path.write_text(data_str, encoding="utf-8")

    # 5. Sync merged list to Upstash Redis Cloud DB
    if kv_token:
        try:
            set_req = urllib.request.Request(
                f"{kv_url}/set/pyt:global:question_improvements",
                data=json.dumps(json.dumps(merged_list, ensure_ascii=False)).encode("utf-8"),
                headers={"Authorization": f"Bearer {kv_token}"},
                method="POST"
            )
            with urllib.request.urlopen(set_req, timeout=4) as resp:
                pass
        except Exception as e:
            sys.stderr.write(f"[Upstash KV Push Error] {e}\n")

    return merged_list


def resolve_url_path(url_path: str) -> Path | None:
    """Map URL path to a safe filesystem path, or None if forbidden or not found.

    Strictly protects against path traversal attacks, blocks all hidden dotfiles (.env, .git, etc.),
    and restricts serving to whitelisted web asset subdirectories.

    Args:
        url_path (str): The requested raw URL path.

    Returns:
        Path | None: Resolved safe filesystem path, or None if inaccessible.
    """
    path = unquote(url_path.split("?", 1)[0].split("#", 1)[0])
    if path in ("", "/"):
        return ROOT / "app" / "index.html"

    # Normalize path separators and validate each individual segment
    normalized = path.replace("\\", "/")
    segments = [s for s in normalized.split("/") if s]

    # Block path traversal attempts and all hidden/dot files (.env, .git, .vscode, etc.)
    if any(s == ".." or s.startswith(".") for s in segments):
        return None

    candidates: list[Path] = []

    if path.startswith("/app/"):
        candidates.append(ROOT / path.lstrip("/"))
        candidates.append(ROOT / "public" / path.lstrip("/"))
    elif path.startswith("/data/"):
        candidates.append(ROOT / path.lstrip("/"))
        candidates.append(ROOT / "public" / path.lstrip("/"))
    elif path.startswith("/cjs/"):
        candidates.append(OLD / "cjs" / path[len("/cjs/") :])
        candidates.append(ROOT / "public" / "cjs" / path[len("/cjs/") :])
        candidates.append(ROOT / "app" / path.lstrip("/"))
    elif path.startswith("/vyuka_downloaded/"):
        candidates.append(ROOT / path.lstrip("/"))
        candidates.append(ROOT / "public" / path.lstrip("/"))
        candidates.append(OLD / path.lstrip("/"))
    elif path.startswith("/archive/"):
        candidates.append(OLD / path[len("/archive/") :])
    elif path.startswith("/content/"):
        candidates.append(ROOT / path.lstrip("/"))
    elif path.startswith("/css/") or path.startswith("/js/") or path.startswith("/fonts/") or path.startswith("/images/"):
        rel = path.lstrip("/")
        candidates.append(ROOT / "app" / rel)
        candidates.append(ROOT / "public" / rel)
    elif path in ("/favicon.ico", "/favicon.svg", "/index.html", "/curriculum_layouts_showcase.html", "/image_contrast_showcase.html"):
        rel = path.lstrip("/")
        candidates.append(ROOT / "app" / rel)
        candidates.append(ROOT / "public" / rel)
        candidates.append(ROOT / rel)
    else:
        # Default strict resolution: only look in app/ or public/
        rel = path.lstrip("/")
        candidates.append(ROOT / "app" / rel)
        candidates.append(ROOT / "public" / rel)

    for c in candidates:
        try:
            resolved = c.resolve()
        except OSError:
            continue

        # Prevent resolving any dotfiles anywhere in the resolved path components
        if any(part.startswith(".") for part in resolved.parts if part not in (".", "..")):
            continue

        # Stay strictly under ROOT or OLD
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
    protocol_version = "HTTP/1.0"

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/question-improvement":
            kv_url, kv_token = get_kv_config()
            db_path = ROOT / "data" / "question_improvements.json"
            local_items = []
            if db_path.exists():
                try:
                    local_items = json.loads(db_path.read_text(encoding="utf-8"))
                except Exception:
                    local_items = []
            remote_items = []
            if kv_token:
                try:
                    req = urllib.request.Request(
                        f"{kv_url}/get/pyt:global:question_improvements",
                        headers={"Authorization": f"Bearer {kv_token}"}
                    )
                    with urllib.request.urlopen(req, timeout=4) as resp:
                        data = json.loads(resp.read().decode("utf-8"))
                        if data and data.get("result"):
                            res_val = data["result"]
                            while isinstance(res_val, str):
                                try:
                                    res_val = json.loads(res_val)
                                except Exception:
                                    break
                            remote_items = res_val if isinstance(res_val, list) else []
                except Exception as e:
                    sys.stderr.write(f"[Upstash KV Fetch Error] {e}\n")

            by_id = {}
            for item in (remote_items or []) + (local_items or []):
                if isinstance(item, dict) and item.get("id"):
                    by_id[item["id"]] = item
            merged = sorted(list(by_id.values()), key=lambda x: x.get("timestamp", ""), reverse=True)
            resp_bytes = json.dumps({"status": "ok", "result": merged, "total": len(merged)}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(resp_bytes)))
            self.end_headers()
            self.wfile.write(resp_bytes)
            return

        if parsed.path.startswith("/api/sync"):
            qs = parse_qs(parsed.query)
            key = (qs.get("key") or qs.get("k") or [""])[0]
            if not key:
                self.send_error(400, "Missing key parameter")
                return
            kv_url, kv_token = get_kv_config()
            if not kv_token:
                self.send_error(500, "Upstash KV token not configured in environment")
                return
            try:
                req = urllib.request.Request(
                    f"{kv_url}/get/{urllib.parse.quote(key)}",
                    headers={"Authorization": f"Bearer {kv_token}"}
                )
                with urllib.request.urlopen(req, timeout=4) as resp:
                    resp_bytes = resp.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.send_header("Content-Length", str(len(resp_bytes)))
                    self.end_headers()
                    self.wfile.write(resp_bytes)
            except Exception as e:
                err_resp = json.dumps({"result": None, "error": str(e)}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(err_resp)))
                self.end_headers()
                self.wfile.write(err_resp)
            return

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
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, OSError):
            pass

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/sync"):
            length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(length)
            kv_url, kv_token = get_kv_config()
            if not kv_token:
                err_resp = json.dumps({"status": "error", "message": "Upstash KV token not configured"}).encode("utf-8")
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(err_resp)))
                self.end_headers()
                self.wfile.write(err_resp)
                return
            try:
                payload = json.loads(raw_body.decode("utf-8"))
                if isinstance(payload, list):
                    # Batched operations
                    results = []
                    for op in payload:
                        if isinstance(op, dict) and op.get("key"):
                            k = op["key"]
                            v = op.get("val")
                            set_req = urllib.request.Request(
                                f"{kv_url}/set/{urllib.parse.quote(k)}",
                                data=json.dumps(v).encode("utf-8"),
                                headers={"Authorization": f"Bearer {kv_token}"},
                                method="POST"
                            )
                            with urllib.request.urlopen(set_req, timeout=4) as resp:
                                results.append({"key": k, "ok": resp.status == 200})
                    resp_bytes = json.dumps({"status": "ok", "results": results}).encode("utf-8")
                else:
                    k = payload.get("key") if isinstance(payload, dict) else None
                    v = payload.get("val") if isinstance(payload, dict) else payload
                    if not k:
                        qs = parse_qs(parsed.query)
                        k = (qs.get("key") or qs.get("k") or [""])[0]

                    set_req = urllib.request.Request(
                        f"{kv_url}/set/{urllib.parse.quote(k)}",
                        data=json.dumps(v).encode("utf-8"),
                        headers={"Authorization": f"Bearer {kv_token}"},
                        method="POST"
                    )
                    with urllib.request.urlopen(set_req, timeout=4) as resp:
                        resp_bytes = resp.read()

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(resp_bytes)))
                self.end_headers()
                self.wfile.write(resp_bytes)
            except Exception as e:
                err_resp = json.dumps({"status": "error", "message": str(e)}).encode("utf-8")
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(err_resp)))
                self.end_headers()
                self.wfile.write(err_resp)
            return

        if parsed.path == "/api/question-improvement":
            length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(length)
            try:
                entry = json.loads(raw_body.decode("utf-8"))
                if not entry.get("id"):
                    import time
                    entry["id"] = f"imp-{int(time.time() * 1000)}"
                if not entry.get("timestamp"):
                    import datetime
                    entry["timestamp"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

                updated_db = save_question_improvement(entry)
                resp = json.dumps({"status": "ok", "entry": entry, "total": len(updated_db)}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
            except Exception as e:
                err_resp = json.dumps({"status": "error", "message": str(e)}).encode("utf-8")
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(err_resp)))
                self.end_headers()
                self.wfile.write(err_resp)
            return

        self.send_error(404, f"Not found: {parsed.path}")

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main() -> int:
    """Initialize and run the local development HTTP server on localhost.

    Returns:
        int: Process exit code (0 on clean shutdown).
    """
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        port = int(sys.argv[1])

    os.chdir(ROOT)
    ThreadingHTTPServer.allow_reuse_address = True
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
