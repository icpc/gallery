"""Flickr API wrapper with a mock mode.

Real mode uses the ``flickrapi`` library (OAuth 1.0a). It needs a Flickr API
**key + secret** (from https://www.flickr.com/services/apps/create) and a
one-time browser authorization for *write* permission. Tokens are cached by
``flickrapi`` so you only authorize once.

Mock mode (``REVIEWER_MOCK=1`` or no key configured) serves a local sample image
and fake tags so the whole UI / review flow can be exercised offline.
"""
from __future__ import annotations

import json
import os

CONFIG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config.local.json"
)


def load_config() -> dict:
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


class AuthError(RuntimeError):
    pass


class MockFlickrClient:
    """Offline stand-in. Returns a local sample image and canned existing tags."""

    mock = True

    def __init__(self, *_, **__):
        # A couple of fake existing tags so the dedup/overlay UI is demonstrable.
        self._existing = {
            "_default": [
                {"raw": "Bill Poucher(1000200030004000)", "clean": "billpoucher"},
                {"raw": "ICPC", "clean": "icpc"},
            ],
        }

    def is_authorized(self) -> bool:
        return True

    def auth_status(self) -> dict:
        return {"authorized": True, "mock": True, "user": "mock-user"}

    def start_auth(self) -> str:
        return ""

    def complete_auth(self, verifier: str) -> dict:
        return {"authorized": True, "mock": True}

    def get_photo_image(self, photo_id: str) -> dict:
        # Served by the Flask app from /static/sample.jpg
        return {"url": "/static/sample.jpg", "width": 1024, "height": 768, "mock": True}

    def get_existing_tags(self, photo_id: str) -> list[dict]:
        return list(self._existing.get(photo_id, self._existing["_default"]))

    def add_tag(self, photo_id: str, tag_text: str) -> dict:
        return {"stat": "ok", "mock": True, "added": tag_text}


class FlickrClient:
    """Real Flickr client backed by flickrapi."""

    mock = False
    _SIZE_PREFS = ["Large", "Large 1600", "Large 2048", "Medium 800", "Medium 640", "Medium", "Original"]

    def __init__(self, api_key: str, api_secret: str):
        import flickrapi  # imported lazily so mock mode needs no dependency

        self.api_key = api_key
        self.flickr = flickrapi.FlickrAPI(api_key, api_secret, format="parsed-json")
        self._pending = None  # holds request-token state during the auth dance

    # ---- auth -------------------------------------------------------------
    def is_authorized(self) -> bool:
        try:
            return bool(self.flickr.token_valid(perms="write"))
        except Exception:
            return False

    def auth_status(self) -> dict:
        return {"authorized": self.is_authorized(), "mock": False}

    def start_auth(self) -> str:
        """Begin OOB OAuth; returns the URL the user must open to authorize write access."""
        self.flickr.get_request_token(oauth_callback="oob")
        return self.flickr.auth_url(perms="write")

    def complete_auth(self, verifier: str) -> dict:
        if not verifier:
            raise AuthError("missing verifier code")
        self.flickr.get_access_token(verifier.strip())
        return {"authorized": self.is_authorized(), "mock": False}

    # ---- reads ------------------------------------------------------------
    def get_photo_image(self, photo_id: str) -> dict:
        data = self.flickr.photos.getSizes(photo_id=photo_id)
        sizes = data.get("sizes", {}).get("size", [])
        by_label = {s["label"]: s for s in sizes}
        chosen = next((by_label[l] for l in self._SIZE_PREFS if l in by_label), None)
        if chosen is None and sizes:
            chosen = max(sizes, key=lambda s: int(s.get("width", 0)))
        if not chosen:
            raise RuntimeError(f"no sizes returned for photo {photo_id}")
        return {"url": chosen["source"], "width": int(chosen["width"]),
                "height": int(chosen["height"]), "mock": False}

    def get_existing_tags(self, photo_id: str) -> list[dict]:
        data = self.flickr.photos.getInfo(photo_id=photo_id)
        tags = data.get("photo", {}).get("tags", {}).get("tag", [])
        return [{"raw": t.get("raw", t.get("_content", "")),
                 "clean": t.get("_content", "")} for t in tags]

    # ---- writes -----------------------------------------------------------
    def add_tag(self, photo_id: str, tag_text: str) -> dict:
        # Quote so a multi-word "Name(hex)" is stored as a single raw tag.
        quoted = f'"{tag_text}"'
        resp = self.flickr.photos.addTags(photo_id=photo_id, tags=quoted)
        return resp if isinstance(resp, dict) else {"stat": "ok"}


def get_client(force_mock: bool | None = None) -> object:
    """Factory: real client if a key is configured (and not forced to mock)."""
    if force_mock is None:
        force_mock = os.environ.get("REVIEWER_MOCK") == "1"
    cfg = load_config()
    key = cfg.get("flickr_api_key") or os.environ.get("FLICKR_API_KEY")
    secret = cfg.get("flickr_api_secret") or os.environ.get("FLICKR_API_SECRET")
    if force_mock or not key or not secret:
        return MockFlickrClient()
    return FlickrClient(key, secret)
