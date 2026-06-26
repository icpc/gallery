"""Parser for the face-recognition suggestion text file.

Block format (header lines before the first "Photo link:" are ignored)::

    Photo link: https://www.flickr.com/photos/icpcnews/40556170753
    Year/event: 2000 / closingceremony, phototour
    New tags:
      "James Comer(4c3f2bc070306b9f)"  # cos=0.565, lowres
      "Andrey Lopatin(31af47f042ab68aa)"  # cos=0.594, hires (borderline)

Returns a list of photo blocks; each tag carries its name, rect64 hex, cosine
score, resolution (lowres/hires) and optional confidence note.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from .rect import is_valid

_PHOTO_LINK = re.compile(r"^Photo link:\s*(?P<url>\S+)", re.I)
_YEAR_EVENT = re.compile(r"^Year/event:\s*(?P<year>[^/]*?)\s*/\s*(?P<events>.*)$", re.I)
# "Name(0123456789abcdef)" — name is greedy so names containing "(" still work,
# because the hex group must be exactly 16 hex chars immediately before )".
_TAG = re.compile(r'^"?(?P<name>.*)\((?P<hex>[0-9a-fA-F]{16})\)"?\s*(?:#\s*(?P<comment>.*))?$')
_COS = re.compile(r"cos\s*=\s*(?P<cos>[0-9]*\.?[0-9]+)", re.I)
_RES = re.compile(r"\b(?P<res>lowres|hires)\b", re.I)
_CONF = re.compile(r"\((?P<conf>[^)]*(?:conf|borderline)[^)]*)\)", re.I)


@dataclass
class ParsedTag:
    name: str
    rect_hex: str
    cos: float | None = None
    res: str | None = None
    conf_note: str | None = None
    raw: str = ""


@dataclass
class ParsedPhoto:
    photo_id: str
    flickr_url: str
    year: str | None = None
    events: str | None = None
    tags: list[ParsedTag] = field(default_factory=list)


def _photo_id_from_url(url: str) -> str | None:
    m = re.search(r"/photos/[^/]+/(\d+)", url)
    if m:
        return m.group(1)
    m = re.search(r"(\d{5,})", url)
    return m.group(1) if m else None


def _parse_tag_line(line: str) -> ParsedTag | None:
    body = line.strip()
    if not body:
        return None
    m = _TAG.match(body)
    if not m:
        return None
    name = m.group("name").strip()
    rect_hex = m.group("hex").lower()
    if not name or not is_valid(rect_hex):
        return None
    comment = m.group("comment") or ""
    cos_m = _COS.search(comment)
    res_m = _RES.search(comment)
    conf_m = _CONF.search(comment)
    return ParsedTag(
        name=name,
        rect_hex=rect_hex,
        cos=float(cos_m.group("cos")) if cos_m else None,
        res=res_m.group("res").lower() if res_m else None,
        conf_note=conf_m.group("conf").strip() if conf_m else None,
        raw=body,
    )


def parse_text(text: str) -> list[ParsedPhoto]:
    photos: list[ParsedPhoto] = []
    current: ParsedPhoto | None = None
    in_tags = False
    for raw_line in text.splitlines():
        line = raw_line.rstrip("\n")
        pm = _PHOTO_LINK.match(line.strip())
        if pm:
            url = pm.group("url")
            pid = _photo_id_from_url(url)
            current = ParsedPhoto(photo_id=pid or url, flickr_url=url)
            photos.append(current)
            in_tags = False
            continue
        if current is None:
            continue
        ym = _YEAR_EVENT.match(line.strip())
        if ym:
            current.year = (ym.group("year") or "").strip() or None
            current.events = (ym.group("events") or "").strip() or None
            continue
        if line.strip().lower().startswith("new tags:"):
            in_tags = True
            continue
        if in_tags:
            tag = _parse_tag_line(line)
            if tag:
                current.tags.append(tag)
    return photos


def parse_file(path: str) -> list[ParsedPhoto]:
    with open(path, encoding="utf-8") as f:
        return parse_text(f.read())
