"""Serve only the installed reader, test harness and local fixtures on loopback."""
import json
import mimetypes
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

root = Path.cwd()
cache = root / ".cache/save-tests"
package = root / "node_modules/@serabi/pokemon-save-reader"


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            if self.path == "/":
                data = b"<!doctype html><title>GB save reader validation</title>Local save reader validation"
                content_type = "text/html"
            else:
                prefix, base = next((p, b) for p, b in [
                    ("/reader/", package), ("/fixtures/", cache),
                    ("/harness/", root / "scripts/save-fixtures")
                ] if self.path.startswith(p))
                file = (base / self.path[len(prefix):]).resolve()
                if not file.is_relative_to(base.resolve()):
                    raise ValueError("Outside allowed directory")
                data = file.read_bytes()
                content_type = mimetypes.guess_type(str(file))[0] or "application/octet-stream"
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.end_headers()
            self.wfile.write(data)
        except (OSError, ValueError, StopIteration):
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path != "/report":
            self.send_response(404)
            self.end_headers()
            return
        data = self.rfile.read(int(self.headers["Content-Length"]))
        json.loads(data)
        (cache / "wasm-results.json").write_bytes(data)
        self.send_response(200)
        self.end_headers()

    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
print(server.server_port, flush=True)
server.serve_forever()
