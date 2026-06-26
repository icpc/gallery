#!/usr/bin/env python3
"""Import (or re-import) a suggestion txt file into the review database.

Usage:
    python scripts/import_suggestions.py path/to/gallery-face-tag-suggestions.txt

Safe to run repeatedly. New (photo, name, rectangle) combinations are added as
pending; anything you already reviewed keeps its status.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from reviewer.db import DB
from reviewer.parser import parse_file


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("path", help="suggestion .txt file")
    ap.add_argument("--db", help="sqlite db path (default data/reviewer.db)")
    args = ap.parse_args()

    if not os.path.exists(args.path):
        sys.exit(f"file not found: {args.path}")

    photos = parse_file(args.path)
    ntags = sum(len(p.tags) for p in photos)
    db = DB(args.db)
    res = db.import_photos(photos, os.path.basename(args.path))

    print(f"Parsed {len(photos)} photos / {ntags} tags from {args.path}")
    print(f"  new (added as pending):        {res['n_new']}")
    print(f"  unchanged (still open):        {res['n_unchanged']}")
    print(f"  kept (already reviewed):       {res['n_kept']}")
    st = db.stats()
    print(f"DB now: {st['total']} suggestions across {st['n_photos']} photos; "
          f"{st['reviewed']} reviewed.")


if __name__ == "__main__":
    main()
