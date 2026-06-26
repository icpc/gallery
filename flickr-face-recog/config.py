# Configuration for the Flickr face-recognition pipeline.
#
# Override these with the FACEREC_ROOT env var (one knob covers everything),
# or edit this file directly. ROOT is the only path you should ever need to set;
# all other paths are derived from it.

import os

ROOT = os.environ.get("FACEREC_ROOT", os.path.join(os.path.dirname(os.path.abspath(__file__)), "data"))

# --- Inputs -----------------------------------------------------------------
# photos.json: the list of Flickr photos to scan. See README for schema.
PHOTOS_JSON       = os.path.join(ROOT, "photos.json")
# references.json: the list of people-to-find + portrait URLs. See README.
REFERENCES_JSON   = os.path.join(ROOT, "references.json")

# --- Working caches ---------------------------------------------------------
EMB_CACHE         = os.path.join(ROOT, "embcache.pkl")          # one face-embedding per photo (lowres _z scan)
TARGETED_EMB      = os.path.join(ROOT, "targeted_emb.pkl")      # higher-res rescan for photos that matched at low confidence
REF_EMBEDDINGS    = os.path.join(ROOT, "ref_embeddings.pkl")    # one embedding per reference person

# --- Outputs ----------------------------------------------------------------
MATCH_RESULTS     = os.path.join(ROOT, "match_results.json")    # all candidate matches, before review
SHEETS_PLAN       = os.path.join(ROOT, "sheets_plan.pkl")       # per-round bucket of people/hits to review
CROPS_DIR         = os.path.join(ROOT, "crops")                 # cropped jpgs that the HTML sheet inlines
PHOTO_DIMS        = os.path.join(ROOT, "photo_dims.pkl")        # (w, h, size_suffix) cache for crop coordinates

# --- Tuning -----------------------------------------------------------------
COSINE_THRESHOLD  = 0.42    # candidates below this are dropped
TOP_PER_PERSON    = 6       # how many candidates per person on the review sheet
DET_SIZE_LOWRES   = (512, 512)
DET_SIZE_HIRES    = (800, 800)
WORKERS_LOWRES    = 4
WORKERS_HIRES     = 3
BATCH_SECONDS     = 40      # each batch script returns after this many seconds (designed for the Cowork sandbox; raise for local runs)
