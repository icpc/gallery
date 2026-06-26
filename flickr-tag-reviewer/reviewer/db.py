"""SQLite storage for review state.

State persists across sessions so review can be done in batches. Re-importing an
updated suggestion file upserts by ``(photo_id, person_name, rect_hex)``: brand-new
combinations are added as ``pending``; anything already reviewed keeps its status.
"""
from __future__ import annotations

import json
import os
import sqlite3
import time
from contextlib import contextmanager

from .names import matches_any as same_person_matches_any
from .parser import ParsedPhoto

# Suggestion statuses
PENDING = "pending"
APPROVED = "approved"   # user said yes, not yet confirmed posted to Flickr
POSTED = "posted"       # successfully posted to Flickr
REJECTED = "rejected"
SKIPPED = "skipped"
DUPLICATE = "duplicate"  # person already tagged on the photo
OPEN_STATUSES = (PENDING, DUPLICATE)

SCHEMA = """
CREATE TABLE IF NOT EXISTS imports (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    filename     TEXT,
    imported_at  REAL,
    n_photos     INTEGER DEFAULT 0,
    n_new        INTEGER DEFAULT 0,
    n_unchanged  INTEGER DEFAULT 0,
    n_kept       INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS photos (
    photo_id          TEXT PRIMARY KEY,
    flickr_url        TEXT,
    year              TEXT,
    events            TEXT,
    image_url         TEXT,
    image_w           INTEGER,
    image_h           INTEGER,
    existing_tags     TEXT,          -- JSON list of {raw, clean}
    tags_fetched_at   REAL,
    sizes_fetched_at  REAL
);

CREATE TABLE IF NOT EXISTS suggestions (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id         TEXT NOT NULL,
    person_name      TEXT NOT NULL,
    rect_hex         TEXT NOT NULL,
    cos              REAL,
    res              TEXT,
    conf_note        TEXT,
    status           TEXT NOT NULL DEFAULT 'pending',
    source_import_id INTEGER,
    flickr_response  TEXT,
    note             TEXT,
    created_at       REAL,
    updated_at       REAL,
    UNIQUE(photo_id, person_name, rect_hex)
);

CREATE INDEX IF NOT EXISTS idx_sugg_photo  ON suggestions(photo_id);
CREATE INDEX IF NOT EXISTS idx_sugg_status ON suggestions(status);

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
);
"""

_DEFAULT_DB = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "reviewer.db")


def confidence_tier(cos: float | None) -> str:
    if cos is None:
        return "unknown"
    if cos >= 0.55:
        return "high"
    if cos >= 0.45:
        return "medium"
    return "borderline"


