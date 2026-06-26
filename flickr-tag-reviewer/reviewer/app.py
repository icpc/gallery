"""Flask app for reviewing face-tag suggestions and posting approved tags to Flickr."""
from __future__ import annotations

import os
import time

from flask import Flask, jsonify, render_template, request, send_from_directory

from .db import (APPROVED, DUPLICATE, OPEN_STATUSES, POSTED, REJECTED, SKIPPED, DB,
                 confidence_tier)
from .flickr_client import AuthError, get_client

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__, template_folder=os.path.join(BASE, "templates"),
            static_folder=os.path.join(BASE, "static"))

# Keyboard shortcuts (←/→ navigate, a=approve, r=reject, s=skip) are OFF by
# default so a stray keypress like Ctrl+R can never trigger an action. Flip this
# to True (or set env REVIEWER_HOTKEYS=1) if you want them back.
ENABLE_HOTKEYS = os.environ.get("REVIEWER_HOTKEYS") == "1"

db = DB()
_client = None


def client():
    global _client
    if _client is None:
        _client = get_client()
    return _client


# Cache existing tags / image meta for this long before refetching from Flickr.
META_TTL = 6 * 3600


def _photo_payload(photo_id: str) -> dict:
    """Assemble everything the UI needs for one photo, fetching/caching Flickr meta."""
    photo = db.get_photo(photo_id)
    if not photo:
        return {}
    now = time.time()
    c = client()
    err = None

    # A cached mock image (/static/...) while we're now in real mode — or a real
    # URL cached while in mock mode — is stale and must be refetched regardless of
    # TTL. This auto-heals photos you browsed before authorizing Flickr.
    cached_url = photo.get("image_url") or ""
    is_mock = bool(getattr(c, "mock", False))
    url_is_mock = cached_url.startswith("/static/")
    mode_mismatch = bool(cached_url) and (url_is_mock != is_mock)

    need_img = (not cached_url) or mode_mismatch or (now - (photo.get("sizes_fetched_at") or 0) > META_TTL)
    need_tags = (not photo.get("tags_fetched_at")) or mode_mismatch or (now - (photo.get("tags_fetched_at") or 0) > META_TTL)
    if need_img or need_tags:
        try:
            img = c.get_photo_image(photo_id) if need_img else None
            tags = c.get_existing_tags(photo_id) if need_tags else None
            db.cache_photo_meta(photo_id,
                                img["url"] if img else None,
                                img["width"] if img else None,
                                img["height"] if img else None,
                                tags)
            photo = db.get_photo(photo_id)
        except Exception as e:  # network/key problems shouldn't crash the UI
            err = str(e)

    import json
    existing = json.loads(photo.get("existing_tags") or "[]")
    # Re-derive duplicate flags from whatever existing tags we have (cached or
    # freshly fetched) so the flag stays correct across cache hits, status resets
    # and mock<->real switches. Always run it (even with no tags) so a stale
    # mock-derived "duplicate" flag is demoted back to pending. Only touches
    # still-open rows; user decisions are never disturbed.
    db.mark_duplicates(photo_id, {_name_part(t.get("raw", "")) for t in existing})
    suggestions = db.suggestions_for(photo_id)
    return {
        "photo_id": photo_id,
        "flickr_url": photo.get("flickr_url"),
        "year": photo.get("year"),
        "events": photo.get("events"),
        "image_url": photo.get("image_url"),
        "image_w": photo.get("image_w"),
        "image_h": photo.get("image_h"),
        "existing_tags": existing,
        "suggestions": suggestions,
        "error": err,
        "mock": getattr(c, "mock", False),
    }


def _name_part(raw_tag: str) -> str:
    """Extract the person name from a 'Name(hex)' raw tag, else return as-is."""
    if "(" in raw_tag and raw_tag.rstrip().endswith(")"):
        return raw_tag[: raw_tag.rfind("(")].strip()
    return raw_tag.strip()


@app.route("/")
def index():
    return render_template("index.html", enable_hotkeys=ENABLE_HOTKEYS)


@app.route("/api/stats")
def api_stats():
    s = db.stats()
    s["auth"] = client().auth_status()
    return jsonify(s)


@app.route("/api/queue")
def api_queue():
    tier = request.args.get("tier") or None
    event = request.args.get("event") or None
    ids = db.photo_ids_with_open_suggestions(tier=tier, event=event)
    return jsonify({"photo_ids": ids, "count": len(ids)})


@app.route("/api/photo/<photo_id>")
def api_photo(photo_id):
    payload = _photo_payload(photo_id)
    if not payload:
        return jsonify({"error": "photo not found"}), 404
    return jsonify(payload)


@app.route("/api/suggestion/<int:sugg_id>/<action>", methods=["POST"])
def api_action(sugg_id, action):
    sugg = db.get_suggestion(sugg_id)
    if not sugg:
        return jsonify({"error": "suggestion not found"}), 404

    if action == "approve":
        tag_text = f"{sugg['person_name']}({sugg['rect_hex']})"
        c = client()
        try:
            resp = c.add_tag(sugg["photo_id"], tag_text)
            import json
            db.set_status(sugg_id, POSTED, flickr_response=json.dumps(resp))
            return jsonify({"ok": True, "status": POSTED, "posted": True,
                            "mock": getattr(c, "mock", False), "response": resp})
        except Exception as e:
            # keep it as approved (intent recorded) even if the post failed
            db.set_status(sugg_id, APPROVED, note=f"post failed: {e}")
            return jsonify({"ok": False, "status": APPROVED, "posted": False,
                            "error": str(e)}), 502
    elif action == "reject":
        db.set_status(sugg_id, REJECTED)
        return jsonify({"ok": True, "status": REJECTED})
    elif action == "skip":
        db.set_status(sugg_id, SKIPPED)
        return jsonify({"ok": True, "status": SKIPPED})
    elif action == "unduplicate":
        db.set_status(sugg_id, "pending")
        return jsonify({"ok": True, "status": "pending"})
    else:
        return jsonify({"error": f"unknown action {action}"}), 400


@app.route("/api/auth/start", methods=["POST"])
def api_auth_start():
    try:
        url = client().start_auth()
        return jsonify({"auth_url": url, "mock": getattr(client(), "mock", False)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/auth/complete", methods=["POST"])
def api_auth_complete():
    verifier = (request.json or {}).get("verifier", "")
    try:
        res = client().complete_auth(verifier)
        return jsonify(res)
    except AuthError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/static/<path:fname>")
def static_files(fname):
    return send_from_directory(app.static_folder, fname)


def main():
    port = int(os.environ.get("PORT", "5057"))
    app.run(host="127.0.0.1", port=port, debug=True)


if __name__ == "__main__":
    main()
