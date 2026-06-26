"""Render the HTML review sheet from the sheets plan + crops.

Output: review_sheet.html in the project root. Open in a browser to score
each candidate ✓ / ✗ / ?. Click "Show summary" at the top to dump verdicts.

The sheet inlines all crop jpgs as base64 so a single .html file is enough
to share for review (no separate image directory to keep in sync).
"""
import base64
import json
import os
import pickle

from config import CROPS_DIR, REFERENCES_JSON, ROOT, SHEETS_PLAN, TOP_PER_PERSON


def main():
    plan = pickle.load(open(SHEETS_PLAN, "rb"))
    people = plan["people"]
    by_person = plan["by_person"]
    refs = {r["person_id"]: r for r in json.load(open(REFERENCES_JSON))}

    out = os.path.join(ROOT, "review_sheet.html")
    rows = []
    row_i = 0
    for person_id in people:
        hits = by_person[person_id][:TOP_PER_PERSON]
        ref_b64 = _b64(os.path.join(CROPS_DIR, f"ref_{person_id}.jpg"))
        ref_html = (
            f'<img src="data:image/jpeg;base64,{ref_b64}">'
            if ref_b64 else '<div class=miss>ref n/a</div>'
        )
        display_name = refs.get(person_id, {}).get("name", person_id)

        for j, h in enumerate(hits):
            row_i += 1
            hit_b64 = _b64(os.path.join(CROPS_DIR, f"hit_{h['person_id']}_{h['pid']}.jpg"))
            sim_color = (
                "#0b6b3a" if h["sim"] >= 0.55 else
                ("#a06400" if h["sim"] >= 0.45 else "#a02000")
            )
            ev = ", ".join(str(e) for e in (h.get("ev") or [])[:2])
            hit_html = (
                f'<img src="data:image/jpeg;base64,{hit_b64}">'
                if hit_b64 else '<div class=miss>img n/a</div>'
            )
            rid = f"{h['person_id']}_{h['pid']}"
            first = (j == 0)
            person_cell = (
                f'<td class=ref rowspan="{len(hits)}">{ref_html}<div class=cap>'
                f'<b>{display_name}</b><br>#{person_id}<br>'
                f'{len(by_person[person_id])} candidate'
                f'{"s" if len(by_person[person_id]) != 1 else ""}'
                f'{" (top " + str(len(hits)) + ")" if len(by_person[person_id]) > TOP_PER_PERSON else ""}'
                f'</div></td>'
                if first else ""
            )
            rows.append(
                f'<tr{" class=newgrp" if first else ""}><td class=num>{row_i}</td>{person_cell}'
                f'<td class=hit>{hit_html}<div class=cap>cos '
                f'<span style="color:{sim_color};font-weight:bold">{h["sim"]:.3f}</span> · '
                f'{h.get("yr","")} · {ev} · {h["res"]}</div></td>'
                f'<td class=meta>'
                f'<a href="https://www.flickr.com/photos/{_flickr_user()}/{h["pid"]}" target=_blank>'
                f'flickr {h["pid"]} →</a>'
                f'<div class=verdict-row>'
                f'<button onclick="mark(\'{rid}\',1,this)">✓</button>'
                f'<button onclick="mark(\'{rid}\',0,this)">✗</button>'
                f'<button onclick="mark(\'{rid}\',-1,this)">?</button>'
                f'</div><div class=verdict id="v_{rid}"></div></td></tr>'
            )

    total_candidates = sum(min(TOP_PER_PERSON, len(by_person[p])) for p in people)
    html = f"""<!doctype html>
<meta charset=utf-8>
<title>Face-recognition review sheet</title>
<style>
body {{font-family:Arial,sans-serif;color:#1f2937;margin:20px;max-width:1180px}}
h1 {{color:#1F3864;margin-bottom:6px}}
.sub {{color:#6b7280;margin-bottom:14px}}
table {{border-collapse:collapse;width:100%}}
td {{border-bottom:1px solid #f0f0f0;padding:8px;vertical-align:top}}
tr.newgrp td {{border-top:2px solid #1F3864}}
td.num {{width:24px;color:#9ca3af;font-size:13px;font-weight:bold;text-align:right}}
td.ref,td.hit {{width:165px;text-align:center;background:#fafafa}}
td.ref {{background:#eef2ff}}
img {{max-width:150px;border-radius:6px;display:block;margin:0 auto}}
.cap {{font-size:11px;color:#374151;margin-top:6px;line-height:1.4}}
.miss {{width:150px;height:120px;background:#f3f4f6;border-radius:6px;display:flex;
       align-items:center;justify-content:center;color:#9ca3af;font-style:italic;font-size:11px}}
td.meta {{font-size:12px}}
a {{color:#1F3864;font-family:monospace;text-decoration:none}}
a:hover {{text-decoration:underline}}
button {{font-size:14px;padding:4px 10px;margin:2px 4px 2px 0;cursor:pointer;
        border:1px solid #d1d5db;background:#f9fafb;border-radius:4px}}
.verdict {{font-size:13px;font-weight:bold;margin-top:4px}}
.tally {{position:sticky;top:0;background:#fff;border-bottom:2px solid #1F3864;
        padding:8px 0;font-size:13px;z-index:10}}
</style>
<h1>Face-Recognition Review Sheet</h1>
<div class=sub>{len(people)} people · {total_candidates} candidate appearances</div>
<div class=tally>
  <b>Click ✓/✗/? to score</b> ·
  <span id=t1>0 ✓</span> · <span id=t0>0 ✗</span> · <span id=tq>0 ?</span> ·
  <span id=ttot>0 reviewed</span> ·
  <button onclick="dump()">Show summary</button>
</div>
<table>{''.join(rows)}</table>
<script>
const V = {{}};
function mark(id, v, btn) {{
  V[id] = v;
  const el = document.getElementById('v_' + id);
  el.textContent = {{ '-1': '?', '0': '✗', '1': '✓' }}[v];
  el.style.color = {{ '-1': '#6b7280', '0': '#a02000', '1': '#0b6b3a' }}[v];
  let c = 0, w = 0, q = 0;
  for (const k in V) {{ if (V[k] === 1) c++; else if (V[k] === 0) w++; else q++; }}
  document.getElementById('t1').textContent = c + ' ✓';
  document.getElementById('t0').textContent = w + ' ✗';
  document.getElementById('tq').textContent = q + ' ?';
  document.getElementById('ttot').textContent = Object.keys(V).length + ' reviewed';
}}
function dump() {{
  const lines = Object.entries(V).map(
    ([k, v]) => k + '\\t' + ({{ '-1': 'unsure', '0': 'wrong', '1': 'correct' }}[v])
  );
  alert('Verdicts:\\n\\n' + (lines.length ? lines.join('\\n') : '(none)'));
}}
</script>
"""
    with open(out, "w") as f:
        f.write(html)
    print(f"wrote {out}")


def _b64(path):
    if not os.path.exists(path):
        return None
    return base64.b64encode(open(path, "rb").read()).decode()


def _flickr_user():
    """Flickr user the photos come from — pulled from photos.json metadata if present."""
    # Optional config knob: set FLICKR_USER in env to make sheet links resolve.
    return os.environ.get("FLICKR_USER", "icpcnews")


if __name__ == "__main__":
    main()
