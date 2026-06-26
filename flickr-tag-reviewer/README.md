# Flickr Face-Tag Reviewer

A small **local** web app to review the face-recognition tag suggestions for the
ICPC Flickr gallery and post the ones you approve back to Flickr. Everything runs
on your machine; your Flickr API key stays local and is never sent anywhere else.

## What it does
- Parses your `gallery-face-tag-suggestions.txt` (4,160 photos / 5,280 candidate tags).
- Shows each photo with the suggested **person + rectangle** drawn on it, colored by
  confidence; existing Flickr tags are drawn dashed/grey so you don't double-tag.
- Flags a suggestion as **possible duplicate** when the same person already appears in
  the photo's Flickr tags — matching is fuzzy, so reordered names ("Comer James" vs
  "James Comer") and common nicknames ("Bill Poucher" vs "William Poucher") are caught.
  It's only a hint: the suggestion stays fully reviewable and is never auto-rejected.
- Approve / Reject / Skip each suggestion. **Approve posts the tag to Flickr.**
- Remembers everything in a local SQLite db, so you can review a few now and more later.
- Re-import an updated suggestions file anytime — new entries appear as pending,
  and anything you already reviewed keeps its decision.

## Quick start

### macOS / Linux
```bash
# 1. (optional but recommended) create your Flickr credentials file
cp config.example.json config.local.json
#    then edit config.local.json and paste your Key + Secret

# 2. run — pass the suggestions txt the first time to import it
./run.sh /path/to/gallery-face-tag-suggestions.txt
#    (subsequent runs: just ./run.sh)

# 3. open http://127.0.0.1:5057
```

### Windows (Command Prompt — no PowerShell needed)
Requires Python 3 from <https://www.python.org/downloads/> (tick **"Add python.exe to PATH"** during install).
```bat
REM 1. (optional but recommended) create your Flickr credentials file
copy config.example.json config.local.json
REM    then edit config.local.json and paste your Key + Secret

REM 2. run — pass the suggestions txt the first time to import it
run.bat C:\path\to\gallery-face-tag-suggestions.txt
REM    (subsequent runs: just run.bat — or simply double-click run.bat)

REM 3. open http://127.0.0.1:5057
```

Or manually:
```bash
# macOS / Linux
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/import_suggestions.py /path/to/gallery-face-tag-suggestions.txt
python -m reviewer.app          # http://127.0.0.1:5057
```
```bat
REM Windows (Command Prompt)
python -m venv .venv && .venv\Scripts\activate.bat
pip install -r requirements.txt
python scripts\import_suggestions.py C:\path\to\gallery-face-tag-suggestions.txt
python -m reviewer.app          REM http://127.0.0.1:5057
```
To use a different port: `set PORT=8000` (Windows) / `PORT=8000 ./run.sh` (macOS/Linux).

## Providing your Flickr key (stays on your machine)
1. Create an app at <https://www.flickr.com/services/apps/create> to get an **API Key + Secret**.
2. `cp config.example.json config.local.json` and paste the Key and Secret.
   (`config.local.json` is gitignored.) Alternatively set `FLICKR_API_KEY` /
   `FLICKR_API_SECRET` environment variables.
3. Start the app, click **Authorize Flickr**, open the link, approve **write** access,
   and paste the code Flickr gives you. The token is cached locally so you only do this once.

If no key is configured, the app runs in **MOCK MODE**: a local sample image with a
coordinate grid stands in for real photos, and "posting" is simulated — handy for trying
the workflow. A yellow `MOCK MODE` badge is shown.

## How approve maps to Flickr
Each suggestion is a literal Flickr tag of the form `Name(rect64hex)`. Approving calls
`flickr.photos.addTags(photo_id, '"Name(hex)"')` (quoted so it's stored as one raw tag).
The `rect64` hex is four 16-bit values `x1,y1,x2,y2`, each `/65535` → a fraction of the
image, which is how the rectangles are drawn.

## Re-importing updated suggestions
```bash
python scripts/import_suggestions.py /path/to/new-suggestions.txt
```
Upserts by `(photo_id, person_name, rectangle)`: new combos → pending; already-reviewed
combos keep their status; cosine/resolution metadata is refreshed. You get an N new /
M unchanged / K kept summary.

## Keyboard shortcuts
`a` approve · `r` reject · `s` skip · `←/→` previous/next photo.

## Files
- `reviewer/parser.py` — suggestion-file parser
- `reviewer/rect.py` — rect64 encode/decode
- `reviewer/db.py` — SQLite storage + import/upsert logic
- `reviewer/flickr_client.py` — Flickr API wrapper (+ mock)
- `reviewer/app.py` — Flask app & API
- `static/`, `templates/` — frontend
- `scripts/import_suggestions.py` — CLI importer
- `data/reviewer.db` — your local state (gitignored)