class DB:
    def __init__(self, path: str | None = None):
        self.path = path or os.environ.get("REVIEWER_DB", _DEFAULT_DB)
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        self.init()

    @contextmanager
    def conn(self):
        c = sqlite3.connect(self.path)
        c.row_factory = sqlite3.Row
        c.execute("PRAGMA foreign_keys = ON")
        try:
            yield c
            c.commit()
        finally:
            c.close()

    def init(self):
        with self.conn() as c:
            c.executescript(SCHEMA)

    # ---- import -----------------------------------------------------------
    def import_photos(self, photos: list[ParsedPhoto], filename: str) -> dict:
        now = time.time()
        n_new = n_unchanged = n_kept = 0
        with self.conn() as c:
            cur = c.execute(
                "INSERT INTO imports (filename, imported_at, n_photos) VALUES (?,?,?)",
                (filename, now, len(photos)),
            )
            import_id = cur.lastrowid
            for p in photos:
                c.execute(
                    """INSERT INTO photos (photo_id, flickr_url, year, events)
                       VALUES (?,?,?,?)
                       ON CONFLICT(photo_id) DO UPDATE SET
                         flickr_url=excluded.flickr_url,
                         year=excluded.year,
                         events=excluded.events""",
                    (p.photo_id, p.flickr_url, p.year, p.events),
                )
                for t in p.tags:
                    row = c.execute(
                        "SELECT id, status FROM suggestions WHERE photo_id=? AND person_name=? AND rect_hex=?",
                        (p.photo_id, t.name, t.rect_hex),
                    ).fetchone()
                    if row is None:
                        c.execute(
                            """INSERT INTO suggestions
                               (photo_id, person_name, rect_hex, cos, res, conf_note,
                                status, source_import_id, created_at, updated_at)
                               VALUES (?,?,?,?,?,?,?,?,?,?)""",
                            (p.photo_id, t.name, t.rect_hex, t.cos, t.res, t.conf_note,
                             PENDING, import_id, now, now),
                        )
                        n_new += 1
                    else:
                        # refresh metadata, but never disturb a status the user set
                        c.execute(
                            "UPDATE suggestions SET cos=?, res=?, conf_note=? WHERE id=?",
                            (t.cos, t.res, t.conf_note, row["id"]),
                        )
                        if row["status"] in OPEN_STATUSES:
                            n_unchanged += 1
                        else:
                            n_kept += 1
            c.execute(
                "UPDATE imports SET n_new=?, n_unchanged=?, n_kept=? WHERE id=?",
                (n_new, n_unchanged, n_kept, import_id),
            )
        return {"import_id": import_id, "n_photos": len(photos),
                "n_new": n_new, "n_unchanged": n_unchanged, "n_kept": n_kept}

    # ---- queries ----------------------------------------------------------
    def stats(self) -> dict:
        with self.conn() as c:
            rows = c.execute("SELECT status, COUNT(*) n FROM suggestions GROUP BY status").fetchall()
            by_status = {r["status"]: r["n"] for r in rows}
            total = sum(by_status.values())
            n_photos = c.execute("SELECT COUNT(*) n FROM photos").fetchone()["n"]
        reviewed = sum(by_status.get(s, 0) for s in (APPROVED, POSTED, REJECTED, SKIPPED))
        return {"total": total, "reviewed": reviewed, "by_status": by_status, "n_photos": n_photos}

    def photo_ids_with_open_suggestions(self, tier: str | None = None,
                                        event: str | None = None) -> list[str]:
        q = ("SELECT DISTINCT s.photo_id FROM suggestions s JOIN photos p ON p.photo_id=s.photo_id "
             "WHERE s.status IN ('pending','duplicate')")
        args: list = []
        if event:
            q += " AND p.events LIKE ?"
            args.append(f"%{event}%")
        q += " ORDER BY s.photo_id"
        with self.conn() as c:
            ids = [r["photo_id"] for r in c.execute(q, args).fetchall()]
        if tier:
            ids = [pid for pid in ids if any(confidence_tier(s["cos"]) == tier
                   for s in self.suggestions_for(pid) if s["status"] in OPEN_STATUSES)]
        return ids

    def get_photo(self, photo_id: str) -> dict | None:
        with self.conn() as c:
            r = c.execute("SELECT * FROM photos WHERE photo_id=?", (photo_id,)).fetchone()
            return dict(r) if r else None

    def suggestions_for(self, photo_id: str) -> list[dict]:
        with self.conn() as c:
            rows = c.execute(
                "SELECT * FROM suggestions WHERE photo_id=? ORDER BY cos DESC", (photo_id,)
            ).fetchall()
        out = []
        for r in rows:
            d = dict(r)
            d["tier"] = confidence_tier(r["cos"])
            out.append(d)
        return out

    def get_suggestion(self, sugg_id: int) -> dict | None:
        with self.conn() as c:
            r = c.execute("SELECT * FROM suggestions WHERE id=?", (sugg_id,)).fetchone()
            return dict(r) if r else None

    def set_status(self, sugg_id: int, status: str, flickr_response: str | None = None,
                   note: str | None = None):
        with self.conn() as c:
            c.execute(
                "UPDATE suggestions SET status=?, flickr_response=COALESCE(?, flickr_response), "
                "note=COALESCE(?, note), updated_at=? WHERE id=?",
                (status, flickr_response, note, time.time(), sugg_id),
            )

    def cache_photo_meta(self, photo_id: str, image_url: str | None, w: int | None,
                         h: int | None, existing_tags: list[dict] | None):
        now = time.time()
        with self.conn() as c:
            if image_url is not None:
                c.execute(
                    "UPDATE photos SET image_url=?, image_w=?, image_h=?, sizes_fetched_at=? WHERE photo_id=?",
                    (image_url, w, h, now, photo_id),
                )
            if existing_tags is not None:
                c.execute(
                    "UPDATE photos SET existing_tags=?, tags_fetched_at=? WHERE photo_id=?",
                    (json.dumps(existing_tags), now, photo_id),
                )

    def mark_duplicates(self, photo_id: str, existing_names: set[str]):
        """Re-derive duplicate flags from the current existing tags.

        Promotes pending -> duplicate when the person is likely already tagged,
        and demotes duplicate -> pending when they're no longer tagged (e.g.
        after stale mock tags get replaced by real Flickr tags). Matching is
        fuzzy (see ``names.same_person``): exact, reordered ("Comer James" vs
        "James Comer"), and nickname ("Bill Poucher" vs "William Poucher")
        variants all count, which is why the UI calls it a *possible* duplicate.
        Only ever touches still-open rows; user decisions
        (approved/posted/rejected/skipped) are left alone.
        """
        candidates = [n.strip() for n in existing_names if n and n.strip()]
        with self.conn() as c:
            for r in c.execute(
                "SELECT id, person_name, status FROM suggestions WHERE photo_id=?", (photo_id,)
            ).fetchall():
                present = same_person_matches_any(r["person_name"], candidates)
                if r["status"] == PENDING and present:
                    c.execute("UPDATE suggestions SET status=?, updated_at=? WHERE id=?",
                              (DUPLICATE, time.time(), r["id"]))
                elif r["status"] == DUPLICATE and not present:
                    c.execute("UPDATE suggestions SET status=?, updated_at=? WHERE id=?",
                              (PENDING, time.time(), r["id"]))

    # ---- settings ---------------------------------------------------------
    def get_setting(self, key: str, default=None):
        with self.conn() as c:
            r = c.execute("SELECT value FROM settings WHERE key=?", (key,)).fetchone()
            return r["value"] if r else default

    def set_setting(self, key: str, value: str):
        with self.conn() as c:
            c.execute("INSERT INTO settings(key,value) VALUES(?,?) "
                      "ON CONFLICT(key) DO UPDATE SET value=excluded.value", (key, value))
