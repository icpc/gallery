"""Embed faces in every photo in photos.json (low-res _z, 640px).

Designed to run in short batches (default 40s) so it composes well with a
sandbox that times out long-running jobs — invoke it repeatedly, it picks up
where it left off via the on-disk embcache. The cache holds one entry per
photo: a list of (bbox, det_score, embedding) tuples. An empty list means
"scanned, no face found".

Sharding: set SHARD=0..N-1 and NSHARDS=N to run N parallel workers writing
to embcache_s{SHARD}.pkl files. Each shard skips photos already in any other
shard's cache, so they cooperate without coordination.
"""
import glob
import json
import os
import pickle
import random
import sys
import time
from multiprocessing import Pool

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

import numpy as np

from _common import (
    SIZE_LOWRES, fetch_image, flickr_url, make_face_analyser, normalize,
)
from config import (
    BATCH_SECONDS, DET_SIZE_LOWRES, EMB_CACHE, PHOTOS_JSON, WORKERS_LOWRES,
)


def main():
    photos = {p["id"]: p for p in json.load(open(PHOTOS_JSON))}

    # Decide which cache file we write to (main, or a shard).
    shard = int(os.environ.get("SHARD", "-1"))
    nshards = int(os.environ.get("NSHARDS", "1"))
    cache_path = EMB_CACHE if shard < 0 else EMB_CACHE.replace(".pkl", f"_s{shard}.pkl")
    cache = pickle.load(open(cache_path, "rb")) if os.path.exists(cache_path) else {}
    if shard >= 0:
        print(f"SHARD={shard}/{nshards} writing to {cache_path}", file=sys.stderr)

    # "Already done" = anything in any shard cache OR the main cache.
    skip = dict(cache)
    for f in glob.glob(EMB_CACHE.replace(".pkl", "_s*.pkl")):
        try:
            skip.update(pickle.load(open(f, "rb")))
        except Exception:
            pass
    if os.path.exists(EMB_CACHE) and cache_path != EMB_CACHE:
        try:
            skip.update(pickle.load(open(EMB_CACHE, "rb")))
        except Exception:
            pass

    # Shuffle so shards spread load evenly across servers/years.
    remaining = [pid for pid in photos if pid not in skip]
    random.seed(11)
    random.shuffle(remaining)
    if shard >= 0:
        remaining = remaining[shard::nshards]
    if not remaining:
        print("ALL DONE", len(skip))
        return

    # One InsightFace instance per worker; init lives at module scope so the
    # Pool can pickle the initializer.
    pool = Pool(WORKERS_LOWRES, initializer=_init_worker, initargs=(DET_SIZE_LOWRES,))
    t = time.time()
    n = err = 0
    try:
        for pid, res in pool.imap_unordered(
            _work, ((pid, photos[pid]) for pid in remaining), chunksize=4
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

    tmp = cache_path + ".tmp"
    with open(tmp, "wb") as f:
        pickle.dump(cache, f)
    os.replace(tmp, cache_path)
    total = len(photos)
    print(
        f"batch={n} err={err} | cached {len(cache)}/{total} "
        f"({len(cache) * 100 // total}%) | remaining {total - len(cache)} | "
        f"{round(time.time() - t, 1)}s"
    )


# --- worker (module-level so multiprocessing can pickle it) ----------------

_DET = _REC = _FACE = None


def _init_worker(det_size):
    global _DET, _REC, _FACE
    _DET, _REC, _FACE = make_face_analyser(det_size=det_size)


def _work(args):
    pid, photo = args
    img = fetch_image(flickr_url(photo, SIZE_LOWRES))
    if img is None:
        return pid, "ERR"
    bboxes, kpss = _DET.detect(img, max_num=0, metric="default")
    out = []
    for i, bb in enumerate(bboxes):
        x1, y1, x2, y2 = bb[:4]
        if min(x2 - x1, y2 - y1) < 40:
            continue  # skip faces too tiny to recognise reliably at 640px
        f = _FACE(bbox=bb[:4], kps=kpss[i], det_score=float(bb[4]))
        emb = normalize(_REC.get(img, f))
        out.append((bb[:4].astype(np.float32).tolist(), float(bb[4]), emb.astype(np.float16)))
    return pid, out


if __name__ == "__main__":
    main()
