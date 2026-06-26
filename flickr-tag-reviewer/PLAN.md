# Flickr Face-Tag Reviewer — Plan

A small **local** web app to review the face-recognition suggestions and post approved
person-tags to Flickr. Runs entirely on your machine; your Flickr key never leaves it.

## What I confirmed from your files
- Suggestion file: **4,160 photos / 5,280 candidate tags**.
- Each block is:
  ```
  Photo link: https://www.flickr.com/photos/icpcnews/<photo_id>
  Year/event: <year> / <events>
  New tags:
    "James Comer(4c3f2bc070306b9f)"  # cos=0.565, lowres
  ```
- The hex is **rect64**: 4 groups of 4 hex chars, each `value/65535` → fractional
  `(x1, y1, x2, y2)` of the image. Decoding the samples gives sensible face boxes, so
  rectangles can be drawn on any image size without extra info.

## How tags get posted to Flickr (my assumption — please confirm)
Your description ("tags are name + hex rectangle") matches a **literal Flickr tag string**,
so Approve → `flickr.photos.addTags(photo_id, tags='"James Comer(4c3f2bc070306b9f)"')`
(quoted so the whole thing is one tag). This needs a **write-authorized** key.
> If instead you meant Flickr's *people-in-photo* notes (`flickr.photos.people.add`,
> which needs each person to be a Flickr user), tell me — the rest of the app is the same.

## Storage (so you can review in batches over many days)
**SQLite** file (`data/reviewer.db`). State persists; stop and resume anytime.
- `suggestions`: one row per `(photo_id, person_name, rect_hex)` with cos, res,
  confidence note, and **status** = pending / approved / posted / rejected / skipped / duplicate.
- `photos`: cached Flickr image URL, dimensions, and existing tags.
- `imports`: log of each txt import.
- Unique key on `(photo_id, person_name, rect_hex)`.

## Re-importing an updated txt (re-run with new params)
Importer **upserts** by that unique key:
- new combos → added as `pending`;
- combos you already reviewed → **status preserved** (never re-asks you);
- cos/res metadata refreshed. You get a summary: *N new, M unchanged, K already-reviewed*.

## Existing-tag dedup (don't suggest what's already there)
At review time the app calls `flickr.photos.getInfo` to fetch the photo's current tags,
shows them **on the image in a different color** ("already tagged"), and auto-flags any
suggestion whose person already exists as `duplicate` (hidden by default, but you can still
post a different rectangle if you want).

## Review UI (built for speed across thousands)
- One photo at a time: real Flickr image with **suggested boxes (by confidence color)** +
  **existing tags (grey)** overlaid, name labels.
- Per suggestion: **Approve / Reject / Skip**; Approve posts to Flickr and marks `posted`.
- Filters: status, confidence tier (≥0.55 high, 0.45–0.55 medium, <0.45 borderline), year/event.
- Keyboard shortcuts (a/r/s, ←/→), running progress counter (`x / 5280`).
- "Approve all high-confidence on this photo" convenience button.

## How you provide your key (locally, never to me)
1. Create an app key at https://www.flickr.com/services/apps/create (gives **Key + Secret**).
2. Copy `config.example.json` → `config.local.json` (gitignored) and paste Key + Secret.
3. Click **Authorize with Flickr** in the app once → it does the OAuth dance and stores a
   token in `data/` (gitignored). No keys in code, none shared with me.

## Tech
Python + Flask + SQLite, `flickrapi` for the API/OAuth, vanilla HTML/CSS/JS frontend.

## Testing limits in this environment
This session is **network-restricted** (Flickr is unreachable here) and I won't have your
key, so I can't do a real end-to-end post. I'll verify everything else with a **mock mode**
(local sample image + the real rectangles, full approve/reject/skip/dedup flow + DB
persistence), and you run the real Flickr part locally. I can record the mock-mode walkthrough.
