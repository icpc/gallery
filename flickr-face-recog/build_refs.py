"""Compute a reference embedding for each person you want to find.

Reads references.json, which is a list of records:
  {
    "person_id": "alice",                       # any unique string (kebab-case recommended)
    "name":      "Alice Example",               # display name for the review sheet
    "portraits": [                              # one or more portraits of this person
      {"url":      "https://example.com/alice.jpg",
       "face_box": [0.30, 0.10, 0.65, 0.55]    # optional, fractional (x1,y1,x2,y2)
      },
      ...
    ]
  }

For each portrait we run face detection, take the face nearest the given
face_box (or just the largest detected face if none given), and store its
embedding. A person with multiple portraits ends up with multiple ref
embeddings — the matcher takes the max cosine over them.

Output: ref_embeddings.pkl  →  {person_id: np.ndarray (N, 512), ...}

Like embed_photos.py, this runs in short batches and resumes from the cache.
"""
import http.client
import json
import os
import pickle
import sys
import time
import urllib.request
from multiprocessing import Pool

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

import cv2
import numpy as np
import PIL.ImageFile as _IF
from io import BytesIO
from PIL import Image

_IF.LOAD_TRUNCATED_IMAGES = True

from _common import UA, make_face_analyser, normalize
from config import BATCH_SECONDS, REF_EMBEDDINGS, REFERENCES_JSON


def main():
    refs = json.load(open(REFERENCES_JSON))
    existing = pickle.load(open(REF_EMBEDDINGS, "rb")) if os.path.exists(REF_EMBEDDINGS) else {}

    # Queue every (person_id, portrait) pair that we haven't successfully embedded yet.
    queue = []
    for r in refs:
        pid = r["person_id"]
        if pid in existing and len(existing[pid]) >= len(r["portraits"]):
            continue  # already done
        for portrait in r["portraits"]:
            queue.append((pid, portrait.get("url"), portrait.get("face_box")))
    if not queue:
        print("ALL DONE", len(existing))
        return
    print(f"refs to embed: {len(queue)} portraits across {len({q[0] for q in queue})} people")

    pool = Pool(4, initializer=_init_worker)
    acc = {}
    t = time.time()
    n = ok = 0
    try:
        for person_id, emb in pool.imap_unordered(_work, queue, chunksize=2):
            n += 1
            if emb is not None:
                acc.setdefault(person_id, []).append(emb)
                ok += 1
            if time.time() - t > BATCH_SECONDS:
                pool.terminate()
                break
    finally:
        pool.close()
        pool.join()

    # Merge into existing (don't drop old embeddings).
    for person_id, embs in acc.items():
        prior = existing.get(person_id)
        new = np.array(embs)
        existing[person_id] = np.vstack([prior, new]) if prior is not None else new

    pickle.dump(existing, open(REF_EMBEDDINGS, "wb"))
    print(
        f"this batch: queued={n} ok={ok} | total people with refs: {len(existing)} | "
        f"new embs added for {len(acc)} people | {round(time.time() - t, 1)}s"
    )


# --- worker ----------------------------------------------------------------

_DET = _REC = _FACE = None


def _init_worker():
    global _DET, _REC, _FACE
    _DET, _REC, _FACE = make_face_analyser(det_size=(640, 640))


def _work(args):
    person_id, url, face_box = args
    try:
        try:
            buf = urllib.request.urlopen(
                urllib.request.Request(url, headers={"User-Agent": UA}), timeout=10
            ).read()
        except http.client.IncompleteRead as e:
            buf = e.partial
        img = cv2.imdecode(np.frombuffer(buf, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            try:
                pil = Image.open(BytesIO(buf)).convert("RGB")
                img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
            except Exception:
                return person_id, None

        bb, kp = _DET.detect(img, max_num=0, metric="default")
        if len(bb) == 0:
            return person_id, None

        h, w = img.shape[:2]
        best = None
        if face_box is not None:
            # Pick the detected face nearest the user-given fractional face_box.
            L, T, R, B = face_box
            cx, cy = (L + R) / 2 * w, (T + B) / 2 * h
            best_d = 1e9
            for i, b in enumerate(bb):
                if b[0] <= cx <= b[2] and b[1] <= cy <= b[3]:
                    d = abs((b[0] + b[2]) / 2 - cx) + abs((b[1] + b[3]) / 2 - cy)
                    if d < best_d:
                        best_d = d
                        best = i
        if best is None:
            # Fallback: largest detected face.
            best = int(np.argmax([(b[2] - b[0]) * (b[3] - b[1]) for b in bb]))

        f = _FACE(bbox=bb[best][:4], kps=kp[best], det_score=float(bb[best][4]))
        emb = normalize(_REC.get(img, f))
        return person_id, emb.astype(np.float32)
    except Exception:
        return person_id, None


if __name__ == "__main__":
    main()
