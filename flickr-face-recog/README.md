# Flickr face-recognition pipeline

Find untagged appearances of specific people in a large Flickr photoset by
matching faces against a small set of reference portraits.

Built for the ICPCNews public photostream (~69k photos), but works against any
photoset where you can produce a list of `(id, server, secret)` triples.

## What it does

1. **Embed every photo.** Run InsightFace's `buffalo_l` model over every face
   in every photo (one batch at a time, resumable). One 512-d L2-normalised
   embedding per detected face. Cached in `embcache.pkl`.
2. **Embed your references.** Same model, applied to one or more portrait URLs
   per person. Cached in `ref_embeddings.pkl`.
3. **Match.** For each photo-face, take the cosine against every reference;
   keep hits above `COSINE_THRESHOLD` (default 0.42).
4. **Rescan weak hits at higher resolution.** Photos that matched at low
   confidence get re-embedded from the 1024px `_b` URL instead of the 640px
   `_z` URL — often disambiguates.
5. **Review.** Generate a single-file HTML sheet with reference crop ⇄ hit
   crop side-by-side, ✓/✗/? buttons per row, a sticky tally, and a "show
   summary" button that dumps your verdicts.

## Install

```bash
pip install -r requirements.txt
```

InsightFace will download `buffalo_l` (~250 MB) into `~/.insightface/` the
first time you run an embedder. Everything else is local.

## Try the demo

```bash
python demo.py
```

First run:
- Writes `data/photos.json` with 5 real ICPCNews Flickr photo records.
- Writes `data/references.json` from the example template.
- Embeds the 5 photos in one batch (~30s on CPU).
- Stops and asks you to add real portrait URLs.

Edit `data/references.json` — replace the `example.com` URL with a public
portrait URL of someone you want to find, then re-run:

```bash
python demo.py
```

Second run does build_refs → match → dl_crops → build_sheet end-to-end, and
prints the path to `data/review_sheet.html`. Open it in a browser.

## Input data formats

### `photos.json`

Array of records, one per photo. Only the IDs are required — the rest is
metadata that surfaces on the review sheet:

```json
[
  {"id": "26649123441", "sv": "1474", "sc": "2340182a1d",
   "yr": "2012", "ev": ["eventclisymposium"], "pk": []}
]
```

- `id` / `sv` / `sc`: Flickr photo id, server, and secret.
  URL = `https://live.staticflickr.com/{sv}/{id}_{sc}_z.jpg`.
- `yr`: optional year string, shown next to the cosine score.
- `ev`: optional list of event tags, also shown.
- `pk`: optional list of people tags (for your own bookkeeping; the matcher
  ignores it).

You produce this from a Flickr API export, a scrape, or whatever — it's just
the static URL-building inputs plus some metadata.

### `references.json`

Array of records, one per person you want to find:

```json
[
  {"person_id": "alice",
   "name":      "Alice Example",
   "portraits": [
     {"url": "https://example.org/alice.jpg",
      "face_box": [0.30, 0.10, 0.70, 0.65]}
   ]}
]
```

- `person_id`: stable unique slug (used in filenames and JSON keys).
- `name`: display name for the review sheet.
- `portraits`: one or more. `face_box` is optional — fractional
  `(x1, y1, x2, y2)` to disambiguate when a portrait has multiple faces. If
  omitted, the largest detected face is used.

## Manual pipeline (without `demo.py`)

```bash
# 1. Put your photos.json and references.json in ./data/
#    (or set FACEREC_ROOT to point somewhere else)

# 2. Embed every photo. Run repeatedly until it prints "ALL DONE".
python embed_photos.py
# ...or in parallel across 4 shards:
SHARD=0 NSHARDS=4 python embed_photos.py &
SHARD=1 NSHARDS=4 python embed_photos.py &
SHARD=2 NSHARDS=4 python embed_photos.py &
SHARD=3 NSHARDS=4 python embed_photos.py &
wait

# 3. Build reference embeddings (same — re-run until "ALL DONE").
python build_refs.py

# 4. Match. Writes match_results.json, sheets_plan.pkl, targeted_set.pkl.
python match.py

# 5. (Optional) Rescan weak matches at higher resolution.
python embed_hires.py        # re-run until "TARGETED ALL DONE"
python match.py              # re-match with the merged hires + lowres cache

# 6. Download crops the review sheet will inline. Re-run until done.
python dl_crops.py

# 7. Render the review sheet.
python build_sheet.py
# → data/review_sheet.html
```

## Why "one batch at a time"

Each script does ~40 seconds of work and exits. Cache + resume happens via
on-disk pickle files. This makes the pipeline trivially re-runnable in
sandboxed environments with short timeouts, and makes it easy to shard the
expensive embedding step across processes (the `SHARD` env var). On a normal
laptop you can raise `BATCH_SECONDS` in `config.py` to anything you like.

## Tuning

All knobs are in `config.py`:

- `COSINE_THRESHOLD` — drops candidates below this. 0.42 catches almost
  everything plausible; 0.55 is "obviously the same person"; <0.45 is a
  low-confidence bucket where the hires rescan helps a lot.
- `TOP_PER_PERSON` — caps the review sheet at this many candidates per
  person (default 6). Hits beyond the cap are in `match_results.json` but
  not on the sheet.
- `DET_SIZE_LOWRES` / `DET_SIZE_HIRES` — InsightFace detection window. Bigger
  catches smaller faces, costs more compute.
- `WORKERS_LOWRES` / `WORKERS_HIRES` — number of parallel processes.

## File layout

```
config.py             — paths and tuning knobs
_common.py            — Flickr URL building, HTTP, crop, InsightFace init
embed_photos.py       — scan every photo at _z (640px). Resumable. Shardable.
embed_hires.py        — rescan a targeted subset at _b (1024px).
build_refs.py         — embed reference portraits.
match.py              — cross-product cosine, writes match_results + plan.
dl_crops.py           — fetch + crop the photos shown on the sheet.
build_sheet.py        — render review_sheet.html with inlined base64 crops.
demo.py               — end-to-end demo using 5 ICPCNews photos.
demo_data/            — seed data for the demo.
data/                 — your working dir (gitignored; created at first run).
```

## Limitations

- CPU only. InsightFace works on GPU too — set `providers=['CUDAExecutionProvider']`
  in `_common.make_face_analyser` if you have CUDA configured.
- The matcher considers each photo-face independently. It doesn't try to
  cluster faces across the photoset (e.g. "all photos containing the same
  unknown person").
- Flickr image URLs are tied to `(id, server, secret)` triples; if Flickr ever
  rotates the secret, those URLs break. The IDs themselves are stable.

## License

MIT.
