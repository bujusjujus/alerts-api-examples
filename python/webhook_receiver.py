"""Receive bujusjujus webhooks and verify every one before trusting it.

Register the URL with the set_webhook tool (Live key); it returns a whsec_ secret once.
    BUJUS_WEBHOOK_SECRET=whsec_... python3 webhook_receiver.py
Standard library only. Put it behind HTTPS on port 443: webhooks are delivered only there.
Then call the test_webhook tool: it sends one signed {"type": "test"} POST and reports what
this receiver answered, so you don't have to wait for a real drop.
"""
import hashlib
import hmac
import json
import os
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

SECRET = os.environ["BUJUS_WEBHOOK_SECRET"]


def verify(secret: str, raw_body: bytes, header: str) -> bool:
    try:
        parts = dict(kv.split("=", 1) for kv in header.split(","))
        if abs(time.time() - int(parts.get("t", 0))) > 300:
            return False
        want = hmac.new(secret.encode(), parts["t"].encode() + b"." + raw_body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(want, parts.get("v1", ""))
    except (KeyError, ValueError):
        return False


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        raw = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        if not verify(SECRET, raw, self.headers.get("X-Bujus-Signature", "")):
            self.send_response(401)
            self.end_headers()
            return
        event = json.loads(raw)
        if event.get("type") == "alert":
            alert = event["alert"]
            print(f"{alert['retailer']}: {alert['title']} ${alert.get('price')} -> {alert.get('productUrl')}")
        else:
            # "test" from test_webhook, or a type added later: acknowledge it, act on nothing.
            print(f"{event.get('type')} delivery received")
        self.send_response(204)  # any 2xx within 5 seconds
        self.end_headers()


if __name__ == "__main__":
    HTTPServer(("0.0.0.0", int(os.environ.get("PORT", "8080"))), Handler).serve_forever()
