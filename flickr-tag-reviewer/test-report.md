# Flickr Face-Tag Reviewer — Mock-Mode Walkthrough Test Report

**Date:** 2026-06-19
**Mode:** Mock (offline; no Flickr network/key). Sample 1024×768 coordinate-grid image; real rectangles from your suggestions file.
**Data loaded:** 4160 photos / 5280 suggestions, imported from `gallery-face-tag-suggestions.txt`.
**App:** `http://127.0.0.1:5057` (`REVIEWER_MOCK=1`).

## Summary

All tested workflows passed. One bug was found and fixed mid-session (duplicate flag not re-applied on cache hits — details below).

| # | Test | Result |
|---|------|--------|
| 1 | rect64 overlays render on coordinate grid | PASS |
| 2 | Approve posts (mock) and advances; counters update | PASS |
| 3 | Reject updates status and advances | PASS |
| 4 | Skip updates status and advances | PASS |
| 5 | Jump-to-photo by photo ID | PASS |
| 6 | Duplicate flagging (person already tagged) | PASS (after fix) |
| 7 | Arrow-key navigation through queue | PASS |
| 8 | Review state persists across page refresh | PASS |

---

## 1–4. Approve / Reject / Skip

Approving Ed Corwin (photo 1, `a` key) showed "Approved (mock post)", incremented `posted`, and auto-advanced. Rejecting (`r`) and Skipping (`s`) behaved the same for their counters. After three actions the header read `posted 1 · rejected 1 · skipped 1`, and the three fully-reviewed photos dropped out of the open queue (4160 → 4157).

Skip on photo 4 (Carlos Ferreira), header shows `skipped 1`:

![Skip action](https://staging.itsdev.in/attachments/702839d7-304b-41ff-bbf5-7f668986df1b/ss_c8c6c3a5.png)

## 5–6. Jump-to-photo + duplicate flagging

Typed photo ID `26710994406` into the "go to" box and jumped straight to it. This photo has **Bill Poucher** already tagged on Flickr (mock) *and* suggested by the face-recog output. The suggestion is correctly flagged **duplicate · "person already tagged on this photo"**, and the header `dup` counter increments. The duplicate is still reviewable (you can override and Approve if you disagree).

![Duplicate flagged](https://staging.itsdev.in/attachments/b7af4108-5b61-4b80-b3a5-8c6688f5523c/ss_26d86fe7.png)

### Bug found & fixed during this test

Initially Bill Poucher showed as `pending`, not `duplicate`, even though he was listed under "Already on photo". Root cause: dedup (`mark_duplicates`) only ran when the Flickr tag cache was *stale* (`need_img or need_tags`). On a cache hit — or after a suggestion's status was reset — it never re-ran, so the flag was missed. Screenshot of the buggy state:

![Duplicate not flagged (bug)](https://staging.itsdev.in/attachments/fc9aae10-fe00-4fc9-97b8-932d92b9d723/ss_13b95533.png)

**Fix** (`reviewer/app.py`, `_photo_payload`): re-derive duplicate flags from whatever existing tags we have (cached or freshly fetched) on **every** photo load. `mark_duplicates` only touches still-pending rows, so it never clobbers Approve/Reject/Skip decisions. After the fix, the duplicate is flagged on load as shown above.

## 7. Arrow-key navigation

`←` / `→` move through the queue; position counter and photo payload update each time (shown at photo 2/4157, Wei Xu).

![Arrow navigation](https://staging.itsdev.in/attachments/22cb8339-ca24-4f09-a50e-228fa7e54922/ss_75619841.png)

## 8. Persistence across refresh

Hard-refreshed the page. The header retained `posted 1 · rejected 1 · skipped 1 · dup 1`, and the queue still excluded the already-reviewed photos — confirming all state lives in SQLite (`data/reviewer.db`) and survives restarts, so you can review in batches across multiple days.

![Persistence after refresh](https://staging.itsdev.in/attachments/b6f9357c-c6c1-44c7-8a26-1c773faa7738/ss_4e5540b4.png)

---

## Not covered here (requires your machine)

- **Real Flickr calls** (fetch real photo + existing tags, OAuth authorize, actually posting an approved tag). The environment is network-restricted and I don't have your key by design. You run this locally with your own Key+Secret (see README / setup steps).
