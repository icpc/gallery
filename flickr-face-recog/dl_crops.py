"""Download and crop the faces shown on the review sheet.

For each (person, photo) candidate in sheets_plan.pkl this script:
  - downloads the matched photo (preferring _b hires when the match was hires)
  - crops the matching face bbox with some padding
  - writes crops/hit_{person_id}_{photo_id}.jpg

It also writes one reference crop per person:
  - the first portrait that produced a successful embedding, cropped to its face
  - written to crops/ref_{person_id}.jpg

Designed to run in short batches like the embedders — call it again to pick
up where it left off. Missing photos get a `.miss` sentinel so they don't get
retried forever.

The original pipeline had five copies of this file, one per review round
(dl_sheet.py, dl_sheet_r2.py, ...). This version is just the single script —
re-runnability handles "rounds" naturally.
"""
import http.client
import json
import os
import pickle
import sys
import time
import urllib.request

import cv2
import numpy as np

from _common import (
    SIZE_HIRES, SIZE_LOWRES, UA, crop_with_padding, fetch_image, flickr_url,
)
from config import (
    BATCH_SECONDS, CROPS_DIR, PHOTOS_JSON, REFERENCES_JSON, SHEETS_PLAN,
)


def main():
    os.makedirs(CROPS_DIR, exist_ok=True)
    plan = pickle.load(open(SHEETS_PLAN, "rb"))
    photos = {p["id"]: p for p in json.load(open(PHOTOS_JSON))}
    refs = {r["person_id"]: r for r in json.load(open(REFERENCES_JSON))}

    hits = []
    for person_id in plan["people"]:
        hits.extend(plan["by_person"][person_id])

    t = time.time()
    done = 0

    # 1. Photo crops (one per candidate).
    for h in hits:
        out = os.path.join(CROPS_DIR, f"hit_{h['person_id']}_{h['pid']}.jpg")
        if os.path.exists(out) or os.path.exists(out + ".miss"):
            continue
        if time.time() - t > BATCH_SECONDS - 6:
            break
        size = SIZE_HIRES if h.get("res") == "hires" else SIZE_LOWRES
        img = fetch_image(flickr_url(photos[h["pid"]], size))
        if img is None:
            open(out + ".miss", "w").close()
            continue
        c = crop_with_padding(img, h["bbox"])
        if c.size == 0:
            open(out + ".miss", "w").close()
            continue
        cv2.imwrite(out, c, [cv2.IMWRITE_JPEG_QUALITY, 82])
        done += 1

    # 2. Reference crops (one per person, generated from the first usable portrait).
    for person_id in plan["people"]:
        out = os.path.join(CROPS_DIR, f"ref_{person_id}.jpg")
        if os.path.exists(out):
            continue
        if time.time() - t > BATCH_SECONDS:
            continue
        r = refs.get(person_id)
        if not r:
            continue
        for portrait in r["portraits"]:
            buf = _http_get(portrait["url"])
            if buf is None:
                continue
            img = cv2.imdecode(np.frombuffer(buf, np.uint8), cv2.IMREAD_COLOR)
            if img is None:
                try:
                    from io import BytesIO
                    from PIL import Image
                    pil = Image.open(BytesIO(buf)).convert("RGB")
                    img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
                except Exception:
                    continue
            if portrait.get("face_box"):
                h2, w2 = img.shape[:2]
                L, T, R, B = portrait["face_box"]
                img = crop_with_padding(img, [L * w2, T * h2, R * w2, B * h2], pad=0.35)
            cv2.imwrite(out, img, [cv2.IMWRITE_JPEG_QUALITY, 82])
            done += 1
            break

    have_hits = sum(
        1 for h in hits if os.path.exists(os.path.join(CROPS_DIR, f"hit_{h['person_id']}_{h['pid']}.jpg"))
    )
    have_refs = sum(
        1 for p in plan["people"] if os.path.exists(os.path.join(CROPS_DIR, f"ref_{p}.jpg"))
    )
    print(
        f"crops: hits {have_hits}/{len(hits)} refs {have_refs}/{len(plan['people'])} "
        f"done_this_pass={done} | {round(time.time() - t, 1)}s"
    )


def _http_get(url):
    try:
        try:
            return urllib.request.urlopen(
                urllib.request.Request(url, headers={"User-Agent": UA}), timeout=10
            ).read()
        except http.client.IncompleteRead as e:
            return e.partial
    except Exception:
        return None


if __name__ == "__main__":
    main()
