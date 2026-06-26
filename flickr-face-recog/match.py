"""Cross-match photo embeddings against reference embeddings.

Reads:
  embcache.pkl        — every face found in the photos (lowres scan)
  embcache_s*.pkl     — shard caches (merged in)
  targeted_emb.pkl    — higher-res rescans (override lowres for the same photo)
  ref_embeddings.pkl  — one or more embeddings per known person
  photos.json         — for year + event tags shown on the review sheet

Writes:
  match_results.json  — every (person, photo, face) triple with cosine ≥ threshold
  targeted_set.pkl    — photos worth rescanning at higher res (used by embed_hires.py)
  sheets_plan.pkl     — grouping into review sheets, top-K per person

This is the step that was kept ad-hoc during the original run; here it's a
proper script you can re-run any time after embedders update their caches.
"""
import glob
import json
import os
import pickle
import sys
from collections import defaultdict

import numpy as np

from config import (
    COSINE_THRESHOLD, EMB_CACHE, MATCH_RESULTS, PHOTOS_JSON, REF_EMBEDDINGS,
    ROOT, SHEETS_PLAN, TARGETED_EMB, TOP_PER_PERSON,
)

TARGETED_SET = os.path.join(ROOT, "targeted_set.pkl")


def load_emb_cache():
    """Merge all shard caches and the main cache; prefer hires per-photo."""
    cache = {}
    if os.path.exists(EMB_CACHE):
        cache.update(pickle.load(open(EMB_CACHE, "rb")))
    for f in sorted(glob.glob(EMB_CACHE.replace(".pkl", "_s*.pkl"))):
        try:
            cache.update(pickle.load(open(f, "rb")))
        except Exception:
            pass
    res_for = {pid: "lowres" for pid in cache}
    if os.path.exists(TARGETED_EMB):
        for pid, faces in pickle.load(open(TARGETED_EMB, "rb")).items():
            if faces:                    # only override if hires actually found a face
                cache[pid] = faces
                res_for[pid] = "hires"
    return cache, res_for


def main():
    photos = {p["id"]: p for p in json.load(open(PHOTOS_JSON))}
    refs = pickle.load(open(REF_EMBEDDINGS, "rb"))      # {person_id: (N, 512)}
    if not refs:
        print("no reference embeddings yet — run build_refs.py first")
        sys.exit(1)
    cache, res_for = load_emb_cache()
    if not cache:
        print("no photo embeddings yet — run embed_photos.py first")
        sys.exit(1)

    names = _load_names()

    # Stack all references into one (Nref, 512) matrix so we can take a single
    # photo-face vs every-ref dot product.
    ref_owner = []   # parallel to rows of ref_matrix: who does row i belong to?
    rows = []
    for person_id, mat in refs.items():
        for v in mat:
            rows.append(v.astype(np.float32))
            ref_owner.append(person_id)
    ref_matrix = np.vstack(rows) if rows else np.zeros((0, 512), dtype=np.float32)

    matches = []
    for pid, faces in cache.items():
        if not faces:
            continue
        for bbox, det_score, emb16 in faces:
            emb = np.asarray(emb16, dtype=np.float32)
            sims = ref_matrix @ emb            # cosine, embeddings already L2-normalised
            # Per-person max sim (a person may have multiple ref portraits)
            per_person = defaultdict(float)
            for i, s in enumerate(sims):
                if s > per_person[ref_owner[i]]:
                    per_person[ref_owner[i]] = float(s)
            for person_id, sim in per_person.items():
                if sim < COSINE_THRESHOLD:
                    continue
                ev = _parse_list(photos[pid].get("ev", ""))
                matches.append({
                    "person_id": person_id,
                    "name":      names.get(person_id, person_id),
                    "pid":       pid,
                    "sim":       round(sim, 3),
                    "bbox":      [float(x) for x in bbox],
                    "yr":        photos[pid].get("yr"),
                    "ev":        ev,
                    "res":       res_for.get(pid, "lowres"),
                })

    matches.sort(key=lambda m: (m["person_id"], -m["sim"]))
    with open(MATCH_RESULTS, "w") as f:
        json.dump(matches, f, indent=2)
    print(f"wrote {len(matches)} matches → {MATCH_RESULTS}")

    # Build the sheets plan: top-K hits per person.
    by_person = defaultdict(list)
    for m in matches:
        if len(by_person[m["person_id"]]) < TOP_PER_PERSON:
            by_person[m["person_id"]].append(m)
    sheets_plan = {
        "people": sorted(by_person.keys()),
        "by_person": dict(by_person),
    }
    with open(SHEETS_PLAN, "wb") as f:
        pickle.dump(sheets_plan, f)
    print(f"wrote sheets plan: {len(by_person)} people with ≥1 candidate → {SHEETS_PLAN}")

    # Photos that matched at low confidence and are still at lowres → worth a hires rescan.
    targeted = sorted({
        m["pid"] for m in matches
        if m["res"] == "lowres" and m["sim"] < 0.55
    })
    with open(TARGETED_SET, "wb") as f:
        pickle.dump({"all_targets": targeted}, f)
    print(f"wrote {len(targeted)} photos for hires rescan → {TARGETED_SET}")


def _load_names():
    """Pull display names out of references.json so the matcher can label hits."""
    from config import REFERENCES_JSON
    if not os.path.exists(REFERENCES_JSON):
        return {}
    return {r["person_id"]: r.get("name", r["person_id"]) for r in json.load(open(REFERENCES_JSON))}


def _parse_list(s):
    """photos.json stores tag lists as their repr — undo that."""
    if isinstance(s, list):
        return s
    if isinstance(s, str) and s.startswith("["):
        try:
            import ast
            return ast.literal_eval(s)
        except Exception:
            return [s]
    return [s] if s else []


if __name__ == "__main__":
    main()
