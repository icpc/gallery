"""Re-embed a targeted subset of photos at higher resolution (_b, 1024px).

After the first lowres scan, some photos will have weak/ambiguous matches —
faces that were too small at 640px to embed reliably. This script rescans
only those photos at 1024px with a larger detection window, then writes
embeddings to a separate cache (TARGETED_EMB) that the matcher merges in
preferentially over the lowres cache.

Input: a targeted_set.pkl with the structure {'all_targets': [photo_id, ...]}.
You usually produce that by post-processing match_results.json from the first
pass — see README for the heuristic.
"""
import os
import pickle
import sys
import time
from multiprocessing import Pool

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

import json
import numpy as np

from _common import (
    SIZE_HIRES, fetch_image, flickr_url, make_face_analyser, normalize,
)
from config import (
    BATCH_SECONDS, DET_SIZE_HIRES, PHOTOS_JSON, ROOT, TARGETED_EMB,
    WORKERS_HIRES,
)

TARGETED_SET = os.path.join(ROOT, "targeted_set.pkl")


def main():
    photos = {p["id"]: p for p in json.load(open(PHOTOS_JSON))}
    if not os.path.exists(TARGETED_SET):
        print(f"no {TARGETED_SET} — nothing to do (run the matcher first)")
        return
    ts = pickle.load(open(TARGETED_SET, "rb"))
    cache = pickle.load(open(TARGETED_EMB, "rb")) if os.path.exists(TARGETED_EMB) else {}
    remaining = [p for p in ts["all_targets"] if p not in cache]
    if not remaining:
        print("TARGETED ALL DONE", len(cache))
        return

    pool = Pool(WORKERS_HIRES, initializer=_init_worker, initargs=(DET_SIZE_HIRES,))
    t = time.time()
    n = err = 0
    try:
        for pid, res in pool.imap_unordered(
            _work, ((pid, photos[pid]) for pid in remaining), chunksize=3
        ):
            if res == "ERR":
                cache[pid] = []
                err += 1
            else:
                cache[pid] = res
            n += 1
            if time.time() - t > BATCH_SECONDS:
                pool.terminate()
                break
    finally:
        pool.close()
        pool.join()

    tmp = TARGETED_EMB + ".tmp"
    with open(tmp, "wb") as f:
        pickle.dump(cache, f)
    os.replace(tmp, TARGETED_EMB)
    print(
        f"targeted-hires batch={n} err={err} | cached {len(cache)}/{len(ts['all_targets'])} | "
        f"remaining {len(ts['all_targets']) - len(cache)} | {round(time.time() - t, 1)}s"
    )


_DET = _REC = _FACE = None


def _init_worker(det_size):
    global _DET, _REC, _FACE
    _DET, _REC, _FACE = make_face_analyser(det_size=det_size)


def _work(args):
    pid, photo = args
    img = fetch_image(flickr_url(photo, SIZE_HIRES), timeout=12)
    if img is None:
        return pid, "ERR"
    bboxes, kpss = _DET.detect(img, max_num=0, metric="default")
    out = []
    for i, bb in enumerate(bboxes):
        x1, y1, x2, y2 = bb[:4]
        if min(x2 - x1, y2 - y1) < 32:  # slightly looser at hires
            continue
        f = _FACE(bbox=bb[:4], kps=kpss[i], det_score=float(bb[4]))
        emb = normalize(_REC.get(img, f))
        out.append((bb[:4].astype(np.float32).tolist(), float(bb[4]), emb.astype(np.float16)))
    return pid, out


if __name__ == "__main__":
    main()
