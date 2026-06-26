"""End-to-end demo for the face-recognition pipeline.

What it does, in order:
  1. Seeds data/photos.json with 5 real ICPCNews Flickr photo records (publicly
     hosted on live.staticflickr.com — IDs and tokens only, no images shipped).
  2. Seeds data/references.json from demo_data/references.example.json *if* no
     references.json exists yet — that file contains placeholder URLs you must
     replace with real portrait URLs of people you want to find.
  3. Runs the embedder (single batch, ~40s) over the 5 photos.
  4. If references.json has at least one real portrait, runs build_refs → match
     → dl_crops → build_sheet end-to-end and prints the path to review_sheet.html.

Usage:
    cd face-recog-shareable
    pip install -r requirements.txt
    python demo.py
    # edit data/references.json to add real portrait URLs, then:
    python demo.py
"""
import json
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

# Make sure config.py / scripts use ./data/ unless the user overrode it.
os.environ.setdefault("FACEREC_ROOT", os.path.join(HERE, "data"))
ROOT = os.environ["FACEREC_ROOT"]
os.makedirs(ROOT, exist_ok=True)

from config import (
    MATCH_RESULTS, PHOTOS_JSON, REF_EMBEDDINGS, REFERENCES_JSON, SHEETS_PLAN,
)


def step(msg):
    print(f"\n=== {msg} ===")


def run(script):
    """Run a pipeline script as a subprocess so module-level state is fresh."""
    print(f"$ python {script}")
    res = subprocess.run(
        [sys.executable, os.path.join(HERE, script)],
        env={**os.environ, "FACEREC_ROOT": ROOT},
        cwd=HERE,
    )
    if res.returncode != 0:
        sys.exit(f"step failed: {script}")


def references_are_real():
    """True iff references.json has at least one non-placeholder portrait URL."""
    if not os.path.exists(REFERENCES_JSON):
        return False
    refs = json.load(open(REFERENCES_JSON))
    for r in refs:
        for p in r.get("portraits", []):
            url = p.get("url", "")
            if "example.com" not in url and "example/" not in url:
                return True
    return False


def main():
    step("Seed photos.json (5 public ICPCNews Flickr records)")
    if not os.path.exists(PHOTOS_JSON):
        shutil.copy(os.path.join(HERE, "demo_data", "photos.json"), PHOTOS_JSON)
        print(f"wrote {PHOTOS_JSON}")
    else:
        print(f"already exists, leaving in place: {PHOTOS_JSON}")

    step("Seed references.json (if missing)")
    if not os.path.exists(REFERENCES_JSON):
        shutil.copy(
            os.path.join(HERE, "demo_data", "references.example.json"),
            REFERENCES_JSON,
        )
        print(f"wrote {REFERENCES_JSON} — open it and replace the example portrait URLs with real ones")
    else:
        print(f"already exists, leaving in place: {REFERENCES_JSON}")

    step("Embed faces in the 5 photos (one ~40s batch)")
    run("embed_photos.py")

    if not references_are_real():
        print("\n--- Stopping after embedding step ---")
        print(f"Open {REFERENCES_JSON} and replace the example portrait URL")
        print("with a real public portrait URL of someone you want to find.")
        print("Then re-run: python demo.py")
        return

    step("Build reference embeddings")
    run("build_refs.py")

    step("Match photo faces against reference embeddings")
    run("match.py")
    matches = json.load(open(MATCH_RESULTS))
    print(f"{len(matches)} candidate matches above the cosine threshold")

    step("Download crops for the review sheet")
    run("dl_crops.py")

    step("Build the HTML review sheet")
    run("build_sheet.py")
    sheet = os.path.join(ROOT, "review_sheet.html")
    print(f"\nDone! Open: {sheet}")


if __name__ == "__main__":
    main()
