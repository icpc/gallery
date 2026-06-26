"""Shared helpers: Flickr URL building, image download, face crop, InsightFace init."""
import http.client
import ssl
import urllib.request
from io import BytesIO

import cv2
import numpy as np
import PIL.ImageFile as _IF
from PIL import Image

_IF.LOAD_TRUNCATED_IMAGES = True

# Insecure SSL context: live.staticflickr.com sometimes serves on cert chains the
# sandbox's truststore doesn't fully trust. Acceptable here — we hash-verify
# nothing and Flickr's content is fixed by the (server, secret, id) triple.
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

UA = "Mozilla/5.0 (compatible; face-recog-research/1.0)"

# Flickr size suffixes:
#   _z  ~640px (the "big" cache used in normal scans)
#   _b  ~1024px (the "hires" rescan used to disambiguate weak hits)
SIZE_LOWRES = "_z"
SIZE_HIRES = "_b"


def flickr_url(photo, size_suffix=SIZE_LOWRES):
    """Build a static.flickr URL from a photos.json record."""
    return f"https://live.staticflickr.com/{photo['sv']}/{photo['id']}_{photo['sc']}{size_suffix}.jpg"


def fetch_image(url, timeout=10):
    """GET url, decode to BGR ndarray. Returns None on failure."""
    try:
        try:
            buf = urllib.request.urlopen(
                urllib.request.Request(url, headers={"User-Agent": UA}),
                timeout=timeout,
                context=SSL_CTX,
            ).read()
        except http.client.IncompleteRead as e:
            buf = e.partial
        img = cv2.imdecode(np.frombuffer(buf, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            try:
                pil = Image.open(BytesIO(buf)).convert("RGB")
                img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
            except Exception:
                return None
        return img
    except Exception:
        return None


def crop_with_padding(img, box, pad=0.4):
    """Crop a bounding box with padding; box = (x1, y1, x2, y2) in pixel coords."""
    h, w = img.shape[:2]
    x1, y1, x2, y2 = box
    bw, bh = x2 - x1, y2 - y1
    return img[
        max(0, int(y1 - bh * pad)) : min(h, int(y2 + bh * pad)),
        max(0, int(x1 - bw * pad)) : min(w, int(x2 + bw * pad)),
    ]


def make_face_analyser(det_size=(512, 512)):
    """Init InsightFace's buffalo_l (det+rec only, CPU). Returns (det, rec, Face)."""
    from insightface.app import FaceAnalysis
    from insightface.app.common import Face

    app = FaceAnalysis(
        name="buffalo_l",
        allowed_modules=["detection", "recognition"],
        providers=["CPUExecutionProvider"],
    )
    app.prepare(ctx_id=-1, det_size=det_size)
    return app.det_model, app.models["recognition"], Face


def normalize(v):
    return v / (np.linalg.norm(v) + 1e-9)
